import { Enemy } from './base';
import type { Run } from '../run';
import type { ReplicaProfile } from '../../shared/protocol';

export const DEFAULT_PROFILE: ReplicaProfile = { favoriteWeapon: 'pulse', dashRate: 6, strafeBias: -0.4, aggression: 0.6, jumpRate: 8, accuracy: 0.5 };

/** Fights like a player — like *you*. Uses your favorite weapon, your strafe, your dash habit. No tells. No sound. */
export class Replica extends Enemy {
  profile: ReplicaProfile;
  dashT = 0;
  dashCd = 2;
  jumpT = 0;
  vy = 0;
  chargeT = 0;

  constructor(id: number, x: number, z: number, elite: boolean, run: Run, profile: ReplicaProfile | null) {
    super(id, 'replica', x, z, elite, run);
    this.profile = profile ?? DEFAULT_PROFILE;
    this.strafeDir = this.profile.strafeBias < 0 ? -1 : 1;
  }

  think(run: Run, dt: number) {
    const t = this.target;
    if (!this.aware || !t) { this.patrol(run, dt); return; }
    const p = this.profile;
    const d = this.distTo(t);
    this.faceTo(t.x, t.z, dt, 16);
    const w = p.favoriteWeapon;
    const want = w === 'ripper' ? 1.5 : w === 'breacher' ? 5 : w === 'lance' ? 16 : 10 - p.aggression * 5;

    // dash habit
    this.dashCd -= dt;
    if (this.dashCd <= 0) {
      this.dashCd = Math.max(0.6, 60 / Math.max(1, p.dashRate)) * run.rng.range(0.6, 1.3);
      this.dashT = 0.16;
      const px = -(t.z - this.z) / (d || 1), pz = (t.x - this.x) / (d || 1);
      const toward = d > want ? 1 : -0.3;
      const s = run.rng.chance(0.5 + p.strafeBias * 0.4) ? 1 : -1;
      this.vx = (px * s + ((t.x - this.x) / (d || 1)) * toward) * 22;
      this.vz = (pz * s + ((t.z - this.z) / (d || 1)) * toward) * 22;
    }
    if (this.dashT > 0) { this.dashT -= dt; this.applyVelocity(run, dt); }
    else {
      // strafe with bias like the player did
      this.strafeT -= dt;
      if (this.strafeT <= 0) { this.strafeT = run.rng.range(0.5, 1.4); this.strafeDir = run.rng.chance(0.5 + p.strafeBias * 0.45) ? -1 : 1; }
      const px = -(t.z - this.z) / (d || 1), pz = (t.x - this.x) / (d || 1);
      let mx = px * this.strafeDir, mz = pz * this.strafeDir;
      if (d > want + 2) { mx += (t.x - this.x) / d * 1.4; mz += (t.z - this.z) / d * 1.4; }
      else if (d < want - 2) { mx -= (t.x - this.x) / d; mz -= (t.z - this.z) / d; }
      if (!this.canSee(run, t) && d > 4) { const f = run.flowDir(this.x, this.z, t); mx = f.x; mz = f.z; }
      this.moveDir(run, mx, mz, this.def.speed, dt);
    }
    // bunny hops
    this.jumpT -= dt;
    if (this.jumpT <= 0 && this.y <= 0.01) { this.jumpT = 60 / Math.max(2, p.jumpRate) * run.rng.range(0.5, 1.5); this.vy = 7.5; }
    if (this.y > 0 || this.vy > 0) { this.vy -= 24 * dt; this.y = Math.max(0, this.y + this.vy * dt); if (this.y === 0) this.vy = 0; }

    this.cooldown -= dt;
    if (this.reactT > 0 || !this.canSee(run, t)) return;
    const acc = Math.min(0.72, 0.4 + p.accuracy * 0.4);
    switch (w) {
      case 'pulse':
        if (this.cooldown <= 0) { this.shootAt(run, t, 'replica', 55, 6, { accuracy: acc, lead: 0.8 }); this.cooldown = 0.16; this.anim = 'attack'; }
        break;
      case 'breacher':
        if (this.cooldown <= 0 && d < 14) {
          for (let i = 0; i < 6; i++) this.shootAt(run, t, 'replica', 45, 5, { accuracy: acc, spread: 0.08 });
          this.cooldown = 1.0; this.anim = 'attack';
        }
        break;
      case 'lance':
        if (this.cooldown <= 0) {
          this.chargeT += dt;
          if (this.chargeT > 0.8) { this.shootAt(run, t, 'replica', 90, 32, { accuracy: acc, lead: 1 }); this.chargeT = 0; this.cooldown = 1.6; this.anim = 'attack'; }
        }
        break;
      case 'ripper':
        if (this.cooldown <= 0 && d < 2.6) { this.meleeHit(run, t, 14, 2.4, 2); this.cooldown = 0.3; this.anim = 'attack'; }
        else if (this.cooldown <= 0 && d > 10) { this.shootAt(run, t, 'replica', 50, 6, { accuracy: acc }); this.cooldown = 0.5; }
        break;
    }
  }
}
