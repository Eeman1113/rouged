// Autopilot threat model. Reads the authoritative in-page sim (perception only — nothing here
// changes the game) and scores how dangerous it is to be at a point at a future time, plus
// reflex advice: jump a shockwave / low beam, duck a high beam, dash out of a hit.

import type { Run, Projectile } from '../../server/run';
import type { Enemy } from '../../server/enemies/base';
import type { GameEvent } from '../../shared/protocol';
import * as C from '../../shared/constants';

export interface Tell { shape: 'line' | 'cone' | 'circle'; x: number; z: number; x2: number; z2: number; r: number; w: number; a: number; arc: number; until: number; born: number }

interface AreaHit { x: number; z: number; r: number; T: number; w: number }
interface Proj { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; w: number; homing: boolean }

type BossLike = Enemy & { bs?: string; beam?: number[] | null; cur?: { id: string } | null; stage?: number; coreV?: number; wy?: number; shieldV?: number; linkedShield?: number; prefMin?: number; prefMax?: number };

export const PLAYER_R = C.PLAYER_RADIUS;

function segDist(px: number, pz: number, x0: number, z0: number, x1: number, z1: number): { d: number; t: number } {
  const vx = x1 - x0, vz = z1 - z0;
  const l2 = vx * vx + vz * vz || 1e-9;
  let t = ((px - x0) * vx + (pz - z0) * vz) / l2;
  t = Math.max(0, Math.min(1, t));
  return { d: Math.hypot(px - (x0 + vx * t), pz - (z0 + vz * t)), t };
}

export class Danger {
  tells: Tell[] = [];
  private run: Run | null = null;
  private orig: ((ev: GameEvent) => void) | null = null;
  areas: AreaHit[] = [];
  projs: Proj[] = [];
  me = { x: 0, y: 0, z: 0 };
  now = 0;
  /** what triggered the last reflex (for the spectator overlay) */
  reason = '';
  /** every sim event, for the autopilot's bookkeeping (kills, picks, room loads) */
  onEvent: ((ev: GameEvent) => void) | null = null;
  private beamPrevD = Infinity;
  private beamPrevT = 0;

  /** Capture telegraph events from the sim (tells are visual-only events, not state). */
  attach(run: Run) {
    if (this.run === run) return;
    this.detach();
    this.run = run;
    this.tells = [];
    const orig = run.emit.bind(run);
    this.orig = orig;
    run.emit = (ev: GameEvent) => {
      if (ev.e === 'bossTell') {
        // lines are charges (the rush follows the wind-up), cones are sprays/sweeps: keep them a while
        const extra = ev.shape === 'line' ? 1.6 : ev.shape === 'cone' ? 1.3 : 0.35;
        this.tells.push({
          shape: ev.shape, x: ev.x, z: ev.z, x2: ev.x2 ?? ev.x, z2: ev.z2 ?? ev.z, r: ev.r ?? 3, w: ev.w ?? 2, a: ev.a ?? 0, arc: ev.arc ?? 0.5,
          born: run.time, until: run.time + ev.t + extra,
        });
      } else if (ev.e === 'roomLoad') this.tells = [];
      try { this.onEvent?.(ev); } catch (err) { console.error(err); }
      orig(ev);
    };
  }

  detach() {
    if (this.run && this.orig) this.run.emit = this.orig;
    this.run = null; this.orig = null;
  }

  /** per-frame precompute */
  prepare(run: Run, mx: number, my: number, mz: number) {
    this.now = run.time;
    this.me.x = mx; this.me.y = my; this.me.z = mz;
    this.tells = this.tells.filter((t) => t.until > run.time);
    this.areas = [];
    this.projs = [];
    for (const p of run.projectiles) {
      const dx = p.x - mx, dz = p.z - mz;
      const dist = Math.hypot(dx, dz);
      if (dist > 45) continue;
      const w = Math.max(0.6, p.dmg / 8);
      if (p.explode > 0 && p.gravity > 0) {
        const g = p.gravity, y0 = p.y - 0.05;
        const T = (p.vy + Math.sqrt(Math.max(0, p.vy * p.vy + 2 * g * y0))) / g;
        if (T < 3) this.areas.push({ x: p.x + p.vx * T, z: p.z + p.vz * T, r: p.explode + 0.7, T, w: w * 1.3 });
        // the shell itself can also clip you on the way down
        continue;
      }
      // moving away and already past us: ignore
      const closing = -(dx * p.vx + dz * p.vz) / (dist || 1);
      if (closing < -2 && dist > 3) continue;
      const r = p.explode > 0 ? Math.max(p.r, p.explode * 0.65) : p.r;
      this.projs.push({ x: p.x, y: p.y, z: p.z, vx: p.vx, vy: p.vy, vz: p.vz, r, w: p.explode > 0 ? w * 1.4 : w, homing: !!p.homing });
      // rockets diving into the floor near us: blast area
      if (p.explode > 0 && p.vy < -0.5) {
        const T = (p.y - 0.05) / -p.vy;
        if (T < 2.5) this.areas.push({ x: p.x + p.vx * T, z: p.z + p.vz * T, r: p.explode + 0.6, T, w });
      }
    }
    for (const st of run.strikes) this.areas.push({ x: st.x, z: st.z, r: st.r + 0.75, T: st.t, w: Math.max(2, st.dmg / 8) });
  }

  /**
   * Projectile risk for moving with velocity (ux,uz) for horizon H seconds: exact closest approach of
   * two linear motions, weighted by damage and urgency.
   */
  projectileCost(ux: number, uz: number, H: number): number {
    let c = 0;
    const me = this.me;
    for (const p of this.projs) {
      const rx = p.x - me.x, rz = p.z - me.z;
      const vx = p.vx - ux, vz = p.vz - uz;
      const v2 = vx * vx + vz * vz;
      let t = v2 > 1e-6 ? -(rx * vx + rz * vz) / v2 : 0;
      t = Math.max(0, Math.min(H, t));
      const d = Math.hypot(rx + vx * t, rz + vz * t);
      const y = p.y + p.vy * t - me.y;
      if (y < -p.r - 0.2 || y > C.PLAYER_HEIGHT + p.r + 0.2) continue;
      const hitR = PLAYER_R + p.r + (p.homing ? 0.6 : 0.35);
      if (d > hitR + 0.9) continue;
      const k = d < hitR ? 1 : 1 - (d - hitR) / 0.9;
      const urg = t < 0.35 ? 1 : 0.35 / t + 0.2;
      c += p.w * k * urg * 2.2;
    }
    return c;
  }

  /** Static-ish hazards at a point and future time t. */
  pointCost(run: Run, x: number, z: number, t: number, enemies: Enemy[]): number {
    let c = 0;
    for (const a of this.areas) {
      if (a.T + 0.12 < t) continue;
      const d = Math.hypot(x - a.x, z - a.z);
      if (d < a.r) c += a.w * (a.T - t < 0.7 ? 2.2 : 1.1) * (1 - d / (a.r * 1.6));
    }
    const now = this.now + t;
    for (const tl of this.tells) {
      if (tl.until < now) continue;
      let inside = false;
      if (tl.shape === 'circle') inside = Math.hypot(x - tl.x, z - tl.z) < tl.r + 0.9;
      else if (tl.shape === 'line') inside = segDist(x, z, tl.x, tl.z, tl.x2, tl.z2).d < tl.w / 2 + 1.0;
      else {
        const dx = x - tl.x, dz = z - tl.z, d = Math.hypot(dx, dz);
        if (d < tl.r + 1) {
          let da = Math.atan2(dx, dz) - tl.a;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          inside = Math.abs(da) < tl.arc + 0.25 || d < 3;
        }
      }
      if (inside) c += 4.5;
    }
    for (const zn of run.zones) {
      if (zn.dps <= 0) continue;
      const pad = 0.7;
      const inz = zn.shape === 'circle' ? Math.hypot(x - zn.x, z - zn.z) < zn.w + pad : Math.abs(x - zn.x) < zn.w / 2 + pad && Math.abs(z - zn.z) < zn.d / 2 + pad;
      if (!inz) continue;
      const k = zn.dps / 25;
      if (zn.state === 'on') c += 5 * k;
      else if (zn.state === 'warn') c += (zn.t < t + 0.9 ? 4 : 1.2) * k;
      else if (zn.state === 'off' && zn.t < t + 0.8 + zn.warn) c += 1.5 * k;
    }
    for (const m of run.mines) {
      const d = Math.hypot(x - m.x, z - m.z);
      if (d < 2.5) c += 5 * (1 - d / 3);
    }
    for (const e of enemies) c += this.enemyCost(run, e, x, z, t);
    return c;
  }

  enemyCost(_run: Run, e: Enemy, x: number, z: number, t: number): number {
    const ex = e.x + e.vx * t, ez = e.z + e.vz * t;
    const d = Math.hypot(x - ex, z - ez);
    const R = e.def.radius;
    let c = 0;
    if (e.staggered || e.frozenT > 0) return d < R + 0.6 ? 0.5 : 0;
    switch (e.type) {
      case 'brute': {
        const b = e as Enemy & { mode?: string; cdx?: number; cdz?: number };
        if (b.mode === 'charge' || b.mode === 'windup') {
          let cdx = b.cdx ?? 0, cdz = b.cdz ?? 0;
          if (b.mode === 'windup') { const l = Math.hypot(this.me.x - e.x, this.me.z - e.z) || 1; cdx = (this.me.x - e.x) / l; cdz = (this.me.z - e.z) / l; }
          const s = segDist(x, z, e.x, e.z, e.x + cdx * 22, e.z + cdz * 22);
          if (s.d < R + 1.4) c += b.mode === 'charge' ? 8 : 3;
        }
        if (d < 4.2) c += 3.5 * (1 - d / 4.2) + 1;
        break;
      }
      case 'bomber': {
        const b = e as Enemy & { fuse?: number };
        const rr = (e.elite ? 5 : 4.2) + 0.9;
        if ((b.fuse ?? -1) >= 0) { if (d < rr) c += 8; }
        else if (d < 6.5) c += 2.5 * (1 - d / 6.5);
        break;
      }
      case 'leech': {
        const l = e as Enemy & { latched?: unknown };
        if (!l.latched && d < 5.5) c += 1.6 * (1 - d / 5.5);
        break;
      }
      case 'bulwark': if (d < 3.8) c += 2.5; break;
      case 'stalker': {
        const s = e as Enemy & { aiming?: boolean; lastAimX?: number; lastAimZ?: number };
        if (s.aiming) { const da = Math.hypot(x - (s.lastAimX ?? 0), z - (s.lastAimZ ?? 0)); if (da < 1.6) c += 3 * (0.4 + e.tell); }
        break;
      }
      case 'warden': {
        const b = e as BossLike;
        if (b.bs !== 'finish' && b.bs !== 'break' && d < R + 4.5) c += 4.5 * (1 - d / (R + 4.5)) + 1.5;
        break;
      }
      case 'echo': if (d < R + 2) c += 2; break;
      default: break;
    }
    if (d < R + 1.1) c += 1.2;
    return c;
  }

  /** Shockwave ring arriving: jump now? (we need to be above the ring height when it passes) */
  shockwaveJump(run: Run, onGround: boolean): boolean {
    if (!onGround) return false;
    for (const w of run.shockwaves) {
      if (w.hit.has('local')) continue;
      const d = Math.hypot(this.me.x - w.x, this.me.z - w.z);
      const inner = w.r - w.band - PLAYER_R;
      if (d < inner) continue; // already behind the ring
      const tHit = (d - w.r - w.band - PLAYER_R) / w.speed;
      if (w.r + w.speed * 0.4 > w.r1 + 1 && tHit > 0.3) continue;
      if (tHit < 0.24) { this.reason = 'JUMPING SHOCKWAVE'; return true; }
    }
    return false;
  }

  /** Boss sweep beam: 'jump' a low beam, 'duck' a high one. */
  beamReflex(run: Run, dt: number, onGround: boolean): 'jump' | 'duck' | null {
    let best: { d: number; y: number; th: number; live: boolean } | null = null;
    for (const e of run.enemies.values()) {
      const b = (e as BossLike).beam;
      if (!b || b.length < 8) continue;
      const s = segDist(this.me.x, this.me.z, b[0], b[2], b[3], b[5]);
      if (!best || s.d < best.d) best = { d: s.d, y: b[1], th: b[6], live: b[7] > 0 };
    }
    if (!best) { this.beamPrevD = Infinity; return null; }
    const closing = isFinite(this.beamPrevD) && dt > 0 ? (this.beamPrevD - best.d) / dt : 0;
    this.beamPrevD = best.d; this.beamPrevT = run.time;
    const reach = best.th / 2 + PLAYER_R;
    const bottom = best.y - best.th / 2, top = best.y + best.th / 2;
    if (bottom > C.CROUCH_HEIGHT + 0.05) {
      if (best.d < reach + 2.2) { this.reason = 'DUCKING BEAM'; return 'duck'; }
      return null;
    }
    if (top < 1.05 && best.live) {
      const lead = Math.max(0.35, closing * 0.2);
      if (onGround && (best.d < reach + 0.15 || (closing > 1 && best.d < reach + lead))) { this.reason = 'JUMPING BEAM'; return 'jump'; }
    }
    return null;
  }
}

export type { Projectile, BossLike };
