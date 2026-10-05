// ECHO — one of THE HANDLER's mirror copies. Looks exactly like it. Shatters easily.
import { Enemy } from '../enemies/base';
import type { Run } from '../run';
import type { EnemySnap } from '../../shared/protocol';

export class Echo extends Enemy {
  shotT = 1.5;
  bob = 0;
  constructor(id: number, x: number, z: number, run: Run) {
    super(id, 'echo', x, z, false, run);
    this.maxHp = Math.round(this.def.hp * run.diff.hp * run.depthHp * Math.pow(1.3, Math.max(0, run.targets().length - 1)));
    this.hp = this.maxHp;
    this.aware = true;
    this.spawnT = 0.8;
    this.shotT = 1.2 + run.rng.range(0, 1.5);
    this.bob = run.rng.range(0, 6);
  }

  think(run: Run, dt: number) {
    this.vx = 0; this.vz = 0;
    this.bob += dt;
    const t = this.target ?? run.targets()[0];
    if (!t) { this.anim = 'idle'; return; }
    this.faceTo(t.x, t.z, dt, 3);
    this.shotT -= dt;
    this.tell = Math.max(0, 1 - this.shotT / 0.8);
    this.anim = this.shotT < 0.8 ? 'charge' : 'idle';
    if (this.shotT <= 0) {
      this.shotT = 2.4 + run.rng.range(0, 0.8);
      this.shootAt(run, t, 'hex', 13, 9, { oy: 3.9, accuracy: 0.6 });
    }
  }

  onDeath(run: Run) { run.emit({ e: 'explosion', x: this.x, y: 3.5, z: this.z, r: 4, kind: 'tesla' }); }

  snap(): EnemySnap {
    const s = super.snap();
    s.y = 0.5 + Math.sin(this.bob * 1.4) * 0.2;
    s.move = 'idle'; s.moveT = Math.round((this.bob % 10) * 10) / 100; s.v = 6; s.wy = this.def.headY;
    return s;
  }
}
