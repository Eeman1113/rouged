import { Enemy } from './base';
import type { Run } from '../run';
import { hasLOS, navBlockedAt } from '../../shared/mapData';

/** Cable-ghost caster. Blinks around, throws seeking hexes, calls drones. */
export class Wraith extends Enemy {
  blinkT = 3;
  castT = 0;
  summonT = 10;
  bob = Math.random() * 6;
  phasing = 0;

  think(run: Run, dt: number) {
    this.bob += dt * 2;
    this.y = 0.35 + Math.sin(this.bob) * 0.15;
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    this.faceTo(t.x, t.z, dt, 8);
    if (this.phasing > 0) {
      this.phasing -= dt;
      this.cloak = Math.min(1, this.cloak + dt * 4);
      if (this.phasing <= 0) { this.blink(run); this.cloak = 0.6; }
      return;
    }
    this.cloak = Math.max(0, this.cloak - dt * 2);
    const d = this.distTo(t);
    if (d < 7) this.chase(run, t, this.def.speed, dt, 12); else this.strafe(run, t, this.def.speed * 0.7, dt);
    this.blinkT -= dt; this.summonT -= dt;
    if (this.castT > 0) {
      this.castT -= dt;
      this.anim = 'charge';
      this.tell = 1 - this.castT / 0.8;
      if (this.castT <= 0) {
        for (let i = 0; i < (this.elite ? 4 : 3); i++) this.shootAt(run, t, 'hex', 8 + i, 11, { homing: true, accuracy: 1, spread: 0.25 });
        this.tell = 0; this.cooldown = run.rng.range(2.2, 3.2); this.anim = 'attack';
      }
      return;
    }
    if (this.blinkT <= 0) { this.blinkT = run.rng.range(3.5, 5); this.phasing = 0.45; return; }
    if (this.summonT <= 0 && run.enemies.size < 12) {
      this.summonT = run.rng.range(11, 16);
      for (let i = 0; i < 2; i++) run.spawnEnemyNear('drone', this.x + run.rng.range(-3, 3), this.z + run.rng.range(-3, 3));
      run.emit({ e: 'explosion', x: this.x, y: 1.5, z: this.z, r: 2, kind: 'tesla' });
    }
    this.cooldown -= dt;
    if (this.cooldown <= 0 && this.reactT <= 0 && this.canSee(run, t)) this.castT = 0.8;
  }

  blink(run: Run) {
    const t = this.target;
    for (let i = 0; i < 12; i++) {
      const a = run.rng.range(0, Math.PI * 2), r = run.rng.range(8, 14);
      const x = (t ? t.x : this.x) + Math.cos(a) * r, z = (t ? t.z : this.z) + Math.sin(a) * r;
      if (navBlockedAt(run.geo.nav, x, z)) continue;
      if (t && !hasLOS(run.solids, x, 1.8, z, t.x, t.y + 1.4, t.z)) continue;
      run.emit({ e: 'explosion', x: this.x, y: 1.4, z: this.z, r: 1.6, kind: 'tesla' });
      this.x = x; this.z = z;
      return;
    }
  }
}
