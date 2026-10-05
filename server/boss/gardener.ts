// THE GARDENER — Warden of the Canopy. A rusted botanical frame wearing a seed pod for a head.
// Learn: root lines travel toward where you stood — step sideways; never stand in front of the
// shears; jump the watering lance; the pod blooms open (shoot it). It grows thorn hedges to hop,
// then roots itself in the middle of its garden.
import { Boss } from './base';
import type { Run } from '../run';

export class Gardener extends Boss {
  rooted = false;

  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 4, hpScale, 3.2, 'THE GARDENER');
    this.wy = 5.1; this.prefMin = 6; this.prefMax = 14;
    const S = 'spit' as const;
    this.moves = [
      {
        id: 'roots', name: 'ROOT ERUPTION', wind: 0.7, active: 1.6, recover: 0.7, w: [3, 2.5, 2.5], anim: 'charge',
        begin: () => {
          this.pts = [];
          for (const p of this.run.targets()) {
            const a = this.aimYaw(p.x, p.z);
            this.pts.push({ x: a, z: Math.min(26, this.distTo(p) + 6) });
            if (this.phase >= 2) { this.pts.push({ x: a + 0.42, z: 22 }); this.pts.push({ x: a - 0.42, z: 22 }); }
          }
        },
        enter: (st) => {
          if (st !== 1) return;
          for (const ln of this.pts) for (let d = 3, i = 0; d < ln.z; d += 2.2, i++) {
            const x = this.x + Math.sin(ln.x) * d, z = this.z + Math.cos(ln.x) * d;
            if (this.run.pointInSolid(x, 0.5, z)) break;
            this.run.strike(x, z, 1.8, 0.75 + i * 0.07, 22 * this.dmgMult, 'mine');
          }
        },
      },
      {
        id: 'shears', name: 'PRUNING SHEARS', wind: 0.85, active: 0.3, recover: 0.8, w: [2.5, 2.5, 2], near: 0, far: 10, anim: 'attack', core: [0, 0, 0.7],
        combo: [['lance', 0.35], ['roots', 0.25, 2]],
        can: () => !this.rooted,
        begin: () => {
          const t = this.tgt; this.m.a = t ? this.aimYaw(t.x, t.z) : 0;
          this.tellCone(this.x, this.z, this.m.a, 1.05, 8, this.stageLen, 120);
        },
        tick: (st, t, dt) => {
          if (st === 0) { this.moveDir(this.run, Math.sin(this.m.a), Math.cos(this.m.a), t < this.stageLen * 0.6 ? 2.5 : 0, dt); this.faceTo(this.x + Math.sin(this.m.a), this.z + Math.cos(this.m.a), dt, 6); }
          else { this.vx = 0; this.vz = 0; }
        },
        enter: (st) => {
          if (st !== 1) return;
          for (const p of this.run.targets()) {
            const d = this.distTo(p);
            let da = this.aimYaw(p.x, p.z) - this.m.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
            if (d < 8 + 0.4 && Math.abs(da) < 1.1 && p.y < 3) this.run.damagePlayer(p, 30 * this.dmgMult, this.x, 2, this.z, true, this, { x: Math.sin(this.m.a) * 16, y: 6, z: Math.cos(this.m.a) * 16 });
          }
          this.run.emit({ e: 'explosion', x: this.x + Math.sin(this.m.a) * 4, y: 1.5, z: this.z + Math.cos(this.m.a) * 4, r: 2, kind: 'kill' });
        },
      },
      {
        id: 'spores', name: 'SPORE BLOOM', wind: 0.9, active: 1.2, recover: 0.9, w: [2, 2.5, 2.5], anim: 'charge', core: [1, 1, 0.6],
        enter: (st) => {
          if (st !== 1) return;
          const ts = this.run.targets();
          for (let i = 0; i < 3 + this.phase; i++) { const tt = ts[i % ts.length]; if (tt) this.shootAt(this.run, tt, S, 6.5, 10, { homing: true, accuracy: 1, oy: this.wy, spread: 0.25 }); }
          for (let i = 0; i < 3; i++) {
            const p = this.freePoint(this.x + this.run.rng.range(-12, 12), this.z + this.run.rng.range(-4, 16), 3);
            this.run.addZone({ kind: 'acid', shape: 'circle', x: p.x, z: p.z, w: 2.8, dps: 20 * this.dmgMult, warn: 0.9, life: 6 });
          }
        },
      },
      {
        id: 'lance', name: 'WATERING LANCE', wind: 0.9, active: 2.0, recover: 0.8, w: [2, 2.5, 2.5], near: 0, far: 22, anim: 'attack',
        begin: () => {
          const t = this.tgt; const c = t ? this.aimYaw(t.x, t.z) : 0;
          this.m.dir = this.run.rng.chance(0.5) ? 1 : -1; this.m.a = c - this.m.dir * 1.4;
          this.tellCone(this.x, this.z, c, 1.45, 20, this.stageLen, 120);
        },
        tick: (st, _t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st === 2) { this.beam = null; return; }
          if (st === 1) this.m.a += this.m.dir * (2.8 / this.stageLen) * dt;
          const e = this.beamEnd(this.x, this.z, this.m.a, 20, 0.5);
          this.beamAt(this.x + Math.sin(this.m.a) * 2, this.z + Math.cos(this.m.a) * 2, e.x, e.z, 0.5, 0.7, st === 1, 18);
        },
        end: () => { this.beam = null; },
      },
      {
        id: 'vines', name: 'STRANGLER VINES', wind: 0.6, active: 1.0, recover: 0.8, w: [2, 2, 2.5], anim: 'charge',
        enter: (st) => {
          if (st !== 1) return;
          for (const p of this.run.targets()) {
            for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; this.run.strike(p.x + Math.cos(a) * 3.6, p.z + Math.sin(a) * 3.6, 1.9, 0.9, 20 * this.dmgMult, 'mine'); }
            this.run.strike(p.x, p.z, 2.4, 1.7, 24 * this.dmgMult, 'mine');
          }
        },
      },
      {
        id: 'seed', name: 'SEED VOLLEY', wind: 0.6, active: 1.0, recover: 0.7, w: [2.5, 2, 1.5], near: 8, anim: 'attack',
        begin: () => { const t = this.tgt; if (t) this.tellCone(this.x, this.z, this.aimYaw(t.x, t.z), 0.6, 18, this.stageLen, 120); },
        tick: (st, t, dt) => {
          const tg = this.tgt; if (!tg) return;
          this.faceTo(tg.x, tg.z, dt, 3);
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.4 && k < 3) { this.m.k = k + 1; this.fan(S, 7 + this.phase * 2, 0.1, 16, 9, 3.5, this.aimYaw(tg.x, tg.z) + (k % 2 ? 0.05 : 0)); }
        },
      },
      {
        id: 'overgrowth', name: 'OVERGROWTH', wind: 0.8, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 10, anim: 'charge',
        enter: (st) => { if (st === 1 && this.adds() < 6) this.summon(['spider', 'spider'], 2, 5, 7); },
        tick: (st, _t, dt) => {
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt; this.m.spin = (this.m.spin ?? 0) - dt * 2.6;
          while (this.m.acc > 0.11) {
            this.m.acc -= 0.11;
            for (let k = 0; k < 4; k++) { const a = this.m.spin + (k * Math.PI) / 2; this.run.spawnProjectile({ kind: S, x: this.x, y: 1.4, z: this.z, vx: Math.sin(a) * 9, vy: 0, vz: Math.cos(a) * 9, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 }); }
          }
        },
      },
    ];
  }

  position(run: Run, dt: number) {
    if (this.rooted) {
      const t = this.tgt;
      const dx = 0 - this.x, dz = -6 - this.z;
      if (Math.hypot(dx, dz) > 0.6) this.moveDir(run, dx, dz, this.def.speed * 1.4, dt);
      else { this.vx = 0; this.vz = 0; this.anim = 'idle'; }
      if (t) this.faceTo(t.x, t.z, dt, 3);
      return;
    }
    super.position(run, dt);
  }

  wakeMove() { return 'vines'; }

  transitionName(phase: number) { return phase === 2 ? 'ROOT WALLS' : 'BLOOM'; }

  onTransition(run: Run, phase: number) {
    const dps = 30 * this.dmgMult;
    if (phase === 2) {
      run.addZone({ kind: 'thorns', shape: 'rect', x: -14, z: 4, w: 18, d: 1.6, dps, maxY: 0.9, warn: 1.5 });
      run.addZone({ kind: 'thorns', shape: 'rect', x: 14, z: -4, w: 18, d: 1.6, dps, maxY: 0.9, warn: 1.5 });
    } else {
      this.rooted = true;
      run.addZone({ kind: 'thorns', shape: 'rect', x: -7, z: -15, w: 1.6, d: 12, dps, maxY: 0.9, warn: 1.5 });
      run.addZone({ kind: 'thorns', shape: 'rect', x: 7, z: 13, w: 1.6, d: 12, dps, maxY: 0.9, warn: 1.5 });
      this.summon(['spider', 'spider'], 2, 6);
    }
  }
}
