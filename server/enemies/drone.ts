import { Enemy } from './base';
import type { Run } from '../run';

/** Fodder. Flies, swarms, peppers you with bolts, then dive-bombs. */
export class Drone extends Enemy {
  bob = Math.random() * 6;
  diving = false;
  diveT = 0;
  altitude = 2.2 + Math.random() * 1.4;

  think(run: Run, dt: number) {
    this.bob += dt * 3;
    const t = this.target;
    let dy = (this.altitude + Math.sin(this.bob) * 0.35 - this.y) * 3;
    if (!this.aware || !t) {
      this.patrol(run, dt);
      this.applyVelocity(run, 0, dy * dt);
      return;
    }
    this.faceTo(t.x, t.z, dt, 12);
    const d = this.distTo(t);
    if (this.diving) {
      this.diveT -= dt;
      const tx = t.x - this.x, ty = t.y + 1.1 - this.y, tz = t.z - this.z;
      const l = Math.hypot(tx, ty, tz) || 1;
      const sp = 13 * this.speedMult;
      this.vx = (tx / l) * sp; this.vz = (tz / l) * sp;
      this.applyVelocity(run, dt, (ty / l) * sp * dt);
      this.anim = 'attack';
      if (l < 1.3) {
        this.meleeHit(run, t, 9, 1.4, 4);
        this.diving = false; this.cooldown = 2.5; this.altitude = 2.4 + run.rng.range(0, 1.2);
      } else if (this.diveT <= 0) { this.diving = false; this.cooldown = 1.5; }
      return;
    }
    // orbit at range
    const want = 7 + (this.id % 4);
    if (d > want + 2) this.chase(run, t, this.def.speed, dt);
    else this.strafe(run, t, this.def.speed * 0.8, dt);
    this.applyVelocity(run, 0, dy * dt);
    this.cooldown -= dt;
    if (this.reactT <= 0 && this.cooldown <= 0 && this.canSee(run, t)) {
      if (d < 12 && run.rng.chance(0.35)) {
        this.diving = true; this.diveT = 1.2; this.tell = 1;
        run.emit({ e: 'enemyAlert', enemy: this.id, type: 'drone' });
      } else {
        this.shootAt(run, t, 'bolt', 22, 5, { oy: 0.45 });
        this.anim = 'attack'; this.animT = 0;
      }
      this.cooldown = run.rng.range(1.1, 1.8) / (this.elite ? 1.4 : 1);
    } else if (this.animT > 0.2 && this.anim === 'attack') this.anim = 'move';
    this.tell = Math.max(0, this.tell - dt * 3);
  }
}
