// THE FIRST — a flesh-metal heart on four mechanical legs, caged in ribs, covered in eyes.
import { Rng, glowBlob, sparks, lit, F_EMIT, F_FLAT } from '../core';
import { exposedCore, EYE, EYE_HOT, EYE_DIM } from '../enemies';
import { TPix, BP, BossArt, bpart, p3, cracks } from './rig';
import { moveClips } from './clips';


const S = { a: 0x9a2a30, b: 0x5a1018, c: 0x5e5a62, d: 0x2e2a30, trim: 0xc8a060 };

function vein(l: TPix, r: Rng, x: number, y: number, n: number, col: number, flag = 0): void {
  let dx = r() - 0.5, dy = r() - 0.5;
  for (let i = 0; i < n; i++) {
    dx += (r() - 0.5) * 0.8; dy += (r() - 0.5) * 0.8;
    const m = Math.sqrt(dx * dx + dy * dy) || 1;
    x += dx / m; y += dy / m;
    if (l.has(x, y)) l.set(x, y, col, flag);
  }
}

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const ox = Math.round(b.ox), oy = Math.round(b.bob + b.crouch * 9 + (stag ? 10 : b.kneel * 12));
  const puff = b.aux * 6 + Math.sin(b.t * Math.PI * 2) * 0.8 - b.pain;
  const vr = (seed: number): Rng => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  // mechanical legs
  bpart(p, (l) => {
    const legs = [[30, 70, 10, 76, 6, 110], [40, 76, 26, 92, 22, 110], [66, 70, 86, 76, 90, 110], [56, 76, 70, 92, 74, 110]];
    legs.forEach((L, i) => {
      const lift = i % 2 === 0 ? b.stepL : b.stepR;
      const spread = b.crouch * 6 * (L[0] < 48 ? -1 : 1);
      const ky = stag ? L[3] + 10 : L[3] - lift * 0.7 + b.crouch * 4, fy = L[5] - lift;
      l.limb(L[0] + ox, L[1] + oy, L[2] + ox + spread, ky, 3.4, S.c);
      l.limb(L[2] + ox + spread, ky, L[4] + spread * 0.5, fy, 2.6, S.c);
      l.box(L[4] + spread * 0.5 - 3, fy - 2, 7, 3, S.d);
      l.set(L[2] + ox + spread, ky, S.trim);
    });
  });
  // aortas: rest up, raised = rearing, -1 = whipped out to the sides
  const tl = p3(b.aL, [0, 34], [34, 4], [28, -8]), tr = p3(b.aR, [96, 32], [64, 2], [70, -10]);
  bpart(p, (l) => {
    const ml = [(40 + tl[0]) / 2 - (b.aL < 0 ? 4 : 0), (30 + tl[1]) / 2 - (b.aL < 0 ? 6 : 0)], mr = [(58 + tr[0]) / 2 + (b.aR < 0 ? 4 : 0), (30 + tr[1]) / 2 - (b.aR < 0 ? 6 : 0)];
    l.limb(40 + ox, 30 + oy, ml[0] + ox, ml[1] + oy, 4.6, S.b); l.limb(ml[0] + ox, ml[1] + oy, tl[0] + ox, tl[1] + oy, 4.2, S.b);
    l.limb(58 + ox, 30 + oy, mr[0] + ox, mr[1] + oy, 4, S.b); l.limb(mr[0] + ox, mr[1] + oy, tr[0] + ox, tr[1] + oy, 3.6, S.b);
    l.limb(48 + ox, 26 + oy, 49 + ox, 8 + oy, 3, S.c);
    l.ellipse(tl[0] + ox, tl[1] + oy, 3.4, 1.6, 0x1a0406, F_FLAT);
    l.ellipse(tr[0] + ox, tr[1] + oy, 3, 1.4, 0x1a0406, F_FLAT);
  });
  if (b.flash > 0.3 && (b.aL < -0.3 || b.aR < -0.3)) for (const t of [tl, tr]) glowBlob(p, t[0] + ox, t[1] + oy, 3 + b.flash * 2, 0xffd0c0, 0xff4030, 0xc01010, 0.3, r);
  // heart mass
  bpart(p, (l) => {
    const R = 28 + puff;
    l.ball(37 + ox, 38 + oy, 15 + puff * 0.5, 14 + puff * 0.5, S.a);
    l.ball(60 + ox, 38 + oy, 15 + puff * 0.5, 14 + puff * 0.5, S.a);
    l.ball(48 + ox, 56 + oy, R * 0.95, R * 0.9, S.a, 0, -0.6, -0.5);
    l.poly([26 + ox, 64 + oy, 70 + ox, 64 + oy, 50 + ox, 92 + oy + puff, 46 + ox, 92 + oy + puff], S.a);
    const v = vr(4242);
    for (let i = 0; i < 14; i++) vein(l, v, 22 + ox + v() * 52, 30 + oy + v() * 50, 22, S.b);
    for (let y = 26; y < 94; y++) for (let x = 18; x < 80; x++) if (l.has(x + ox, y + oy) && ((x * 3 + y) % 7 === 0)) l.tint(x + ox, y + oy, (c) => lit(c, -0.2));
  });
  if (b.charge > 0.2) { const v = vr(77 + Math.floor(b.t * 4)); for (let i = 0; i < 4 + b.charge * 8; i++) vein(p, v, 30 + ox + v() * 36, 40 + oy + v() * 30, 18, b.charge > 0.7 ? 0xff8a50 : 0xff3030, F_EMIT); }
  if (b.dmg >= 1) cracks(p, r, 24 + ox, 34 + oy, 48, 50, b.dmg >= 2 ? 9 : 4, 0xffd0a0, 0xff4020);
  // rib cage bands
  bpart(p, (l) => {
    for (let k = 0; k < 4; k++) {
      const y = 40 + k * 11 + oy;
      const half = 27 - Math.abs(k - 1.2) * 4 + puff;
      if (stag && k === 1) { l.limb(48 - half + ox, y, 38 + ox, y - 6, 2, S.c); l.limb(48 + half + ox, y, 60 + ox, y + 5, 2, S.c); continue; }
      if (b.dmg >= 2 && k === 2) { l.limb(48 - half + ox, y, 36 + ox, y - 3, 2, S.c); continue; }
      for (let t = -1; t <= 1.001; t += 0.05) l.rect(48 + ox + t * half, y - Math.cos(t * 1.3) * 5, 2, 2.5, S.c);
      l.set(48 - half + ox, y, S.trim); l.set(48 + half + ox, y, S.trim);
    }
    l.box(45 + ox, 30 + oy, 6, 56, S.d);
  });
  // the core slit — the weak point
  if (!stag) {
    const open = 1.5 + b.open * 4 + b.aux * 1.5;
    p.ellipse(48 + ox, 58 + oy, open + 1, 11, 0x1a0204, F_FLAT);
    glowBlob(p, 48 + ox, 58 + oy, open, b.open > 0.5 ? 0xffffff : 0xfff0e0, 0xff4030, 0xc01010);
    for (let y = -9; y <= 9; y++) if (Math.abs(y) < 10 - open) p.set(48 + ox, 58 + oy + y, y % 3 === 0 ? 0xffd0c0 : 0xff3030, F_EMIT);
    if (b.flash > 0.3 && b.aL >= -0.3) glowBlob(p, 48 + ox, 58 + oy, 6 + b.flash * 7, 0xffffff, 0xffb0a0, 0xff3020, 0.25, r);
  } else {
    exposedCore(p, r, 48 + ox, 58 + oy, 9, Math.floor(b.t * 4));
    for (let i = 0; i < 12; i++) p.set(34 + ox + r() * 28, 60 + oy + r() * 26, r() < 0.5 ? 0x8c0f12 : 0x3a0508);
  }
  // scattered eyes (blink on their own clock)
  const eyes = [[30, 34], [65, 32], [24, 54], [72, 52], [36, 76], [60, 78], [42, 30], [55, 44]];
  eyes.forEach(([x, y], i) => {
    const ex = x + ox + (puff > 1 ? (x < 48 ? -1 : 1) : 0), ey = y + oy;
    p.ellipse(ex, ey, 2, 1.6, 0x2a0408, F_FLAT);
    const blink = Math.floor(b.t * 8 + i * 3) % 7 === 0;
    if (blink && !b.charge) { p.set(ex - 1, ey, 0x5a1018); p.set(ex, ey, 0x5a1018); return; }
    const c = stag ? (i % 2 ? EYE_DIM : EYE) : b.pain > 0.5 ? 0xffffff : EYE;
    p.set(ex - 1, ey, c, F_EMIT); p.set(ex, ey, b.charge > 0.5 ? 0xffffff : EYE_HOT, F_EMIT);
  });
  if (b.pain > 0.5) {
    sparks(p, r, 48, 50, 16, 10);
    for (let i = 0; i < 16; i++) { const t = r() * 6.28, d = 20 + r() * 12; p.set(48 + Math.cos(t) * d, 52 + Math.sin(t) * d, i % 2 ? 0x8c0f12 : 0xc0201c); }
  }
  if (b.glitch > 0.3) sparks(p, r, 48 + ox, 56 + oy, 30, Math.round(b.glitch * 14));
}

function dead(p: TPix, r: Rng): void {
  for (let y = 100; y < 112; y++) for (let x = -6; x < 102; x++) if (r() < 0.95 - Math.abs(x - 48) / 54 - (111 - y) * 0.03) p.set(x, y, r() < 0.3 ? 0x8c0f12 : 0x3a0508, F_FLAT);
  bpart(p, (l) => { l.limb(14, 104, 4, 86, 2.6, S.c); l.limb(4, 86, 10, 74, 2.2, S.c); l.limb(84, 104, 92, 92, 2.6, S.c); });
  bpart(p, (l) => {
    l.ball(48, 98, 32, 13, S.a); l.ball(30, 90, 12, 9, S.a); l.ball(66, 92, 12, 8, S.a);
    for (let i = 0; i < 10; i++) vein(l, r, 22 + r() * 52, 88 + r() * 16, 18, S.b);
  });
  bpart(p, (l) => { for (let k = 0; k < 3; k++) l.limb(26 + k * 6, 86 - k * 2, 70 - k * 6, 88 + k * 3, 1.4, S.c); });
  p.ellipse(48, 96, 3, 5, 0x1a0204, F_FLAT); p.set(48, 96, 0x6a1010);
  for (const [x, y] of [[30, 90], [64, 92], [40, 102]]) { p.set(x, y, 0x3a0808); p.set(x + 1, y, 0x2a0606); }
}

export function firstArt(): BossArt {
  const beat = (k: number, n: number): number => Math.max(0, Math.sin(k * Math.PI * n)) ** 2;
  return {
    draw, dead, worldH: 6.5, glow: [0xff2020, 0xff4030],
    clips: {
      idle: { n: 8, pose: (i) => { const s = i === 1 || i === 3 ? 1 : 0; return { aux: s * 0.5, t: i / 8, bob: s ? 0 : 1, open: s * 0.2 }; }, xf: (i) => ({ sy: i === 1 || i === 3 ? 1.025 : 1, sx: i === 1 || i === 3 ? 1.02 : 1 }) },
      ...moveClips('heartbeat', { W: { aux: -0.4, crouch: 0.3, charge: 0.6, open: 0.5 }, A: { aux: 1, open: 1, flash: 0.6, charge: 1 }, act: (k) => ({ aux: beat(k, 2) * 1.4 - 0.2, flash: beat(k, 2) }), xw: { sy: 0.94, sx: 1.03 }, n: [6, 8, 5], shake: 1 }),
      ...moveClips('lash', { W: { aL: 1, aR: 1, crouch: 0.2 }, A: { aL: -1, aR: -1, flash: 0.6 }, act: (k) => ({ aL: -1 + Math.sin(k * 9) * 0.2, aR: -1 + Math.cos(k * 9) * 0.2 }), xa: { lean: 3 }, n: [6, 6, 5] }),
      ...moveClips('clot', { W: { aux: 0.6, charge: 0.6, aL: 0.6, aR: 0.6 }, A: { aL: 0.9, aR: 0.9 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 12) > 0.5 ? 1 : 0, aux: 0.3 + beat(k, 6) * 0.6 }), n: [5, 6, 5] }),
      ...moveClips('scuttle', { W: { crouch: 1, charge: 0.5 }, A: { crouch: 0.3 }, act: (k) => { const h = (k * 3) % 1; return { crouch: h > 0.8 ? 1 : 0.2, stepL: Math.sin(h * Math.PI) * 6, stepR: Math.sin(h * Math.PI) * 6 }; }, L: { crouch: 1, open: 1 }, xw: { sy: 0.9 }, xa: { sy: 1.05 }, xl: { sy: 0.88, sx: 1.06 }, n: [5, 9, 6] }),
      ...moveClips('mimic', { W: { glitch: 0.8, charge: 1, crouch: 0.4 }, A: { glitch: 1, flash: 1, aux: 0.8 }, n: [7, 4, 5], shake: 1 }),
      ...moveClips('veins', { W: { charge: 1, crouch: 0.6, aux: -0.3 }, A: { charge: 1, crouch: 0, aux: 1, flash: 0.7, aL: 1, aR: 1 }, xw: { sy: 0.92 }, xa: { sy: 1.06 }, n: [6, 4, 6], shake: 1 }),
      ...moveClips('systole', { W: { charge: 1, open: 0.7 }, A: { charge: 1, open: 0.8 }, act: (k) => ({ aux: beat(k, 3) * 1.3, flash: beat(k, 3) * 0.8, aL: Math.sin(k * 20) * 0.5, aR: Math.cos(k * 20) * 0.5 }), loop: true, n: [6, 8, 5] }),
    },
  };
}
