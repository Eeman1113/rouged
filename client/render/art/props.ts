// Props + pickups, wave 2: THE BROKER vendor, sanctuary shrine, scrap shard, shield flash,
// shell/hex projectiles, jungle foliage billboards.
import { Pix, makeRng, part, glowBlob, glint, mix, lit, ramp, bayer, F_EMIT, F_FLAT } from './core';
import { shieldPlate, HEX_HOT, HEX, HEX_EDGE } from './enemies2';

// ---------------------------------------------------------------- THE BROKER (40x56)
export function buildVendor(frame: number): HTMLCanvasElement {
  const f = frame & 1;
  const p = new Pix(40, 56);
  const COAT = 0x5a4a3a, COAT2 = 0x3e3228, PATCH = [0x6a5a3a, 0x4a5a5a, 0x7a3a2a], METAL = 0x6a6e74, DARK = 0x22222a;
  const oy = f; // breathing hunch
  // crate seat
  part(p, (l) => {
    l.box(8, 44, 24, 11, 0x5a4a32);
    for (let x = 8; x < 32; x += 6) for (let y = 45; y < 54; y++) l.set(x, y, 0x3a2a1c);
    l.rect(8, 48, 24, 1, 0x3a2a1c);
  });
  // legs folded
  part(p, (l) => {
    l.limb(14, 42, 8, 48, 2.6, COAT2); l.limb(8, 48, 11, 54, 2, METAL); l.box(7, 53, 7, 3, DARK);
    l.limb(26, 42, 32, 48, 2.6, COAT2); l.limb(32, 48, 29, 54, 2, METAL); l.box(27, 53, 7, 3, DARK);
  });
  // coat body hunched
  part(p, (l) => {
    l.poly([9, 20 + oy, 31, 20 + oy, 34, 44, 6, 44], COAT);
    for (let y = 22; y < 44; y++) { if (l.has(20, y)) l.set(20, y, COAT2); for (let x = 26; x < 35; x++) if (l.has(x, y) && ((x + y) & 1)) l.tint(x, y, (c) => lit(c, -0.3)); }
    // patches with stitches
    const pts = [[10, 30, 6, 5], [24, 24, 5, 6], [12, 38, 7, 4]];
    pts.forEach(([x, y, w, h], i) => { l.rect(x, y + oy * (y < 30 ? 1 : 0), w, h, PATCH[i]); for (let k = 0; k < w; k += 2) { l.set(x + k, y - 1 + oy * (y < 30 ? 1 : 0), 0xc8b890); } });
    // collar
    l.poly([9, 19 + oy, 31, 19 + oy, 28, 25 + oy, 20, 27 + oy, 12, 25 + oy], COAT2);
  });
  // tray of glowing wares on lap
  part(p, (l) => { l.box(6, 38, 28, 4, METAL); l.rect(6, 41, 28, 1, lit(METAL, -0.5)); });
  const wares: [number, number, number, number, number][] = [
    [10, 36, 0xfff0c0, 0xffb030, 0x9a5208], [16, 36, 0xd8fcff, 0x3ae8ff, 0x0a4a6a], [22, 36, 0xffe0ff, 0xc050ff, 0x6a1aa8], [28, 36, 0xd8ffb0, 0x7ae050, 0x1e6a2a],
  ].map(([x, y, a, b, c]) => [x, y, a, b, c]);
  wares.forEach(([x, y, a, b, c], i) => {
    glowBlob(p, x, y + ((i + f) % 2 ? 0 : 0.5), 1.8 + ((i + f) % 2) * 0.3, a, b, c);
    if ((i + f) % 3 === 0) p.set(x, y - 3, b, F_EMIT);
  });
  // tags
  p.set(13, 39, 0xe8e0d0); p.set(25, 39, 0xe8e0d0);
  // arms resting over the tray
  part(p, (l) => {
    l.limb(9, 24 + oy, 6, 34, 2.4, COAT); l.limb(6, 34, 11, 38, 2, COAT2);
    l.limb(31, 24 + oy, 34, 33, 2.4, COAT); l.limb(34, 33, 30 - f, 37, 2, COAT2);
    l.box(10, 36, 4, 3, METAL); l.box(28 - f, 35, 4, 3, METAL);
  });
  // head: hood + cracked visor showing a faint human face
  const hx = 20, hy = 14 + oy;
  part(p, (l) => {
    l.ball(hx, hy, 8, 8.5, COAT2);
    l.ball(hx, hy + 1, 6, 6, METAL);
    l.rect(hx - 5, hy - 2, 11, 7, 0x0a1214, F_FLAT);
  });
  // visor glass with face
  for (let y = hy - 2; y < hy + 5; y++) for (let x = hx - 5; x < hx + 6; x++) {
    const t = (y - hy + 2) / 7;
    p.set(x, y, mix(0x1a3a3e, 0x0a1a1e, t) , F_EMIT);
  }
  const SK = 0x8aa8a0, SKD = 0x4a6a64;
  for (const [x, y] of [[-2, 0], [2, 0]]) { p.set(hx + x, hy + y, SKD, F_EMIT); p.set(hx + x, hy + y - 1, SK, F_EMIT); }
  p.set(hx, hy + 2, SKD, F_EMIT); p.set(hx - 1, hy + 3, SK, F_EMIT); p.set(hx + 1, hy + 3, SK, F_EMIT);
  for (let x = -3; x <= 3; x++) p.set(hx + x, hy - 2, mix(0x1a3a3e, SK, 0.35), F_EMIT);
  if (f) { p.set(hx - 2, hy, 0xd8fff0, F_EMIT); p.set(hx + 2, hy, 0xd8fff0, F_EMIT); }
  // crack + glare
  p.line(hx + 4, hy - 2, hx + 1, hy + 2, 0xc8e8e0, F_FLAT); p.line(hx + 1, hy + 2, hx + 2, hy + 4, 0xc8e8e0, F_FLAT);
  p.set(hx - 4, hy - 1, 0xffffff, F_EMIT);
  // antenna + status light
  p.line(hx + 6, hy - 6, hx + 9, hy - 12, DARK); p.set(hx + 9, hy - 13, f ? 0xffb030 : 0x9a5208, F_EMIT);
  return p.toCanvas();
}

// ---------------------------------------------------------------- shrine (32x48)
export function buildShrine(): HTMLCanvasElement {
  const p = new Pix(32, 48);
  const r = makeRng(3200);
  const ST = 0xb8b0a0, ST2 = 0x8a8274;
  const GH = 0xffffff, GM = 0xfff0c0, GE = 0xe0b050;
  part(p, (l) => {
    l.box(4, 42, 24, 6, ST2); l.box(6, 38, 20, 5, ST);
    l.box(9, 8, 14, 31, ST);
    for (let y = 9; y < 38; y++) for (let x = 19; x < 23; x++) if ((x + y) & 1 || x > 20) l.tint(x, y, (c) => lit(c, -0.25));
    l.box(6, 4, 20, 5, ST2); l.box(8, 1, 16, 4, ST);
    for (let i = 0; i < 30; i++) l.tint(9 + Math.floor(r() * 14), 9 + Math.floor(r() * 30), (c) => lit(c, -0.2));
  });
  // gold inlay
  for (let x = 6; x < 26; x++) p.set(x, 6, x & 1 ? 0xd8a030 : 0xffd060);
  for (let y = 10; y < 37; y += 4) { p.set(10, y, 0xd8a030); p.set(21, y, 0xd8a030); }
  // niche + heart-like core
  p.ellipse(16, 20, 5, 7, 0x1a140c, F_FLAT);
  const heart = (x: number, y: number): boolean => {
    const X = (x - 16) / 4.2, Y = -(y - 20) / 4.2 + 0.25;
    return (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y <= 0;
  };
  for (let y = 13; y < 27; y++) for (let x = 10; x < 23; x++) if (heart(x + 0.5, y + 0.5)) {
    const d = Math.hypot(x - 15.5, y - 19.5) / 5 + (bayer(x, y) - 0.5) * 0.25;
    p.set(x, y, d < 0.35 ? GH : d < 0.7 ? GM : GE, F_EMIT);
  }
  // soft halo rays
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; for (let d = 7; d < 10; d++) p.blend(16 + Math.cos(a) * d, 20 + Math.sin(a) * d * 1.2, GM, 120 - (d - 7) * 35, F_EMIT); }
  glint(p, 15, 18, 0xffffff, GM, 1);
  // candles on base
  for (const x of [7, 24]) { p.rect(x, 35, 2, 3, 0xe8e0d0); p.set(x, 34, 0xffd060, F_EMIT); p.set(x, 33, 0xfff0c0, F_EMIT); }
  return p.toCanvas();
}

// ---------------------------------------------------------------- scrap (12x12)
export function buildScrap(): HTMLCanvasElement {
  const p = new Pix(12, 12);
  const AM = [0xfff4c0, 0xffb030, 0xa85a10], TE = [0xd8fff8, 0x3ae8c8, 0x0a6a5a];
  // hexagonal data shard coin: amber rim, teal core
  const pts = [6, 0.5, 11, 3.2, 11, 8.8, 6, 11.5, 1, 8.8, 1, 3.2];
  const l = new Pix(12, 12);
  l.poly(pts, AM[1], F_EMIT);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
    if (!l.has(x, y)) continue;
    const d = Math.hypot(x - 5.5, y - 5.5);
    let c = d > 4.2 ? (x + y < 11 ? AM[0] : AM[2]) : d > 3.2 ? AM[1] : d > 2 ? TE[1] : TE[0];
    if (d <= 3.2 && d > 2 && ((x + y) & 1)) c = TE[2];
    l.set(x, y, c, F_EMIT);
  }
  // circuit notch
  l.set(5, 5, 0xffffff, F_EMIT); l.set(7, 6, TE[2], F_EMIT); l.set(4, 7, TE[2], F_EMIT);
  l.outline(0x1a0e04);
  p.draw(l);
  p.set(3, 3, 0xffffff, F_EMIT);
  return p.toCanvas();
}

// ---------------------------------------------------------------- shield flash (32x40)
export function buildShield(): HTMLCanvasElement {
  const p = new Pix(32, 40);
  shieldPlate(p, 15.5, 20, 14, 17, 0, undefined, 175);
  // extra sparkle nodes
  for (const [x, y] of [[6, 8], [24, 12], [10, 30], [22, 28]]) glint(p, x, y, 0xffffff, 0x8ad8ff, 1);
  return p.toCanvas();
}

// ---------------------------------------------------------------- projectiles
export function buildProjectile2(kind: string): HTMLCanvasElement {
  const r = makeRng(3300 + kind.length);
  if (kind === 'shell') {
    const p = new Pix(12, 12);
    part(p, (l) => { l.ball(5.5, 6.5, 4.4, 4.4, 0x3a3c42); l.rect(3, 6, 6, 1, 0x6a5a3a); });
    glowBlob(p, 7.5, 3, 2.2, 0xfff0c0, 0xffa020, 0xc04a08, 0.4, r);
    p.set(9, 1, 0xfff27a, F_EMIT); p.set(10, 0, 0xffa020, F_EMIT);
    p.set(4, 5, 0x8a8e96);
    return p.toCanvas();
  }
  // hex orb (14px)
  const p = new Pix(14, 14);
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
    const d = Math.hypot(x - 6.5, y - 6.5) / 7;
    if (d > 1) continue;
    const v = d + (bayer(x, y) - 0.5) * 0.22;
    p.set(x, y, v < 0.25 ? 0xffffff : v < 0.48 ? HEX_HOT : v < 0.75 ? HEX : HEX_EDGE, F_EMIT, v > 0.88 ? 140 : 255);
  }
  // hexagram glyph ring
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, b = a + Math.PI / 3; p.line(6.5 + Math.cos(a) * 5, 6.5 + Math.sin(a) * 5, 6.5 + Math.cos(b) * 5, 6.5 + Math.sin(b) * 5, HEX_HOT, F_EMIT); }
  p.set(5, 5, 0xffffff, F_EMIT);
  return p.toCanvas();
}

// ---------------------------------------------------------------- foliage
const BIO_HOT = 0xeaffd0, BIO = 0x9aff4a, BIO_TEAL = 0x3ae8c8, BIO_DIM = 0x1a7a5a;

/** Shaded leaf blade from (x,y) along angle, width profile, central vein. */
function blade(l: Pix, x: number, y: number, ang: number, len: number, wid: number, col: number, curl = 0): void {
  let a = ang, px = x, py = y;
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const w = Math.sin(Math.min(1, t * 1.2) * Math.PI) * wid;
    const nx = -Math.sin(a), ny = Math.cos(a);
    for (let j = -w; j <= w; j += 0.5) {
      const qx = px + nx * j, qy = py + ny * j;
      const side = j / (w || 1);
      l.set(qx, qy, ramp(col, -side * 0.6 * Math.sign(ny || 1) + 0.15 - t * 0.3, Math.floor(qx), Math.floor(qy)));
    }
    l.set(px, py, lit(col, -0.4));
    px += Math.cos(a); py += Math.sin(a); a += curl;
  }
}

export function buildFoliage(v: number): HTMLCanvasElement {
  const r = makeRng(3400 + v);
  if (v === 0) {
    // tall fern 24x40
    const p = new Pix(24, 40);
    part(p, (l) => {
      for (let k = 0; k < 7; k++) {
        const ang = -Math.PI / 2 + (k - 3) * 0.32;
        const len = 30 - Math.abs(k - 3) * 4;
        let px = 12, py = 39, a = ang;
        for (let i = 0; i < len; i++) {
          l.set(px, py, 0x2a4a1a);
          if (i > 3 && i % 2 === 0) { const s = 4 * (1 - i / len) + 1; l.line(px, py, px - Math.sin(a) * s + Math.cos(a) * 1.5, py + Math.cos(a) * s * 0.4 - 1, (i & 2) ? 0x4a8a30 : 0x3a7028); l.line(px, py, px + Math.sin(a) * s + Math.cos(a) * 1.5, py - Math.cos(a) * s * 0.4 - 1, (i & 2) ? 0x3a7028 : 0x5a9a38); }
          px += Math.cos(a); py += Math.sin(a); a += (k - 3) * 0.012;
        }
      }
    }, { bevel: false, outline: 0x0c140a });
    return p.toCanvas();
  }
  if (v === 1) {
    // broad-leaf bush 40x28
    const p = new Pix(40, 28);
    part(p, (l) => {
      const cols = [0x3a7028, 0x4a8a30, 0x2e5a1e, 0x5a9a38];
      for (let k = 0; k < 11; k++) {
        const ang = -Math.PI + 0.25 + (k / 10) * (Math.PI - 0.5) + (r() - 0.5) * 0.2;
        blade(l, 20 + (r() - 0.5) * 6, 27, ang, 11 + r() * 7, 3.4 + r(), cols[k % 4], (r() - 0.5) * 0.04);
      }
    }, { bevel: false, outline: 0x0c140a });
    return p.toCanvas();
  }
  if (v === 2) {
    // hanging vine strand 12x48 (top-anchored)
    const p = new Pix(12, 48);
    part(p, (l) => {
      let x = 6;
      for (let y = 0; y < 46; y++) {
        l.set(x, y, 0x2e5a1e); l.set(x + 1, y, 0x1e3a14);
        if (r() < 0.15) x += r() < 0.5 ? -1 : 1; x = Math.max(3, Math.min(8, x));
        if (y % 4 === 2) blade(l, x, y, y % 8 === 2 ? 0.5 : Math.PI - 0.5, 4 + r() * 2, 1.4, y % 8 === 2 ? 0x4a8a30 : 0x3a7028);
      }
    }, { bevel: false, outline: 0x0c140a });
    p.set(6, 46, BIO, F_EMIT); p.set(6, 47, BIO_DIM, F_EMIT);
    return p.toCanvas();
  }
  if (v === 3) {
    // giant leaf cluster 40x40 (elephant ears)
    const p = new Pix(40, 40);
    part(p, (l) => {
      const L = [[-2.3, 0x3a7028], [-0.85, 0x2e5a1e], [-1.95, 0x5a9a38], [-1.2, 0x4a8a30], [-1.55, 0x4a8a30]] as const;
      for (const [ang, col] of L) {
        const len = 20, ex = 20 + Math.cos(ang) * len, ey = 39 + Math.sin(ang) * len;
        l.line(20, 39, ex, ey, 0x2a4a1a);
        blade(l, ex - Math.cos(ang) * 4, ey - Math.sin(ang) * 4, ang + (ang < -1.57 ? -0.4 : 0.4), 16, 7, col, ang < -1.57 ? 0.04 : -0.04);
      }
    }, { bevel: false, outline: 0x0c140a });
    // dew glints
    p.set(10, 12, 0xd8ffd0); p.set(29, 10, 0xd8ffd0);
    return p.toCanvas();
  }
  if (v === 4) {
    // glowing mushroom cluster 24x24
    const p = new Pix(24, 24);
    const caps: [number, number, number][] = [[8, 12, 5], [16, 9, 6], [13, 17, 3.4], [4, 18, 2.6], [20, 18, 2.6]];
    part(p, (l) => { for (const [x, y, s] of caps) l.limb(x, y + 1, x + (x - 12) * 0.05, 23, Math.max(1, s * 0.3), 0xc8d0c0); }, { bevel: false, outline: 0x0a1410 });
    for (const [x, y, s] of caps) {
      for (let yy = Math.floor(y - s * 0.7); yy <= y + 1; yy++) for (let xx = Math.floor(x - s); xx <= x + s; xx++) {
        const dx = (xx + 0.5 - x) / s, dy = (yy + 0.5 - y - 1) / (s * 0.75);
        if (dx * dx + dy * dy > 1) continue;
        const v2 = dx * dx + dy * dy + (bayer(xx, yy) - 0.5) * 0.3;
        p.set(xx, yy, yy > y ? BIO_DIM : v2 < 0.25 ? BIO_HOT : v2 < 0.6 ? BIO_TEAL : 0x1a9a8a, F_EMIT);
      }
      p.set(x - s * 0.4, y - s * 0.3, 0xffffff, F_EMIT);
    }
    for (let i = 0; i < 6; i++) p.blend(4 + r() * 16, 2 + r() * 12, BIO, 150, F_EMIT);
    return p.toCanvas();
  }
  // small palm 32x44
  const p = new Pix(32, 44);
  part(p, (l) => {
    for (let y = 43, x = 16; y > 14; y--) { const w = 1.6 + (y - 14) / 30; l.limb(x, y, x, y - 1, w, 0x6a5a3a); if (y % 3 === 0) l.set(x - 1, y, 0x3a2a1a); if (y % 9 === 0) x += 0.6; }
  });
  part(p, (l) => {
    const cols = [0x3a7028, 0x4a8a30, 0x2e5a1e, 0x5a9a38];
    const fr = [-2.9, -2.4, -1.9, -1.3, -0.75, -0.25, -1.6];
    fr.forEach((ang, k) => {
      let px = 17, py = 14, a = ang;
      for (let i = 0; i < 16; i++) {
        l.set(px, py, 0x2a4a1a);
        const s = 4 * Math.sin((i / 16) * Math.PI);
        if (i > 1) { l.line(px, py, px + Math.cos(a + 1.9) * s, py + Math.sin(a + 1.9) * s + 1, cols[k % 4]); l.line(px, py, px + Math.cos(a - 1.9) * s, py + Math.sin(a - 1.9) * s + 1, cols[(k + 1) % 4]); }
        px += Math.cos(a); py += Math.sin(a); a += ang < -1.57 ? -0.06 : ang > -1.5 ? 0.06 : 0;
      }
    });
  }, { bevel: false, outline: 0x0c140a });
  for (const [x, y] of [[15, 15], [18, 16]]) { p.set(x, y, 0x6a4a1a); p.set(x + 1, y, 0x8a6a2a); }
  return p.toCanvas();
}
