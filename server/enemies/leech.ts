import { Enemy } from './base';
import type { Run } from '../run';
import type { SimPlayer } from '../player';

/** Fleshy crawler. Leaps, latches on, drains. Dash or shoot it off. */
export class Leech extends Enemy {
  latched: SimPlayer | null = null;
  latchT = 0;
  drainT = 0;
  leapT = 0;
  vy = 0;
  ox = 0; oz = 0;

  get pinned() { return !!this.latched; }

  think(run: Run, dt: number) {
    if (this.latched) { this.whileLatched(run, dt); return; }
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 14);
    if (this.leapT > 0) {
      this.leapT -= dt;
      this.vy -= 22 * dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      this.applyVelocity(run, dt);
      this.anim = 'attack';
      if (Math.hypot(t.x - this.x, t.z - this.z) < 1.1 && Math.abs(t.y + 0.9 - this.y) < 1.4 && t.alive) {
        this.latched = t; this.latchT = 4; this.drainT = 0.2;
        const a = run.rng.range(0, Math.PI * 2); this.ox = Math.cos(a) * 0.4; this.oz = Math.sin(a) * 0.4;
        run.emit({ e: 'latch', enemy: this.id, id: t.id, on: true });
      }
      if (this.leapT <= 0 || (this.y <= 0 && this.vy < 0)) { this.leapT = 0; this.y = 0; this.cooldown = run.rng.range(0.8, 1.4); }
      return;
    }
    // zig-zag skitter toward the target
    this.strafeT -= dt;
    if (this.strafeT <= 0) { this.strafeT = run.rng.range(0.25, 0.6); this.strafeDir *= -1; }
    const f = d > 6 && !this.canSee(run, t) ? run.flowDir(this.x, this.z, t) : { x: (t.x - this.x) / (d || 1), z: (t.z - this.z) / (d || 1) };
    this.moveDir(run, f.x - f.z * 0.6 * this.strafeDir, f.z + f.x * 0.6 * this.strafeDir, this.def.speed, dt);
    this.cooldown -= dt;
    if (this.reactT <= 0 && this.cooldown <= 0 && d < 5 && this.canSee(run, t)) {
      this.leapT = 0.9; this.vy = 6.5;
      const sp = 12 * this.speedMult;
      this.vx = ((t.x + t.vx * 0.25 - this.x) / (d || 1)) * sp; this.vz = ((t.z + t.vz * 0.25 - this.z) / (d || 1)) * sp;
      run.emit({ e: 'enemyAlert', enemy: this.id, type: 'leech' });
    }
  }

  whileLatched(run: Run, dt: number) {
    const p = this.latched!;
    this.x = p.x + this.ox; this.z = p.z + this.oz; this.y = p.y + 0.8;
    this.anim = 'attack';
    this.latchT -= dt;
    this.drainT -= dt;
    if (this.drainT <= 0) { this.drainT = 0.25; run.damagePlayer(p, 2 * this.dmgMult, this.x, this.y, this.z, true, this); }
    if (!p.alive || p.dashing || this.latchT <= 0) this.detach(run);
  }

  detach(run: Run) {
    if (!this.latched) return;
    const p = this.latched;
    run.emit({ e: 'latch', enemy: this.id, id: p.id, on: false });
    this.latched = null;
    this.y = 0;
    this.x = p.x + this.ox * 4; this.z = p.z + this.oz * 4;
    this.cooldown = 1.5;
    this.painT = 0.4;
  }

  onDamaged(run: Run, by: Parameters<Enemy['onDamaged']>[1]) {
    super.onDamaged(run, by);
    if (this.latched && run.rng.chance(0.5)) this.detach(run);
  }
}
