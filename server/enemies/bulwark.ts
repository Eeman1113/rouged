import { Enemy } from './base';
import type { Run } from '../run';

/** Tower shield. Impervious from the front — except the head over the rim. */
export class Bulwark extends Enemy {
  mode: 'advance' | 'bash' | 'fire' = 'advance';
  modeT = 0;
  shots = 0;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.modeT -= dt;
    // shield tracks you, but not instantly
    const want = Math.atan2(-(t.x - this.x), -(t.z - this.z));
    let off = want - this.yaw; while (off > Math.PI) off -= Math.PI * 2; while (off < -Math.PI) off += Math.PI * 2;
    this.yaw += Math.max(-2.2 * dt, Math.min(2.2 * dt, off));
    switch (this.mode) {
      case 'advance':
        this.chase(run, t, this.def.speed, dt, 1.8);
        this.cooldown -= dt;
        if (this.reactT > 0) break;
        if (d < 3) { this.mode = 'bash'; this.modeT = 0.5; this.tell = 0.8; }
        else if (this.cooldown <= 0 && this.canSee(run, t)) { this.mode = 'fire'; this.modeT = 0.9; this.shots = 3; }
        break;
      case 'bash':
        this.vx = 0; this.vz = 0; this.anim = 'charge';
        if (this.modeT <= 0) {
          this.meleeHit(run, t, 22, 2.8, 15);
          this.anim = 'attack'; this.tell = 0; this.mode = 'advance'; this.cooldown = 1.2;
        }
        break;
      case 'fire':
        this.vx = 0; this.vz = 0; this.anim = 'attack';
        if (this.modeT < 0.6 && this.shots > 0 && this.modeT < 0.6 - (3 - this.shots) * 0.18) { this.shootAt(run, t, 'plasma', 24, 9); this.shots--; }
        if (this.modeT <= 0) { this.mode = 'advance'; this.cooldown = run.rng.range(2.5, 4); }
        break;
    }
  }

  modifyDamage(run: Run, dmg: number, dx: number, dz: number, head: boolean): number {
    if (head) return dmg;
    if (this.frontal(dx, dz)) { run.shieldHit(this); return dmg * 0.05; }
    return dmg * 1.3;
  }
}
