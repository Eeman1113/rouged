import { Enemy } from './base';
import type { Run } from '../run';

/** Stationary turret behind a frontal energy shield. Flank it. */
export class Sentinel extends Enemy {
  spin = 0;
  burst = 0;
  burstT = 0;

  think(run: Run, dt: number) {
    this.vx = 0; this.vz = 0;
    const t = this.target;
    if (!this.aware || !t) { this.yaw += dt * 0.4; this.anim = 'idle'; return; }
    // slow traverse: you can outrun its turn rate
    this.turnTo(t.x, t.z, dt, 1.15 * this.speedMultTurn(run));
    const want = Math.atan2(-(t.x - this.x), -(t.z - this.z));
    let off = want - this.yaw; while (off > Math.PI) off -= Math.PI * 2; while (off < -Math.PI) off += Math.PI * 2;
    if (this.burst > 0) {
      this.burstT -= dt;
      this.anim = 'attack';
      if (this.burstT <= 0) {
        if (this.canSee(run, t) && Math.abs(off) < 0.5) this.shootAt(run, t, 'bolt', 34, 6, { lead: 0.7 });
        this.burst--; this.burstT = 0.09;
        if (this.burst === 0) this.cooldown = run.rng.range(1.6, 2.4);
      }
      return;
    }
    this.cooldown -= dt;
    if (this.cooldown <= 0 && this.reactT <= 0 && Math.abs(off) < 0.35 && this.canSee(run, t)) {
      this.spin += dt;
      this.tell = Math.min(1, this.spin / 0.6);
      this.anim = 'charge';
      if (this.spin >= 0.6) { this.spin = 0; this.tell = 0; this.burst = this.elite ? 9 : 6; this.burstT = 0; }
    } else { this.spin = Math.max(0, this.spin - dt); this.tell = this.spin / 0.6; this.anim = 'idle'; }
  }

  speedMultTurn(run: Run) { return run.mutator === 'overclock' ? 1.4 : 1; }

  turnTo(x: number, z: number, dt: number, rate: number) {
    const want = Math.atan2(-(x - this.x), -(z - this.z));
    let d = want - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += Math.max(-rate * dt, Math.min(rate * dt, d));
  }

  modifyDamage(run: Run, dmg: number, dx: number, dz: number, head: boolean): number {
    void head;
    if (this.frontal(dx, dz)) { run.shieldHit(this); return dmg * 0.1; }
    return dmg * 1.25; // exposed back: bonus
  }
}
