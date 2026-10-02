// Powerup system — rarity rolls, categories, curses, legendaries, hidden synergies.
import { RNG } from './rng';
import * as C from './constants';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Category = 'weapon' | 'movement' | 'passive' | 'onkill' | 'curse' | 'legendary';

export interface PowerupDef {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  category: Category;
  tags: string[]; // used for synergy matching
}

export const POWERUPS: PowerupDef[] = [
  // weapon mods
  { id: 'fire_rate', name: 'RAPID CYCLER', desc: '+15% fire rate', rarity: 'common', category: 'weapon', tags: [] },
  { id: 'pierce', name: 'LANCE ROUNDS', desc: 'Bullets pierce 1 additional enemy', rarity: 'rare', category: 'weapon', tags: [] },
  { id: 'ricochet', name: 'REBOUND', desc: 'Bullets ricochet to a nearby enemy', rarity: 'epic', category: 'weapon', tags: [] },
  { id: 'headhunter', name: 'HEADHUNTER', desc: '+20% headshot damage', rarity: 'common', category: 'weapon', tags: [] },
  { id: 'kill_explode', name: 'VOLATILE CORES', desc: 'Killed enemies explode for 30 area damage', rarity: 'rare', category: 'onkill', tags: ['kill_explosion'] },
  // movement
  { id: 'dash_charge', name: 'SPLIT SERVO', desc: '+1 dash charge', rarity: 'rare', category: 'movement', tags: ['dash'] },
  { id: 'dash_trail', name: 'BURNOUT', desc: 'Dash leaves a fire trail', rarity: 'epic', category: 'movement', tags: ['dash', 'dash_trail'] },
  { id: 'double_jump', name: 'AIRFRAME', desc: 'Double jump', rarity: 'rare', category: 'movement', tags: ['air_dash'] },
  { id: 'slide_damage', name: 'GRIND PLATES', desc: 'Sliding deals damage to enemies you touch', rarity: 'common', category: 'movement', tags: [] },
  { id: 'speed', name: 'OVERDRIVE LEGS', desc: '+12% move speed', rarity: 'common', category: 'movement', tags: [] },
  // passive
  { id: 'max_hp', name: 'REINFORCED CHASSIS', desc: '+20 max integrity', rarity: 'common', category: 'passive', tags: [] },
  { id: 'lifesteal', name: 'HEMODYNAMICS', desc: 'Heal 2% of damage dealt', rarity: 'rare', category: 'passive', tags: ['lifesteal'] },
  { id: 'streak_shield', name: 'STREAK PLATING', desc: 'Kill streaks grant temporary shield', rarity: 'epic', category: 'passive', tags: [] },
  { id: 'ammo_regen', name: 'FABRICATOR', desc: 'Ammo regenerates 50% faster', rarity: 'common', category: 'passive', tags: ['ammo_regen'] },
  { id: 'thorns', name: 'RETALIATION MESH', desc: 'Reflect 10% of melee damage taken', rarity: 'rare', category: 'passive', tags: ['thorns'] },
  // on-kill
  { id: 'kill_freeze', name: 'CRYO CORES', desc: 'Killed enemies freeze nearby hostiles', rarity: 'rare', category: 'onkill', tags: [] },
  { id: 'kill_ignite', name: 'INCENDIARY CORES', desc: 'Killed enemies ignite nearby hostiles', rarity: 'rare', category: 'onkill', tags: [] },
  { id: 'kill_mark', name: 'HUNTER\'S LATTICE', desc: 'Kills mark nearby enemies — visible through walls', rarity: 'epic', category: 'onkill', tags: ['chain', 'mark'] },
  // curses
  { id: 'curse_glass', name: 'GLASS PROTOCOL', desc: '+100% damage, −50% max integrity', rarity: 'epic', category: 'curse', tags: ['curse', 'curse_damage'] },
  { id: 'curse_blood', name: 'BLOOD TITHE', desc: 'No health pickups, +50% glory kill healing', rarity: 'epic', category: 'curse', tags: ['curse'] },
  { id: 'curse_speed', name: 'HOSTILE OVERCLOCK', desc: 'Enemies +30% speed, loot rarity improves one tier', rarity: 'epic', category: 'curse', tags: ['curse'] },
  { id: 'curse_dash', name: 'EXPOSED REACTOR', desc: 'No armor possible, +2 dash charges', rarity: 'epic', category: 'curse', tags: ['curse', 'dash'] },
  // legendaries
  { id: 'leg_tesla', name: 'TESLA PROTOCOL', desc: 'LEGENDARY — Lightning arcs between marked enemies', rarity: 'legendary', category: 'legendary', tags: ['chain', 'overload'] },
  { id: 'leg_martyr', name: 'MARTYR ENGINE', desc: 'LEGENDARY — Damage you take heals the sim around you', rarity: 'legendary', category: 'legendary', tags: ['martyr'] },
  { id: 'leg_executioner', name: 'EXECUTIONER', desc: 'LEGENDARY — Every 5th kill is an instant glory kill from any range', rarity: 'legendary', category: 'legendary', tags: [] },
  { id: 'leg_ghost', name: 'GHOST', desc: 'LEGENDARY — Invisible for 1s after every kill', rarity: 'legendary', category: 'legendary', tags: ['ghost'] },
  { id: 'leg_overclock', name: 'OVERCLOCK', desc: 'LEGENDARY — Fire rate doubles for 3s after each kill', rarity: 'legendary', category: 'legendary', tags: ['overload'] },
];

export interface SynergyDef { name: string; needs: string[]; desc: string; }
export const SYNERGIES: SynergyDef[] = [
  { name: 'TESLA PROTOCOL', needs: ['chain', 'overload', 'mark'], desc: 'Lightning arcs between all marked enemies' },
  { name: 'MARTYR ENGINE', needs: ['lifesteal', 'thorns', 'curse'], desc: 'Damage taken partially heals you through defiance' },
  { name: 'GLASS CANNON', needs: ['curse_damage', 'lifesteal'], desc: 'Massive damage, heal from kills only' },
  { name: 'BLINK', needs: ['air_dash', 'dash_trail', 'ghost'], desc: 'Teleport-dash with no cooldown' },
  { name: 'SCAVENGER', needs: ['ammo_regen', 'kill_explosion', 'lifesteal'], desc: 'Every kill drops ammo + integrity' },
];

export class PowerupState {
  owned: PowerupDef[] = [];
  tags = new Set<string>();
  foundSynergies = new Set<string>();
  pityCounter = 0;
  lastOffered = '';

  has(id: string) { return this.owned.some(p => p.id === id); }
  hasTag(tag: string) { return this.tags.has(tag); }
  count(id: string) { return this.owned.filter(p => p.id === id).length; }

  add(p: PowerupDef): SynergyDef | null {
    this.owned.push(p);
    for (const t of p.tags) this.tags.add(t);
    // synergy check
    for (const s of SYNERGIES) {
      if (this.foundSynergies.has(s.name)) continue;
      if (s.needs.every(t => this.tags.has(t))) {
        this.foundSynergies.add(s.name);
        return s;
      }
    }
    return null;
  }
}

export function rollRarity(rng: RNG, roomIndex: number, pity: number, luckTier: number): Rarity {
  // pity: guarantee rare+ after PITY_TIMER common-only rooms
  let r = rng.next();
  let common = C.RARITY_COMMON_RATE, rare = C.RARITY_RARE_RATE, epic = C.RARITY_EPIC_RATE;
  if (luckTier > 0) { common -= 0.12; epic += 0.07; rare += 0.05; }
  if (roomIndex < 8) { // legendary only after room 8
    if (r < common) return bumpPity('common', pity);
    if (r < common + rare) return 'rare';
    if (r < common + rare + epic) return 'epic';
    return 'epic';
  }
  if (pity >= C.PITY_TIMER && r < common) return 'rare';
  if (r < common) return 'common';
  if (r < common + rare) return 'rare';
  if (r < common + rare + epic) return 'epic';
  return 'legendary';
}
function bumpPity(r: Rarity, pity: number): Rarity { return pity >= C.PITY_TIMER ? 'rare' : r; }

export function rollPowerups(rng: RNG, state: PowerupState, roomIndex: number): [PowerupDef, PowerupDef] {
  const luckTier = state.has('curse_speed') ? 1 : 0;
  const result: PowerupDef[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; i < 2; i++) {
    const rarity = rollRarity(rng, roomIndex, state.pityCounter, luckTier);
    let pool = POWERUPS.filter(p => p.rarity === rarity && p.id !== state.lastOffered && !usedIds.has(p.id));
    // curses only after room 5 — filter curse-category from non-curse rarities is N/A since curses are epic rarity
    if (roomIndex < 5) pool = pool.filter(p => p.category !== 'curse');
    if (pool.length === 0) pool = POWERUPS.filter(p => !usedIds.has(p.id) && p.rarity !== 'legendary' && (roomIndex >= 5 || p.category !== 'curse'));
    // bias toward synergy enablers with 6+ powerups
    if (state.owned.length >= 6 && rng.chance(0.4)) {
      const syn = pool.filter(p => p.tags.some(t => !state.tags.has(t)));
      if (syn.length > 0) pool = syn;
    }
    const pick = rng.pick(pool);
    usedIds.add(pick.id);
    result.push(pick);
    if (rarity === 'common') state.pityCounter++; else state.pityCounter = 0;
  }
  return [result[0], result[1]];
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'COMMON', rare: 'RARE', epic: 'EPIC', legendary: '★ LEGENDARY ★',
};
export const RARITY_CLASS: Record<string, string> = {
  common: 'r-common', rare: 'r-rare', epic: 'r-epic', legendary: 'r-legendary',
};
