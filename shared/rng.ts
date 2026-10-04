// Deterministic seeded RNG (mulberry32) + seed helpers. Same seed = same run.

export class Rng {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0 || 0x9e3779b9; }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number { return a + (b - a) * this.next(); }
  int(a: number, b: number): number { return Math.floor(this.range(a, b + 1)); } // inclusive
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p: number): boolean { return this.next() < p; }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (const w of weights) total += w;
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
}

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return h >>> 0;
}

export function mixSeed(...parts: number[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) { h ^= p >>> 0; h = Math.imul(h, 0x01000193); h ^= h >>> 16; }
  return h >>> 0;
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Seeds look like F4NG_17 — short and shareable. */
export function randomSeedString(rnd: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += SEED_CHARS[Math.floor(rnd() * SEED_CHARS.length)];
  return s + '_' + String(Math.floor(rnd() * 100)).padStart(2, '0');
}

export function normalizeSeed(s: string): string {
  return s.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12);
}
