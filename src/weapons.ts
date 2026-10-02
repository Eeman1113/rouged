// Weapons: PULSE / BREACHER / LANCE / RIPPER — state, cooldowns, ammo, charge.
import * as C from './constants';
import { PowerupState } from './powerups';

export interface WeaponDef {
  name: string;
  slot: number;
  auto: boolean;
  rpm: number;
  dmg: number;
  pellets: number;
  spread: number; // radians
  range: number;
  unlockLevel: number;
}

export const WEAPONS: WeaponDef[] = [
  { name: 'PULSE', slot: 1, auto: true, rpm: C.PULSE_RPM, dmg: C.PULSE_DMG, pellets: 1, spread: 0.012, range: 60, unlockLevel: 1 },
  { name: 'BREACHER', slot: 2, auto: false, rpm: C.BREACHER_RPM, dmg: C.BREACHER_DMG, pellets: C.BREACHER_PELLETS, spread: 0.09, range: 18, unlockLevel: 1 },
  { name: 'LANCE', slot: 3, auto: false, rpm: 0, dmg: C.LANCE_MIN_DMG, pellets: 1, spread: 0, range: 80, unlockLevel: 3 },
  { name: 'RIPPER', slot: 4, auto: true, rpm: 600, dmg: C.RIPPER_DPS / 10, pellets: 1, spread: 0.02, range: C.RIPPER_RANGE, unlockLevel: 5 },
];

export class WeaponSystem {
  current = 0;
  cooldown = 0;
  ammo = [C.MAX_AMMO, 40, 60, Infinity]; // per weapon
  lanceCharge = 0;
  lanceCharging = false;
  overclockT = 0;
  firing = false;
  playerLevel = 1;

  fireRateMult(pw: PowerupState): number {
    let m = 1 + pw.count('fire_rate') * 0.15;
    if (this.overclockT > 0) m *= 2;
    return m;
  }

  switchTo(idx: number): boolean {
    if (idx === this.current) return false;
    if (WEAPONS[idx].unlockLevel > this.playerLevel) return false;
    this.current = idx;
    this.cooldown = Math.max(this.cooldown, 0.08);
    this.lanceCharging = false;
    this.lanceCharge = 0;
    return true;
  }

  unlockedWeapons(): WeaponDef[] {
    return WEAPONS.filter(w => w.unlockLevel <= this.playerLevel);
  }

  update(dt: number, wantFire: boolean, pw: PowerupState) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.overclockT > 0) this.overclockT -= dt;
    // ammo regen — faster on Fabricator
    const regen = 6 * (pw.has('ammo_regen') ? 1.5 : 1) * dt;
    this.ammo[0] = Math.min(C.MAX_AMMO, this.ammo[0] + regen);
    this.ammo[1] = Math.min(40, this.ammo[1] + regen * 0.4);
    this.ammo[2] = Math.min(60, this.ammo[2] + regen * 0.5);

    const w = WEAPONS[this.current];
    this.firing = false;
    if (this.current === 2) {
      // LANCE charge
      if (wantFire && this.ammo[2] >= 5) {
        this.lanceCharging = true;
        this.lanceCharge = Math.min(1, this.lanceCharge + dt / C.LANCE_CHARGE_TIME);
      } else if (this.lanceCharging && !wantFire) {
        // release — fire happens in game (we set a flag via consumeLance)
      }
    } else if (this.current === 3) {
      this.firing = wantFire;
    }
  }

  canFire(): boolean {
    if (this.cooldown > 0) return false;
    if (this.current === 3) return true;
    return this.ammo[this.current] >= 1;
  }

  onFired(pw: PowerupState) {
    const w = WEAPONS[this.current];
    if (this.current !== 3) this.ammo[this.current] = Math.max(0, this.ammo[this.current] - 1);
    this.cooldown = 60 / (w.rpm * this.fireRateMult(pw));
    this.firing = true;
  }

  lanceDamage(): number {
    return C.LANCE_MIN_DMG + (C.LANCE_MAX_DMG - C.LANCE_MIN_DMG) * this.lanceCharge;
  }

  consumeLance() {
    this.ammo[2] = Math.max(0, this.ammo[2] - 5);
    this.lanceCharging = false;
    this.lanceCharge = 0;
    this.cooldown = 0.35;
  }

  onKillAmmoBonus() {
    // ammo regenerates faster on kill
    this.ammo[0] = Math.min(C.MAX_AMMO, this.ammo[0] + 6);
    this.ammo[1] = Math.min(40, this.ammo[1] + 2);
    this.ammo[2] = Math.min(60, this.ammo[2] + 3);
  }

  triggerOverclock() { this.overclockT = 3; }

  ammoText(): string {
    if (this.current === 3) return '∞';
    if (this.current === 2) return `${Math.floor(this.ammo[2])} ⚡`;
    return `${Math.floor(this.ammo[this.current])}`;
  }
}
