// Persistent meta progression (anonymous, localStorage). Death is progress.

import type { Difficulty, ReplicaProfile, RunSummary, WeaponId } from '../shared/protocol';
import { levelFromXp, unlockedWeapons } from '../server/progression';

export interface Settings {
  sensitivity: number;
  invertY: boolean;
  master: number;
  music: number;
  sfx: number;
  voice: boolean;
  fov: number;
  shake: number;
  quality: 'high' | 'low';
  padSens: number;
  aimAssist: number;
  rumble: number;
  triggers: boolean;
  gyro: 'off' | 'always' | 'l2';
  gyroSens: number;
  serverUrl: string;
  sprintToggle: boolean;
}

export interface Meta {
  v: number;
  name: string;
  xp: number;
  runCount: number; // completed runs (deaths + victories)
  deaths: number;
  victories: number;
  cores: number;
  fragments: string[];
  bestScore: number;
  bestRooms: number;
  bestCombo: number;
  totalKills: number;
  synergies: string[];
  enemiesSeen: string[];
  legendariesSeen: number;
  replica: ReplicaProfile | null;
  difficulty: Difficulty;
  revealSeen: boolean;
  trueEndingSeen: boolean;
  extractions: number;
  deepest: number;
  settings: Settings;
  lastSeed: string;
}

const KEY = 'rouged.meta.v1';

export function defaultMeta(): Meta {
  return {
    v: 1, name: 'CANDIDATE', xp: 0, runCount: 0, deaths: 0, victories: 0, cores: 0, fragments: [], bestScore: 0, bestRooms: 0, bestCombo: 1,
    totalKills: 0, synergies: [], enemiesSeen: [], legendariesSeen: 0, replica: null, difficulty: 'normal', revealSeen: false, trueEndingSeen: false, extractions: 0, deepest: 0, lastSeed: '',
    settings: { sensitivity: 1, invertY: false, master: 0.9, music: 0.7, sfx: 0.9, voice: true, fov: 95, shake: 1, quality: 'high', padSens: 1, aimAssist: 0.6, rumble: 1, triggers: true, gyro: 'l2', gyroSens: 1.2, serverUrl: '', sprintToggle: false },
  };
}

export function loadMeta(): Meta {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMeta();
    const m = JSON.parse(raw) as Partial<Meta>;
    const d = defaultMeta();
    return { ...d, ...m, settings: { ...d.settings, ...(m.settings ?? {}) } };
  } catch { return defaultMeta(); }
}

export function saveMeta(m: Meta) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* storage unavailable: progress lives for this session */ }
}

export function metaLevel(m: Meta) { return levelFromXp(m.xp); }
export function metaWeapons(m: Meta): WeaponId[] { return unlockedWeapons(levelFromXp(m.xp).level); }

export interface RunResult {
  xpGained: number;
  prevLevel: number;
  newLevel: number;
  personalBest: boolean;
  coresGained: number;
}

export function applyRun(m: Meta, s: RunSummary): RunResult {
  const prevLevel = levelFromXp(m.xp).level;
  const xp = Math.max(15, s.xp + s.rooms * 5 + (s.extracted ? 300 + (s.depth ?? 0) * 25 : 0) + (s.trueEnding ? 2000 : 0));
  m.xp += xp;
  m.runCount++;
  if (s.victory) m.victories++; else m.deaths++;
  if (s.extracted) m.extractions++;
  if (s.trueEnding) m.trueEndingSeen = true;
  m.deepest = Math.max(m.deepest, s.depth ?? 0);
  m.cores += s.bosses;
  m.totalKills += s.kills;
  const pb = s.score > m.bestScore;
  m.bestScore = Math.max(m.bestScore, s.score);
  m.bestRooms = Math.max(m.bestRooms, s.rooms);
  m.bestCombo = Math.max(m.bestCombo, s.peakCombo);
  for (const syn of s.synergies) if (!m.synergies.includes(syn)) m.synergies.push(syn);
  if (s.kills >= 3) m.replica = s.profile;
  saveMeta(m);
  return { xpGained: xp, prevLevel, newLevel: levelFromXp(m.xp).level, personalBest: pb && s.score > 0, coresGained: s.bosses };
}
