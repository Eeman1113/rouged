// Warden bosses (96x112): 0 FOUNDRY smelter colossus, 1 ARCHIVE server monolith, 2 CORE flesh-metal heart.
import { Pix, Rng, part, glowBlob, sparks, glint, mul, mix, lit, F_EMIT, F_FLAT, bayer } from './core';
import { Pose, exposedCore, EYE, EYE_HOT, EYE_DIM, CORE, CORE_HOT, CORE_EDGE, EnemyDef } from './enemies';

const MOLT_HOT = 0xfff4b0, MOLT = 0xffb030, MOLT_MID = 0xff6a10, MOLT_DARK = 0xb02a08;
const ORB_HOT = 0xffe0ff, ORB = 0xe040ff, ORB_EDGE = 0x8a1aa8;

interface WStyle { a: number; b: number; c: number; d: number; trim: number; elite: boolean }

/** Molten pool texture inside an area (emissive). */
export function molten(p: Pix, r: Rng, x0: number, y0: number, w: number, h: number, heat: number): void {
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = (y / h) * 0.8 + (1 - heat) * 0.4 + (r() - 0.5) * 0.35 + (bayer(x, y) - 0.5) * 0.2;
      const c = v < 0.25 ? MOLT_HOT : v < 0.5 ? MOLT : v < 0.75 ? MOLT_MID : MOLT_DARK;
      p.set(x0 + x, y0 + y, c, F_EMIT);
    }
}

export function rivetRow(l: Pix, x0: number, x1: number, y: number, step: number, col: number): void {
  for (let x = x0; x <= x1; x += step) if (l.has(x, y)) { l.set(x, y, col); l.tint(x + 1, y + 1, (c) => lit(c, -0.6)); }
}

// ---------------------------------------------------------------- FOUNDRY
function drawFoundry(p: Pix, ps: Pose, S: WStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, liftL = 0, liftR = 0, ox = 0, sw = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 3, 0, 3][f]; liftL = f === 0 ? 5 : 0; liftR = f === 2 ? 5 : 0; sw = [3, 0, -3, 0][f]; }
  if (a === 'pain') ox = -4;
  const stag = a === 'stagger';
  const charge = a === 'charge';
  const oy = bob + (stag ? 12 : 0);
  const heat = charge ? 1 : a === 'attack' ? 0.85 : a === 'idle' && f === 1 ? 0.65 : 0.5;

  // legs (pistons)
  part(p, (l) => {
    if (!stag) {
      l.limb(36, 84 + bob, 31, 100 - liftL, 7, S.b);
      l.limb(60, 84 + bob, 65, 100 - liftR, 7, S.b);
      l.limb(33, 88 + bob, 31, 98 - liftL, 3, S.d);
      l.limb(63, 88 + bob, 65, 98 - liftR, 3, S.d);
      l.box(18, 100 - liftL, 26, 12, S.a); l.box(52, 100 - liftR, 26, 12, S.a);
      for (const x of [21, 27, 33, 39]) l.set(x, 102 - liftL, S.trim);
      for (const x of [55, 61, 67, 73]) l.set(x, 102 - liftR, S.trim);
    } else {
      l.limb(34, 92, 22, 104, 7, S.b); l.box(8, 100, 26, 12, S.a);
      l.limb(62, 92, 72, 98, 7, S.b); l.limb(72, 98, 70, 106, 6, S.b); l.box(60, 101, 22, 11, S.a);
    }
  });
  // chimneys
  part(p, (l) => {
    const bent = stag ? 6 : 0;
    l.box(20 + ox, 4 + oy + bent, 9, 32, S.d); l.box(67 + ox, 4 + oy, 9, 32, S.d);
    l.box(18 + ox, 4 + oy + bent, 13, 4, S.a); l.box(65 + ox, 4 + oy, 13, 4, S.a);
    for (let y = 10; y < 34; y += 6) { l.rect(20 + ox, y + oy + bent, 9, 1, S.trim); l.rect(67 + ox, y + oy, 9, 1, S.trim); }
  });
  for (const [cx, by] of [[24.5, stag ? 10 : 4], [71.5, 4]]) {
    const big = charge ? 4 + f : 2;
    glowBlob(p, cx + ox, by + oy - big * 0.5, big, MOLT_HOT, MOLT, MOLT_MID, 0.5, r);
  }
  // torso furnace
  part(p, (l) => {
    l.poly([16 + ox, 34 + oy, 80 + ox, 34 + oy, 76 + ox, 86 + oy, 20 + ox, 86 + oy], S.a);
    for (let y = 35; y < 86; y++) for (let x = 60; x < 80; x++) if (l.has(x + ox, y + oy) && (x > 66 || ((x + y) & 1) === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.28));
    for (let x = 16; x < 81; x++) { if (l.has(x + ox, 44 + oy)) l.tint(x + ox, 44 + oy, (c) => lit(c, -0.5)); if (l.has(x + ox, 45 + oy)) l.tint(x + ox, 45 + oy, (c) => lit(c, 0.25)); }
    rivetRow(l, 20 + ox, 76 + ox, 38 + oy, 5, S.trim);
    rivetRow(l, 22 + ox, 74 + ox, 82 + oy, 5, S.trim);
    for (let i = 0; i < 50; i++) l.tint(18 + ox + Math.floor(r() * 60), 35 + oy + Math.floor(r() * 50), (c) => mix(c, 0xb0501a, 0.5));
    // soot streaks
    for (let i = 0; i < 8; i++) { const x = 22 + ox + Math.floor(r() * 52); for (let y = 46; y < 46 + r() * 30; y++) l.tint(x, y + oy, (c) => lit(c, -0.35)); }
    if (!stag) { l.box(32 + ox, 50 + oy, 32, 24, S.d); }
  });
  if (!stag) {
    molten(p, r, 35 + ox, 53 + oy, 26, 18, heat);
    for (let x = 38; x < 60; x += 5) for (let y = 53; y < 71; y++) p.set(x + ox, y + oy, mul(S.d, 0.7), F_FLAT);
    if (a === 'attack' && f === 1) glowBlob(p, 48 + ox, 62 + oy, 14, 0xffffff, MOLT_HOT, MOLT, 0.25, r);
    if (charge) glowBlob(p, 48 + ox, 62 + oy, 9 + f * 2, 0xffffff, MOLT_HOT, MOLT, 0.3, r);
  } else {
    part(p, (l) => { l.poly([30 + ox, 70 + oy, 46 + ox, 74 + oy, 44 + ox, 80 + oy, 28 + ox, 78 + oy], S.d); }); // fallen furnace door
    exposedCore(p, r, 48 + ox, 60 + oy, 9, f);
    sparks(p, r, 48 + ox, 60 + oy, 22, 14);
  }
  // head
  part(p, (l) => {
    const hx = 48 + ox + (stag ? 5 : 0), hy = 27 + oy + (stag ? 6 : 0);
    l.ball(hx, hy, 10, 8.5, S.b);
    l.box(hx - 8, hy + 2, 17, 6, S.a);
    for (let x = -6; x <= 6; x += 2) l.rect(hx + x, hy + 4, 1, 3, S.d);
    for (let x = -7; x <= 7; x++) l.set(hx + x, hy - 1, 0x0a0606, F_FLAT);
    const ec = stag && f === 0 ? EYE_DIM : a === 'pain' ? 0xffffff : EYE;
    for (const ex of [-5, 0, 5]) { l.set(hx + ex - 1, hy - 1, ec, F_EMIT); l.set(hx + ex, hy - 1, ec, F_EMIT); l.set(hx + ex + 1, hy - 1, ec, F_EMIT); }
    l.set(hx, hy - 3, ec, F_EMIT); l.set(hx, hy - 2, ec, F_EMIT);
    if (charge || a === 'attack') for (const ex of [-5, 0, 5]) l.set(hx + ex, hy - 1, EYE_HOT, F_EMIT);
  });
  // left arm: hammer
  part(p, (l) => {
    const up = a === 'attack' && f === 0;
    if (stag) { l.limb(16 + ox, 42 + oy, 10 + ox, 66 + oy, 7, S.b); l.limb(10 + ox, 66 + oy, 12 + ox, 88, 6.5, S.b); l.box(0, 92, 26, 18, S.d); return; }
    if (up) { l.limb(16 + ox, 42 + oy, 6 + ox, 22 + oy, 7, S.b); l.limb(6 + ox, 22 + oy, 12 + ox, 6 + oy, 6.5, S.b); l.box(0 + ox, 0, 26, 14, S.d); return; }
    l.limb(16 + ox, 42 + oy, 9 + ox + sw * 0.5, 64 + oy, 7, S.b);
    l.limb(9 + ox + sw * 0.5, 64 + oy, 13 + ox + sw, 80 + oy, 6.5, S.b);
    l.box(1 + ox + sw, 78 + oy, 26, 18, S.d);
    l.rect(1 + ox + sw, 84 + oy, 26, 2, S.trim);
  });
  // right arm: claw
  part(p, (l) => {
    const raise = a === 'attack' || charge;
    if (stag) { l.limb(80 + ox, 42 + oy, 88 + ox, 66 + oy, 6.5, S.b); l.limb(88 + ox, 66 + oy, 86 + ox, 90, 6, S.b); for (const d of [-4, 0, 4]) l.limb(86 + d, 92, 85 + d * 1.5, 104, 1.8, S.d); return; }
    const ey = raise ? 36 : 64, hx = raise ? 90 : 87 - sw, hy = raise ? 22 : 82;
    l.limb(80 + ox, 42 + oy, 88 + ox, ey + oy, 6.5, S.b);
    l.limb(88 + ox, ey + oy, hx + ox, hy + oy, 6, S.b);
    for (const d of [-4, 0, 4]) l.limb(hx + ox + d, hy + oy + 2, hx + ox + d * 1.6, hy + oy + (raise ? -10 : 12), 1.8, S.d);
  });
  if (a === 'attack' || charge) glowBlob(p, 90 + ox, 14 + oy, a === 'attack' && f === 1 ? 6 : 4, ORB_HOT, ORB, ORB_EDGE, 0.3, r);
  // pauldrons
  part(p, (l) => {
    l.ball(16 + ox, 39 + oy, 13, 10, S.a);
    l.ball(80 + ox, 39 + oy, 13, 10, S.a);
    for (let x = 4; x < 29; x++) l.set(x + ox, 43 + oy, S.trim);
    for (let x = 68; x < 93; x++) l.set(x + ox, 43 + oy, S.trim);
  });
  // molten drips
  for (let i = 0; i < 4; i++) {
    const x = 36 + ox + Math.floor(r() * 24), y = 72 + oy + Math.floor(r() * 4);
    if (!stag) { p.set(x, y, MOLT, F_EMIT); p.set(x, y + 1, MOLT_MID, F_EMIT); }
  }
  if (a === 'pain') { sparks(p, r, 44 + ox, 50 + oy, 16, 16); glowBlob(p, 40 + ox, 48 + oy, 3, MOLT_HOT, MOLT, MOLT_MID); }
}

function deadFoundry(p: Pix, S: WStyle, r: Rng): void {
  for (let y = 104; y < 112; y++) for (let x = 6; x < 92; x++) if (r() < 0.9 - Math.abs(x - 48) / 60) p.set(x, y, y > 108 ? 0x2a0606 : 0x3a0a08, F_FLAT);
  part(p, (l) => { l.limb(10, 92, 30, 74, 5, S.d); l.box(4, 66, 10, 10, S.a); });
  part(p, (l) => {
    l.poly([12, 110, 16, 86, 34, 74, 64, 74, 82, 86, 86, 110], S.a);
    rivetRow(l, 18, 80, 90, 6, S.trim);
    l.box(36, 88, 26, 16, S.d);
  });
  molten(p, r, 39, 91, 20, 11, 0.05);
  for (let x = 41; x < 58; x += 5) for (let y = 91; y < 102; y++) p.set(x, y, S.d, F_FLAT);
  part(p, (l) => { l.ball(80, 98, 10, 8, S.b); l.set(77, 97, 0x2a0404, F_FLAT); l.set(80, 97, 0x2a0404, F_FLAT); l.set(83, 97, 0x2a0404, F_FLAT); });
  part(p, (l) => { l.box(2, 98, 22, 13, S.d); l.ball(64, 76, 11, 7, S.a); });
  sparks(p, r, 50, 84, 6, 3);
}

// ---------------------------------------------------------------- ARCHIVE
function drawArchive(p: Pix, ps: Pose, S: WStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, sw = 0;
  if (a === 'idle') oy = f;
  if (a === 'move') { oy = [0, -2, 0, 2][f]; sw = [2, 0, -2, 0][f]; }
  if (a === 'pain') ox = 3;
  const stag = a === 'stagger';
  const charge = a === 'charge';
  if (stag) oy = 8;
  const LED_A = charge ? 0xff3030 : 0x6ac8ff, LED_B = charge ? 0xffa0a0 : 0xc8f4ff;

  // cable tendrils
  part(p, (l) => {
    for (let i = 0; i < 7; i++) {
      const x0 = 28 + i * 6.5 + ox;
      const ph = Math.sin(i * 1.7 + f * 1.3) * 3 + sw;
      const len = stag ? 6 : 14 + ((i * 5) % 7);
      l.limb(x0, 88 + oy, x0 + ph * 0.5, 88 + oy + len * 0.5, 1.6, S.d);
      l.limb(x0 + ph * 0.5, 88 + oy + len * 0.5, x0 + ph, Math.min(110, 88 + oy + len), 1.3, S.d);
    }
  }, { bevel: false });
  // hover glow
  if (!stag) for (let x = 26; x < 72; x++) if ((x + f) % 3 !== 0) p.set(x + ox, 108, mix(0x2a6aff, 0x0a1a40, Math.abs(x - 48) / 26), F_EMIT);
  // cable arms
  part(p, (l) => {
    const up = charge || (a === 'attack' && f === 0);
    const lh = up ? [8, 18] : [6 - sw, 72], rh = up ? [88, 18] : [90 + sw, 72];
    l.limb(24 + ox, 30 + oy, 10 + ox, 44 + oy, 3.5, S.d); l.limb(10 + ox, 44 + oy, lh[0] + ox, lh[1] + oy, 3, S.d);
    l.limb(72 + ox, 30 + oy, 86 + ox, 44 + oy, 3.5, S.d); l.limb(86 + ox, 44 + oy, rh[0] + ox, rh[1] + oy, 3, S.d);
    for (const h of [lh, rh]) {
      l.ball(h[0] + ox, h[1] + oy, 4.5, 4.5, S.b);
      for (const d of [-3, 0, 3]) l.line(h[0] + ox + d, h[1] + oy + 3, h[0] + ox + d * 1.6, h[1] + oy + (up ? -9 : 9), S.trim);
    }
  });
  // floating shards
  part(p, (l) => {
    l.box(2 + ox, 12 + oy - f, 9, 14, S.b);
    l.box(85 + ox, 16 + oy + f, 9, 12, S.b);
  });
  p.set(6 + ox, 18 + oy - f, LED_A, F_EMIT); p.set(89 + ox, 21 + oy + f, LED_A, F_EMIT);
  // monolith body
  part(p, (l) => {
    if (stag) {
      l.poly([24 + ox, 8 + oy, 46 + ox, 8 + oy, 44 + ox, 90 + oy, 20 + ox, 90 + oy], S.a);
      l.poly([50 + ox, 6 + oy, 72 + ox, 8 + oy, 76 + ox, 90 + oy, 52 + ox, 90 + oy], S.a);
    } else l.poly([24 + ox, 8 + oy, 72 + ox, 8 + oy, 76 + ox, 90 + oy, 20 + ox, 90 + oy], S.a);
    l.box(22 + ox, 4 + oy, 52, 6, S.b);
    for (let y = 14; y < 88; y += 7)
      for (let x = 22; x < 76; x++) if (l.has(x + ox, y + oy)) { l.tint(x + ox, y + oy, (c) => lit(c, -0.55)); l.tint(x + ox, y + oy + 1, (c) => lit(c, 0.2)); }
    for (let y = 9; y < 90; y++) for (let x = 56; x < 77; x++) if (l.has(x + ox, y + oy) && (x > 64 || ((x + y) & 1) === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.25));
    for (let i = 0; i < 40; i++) l.tint(22 + ox + Math.floor(r() * 54), 10 + oy + Math.floor(r() * 78), (c) => lit(c, -0.3));
  });
  // LEDs
  const lr = (seed: number): number => ((seed * 2654435761) >>> 0) / 4294967296;
  for (let y = 17; y < 88; y += 7)
    for (let x = 26; x < 72; x += 3) {
      if (stag && lr(x * 31 + y) > 0.25) continue;
      const v = lr(x * 97 + y * 13 + (a === 'move' || a === 'idle' ? f : 0) * 7);
      if (Math.abs(x - 48) < 11 && Math.abs(y - 40) < 11) continue;
      if (v < 0.35) p.set(x + ox, y + oy + 2, v < 0.08 ? LED_B : LED_A, F_EMIT);
      else if (v < 0.45) p.set(x + ox, y + oy + 2, charge ? 0xff6a10 : 0x3aff8a, F_EMIT);
    }
  if (stag) {
    exposedCore(p, r, 48 + ox, 56 + oy, 8, f);
    sparks(p, r, 48 + ox, 40 + oy, 24, 14);
  }
  // central eye
  if (!stag) {
    const cx = 48 + ox, cy = 40 + oy;
    p.ellipse(cx, cy, 10, 10, 0x0c1018, F_FLAT);
    for (let ang = 0; ang < 64; ang++) {
      const t = (ang / 64) * Math.PI * 2;
      p.set(cx + Math.cos(t) * 8.4, cy + Math.sin(t) * 8.4, charge ? 0xff6060 : 0x4aa0ff, F_EMIT);
    }
    const ir = a === 'attack' || charge ? 6 : 5;
    glowBlob(p, cx, cy, ir, a === 'pain' ? 0xffffff : EYE_HOT, EYE, 0x8a0808);
    p.ellipse(cx, cy, 1.6, ir * 0.7, 0x200000, F_FLAT);
    p.set(cx - 2, cy - 3, 0xffffff, F_EMIT);
    if (a === 'attack' && f === 1) glowBlob(p, cx, cy, 13, 0xffffff, ORB_HOT, ORB, 0.25, r);
    if (charge) glint(p, cx, cy, 0xffffff, 0xffa0a0, 2);
  }
  if (a === 'pain') {
    // glitch slices
    for (let k = 0; k < 4; k++) {
      const y = 12 + Math.floor(r() * 76) + oy, d = r() < 0.5 ? -3 : 3;
      const row: number[] = [];
      for (let x = 0; x < 96; x++) row.push(p.get(x, y));
      for (let x = 0; x < 96; x++) { const c = row[(x - d + 96) % 96]; if (c >= 0) p.set(x, y, c); else p.clear(x, y); }
    }
    sparks(p, r, 48 + ox, 40 + oy, 18, 12);
  }
}

function deadArchive(p: Pix, S: WStyle, r: Rng): void {
  part(p, (l) => { for (let i = 0; i < 6; i++) l.limb(14 + i * 14, 98, 18 + i * 13, 110, 1.4, S.d); }, { bevel: false });
  part(p, (l) => {
    l.poly([4, 92, 60, 86, 64, 110, 2, 111], S.a);
    for (let x = 10; x < 60; x += 7) for (let y = 88; y < 111; y++) if (l.has(x, y)) l.tint(x, y, (c) => lit(c, -0.5));
  });
  part(p, (l) => { l.poly([62, 90, 92, 94, 94, 111, 66, 111], S.a); l.box(70, 84, 9, 12, S.b); });
  for (let i = 0; i < 6; i++) p.set(8 + Math.floor(r() * 50), 92 + Math.floor(r() * 16), 0x2a5a8a, F_EMIT);
  p.ellipse(34, 100, 5, 5, 0x0c1018, F_FLAT); p.set(34, 100, 0x3a0808);
  sparks(p, r, 62, 96, 4, 3);
}

// ---------------------------------------------------------------- CORE heart
function vein(l: Pix, r: Rng, x: number, y: number, n: number, col: number, flag = 0): void {
  let dx = r() - 0.5, dy = r() - 0.5;
  for (let i = 0; i < n; i++) {
    dx += (r() - 0.5) * 0.8; dy += (r() - 0.5) * 0.8;
    const m = Math.sqrt(dx * dx + dy * dy) || 1;
    x += dx / m; y += dy / m;
    if (l.has(x, y)) l.set(x, y, col, flag);
  }
}

function drawHeart(p: Pix, ps: Pose, S: WStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, puff = 0, step = -1;
  if (a === 'idle') puff = f === 1 ? 2 : 0;
  if (a === 'move') { oy = [0, 2, 0, 2][f]; step = f; puff = f % 2; }
  if (a === 'attack') puff = f === 0 ? -2 : 3;
  if (a === 'charge') puff = 3 + f;
  if (a === 'pain') { ox = -3; puff = -1; }
  const stag = a === 'stagger';
  if (stag) oy = 10;

  // mechanical legs
  part(p, (l) => {
    const legs = [[30, 70, 10, 76, 6, 110], [40, 76, 26, 92, 22, 110], [66, 70, 86, 76, 90, 110], [56, 76, 70, 92, 74, 110]];
    legs.forEach((L, i) => {
      const lift = step >= 0 && ((step === 0 && i % 2 === 0) || (step === 2 && i % 2 === 1)) ? 5 : 0;
      const ky = stag ? L[3] + 10 : L[3] - lift, fy = L[5] - lift;
      l.limb(L[0] + ox, L[1] + oy, L[2] + ox, ky, 3.4, S.c);
      l.limb(L[2] + ox, ky, L[4], fy, 2.6, S.c);
      l.box(L[4] - 3, fy - 2, 7, 3, S.d);
      l.set(L[2] + ox, ky, S.trim);
    });
  });
  // aortas / tubes
  part(p, (l) => {
    l.limb(40 + ox, 30 + oy, 34 + ox, 4 + oy, 4.6, S.b);
    l.limb(58 + ox, 30 + oy, 64 + ox, 2 + oy, 4, S.b);
    l.limb(48 + ox, 26 + oy, 49 + ox, 8 + oy, 3, S.c);
    l.ellipse(34 + ox, 4 + oy, 3.4, 1.6, 0x1a0406, F_FLAT);
    l.ellipse(64 + ox, 2.5 + oy, 3, 1.4, 0x1a0406, F_FLAT);
  });
  // heart mass
  part(p, (l) => {
    const R = 28 + puff;
    l.ball(37 + ox, 38 + oy, 15 + puff * 0.5, 14 + puff * 0.5, S.a);
    l.ball(60 + ox, 38 + oy, 15 + puff * 0.5, 14 + puff * 0.5, S.a);
    l.ball(48 + ox, 56 + oy, R * 0.95, R * 0.9, S.a, 0, -0.6, -0.5);
    l.poly([26 + ox, 64 + oy, 70 + ox, 64 + oy, 50 + ox, 92 + oy + puff, 46 + ox, 92 + oy + puff], S.a);
    for (let i = 0; i < 14; i++) vein(l, r, 22 + ox + r() * 52, 30 + oy + r() * 50, 22, S.b);
    // muscle striation dither
    for (let y = 26; y < 94; y++) for (let x = 18; x < 80; x++) if (l.has(x + ox, y + oy) && ((x * 3 + y) % 7 === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.2));
  });
  // emissive veins when charging
  if (a === 'charge') for (let i = 0; i < 10; i++) vein(p, r, 30 + ox + r() * 36, 40 + oy + r() * 30, 18, f === 0 ? 0xff3030 : 0xff8a50, F_EMIT);
  // metal ribs (cage bands)
  part(p, (l) => {
    for (let k = 0; k < 4; k++) {
      const y = 40 + k * 11 + oy;
      const half = 27 - Math.abs(k - 1.2) * 4 + puff;
      if (stag && k === 1) { l.limb(48 - half + ox, y, 38 + ox, y - 6, 2, S.c); l.limb(48 + half + ox, y, 60 + ox, y + 5, 2, S.c); continue; }
      for (let t = -1; t <= 1.001; t += 0.05) {
        const x = 48 + ox + t * half, yy = y - Math.cos(t * 1.3) * 5;
        l.rect(x, yy, 2, 2.5, S.c);
      }
      l.set(48 - half + ox, y, S.trim); l.set(48 + half + ox, y, S.trim);
    }
    l.box(45 + ox, 30 + oy, 6, 56, S.d); // sternum spine
  });
  // core slit
  if (!stag) {
    const open = a === 'attack' ? (f === 1 ? 4 : 2) : a === 'charge' ? 3 + f : a === 'idle' && f === 1 ? 2 : 1.5;
    p.ellipse(48 + ox, 58 + oy, open + 1, 11, 0x1a0204, F_FLAT);
    glowBlob(p, 48 + ox, 58 + oy, open, 0xfff0e0, 0xff4030, 0xc01010);
    for (let y = -9; y <= 9; y++) if (Math.abs(y) < 10 - open) p.set(48 + ox, 58 + oy + y, y % 3 === 0 ? 0xffd0c0 : 0xff3030, F_EMIT);
    if (a === 'attack' && f === 1) glowBlob(p, 48 + ox, 58 + oy, 12, 0xffffff, ORB_HOT, ORB, 0.25, r);
  } else {
    exposedCore(p, r, 48 + ox, 58 + oy, 9, f);
    for (let i = 0; i < 12; i++) p.set(34 + ox + r() * 28, 60 + oy + r() * 26, r() < 0.5 ? 0x8c0f12 : 0x3a0508);
  }
  // scattered eyes
  const eyes = [[30, 34], [65, 32], [24, 54], [72, 52], [36, 76], [60, 78], [42, 30], [55, 44]];
  eyes.forEach(([x, y], i) => {
    const ex = x + ox + (puff > 0 ? (x < 48 ? -1 : 1) : 0), ey = y + oy;
    p.ellipse(ex, ey, 2, 1.6, 0x2a0408, F_FLAT);
    const blink = a === 'idle' && f === 1 && i % 3 === 0;
    if (blink) { p.set(ex - 1, ey, 0x5a1018); p.set(ex, ey, 0x5a1018); return; }
    const c = stag ? (f === 0 && i % 2 ? EYE_DIM : EYE) : a === 'pain' ? 0xffffff : EYE;
    p.set(ex - 1, ey, c, F_EMIT); p.set(ex, ey, a === 'charge' ? 0xffffff : EYE_HOT, F_EMIT);
  });
  if (a === 'pain') {
    sparks(p, r, 48, 50, 16, 10);
    for (let i = 0; i < 16; i++) { const t = r() * 6.28, d = 20 + r() * 12; p.set(48 + Math.cos(t) * d, 52 + Math.sin(t) * d, i % 2 ? 0x8c0f12 : 0xc0201c); }
  }
}

function deadHeart(p: Pix, S: WStyle, r: Rng): void {
  for (let y = 100; y < 112; y++) for (let x = 2; x < 94; x++) if (r() < 0.95 - Math.abs(x - 48) / 50 - (111 - y) * 0.03) p.set(x, y, r() < 0.3 ? 0x8c0f12 : 0x3a0508, F_FLAT);
  part(p, (l) => {
    l.limb(14, 104, 4, 86, 2.6, S.c); l.limb(4, 86, 10, 74, 2.2, S.c);
    l.limb(84, 104, 92, 92, 2.6, S.c);
  });
  part(p, (l) => {
    l.ball(48, 98, 32, 13, S.a);
    l.ball(30, 90, 12, 9, S.a);
    l.ball(66, 92, 12, 8, S.a);
    for (let i = 0; i < 10; i++) vein(l, r, 22 + r() * 52, 88 + r() * 16, 18, S.b);
  });
  part(p, (l) => { for (let k = 0; k < 3; k++) l.limb(26 + k * 6, 86 - k * 2, 70 - k * 6, 88 + k * 3, 1.4, S.c); });
  p.ellipse(48, 96, 3, 5, 0x1a0204, F_FLAT);
  p.set(48, 96, 0x6a1010);
  for (const [x, y] of [[30, 90], [64, 92], [40, 102]]) { p.set(x, y, 0x3a0808); p.set(x + 1, y, 0x2a0606); }
}

const STYLES: WStyle[] = [
  { a: 0x7c4628, b: 0x4a4a52, c: 0x5a3a26, d: 0x2c2a2e, trim: 0xc08040, elite: false },
  { a: 0x4a5a6e, b: 0x5e6e84, c: 0x34404e, d: 0x1c2430, trim: 0x9ac8ff, elite: false },
  { a: 0x9a2a30, b: 0x5a1018, c: 0x5e5a62, d: 0x2e2a30, trim: 0xc8a060, elite: false },
];

export function wardenDef(variant: number): EnemyDef {
  const v = Math.max(0, Math.min(2, variant | 0));
  const S = STYLES[v];
  const draw = v === 0 ? drawFoundry : v === 1 ? drawArchive : drawHeart;
  const dead = v === 0 ? deadFoundry : v === 1 ? deadArchive : deadHeart;
  return { w: 96, h: 112, worldH: 6.5, draw: (p, ps, r) => draw(p, ps, S, r), dead: (p, r) => dead(p, S, r), hasCharge: true };
}

