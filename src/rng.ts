// Seeded RNG (mulberry32) — same seed = same run
export class RNG {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s |= 0; this.s = (this.s + 0x6D2B79F5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number { return min + this.next() * (max - min); }
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)); }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p: number): boolean { return this.next() < p; }
  shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
export function randomSeedString(): string {
  let s = '';
  const r = new RNG((Math.random() * 0xffffffff) >>> 0);
  for (let i = 0; i < 4; i++) s += SEED_CHARS[r.int(0, SEED_CHARS.length - 1)];
  s += '_';
  for (let i = 0; i < 2; i++) s += r.int(0, 9);
  return s;
}
export function seedStringToNumber(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
