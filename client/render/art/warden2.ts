// Warden bosses, wave 2 (96x112):
// 3 THE MOTHER (gestation vat), 4 THE GARDENER (overgrown botanical machine),
// 5 THE GENERAL (war-mech), 6 THE HANDLER (CRT-monitor monolith face).
import { Pix, Rng, part, glowBlob, sparks, glint, mul, mix, lit, bayer, F_EMIT, F_FLAT, makeRng } from './core';
import { Pose, EnemyDef, exposedCore, EYE, EYE_DIM } from './enemies';
import { rivetRow } from './warden';
import { smoke } from './enemies2';

const W = 96, H = 112;

// sickly green fluid
const FL_HOT = 0xd8ffb0, FL = 0x7ae050, FL_MID = 0x3aa040, FL_DARK = 0x16502a, FL_DEEP = 0x0a2a18;
// bioluminescence
const BIO_HOT = 0xeaffd0, BIO = 0x9aff4a, BIO_TEAL = 0x3ae8c8, BIO_DIM = 0x1a7a5a;
// terminal
const TERM_HOT = 0xd0ffd8, TERM = 0x3aff6a, TERM_DIM = 0x1a8a3a, TERM_BG = 0x041408;

// ================================================================ THE MOTHER
interface MStyle { metal: number; metal2: number; dark: number; flesh: number; cable: number; trim: number }
const MOTHER: MStyle = { metal: 0x8a9290, metal2: 0x5a625e, dark: 0x2a302e, flesh: 0x9a6a6a, cable: 0x4a3a3e, trim: 0xb0c8a0 };

function vatFluid(p: Pix, r: Rng, x0: number, y0: number, w: number, h: number, level: number, glow: number, f: number): void {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const yy = y0 + y, xx = x0 + x;
    if (y < h * (1 - level)) { p.set(xx, yy, mix(0x0c1612, 0x1a2a24, (x / w)), F_FLAT); continue; }
    const t = x / (w - 1) * 2 - 1;
    const v = Math.abs(t) * 0.7 + (1 - y / h) * 0.15 - glow * 0.35 + (bayer(xx, yy) - 0.5) * 0.3;
    p.set(xx, yy, v < 0.2 ? FL : v < 0.5 ? FL_MID : v < 0.8 ? FL_DARK : FL_DEEP, F_EMIT);
  }
  // bubbles
  const br = makeRng(91 + f);
  for (let i = 0; i < 9; i++) {
    const bx = x0 + 3 + Math.floor(br() * (w - 6)), by = y0 + Math.floor(h * (1 - level)) + 2 + Math.floor(br() * h * level * 0.9);
    p.set(bx, by, FL_HOT, F_EMIT); if (br() < 0.4) p.set(bx + 1, by - 2, FL, F_EMIT);
  }
  void r;
}

/** Curled fetal silhouette (dark, inside the fluid). */
function fetus(p: Pix, cx: number, cy: number, s: number, twitch: number, eyesOpen: boolean, eyeCol: number): void {
  const sil = 0x0c2814, sil2 = 0x184a26;
  p.ellipse(cx - 2 * s, cy - 7 * s, 6.5 * s, 6 * s, sil, F_FLAT); // head
  p.ellipse(cx + 1 * s, cy + 2 * s, 7 * s, 9 * s, sil, F_FLAT); // curled back
  p.ellipse(cx - 3 * s, cy + 6 * s + twitch, 4 * s, 3.5 * s, sil, F_FLAT); // knees
  p.ellipse(cx - 6 * s, cy - 1 * s, 2.4 * s, 4 * s, sil, F_FLAT); // arm
  // rim light from the fluid
  for (let y = Math.floor(cy - 14 * s); y < cy + 12 * s; y++) for (let x = Math.floor(cx - 10 * s); x < cx + 10 * s; x++) {
    if (p.get(x, y) !== sil) continue;
    if (p.get(x + 1, y) !== sil && p.isEmit(x + 1, y)) p.set(x, y, sil2, F_FLAT);
  }
  if (eyesOpen) { p.set(cx - 4 * s, cy - 7 * s, eyeCol, F_EMIT); p.set(cx - 1 * s, cy - 7 * s, eyeCol, F_EMIT); }
  else { p.set(cx - 4 * s, cy - 7 * s, sil2, F_FLAT); p.set(cx - 1 * s, cy - 7 * s, sil2, F_FLAT); }
}

function drawMother(p: Pix, ps: Pose, S: MStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, step = -1;
  if (a === 'idle') oy = f;
  if (a === 'move') { oy = [0, 2, 0, 2][f]; step = f; }
  if (a === 'pain') ox = -3;
  const stag = a === 'stagger', charge = a === 'charge';
  if (stag) oy = 9;
  // insect legs
  part(p, (l) => {
    const legs = [[34, 82, 12, 74, 6, 110], [42, 86, 26, 96, 22, 110], [62, 82, 84, 74, 90, 110], [54, 86, 70, 96, 74, 110]];
    legs.forEach((L, i) => {
      const lift = step >= 0 && ((step === 0 && i % 2 === 0) || (step === 2 && i % 2 === 1)) ? 5 : 0;
      const ky = stag ? L[3] + 12 : L[3] - lift, fy = L[5] - lift;
      l.limb(L[0] + ox, L[1] + oy, L[2] + ox, ky, 3.2, S.metal2);
      l.limb(L[2] + ox, ky, L[4], fy - 3, 2.4, S.metal2);
      l.limb(L[4], fy - 4, L[4] + (L[4] < 48 ? -2 : 2), fy, 1.4, S.dark);
      l.set(L[2] + ox, ky, S.trim);
    });
  });
  // umbilical cables hanging from the base
  part(p, (l) => {
    for (let i = 0; i < 5; i++) {
      const x0 = 34 + i * 7 + ox, sw = Math.sin(i * 2.1 + f) * 3;
      l.limb(x0, 88 + oy, x0 + sw, 98 + oy, 1.6, S.cable);
      l.limb(x0 + sw, 98 + oy, x0 - sw * 0.5, Math.min(110, 104 + oy + (i % 2) * 4), 1.3, S.cable);
    }
  }, { bevel: false });
  // base machinery
  part(p, (l) => {
    l.poly([22 + ox, 76 + oy, 74 + ox, 76 + oy, 68 + ox, 92 + oy, 28 + ox, 92 + oy], S.metal2);
    l.box(20 + ox, 72 + oy, 56, 7, S.metal);
    rivetRow(l, 23 + ox, 72 + ox, 74 + oy, 5, S.trim);
    for (let x = 30; x < 68; x += 6) for (let y = 81; y < 90; y++) if (l.has(x + ox, y + oy)) l.tint(x + ox, y + oy, (c) => lit(c, -0.5));
  });
  if (stag) { exposedCore(p, r, 48 + ox, 84 + oy, 6, f); sparks(p, r, 48 + ox, 84 + oy, 14, 8); }
  else for (const x of [32, 64]) { p.set(x + ox, 84 + oy, charge ? 0xffffff : FL, F_EMIT); p.set(x + 1 + ox, 84 + oy, FL_MID, F_EMIT); }
  // side manipulator arms with nozzles
  part(p, (l) => {
    const up = charge || a === 'attack';
    const lh = up ? [8, 46] : [10, 74], rh = up ? [88, 46] : [86, 74];
    l.limb(24 + ox, 58 + oy, 12 + ox, 56 + oy, 3, S.metal2); l.limb(12 + ox, 56 + oy, lh[0] + ox, lh[1] + oy, 2.6, S.metal2);
    l.limb(72 + ox, 58 + oy, 84 + ox, 56 + oy, 3, S.metal2); l.limb(84 + ox, 56 + oy, rh[0] + ox, rh[1] + oy, 2.6, S.metal2);
    for (const h of [lh, rh]) { l.box(h[0] - 3 + ox, h[1] - 2 + oy, 7, 7, S.metal); l.rect(h[0] - 1 + ox, h[1] + 4 + oy, 3, 3, S.dark); }
  });
  if (a === 'attack') for (const hx of [8, 88]) glowBlob(p, hx + ox, 54 + oy, f === 1 ? 5 : 3, FL_HOT, FL, FL_MID, 0.4, r);
  // glass vat
  const vx = 28 + ox, vy = 16 + oy, vw = 40, vh = 56;
  if (!stag) {
    const glow = charge ? 1 + f * 0.5 : a === 'idle' && f ? 0.3 : 0;
    vatFluid(p, r, vx, vy, vw, vh, 0.94, glow, f + (a === 'move' ? 4 : 0));
    fetus(p, vx + 21, vy + 30 + (a === 'move' ? f % 2 : 0), 1.15, a === 'pain' ? 2 : 0, charge || a === 'attack', charge && f ? 0xffffff : 0xff3030);
    // umbilical inside
    for (let t = 0; t < 1; t += 0.04) { const x = vx + 22 + Math.sin(t * 6 + f) * 3, y = vy + 3 + t * 24; p.set(x, y, 0x2a1a1e, F_FLAT); }
  } else {
    // shattered: fluid low, glass shards, fetus slumped
    vatFluid(p, r, vx, vy, vw, vh, 0.32, 0, 9);
    fetus(p, vx + 22, vy + 44, 1, 3, f === 1, EYE_DIM);
    for (let y = vy + vh - 10; y < vy + vh + 8; y++) if ((y + f) % 2) p.set(vx + 6 + ((y * 7) % 6), y, FL, F_EMIT);
  }
  // glass highlights + frame ribs
  for (let y = vy; y < vy + vh; y++) {
    if (stag && y < vy + 30 && ((y * 13) % 7) > 2) { p.clear(vx + 2, y); continue; }
    p.set(vx + 4, y, mix(p.get(vx + 4, y) < 0 ? 0 : p.get(vx + 4, y), 0xe8fff0, 0.6), F_EMIT);
    if (y % 3) p.set(vx + 6, y, mix(p.get(vx + 6, y) < 0 ? 0 : p.get(vx + 6, y), 0xe8fff0, 0.3), F_EMIT);
    p.set(vx + vw - 5, y, mix(p.get(vx + vw - 5, y) < 0 ? 0 : p.get(vx + vw - 5, y), 0xb0d8c0, 0.3), F_EMIT);
  }
  if (stag) for (const [x0, y0, x1, y1] of [[4, 0, 12, 14], [12, 14, 8, 26], [30, 2, 24, 16], [24, 16, 34, 28]]) p.line(vx + x0, vy + y0, vx + x1, vy + y1, 0xd0f0e0, F_EMIT);
  part(p, (l) => {
    for (const x of [vx - 2, vx + vw - 1]) l.box(x, vy - 2, 3, vh + 4, S.metal);
    for (const y of [vy + 18, vy + 38]) { l.rect(vx - 2, y, 3, 2, S.trim); l.rect(vx + vw - 1, y, 3, 2, S.trim); }
  });
  // top cap dome with pipes
  part(p, (l) => {
    l.ball(48 + ox, 14 + oy, 24, 9, S.metal);
    l.box(24 + ox, 12 + oy, 48, 6, S.metal2);
    rivetRow(l, 27 + ox, 70 + ox, 15 + oy, 5, S.trim);
    l.limb(36 + ox, 8 + oy, 30 + ox, 0, 3, S.cable); l.limb(60 + ox, 8 + oy, 68 + ox, 0, 3, S.cable);
    l.limb(48 + ox, 6 + oy, 48 + ox, 0, 2.4, S.metal2);
  });
  // status lamps on cap
  for (const x of [38, 48, 58]) p.set(x + ox, 8 + oy, charge ? (f ? 0xffffff : FL_HOT) : FL, F_EMIT);
  if (charge) { glowBlob(p, 48 + ox, 46 + oy, 6 + f * 3, 0xffffff, FL_HOT, FL, 0.3, r); sparks(p, r, 48 + ox, 46 + oy, 22, 10); }
  if (a === 'pain') { for (let y = vy; y < vy + vh; y += 2) p.tint(vx + 10 + (y % 7), y, () => 0xffffff); sparks(p, r, 48, 40, 18, 12); }
}

function deadMother(p: Pix, S: MStyle, r: Rng): void {
  for (let y = 98; y < 112; y++) for (let x = 0; x < 96; x++) {
    const d = ((x - 48) / 46) ** 2 + ((y - 106) / 6) ** 2 + (r() - 0.5) * 0.25;
    if (d < 1) p.set(x, y, d < 0.5 ? FL_DARK : FL_DEEP, d < 0.3 ? F_EMIT : F_FLAT);
  }
  part(p, (l) => { l.limb(10, 106, 20, 92, 2.6, S.metal2); l.limb(86, 106, 76, 90, 2.6, S.metal2); l.limb(30, 108, 20, 100, 2, S.metal2); });
  part(p, (l) => {
    l.poly([22, 110, 26, 90, 70, 90, 74, 110], S.metal2);
    l.box(20, 86, 56, 6, S.metal); rivetRow(l, 24, 72, 88, 5, S.trim);
  });
  // broken glass stumps
  for (let x = 28; x < 68; x += 3) { const hh = 4 + ((x * 7) % 9); p.line(x, 86, x + 1, 86 - hh, 0xb0e0c8, F_FLAT); }
  part(p, (l) => { l.ball(70, 104, 9, 4.5, 0x1a3a22); l.ball(64, 102, 5, 4, 0x1a3a22); }, { bevel: false });
  part(p, (l) => { l.ball(48, 80, 22, 7, S.metal); l.box(28, 80, 40, 4, S.metal2); });
  for (let i = 0; i < 14; i++) p.set(6 + r() * 84, 100 + r() * 10, i % 3 ? 0xd0f0e0 : FL_HOT, F_EMIT);
}

// ================================================================ THE GARDENER
interface GStyle { rust: number; rust2: number; dark: number; vine: number; vine2: number; leaf: number; petal: number; trim: number }
const GARDENER: GStyle = { rust: 0x8a5a36, rust2: 0x5a3a26, dark: 0x2a2220, vine: 0x3a6a2a, vine2: 0x2a4a1e, leaf: 0x4a8a34, petal: 0xd04a7a, trim: 0xb8904a };

function vineOver(l: Pix, r: Rng, x: number, y: number, n: number, col: number): void {
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    ang += (r() - 0.5) * 0.9;
    x += Math.cos(ang); y += Math.sin(ang);
    if (!l.has(x, y)) { ang += Math.PI * 0.6; continue; }
    l.set(x, y, col); if (i % 3 === 0 && l.has(x + 1, y)) l.set(x + 1, y, lit(col, -0.3));
    if (i % 7 === 3) { l.set(x, y - 1, lit(col, 0.4)); l.set(x - 1, y - 1, lit(col, 0.2)); }
  }
}

function flower(p: Pix, x: number, y: number, col: number, glow: boolean): void {
  p.set(x - 1, y, col); p.set(x + 1, y, col); p.set(x, y - 1, col); p.set(x, y + 1, lit(col, -0.3));
  p.set(x, y, glow ? BIO_HOT : 0xffe060, glow ? F_EMIT : 0);
}

function drawGardener(p: Pix, ps: Pose, S: GStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, sw = 0;
  if (a === 'idle') oy = f;
  if (a === 'move') { oy = [0, 2, 0, 2][f]; sw = [3, 0, -3, 0][f]; }
  if (a === 'pain') ox = 3;
  const stag = a === 'stagger', charge = a === 'charge';
  if (stag) oy = 10;
  const vr = makeRng(4242); // stable vine layout across frames
  // root tendril legs
  part(p, (l) => {
    for (let i = 0; i < 7; i++) {
      const x0 = 30 + i * 6 + ox, s = (i - 3) / 3;
      const ph = Math.sin(i * 1.7 + f * 1.3) * 2 + sw * (i % 2 ? 1 : -1) * 0.5;
      const x1 = x0 + s * 10 + ph, y1 = 96 + oy * 0.4, x2 = x0 + s * 22 + ph * 1.5, y2 = 110 - (stag ? 0 : Math.abs(ph) > 2 ? 2 : 0);
      l.limb(x0, 78 + oy, x1, y1, 3.6 - Math.abs(s), S.vine2);
      l.limb(x1, y1, x2, y2, 2.4 - Math.abs(s) * 0.5, S.vine2);
      l.limb(x2, y2, x2 + s * 4, 111, 1, mul(S.vine2, 0.8));
    }
  });
  for (let i = 0; i < 7; i += 2) p.set(30 + i * 6 + ox + ((i - 3) / 3) * 16, 103 + (i % 3), BIO_TEAL, F_EMIT);
  // rusted frame torso
  part(p, (l) => {
    l.poly([22 + ox, 40 + oy, 74 + ox, 40 + oy, 68 + ox, 82 + oy, 28 + ox, 82 + oy], S.rust);
    for (let y = 41; y < 82; y++) for (let x = 56; x < 75; x++) if (l.has(x + ox, y + oy) && (x > 62 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.3));
    // frame cutouts (lattice)
    for (const [x0, y0] of [[30, 46], [50, 46], [30, 62], [50, 62]]) { l.rect(x0 + ox, y0 + oy, 15, 12, S.dark); for (let x = 0; x < 15; x += 5) for (let y = 0; y < 12; y++) l.set(x0 + x + ox, y0 + y + oy, S.rust2); }
    rivetRow(l, 25 + ox, 70 + ox, 43 + oy, 5, S.trim);
    for (let i = 0; i < 70; i++) l.tint(24 + ox + Math.floor(r() * 50), 41 + oy + Math.floor(r() * 40), (c) => mix(c, 0x5a2a12, 0.5));
    for (let i = 0; i < 9; i++) vineOver(l, vr, 26 + ox + vr() * 44, 42 + oy + vr() * 38, 40, i % 2 ? S.vine : S.leaf);
  });
  // glowing seedlings inside lattice
  if (!stag) for (const [x, y] of [[37, 52], [57, 54], [36, 68], [58, 70]]) glowBlob(p, x + ox, y + oy, 2, BIO_HOT, BIO, BIO_DIM);
  else { exposedCore(p, r, 48 + ox, 62 + oy, 7, f); sparks(p, r, 48 + ox, 62 + oy, 18, 10); }
  // arms: shears + watering lance
  part(p, (l) => {
    const up = charge || (a === 'attack' && f === 0);
    const lh = stag ? [10, 100] : up ? [6, 20] : [8 - sw, 86];
    const rh = stag ? [86, 96] : up ? [90, 22] : a === 'attack' ? [82, 62] : [88 + sw, 86];
    l.limb(24 + ox, 46 + oy, 12 + ox, 58 + oy, 4, S.rust2); l.limb(12 + ox, 58 + oy, lh[0] + ox, lh[1] + (stag ? 0 : oy), 3.4, S.rust2);
    l.limb(72 + ox, 46 + oy, 84 + ox, 58 + oy, 4, S.rust2); l.limb(84 + ox, 58 + oy, rh[0] + ox, rh[1] + (stag ? 0 : oy), 3.4, S.rust2);
    const ly = lh[1] + (stag ? 0 : oy), ry = rh[1] + (stag ? 0 : oy), dir = up ? -1 : 1;
    // shears blades
    l.limb(lh[0] + ox, ly, lh[0] + ox - 5, ly + dir * 12, 1.6, 0x9a9aa0); l.limb(lh[0] + ox, ly, lh[0] + ox + 4, ly + dir * 12, 1.6, 0x7a7a80);
    // nozzle head
    l.box(rh[0] + ox - 4, ry - 4, 9, 8, S.rust); l.ball(rh[0] + ox, ry + dir * 5, 3.4, 2.4, S.trim);
    for (let i = 0; i < 4; i++) vineOver(l, vr, 12 + ox + vr() * 8, 56 + oy, 18, S.vine);
  });
  if (a === 'attack' && f === 1) glowBlob(p, 82 + ox, 67 + oy, 6, 0xffffff, BIO_HOT, BIO, 0.35, r);
  // pod head (bulb)
  const hx = 48 + ox, hy = 24 + oy + (stag ? 4 : 0);
  const open = charge ? 6 + f * 4 : a === "attack" ? 2 : 0;
  part(p, (l) => {
    l.limb(48 + ox, 40 + oy, hx, hy + 10, 4, S.vine2); // stalk
    // petals / pod halves
    l.ball(hx - 4 - open, hy, 11, 15, S.vine);
    l.ball(hx + 4 + open, hy, 11, 15, S.vine2);
    l.poly([hx - 4, hy - 22, hx + 4, hy - 22, hx + 2, hy - 12, hx - 2, hy - 12], S.vine);
    for (let y = hy - 14; y < hy + 14; y += 3) for (let x = hx - 14 - open; x < hx + 15 + open; x++) if (l.has(x, y) && ((x + y) % 5 === 0)) l.tint(x, y, (c) => lit(c, -0.3));
    // rust collar
    l.box(hx - 10, hy + 11, 21, 5, S.rust); rivetRow(l, hx - 8, hx + 8, hy + 13, 4, S.trim);
  });
  // seam of light / open core
  {
    const g = open + 1.4;
    p.ellipse(hx, hy, g + 1, 12, 0x0a1a10, F_FLAT);
    glowBlob(p, hx, hy, g, charge && f ? 0xffffff : BIO_HOT, BIO, BIO_TEAL);
    for (let y = -10; y <= 10; y++) if (Math.abs(y) > g * 1.6) p.set(hx, hy + y, y % 3 ? BIO_TEAL : BIO, F_EMIT);
    if (charge) { glint(p, hx, hy, 0xffffff, BIO_HOT, 2); sparks(p, r, hx, hy, 18, 8); for (let i = 0; i < 10; i++) { const t = r() * 6.28, d = 16 + r() * 8; p.set(hx + Math.cos(t) * d, hy + Math.sin(t) * d, i % 2 ? BIO : BIO_TEAL, F_EMIT); } }
    if (a === 'pain') glowBlob(p, hx, hy, 4, 0xffffff, 0xffffff, BIO_HOT);
  }
  // eye spots on the pod
  const ec = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : EYE;
  for (const [x, y] of [[-10, -4], [10, -4], [-8, 4], [8, 4]]) { p.set(hx + x + (x < 0 ? -open : open), hy + y, ec, F_EMIT); p.set(hx + x + (x < 0 ? -open : open) + 1, hy + y, mul(ec, 0.6), F_EMIT); }
  // flowers + bioluminescent fungus clumps
  const fr = makeRng(777);
  for (let i = 0; i < 12; i++) {
    const x = 20 + fr() * 56 + ox, y = 38 + fr() * 46 + oy;
    if (p.has(x, y)) flower(p, Math.round(x), Math.round(y), i % 3 ? S.petal : 0xe8e0f0, i % 4 === 0);
  }
  for (const [x, y] of [[24, 40], [70, 42], [28, 80], [66, 80], [hx - 12, hy + 14]]) { p.set(x + ox, y + oy, BIO, F_EMIT); p.set(x + 1 + ox, y + oy, BIO_TEAL, F_EMIT); p.set(x + ox, y + 1 + oy, BIO_DIM, F_EMIT); }
  // hanging moss
  for (let x = 24; x < 74; x += 4) { const len = 2 + ((x * 7) % 6); for (let j = 0; j < len; j++) if (p.has(x + ox, 82 + oy - 1)) p.set(x + ox, 82 + oy + j, j === len - 1 ? BIO_DIM : S.vine2, j === len - 1 ? F_EMIT : 0); }
  if (a === 'pain') { sparks(p, r, 44, 60, 18, 12); for (let i = 0; i < 10; i++) p.set(30 + r() * 36, 40 + r() * 40, S.leaf); }
}

function deadGardener(p: Pix, S: GStyle, r: Rng): void {
  for (let y = 102; y < 112; y++) for (let x = 2; x < 94; x++) if (r() < 0.9 - Math.abs(x - 48) / 55) p.set(x, y, r() < 0.5 ? 0x2a2014 : 0x1e180e, F_FLAT);
  part(p, (l) => { for (let i = 0; i < 6; i++) l.limb(10 + i * 15, 110, 16 + i * 14, 100 - (i % 2) * 4, 2, S.vine2); });
  part(p, (l) => {
    l.poly([14, 110, 20, 90, 72, 88, 82, 110], S.rust);
    for (const x0 of [26, 46, 62]) l.rect(x0, 94, 10, 8, S.dark);
    const vr = makeRng(99); for (let i = 0; i < 6; i++) vineOver(l, vr, 20 + vr() * 56, 92 + vr() * 16, 30, S.vine);
  });
  part(p, (l) => { l.ball(80, 98, 12, 9, S.vine2); l.ball(70, 100, 9, 8, S.vine); });
  p.ellipse(76, 99, 2, 6, 0x0a1a10, F_FLAT); p.set(76, 99, BIO_DIM, F_EMIT);
  const fr = makeRng(12); for (let i = 0; i < 9; i++) flower(p, Math.round(18 + fr() * 60), Math.round(92 + fr() * 14), i % 2 ? S.petal : 0xe8e0f0, i % 3 === 0);
  sparks(p, r, 50, 96, 4, 2);
}

// ================================================================ THE GENERAL
interface GenStyle { armor: number; armor2: number; dark: number; gun: number; trim: number; medal: number }
const GENERAL: GenStyle = { armor: 0x6a6a66, armor2: 0x4a4a48, dark: 0x262624, gun: 0x34363a, trim: 0x8a7a5a, medal: 0xe0b038 };
const VIS_HOT = 0xfff0c0, VIS = 0xff8a20, VIS_DIM = 0x8a3a08;

function damage(l: Pix, r: Rng, x0: number, y0: number, w: number, h: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(r() * w), y = y0 + Math.floor(r() * h);
    if (!l.has(x, y)) continue;
    if (r() < 0.5) { l.set(x, y, 0x0c0a0a); l.tint(x + 1, y + 1, (c) => lit(c, 0.4)); l.tint(x - 1, y, (c) => lit(c, -0.4)); }
    else { for (let k = 0; k < 4; k++) l.tint(x + k, y + (k >> 1), (c) => mix(c, 0x1a1412, 0.5)); }
  }
}

function drawGeneral(p: Pix, ps: Pose, S: GenStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, ox = 0, liftL = 0, liftR = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 3, 0, 3][f]; liftL = f === 0 ? 6 : 0; liftR = f === 2 ? 6 : 0; }
  if (a === 'pain') ox = -4;
  const stag = a === 'stagger', charge = a === 'charge';
  const oy = bob + (stag ? 10 : 0);
  const dr = makeRng(5150);
  // legs with tread feet
  part(p, (l) => {
    const leg = (hx: number, fx: number, lift: number): void => {
      const fy = 100 - lift;
      l.limb(hx, 78 + bob, (hx + fx) / 2 + (hx < 48 ? -4 : 4), 88 + bob - lift * 0.5, 7, S.armor2);
      l.limb((hx + fx) / 2 + (hx < 48 ? -4 : 4), 88 + bob - lift * 0.5, fx, fy, 6, S.armor2);
      l.box(fx - 14, fy, 28, 11, S.dark);
      for (let x = fx - 13; x < fx + 14; x += 3) { l.set(x, fy + 1, lit(S.dark, 0.5)); l.set(x, fy + 9, lit(S.dark, 0.3)); }
      l.box(fx - 12, fy + 3, 24, 5, S.gun);
    };
    if (stag) { leg(34, 20, 0); leg(62, 76, 0); } else { leg(36, 26, liftL); leg(60, 70, liftR); }
  });
  // exhaust stacks
  part(p, (l) => { l.box(26 + ox, 10 + oy, 7, 22, S.dark); l.box(63 + ox, 6 + oy, 7, 26, S.dark); l.rect(26 + ox, 10 + oy, 7, 1, 0x050505); l.rect(63 + ox, 6 + oy, 7, 1, 0x050505); });
  smoke(p, r, 29 + ox, 6 + oy - f * 2, 4, 3, 0x3a3836);
  smoke(p, r, 66 + ox, 2 + oy - f * 2, 4, 3, 0x3a3836);
  if (charge) for (const x of [29, 66]) glowBlob(p, x + ox, (x < 50 ? 9 : 5) + oy, 2.5 + f, VIS_HOT, VIS, VIS_DIM);
  // hull
  part(p, (l) => {
    l.poly([16 + ox, 30 + oy, 80 + ox, 30 + oy, 76 + ox, 70 + oy, 64 + ox, 80 + oy, 32 + ox, 80 + oy, 20 + ox, 70 + oy], S.armor);
    for (let y = 31; y < 80; y++) for (let x = 60; x < 81; x++) if (l.has(x + ox, y + oy) && (x > 66 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.28));
    for (let x = 18; x < 79; x++) { if (l.has(x + ox, 52 + oy)) l.tint(x + ox, 52 + oy, (c) => lit(c, -0.5)); if (l.has(x + ox, 53 + oy)) l.tint(x + ox, 53 + oy, (c) => lit(c, 0.2)); }
    for (let y = 31; y < 79; y++) l.tint(48 + ox, y + oy, (c) => lit(c, -0.45));
    rivetRow(l, 20 + ox, 76 + ox, 34 + oy, 5, S.trim);
    rivetRow(l, 30 + ox, 66 + ox, 76 + oy, 5, S.trim);
    damage(l, dr, 18 + ox, 32 + oy, 60, 46, 40);
    // ash dusting
    for (let i = 0; i < 60; i++) l.tint(18 + ox + Math.floor(r() * 60), 31 + oy + Math.floor(r() * 10), (c) => mix(c, 0xb0aca4, 0.35));
    // stenciled number
    for (const [x, y] of [[56, 58], [57, 58], [58, 58], [58, 59], [57, 60], [56, 61], [56, 62], [57, 62], [58, 62], [61, 58], [61, 59], [61, 60], [61, 61], [61, 62]]) l.set(x + ox, y + oy, 0xc8c0a8);
  });
  if (stag) { exposedCore(p, r, 48 + ox, 60 + oy, 8, f); sparks(p, r, 48 + ox, 60 + oy, 20, 14); smoke(p, r, 40 + ox, 44 + oy, 6, 4, 0x2a2826); }
  // commander's medal plate
  if (!stag) part(p, (l) => {
    l.box(26 + ox, 40 + oy, 15, 10, S.armor2);
    for (let x = 28; x < 39; x += 3) { l.rect(x + ox, 42 + oy, 2, 3, 0xa01818); l.rect(x + ox + 1, 42 + oy, 1, 3, S.medal); }
    l.ball(33.5 + ox, 47 + oy, 2.2, 2.2, S.medal);
  });
  if (!stag) { p.set(33 + ox, 46 + oy, 0xffffff); p.set(38 + ox, 47 + oy, S.medal); p.set(29 + ox, 47 + oy, S.medal); }
  // head / cockpit
  part(p, (l) => {
    const hx = 48 + ox + (stag ? 6 : 0), hy = 24 + oy + (stag ? 6 : 0);
    l.box(hx - 12, hy - 8, 25, 15, S.armor);
    l.box(hx - 14, hy + 2, 29, 6, S.armor2);
    for (let x = -11; x <= 11; x++) l.set(hx + x, hy - 8, lit(S.armor, 0.5));
    // broken antenna
    l.line(hx + 9, hy - 8, hx + 12, hy - 18, S.dark); l.line(hx + 12, hy - 18, hx + 15, hy - 19, S.dark);
    l.rect(hx - 9, hy - 3, 19, 4, 0x0a0606, F_FLAT);
    damage(l, dr, hx - 12, hy - 7, 24, 12, 8);
  });
  {
    const hx = 48 + ox + (stag ? 6 : 0), hy = 24 + oy + (stag ? 6 : 0);
    const vc = a === 'pain' ? 0xffffff : stag && f === 0 ? VIS_DIM : charge || a === 'attack' ? VIS_HOT : VIS;
    for (let x = -8; x <= 8; x++) { p.set(hx + x, hy - 2, vc, F_EMIT); p.set(hx + x, hy - 1, x % 3 === 0 ? VIS_DIM : mul(vc, 0.7), F_EMIT); }
    p.set(hx - 2, hy - 2, 0xffffff, F_EMIT);
  }
  // left arm: claw/gatling
  part(p, (l) => {
    if (stag) { l.limb(16 + ox, 40 + oy, 8 + ox, 72 + oy, 6, S.armor2); l.box(0, 92, 18, 14, S.gun); return; }
    const up = a === 'attack' && f === 0;
    l.limb(16 + ox, 40 + oy, 8 + ox, 58 + oy, 6, S.armor2);
    l.limb(8 + ox, 58 + oy, 12 + ox, up ? 66 + oy : 74 + oy, 5.5, S.armor2);
    l.box(4 + ox, (up ? 64 : 72) + oy, 16, 14, S.gun);
    for (let x = 6; x < 19; x += 4) l.rect(x + ox, (up ? 78 : 86) + oy, 2, 5, S.dark);
  });
  // right arm: massive cannon pointed forward-down
  const cx = 82 + ox, cy = stag ? 98 : 74 + oy + (a === 'attack' && f === 1 ? -2 : 0);
  part(p, (l) => {
    l.limb(78 + ox, 40 + oy, 86 + ox, 56 + oy, 7, S.armor2);
    l.limb(86 + ox, 56 + oy, cx, cy - 8, 11, S.gun);
    for (const t of [0.3, 0.6]) { const y = 56 + oy + (cy - 8 - 56 - oy) * t; for (let x = -10; x <= 10; x++) if (l.has(86 + ox + x, y)) l.set(86 + ox + x + (cx - 86 - ox) * t, y, lit(S.gun, x < 0 ? 0.4 : -0.2)); }
    l.ball(cx, cy, 12, 10, lit(S.gun, 0.2));
    l.ball(cx, cy, 9, 7.5, S.gun);
    damage(l, dr, cx - 10, cy - 24, 20, 20, 10);
  });
  p.ellipse(cx, cy, 6, 5, 0x050404, F_FLAT);
  if (charge) { glowBlob(p, cx, cy, 4 + f * 1.6, f ? 0xffffff : VIS_HOT, VIS, VIS_DIM, 0.3, r); sparks(p, r, cx, cy, 10, 6); }
  if (a === 'attack' && f === 1) { glowBlob(p, cx, cy, 14, 0xffffff, VIS_HOT, VIS, 0.3, r); sparks(p, r, cx, cy, 16, 14); }
  if (a === 'attack' && f === 0) { p.ellipse(cx, cy, 4, 3, VIS_DIM, F_EMIT); smoke(p, r, cx - 6, cy - 8, 5, 4, 0x4a4644); }
  // pauldrons
  part(p, (l) => {
    l.ball(16 + ox, 36 + oy, 12, 9, S.armor); l.ball(80 + ox, 36 + oy, 12, 9, S.armor);
    for (let x = 5; x < 28; x++) l.set(x + ox, 40 + oy, S.trim);
    for (let x = 69; x < 92; x++) l.set(x + ox, 40 + oy, S.trim);
    damage(l, dr, 4 + ox, 28 + oy, 88, 14, 12);
    // chevrons rank marks
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { l.set(10 + i + ox, 34 + k * 2 - i * 0.5 + oy, S.medal); l.set(17 - i + ox, 34 + k * 2 - i * 0.5 + oy, S.medal); }
  });
  // embers
  for (let i = 0; i < 5; i++) p.set(20 + r() * 56, 30 + r() * 50 + oy, i % 2 ? VIS : VIS_HOT, F_EMIT);
  if (a === 'pain') { sparks(p, r, 44 + ox, 50 + oy, 18, 18); glowBlob(p, 40 + ox, 48 + oy, 3, 0xffffff, VIS_HOT, VIS); }
}

function deadGeneral(p: Pix, S: GenStyle, r: Rng): void {
  for (let y = 102; y < 112; y++) for (let x = 2; x < 94; x++) if (r() < 0.92 - Math.abs(x - 48) / 55) p.set(x, y, y > 107 ? 0x161412 : 0x24201c, F_FLAT);
  part(p, (l) => { l.box(4, 98, 28, 11, S.dark); l.box(64, 99, 28, 11, S.dark); });
  part(p, (l) => {
    l.poly([12, 108, 18, 84, 40, 78, 66, 80, 80, 92, 82, 108], S.armor);
    rivetRow(l, 20, 76, 88, 6, S.trim);
    damage(l, makeRng(3), 14, 80, 66, 26, 40);
  });
  part(p, (l) => { l.limb(60, 96, 92, 102, 8, S.gun); l.ball(90, 102, 6, 8, lit(S.gun, 0.2)); });
  p.ellipse(91, 102, 3, 5, 0x050404, F_FLAT);
  part(p, (l) => { l.box(30, 74, 22, 12, S.armor); l.rect(33, 78, 16, 3, 0x0a0606, F_FLAT); });
  p.set(36, 79, VIS_DIM, F_EMIT); p.set(40, 79, 0x5a2004, F_EMIT);
  part(p, (l) => { l.box(50, 92, 12, 8, S.armor2); l.ball(56, 97, 2, 2, S.medal); });
  smoke(p, r, 44, 70, 8, 6, 0x3a3836); smoke(p, r, 50, 60, 5, 3, 0x2e2c2a);
  for (let i = 0; i < 8; i++) p.set(18 + r() * 60, 84 + r() * 20, i % 2 ? VIS : VIS_HOT, F_EMIT);
}

// ================================================================ THE HANDLER
interface HStyle { case_: number; case2: number; dark: number; cable: number; trim: number }
const HANDLER: HStyle = { case_: 0xa8a290, case2: 0x7a7466, dark: 0x22221e, cable: 0x1e1e22, trim: 0x5a6a5a };

type ScreenMode = 'text' | 'eye' | 'grin' | 'static' | 'dead' | 'brow' | 'red';

function crt(p: Pix, r: Rng, x0: number, y0: number, w: number, h: number, S: HStyle, mode: ScreenMode, seed: number, f: number, look = 0): void {
  part(p, (l) => {
    l.box(x0, y0, w, h, S.case_);
    for (let y = y0 + 1; y < y0 + h - 1; y++) l.set(x0 + w - 2, y, lit(S.case2, -0.2));
    l.rect(x0 + 2, y0 + h - 3, 3, 1, S.case2);
  });
  const sx = x0 + 2, sy = y0 + 2, sw = w - 4, sh = h - 5;
  const sr = makeRng(seed * 31 + f * 7);
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const xx = sx + x, yy = sy + y;
    const corner = (x === 0 || x === sw - 1) && (y === 0 || y === sh - 1);
    if (corner) { p.set(xx, yy, S.dark, F_FLAT); continue; }
    let c = (y & 1) ? TERM_BG : 0x061c0c, fl = F_EMIT;
    if (mode === 'static') { const v = sr(); c = v < 0.3 ? 0xffffff : v < 0.45 ? 0xff3030 : v < 0.6 ? 0x8a1010 : v < 0.75 ? 0xd0d0d0 : 0x202020; }
    else if (mode === 'red') c = (y & 1) ? 0x2a0404 : 0x3a0606;
    else if (mode === 'dead') { c = (x + y) % 9 === 0 ? 0x2a2e2a : 0x0e100e; fl = F_FLAT; }
    p.set(xx, yy, c, fl);
  }
  const cx = sx + sw / 2, cy = sy + sh / 2;
  if (mode === 'text') {
    for (let row = 0; row < Math.floor(sh / 3); row++) {
      let x = 1; const lr = makeRng(seed * 13 + row + f * 5);
      while (x < sw - 2) { const len = 1 + Math.floor(lr() * 4); for (let i = 0; i < len && x + i < sw - 1; i++) if (lr() < 0.8) p.set(sx + x + i, sy + 1 + row * 3, lr() < 0.2 ? TERM_DIM : TERM, F_EMIT); x += len + 1; if (lr() < 0.15) break; }
    }
  } else if (mode === 'brow') {
    for (let x = 1; x < sw - 1; x++) { const y = Math.round(sh * 0.55 - Math.sin((x / sw) * Math.PI) * sh * 0.25 + (seed % 2 ? (x / sw) * 2 : -(x / sw) * 2)); p.set(sx + x, sy + y, TERM, F_EMIT); p.set(sx + x, sy + y + 1, TERM_DIM, F_EMIT); }
  } else if (mode === 'grin') {
    for (let x = 1; x < sw - 1; x++) { const t = x / sw * 2 - 1; const y = Math.round(sh * 0.35 + (1 - t * t) * sh * 0.35); p.set(sx + x, sy + y, TERM, F_EMIT); if (x % 3 === 0) for (let k = 1; k < 3; k++) p.set(sx + x, sy + y - k, TERM_DIM, F_EMIT); }
  } else if (mode === 'eye' || mode === 'red') {
    const red = mode === 'red';
    const rx = sw * 0.42, ry = sh * 0.36;
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x / rx) ** 2 + (y / (ry * (1 - (x / rx) ** 2 * 0.3))) ** 2;
      if (d > 1) continue;
      p.set(cx + x, cy + y, d > 0.8 ? (red ? 0xff3030 : TERM) : (red ? 0x5a0808 : 0x0c3a1a), F_EMIT);
    }
    const ix = cx + look * rx * 0.35;
    glowBlob(p, ix, cy, ry * 0.85, red ? 0xffd0c0 : TERM_HOT, red ? EYE : TERM, red ? 0x8a0808 : TERM_DIM);
    p.ellipse(ix, cy, ry * 0.32, ry * 0.5, 0x020602, F_FLAT);
    p.set(ix - 2, cy - 2, 0xffffff, F_EMIT);
  }
  // glass glare
  for (let i = 0; i < Math.min(sw, sh) / 2; i++) p.tint(sx + sw - 3 - i * 0.5, sy + 1 + i, (c) => mix(c, 0xffffff, 0.18));
  void r; void cy;
}

function drawHandler(p: Pix, ps: Pose, S: HStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, sw = 0;
  if (a === 'idle') oy = f;
  if (a === 'move') { oy = [0, -2, 0, 2][f]; sw = [2, 0, -2, 0][f]; }
  if (a === 'pain') ox = 3;
  const stag = a === 'stagger', charge = a === 'charge';
  if (stag) oy = 8;
  const glitch = charge;
  // cable hair / tentacles
  part(p, (l) => {
    for (let i = 0; i < 11; i++) {
      const x0 = 14 + i * 6.8 + ox;
      const ph = Math.sin(i * 1.3 + f * 1.4) * 4 + sw;
      const len = (stag ? 10 : 18) + ((i * 7) % 9);
      const ybase = 86 + oy;
      l.limb(x0, ybase, x0 + ph * 0.5, ybase + len * 0.5, 2, S.cable);
      l.limb(x0 + ph * 0.5, ybase + len * 0.5, x0 + ph, Math.min(111, ybase + len), 1.5, S.cable);
    }
    // side "hair" cables from the top
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x0 = 48 + s * (30 + k * 3) + ox, ph = Math.sin(k + f) * 2;
      l.limb(x0, 12 + oy + k * 4, x0 + s * 6 + ph, 50 + oy + k * 6, 1.6, S.cable);
      l.limb(x0 + s * 6 + ph, 50 + oy + k * 6, x0 + s * 4 - ph, 82 + oy + k * 6, 1.3, S.cable);
    }
  }, { bevel: false });
  for (let i = 0; i < 11; i += 2) { const x0 = 14 + i * 6.8 + ox, ph = Math.sin(i * 1.3 + f * 1.4) * 4 + sw, len = (stag ? 10 : 18) + ((i * 7) % 9); p.set(x0 + ph, Math.min(111, 86 + oy + len), glitch ? 0xff3030 : TERM, F_EMIT); }
  // hover glow
  if (!stag) for (let x = 24; x < 72; x++) if ((x + f) % 3) p.set(x + ox, 110, mix(TERM_DIM, 0x041408, Math.abs(x - 48) / 24), F_EMIT);
  // back frame
  part(p, (l) => { l.box(10 + ox, 6 + oy, 76, 82, S.dark); for (let y = 10; y < 86; y += 6) l.rect(10 + ox, y + oy, 76, 1, lit(S.dark, 0.3)); });
  // monitors: [x, y, w, h, mode, seed]
  const st = (m: ScreenMode, k: number): ScreenMode => (glitch && (k + f) % 3 !== 0 ? 'static' : stag && k % 3 === 1 ? 'dead' : m);
  const look = a === 'move' ? [-1, 0, 1, 0][f] : a === 'idle' ? 0 : 0;
  const mons: [number, number, number, number, ScreenMode, number][] = [
    [12, 8, 22, 16, 'brow', 1], [34, 4, 28, 14, 'text', 2], [62, 8, 22, 16, 'brow', 3],
    [8, 26, 18, 18, 'text', 4], [70, 26, 18, 18, 'text', 5],
    [12, 46, 16, 20, 'text', 6], [68, 46, 16, 20, 'text', 7],
    [24, 68, 48, 18, 'grin', 8],
    [4, 66, 18, 14, 'text', 9], [74, 66, 18, 14, 'text', 10],
  ];
  mons.forEach(([x, y, w, h, m, s], k) => {
    const jx = glitch && k % 2 ? (f ? 2 : -2) : 0;
    crt(p, r, x + ox + jx, y + oy, w, h, S, st(m, k), s, f, 0);
  });
  // giant central eye monitor
  const ex = 26 + ox, ey = 20 + oy, ew = 44, eh = 46;
  if (!stag) {
    const m: ScreenMode = glitch ? (f ? 'static' : 'red') : a === 'attack' ? 'red' : 'eye';
    crt(p, r, ex, ey, ew, eh, S, m, 11, f, look);
    if (glitch && f === 0) { const cx = ex + ew / 2, cy = ey + eh / 2 - 2; glowBlob(p, cx, cy, 8, 0xffffff, 0xffd0c0, EYE); }
    if (a === 'attack' && f === 1) glowBlob(p, ex + ew / 2, ey + eh / 2 - 2, 14, 0xffffff, 0xffd0c0, EYE, 0.25, r);
    if (a === 'pain') { const cx = ex + ew / 2, cy = ey + eh / 2 - 2; glowBlob(p, cx, cy, 6, 0xffffff, 0xffffff, TERM_HOT); }
  } else {
    crt(p, r, ex, ey, ew, eh, S, 'dead', 11, f);
    // smashed screen with core behind
    for (const [x0, y0, x1, y1] of [[6, 4, 18, 18], [18, 18, 10, 34], [30, 6, 24, 20], [24, 20, 36, 34], [18, 18, 24, 20]]) p.line(ex + x0, ey + y0, ex + x1, ey + y1, 0xc8d0c8, F_FLAT);
    exposedCore(p, r, ex + ew / 2, ey + eh / 2 - 2, 9, f);
    sparks(p, r, ex + ew / 2, ey + eh / 2, 24, 16);
  }
  // pain / glitch slices
  if (a === 'pain' || glitch) {
    for (let k = 0; k < (glitch ? 6 : 4); k++) {
      const y = 6 + Math.floor(r() * 82) + oy, d = r() < 0.5 ? -4 : 4, hh = 1 + Math.floor(r() * 2);
      for (let yy = y; yy < y + hh; yy++) {
        const row: number[] = [], fl: number[] = [];
        for (let x = 0; x < W; x++) { row.push(p.get(x, yy)); fl.push(p.isEmit(x, yy) ? F_EMIT : 0); }
        for (let x = 0; x < W; x++) { const j = (x - d + W) % W; const c = row[j]; if (c >= 0) p.set(x, yy, glitch && (x & 7) === 0 ? 0xffffff : c, glitch ? F_EMIT : fl[j]); else p.clear(x, yy); }
      }
    }
    sparks(p, r, 48 + ox, 44 + oy, 30, glitch ? 10 : 14);
  }
}

function deadHandler(p: Pix, S: HStyle, r: Rng): void {
  part(p, (l) => { for (let i = 0; i < 9; i++) l.limb(6 + i * 10, 110, 12 + i * 9, 102 - (i % 3) * 3, 1.5, S.cable); }, { bevel: false });
  const pile: [number, number, number, number, ScreenMode][] = [
    [4, 94, 22, 16, 'dead'], [70, 92, 24, 18, 'dead'], [24, 86, 20, 16, 'dead'], [52, 84, 20, 16, 'text'],
    [30, 96, 40, 15, 'dead'], [10, 80, 16, 14, 'dead'], [72, 78, 18, 14, 'dead'],
  ];
  pile.forEach(([x, y, w, h, m], k) => crt(p, r, x, y, w, h, S, m, 40 + k, 0));
  for (let k = 0; k < 4; k++) { const x0 = 10 + k * 22, y0 = 88 + (k % 2) * 8; p.line(x0, y0, x0 + 6, y0 + 7, 0xc8d0c8, F_FLAT); }
  // last flickering eye fragment
  p.ellipse(50, 104, 3, 2, 0x0c3a1a, F_EMIT); p.set(50, 104, TERM, F_EMIT); p.set(49, 104, TERM_DIM, F_EMIT);
  sparks(p, r, 56, 92, 6, 3);
}

// ================================================================ registry
export function wardenDef2(variant: number): EnemyDef | null {
  switch (variant) {
    case 3: return { w: W, h: H, worldH: 7.0, draw: (p, ps, r) => drawMother(p, ps, MOTHER, r), dead: (p, r) => deadMother(p, MOTHER, r), hasCharge: true };
    case 4: return { w: W, h: H, worldH: 7.0, draw: (p, ps, r) => drawGardener(p, ps, GARDENER, r), dead: (p, r) => deadGardener(p, GARDENER, r), hasCharge: true };
    case 5: return { w: W, h: H, worldH: 7.0, draw: (p, ps, r) => drawGeneral(p, ps, GENERAL, r), dead: (p, r) => deadGeneral(p, GENERAL, r), hasCharge: true };
    case 6: return { w: W, h: H, worldH: 7.5, draw: (p, ps, r) => drawHandler(p, ps, HANDLER, r), dead: (p, r) => deadHandler(p, HANDLER, r), hasCharge: true };
    default: return null;
  }
}


