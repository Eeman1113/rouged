// Boss animation rig: an offset pixel buffer (figures are authored in the classic 96x112 Warden
// space but drawn into a roomier 128x128 frame so leaps, swings and debris can leave the body box),
// a continuous pose vector every boss draw function reads, and whole-frame transforms
// (squash/stretch, lean, fracture) that give every boss weight without per-boss code.
import { Pix, OUTLINE, F_EMIT, F_FLAT, glowBlob, sparks, Rng, mix, bayer } from '../core';

export const FW = 128, FH = 128;
export const OX = 16, OY = 14; // authoring origin inside the frame (feet at local y≈111 → frame y 125)
export const FEET = 111;

/** Pixel buffer with a translated origin: all primitives take local (96x112 space) coordinates. */
export class TPix extends Pix {
  constructor(public ox = OX, public oy = OY) { super(FW, FH); }
  idx(x: number, y: number): number { return super.idx(Math.floor(x) + this.ox, Math.floor(y) + this.oy); }
  /** Raw composite (same frame space), alpha aware. */
  over(src: Pix): void {
    for (let i = 0; i < src.c.length; i++) {
      const a = src.a[i];
      if (!a) continue;
      if (a === 255 || !this.a[i]) { this.c[i] = src.c[i]; this.a[i] = a; this.f[i] = src.f[i]; }
      else { this.c[i] = mix(this.c[i], src.c[i], a / 255); this.a[i] = Math.min(255, this.a[i] + a); this.f[i] = src.f[i] || this.f[i]; }
    }
  }
}

export interface PartOpts { bevel?: boolean; outline?: number | false; hi?: number; lo?: number; diag?: boolean }
/** Same as core.part but in the offset frame space. */
export function bpart(p: TPix, fn: (l: TPix) => void, o: PartOpts = {}): void {
  const l = new TPix(p.ox, p.oy);
  fn(l);
  if (o.bevel !== false) l.bevel(o.hi ?? 0.42, o.lo ?? 0.5);
  if (o.outline !== false) l.outline(o.outline ?? OUTLINE, o.diag ?? false);
  p.over(l);
}

/** The pose vector. Every field is continuous so clips can tween. */
export interface BP {
  bob: number; ox: number; crouch: number;
  stepL: number; stepR: number; sw: number;
  /** arm poses: 0 rest · 1 raised overhead · -1 slammed/thrust forward-down · 0.5 ready/half-up */
  aL: number; aR: number;
  heat: number; open: number; flash: number;
  kneel: number; pain: number;
  t: number; glitch: number; spin: number;
  /** battle damage 0..2 (phase) */
  dmg: number;
  look: number; mode: number;
  /** extra emissive charge (veins, LEDs going red) */
  charge: number;
  /** 0..1 generic 'secondary' parameter per boss (e.g. vat level, pod petals, cannon recoil) */
  aux: number;
}
export const BP0: BP = { bob: 0, ox: 0, crouch: 0, stepL: 0, stepR: 0, sw: 0, aL: 0, aR: 0, heat: 0.5, open: 0, flash: 0, kneel: 0, pain: 0, t: 0, glitch: 0, spin: 0, dmg: 0, look: 0, mode: 0, charge: 0, aux: 0 };

/** Whole-frame transform applied after drawing. */
export interface XF {
  /** vertical scale about the feet (1 = none, <1 squash, >1 stretch) */
  sy?: number;
  /** horizontal scale about the centre (pairs with squash) */
  sx?: number;
  /** lean: px of horizontal shift at the top of the figure (shear) */
  lean?: number;
  /** vertical lift (px, + up) for leaps */
  lift?: number;
  /** fracture 0..1: the image breaks into chunks flying apart */
  frac?: number;
  /** sink into the floor 0..1 */
  sink?: number;
  /** whole-frame jitter px */
  jit?: number;
  /** flash the whole figure toward white 0..1 */
  white?: number;
  seed?: number;
}

export type Clip = { n: number; loop?: boolean; pose: (i: number, n: number, d: number) => Partial<BP>; xf?: (i: number, n: number) => XF; fx?: (p: TPix, i: number, n: number, r: Rng) => void };

export interface BossArt {
  draw: (p: TPix, b: BP, r: Rng) => void;
  dead: (p: TPix, r: Rng) => void;
  /** pose overrides per clip name; anything missing falls back to the generic library */
  clips: Record<string, Clip>;
  worldH: number;
  /** emissive colours used for glow sprites / fx: [eye, core] (0xRRGGBB) */
  glow: [number, number];
}

// ───────────────────────────── easing ─────────────────────────────
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const ease = (t: number): number => { t = clamp01(t); return t * t * (3 - 2 * t); };
export const easeOut = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);
export const easeIn = (t: number): number => Math.pow(clamp01(t), 2.2);
/** frame fraction 0..1 */
export const fr = (i: number, n: number): number => (n <= 1 ? 1 : i / (n - 1));
/** smooth anticipation → overshoot → settle curve for strikes (0..1 → -0.15..1.1..1) */
export const strike = (t: number): number => (t < 0.3 ? -0.15 * Math.sin((t / 0.3) * Math.PI) : t < 0.6 ? lerp(0, 1.12, easeOut((t - 0.3) / 0.3)) : lerp(1.12, 1, ease((t - 0.6) / 0.4)));

// ───────────────────────────── transforms ─────────────────────────────
export function transform(src: TPix, x: XF): TPix {
  const sy = x.sy ?? 1, sx = x.sx ?? 1, lean = x.lean ?? 0, lift = x.lift ?? 0, frac = x.frac ?? 0, sink = x.sink ?? 0, jit = x.jit ?? 0;
  if (sy === 1 && sx === 1 && !lean && !lift && !frac && !sink && !jit && !x.white) return src;
  const out = new TPix(src.ox, src.oy);
  const feet = src.oy + FEET + 1, cx = src.ox + 48;
  const top = src.oy;
  const seed = x.seed ?? 7;
  const jx = jit ? Math.round(Math.sin(seed * 12.9898) * jit) : 0, jy = jit ? Math.round(Math.cos(seed * 78.233) * jit * 0.5) : 0;
  for (let y = 0; y < FH; y++) for (let xx = 0; xx < FW; xx++) {
    // inverse map: destination (xx,y) ← source
    let syy = y + lift - jy;
    if (sink) syy = feet - (feet - syy) / Math.max(0.05, 1 - sink * 0.85) ;
    syy = feet - (feet - syy) / sy;
    const hgt = (feet - syy) / Math.max(1, feet - top);
    const sxx = cx + (xx - cx - jx) / sx - lean * hgt;
    const ix = Math.round(sxx), iy = Math.round(syy);
    if (ix < 0 || iy < 0 || ix >= FW || iy >= FH) continue;
    if (sink && y >= feet) continue;
    const si = iy * FW + ix;
    if (!src.a[si]) continue;
    const di = y * FW + xx;
    out.c[di] = x.white ? mix(src.c[si], 0xffffff, x.white) : src.c[si]; out.a[di] = src.a[si]; out.f[di] = src.f[si];
  }
  if (frac) return fracture(out, frac, seed);
  if (false) {
    for (let i = 0; i < out.c.length; i++) if (out.a[i] && (out.f[i] & F_EMIT) === 0 && bayer(i % FW, (i / FW) | 0) < frac * 0.25) out.c[i] = mix(out.c[i], 0xff8a30, 0.6);
  }
  return out;
}

/** Forward-splat the figure into chunks that fly apart and fall (death). */
function fracture(src: TPix, k: number, seed: number): TPix {
  const out = new TPix(src.ox, src.oy);
  const feet = src.oy + FEET + 1;
  const CW = 16, CH = 18;
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const si = y * FW + x;
    if (!src.a[si]) continue;
    const gy = Math.floor((y + Math.sin(x * 0.45) * 3) / CH), gx = Math.floor((x + (gy % 2) * 8 + Math.sin(y * 0.6 + gy) * 3) / CW);
    const h = Math.sin(gx * 12.9898 + gy * 78.233 + seed) * 43758.5453;
    const rnd = h - Math.floor(h);
    const dirx = (gx - FW / CW / 2 + 0.5) * (0.6 + rnd);
    const up = (1 - (feet - y) / FH) * 0;
    const tt = k;
    let nx = x + dirx * 9 * tt;
    let ny = y - (8 + rnd * 10) * tt + 30 * tt * tt + up;
    // chunks settle on the floor
    if (ny > feet - 1) ny = feet - 1 - ((y % CH) * 0.25);
    nx = Math.round(nx); ny = Math.round(ny);
    if (nx < 0 || ny < 0 || nx >= FW || ny >= FH) continue;
    const di = ny * FW + nx;
    // crack seams between chunks glow
    const seam = false;
    out.c[di] = seam && (src.f[si] & F_EMIT) === 0 ? mix(src.c[si], 0xff8a30, 0.7) : mix(src.c[si], 0x1a0c08, tt * 0.35);
    out.a[di] = src.a[si]; out.f[di] = seam ? F_EMIT : src.f[si];
  }
  return out;
}

/** Floor debris / dust burst used by impacts and deaths (drawn in local space). */
export function dust(p: TPix, r: Rng, cx: number, y: number, w: number, k: number, col = 0x6a5e52): void {
  const n = Math.round(30 * k);
  for (let i = 0; i < n; i++) {
    const x = cx + (r() - 0.5) * w * (0.5 + k), yy = y - r() * 14 * k;
    p.set(x, yy, r() < 0.5 ? col : mix(col, 0x000000, 0.4), F_FLAT);
    if (r() < 0.3) p.set(x + 1, yy, mix(col, 0xffffff, 0.2), F_FLAT);
  }
}

/** Big blast blob with sparks — for death frames. */
export function blast(p: TPix, r: Rng, x: number, y: number, rad: number): void {
  glowBlob(p, x, y, rad, 0xffffff, 0xfff0a0, 0xff7a20, 0.45, r);
  sparks(p, r, x, y, rad * 2.2, Math.round(rad * 3));
}

/** Interpolate a value keyed at v = -1, 0, +1. */
export function k3(v: number, neg: number, zero: number, pos: number): number {
  return v >= 0 ? lerp(zero, pos, Math.min(1, v)) : lerp(zero, neg, Math.min(1, -v));
}
/** Same for 2D points. */
export function p3(v: number, neg: [number, number], zero: [number, number], pos: [number, number]): [number, number] {
  return [k3(v, neg[0], zero[0], pos[0]), k3(v, neg[1], zero[1], pos[1])];
}

/** Glowing cracks for battle damage (emissive lines inside an opaque area). */
export function cracks(p: TPix, r: Rng, x0: number, y0: number, w: number, h: number, n: number, hot: number, mid: number): void {
  for (let i = 0; i < n; i++) {
    let x = x0 + r() * w, y = y0 + r() * h;
    let a = r() * Math.PI * 2;
    const len = 4 + r() * 8;
    for (let s = 0; s < len; s++) {
      a += (r() - 0.5) * 1.2;
      x += Math.cos(a); y += Math.sin(a);
      if (!p.has(x, y)) break;
      p.set(x, y, s < len * 0.4 ? hot : mid, F_EMIT);
    }
  }
}
