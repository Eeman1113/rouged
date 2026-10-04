import type { EnemyAnim, EnemySnap, EnemyType, ProjectileKind } from '../../shared/protocol';
import { ENEMIES, EnemyDef } from '../../shared/enemyDefs';
import { hasLOS } from '../../shared/mapData';
import { moveEntity } from '../../shared/physics';
import * as C from '../../shared/constants';
import type { Run } from '../run';
import type { SimPlayer } from '../player';

export type AIState = 'patrol' | 'engage' | 'flee';

export abstract class Enemy {
  def: EnemyDef;
  x: number; y: number; z: number;
  vx = 0; vz = 0;
  yaw = 0;
  hp: number; maxHp: number;
  alive = true;
  state: AIState = 'patrol';
  anim: EnemyAnim = 'idle';
  animT = 0;
  target: SimPlayer | null = null;
  aware = false;
  reactT = 0;
  cooldown = 0;
  staggered = false;
  staggerT = 0;
  frozenT = 0;
  burnT = 0;
  burnDps = 0;
  burnBy = '';
  marked = false;
  markT = 0;
  tell = 0;
  cloak = 0;
  painT = 0;
  fleeT = 0;
  strafeDir = 1;
  strafeT = 0;
  patrolX: number; patrolZ: number;
  squad = 0;
  lastHitBy = '';
  lastAimX = 0; lastAimY = 0; lastAimZ = 0;
  aiming = false;
  spawnT = 0.6; // spawn-in delay
  noticeT = 0;
  lastSeenX = 0; lastSeenZ = 0;
  speedMult = 1;
  dmgMult = 1;
  lastAlertSound = -99;

  constructor(public id: number, public type: EnemyType, x: number, z: number, public elite: boolean, run: Run) {
    this.def = ENEMIES[type];
    this.x = x; this.z = z; this.y = this.def.flying ? 2.5 : 0;
    this.patrolX = x; this.patrolZ = z;
    const hpMult = run.diff.hp * (elite ? 1.5 : 1);
    this.maxHp = Math.round(this.def.hp * hpMult);
    this.hp = this.maxHp;
    this.dmgMult = run.diff.damage * (elite ? 1.2 : 1);
    this.strafeDir = run.rng.chance(0.5) ? 1 : -1;
    this.cooldown = run.rng.range(0.5, 1.5);
  }

  get cx() { return this.x; }
  get cy() { return this.y + this.def.height * 0.5; }
  get cz() { return this.z; }

  /** Common update: status effects, perception, then subclass think(). */
  update(run: Run, dt: number) {
    if (this.spawnT > 0) { this.spawnT -= dt; return; }
    this.animT += dt;
    if (this.markT > 0) { this.markT -= dt; if (this.markT <= 0) this.marked = false; }
    if (this.burnT > 0) {
      this.burnT -= dt;
      run.damageEnemy(this, this.burnDps * dt, this.burnBy, false, 0, 0, 0, 'pulse', true);
      if (!this.alive) return;
    }
    if (this.frozenT > 0) { this.frozenT -= dt; this.anim = 'pain'; this.tell = 0; return; }
    if (this.staggered) {
      this.staggerT -= dt;
      this.anim = 'stagger';
      this.tell = 0;
      this.aiming = false;
      if (this.staggerT <= 0) { this.staggered = false; this.hp = Math.max(this.hp, this.maxHp * (C.GLORY_THRESHOLD + 0.05)); }
      return;
    }
    if (this.painT > 0) { this.painT -= dt; }
    this.speedMult = run.frenzy ? 1.3 : 1;
    this.perceive(run, dt);
    this.think(run, dt);
    // pain anim overrides briefly
    if (this.painT > 0 && this.anim !== 'charge' && this.anim !== 'attack') this.anim = 'pain';
  }

  abstract think(run: Run, dt: number): void;

  /** Raycast + FOV cone perception with reaction delay. */
  perceive(run: Run, dt: number) {
    const sight = C.ENEMY_SIGHT * run.diff.awareness;
    // keep current target if still valid
    if (this.target && (!this.target.alive || this.target.ghostT > 0)) { this.target = null; }
    let best: SimPlayer | null = this.target;
    let bestD = best ? this.distTo(best) : Infinity;
    for (const p of run.targets()) {
      const d = this.distTo(p);
      if (d > sight || d >= bestD - 2) continue;
      if (!this.aware) {
        // FOV check
        const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
        const dx = (p.x - this.x) / (d || 1), dz = (p.z - this.z) / (d || 1);
        const cos = fx * dx + fz * dz;
        if (cos < Math.cos((C.ENEMY_FOV / 2) * Math.PI / 180) && d > 6) continue;
      }
      if (!this.canSee(run, p)) continue;
      best = p; bestD = d;
    }
    if (best && best !== this.target) {
      if (!this.aware) {
        this.reactT = run.rng.range(C.ENEMY_REACTION_MIN, C.ENEMY_REACTION_MAX) * run.diff.reaction;
        if (run.time - this.lastAlertSound > 4) { run.emit({ e: 'enemyAlert', enemy: this.id, type: this.type }); this.lastAlertSound = run.time; }
      }
      this.aware = true;
      this.target = best;
      this.state = 'engage';
      run.alertSquad(this, best);
    }
    if (this.target) {
      if (this.canSee(run, this.target)) { this.lastSeenX = this.target.x; this.lastSeenZ = this.target.z; }
    } else if (this.aware) {
      // lost target → pick any alive player to hunt
      const t = run.targets();
      if (t.length) this.target = t[0];
      else { this.aware = false; this.state = 'patrol'; }
    }
    if (this.reactT > 0) this.reactT -= dt;
  }

  canSee(run: Run, p: SimPlayer): boolean {
    return hasLOS(run.solids, this.x, this.y + this.def.headY, this.z, p.x, p.y + 1.4, p.z);
  }

  distTo(p: { x: number; z: number }) { return Math.hypot(p.x - this.x, p.z - this.z); }

  faceTo(x: number, z: number, dt: number, rate = 10) {
    const want = Math.atan2(-(x - this.x), -(z - this.z));
    let d = want - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += d * Math.min(1, rate * dt);
  }

  /** Move with flow field toward a player (or direct if visible & close). */
  chase(run: Run, target: SimPlayer, speed: number, dt: number, desired = 0) {
    const d = this.distTo(target);
    let dx = 0, dz = 0;
    if (d < desired) {
      // back off
      dx = (this.x - target.x) / (d || 1); dz = (this.z - target.z) / (d || 1);
    } else if (this.def.flying || (d < 6 && this.canSee(run, target))) {
      dx = (target.x - this.x) / (d || 1); dz = (target.z - this.z) / (d || 1);
    } else {
      const f = run.flowDir(this.x, this.z, target);
      dx = f.x; dz = f.z;
    }
    this.moveDir(run, dx, dz, speed, dt);
  }

  moveDir(run: Run, dx: number, dz: number, speed: number, dt: number) {
    const sp = speed * this.speedMult;
    const l = Math.hypot(dx, dz);
    if (l < 1e-4) { this.vx = 0; this.vz = 0; return; }
    const tx = (dx / l) * sp, tz = (dz / l) * sp;
    const k = Math.min(1, 10 * dt);
    this.vx += (tx - this.vx) * k; this.vz += (tz - this.vz) * k;
    this.applyVelocity(run, dt);
    if (this.anim !== 'attack' && this.anim !== 'charge') this.anim = 'move';
  }

  applyVelocity(run: Run, dt: number, dy = 0) {
    const pos = { x: this.x, y: this.y, z: this.z };
    moveEntity(pos, this.def.radius, this.def.height, this.vx * dt, this.vz * dt, run.solids, this.def.flying, dy);
    this.x = pos.x; this.y = pos.y; this.z = pos.z;
  }

  strafe(run: Run, target: SimPlayer, speed: number, dt: number) {
    this.strafeT -= dt;
    if (this.strafeT <= 0) { this.strafeT = run.rng.range(0.8, 2.0); this.strafeDir = run.rng.chance(0.5) ? 1 : -1; }
    const d = this.distTo(target) || 1;
    const px = -(target.z - this.z) / d, pz = (target.x - this.x) / d;
    const before = { x: this.x, z: this.z };
    this.moveDir(run, px * this.strafeDir, pz * this.strafeDir, speed, dt);
    if (Math.hypot(this.x - before.x, this.z - before.z) < speed * dt * 0.3) this.strafeDir *= -1;
  }

  /** Fire a projectile at a player. "Bots miss on purpose": accuracy-capped error offset. */
  shootAt(run: Run, target: SimPlayer, kind: ProjectileKind, speed: number, dmg: number, opts: { spread?: number; accuracy?: number; oy?: number; homing?: boolean; gravity?: number; explode?: number; lead?: number } = {}) {
    const ox = this.x, oy = this.y + (opts.oy ?? this.def.headY * 0.85), oz = this.z;
    const lead = opts.lead ?? 0.5;
    const dist = Math.hypot(target.x - ox, target.z - oz);
    const t = dist / speed;
    let ax = target.x + target.vx * t * lead, ay = target.y + 1.1, az = target.z + target.vz * t * lead;
    const acc = Math.min(0.92, (opts.accuracy ?? run.diff.accuracy) * (this.elite ? 1.1 : 1));
    if (!run.rng.chance(acc)) {
      // deliberate miss: offset perpendicular + vertical
      const px = -(az - oz), pz = ax - ox;
      const pl = Math.hypot(px, pz) || 1;
      const off = run.rng.range(1.1, 2.4) * (run.rng.chance(0.5) ? 1 : -1);
      ax += (px / pl) * off; az += (pz / pl) * off; ay += run.rng.range(-0.6, 1.2);
    }
    let dx = ax - ox, dy = ay - oy, dz = az - oz;
    if (opts.gravity) {
      // lob: solve rough arc by adding vertical velocity
      const tt = dist / speed;
      dy += 0.5 * opts.gravity * tt * tt;
    }
    const l = Math.hypot(dx, dy, dz) || 1;
    dx /= l; dy /= l; dz /= l;
    if (opts.spread) {
      dx += run.rng.range(-opts.spread, opts.spread); dy += run.rng.range(-opts.spread, opts.spread) * 0.5; dz += run.rng.range(-opts.spread, opts.spread);
    }
    run.spawnProjectile({
      kind, x: ox, y: oy, z: oz, vx: dx * speed, vy: dy * speed, vz: dz * speed,
      dmg: dmg * this.dmgMult, owner: this.id, homing: opts.homing ? target.id : undefined, gravity: opts.gravity ?? 0,
      explode: opts.explode ?? 0,
    });
    run.emit({ e: 'enemyFire', enemy: this.id, type: this.type, x: ox, y: oy, z: oz });
  }

  meleeHit(run: Run, target: SimPlayer, dmg: number, range: number, knock = 0): boolean {
    if (this.distTo(target) > range + this.def.radius || Math.abs(target.y - this.y) > 2.5) return false;
    const d = this.distTo(target) || 1;
    run.damagePlayer(target, dmg * this.dmgMult, this.x, this.y + 1, this.z, true, this,
      knock ? { x: ((target.x - this.x) / d) * knock, y: knock * 0.35, z: ((target.z - this.z) / d) * knock } : undefined);
    return true;
  }

  snap(): EnemySnap {
    const s: EnemySnap = {
      id: this.id, type: this.type, x: this.x, y: this.y, z: this.z, yaw: this.yaw,
      hp: Math.ceil(this.hp), maxHp: this.maxHp, anim: this.spawnT > 0 ? 'idle' : this.anim,
      tell: this.tell, cloak: this.cloak, marked: this.marked, frozen: this.frozenT > 0, burning: this.burnT > 0, elite: this.elite,
    };
    if (this.aiming) { s.aimX = this.lastAimX; s.aimY = this.lastAimY; s.aimZ = this.lastAimZ; }
    return s;
  }

  /** Called on damage; subclasses can override (e.g. flinch, retaliate). */
  onDamaged(run: Run, by: SimPlayer | null) {
    if (by && !this.aware) {
      this.aware = true; this.target = by; this.state = 'engage';
      this.reactT = run.rng.range(C.ENEMY_REACTION_MIN, C.ENEMY_REACTION_MAX) * run.diff.reaction;
      run.alertSquad(this, by);
    }
    if (run.rng.chance(0.25) && this.painT <= 0) this.painT = 0.18;
  }

  /** Idle wander around the spawn point. */
  patrol(run: Run, dt: number) {
    this.strafeT -= dt;
    if (this.strafeT <= 0) {
      this.strafeT = run.rng.range(1.5, 3.5);
      this.patrolX = this.x + run.rng.range(-4, 4);
      this.patrolZ = this.z + run.rng.range(-4, 4);
    }
    const dx = this.patrolX - this.x, dz = this.patrolZ - this.z;
    if (Math.hypot(dx, dz) > 0.6) { this.moveDir(run, dx, dz, this.def.speed * 0.35, dt); this.faceTo(this.patrolX, this.patrolZ, dt, 4); }
    else { this.vx = 0; this.vz = 0; this.anim = 'idle'; }
  }
}
