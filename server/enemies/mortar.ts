import { Enemy } from './base';
import type { Run } from '../run';

/** Artillery walker. Shells announce where they will land — move. */
export class Mortar extends Enemy {
  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 5);
    if (d < 13) this.chase(run, t, this.def.speed, dt, 18);
    else if (d > 28 || !this.canSee(run, t)) this.chase(run, t, this.def.speed, dt);
    else { this.vx *= 0.8; this.vz *= 0.8; this.anim = 'idle'; }
    this.cooldown -= dt;
    if (this.cooldown <= 0 && this.reactT <= 0 && d < 40) {
      const salvo = this.elite ? 3 : run.mutator === 'overclock' ? 2 : 1;
      for (let i = 0; i < salvo; i++) {
        const T = 1.6 + i * 0.25;
        const tx = t.x + t.vx * T * 0.6 + run.rng.range(-2, 2) * (i ? 1.5 : 0.6);
        const tz = t.z + t.vz * T * 0.6 + run.rng.range(-2, 2) * (i ? 1.5 : 0.6);
        const g = 18;
        const oy = this.y + 1.7;
        run.spawnProjectile({ kind: 'shell', x: this.x, y: oy, z: this.z, vx: (tx - this.x) / T, vy: (0.3 - oy + 0.5 * g * T * T) / T, vz: (tz - this.z) / T, dmg: 26 * this.dmgMult, owner: this.id, gravity: g, explode: 3.6, life: T + 1 });
        run.emit({ e: 'telegraph', x: tx, z: tz, r: 3.6, t: T });
      }
      run.emit({ e: 'enemyFire', enemy: this.id, type: 'mortar', x: this.x, y: this.y + 1.7, z: this.z });
      this.anim = 'attack'; this.animT = 0;
      this.cooldown = run.rng.range(3.2, 4.4);
    }
  }
}
