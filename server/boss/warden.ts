import { Enemy } from '../enemies/base';
import type { Run } from '../run';
import type { EnemySnap, EnemyType, ProjectileKind } from '../../shared/protocol';

type Attack = 'fan' | 'slam' | 'ring' | 'homing' | 'charge' | 'snipe' | 'summon' | 'spiral' | 'barrage' | 'teleport' | 'roots' | 'artillery' | 'brood' | 'static';

export const WARDEN_TITLES = ['THE SMELTER', 'THE CURATOR', 'THE FIRST', 'THE MOTHER', 'THE GARDENER', 'THE GENERAL', 'THE HANDLER'];
const NAMES = WARDEN_TITLES;

/** Multi-phase boss. Variant = biome. Phases at 66% / 33%. */
export class Warden extends Enemy {
  variant: number;
  phase = 1;
  attack: Attack | null = null;
  attackT = 0;
  step = 0;
  stepT = 0;
  idleT = 2.5;
  cdx = 0; cdz = 0;
  spin = 0;
  name: string;
  snipeTargets: { x: number; y: number; z: number }[] = [];

  constructor(id: number, x: number, z: number, run: Run, variant: number, hpScale: number) {
    super(id, 'warden', x, z, false, run);
    this.variant = variant;
    this.maxHp = Math.round(this.def.hp * run.diff.hp * hpScale * (1 + variant * 0.3) * run.depthHp);
    this.hp = this.maxHp;
    this.name = NAMES[variant] ?? 'WARDEN';
    this.aware = true;
    this.spawnT = 2.2; // intro
  }

  pool(): Attack[] {
    const p = this.phase;
    if (this.variant === 0) return p === 1 ? ['fan', 'slam', 'charge'] : p === 2 ? ['fan', 'slam', 'charge', 'summon', 'ring'] : ['spiral', 'slam', 'charge', 'ring', 'summon', 'fan'];
    if (this.variant === 1) return p === 1 ? ['homing', 'snipe', 'teleport'] : p === 2 ? ['homing', 'snipe', 'teleport', 'summon', 'fan'] : ['spiral', 'snipe', 'homing', 'teleport', 'ring', 'summon'];
    if (this.variant === 2) return p === 1 ? ['barrage', 'ring', 'fan', 'slam'] : p === 2 ? ['barrage', 'ring', 'homing', 'summon', 'charge'] : ['spiral', 'barrage', 'ring', 'snipe', 'summon', 'charge', 'slam'];
    if (this.variant === 3) return p === 1 ? ['brood', 'fan', 'ring'] : p === 2 ? ['brood', 'homing', 'ring', 'slam'] : ['brood', 'spiral', 'homing', 'ring', 'summon'];
    if (this.variant === 4) return p === 1 ? ['roots', 'fan', 'charge'] : p === 2 ? ['roots', 'brood', 'ring', 'charge'] : ['roots', 'spiral', 'brood', 'snipe', 'ring'];
    if (this.variant === 5) return p === 1 ? ['artillery', 'barrage', 'charge'] : p === 2 ? ['artillery', 'barrage', 'summon', 'fan', 'charge'] : ['artillery', 'spiral', 'barrage', 'summon', 'slam', 'charge'];
    // THE HANDLER: it does not chase you. It never did.
    return p === 1 ? ['static', 'snipe', 'ring'] : p === 2 ? ['static', 'snipe', 'teleport', 'summon', 'homing'] : ['static', 'spiral', 'teleport', 'summon', 'snipe', 'ring'];
  }

  proj(): ProjectileKind { return (['plasma', 'orb', 'orb', 'spit', 'spit', 'plasma', 'hex'] as ProjectileKind[])[this.variant] ?? 'orb'; }

  get immobile() { return this.variant === 6; }

  think(run: Run, dt: number) {
    // phase transitions
    const frac = this.hp / this.maxHp;
    const np = frac < 0.33 ? 3 : frac < 0.66 ? 2 : 1;
    if (np !== this.phase) {
      this.phase = np;
      run.emit({ e: 'bossPhase', phase: np });
      this.attack = 'ring'; this.attackT = 0; this.step = 0; this.stepT = 0.4;
      run.emit({ e: 'explosion', x: this.x, y: 2, z: this.z, r: 6, kind: 'boss' });
    }
    const t = this.target ?? run.targets()[0] ?? null;
    if (!t) { this.anim = 'idle'; return; }
    this.target = t;
    const rate = this.phase === 3 ? 1.45 : this.phase === 2 ? 1.2 : 1;

    if (!this.attack) {
      this.faceTo(t.x, t.z, dt, 3);
      const d = this.distTo(t);
      if (this.immobile) { this.vx = 0; this.vz = 0; this.anim = 'idle'; }
      else if (d > 14) this.chase(run, t, this.def.speed * rate, dt);
      else this.strafe(run, t, this.def.speed * 0.6 * rate, dt);
      this.idleT -= dt * rate;
      this.tell = 0;
      if (this.idleT <= 0) {
        const pool = this.pool();
        let a = run.rng.pick(pool);
        if ((a === 'summon' || a === 'brood') && run.enemies.size > 8) a = pool[pool.length - 1] === a ? pool[0] : pool[pool.length - 1];
        this.attack = a; this.attackT = 0; this.step = 0; this.stepT = 0;
      }
      return;
    }
    this.attackT += dt * rate;
    this.stepT -= dt * rate;
    const P = this.proj();
    const headY = this.def.headY * 0.75;
    switch (this.attack) {
      case 'fan': {
        this.faceTo(t.x, t.z, dt, 6);
        this.anim = 'attack';
        this.tell = Math.min(1, this.attackT / 0.5);
        if (this.attackT > 0.5 && this.stepT <= 0 && this.step < (this.phase === 1 ? 2 : 3)) {
          const n = this.phase === 3 ? 13 : 9;
          const base = Math.atan2(t.x - this.x, t.z - this.z);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.11 + (this.step % 2 ? 0.055 : 0);
            run.spawnProjectile({ kind: P, x: this.x, y: headY, z: this.z, vx: Math.sin(a) * 17, vy: -0.6, vz: Math.cos(a) * 17, dmg: 10 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
          }
          run.emit({ e: 'enemyFire', enemy: this.id, type: 'warden', x: this.x, y: headY, z: this.z });
          this.step++; this.stepT = 0.45;
        }
        if (this.attackT > 2.2) this.end(run, 1.6);
        break;
      }
      case 'slam': {
        this.vx = 0; this.vz = 0;
        this.anim = 'charge';
        this.tell = Math.min(1, this.attackT / 0.95);
        if (this.attackT > 0.95 && this.step === 0) {
          this.step = 1;
          run.emit({ e: 'explosion', x: this.x, y: 0.2, z: this.z, r: 9, kind: 'boss' });
          for (const p of run.targets()) {
            const d = Math.hypot(p.x - this.x, p.z - this.z);
            if (d < 9 && p.y < 0.9) run.damagePlayer(p, 32 * this.dmgMult, this.x, 0.5, this.z, true, this, { x: (p.x - this.x) / (d || 1) * 14, y: 8, z: (p.z - this.z) / (d || 1) * 14 });
          }
          this.ringBurst(run, 28, 0.45, 11, P);
        }
        if (this.attackT > 1.6) this.end(run, 1.4);
        break;
      }
      case 'ring': {
        this.anim = 'attack';
        this.tell = 0.7;
        if (this.stepT <= 0 && this.step < 3) {
          this.ringBurst(run, 24 + this.phase * 4, 0.5, 9 + this.step * 2, P);
          this.step++; this.stepT = 0.7;
        }
        if (this.attackT > 2.4) this.end(run, 1.5);
        break;
      }
      case 'homing': {
        this.anim = 'attack';
        this.tell = 0.5;
        if (this.stepT <= 0 && this.step < 3 + this.phase) {
          const targets = run.targets();
          const tt = targets[this.step % targets.length] ?? t;
          this.shootAt(run, tt, 'orb', 9, 12, { homing: true, accuracy: 1, oy: headY });
          this.step++; this.stepT = 0.35;
        }
        if (this.attackT > 2.6) this.end(run, 1.5);
        break;
      }
      case 'charge': {
        if (this.step === 0) {
          this.anim = 'charge';
          this.vx = 0; this.vz = 0;
          this.faceTo(t.x, t.z, dt, 10);
          this.tell = Math.min(1, this.attackT / 0.8);
          if (this.attackT > 0.8) {
            const d = this.distTo(t) || 1;
            this.cdx = (t.x - this.x) / d; this.cdz = (t.z - this.z) / d; this.step = 1;
          }
        } else {
          this.anim = 'charge';
          const sp = 19;
          this.vx = this.cdx * sp; this.vz = this.cdz * sp;
          const bx = this.x, bz = this.z;
          this.applyVelocity(run, dt);
          for (const p of run.targets()) {
            if (Math.hypot(p.x - this.x, p.z - this.z) < this.def.radius + 0.9 && p.y < 3 && this.step === 1) {
              run.damagePlayer(p, 34 * this.dmgMult, this.x, 2, this.z, true, this, { x: this.cdx * 20, y: 7, z: this.cdz * 20 });
              this.step = 2;
            }
          }
          if (Math.hypot(this.x - bx, this.z - bz) < sp * dt * 0.3 || this.attackT > 2.3) {
            run.emit({ e: 'explosion', x: this.x + this.cdx * 2, y: 2, z: this.z + this.cdz * 2, r: 4, kind: 'boss' });
            this.ringBurst(run, 16, 1.2, 10, P);
            this.end(run, 1.8);
          }
        }
        break;
      }
      case 'snipe': {
        this.vx = 0; this.vz = 0;
        this.anim = 'charge';
        if (this.step === 0) {
          this.snipeTargets = run.targets().map((p) => ({ x: p.x, y: p.y + 1.1, z: p.z }));
          this.lastAimX = t.x; this.lastAimY = t.y + 1.1; this.lastAimZ = t.z;
          this.step = 1;
        }
        this.aiming = true;
        const tt = run.targets()[0];
        if (tt) {
          const k = Math.min(1, dt * 2.2);
          this.lastAimX += (tt.x - this.lastAimX) * k; this.lastAimY += (tt.y + 1.1 - this.lastAimY) * k; this.lastAimZ += (tt.z - this.lastAimZ) * k;
        }
        this.tell = Math.min(1, this.attackT / 1.3);
        if (this.attackT > 1.3 && this.step === 1) {
          this.step = 2;
          this.aiming = false;
          // fire a fast lance at the painted point
          const ox = this.x, oy = headY, oz = this.z;
          const dx = this.lastAimX - ox, dy = this.lastAimY - oy, dz = this.lastAimZ - oz;
          const l = Math.hypot(dx, dy, dz) || 1;
          for (let i = -1; i <= 1; i++) {
            const a = i * 0.06;
            const cx = (dx / l) * Math.cos(a) - (dz / l) * Math.sin(a), cz = (dx / l) * Math.sin(a) + (dz / l) * Math.cos(a);
            run.spawnProjectile({ kind: 'bolt', x: ox, y: oy, z: oz, vx: cx * 55, vy: (dy / l) * 55, vz: cz * 55, dmg: 22 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
          }
          run.emit({ e: 'enemyFire', enemy: this.id, type: 'stalker', x: ox, y: oy, z: oz });
        }
        if (this.attackT > 1.9) this.end(run, 1.2);
        break;
      }
      case 'summon': {
        this.anim = 'attack';
        this.tell = 1;
        if (this.step === 0 && this.attackT > 0.6) {
          this.step = 1;
          const SUMMONS: EnemyType[][] = [['drone', 'drone', 'grunt'], ['spider', 'stalker', 'drone'], ['brute', 'replica', 'drone'], ['leech', 'wraith', 'leech'], ['spider', 'leech', 'wraith'], ['bulwark', 'grunt', 'bomber'], ['replica', 'wraith', 'replica']];
          const types = SUMMONS[this.variant] ?? SUMMONS[0];
          const n = this.phase === 3 ? 3 : 2;
          for (let i = 0; i < n; i++) {
            const a = run.rng.range(0, Math.PI * 2);
            run.spawnEnemyNear(types[i % types.length], this.x + Math.cos(a) * 6, this.z + Math.sin(a) * 6);
          }
        }
        if (this.attackT > 1.4) this.end(run, 1.5);
        break;
      }
      case 'spiral': {
        this.anim = 'attack';
        this.tell = 0.8;
        this.vx = 0; this.vz = 0;
        if (this.stepT <= 0) {
          this.spin += 0.37;
          for (let k = 0; k < 4; k++) {
            const a = this.spin + (k * Math.PI) / 2;
            run.spawnProjectile({ kind: P, x: this.x, y: 1.4, z: this.z, vx: Math.sin(a) * 11, vy: 0, vz: Math.cos(a) * 11, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
          }
          this.stepT = 0.09;
        }
        if (this.attackT > 3.2) this.end(run, 1.6);
        break;
      }
      case 'barrage': {
        this.anim = 'attack';
        this.tell = 0.6;
        this.faceTo(t.x, t.z, dt, 5);
        if (this.stepT <= 0 && this.step < 6) {
          const targets = run.targets();
          const tt = targets[this.step % targets.length] ?? t;
          this.shootAt(run, tt, 'rocket', 20, 16, { explode: 3, oy: headY, accuracy: 0.8 });
          this.step++; this.stepT = 0.28;
        }
        if (this.attackT > 2.4) this.end(run, 1.4);
        break;
      }
      case 'brood': {
        // birth: a clutch of leeches
        this.anim = 'charge';
        this.tell = Math.min(1, this.attackT / 0.7);
        if (this.attackT > 0.7 && this.step === 0) {
          this.step = 1;
          const n = 3 + this.phase;
          for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; run.spawnEnemyNear('leech', this.x + Math.cos(a) * 4, this.z + Math.sin(a) * 4); }
          run.emit({ e: 'explosion', x: this.x, y: 1, z: this.z, r: 4, kind: 'mine' });
        }
        if (this.attackT > 1.3) this.end(run, 1.6);
        break;
      }
      case 'roots':
      case 'artillery':
      case 'static': {
        // telegraphed ground strikes under (and around) every player
        this.anim = this.attack === 'artillery' ? 'attack' : 'charge';
        this.tell = 0.8;
        if (!this.immobile) { this.vx *= 0.9; this.vz *= 0.9; }
        const waves = this.attack === 'static' ? 4 : 3;
        if (this.stepT <= 0 && this.step < waves) {
          const r = this.attack === 'artillery' ? 4 : this.attack === 'roots' ? 2.6 : 3;
          const delay = this.attack === 'artillery' ? 1.3 : 0.9;
          const kind = this.attack === 'artillery' ? 'rocket' : this.attack === 'roots' ? 'mine' : 'tesla';
          for (const p of run.targets()) {
            run.strike(p.x + p.vx * delay * 0.5, p.z + p.vz * delay * 0.5, r, delay, 24 * this.dmgMult, kind);
            for (let k = 0; k < this.phase + (this.attack === 'static' ? 2 : 0); k++) run.strike(p.x + run.rng.range(-8, 8), p.z + run.rng.range(-8, 8), r, delay + run.rng.range(0, 0.4), 24 * this.dmgMult, kind);
          }
          this.step++; this.stepT = this.attack === 'static' ? 0.55 : 0.75;
        }
        if (this.attackT > waves * 0.75 + 1) this.end(run, 1.4);
        break;
      }
      case 'teleport': {
        this.anim = 'charge';
        this.cloak = Math.min(1, this.attackT / 0.5);
        if (this.attackT > 0.5 && this.step === 0) {
          this.step = 1;
          const g = run.geo;
          for (let i = 0; i < 12; i++) {
            const x = run.rng.range(-g.w / 2 + 6, g.w / 2 - 6), z = run.rng.range(-g.d / 2 + 6, g.d / 2 - 10);
            if (Math.hypot(x - t.x, z - t.z) > 12) { this.x = x; this.z = z; break; }
          }
          run.emit({ e: 'explosion', x: this.x, y: 3, z: this.z, r: 5, kind: 'tesla' });
        }
        if (this.attackT > 0.5) this.cloak = Math.max(0, 1 - (this.attackT - 0.5) / 0.4);
        if (this.attackT > 1.0) { this.cloak = 0; this.attack = 'ring'; this.attackT = 0; this.step = 2; this.stepT = 0; }
        break;
      }
    }
  }

  ringBurst(run: Run, n: number, y: number, speed: number, kind: ProjectileKind) {
    const off = run.rng.range(0, Math.PI);
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2;
      run.spawnProjectile({ kind, x: this.x + Math.sin(a) * 2, y, z: this.z + Math.cos(a) * 2, vx: Math.sin(a) * speed, vy: 0, vz: Math.cos(a) * speed, dmg: 9 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
    }
  }

  end(_run: Run, idle: number) {
    this.attack = null; this.attackT = 0; this.step = 0; this.tell = 0; this.aiming = false; this.cloak = 0;
    this.idleT = idle * (this.phase === 3 ? 0.6 : this.phase === 2 ? 0.8 : 1);
  }

  onDamaged(run: Run, by: Parameters<Enemy['onDamaged']>[1]) {
    if (by && !this.target) this.target = by;
    void run;
  }

  snap(): EnemySnap {
    const s = super.snap();
    s.phase = this.phase;
    s.anim = this.spawnT > 0 ? 'idle' : this.anim;
    return s;
  }
}
