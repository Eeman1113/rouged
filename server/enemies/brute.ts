import { Enemy } from './base';
import type { Run } from '../run';

/** Tank. Slow walk, wind-up charge, devastating melee. */
export class Brute extends Enemy {
  mode: 'walk' | 'windup' | 'charge' | 'swing' | 'recover' = 'walk';
  modeT = 0;
  cdx = 0; cdz = 0;
  hitDuringCharge = new Set<string>();
  stompT = 0;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const d = this.distTo(t);
    this.modeT -= dt;
    switch (this.mode) {
      case 'walk': {
        this.faceTo(t.x, t.z, dt, 6);
        this.chase(run, t, this.def.speed, dt);
        this.stompT -= dt;
        if (this.stompT <= 0) { this.stompT = 0.55; }
        this.cooldown -= dt;
        if (this.reactT > 0) break;
        if (d < 3.2) { this.mode = 'swing'; this.modeT = 0.45; this.tell = 0.6; this.anim = 'attack'; }
        else if (this.cooldown <= 0 && d > 5 && d < 22 && this.canSee(run, t)) {
          this.mode = 'windup'; this.modeT = this.elite ? 0.55 : 0.75; this.anim = 'charge';
          run.emit({ e: 'enemyAlert', enemy: this.id, type: 'brute' });
        }
        break;
      }
      case 'windup': {
        this.faceTo(t.x, t.z, dt, 12);
        this.vx = 0; this.vz = 0;
        this.tell = 1 - Math.max(0, this.modeT) / 0.75;
        this.anim = 'charge';
        if (this.modeT <= 0) {
          const l = d || 1;
          this.cdx = (t.x - this.x) / l; this.cdz = (t.z - this.z) / l;
          this.mode = 'charge'; this.modeT = 1.3; this.hitDuringCharge.clear();
        }
        break;
      }
      case 'charge': {
        this.tell = 1;
        this.anim = 'charge';
        const sp = 15 * this.speedMult;
        this.vx = this.cdx * sp; this.vz = this.cdz * sp;
        const bx = this.x, bz = this.z;
        this.applyVelocity(run, dt);
        for (const p of run.targets()) {
          if (this.hitDuringCharge.has(p.id)) continue;
          if (Math.hypot(p.x - this.x, p.z - this.z) < this.def.radius + 0.8 && Math.abs(p.y - this.y) < 2) {
            this.hitDuringCharge.add(p.id);
            run.damagePlayer(p, 30 * this.dmgMult, this.x, this.y + 1.5, this.z, true, this, { x: this.cdx * 16, y: 6, z: this.cdz * 16 });
          }
        }
        const moved = Math.hypot(this.x - bx, this.z - bz);
        if (this.modeT <= 0 || moved < sp * dt * 0.3) {
          if (moved < sp * dt * 0.3) run.emit({ e: 'explosion', x: this.x + this.cdx, y: 1.5, z: this.z + this.cdz, r: 1.5, kind: 'mine' });
          this.mode = 'recover'; this.modeT = 0.9; this.tell = 0; this.cooldown = run.rng.range(3, 5);
        }
        break;
      }
      case 'swing': {
        this.faceTo(t.x, t.z, dt, 8);
        this.vx = 0; this.vz = 0;
        this.anim = 'attack';
        if (this.modeT <= 0) {
          this.meleeHit(run, t, 25, 2.6, 10);
          this.mode = 'recover'; this.modeT = 0.6; this.tell = 0;
        }
        break;
      }
      case 'recover': {
        this.vx *= 0.85; this.vz *= 0.85;
        this.anim = 'idle';
        if (this.modeT <= 0) this.mode = 'walk';
        break;
      }
    }
  }
}
