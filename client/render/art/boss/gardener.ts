// THE GARDENER — rusted botanical frame, a seed-pod head that blooms open, shears and a lance.
import { Rng, glowBlob, sparks, glint, mul, mix, lit, F_EMIT, makeRng } from '../core';
import { exposedCore, EYE, EYE_DIM } from '../enemies';
import { rivetRow } from '../warden';
import { TPix, BP, BossArt, bpart, p3, cracks } from './rig';
import { moveClips } from './clips';

const BIO_HOT = 0xeaffd0, BIO = 0x9aff4a, BIO_TEAL = 0x3ae8c8, BIO_DIM = 0x1a7a5a;
const S = { rust: 0x8a5a36, rust2: 0x5a3a26, dark: 0x2a2220, vine: 0x3a6a2a, vine2: 0x2a4a1e, leaf: 0x4a8a34, petal: 0xd04a7a, trim: 0xb8904a };

function vineOver(l: TPix, r: Rng, x: number, y: number, n: number, col: number): void {
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    ang += (r() - 0.5) * 0.9;
    x += Math.cos(ang); y += Math.sin(ang);
    if (!l.has(x, y)) { ang += Math.PI * 0.6; continue; }
    l.set(x, y, col); if (i % 3 === 0 && l.has(x + 1, y)) l.set(x + 1, y, lit(col, -0.3));
    if (i % 7 === 3) { l.set(x, y - 1, lit(col, 0.4)); l.set(x - 1, y - 1, lit(col, 0.2)); }
  }
}
function flower(p: TPix, x: number, y: number, col: number, glow: boolean): void {
  p.set(x - 1, y, col); p.set(x + 1, y, col); p.set(x, y - 1, col); p.set(x, y + 1, lit(col, -0.3));
  p.set(x, y, glow ? BIO_HOT : 0xffe060, glow ? F_EMIT : 0);
}

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const ox = Math.round(b.ox), oy = Math.round(b.bob + b.crouch * 8 + (stag ? 10 : b.kneel * 12));
  const sw = b.sw * 3;
  const vr = makeRng(4242);
  const rooted = b.mode > 0.5;
  // root tendril legs (dig in and spread when rooted)
  bpart(p, (l) => {
    for (let i = 0; i < 7; i++) {
      const x0 = 30 + i * 6 + ox, s = (i - 3) / 3;
      const w = Math.sin(i * 1.7 + b.t * Math.PI * 2) * (rooted ? 0.6 : 2) + sw * (i % 2 ? 1 : -1) * 0.5;
      const spread = rooted ? 1.5 : 1 + b.crouch * 0.4;
      const x1 = x0 + s * 10 * spread + w, y1 = 96 + oy * 0.4, x2 = x0 + s * 22 * spread + w * 1.5, y2 = 110 - (stag ? 0 : Math.abs(w) > 2 ? 2 : 0);
      l.limb(x0, 78 + oy, x1, y1, 3.6 - Math.abs(s), S.vine2);
      l.limb(x1, y1, x2, y2, 2.4 - Math.abs(s) * 0.5, S.vine2);
      l.limb(x2, y2, x2 + s * (rooted ? 8 : 4), 111, 1, mul(S.vine2, 0.8));
    }
  });
  for (let i = 0; i < 7; i += 2) p.set(30 + i * 6 + ox + ((i - 3) / 3) * 16, 103 + (i % 3), BIO_TEAL, F_EMIT);
  // torso frame
  bpart(p, (l) => {
    l.poly([22 + ox, 40 + oy, 74 + ox, 40 + oy, 68 + ox, 82 + oy, 28 + ox, 82 + oy], S.rust);
    for (let y = 41; y < 82; y++) for (let x = 56; x < 75; x++) if (l.has(x + ox, y + oy) && (x > 62 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.3));
    for (const [x0, y0] of [[30, 46], [50, 46], [30, 62], [50, 62]]) { l.rect(x0 + ox, y0 + oy, 15, 12, S.dark); for (let x = 0; x < 15; x += 5) for (let y = 0; y < 12; y++) l.set(x0 + x + ox, y0 + y + oy, S.rust2); }
    rivetRow(l, 25 + ox, 70 + ox, 43 + oy, 5, S.trim);
    for (let i = 0; i < 70; i++) l.tint(24 + ox + Math.floor(r() * 50), 41 + oy + Math.floor(r() * 40), (c) => mix(c, 0x5a2a12, 0.5));
    for (let i = 0; i < 9; i++) vineOver(l, vr, 26 + ox + vr() * 44, 42 + oy + vr() * 38, 40, i % 2 ? S.vine : S.leaf);
  });
  if (b.dmg >= 1) cracks(p, r, 26 + ox, 42 + oy, 44, 38, b.dmg >= 2 ? 8 : 4, BIO_HOT, BIO);
  if (!stag) for (const [x, y] of [[37, 52], [57, 54], [36, 68], [58, 70]]) glowBlob(p, x + ox, y + oy, 2 + b.charge, BIO_HOT, BIO, BIO_DIM);
  else { exposedCore(p, r, 48 + ox, 62 + oy, 7, Math.floor(b.t * 4)); sparks(p, r, 48 + ox, 62 + oy, 18, 10); }
  // arms: shears (left) + watering lance (right). -1 = slash across / aimed lance
  const lh = stag ? [10, 100 - oy] : p3(b.aL, [40, 60], [8 - sw, 86], [6, 20]);
  const rh = stag ? [86, 96 - oy] : p3(b.aR, [80, 60], [88 + sw, 86], [90, 22]);
  bpart(p, (l) => {
    l.limb(24 + ox, 46 + oy, 12 + ox, 58 + oy, 4, S.rust2); l.limb(12 + ox, 58 + oy, lh[0] + ox, lh[1] + oy, 3.4, S.rust2);
    l.limb(72 + ox, 46 + oy, 84 + ox, 58 + oy, 4, S.rust2); l.limb(84 + ox, 58 + oy, rh[0] + ox, rh[1] + oy, 3.4, S.rust2);
    const ly = lh[1] + oy, ry = rh[1] + oy;
    const ldir = b.aL > 0.3 ? -1 : 1, rdir = b.aR > 0.3 ? -1 : 1;
    const snip = b.aL < -0.3 ? 1 - b.flash * 0.8 : 1; // shears close on the snip
    if (b.aL < -0.3) { l.limb(lh[0] + ox, ly, lh[0] + ox + 12, ly - 5 * snip, 1.6, 0x9a9aa0); l.limb(lh[0] + ox, ly, lh[0] + ox + 12, ly + 5 * snip, 1.6, 0x7a7a80); }
    else { l.limb(lh[0] + ox, ly, lh[0] + ox - 5, ly + ldir * 12, 1.6, 0x9a9aa0); l.limb(lh[0] + ox, ly, lh[0] + ox + 4, ly + ldir * 12, 1.6, 0x7a7a80); }
    l.box(rh[0] + ox - 4, ry - 4, 9, 8, S.rust); l.ball(rh[0] + ox, ry + rdir * 5, 3.4, 2.4, S.trim);
    for (let i = 0; i < 4; i++) vineOver(l, vr, 12 + ox + vr() * 8, 56 + oy, 18, S.vine);
  });
  if (b.aL < -0.3 && b.flash > 0.3) { for (let i = 0; i < 10; i++) p.set(lh[0] + ox + 12 + r() * 6, lh[1] + oy + (r() - 0.5) * 10, i % 2 ? 0xffffff : 0xc8d8e0, F_EMIT); }
  if (b.aR < -0.3 && b.flash > 0.2) glowBlob(p, rh[0] + ox, rh[1] + oy + 6, 3 + b.flash * 4, 0xffffff, BIO_HOT, BIO, 0.35, r);
  // pod head: petals open = weak point
  const hx = 48 + ox, hy = 24 + oy + (stag ? 4 : 0);
  const open = b.open * 8 + b.charge * 2;
  bpart(p, (l) => {
    l.limb(48 + ox, 40 + oy, hx, hy + 10, 4, S.vine2);
    l.ball(hx - 4 - open, hy, 11, 15, S.vine);
    l.ball(hx + 4 + open, hy, 11, 15, S.vine2);
    l.poly([hx - 4, hy - 22, hx + 4, hy - 22, hx + 2, hy - 12, hx - 2, hy - 12], S.vine);
    for (let y = hy - 14; y < hy + 14; y += 3) for (let x = hx - 14 - open; x < hx + 15 + open; x++) if (l.has(x, y) && ((x + y) % 5 === 0)) l.tint(x, y, (c) => lit(c, -0.3));
    l.box(hx - 10, hy + 11, 21, 5, S.rust); rivetRow(l, hx - 8, hx + 8, hy + 13, 4, S.trim);
  });
  {
    const g = open + 1.4;
    p.ellipse(hx, hy, g + 1, 12, 0x0a1a10, 0);
    glowBlob(p, hx, hy, g, b.open > 0.6 ? 0xffffff : BIO_HOT, BIO, BIO_TEAL);
    for (let y = -10; y <= 10; y++) if (Math.abs(y) > g * 1.6) p.set(hx, hy + y, y % 3 ? BIO_TEAL : BIO, F_EMIT);
    if (b.charge > 0.5) { glint(p, hx, hy, 0xffffff, BIO_HOT, 2); sparks(p, r, hx, hy, 18, 8); for (let i = 0; i < 10; i++) { const t = r() * 6.28, d = 16 + r() * 8; p.set(hx + Math.cos(t) * d, hy + Math.sin(t) * d, i % 2 ? BIO : BIO_TEAL, F_EMIT); } }
    if (b.aux > 0.2) for (let i = 0; i < 14 * b.aux; i++) { const t = r() * 6.28, d = 8 + r() * 26 * b.aux; p.set(hx + Math.cos(t) * d, hy - 6 + Math.sin(t) * d * 0.6 - b.aux * 6, i % 3 ? 0xd8ff9a : 0xfff0c0, F_EMIT); }
    if (b.pain > 0.5) glowBlob(p, hx, hy, 4, 0xffffff, 0xffffff, BIO_HOT);
  }
  const ec = b.pain > 0.5 ? 0xffffff : stag ? EYE_DIM : EYE;
  for (const [x, y] of [[-10, -4], [10, -4], [-8, 4], [8, 4]]) { p.set(hx + x + (x < 0 ? -open : open), hy + y, ec, F_EMIT); p.set(hx + x + (x < 0 ? -open : open) + 1, hy + y, mul(ec, 0.6), F_EMIT); }
  const fr2 = makeRng(777);
  for (let i = 0; i < 12; i++) { const x = 20 + fr2() * 56 + ox, y = 38 + fr2() * 46 + oy; if (p.has(x, y)) flower(p, Math.round(x), Math.round(y), i % 3 ? S.petal : 0xe8e0f0, i % 4 === 0 || b.charge > 0.5); }
  for (const [x, y] of [[24, 40], [70, 42], [28, 80], [66, 80], [hx - 12 - ox, hy + 14 - oy]]) { p.set(x + ox, y + oy, BIO, F_EMIT); p.set(x + 1 + ox, y + oy, BIO_TEAL, F_EMIT); p.set(x + ox, y + 1 + oy, BIO_DIM, F_EMIT); }
  for (let x = 24; x < 74; x += 4) { const len = 2 + ((x * 7) % 6) + Math.round(Math.sin(b.t * 6 + x) * 0.8); for (let j = 0; j < len; j++) if (p.has(x + ox, 82 + oy - 1)) p.set(x + ox, 82 + oy + j, j === len - 1 ? BIO_DIM : S.vine2, j === len - 1 ? F_EMIT : 0); }
  if (b.pain > 0.5) { sparks(p, r, 44, 60, 18, 12); for (let i = 0; i < 10; i++) p.set(30 + r() * 36, 40 + r() * 40, S.leaf); }
  if (b.glitch > 0.3) for (let i = 0; i < 20 * b.glitch; i++) p.set(48 + (r() - 0.5) * 70, 50 + (r() - 0.5) * 70, i % 2 ? S.leaf : S.petal);
}

function dead(p: TPix, r: Rng): void {
  for (let y = 102; y < 112; y++) for (let x = -4; x < 100; x++) if (r() < 0.9 - Math.abs(x - 48) / 58) p.set(x, y, r() < 0.5 ? 0x2a2014 : 0x1e180e, 0);
  bpart(p, (l) => { for (let i = 0; i < 6; i++) l.limb(10 + i * 15, 110, 16 + i * 14, 100 - (i % 2) * 4, 2, S.vine2); });
  bpart(p, (l) => {
    l.poly([14, 110, 20, 90, 72, 88, 82, 110], S.rust);
    for (const x0 of [26, 46, 62]) l.rect(x0, 94, 10, 8, S.dark);
    const vr = makeRng(99); for (let i = 0; i < 6; i++) vineOver(l, vr, 20 + vr() * 56, 92 + vr() * 16, 30, S.vine);
  });
  bpart(p, (l) => { l.ball(80, 98, 12, 9, S.vine2); l.ball(70, 100, 9, 8, S.vine); });
  p.ellipse(76, 99, 2, 6, 0x0a1a10, 0); p.set(76, 99, BIO_DIM, F_EMIT);
  const fr2 = makeRng(12); for (let i = 0; i < 9; i++) flower(p, Math.round(18 + fr2() * 60), Math.round(92 + fr2() * 14), i % 2 ? S.petal : 0xe8e0f0, i % 3 === 0);
  sparks(p, r, 50, 96, 4, 2);
}

export function gardenerArt(): BossArt {
  return {
    draw, dead, worldH: 7.0, glow: [0xff2020, 0x9aff4a],
    clips: {
      ...moveClips('roots', { W: { aL: 1, aR: 1, crouch: 0.3, charge: 0.4 }, A: { aL: -0.2, aR: -0.2, crouch: 0.7, charge: 0.6 }, xw: { sy: 1.05 }, xa: { sy: 0.9, sx: 1.05 }, n: [6, 5, 6] }),
      ...moveClips('shears', { W: { aL: 1, crouch: 0.3 }, A: { aL: -1, flash: 1 }, L: { aL: -1, flash: 1, open: 0.7 }, xw: { lean: -6 }, xa: { lean: 7 }, n: [6, 4, 6], shake: 1 }),
      ...moveClips('spores', { W: { open: 1, charge: 1, crouch: 0.3 }, A: { open: 1, aux: 1, charge: 0.6 }, act: (k) => ({ aux: 0.5 + k * 0.5 }), n: [7, 5, 6], shake: 0.5 }),
      ...moveClips('lance', { W: { aR: 1, charge: 0.4 }, A: { aR: -1, flash: 0.8 }, act: (k) => ({ flash: 0.6 + 0.4 * Math.sin(k * 30) }), loop: true, xa: { lean: 2, jit: 0.5 }, n: [6, 4, 6] }),
      ...moveClips('vines', { W: { aL: 0.6, aR: 0.6, charge: 0.7 }, A: { aL: -0.4, aR: -0.4, crouch: 0.5 }, xa: { sy: 0.95 }, n: [5, 4, 5] }),
      ...moveClips('seed', { W: { aR: 1, open: 0.3 }, A: { aR: -1, open: 0.4 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 6) > 0 ? 1 : 0.1 }), n: [5, 6, 5] }),
      ...moveClips('overgrowth', { W: { charge: 1, open: 0.8, aL: 1, aR: 1, mode: 1 }, A: { charge: 1, open: 0.8, mode: 1, aux: 0.6 }, act: (k) => ({ aL: Math.sin(k * 14) * 0.7, aR: -Math.sin(k * 14) * 0.7 }), loop: true, n: [6, 6, 5] }),
    },
  };
}
