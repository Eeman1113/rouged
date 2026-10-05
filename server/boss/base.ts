// Boss framework. Every Warden is a Boss: a state machine of named, telegraphed moves
// (wind-up → active → recovery), weighted no-repeat selection with combo chains, three phases
// separated by invulnerable set-piece transitions, a break meter (kneel + bonus damage),
// a weak point that opens during specific move stages, an enrage timer, and a glory finisher.
// Server-authoritative; all randomness through run.rng.

import { Enemy } from '../enemies/base';
import type { Run } from '../run';
import type { SimPlayer } from '../player';
import type { EnemyAnim, EnemySnap, EnemyType, ProjectileKind } from '../../shared/protocol';
import { navBlockedAt } from '../../shared/mapData';
import * as C from '../../shared/constants';
import * as combat from '../combat';

export type Stage = 0 | 1 | 2;

export interface MoveDef {
  id: string;
  /** shown on the HUD: "— MOLTEN LEAP —" */
  name: string;
  wind: number; active: number; recover: number;
  /** selection weight per phase [p1, p2, p3]; 0 = not available in that phase */
  w: [number, number, number];
  /** distance band the move prefers (weight ×2 inside, ×0.4 outside) */
  near?: number; far?: number;
  /** seconds before the move may be picked again */
  cd?: number;
  /** legacy anim for old clients */
  anim?: EnemyAnim;
  /** follow-ups: [moveId, chance, minPhase] */
  combo?: [string, number, number?][];
  /** weak point exposure per stage [wind, active, recover] (0..1) */
  core?: [number, number, number];
  /** does the wind-up telegraph damage? (enforces the minimum readable wind-up) */
  safe?: boolean;
  /** can a full break meter interrupt the active stage? */
  noBreak?: boolean;
  /** extra availability condition */
  can?: () => boolean;
  begin?: () => void;
  enter?: (stage: Stage) => void;
  tick?: (stage: Stage, t: number, dt: number) => void;
  /** cleanup when the move ends or is interrupted */
  end?: () => void;
}

type BossState = 'intro' | 'idle' | 'move' | 'transition' | 'break' | 'finish';

const TELE: Record<string, number> = { easy: 1.25, normal: 1, hard: 0.92, nightmare: 0.85 };
const MIN_TELL: Record<string, number> = { easy: 0.8, normal: 0.6, hard: 0.55, nightmare: 0.5 };

export abstract class Boss extends Enemy {
  run: Run;
  variant: number;
  name: string;
  phase = 1;
  bs: BossState = 'intro';
  moves: MoveDef[] = [];
  cur: MoveDef | null = null;
  stage: Stage = 0;
  stageT = 0;
  stageLen = 1;
  idleT = 1.6;
  history: string[] = [];
  cds = new Map<string, number>();
  comboQueue: string[] = [];
  fightT = 0;
  phaseT = 0;
  transT = 0;
  transLen = 1.8;
  breakT = 0;
  breakCd = 0;
  brk = 0;
  lastDmgT = -99;
  finishT = 0;
  coreV = 0;
  coreWant = 0;
  shieldV = 0;
  /** linked shield (adds alive): damage multiplier while > 0 */
  linkedShield = 0;
  beam: number[] | null = null;
  beamHitT = new Map<string, number>();
  enraged = false;
  /** weak point height (feet-relative) */
  wy = 5.4;
  /** damage taken multiplier (armor) */
  armor = 1;
  /** preferred fighting distance band */
  prefMin = 8; prefMax = 16;
  /** fraction of max HP of damage that fills the break meter */
  breakFrac = 0.12;
  breakLen = 3.0;
  /** hover / leap height (visual + collision) */
  lift = 0;
  /** scratch for moves */
  m: Record<string, number> = {};
  pts: { x: number; z: number }[] = [];
  tgt: SimPlayer | null = null;
  usedMoves = new Set<string>();
  phaseTimes: number[] = [];
  breaks = 0;
  private rr = 0;

  constructor(id: number, x: number, z: number, run: Run, variant: number, hpScale: number, hpMult: number, name: string) {
    super(id, 'warden', x, z, false, run);
    this.run = run;
    this.variant = variant;
    this.name = name;
    this.maxHp = Math.round(this.def.hp * run.diff.hp * hpScale * hpMult * 1.3 * run.depthHp);
    this.hp = this.maxHp;
    this.aware = true;
    this.spawnT = 2.4; // intro: invulnerable roar
    this.yaw = 0;
  }

  // ───────────────────────────── scaling ─────────────────────────────

  get rate(): number { return (this.phase === 3 ? 1.22 : this.phase === 2 ? 1.1 : 1) + (this.enraged ? 0.22 : 0); }
  get tele(): number { return TELE[this.run.difficulty] ?? 1; }
  get minTell(): number { return MIN_TELL[this.run.difficulty] ?? 0.6; }
  get bossLike(): boolean { return true; }
  get coop(): number { return Math.max(1, this.run.targets().length); }

  stageLength(m: MoveDef, st: Stage): number {
    if (st === 0) { const w = (m.wind * this.tele) / this.rate; return m.safe ? Math.max(0.25, w) : Math.max(this.minTell, w); }
    if (st === 1) return m.active / Math.min(this.rate, 1.15);
    return (m.recover * (this.run.difficulty === 'easy' ? 1.25 : 1)) / this.rate;
  }

  // ───────────────────────────── update ─────────────────────────────

  update(run: Run, dt: number) {
    if (this.spawnT > 0) {
      this.spawnT -= dt; this.bs = 'intro'; this.anim = 'idle'; this.stageT += dt; this.stageLen = 2.4;
      const t = run.targets()[0]; if (t) this.faceTo(t.x, t.z, dt, 2);
      if (this.spawnT <= 0) { this.bs = 'idle'; this.stageT = 0; this.onIntroEnd(); }
      return;
    }
    this.animT += dt;
    if (this.markT > 0) { this.markT -= dt; if (this.markT <= 0) this.marked = false; }
    if (this.burnT > 0) {
      this.burnT -= dt;
      run.damageEnemy(this, this.burnDps * dt, this.burnBy, false, 0, 0, 0, 'pulse', true);
      if (!this.alive) return;
    }
    if (this.painT > 0) this.painT -= dt;
    this.speedMult = (run.frenzy ? 1.15 : 1) * (run.mutator === 'overclock' ? 1.2 : 1);
    this.fightT += dt;
    this.phaseT += dt;
    if (this.breakCd > 0) this.breakCd -= dt;
    if (run.time - this.lastDmgT > 2 && this.bs !== 'break') this.brk = Math.max(0, this.brk - dt * 0.04);
    if (!this.enraged && this.fightT > 150) {
      this.enraged = true;
      run.emit({ e: 'bossEnrage', enemy: this.id });
    }
    // weak point + shield easing
    this.coreV += (this.coreWant - this.coreV) * Math.min(1, dt * 10);
    const shWant = this.bs === 'transition' || this.bs === 'intro' ? 1 : this.linkedShield > 0 ? 0.6 : 0;
    this.shieldV += (shWant - this.shieldV) * Math.min(1, dt * 8);
    this.tgt = this.pickTarget(run);
    this.target = this.tgt;
    this.think(run, dt);
    if (this.painT > 0 && this.bs === 'idle') this.anim = 'pain';
  }

  think(run: Run, dt: number) {
    switch (this.bs) {
      case 'finish': {
        this.vx = 0; this.vz = 0; this.anim = 'stagger'; this.coreWant = 1;
        this.stageT += dt;
        this.lift = Math.max(0, this.lift - dt * 4);
        this.finishT -= dt;
        if (this.finishT <= 0) {
          const by = this.lastHitBy || run.order[0] || '';
          combat.killEnemy(run, this, by, false, false, 0, 1, 0, run.players.get(by)?.weapon ?? 'pulse');
        }
        return;
      }
      case 'transition': {
        this.vx = 0; this.vz = 0; this.anim = 'charge';
        const was = this.transT;
        this.transT += dt; this.stageT = this.transT;
        // the roar ends in a ring you can see coming
        if (was < 0.9 && this.transT >= 0.9) run.shockwave(this.x, this.z, 2.5, 22, 12, 12 * this.dmgMult);
        this.lift = Math.max(0, this.lift - dt * 3);
        this.transitionTick(run, this.transT, dt);
        if (this.transT >= this.transLen) {
          this.bs = 'idle'; this.idleT = 0.6; this.stageT = 0;
          // showcase the phase's new trick first
          const fresh = this.moves.find((m) => m.w[this.phase - 1] > 0 && m.w[this.phase - 2] === 0 && !this.usedMoves.has(m.id) && (!m.can || m.can()));
          if (fresh) this.comboQueue.unshift(fresh.id);
          this.afterTransition(run, this.phase);
        }
        return;
      }
      case 'break': {
        this.vx = 0; this.vz = 0; this.anim = 'stagger'; this.coreWant = 1;
        this.lift = Math.max(0, this.lift - dt * 5);
        this.breakT -= dt; this.stageT += dt;
        if (this.breakT <= 0) {
          this.bs = 'idle'; this.brk = 0; this.breakCd = 7; this.coreWant = 0; this.stageT = 0;
          run.emit({ e: 'bossBreak', enemy: this.id, on: false, x: this.x, y: this.cy, z: this.z });
          this.idleT = 0.25;
          const wake = this.wakeMove();
          if (wake) this.comboQueue.unshift(wake);
        }
        return;
      }
      default: break;
    }
    // phase gates
    const frac = this.hp / this.maxHp;
    const want = frac <= 0.33 + 1e-4 ? 3 : frac <= 0.66 + 1e-4 ? 2 : 1;
    if (want > this.phase) { this.beginTransition(run, this.phase + 1); return; }
    // break
    if (this.brk >= 1 && this.breakCd <= 0 && !(this.cur?.noBreak && this.stage === 1)) { this.beginBreak(run); return; }

    if (this.bs === 'idle') {
      this.coreWant = 0; this.tell = 0; this.aiming = false; this.cloak = 0;
      this.stageT += dt;
      this.position(run, dt);
      this.idleT -= dt * this.rate;
      if (this.idleT <= 0) this.startMove(run, this.choose(run));
      return;
    }
    if (this.bs === 'move' && this.cur) this.runMove(run, dt);
  }

  pickTarget(run: Run): SimPlayer | null {
    const ts = run.targets();
    if (!ts.length) return null;
    if (this.tgt && this.tgt.alive && this.tgt.ghostT <= 0 && ts.includes(this.tgt)) return this.tgt;
    let best = ts[0], bd = Infinity;
    for (const p of ts) { const d = this.distTo(p); if (d < bd) { bd = d; best = p; } }
    return best;
  }

  /** Round-robin target for co-op variety (each move swaps target). */
  nextTarget(): SimPlayer | null {
    const ts = this.run.targets();
    if (!ts.length) return null;
    this.rr = (this.rr + 1) % ts.length;
    return ts[this.rr];
  }

  // ───────────────────────────── moves ─────────────────────────────

  choose(run: Run): MoveDef {
    while (this.comboQueue.length) {
      const id = this.comboQueue.shift()!;
      const m = this.moves.find((x) => x.id === id);
      if (m && (!m.can || m.can())) return m;
    }
    const t = this.tgt;
    const d = t ? this.distTo(t) : 12;
    const last = this.history[this.history.length - 1];
    const cands: MoveDef[] = [], weights: number[] = [];
    for (const m of this.moves) {
      let w = m.w[this.phase - 1];
      if (w <= 0 || m.id === last) continue;
      if ((this.cds.get(m.id) ?? -99) > this.fightT) continue;
      if (m.can && !m.can()) continue;
      if (m.near !== undefined || m.far !== undefined) w *= d >= (m.near ?? 0) && d <= (m.far ?? 999) ? 2 : 0.4;
      if (this.history.slice(-3).includes(m.id)) w *= 0.35;
      if (!this.usedMoves.has(m.id)) w *= this.phase > 1 && m.w[this.phase - 2] === 0 ? 8 : 4; // show the whole kit, and each phase's new tricks
      cands.push(m); weights.push(w);
    }
    if (!cands.length) return this.moves.find((m) => m.w[this.phase - 1] > 0 && m.id !== last) ?? this.moves[0];
    // every move gets shown once before anything repeats (a learnable kit)
    const fresh = cands.map((m, i) => [m, weights[i]] as const).filter(([m]) => !this.usedMoves.has(m.id));
    if (fresh.length) return run.rng.weighted(fresh.map((f) => f[0]), fresh.map((f) => f[1]));
    return run.rng.weighted(cands, weights);
  }

  startMove(run: Run, m: MoveDef) {
    this.cur = m; this.bs = 'move'; this.stage = 0; this.stageT = 0;
    this.m = {}; this.pts = [];
    this.tgt = this.nextTarget() ?? this.tgt;
    this.target = this.tgt;
    this.stageLen = this.stageLength(m, 0);
    this.history.push(m.id); if (this.history.length > 6) this.history.shift();
    this.usedMoves.add(m.id);
    if (m.cd) this.cds.set(m.id, this.fightT + m.cd);
    this.anim = m.anim ?? 'attack';
    this.coreWant = m.core ? m.core[0] : 0;
    run.emit({ e: 'bossMove', enemy: this.id, move: m.id, name: m.name, phase: this.phase });
    m.begin?.();
    m.enter?.(0);
  }

  runMove(run: Run, dt: number) {
    const m = this.cur!;
    this.stageT += dt;
    if (this.stage === 0) this.tell = Math.min(1, this.stageT / this.stageLen);
    else if (this.stage === 1) this.tell = 1;
    else this.tell = 0;
    m.tick?.(this.stage, this.stageT, dt);
    if (this.cur !== m || this.bs !== 'move') return; // move switched itself
    if (this.stageT >= this.stageLen) this.advance(run);
  }

  /** Jump to the next stage (moves may call this early). */
  advance(run: Run) {
    const m = this.cur;
    if (!m) return;
    if (this.stage === 2) { this.endMove(run, true); return; }
    this.stage = (this.stage + 1) as Stage;
    this.stageT = 0;
    this.stageLen = this.stageLength(m, this.stage);
    this.coreWant = m.core ? m.core[this.stage] : 0;
    m.enter?.(this.stage);
  }

  endMove(run: Run, natural: boolean) {
    const m = this.cur;
    this.cur = null; this.bs = 'idle'; this.stageT = 0;
    this.tell = 0; this.aiming = false; this.cloak = 0; this.beam = null; this.coreWant = 0;
    if (m) m.end?.();
    this.idleT = (this.run.difficulty === 'easy' ? 1.6 : this.run.difficulty === "nightmare" ? 0.85 : 1.05) * this.idleScale();
    if (natural && m?.combo) {
      for (const [id, ch, minP] of m.combo) {
        if (this.phase >= (minP ?? 1) && run.rng.chance(ch)) { this.comboQueue.push(id); this.idleT = 0.3; break; }
      }
    }
  }

  idleScale(): number { return 1; }

  /** height above the floor the body is drawn at (leaps, hover) */
  visLift(): number { return this.lift; }

  /** Skip the rest of the current move into a different one (chains like teleport → ring). */
  chain(id: string) {
    const run = this.run;
    const next = this.moves.find((x) => x.id === id);
    const m = this.cur;
    this.cur = null; this.beam = null;
    m?.end?.();
    if (next) this.startMove(run, next); else this.endMove(run, false);
  }

  // ───────────────────────────── phases / breaks / death ─────────────────────────────

  beginTransition(run: Run, phase: number) {
    if (this.cur) { const m = this.cur; this.cur = null; m.end?.(); }
    this.phaseTimes.push(this.fightT);
    this.phase = phase; this.phaseT = 0;
    this.bs = 'transition'; this.transT = 0; this.stageT = 0;
    this.beam = null; this.tell = 0; this.aiming = false; this.cloak = 0; this.coreWant = 0;
    this.comboQueue = [];
    this.brk = Math.min(this.brk, 0.5);
    this.hp = Math.min(this.hp, this.maxHp * (phase === 2 ? 0.66 : 0.33));
    const name = this.transitionName(phase);
    run.emit({ e: 'bossPhase', phase });
    run.projectiles = run.projectiles.filter((p) => p.owner !== this.id);
    this.onTransition(run, phase);
    run.emit({ e: 'bossTransition', enemy: this.id, phase, name, t: this.transLen });
    run.emit({ e: 'explosion', x: this.x, y: 2, z: this.z, r: 6, kind: 'boss' });
  }

  beginBreak(run: Run) {
    if (this.cur) { const m = this.cur; this.cur = null; m.end?.(); }
    this.bs = 'break';
    this.breaks++;
    this.breakT = this.breakLen * (run.difficulty === 'easy' ? 1.2 : 1);
    this.stageT = 0;
    this.beam = null; this.tell = 0; this.aiming = false; this.cloak = 0;
    this.comboQueue = [];
    run.emit({ e: 'bossBreak', enemy: this.id, on: true, x: this.x, y: this.cy, z: this.z });
    run.emit({ e: 'explosion', x: this.x, y: this.wy, z: this.z, r: 3, kind: 'tesla' });
  }

  preventDeath(run: Run, by: string): boolean {
    if (this.bs === 'finish') { this.hp = 1; return true; }
    if (this.cur) { const m = this.cur; this.cur = null; m.end?.(); }
    this.bs = 'finish';
    this.hp = 1;
    this.lastHitBy = by;
    this.staggered = true; // glory / Ripper executes
    this.staggerT = 99;
    this.finishT = this.finishLen();
    this.stageT = 0; this.beam = null; this.tell = 0; this.aiming = false; this.cloak = 0;
    this.linkedShield = 0;
    run.projectiles = [];
    run.strikes = [];
    run.shockwaves = [];
    run.endZones();
    for (const o of run.enemies.values()) if (o !== this && o.alive) combat.killEnemy(run, o, by, false, false, o.x - this.x, 1, o.z - this.z, 'pulse');
    run.emit({ e: 'bossDying', enemy: this.id, x: this.x, y: this.cy, z: this.z, t: this.finishT, finisher: true });
    this.onFinish(run);
    return true;
  }

  finishLen(): number { return 4.5; }

  onDeath(run: Run, _by: string) {
    // the death cinematic: a chain of blasts across the body, then the room clears
    run.holdClearUntil = run.time + 3.2;
    const x = this.x, z = this.z;
    for (let i = 0; i < 7; i++) {
      run.after(0.25 + i * 0.32, () => run.emit({ e: 'explosion', x: x + run.rng.range(-2.2, 2.2), y: run.rng.range(1, 5.5), z: z + run.rng.range(-1.5, 1.5), r: 2.5 + i * 0.4, kind: i % 3 === 2 ? 'tesla' : 'kill' }));
    }
    run.after(2.7, () => run.emit({ e: 'explosion', x, y: 3, z, r: 12, kind: 'boss' }));
  }

  modifyDamage(run: Run, dmg: number, _dx: number, _dz: number, head: boolean): number {
    if (this.bs === 'intro' || this.bs === 'transition' || this.bs === 'finish') { run.shieldHit(this); return 0; }
    let k = this.armor;
    if (this.linkedShield > 0) { k *= 0.2; run.shieldHit(this); }
    if (head) k *= this.coreV > 0.5 ? 1.5 : 0.7;
    if (this.bs === 'break') k *= 1.5;
    dmg *= k;
    if (this.bs !== 'break' && this.breakCd <= 0) this.brk = Math.min(1, this.brk + (dmg / (this.maxHp * this.breakFrac)) * (head && this.coreV > 0.5 ? 2.5 : 1));
    this.lastDmgT = run.time;
    // phases can't be skipped: damage stops at the threshold, then the set piece plays
    const thr = this.phase === 1 ? 0.66 : this.phase === 2 ? 0.33 : 0;
    if (thr > 0 && this.hp - dmg < this.maxHp * thr) dmg = Math.max(0, this.hp - this.maxHp * thr);
    return dmg;
  }

  onDamaged(run: Run, by: SimPlayer | null) {
    if (by && !this.tgt) this.tgt = by;
    if (run.rng.chance(0.12) && this.painT <= 0 && this.bs === 'idle') this.painT = 0.15;
  }

  // ───────────────────────────── hooks ─────────────────────────────

  abstract transitionName(phase: number): string;
  onTransition(_run: Run, _phase: number) {}
  transitionTick(_run: Run, _t: number, _dt: number) {}
  afterTransition(_run: Run, _phase: number) {}
  onIntroEnd() {}
  onFinish(_run: Run) {}
  wakeMove(): string | null { return null; }

  /** Default positioning: hold a distance band and strafe. */
  position(run: Run, dt: number) {
    const t = this.tgt;
    if (!t) { this.vx = 0; this.vz = 0; this.anim = 'idle'; return; }
    this.faceTo(t.x, t.z, dt, 3);
    const d = this.distTo(t);
    const sp = this.def.speed * this.rate;
    if (d > this.prefMax) this.chase(run, t, sp, dt);
    else if (d < this.prefMin) this.moveDir(run, this.x - t.x, this.z - t.z, sp * 0.8, dt);
    else this.strafe(run, t, sp * 0.5, dt);
  }

  // ───────────────────────────── helpers ─────────────────────────────

  get headY(): number { return this.y + this.def.headY * 0.75; }

  aimYaw(x: number, z: number): number { return Math.atan2(x - this.x, z - this.z); }

  fan(kind: ProjectileKind, n: number, spread: number, speed: number, dmg: number, y: number, yaw: number, ox = this.x, oz = this.z, vy = -0.4) {
    for (let i = 0; i < n; i++) {
      const a = yaw + (n > 1 ? (i - (n - 1) / 2) * spread : 0);
      this.run.spawnProjectile({ kind, x: ox + Math.sin(a) * 1.5, y, z: oz + Math.cos(a) * 1.5, vx: Math.sin(a) * speed, vy, vz: Math.cos(a) * speed, dmg: dmg * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
    }
    this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'warden', x: ox, y, z: oz });
  }

  ring(kind: ProjectileKind, n: number, y: number, speed: number, dmg: number, off = this.run.rng.range(0, Math.PI), ox = this.x, oz = this.z) {
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2;
      this.run.spawnProjectile({ kind, x: ox + Math.sin(a) * 2, y, z: oz + Math.cos(a) * 2, vx: Math.sin(a) * speed, vy: 0, vz: Math.cos(a) * speed, dmg: dmg * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
    }
  }

  /** Lobbed projectile landing near (tx,tz) after ~t seconds. */
  lob(kind: ProjectileKind, tx: number, tz: number, t: number, dmg: number, explode: number, oy = this.headY) {
    const g = 18;
    const vx = (tx - this.x) / t, vz = (tz - this.z) / t;
    const vy = (0 - oy + 0.5 * g * t * t) / t;
    this.run.spawnProjectile({ kind, x: this.x, y: oy, z: this.z, vx, vy, vz, dmg: dmg * this.dmgMult, owner: this.id, gravity: g, explode, life: t + 1 });
  }

  tellLine(x: number, z: number, x2: number, z2: number, w: number, t: number, hue?: number) { this.run.tell({ shape: 'line', x, z, x2, z2, w, t, hue }); }
  tellCircle(x: number, z: number, r: number, t: number, hue?: number) { this.run.tell({ shape: 'circle', x, z, r, t, hue }); }
  tellCone(x: number, z: number, a: number, arc: number, r: number, t: number, hue?: number) { this.run.tell({ shape: 'cone', x, z, a, arc, r, t, hue }); }

  say(text: string) { this.run.emit({ e: 'bossSay', enemy: this.id, text }); }

  /** Horizontal beam segment at height y; hits players overlapping it (jump low beams, duck high ones). */
  beamAt(x0: number, z0: number, x1: number, z1: number, y: number, thick: number, live: boolean, dmg: number) {
    this.beam = [x0, y, z0, x1, y, z1, thick, live ? 1 : 0];
    if (!live) return;
    const vx = x1 - x0, vz = z1 - z0, l2 = vx * vx + vz * vz || 1;
    for (const p of this.run.targets()) {
      const last = this.beamHitT.get(p.id) ?? -9;
      if (this.run.time - last < 0.5) continue;
      let t = ((p.x - x0) * vx + (p.z - z0) * vz) / l2; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(p.x - (x0 + vx * t), p.z - (z0 + vz * t));
      if (d > thick * 0.5 + C.PLAYER_RADIUS) continue;
      if (p.y > y + thick * 0.5 || this.run.playerTop(p) < y - thick * 0.5) continue;
      this.beamHitT.set(p.id, this.run.time);
      this.run.damagePlayer(p, dmg * this.dmgMult, x0, y, z0, false, this, { x: (vz / Math.sqrt(l2)) * 4, y: 3, z: (-vx / Math.sqrt(l2)) * 4 });
    }
  }

  /** Beam endpoint clipped against solids (pillars stop beams: take cover). */
  beamEnd(x0: number, z0: number, a: number, len: number, y: number): { x: number; z: number } {
    const dx = Math.sin(a), dz = Math.cos(a);
    for (let s = 1; s < len; s += 0.5) {
      const x = x0 + dx * s, z = z0 + dz * s;
      if (this.run.pointInSolid(x, y, z) || Math.abs(x) > this.run.geo.w / 2 || Math.abs(z) > this.run.geo.d / 2) return { x, z };
    }
    return { x: x0 + dx * len, z: z0 + dz * len };
  }

  summon(types: EnemyType[], n: number, radius: number, cap = 9) {
    let room = cap - (this.run.enemies.size - 1);
    for (let i = 0; i < n && room > 0; i++, room--) {
      const a = this.run.rng.range(0, Math.PI * 2);
      this.run.spawnEnemyNear(types[i % types.length], this.x + Math.cos(a) * radius, this.z + Math.sin(a) * radius);
    }
  }

  adds(): number { let n = 0; for (const e of this.run.enemies.values()) if (e !== this && e.alive) n++; return n; }

  /** A free floor point (not inside pillars/platforms), clamped into the arena. */
  freePoint(x: number, z: number, margin = 4): { x: number; z: number } {
    const g = this.run.geo;
    const hw = g.w / 2 - margin, hd = g.d / 2 - margin;
    x = Math.max(-hw, Math.min(hw, x)); z = Math.max(-hd, Math.min(hd, z));
    if (!navBlockedAt(g.nav, x, z) && !navBlockedAt(g.nav, x + 1.5, z) && !navBlockedAt(g.nav, x - 1.5, z) && !navBlockedAt(g.nav, x, z + 1.5) && !navBlockedAt(g.nav, x, z - 1.5)) return { x, z };
    for (let r = 2; r < 12; r += 1.5) for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const xx = Math.max(-hw, Math.min(hw, x + Math.cos(a) * r)), zz = Math.max(-hd, Math.min(hd, z + Math.sin(a) * r));
      if (!navBlockedAt(g.nav, xx, zz) && !navBlockedAt(g.nav, xx + 1.5, zz) && !navBlockedAt(g.nav, xx - 1.5, zz) && !navBlockedAt(g.nav, xx, zz + 1.5) && !navBlockedAt(g.nav, xx, zz - 1.5)) return { x: xx, z: zz };
    }
    return { x: 0, z: 0 };
  }

  /** Charge step along (cdx,cdz). Returns true when blocked (wall/pillar). */
  chargeStep(run: Run, speed: number, dt: number, dmg: number): boolean {
    const cdx = this.m.cdx ?? 0, cdz = this.m.cdz ?? 0;
    this.vx = cdx * speed; this.vz = cdz * speed;
    const bx = this.x, bz = this.z;
    this.applyVelocity(run, dt);
    for (const p of run.targets()) {
      if (this.m['hit_' + p.id]) continue;
      if (Math.hypot(p.x - this.x, p.z - this.z) < this.def.radius + 1.0 && p.y < 3) {
        this.m['hit_' + p.id] = 1;
        run.damagePlayer(p, dmg * this.dmgMult, this.x, 2, this.z, true, this, { x: cdx * 20, y: 7, z: cdz * 20 });
      }
    }
    return Math.hypot(this.x - bx, this.z - bz) < speed * dt * 0.3;
  }

  snap(): EnemySnap {
    const s = super.snap();
    s.phase = this.phase;
    s.y = this.y + this.visLift();
    s.move = this.bs === 'move' && this.cur ? this.cur.id : this.bs;
    s.moveStage = this.bs === 'move' ? this.stage : 0;
    const len = this.bs === 'move' ? this.stageLen : this.bs === 'transition' ? this.transLen : this.bs === 'break' ? this.breakLen : this.bs === 'finish' ? this.finishLen() : this.bs === 'intro' ? 2.4 : 0;
    s.moveT = len > 0 ? Math.round(Math.min(1, this.stageT / len) * 100) / 100 : Math.round((this.stageT % 10) * 10) / 100;
    s.brk = Math.round(this.brk * 100) / 100;
    if (this.coreV > 0.05) s.core = Math.round(this.coreV * 100) / 100;
    if (this.shieldV > 0.05) s.shield = Math.round(this.shieldV * 100) / 100;
    s.wy = this.wy;
    if (this.beam) s.beam = this.beam.map((v) => Math.round(v * 100) / 100);
    s.anim = this.bs === 'intro' ? 'idle' : this.bs === 'break' || this.bs === 'finish' ? 'stagger' : this.anim;
    return s;
  }
}
