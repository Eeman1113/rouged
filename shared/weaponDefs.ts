import type { WeaponId } from './protocol';
import * as C from './constants';

export interface WeaponDef {
  id: WeaponId;
  slot: number;
  name: string;
  kind: 'hitscan' | 'shotgun' | 'charge' | 'melee';
  damage: number; // per bullet / pellet / per second (melee) / min charge
  maxDamage?: number;
  interval: number; // s between shots
  pellets: number;
  spread: number; // radians (cone half-angle at full spray)
  firstShotSpread: number;
  range: number;
  ammoCost: number; // fraction of the magazine per shot
  unlockLevel: number;
  knockback: number;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pulse: {
    id: 'pulse', slot: 1, name: 'PULSE', kind: 'hitscan',
    damage: C.PULSE_DMG, interval: 60 / C.PULSE_RPM, pellets: 1,
    spread: 0.035, firstShotSpread: 0, range: 120, ammoCost: 1 / 60, unlockLevel: 1, knockback: 0.4,
  },
  breacher: {
    id: 'breacher', slot: 2, name: 'BREACHER', kind: 'shotgun',
    damage: C.BREACHER_DMG, interval: 60 / C.BREACHER_RPM, pellets: C.BREACHER_PELLETS,
    spread: 0.075, firstShotSpread: 0.075, range: 40, ammoCost: 1 / 14, unlockLevel: 1, knockback: 6,
  },
  lance: {
    id: 'lance', slot: 3, name: 'LANCE', kind: 'charge',
    damage: C.LANCE_MIN_DMG, maxDamage: C.LANCE_MAX_DMG, interval: 0.35, pellets: 1,
    spread: 0, firstShotSpread: 0, range: 150, ammoCost: 1 / 10, unlockLevel: 3, knockback: 3,
  },
  ripper: {
    id: 'ripper', slot: 4, name: 'RIPPER', kind: 'melee',
    damage: C.RIPPER_DPS, interval: 0.1, pellets: 1,
    spread: 0, firstShotSpread: 0, range: C.RIPPER_RANGE, ammoCost: 0, unlockLevel: 5, knockback: 0,
  },
};

export const WEAPON_ORDER: WeaponId[] = ['pulse', 'breacher', 'lance', 'ripper'];
