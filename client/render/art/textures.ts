// Tileable environment textures + props (walls, floors, ceilings, hub, doors, terminal, crate, mirror, body).
import { Pix, Rng, makeRng, makeNoise, mix, mul, lit, ramp, bayer, part, F_EMIT, F_FLAT, glowBlob } from './core';

const T = 64;

function noiseFill(p: Pix, base: number, seed: number, amt: number, period = 8, alt?: number): void {
  const n = makeNoise(seed, period);
  const n2 = makeNoise(seed + 1, period * 2);
  const k = period / p.w, k2 = (period * 2) / p.w;
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      const v = n(x * k, y * k * (p.w / p.h)) * 0.6 + n2(x * k2, y * k2 * (p.w / p.h)) * 0.4;
      let c = lit(base, (v - 0.5) * amt * 2 + (bayer(x, y) - 0.5) * 0.08);
      if (alt !== undefined && v > 0.68) c = mix(c, alt, Math.min(1, (v - 0.68) * 4));
      p.set(x, y, c);
    }
}

function tint(p: Pix, x: number, y: number, f: number): void { p.tint(x, y, (c) => lit(c, f)); }

/** Panel: lit top/left edge, dark bottom/right seam. */
function panel(p: Pix, x0: number, y0: number, w: number, h: number, d = 0.55, hi = 0.3): void {
  for (let i = 0; i < w; i++) { tint(p, x0 + i, y0, hi); tint(p, x0 + i, y0 + h - 1, -d); p.tint(x0 + i, y0 + h - 1, (c) => mul(c, 0.55)); }
  for (let j = 0; j < h; j++) { tint(p, x0, y0 + j, hi * 0.6); tint(p, x0 + w - 1, y0 + j, -d * 0.8); }
}

function rivet(p: Pix, x: number, y: number, base: number): void {
  p.set(x, y, lit(base, 0.55)); p.set(x + 1, y, lit(base, 0.2)); p.set(x, y + 1, lit(base, 0.1)); p.set(x + 1, y + 1, lit(base, -0.55));
  tint(p, x + 2, y + 1, -0.35); tint(p, x + 1, y + 2, -0.35);
}

function streaks(p: Pix, r: Rng, n: number, col: number, len: number, alpha = 0.45): void {
  for (let i = 0; i < n; i++) {
    let x = Math.floor(r() * p.w);
    const y0 = Math.floor(r() * p.h), L = len * (0.4 + r() * 0.8);
    for (let j = 0; j < L; j++) {
      const t = 1 - j / L;
      p.tint(x, y0 + j, (c) => mix(c, col, alpha * t));
      if (r() < 0.06) x += r() < 0.5 ? -1 : 1;
    }
  }
}

function speckle(p: Pix, r: Rng, n: number, f: number): void {
  for (let i = 0; i < n; i++) tint(p, Math.floor(r() * p.w), Math.floor(r() * p.h), r() < 0.6 ? -f : f);
}

function hazard(p: Pix, y0: number, h: number, x0 = 0, w = T): void {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    const s = ((x + y) >> 2) & 1;
    p.set(x, y, s ? 0xc8a020 : 0x1a1814);
  }
  for (let x = x0; x < x0 + w; x++) { tint(p, x, y0, 0.3); tint(p, x, y0 + h - 1, -0.5); }
}

function hcyl(p: Pix, y0: number, h: number, base: number): void {
  for (let y = 0; y < h; y++) {
    const ny = (y + 0.5) / h * 2 - 1;
    for (let x = 0; x < T; x++) p.set(x, y0 + y, ramp(base, -ny * 0.9 + (Math.abs(ny + 0.4) < 0.15 ? 0.6 : 0), x, y0 + y, 5));
  }
}

function glowStrip(p: Pix, y: number, hot: number, mid: number, dim: number): void {
  for (let x = 0; x < T; x++) {
    p.set(x, y - 2, mix(dim, 0x000000, 0.4)); p.set(x, y - 1, dim, F_EMIT); p.set(x, y, mid, F_EMIT); p.set(x, y + 1, hot, F_EMIT);
    p.set(x, y + 2, mid, F_EMIT); p.set(x, y + 3, dim, F_EMIT); p.set(x, y + 4, mix(dim, 0x000000, 0.4));
  }
  for (let x = 0; x < T; x += 8) { p.set(x, y + 1, mid, F_EMIT); p.set(x, y, dim, F_EMIT); p.set(x, y + 2, dim, F_EMIT); }
}

// =================================================================== walls
function foundryWall(v: number): Pix {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(100 + v);
  if (v === 0) {
    noiseFill(p, 0x6e3e24, 11, 0.35, 8, 0x9a5a28);
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32);
    for (let k = 0; k < 4; k++) for (let i = 3; i < 30; i += 6) {
      const [x, y] = [[0, 0], [32, 0], [0, 32], [32, 32]][k];
      rivet(p, x + i, y + 2, 0x7a4a2e); rivet(p, x + i, y + 28, 0x7a4a2e);
    }
    streaks(p, r, 14, 0xc06a1a, 22, 0.35);
    streaks(p, r, 10, 0x1a0e08, 18, 0.4);
    speckle(p, r, 220, 0.3);
    p.rect(10, 12, 12, 6, 0x2a1810); p.rect(11, 13, 10, 4, 0xc8a020); for (let x = 11; x < 21; x += 3) p.rect(x, 13, 1, 4, 0x1a1814);
  } else if (v === 1) {
    noiseFill(p, 0x6a3c26, 21, 0.3, 4, 0x8a4a22);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) tint(p, x, y, Math.sin((x / 4) * Math.PI * 2) * 0.32);
    hcyl(p, 0, 5, 0x4a3a30); hcyl(p, 34, 5, 0x4a3a30);
    for (let x = 2; x < T; x += 8) { rivet(p, x, 1, 0x5a4a3a); rivet(p, x, 35, 0x5a4a3a); }
    for (let i = 0; i < 5; i++) {
      const cx = r() * T, cy = r() * T, rr = 3 + r() * 6;
      for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) if (x * x + y * y < rr * rr * (0.6 + r() * 0.4)) p.tint(cx + x, cy + y, (c) => mix(c, r() < 0.5 ? 0xa0501a : 0x4a200e, 0.5));
    }
    streaks(p, r, 20, 0x1a0e08, 26, 0.35);
  } else {
    noiseFill(p, 0x2c2622, 31, 0.2, 8);
    for (let x = 0; x < T; x += 16) for (let y = 0; y < 50; y++) tint(p, x, y, -0.5);
    hcyl(p, 12, 9, 0x6a5040); hcyl(p, 26, 6, 0x5a4a44); hcyl(p, 40, 8, 0x7a4a2a);
    for (const bx of [6, 38]) for (const [y, h] of [[11, 11], [25, 8], [39, 10]]) { p.rect(bx, y, 3, h, 0x2a2420); tint(p, bx, y, 0.4); rivet(p, bx, y + 1, 0x3a3430); }
    streaks(p, r, 10, 0xc06a1a, 10, 0.3);
    hazard(p, 54, 10);
    for (let x = 0; x < T; x++) { p.set(x, 53, 0x141210); }
  }
  return p;
}

function archiveWall(v: number): Pix {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(200 + v);
  const LED = [0x5ab8ff, 0x3aff8a, 0x5ab8ff, 0xff3030, 0xc8f4ff];
  if (v === 0) {
    noiseFill(p, 0x4a5866, 41, 0.15, 8);
    panel(p, 0, 0, 32, 64, 0.6, 0.25); panel(p, 32, 0, 32, 64, 0.6, 0.25);
    for (const x0 of [4, 36]) {
      for (let y = 6; y < 30; y += 3) for (let x = x0; x < x0 + 24; x++) { p.set(x, y, 0x1c2430); tint(p, x, y + 1, 0.2); }
      p.rect(x0, 36, 24, 18, 0x222a34); panel(p, x0, 36, 24, 18, -0.2, -0.3);
      for (let y = 38; y < 52; y += 3) for (let x = x0 + 2; x < x0 + 22; x += 3) if (r() < 0.55) p.set(x, y, LED[Math.floor(r() * LED.length)], F_EMIT);
      rivet(p, x0 - 2, 2, 0x5a6a78); rivet(p, x0 + 24, 2, 0x5a6a78); rivet(p, x0 - 2, 59, 0x5a6a78); rivet(p, x0 + 24, 59, 0x5a6a78);
    }
    speckle(p, r, 120, 0.2);
    streaks(p, r, 6, 0x1a2028, 20, 0.3);
  } else if (v === 1) {
    noiseFill(p, 0x56646f, 51, 0.12, 8);
    for (const [x, y] of [[0, 0], [32, 0], [0, 16], [32, 16], [0, 32], [32, 32], [0, 48], [32, 48]]) panel(p, x, y, 32, 16, 0.45, 0.22);
    for (let y = 0; y < T; y++) { for (let x = 26; x < 32; x++) p.set(x, y, 0x161c24); tint(p, 25, y, 0.3); }
    for (let y = 0; y < T; y++) { p.set(27, y, (y % 8) < 6 ? 0x2a5aa0 : 0x1a3a6a); p.set(29, y, 0x8a2a2a); p.set(30, y, 0x3a3e44); }
    for (let y = 4; y < T; y += 16) { p.rect(24, y, 9, 2, 0x6a7884); }
    speckle(p, r, 120, 0.18);
    p.set(10, 8, 0x5ab8ff, F_EMIT); p.set(42, 40, 0x3aff8a, F_EMIT);
  } else {
    noiseFill(p, 0x2a323c, 61, 0.15, 8);
    for (let by = 0; by < 6; by++) for (let bx = 0; bx < 4; bx++) {
      const x0 = bx * 16 + 1, y0 = by * 10 + 2;
      p.rect(x0, y0, 14, 8, 0x4a5866); panel(p, x0, y0, 14, 8, 0.6, 0.35);
      for (let x = x0 + 2; x < x0 + 9; x++) p.set(x, y0 + 4, 0x1c2430);
      p.set(x0 + 11, y0 + 3, LED[Math.floor(r() * LED.length)], F_EMIT);
      if (r() < 0.5) p.set(x0 + 11, y0 + 5, 0x3aff8a, F_EMIT);
      if (r() < 0.12) { p.rect(x0 + 1, y0 + 1, 12, 6, 0x0c1016); }
    }
    for (let x = 0; x < T; x++) { p.set(x, 62, 0x1a2028); p.set(x, 63, 0x3a4652); }
  }
  return p;
}

function vein(p: Pix, r: Rng, x: number, y: number, n: number, col: number, flag = 0): void {
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    ang += (r() - 0.5) * 0.9;
    x += Math.cos(ang); y += Math.sin(ang);
    p.set(x, y, col, flag);
    if (i % 4 === 0) tint(p, x + 1, y + 1, -0.4);
    if (r() < 0.04) vein(p, r, x, y, n * 0.4, col, flag);
  }
}

function coreWall(v: number): Pix {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(300 + v);
  if (v === 0) {
    noiseFill(p, 0x4a3a3e, 71, 0.22, 8, 0x5a2a2e);
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) {
      panel(p, x + 2, y + 2, 28, 28);
      for (let i = 0; i < 32; i++) for (const [sx, sy] of [[x + i, y], [x + i, y + 1], [x, y + i], [x + 1, y + i]]) p.set(sx, sy, ramp(0x9a2a30, Math.sin((sx + sy) * 0.9) * 0.6, sx, sy));
      rivet(p, x + 5, y + 5, 0x5a4a4e); rivet(p, x + 25, y + 5, 0x5a4a4e); rivet(p, x + 5, y + 25, 0x5a4a4e); rivet(p, x + 25, y + 25, 0x5a4a4e);
    }
    for (let i = 0; i < 7; i++) vein(p, r, r() * T, r() * T, 30, 0x6a1018);
    streaks(p, r, 10, 0x5a0810, 16, 0.4);
  } else if (v === 1) {
    const n = makeNoise(81, 8);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const s = Math.sin(x * 0.45 + n(x / 8, y / 8) * 6) * 0.5 + 0.5;
      p.set(x, y, ramp(0x8a2a30, s * 1.4 - 0.7 + (n(x / 8, y / 8) - 0.5), x, y, 5));
    }
    for (let i = 0; i < 9; i++) vein(p, r, r() * T, r() * T, 40, 0x4a0810);
    hcyl(p, 8, 6, 0x5e5a62); hcyl(p, 40, 6, 0x5e5a62);
    for (let x = 4; x < T; x += 12) { rivet(p, x, 10, 0x6e6a72); rivet(p, x + 6, 42, 0x6e6a72); }
    for (let i = 0; i < 18; i++) { const x = r() * T, y = r() * T; p.set(x, y, 0xc84a50); p.set(x + 1, y, 0xe07a7a); }
  } else {
    noiseFill(p, 0x5a1a20, 91, 0.3, 8);
    for (const cx of [8, 24, 40, 56]) {
      for (let y = 0; y < T; y++) for (let x = -5; x <= 5; x++) {
        const nx = x / 5.5;
        p.set(cx + x, y, ramp(0x5a565e, -nx * 0.9 + (Math.abs(nx + 0.35) < 0.12 ? 0.7 : 0), cx + x, y, 5));
      }
      for (let y = 0; y < T; y += 2) { const xx = cx + Math.round(Math.sin(y * 0.3 + cx) * 5); p.set(xx, y, 0x9a1a24); p.set(xx, y + 1, 0x6a0a14); }
      for (let y = 14; y < T; y += 32) { p.rect(cx - 6, y, 13, 3, 0x3a363e); tint(p, cx - 6, y, 0.4); }
    }
    for (let i = 0; i < 4; i++) vein(p, r, r() * T, r() * T, 30, 0xc0202a, 0);
  }
  return p;
}

function trimWall(b: number): Pix {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(400 + b);
  const base = [0x221a16, 0x161c24, 0x1e1014][b];
  noiseFill(p, base, 101 + b, 0.18, 8);
  panel(p, 0, 0, 64, 26, 0.5, 0.2); panel(p, 0, 38, 64, 26, 0.5, 0.2);
  for (let x = 0; x < T; x += 4) for (let y = 4; y < 22; y += 4) if ((x + y) % 8 === 0) tint(p, x, y, -0.5);
  for (let x = 3; x < T; x += 10) { rivet(p, x, 3, lit(base, 0.5)); rivet(p, x, 58, lit(base, 0.5)); }
  const cols = [[0xfff0b0, 0xffa020, 0x8a3008], [0xe8ffff, 0x4ae8ff, 0x0a4a6a], [0xffe0d0, 0xff2a2a, 0x6a0a10]][b];
  glowStrip(p, 30, cols[0], cols[1], cols[2]);
  speckle(p, r, 80, 0.25);
  return p;
}

export function buildWall(biome: number, v: number): HTMLCanvasElement {
  const b = Math.max(0, Math.min(2, biome | 0));
  const vv = ((v | 0) % 4 + 4) % 4;
  if (vv === 3) return trimWall(b).toCanvas();
  return (b === 0 ? foundryWall(vv) : b === 1 ? archiveWall(vv) : coreWall(vv)).toCanvas();
}

// =================================================================== floors / ceilings
export function buildFloor(biome: number): HTMLCanvasElement {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(500 + biome);
  if (biome === 0) {
    noiseFill(p, 0x4a3e36, 111, 0.25, 8, 0x6a3a1e);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      // diamond plate
      const u = (x + (((y >> 3) & 1) * 4)) % 8, w = y % 8;
      if ((u === 2 && (w === 2 || w === 3)) || (u === 3 && (w === 3 || w === 4))) tint(p, x, y, 0.35);
      if (u === 4 && (w === 4 || w === 5)) tint(p, x, y, -0.35);
    }
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32, 0.6, 0.25);
    // central grate
    for (let y = 36; y < 60; y++) for (let x = 36; x < 60; x++) p.set(x, y, (x % 3 === 0 || y % 3 === 0) ? 0x2a2420 : 0x060404);
    panel(p, 35, 35, 26, 26, 0.5, 0.3);
    for (let i = 0; i < 4; i++) { const cx = r() * T, cy = r() * T, rr = 3 + r() * 5; for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) if (x * x + y * y < rr * rr) p.tint(cx + x, cy + y, (c) => mix(c, 0x120c0a, 0.45)); }
    speckle(p, r, 200, 0.25);
  } else if (biome === 1) {
    noiseFill(p, 0x5a6670, 121, 0.12, 8);
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32, 0.5, 0.2);
    for (let y = 8; y < 24; y++) for (let x = 40; x < 56; x++) p.set(x, y, (y % 2 === 0) ? 0x1a2028 : 0x3a4652);
    panel(p, 39, 7, 18, 18, 0.4, 0.3);
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) for (let i = 0; i < 6; i++) for (let j = 0; j < 6 - i; j++) p.tint(x + 1 + i, y + 1 + j, (c) => mix(c, 0x2a3038, 0.25));
    streaks(p, r, 6, 0x1a2028, 14, 0.25);
    speckle(p, r, 160, 0.18);
    p.set(16, 48, 0x3ab8ff, F_EMIT); p.set(17, 48, 0x3ab8ff, F_EMIT);
  } else {
    noiseFill(p, 0x3a2e32, 131, 0.2, 8);
    for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) panel(p, tx * 16 + ((ty & 1) * 8), ty * 16, 16, 16, 0.5, 0.25);
    for (let ty = 0; ty < 4; ty++) for (let x = 0; x < T; x++) { p.set(x, ty * 16, ramp(0x8a2a30, Math.sin(x * 1.3) * 0.7, x, ty * 16)); }
    for (let i = 0; i < 6; i++) vein(p, r, r() * T, r() * T, 26, 0x6a1018);
    for (let i = 0; i < 3; i++) { const cx = r() * T, cy = r() * T, rr = 2 + r() * 5; for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) if (x * x + y * y < rr * rr * (0.6 + r() * 0.5)) p.tint(cx + x, cy + y, (c) => mix(c, 0x4a0408, 0.6)); }
    speckle(p, r, 160, 0.25);
  }
  return p.toCanvas();
}

export function buildCeiling(biome: number): HTMLCanvasElement {
  const p = new Pix(T, T); p.wrap = true;
  const r = makeRng(600 + biome);
  if (biome === 0) {
    noiseFill(p, 0x241c18, 141, 0.25, 8);
    for (let x = 0; x < T; x++) { for (let y = 26; y < 38; y++) p.set(x, y, ramp(0x4a3426, y === 26 || y === 37 ? 0.5 : (y < 29 || y > 34) ? 0 : -0.6, x, y)); }
    for (let y = 0; y < T; y++) for (let x = 26; x < 38; x++) if (y < 26 || y > 37) p.set(x, y, ramp(0x3e2c22, x === 26 ? 0.5 : x === 37 ? -0.7 : (x < 29 || x > 34) ? 0 : -0.5, x, y));
    for (let i = 4; i < T; i += 10) { rivet(p, i, 27, 0x5a4434); rivet(p, i, 35, 0x5a4434); }
    streaks(p, r, 12, 0x0a0806, 14, 0.4);
    glowBlob(p, 10, 10, 2.2, 0xfff0b0, 0xffa020, 0x6a2808);
  } else if (biome === 1) {
    noiseFill(p, 0x3e4852, 151, 0.12, 8);
    for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32, 0.6, 0.15);
    for (let y = 4; y < 28; y++) for (let x = 4; x < 28; x++) p.set(x, y, ((x + y) & 1) ? 0xb8d8f0 : 0xd0ecff, F_EMIT);
    panel(p, 3, 3, 26, 26, 0.5, 0.2);
    for (let y = 36; y < 60; y += 3) for (let x = 36; x < 60; x++) p.set(x, y, 0x1c2430);
    speckle(p, r, 80, 0.15);
  } else {
    noiseFill(p, 0x2a1418, 161, 0.3, 8, 0x4a1a20);
    for (let i = 0; i < 10; i++) vein(p, r, r() * T, r() * T, 36, 0x5a0a14);
    hcyl(p, 20, 6, 0x4a464e);
    for (let i = 0; i < 5; i++) { const x = r() * T, y = r() * T; p.set(x, y, 0xff3030, F_EMIT); }
  }
  return p.toCanvas();
}

// =================================================================== hub
function hubWallPix(w: number, h: number, seed: number): Pix {
  const p = new Pix(w, h); p.wrap = true;
  const r = makeRng(seed);
  noiseFill(p, 0xc4c4bc, seed, 0.06, 8);
  for (let x = 0; x < w; x += 32) panel(p, x, 0, 32, h, 0.4, 0.15);
  for (let y = 0; y < h; y++) {
    const g = Math.max(0, (y - h * 0.55) / (h * 0.45));
    for (let x = 0; x < w; x++) if (r() < g * 0.6) p.tint(x, y, (c) => mix(c, 0x6a6458, 0.25 * g + 0.05));
  }
  for (let x = 0; x < w; x++) { p.set(x, h - 1, 0x4a4842); p.set(x, h - 2, 0x8a8880); p.set(x, 10, lit(p.get(x, 10), -0.2)); }
  streaks(p, r, Math.floor(w / 10), 0x8a8270, 26, 0.25);
  speckle(p, r, w * 3, 0.12);
  for (let x = 2; x < w; x += 32) { rivet(p, x + 2, 3, 0xb0b0a8); rivet(p, x + 26, 3, 0xb0b0a8); }
  return p;
}

export function buildHub(kind: string, amount: number): HTMLCanvasElement {
  if (kind === 'floor') {
    const p = new Pix(T, T); p.wrap = true;
    const r = makeRng(700);
    noiseFill(p, 0x8c8c86, 171, 0.08, 8);
    for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) panel(p, tx * 16, ty * 16, 16, 16, 0.35, 0.15);
    for (let i = 0; i < 5; i++) { const cx = r() * T, cy = r() * T, rr = 2 + r() * 6; for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) if (x * x + y * y < rr * rr * r()) p.tint(cx + x, cy + y, (c) => mix(c, 0x4a463e, 0.2)); }
    p.rect(40, 40, 8, 8, 0x3a3a38); for (let y = 41; y < 47; y += 2) for (let x = 41; x < 47; x++) p.set(x, y, 0x1a1a18);
    speckle(p, r, 160, 0.12);
    return p.toCanvas();
  }
  if (kind === 'tally') {
    const p = hubWallPix(128, 64, 811);
    p.wrap = false;
    const n = Math.max(0, Math.floor(amount));
    const GW = 15, GH = 13, cols = 8;
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), k = i % 5;
      const row = Math.floor(g / cols), col = g % cols;
      if (row > 3) break;
      const mr = makeRng(5000 + i * 31);
      const gx = 5 + col * GW + Math.floor(row * 3) % 5, gy = 9 + row * GH;
      const bloody = mr() < Math.min(0.85, 0.1 + i / 70);
      const groove = bloody ? 0x6a1212 : 0x4a423a;
      const lip = bloody ? 0xb03030 : 0xe8e6de;
      const scratch = (x0: number, y0: number, x1: number, y1: number): void => {
        p.line(x0, y0, x1, y1, groove);
        p.line(x0 + 1, y0 + 1, x1 + 1, y1 + 1, lip);
        p.line(x0, y0, x1, y1, groove);
      };
      if (k < 4) {
        const x = gx + k * 2.5 + (mr() - 0.5);
        scratch(x, gy + mr() * 1.5, x + (mr() - 0.5) * 1.6, gy + 9 + mr() * 1.5);
      } else scratch(gx - 2, gy + 8 + mr(), gx + 11, gy + 1 + mr());
      if (bloody && mr() < 0.4) { const dx = gx + k * 2; for (let j = 0; j < 2 + mr() * 6; j++) p.set(dx, gy + 10 + j, j % 3 === 2 ? 0x3a0508 : 0x8c0f12); }
    }
    return p.toCanvas();
  }
  return hubWallPix(T, T, 801).toCanvas();
}

// =================================================================== doors
const DOOR_COL: Record<string, number[]> = {
  standard: [0xe0f4ff, 0x3a8cff, 0x14306a],
  elite: [0xffe0d0, 0xff2a2a, 0x6a0a10],
  unknown: [0xfff8d0, 0xffc83b, 0x6a4a0a],
  corrupted: [0xf0ffd0, 0x8aff3a, 0x2a5a0a],
};

export function buildDoor(kind: string, open: boolean): HTMLCanvasElement {
  const W = 64, H = 96;
  const p = new Pix(W, H);
  const r = makeRng(900 + kind.length * 7 + (open ? 1 : 0));
  const C = DOOR_COL[kind] ?? DOOR_COL.standard;
  const FR = 0x3a3e46, PL = kind === 'corrupted' ? 0x3a4038 : 0x50565e;
  // frame
  noiseFill(p, FR, 181, 0.15, 8);
  hazard(p, 0, 6, 0, W);
  for (let y = 6; y < H; y++) { tint(p, 5, y, -0.6); tint(p, 58, y, -0.6); tint(p, 0, y, 0.3); }
  for (let y = 10; y < H; y += 12) { rivet(p, 1, y, FR); rivet(p, 60, y, FR); }
  if (open) {
    for (let y = 6; y < H; y++) for (let x = 6; x < 58; x++) {
      const t = (y - 6) / (H - 6);
      const c = mix(0x020203, mix(0x0a0c10, mul(C[2], 0.5), 0.3), Math.max(0, t - 0.65) * 2.4);
      p.set(x, y, bayer(x, y) < 0.15 && t > 0.8 ? lit(c, 0.3) : c);
    }
    // retracted panel lips
    for (let y = 6; y < H; y++) { p.set(6, y, PL); p.set(7, y, lit(PL, -0.5)); p.set(57, y, lit(PL, -0.3)); p.set(56, y, lit(PL, -0.6)); }
    for (let x = 6; x < 58; x++) { p.set(x, 6, lit(PL, -0.2)); p.set(x, 7, lit(PL, -0.6)); }
    for (let x = 24; x < 40; x++) p.set(x, 2, C[1], F_EMIT);
    p.rect(30, 1, 4, 3, C[0], F_EMIT);
    return p.toCanvas();
  }
  // panels
  for (const [x0, w] of [[6, 26], [32, 26]]) {
    for (let y = 6; y < H; y++) for (let x = x0; x < x0 + w; x++) p.set(x, y, ramp(PL, (x0 === 6 ? 0.1 : -0.15) + (bayer(x, y) - 0.5) * 0.2, x, y));
    panel(p, x0, 6, w, H - 6, 0.6, 0.3);
    for (let y = 18; y < H; y += 14) { for (let x = x0 + 1; x < x0 + w - 1; x++) { tint(p, x, y, -0.55); tint(p, x, y + 1, 0.3); } }
    for (let y = 10; y < H; y += 14) { rivet(p, x0 + 2, y, PL); rivet(p, x0 + w - 4, y, PL); }
  }
  // center seam glow
  for (let y = 6; y < H; y++) { p.set(31, y, C[1], F_EMIT); p.set(32, y, C[0], F_EMIT); p.set(30, y, C[2], F_EMIT); p.set(33, y, C[2], F_EMIT); }
  // chevrons pointing to center
  for (let k = 0; k < 3; k++) {
    const cy = 48, lx = 11 + k * 6, rx = 52 - k * 6;
    const c = k === 2 ? C[0] : C[1];
    for (let i = 0; i < 4; i++) {
      for (const t of [0, 1]) {
        p.set(lx + i + t, cy - 3 + i, c, F_EMIT); p.set(lx + i + t, cy + 3 - i, c, F_EMIT);
        p.set(rx - i - t, cy - 3 + i, c, F_EMIT); p.set(rx - i - t, cy + 3 - i, c, F_EMIT);
      }
    }
  }
  // status lamp on lintel
  p.rect(26, 1, 12, 4, 0x1a1c20);
  for (let x = 27; x < 37; x++) p.set(x, 2, (x & 1) ? C[1] : C[0], F_EMIT);
  // corner light bars
  for (let y = 12; y < 22; y++) { p.set(9, y, C[1], F_EMIT); p.set(54, y, C[1], F_EMIT); }
  // grime
  streaks(p, r, 10, 0x1a1a1e, 24, 0.3);
  speckle(p, r, 160, 0.2);
  if (kind === 'corrupted') {
    for (let i = 0; i < 9; i++) vein(p, r, 6 + r() * 52, 60 + r() * 34, 26, 0x2a5a14);
    for (let i = 0; i < 6; i++) { const x = 8 + r() * 46, y = 70 + r() * 24; glowBlob(p, x, y, 1.4, C[0], C[1], C[2]); }
    for (let k = 0; k < 5; k++) {
      const y = Math.floor(r() * H), h = 1 + Math.floor(r() * 3), d = Math.floor((r() - 0.5) * 8);
      for (let yy = y; yy < y + h; yy++) { const row: number[] = []; for (let x = 0; x < W; x++) row.push(p.get(x, yy)); for (let x = 0; x < W; x++) { const c = row[(x - d + W) % W]; if (c >= 0) p.set(x, yy, c); } }
    }
  }
  if (kind === 'unknown') {
    // question glyph panel
    p.rect(26, 64, 12, 14, 0x141518);
    for (const [x, y] of [[29, 66], [30, 65], [31, 65], [32, 65], [33, 65], [34, 66], [34, 67], [33, 68], [32, 69], [31, 70], [31, 71], [31, 74]]) p.set(x, y, C[1], F_EMIT);
  }
  if (kind === 'elite') {
    p.rect(26, 64, 12, 12, 0x141518);
    for (let i = 0; i < 8; i++) { p.set(28 + i, 66 + i, C[1], F_EMIT); p.set(35 - i, 66 + i, C[1], F_EMIT); }
  }
  return p.toCanvas();
}

// =================================================================== terminal
export function buildTerminal(frame: number): HTMLCanvasElement {
  const W = 48, H = 36;
  const p = new Pix(W, H);
  const r = makeRng(1200); // stable text
  const fr = makeRng(1300 + frame);
  p.rect(0, 0, W, H, 0x3a3e46);
  panel(p, 0, 0, W, H, 0.6, 0.35);
  p.rect(3, 3, W - 6, 27, 0x14161a);
  panel(p, 3, 3, W - 6, 27, -0.3, -0.4);
  const flick = frame % 4 === 2 ? 1.25 : frame % 4 === 0 ? 1 : 0.9;
  for (let y = 5; y < 28; y++) for (let x = 5; x < W - 5; x++) p.set(x, y, (y & 1) ? 0x031008 : 0x051a0c, F_EMIT);
  const G = mul(0x3aff6a, flick), D = mul(0x1a8a3a, flick);
  const scroll = frame % 4;
  for (let row = 0; row < 7; row++) {
    const y = 6 + row * 3;
    const lr = makeRng(1400 + row + scroll * 13);
    let x = 6 + (row === 0 ? 0 : Math.floor(lr() * 3));
    const glitch = frame % 4 === 2 && row === 3 ? 3 : 0;
    while (x < W - 8) {
      const len = 1 + Math.floor(lr() * 6);
      const c = lr() < 0.25 ? D : G;
      for (let i = 0; i < len && x + i < W - 6; i++) if (lr() < 0.85) { p.set(x + i + glitch, y, c, F_EMIT); if (lr() < 0.3) p.set(x + i + glitch, y + 1, mul(c, 0.5), F_EMIT); }
      x += len + 1 + Math.floor(lr() * 2);
      if (lr() < 0.12) break;
    }
  }
  if (frame % 2 === 0) p.rect(6 + Math.floor(r() * 20), 25, 3, 2, G, F_EMIT);
  // glare
  for (let i = 0; i < 6; i++) p.set(W - 9 + i * 0.4, 5 + i, mix(p.get(W - 9, 5 + i), 0xffffff, 0.15), F_EMIT);
  // keypad
  for (let i = 0; i < 6; i++) { p.rect(6 + i * 6, 31, 4, 2, 0x22252a); tint(p, 6 + i * 6, 31, 0.4); }
  p.set(W - 6, 32, fr() < 0.5 ? 0xff3030 : 0x5a1010, F_EMIT);
  p.set(W - 8, 32, 0x3aff6a, F_EMIT);
  return p.toCanvas();
}

// =================================================================== crate
export function buildCrate(biome: number): HTMLCanvasElement {
  const S = 32;
  const p = new Pix(S, S);
  const r = makeRng(1500 + biome);
  if (biome === 0) {
    noiseFill(p, 0x7a4628, 191, 0.3, 4, 0x9a5a28);
    for (let i = 0; i < S; i++) { p.set(i, i, 0x4a2a18); p.set(i, S - 1 - i, 0x4a2a18); p.set(i + 1, i, 0x9a6a3a); p.set(i + 1, S - 1 - i, 0x9a6a3a); }
    for (let i = 0; i < S; i++) for (let k = 0; k < 3; k++) { p.set(i, k, 0x4a3a30); p.set(i, S - 1 - k, 0x3a2a20); p.set(k, i, 0x4a3a30); p.set(S - 1 - k, i, 0x3a2a20); }
    panel(p, 0, 0, S, S, 0.6, 0.35); panel(p, 3, 3, S - 6, S - 6, -0.4, -0.4);
    for (const [x, y] of [[1, 1], [29, 1], [1, 29], [29, 29]]) rivet(p, x, y, 0x6a5a4a);
    hazard(p, 13, 6, 10, 12);
    streaks(p, r, 6, 0x1a0e08, 10, 0.4);
  } else if (biome === 1) {
    noiseFill(p, 0x52606c, 201, 0.12, 4);
    for (let y = 4; y < S - 4; y += 4) for (let x = 2; x < S - 2; x++) { tint(p, x, y, -0.45); tint(p, x, y + 1, 0.25); }
    panel(p, 0, 0, S, S, 0.65, 0.35);
    for (let i = 0; i < S; i++) { p.set(i, 0, 0x2a323c); p.set(i, 1, 0x7a8a98); }
    p.rect(4, 13, 24, 6, 0xd8dce0); for (let x = 5; x < 27; x += 4) p.rect(x, 14, 2, 4, 0x2a323c);
    p.set(27, 5, 0x5ab8ff, F_EMIT); p.set(27, 7, 0x3aff8a, F_EMIT);
    speckle(p, r, 60, 0.15);
  } else {
    noiseFill(p, 0x2a2226, 211, 0.2, 4);
    panel(p, 0, 0, S, S, 0.6, 0.3);
    for (let i = 0; i < S; i++) { const s = ((i >> 2) & 1); p.set(i, 3, s ? 0x9a1a1a : 0x141012); p.set(i, 4, s ? 0x9a1a1a : 0x141012); p.set(i, 27, s ? 0x9a1a1a : 0x141012); p.set(i, 28, s ? 0x9a1a1a : 0x141012); }
    for (let x = 0; x < S; x++) for (let y = 14; y < 18; y++) p.set(x, y, ramp(0x8a2a30, Math.sin(x * 1.1 + y) * 0.7 - (y - 14) * 0.2, x, y));
    for (let i = 0; i < 4; i++) vein(p, r, r() * S, r() * S, 12, 0x6a1018);
    for (let i = 0; i < 4; i++) { const x = 4 + r() * 24; for (let y = 18; y < 18 + r() * 8; y++) p.set(x, y, 0x5a0810); }
    p.set(8, 9, 0xff2a2a, F_EMIT); p.set(23, 9, 0xff2a2a, F_EMIT);
  }
  return p.toCanvas();
}

// =================================================================== mirror
export function buildMirror(frame: number): HTMLCanvasElement {
  const W = 32, H = 64;
  const p = new Pix(W, H);
  const fr = makeRng(1600 + frame);
  // glass
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = y / H;
    let c = mix(0x4a5862, 0x1a2228, t * 0.9 + Math.abs(x - 16) / 40);
    if (((x + y * 0.6) | 0) % 23 < 2 && y < 40) c = lit(c, 0.18);
    p.set(x, y, bayer(x, y) < 0.08 ? lit(c, 0.1) : c);
  }
  // silhouette (dark, slightly darker than glass), head tilted
  const sil = 0x0a0d10, rim = 0x6a8088;
  const tilt = frame % 4 === 2 ? 3 : 2;
  const hx = 16 + tilt * 0.6, hy = 18;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - hx, dy = y + 0.5 - hy;
    const a = -0.35 * (tilt / 2);
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    const inHead = (rx / 5.5) ** 2 + (ry / 6.5) ** 2 <= 1;
    const inNeck = Math.abs(x + 0.5 - 16) < 3 && y > 22 && y < 28;
    const sh = y >= 27 ? 6 + Math.min(9, (y - 27) * 1.4) : -1;
    const inBody = sh > 0 && Math.abs(x + 0.5 - 16) < sh && y < 60;
    if (inHead || inNeck || inBody) p.set(x, y, sil);
  }
  // rim light
  const cp = p.clone();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (cp.get(x, y) === sil && cp.get(x - 1, y) !== sil && cp.get(x - 1, y) >= 0) p.set(x, y, rim);
  // eyes: two normal-ish, plus faint extra ones
  const flick = frame % 4 === 1;
  const eye = (x: number, y: number, c: number): void => p.set(x, y, c, F_EMIT);
  eye(hx - 2, hy, 0xd0f8ff); eye(hx - 3, hy, 0x6aa8b0); eye(hx + 2, hy - 1, 0xd0f8ff); eye(hx + 1, hy - 1, 0x6aa8b0);
  eye(hx, hy - 3, flick ? 0x7ab0b8 : 0x3a6a70); eye(hx + 3, hy + 2, 0x3a6a70); eye(hx - 2, hy + 3, flick ? 0x5a8a90 : 0x2a4a50);
  // grime frame
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const e = Math.min(x, y, W - 1 - x, H - 1 - y);
    if (e < 2) p.set(x, y, e === 0 ? 0x26241f : ramp(0x6a6458, y < 2 || x < 2 ? 0.4 : -0.4, x, y));
    else if (e < 5 && fr() < 0.25) p.tint(x, y, (c) => mix(c, 0x3a3428, 0.4));
  }
  // crack
  let cx = 27, cy = 4;
  for (let i = 0; i < 18; i++) { p.set(cx, cy, 0x8a9aa0); cx += fr() < 0.5 ? -1 : 0; cy += 1; }
  if (frame % 4 === 2) { const y = 14 + Math.floor(fr() * 20); const row: number[] = []; for (let x = 0; x < W; x++) row.push(p.get(x, y)); for (let x = 2; x < W - 2; x++) { const c = row[x - 2]; if (c >= 0) p.set(x, y, c); } }
  return p.toCanvas();
}

// =================================================================== body
export function buildBody(variant: number): HTMLCanvasElement {
  const W = 48, H = 24;
  const v = Math.max(0, Math.min(3, variant | 0));
  const p = new Pix(W, H);
  const r = makeRng(1700 + v);
  const fat = [0x5a5a3a, 0x52563a, 0x4a5440, 0x4a5a46][v];
  const fat2 = lit(fat, -0.3);
  const plate = [0, 0, 0x5c625c, 0x5c625c][v];
  const skin = 0xa87a60;
  // blood pool
  for (let y = 18; y < 24; y++) for (let x = 4; x < 44; x++) {
    const d = ((x - 22) / 20) ** 2 + ((y - 21.5) / 2.6) ** 2 + (r() - 0.5) * 0.3;
    if (d < 1) p.set(x, y, d < 0.5 ? 0x3a0508 : 0x7a0c12);
  }
  // legs outstretched to the right
  part(p, (l) => {
    l.limb(22, 17, 36, 18, 2.6, fat); l.limb(36, 18, 42, 19, 2.2, fat2);
    l.limb(22, 20, 34, 21, 2.6, fat2); l.limb(34, 21, 40, 21.5, 2.2, fat);
    l.box(41, 15, 4, 6, 0x24221e); l.box(39, 19, 4, 4, 0x24221e);
    if (v >= 2) { l.box(32, 15, 4, 4, plate); l.box(30, 19, 4, 3, plate); }
  });
  // torso slumped against wall (left)
  part(p, (l) => {
    l.poly([6, 22, 4, 10, 8, 6, 18, 7, 24, 14, 24, 22], fat);
    for (let y = 9; y < 22; y++) l.set(13, y, fat2);
    if (v >= 1) { l.box(8, 9, 12, 9, v >= 3 ? plate : lit(fat, -0.15)); l.box(9, 12, 3, 3, fat2); l.box(15, 12, 3, 3, fat2); }
    if (v >= 3) { l.set(10, 10, 0xc8faff); }
  });
  // arm limp
  part(p, (l) => { l.limb(18, 9, 22, 15, 1.8, fat); l.limb(22, 15, 27, 16, 1.6, fat2); l.box(26, 15, 3, 3, v >= 2 ? 0x2c332c : skin); });
  // head drooped
  part(p, (l) => {
    if (v >= 2) {
      l.ball(10, 5.5, 4.6, 4.2, v === 3 ? 0x4a5a46 : 0x3e4a3a);
      for (let x = 8; x < 14; x++) l.set(x, 7, 0x0c1012, F_FLAT);
      for (let x = 9; x < 13; x++) l.set(x, 7, v === 3 ? 0x3a6a70 : 0x1a2a2e, F_FLAT);
    } else {
      l.ball(10, 5.5, 4, 4, skin);
      for (let x = 7; x < 14; x++) for (let y = 1; y < 4; y++) if (l.has(x, y)) l.set(x, y, 0x3a2a1e);
      l.set(9, 6, 0x2a1810); l.set(12, 6, 0x2a1810);
      l.set(11, 8, 0x6a1a1a);
    }
  });
  p.set(13, 10, 0x8c0f12); p.set(14, 11, 0x8c0f12); p.set(14, 12, 0x5a060c);
  return p.toCanvas();
}
