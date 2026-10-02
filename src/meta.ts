// Meta progression — XP, levels, runs, fragments. Browser-local (localStorage).
import * as C from './constants';

export interface MetaState {
  xp: number;
  level: number;
  runs: number;      // total runs started
  deaths: number;    // tally marks on the wall
  kills: number;
  bestScore: number;
  bestRoom: number;
  cores: number;
  fragmentsSeen: number[];
  synergiesFound: string[];
  finalRevealSeen: boolean;
}

const KEY = 'rouged_meta_v1';

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch (_) {}
  return defaults();
}
function defaults(): MetaState {
  return { xp: 0, level: 1, runs: 0, deaths: 0, kills: 0, bestScore: 0, bestRoom: 0, cores: 0, fragmentsSeen: [], synergiesFound: [], finalRevealSeen: false };
}
export function saveMeta(m: MetaState) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (_) {}
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(C.XP_LEVEL_CURVE, level - 1));
}

// returns new level (may be same)
export function grantXp(m: MetaState, amount: number): { leveledUp: boolean; newLevel: number } {
  m.xp += amount;
  let leveled = false;
  while (m.xp >= xpForLevel(m.level)) {
    m.xp -= xpForLevel(m.level);
    m.level++;
    leveled = true;
  }
  saveMeta(m);
  return { leveledUp: leveled, newLevel: m.level };
}

export const LEVEL_UNLOCKS: Record<number, string> = {
  3: 'LANCE UNLOCKED',
  5: 'RIPPER UNLOCKED',
  7: 'HARD SIMULATION UNLOCKED',
  10: 'NEW HUB TERMINAL',
  20: 'NIGHTMARE SIMULATION UNLOCKED',
  25: 'REPLICA ENCOUNTER GUARANTEED',
  30: 'TRUE SIGHT',
  40: '???',
};
