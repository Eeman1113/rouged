// THE HAPPY PLACE: a reconstructed childhood street. Grass, asphalt, sidewalk, siding, shingles,
// brick, hedge, leaves, bark, plywood, windows (day / lit / dark / the yellow kitchen), front doors,
// clouds, the sun, birds. Same crunchy toolkit as every other sector: it just remembers summer.
import { Pix, Rng, makeRng, mix, lit, bayer, makeNoise, F_EMIT } from './core';
import { noiseFill, speckle, tint, streaks } from './textures';

const T = 64;

function tile(seed: number, w = T, h = T): [Pix, Rng] {
  const p = new Pix(w, h); p.wrap = true;
  return [p, makeRng(seed)];
}

// ------------------------------------------------------------------ ground

export function buildGrass(): HTMLCanvasElement {
  const [p, r] = tile(7001);
  noiseFill(p, 0x5a9a34, 7002, 0.16, 8, 0x7ab844);
  // blades: short vertical strokes, light tips over dark roots
  for (let i = 0; i < 420; i++) {
    const x = Math.floor(r() * T), y = Math.floor(r() * T), L = 2 + Math.floor(r() * 3);
    const hi = r() < 0.55;
    for (let j = 0; j < L; j++) p.tint(x, y - j, (c) => lit(c, hi ? 0.22 + j * 0.06 : -0.3));
  }
  // clover patches + the odd dandelion / daisy
  for (let i = 0; i < 6; i++) {
    const cx = r() * T, cy = r() * T;
    for (let k = 0; k < 14; k++) p.tint(cx + (r() - 0.5) * 6, cy + (r() - 0.5) * 4, (c) => mix(c, 0x3a7a2a, 0.5));
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(r() * T), y = Math.floor(r() * T);
    const col = r() < 0.5 ? 0xfff2a0 : 0xffffff;
    p.set(x, y, col); p.set(x + 1, y, lit(col, -0.2)); p.tint(x, y + 1, (c) => lit(c, -0.4));
  }
  return p.toCanvas();
}

export function buildAsphalt(): HTMLCanvasElement {
  const [p, r] = tile(7011);
  noiseFill(p, 0x55575e, 7012, 0.1, 16);
  speckle(p, r, 520, 0.18);
  for (let i = 0; i < 40; i++) p.set(Math.floor(r() * T), Math.floor(r() * T), 0x8a8c90);
  // a patched crack
  let x = r() * T, y = r() * T, a = r() * 6.28;
  for (let i = 0; i < 40; i++) { a += (r() - 0.5) * 0.9; x += Math.cos(a); y += Math.sin(a); p.set(x, y, 0x2e3034); tint(p, x + 1, y, 0.12); }
  return p.toCanvas();
}

export function buildSidewalk(): HTMLCanvasElement {
  const [p, r] = tile(7021);
  noiseFill(p, 0xc9c5bb, 7022, 0.07, 8);
  for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
    const k = (r() - 0.5) * 0.08;
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) tint(p, sx * 32 + x, sy * 32 + y, k);
  }
  for (let i = 0; i < T; i++) {
    p.set(i, 0, 0x8e8a82); p.set(0, i, 0x8e8a82); p.set(i, 32, 0x8e8a82); p.set(32, i, 0x8e8a82);
    tint(p, i, 1, 0.2); tint(p, 1, i, 0.2); tint(p, i, 33, 0.2); tint(p, 33, i, 0.2);
  }
  speckle(p, r, 160, 0.1);
  // a chalk drawing, half rained off
  for (let a = 0; a < 6.28; a += 0.25) p.tint(46 + Math.cos(a) * 6, 46 + Math.sin(a) * 6, (c) => mix(c, 0xff9ac0, 0.45));
  return p.toCanvas();
}

// ------------------------------------------------------------------ houses

/** Clapboard siding, near-white so vertex colors can paint it. */
export function buildSiding(): HTMLCanvasElement {
  const [p, r] = tile(7031);
  const n = makeNoise(7032, 16);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const b = y % 8;
    let l = 0.12 - b * 0.035 + (n(x / 4, y / 16) - 0.5) * 0.08 + (bayer(x, y) - 0.5) * 0.05;
    if (b === 0) l = 0.32;
    if (b === 7) l = -0.42;
    p.set(x, y, lit(0xe6e4dc, l));
  }
  // butt joints
  for (let row = 0; row < 8; row++) {
    const x = Math.floor(r() * T);
    for (let y = row * 8 + 1; y < row * 8 + 7; y++) tint(p, x, y, -0.28);
  }
  return p.toCanvas();
}

export function buildShingles(): HTMLCanvasElement {
  const [p, r] = tile(7041);
  for (let row = 0; row < 8; row++) {
    const off = (row & 1) * 4;
    for (let tab = 0; tab < 8; tab++) {
      const k = (r() - 0.5) * 0.35;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const px = tab * 8 + x + off, py = row * 8 + y;
        let l = k + 0.08 - y * 0.03 + (bayer(px, py) - 0.5) * 0.12 + (r() - 0.5) * 0.06;
        if (x === 0) l = -0.6;
        if (y === 7) l = -0.55;
        if (y === 0) l += 0.2;
        p.set(px, py, lit(0xa8a6a2, l));
      }
    }
  }
  return p.toCanvas();
}

export function buildBrick(): HTMLCanvasElement {
  const [p, r] = tile(7051);
  for (let row = 0; row < 8; row++) {
    const off = (row & 1) * 8;
    for (let b = 0; b < 4; b++) {
      const base = mix(0xa84a32, r() < 0.3 ? 0x8a3a2a : 0xc06040, r() * 0.6);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) {
        const px = b * 16 + x + off, py = row * 8 + y;
        if (x === 0 || y === 0) { p.set(px, py, 0xc8c0b0); continue; }
        p.set(px, py, lit(base, (y === 1 ? 0.2 : y === 7 ? -0.3 : 0) + (r() - 0.5) * 0.15));
      }
    }
  }
  return p.toCanvas();
}

export function buildWood(): HTMLCanvasElement {
  const [p] = tile(7061, 32, 32);
  const n = makeNoise(7062, 8);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    p.set(x, y, lit(0xf0eee6, (n(x / 8, y / 2) - 0.5) * 0.12 + (bayer(x, y) - 0.5) * 0.06 + (x % 8 === 0 ? -0.2 : 0)));
  }
  return p.toCanvas();
}

/** The back of the house that has no back: raw plywood, sheet seams, pencil marks. */
export function buildPlywood(): HTMLCanvasElement {
  const [p, r] = tile(7071);
  const n = makeNoise(7072, 8);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const g = Math.sin((y + n(x / 16, y / 16) * 9) * 0.9) * 0.08;
    p.set(x, y, lit(0xc8a472, g + (n(x / 4, y / 8) - 0.5) * 0.12 + (bayer(x, y) - 0.5) * 0.05));
  }
  for (let i = 0; i < T; i++) { p.set(i, 0, 0x6a5232); p.set(0, i, 0x6a5232); tint(p, i, 1, 0.15); }
  for (let i = 0; i < 4; i++) { const x = 4 + Math.floor(r() * 56), y = 4 + Math.floor(r() * 56); p.set(x, y, 0x3a2e22); p.set(x + 1, y + 1, 0x3a2e22); }
  for (let i = 0; i < 9; i++) p.set(10 + i * 2, 20 + (i % 2), 0x5a4a3a); // a pencilled measurement
  return p.toCanvas();
}

export function buildPorchFloor(): HTMLCanvasElement {
  const [p, r] = tile(7081, 32, 32);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const b = x % 8;
    p.set(x, y, lit(0x9a8a7a, (b === 0 ? -0.45 : b === 1 ? 0.2 : 0) + (bayer(x, y) - 0.5) * 0.08 + (r() - 0.5) * 0.05));
  }
  return p.toCanvas();
}

// ------------------------------------------------------------------ green

export function buildHedge(): HTMLCanvasElement {
  const [p, r] = tile(7091);
  noiseFill(p, 0x24521f, 7092, 0.2, 8);
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(r() * T), y = Math.floor(r() * T);
    const c = mix(0x3f8a2e, 0x6ab040, r());
    p.set(x, y, c); p.set(x + 1, y, lit(c, -0.15)); p.set(x, y + 1, lit(c, -0.3));
    if (r() < 0.3) p.set(x - 1, y - 1, lit(c, 0.35));
  }
  for (let i = 0; i < 70; i++) p.set(Math.floor(r() * T), Math.floor(r() * T), 0x10260e);
  return p.toCanvas();
}

export function buildLeaves(): HTMLCanvasElement {
  const [p, r] = tile(7101);
  noiseFill(p, 0x3a7a2a, 7102, 0.22, 8, 0x5aa036);
  for (let i = 0; i < 300; i++) {
    const x = Math.floor(r() * T), y = Math.floor(r() * T);
    const c = mix(0x5a9a34, 0x9ad04a, r());
    p.set(x, y, c); p.set(x + 1, y, c); p.set(x, y + 1, lit(c, -0.25)); p.set(x + 1, y + 1, lit(c, -0.35));
  }
  for (let i = 0; i < 90; i++) p.set(Math.floor(r() * T), Math.floor(r() * T), 0x1a3a14);
  return p.toCanvas();
}

export function buildBark(): HTMLCanvasElement {
  const [p, r] = tile(7111, 32, 64);
  noiseFill(p, 0x6a4a32, 7112, 0.15, 8);
  streaks(p, r, 24, 0x3a2618, 40, 0.5);
  streaks(p, r, 10, 0x9a7a5a, 20, 0.35);
  return p.toCanvas();
}

// ------------------------------------------------------------------ windows + doors

export type WindowKind = 'day' | 'lit' | 'kitchen' | 'wren';

/** 32x40 four-pane sash window. 'kitchen' shows the yellow tiles; 'wren' is her room, always on. */
export function buildWindow(kind: WindowKind): HTMLCanvasElement {
  const W = 32, H = 40;
  const p = new Pix(W, H);
  const r = makeRng(7121 + kind.length * 13);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = y / H;
    let c: number;
    if (kind === 'day') {
      // sky in the glass, a diagonal sheen
      c = mix(0x6aa8e0, 0xc8e4f8, t);
      const d = (x + y * 0.8) % 26;
      if (d < 3) c = mix(c, 0xffffff, 0.55);
      c = lit(c, (bayer(x, y) - 0.5) * 0.08);
    } else if (kind === 'kitchen') {
      // yellow tiles, a counter, the radio on the sill
      const tx = x % 6, ty = y % 6;
      c = tx === 0 || ty === 0 ? 0xd8c890 : lit(0xf2c838, (r() - 0.5) * 0.12 + (tx === 1 || ty === 1 ? 0.15 : 0));
      if (y > 26) c = y < 29 ? 0xe8e0d0 : lit(0x8a6a4a, (bayer(x, y) - 0.5) * 0.2);
      if (x === 19 && y === 13) c = 0x9a6a3a; // the cracked tile (like a river)
      if (y === 14 && x > 15 && x < 22) c = 0x9a7a30;
    } else {
      // warm lamplight behind gauzy curtains
      const k = Math.abs(x - W / 2) / (W / 2);
      c = mix(0xffe6a0, 0xf0a050, k * 0.8 + t * 0.3);
      if (kind === 'wren') {
        // a star-shaped nightlight and a little silhouette of a paper star on the glass
        const sx = x - 11, sy = y - 12;
        if (Math.abs(sx) + Math.abs(sy) < 4 || (Math.abs(sx) < 1 && Math.abs(sy) < 6) || (Math.abs(sy) < 1 && Math.abs(sx) < 6)) c = 0xfff8e0;
      }
      c = lit(c, (bayer(x, y) - 0.5) * 0.1);
    }
    p.set(x, y, c, F_EMIT);
  }
  // curtains (lit windows), tied back
  if (kind === 'lit' || kind === 'wren') {
    const cc = kind === 'wren' ? 0xff9ac0 : 0xf0e8d8;
    for (let y = 3; y < H - 3; y++) {
      const wv = 5 - Math.abs(y - 22) * 0.18;
      for (let x = 3; x < 3 + wv; x++) p.set(x, y, lit(cc, (x % 2 ? -0.2 : 0.1) + (bayer(x, y) - 0.5) * 0.1));
      for (let x = W - 3 - wv; x < W - 3; x++) p.set(x, y, lit(cc, (x % 2 ? -0.2 : 0.1)));
    }
  }
  if (kind === 'kitchen') {
    // the radio
    for (let y = 22; y < 27; y++) for (let x = 6; x < 14; x++) p.set(x, y, y === 22 ? 0xd85a3a : 0xb8402a);
    p.set(8, 24, 0xf0e0b0); p.set(9, 24, 0xf0e0b0); p.set(12, 24, 0x2a1a10);
    p.line(12, 22, 15, 17, 0x404040);
  }
  // frame + mullions (white paint)
  const frame = (x: number, y: number) => p.set(x, y, lit(0xf4f2ea, (bayer(x, y) - 0.5) * 0.1));
  for (let i = 0; i < W; i++) for (let k = 0; k < 2; k++) { frame(i, k); frame(i, H - 1 - k); frame(i, H / 2 + k - 1); }
  for (let i = 0; i < H; i++) for (let k = 0; k < 2; k++) { frame(k, i); frame(W - 1 - k, i); frame(W / 2 + k - 1, i); }
  for (let i = 2; i < W - 2; i++) tint(p, i, 2, -0.3);
  return p.toCanvas();
}

/** 24x48 front door, near-white so a vertex color paints it. */
export function buildFrontDoor(): HTMLCanvasElement {
  const W = 24, H = 48;
  const p = new Pix(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.set(x, y, lit(0xe8e6e0, (bayer(x, y) - 0.5) * 0.08));
  const inset = (x0: number, y0: number, w: number, h: number) => {
    for (let i = 0; i < w; i++) { tint(p, x0 + i, y0, -0.45); tint(p, x0 + i, y0 + h - 1, 0.25); }
    for (let j = 0; j < h; j++) { tint(p, x0, y0 + j, -0.35); tint(p, x0 + w - 1, y0 + j, 0.2); }
  };
  // fan window at the top
  for (let y = 3; y < 11; y++) for (let x = 4; x < 20; x++) if (Math.hypot(x - 12, (y - 11) * 1.6) < 8.5) p.set(x, y, mix(0x8ac0e8, 0xe0f0ff, (y - 3) / 8), F_EMIT);
  inset(4, 14, 7, 14); inset(13, 14, 7, 14); inset(4, 31, 7, 13); inset(13, 31, 7, 13);
  // brass knob + letter slot
  p.set(19, 29, 0xffe070, F_EMIT); p.set(20, 29, 0xc8a030); p.set(19, 30, 0xa88020);
  for (let x = 9; x < 15; x++) p.set(x, 29, 0x8a7a40);
  for (let i = 0; i < H; i++) { tint(p, 0, i, -0.5); tint(p, W - 1, i, -0.5); }
  return p.toCanvas();
}

// ------------------------------------------------------------------ sky things

/** Puffy flat-bottomed cumulus, three tones of white, dithered. Alpha outside. */
export function buildCloud(v: number): HTMLCanvasElement {
  const W = 96, H = 44;
  const p = new Pix(W, H);
  const r = makeRng(7201 + v * 97);
  const puffs: [number, number, number][] = [];
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const cx = 14 + t * (W - 28) + (r() - 0.5) * 6;
    const rad = 9 + Math.sin(t * Math.PI) * (9 + r() * 6);
    puffs.push([cx, H - 8 - rad * 0.55, rad]);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (y > H - 6) continue; // flat bottom
    let inside = false, shade = 0;
    for (const [cx, cy, rad] of puffs) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = Math.sqrt(dx * dx + dy * dy) / rad;
      if (d < 1) { inside = true; shade = Math.max(shade, (-dx * 0.5 - dy * 0.85) / rad + 0.35 - d * 0.2); }
    }
    if (!inside) continue;
    const under = (y - (H - 18)) / 12; // the belly is grey-blue
    const l = shade - Math.max(0, under) * 0.9 + (bayer(x, y) - 0.5) * 0.35;
    const c = l > 0.32 ? 0xffffff : l > 0.0 ? 0xeef2fa : l > -0.35 ? 0xd2dcec : 0xb4c2d8;
    p.set(x, y, c);
  }
  return p.toCanvas();
}

/** Pixel sun disc: hot core, warm rim. */
export function buildSun(): HTMLCanvasElement {
  const S = 32;
  const p = new Pix(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) / (S / 2);
    if (d > 1) continue;
    const v = d + (bayer(x, y) - 0.5) * 0.12;
    p.set(x, y, v < 0.7 ? 0xffffff : v < 0.88 ? 0xfff4c8 : 0xffd890);
  }
  return p.toCanvas();
}

/** Soft radial glow (alpha gradient, ordered dither banding). */
export function buildGlow(): HTMLCanvasElement {
  const S = 64;
  const p = new Pix(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) / (S / 2);
    if (d > 1) continue;
    const a = Math.pow(1 - d, 2.2);
    const q = Math.floor((a + (bayer(x, y) - 0.5) * 0.08) * 8) / 8;
    if (q > 0) p.set(x, y, 0xffffff, 0, Math.round(q * 255));
  }
  return p.toCanvas();
}

/** A bird: a tiny dark 'v', two flap frames. */
export function buildBird(f: number): HTMLCanvasElement {
  const p = new Pix(12, 8);
  const c = 0x2a2a34;
  if (f === 0) { p.line(0, 2, 5, 5, c); p.line(6, 5, 11, 2, c); p.set(5, 5, c); p.set(6, 4, c); }
  else { p.line(0, 6, 5, 4, c); p.line(6, 4, 11, 6, c); p.set(5, 4, c); p.set(6, 5, c); }
  return p.toCanvas();
}
