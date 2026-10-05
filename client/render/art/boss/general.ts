// THE GENERAL — war-mech: siege cannon arm, gatling arm, exhaust stacks, a cockpit hatch.
import { Rng, glowBlob, sparks, mul, mix, lit, F_EMIT, F_FLAT, makeRng } from '../core';
import { exposedCore } from '../enemies';
import { rivetRow } from '../warden';
import { smoke } from '../enemies2';
import { TPix, BP, BossArt, bpart, p3, k3, cracks } from './rig';
import { moveClips } from './clips';

const S = { armor: 0x6a6a66, armor2: 0x4a4a48, dark: 0x262624, gun: 0x34363a, trim: 0x8a7a5a, medal: 0xe0b038 };
const VIS_HOT = 0xfff0c0, VIS = 0xff8a20, VIS_DIM = 0x8a3a08;

function damage(l: TPix, r: Rng, x0: number, y0: number, w: number, h: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(r() * w), y = y0 + Math.floor(r() * h);
    if (!l.has(x, y)) continue;
    if (r() < 0.5) { l.set(x, y, 0x0c0a0a); l.tint(x + 1, y + 1, (c) => lit(c, 0.4)); l.tint(x - 1, y, (c) => lit(c, -0.4)); }
    else for (let k = 0; k < 4; k++) l.tint(x + k, y + (k >> 1), (c) => mix(c, 0x1a1412, 0.5));
  }
}

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const ox = Math.round(b.ox), bob = Math.round(b.bob + b.crouch * 7), oy = bob + (stag ? 10 : Math.round(b.kneel * 10));
  const dr = makeRng(5150);
  const f = Math.floor(b.t * 8);
  bpart(p, (l) => {
    const leg = (hx: number, fx: number, lift: number): void => {
      const fy = 100 - lift, kx = (hx + fx) / 2 + (hx < 48 ? -4 : 4) * (1 + b.crouch), ky = 88 + bob * 0.6 - lift * 0.5;
      l.limb(hx, 78 + oy, kx, ky, 7, S.armor2);
      l.limb(kx, ky, fx, fy, 6, S.armor2);
      l.box(fx - 14, fy, 28, 11, S.dark);
      for (let x = fx - 13; x < fx + 14; x += 3) { const xx = x + ((f + (hx < 48 ? 0 : 1)) % 3); l.set(xx, fy + 1, lit(S.dark, 0.5)); l.set(xx, fy + 9, lit(S.dark, 0.3)); }
      l.box(fx - 12, fy + 3, 24, 5, S.gun);
    };
    if (stag) { leg(34, 20, 0); leg(62, 76, 0); } else { leg(36, 26, b.stepL); leg(60, 70, b.stepR); }
  });
  bpart(p, (l) => { l.box(26 + ox, 10 + oy, 7, 22, S.dark); l.box(63 + ox, 6 + oy, 7, 26, S.dark); l.rect(26 + ox, 10 + oy, 7, 1, 0x050505); l.rect(63 + ox, 6 + oy, 7, 1, 0x050505); });
  smoke(p, r, 29 + ox, 6 + oy - (f % 4) * 2, 4 + b.charge * 2, 3, 0x3a3836);
  smoke(p, r, 66 + ox, 2 + oy - (f % 4) * 2, 4 + b.charge * 2, 3, 0x3a3836);
  if (b.charge > 0.4) for (const x of [29, 66]) glowBlob(p, x + ox, (x < 50 ? 9 : 5) + oy, 2 + b.charge * 2.5, VIS_HOT, VIS, VIS_DIM);
  // hull
  bpart(p, (l) => {
    l.poly([16 + ox, 30 + oy, 80 + ox, 30 + oy, 76 + ox, 70 + oy, 64 + ox, 80 + oy, 32 + ox, 80 + oy, 20 + ox, 70 + oy], S.armor);
    for (let y = 31; y < 80; y++) for (let x = 60; x < 81; x++) if (l.has(x + ox, y + oy) && (x > 66 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.28));
    for (let x = 18; x < 79; x++) { if (l.has(x + ox, 52 + oy)) l.tint(x + ox, 52 + oy, (c) => lit(c, -0.5)); if (l.has(x + ox, 53 + oy)) l.tint(x + ox, 53 + oy, (c) => lit(c, 0.2)); }
    for (let y = 31; y < 79; y++) l.tint(48 + ox, y + oy, (c) => lit(c, -0.45));
    rivetRow(l, 20 + ox, 76 + ox, 34 + oy, 5, S.trim);
    rivetRow(l, 30 + ox, 66 + ox, 76 + oy, 5, S.trim);
    damage(l, dr, 18 + ox, 32 + oy, 60, 46, 40 + b.dmg * 20);
    for (let i = 0; i < 60; i++) l.tint(18 + ox + Math.floor(r() * 60), 31 + oy + Math.floor(r() * 10), (c) => mix(c, 0xb0aca4, 0.35));
    for (const [x, y] of [[56, 58], [57, 58], [58, 58], [58, 59], [57, 60], [56, 61], [56, 62], [57, 62], [58, 62], [61, 58], [61, 59], [61, 60], [61, 61], [61, 62]]) l.set(x + ox, y + oy, 0xc8c0a8);
  });
  if (b.dmg >= 1) cracks(p, r, 20 + ox, 34 + oy, 56, 40, b.dmg >= 2 ? 8 : 4, VIS_HOT, VIS);
  if (stag) { exposedCore(p, r, 48 + ox, 60 + oy, 8, f); sparks(p, r, 48 + ox, 60 + oy, 20, 14); smoke(p, r, 40 + ox, 44 + oy, 6, 4, 0x2a2826); }
  else {
    bpart(p, (l) => {
      l.box(26 + ox, 40 + oy, 15, 10, S.armor2);
      for (let x = 28; x < 39; x += 3) { l.rect(x + ox, 42 + oy, 2, 3, 0xa01818); l.rect(x + ox + 1, 42 + oy, 1, 3, S.medal); }
      l.ball(33.5 + ox, 47 + oy, 2.2, 2.2, S.medal);
    });
    p.set(33 + ox, 46 + oy, 0xffffff);
  }
  // head / cockpit — the hatch lifts (weak point) when it radios in
  const hx = 48 + ox + (stag ? 6 : 0), hy = 24 + oy + (stag ? 6 : 0);
  const hatch = Math.round(b.open * 7);
  if (b.open > 0.15) glowBlob(p, hx, hy - 2, 3 + b.open * 4, 0xffffff, VIS_HOT, VIS, 0.2, r);
  bpart(p, (l) => {
    l.box(hx - 12, hy - 8 - hatch, 25, 7, S.armor);
    l.box(hx - 12, hy - 2, 25, 9, S.armor);
    l.box(hx - 14, hy + 2, 29, 6, S.armor2);
    for (let x = -11; x <= 11; x++) l.set(hx + x, hy - 8 - hatch, lit(S.armor, 0.5));
    l.line(hx + 9, hy - 8 - hatch, hx + 12, hy - 18 - hatch, S.dark); l.line(hx + 12, hy - 18 - hatch, hx + 15, hy - 19 - hatch, S.dark);
    l.rect(hx - 9, hy - 3, 19, 4, 0x0a0606, F_FLAT);
    damage(l, dr, hx - 12, hy - 7, 24, 12, 8);
  });
  if (b.open > 0.15) { glowBlob(p, hx, hy - 4 - hatch * 0.4, 2 + b.open * 3, 0xffffff, VIS_HOT, VIS, 0.2, r); }
  {
    const vc = b.pain > 0.5 ? 0xffffff : stag && f % 2 === 0 ? VIS_DIM : b.charge > 0.5 || b.flash > 0.5 ? VIS_HOT : VIS;
    for (let x = -8; x <= 8; x++) { p.set(hx + x, hy - 2, vc, F_EMIT); p.set(hx + x, hy - 1, x % 3 === 0 ? VIS_DIM : mul(vc, 0.7), F_EMIT); }
    p.set(hx - 2 + Math.round(b.look * 5), hy - 2, 0xffffff, F_EMIT);
  }
  // left arm: gatling. 1 = hand to the head (radio) · -1 = barrels levelled at you
  const gh = p3(b.aL, [16, 58], [12, 74], [30, 26]);
  bpart(p, (l) => {
    if (stag) { l.limb(16 + ox, 40 + oy, 8 + ox, 72 + oy, 6, S.armor2); l.box(0, 92, 18, 14, S.gun); return; }
    const el = p3(b.aL, [6, 54], [8, 58], [10, 50]);
    l.limb(16 + ox, 40 + oy, el[0] + ox, el[1] + oy, 6, S.armor2);
    l.limb(el[0] + ox, el[1] + oy, gh[0] + ox, gh[1] + oy - 2, 5.5, S.armor2);
    if (b.aL > 0.5) { l.box(gh[0] - 5 + ox, gh[1] - 6 + oy, 10, 9, S.gun); l.rect(gh[0] + 2 + ox, gh[1] - 12 + oy, 1, 7, S.dark); return; }
    const lv = Math.max(0, -b.aL);
    l.box(gh[0] - 8 + ox, gh[1] - 2 + oy, 16, 14 - lv * 2, S.gun);
    if (lv < 0.5) for (let x = gh[0] - 6; x < gh[0] + 7; x += 4) l.rect(x + ox, gh[1] + 12 + oy, 2, 5, S.dark);
    else { // barrels end-on, spinning
      l.ellipse(gh[0] + ox, gh[1] + 5 + oy, 6, 6, S.dark);
      for (let k = 0; k < 6; k++) { const a = b.spin + (k / 6) * Math.PI * 2; l.ellipse(gh[0] + ox + Math.cos(a) * 3.6, gh[1] + 5 + oy + Math.sin(a) * 3.6, 1.3, 1.3, 0x0a0a0a, F_FLAT); }
    }
  });
  if (!stag && b.aL < -0.5 && b.flash > 0.3) { glowBlob(p, gh[0] + ox, gh[1] + 5 + oy, 4 + b.flash * 3, 0xffffff, VIS_HOT, VIS, 0.4, r); sparks(p, r, gh[0] + ox, gh[1] + 5 + oy, 10, 8); }
  if (!stag && b.aL > 0.5 && b.charge > 0.2 && f % 2) p.set(gh[0] + 2 + ox, gh[1] - 13 + oy, 0xff3030, F_EMIT);
  // right arm: siege cannon. -1 = levelled at you (end-on bore) · aux = recoil
  const lvl = Math.max(0, -b.aR);
  const cx = 82 + ox + Math.round(b.aux * 3), cy = stag ? 98 : Math.round(k3(b.aR, 56, 74, 50) + oy - b.aux * 3);
  bpart(p, (l) => {
    l.limb(78 + ox, 40 + oy, 86 + ox, 56 + oy - lvl * 6, 7, S.armor2);
    l.limb(86 + ox, 56 + oy - lvl * 6, cx, cy - 8 * (1 - lvl), 11, S.gun);
    l.ball(cx, cy, 12 + lvl, 10 + lvl * 2, lit(S.gun, 0.2));
    l.ball(cx, cy, 9 + lvl, 7.5 + lvl * 2, S.gun);
    damage(l, dr, cx - 10, cy - 24, 20, 20, 10);
  });
  p.ellipse(cx, cy, 6 + lvl, 5 + lvl * 1.5, 0x050404, F_FLAT);
  if (b.charge > 0.3 && !stag) { glowBlob(p, cx, cy, 2 + b.charge * 4, b.charge > 0.8 ? 0xffffff : VIS_HOT, VIS, VIS_DIM, 0.3, r); sparks(p, r, cx, cy, 10, Math.round(b.charge * 6)); }
  if (b.flash > 0.3 && b.aL >= -0.5 && !stag) { glowBlob(p, cx, cy, 6 + b.flash * 9, 0xffffff, VIS_HOT, VIS, 0.3, r); sparks(p, r, cx, cy, 16, 14); }
  if (b.aux > 0.3) smoke(p, r, cx - 4, cy - 10, 5, 4, 0x4a4644);
  // pauldrons with rank chevrons
  bpart(p, (l) => {
    l.ball(16 + ox, 36 + oy, 12, 9, S.armor); l.ball(80 + ox, 36 + oy, 12, 9, S.armor);
    for (let x = 5; x < 28; x++) l.set(x + ox, 40 + oy, S.trim);
    for (let x = 69; x < 92; x++) l.set(x + ox, 40 + oy, S.trim);
    damage(l, dr, 4 + ox, 28 + oy, 88, 14, 12);
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { l.set(10 + i + ox, 34 + k * 2 - i * 0.5 + oy, S.medal); l.set(17 - i + ox, 34 + k * 2 - i * 0.5 + oy, S.medal); }
  });
  for (let i = 0; i < 5 + b.dmg * 3; i++) p.set(20 + r() * 56, 30 + r() * 50 + oy, i % 2 ? VIS : VIS_HOT, F_EMIT);
  if (b.pain > 0.5) { sparks(p, r, 44 + ox, 50 + oy, 18, 18); glowBlob(p, 40 + ox, 48 + oy, 3, 0xffffff, VIS_HOT, VIS); }
  if (b.glitch > 0.3) sparks(p, r, 48 + ox, 50 + oy, 30, Math.round(b.glitch * 14));
}

function dead(p: TPix, r: Rng): void {
  for (let y = 102; y < 112; y++) for (let x = -4; x < 100; x++) if (r() < 0.92 - Math.abs(x - 48) / 58) p.set(x, y, y > 107 ? 0x161412 : 0x24201c, F_FLAT);
  bpart(p, (l) => { l.box(4, 98, 28, 11, S.dark); l.box(64, 99, 28, 11, S.dark); });
  bpart(p, (l) => { l.poly([12, 108, 18, 84, 40, 78, 66, 80, 80, 92, 82, 108], S.armor); rivetRow(l, 20, 76, 88, 6, S.trim); damage(l, makeRng(3), 14, 80, 66, 26, 40); });
  bpart(p, (l) => { l.limb(60, 96, 92, 102, 8, S.gun); l.ball(90, 102, 6, 8, lit(S.gun, 0.2)); });
  p.ellipse(91, 102, 3, 5, 0x050404, F_FLAT);
  bpart(p, (l) => { l.box(30, 74, 22, 12, S.armor); l.rect(33, 78, 16, 3, 0x0a0606, F_FLAT); });
  p.set(36, 79, VIS_DIM, F_EMIT);
  bpart(p, (l) => { l.box(50, 92, 12, 8, S.armor2); l.ball(56, 97, 2, 2, S.medal); l.box(-8, 104, 10, 7, S.gun); });
  smoke(p, r, 44, 70, 8, 6, 0x3a3836); smoke(p, r, 50, 60, 5, 3, 0x2e2c2a);
  for (let i = 0; i < 8; i++) p.set(18 + r() * 60, 84 + r() * 20, i % 2 ? VIS : VIS_HOT, F_EMIT);
}

export function generalArt(): BossArt {
  return {
    draw, dead, worldH: 7.0, glow: [0xff8a20, 0xfff0c0],
    clips: {
      ...moveClips('artillery', { W: { aL: 1, open: 1, charge: 0.3 }, A: { aL: 1, open: 1, look: 0 }, act: (k) => ({ look: Math.sin(k * 12), charge: Math.sin(k * Math.PI * 6) > 0 ? 0.6 : 0.2 }), n: [6, 6, 6] }),
      ...moveClips('gatling', { W: { aL: -1, charge: 0.3 }, A: { aL: -1, flash: 1 }, act: (k) => ({ spin: k * Math.PI * 4, flash: k * 8 % 1 > 0.5 ? 1 : 0.4 }), loop: true, xa: { jit: 0.7 }, n: [6, 4, 5] }),
      ...moveClips('cannon', { W: { aR: -1, charge: 1, crouch: 0.3 }, A: { aR: -1, flash: 1, aux: 1, crouch: 0.4 }, L: { aR: -0.8, aux: 0.6, crouch: 0.3 }, xa: { lean: -5 }, xl: { lean: -3 }, n: [7, 3, 6], shake: 0.6 }),
      ...moveClips('treads', { W: { crouch: 0.6, aL: 0.3, aR: -0.4, charge: 1 }, A: { crouch: 0.3, charge: 1 }, act: (k) => { const s = Math.sin(k * Math.PI * 6); return { stepL: Math.max(0, s) * 6, stepR: Math.max(0, -s) * 6, bob: Math.abs(s) * 2 }; }, loop: true, L: { kneel: 0.4, open: 1, pain: 0.6 }, xw: { lean: 6, sy: 0.94 }, xa: { lean: 9 }, xl: { lean: -4, sy: 0.93 }, n: [6, 4, 7], shake: 1 }),
      ...moveClips('mines', { W: { aR: 0.5, crouch: 0.4 }, A: { aR: 1 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 8) > 0.5 ? 0.8 : 0, aux: Math.max(0, Math.sin(k * Math.PI * 8)) }), n: [5, 6, 5] }),
      ...moveClips('barrage', { W: { aR: -0.6, aL: -0.6, charge: 0.6 }, A: { aR: -0.6, aL: -0.6 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 12) > 0.4 ? 1 : 0, aux: Math.max(0, Math.sin(k * Math.PI * 12)) * 0.6 }), n: [5, 6, 5] }),
      ...moveClips('rally', { W: { aL: 1, charge: 0.6 }, A: { aL: 1, aR: 1, flash: 0.4, charge: 1 }, xa: { sy: 1.05 }, n: [6, 4, 5] }),
      ...moveClips('carpet', { W: { aL: 1, open: 1, charge: 1 }, A: { aL: 1, open: 1, charge: 1 }, act: (k) => ({ look: Math.sin(k * 20), aR: Math.sin(k * 10) * 0.3 }), n: [6, 6, 5] }),
    },
  };
}
