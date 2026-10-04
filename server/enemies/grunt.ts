import { Enemy } from './base';
import type { Run } from '../run';
import { hasLOS, navBlockedAt } from '../../shared/mapData';

/** Soldier. Walks, strafes, fires 3-round bursts, ducks behind cover, sometimes flees. */
export class Grunt extends Enemy {
  burst = 0;
  burstT = 0;
  coverX = 0; coverZ = 0;
  coverT = 0;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 9);

    if (this.state === 'flee') {
      this.fleeT -= dt;
      this.moveDir(run, this.x - t.x, this.z - t.z, this.def.speed * 1.3, dt);
      if (this.fleeT <= 0) this.state = 'engage';
      return;
    }
    if (this.hp < this.maxHp * 0.3 && this.hp > this.maxHp * 0.15 && run.rng.chance(0.004)) { this.state = 'flee'; this.fleeT = 1.5; }

    // bursting
    if (this.burst > 0) {
      this.burstT -= dt;
      this.anim = 'attack';
      this.vx *= 0.8; this.vz *= 0.8;
      if (this.burstT <= 0) {
        if (this.canSee(run, t)) this.shootAt(run, t, 'bolt', 30, 7, { lead: 0.6 });
        this.burst--; this.burstT = this.elite ? 0.09 : 0.12; this.animT = 0;
        if (this.burst === 0) { this.cooldown = run.rng.range(1.4, 2.4) / (this.elite ? 1.3 : 1); this.maybeTakeCover(run); }
      }
      return;
    }
    // take cover movement
    if (this.coverT > 0) {
      this.coverT -= dt;
      const dx = this.coverX - this.x, dz = this.coverZ - this.z;
      if (Math.hypot(dx, dz) > 0.5) this.moveDir(run, dx, dz, this.def.speed * 1.2, dt);
      else { this.vx = 0; this.vz = 0; this.anim = 'idle'; }
    } else if (d > 18 || !this.canSee(run, t)) this.chase(run, t, this.def.speed, dt);
    else if (d < 6) this.chase(run, t, this.def.speed, dt, 8);
    else this.strafe(run, t, this.def.speed * 0.75, dt);

    this.cooldown -= dt;
    if (this.reactT <= 0 && this.cooldown <= 0 && d < 30 && this.canSee(run, t)) {
      this.burst = 3; this.burstT = 0.05; this.coverT = 0;
    }
  }

  maybeTakeCover(run: Run) {
    const t = this.target;
    if (!t || !run.rng.chance(0.45)) return;
    for (let i = 0; i < 8; i++) {
      const a = run.rng.range(0, Math.PI * 2), r = run.rng.range(3, 6);
      const x = this.x + Math.cos(a) * r, z = this.z + Math.sin(a) * r;
      if (navBlockedAt(run.geo.nav, x, z)) continue;
      if (!hasLOS(run.solids, x, 1.5, z, t.x, t.y + 1.4, t.z)) { this.coverX = x; this.coverZ = z; this.coverT = 1.4; return; }
    }
  }
}
