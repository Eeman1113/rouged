// Biome textures, wave 2: 3 THE NURSERY, 4 THE CANOPY, 5 THE FRONT, 6 THE MIRROR.
// 64x64 tileable walls/floors/ceilings, 32x32 crates.
import { Pix, Rng, makeRng, makeNoise, mix, lit, ramp, bayer, F_EMIT, glowBlob } from './core';
import { noiseFill, tint, panel, rivet, streaks, speckle, hazard, hcyl, glowStrip, vein } from './textures';

const T = 64;

function newTile(seed: number): [Pix, Rng] {
  const p = new Pix(T, T); p.wrap = true;
  return [p, makeRng(seed)];
}

/** Grid of square tiles with grout. */
function tiles(p: Pix, r: Rng, size: number, base: number, grout: number, jitter: number, offsetRows = false): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const ox = offsetRows && ((Math.floor(y / size)) & 1) ? size / 2 : 0;
    const u = (x + ox) % size, v = y % size;
    if (u === 0 || v === 0) { p.set(x, y, grout); continue; }
    const id = Math.floor((x + ox) / size) * 31 + Math.floor(y / size) * 17;
    const k = ((id * 2654435761) >>> 0) / 4294967296;
    let c = lit(base, (k - 0.5) * jitter + (bayer(x, y) - 0.5) * 0.05);
    if (u === 1 || v === 1) c = lit(c, 0.25);
    if (u === size - 1 || v === size - 1) c = lit(c, -0.3);
    p.set(x, y, c);
  }
  void r;
}

function crack(p: Pix, r: Rng, x: number, y: number, n: number, col: number): void {
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    ang += (r() - 0.5) * 1.2;
    x += Math.cos(ang); y += Math.sin(ang);
    p.set(x, y, col); tint(p, x + 1, y + 1, 0.25);
    if (r() < 0.08) crack(p, r, x, y, n * 0.35, col);
  }
}

function blot(p: Pix, r: Rng, cx: number, cy: number, rr: number, col: number, amt: number): void {
  for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) {
    const d = (x * x + y * y) / (rr * rr);
    if (d < 1 && r() < 1.1 - d) p.tint(cx + x, cy + y, (c) => mix(c, col, amt * (1 - d * 0.6)));
  }
}

function glitchRows(p: Pix, r: Rng, n: number, maxShift: number, col?: number): void {
  for (let k = 0; k < n; k++) {
    const y = Math.floor(r() * T), h = 1 + Math.floor(r() * 2), d = Math.floor((r() - 0.5) * 2 * maxShift);
    for (let yy = y; yy < y + h; yy++) {
      const row: number[] = []; for (let x = 0; x < T; x++) row.push(p.get(x, yy));
      for (let x = 0; x < T; x++) { const c = row[((x - d) % T + T) % T]; if (c >= 0) p.set(x, yy, c); }
      if (col !== undefined) { const x0 = Math.floor(r() * T), L = 4 + Math.floor(r() * 14); for (let i = 0; i < L; i++) p.set(x0 + i, yy, col, F_EMIT); }
    }
  }
}

// =================================================================== NURSERY
function nurseryWall(v: number): Pix {
  const [p, r] = newTile(1100 + v);
  if (v === 0) {
    tiles(p, r, 8, 0xd8dccc, 0x8a948a, 0.12);
    // grime toward the bottom + green seep
    for (let y = 40; y < T; y++) for (let x = 0; x < T; x++) if (r() < (y - 40) / 40) p.tint(x, y, (c) => mix(c, 0x6a7a4a, 0.25));
    streaks(p, r, 9, 0x5a7a3a, 22, 0.35);
    for (let i = 0; i < 3; i++) { const cx = 8 + Math.floor(r() * 6) * 8, cy = 8 + Math.floor(r() * 6) * 8; crack(p, r, cx + 4, cy + 4, 10, 0x5a6058); }
    speckle(p, r, 120, 0.1);
  } else if (v === 1) {
    noiseFill(p, 0xb8bcb4, 1201, 0.08, 8);
    panel(p, 0, 0, 64, 64, 0.5, 0.3);
    // vat window with fluid
    p.rect(8, 6, 48, 50, 0x5a625e); panel(p, 8, 6, 48, 50, 0.5, 0.35);
    for (let y = 10; y < 52; y++) for (let x = 12; x < 52; x++) {
      const t = Math.abs(x - 32) / 20, d = t * 0.7 + (y - 10) / 42 * 0.25 + (bayer(x, y) - 0.5) * 0.3;
      p.set(x, y, d < 0.25 ? 0x7ae050 : d < 0.5 ? 0x3aa040 : d < 0.8 ? 0x16502a : 0x0a2a18, F_EMIT);
    }
    // dim specimen silhouette
    p.ellipse(30, 26, 6, 5.5, 0x0c2a16, 0); p.ellipse(33, 36, 7, 9, 0x0c2a16, 0); p.ellipse(28, 42, 4, 3, 0x0c2a16, 0);
    for (let i = 0; i < 14; i++) p.set(14 + r() * 36, 12 + r() * 38, 0xd8ffb0, F_EMIT);
    for (let y = 10; y < 52; y++) { p.set(15, y, mix(p.get(15, y), 0xffffff, 0.55), F_EMIT); if (y % 3) p.set(17, y, mix(p.get(17, y), 0xffffff, 0.25), F_EMIT); }
    for (const [x, y] of [[9, 7], [53, 7], [9, 53], [53, 53]]) rivet(p, x, y, 0x7a827e);
    // pipe in/out
    hcyl(p, 58, 5, 0x8a9290);
  } else {
    tiles(p, r, 16, 0xc8ccc0, 0x7a847a, 0.08);
    // organic cables running vertically, clamped
    for (const cx of [10, 26, 44, 56]) {
      const rad = cx === 26 ? 4 : 3;
      const col = cx % 20 === 6 ? 0x8a5a5e : 0x6a4a50;
      for (let y = 0; y < T; y++) {
        const wob = Math.round(Math.sin(y * 0.2 + cx) * 1.5);
        for (let x = -rad; x <= rad; x++) { const nx = x / (rad + 0.5); p.set(cx + x + wob, y, ramp(col, -nx * 0.9 + (Math.abs(nx + 0.4) < 0.2 ? 0.5 : 0), cx + x, y)); }
        if (y % 6 === 0) tint(p, cx + wob, y, -0.4);
      }
      for (let y = 8 + cx % 16; y < T; y += 28) { p.rect(cx - rad - 2, y, rad * 2 + 5, 3, 0x8a9290); tint(p, cx - rad - 2, y, 0.5); rivet(p, cx - rad - 1, y, 0x8a9290); }
    }
    for (let i = 0; i < 4; i++) p.set(4 + r() * 56, r() * T, 0x9aff6a, F_EMIT);
    streaks(p, r, 6, 0x5a3a3e, 14, 0.3);
  }
  return p;
}

function nurseryFloor(): Pix {
  const [p, r] = newTile(1300);
  tiles(p, r, 16, 0xb8c0b0, 0x5a645a, 0.1);
  for (let i = 0; i < 5; i++) blot(p, r, r() * T, r() * T, 3 + r() * 6, 0x5a8a3a, 0.35);
  // drain
  p.rect(26, 26, 12, 12, 0x3a423e); panel(p, 26, 26, 12, 12, -0.3, -0.3);
  for (let y = 28; y < 36; y += 2) for (let x = 28; x < 36; x++) p.set(x, y, 0x0a120c);
  p.set(31, 33, 0x3aa040, F_EMIT);
  speckle(p, r, 160, 0.1);
  return p;
}

function nurseryCeil(): Pix {
  const [p, r] = newTile(1310);
  noiseFill(p, 0xa8aca4, 1311, 0.06, 8);
  for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32, 0.5, 0.2);
  for (let y = 6; y < 26; y++) for (let x = 6; x < 26; x++) p.set(x, y, ((x + y) & 1) ? 0xd8f4d0 : 0xeafff0, F_EMIT);
  panel(p, 5, 5, 22, 22, 0.5, 0.2);
  for (let x = 6; x < 26; x += 5) for (let y = 6; y < 26; y++) p.set(x, y, 0x9ab0a0, F_EMIT);
  for (let x = 36; x < 60; x += 3) for (let y = 36; y < 60; y++) p.set(x, y, (y & 1) ? 0x5a605a : 0x7a807a);
  streaks(p, r, 5, 0x5a7a3a, 10, 0.25);
  return p;
}

// =================================================================== CANOPY (jungle)
const BIO_HOT = 0xeaffd0, BIO = 0x9aff4a, BIO_TEAL = 0x3ae8c8, BIO_DIM = 0x1a7a5a;

function leaf(p: Pix, x: number, y: number, ang: number, len: number, col: number): void {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  for (let i = 0; i < len; i++) {
    const w = Math.sin((i / len) * Math.PI) * len * 0.28;
    for (let j = -w; j <= w; j += 0.5) {
      const px = x + dx * i - dy * j, py = y + dy * i + dx * j;
      p.set(px, py, ramp(col, (j < 0 ? 0.35 : -0.25) - i / len * 0.2, Math.floor(px), Math.floor(py)));
    }
    p.set(x + dx * i, y + dy * i, lit(col, -0.45));
  }
}

function hangingVine(p: Pix, r: Rng, x: number, y0: number, len: number, col: number): void {
  let xx = x;
  for (let y = y0; y < y0 + len; y++) {
    p.set(xx, y, col); tint(p, xx + 1, y, -0.4);
    if (r() < 0.2) xx += r() < 0.5 ? -1 : 1;
    if (y % 5 === 0) leaf(p, xx, y, r() < 0.5 ? 0.6 : Math.PI - 0.6, 4 + r() * 3, lit(col, 0.2));
  }
}

function canopyWall(v: number): Pix {
  const [p, r] = newTile(1400 + v);
  if (v === 0) {
    // mossy carved stone blocks
    noiseFill(p, 0x6a6a58, 1401, 0.25, 8);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const row = Math.floor(y / 16), ox = (row & 1) * 16;
      if (((x + ox) % 32 === 0) || y % 16 === 0) p.set(x, y, 0x24261c);
      else if (((x + ox) % 32 === 1) || y % 16 === 1) tint(p, x, y, 0.25);
      else if (((x + ox) % 32 === 31) || y % 16 === 15) tint(p, x, y, -0.35);
    }
    // carved glyph on one block
    for (const [x, y] of [[8, 20], [9, 20], [10, 20], [8, 21], [8, 22], [9, 22], [10, 22], [10, 23], [10, 24], [9, 24], [8, 24], [14, 20], [14, 21], [14, 22], [14, 23], [14, 24], [13, 22], [15, 22]]) { p.set(x, y, 0x34362a); tint(p, x + 1, y + 1, 0.3); }
    // moss from the top of each block
    const n = makeNoise(1402, 8);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (n(x / 8, y / 8) > 0.55 + (y % 16) / 40) p.set(x, y, ramp(0x4a7a2a, n(x / 4, y / 4) - 0.5, x, y));
    for (let i = 0; i < 4; i++) hangingVine(p, r, Math.floor(r() * T), Math.floor(r() * 20), 18 + r() * 24, 0x3a6a24);
  } else if (v === 1) {
    // giant bark trunk
    const n = makeNoise(1411, 8);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const g = Math.sin(x * 0.55 + n(x / 8, y / 16) * 5) * 0.5 + 0.5;
      p.set(x, y, ramp(0x5a4030, g * 1.3 - 0.75 + (n(x / 4, y / 4) - 0.5) * 0.6, x, y, 5));
    }
    for (let i = 0; i < 6; i++) blot(p, r, r() * T, r() * T, 4 + r() * 6, 0x4a7a2a, 0.6);
    // roots crawling across
    for (let i = 0; i < 3; i++) vein(p, r, r() * T, r() * T, 50, 0x3a2a1e);
    // fungus shelves
    for (const [x, y] of [[14, 40], [46, 18]]) { p.ellipse(x, y, 5, 1.6, 0xb0a070); p.ellipse(x, y + 1, 4, 1, 0x6a5a3a); p.set(x - 2, y + 1, BIO_TEAL, F_EMIT); p.set(x + 2, y + 1, BIO, F_EMIT); }
  } else {
    // overgrown stone with dense vines curtain
    noiseFill(p, 0x5a5c4a, 1421, 0.2, 8);
    for (let y = 0; y < T; y += 32) for (let x = 0; x < T; x++) { p.set(x, y, 0x24261c); tint(p, x, y + 1, 0.25); }
    for (let x = 0; x < T; x += 4) hangingVine(p, r, x + Math.floor(r() * 3), Math.floor(r() * 10) - 8, 30 + r() * 40, r() < 0.5 ? 0x2e5a1e : 0x3e6e26);
    for (let i = 0; i < 18; i++) leaf(p, r() * T, r() * T, r() * Math.PI * 2, 5 + r() * 4, r() < 0.5 ? 0x4a8a30 : 0x3a7028);
    for (let i = 0; i < 4; i++) { const x = r() * T, y = r() * T; p.set(x, y, 0xd04a7a); p.set(x + 1, y, 0xe07090); p.set(x, y + 1, 0xa03050); }
  }
  return p;
}

function canopyFloor(): Pix {
  const [p, r] = newTile(1500);
  noiseFill(p, 0x4a3a26, 1501, 0.28, 8, 0x3a2a1a);
  // puddles of mud
  for (let i = 0; i < 3; i++) blot(p, r, r() * T, r() * T, 5 + r() * 5, 0x2a1e14, 0.6);
  // leaf litter
  const cols = [0x6a5a2a, 0x8a6a2a, 0x5a6a28, 0x7a4a22, 0x4a6a2a];
  for (let i = 0; i < 46; i++) leaf(p, r() * T, r() * T, r() * Math.PI * 2, 3 + r() * 4, cols[Math.floor(r() * cols.length)]);
  // twigs
  for (let i = 0; i < 6; i++) { const x = r() * T, y = r() * T, a = r() * 6.28, L = 5 + r() * 8; p.line(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, 0x3a2a1a); }
  for (let i = 0; i < 3; i++) { const x = r() * T, y = r() * T; p.set(x, y, BIO_TEAL, F_EMIT); p.set(x + 1, y, BIO_DIM, F_EMIT); }
  speckle(p, r, 120, 0.2);
  return p;
}

function canopyCeil(): Pix {
  const [p, r] = newTile(1510);
  noiseFill(p, 0x1a2a14, 1511, 0.25, 8);
  const cols = [0x2a4a1e, 0x3a6024, 0x24401a, 0x4a7a2a];
  for (let i = 0; i < 70; i++) leaf(p, r() * T, r() * T, r() * Math.PI * 2, 6 + r() * 6, cols[Math.floor(r() * cols.length)]);
  // gaps of sky / light through leaves
  for (let i = 0; i < 4; i++) { const x = r() * T, y = r() * T; glowBlob(p, x, y, 1.6, 0xf0ffd0, 0xb8e890, 0x5a8a3a); }
  for (let i = 0; i < 5; i++) { const x = r() * T, y = r() * T; p.set(x, y, BIO, F_EMIT); }
  return p;
}

// =================================================================== FRONT (war-torn)
const FIRE_HOT = 0xfff0b0, FIRE = 0xff8a20, FIRE_DIM = 0x8a2a08;

function bulletHole(p: Pix, x: number, y: number): void {
  p.set(x, y, 0x0c0a0a); p.set(x + 1, y, 0x1a1614); p.set(x, y + 1, 0x1a1614);
  tint(p, x - 1, y, 0.3); tint(p, x, y - 1, 0.3); tint(p, x + 2, y + 1, -0.3); tint(p, x + 1, y + 2, -0.3);
}

function scorch(p: Pix, r: Rng, cx: number, cy: number, rr: number): void {
  for (let y = -rr; y < rr; y++) for (let x = -rr; x < rr; x++) {
    const d = Math.sqrt(x * x + y * y) / rr + (r() - 0.5) * 0.3;
    if (d < 1) p.tint(cx + x, cy + y, (c) => mix(c, 0x0e0c0a, (1 - d) * 0.85));
  }
}

function frontWall(v: number): Pix {
  const [p, r] = newTile(1600 + v);
  if (v === 0) {
    noiseFill(p, 0x7a766c, 1601, 0.2, 8, 0x8a8478);
    for (let y = 0; y < T; y += 32) for (let x = 0; x < T; x++) { p.set(x, y, 0x3a3832); tint(p, x, y + 1, 0.2); }
    for (let x = 0; x < T; x += 32) for (let y = 0; y < T; y++) { p.set(x, y, 0x3a3832); tint(p, x + 1, y, 0.2); }
    for (let i = 0; i < 4; i++) crack(p, r, r() * T, r() * T, 18, 0x2a2824);
    for (let i = 0; i < 14; i++) bulletHole(p, Math.floor(r() * T), Math.floor(r() * T));
    scorch(p, r, 44, 40, 14);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (r() < 0.06) p.tint(x, y, (c) => mix(c, 0xc8c4bc, 0.3)); // ash
    streaks(p, r, 8, 0x2a2824, 20, 0.3);
  } else if (v === 1) {
    // cracked bricks
    noiseFill(p, 0x5a4a40, 1611, 0.1, 8);
    for (let by = 0; by < 8; by++) for (let bx = 0; bx < 4; bx++) {
      const x0 = bx * 16 + ((by & 1) ? 8 : 0), y0 = by * 8;
      const k = r();
      if (k < 0.08) { for (let y = 1; y < 8; y++) for (let x = 1; x < 16; x++) p.set(x0 + x, y0 + y, 0x161210); continue; }
      const base = k < 0.3 ? 0x7a3a2a : k < 0.6 ? 0x8a4430 : 0x6a3426;
      for (let y = 1; y < 8; y++) for (let x = 1; x < 16; x++) {
        let c = lit(base, (bayer(x0 + x, y0 + y) - 0.5) * 0.18);
        if (y === 1) c = lit(c, 0.25); if (y === 7 || x === 15) c = lit(c, -0.3);
        p.set(x0 + x, y0 + y, c);
      }
      if (k > 0.85) crack(p, r, x0 + 8, y0 + 4, 6, 0x2a1810);
    }
    scorch(p, r, 16, 50, 12);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (r() < 0.05) p.tint(x, y, (c) => mix(c, 0xb8b4ac, 0.35));
    for (let i = 0; i < 6; i++) bulletHole(p, Math.floor(r() * T), Math.floor(r() * T));
  } else {
    // bunker: reinforced concrete with exposed rebar, hazard stencil
    noiseFill(p, 0x6a685e, 1621, 0.18, 8);
    panel(p, 0, 0, 64, 40, 0.5, 0.2);
    p.rect(18, 10, 22, 16, 0x2a2622); panel(p, 18, 10, 22, 16, -0.4, -0.3); // blasted hole
    for (let i = 0; i < 4; i++) { const y = 12 + i * 4; p.line(16, y, 42, y + (i % 2), 0x6a3a22); p.line(16, y + 1, 42, y + 1 + (i % 2), 0x3a1e12); }
    for (let x = 0; x < T; x++) for (let y = 9; y < 28; y++) if (Math.abs(x - 29) > 13 - Math.sin(y) * 2 && Math.abs(x - 29) < 15 && r() < 0.5) tint(p, x, y, -0.3);
    hazard(p, 44, 6);
    for (let x = 0; x < T; x++) for (let y = 44; y < 50; y++) if (r() < 0.3) p.tint(x, y, (c) => mix(c, 0x3a3630, 0.6));
    scorch(p, r, 50, 30, 10);
    for (let x = 6; x < T; x += 14) { rivet(p, x, 54, 0x6a685e); rivet(p, x, 60, 0x6a685e); }
    speckle(p, r, 160, 0.2);
  }
  return p;
}

function frontFloor(): Pix {
  const [p, r] = newTile(1700);
  noiseFill(p, 0x4e4a44, 1701, 0.3, 8, 0x6a665e);
  // rubble chunks
  for (let i = 0; i < 26; i++) {
    const x = r() * T, y = r() * T, s = 1 + r() * 2.5;
    p.ellipse(x, y, s, s * 0.8, lit(0x7a766c, (r() - 0.5) * 0.6));
    tint(p, x + s, y + s * 0.6, -0.5);
  }
  for (let i = 0; i < 2; i++) scorch(p, r, r() * T, r() * T, 10 + r() * 6);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (r() < 0.08) p.tint(x, y, (c) => mix(c, 0xb8b4ac, 0.4));
  // shell casings + embers
  for (let i = 0; i < 6; i++) { const x = r() * T, y = r() * T; p.set(x, y, 0xc8a040); p.set(x + 1, y, 0x8a6a20); }
  for (let i = 0; i < 4; i++) p.set(r() * T, r() * T, r() < 0.5 ? FIRE : FIRE_DIM, F_EMIT);
  return p;
}

function frontCeil(): Pix {
  const [p, r] = newTile(1710);
  noiseFill(p, 0x4a4842, 1711, 0.22, 8);
  for (const [x, y] of [[0, 0], [32, 0], [0, 32], [32, 32]]) panel(p, x, y, 32, 32, 0.5, 0.2);
  for (let i = 0; i < 4; i++) crack(p, r, r() * T, r() * T, 22, 0x1e1c18);
  // exposed rebar through a broken patch
  p.rect(36, 36, 20, 14, 0x1a1816);
  for (let i = 0; i < 3; i++) p.line(34, 39 + i * 4, 58, 38 + i * 4, 0x6a3a22);
  // caged work lamp
  glowBlob(p, 14, 16, 3, FIRE_HOT, FIRE, FIRE_DIM);
  for (let x = 10; x <= 18; x += 2) { p.set(x, 13, 0x2a2622); p.set(x, 19, 0x2a2622); }
  streaks(p, r, 8, 0x1a1816, 12, 0.35);
  return p;
}

// =================================================================== MIRROR
const MIR_CY = 0x5af0ff, MIR_HOT = 0xe8ffff, MIR_DIM = 0x1a6a7a;

function mirrorWall(v: number): Pix {
  const [p, r] = newTile(1800 + v);
  if (v === 0) {
    // checkerboard with chrome bevels
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const s = ((x >> 3) + (y >> 3)) & 1, u = x & 7, w = y & 7;
      let c = s ? 0xe8e8ec : 0x0e0e12;
      if (u === 0 || w === 0) c = s ? 0xffffff : 0x3a3a42;
      if (u === 7 || w === 7) c = s ? 0x9a9aa4 : 0x050507;
      p.set(x, y, c);
    }
    glitchRows(p, r, 5, 6, MIR_CY);
  } else if (v === 1) {
    // inverted chrome panels: reflection bands
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const u = x % 32;
      const band = Math.sin((y / T) * Math.PI * 4 + u * 0.08) * 0.5 + 0.5;
      const v2 = Math.abs(u - 16) / 16;
      const l = band * 0.8 + (1 - v2) * 0.4;
      const c = l > 0.9 ? 0xffffff : l > 0.7 ? 0xc8ccd4 : l > 0.45 ? 0x7a7e88 : l > 0.25 ? 0x3a3c44 : 0x101014;
      p.set(x, y, bayer(x, y) < 0.12 ? lit(c, 0.15) : c);
    }
    for (let y = 0; y < T; y++) { p.set(0, y, 0x000000); p.set(31, y, 0xffffff); p.set(32, y, 0x000000); p.set(63, y, 0xffffff); }
    for (let i = 0; i < 3; i++) { const x = Math.floor(r() * T); for (let y = 0; y < T; y++) if ((y >> 2) % 3) p.set(x, y, MIR_CY, F_EMIT); }
    glitchRows(p, r, 3, 8);
  } else {
    // negative grid: white lines on black, offset glitch, cyan dashes
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const g = x % 16 === 0 || y % 16 === 0, g2 = x % 4 === 0 && y % 4 === 0;
      p.set(x, y, g ? 0xf0f0f4 : g2 ? 0x3a3a40 : 0x060608);
    }
    // inverted silhouette of a face in one cell (uncanny)
    p.ellipse(40, 24, 5, 6, 0xd8d8dc); p.set(38, 23, 0x060608); p.set(42, 23, 0x060608); p.rect(38, 27, 5, 1, 0x060608);
    for (let i = 0; i < 8; i++) { const x = Math.floor(r() * T), y = Math.floor(r() * T); for (let k = 0; k < 3 + r() * 6; k++) p.set(x + k, y, MIR_CY, F_EMIT); }
    glitchRows(p, r, 6, 5);
  }
  return p;
}

function mirrorFloor(): Pix {
  const [p, r] = newTile(1900);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const s = ((x >> 4) + (y >> 4)) & 1, u = x & 15, w = y & 15;
    let c = s ? 0xd8d8dc : 0x101014;
    // polished reflection streak
    if (((x + y) & 31) < 3) c = lit(c, s ? 0.2 : 0.35);
    if (u === 0 || w === 0) c = 0x5a5a62;
    p.set(x, y, c);
  }
  for (let x = 0; x < T; x++) if ((x >> 1) % 4) p.set(x, 40, MIR_CY, F_EMIT);
  glitchRows(p, r, 2, 4);
  return p;
}

function mirrorCeil(): Pix {
  const [p, r] = newTile(1910);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) p.set(x, y, (x % 8 === 0 || y % 8 === 0) ? 0x2a2a30 : ((x * 7 + y * 3) % 23 === 0 ? 0x5a5a62 : 0x08080a));
  for (let y = 24; y < 40; y++) for (let x = 8; x < 56; x++) p.set(x, y, (y === 24 || y === 39) ? MIR_DIM : ((x + y) & 1) ? 0xd8ffff : 0xb0f4ff, F_EMIT);
  glitchRows(p, r, 2, 6, MIR_HOT);
  return p;
}

// =================================================================== trim strips
function trim2(b: number): Pix {
  const [p, r] = newTile(2000 + b);
  const base = [0x8a9088, 0x2a2a1e, 0x2e2c28, 0x0a0a0e][b - 3];
  noiseFill(p, base, 2001 + b, b === 6 ? 0.04 : 0.18, 8);
  panel(p, 0, 0, 64, 26, 0.5, 0.2); panel(p, 0, 38, 64, 26, 0.5, 0.2);
  if (b === 4) { for (let i = 0; i < 6; i++) hangingVine(p, r, Math.floor(r() * T), 0, 10 + r() * 14, 0x3a6a24); }
  else if (b === 6) { for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (((x >> 2) + (y >> 2)) & 1 && (y < 22 || y > 42)) tint(p, x, y, 0.3); }
  else for (let x = 3; x < T; x += 10) { rivet(p, x, 3, lit(base, 0.5)); rivet(p, x, 58, lit(base, 0.5)); }
  const cols = [[0xeaffd0, 0x7ae050, 0x1e6a2a], [BIO_HOT, BIO_TEAL, BIO_DIM], [FIRE_HOT, FIRE, FIRE_DIM], [0xffffff, MIR_CY, MIR_DIM]][b - 3];
  glowStrip(p, 30, cols[0], cols[1], cols[2]);
  if (b === 4) {
    // fungus nodules break up the strip
    for (let x = 4; x < T; x += 9) { glowBlob(p, x + (x % 3), 30 + (x % 4), 2.2, BIO_HOT, BIO, BIO_DIM); }
  }
  if (b === 5) for (let x = 0; x < T; x++) if (r() < 0.25) p.set(x, 27 + Math.floor(r() * 3), r() < 0.5 ? FIRE : FIRE_DIM, F_EMIT);
  if (b === 6) glitchRows(p, r, 3, 6);
  speckle(p, r, 60, 0.2);
  return p;
}

// =================================================================== crates
function crate2(b: number): Pix {
  const S = 32;
  const p = new Pix(S, S);
  const r = makeRng(2100 + b);
  if (b === 3) {
    // medical container with green cross
    noiseFill(p, 0xd8dcd0, 2101, 0.06, 4);
    panel(p, 0, 0, S, S, 0.5, 0.35); panel(p, 3, 3, S - 6, S - 6, -0.3, -0.3);
    for (let i = 0; i < S; i++) { p.set(i, 0, 0x8a948a); p.set(i, S - 1, 0x5a645a); }
    p.rect(13, 8, 6, 16, 0x3aa040, F_EMIT); p.rect(8, 13, 16, 6, 0x3aa040, F_EMIT);
    p.rect(14, 9, 4, 14, 0x7ae050, F_EMIT); p.rect(9, 14, 14, 4, 0x7ae050, F_EMIT);
    for (const [x, y] of [[1, 1], [29, 1], [1, 29], [29, 29]]) rivet(p, x, y, 0xa0a89c);
    streaks(p, r, 3, 0x6a7a4a, 8, 0.3);
  } else if (b === 4) {
    // mossy wooden crate
    noiseFill(p, 0x6a4a2a, 2111, 0.2, 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (y % 8 === 0) p.set(x, y, 0x2a1a10); else tint(p, x, y, Math.sin(x * 0.9 + y * 0.1) * 0.08);
    for (let i = 0; i < S; i++) { p.set(i, i, 0x4a3018); p.set(i + 1, i, 0x8a6a3a); }
    panel(p, 0, 0, S, S, 0.6, 0.3);
    for (let i = 0; i < S; i++) for (let k = 0; k < 2; k++) { p.set(i, k, 0x3a2a18); p.set(k, i, 0x3a2a18); p.set(S - 1 - k, i, 0x2a1a10); p.set(i, S - 1 - k, 0x2a1a10); }
    const n = makeNoise(2112, 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (n(x / 8, y / 8) > 0.62 - (y < 6 ? 0.2 : 0)) p.set(x, y, ramp(0x4a7a2a, n(x / 3, y / 3) - 0.5, x, y));
    p.set(6, 26, BIO_TEAL, F_EMIT); p.set(7, 26, BIO, F_EMIT); p.set(6, 25, BIO_DIM, F_EMIT);
  } else if (b === 5) {
    // sandbag stack
    noiseFill(p, 0x3a3428, 2121, 0.1, 4);
    for (let row = 0; row < 4; row++) for (let k = -1; k < 3; k++) {
      const cx = k * 14 + (row & 1 ? 7 : 0) + 7, cy = row * 8 + 4;
      for (let y = -4; y <= 4; y++) for (let x = -7; x <= 7; x++) {
        const d = (x / 7.4) ** 2 + (y / 4.4) ** 2;
        if (d > 1 || cx + x < 0 || cx + x >= S || cy + y >= S) continue;
        const l = -x / 10 - y / 5 + (1 - d) * 0.5 - 0.15;
        p.set(cx + x, cy + y, ramp(0x9a8a62, l * 1.2, cx + x, cy + y, 4));
      }
      if (cx >= 0 && cx < S) { p.set(cx - 5, cy, 0x5a4e36); p.set(cx + 5, cy, 0x5a4e36); }
    }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (r() < 0.07) p.tint(x, y, (c) => mix(c, 0xc8c4bc, 0.4));
    scorch(p, r, 24, 8, 6);
  } else {
    // chrome cube with checker inset
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const l = Math.sin((x + y) * 0.2) * 0.5 + 0.5;
      p.set(x, y, l > 0.8 ? 0xffffff : l > 0.55 ? 0xb0b4bc : l > 0.3 ? 0x5a5e66 : 0x1a1a20);
    }
    panel(p, 0, 0, S, S, 0.6, 0.35);
    for (let y = 8; y < 24; y++) for (let x = 8; x < 24; x++) p.set(x, y, (((x - 8) >> 2) + ((y - 8) >> 2)) & 1 ? 0xf0f0f4 : 0x08080a);
    for (let x = 8; x < 24; x++) { p.set(x, 7, MIR_CY, F_EMIT); p.set(x, 24, MIR_DIM, F_EMIT); }
    const y = 12 + Math.floor(r() * 8); for (let x = 2; x < 30; x++) if (x & 1) p.set(x, y, MIR_CY, F_EMIT);
  }
  return p;
}

// =================================================================== public builders
export function buildWall2(biome: number, v: number): HTMLCanvasElement {
  const vv = ((v | 0) % 4 + 4) % 4;
  if (vv === 3) return trim2(biome).toCanvas();
  const f = biome === 3 ? nurseryWall : biome === 4 ? canopyWall : biome === 5 ? frontWall : mirrorWall;
  return f(vv).toCanvas();
}
export function buildFloor2(biome: number): HTMLCanvasElement {
  return (biome === 3 ? nurseryFloor() : biome === 4 ? canopyFloor() : biome === 5 ? frontFloor() : mirrorFloor()).toCanvas();
}
export function buildCeiling2(biome: number): HTMLCanvasElement {
  return (biome === 3 ? nurseryCeil() : biome === 4 ? canopyCeil() : biome === 5 ? frontCeil() : mirrorCeil()).toCanvas();
}
export function buildCrate2(biome: number): HTMLCanvasElement { return crate2(biome).toCanvas(); }

