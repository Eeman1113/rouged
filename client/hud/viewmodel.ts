// First-person viewmodel runtime. Weapons are real 3D-posed pixel-art renders (see
// render/art/viewmodel3d.ts): every distinct pose is ray-cast once at the HUD's internal
// resolution and cached, so per-frame cost is one blit + a few fx sprites. On top of the keyframed
// rig animations this layer adds the procedural motion: recoil springs, look sway, walk/sprint bob,
// landing dip, sprint/slide/dash lowered pose, crouch, charge tremble, chainsaw vibration and 2D fx.
import { getViewmodelRig, getViewmodelFrame, getFistFrame, viewmodelFrameCount, viewmodelFx } from '../render/sprites';
import type { Frame } from '../render/art/viewmodel3d';
import type { Pose } from '../render/art/viewmodelAnim';

export type WeaponId = 'pulse' | 'breacher' | 'lance' | 'ripper';
export interface ViewMotion {
  bobT: number; bobAmt: number; land: number; sliding: boolean; dashing: boolean; airborne: boolean;
  lookDX: number; lookDY: number /* radians turned this frame, for weapon sway */;
  sprinting?: boolean; crouching?: boolean;
}

type AnimName = 'idle' | 'equip' | 'reload' | 'inspect' | 'cycle';

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  kind: 0 | 1 | 2 | 3 | 4; // 0 smoke 1 vapour 2 spark 3 gore 4 ember
  size: number; g: number;
}

/** Critically-ish damped spring step. */
function spring(x: number, v: number, target: number, k: number, d: number, dt: number): [number, number] {
  const a = (target - x) * k - v * d;
  v += a * dt;
  x += v * dt;
  return [x, v];
}
const q = (v: number, s: number): number => Math.round(v / s) * s;

const KICK: Record<WeaponId, { p: number; b: number; yw: number; r: number; k: number; d: number }> = {
  pulse: { p: 0.035, b: 3.2, yw: 0.0, r: 0.0, k: 520, d: 30 },
  breacher: { p: 0.12, b: 10, yw: -0.05, r: -0.07, k: 170, d: 17 },
  lance: { p: 0.075, b: 13, yw: -0.02, r: -0.04, k: 150, d: 16 },
  ripper: { p: 0, b: 0, yw: 0, r: 0, k: 200, d: 20 },
};

export class Viewmodel {
  /** dev hook (vmtest): channel overrides applied on top of every evaluated pose */
  static debugPose: Pose | null = null;
  private id: WeaponId = 'pulse';
  private anim: AnimName = 'equip';
  private at = 0;
  private adur = 0.2;
  private fired = new Set<number>();
  // springs
  private kp = 0; private kpv = 0; private kb = 0; private kbv = 0; private kyw = 0; private kywv = 0; private kr = 0; private krv = 0;
  private sx = 0; private sxv = 0; private sy = 0; private syv = 0;
  private low = 0; private lowv = 0; private sprint = 0; private sprintv = 0;
  private crouch = 0; private air = 0;
  private bobPhase = 0;
  // weapon state
  private charge = 0;
  private heatT = 99;
  private fireT = 99;
  private flashSeed = 0;
  private rOn = false; private rCut = false; private chain = 0; private rRev = 0;
  private puffT = 0;
  private gloryT = 99;
  private cycleDelay = -1;
  private particles: Particle[] = [];
  private lastFrame: Frame | null = null;
  private offX = 0; private offY = 0;
  private scale = 2; private cx = 0; private cy = 0;
  private prewarm: (() => void)[] = [];
  private t = 0;
  private lastPose: Pose | null = null;

  constructor() { this.queuePrewarm(240); }

  get reloading(): boolean { return this.anim === 'reload' && this.at < this.adur; }

  setWeapon(id: WeaponId): void {
    if (id === this.id && this.anim === 'equip') return;
    this.id = id;
    this.play('equip', 0.2);
    this.fireT = 99; this.heatT = 99; this.cycleDelay = -1;
    this.kp = this.kb = this.kyw = this.kr = 0;
    this.kpv = this.kbv = this.kywv = this.krv = 0;
    this.prewarm.length = 0;
  }

  fire(): void {
    const kk = KICK[this.id] ?? KICK.pulse;
    if (this.anim === 'inspect') this.play('idle', 0);
    if (this.anim === 'equip') this.at = Math.max(this.at, this.adur * 0.75);
    if (this.anim === 'cycle') this.play('idle', 0);
    const mag = this.id === 'lance' ? 0.35 + this.charge * 0.85 : 1;
    const jitter = 0.8 + Math.random() * 0.4;
    this.kpv += kk.p * 30 * mag * jitter;
    this.kbv += kk.b * 30 * mag;
    this.kywv += kk.yw * 30 * mag * (0.7 + Math.random() * 0.6);
    this.krv += kk.r * 30 * mag;
    this.fireT = 0;
    this.flashSeed = (Math.random() * 3) | 0;
    if (this.id === 'breacher') this.cycleDelay = 0.07;
    if (this.id === 'lance') { this.heatT = 0; this.charge = 0; }
    const m = this.frameMuzzle();
    if (this.id === 'breacher') { for (let i = 0; i < 7; i++) this.puff(m[0] + (Math.random() - 0.5) * 12, m[1] - 4 - Math.random() * 6, 0, 5 + Math.random() * 4, 0.5 + Math.random() * 0.4, (Math.random() - 0.3) * 30, -30 - Math.random() * 30); this.sparks(m[0], m[1], 14, 120, 2); }
    if (this.id === 'lance') { this.sparks(m[0], m[1], 18, 140, 2); for (let i = 0; i < 4; i++) this.puff(m[0], m[1] - 3, 1, 4 + Math.random() * 3, 0.5, (Math.random() - 0.5) * 30, -20); }
    if (this.id === 'pulse' && Math.random() < 0.5) this.puff(m[0], m[1] - 2, 0, 2.5, 0.25, (Math.random() - 0.5) * 20, -25);
  }

  reload(duration: number): void {
    this.play('reload', Math.max(0.2, duration));
    this.cycleDelay = -1;
  }
  inspect(): void { if (this.anim === 'idle') this.play('inspect', this.rigAnimDur('inspect')); }
  glory(): void { this.gloryT = 0; if (this.anim === 'inspect') this.play('idle', 0); }
  setCharge(level: number): void { this.charge = Math.max(0, Math.min(1, level)); }
  setRipper(on: boolean, cutting: boolean): void { this.rOn = on; this.rCut = on && cutting; }

  muzzle(): { x: number; y: number } {
    const m = this.frameMuzzle();
    return { x: Math.round(this.cx + m[0] * this.scale), y: Math.round(this.cy + m[1] * this.scale) };
  }

  // ------------------------------------------------------------------ internals
  private rigAnimDur(name: string): number { const a = getViewmodelRig(this.id).anims[name]; return a ? a.dur : 0; }
  private play(name: AnimName, dur: number): void {
    const rig = getViewmodelRig(this.id);
    if (name !== 'idle' && !rig.anims[name]) { this.anim = 'idle'; return; }
    this.anim = name; this.at = 0; this.adur = dur; this.fired.clear();
  }
  private frameMuzzle(): [number, number] {
    const f = this.lastFrame;
    const p = f?.pts['muzzle'];
    return p ? [p[0] + this.offX, p[1] + this.offY] : [40, 30];
  }
  private pt(name: string): [number, number] | null {
    const p = this.lastFrame?.pts[name];
    return p ? [p[0] + this.offX, p[1] + this.offY] : null;
  }

  private puff(x: number, y: number, kind: 0 | 1, size: number, life: number, vx = 0, vy = -20): void {
    if (this.particles.length > 160) return;
    this.particles.push({ x, y, vx, vy, life, max: life, kind, size, g: -10 });
  }
  private sparks(x: number, y: number, n: number, spd: number, kind: 2 | 3 | 4, dirX = 0, dirY = -1, spread = Math.PI): void {
    for (let i = 0; i < n && this.particles.length < 220; i++) {
      const base = Math.atan2(dirY, dirX);
      const a = base + (Math.random() - 0.5) * spread * 2;
      const s = spd * (0.3 + Math.random() * 0.8);
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.15 + Math.random() * 0.3, max: 0.45, kind, size: 1, g: kind === 3 ? 380 : 260 });
    }
  }

  private event(name: string): void {
    const at = (n: string): [number, number] => this.pt(n) ?? this.frameMuzzle();
    switch (name) {
      case 'vapour': { const [x, y] = at('well'); for (let i = 0; i < 6; i++) this.puff(x + (Math.random() - 0.5) * 8, y + Math.random() * 6, 1, 3 + Math.random() * 4, 0.45 + Math.random() * 0.3, (Math.random() - 0.5) * 30, -10 - Math.random() * 25); break; }
      case 'slap': { const [x, y] = at('well'); this.sparks(x, y, 8, 90, 2); break; }
      case 'relight': { const [x, y] = at('muzzle'); this.sparks(x, y, 5, 50, 4); break; }
      case 'eject': { const [x, y] = at('breech'); for (let i = 0; i < 4; i++) this.puff(x + (Math.random() - 0.5) * 8, y - 2, 0, 3 + Math.random() * 3, 0.5, (Math.random() - 0.5) * 20, -30 - Math.random() * 20); break; }
      case 'shut': { const [x, y] = at('hinge'); this.sparks(x, y, 5, 70, 2); break; }
      case 'housing': { const [x, y] = at('housing'); this.sparks(x, y, 18, 130, 2); this.puff(x, y, 1, 4, 0.4, 0, -20); break; }
      case 'cellout': { const [x, y] = at('housing'); for (let i = 0; i < 3; i++) this.puff(x, y, 0, 3 + Math.random() * 2, 0.5, (Math.random() - 0.5) * 20, -25); break; }
      case 'sputter': { const [x, y] = at('exhaust'); for (let i = 0; i < 4; i++) this.puff(x + Math.random() * 4, y, 0, 2.5 + Math.random() * 3, 0.5 + Math.random() * 0.3, 20 + Math.random() * 30, -20 - Math.random() * 20); break; }
      case 'roar': { const [x, y] = at('exhaust'); for (let i = 0; i < 9; i++) this.puff(x + Math.random() * 6, y, 0, 3 + Math.random() * 5, 0.6 + Math.random() * 0.4, 30 + Math.random() * 50, -30 - Math.random() * 30); this.rRev = 1; break; }
    }
  }

  /** Evaluate the full pose (rig default + anim + runtime state + quantized modifiers). */
  private pose(name: AnimName, fi: number): Pose {
    const rig = getViewmodelRig(this.id);
    const p: Pose = { ...rig.def };
    const a = name !== 'idle' ? rig.anims[name] : undefined;
    if (a) viewmodelFx.apply(p, a, fi);
    if (Viewmodel.debugPose) for (const k in Viewmodel.debugPose) p[k] = (p[k] ?? 0) + Viewmodel.debugPose[k];
    return p;
  }

  private queuePrewarm(baseH: number): void {
    const id = this.id;
    const rig = getViewmodelRig(id);
    const jobs: (() => void)[] = [];
    for (const name of Object.keys(rig.anims)) {
      const n = viewmodelFrameCount(rig.anims[name]);
      for (let fi = 0; fi < n; fi++) jobs.push(() => { if (this.id === id) getViewmodelFrame(id, this.pose(name as AnimName, fi), baseH); });
    }
    this.prewarm = jobs;
  }

  draw(g: CanvasRenderingContext2D, W: number, H: number, dt: number, m: ViewMotion): void {
    dt = Math.min(0.05, Math.max(0, dt));
    this.t += dt;
    const scale = Math.max(1, Math.round(H / 240));
    const baseH = Math.round(H / scale);
    this.scale = scale; this.cx = Math.floor(W / 2); this.cy = Math.floor(H / 2);
    const rig = getViewmodelRig(this.id);
    const t0 = performance.now();

    // ---- anim clock + events
    this.at += dt;
    if (this.anim !== 'idle') {
      const a = rig.anims[this.anim];
      if (a?.ev) for (let i = 0; i < a.ev.length; i++) if (!this.fired.has(i) && this.at / this.adur >= a.ev[i][0]) { this.fired.add(i); this.event(a.ev[i][1]); }
      if (this.at >= this.adur) this.play('idle', 0);
    }
    if (this.cycleDelay >= 0) { this.cycleDelay -= dt; if (this.cycleDelay < 0 && this.anim === 'idle') this.play('cycle', this.rigAnimDur('cycle')); }
    this.fireT += dt; this.heatT += dt; this.gloryT += dt;

    // ---- springs
    const kk = KICK[this.id] ?? KICK.pulse;
    [this.kp, this.kpv] = spring(this.kp, this.kpv, 0, kk.k, kk.d, dt);
    [this.kb, this.kbv] = spring(this.kb, this.kbv, 0, kk.k, kk.d, dt);
    [this.kyw, this.kywv] = spring(this.kyw, this.kywv, 0, kk.k, kk.d, dt);
    [this.kr, this.krv] = spring(this.kr, this.krv, 0, kk.k, kk.d, dt);
    const lookVX = Math.max(-8, Math.min(8, m.lookDX / Math.max(1e-3, dt)));
    const lookVY = Math.max(-8, Math.min(8, m.lookDY / Math.max(1e-3, dt)));
    [this.sx, this.sxv] = spring(this.sx, this.sxv, -lookVX * 2.4, 90, 14, dt);
    [this.sy, this.syv] = spring(this.sy, this.syv, lookVY * 2.0, 90, 14, dt);
    const lowT = m.sliding || m.dashing ? 1 : 0;
    const sprT = m.sprinting && !lowT ? 1 : 0;
    [this.low, this.lowv] = spring(this.low, this.lowv, lowT, 260, 30, dt);
    [this.sprint, this.sprintv] = spring(this.sprint, this.sprintv, sprT, 260, 30, dt);
    this.crouch += ((m.crouching ? 1 : 0) - this.crouch) * Math.min(1, dt * 12);
    this.air += ((m.airborne ? 1 : 0) - this.air) * Math.min(1, dt * 8);
    const busy = this.anim === 'reload' || this.anim === 'inspect';
    const lowAmt = Math.max(0, Math.min(1, busy ? this.low * 0.4 : this.low));
    const sprAmt = Math.max(0, Math.min(1, busy ? this.sprint * 0.3 : this.sprint));

    // ---- pose
    const a = this.anim !== 'idle' ? rig.anims[this.anim] : undefined;
    let fi = 0;
    if (a) { const n = viewmodelFrameCount(a); fi = Math.min(n - 1, Math.floor((this.at / this.adur) * n)); }
    const p = this.pose(this.anim, fi);
    // recoil (quantized; the remainder becomes 2D motion)
    p.gp += q(Math.max(0, this.kp), 0.035);
    p.gyw += q(this.kyw, 0.04);
    p.gr += q(this.kr, 0.05);
    // sprint: swung down & canted inward; slide/dash: lowered hard
    const sq = q(sprAmt, 0.2), lq = q(lowAmt, 0.2);
    p.gp += -0.42 * sq - 0.3 * lq;
    p.gr += 0.55 * sq + 0.35 * lq;
    p.gyw += 0.32 * sq + 0.1 * lq;
    // glory: off-hand leaves the gun, gun dips away
    const gl = this.gloryT < 0.55 ? Math.sin(Math.min(1, this.gloryT / 0.5) * Math.PI) : 0;
    if (this.gloryT < 0.5) { p.lhide = 1; p.gp += -q(gl, 0.25) * 0.5; p.gr += q(gl, 0.25) * 0.3; }
    // weapon-specific runtime channels
    if (this.id === 'pulse') p.sp = Math.max(p.sp, this.fireT < 0.07 ? 1 : 0);
    if (this.id === 'lance') {
      p.coil = Math.max(p.coil ?? 0, Math.round(this.charge * 6));
      const h = this.heatT < 0.9 ? 1 - this.heatT / 0.9 : 0;
      p.heat = Math.max(p.heat ?? 0, q(h, 0.2));
    }
    if (this.id === 'ripper') {
      const spd = this.rCut ? 40 : this.rOn ? 26 : 2.5 + this.rRev * 20;
      this.chain = (this.chain + dt * spd) % 4;
      p.chain = Math.floor(this.chain);
      p.blur = this.rOn ? (this.rCut ? 2 : 1) : p.blur ?? 0;
      this.rRev = Math.max(0, this.rRev - dt * 1.5);
    }

    const frame = getViewmodelFrame(this.id, p, baseH);
    const rendered = performance.now() - t0 > 0.6;
    this.lastFrame = frame;
    this.lastPose = p;

    // ---- 2D motion (base px)
    const bobAmp = m.bobAmt * (1 + sprAmt * 1.4) * (1 - lowAmt * 0.6) * (1 - this.crouch * 0.3);
    this.bobPhase = m.bobT;
    let ox = Math.sin(m.bobT) * 5 * bobAmp + this.sx;
    let oy = Math.abs(Math.cos(m.bobT)) * 4 * bobAmp + this.sy;
    // idle breathing
    ox += Math.sin(this.t * 1.1) * 0.8; oy += Math.sin(this.t * 1.7) * 1.1;
    oy += m.land * 38 + this.crouch * 5 - this.air * 3;
    ox += sprAmt * 10 + lowAmt * 14; oy += sprAmt * 16 + lowAmt * 26;
    // recoil remainder: pushed back toward the camera = down/right
    ox += this.kb * 0.45 + (this.kyw - q(this.kyw, 0.04)) * -60;
    oy += this.kb * 0.8 - (this.kp - q(Math.max(0, this.kp), 0.035)) * 120;
    // glory dip
    oy += gl * 70; ox += gl * 20;
    // charge tremble / chainsaw vibration
    if (this.id === 'lance' && this.charge > 0.25) { const s = (this.charge - 0.25) * 2.2; ox += (Math.random() - 0.5) * s * 2; oy += (Math.random() - 0.5) * s * 2; }
    if (this.id === 'ripper') { const s = this.rCut ? 2.6 : this.rOn ? 1.2 : 0.35 + this.rRev; ox += (Math.random() - 0.5) * s; oy += (Math.random() - 0.5) * s; }
    if (this.anim === 'equip') { const u = Math.min(1, this.at / this.adur); oy += (1 - u) * (1 - u) * 60; }
    this.offX = ox; this.offY = oy;

    // ---- blit
    if (frame.cv) {
      const dx = Math.round(this.cx + (frame.ox + ox) * scale), dy = Math.round(this.cy + (frame.oy + oy) * scale);
      g.drawImage(frame.cv, dx, dy, frame.cv.width * scale, frame.cv.height * scale);
    }
    // glory fist
    if (this.gloryT < 0.5) {
      const fr = getFistFrame(this.gloryT / 0.5, baseH);
      if (fr.cv) g.drawImage(fr.cv, Math.round(this.cx + fr.ox * scale), Math.round(this.cy + fr.oy * scale), fr.cv.width * scale, fr.cv.height * scale);
      const core = fr.pts['core'];
      if (core && this.gloryT > 0.18 && this.gloryT < 0.3 && Math.random() < 0.7) this.sparks(core[0], core[1], 3, 120, Math.random() < 0.5 ? 3 : 2);
      if (core && this.gloryT > 0.3 && Math.random() < 0.5) this.sparks(core[0], core[1], 1, 60, 4);
    }
    this.weaponFx(g, dt);
    this.drawParticles(g, dt);

    // ---- prewarm the cache in spare time
    if (!rendered) {
      if (!this.prewarm.length && this.anim === 'idle' && !this.prewarmDone.has(this.id + baseH)) { this.prewarmDone.add(this.id + baseH); this.queuePrewarm(baseH); }
      // at most one background render every other frame (each is ~3-8 ms)
      if (this.prewarm.length && (this.prewarmTick++ & 1) === 0) this.prewarm.shift()!();
    }
  }
  private prewarmDone = new Set<string>();
  private prewarmTick = 0;

  private weaponFx(g: CanvasRenderingContext2D, dt: number): void {
    const s = this.scale;
    const blitC = (cv: HTMLCanvasElement, x: number, y: number): void => {
      g.drawImage(cv, Math.round(this.cx + x * s - (cv.width * s) / 2), Math.round(this.cy + y * s - (cv.height * s) / 2), cv.width * s, cv.height * s);
    };
    const m = this.frameMuzzle();
    // muzzle flashes
    if (this.id === 'pulse' && this.fireT < 0.06) blitC(viewmodelFx.flash('pulse', this.fireT < 0.03 ? 1 : 0, this.flashSeed), m[0], m[1]);
    if (this.id === 'breacher' && this.fireT < 0.08) {
      const big = this.fireT < 0.04 ? 1 : 0;
      const m2 = this.pt('muzzle2') ?? m;
      blitC(viewmodelFx.flash('breacher', big, this.flashSeed), m[0], m[1]);
      blitC(viewmodelFx.flash('breacher', big, (this.flashSeed + 1) % 3), m2[0], m2[1]);
    }
    if (this.id === 'lance' && this.fireT < 0.1) blitC(viewmodelFx.flash('lance', this.fireT < 0.05 ? 1 : 0, this.flashSeed), m[0], m[1]);
    // lance arcs across the prongs + crackle along the coils
    if (this.id === 'lance' && this.charge > 0.08) {
      const a = this.pt('prongL'), b = this.pt('prongR');
      const lv = Math.round(this.charge * 6);
      if (a && b) {
        const arcs = 1 + Math.floor(this.charge * 3);
        for (let i = 0; i < arcs; i++) this.arc(g, a[0], a[1], b[0], b[1], i === 0 ? '#ffffff' : '#9ad8ff', 3);
      }
      for (let i = 0; i < lv; i++) {
        if (Math.random() > 0.25 + this.charge * 0.3) continue;
        const c = this.pt('coil' + i);
        if (c) this.arc(g, c[0] - 6, c[1] + (Math.random() - 0.5) * 4, c[0] + 6, c[1] + (Math.random() - 0.5) * 4, Math.random() < 0.5 ? '#ffffff' : '#7ac8ff', 2);
      }
      if (this.charge > 0.8 && Math.random() < 0.4) { const c = this.pt('tip'); if (c) this.sparks(c[0], c[1], 1, 60, 2); }
    }
    // ripper: smoke puffs from the exhaust; cutting sparks + gore at the bar tip
    if (this.id === 'ripper') {
      this.puffT -= dt;
      const ex = this.pt('exhaust');
      if (ex && this.puffT <= 0) {
        this.puffT = this.rOn ? 0.09 : 0.35 + Math.random() * 0.3;
        this.puff(ex[0], ex[1], 0, this.rOn ? 3 : 2 + Math.random() * 2, 0.6, 25 + Math.random() * 25, -18 - Math.random() * 15);
      }
      const tip = this.pt('tip');
      if (tip && this.rCut) {
        this.sparks(tip[0], tip[1], 3, 160, 2, -0.3, -1, 1.1);
        this.sparks(tip[0], tip[1], 4, 140, 3, 0.2, -1, 1.3);
      }
    }
  }

  private arc(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, jag: number): void {
    const s = this.scale;
    g.fillStyle = col;
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2));
    let py = 0;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      py += (Math.random() - 0.5) * jag;
      py *= 0.85;
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + py * Math.sin(u * Math.PI) * 2;
      g.fillRect(Math.round(this.cx + x * s), Math.round(this.cy + y * s), s, s);
    }
  }

  private drawParticles(g: CanvasRenderingContext2D, dt: number): void {
    const s = this.scale;
    const out: Particle[] = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vy += p.g * dt;
      if (p.kind <= 1) { p.vx *= 1 - dt * 2.5; p.vy *= 1 - dt * 2; p.size += dt * (p.kind === 1 ? 10 : 7); }
      p.x += p.vx * dt; p.y += p.vy * dt;
      out.push(p);
      const u = p.life / p.max;
      if (p.kind <= 1) {
        const cv = viewmodelFx.puff(p.kind, Math.round(p.size), u);
        g.drawImage(cv, Math.round(this.cx + p.x * s - (cv.width * s) / 2), Math.round(this.cy + p.y * s - (cv.height * s) / 2), cv.width * s, cv.height * s);
      } else {
        g.fillStyle = p.kind === 2 ? (u > 0.6 ? '#ffffff' : u > 0.3 ? '#fff27a' : '#ffa020') : p.kind === 3 ? (u > 0.5 ? '#b0121a' : '#5a0a0e') : (u > 0.5 ? '#fff0c0' : '#ffb030');
        g.fillRect(Math.round(this.cx + p.x * s), Math.round(this.cy + p.y * s), s, s);
        if (p.kind === 2 && u > 0.5) g.fillRect(Math.round(this.cx + (p.x - p.vx * 0.012) * s), Math.round(this.cy + (p.y - p.vy * 0.012) * s), s, s);
      }
    }
    this.particles = out;
  }
}
