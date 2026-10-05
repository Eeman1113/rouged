// THE CURATOR — floating server monolith, one great eye, cable arms, orbiting data shards.
import { Rng, glowBlob, sparks, glint, mix, lit, F_EMIT } from '../core';
import { exposedCore, EYE, EYE_HOT } from '../enemies';
import { TPix, BP, BossArt, bpart, p3, cracks } from './rig';
import { moveClips } from './clips';

const ORB_HOT = 0xffe0ff, ORB = 0xe040ff;
const S = { a: 0x4a5a6e, b: 0x5e6e84, c: 0x34404e, d: 0x1c2430, trim: 0x9ac8ff };

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const oy = Math.round(b.bob + (stag ? 8 : b.kneel * 10) + b.crouch * 4), ox = Math.round(b.ox);
  const sw = b.sw * 2;
  const red = b.charge > 0.5;
  const LED_A = red ? 0xff3030 : 0x6ac8ff, LED_B = red ? 0xffa0a0 : 0xc8f4ff;
  const ph = b.t * Math.PI * 2;

  // cable tendrils
  bpart(p, (l) => {
    for (let i = 0; i < 7; i++) {
      const x0 = 28 + i * 6.5 + ox;
      const w = Math.sin(i * 1.7 + ph) * 3 + sw;
      const len = stag ? 6 : 14 + ((i * 5) % 7) + b.charge * 3;
      l.limb(x0, 88 + oy, x0 + w * 0.5, 88 + oy + len * 0.5, 1.6, S.d);
      l.limb(x0 + w * 0.5, 88 + oy + len * 0.5, x0 + w, Math.min(110, 88 + oy + len), 1.3, S.d);
    }
  }, { bevel: false });
  if (!stag) for (let x = 26; x < 72; x++) if ((x + Math.floor(b.t * 3)) % 3 !== 0) p.set(x + ox, 109, mix(red ? 0xff3a2a : 0x2a6aff, 0x0a1a40, Math.abs(x - 48) / 26), F_EMIT);
  // cable arms
  const lh = p3(b.aL, [32, 54], [6 - sw, 72], [6, 14]), rh = p3(b.aR, [64, 54], [90 + sw, 72], [90, 14]);
  bpart(p, (l) => {
    const le = p3(b.aL, [14, 50], [10, 44], [8, 34]), re = p3(b.aR, [82, 50], [86, 44], [88, 34]);
    l.limb(24 + ox, 30 + oy, le[0] + ox, le[1] + oy, 3.5, S.d); l.limb(le[0] + ox, le[1] + oy, lh[0] + ox, lh[1] + oy, 3, S.d);
    l.limb(72 + ox, 30 + oy, re[0] + ox, re[1] + oy, 3.5, S.d); l.limb(re[0] + ox, re[1] + oy, rh[0] + ox, rh[1] + oy, 3, S.d);
    for (const [h, v] of [[lh, b.aL], [rh, b.aR]] as [[number, number], number][]) {
      l.ball(h[0] + ox, h[1] + oy, 4.5, 4.5, S.b);
      const dir = v > 0.3 ? -1 : 1;
      for (const d of [-3, 0, 3]) l.line(h[0] + ox + d, h[1] + oy + 3 * dir, h[0] + ox + d * (v < -0.3 ? 2.2 : 1.6), h[1] + oy + 9 * dir, S.trim);
    }
  });
  for (const [h, v] of [[lh, b.aL], [rh, b.aR]] as [[number, number], number][]) if (Math.abs(v) > 0.5 && (b.flash > 0.2 || b.charge > 0.3)) glowBlob(p, h[0] + ox, h[1] + oy + (v > 0 ? -6 : 0), 2.5 + b.flash * 3, ORB_HOT, ORB, 0x8a1aa8, 0.3, r);
  // orbiting shards (spin) — rise when aux (shard rain)
  bpart(p, (l) => {
    for (let k = 0; k < 4; k++) {
      const a = b.spin + k * (Math.PI / 2) + ph * 0.25;
      const x = 48 + Math.cos(a) * 44 + ox, y = 22 + Math.sin(a) * 6 + oy - b.aux * (6 + k * 3);
      if (Math.sin(a) < -0.2 && b.aux < 0.3) continue; // behind the monolith
      l.box(x - 4, y - 6, 8, 12 - (k % 2) * 2, S.b);
    }
  });
  for (let k = 0; k < 4; k++) {
    const a = b.spin + k * (Math.PI / 2) + ph * 0.25;
    if (Math.sin(a) < -0.2 && b.aux < 0.3) continue;
    p.set(48 + Math.cos(a) * 44 + ox, 22 + Math.sin(a) * 6 + oy - b.aux * (6 + k * 3), LED_A, F_EMIT);
  }
  // monolith
  bpart(p, (l) => {
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
  if (b.dmg >= 1) cracks(p, r, 24 + ox, 10 + oy, 50, 78, b.dmg >= 2 ? 10 : 5, 0xc8f4ff, 0x3a8aff);
  const lr = (seed: number): number => ((seed * 2654435761) >>> 0) / 4294967296;
  const fl = Math.floor(b.t * 8);
  for (let y = 17; y < 88; y += 7)
    for (let x = 26; x < 72; x += 3) {
      if (stag && lr(x * 31 + y) > 0.25) continue;
      const v = lr(x * 97 + y * 13 + fl * 7);
      if (Math.abs(x - 48) < 11 && Math.abs(y - 40) < 11) continue;
      if (v < 0.35 + b.charge * 0.2) p.set(x + ox, y + oy + 2, v < 0.08 ? LED_B : LED_A, F_EMIT);
      else if (v < 0.45) p.set(x + ox, y + oy + 2, red ? 0xff6a10 : 0x3aff8a, F_EMIT);
    }
  if (stag) {
    exposedCore(p, r, 48 + ox, 56 + oy, 8, Math.floor(b.t * 4));
    sparks(p, r, 48 + ox, 40 + oy, 24, 14);
  } else {
    // the eye. open = the weak point: lids part, iris blazes
    const cx = 48 + ox, cy = 40 + oy;
    p.ellipse(cx, cy, 10, 10, 0x0c1018, 0);
    for (let ang = 0; ang < 64; ang++) { const t = (ang / 64) * Math.PI * 2; p.set(cx + Math.cos(t) * 8.4, cy + Math.sin(t) * 8.4, red ? 0xff6060 : 0x4aa0ff, F_EMIT); }
    const ir = 4.5 + b.open * 2.5 + b.charge * 0.5;
    const ix = cx + b.look * 2.5;
    glowBlob(p, ix, cy, ir, b.pain > 0.5 ? 0xffffff : EYE_HOT, EYE, 0x8a0808);
    p.ellipse(ix, cy, 1.6 - b.open * 0.6, ir * 0.7, 0x200000, 0);
    p.set(ix - 2, cy - 3, 0xffffff, F_EMIT);
    if (b.open > 0.5) for (let ang = 0; ang < 32; ang++) { const t = (ang / 32) * Math.PI * 2 + b.t * 6; if (ang % 4 < 2) p.set(cx + Math.cos(t) * 11, cy + Math.sin(t) * 11, 0xffd0c0, F_EMIT); }
    if (b.flash > 0.2) glowBlob(p, cx, cy, 6 + b.flash * 8, 0xffffff, ORB_HOT, ORB, 0.25, r);
    if (b.charge > 0.6) glint(p, ix, cy, 0xffffff, 0xffa0a0, 2);
  }
  if (b.pain > 0.5 || b.glitch > 0.3) {
    for (let k = 0; k < 3 + Math.round(b.glitch * 4); k++) {
      const y = 12 + Math.floor(r() * 76) + oy, d = r() < 0.5 ? -3 : 3;
      const row: number[] = [], fls: number[] = [];
      for (let x = -10; x < 106; x++) { row.push(p.get(x, y)); fls.push(p.isEmit(x, y) ? F_EMIT : 0); }
      for (let x = -10; x < 106; x++) { const j = Math.max(0, Math.min(row.length - 1, x + 10 - d)); const c = row[j]; if (c >= 0) p.set(x, y, c, fls[j]); else p.clear(x, y); }
    }
    sparks(p, r, 48 + ox, 40 + oy, 18, 12);
  }
}

function dead(p: TPix, r: Rng): void {
  bpart(p, (l) => { for (let i = 0; i < 6; i++) l.limb(14 + i * 14, 98, 18 + i * 13, 110, 1.4, S.d); }, { bevel: false });
  bpart(p, (l) => {
    l.poly([4, 92, 60, 86, 64, 110, 2, 111], S.a);
    for (let x = 10; x < 60; x += 7) for (let y = 88; y < 111; y++) if (l.has(x, y)) l.tint(x, y, (c) => lit(c, -0.5));
  });
  bpart(p, (l) => { l.poly([62, 90, 92, 94, 94, 111, 66, 111], S.a); l.box(70, 84, 9, 12, S.b); l.box(-8, 102, 8, 9, S.b); l.box(100, 100, 9, 11, S.b); });
  for (let i = 0; i < 6; i++) p.set(8 + Math.floor(r() * 50), 92 + Math.floor(r() * 16), 0x2a5a8a, F_EMIT);
  p.ellipse(34, 100, 5, 5, 0x0c1018, 0); p.set(34, 100, 0x3a0808);
  sparks(p, r, 62, 96, 4, 3);
}

export function curatorArt(): BossArt {
  return {
    draw, dead, worldH: 6.5, glow: [0xff2020, 0x6ac8ff],
    clips: {
      ...moveClips('catalogue', { W: { aL: 1, aR: 1, charge: 0.3 }, A: { aL: -1, aR: -1 }, act: (k) => ({ flash: Math.sin(k * Math.PI * 8) > 0.2 ? 0.8 : 0, aL: -1 + Math.sin(k * 25) * 0.15 }), n: [6, 6, 5] }),
      ...moveClips('gaze', { W: { open: 1, charge: 1, aL: 0.6, aR: 0.6, crouch: 0.3 }, A: { open: 1, charge: 1, flash: 0.8, aL: 0.6, aR: 0.6 }, act: (k) => ({ look: Math.sin(k * Math.PI * 2) * 0.8, flash: 0.6 + 0.4 * Math.sin(k * 30) }), loop: true, xa: { jit: 0.6 }, n: [7, 4, 6], shake: 0.5 }),
      ...moveClips('shelve', { W: { glitch: 1, crouch: 0.4, aL: 0.5, aR: 0.5 }, A: { glitch: 0.8, flash: 0.5 }, xw: { sy: 0.9, sx: 1.1 }, xa: { sy: 1.1, sx: 0.9 }, n: [5, 4, 5] }),
      ...moveClips('snipe', { W: { charge: 1, open: 0.6, aL: 0.3, aR: 0.3, look: 0 }, A: { flash: 1, charge: 1 }, xa: { lean: -3 }, n: [7, 3, 5], shake: 0.5 }),
      ...moveClips('shards', { W: { aL: 1, aR: 1, aux: 0.4, charge: 0.4 }, A: { aL: 1, aR: 1, aux: 1, spin: 3 }, act: (k) => ({ spin: k * 6, aux: 0.6 + 0.4 * Math.sin(k * 10) }), n: [6, 6, 5] }),
      ...moveClips('stacks', { W: { aL: 1, aR: 1, charge: 1, crouch: 0.2 }, A: { aL: -1, aR: -1, charge: 1, flash: 0.6 }, xw: { sy: 1.05 }, xa: { sy: 0.94 }, n: [6, 5, 6] }),
      ...moveClips('purge', { W: { charge: 1, aL: 0.8, aR: 0.8 }, A: { charge: 1, flash: 0.7, aL: 0.5, aR: 0.5 }, act: (k) => ({ spin: k * 12, aL: Math.sin(k * 12) * 0.6, aR: -Math.sin(k * 12) * 0.6 }), loop: true, xa: { jit: 0.8 }, n: [6, 6, 5] }),
    },
  };
}
