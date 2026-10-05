// THE SMELTER — furnace colossus. Hammer arm (left), claw arm (right), chimneys, furnace chest.
import { Rng, glowBlob, sparks, mul, mix, lit, F_EMIT, F_FLAT } from '../core';
import { exposedCore, EYE, EYE_HOT, EYE_DIM } from '../enemies';
import { molten, rivetRow } from '../warden';
import { TPix, BP, BossArt, bpart, k3, p3, cracks, lerp } from './rig';
import { moveClips } from './clips';

const MOLT_HOT = 0xfff4b0, MOLT = 0xffb030, MOLT_MID = 0xff6a10, MOLT_DARK = 0xb02a08;
const ORB_HOT = 0xffe0ff, ORB = 0xe040ff, ORB_EDGE = 0x8a1aa8;
const S = { a: 0x7c4628, b: 0x4a4a52, c: 0x5a3a26, d: 0x2c2a2e, trim: 0xc08040 };

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const crouch = Math.max(b.crouch, stag ? 0 : b.kneel * 1.4);
  const ox = Math.round(b.ox + (stag ? 0 : 0)), oy = Math.round(b.bob + crouch * 10 + (stag ? 12 : 0));
  const heat = Math.min(1, b.heat), open = b.open;
  const sw = b.sw * 3;

  // legs (pistons) with knees that bend under crouch
  bpart(p, (l) => {
    if (!stag) {
      for (const [hx, fx, lift] of [[36, 31, b.stepL], [60, 65, b.stepR]] as [number, number, number][]) {
        const fy = 100 - lift, hy = 84 + oy;
        const kx = (hx + fx) / 2 + (hx < 48 ? -1 : 1) * crouch * 9, ky = (hy + fy) / 2 + 2;
        l.limb(hx + ox * 0.5, hy, kx, ky, 7, S.b); l.limb(kx, ky, fx, fy, 6.5, S.b);
        l.limb(kx, ky, fx, fy - 2, 3, S.d);
        l.box(fx - 13, fy, 26, 12, S.a);
        for (let x = fx - 10; x < fx + 12; x += 6) l.set(x, fy + 2, S.trim);
        l.set(kx, ky, S.trim);
      }
    } else {
      l.limb(34, 92, 22, 104, 7, S.b); l.box(8, 100, 26, 12, S.a);
      l.limb(62, 92, 72, 98, 7, S.b); l.limb(72, 98, 70, 106, 6, S.b); l.box(60, 101, 22, 11, S.a);
    }
  });
  // chimneys
  const bent = stag ? 6 : 0;
  bpart(p, (l) => {
    l.box(20 + ox, 4 + oy + bent, 9, 32, S.d); l.box(67 + ox, 4 + oy, 9, 32, S.d);
    l.box(18 + ox, 4 + oy + bent, 13, 4, S.a); l.box(65 + ox, 4 + oy, 13, 4, S.a);
    for (let y = 10; y < 34; y += 6) { l.rect(20 + ox, y + oy + bent, 9, 1, S.trim); l.rect(67 + ox, y + oy, 9, 1, S.trim); }
  });
  for (const [cx, by] of [[24.5, 4 + bent], [71.5, 4]]) {
    const big = 2 + b.charge * 4 + (b.aux > 0 ? b.aux * 5 : 0) + Math.sin(b.t * 12 + cx) * 0.6;
    glowBlob(p, cx + ox, by + oy - big * 0.6, big, MOLT_HOT, MOLT, MOLT_MID, 0.5, r);
    if (b.aux > 0.3) for (let i = 0; i < 8; i++) p.set(cx + ox + (r() - 0.5) * 10, by + oy - big - r() * 14 * b.aux, r() < 0.5 ? MOLT_HOT : MOLT, F_EMIT);
  }
  // torso furnace
  bpart(p, (l) => {
    l.poly([16 + ox, 34 + oy, 80 + ox, 34 + oy, 76 + ox, 86 + oy, 20 + ox, 86 + oy], S.a);
    for (let y = 35; y < 86; y++) for (let x = 60; x < 80; x++) if (l.has(x + ox, y + oy) && (x > 66 || ((x + y) & 1) === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.28));
    for (let x = 16; x < 81; x++) { if (l.has(x + ox, 44 + oy)) l.tint(x + ox, 44 + oy, (c) => lit(c, -0.5)); if (l.has(x + ox, 45 + oy)) l.tint(x + ox, 45 + oy, (c) => lit(c, 0.25)); }
    rivetRow(l, 20 + ox, 76 + ox, 38 + oy, 5, S.trim);
    rivetRow(l, 22 + ox, 74 + ox, 82 + oy, 5, S.trim);
    for (let i = 0; i < 50; i++) l.tint(18 + ox + Math.floor(r() * 60), 35 + oy + Math.floor(r() * 50), (c) => mix(c, 0xb0501a, 0.5));
    for (let i = 0; i < 8; i++) { const x = 22 + ox + Math.floor(r() * 52); for (let y = 46; y < 46 + r() * 30; y++) l.tint(x, y + oy, (c) => lit(c, -0.35)); }
    if (!stag) l.box(32 + ox, 50 + oy, 32, 24, S.d);
  });
  if (b.dmg >= 1) cracks(p, r, 20 + ox, 36 + oy, 56, 46, b.dmg >= 2 ? 9 : 5, MOLT_HOT, MOLT_MID);
  if (!stag) {
    molten(p, r, 35 + ox, 53 + oy, 26, 18, heat);
    // furnace door: grate bars slide aside as the weak point opens
    const gap = Math.round(open * 10);
    for (let x = 38; x < 60; x += 5) {
      const xx = x < 48 ? x - gap : x + gap;
      if (xx < 35 || xx > 60) continue;
      for (let y = 53; y < 71; y++) p.set(xx + ox, y + oy, mul(S.d, 0.7), F_FLAT);
    }
    if (open > 0.2) {
      const pulse = 0.5 + 0.5 * Math.sin(b.t * Math.PI * 4);
      glowBlob(p, 48 + ox, 62 + oy, 4 + open * 5 + pulse, 0xffffff, MOLT_HOT, MOLT, 0.2, r);
      sparks(p, r, 48 + ox, 62 + oy, 14, Math.round(open * 8));
    }
    if (b.flash > 0 && b.aR > -0.4) glowBlob(p, 48 + ox, 62 + oy, 6 + b.flash * 10, 0xffffff, MOLT_HOT, MOLT, 0.25, r);
  } else {
    bpart(p, (l) => { l.poly([30 + ox, 70 + oy, 46 + ox, 74 + oy, 44 + ox, 80 + oy, 28 + ox, 78 + oy], S.d); });
    exposedCore(p, r, 48 + ox, 60 + oy, 9, Math.floor(b.t * 4));
    sparks(p, r, 48 + ox, 60 + oy, 22, 14);
  }
  // head
  bpart(p, (l) => {
    const hx = 48 + ox + (stag ? 5 : 0), hy = 27 + oy + (stag ? 6 : 0) + Math.round(b.pain * 2);
    l.ball(hx, hy, 10, 8.5, S.b);
    l.box(hx - 8, hy + 2, 17, 6, S.a);
    for (let x = -6; x <= 6; x += 2) l.rect(hx + x, hy + 4 + (b.charge > 0.6 ? 1 : 0), 1, 3, S.d);
    for (let x = -7; x <= 7; x++) l.set(hx + x, hy - 1, 0x0a0606, F_FLAT);
    const ec = stag && Math.floor(b.t * 4) % 2 === 0 ? EYE_DIM : b.pain > 0.5 ? 0xffffff : EYE;
    for (const ex of [-5, 0, 5]) { l.set(hx + ex - 1, hy - 1, ec, F_EMIT); l.set(hx + ex, hy - 1, ec, F_EMIT); l.set(hx + ex + 1, hy - 1, ec, F_EMIT); }
    l.set(hx, hy - 3, ec, F_EMIT); l.set(hx, hy - 2, ec, F_EMIT);
    if (b.charge > 0.4 || b.flash > 0.4) for (const ex of [-5, 0, 5]) l.set(hx + ex, hy - 1, EYE_HOT, F_EMIT);
  });
  // left arm: hammer. -1 slammed into the floor in front · 0 hanging · 1 overhead
  let hbx = 0, hby = 0;
  bpart(p, (l) => {
    if (stag) { l.limb(16 + ox, 42 + oy, 10 + ox, 66 + oy, 7, S.b); l.limb(10 + ox, 66 + oy, 12 + ox, 88, 6.5, S.b); l.box(0, 92, 26, 18, S.d); return; }
    const v = b.aL;
    const [ex, ey] = p3(v, [16, 66], [9 + sw * 0.5, 64], [4, 22]);
    const [hx, hy] = p3(v, [30, 90], [13 + sw, 80], [12, 4]);
    l.limb(16 + ox, 42 + oy, ex + ox, ey + oy * (v > 0.5 ? 0.6 : 1), 7, S.b);
    l.limb(ex + ox, ey + oy * (v > 0.5 ? 0.6 : 1), hx + ox, hy + (v < -0.5 ? 0 : oy), 6.5, S.b);
    const bx = hx - 12 + ox, by = hy - 2 + (v < -0.5 ? 0 : oy) - Math.max(0, v) * 6;
    hbx = bx; hby = by;
    l.box(bx, by, 26, 18, S.d);
    l.rect(bx, by + 6, 26, 2, S.trim);
  });
  if (!stag && b.aL > 0.5 && b.charge > 0.3) {
    // the hammer head glows white-hot at the top of the swing
    for (let x = 1; x < 25; x++) { p.set(hbx + x, hby + 16, x % 3 ? MOLT : MOLT_HOT, F_EMIT); if (b.charge > 0.7) p.set(hbx + x, hby + 15, MOLT_MID, F_EMIT); }
    for (let y = 2; y < 16; y += 3) p.set(hbx + 1, hby + y, MOLT_MID, F_EMIT);
  }
  // right arm: claw. -1 thrust forward (spray) · 0 hanging · 1 raised
  bpart(p, (l) => {
    if (stag) { l.limb(80 + ox, 42 + oy, 88 + ox, 66 + oy, 6.5, S.b); l.limb(88 + ox, 66 + oy, 86 + ox, 90, 6, S.b); for (const d of [-4, 0, 4]) l.limb(86 + d, 92, 85 + d * 1.5, 104, 1.8, S.d); return; }
    const v = b.aR;
    const [ex, ey] = p3(v, [92, 50], [88, 64], [88, 36]);
    const [hx, hy] = p3(v, [74, 54], [87 - sw, 82], [90, 22]);
    l.limb(80 + ox, 42 + oy, ex + ox, ey + oy, 6.5, S.b);
    l.limb(ex + ox, ey + oy, hx + ox, hy + oy, 6, S.b);
    const cl = k3(v, 5, 12, -10);
    for (const d of [-4, 0, 4]) l.limb(hx + ox + d, hy + oy + 2, hx + ox + d * (v < 0 ? 2.4 : 1.6), hy + oy + cl + (v < 0 ? Math.abs(d) * 0.8 : 0), 1.8, S.d);
  });
  if (!stag && (b.aR > 0.4 || b.aR < -0.4)) {
    const [hx, hy] = p3(b.aR, [74, 54], [87, 82], [90, 22]);
    const rad = 3 + Math.abs(b.aR) * 2 + b.flash * 5;
    glowBlob(p, hx + ox, hy + oy - (b.aR > 0 ? 8 : -2), rad, ORB_HOT, ORB, ORB_EDGE, 0.3, r);
  }
  // pauldrons
  bpart(p, (l) => {
    l.ball(16 + ox, 39 + oy, 13, 10, S.a);
    l.ball(80 + ox, 39 + oy, 13, 10, S.a);
    for (let x = 4; x < 29; x++) l.set(x + ox, 43 + oy, S.trim);
    for (let x = 68; x < 93; x++) l.set(x + ox, 43 + oy, S.trim);
    if (b.dmg >= 2) { for (let y = 29; y < 37; y++) for (let x = 84; x < 94; x++) if ((x + y) % 3) l.clear(x + ox, y + oy); }
  });
  if (b.dmg >= 2) glowBlob(p, 86 + ox, 34 + oy, 2, MOLT_HOT, MOLT, MOLT_MID);
  // molten drips
  for (let i = 0; i < 4 + b.dmg * 3; i++) {
    const x = 36 + ox + Math.floor(r() * 24), y = 72 + oy + Math.floor(r() * 4) + Math.floor(b.t * 6) % 3;
    if (!stag) { p.set(x, y, MOLT, F_EMIT); p.set(x, y + 1, MOLT_MID, F_EMIT); }
  }
  if (b.pain > 0.5) { sparks(p, r, 44 + ox, 50 + oy, 16, 16); glowBlob(p, 40 + ox, 48 + oy, 3, MOLT_HOT, MOLT, MOLT_MID); }
  if (b.glitch > 0.3) sparks(p, r, 48 + ox, 50 + oy, 30, Math.round(b.glitch * 16));
  void MOLT_DARK; void lerp;
}

function dead(p: TPix, r: Rng): void {
  for (let y = 104; y < 112; y++) for (let x = 6; x < 92; x++) if (r() < 0.9 - Math.abs(x - 48) / 60) p.set(x, y, y > 108 ? 0x2a0606 : 0x3a0a08, F_FLAT);
  bpart(p, (l) => { l.limb(10, 92, 30, 74, 5, S.d); l.box(4, 66, 10, 10, S.a); });
  bpart(p, (l) => {
    l.poly([12, 110, 16, 86, 34, 74, 64, 74, 82, 86, 86, 110], S.a);
    rivetRow(l, 18, 80, 90, 6, S.trim);
    l.box(36, 88, 26, 16, S.d);
  });
  molten(p, r, 39, 91, 20, 11, 0.05);
  for (let x = 41; x < 58; x += 5) for (let y = 91; y < 102; y++) p.set(x, y, S.d, F_FLAT);
  bpart(p, (l) => { l.ball(80, 98, 10, 8, S.b); l.set(77, 97, 0x2a0404, F_FLAT); l.set(80, 97, 0x2a0404, F_FLAT); l.set(83, 97, 0x2a0404, F_FLAT); });
  bpart(p, (l) => { l.box(2, 98, 22, 13, S.d); l.ball(64, 76, 11, 7, S.a); });
  bpart(p, (l) => { l.box(-10, 104, 9, 6, S.d); l.box(98, 102, 12, 8, S.a); l.box(104, 96, 7, 6, S.d); });
  sparks(p, r, 50, 84, 6, 3);
}

export function smelterArt(): BossArt {
  return {
    draw, dead, worldH: 6.5, glow: [0xff2a10, 0xffb030],
    clips: {
      ...moveClips('hammer', { W: { aL: 1, crouch: 0.15, heat: 0.8, charge: 0.9 }, A: { aL: -1, crouch: 0.55, heat: 1 }, L: { aL: -1, crouch: 0.45, open: 1, heat: 0.9 }, xw: { lean: -4, sy: 1.05 }, xa: { lean: 5, sy: 0.92, sx: 1.04 }, xl: { lean: 3, sy: 0.95 }, n: [7, 4, 7], shake: 1 }),
      ...moveClips('leap', { W: { crouch: 1, aL: 0.35, aR: 0.35, heat: 0.85, charge: 0.6 }, A: { crouch: 0, aL: 0.9, aR: 0.9, stepL: 7, stepR: 7, heat: 1 }, L: { crouch: 1, aL: -0.5, aR: -0.6, heat: 1, flash: 0.4 }, xw: { sy: 0.88, sx: 1.05 }, xa: { sy: 1.1, sx: 0.95 }, xl: { sy: 0.86, sx: 1.07 }, n: [6, 4, 6] }),
      ...moveClips('fan', { W: { aR: 1, heat: 0.7, charge: 0.4 }, A: { aR: -1, heat: 0.9 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 6) > 0 ? 1 : 0.15 }), xa: { lean: 2 }, n: [6, 6, 5] }),
      ...moveClips('charge', { W: { crouch: 0.6, aL: 0.4, aR: 0.4, heat: 0.95, charge: 1 }, A: { crouch: 0.25, aL: -0.4, aR: -0.4, heat: 1 }, act: (k) => { const s = Math.sin(k * Math.PI * 4); return { stepL: Math.max(0, s) * 8, stepR: Math.max(0, -s) * 8, bob: Math.abs(s) * 3 }; }, L: { kneel: 0.45, open: 1, heat: 1, pain: 0.6 }, xw: { lean: 7, sy: 0.93 }, xa: { lean: 10, sy: 0.97 }, xl: { lean: -4, sy: 0.92 }, loop: true, n: [6, 4, 7], shake: 1 }),
      ...moveClips('vent', { W: { open: 0.7, heat: 1, crouch: 0.35, aL: 0.5, aR: 0.5 }, A: { open: 1, heat: 1, crouch: 0.3, aL: 0.55, aR: 0.55 }, act: (k) => ({ flash: 0.5 + 0.5 * Math.sin(k * Math.PI * 8), t: k }), loop: true, xw: { sy: 0.96, sx: 1.03 }, xa: { sy: 0.96, sx: 1.03, jit: 1 }, n: [6, 4, 6], shake: 1 }),
      ...moveClips('pour', { W: { charge: 1, heat: 0.85, aL: 0.5, aR: 0.5, crouch: 0.2 }, A: { charge: 1, aux: 1, heat: 1, aL: 0.7, aR: 0.7 }, act: (k) => ({ aux: 0.6 + 0.4 * Math.sin(k * Math.PI * 6) }), xw: { sy: 0.95 }, xa: { sy: 1.04 }, n: [6, 6, 5] }),
      ...moveClips('spiral', { W: { aL: 1, aR: 1, heat: 1, charge: 0.6 }, A: { aL: 0.6, aR: 0.6, heat: 1, flash: 0.6, charge: 1 }, act: (k) => ({ aL: Math.sin(k * Math.PI * 2) * 0.8, aR: -Math.sin(k * Math.PI * 2) * 0.8, flash: 0.5 + 0.5 * Math.sin(k * Math.PI * 4) }), loop: true, xa: { jit: 1 }, n: [6, 6, 5] }),
    },
  };
}
