// Particles, gibs, decals, projectiles, explosions, pickups, pedestal icons.
import { Pix, Rng, makeRng, part, glowBlob, mul, mix, lit, ramp, bayer, F_EMIT, F_FLAT, OUTLINE, makeNoise } from './core';

const BLOOD = 0x9a0e14, BLOOD_MID = 0x6a080e, BLOOD_D = 0x2a0306, BLOOD_HI = 0xd0282a;

// ---------------------------------------------------------------- gibs
export function buildGibs(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const mk = (w: number, h: number, fn: (p: Pix, r: Rng) => void, seed: number): void => {
    const p = new Pix(w, h); fn(p, makeRng(seed)); out.push(p.toCanvas());
  };
  // 0 metal plate
  mk(12, 10, (p) => { part(p, (l) => { l.poly([1, 3, 8, 1, 11, 6, 6, 9, 2, 8], 0x6a707a); l.set(4, 4, 0xc0c4cc); l.set(8, 5, 0xc0c4cc); l.line(3, 7, 8, 3, 0x8a4624); }); }, 1);
  // 1 gear
  mk(11, 11, (p) => {
    part(p, (l) => {
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; l.rect(5 + Math.cos(a) * 4.2 - 0.5, 5 + Math.sin(a) * 4.2 - 0.5, 2, 2, 0x8a8e96); }
      l.ball(5.5, 5.5, 3.8, 3.8, 0x7a7e86);
      l.ellipse(5.5, 5.5, 1.3, 1.3, 0x1a1a1e, F_FLAT);
    });
  }, 2);
  // 2 wire bundle
  mk(13, 9, (p) => {
    p.line(1, 6, 5, 3, 0xc02020); p.line(5, 3, 11, 4, 0xc02020);
    p.line(1, 7, 6, 5, 0xd8b030); p.line(6, 5, 12, 7, 0xd8b030);
    p.line(2, 5, 7, 2, 0x3060c0); p.line(7, 2, 11, 1, 0x3060c0);
    p.set(11, 4, 0xfff27a, F_EMIT); p.set(12, 7, 0xffffff, F_EMIT);
    part(p, (l) => l.box(0, 5, 3, 3, 0x2a2a30));
    p.outline(OUTLINE);
  }, 3);
  // 3 flesh chunk
  mk(10, 9, (p, r) => {
    part(p, (l) => { l.ball(5, 4.5, 4.3, 3.6, 0xa8343a); for (let i = 0; i < 5; i++) l.set(2 + r() * 6, 2 + r() * 5, BLOOD_MID); l.set(3, 2, 0xe08a8a); });
  }, 4);
  // 4 flesh chunk w/ bone
  mk(12, 9, (p) => {
    part(p, (l) => { l.ball(5, 5, 4.5, 3.4, 0x8c2028); l.set(4, 4, 0xd06060); });
    part(p, (l) => { l.limb(6, 4, 10.5, 2, 1, 0xe8e0c8); l.ball(10.5, 2, 1.4, 1.4, 0xf0e8d0); });
  }, 5);
  // 5 eyeball-lens
  mk(9, 9, (p) => {
    part(p, (l) => { l.ball(4.5, 4.5, 3.8, 3.8, 0x9a9ea6); });
    p.ellipse(4.5, 4.5, 2.5, 2.5, 0x1a1a1e, F_FLAT);
    glowBlob(p, 4.5, 4.5, 1.6, 0xffb0a0, 0xff1414, 0x8a0c0c);
    p.set(3, 3, 0xffffff, F_EMIT);
    p.line(7, 7, 8, 8, 0xc02020);
  }, 6);
  // 6 hand
  mk(13, 11, (p) => {
    part(p, (l) => {
      l.ball(5, 6, 3.6, 3, 0x5a5e66);
      for (let i = 0; i < 4; i++) l.limb(7, 4 + i * 1.6, 11.5, 2.5 + i * 2.2, 0.8, 0x7a7e86, 0, false);
      l.limb(4, 4, 3, 1.5, 0.8, 0x7a7e86, 0, false);
      l.limb(2, 7, 0.5, 9, 1.4, 0x34373e);
    });
    p.set(1, 9, 0x5a0e0c); p.set(0, 10, BLOOD);
  }, 7);
  // 7 rib bone
  mk(12, 8, (p) => { part(p, (l) => { l.limb(1, 6, 6, 1.5, 0.9, 0xe0d8c0); l.limb(6, 1.5, 11, 4, 0.9, 0xe0d8c0); l.set(1, 6, BLOOD); l.set(11, 4, BLOOD_MID); }); }, 8);
  // 8 servo / piston
  mk(12, 9, (p) => {
    part(p, (l) => { l.box(1, 2, 6, 5, 0x84502e); l.limb(6, 4.5, 11, 4.5, 1.2, 0xa0a4ac); l.set(3, 4, 0xffa020, F_EMIT); });
  }, 9);
  // 9 screws + oil splat
  mk(10, 8, (p) => {
    p.ellipse(5, 5, 4.5, 2.5, 0x2a0606, F_FLAT); p.set(4, 4, 0x5a0e0c);
    part(p, (l) => { l.box(1, 2, 3, 3, 0x9a9ea6); l.box(6, 1, 3, 3, 0x8a8e96); l.set(2, 3, 0x2a2a30); l.set(7, 2, 0x2a2a30); });
  }, 10);
  // 10 skull-plate (robot jaw)
  mk(14, 10, (p) => {
    part(p, (l) => { l.poly([1, 2, 12, 1, 13, 6, 9, 9, 4, 9, 0, 6], 0x666e78); });
    for (let x = 3; x < 11; x += 2) p.set(x, 6, 0x101012);
    p.set(4, 3, 0x8a0c0c, F_EMIT); p.set(9, 3, 0xff1414, F_EMIT);
  }, 11);
  return out;
}

// ---------------------------------------------------------------- blood
export function buildBloodSprites(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const sizes = [6, 7, 8, 6];
  sizes.forEach((s, i) => {
    const p = new Pix(s, s);
    const r = makeRng(50 + i);
    const c = (s - 1) / 2;
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const d = Math.hypot(x - c, y - c) / (s / 2) + (r() - 0.5) * 0.35;
      if (d > 1) continue;
      const lx = x - c + 1, ly = y - c + 1;
      p.set(x, y, d > 0.75 ? BLOOD_D : lx + ly < -1 ? BLOOD_HI : d > 0.45 ? BLOOD_MID : BLOOD);
    }
    if (i === 3) { p.clear(0, 0); p.set(s - 1, 2, BLOOD_D); }
    out.push(p.toCanvas());
  });
  return out;
}

export function buildBloodDecal(i: number): HTMLCanvasElement {
  const p = new Pix(32, 32);
  const r = makeRng(900 + i * 37);
  const n = makeNoise(77 + i, 8);
  const cx = 16 + (r() - 0.5) * 4, cy = 16 + (r() - 0.5) * 4;
  const R = i === 3 ? 12 : 9;
  // main mass (pool or splat)
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const ang = Math.atan2(y - cy, x - cx);
    const rr = R * (0.75 + n(Math.cos(ang) * 2 + 4, Math.sin(ang) * 2 + 4) * 0.6) * (i === 1 ? (1 + Math.max(0, Math.cos(ang - 0.6)) * 0.6) : 1);
    const d = Math.hypot(x - cx, y - cy) / rr;
    if (d > 1) continue;
    const v = d + (bayer(x, y) - 0.5) * 0.18;
    p.set(x, y, v < 0.35 ? BLOOD_D : v < 0.7 ? BLOOD_MID : v < 0.9 ? BLOOD : BLOOD_MID, 0, v > 0.95 ? 200 : 255);
  }
  // droplets / spokes
  const spokes = i === 3 ? 4 : 10;
  for (let k = 0; k < spokes; k++) {
    const a = r() * Math.PI * 2;
    const d0 = R * 0.8, d1 = R + 2 + r() * 6;
    for (let d = d0; d < d1; d += 0.7) {
      const w = (1 - (d - d0) / (d1 - d0)) * 1.4;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      p.set(x, y, BLOOD); if (w > 0.8) p.set(x + 1, y, BLOOD_MID);
    }
    const dx = cx + Math.cos(a) * (d1 + 1.5), dy = cy + Math.sin(a) * (d1 + 1.5);
    p.ellipse(dx, dy, 1 + r(), 1 + r(), BLOOD_MID);
  }
  for (let k = 0; k < 14; k++) {
    const a = r() * Math.PI * 2, d = R + r() * 6;
    p.set(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r() < 0.5 ? BLOOD : BLOOD_D);
  }
  // wet sheen
  p.set(cx - 2, cy - 2, BLOOD_HI); p.set(cx - 1, cy - 2, BLOOD); p.set(cx - 2, cy - 1, BLOOD);
  return p.toCanvas();
}

export function buildScorch(): HTMLCanvasElement {
  const p = new Pix(32, 32);
  const r = makeRng(333);
  const n = makeNoise(12, 8);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const ang = Math.atan2(y - 16, x - 16);
    const rr = 15.5 * (0.75 + n(Math.cos(ang) * 2.5 + 4, Math.sin(ang) * 2.5 + 4) * 0.4);
    const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 16) / rr;
    if (d > 1) continue;
    const a = Math.round(255 * Math.min(1, 0.35 + (1 - d) * 1.6));
    if (bayer(x, y) > (1 - d) * 2.2 + 0.05) continue;
    const c = d < 0.3 ? 0x0a0806 : d < 0.6 ? 0x1a1410 : 0x2a2018;
    p.set(x, y, r() < 0.06 && d < 0.5 ? 0x5a1a08 : c, 0, a);
  }
  return p.toCanvas();
}

export function buildSpark(): HTMLCanvasElement {
  const p = new Pix(4, 4);
  p.set(1, 1, 0xffffff, F_EMIT); p.set(2, 1, 0xfff27a, F_EMIT); p.set(1, 2, 0xfff27a, F_EMIT); p.set(2, 2, 0xffb030, F_EMIT);
  p.set(0, 1, 0xffa020, F_EMIT, 160); p.set(3, 2, 0xff7a10, F_EMIT, 160); p.set(1, 0, 0xffa020, F_EMIT, 160); p.set(2, 3, 0xff7a10, F_EMIT, 160);
  return p.toCanvas();
}

export function buildMuzzle(): HTMLCanvasElement {
  const p = new Pix(16, 16);
  const r = makeRng(16);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const L = i % 2 ? 7.5 : 5;
    for (let d = 2; d < L; d += 0.5) p.set(8 + Math.cos(a) * d, 8 + Math.sin(a) * d, d < L * 0.55 ? 0xfff27a : 0xff8a20, F_EMIT);
  }
  glowBlob(p, 8, 8, 4.2, 0xffffff, 0xfff27a, 0xffa030, 0.3, r);
  return p.toCanvas();
}

// ---------------------------------------------------------------- projectiles
export function buildProjectile(kind: string): HTMLCanvasElement {
  const r = makeRng(kind.length * 97 + kind.charCodeAt(0));
  const pal: Record<string, number[]> = {
    bolt: [0xffffff, 0xff6050, 0xff1414, 0x7a0606],
    plasma: [0xffffff, 0xffd060, 0xff8a10, 0xa03a06],
    orb: [0xffffff, 0xff90ff, 0xd030ff, 0x5a0a8a],
    rocket: [0xffffff, 0xfff27a, 0xffa020, 0xb04a08],
    spit: [0xf0ffe0, 0xb0ff50, 0x5ad818, 0x1a6a08],
    replica: [0xffffff, 0xd8fcff, 0x7ae8ff, 0x1a6a8a],
  };
  const c = pal[kind] ?? pal.bolt;
  if (kind === 'bolt' || kind === 'replica') {
    const p = new Pix(12, 12);
    // elongated diamond streak toward viewer
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      const d = Math.abs(x - 5.5) / 5.5 + Math.abs(y - 5.5) / 3.6;
      const d2 = Math.abs(x - 5.5) / 2.4 + Math.abs(y - 5.5) / 5.5;
      const m = Math.min(d, d2);
      if (m > 1) continue;
      const v = m + (bayer(x, y) - 0.5) * 0.2;
      p.set(x, y, v < 0.25 ? c[0] : v < 0.5 ? c[1] : v < 0.8 ? c[2] : c[3], F_EMIT, v > 0.85 ? 150 : 255);
    }
    return p.toCanvas();
  }
  if (kind === 'rocket') {
    const p = new Pix(14, 14);
    glowBlob(p, 7, 7, 6.2, c[1], c[2], c[3], 0.4, r);
    part(p, (l) => { l.ball(7, 7, 3.2, 3.2, 0x6a6e76); }, { outline: false });
    p.ellipse(7, 7, 1.6, 1.6, c[0], F_EMIT);
    for (const [x, y] of [[7, 2], [2, 7], [12, 7], [7, 12]]) p.set(x, y, 0x3a3e46);
    return p.toCanvas();
  }
  if (kind === 'spit') {
    const p = new Pix(10, 10);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const d = Math.hypot(x - 4.5, (y - 5) * 1.1) / 4.6 + (r() - 0.5) * 0.3;
      if (d > 1) continue;
      p.set(x, y, d < 0.3 ? c[0] : d < 0.6 ? c[1] : d < 0.85 ? c[2] : c[3], F_EMIT);
    }
    p.set(8, 1, c[2], F_EMIT); p.set(1, 8, c[3], F_EMIT); p.set(9, 7, c[2], F_EMIT);
    return p.toCanvas();
  }
  const S = kind === 'orb' ? 16 : 12;
  const p = new Pix(S, S);
  const h = (S - 1) / 2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - h, y - h) / (S / 2);
    if (d > 1) continue;
    const v = d + (bayer(x, y) - 0.5) * 0.22;
    p.set(x, y, v < 0.25 ? c[0] : v < 0.5 ? c[1] : v < 0.78 ? c[2] : c[3], F_EMIT, v > 0.9 ? 140 : 255);
  }
  if (kind === 'orb') { for (let k = 0; k < 3; k++) { const a = k * 2.1; p.line(h + Math.cos(a) * 2, h + Math.sin(a) * 2, h + Math.cos(a + 0.6) * 6, h + Math.sin(a + 0.6) * 6, c[0], F_EMIT); } }
  p.set(h - 1.5, h - 1.5, 0xffffff, F_EMIT);
  return p.toCanvas();
}

// ---------------------------------------------------------------- explosion
export function buildExplosion(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const n = makeNoise(4040, 8);
  const radii = [8, 14, 19, 22, 23, 22];
  for (let f = 0; f < 6; f++) {
    const p = new Pix(48, 48);
    const R = radii[f];
    const heat = [1, 0.9, 0.7, 0.45, 0.2, 0][f];
    const r = makeRng(600 + f);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
      const dx = x + 0.5 - 24, dy = y + 0.5 - 24 + f * 0.6;
      const ang = Math.atan2(dy, dx);
      const nn = n(Math.cos(ang) * 2 + 4 + f * 0.7, Math.sin(ang) * 2 + 4) * 0.5 + n(x * 0.25 + f, y * 0.25) * 0.5;
      const rr = R * (0.78 + nn * 0.45);
      const d = Math.hypot(dx, dy) / rr;
      if (d > 1) continue;
      // turbulence → temperature
      const t = (1 - d) * heat * 1.4 + (n(x * 0.3 + f * 3, y * 0.3) - 0.5) * 0.5 + (bayer(x, y) - 0.5) * 0.2;
      let c: number;
      let a = 255;
      if (t > 0.95) c = 0xffffff;
      else if (t > 0.75) c = 0xfff4a0;
      else if (t > 0.55) c = 0xffc040;
      else if (t > 0.38) c = 0xff7a18;
      else if (t > 0.22) c = 0xc0320a;
      else if (t > 0.08) c = 0x6a1a0a;
      else { c = mix(0x3a3432, 0x6a625c, n(x * 0.4, y * 0.4 + f)); a = f >= 4 ? (d > 0.75 ? 120 : 200) : 230; }
      if (f === 5) { c = mix(0x2a2624, 0x5a5450, n(x * 0.35, y * 0.35)); a = d > 0.6 ? 140 : 210; if (bayer(x, y) < d * 0.5) continue; }
      p.set(x, y, c, t > 0.2 ? F_EMIT : 0, a);
    }
    // embers
    if (f >= 1 && f <= 4) for (let k = 0; k < 10; k++) { const a = r() * Math.PI * 2, d = R * (0.9 + r() * 0.3); p.set(24 + Math.cos(a) * d, 24 + Math.sin(a) * d, r() < 0.5 ? 0xffc040 : 0xff7a18, F_EMIT); }
    out.push(p.toCanvas());
  }
  return out;
}

// ---------------------------------------------------------------- mine / pickups
export function buildMine(armed: boolean): HTMLCanvasElement {
  const p = new Pix(12, 8);
  part(p, (l) => {
    l.ellipse(6, 5.5, 5.5, 2.2, 0x34373e);
    l.ball(6, 4, 3.6, 2, 0x5a5e66);
    l.rect(1, 6, 1, 1, 0x26262b); l.rect(10, 6, 1, 1, 0x26262b);
    for (let x = 2; x <= 10; x += 2) l.set(x, 6, 0xd8b030);
  });
  if (armed) { p.set(6, 2, 0xffffff, F_EMIT); p.set(5, 2, 0xff1414, F_EMIT); p.set(7, 2, 0xff1414, F_EMIT); p.set(6, 1, 0xff1414, F_EMIT); p.set(6, 3, 0xff1414, F_EMIT); }
  else { p.set(6, 2, 0x5a1010); }
  return p.toCanvas();
}

export function buildPickup(kind: string): HTMLCanvasElement {
  const p = new Pix(16, 16);
  if (kind === 'hp') {
    part(p, (l) => {
      l.box(2, 4, 12, 10, 0xe8e4dc);
      l.rect(5, 2, 6, 2, 0xa0a4ac);
      l.rect(2, 11, 12, 1, 0xa8a4a0);
    });
    p.rect(7, 6, 2, 6, 0xff1a1a, F_EMIT); p.rect(5, 8, 6, 2, 0xff1a1a, F_EMIT);
    p.set(7, 8, 0xff8080, F_EMIT);
    p.set(3, 5, 0xffffff);
  } else if (kind === 'armor') {
    part(p, (l) => {
      l.poly([8, 1, 14, 4, 13, 10, 8, 15, 3, 10, 2, 4], 0x3a8a5a);
      l.poly([8, 3, 12, 5, 11.5, 9.5, 8, 13], 0x2a6a8a);
    });
    for (let y = 4; y < 13; y++) p.set(8, y, 0x7ae8ff, F_EMIT);
    p.set(5, 5, 0xb0ffd0, F_EMIT); p.set(6, 4, 0xb0ffd0, F_EMIT);
  } else {
    part(p, (l) => {
      l.box(4, 2, 8, 13, 0x4a4e56);
      l.rect(6, 1, 4, 1, 0x8a8e96);
    });
    for (let y = 4; y < 13; y++) for (let x = 6; x < 10; x++) p.set(x, y, y < 6 ? 0xfff0c0 : (y & 1) ? 0xffb030 : 0xe08a10, F_EMIT);
    p.rect(4, 8, 8, 1, 0x26262b);
  }
  return p.toCanvas();
}

// ---------------------------------------------------------------- pedestal icons
const RARITY: Record<string, number> = { common: 0x9a9a9a, rare: 0x3b8cff, epic: 0xb44cff, legendary: 0xffc83b };

export function buildPedestalIcon(category: string, rarity: string): HTMLCanvasElement {
  const p = new Pix(24, 24);
  const rc = RARITY[rarity] ?? RARITY.common;
  const r = makeRng(category.length * 13 + rarity.length);
  // outer halo (translucent, dithered)
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const d = Math.hypot(x + 0.5 - 12, y + 0.5 - 12);
    if (d > 11.5 || d < 9.5) continue;
    if (bayer(x, y) < (11.5 - d) / 2) p.set(x, y, rc, F_EMIT, 150);
  }
  // orb body
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const dx = (x + 0.5 - 12) / 9.5, dy = (y + 0.5 - 12) / 9.5;
    const d = dx * dx + dy * dy;
    if (d > 1) continue;
    const l = -dx * 0.5 - dy * 0.6 + Math.sqrt(1 - d) * 0.4 - 0.6;
    p.set(x, y, d > 0.82 ? lit(rc, 0.3) : ramp(mix(rc, 0x0a0a14, 0.72), l, x, y), F_EMIT);
  }
  p.set(8, 6, 0xffffff, F_EMIT); p.set(9, 6, lit(rc, 0.7), F_EMIT); p.set(8, 7, lit(rc, 0.6), F_EMIT);
  // glyph
  const g = mix(rc, 0xffffff, 0.55);
  const G = (x: number, y: number): void => p.set(x, y, g, F_EMIT);
  const line = (a: number, b: number, c: number, d: number): void => p.line(a, b, c, d, g, F_EMIT);
  switch (category) {
    case 'weapon': // crosshair
      for (let a = 0; a < 32; a++) { const t = (a / 32) * Math.PI * 2; G(12 + Math.cos(t) * 4.5, 12 + Math.sin(t) * 4.5); }
      line(12, 5, 12, 9); line(12, 15, 12, 19); line(5, 12, 9, 12); line(15, 12, 19, 12); G(12, 12);
      break;
    case 'movement': // double chevron up
      line(7, 13, 12, 8); line(12, 8, 17, 13); line(7, 17, 12, 12); line(12, 12, 17, 17);
      line(8, 13, 12, 9); line(12, 9, 16, 13);
      break;
    case 'passive': // hex shield
      line(12, 6, 17, 9); line(17, 9, 17, 15); line(17, 15, 12, 18); line(12, 18, 7, 15); line(7, 15, 7, 9); line(7, 9, 12, 6);
      line(12, 9, 12, 15); line(10, 12, 14, 12);
      break;
    case 'onkill': // skull
      p.ellipse(12, 11, 4.5, 4, g, F_EMIT);
      p.rect(10, 14, 5, 3, g, F_EMIT);
      p.set(10, 11, 0x100808); p.set(11, 11, 0x100808); p.set(13, 11, 0x100808); p.set(14, 11, 0x100808);
      p.set(10, 10, 0x100808); p.set(14, 10, 0x100808);
      p.set(12, 13, 0x100808); p.set(11, 16, 0x100808); p.set(13, 16, 0x100808);
      break;
    case 'curse': { // sickly eye
      const c2 = 0x8aff3a;
      for (let x = 6; x <= 18; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 12) / 6.5) ** 2)) * 3.5); p.set(x, 12 - h, c2, F_EMIT); p.set(x, 12 + h, c2, F_EMIT); }
      p.ellipse(12, 12, 2.2, 2.2, c2, F_EMIT); p.set(12, 12, 0x0a1004); p.set(12, 11, 0x0a1004);
      for (let i = 0; i < 3; i++) p.line(9 + i * 3, 16, 8 + i * 3 + (r() < 0.5 ? 0 : 2), 19, 0x5ad818, F_EMIT);
      break;
    }
    case 'legendary': // star
    default: {
      const pts: number[] = [];
      for (let k = 0; k < 10; k++) { const t = -Math.PI / 2 + (k / 10) * Math.PI * 2, rr = k % 2 ? 2.6 : 6.4; pts.push(12 + Math.cos(t) * rr, 12.5 + Math.sin(t) * rr); }
      p.poly(pts, g, F_EMIT);
      p.set(12, 11, 0xffffff, F_EMIT); p.set(12, 12, 0xffffff, F_EMIT);
    }
  }
  if (rarity === 'legendary' || rarity === 'epic') {
    for (const [x, y] of [[3, 4], [20, 3], [21, 19], [2, 18]]) { p.set(x, y, 0xffffff, F_EMIT); p.set(x + 1, y, rc, F_EMIT, 180); p.set(x, y + 1, rc, F_EMIT, 180); }
  }
  return p.toCanvas();
}

