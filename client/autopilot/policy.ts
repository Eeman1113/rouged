// Autopilot progression policy: which pedestal, what to buy, which door, extract or go deeper.

import type { DoorKind, Mutator, Rarity, RoomKind, ShopItem } from '../../shared/protocol';
import { POWERUP_BY_ID, SYNERGIES } from '../../shared/powerupDefs';

/** how much the AI's playstyle (PULSE headshots + BREACHER close, dashes, glory kills) values each powerup */
const VALUE: Record<string, number> = {
  overload: 8, piercer: 6, ricochet: 6, deadeye: 9, pulse_amp: 9, splitter: 5, overcharge: 4, chainsaw: 1,
  airdash: 6, dashtrail: 3, doublejump: 2, wallrun: 1, slideblade: 1.5, fleet: 6, shockdash: 3,
  vitality: 9, lifesteal: 8, streakshield: 6, scavenge: 3, thorns: 3, magnet: 4, bloodrush: 4,
  detonate: 6, cryo: 6, immolate: 5, chain: 5, vampire: 8,
  curse_glass: -6, curse_starve: -3, curse_frenzy: -2, curse_naked: -1,
  tesla: 14, martyr: 2, executioner: 13, ghost: 11, overclock: 15, reaper: 13, phoenix: 16, hydra: 18,
};
const RARITY_MULT: Record<Rarity, number> = { common: 1, rare: 1.7, epic: 2.6, legendary: 1.6 };

export function powerupValue(id: string, rarity: Rarity, owned: string[], level: number, roomIndex: number): number {
  const def = POWERUP_BY_ID[id];
  let v = VALUE[id] ?? 3;
  if (def?.category === 'curse') {
    // curses: only when strong, deep, and the payoff synergises
    v = roomIndex >= 12 && level >= 12 ? v * 0.4 + 2 : v - 4;
  } else v *= RARITY_MULT[rarity];
  if (id === 'overcharge' && level < 3) v = 0.5; // no LANCE yet
  if (id === 'chainsaw' && level < 5) v = 0.2;
  // stacking passives still good, but diminishing
  const dupes = owned.filter((o) => o === id).length;
  v *= Math.pow(0.8, dupes);
  // synergy hunting: progress toward hidden combos
  const have = new Set(owned);
  for (const s of SYNERGIES) {
    const groups = s.requires;
    const hit = groups.some((g) => g.includes(id));
    if (!hit) continue;
    const before = groups.filter((g) => g.some((x) => have.has(x))).length;
    have.add(id);
    const after = groups.filter((g) => g.some((x) => have.has(x))).length;
    have.delete(id);
    if (after > before) v += after === groups.length ? 9 : after === groups.length - 1 ? 3 : 0.8;
  }
  return v;
}

export function choosePedestal<T extends { slot: number; offer: { id: string; rarity: Rarity } }>(peds: T[], owned: string[], level: number, roomIndex: number): T | null {
  let best: T | null = null, bv = -Infinity;
  for (const p of peds) {
    const v = powerupValue(p.offer.id, p.offer.rarity, owned, level, roomIndex);
    if (v > bv) { bv = v; best = p; }
  }
  return best;
}

/** next thing to buy, or null. hp/maxHp/armor inform healing priority. */
export function chooseBuy(items: ShopItem[], scrap: number, hp: number, maxHp: number, armor: number, owned: string[], level: number, roomIndex: number): ShopItem | null {
  const avail = items.filter((i) => !i.sold && i.price <= scrap);
  if (!avail.length) return null;
  const heal = avail.find((i) => i.kind === 'heal');
  if (heal && hp < maxHp - 35) return heal;
  let best: ShopItem | null = null, bv = 0;
  for (const it of avail) {
    if (it.kind !== 'powerup' || !it.offer) continue;
    const v = powerupValue(it.offer.id, it.offer.rarity, owned, level, roomIndex);
    if (v < 5) continue;
    const score = v - it.price / 40;
    if (score > bv) { bv = score; best = it; }
  }
  if (best) return best;
  if (heal && hp < maxHp - 15) return heal;
  const arm = avail.find((i) => i.kind === 'armor');
  if (arm && armor < 50) return arm;
  return null;
}

export interface DoorOption { slot: number; kind: DoorKind; nextKind: RoomKind; mutator?: Mutator }

/** Score every open door for the current situation; higher is better. */
export function scoreDoor(d: DoorOption, ctx: { hpFrac: number; scrap: number; depth: number; level: number; armor: number; rng: number; extractAt: number }): number {
  const { hpFrac, scrap, depth } = ctx;
  let s = 0;
  switch (d.kind) {
    case 'extract': {
      // walk out when the run is spent; otherwise keep descending for the show
      // (and the attract mode banks a run now and then: each run picks how deep it means to go)
      const need = depth >= 30 ? 0.85 : depth >= 25 ? 0.72 : depth >= 20 ? 0.55 : 0.4;
      s = hpFrac < need || depth >= ctx.extractAt ? 50 : -20;
      break;
    }
    case 'shop': s = scrap >= 140 ? 14 : scrap >= 60 ? (hpFrac < 0.7 ? 16 : 7) : scrap >= 30 && hpFrac < 0.5 ? 9 : -4; break;
    case 'sanctuary': s = hpFrac < 0.45 ? 22 : hpFrac < 0.7 ? 12 : ctx.armor < 40 ? 3 : 1; break;
    case 'memory': s = hpFrac > 0.6 ? 9 : hpFrac < 0.4 ? 8 : 5; break; // three rare pedestals + a heal (maybe an ambush)
    case 'elite': s = hpFrac > 0.75 ? 8 : hpFrac > 0.55 ? 2 : -8; break;
    case 'unknown': s = hpFrac > 0.55 ? 6 : 1; break;
    case 'trial': s = hpFrac > 0.8 && depth >= 4 ? 9 : hpFrac > 0.65 ? 3 : -6; break;
    case 'corrupted': s = depth < 11 ? (hpFrac > 0.35 ? 7 : 4) : hpFrac > 0.7 ? 3 : -3; break;
    default: s = 4;
  }
  switch (d.nextKind) {
    case 'arena': s += hpFrac > 0.6 ? 0.5 : -3; break;
    case 'gauntlet': s += hpFrac > 0.6 ? 0 : -2.5; break;
    case 'boss': s += 0; break;
    default: break;
  }
  if (d.mutator === 'bloodmoon') s += hpFrac > 0.8 ? 1 : -5;
  else if (d.mutator === 'overclock') s -= 1.5;
  else if (d.mutator === 'swarm') s -= 0.5;
  else if (d.mutator === 'lowgrav') s -= 1;
  return s + ctx.rng * 2.5; // a little variety between runs
}
