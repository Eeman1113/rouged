// Enemy sprite frames: drone, grunt, brute, stalker, spider, replica.
import {
  Pix, Rng, part, glowBlob, sparks, glint, mul, mix, lit, F_EMIT, F_FLAT, OUTLINE,
} from './core';

export type Act = 'idle' | 'move' | 'attack' | 'pain' | 'stagger' | 'charge';
export interface Pose { act: Act; f: number }

// shared emissive colors
export const EYE = 0xff1414;
export const EYE_HOT = 0xffb0a0;
export const EYE_DIM = 0x8a0c0c;
export const CORE_HOT = 0xfffbe0;
export const CORE = 0xffa020;
export const CORE_EDGE = 0xd04a08;
const OIL = 0x2a0606;
const OIL_LIGHT = 0x5a0e0c;
const BLOOD = 0x8c0f12;
const BLOOD_DARK = 0x3a0508;
const SPARK_Y = 0xfff27a;

/** Exposed glowing core inside a dark cavity with cage bars — "EXECUTE ME". */
export function exposedCore(p: Pix, r: Rng, cx: number, cy: number, rad: number, f: number, cage = true): void {
  const big = f % 2 === 1;
  // scorched cavity rim
  p.ellipse(cx, cy, rad + 1.6, rad + 1.3, 0x1a0c08, F_FLAT);
  p.ellipse(cx, cy, rad + 0.9, rad + 0.6, 0x3a1406, F_FLAT);
  // glow
  glowBlob(p, cx, cy, rad + (big ? 0.6 : 0), CORE_HOT, CORE, CORE_EDGE);
  if (big) p.set(Math.floor(cx), Math.floor(cy), 0xffffff, F_EMIT);
  if (cage && rad >= 2.5) {
    for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) {
      if ((y & 1) === 0) continue;
      p.set(Math.floor(cx - rad * 0.5), y, 0x2a1408, F_FLAT);
      p.set(Math.floor(cx + rad * 0.5), y, 0x2a1408, F_FLAT);
    }
  }
  // dangling wire
  const wx = Math.floor(cx + rad * 0.6), wy = Math.floor(cy + rad * 0.7);
  p.line(wx, wy, wx + 1, wy + 3 + (f % 2), 0xc02020);
  p.line(wx - 2, wy + 1, wx - 3, wy + 3, 0xd8b030);
  sparks(p, r, cx, cy, rad + 4, 5 + (big ? 4 : 0));
}

function eyeSlit(p: Pix, x: number, y: number, w: number, on: number): void {
  for (let i = 0; i < w; i++) p.set(x + i, y, on, F_EMIT);
  if (w >= 3 && on === EYE) p.set(x + (w >> 1), y, EYE_HOT, F_EMIT);
}

function muzzleFlash(p: Pix, r: Rng, x: number, y: number, rad: number, long = false): void {
  glowBlob(p, x, y, rad, 0xffffff, SPARK_Y, 0xff8a20, 0.3, r);
  const L = Math.round(rad * (long ? 2.2 : 1.6));
  for (let i = 1; i <= L; i++) {
    const c = i < L / 2 ? SPARK_Y : 0xff9a30;
    p.set(x + i, y, c, F_EMIT); p.set(x - i, y, c, F_EMIT);
    if (i < L * 0.7) { p.set(x, y + i, c, F_EMIT); p.set(x, y - i, c, F_EMIT); }
    if (i < L * 0.5) {
      p.set(x + i, y + i, 0xff9a30, F_EMIT); p.set(x - i, y - i, 0xff9a30, F_EMIT);
      p.set(x + i, y - i, 0xff9a30, F_EMIT); p.set(x - i, y + i, 0xff9a30, F_EMIT);
    }
  }
}

/** Puddle of fluid under a corpse. */
function pool(p: Pix, r: Rng, cx: number, cy: number, rx: number, ry: number, organic: boolean): void {
  const c0 = organic ? BLOOD : OIL_LIGHT, c1 = organic ? BLOOD_DARK : OIL;
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const d = dx * dx + dy * dy + (r() - 0.5) * 0.25;
      if (d > 1) continue;
      p.set(x, y, d < 0.45 ? c1 : c0, F_FLAT);
    }
  // sheen
  p.set(Math.floor(cx - rx * 0.3), Math.floor(cy - ry * 0.3), organic ? 0xd02a2a : 0x8a3a30, F_FLAT);
}

// ======================================================================
// SOLDIER (grunt / replica)
// ======================================================================
interface SoldierStyle {
  armor: number; armor2: number; under: number; boot: number; gun: number; gunHi: number;
  trim: number; rust: number; robot: boolean; visor: number; visorHot: number; visorDim: number;
  wideVisor: boolean; strip: number;
}

function soldierLeg(l: Pix, hx: number, hy: number, fx: number, fy: number, lift: number, S: SoldierStyle): void {
  const side = hx < 16 ? -1 : 1;
  const kx = (hx + fx) / 2 + (lift ? side * 1.2 : side * 0.3);
  const ky = hy + (fy - hy) * 0.5 - lift * 0.4;
  l.limb(hx, hy, kx, ky, 2.3, S.under);
  l.limb(kx, ky, fx, fy - 2, 2, S.armor2);
  l.box(Math.round(kx) - 1, Math.round(ky) - 1, 3, 3, S.armor);
  l.box(Math.round(fx) - 3, Math.round(fy) - 2, 6, 3, S.boot);
}

function soldierHead(l: Pix, hx: number, hy: number, S: SoldierStyle, eyeState: number): void {
  // helmet dome + jaw
  l.ball(hx, hy, 4.6, 4.8, S.armor);
  l.box(Math.round(hx) - 3, Math.round(hy) + 2, 7, 3, S.armor2);
  if (S.robot) {
    l.set(hx + 4, hy - 5, S.armor2); l.set(hx + 4, hy - 6, S.armor2); l.set(hx + 4, hy - 7, S.trim);
  } else {
    // helmet brim + strap
    for (let i = -4; i <= 4; i++) l.set(hx + i, hy - 1, lit(S.armor, -0.3));
    l.set(hx - 4, hy + 2, S.under); l.set(hx + 4, hy + 2, S.under);
  }
  const vy = Math.round(hy) + (S.wideVisor ? 0 : 0);
  const vx = Math.round(hx);
  if (S.wideVisor) {
    for (let i = -3; i <= 3; i++) l.set(vx + i, vy, 0x0c1012, F_FLAT);
    for (let i = -3; i <= 3; i++) l.set(vx + i, vy + 1, 0x0c1012, F_FLAT);
    const c = eyeState === 0 ? S.visorDim : S.visor;
    for (let i = -2; i <= 2; i++) l.set(vx + i, vy, c, F_EMIT);
    if (eyeState > 0) { l.set(vx - 1, vy, S.visorHot, F_EMIT); l.set(vx + 1, vy + 1, mul(S.visor, 0.6), F_EMIT); }
    for (let i = -2; i <= 2; i++) if (i !== 1) l.set(vx + i, vy + 1, mul(c, 0.55), F_EMIT);
  } else {
    for (let i = -3; i <= 3; i++) l.set(vx + i, vy, 0x0a0606, F_FLAT);
    eyeSlit(l, vx - 2, vy, 5, eyeState === 0 ? EYE_DIM : eyeState === 2 ? 0xffffff : EYE);
    // jaw grill
    l.set(vx - 1, vy + 3, 0x141418, F_FLAT); l.set(vx + 1, vy + 3, 0x141418, F_FLAT);
  }
}

function soldierTorso(l: Pix, ox: number, oy: number, S: SoldierStyle, r: Rng, coreOn: boolean): void {
  l.poly([9 + ox, 15 + oy, 23 + ox, 15 + oy, 21 + ox, 27 + oy, 11 + ox, 27 + oy], S.armor);
  // shading on the right half
  for (let y = 15; y < 27; y++)
    for (let x = 17; x < 23; x++)
      if (l.has(x + ox, y + oy) && (x > 19 || ((x + y) & 1) === 0 && x > 18)) l.tint(x + ox, y + oy, (c) => lit(c, -0.3));
  for (let y = 17; y < 26; y++) l.set(16 + ox, y + oy, lit(S.armor, -0.45));
  for (let x = 12; x < 21; x++) { l.set(x + ox, 22 + oy, lit(S.armor, -0.4)); l.set(x + ox, 23 + oy, lit(S.armor, 0.2)); }
  if (S.robot) {
    for (let i = 0; i < 6; i++) l.tint(11 + ox + Math.floor(r() * 10), 16 + oy + Math.floor(r() * 10), () => S.rust);
    if (coreOn) { l.set(15 + ox, 19 + oy, CORE, F_EMIT); l.set(16 + ox, 19 + oy, CORE_HOT, F_EMIT); l.set(15 + ox, 20 + oy, CORE_EDGE, F_EMIT); l.set(16 + ox, 20 + oy, CORE, F_EMIT); }
  } else {
    // webbing pouches + chest light
    l.box(11 + ox, 23 + oy, 3, 3, S.under); l.box(18 + ox, 23 + oy, 3, 3, S.under);
    l.set(13 + ox, 18 + oy, S.strip, F_EMIT);
    l.line(10 + ox, 16 + oy, 21 + ox, 26 + oy, lit(S.under, -0.1));
  }
  // trim along neckline
  for (let x = 12; x <= 20; x++) l.set(x + ox, 15 + oy, S.trim);
}

function soldierRifleDiag(l: Pix, ox: number, oy: number, S: SoldierStyle): void {
  // stock lower-left → muzzle upper-right
  l.limb(7 + ox, 30 + oy, 26 + ox, 19.5 + oy, 1.5, S.gun);
  l.line(27 + ox, 19 + oy, 29 + ox, 18 + oy, S.gun);
  l.box(5 + ox, 29 + oy, 4, 3, S.robot ? S.gun : 0x4a3a2a);
  l.box(16 + ox, 25 + oy, 2, 4, mul(S.gun, 0.8)); // magazine
  l.line(14 + ox, 25 + oy, 24 + ox, 19 + oy, S.gunHi);
  if (!S.robot) { l.set(20 + ox, 22 + oy, S.strip, F_EMIT); l.set(21 + ox, 21 + oy, S.strip, F_EMIT); }
}

function drawSoldier(p: Pix, ps: Pose, S: SoldierStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, liftL = 0, liftR = 0, aim = false, flash = false, lean = 0, kneel = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 1, 0, 1][f]; liftL = f === 0 ? 3 : 0; liftR = f === 2 ? 3 : 0; }
  if (a === 'attack' || a === 'charge') { aim = true; flash = f === 1 && a === 'attack'; }
  if (a === 'pain') lean = -2;
  const stag = a === 'stagger';
  if (stag) kneel = 6;
  const ox = lean + (stag ? 1 : 0);
  const oy = bob + kneel;
  const headTilt = !S.robot && a === 'idle' && f === 1 ? 1 : 0; // replica: uncanny tilt
  const eyeState = a === 'pain' ? 2 : stag ? (f === 0 ? 0 : 1) : 1;

  // legs
  part(p, (l) => {
    if (!stag) {
      soldierLeg(l, 13, 30 + bob, 12, 47 - liftL, liftL, S);
      soldierLeg(l, 19, 30 + bob, 20, 47 - liftR, liftR, S);
    } else {
      l.limb(13, 35, 10, 42, 2.3, S.under); l.limb(10, 42, 13, 46, 2, S.armor2);
      l.box(9, 41, 3, 3, S.armor); l.box(11, 44, 6, 3, S.boot);
      l.limb(19, 35, 23, 38, 2.3, S.under); l.limb(23, 38, 22, 45, 2, S.armor2);
      l.box(22, 37, 3, 3, S.armor); l.box(19, 44, 6, 3, S.boot);
    }
  });
  // pelvis
  part(p, (l) => {
    l.box(11 + ox * 0.5, 27 + oy, 10, 4, S.under);
    for (let x = 11; x < 21; x++) l.set(x + ox * 0.5, 27 + oy, S.rust);
  });
  // dropped rifle (stagger)
  if (stag) part(p, (l) => { l.limb(17, 46, 31, 45, 1.2, S.gun); l.box(15, 45, 3, 2, S.gun); });
  // torso
  part(p, (l) => soldierTorso(l, ox, oy, S, r, !stag));
  if (stag) exposedCore(p, r, 16 + ox, 20 + oy, 2.6, f);
  // rifle (idle/move/pain) behind arms
  if (!aim && !stag) part(p, (l) => soldierRifleDiag(l, ox, oy, S));
  // arms + shoulders
  part(p, (l) => {
    if (aim) {
      l.limb(9 + ox, 18 + oy, 11 + ox, 23 + oy, 1.9, S.under); l.limb(11 + ox, 23 + oy, 14 + ox, 23 + oy, 1.8, S.armor2);
      l.limb(23 + ox, 18 + oy, 22 + ox, 23 + oy, 1.9, S.under); l.limb(22 + ox, 23 + oy, 18 + ox, 23 + oy, 1.8, S.armor2);
    } else if (stag) {
      l.limb(9 + ox, 18 + oy, 7 + ox, 25 + oy, 1.9, S.under); l.limb(7 + ox, 25 + oy, 7 + ox, 32 + oy, 1.8, S.armor2);
      l.box(6 + ox, 32 + oy, 3, 3, S.boot);
      l.limb(23 + ox, 18 + oy, 25 + ox, 23 + oy, 1.9, S.under); l.limb(25 + ox, 23 + oy, 20 + ox, 24 + oy, 1.8, S.armor2);
    } else {
      const sw = a === 'move' ? (f === 1 ? 1 : f === 3 ? -1 : 0) : 0;
      l.limb(9 + ox, 18 + oy, 8 + ox, 24 + oy + sw, 1.9, S.under); l.limb(8 + ox, 24 + oy + sw, 12 + ox, 27 + oy, 1.8, S.armor2);
      l.limb(23 + ox, 18 + oy, 24 + ox, 23 + oy - sw, 1.9, S.under); l.limb(24 + ox, 23 + oy - sw, 19 + ox, 23 + oy, 1.8, S.armor2);
      l.box(11 + ox, 26 + oy, 3, 3, S.boot); l.box(18 + ox, 22 + oy, 3, 3, S.boot);
    }
    l.ball(9 + ox, 17 + oy, 3.4, 3, S.armor);
    l.ball(23 + ox, 17 + oy, 3.4, 3, S.armor);
    l.set(8 + ox, 15 + oy, S.trim); l.set(22 + ox, 15 + oy, S.trim);
  });
  // aimed rifle (foreshortened, toward viewer)
  if (aim) {
    part(p, (l) => {
      l.box(13 + ox, 18 + oy, 7, 6, S.gun);
      l.box(15 + ox, 16 + oy, 3, 2, S.gunHi);
      l.ball(16.5 + ox, 21.5 + oy, 2.2, 2.2, mul(S.gun, 0.7));
      l.set(16 + ox, 21 + oy, 0x000000, F_FLAT);
      if (!S.robot) l.set(14 + ox, 19 + oy, S.strip, F_EMIT);
    });
    p.box(15 + ox, 23 + oy, 3, 2, S.boot); // hands on grip
  }
  // head
  part(p, (l) => {
    const hx = 16.5 + ox * 1.5 + headTilt + (stag ? 2 : 0) + (a === 'pain' ? -1 : 0);
    const hy = 8.5 + oy + (stag ? 3 : 0);
    soldierHead(l, hx, hy, S, eyeState);
  });
  if (aim && a === 'charge' && f === 1) glint(p, 16 + ox, 21 + oy, 0xffffff, S.robot ? EYE : S.visor, 1);
  if (flash) muzzleFlash(p, r, 16 + ox, 21 + oy, 3.5);
  if (a === 'pain') {
    sparks(p, r, 12 + ox, 20 + oy, 4, 6);
    p.set(14 + ox, 21 + oy, S.robot ? OIL_LIGHT : BLOOD); p.set(13 + ox, 22 + oy, S.robot ? OIL : BLOOD_DARK);
  }
}

function deadSoldier(p: Pix, S: SoldierStyle, r: Rng): void {
  pool(p, r, 16, 45.5, 13, 2.6, !S.robot);
  part(p, (l) => {
    // legs to the right
    l.limb(19, 42, 27, 43, 2.2, S.under); l.limb(27, 43, 29, 44, 2, S.armor2);
    l.limb(19, 44.5, 26, 46, 2.2, S.under);
    l.box(29, 42, 3, 4, S.boot); l.box(26, 45, 3, 3, S.boot);
  });
  part(p, (l) => {
    l.box(8, 39, 12, 7, S.armor);
    for (let x = 9; x < 19; x++) l.set(x, 42, lit(S.armor, -0.4));
    l.limb(10, 40, 14, 36, 1.7, S.armor2); // arm flung up
    l.box(13, 34, 3, 3, S.boot);
  });
  part(p, (l) => {
    l.ball(5, 42, 3.6, 3.6, S.armor);
    l.set(3, 42, 0x0a0606, F_FLAT); l.set(3, 43, 0x0a0606, F_FLAT);
    l.set(4, 42, S.robot ? 0x3a0a0a : mul(S.visor, 0.25), F_FLAT);
  });
  if (S.robot) {
    p.set(14, 43, 0x3a2a20); p.set(15, 43, 0x2a1a10);
    p.line(18, 40, 20, 37, 0xc02020); p.line(17, 40, 18, 37, 0xd8b030);
  } else {
    p.set(11, 45, BLOOD); p.set(12, 46, BLOOD);
  }
  part(p, (l) => { l.limb(13, 47, 25, 46.5, 1, S.gun); l.box(11, 46, 3, 2, S.gun); }, { bevel: false });
}

const GRUNT: SoldierStyle = {
  armor: 0x667079, armor2: 0x4b525c, under: 0x34373e, boot: 0x26262b, gun: 0x2b2c31, gunHi: 0x5a5e66,
  trim: 0x9a5a30, rust: 0x8a4624, robot: true, visor: EYE, visorHot: EYE_HOT, visorDim: EYE_DIM, wideVisor: false, strip: CORE,
};
const GRUNT_ELITE: SoldierStyle = {
  ...GRUNT, armor: 0x3f3a40, armor2: 0x2d2a30, under: 0x241f24, trim: 0xe0a830, rust: 0x8a1a18,
};
const REPLICA: SoldierStyle = {
  armor: 0x4a5a46, armor2: 0x5c625c, under: 0x2c332c, boot: 0x1f2320, gun: 0x34383e, gunHi: 0x6a7078,
  trim: 0x7d857a, rust: 0x3a4236, robot: false, visor: 0xc8faff, visorHot: 0xffffff, visorDim: 0x4a7a80, wideVisor: true, strip: 0xffb030,
};
const REPLICA_ELITE: SoldierStyle = {
  ...REPLICA, armor: 0x2e3830, armor2: 0x3a3e3c, under: 0x1c201c, trim: 0xd8a030, visor: 0xff5a4a, visorHot: 0xffd0c0, visorDim: 0x6a1a14,
};

// ======================================================================
// STALKER
// ======================================================================
interface StalkerStyle { cloak: number; cloak2: number; metal: number; gun: number; trim: number }
const STALKER: StalkerStyle = { cloak: 0x3a3238, cloak2: 0x4e3a34, metal: 0x5c606a, gun: 0x2a2a30, trim: 0x6a5a4a };
const STALKER_ELITE: StalkerStyle = { cloak: 0x241a1e, cloak2: 0x4a1414, metal: 0x3e3a40, gun: 0x1e1c20, trim: 0xd8a030 };

function stalkerCloak(l: Pix, ox: number, oy: number, S: StalkerStyle, hem: number, torn: boolean): void {
  const hb = 45 + oy;
  const j = hem === 0 ? [0, 2, 0, 2, 0] : [2, 0, 2, 0, 2];
  l.poly([
    11 + ox, 14 + oy, 21 + ox, 14 + oy, 24 + ox, 28 + oy, 27 + ox, hb - 1,
    24 + ox, hb + j[0], 21 + ox, hb - 2, 18 + ox, hb + j[1], 15 + ox, hb - 2 + j[2] - 1,
    12 + ox, hb + j[3], 9 + ox, hb - 2, 5 + ox, hb - 1 + j[4], 8 + ox, 28 + oy,
  ], S.cloak);
  // folds
  for (let y = 18; y < 44; y++) {
    if (l.has(13 + ox, y + oy)) l.tint(13 + ox, y + oy, (c) => lit(c, -0.35));
    if (l.has(19 + ox, y + oy) && y > 22) l.tint(19 + ox, y + oy, (c) => lit(c, -0.35));
    if (l.has(10 + ox, y + oy) && y > 30) l.tint(10 + ox, y + oy, (c) => lit(c, 0.18));
    for (let x = 21; x < 28; x++) if (l.has(x + ox, y + oy) && ((x + y) & 1)) l.tint(x + ox, y + oy, (c) => lit(c, -0.25));
  }
  // mantle
  l.poly([9 + ox, 15 + oy, 23 + ox, 15 + oy, 25 + ox, 21 + oy, 16 + ox, 23 + oy, 7 + ox, 21 + oy], S.cloak2);
  for (let x = 9; x < 24; x++) if (l.has(x + ox, 21 + oy)) l.tint(x + ox, 21 + oy, () => S.trim);
  if (torn) {
    l.poly([12 + ox, 22 + oy, 20 + ox, 22 + oy, 19 + ox, 31 + oy, 13 + ox, 31 + oy], 0x161216);
  }
}

function stalkerHood(l: Pix, hx: number, hy: number, S: StalkerStyle): void {
  l.ball(hx, hy, 5, 6, S.cloak2);
  l.set(hx, hy - 6, S.cloak2); l.set(hx + 1, hy - 7, S.cloak2);
  l.ellipse(hx, hy + 1.5, 3, 3.6, 0x07050a, F_FLAT);
}

function drawStalker(p: Pix, ps: Pose, S: StalkerStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, liftL = 0, liftR = 0, ox = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 1, 0, 1][f]; liftL = f === 0 ? 2 : 0; liftR = f === 2 ? 2 : 0; }
  if (a === 'pain') ox = 2;
  const stag = a === 'stagger';
  const oy = bob + (stag ? 5 : 0);
  const aim = a === 'attack' || a === 'charge';
  const hem = a === 'move' ? f % 2 : a === 'idle' ? 0 : 1;

  // spindly legs (digitigrade)
  part(p, (l) => {
    if (!stag) {
      l.limb(13, 42 + bob, 11, 47 - liftL, 1.2, S.metal); l.limb(11, 47 - liftL, 13, 51 - liftL, 1, S.metal);
      l.limb(19, 42 + bob, 21, 47 - liftR, 1.2, S.metal); l.limb(21, 47 - liftR, 19, 51 - liftR, 1, S.metal);
      l.line(11, 51 - liftL, 14, 51 - liftL, S.gun); l.line(18, 51 - liftR, 21, 51 - liftR, S.gun);
    } else {
      l.limb(12, 47, 8, 50, 1.2, S.metal); l.limb(20, 47, 24, 50, 1.2, S.metal);
      l.line(6, 51, 10, 51, S.gun); l.line(22, 51, 26, 51, S.gun);
    }
  });
  if (stag) part(p, (l) => { l.limb(2, 50, 28, 49, 1, S.gun); l.box(13, 47, 3, 3, S.gun); });
  // idle rifle behind cloak: long diagonal, muzzle above shoulder
  if (!aim && !stag) {
    part(p, (l) => {
      l.limb(7 + ox, 41 + oy, 28 + ox, 5 + oy, 1.1, S.gun);
      l.line(28 + ox, 5 + oy, 30 + ox, 1 + oy, S.gun);
      l.box(17 + ox, 18 + oy, 5, 3, S.metal); // scope
      l.set(17 + ox, 19 + oy, EYE, F_EMIT);
      l.box(5 + ox, 40 + oy, 3, 4, S.gun);
    });
  }
  part(p, (l) => stalkerCloak(l, ox, oy, S, hem, stag));
  if (stag) exposedCore(p, r, 16 + ox, 26 + oy, 2.8, f);
  // arms / claws
  part(p, (l) => {
    if (aim) {
      l.limb(9 + ox, 20 + oy, 13 + ox, 18 + oy, 1.1, S.metal);
      l.limb(23 + ox, 20 + oy, 20 + ox, 17 + oy, 1.1, S.metal);
    } else if (stag) {
      l.limb(8 + ox, 21 + oy, 6 + ox, 31 + oy, 1.1, S.metal);
      l.limb(24 + ox, 21 + oy, 26 + ox, 31 + oy, 1.1, S.metal);
    } else {
      l.limb(8 + ox, 21 + oy, 12 + ox, 30 + oy, 1.1, S.metal);
      l.limb(24 + ox, 21 + oy, 21 + ox, 19 + oy, 1.1, S.metal);
    }
  }, { bevel: false });
  // aimed rifle toward viewer
  if (aim) {
    part(p, (l) => {
      l.limb(22 + ox, 11 + oy, 18 + ox, 18 + oy, 1.6, S.gun);
      l.box(16 + ox, 17 + oy, 5, 4, mul(S.gun, 1.3));
      l.box(19 + ox, 7 + oy, 5, 3, S.metal); // scope at eye
      l.set(18 + ox, 19 + oy, 0x000000, F_FLAT);
    });
    p.set(19 + ox, 8 + oy, EYE, F_EMIT);
  }
  // hood + eye
  part(p, (l) => {
    const hx = 16 + ox + (stag ? 1 : 0) + (a === 'pain' ? 1 : 0);
    const hy = 9 + oy + (stag ? 3 : 0);
    stalkerHood(l, hx, hy, S);
    const ec = stag && f === 0 ? EYE_DIM : EYE;
    const hot = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : 0xffd8d0;
    l.set(hx, hy + 1, hot, F_EMIT);
    l.set(hx - 1, hy + 1, ec, F_EMIT); l.set(hx + 1, hy + 1, ec, F_EMIT);
    if (!stag) { l.set(hx, hy, mul(ec, 0.7), F_EMIT); l.set(hx, hy + 2, mul(ec, 0.6), F_EMIT); }
  });
  if (a === 'charge') {
    // laser sight build-up
    glowBlob(p, 18 + ox, 19 + oy, f === 0 ? 1.6 : 2.8, 0xffffff, EYE, 0x9a0808);
    glint(p, 16 + ox, 10 + oy, 0xffffff, EYE, f === 0 ? 1 : 2);
  }
  if (a === 'attack' && f === 1) muzzleFlash(p, r, 18 + ox, 19 + oy, 4, true);
  if (a === 'pain') sparks(p, r, 14 + ox, 20 + oy, 5, 6);
}

function deadStalker(p: Pix, S: StalkerStyle, r: Rng): void {
  pool(p, r, 15, 49.5, 12, 2.2, false);
  part(p, (l) => { l.limb(1, 46, 30, 50, 1, S.gun); l.box(13, 46, 4, 3, S.metal); });
  part(p, (l) => {
    l.poly([4, 51, 6, 45, 12, 42, 22, 42, 28, 46, 30, 51], S.cloak);
    l.poly([9, 45, 20, 43, 23, 47, 12, 48], S.cloak2);
  });
  part(p, (l) => {
    l.ball(25, 46, 3.6, 3.2, S.cloak2);
    l.ellipse(26, 47, 2, 1.6, 0x07050a, F_FLAT);
    l.set(26, 47, 0x3a0808, F_FLAT);
  });
  part(p, (l) => { l.limb(8, 48, 3, 50, 1, S.metal); l.limb(18, 48, 20, 51, 1, S.metal); }, { bevel: false });
}

// ======================================================================
// BRUTE
// ======================================================================
interface BruteStyle { armor: number; armor2: number; under: number; joint: number; trim: number; rivet: number }
const BRUTE: BruteStyle = { armor: 0x84502e, armor2: 0x5e3a24, under: 0x3a3a42, joint: 0x26262c, trim: 0xa86a3a, rivet: 0xc8a070 };
const BRUTE_ELITE: BruteStyle = { armor: 0x4a2c26, armor2: 0x341e1c, under: 0x26222a, joint: 0x18161c, trim: 0xe0b038, rivet: 0xffd860 };

function bruteFist(l: Pix, cx: number, cy: number, rx: number, ry: number, S: BruteStyle): void {
  l.ball(cx, cy, rx, ry, S.armor);
  const x0 = Math.round(cx - rx + 2), x1 = Math.round(cx + rx - 2);
  for (let x = x0; x <= x1; x++) if ((x - x0) % 3 === 2) for (let y = 0; y < 3; y++) l.set(x, Math.round(cy + ry * 0.2) + y, lit(S.armor, -0.6));
  for (let x = x0; x <= x1; x++) l.set(x, Math.round(cy - ry * 0.2), S.trim);
}

function drawBrute(p: Pix, ps: Pose, S: BruteStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, liftL = 0, liftR = 0, ox = 0, swL = 0, swR = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 2, 0, 2][f]; liftL = f === 0 ? 3 : 0; liftR = f === 2 ? 3 : 0; swL = [2, 0, -2, 0][f]; swR = -swL; }
  if (a === 'pain') ox = -3;
  const stag = a === 'stagger';
  const charge = a === 'charge';
  const oy = bob + (stag ? 7 : 0) + (charge ? 3 : 0);

  // legs
  part(p, (l) => {
    if (!stag) {
      l.limb(21, 46 + bob, 18, 58 - liftL, 4.6, S.under);
      l.limb(35, 46 + bob, 38, 58 - liftR, 4.6, S.under);
      l.box(16, 42 + bob - liftL * 0 + 8, 7, 5, S.armor2); l.box(33, 50 + bob, 7, 5, S.armor2); // knee plates
      l.box(11, 58 - liftL, 13, 6, S.armor2); l.box(32, 58 - liftR, 13, 6, S.armor2);
    } else {
      l.limb(20, 50, 14, 58, 4.6, S.under); l.box(8, 57, 12, 7, S.armor2);
      l.limb(36, 50, 41, 55, 4.6, S.under); l.limb(41, 55, 40, 60, 4, S.under); l.box(34, 58, 12, 6, S.armor2);
    }
  });
  // pelvis
  part(p, (l) => { l.box(18 + ox, 41 + oy, 20, 8, S.under); for (let x = 19; x < 37; x += 3) l.set(x + ox, 44 + oy, S.joint); });
  // exhaust stacks
  part(p, (l) => {
    l.box(14 + ox, 4 + oy, 5, 10, S.joint); l.box(37 + ox, 4 + oy, 5, 10, S.joint);
    l.rect(15 + ox, 4 + oy, 3, 1, 0x0a0808);
    l.rect(38 + ox, 4 + oy, 3, 1, 0x0a0808);
  });
  if (charge) {
    for (const sx of [16, 39]) glowBlob(p, sx + ox, 2 + oy - f, 2.4 + f * 0.6, 0xfff2b0, CORE, CORE_EDGE, 0.5, r);
  }
  // torso
  part(p, (l) => {
    l.poly([8 + ox, 15 + oy, 48 + ox, 15 + oy, 45 + ox, 38 + oy, 38 + ox, 45 + oy, 18 + ox, 45 + oy, 11 + ox, 38 + oy], S.armor);
    // plates
    for (let y = 16; y < 44; y++) {
      l.tint(28 + ox, y + oy, (c) => lit(c, -0.5));
      for (let x = 36; x < 48; x++) if (l.has(x + ox, y + oy) && (x > 40 || ((x + y) & 1) === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.28));
    }
    for (let x = 12; x < 45; x++) if (l.has(x + ox, 36 + oy)) l.tint(x + ox, 36 + oy, (c) => lit(c, -0.5));
    for (const [rx, ry] of [[12, 18], [44, 18], [14, 33], [42, 33], [22, 41], [34, 41]]) {
      l.set(rx + ox, ry + oy, S.rivet); l.set(rx + 1 + ox, ry + 1 + oy, lit(S.armor, -0.6));
    }
    for (let i = 0; i < 18; i++) l.tint(10 + ox + Math.floor(r() * 36), 16 + oy + Math.floor(r() * 26), (c) => mix(c, 0xa04a1a, 0.5));
    // core housing
    if (!stag) {
      l.ellipse(28 + ox, 27 + oy, 6.5, 6, S.joint, F_FLAT);
      l.ellipse(28 + ox, 27 + oy, 5.5, 5, lit(S.joint, 0.2), F_FLAT);
    }
  });
  if (!stag) {
    const hot = charge || (a === 'idle' && f === 1) || (a === 'attack' && f === 1);
    glowBlob(p, 28 + ox, 27 + oy, hot ? 4.6 : 4.1, CORE_HOT, CORE, CORE_EDGE);
    for (let y = 23; y <= 31; y += 2) for (let x = 24; x <= 32; x++) if (p.isEmit(x + ox, y + oy) && ((x + y) & 3) !== 0 && !hot) p.tint(x + ox, y + oy, (c) => mul(c, 0.75));
    for (let x = 24; x <= 32; x += 4) for (let y = 22; y <= 32; y++) if (p.isEmit(x + ox, y + oy)) p.set(x + ox, y + oy, 0x3a1a0a, F_FLAT);
  } else {
    // cracked chest plates pulled apart
    part(p, (l) => {
      l.poly([21 + ox, 19 + oy, 28 + ox, 21 + oy, 26 + ox, 33 + oy, 20 + ox, 31 + oy], S.armor2);
      l.poly([35 + ox, 19 + oy, 28 + ox, 22 + oy, 31 + ox, 34 + oy, 37 + ox, 30 + oy], S.armor2);
    });
    exposedCore(p, r, 28 + ox, 27 + oy, 5.2, f);
    sparks(p, r, 28 + ox, 27 + oy, 12, 8);
  }
  // head (sunk between shoulders)
  part(p, (l) => {
    const hx = 28 + ox + (stag ? 3 : 0), hy = 12 + oy + (stag ? 4 : 0) + (charge ? 3 : 0);
    l.ball(hx, hy, 5.6, 4.6, S.under);
    l.box(Math.round(hx) - 4, Math.round(hy) + 1, 9, 3, S.armor2);
    for (let i = -3; i <= 3; i++) l.set(hx + i, hy - 1, 0x0a0606, F_FLAT);
    const ec = stag && f === 0 ? EYE_DIM : a === 'pain' ? 0xffffff : EYE;
    l.set(hx - 3, hy - 1, ec, F_EMIT); l.set(hx - 2, hy - 1, ec, F_EMIT);
    l.set(hx + 2, hy - 1, ec, F_EMIT); l.set(hx + 3, hy - 1, ec, F_EMIT);
    if (charge || a === 'attack') { l.set(hx - 2, hy - 1, EYE_HOT, F_EMIT); l.set(hx + 2, hy - 1, EYE_HOT, F_EMIT); }
    for (let i = -2; i <= 2; i += 2) l.set(hx + i, hy + 2, 0x101012, F_FLAT);
  });
  // arms
  const lArm = (l: Pix): void => {
    if (stag) { l.limb(9 + ox, 24 + oy, 6 + ox, 40 + oy, 4.4, S.under); bruteFist(l, 8 + ox, 52, 7, 6, S); return; }
    if (charge) { l.limb(9 + ox, 24 + oy, 10 + ox, 38 + oy, 4.4, S.under); l.limb(10 + ox, 38 + oy, 16 + ox, 44 + oy, 4.6, S.armor2); bruteFist(l, 17 + ox, 47 + oy, 8, 7, S); return; }
    l.limb(9 + ox, 24 + oy, 6 + ox + swL * 0.5, 37 + oy, 4.4, S.under);
    l.limb(6 + ox + swL * 0.5, 37 + oy, 8 + ox + swL, 45 + oy + swL, 4.8, S.armor2);
    bruteFist(l, 8 + ox + swL, 51 + oy + swL, 7, 6, S);
  };
  const rArm = (l: Pix): void => {
    if (stag) { l.limb(47 + ox, 24 + oy, 49 + ox, 36 + oy, 4.4, S.under); l.limb(49 + ox, 36 + oy, 45 + ox, 44 + oy, 4.4, S.armor2); bruteFist(l, 44 + ox, 48 + oy, 6, 5, S); return; }
    if (charge) { l.limb(47 + ox, 24 + oy, 46 + ox, 38 + oy, 4.4, S.under); l.limb(46 + ox, 38 + oy, 40 + ox, 44 + oy, 4.6, S.armor2); bruteFist(l, 39 + ox, 47 + oy, 8, 7, S); return; }
    if (a === 'attack' && f === 0) { l.limb(47 + ox, 22 + oy, 53 + ox, 13 + oy, 4.4, S.under); l.limb(53 + ox, 13 + oy, 48 + ox, 7 + oy, 4.6, S.armor2); bruteFist(l, 46 + ox, 7, 7, 6, S); return; }
    if (a === 'attack' && f === 1) { l.limb(47 + ox, 22 + oy, 44 + ox, 31 + oy, 4.6, S.under); bruteFist(l, 37 + ox, 35 + oy, 10, 9, S); return; }
    l.limb(47 + ox, 24 + oy, 50 + ox + swR * 0.5, 37 + oy, 4.4, S.under);
    l.limb(50 + ox + swR * 0.5, 37 + oy, 48 + ox + swR, 45 + oy + swR, 4.8, S.armor2);
    bruteFist(l, 48 + ox + swR, 51 + oy + swR, 7, 6, S);
  };
  part(p, lArm);
  part(p, rArm);
  // pauldrons
  part(p, (l) => {
    const sy = (charge ? 2 : 0);
    l.ball(9 + ox, 19 + oy + sy, 8, 7, S.armor);
    l.ball(47 + ox, 19 + oy + sy, 8, 7, S.armor);
    for (let x = 3; x < 16; x++) l.set(x + ox, 21 + oy + sy, S.trim);
    for (let x = 41; x < 54; x++) l.set(x + ox, 21 + oy + sy, S.trim);
    l.set(9 + ox, 15 + oy + sy, S.rivet); l.set(47 + ox, 15 + oy + sy, S.rivet);
  });
  if (a === 'attack' && f === 1) {
    for (let i = 0; i < 5; i++) {
      const ang = -2.4 + i * 0.35;
      p.line(37 + ox + Math.cos(ang) * 12, 35 + oy + Math.sin(ang) * 12, 37 + ox + Math.cos(ang) * 16, 35 + oy + Math.sin(ang) * 16, 0xe8e0d0, F_EMIT);
    }
    sparks(p, r, 37 + ox, 35 + oy, 11, 8);
  }
  if (a === 'pain') { sparks(p, r, 26 + ox, 24 + oy, 8, 10); }
}

function deadBrute(p: Pix, S: BruteStyle, r: Rng): void {
  pool(p, r, 28, 60, 26, 3.5, false);
  part(p, (l) => { l.limb(36, 54, 50, 58, 4.4, S.under); l.box(46, 54, 8, 9, S.armor2); });
  part(p, (l) => {
    l.poly([5, 62, 7, 48, 18, 42, 38, 42, 46, 50, 44, 62], S.armor);
    for (let x = 8; x < 44; x++) if (l.has(x, 52)) l.tint(x, 52, (c) => lit(c, -0.5));
    l.ellipse(26, 52, 5, 4, S.joint, F_FLAT);
    l.ellipse(26, 52, 3.6, 2.8, 0x2a1a14, F_FLAT);
    l.set(26, 52, 0x5a2a10, F_FLAT);
  });
  part(p, (l) => { l.ball(9, 50, 7, 6, S.armor); l.ball(43, 46, 7, 5.5, S.armor); });
  part(p, (l) => { bruteFist(l, 14, 58, 6.5, 5, S); });
  part(p, (l) => { l.ball(50, 50, 5, 4, S.under); l.set(48, 50, 0x1a0606, F_FLAT); l.set(51, 50, 0x1a0606, F_FLAT); });
  sparks(p, r, 30, 48, 3, 1);
}

// ======================================================================
// SPIDER
// ======================================================================
interface SpiderStyle { shell: number; body: number; leg: number; tip: number; trim: number }
const SPIDER: SpiderStyle = { shell: 0x5a5e64, body: 0x34343a, leg: 0x4a4c54, tip: 0x8a8e96, trim: 0x8a4624 };
const SPIDER_ELITE: SpiderStyle = { shell: 0x3a2a2c, body: 0x221a1c, leg: 0x302628, tip: 0xd8a030, trim: 0xb01818 };

const SP_LEGS: number[][] = [
  // rootX, rootY, kneeX, kneeY, footX, footY
  [14, 12, 7, 3, 3, 21],
  [13, 14, 4, 7, 1, 26],
  [14, 16, 6, 12, 5, 27],
  [16, 18, 11, 16, 10, 27],
];

function drawSpider(p: Pix, ps: Pose, S: SpiderStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0;
  if (a === 'move') bob = [0, 1, 0, 1][f];
  if (a === 'idle') bob = 0;
  const stag = a === 'stagger';
  const rear = a === 'attack' || a === 'charge';
  const oy = bob + (stag ? 5 : 0) + (rear ? -2 : 0);
  const ox = a === 'pain' ? 1 : 0;

  part(p, (l) => {
    for (let side = 0; side < 2; side++)
      for (let k = 0; k < 4; k++) {
        const L = SP_LEGS[k];
        const mx = (x: number): number => (side === 0 ? x : 40 - x);
        const setA = (k % 2 === 0) === (side === 0);
        let lift = 0;
        if (a === 'move') lift = (f === 0 && setA) || (f === 2 && !setA) ? 3 : 0;
        let kx = L[2], ky = L[3] - lift, fx = L[4], fy = L[5] - lift;
        if (rear && k === 0) { kx = 9; ky = -1 + oy; fx = 14; fy = 2 + oy; }
        if (stag) { ky = L[3] + 7 + (k === 1 ? 2 : 0); fy = 27; fx = L[4] - 2; kx = L[2] - 1; if (k === 2 && side === 1) { ky = 26; fx = 2; } }
        l.limb(mx(L[0]) + ox, L[1] + oy, mx(kx) + ox, ky, 1.4, S.leg);
        l.limb(mx(kx) + ox, ky, mx(fx) + ox, fy, 1, S.leg);
        l.set(mx(fx) + ox, fy, S.tip);
        l.set(mx(kx) + ox, ky, S.trim);
      }
  }, { bevel: false });
  part(p, (l) => {
    l.ball(20 + ox, 15 + oy, 9.5, 6, S.body);
    l.ball(20 + ox, 12.5 + oy, 8, 4.8, S.shell);
    for (let x = 13; x <= 27; x += 2) l.set(x + ox, 15 + oy, lit(S.shell, -0.5));
    l.set(14 + ox, 11 + oy, S.trim); l.set(26 + ox, 11 + oy, S.trim);
    l.set(17 + ox, 10 + oy, S.trim);
  });
  // eye cluster + mandibles
  const ec = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : EYE;
  for (const [x, y] of [[17, 17], [23, 17], [18, 18], [22, 18]]) p.set(x + ox, y + oy, ec, F_EMIT);
  p.set(19 + ox, 18 + oy, EYE_HOT, F_EMIT); p.set(21 + ox, 18 + oy, EYE_HOT, F_EMIT);
  p.set(20 + ox, 18 + oy, ec, F_EMIT);
  p.set(18 + ox, 20 + oy, S.tip); p.set(22 + ox, 20 + oy, S.tip); p.set(18 + ox, 21 + oy, OUTLINE); p.set(22 + ox, 21 + oy, OUTLINE);
  // ticking core
  if (!stag) {
    const hot = (a === 'idle' && f === 1) || (a === 'move' && f % 2 === 1) || rear;
    p.ellipse(20 + ox, 8.5 + oy, 3.6, 2.8, 0x221410, F_FLAT);
    glowBlob(p, 20 + ox, 8.5 + oy, hot ? 2.8 : 2.2, hot ? CORE_HOT : CORE, hot ? CORE : CORE_EDGE, hot ? CORE_EDGE : 0x7a2808);
    if (hot) glint(p, 20 + ox, 8 + oy, 0xffffff, CORE, 1);
  } else {
    exposedCore(p, r, 20 + ox, 11 + oy, 3.6, f, false);
  }
  if (a === 'attack' && f === 1) glowBlob(p, 20 + ox, 20 + oy, 3.4, 0xffffff, 0xffc040, 0xff6a10, 0.3, r);
  if (a === 'pain') sparks(p, r, 20, 12, 7, 6);
}

function deadSpider(p: Pix, S: SpiderStyle, r: Rng): void {
  pool(p, r, 20, 25.5, 14, 2, false);
  part(p, (l) => {
    l.ball(20, 22, 9, 4.6, S.body);
    l.ellipse(20, 24, 6, 2, S.shell);
  });
  part(p, (l) => {
    const curls = [[12, 21, 8, 15, 11, 13], [15, 19, 13, 12, 16, 11], [28, 21, 32, 15, 29, 13], [25, 19, 27, 12, 24, 11], [11, 24, 4, 23, 5, 19], [29, 24, 36, 23, 35, 19]];
    for (const c of curls) { l.limb(c[0], c[1], c[2], c[3], 1.3, S.leg); l.limb(c[2], c[3], c[4], c[5], 1, S.leg); }
  }, { bevel: false });
  p.ellipse(20, 20, 2.2, 1.4, 0x2a1a14, F_FLAT);
  p.set(20, 20, 0x5a2a10);
  p.set(18, 24, EYE_DIM); p.set(22, 24, 0x400808);
  sparks(p, r, 20, 20, 2, 1);
}

// ======================================================================
// DRONE
// ======================================================================
interface DroneStyle { shell: number; shell2: number; fin: number; trim: number }
const DRONE: DroneStyle = { shell: 0x646a74, shell2: 0x40444c, fin: 0x7a4a2c, trim: 0x9aa0a8 };
const DRONE_ELITE: DroneStyle = { shell: 0x3c3438, shell2: 0x2a2226, fin: 0x8a1414, trim: 0xe0a830 };

function drawDrone(p: Pix, ps: Pose, S: DroneStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0;
  if (a === 'idle') oy = f === 1 ? 1 : 0;
  if (a === 'move') oy = [0, -1, 0, 1][f];
  if (a === 'pain') ox = 2;
  const stag = a === 'stagger';
  if (stag) oy = 3;
  const cx = 12 + ox, cy = 11 + oy;
  // rotor
  part(p, (l) => {
    l.rect(cx - 0.5, cy - 9, 2, 3, S.shell2);
    if (stag) { l.line(cx - 6, cy - 8, cx, cy - 9, S.trim); l.line(cx + 1, cy - 9, cx + 5, cy - 6, S.trim); }
    else {
      const ph = (a === 'move' ? f : f * 2) % 2;
      if (ph === 0) { l.rect(cx - 8, cy - 10, 18, 1, S.trim); l.rect(cx - 5, cy - 10, 12, 1, lit(S.trim, 0.4)); }
      else { l.line(cx - 6, cy - 9, cx + 7, cy - 11, S.trim); l.line(cx - 4, cy - 11, cx + 5, cy - 9, mul(S.trim, 0.7)); }
    }
  }, { bevel: false });
  // fins
  part(p, (l) => {
    const tilt = stag ? 2 : 0;
    l.poly([cx - 6, cy - 2, cx - 11, cy - 5 + tilt, cx - 11, cy + 4 + tilt, cx - 6, cy + 3], S.fin);
    l.poly([cx + 7, cy - 2, cx + 12, cy - 5 - (stag ? 0 : 0), cx + 12, cy + 4, cx + 7, cy + 3], S.fin);
    l.set(cx - 10, cy - 3 + tilt, S.trim); l.set(cx + 11, cy - 3, S.trim);
  });
  // thruster
  part(p, (l) => { l.box(cx - 2, cy + 6, 5, 3, S.shell2); });
  if (!stag) {
    const fl = (a === 'move' ? f : f) % 2;
    p.set(cx, cy + 9, CORE, F_EMIT); p.set(cx + 1, cy + 9, CORE_HOT, F_EMIT);
    p.set(cx, cy + 10, CORE_EDGE, F_EMIT); if (fl) { p.set(cx + 1, cy + 10, CORE, F_EMIT); p.set(cx + 1, cy + 11, CORE_EDGE, F_EMIT); }
  }
  // shell
  part(p, (l) => {
    l.ball(cx + 0.5, cy + 0.5, 7, 6.8, S.shell);
    for (let x = -6; x <= 6; x++) if (l.has(cx + x, cy + 4)) l.tint(cx + x, cy + 4, (c) => lit(c, -0.5));
    l.set(cx - 5, cy - 3, S.trim); l.set(cx + 5, cy - 3, S.trim);
  });
  // eye
  const flare = a === 'attack' || a === 'charge';
  p.ellipse(cx + 0.5, cy + 0.5, 4, 4, 0x141418, F_FLAT);
  p.ellipse(cx + 0.5, cy + 0.5, 3.2, 3.2, 0x2a2a30, F_FLAT);
  if (stag) {
    const on = f === 1;
    p.ellipse(cx + 0.5, cy + 0.5, 2, 2, on ? EYE_DIM : 0x2a0606, F_EMIT);
    if (on) p.set(cx, cy, EYE, F_EMIT);
    // crack + exposed core underneath
    p.line(cx - 4, cy - 4, cx - 1, cy - 1, OUTLINE); p.line(cx + 2, cy - 5, cx + 3, cy - 2, OUTLINE);
    exposedCore(p, r, cx + 0.5, cy + 5, 2.4, f, false);
  } else {
    glowBlob(p, cx + 0.5, cy + 0.5, flare ? 2.8 : 2.4, a === 'pain' ? 0xffffff : EYE_HOT, EYE, 0xa00808);
    p.set(cx - 1, cy - 1, 0xffffff, F_EMIT);
  }
  if (a === 'attack' && f === 1) glowBlob(p, cx + 0.5, cy + 0.5, 4.6, 0xffffff, 0xff6050, EYE, 0.3, r);
  if (a === 'pain') sparks(p, r, cx, cy, 6, 6);
}

function deadDrone(p: Pix, S: DroneStyle, r: Rng): void {
  pool(p, r, 12, 22, 9, 1.6, false);
  part(p, (l) => { l.poly([3, 22, 1, 17, 6, 19], S.fin); l.poly([19, 21, 23, 20, 21, 17], S.fin); });
  part(p, (l) => {
    l.ball(12, 19, 7.5, 4.6, S.shell);
    l.line(8, 16, 11, 19, OUTLINE); l.line(14, 15, 16, 18, OUTLINE);
  });
  p.ellipse(12, 19.5, 2.4, 2, 0x141418, F_FLAT);
  p.set(12, 19, 0x3a0808); p.set(11, 19, 0x200404);
  part(p, (l) => { l.line(18, 14, 22, 12, S.trim); l.rect(17, 14, 2, 2, S.shell2); }, { bevel: false });
  sparks(p, r, 15, 17, 2, 1);
}

// ======================================================================
// registry
// ======================================================================
export interface EnemyDef {
  w: number; h: number; worldH: number;
  draw: (p: Pix, ps: Pose, r: Rng) => void;
  dead: (p: Pix, r: Rng) => void;
  hasCharge: boolean;
}

export function enemyDef(type: string, elite: boolean): EnemyDef {
  switch (type) {
    case 'drone': { const S = elite ? DRONE_ELITE : DRONE; return { w: 24, h: 24, worldH: 0.9, draw: (p, ps, r) => drawDrone(p, ps, S, r), dead: (p, r) => deadDrone(p, S, r), hasCharge: false }; }
    case 'brute': { const S = elite ? BRUTE_ELITE : BRUTE; return { w: 56, h: 64, worldH: 3.0, draw: (p, ps, r) => drawBrute(p, ps, S, r), dead: (p, r) => deadBrute(p, S, r), hasCharge: true }; }
    case 'stalker': { const S = elite ? STALKER_ELITE : STALKER; return { w: 32, h: 52, worldH: 2.0, draw: (p, ps, r) => drawStalker(p, ps, S, r), dead: (p, r) => deadStalker(p, S, r), hasCharge: true }; }
    case 'spider': { const S = elite ? SPIDER_ELITE : SPIDER; return { w: 40, h: 28, worldH: 1.0, draw: (p, ps, r) => drawSpider(p, ps, S, r), dead: (p, r) => deadSpider(p, S, r), hasCharge: false }; }
    case 'replica': { const S = elite ? REPLICA_ELITE : REPLICA; return { w: 32, h: 48, worldH: 1.85, draw: (p, ps, r) => drawSoldier(p, ps, S, r), dead: (p, r) => deadSoldier(p, S, r), hasCharge: false }; }
    case 'grunt':
    default: { const S = elite ? GRUNT_ELITE : GRUNT; return { w: 32, h: 48, worldH: 1.9, draw: (p, ps, r) => drawSoldier(p, ps, S, r), dead: (p, r) => deadSoldier(p, S, r), hasCharge: false }; }
  }
}

