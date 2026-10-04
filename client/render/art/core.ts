// Core pixel-art toolkit: seeded RNG, color math, an RGBA pixel buffer with
// shaded primitives and post passes (bevel, outline, grime), and canvas export.

export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function bayer(x: number, y: number): number {
  return (BAYER4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
}

// ---------------------------------------------------------------- color

export function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}
export function rgb(r: number, g: number, b: number): number {
  return (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b);
}
export function cr(c: number): number { return (c >> 16) & 255; }
export function cg(c: number): number { return (c >> 8) & 255; }
export function cb(c: number): number { return c & 255; }

export function mul(c: number, f: number): number {
  return rgb(cr(c) * f, cg(c) * f, cb(c) * f);
}
export function mix(a: number, b: number, t: number): number {
  return rgb(cr(a) + (cr(b) - cr(a)) * t, cg(a) + (cg(b) - cg(a)) * t, cb(a) + (cb(b) - cb(a)) * t);
}
export function add(c: number, v: number): number {
  return rgb(cr(c) + v, cg(c) + v, cb(c) + v);
}
export function gray(c: number, t: number): number {
  const l = cr(c) * 0.3 + cg(c) * 0.59 + cb(c) * 0.11;
  return mix(c, rgb(l, l, l), t);
}

/** Hue-shifted lighting: l in [-1,1]. Shadows lean cool/purple, highlights warm. */
export function lit(c: number, l: number): number {
  if (l >= 0) {
    const t = rgb(cr(c) * 1.45 + 34, cg(c) * 1.4 + 28, cb(c) * 1.3 + 18);
    return mix(c, t, Math.min(1, l));
  }
  const t = rgb(cr(c) * 0.28 + 2, cg(c) * 0.26 + 1, cb(c) * 0.34 + 8);
  return mix(c, t, Math.min(1, -l));
}

/** Quantized + ordered-dithered lighting: classic 4-tone ramp. */
export function ramp(c: number, l: number, x: number, y: number, steps = 4): number {
  const v = ((Math.max(-1, Math.min(1, l)) + 1) / 2) * (steps - 1);
  let i = Math.floor(v + bayer(x, y));
  if (i < 0) i = 0;
  if (i > steps - 1) i = steps - 1;
  const lv = (i / (steps - 1)) * 2 - 1; // -1..1
  return lit(c, lv < 0 ? lv * 0.72 : lv * 0.55);
}

export const OUTLINE = 0x0b0809;

// ---------------------------------------------------------------- flags
export const F_NONE = 0;
export const F_EMIT = 1; // emissive: skipped by shading passes
export const F_FLAT = 2; // skip bevel/grime

// ---------------------------------------------------------------- buffer

export class Pix {
  readonly w: number;
  readonly h: number;
  readonly c: Int32Array;
  readonly a: Uint8Array;
  readonly f: Uint8Array;
  wrap = false;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.c = new Int32Array(w * h);
    this.a = new Uint8Array(w * h);
    this.f = new Uint8Array(w * h);
  }

  idx(x: number, y: number): number {
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.wrap) {
      x = ((x % this.w) + this.w) % this.w;
      y = ((y % this.h) + this.h) % this.h;
    } else if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
    return y * this.w + x;
  }

  set(x: number, y: number, col: number, flag = 0, alpha = 255): void {
    const i = this.idx(x, y);
    if (i < 0) return;
    this.c[i] = col;
    this.a[i] = alpha;
    this.f[i] = flag;
  }
  /** Alpha-blend a color over the existing pixel. */
  blend(x: number, y: number, col: number, alpha: number, flag = 0): void {
    const i = this.idx(x, y);
    if (i < 0) return;
    const ea = this.a[i];
    if (ea === 0) {
      this.c[i] = col;
      this.a[i] = clamp255(alpha);
      this.f[i] = flag;
      return;
    }
    const t = alpha / 255;
    this.c[i] = mix(this.c[i], col, t);
    this.a[i] = clamp255(ea + (255 - ea) * t);
    if (flag) this.f[i] = flag;
  }
  has(x: number, y: number): boolean {
    const i = this.idx(x, y);
    return i >= 0 && this.a[i] > 0;
  }
  get(x: number, y: number): number {
    const i = this.idx(x, y);
    return i >= 0 && this.a[i] > 0 ? this.c[i] : -1;
  }
  isEmit(x: number, y: number): boolean {
    const i = this.idx(x, y);
    return i >= 0 && this.a[i] > 0 && (this.f[i] & F_EMIT) !== 0;
  }
  /** Modify an existing opaque pixel's color. */
  tint(x: number, y: number, fn: (c: number) => number): void {
    const i = this.idx(x, y);
    if (i < 0 || this.a[i] === 0) return;
    this.c[i] = fn(this.c[i]);
  }
  clear(x: number, y: number): void {
    const i = this.idx(x, y);
    if (i < 0) return;
    this.a[i] = 0;
    this.f[i] = 0;
  }

  fill(col: number): void {
    for (let i = 0; i < this.c.length; i++) {
      this.c[i] = col;
      this.a[i] = 255;
      this.f[i] = 0;
    }
  }

  rect(x: number, y: number, w: number, h: number, col: number, flag = 0): void {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col, flag);
  }

  /** Rect with per-face lighting (top/left light, bottom/right dark). */
  box(x: number, y: number, w: number, h: number, col: number, flag = 0): void {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        let c = col;
        if (j === 0) c = lit(col, 0.45);
        else if (i === 0) c = lit(col, 0.22);
        else if (j === h - 1) c = lit(col, -0.55);
        else if (i === w - 1) c = lit(col, -0.35);
        this.set(x + i, y + j, c, flag);
      }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, col: number, flag = 0): void {
    const x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, col, flag);
      }
  }

  /** Sphere-lit ellipse with dithered 4-tone ramp. light: direction bias. */
  ball(cx: number, cy: number, rx: number, ry: number, col: number, flag = 0, lx = -0.55, ly = -0.65): void {
    const x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const nz = Math.sqrt(1 - d);
        const l = (dx * lx + dy * ly) * 1.1 + nz * 0.55 - 0.35;
        this.set(x, y, ramp(col, l * 1.4, x, y), flag);
      }
  }

  line(x0: number, y0: number, x1: number, y1: number, col: number, flag = 0): void {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 2000; n++) {
      this.set(x0, y0, col, flag);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  /** Shaded capsule between two points (limbs, barrels, cables). */
  limb(x0: number, y0: number, x1: number, y1: number, r: number, col: number, flag = 0, shade = true): void {
    const minx = Math.floor(Math.min(x0, x1) - r - 1), maxx = Math.ceil(Math.max(x0, x1) + r + 1);
    const miny = Math.floor(Math.min(y0, y1) - r - 1), maxy = Math.ceil(Math.max(y0, y1) + r + 1);
    const vx = x1 - x0, vy = y1 - y0;
    const len2 = vx * vx + vy * vy || 1;
    const len = Math.sqrt(len2);
    // perpendicular normal pointing "left/up" (lit side)
    let nx = -vy / len, ny = vx / len;
    if (nx * -0.6 + ny * -0.8 < 0) { nx = -nx; ny = -ny; }
    for (let y = miny; y <= maxy; y++)
      for (let x = minx; x <= maxx; x++) {
        const px = x + 0.5 - x0, py = y + 0.5 - y0;
        let t = (px * vx + py * vy) / len2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = px - vx * t, qy = py - vy * t;
        const d2 = qx * qx + qy * qy;
        if (d2 > r * r) continue;
        if (!shade) { this.set(x, y, col, flag); continue; }
        const side = (qx * nx + qy * ny) / Math.max(0.5, r); // -1..1, + = lit side
        this.set(x, y, ramp(col, side * 0.9 + 0.05, x, y), flag);
      }
  }

  /** Filled polygon (even-odd scanline). pts = [x0,y0,x1,y1,...] */
  poly(pts: number[], col: number, flag = 0): void {
    let miny = Infinity, maxy = -Infinity;
    for (let i = 1; i < pts.length; i += 2) { miny = Math.min(miny, pts[i]); maxy = Math.max(maxy, pts[i]); }
    const n = pts.length / 2;
    for (let y = Math.floor(miny); y <= Math.ceil(maxy); y++) {
      const sy = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < n; i++) {
        const ax = pts[i * 2], ay = pts[i * 2 + 1];
        const bx = pts[((i + 1) % n) * 2], by = pts[((i + 1) % n) * 2 + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, col, flag);
      }
    }
  }

  /** Lighten top/left silhouette edges, darken bottom/right. */
  bevel(hi = 0.42, lo = 0.5): void {
    const { w, h } = this;
    const src = new Uint8Array(this.a);
    const op = (x: number, y: number): boolean => {
      if (this.wrap) { x = (x + w) % w; y = (y + h) % h; }
      else if (x < 0 || y < 0 || x >= w || y >= h) return false;
      return src[y * w + x] > 0;
    };
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!src[i] || this.f[i] & (F_EMIT | F_FLAT)) continue;
        if (!op(x, y - 1) || !op(x - 1, y)) this.c[i] = lit(this.c[i], hi);
        else if (!op(x, y + 1) || !op(x + 1, y)) this.c[i] = lit(this.c[i], -lo);
      }
  }

  /** 1px outline around opaque pixels (into transparent ones). */
  outline(col = OUTLINE, diag = false): void {
    const { w, h } = this;
    const src = new Uint8Array(this.a);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (src[i]) continue;
        let hit = false;
        if (x > 0 && src[i - 1] > 128) hit = true;
        else if (x < w - 1 && src[i + 1] > 128) hit = true;
        else if (y > 0 && src[i - w] > 128) hit = true;
        else if (y < h - 1 && src[i + w] > 128) hit = true;
        else if (diag) {
          if ((x > 0 && y > 0 && src[i - w - 1] > 128) || (x < w - 1 && y > 0 && src[i - w + 1] > 128) ||
            (x > 0 && y < h - 1 && src[i + w - 1] > 128) || (x < w - 1 && y < h - 1 && src[i + w + 1] > 128)) hit = true;
        }
        if (hit) { this.c[i] = col; this.a[i] = 255; this.f[i] = F_FLAT; }
      }
  }

  /** Random dark/light speckle on opaque non-emissive pixels. */
  grime(r: Rng, chance: number, amt = 0.25, darkBias = 0.65): void {
    for (let i = 0; i < this.c.length; i++) {
      if (!this.a[i] || this.f[i] & (F_EMIT | F_FLAT)) continue;
      if (r() < chance) this.c[i] = lit(this.c[i], r() < darkBias ? -amt : amt);
    }
  }

  /** Composite another buffer on top (alpha aware). */
  draw(src: Pix, dx = 0, dy = 0): void {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const i = y * src.w + x;
        const a = src.a[i];
        if (!a) continue;
        if (a === 255) this.set(x + dx, y + dy, src.c[i], src.f[i]);
        else this.blend(x + dx, y + dy, src.c[i], a, src.f[i]);
      }
  }

  /** Add translucent glow around emissive pixels. */
  halo(col: number, alpha: number, radius = 1): void {
    const { w, h } = this;
    const em: number[] = [];
    for (let i = 0; i < this.c.length; i++) if (this.a[i] && this.f[i] & F_EMIT) em.push(i);
    for (const i of em) {
      const x = i % w, y = (i / w) | 0;
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx;
          if (this.a[j]) continue;
          this.c[j] = col;
          this.a[j] = alpha;
          this.f[j] = F_EMIT;
        }
    }
  }

  clone(): Pix {
    const p = new Pix(this.w, this.h);
    p.c.set(this.c); p.a.set(this.a); p.f.set(this.f); p.wrap = this.wrap;
    return p;
  }

  toCanvas(): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = this.w;
    cv.height = this.h;
    const ctx = cv.getContext('2d');
    if (!ctx) return cv;
    const img = ctx.createImageData(this.w, this.h);
    const d = img.data;
    for (let i = 0; i < this.c.length; i++) {
      const a = this.a[i];
      if (!a) continue;
      const c = this.c[i];
      d[i * 4] = (c >> 16) & 255;
      d[i * 4 + 1] = (c >> 8) & 255;
      d[i * 4 + 2] = c & 255;
      d[i * 4 + 3] = a;
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
}

export interface PartOpts { bevel?: boolean; outline?: number | false; hi?: number; lo?: number; diag?: boolean }

/** Draw a sub-part on its own layer, bevel + outline it, then composite. */
export function part(p: Pix, fn: (l: Pix) => void, o: PartOpts = {}): void {
  const l = new Pix(p.w, p.h);
  fn(l);
  if (o.bevel !== false) l.bevel(o.hi ?? 0.42, o.lo ?? 0.5);
  if (o.outline !== false) l.outline(o.outline ?? OUTLINE, o.diag ?? false);
  p.draw(l);
}

/** Bright emissive dot with optional cross glint. */
export function glint(p: Pix, x: number, y: number, core: number, mid: number, size = 1): void {
  p.set(x, y, core, F_EMIT);
  if (size >= 1) {
    p.set(x - 1, y, mid, F_EMIT); p.set(x + 1, y, mid, F_EMIT);
    p.set(x, y - 1, mid, F_EMIT); p.set(x, y + 1, mid, F_EMIT);
  }
  if (size >= 2) {
    p.set(x - 2, y, mul(mid, 0.7), F_EMIT); p.set(x + 2, y, mul(mid, 0.7), F_EMIT);
    p.set(x, y - 2, mul(mid, 0.7), F_EMIT); p.set(x, y + 2, mul(mid, 0.7), F_EMIT);
  }
}

/** Emissive radial blob: hot core → color → edge. */
export function glowBlob(p: Pix, cx: number, cy: number, r: number, hot: number, colr: number, edge: number, jag = 0, rr?: Rng): void {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      let d = Math.sqrt(dx * dx + dy * dy) / r;
      if (jag && rr) d += (rr() - 0.5) * jag;
      if (d > 1) continue;
      const v = d + (bayer(x, y) - 0.5) * 0.25;
      const c = v < 0.35 ? hot : v < 0.7 ? colr : edge;
      p.set(x, y, c, F_EMIT);
    }
}

/** Sparks: tiny bright emissive pixels scattered around a point. */
export function sparks(p: Pix, r: Rng, cx: number, cy: number, spread: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = r() * spread;
    const x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d);
    const c = r() < 0.4 ? 0xffffff : r() < 0.6 ? 0xfff27a : 0xffb030;
    p.set(x, y, c, F_EMIT);
    if (r() < 0.4) p.set(x + (r() < 0.5 ? 1 : -1), y + (r() < 0.5 ? 1 : 0), 0xffa020, F_EMIT);
  }
}

/** Value noise helper (tileable when period given). */
export function makeNoise(seed: number, period: number): (x: number, y: number) => number {
  const r = makeRng(seed);
  const g = new Float32Array(period * period);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const at = (x: number, y: number): number => g[(((y % period) + period) % period) * period + (((x % period) + period) % period)];
  return (x: number, y: number): number => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}
