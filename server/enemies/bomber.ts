import { Enemy } from './base';
import type { Run } from '../run';

/** Suicide runner. Kill it early — near its friends. */
export class Bomber extends Enemy {
  fuse = -1;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 12);
    if (this.fuse >= 0) {
      this.fuse -= dt;
      this.tell = 1;
      this.anim = 'charge';
      this.vx *= 0.9; this.vz *= 0.9;
      this.applyVelocity(run, dt);
      if (this.fuse <= 0) this.detonate(run, null);
      return;
    }
    this.chase(run, t, this.def.speed * (d < 10 ? 1.25 : 1), dt);
    this.tell = d < 10 ? 0.4 : 0;
    if (d < 2.8 && this.reactT <= 0) {
      this.fuse = this.elite ? 0.45 : 0.65;
      run.emit({ e: 'enemyAlert', enemy: this.id, type: 'bomber' });
    }
  }

  /** Blows up. If a player set it off, the blast is theirs and only hurts robots. */
  detonate(run: Run, byPlayer: string | null) {
    if (this.exploded) return;
    this.exploded = true;
    const r = this.elite ? 5 : 4.2;
    if (byPlayer) run.explodeAt(this.x, 1, this.z, r, 70, byPlayer, 'kill');
    else {
      run.explodeAt(this.x, 1, this.z, r, 34 * this.dmgMult, null, 'rocket');
      // friendly fire on its own side
      for (const e of run.enemies.values()) if (e !== this && e.alive && Math.hypot(e.x - this.x, e.z - this.z) < r) run.damageEnemy(e, 40, '', false, e.x - this.x, 0.5, e.z - this.z, 'pulse');
      if (this.alive) { this.alive = false; this.hp = 0; run.emit({ e: 'kill', enemy: this.id, type: 'bomber', by: '', head: false, glory: false, x: this.x, y: 0.8, z: this.z, dx: 0, dy: 1, dz: 0, score: 0, combo: run.combo, elite: this.elite, weapon: 'pulse' }); }
    }
  }
  exploded = false;

  onDeath(run: Run, by: string) { if (!this.exploded) this.detonate(run, by || null); }
}
