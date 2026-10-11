// Persistent meta progression (anonymous, localStorage). Death is progress.

import type { Difficulty, ReplicaProfile, RunSummary, WeaponId } from '../shared/protocol';
import { levelFromXp, unlockedWeapons } from '../server/progression';
import * as C from '../shared/constants';
import { PRESET_SENS, LEGACY_DEFAULT_SENS, classifySens, presetSens, type SensPreset } from './sensitivity';

export interface Settings {
  sensitivity: number;
  /** Which named preset the player is on. Lets the UI highlight the right
   *  chip on re-open, and lets us keep anyone who's manually tuned their
   *  sens from being clobbered when the default shifts. */
  sensPreset: SensPreset;
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
  /** scoped sensitivity multiplier (Valorant semantics: 1 = scaled exactly by zoom) */
  adsMult: number;
  dpi: number;
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
  /** door 35: the distinct Warden biomes (0..6, 6 = THE HANDLER) this subject has ever beaten */
  sigils: number[];
  /** early extractions that ended in the false awakening (the sequence is skippable after the first) */
  falseWakes: number;
  /** the Handler's eye has been seen during a deep false awakening */
  eyeSeen: boolean;
  settings: Settings;
  lastSeed: string;
}

const KEY = 'rouged.meta.v1';
/** The /test autopilot keeps its own save slot so it never touches the player's progress. */
export const AI_META_KEY = 'rouged.meta.ai.v1';
export function metaKey(): string { return (globalThis as { __ROUGED_AUTOPILOT__?: boolean }).__ROUGED_AUTOPILOT__ ? AI_META_KEY : KEY; }

export function defaultMeta(): Meta {
  return {
    v: 1, name: 'CANDIDATE', xp: 0, runCount: 0, deaths: 0, victories: 0, cores: 0, fragments: [], bestScore: 0, bestRooms: 0, bestCombo: 1,
    totalKills: 0, synergies: [], enemiesSeen: [], legendariesSeen: 0, replica: null, difficulty: 'normal', revealSeen: false, trueEndingSeen: false, extractions: 0, deepest: 0, sigils: [], falseWakes: 0, eyeSeen: false, lastSeed: '',
    settings: { sensitivity: PRESET_SENS.noob, sensPreset: 'noob', invertY: false, master: 0.9, music: 0.7, sfx: 0.9, voice: true, fov: 95, shake: 1, quality: 'high', padSens: 1, aimAssist: 0.6, rumble: 1, triggers: true, gyro: 'l2', gyroSens: 1.2, serverUrl: '', sprintToggle: false, adsMult: 1, dpi: 800 },
  };
}

export function loadMeta(): Meta {
  try {
    const raw = localStorage.getItem(metaKey());
    if (!raw) return defaultMeta();
    const m = JSON.parse(raw) as Partial<Meta>;
    const d = defaultMeta();
    const merged = migrateMeta(m);
    // Preset migration for saves predating the preset chips. Two rules:
    //  (a) If the saved sens is EXACTLY the legacy default of 1, this user
    //      never touched the slider — move them to the new default (noob)
    //      instead of pinning them at a ~9cm/360 flick-shooter speed.
    //  (b) Otherwise they chose something — leave it alone, mark 'custom'
    //      (or 'noob'/'pro'/'godkiller' if it happens to equal a preset).
    if ((m.settings as Partial<Settings> | undefined)?.sensPreset == null) {
      const existing = merged.settings.sensitivity;
      if (existing === LEGACY_DEFAULT_SENS) {
        merged.settings.sensitivity = presetSens('noob', merged.settings.dpi ?? 800);
        merged.settings.sensPreset = 'noob';
      } else {
        merged.settings.sensPreset = classifySens(existing, merged.settings.dpi ?? 800);
      }
    }
    return merged;
  } catch { return defaultMeta(); }
}

/** Wardens sit at room indices 4, 9, 14 ... 34; Warden i guards biome i. */
const wardenIndex = (biome: number) => biome * C.ROOMS_PER_BIOME + (C.BOSS_EVERY - 1);

/**
 * Which Wardens a save has beaten, for saves made before door 35 existed. Conservative: the true
 * ending means all seven; reaching depth D means every Warden room before the last one was cleared
 * (nobody leaves a Warden's room with the Warden standing); any extraction means the first three.
 */
export function deriveSigils(m: Partial<Meta>): number[] {
  if (m.trueEndingSeen) return Array.from({ length: C.BIOMES }, (_, i) => i);
  const out = new Set<number>();
  const deepest = Math.max(0, Math.floor(Number(m.deepest) || 0));
  for (let b = 0; b < C.BIOMES; b++) if (wardenIndex(b) < deepest - 1) out.add(b);
  if ((Number(m.extractions) || 0) > 0) for (let b = 0; b < 3; b++) out.add(b);
  return [...out].sort((a, b) => a - b);
}

/** The Wardens a run's summary credits this player with (older servers send no ledger: derive it). */
export function runSigils(s: RunSummary): number[] {
  if (s.trueEnding) return Array.from({ length: C.BIOMES }, (_, i) => i);
  if (Array.isArray(s.wardens)) return s.wardens.filter((b) => Number.isInteger(b) && b >= 0 && b < C.BIOMES);
  const depth = Math.min(s.depth ?? 0, C.FINAL_ROOM);
  const out: number[] = [];
  // a death in a Warden's room doesn't count it; an extraction leaves from a cleared Warden room
  for (let b = 0; b < C.BIOMES; b++) if (wardenIndex(b) < depth - 1 || (s.extracted && wardenIndex(b) === depth - 1)) out.push(b);
  return out;
}

/** Fill in fields a stored save predates. Pure: the tools tests run it without localStorage. */
export function migrateMeta(m: Partial<Meta>): Meta {
  const d = defaultMeta();
  const merged: Meta = { ...d, ...m, settings: { ...d.settings, ...(m.settings ?? {}) } };
  const raw = (m as { sigils?: unknown }).sigils;
  merged.sigils = Array.isArray(raw)
    ? [...new Set(raw.filter((b): b is number => Number.isInteger(b) && b >= 0 && b < C.BIOMES))].sort((a, b) => a - b)
    : deriveSigils(m);
  if (merged.trueEndingSeen && merged.sigils.length < C.BIOMES) merged.sigils = deriveSigils({ trueEndingSeen: true });
  merged.falseWakes = Math.max(0, Math.floor(Number(merged.falseWakes) || 0));
  merged.eyeSeen = !!merged.eyeSeen;
  return merged;
}

export function saveMeta(m: Meta) {
  try { localStorage.setItem(metaKey(), JSON.stringify(m)); } catch { /* storage unavailable: progress lives for this session */ }
}

export function metaLevel(m: Meta) { return levelFromXp(m.xp); }
export function metaWeapons(m: Meta): WeaponId[] { return unlockedWeapons(levelFromXp(m.xp).level); }

export interface RunResult {
  xpGained: number;
  prevLevel: number;
  newLevel: number;
  personalBest: boolean;
  coresGained: number;
  /** Warden sigils on door 35 this run lit for the first time */
  freshSigils: number[];
}

export function applyRun(m: Meta, s: RunSummary): RunResult {
  const prevLevel = levelFromXp(m.xp).level;
  const xp = Math.max(15, s.xp + s.rooms * 5 + (s.extracted ? 300 + (s.depth ?? 0) * 25 : 0) + (s.trueEnding ? 2000 : 0));
  m.xp += xp;
  m.runCount++;
  if (s.victory) m.victories++; else m.deaths++;
  if (s.extracted) m.extractions++;
  if (s.trueEnding) m.trueEndingSeen = true;
  const before = new Set(m.sigils);
  const freshSigils = runSigils(s).filter((b) => !before.has(b));
  if (freshSigils.length) m.sigils = [...before, ...freshSigils].sort((a, b) => a - b);
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
  return { xpGained: xp, prevLevel, newLevel: levelFromXp(m.xp).level, personalBest: pb && s.score > 0, coresGained: s.bosses, freshSigils };
}
