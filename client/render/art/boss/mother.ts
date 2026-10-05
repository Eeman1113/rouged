// THE MOTHER — gestation vat on insect legs; a curled shape inside; nozzle arms.
import { Rng, glowBlob, sparks, mix, lit, bayer, F_EMIT, F_FLAT, makeRng } from '../core';
import { exposedCore, EYE_DIM } from '../enemies';
import { rivetRow } from '../warden';
import { TPix, BP, BossArt, bpart, p3 } from './rig';
import { moveClips } from './clips';

const FL_HOT = 0xd8ffb0, FL = 0x7ae050, FL_MID = 0x3aa040, FL_DARK = 0x16502a, FL_DEEP = 0x0a2a18;
const S = { metal: 0x8a9290, metal2: 0x5a625e, dark: 0x2a302e, flesh: 0x9a6a6a, cable: 0x4a3a3e, trim: 0xb0c8a0 };

function vatFluid(p: TPix, x0: number, y0: number, w: number, h: number, level: number, glow: number, f: number): void {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const yy = y0 + y, xx = x0 + x;
    if (y < h * (1 - level)) { p.set(xx, yy, mix(0x0c1612, 0x1a2a24, x / w), F_FLAT); continue; }
    const t = (x / (w - 1)) * 2 - 1;
    const v = Math.abs(t) * 0.7 + (1 - y / h) * 0.15 - glow * 0.35 + (bayer(xx, yy) - 0.5) * 0.3;
    p.set(xx, yy, v < 0.2 ? FL : v < 0.5 ? FL_MID : v < 0.8 ? FL_DARK : FL_DEEP, F_EMIT);
  }
  const br = makeRng(91 + f);
  for (let i = 0; i < 9; i++) {
    const bx = x0 + 3 + Math.floor(br() * (w - 6)), by = y0 + Math.floor(h * (1 - level)) + 2 + Math.floor(br() * h * level * 0.9) - (f % 4) * 3;
    if (by > y0 + h * (1 - level)) { p.set(bx, by, FL_HOT, F_EMIT); if (br() < 0.4) p.set(bx + 1, by - 2, FL, F_EMIT); }
  }
}

function fetus(p: TPix, cx: number, cy: number, s: number, twitch: number, eyes: number, eyeCol: number): void {
  const sil = 0x0c2814, sil2 = 0x184a26;
  p.ellipse(cx - 2 * s, cy - 7 * s, 6.5 * s, 6 * s, sil, F_FLAT);
  p.ellipse(cx + 1 * s, cy + 2 * s, 7 * s, 9 * s, sil, F_FLAT);
  p.ellipse(cx - 3 * s, cy + 6 * s + twitch, 4 * s, 3.5 * s, sil, F_FLAT);
  p.ellipse(cx - 6 * s - twitch * 0.5, cy - 1 * s, 2.4 * s, 4 * s, sil, F_FLAT);
  for (let y = Math.floor(cy - 14 * s); y < cy + 12 * s; y++) for (let x = Math.floor(cx - 10 * s); x < cx + 10 * s; x++) {
    if (p.get(x, y) !== sil) continue;
    if (p.get(x + 1, y) !== sil && p.isEmit(x + 1, y)) p.set(x, y, sil2, F_FLAT);
  }
  if (eyes > 0.3) { p.set(cx - 4 * s, cy - 7 * s, eyeCol, F_EMIT); p.set(cx - 1 * s, cy - 7 * s, eyeCol, F_EMIT); if (eyes > 0.7) { p.set(cx - 4 * s, cy - 8 * s, eyeCol, F_EMIT); p.set(cx - 1 * s, cy - 8 * s, eyeCol, F_EMIT); } }
}

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const ox = Math.round(b.ox), oy = Math.round(b.bob + b.crouch * 8 + (stag ? 9 : b.kneel * 10));
  const f = Math.floor(b.t * 8);
  bpart(p, (l) => {
    const legs = [[34, 82, 12, 74, 6, 110], [42, 86, 26, 96, 22, 110], [62, 82, 84, 74, 90, 110], [54, 86, 70, 96, 74, 110]];
    legs.forEach((L, i) => {
      const lift = i % 2 === 0 ? b.stepL : b.stepR;
      const spread = b.crouch * 5 * (L[0] < 48 ? -1 : 1);
      const ky = stag ? L[3] + 12 : L[3] - lift + b.crouch * 3, fy = L[5] - lift;
      l.limb(L[0] + ox, L[1] + oy, L[2] + ox + spread, ky, 3.2, S.metal2);
      l.limb(L[2] + ox + spread, ky, L[4] + spread * 0.4, fy - 3, 2.4, S.metal2);
      l.limb(L[4] + spread * 0.4, fy - 4, L[4] + spread * 0.4 + (L[4] < 48 ? -2 : 2), fy, 1.4, S.dark);
      l.set(L[2] + ox + spread, ky, S.trim);
    });
  });
  bpart(p, (l) => {
    for (let i = 0; i < 5; i++) {
      const x0 = 34 + i * 7 + ox, w = Math.sin(i * 2.1 + b.t * Math.PI * 2) * 3;
      l.limb(x0, 88 + oy, x0 + w, 98 + oy, 1.6, S.cable);
      l.limb(x0 + w, 98 + oy, x0 - w * 0.5, Math.min(110, 104 + oy + (i % 2) * 4), 1.3, S.cable);
    }
  }, { bevel: false });
  bpart(p, (l) => {
    l.poly([22 + ox, 76 + oy, 74 + ox, 76 + oy, 68 + ox, 92 + oy, 28 + ox, 92 + oy], S.metal2);
    l.box(20 + ox, 72 + oy, 56, 7, S.metal);
    rivetRow(l, 23 + ox, 72 + ox, 74 + oy, 5, S.trim);
    for (let x = 30; x < 68; x += 6) for (let y = 81; y < 90; y++) if (l.has(x + ox, y + oy)) l.tint(x + ox, y + oy, (c) => lit(c, -0.5));
  });
  if (stag) { exposedCore(p, r, 48 + ox, 84 + oy, 6, f); sparks(p, r, 48 + ox, 84 + oy, 14, 8); }
  else for (const x of [32, 64]) { p.set(x + ox, 84 + oy, b.charge > 0.5 ? 0xffffff : FL, F_EMIT); p.set(x + 1 + ox, 84 + oy, FL_MID, F_EMIT); }
  // nozzle arms
  const lh = p3(b.aL, [24, 62], [10, 74], [8, 44]), rh = p3(b.aR, [72, 62], [86, 74], [88, 44]);
  bpart(p, (l) => {
    l.limb(24 + ox, 58 + oy, 12 + ox, 56 + oy, 3, S.metal2); l.limb(12 + ox, 56 + oy, lh[0] + ox, lh[1] + oy, 2.6, S.metal2);
    l.limb(72 + ox, 58 + oy, 84 + ox, 56 + oy, 3, S.metal2); l.limb(84 + ox, 56 + oy, rh[0] + ox, rh[1] + oy, 2.6, S.metal2);
    for (const h of [lh, rh]) { l.box(h[0] - 3 + ox, h[1] - 2 + oy, 7, 7, S.metal); l.rect(h[0] - 1 + ox, h[1] + 4 + oy, 3, 3, S.dark); }
  });
  if (b.flash > 0.2) for (const h of [lh, rh]) glowBlob(p, h[0] + ox, h[1] + oy + 5, 2 + b.flash * 4, FL_HOT, FL, FL_MID, 0.4, r);
  // vat
  const vx = 28 + ox, vy = 16 + oy, vw = 40, vh = 56;
  const level = stag ? 0.32 : Math.max(0.2, 0.94 - b.dmg * 0.08 - Math.max(0, -b.aux) * 0.4);
  if (!stag) {
    const glow = b.charge * 1.4 + b.open * 0.5;
    vatFluid(p, vx, vy, vw, vh, level, glow, f);
    const tw = b.pain > 0.5 ? 2 : Math.sin(b.t * Math.PI * 4) * b.charge * 1.5;
    fetus(p, vx + 21 + Math.round(b.aux * 2), vy + 30 + Math.round(Math.sin(b.t * Math.PI * 2)), 1.15 + b.aux * 0.08, tw, b.open + b.charge * 0.5, b.open > 0.6 ? 0xffffff : 0xff3030);
    for (let t = 0; t < 1; t += 0.04) p.set(vx + 22 + Math.sin(t * 6 + b.t * 6) * 3, vy + 3 + t * 24, 0x2a1a1e, F_FLAT);
    if (b.open > 0.4) glowBlob(p, vx + 18, vy + 23, 2 + b.open * 3, 0xffffff, 0xffb0a0, 0xff3030, 0.2, r);
  } else {
    vatFluid(p, vx, vy, vw, vh, 0.32, 0, 9);
    fetus(p, vx + 22, vy + 44, 1, 3, f % 2, EYE_DIM);
    for (let y = vy + vh - 10; y < vy + vh + 8; y++) if ((y + f) % 2) p.set(vx + 6 + ((y * 7) % 6), y, FL, F_EMIT);
  }
  for (let y = vy; y < vy + vh; y++) {
    if (stag && y < vy + 30 && ((y * 13) % 7) > 2) { p.clear(vx + 2, y); continue; }
    p.set(vx + 4, y, mix(p.get(vx + 4, y) < 0 ? 0 : p.get(vx + 4, y), 0xe8fff0, 0.6), F_EMIT);
    if (y % 3) p.set(vx + 6, y, mix(p.get(vx + 6, y) < 0 ? 0 : p.get(vx + 6, y), 0xe8fff0, 0.3), F_EMIT);
    p.set(vx + vw - 5, y, mix(p.get(vx + vw - 5, y) < 0 ? 0 : p.get(vx + vw - 5, y), 0xb0d8c0, 0.3), F_EMIT);
  }
  const crackLines: number[][] = [];
  if (stag || b.dmg >= 2) crackLines.push([4, 0, 12, 14], [12, 14, 8, 26], [30, 2, 24, 16], [24, 16, 34, 28]);
  else if (b.dmg >= 1) crackLines.push([30, 2, 24, 16], [24, 16, 30, 24]);
  for (const [x0, y0, x1, y1] of crackLines) p.line(vx + x0, vy + y0, vx + x1, vy + y1, 0xd0f0e0, F_EMIT);
  if (b.dmg >= 1 && !stag) for (let i = 0; i < 4 + b.dmg * 3; i++) p.set(vx + 24 + (i % 3), vy + 24 + i * 3 + (f % 3), FL, F_EMIT); // leak
  bpart(p, (l) => {
    for (const x of [vx - 2, vx + vw - 1]) l.box(x, vy - 2, 3, vh + 4, S.metal);
    for (const y of [vy + 18, vy + 38]) { l.rect(vx - 2, y, 3, 2, S.trim); l.rect(vx + vw - 1, y, 3, 2, S.trim); }
  });
  // cap dome; umbilical cord fires out of it during the tether (mode 1)
  bpart(p, (l) => {
    l.ball(48 + ox, 14 + oy, 24, 9, S.metal);
    l.box(24 + ox, 12 + oy, 48, 6, S.metal2);
    rivetRow(l, 27 + ox, 70 + ox, 15 + oy, 5, S.trim);
    l.limb(36 + ox, 8 + oy, 30 + ox, 0, 3, S.cable); l.limb(60 + ox, 8 + oy, 68 + ox, 0, 3, S.cable);
    l.limb(48 + ox, 6 + oy, 48 + ox, 0, 2.4, S.metal2);
    if (b.mode > 0.1) {
      const L = b.mode;
      const x1 = 48 + ox + Math.sin(L * 3) * 4, y1 = 30 + oy;
      for (let t = 0; t <= 1; t += 0.05) { const x = 48 + ox + (x1 - 48 - ox) * t + Math.sin(t * 9) * 3 * L, y = 8 + oy - L * 18 * Math.sin(t * Math.PI) + (y1 - 8 - oy) * t * L; l.ball(x, y, 2.4, 2.4, S.flesh); }
    }
  });
  for (const x of [38, 48, 58]) p.set(x + ox, 8 + oy, b.charge > 0.5 ? (f % 2 ? 0xffffff : FL_HOT) : FL, F_EMIT);
  if (b.charge > 0.6) { glowBlob(p, 48 + ox, 46 + oy, 4 + b.charge * 5, 0xffffff, FL_HOT, FL, 0.3, r); sparks(p, r, 48 + ox, 46 + oy, 22, 10); }
  if (b.pain > 0.5) { for (let y = vy; y < vy + vh; y += 2) p.tint(vx + 10 + (y % 7), y, () => 0xffffff); sparks(p, r, 48, 40, 18, 12); }
  if (b.glitch > 0.3) sparks(p, r, 48 + ox, 50 + oy, 30, Math.round(b.glitch * 14));
}

function dead(p: TPix, r: Rng): void {
  for (let y = 98; y < 112; y++) for (let x = -8; x < 104; x++) {
    const d = ((x - 48) / 54) ** 2 + ((y - 106) / 6) ** 2 + (r() - 0.5) * 0.25;
    if (d < 1) p.set(x, y, d < 0.5 ? FL_DARK : FL_DEEP, d < 0.3 ? F_EMIT : F_FLAT);
  }
  bpart(p, (l) => { l.limb(10, 106, 20, 92, 2.6, S.metal2); l.limb(86, 106, 76, 90, 2.6, S.metal2); l.limb(30, 108, 20, 100, 2, S.metal2); });
  bpart(p, (l) => { l.poly([22, 110, 26, 90, 70, 90, 74, 110], S.metal2); l.box(20, 86, 56, 6, S.metal); rivetRow(l, 24, 72, 88, 5, S.trim); });
  for (let x = 28; x < 68; x += 3) { const hh = 4 + ((x * 7) % 9); p.line(x, 86, x + 1, 86 - hh, 0xb0e0c8, F_FLAT); }
  bpart(p, (l) => { l.ball(70, 104, 9, 4.5, 0x1a3a22); l.ball(64, 102, 5, 4, 0x1a3a22); }, { bevel: false });
  bpart(p, (l) => { l.ball(48, 80, 22, 7, S.metal); l.box(28, 80, 40, 4, S.metal2); });
  for (let i = 0; i < 14; i++) p.set(6 + r() * 84, 100 + r() * 10, i % 3 ? 0xd0f0e0 : FL_HOT, F_EMIT);
}

export function motherArt(): BossArt {
  return {
    draw, dead, worldH: 7.0, glow: [0xff3030, 0x7ae050],
    clips: {
      ...moveClips('brood', { W: { charge: 1, open: 1, crouch: 0.5, aux: 0.5 }, A: { charge: 1, flash: 0.6, crouch: 0.8, aux: -0.3, open: 0.6 }, xw: { sy: 1.04, sx: 0.97 }, xa: { sy: 0.9, sx: 1.06 }, n: [8, 4, 6], shake: 1 }),
      ...moveClips('spray', { W: { aL: 1, aR: 1, charge: 0.3 }, A: { aL: -1, aR: -1 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 4) > 0 ? 1 : 0.2 }), n: [5, 6, 5] }),
      ...moveClips('lullaby', { W: { charge: 0.7, aL: 0.5, aR: 0.5 }, A: { charge: 0.9, aL: 0.6, aR: 0.6 }, act: (k) => ({ flash: Math.max(0, Math.sin(k * Math.PI * 3)), bob: Math.sin(k * Math.PI * 6) * 1.5 }), n: [6, 7, 5] }),
      ...moveClips('tether', { W: { crouch: 0.4, charge: 0.6, mode: 0.3 }, A: { mode: 1, crouch: 0.1 }, L: { mode: 1, crouch: 0.6, aL: 1, aR: 1 }, xw: { sy: 0.94, lean: -3 }, xa: { lean: 4 }, n: [6, 3, 8], shake: 1 }),
      ...moveClips('acid', { W: { aL: 1, aR: 1, charge: 0.5 }, A: { aL: 0.4, aR: 0.4 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 6) > 0.3 ? 1 : 0, aL: 0.4 + Math.sin(k * 18) * 0.3, aR: 0.4 - Math.sin(k * 18) * 0.3 }), n: [5, 6, 5] }),
      ...moveClips('scuttle', { W: { crouch: 0.6 }, A: { crouch: 0.3 }, act: (k) => { const s = Math.sin(k * Math.PI * 8); return { stepL: Math.max(0, s) * 7, stepR: Math.max(0, -s) * 7, bob: Math.abs(s) * 2 }; }, loop: true, xa: { lean: 6 }, n: [4, 6, 4] }),
      ...moveClips('cradle', { W: { charge: 1, aL: 1, aR: 1, open: 0.6 }, A: { charge: 1, open: 0.6 }, act: (k) => ({ aL: Math.sin(k * 14) * 0.8, aR: -Math.sin(k * 14) * 0.8, flash: 0.5 + 0.5 * Math.sin(k * 30) }), loop: true, n: [6, 6, 5] }),
    },
  };
}
