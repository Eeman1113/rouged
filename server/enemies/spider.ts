import { Enemy } from './base';
import type { Run } from '../run';

/** Area denial. Skitters, lays mines, lobs acid. */
export class Spider extends Enemy {
  mineCd = 2;
  skitterT = 0;
  sdx = 0; sdz = 0;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 10);
    this.skitterT -= dt;
    if (this.skitterT <= 0) {
      this.skitterT = run.rng.range(0.35, 0.9);
      const a = run.rng.range(0, Math.PI * 2);
      this.sdx = Math.cos(a); this.sdz = Math.sin(a);
    }
    if (d > 15) this.chase(run, t, this.def.speed, dt);
    else if (d < 7) this.chase(run, t, this.def.speed, dt, 10);
    else this.moveDir(run, this.sdx, this.sdz, this.def.speed * 0.8, dt);

    this.mineCd -= dt;
    if (this.mineCd <= 0) {
      this.mineCd = run.rng.range(3.5, 5.5);
      if (run.minesBy(this.id) < 3) run.spawnMine(this.x, this.z, this.id);
    }
    this.cooldown -= dt;
    if (this.reactT <= 0 && this.cooldown <= 0 && d < 22 && this.canSee(run, t)) {
      this.shootAt(run, t, 'spit', 16, 9, { gravity: 12, oy: 0.6, explode: 1.6 });
      this.cooldown = run.rng.range(1.8, 2.8);
      this.anim = 'attack'; this.animT = 0;
    }
    if (this.anim === 'attack' && this.animT < 0.25) return;
  }
}
