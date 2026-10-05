// Seeded room graph: what's behind each door, and who lives there.
import type { DoorKind, EnemyType, Mutator, RoomDesc, RoomKind } from '../shared/protocol';
import { biomeOf } from '../shared/mapData';
import { Rng, mixSeed } from '../shared/rng';
import * as C from '../shared/constants';

/** Shown as "x/35" — the descent ends at THE HANDLER; the Endless continues past it. */
export const TOTAL_ROOMS = C.FINAL_ROOM;

const KIND_CODE: Record<RoomKind, number> = { combat: 1, arena: 2, gauntlet: 3, anomaly: 4, boss: 5, hub: 6, shop: 7, sanctuary: 8, trial: 9, happy: 10 };

export function firstRoom(runSeed: number): RoomDesc {
  return { index: 0, biome: 0, kind: 'combat', door: 'standard', seed: mixSeed(runSeed, 0, 0, 1) };
}

export function nextRoom(runSeed: number, cur: RoomDesc, slot: number, door: DoorKind, kind: RoomKind, mutator?: Mutator): RoomDesc {
  const index = cur.index + 1;
  const d: RoomDesc = { index, biome: biomeOf(index), kind, door, seed: mixSeed(runSeed, index, slot + 1, KIND_CODE[kind], cur.seed) };
  if (mutator && kind !== 'boss') d.mutator = mutator;
  return d;
}

export interface SpawnPlan { type: EnemyType; elite: boolean }

const COST: Record<EnemyType, number> = {
  drone: 1, grunt: 2, spider: 2.5, stalker: 3, brute: 6, replica: 6, warden: 99,
  leech: 1.5, sentinel: 4, bomber: 2, mortar: 4, bulwark: 6, wraith: 5, echo: 99,
};
const CAP: Partial<Record<EnemyType, number>> = { brute: 2, replica: 2, bulwark: 2, sentinel: 3, mortar: 3, wraith: 2 };

type Pool = [EnemyType[], number[]];
function pool(...entries: [EnemyType, number][]): Pool { return [entries.map((e) => e[0]), entries.map((e) => e[1])]; }

function biomePool(biome: number, index: number): Pool {
  const local = index % 5;
  switch (biome) {
    case 0: return index < 2 ? pool(['grunt', 6], ['drone', 4]) : pool(['grunt', 6], ['drone', 4], ['brute', 1.2], ['spider', 0.6], ['bomber', 1]);
    case 1: return pool(['stalker', 3], ['spider', 3.5], ['grunt', 3], ['drone', 2], ['brute', 0.8], ['sentinel', local >= 1 ? 1.5 : 0]);
    case 2: return pool(['brute', 2.5], ['replica', index >= 11 ? 1.4 : 0], ['grunt', 2.5], ['stalker', 1.5], ['spider', 1.5], ['drone', 2], ['bomber', 1.5], ['wraith', 0.5]);
    case 3: return pool(['leech', 6], ['spider', 2], ['wraith', 1.6], ['grunt', 1.5], ['drone', 2], ['bomber', 1.2]);
    case 4: return pool(['leech', 4], ['spider', 3], ['stalker', 2.5], ['wraith', 1.5], ['mortar', 1.5], ['drone', 2]);
    case 5: return pool(['grunt', 5], ['bulwark', 1.6], ['mortar', 2], ['sentinel', 1.6], ['bomber', 2.5], ['drone', 1.5], ['brute', 1]);
    default: return pool(['replica', 2.5], ['wraith', 2], ['stalker', 2], ['bulwark', 1.2], ['sentinel', 1.2], ['brute', 1.2], ['leech', 1.5]);
  }
}

/** Budget-based composition. Mutators bend it. */
/** `bias` adds extra weighted types on top of the biome pool (THE HAPPY PLACE ambush). */
export function composeEnemies(desc: RoomDesc, players: number, runCount: number, rng: Rng, budgetMult = 1, bias?: [EnemyType, number][]): SpawnPlan[] {
  const past = Math.max(0, desc.index - C.FINAL_ROOM);
  let budget = 7 + Math.min(desc.index, C.FINAL_ROOM) * 1.55 + past * 0.6;
  if (runCount === 0 && desc.index === 0) budget = 6; // the very first room ever: a gentle hook
  if (desc.door === 'elite') budget *= 1.5;
  if (desc.kind === 'trial') budget *= 1.3;
  budget *= Math.pow(C.ENEMY_COUNT_SCALE, players - 1) * budgetMult;
  let [types, weights] = biomePool(desc.biome, desc.index);
  // the Endless: everything, everywhere
  if (desc.index >= C.FINAL_ROOM) {
    const extra = biomePool(rng.int(0, 6), desc.index);
    types = types.concat(extra[0]); weights = weights.concat(extra[1].map((w) => w * 0.6));
  }
  if (bias) { types = types.concat(bias.map((b) => b[0])); weights = weights.concat(bias.map((b) => b[1])); }
  if (desc.mutator === 'silence') weights = weights.map((w, i) => (['stalker', 'wraith', 'leech'].includes(types[i]) ? w * 3 + 1 : w * 0.5));
  if (desc.mutator === 'swarm') { budget *= 1.6; weights = weights.map((w, i) => (COST[types[i]] <= 2 ? w * 4 + 1 : w * 0.4)); }
  const out: SpawnPlan[] = [];
  let guard = 0;
  while (budget > 0.9 && guard++ < 120) {
    const t = rng.weighted(types, weights);
    const c = COST[t];
    if (c > budget + 0.5) { if (budget < 2) { out.push({ type: 'drone', elite: false }); budget -= 1; } continue; }
    const cap = (CAP[t] ?? 99) + Math.floor(desc.index / 10);
    if (out.filter((o) => o.type === t).length >= cap) continue;
    let eliteChance = desc.door === 'elite' ? 0.4 : desc.index > 8 ? 0.12 + Math.min(0.3, (desc.index - 8) * 0.01) : 0.03;
    if (desc.mutator === 'bloodmoon') eliteChance = 1;
    out.push({ type: t, elite: rng.chance(eliteChance) });
    budget -= c;
  }
  // deep in the Endless the budget outgrows any sane room: cap the headcount, spend the rest on elites
  const MAX_ENEMIES = 40;
  if (out.length > MAX_ENEMIES) {
    out.sort((a, b) => COST[b.type] - COST[a.type]);
    out.length = MAX_ENEMIES;
    for (const o of out) o.elite = true;
  }
  return out;
}
