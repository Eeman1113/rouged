import type { Pedestal, Rarity } from '../shared/protocol';
import { POWERUPS, POWERUP_BY_ID, RARITY_ORDER, SYNERGIES, activeSynergies, PowerupDef } from '../shared/powerupDefs';
import * as C from '../shared/constants';
import type { Rng } from '../shared/rng';
import type { SimPlayer } from './player';

const UNIQUE = new Set(['doublejump', 'wallrun', 'curse_glass', 'curse_starve', 'curse_frenzy', 'curse_naked', 'tesla', 'martyr', 'executioner', 'ghost', 'overclock', 'chain', 'cryo']);

/** The rarity roll — the slot machine. */
export function rollRarity(rng: Rng, player: SimPlayer, roomIndex: number, minRarity: Rarity = 'common'): Rarity {
  const r = rng.next();
  let rarity: Rarity;
  if (r < C.RARITY_LEGENDARY_RATE) rarity = 'legendary';
  else if (r < C.RARITY_LEGENDARY_RATE + C.RARITY_EPIC_RATE) rarity = 'epic';
  else if (r < C.RARITY_LEGENDARY_RATE + C.RARITY_EPIC_RATE + C.RARITY_RARE_RATE) rarity = 'rare';
  else rarity = 'common';
  let idx = RARITY_ORDER.indexOf(rarity) + player.mods.lootBonus;
  idx = Math.max(idx, RARITY_ORDER.indexOf(minRarity));
  // pity: no rare+ in PITY_TIMER reward rooms → guarantee one
  if (player.pityCount >= C.PITY_TIMER) idx = Math.max(idx, 1);
  idx = Math.min(3, idx);
  if (idx === 3 && roomIndex < C.LEGENDARY_MIN_ROOM) idx = 2;
  return RARITY_ORDER[idx];
}

function eligible(def: PowerupDef, player: SimPlayer, roomIndex: number): boolean {
  if (def.category === 'legendary') return false; // legendaries come from the rarity roll
  if (def.category === 'curse' && roomIndex < C.CURSE_MIN_ROOM) return false;
  if (UNIQUE.has(def.id) && player.powerups.some((p) => p.id === def.id)) return false;
  if (player.lastOffer.includes(def.id)) return false; // never offer the same powerup twice in a row
  return true;
}

/** Weight items that would complete a partially-built synergy (6+ powerups → strong bias). */
function synergyWeight(def: PowerupDef, player: SimPlayer): number {
  const owned = new Set(player.powerups.map((p) => p.id));
  let w = 1;
  for (const s of SYNERGIES) {
    if (player.synergies.includes(s.id)) continue;
    const groups = s.requires;
    const have = groups.filter((g) => g.some((id) => owned.has(id))).length;
    const fills = groups.some((g) => !g.some((id) => owned.has(id)) && g.includes(def.id));
    if (fills && have >= 1) w += player.powerups.length >= 6 ? 3 : 0.6 * have;
  }
  return w;
}

export function makeOffers(rng: Rng, player: SimPlayer, roomIndex: number, count: number, minRarity: Rarity = 'common'): Pedestal[] {
  const offers: Pedestal[] = [];
  const chosen = new Set<string>();
  let curseUsed = false;
  let rarePlus = false;
  for (let slot = 0; slot < count; slot++) {
    const rarity = rollRarity(rng, player, roomIndex, minRarity);
    let id: string | null = null;
    if (rarity === 'legendary') {
      const pool = POWERUPS.filter((p) => p.category === 'legendary' && !chosen.has(p.id) && !player.powerups.some((o) => o.id === p.id));
      if (pool.length) id = rng.pick(pool).id;
    }
    if (!id) {
      let pool = POWERUPS.filter((p) => eligible(p, player, roomIndex) && !chosen.has(p.id));
      if (curseUsed || !rng.chance(0.22)) pool = pool.filter((p) => p.category !== 'curse');
      if (!pool.length) pool = POWERUPS.filter((p) => p.category !== 'legendary' && p.category !== 'curse' && !chosen.has(p.id));
      const weights = pool.map((p) => synergyWeight(p, player));
      id = rng.weighted(pool, weights).id;
    }
    const def = POWERUP_BY_ID[id];
    if (def.category === 'curse') curseUsed = true;
    const r: Rarity = def.category === 'legendary' ? 'legendary' : rarity === 'legendary' ? 'epic' : rarity;
    if (r !== 'common') rarePlus = true;
    chosen.add(id);
    offers.push({ slot, x: 0, z: 0, offer: { id, rarity: r } });
  }
  player.pityCount = rarePlus ? 0 : player.pityCount + 1;
  player.lastOffer = offers.map((o) => o.offer.id);
  return offers;
}

/** Apply a pick. Returns newly discovered synergy ids. */
export function applyPick(player: SimPlayer, id: string, rarity: Rarity): string[] {
  player.powerups.push({ id, rarity });
  const before = new Set(player.synergies);
  const now = activeSynergies(player.powerups.map((p) => p.id));
  player.synergies = now;
  player.recompute();
  return now.filter((s) => !before.has(s));
}
