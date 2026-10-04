// Meta progression math. Pure functions — used by the client to persist XP/levels/unlocks.
import type { RunSummary, WeaponId } from '../shared/protocol';
import * as C from '../shared/constants';

export function xpForLevel(level: number): number {
  // XP needed to go from `level` to `level + 1`
  return Math.round(C.XP_LEVEL_BASE * Math.pow(C.XP_LEVEL_CURVE, level - 1));
}

export function levelFromXp(totalXp: number): { level: number; into: number; need: number } {
  let level = 1, xp = totalXp;
  while (xp >= xpForLevel(level) && level < 99) { xp -= xpForLevel(level); level++; }
  return { level, into: xp, need: xpForLevel(level) };
}

/** Death is progress: XP is always positive. */
export function summaryXp(s: RunSummary, sessionXp: number): number {
  return Math.max(15, Math.round(sessionXp + s.rooms * 2 + (s.victory ? 500 : 0)));
}

export interface Unlock { level: number; key: string; label: string }
export const UNLOCKS: Unlock[] = [
  { level: 1, key: 'pulse', label: 'PULSE + BREACHER' },
  { level: 3, key: 'lance', label: 'LANCE' },
  { level: 5, key: 'ripper', label: 'RIPPER' },
  { level: 7, key: 'hard', label: 'HARD DIFFICULTY' },
  { level: 10, key: 'terminal', label: 'NEW HUB TERMINAL' },
  { level: 15, key: 'variant', label: 'BIOME VARIANT' },
  { level: 20, key: 'nightmare', label: 'NIGHTMARE DIFFICULTY' },
  { level: 25, key: 'replica', label: 'REPLICA ENCOUNTER GUARANTEED' },
  { level: 30, key: 'truesight', label: 'TRUE SIGHT' },
  { level: 40, key: 'reveal', label: 'THE FINAL REVEAL' },
];

export function unlockedWeapons(level: number): WeaponId[] {
  const w: WeaponId[] = ['pulse', 'breacher'];
  if (level >= 3) w.push('lance');
  if (level >= 5) w.push('ripper');
  return w;
}

export function newUnlocks(prevLevel: number, newLevel: number): Unlock[] {
  return UNLOCKS.filter((u) => u.level > prevLevel && u.level <= newLevel);
}
