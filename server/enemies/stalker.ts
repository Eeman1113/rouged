import { Enemy } from './base';
import type { Run } from '../run';
import { hasLOS, navBlockedAt } from '../../shared/mapData';

/** Sniper. Cloaks while repositioning, decloaks to paint you with a laser, then one big shot. */
export class Stalker extends Enemy {
  mode: 'reposition' | 'aim' | 'recover' = 'reposition';
  modeT = 1.5;
  destX = 0; destZ = 0;

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.cloak = Math.min(0.85, this.cloak + dt); this.patrol(run, dt); return; }
    this.modeT -= dt;
    switch (this.mode) {
      case 'reposition': {
        this.aiming = false;
        this.tell = 0;
        this.cloak = Math.min(0.88, this.cloak + dt * 2);
        const dx = this.destX - this.x, dz = this.destZ - this.z;
        if (Math.hypot(dx, dz) > 0.7 && (this.destX || this.destZ)) this.moveDir(run, dx, dz, this.def.speed, dt);
        else { this.vx = 0; this.vz = 0; this.anim = 'idle'; }
        this.faceTo(t.x, t.z, dt, 6);
        if (this.modeT <= 0 && this.reactT <= 0) {
          if (this.canSee(run, t) && this.distTo(t) < 40) {
            this.mode = 'aim'; this.modeT = this.elite ? 0.9 : 1.25;
            this.lastAimX = t.x; this.lastAimY = t.y + 1.2; this.lastAimZ = t.z;
            run.emit({ e: 'enemyAlert', enemy: this.id, type: 'stalker' });
          } else { this.pickSpot(run); this.modeT = 1.2; }
        }
        break;
      }
      case 'aim': {
        this.cloak = Math.max(0, this.cloak - dt * 4);
        this.vx = 0; this.vz = 0;
        this.anim = 'charge';
        this.aiming = true;
        // laser tracks with lag — moving players dodge
        const k = Math.min(1, dt * 2.8);
        this.lastAimX += (t.x - this.lastAimX) * k;
        this.lastAimY += (t.y + 1.2 - this.lastAimY) * k;
        this.lastAimZ += (t.z - this.lastAimZ) * k;
        this.faceTo(t.x, t.z, dt, 8);
        this.tell = 1 - Math.max(0, this.modeT) / 1.25;
        if (this.modeT <= 0) {
          this.fire(run);
          this.mode = 'recover'; this.modeT = 0.5; this.aiming = false; this.tell = 0; this.anim = 'attack'; this.animT = 0;
        }
        break;
      }
      case 'recover': {
        if (this.modeT <= 0) { this.mode = 'reposition'; this.modeT = run.rng.range(1.6, 2.8); this.pickSpot(run); }
        break;
      }
    }
  }

  fire(run: Run) {
    const ox = this.x, oy = this.y + this.def.headY, oz = this.z;
    run.emit({ e: 'enemyFire', enemy: this.id, type: 'stalker', x: ox, y: oy, z: oz });
    // hitscan along the laser: whoever is near the aim point and visible gets hit
    for (const p of run.targets()) {
      const dx = p.x - this.lastAimX, dz = p.z - this.lastAimZ, dy = (p.y + 1.1) - this.lastAimY;
      if (Math.hypot(dx, dz) < 0.75 && Math.abs(dy) < 1.2 && hasLOS(run.solids, ox, oy, oz, p.x, p.y + 1.2, p.z)) {
        run.damagePlayer(p, 42 * this.dmgMult, ox, oy, oz, false, this);
      }
    }
  }

  pickSpot(run: Run) {
    const t = this.target;
    for (let i = 0; i < 10; i++) {
      const a = run.rng.range(0, Math.PI * 2), r = run.rng.range(5, 12);
      const x = this.x + Math.cos(a) * r, z = this.z + Math.sin(a) * r;
      if (navBlockedAt(run.geo.nav, x, z)) continue;
      if (t && hasLOS(run.solids, x, 1.7, z, t.x, t.y + 1.4, t.z) && Math.hypot(t.x - x, t.z - z) > 10) { this.destX = x; this.destZ = z; return; }
    }
    this.destX = this.x; this.destZ = this.z;
  }

  onDamaged(run: Run, by: Parameters<Enemy['onDamaged']>[1]) {
    super.onDamaged(run, by);
    this.cloak = 0;
    if (this.mode === 'aim' && run.rng.chance(0.35)) { this.mode = 'reposition'; this.modeT = 0.8; this.aiming = false; this.pickSpot(run); }
  }
}
