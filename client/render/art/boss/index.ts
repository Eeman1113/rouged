// Boss animation library: clip → frame generation + cache, the generic clip set every boss
// inherits (idle breathing, walk cycle, flinch, roar, transform, break kneel, finisher, death),
// and per-move 3-stage clips (wind-up → strike → recovery) built from key poses.
import { makeRng, hashStr, Rng } from '../core';
import { TPix, BP, BP0, Clip, BossArt, transform, fr, ease, blast, dust } from './rig';
import { smelterArt } from './smelter';
import { curatorArt } from './curator';
import { firstArt } from './first';
import { motherArt } from './mother';
import { gardenerArt } from './gardener';
import { generalArt } from './general';
import { handlerArt } from './handler';

const ARTS: (() => BossArt)[] = [smelterArt, curatorArt, firstArt, motherArt, gardenerArt, generalArt, handlerArt];
const artCache = new Map<number, BossArt>();
export function bossArt(v: number): BossArt {
  v = Math.max(0, Math.min(6, v | 0));
  let a = artCache.get(v);
  if (!a) { a = ARTS[v](); artCache.set(v, a); }
  return a;
}

export { moveClips } from './clips';
export type { MoveKeys } from './clips';
import { moveClips } from './clips';

// ───────────────────────────── generic clips ─────────────────────────────
const GENERIC: Record<string, Clip> = {
  idle: { n: 8, pose: (i, n) => { const s = Math.sin((i / n) * Math.PI * 2); return { bob: s * 1.2 + 0.5, heat: 0.5 + s * 0.12, t: i / n, crouch: 0.04 + s * 0.03 }; }, xf: (i, n) => ({ sy: 1 + Math.sin((i / n) * Math.PI * 2) * 0.012 }) },
  move: {
    n: 8,
    pose: (i, n) => {
      const ph = (i / n) * Math.PI * 2;
      return { bob: Math.abs(Math.sin(ph)) * 3, stepL: Math.max(0, Math.sin(ph)) * 6, stepR: Math.max(0, -Math.sin(ph)) * 6, sw: Math.cos(ph), t: i / n, heat: 0.55 };
    },
    xf: (i, n) => ({ lean: Math.sin((i / n) * Math.PI * 2) * 1.5 }),
  },
  pain: { n: 3, pose: (i) => ({ pain: i === 0 ? 1 : i === 1 ? 0.6 : 0.2, ox: [-4, -2, -1][i], bob: [1, 0, 0][i], heat: 0.8 }), xf: (i) => ({ lean: [-5, -2, -1][i], white: i === 0 ? 0.12 : 0 }) },
  intro: {
    n: 10,
    pose: (i, n) => { const t = fr(i, n); const roar = t > 0.45 ? Math.sin(((t - 0.45) / 0.55) * Math.PI) : 0; return { crouch: t < 0.45 ? ease(t / 0.45) * 0.6 : 0.6 - roar * 0.6, aL: roar * 0.9, aR: roar * 0.9, heat: 0.4 + roar * 0.6, charge: roar, flash: roar > 0.8 ? 0.6 : 0, t }; },
    xf: (i, n) => { const t = fr(i, n); const roar = t > 0.45 ? Math.sin(((t - 0.45) / 0.55) * Math.PI) : 0; return { sy: 1 - (t < 0.45 ? ease(t / 0.45) * 0.05 : 0) + roar * 0.05, jit: roar > 0.3 ? 1.5 : 0, seed: i }; },
  },
  trans: {
    n: 12,
    pose: (i, n) => {
      const t = fr(i, n);
      const up = t < 0.3 ? ease(t / 0.3) : t < 0.75 ? 1 : 1 - ease((t - 0.75) / 0.25);
      return { aL: up, aR: up, crouch: t < 0.3 ? 0.4 * (1 - up) : 0, heat: 0.6 + up * 0.4, charge: up, flash: t > 0.35 && t < 0.7 ? 0.5 + 0.5 * Math.sin(t * 40) : 0, glitch: t > 0.3 && t < 0.8 ? 0.6 : 0, open: up * 0.6, t, dmg: 1 };
    },
    xf: (i, n) => { const t = fr(i, n); const up = t < 0.3 ? ease(t / 0.3) : t < 0.75 ? 1 : 1 - ease((t - 0.75) / 0.25); return { sy: 1 + up * 0.06, sx: 1 - up * 0.02, jit: up > 0.5 ? 2 : 0, seed: i * 3, white: t > 0.4 && t < 0.5 ? 0.18 : 0 }; },
  },
  break: {
    n: 8,
    pose: (i) => (i < 4 ? { kneel: [0.25, 0.55, 0.85, 1][i], pain: 1 - i * 0.25, heat: 0.9, open: i / 3 } : { kneel: 1, open: 1, heat: 0.75 + (i % 2) * 0.25, t: (i - 4) / 4, bob: i % 2 }),
    xf: (i) => (i < 4 ? { sy: [0.96, 0.9, 0.92, 0.94][i], lean: [3, 6, 4, 3][i], white: i === 0 ? 0.12 : 0 } : { sy: 0.94, lean: 3 + ((i % 2) * 0.5), jit: 0.6, seed: i }),
  },
  finish: { n: 6, pose: (i) => ({ kneel: 1, open: 1, heat: 0.6 + (i % 3) * 0.2, t: i / 6, glitch: i % 3 === 0 ? 0.4 : 0, dmg: 2 }), xf: (i) => ({ sy: 0.93, lean: 4, jit: 1, seed: i * 5 }) },
  death: {
    n: 14,
    pose: (i) => ({ kneel: i < 2 ? 0.6 : 1, open: 1, heat: i < 8 ? 1 : 0.4, glitch: i < 9 ? 0.8 : 0, dmg: 2, flash: i % 2 ? 0.6 : 0 }),
    xf: (i) => {
      if (i < 8) return { sy: 0.94 - i * 0.012, lean: 4 + i * 1.5, jit: 2.5, seed: i * 7, white: i % 3 === 0 ? 0.15 : 0 };
      const k = (i - 8) / 5;
      return { sy: 0.88, lean: 14, frac: 0.15 + k * 0.85, seed: 3 };
    },
    fx: (p, i, _n, r) => {
      if (i >= 2 && i < 12) { const k = i / 12; blast(p, r, 48 + Math.sin(i * 2.3) * 22, 40 + Math.cos(i * 1.7) * 22 + k * 20, 5 + (i % 3) * 3); }
      if (i >= 8) dust(p, r, 48, 110, 90, (i - 7) / 6);
    },
  },
};

// ───────────────────────────── frames ─────────────────────────────
const frames = new Map<string, HTMLCanvasElement>();

export function clipInfo(v: number, clip: string): Clip {
  const art = bossArt(v);
  return art.clips[clip] ?? GENERIC[clip] ?? (clip.endsWith('.0') ? GENERIC_MOVE['w'] : clip.endsWith('.1') ? GENERIC_MOVE['a'] : clip.endsWith('.2') ? GENERIC_MOVE['r'] : GENERIC.idle);
}

const GM = moveClips('g', { W: { aL: 0.8, aR: 0.8, crouch: 0.3, heat: 0.85, charge: 0.7 }, A: { aL: -0.4, aR: -0.4, flash: 1, heat: 1, crouch: 0.1 }, xw: { sy: 0.95 }, xa: { sy: 1.03 } });
const GENERIC_MOVE: Record<string, Clip> = { w: GM['g.0'], a: GM['g.1'], r: GM['g.2'] };

/** Phase damage (0..2) baked into every frame from phase 2 on. */
export function bossFrame(v: number, clip: string, i: number, dmgLevel = 0): HTMLCanvasElement {
  const c = clipInfo(v, clip);
  const n = c.n;
  i = Math.max(0, Math.min(n - 1, i | 0));
  const key = `${v}:${clip}:${i}:${dmgLevel}`;
  const hit = frames.get(key);
  if (hit) return hit;
  const art = bossArt(v);
  const base = c.pose(i, n, dmgLevel);
  const pose: BP = { ...BP0, dmg: dmgLevel, ...base };
  if (base.dmg !== undefined) pose.dmg = Math.max(base.dmg, dmgLevel);
  const r: Rng = makeRng(hashStr(clip) + i * 977 + v * 31);
  let p = new TPix();
  art.draw(p, pose, r);
  if (c.fx) c.fx(p, i, n, r);
  const xf = c.xf?.(i, n);
  if (xf) p = transform(p, xf);
  const cv = p.toCanvas();
  frames.set(key, cv);
  return cv;
}

export function bossDeadFrame(v: number): HTMLCanvasElement {
  const key = `${v}:dead`;
  const hit = frames.get(key);
  if (hit) return hit;
  const p = new TPix();
  bossArt(v).dead(p, makeRng(99 + v));
  const cv = p.toCanvas();
  frames.set(key, cv);
  return cv;
}

/** Every clip name a boss can play (for prewarm / contact sheets). */
export function clipNames(v: number, moves: string[]): string[] {
  const out = ['idle', 'move', 'pain', 'intro', 'trans', 'break', 'finish', 'death'];
  for (const m of moves) out.push(m + '.0', m + '.1', m + '.2');
  void v;
  return out;
}

/** Move ids each boss has (mirrors the server kits; used for prewarm and the test page). */
export const BOSS_MOVES: string[][] = [
  ['hammer', 'leap', 'fan', 'charge', 'vent', 'pour', 'spiral'],
  ['catalogue', 'gaze', 'shelve', 'snipe', 'shards', 'stacks', 'purge'],
  ['heartbeat', 'lash', 'clot', 'scuttle', 'mimic', 'veins', 'systole'],
  ['brood', 'spray', 'lullaby', 'tether', 'acid', 'scuttle', 'cradle'],
  ['roots', 'shears', 'spores', 'lance', 'vines', 'seed', 'overgrowth'],
  ['artillery', 'gatling', 'cannon', 'treads', 'mines', 'barrage', 'rally', 'carpet'],
  ['static', 'memory', 'scanHigh', 'scanLow', 'signal', 'correction', 'fracture', 'cascade', 'wait'],
];

/** Generate a boss's frames in small idle slices so the fight never hitches. */
export function prewarmBoss(v: number, dmgLevels = [0]): void {
  const jobs: [string, number, number][] = [];
  for (const d of dmgLevels) for (const c of clipNames(v, BOSS_MOVES[v] ?? [])) { const n = clipInfo(v, c).n; for (let i = 0; i < n; i++) jobs.push([c, i, d]); }
  const step = () => {
    const t0 = performance.now();
    while (jobs.length && performance.now() - t0 < 6) { const [c, i, d] = jobs.shift()!; bossFrame(v, c, i, d); }
    if (jobs.length) setTimeout(step, 16);
  };
  setTimeout(step, 50);
}
