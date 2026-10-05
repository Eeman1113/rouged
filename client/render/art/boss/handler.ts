// THE HANDLER — a monolith of CRT monitors around one great eye. It looks sad when it attacks.
import { Rng, glowBlob, sparks, mix, lit, F_EMIT, F_FLAT, makeRng } from '../core';
import { exposedCore, EYE } from '../enemies';
import { TPix, BP, BossArt, bpart } from './rig';
import { moveClips } from './clips';

const W = 96;
const TERM_HOT = 0xd0ffd8, TERM = 0x3aff6a, TERM_DIM = 0x1a8a3a, TERM_BG = 0x041408;
const S = { case_: 0xa8a290, case2: 0x7a7466, dark: 0x22221e, cable: 0x1e1e22, trim: 0x5a6a5a };
type Mode = 'text' | 'eye' | 'grin' | 'frown' | 'static' | 'dead' | 'brow' | 'sad' | 'red';

function crt(p: TPix, x0: number, y0: number, w: number, h: number, mode: Mode, seed: number, f: number, look = 0, open = 0): void {
  bpart(p, (l) => {
    l.box(x0, y0, w, h, S.case_);
    for (let y = y0 + 1; y < y0 + h - 1; y++) l.set(x0 + w - 2, y, lit(S.case2, -0.2));
    l.rect(x0 + 2, y0 + h - 3, 3, 1, S.case2);
  });
  const sx = x0 + 2, sy = y0 + 2, sw = w - 4, sh = h - 5;
  const sr = makeRng(seed * 31 + f * 7);
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const xx = sx + x, yy = sy + y;
    if ((x === 0 || x === sw - 1) && (y === 0 || y === sh - 1)) { p.set(xx, yy, S.dark, F_FLAT); continue; }
    let c = y & 1 ? TERM_BG : 0x061c0c, fl = F_EMIT;
    if (mode === 'static') { const v = sr(); c = v < 0.3 ? 0xffffff : v < 0.45 ? 0xff3030 : v < 0.6 ? 0x8a1010 : v < 0.75 ? 0xd0d0d0 : 0x202020; }
    else if (mode === 'red') c = y & 1 ? 0x2a0404 : 0x3a0606;
    else if (mode === 'dead') { c = (x + y) % 9 === 0 ? 0x2a2e2a : 0x0e100e; fl = F_FLAT; }
    p.set(xx, yy, c, fl);
  }
  const cx = sx + sw / 2, cy = sy + sh / 2;
  if (mode === 'text') {
    for (let row = 0; row < Math.floor(sh / 3); row++) {
      let x = 1; const lr = makeRng(seed * 13 + row + f * 5);
      while (x < sw - 2) { const len = 1 + Math.floor(lr() * 4); for (let i = 0; i < len && x + i < sw - 1; i++) if (lr() < 0.8) p.set(sx + x + i, sy + 1 + row * 3, lr() < 0.2 ? TERM_DIM : TERM, F_EMIT); x += len + 1; if (lr() < 0.15) break; }
    }
  } else if (mode === 'brow' || mode === 'sad') {
    // sad: brows tilt up toward the middle
    const tilt = mode === 'sad' ? (seed % 2 ? -1 : 1) * 3 : (seed % 2 ? 1 : -1) * 2;
    for (let x = 1; x < sw - 1; x++) { const y = Math.round(sh * 0.55 - Math.sin((x / sw) * Math.PI) * sh * (mode === 'sad' ? 0.1 : 0.25) + (x / sw - 0.5) * tilt * 2); p.set(sx + x, sy + y, TERM, F_EMIT); p.set(sx + x, sy + y + 1, TERM_DIM, F_EMIT); }
  } else if (mode === 'grin' || mode === 'frown') {
    const s = mode === 'frown' ? -1 : 1;
    for (let x = 1; x < sw - 1; x++) { const t = (x / sw) * 2 - 1; const y = Math.round(sh * 0.5 + s * (1 - t * t) * sh * 0.3 - s * sh * 0.1); p.set(sx + x, sy + y, TERM, F_EMIT); if (x % 3 === 0 && mode === 'grin') for (let k = 1; k < 3; k++) p.set(sx + x, sy + y - k, TERM_DIM, F_EMIT); }
  } else if (mode === 'eye' || mode === 'red') {
    const red = mode === 'red';
    const rx = sw * 0.42, ry = sh * (0.3 + open * 0.1);
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x / rx) ** 2 + (y / (ry * (1 - (x / rx) ** 2 * 0.3))) ** 2;
      if (d > 1) continue;
      p.set(cx + x, cy + y, d > 0.8 ? (red ? 0xff3030 : TERM) : red ? 0x5a0808 : 0x0c3a1a, F_EMIT);
    }
    const ix = cx + look * rx * 0.35;
    glowBlob(p, ix, cy, ry * 0.85, red ? 0xffd0c0 : open > 0.5 ? 0xffffff : TERM_HOT, red ? EYE : TERM, red ? 0x8a0808 : TERM_DIM);
    p.ellipse(ix, cy, ry * (0.32 - open * 0.12), ry * 0.5, 0x020602, F_FLAT);
    p.set(ix - 2, cy - 2, 0xffffff, F_EMIT);
  }
  for (let i = 0; i < Math.min(sw, sh) / 2; i++) p.tint(sx + sw - 3 - i * 0.5, sy + 1 + i, (c) => mix(c, 0xffffff, 0.18));
}

function draw(p: TPix, b: BP, r: Rng): void {
  const stag = b.kneel > 0.55;
  const ox = Math.round(b.ox), oy = Math.round(b.bob + (stag ? 8 : b.kneel * 9) + b.crouch * 4);
  const f = Math.floor(b.t * 8);
  const glitch = b.glitch > 0.4;
  const sad = b.aux > 0.4;
  bpart(p, (l) => {
    for (let i = 0; i < 11; i++) {
      const x0 = 14 + i * 6.8 + ox, w = Math.sin(i * 1.3 + b.t * Math.PI * 2) * 4 + b.sw * 2;
      const len = (stag ? 10 : 18) + ((i * 7) % 9);
      l.limb(x0, 86 + oy, x0 + w * 0.5, 86 + oy + len * 0.5, 2, S.cable);
      l.limb(x0 + w * 0.5, 86 + oy + len * 0.5, x0 + w, Math.min(111, 86 + oy + len), 1.5, S.cable);
    }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const a = s < 0 ? b.aL : b.aR;
      const x0 = 48 + s * (30 + k * 3) + ox, w = Math.sin(k + b.t * Math.PI * 2) * 2;
      const lift = Math.max(0, a) * (30 - k * 4);
      l.limb(x0, 12 + oy + k * 4, x0 + s * (6 + Math.max(0, a) * 10) + w, 50 + oy + k * 6 - lift, 1.6, S.cable);
      l.limb(x0 + s * (6 + Math.max(0, a) * 10) + w, 50 + oy + k * 6 - lift, x0 + s * (4 + Math.max(0, a) * 16) - w, 82 + oy + k * 6 - lift * 1.8, 1.3, S.cable);
    }
  }, { bevel: false });
  for (let i = 0; i < 11; i += 2) { const x0 = 14 + i * 6.8 + ox, w = Math.sin(i * 1.3 + b.t * Math.PI * 2) * 4 + b.sw * 2, len = (stag ? 10 : 18) + ((i * 7) % 9); p.set(x0 + w, Math.min(111, 86 + oy + len), b.charge > 0.5 ? 0xff3030 : TERM, F_EMIT); }
  if (!stag) for (let x = 24; x < 72; x++) if ((x + f) % 3) p.set(x + ox, 110, mix(TERM_DIM, 0x041408, Math.abs(x - 48) / 24), F_EMIT);
  bpart(p, (l) => { l.box(10 + ox, 6 + oy, 76, 82, S.dark); for (let y = 10; y < 86; y += 6) l.rect(10 + ox, y + oy, 76, 1, lit(S.dark, 0.3)); });
  const st = (m: Mode, k: number): Mode => (glitch && (k + f) % 3 !== 0 ? 'static' : stag && k % 3 === 1 ? 'dead' : b.dmg >= 2 && k === 9 ? 'dead' : m);
  const mons: [number, number, number, number, Mode, number][] = [
    [12, 8, 22, 16, sad ? 'sad' : 'brow', 1], [34, 4, 28, 14, 'text', 2], [62, 8, 22, 16, sad ? 'sad' : 'brow', 3],
    [8, 26, 18, 18, 'text', 4], [70, 26, 18, 18, 'text', 5],
    [12, 46, 16, 20, 'text', 6], [68, 46, 16, 20, 'text', 7],
    [24, 68, 48, 18, sad ? 'frown' : 'grin', 8],
    [4, 66, 18, 14, 'text', 9], [74, 66, 18, 14, 'text', 10],
  ];
  mons.forEach(([x, y, w, h, m, s], k) => {
    const jx = glitch && k % 2 ? (f % 2 ? 2 : -2) : 0;
    crt(p, x + ox + jx, y + oy, w, h, st(m, k), s, f, 0);
  });
  const ex = 26 + ox, ey = 20 + oy, ew = 44, eh = 46;
  if (!stag) {
    const m: Mode = glitch && f % 2 ? 'static' : b.charge > 0.6 ? 'red' : 'eye';
    crt(p, ex, ey, ew, eh, m, 11, f, b.look, b.open);
    const ccx = ex + ew / 2, ccy = ey + eh / 2 - 2;
    if (b.open > 0.5) for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2 + b.t * 4; if (a % 5 < 3) p.set(ccx + Math.cos(t) * 19, ccy + Math.sin(t) * 18, TERM_HOT, F_EMIT); }
    if (b.flash > 0.2) glowBlob(p, ccx, ccy, 5 + b.flash * 9, 0xffffff, b.charge > 0.6 ? 0xffd0c0 : TERM_HOT, b.charge > 0.6 ? EYE : TERM, 0.25, r);
    if (b.pain > 0.5) glowBlob(p, ccx, ccy, 6, 0xffffff, 0xffffff, TERM_HOT);
    // a tear of light when it's sad
    if (sad && !glitch) for (let k = 0; k < 4 + (f % 3); k++) p.set(ccx - 9 + Math.round(b.look * 5), ccy + 6 + k * 2, TERM_HOT, F_EMIT);
  } else {
    crt(p, ex, ey, ew, eh, 'dead', 11, f);
    for (const [x0, y0, x1, y1] of [[6, 4, 18, 18], [18, 18, 10, 34], [30, 6, 24, 20], [24, 20, 36, 34], [18, 18, 24, 20]]) p.line(ex + x0, ey + y0, ex + x1, ey + y1, 0xc8d0c8, F_FLAT);
    exposedCore(p, r, ex + ew / 2, ey + eh / 2 - 2, 9, f);
    sparks(p, r, ex + ew / 2, ey + eh / 2, 24, 16);
  }
  if (b.pain > 0.5 || glitch) {
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

function dead(p: TPix, r: Rng): void {
  bpart(p, (l) => { for (let i = 0; i < 9; i++) l.limb(6 + i * 10, 110, 12 + i * 9, 102 - (i % 3) * 3, 1.5, S.cable); }, { bevel: false });
  const pile: [number, number, number, number, Mode][] = [[4, 94, 22, 16, 'dead'], [70, 92, 24, 18, 'dead'], [24, 86, 20, 16, 'dead'], [52, 84, 20, 16, 'text'], [30, 96, 40, 15, 'dead'], [10, 80, 16, 14, 'dead'], [72, 78, 18, 14, 'dead'], [-10, 98, 14, 12, 'dead'], [96, 96, 16, 14, 'dead']];
  pile.forEach(([x, y, w, h, m], k) => crt(p, x, y, w, h, m, 40 + k, 0));
  for (let k = 0; k < 4; k++) { const x0 = 10 + k * 22, y0 = 88 + (k % 2) * 8; p.line(x0, y0, x0 + 6, y0 + 7, 0xc8d0c8, F_FLAT); }
  p.ellipse(50, 104, 3, 2, 0x0c3a1a, F_EMIT); p.set(50, 104, TERM, F_EMIT); p.set(49, 104, TERM_DIM, F_EMIT);
  sparks(p, r, 56, 92, 6, 3);
}

export function handlerArt(): BossArt {
  return {
    draw, dead, worldH: 7.5, glow: [0x3aff6a, 0xd0ffd8],
    clips: {
      idle: { n: 8, pose: (i) => ({ bob: Math.sin((i / 8) * Math.PI * 2) * 1.5, t: i / 8, look: Math.sin((i / 8) * Math.PI * 2) * 0.6 }) },
      ...moveClips('static', { W: { aux: 1, charge: 0.4, aL: 0.4, aR: 0.4 }, A: { aux: 1, glitch: 0.6, charge: 0.5 }, act: (k) => ({ glitch: Math.sin(k * 20) > 0 ? 0.7 : 0.2 }), n: [7, 6, 6] }),
      ...moveClips('memory', { W: { aux: 1, glitch: 0.3, look: -1 }, A: { glitch: 1, flash: 0.7, aux: 1 }, n: [8, 4, 5] }),
      ...moveClips('scanHigh', { W: { open: 1, aux: 1, aL: 1, aR: 1 }, A: { open: 1, flash: 0.8, aux: 1, aL: 1, aR: 1 }, act: (k) => ({ look: Math.sin(k * Math.PI * 2), flash: 0.6 + 0.4 * Math.sin(k * 25) }), loop: true, n: [8, 4, 6] }),
      ...moveClips('scanLow', { W: { open: 1, aux: 1, crouch: 0.5 }, A: { open: 1, flash: 0.8, aux: 1, crouch: 0.5 }, act: (k) => ({ look: -Math.sin(k * Math.PI * 2), flash: 0.6 + 0.4 * Math.sin(k * 25) }), loop: true, n: [8, 4, 6] }),
      ...moveClips('signal', { W: { aux: 1, charge: 0.4, aL: 0.6, aR: 0.6 }, A: { flash: 1, aux: 1 }, act: (k) => ({ flash: Math.max(0, Math.sin(k * Math.PI * 2)) }), xa: { jit: 1 }, n: [6, 6, 5] }),
      ...moveClips('correction', { W: { aux: 1, charge: 0.7, open: 0.5 }, A: { flash: 1, charge: 0.8 }, L: { aux: 1, look: -1 }, n: [8, 3, 6] }),
      ...moveClips('fracture', { W: { glitch: 0.6, aux: 1 }, A: { glitch: 1, flash: 1 }, xa: { jit: 3 }, n: [7, 4, 5] }),
      ...moveClips('cascade', { W: { aux: 1, charge: 0.5, aL: 1, aR: 1 }, A: { aux: 1, charge: 0.6, flash: 0.5 }, act: (k) => ({ aL: Math.sin(k * 10), aR: Math.cos(k * 10), glitch: k * 7 % 1 > 0.8 ? 0.6 : 0 }), loop: true, n: [6, 6, 5] }),
      ...moveClips('wait', { W: { look: -0.6, aux: 0.6 }, A: { look: -0.8, aux: 0.6, bob: 2 }, act: (k) => ({ look: Math.sin(k * 3) * 0.4 - 0.4 }), loop: true, n: [4, 6, 4] }),
    },
  };
}
