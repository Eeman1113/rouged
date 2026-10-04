// Seeded room graph: what's behind each door, and who lives there.
import type { DoorKind, EnemyType, RoomDesc, RoomKind } from '../shared/protocol';
import { biomeOf } from '../shared/mapData';
import { Rng, mixSeed } from '../shared/rng';
import * as C from '../shared/constants';

export const TOTAL_ROOMS = C.ROOMS_PER_BIOME * C.BIOMES;

const KIND_CODE: Record<RoomKind, number> = { combat: 1, arena: 2, gauntlet: 3, anomaly: 4, boss: 5, hub: 6 };

export function firstRoom(runSeed: number): RoomDesc {
  return { index: 0, biome: 0, kind: 'combat', door: 'standard', seed: mixSeed(runSeed, 0, 0, 1) };
}

export function nextRoom(runSeed: number, cur: RoomDesc, slot: number, door: DoorKind, kind: RoomKind): RoomDesc {
  const index = cur.index + 1;
  return { index, biome: biomeOf(index), kind, door, seed: mixSeed(runSeed, index, slot + 1, KIND_CODE[kind], cur.seed) };
}

export interface SpawnPlan { type: EnemyType; elite: boolean }

const COST: Record<EnemyType, number> = { drone: 1, grunt: 2, spider: 2.5, stalker: 3, brute: 6, replica: 6, warden: 99 };

function biomePool(biome: number, index: number): [EnemyType[], number[]] {
  if (biome === 0) return index < 2 ? [['grunt', 'drone'], [6, 4]] : [['grunt', 'drone', 'brute', 'spider'], [6, 4, 1.2, 0.6]];
  if (biome === 1) return [['stalker', 'spider', 'grunt', 'drone', 'brute'], [3, 3.5, 3, 2, 0.8]];
  return [['brute', 'replica', 'grunt', 'stalker', 'spider', 'drone'], [2.5, index >= 11 ? 1.4 : 0, 2.5, 1.5, 1.5, 2]];
}

/** Budget-based composition. */
export function composeEnemies(desc: RoomDesc, players: number, runCount: number, rng: Rng, budgetMult = 1): SpawnPlan[] {
  let budget = 7 + desc.index * 1.7;
  if (runCount === 0 && desc.index === 0) budget = 6; // the very first room ever: a gentle hook
  if (desc.door === 'elite') budget *= 1.5;
  budget *= Math.pow(C.ENEMY_COUNT_SCALE, players - 1) * budgetMult;
  const [types, weights] = biomePool(desc.biome, desc.index);
  const out: SpawnPlan[] = [];
  let guard = 0;
  while (budget > 0.9 && guard++ < 80) {
    const t = rng.weighted(types, weights);
    const c = COST[t];
    if (c > budget + 0.5) { if (budget < 2) { out.push({ type: 'drone', elite: false }); budget -= 1; } continue; }
    if (t === 'brute' && out.filter((o) => o.type === 'brute').length >= 1 + Math.floor(desc.index / 6)) continue;
    if (t === 'replica' && out.filter((o) => o.type === 'replica').length >= 2) continue;
    const eliteChance = desc.door === 'elite' ? 0.4 : desc.index > 8 ? 0.12 : 0.03;
    out.push({ type: t, elite: rng.chance(eliteChance) });
    budget -= c;
  }
  return out;
}
