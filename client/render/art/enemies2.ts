// Enemy sprite frames, wave 2: leech, sentinel, bomber, mortar, bulwark, wraith.
import { Pix, Rng, part, glowBlob, sparks, glint, mul, mix, lit, bayer, F_EMIT, F_FLAT } from './core';
import { Pose, EnemyDef, exposedCore, muzzleFlash, pool, EYE, EYE_HOT, EYE_DIM, CORE, CORE_EDGE } from './enemies';

// shield energy (blue-white)
export const SH_HOT = 0xf0fcff, SH_MID = 0x8ad8ff, SH_DIM = 0x2a78c8, SH_DEEP = 0x123a78;
// violet hex energy
export const HEX_HOT = 0xffe8ff, HEX = 0xc050ff, HEX_EDGE = 0x6a1aa8;
// bomb glow
const BOMB_HOT = 0xfff0c0, BOMB = 0xff6a18, BOMB_EDGE = 0xb82408;
const AMBER = 0xffb030, AMBER_HOT = 0xfff0b0, AMBER_DIM = 0x9a5208;

/** Grey smoke puff cluster (non-emissive, soft — no outline). */
export function smoke(p: Pix, r: Rng, cx: number, cy: number, rad: number, n: number, col = 0x5a5658): void {
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = r() * rad;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
    const rr = rad * (0.35 + r() * 0.35);
    p.ball(x, y, rr, rr * 0.9, i % 2 ? col : lit(col, 0.15), F_FLAT);
  }
}

/** Curved energy shield plate. Blends over what's beneath to fake translucency. flash 0..1 → white. */
export function shieldPlate(p: Pix, cx: number, cy: number, hw: number, hh: number, flash = 0, broken?: Rng, alpha = 255): void {
  for (let dx = -hw; dx <= hw; dx++) {
    const t = dx / hw;
    const top = Math.round(cy - hh + t * t * 3), bot = Math.round(cy + hh - t * t * 2);
    const x = Math.round(cx + dx);
    for (let y = top; y <= bot; y++) {
      if (broken && broken() < 0.45) continue;
      const edge = dx === -hw || dx === hw || y === top || y === bot;
      const row = y - top;
      const hx = (x + ((Math.floor(row / 3) & 1) ? 2 : 0)) & 3;
      const hex = row % 3 === 0 ? hx < 2 : hx === 0;
      const lum = 1 - Math.abs(t) * 0.7 - (row / (bot - top + 1)) * 0.25;
      let c = edge ? SH_HOT : hex ? mix(SH_DIM, SH_MID, lum) : mix(SH_DEEP, SH_DIM, lum + (bayer(x, y) - 0.5) * 0.3);
      if (!edge && (y === top + 1 || dx === -hw + 1 || dx === hw - 1)) c = SH_MID;
      // diagonal glare
      if (!edge && Math.abs((x - cx) + (y - cy) * 0.7 + hw * 0.35) < 1.2 && t < 0.2) c = mix(c, SH_HOT, 0.7);
      const under = p.get(x, y);
      if (under >= 0 && !edge) c = mix(under, c, 0.66);
      if (flash) c = mix(c, 0xffffff, flash);
      p.set(x, y, c, F_EMIT, edge ? 255 : alpha);
    }
  }
}

// ======================================================================
// LEECH  28x20 — segmented grub-machine
// ======================================================================
interface LeechStyle { flesh: number; flesh2: number; band: number; leg: number; mand: number; trim: number }
const LEECH: LeechStyle = { flesh: 0xb4707a, flesh2: 0x8a4a58, band: 0x6c6c76, leg: 0x46464e, mand: 0xa89c8c, trim: 0x9aa0a8 };
const LEECH_ELITE: LeechStyle = { flesh: 0x6e2a36, flesh2: 0x4a1a26, band: 0x34303a, leg: 0x2a2630, mand: 0xd8a030, trim: 0xe0b038 };

function leechSegs(a: string, f: number, ox: number, oy: number, lunge: number, stag: boolean): number[][] {
  const out: number[][] = [];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let x = 23 - t * 10.5, y = 9 + t * 3.5;
    if (a === 'move') y += Math.sin(f * Math.PI / 2 + i * 1.4) * 1.1;
    if (a === 'idle') y += Math.sin(f * Math.PI + i) * 0.5;
    if (lunge) { x -= t * t * 3 * lunge; y -= t * t * 2.5 * lunge; }
    if (stag) y += 2 + (i % 2);
    out.push([x + ox, y + oy, 2.8 + t * 2.4, 2.4 + t * 1.9]);
  }
  return out;
}

function drawLeech(p: Pix, ps: Pose, S: LeechStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  const lunge = a === 'attack' ? (f === 1 ? 1 : 0.4) : a === 'charge' ? 0.3 : 0;
  const ox = a === 'pain' ? 2 : 0;
  const stag = a === 'stagger';
  const segs = leechSegs(a, f, ox, 0, lunge, stag);
  // pin legs
  part(p, (l) => {
    segs.forEach(([x, y, , ry], i) => {
      if (i === segs.length - 1) return;
      const lift = a === 'move' && ((i + f) % 2 === 0) ? 1 : 0;
      const fy = stag ? 19 : 19 - lift;
      l.line(x - 1, y + ry - 1, x - 2.5, fy, S.leg); l.line(x + 1, y + ry - 1, x + 2.5, fy, S.leg);
      l.set(x - 2.5, fy, S.trim); l.set(x + 2.5, fy, S.trim);
    });
  }, { bevel: false });
  // body segments tail → head-neck
  part(p, (l) => {
    for (let i = 0; i < segs.length - 1; i++) {
      const [x, y, rx, ry] = segs[i];
      l.ball(x, y, rx, ry, i % 2 ? S.flesh2 : S.flesh, 0);
      // metal band on the front edge
      for (let yy = Math.floor(y - ry); yy <= y + ry; yy++)
        for (let xx = Math.floor(x - rx); xx <= x - rx * 0.45; xx++)
          if (l.has(xx, yy)) l.set(xx, yy, lit(S.band, (y - yy) / ry * 0.5));
      l.set(x - rx * 0.6, y - ry * 0.4, S.trim);
      // wet sheen
      l.set(x + rx * 0.1, y - ry * 0.6, 0xffd8dc); l.set(x + rx * 0.3, y - ry * 0.5, lit(S.flesh, 0.5));
    }
  });
  if (stag) exposedCore(p, r, segs[2][0], segs[2][1], 2.2, f, false);
  // head
  const [hx0, hy0, hr, hry] = segs[segs.length - 1];
  const hx = hx0, hy = hy0 + (stag ? 1 : 0);
  const open = a === 'attack' ? (f === 1 ? 2 : 1) : a === 'charge' ? 1 : 0;
  part(p, (l) => {
    l.ball(hx, hy, hr, hry, S.flesh);
    // armored brow plate
    for (let y = Math.floor(hy - hry); y < hy - hry * 0.4; y++) for (let x = Math.floor(hx - hr); x <= hx + hr; x++) if (l.has(x, y)) l.set(x, y, lit(S.band, (hy - y) / hry * 0.4));
    for (let x = Math.floor(hx - hr + 1); x <= hx + hr - 1; x += 2) l.set(x, Math.round(hy - hry * 0.4), S.trim);
    // maw
    const mw = 1.6 + open * 1.4, mh = 1 + open * 1.1;
    l.ellipse(hx, hy + 2, mw, mh, 0x2a0408, F_FLAT);
    if (open) { l.ellipse(hx, hy + 2.2, mw - 0.8, mh - 0.6, 0x8c1a20, F_FLAT); for (let x = -2; x <= 2; x += 2) { l.set(hx + x, hy + 2 - mh + 1, 0xe8e0d0, F_FLAT); l.set(hx + x + 1, hy + 2 + mh - 1, 0xe8e0d0, F_FLAT); } }
  });
  // red eye cluster
  const ec = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : EYE;
  for (const [x, y] of [[-2, -2], [0, -3], [2, -2], [-1, -1], [1, -1]]) p.set(hx + x, hy + y, ec, F_EMIT);
  p.set(hx, hy - 2, stag && f === 0 ? EYE_DIM : EYE_HOT, F_EMIT);
  // hooked mandibles
  part(p, (l) => {
    for (const s of [-1, 1]) {
      const sp = open * 2.2;
      const x0 = hx + s * (hr - 1.5), y0 = hy + 1;
      const x1 = hx + s * (hr + 1 + sp), y1 = hy + 3 + (open ? -1 : 0);
      const x2 = hx + s * (1.5 + sp * 0.6), y2 = hy + 5.5 + (open ? 0.5 : 0);
      l.limb(x0, y0, x1, y1, 0.9, S.mand);
      l.limb(x1, y1, x2, y2, 0.8, S.mand);
      l.set(x2, y2, lit(S.mand, 0.6));
    }
  }, { bevel: false });
  if (a === 'attack' && f === 1) { p.set(hx, hy + 2, 0xff6050, F_EMIT); sparks(p, r, hx, hy + 6, 3, 2); }
  if (a === 'pain') { sparks(p, r, hx + 4, hy - 1, 4, 5); p.set(hx + 3, hy, 0x8c0f12); p.set(hx + 4, hy + 1, 0x3a0508); }
}

function deadLeech(p: Pix, S: LeechStyle, r: Rng): void {
  pool(p, r, 14, 17.5, 12, 2.2, true);
  part(p, (l) => {
    for (let i = 0; i < 4; i++) { const x = 23 - i * 3.5; l.ball(x, 15.5 - (i === 2 ? 1 : 0), 3 + i * 0.4, 2.2, i % 2 ? S.flesh2 : S.flesh); }
    for (let x = 9; x < 26; x += 4) for (let y = 13; y < 18; y++) if (l.has(x, y)) l.set(x, y, S.band);
  });
  part(p, (l) => {
    l.ball(7, 15, 4.6, 3.2, S.flesh);
    for (let x = 3; x < 12; x++) for (let y = 12; y < 14; y++) if (l.has(x, y)) l.set(x, y, S.band);
    l.ellipse(7, 16.5, 2, 1, 0x2a0408, F_FLAT);
  });
  part(p, (l) => { l.limb(4, 15, 1, 12, 0.9, S.mand); l.limb(10, 15, 13, 11, 0.9, S.mand); l.line(20, 17, 22, 13, S.leg); l.line(16, 17, 15, 14, S.leg); }, { bevel: false });
  p.set(6, 14, 0x3a0808); p.set(8, 14, 0x2a0606);
}

// ======================================================================
// SENTINEL  40x48 — shielded tripod turret
// ======================================================================
interface SentStyle { body: number; body2: number; leg: number; gun: number; trim: number }
const SENT: SentStyle = { body: 0x5e6872, body2: 0x3c444e, leg: 0x4a4e58, gun: 0x2e3238, trim: 0x8ab8d8 };
const SENT_ELITE: SentStyle = { body: 0x3e363c, body2: 0x2a2228, leg: 0x302a30, gun: 0x1e1a1e, trim: 0xe0a830 };

function drawSentinel(p: Pix, ps: Pose, S: SentStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let wob = 0, ox = 0;
  if (a === 'move') wob = [0, 1, 0, -1][f];
  if (a === 'pain') ox = 2;
  const stag = a === 'stagger';
  const oy = stag ? 5 : 0;
  const tilt = stag ? 3 : 0;
  // tripod
  part(p, (l) => {
    l.limb(20, 34 + oy, 20, 43, 1.8, mul(S.leg, 0.8));
    l.box(17, 42, 7, 3, S.body2);
    if (!stag) {
      l.limb(16, 33, 9, 39, 2.2, S.leg); l.limb(9, 39, 5, 45, 1.8, S.leg);
      l.limb(24, 33, 31, 39, 2.2, S.leg); l.limb(31, 39, 35, 45, 1.8, S.leg);
    } else {
      l.limb(16, 37, 6, 41, 2.2, S.leg); l.limb(6, 41, 2, 46, 1.8, S.leg);
      l.limb(24, 37, 30, 44, 2.2, S.leg); l.limb(30, 44, 37, 46, 1.8, S.leg);
    }
    l.box(1, 45, 8, 3, S.body2); l.box(31, 45, 8, 3, S.body2);
    l.set(9, 39, S.trim); l.set(31, 39, S.trim);
    l.ball(20, 33 + oy, 5, 3.2, S.body2);
  });
  const cx = 20 + wob + ox + tilt, cy = 23 + oy;
  // turret dome
  part(p, (l) => {
    l.ball(cx, cy, 12, 9.5, S.body);
    l.box(cx - 10, cy + 4, 21, 6, S.body2);
    for (let x = -9; x <= 9; x += 3) l.set(cx + x, cy + 6, S.trim);
    for (let x = -11; x <= 11; x++) if (l.has(cx + x, cy - 2)) l.tint(cx + x, cy - 2, (c) => lit(c, -0.45));
    for (let i = 0; i < 12; i++) l.tint(cx - 10 + Math.floor(r() * 20), cy - 6 + Math.floor(r() * 12), (c) => lit(c, -0.25));
  });
  if (stag) exposedCore(p, r, cx, cy + 1, 3.8, f);
  // gun block + twin barrels
  const gx = cx + wob * 0.5, gy = 12 + oy + (stag ? 3 : 0);
  part(p, (l) => {
    l.box(gx - 11, gy - 3, 23, 8, S.gun);
    l.rect(gx - 9, gy - 3, 19, 1, lit(S.gun, 0.5));
    for (const s of [-1, 1]) {
      const bx = gx + s * 7;
      l.box(bx - 3, gy - 5, 7, 11, mul(S.gun, 1.25));
      l.ball(bx, gy + 1, 3.4, 3.4, mul(S.gun, 1.5));
      for (let y = gy - 4; y < gy + 6; y += 2) l.set(bx - 3, y, lit(S.gun, 0.3));
    }
  });
  const hot = a === 'charge';
  for (const s of [-1, 1]) {
    const bx = gx + s * 7;
    p.ellipse(bx, gy + 1, 1.9, 1.9, 0x050506, F_FLAT);
    if (hot) {
      glowBlob(p, bx, gy + 1, 2.2 + f * 0.9, 0xffffff, SH_HOT, SH_MID);
      if (f === 1) glint(p, bx, gy + 1, 0xffffff, SH_MID, 2);
      // heat on the shrouds
      for (let y = gy - 4; y < gy + 6; y++) p.tint(bx + 3, y, (c) => mix(c, f ? 0xfff0e0 : 0xff8a40, 0.5));
    }
    if (a === 'attack' && ((f === 0 && s < 0) || (f === 1 && s > 0))) muzzleFlash(p, r, bx, gy + 1, 3.6);
    if (a === 'attack' && !((f === 0 && s < 0) || (f === 1 && s > 0))) p.set(bx, gy + 1, 0xffa040, F_EMIT);
  }
  // sensor eye between barrels
  const ec = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : hot ? 0xffffff : EYE;
  p.rect(gx - 2, gy - 1, 5, 2, 0x0a0606, F_FLAT);
  for (let x = -1; x <= 1; x++) p.set(gx + x, gy - 1, ec, F_EMIT);
  p.set(gx, gy, mul(EYE, 0.6), F_EMIT);
  // energy shield
  if (!stag) {
    const fl = a === 'pain' ? 0.6 : a === 'idle' && f === 1 ? 0.12 : 0;
    shieldPlate(p, cx - wob * 0.5, 30 + oy, 16, 9, fl);
    if (a === 'pain') sparks(p, r, cx + 4, 28, 8, 8);
  } else {
    // flickering shield shards
    const rr = (s: number): Rng => { let k = s; return () => ((k = (k * 1103515245 + 12345) >>> 0) / 4294967296); };
    shieldPlate(p, cx - 2, 33 + oy, 15, 7, f === 1 ? 0.2 : 0, rr(77 + f));
    sparks(p, r, cx, cy, 14, 6);
  }
}

function deadSentinel(p: Pix, S: SentStyle, r: Rng): void {
  pool(p, r, 20, 45, 17, 2.5, false);
  part(p, (l) => { l.limb(4, 46, 14, 40, 1.8, S.leg); l.limb(26, 41, 38, 46, 1.8, S.leg); l.limb(20, 42, 24, 47, 1.6, S.leg); });
  part(p, (l) => {
    l.ball(19, 40, 11, 6, S.body);
    l.box(10, 41, 19, 5, S.body2);
    for (let x = 10; x < 29; x += 3) l.set(x, 43, S.trim);
  });
  part(p, (l) => { l.box(23, 33, 14, 6, S.gun); l.ball(34, 36, 3, 3, mul(S.gun, 1.5)); l.ball(26, 36, 3, 3, mul(S.gun, 1.5)); });
  p.ellipse(34, 36, 1.4, 1.4, 0x050506, F_FLAT); p.ellipse(26, 36, 1.4, 1.4, 0x050506, F_FLAT);
  p.ellipse(18, 40, 2.4, 2, 0x1a0c08, F_FLAT); p.set(18, 40, 0x5a2a10);
  for (const [x, y] of [[4, 43], [7, 44], [33, 44], [12, 46], [29, 46], [9, 41]]) { p.set(x, y, SH_DIM, F_EMIT); p.set(x + 1, y, SH_DEEP, F_EMIT); }
  p.set(8, 44, SH_MID, F_EMIT);
  sparks(p, r, 20, 38, 3, 2);
}

// ======================================================================
// BOMBER  30x40 — hunched runner with a bomb canister strapped on
// ======================================================================
interface BombStyle { body: number; body2: number; joint: number; strap: number; can: number; trim: number }
const BOMBER: BombStyle = { body: 0x6a6e76, body2: 0x484c54, joint: 0x2c2c32, strap: 0x4a3420, can: 0x50525a, trim: 0xc8a020 };
const BOMBER_ELITE: BombStyle = { body: 0x3e383e, body2: 0x2c262c, joint: 0x1a161a, strap: 0x3a1a14, can: 0x34303a, trim: 0xe0b038 };

function drawBomber(p: Pix, ps: Pose, S: BombStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, ox = 0, stride = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 1, 0, 1][f]; stride = [1, 0, -1, 0][f]; }
  if (a === 'pain') ox = -2;
  const stag = a === 'stagger';
  const charge = a === 'charge';
  const oy = bob + (stag ? 5 : 0) + (charge ? 1 : 0);
  // legs
  part(p, (l) => {
    if (stag) {
      l.limb(12, 31, 8, 36, 1.8, S.body2); l.limb(8, 36, 11, 39, 1.5, S.joint); l.box(9, 37, 5, 3, S.body2);
      l.limb(18, 31, 23, 35, 1.8, S.body2); l.limb(23, 35, 21, 39, 1.5, S.joint); l.box(18, 37, 6, 3, S.body2);
      return;
    }
    const lf = stride, rf = -stride;
    const leg = (hx: number, sd: number, k: number): void => {
      const lift = k > 0 ? 3 : 0;
      const kx = hx + sd * 1.5, ky = 31 + bob - lift + (k < 0 ? 1 : 0);
      const fx = hx + sd * 0.5 + k * -1, fy = 39 - lift;
      l.limb(hx, 26 + bob, kx, ky, 1.9, S.body2);
      l.limb(kx, ky, fx, fy - 1, 1.5, S.joint);
      l.box(Math.round(fx) - 2, Math.round(fy) - 1, 5, 2, S.body);
      l.set(kx, ky, S.trim);
    };
    leg(12, -1, lf); leg(18, 1, rf);
  });
  // pelvis
  part(p, (l) => { l.box(10 + ox, 24 + oy, 10, 4, S.joint); });
  // hunched torso: shoulders high, chest forward
  part(p, (l) => {
    l.poly([5 + ox, 13 + oy, 25 + ox, 13 + oy, 22 + ox, 26 + oy, 8 + ox, 26 + oy], S.body);
    l.ball(6 + ox, 13 + oy, 4, 3.4, S.body2); l.ball(24 + ox, 13 + oy, 4, 3.4, S.body2);
    for (let y = 14; y < 26; y++) for (let x = 19; x < 26; x++) if (l.has(x + ox, y + oy) && (x > 21 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.3));
    // harness straps
    l.line(6 + ox, 14 + oy, 22 + ox, 25 + oy, S.strap); l.line(24 + ox, 14 + oy, 8 + ox, 25 + oy, S.strap);
  });
  // bomb canister (chest)
  const bx = 15 + ox, by = 19 + oy;
  part(p, (l) => {
    l.box(bx - 5, by - 8, 11, 3, S.can); l.box(bx - 5, by + 6, 11, 3, S.can);
    for (let x = -5; x <= 5; x++) { const s = ((x + 6) >> 1) & 1; l.set(bx + x, by + 7, s ? S.trim : 0x1a1814); }
    l.rect(bx - 5, by - 5, 1, 11, S.can); l.rect(bx + 5, by - 5, 1, 11, mul(S.can, 0.7));
  });
  if (!stag) {
    const lvl = charge ? 2 + f : a === 'attack' ? 1.5 : (a === 'idle' || a === 'move') && f % 2 ? 1 : 0;
    const hotC = charge && f === 1 ? 0xffffff : BOMB_HOT;
    const midC = charge ? (f === 1 ? 0xfff6e0 : 0xffc070) : BOMB;
    const edgeC = charge ? (f === 1 ? 0xffb060 : BOMB) : BOMB_EDGE;
    for (let y = by - 5; y <= by + 5; y++) for (let x = bx - 4; x <= bx + 4; x++) {
      const d = Math.hypot((x + 0.5 - bx - 0.5) / 4.5, (y + 0.5 - by) / 6) - lvl * 0.08 + (bayer(x, y) - 0.5) * 0.2;
      p.set(x, y, d < 0.35 ? hotC : d < 0.7 ? midC : edgeC, F_EMIT);
    }
    // straps over canister
    for (const yy of [by - 3, by + 3]) for (let x = bx - 5; x <= bx + 5; x++) p.set(x, yy, S.strap, F_FLAT);
    for (const yy of [by - 3, by + 3]) p.set(bx + 4, yy, S.trim, F_FLAT);
    // hazard glyph
    p.set(bx, by, charge ? 0xffffff : 0x3a0a04, charge ? F_EMIT : F_FLAT); p.set(bx, by - 1, charge ? 0xffffff : 0x3a0a04, charge ? F_EMIT : F_FLAT);
    if (charge) {
      glowBlob(p, bx, by, 4 + f * 2, 0xffffff, f ? 0xffffff : BOMB_HOT, f ? 0xfff0c0 : BOMB, 0.3, r);
      sparks(p, r, bx, by, 8 + f * 3, 6 + f * 4);
    }
  } else {
    exposedCore(p, r, bx, by, 3.8, f);
    for (const yy of [by - 3, by + 3]) for (let x = bx - 5; x <= bx + 5; x += 3) p.set(x, yy, S.strap, F_FLAT);
  }
  // blinking fuse light on canister cap + wire to head
  const blink = charge || a === 'attack' || f % 2 === 1;
  p.line(bx + 3, by - 8, bx + 5, by - 11, 0xc02020);
  p.set(bx, by - 9, blink ? 0xffffff : EYE_DIM, F_EMIT);
  if (blink) { p.set(bx - 1, by - 9, EYE, F_EMIT); p.set(bx + 1, by - 9, EYE, F_EMIT); p.set(bx, by - 10, EYE, F_EMIT); }
  // arms swinging back
  part(p, (l) => {
    const sw = stride * 2;
    if (a === 'attack') {
      const w = f === 1 ? 4 : 2;
      l.limb(5 + ox, 14 + oy, 1 + ox, 9 + oy - w, 1.4, S.body2); l.limb(25 + ox, 14 + oy, 29 + ox, 9 + oy - w, 1.4, S.body2);
      l.box(ox, 6 + oy - w, 3, 3, S.joint); l.box(27 + ox, 6 + oy - w, 3, 3, S.joint);
    } else if (stag) {
      l.limb(5 + ox, 15 + oy, 4 + ox, 26 + oy, 1.4, S.body2); l.limb(25 + ox, 15 + oy, 27 + ox, 25 + oy, 1.4, S.body2);
    } else {
      l.limb(5 + ox, 15 + oy, 3 + ox - sw * 0.5, 21 + oy, 1.4, S.body2); l.limb(3 + ox - sw * 0.5, 21 + oy, 4 + ox - sw, 27 + oy + sw, 1.2, S.joint);
      l.limb(25 + ox, 15 + oy, 27 + ox + sw * 0.5, 21 + oy, 1.4, S.body2); l.limb(27 + ox + sw * 0.5, 21 + oy, 26 + ox + sw, 27 + oy - sw, 1.2, S.joint);
    }
  });
  // small low head between shoulders
  part(p, (l) => {
    const hx = 15 + ox + (stag ? 2 : 0), hy = 9 + oy + (stag ? 2 : 0);
    l.ball(hx, hy, 4, 3.4, S.body);
    for (let i = -3; i <= 3; i++) l.set(hx + i, hy, 0x0a0606, F_FLAT);
    const ec = stag && f === 0 ? EYE_DIM : a === 'pain' ? 0xffffff : EYE;
    l.set(hx - 2, hy, ec, F_EMIT); l.set(hx + 2, hy, ec, F_EMIT); l.set(hx - 1, hy, mul(ec, 0.6), F_EMIT);
    l.set(hx + 3, hy - 3, S.trim);
  });
  if (a === 'pain') sparks(p, r, 12 + ox, 16 + oy, 5, 6);
}

function deadBomber(p: Pix, S: BombStyle, r: Rng): void {
  // blast scorch
  for (let y = 33; y < 40; y++) for (let x = 1; x < 29; x++) {
    const d = ((x - 15) / 14) ** 2 + ((y - 37) / 3) ** 2 + (r() - 0.5) * 0.35;
    if (d < 1) p.set(x, y, d < 0.4 ? 0x0e0a08 : 0x221a16, F_FLAT);
  }
  part(p, (l) => { l.limb(18, 36, 26, 37, 1.6, S.body2); l.box(25, 35, 4, 3, S.body); l.limb(6, 37, 2, 34, 1.3, S.joint); });
  part(p, (l) => {
    l.poly([7, 38, 8, 32, 14, 30, 20, 31, 22, 38], lit(S.body, -0.35));
    l.box(11, 31, 7, 5, S.can);
    for (let x = 11; x < 18; x++) l.set(x, 31, S.trim);
  });
  part(p, (l) => { l.ball(6, 34, 3.4, 2.8, lit(S.body, -0.3)); l.set(5, 34, 0x2a0606, F_FLAT); });
  p.ellipse(14, 33.5, 2, 1.4, 0x1a0c08, F_FLAT); p.set(14, 33, BOMB_EDGE, F_EMIT); p.set(15, 34, 0x6a1a08, F_EMIT);
  for (const [x, y] of [[3, 30], [26, 31], [22, 28], [9, 27]]) p.set(x, y, 0x3a3a40);
  sparks(p, r, 14, 32, 4, 3);
}

// ======================================================================
// MORTAR  44x40 — squat four-legged artillery walker
// ======================================================================
interface MortStyle { hull: number; hull2: number; leg: number; tube: number; trim: number }
const MORTAR: MortStyle = { hull: 0x6a6450, hull2: 0x48443a, leg: 0x4a4a50, tube: 0x3a3c42, trim: 0xb07a30 };
const MORTAR_ELITE: MortStyle = { hull: 0x3e3434, hull2: 0x2a2224, leg: 0x2c282c, tube: 0x221e22, trim: 0xe0a830 };

function drawMortar(p: Pix, ps: Pose, S: MortStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, ox = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') bob = [0, 1, 0, 1][f];
  if (a === 'pain') ox = 2;
  const stag = a === 'stagger';
  const oy = bob + (stag ? 6 : 0);
  const recoil = a === 'attack' ? (f === 0 ? 2 : 1) : 0;
  // back legs (darker, behind)
  part(p, (l) => {
    for (const s of [-1, 1]) {
      const lift = a === 'move' && ((f === 1 && s < 0) || (f === 3 && s > 0)) ? 2 : 0;
      const rx = 22 + s * 8, kx = 22 + s * 15, fx = 22 + s * 15;
      l.limb(rx, 22 + oy, kx, 15 + oy + (stag ? 6 : 0), 2, mul(S.leg, 0.75));
      l.limb(kx, 15 + oy + (stag ? 6 : 0), fx, 33 - lift, 1.6, mul(S.leg, 0.75));
      l.box(fx - 2, 32 - lift, 5, 2, mul(S.hull2, 0.8));
    }
  });
  // mortar tube (on back)
  const tx0 = 23 + ox, ty0 = 18 + oy, tx1 = 32 + ox - recoil * 0.5, ty1 = 5 + oy + recoil + (stag ? 4 : 0) + (a === 'charge' ? 1 : 0);
  const tx1s = stag ? tx1 + 4 : tx1;
  part(p, (l) => {
    l.limb(tx0, ty0, tx1s, ty1, 4.2, S.tube);
    // bands
    for (const t of [0.35, 0.7]) {
      const x = tx0 + (tx1s - tx0) * t, y = ty0 + (ty1 - ty0) * t;
      l.limb(x - 1, y + 1.4, x + 1, y - 1.4, 1, S.trim, 0, false);
      l.limb(x - 4, y - 1.4, x + 4, y + 1.4, 0.7, lit(S.tube, 0.35), 0, false);
    }
    l.ellipse(tx1s, ty1, 4.4, 2.6, lit(S.tube, 0.25));
    l.box(17 + ox, 14 + oy, 12, 6, S.hull2); // mount
  });
  p.ellipse(tx1s, ty1, 3, 1.6, 0x060606, F_FLAT);
  if (a === 'charge') { glowBlob(p, tx1s, ty1, 2 + f, f ? 0xfff0c0 : 0xffb050, CORE, CORE_EDGE); }
  // hull
  part(p, (l) => {
    l.ball(22 + ox, 25 + oy, 15, 7.5, S.hull);
    l.box(10 + ox, 18 + oy, 24, 5, S.hull2);
    for (let x = 8; x < 37; x++) if (l.has(x + ox, 27 + oy)) { l.tint(x + ox, 27 + oy, (c) => lit(c, -0.5)); l.tint(x + ox, 28 + oy, (c) => lit(c, 0.2)); }
    for (let x = 10; x < 36; x += 5) l.set(x + ox, 19 + oy, S.trim);
    for (let i = 0; i < 14; i++) l.tint(9 + ox + Math.floor(r() * 26), 20 + oy + Math.floor(r() * 10), (c) => mix(c, 0x8a5a24, 0.45));
    // ammo rack on the side
    for (let k = 0; k < 3; k++) { l.box(8 + ox + k * 3, 21 + oy, 3, 4, 0x8a6a2a); l.set(9 + ox + k * 3, 21 + oy, 0xd8a040); }
  });
  if (stag) exposedCore(p, r, 23 + ox, 24 + oy, 3.6, f);
  // sensor face: three red eyes
  const ec = a === 'pain' ? 0xffffff : stag && f === 0 ? EYE_DIM : EYE;
  p.rect(16 + ox, 28 + oy, 13, 3, 0x0a0606, F_FLAT);
  for (const x of [18, 22, 26]) { p.set(x + ox, 29 + oy, ec, F_EMIT); p.set(x + 1 + ox, 29 + oy, mul(ec, 0.6), F_EMIT); }
  if (a === 'attack' || a === 'charge') p.set(22 + ox, 29 + oy, EYE_HOT, F_EMIT);
  // front legs
  part(p, (l) => {
    for (const s of [-1, 1]) {
      const lift = a === 'move' && ((f === 0 && s < 0) || (f === 2 && s > 0)) ? 3 : 0;
      const rx = 22 + s * 9, kx = 22 + s * 18, ky = stag ? 32 : 24 + oy - lift, fx = 22 + s * (stag ? 20 : 17), fy = 39 - lift;
      l.limb(rx + ox, 27 + oy, kx, ky, 2.6, S.leg);
      l.limb(kx, ky, fx, fy - 1, 2.1, S.leg);
      l.box(fx - 3, fy - 2, 7, 3, S.hull2);
      l.set(kx, ky, S.trim);
    }
  });
  if (a === 'attack') {
    if (f === 0) {
      glowBlob(p, tx1s, ty1 - 1, 4.2, 0xffffff, 0xfff27a, 0xff8a20, 0.3, r);
      smoke(p, r, tx1s + 1, ty1 - 5, 3, 3, 0x6a6466);
      sparks(p, r, tx1s, ty1 - 2, 6, 6);
    } else {
      smoke(p, r, tx1s, ty1 - 4, 5, 7, 0x5a5658);
      p.set(tx1s, ty1, 0xffa040, F_EMIT); p.set(tx1s - 1, ty1, CORE_EDGE, F_EMIT);
      smoke(p, r, tx1s - 4, ty1 - 1, 2.5, 2, 0x48444a);
    }
  }
  if (a === 'pain') sparks(p, r, 20 + ox, 22 + oy, 7, 8);
}

function deadMortar(p: Pix, S: MortStyle, r: Rng): void {
  pool(p, r, 22, 37, 19, 2.6, false);
  part(p, (l) => { l.limb(4, 38, 10, 32, 2, S.leg); l.limb(40, 38, 33, 31, 2, S.leg); l.limb(14, 38, 8, 36, 1.6, S.leg); });
  part(p, (l) => { l.limb(26, 31, 41, 35, 3.6, S.tube); l.ellipse(41, 35, 2, 3.4, lit(S.tube, 0.25)); });
  p.ellipse(41.5, 35, 1, 2, 0x060606, F_FLAT);
  part(p, (l) => {
    l.ball(20, 33, 14, 5, S.hull);
    l.box(10, 29, 18, 4, S.hull2);
    for (let x = 8; x < 33; x += 5) l.set(x, 30, S.trim);
  });
  p.rect(14, 34, 11, 2, 0x0a0606, F_FLAT);
  p.set(16, 34, 0x3a0808); p.set(20, 34, 0x3a0808);
  smoke(p, r, 22, 26, 3, 3, 0x3a3638);
  sparks(p, r, 26, 30, 3, 2);
}

// ======================================================================
// BULWARK  48x60 — heavy with tower shield
// ======================================================================
interface BulStyle { armor: number; armor2: number; under: number; shield: number; shield2: number; rivet: number; trim: number }
const BULWARK: BulStyle = { armor: 0x5a6068, armor2: 0x40454e, under: 0x2e3036, shield: 0x6a6e74, shield2: 0x4a4e56, rivet: 0xb0b4ba, trim: 0x8a5a30 };
const BULWARK_ELITE: BulStyle = { armor: 0x3e3438, armor2: 0x2c2428, under: 0x1e181c, shield: 0x4a3a3a, shield2: 0x32282a, rivet: 0xffd860, trim: 0xc01818 };

function towerShield(l: Pix, x0: number, y0: number, w: number, h: number, S: BulStyle): void {
  const arch = 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = (x + 0.5) / w * 2 - 1;
    if (y < arch * (t * t) ) continue;
    const curve = -t * 0.55 + 0.05; // convex: lit left, dark right
    let c = mix(S.shield2, S.shield, 0.5 + curve * 0.5);
    if (x < 2 || x >= w - 2 || y >= h - 2 || y < arch * t * t + 2) c = lit(S.shield2, x < 2 ? 0.25 : -0.3);
    l.set(x0 + x, y0 + y, c);
  }
  // riveted horizontal bands
  for (const fy of [0.22, 0.5, 0.78]) {
    const y = Math.round(y0 + h * fy);
    for (let x = x0 + 2; x < x0 + w - 2; x++) { l.set(x, y, lit(S.shield2, -0.45)); l.set(x, y + 1, lit(S.shield, 0.25)); }
    for (let x = x0 + 4; x < x0 + w - 3; x += 4) { l.set(x, y - 2, S.rivet); l.set(x + 1, y - 1, lit(S.shield2, -0.6)); }
  }
  for (let y = y0 + 4; y < y0 + h - 2; y += 4) { l.set(x0 + 1, y, S.rivet); l.set(x0 + w - 2, y, S.rivet); }
  // central boss
  const cx = x0 + w / 2, cy = y0 + h * 0.62;
  l.ball(cx, cy, w * 0.14, w * 0.14, S.shield);
  l.set(cx - 1, cy - 1, S.rivet);
  // view slit
  for (let x = Math.round(cx - w * 0.22); x < cx + w * 0.22; x++) l.set(x, Math.round(y0 + h * 0.1), 0x0a0808, F_FLAT);
  // dents / scratches
  for (let i = 0; i < 5; i++) { const x = x0 + 4 + ((i * 7919) % (w - 8)), y = y0 + 6 + ((i * 104729) % (h - 10)); l.set(x, y, lit(S.shield, 0.45)); l.set(x + 1, y + 1, lit(S.shield2, -0.5)); }
}

/** Amber emissive strip along both side edges. */
function shieldStrip(p: Pix, x0: number, y0: number, w: number, h: number, on: number): void {
  const hot = on >= 1 ? AMBER_HOT : on > 0 ? AMBER : AMBER_DIM;
  for (let y = y0 + 4; y < y0 + h - 3; y++) {
    const c = (y & 3) === 0 ? hot : on > 0 ? AMBER : AMBER_DIM;
    p.set(x0 + 2, y, c, F_EMIT); p.set(x0 + w - 3, y, c, F_EMIT);
  }
  for (let x = x0 + 3; x < x0 + w - 3; x++) { const t = (x - x0 + 0.5) / w * 2 - 1; p.set(x, Math.round(y0 + 2 * t * t + 2), (x & 1) ? AMBER : hot, F_EMIT); }
}

function drawBulwark(p: Pix, ps: Pose, S: BulStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let bob = 0, ox = 0, liftL = 0, liftR = 0;
  if (a === 'idle') bob = f;
  if (a === 'move') { bob = [0, 1, 0, 1][f]; liftL = f === 0 ? 2 : 0; liftR = f === 2 ? 2 : 0; }
  if (a === 'pain') ox = -2;
  const stag = a === 'stagger';
  const oy = bob + (stag ? 6 : 0);
  // legs
  part(p, (l) => {
    if (stag) {
      l.limb(18, 46, 13, 52, 4, S.under); l.limb(13, 52, 16, 57, 3.4, S.armor2); l.box(11, 55, 10, 5, S.armor2);
      l.limb(30, 46, 35, 53, 4, S.under); l.box(30, 55, 11, 5, S.armor2);
      return;
    }
    l.limb(18, 42 + bob, 16, 56 - liftL, 4, S.under); l.limb(30, 42 + bob, 32, 56 - liftR, 4, S.under);
    l.box(10, 55 - liftL, 11, 5, S.armor2); l.box(27, 55 - liftR, 11, 5, S.armor2);
  });
  // torso
  part(p, (l) => {
    l.poly([10 + ox, 14 + oy, 38 + ox, 14 + oy, 36 + ox, 44 + oy, 12 + ox, 44 + oy], S.armor);
    for (let y = 15; y < 44; y++) for (let x = 30; x < 39; x++) if (l.has(x + ox, y + oy) && (x > 33 || ((x + y) & 1))) l.tint(x + ox, y + oy, (c) => lit(c, -0.3));
    for (let x = 12; x < 37; x++) if (l.has(x + ox, 32 + oy)) l.tint(x + ox, 32 + oy, (c) => lit(c, -0.5));
    l.box(13 + ox, 40 + oy, 22, 5, S.under);
  });
  if (stag) exposedCore(p, r, 24 + ox, 26 + oy, 4.2, f);
  // head (over the shield)
  part(p, (l) => {
    const hx = 24 + ox + (stag ? 3 : 0), hy = 9 + oy + (stag ? 2 : 0) + (a === 'attack' && f === 1 ? 4 : 0);
    l.ball(hx, hy, 6.4, 5.8, S.armor);
    l.box(hx - 5, hy + 2, 11, 4, S.armor2);
    for (let i = -5; i <= 5; i++) l.set(hx + i, hy - 1, 0x0a0606, F_FLAT);
    const ec = stag && f === 0 ? EYE_DIM : a === 'pain' ? 0xffffff : EYE;
    for (let i = -3; i <= 3; i++) l.set(hx + i, hy - 1, ec, F_EMIT);
    l.set(hx, hy - 1, a === 'attack' ? 0xffffff : EYE_HOT, F_EMIT);
    for (let i = -4; i <= 4; i++) l.set(hx + i, hy - 5, S.trim);
  });
  // shoulders
  part(p, (l) => {
    l.ball(10 + ox, 18 + oy, 6.5, 5.5, S.armor); l.ball(38 + ox, 18 + oy, 6.5, 5.5, S.armor);
    for (let x = 4; x < 17; x++) l.set(x + ox, 20 + oy, S.trim);
    for (let x = 32; x < 45; x++) l.set(x + ox, 20 + oy, S.trim);
  });
  // shield
  let sx = 7 + ox, sy = 15 + oy, sw = 33, sh = 42;
  if (a === 'attack' && f === 0) { sx = 3 + ox; sy = 17 + oy; sw = 31; sh = 40; }
  if (a === 'attack' && f === 1) { sx = 2; sy = 12 + bob; sw = 44; sh = 48; }
  if (stag) {
    // dropped and slanted to the left
    part(p, (l) => {
      const tmp = new Pix(p.w, p.h);
      towerShield(tmp, 0, 0, 30, 40, S);
      // shear-skew the shield as it tips over
      for (let y = 0; y < 40; y++) for (let x = 0; x < 30; x++) { const c = tmp.get(x, y); if (c < 0) continue; l.set(-6 + x + Math.round(y * 0.35), 22 + Math.round(y * 0.95) - Math.round(x * 0.2), c, tmp.f[y * p.w + x]); }
    });
    for (let y = 26; y < 58; y += 3) p.set(-4 + Math.round((y - 22) * 0.37) + 1, y, f ? AMBER : AMBER_DIM, F_EMIT);
  } else {
    part(p, (l) => towerShield(l, sx, sy, sw, sh, S));
    shieldStrip(p, sx, sy, sw, sh, a === 'attack' || a === 'charge' ? 1 : a === 'idle' && f === 1 ? 0.5 : 0.6);
    // gauntlet gripping the shield edge
    part(p, (l) => { l.box(sx + sw - 2, sy + Math.round(sh * 0.45), 4, 6, S.armor2); l.set(sx + sw - 1, sy + Math.round(sh * 0.45) + 1, S.rivet); });
  }
  if (a === 'attack' && f === 1) {
    for (let i = 0; i < 6; i++) { const y = 16 + i * 7; p.line(0, y, 2, y + 1, 0xe8e0d0, F_EMIT); p.line(45, y + 2, 47, y + 3, 0xe8e0d0, F_EMIT); }
    sparks(p, r, 24, 34, 14, 10);
  }
  if (a === 'pain') { sparks(p, r, 20 + ox, 30 + oy, 9, 12); glowBlob(p, 18 + ox, 30 + oy, 2, 0xffffff, 0xfff27a, 0xff8a20); }
}

function deadBulwark(p: Pix, S: BulStyle, r: Rng): void {
  pool(p, r, 24, 56, 21, 3.4, false);
  part(p, (l) => { l.limb(30, 52, 42, 54, 3.6, S.under); l.box(40, 50, 6, 9, S.armor2); l.limb(30, 56, 40, 58, 3.4, S.under); });
  part(p, (l) => { l.ball(9, 52, 5.4, 4.6, S.armor); for (let i = -4; i <= 4; i++) l.set(8, 52 + i * 0.4, 0x0a0606, F_FLAT); l.set(8, 52, 0x3a0808, F_FLAT); });
  part(p, (l) => { l.poly([12, 58, 13, 47, 32, 46, 34, 58], S.armor); });
  // shield lying on top of the body, foreshortened
  part(p, (l) => {
    const tmp = new Pix(p.w, p.h);
    towerShield(tmp, 0, 0, 30, 40, S);
    for (let y = 0; y < 40; y += 3) for (let x = 0; x < 30; x++) { const c = tmp.get(x, y); if (c < 0) continue; l.set(10 + x, 45 + Math.floor(y / 3), c); }
  });
  for (let x = 13; x < 38; x += 2) p.set(x, 45 + (x % 4 === 0 ? 0 : 0), AMBER_DIM, F_EMIT);
  sparks(p, r, 26, 50, 3, 2);
}

// ======================================================================
// WRAITH  36x56 — floating hooded cable-caster
// ======================================================================
interface WraithStyle { cloak: number; cloak2: number; cable: number; mask: number; maskHi: number; hand: number; trim: number }
const WRAITH: WraithStyle = { cloak: 0x34303e, cloak2: 0x4a4458, cable: 0x22222a, mask: 0x7ae0b8, maskHi: 0xd8fff0, hand: 0x8a8aa0, trim: 0x5a5470 };
const WRAITH_ELITE: WraithStyle = { cloak: 0x241a20, cloak2: 0x3a1a20, cable: 0x160e12, mask: 0xd8c070, maskHi: 0xfff4d0, hand: 0x6a5a5a, trim: 0xc01818 };

function drawWraith(p: Pix, ps: Pose, S: WraithStyle, r: Rng): void {
  const a = ps.act, f = ps.f;
  let oy = 0, ox = 0, sway = 0;
  if (a === 'idle') oy = f;
  if (a === 'move') { oy = [0, -1, 0, 1][f]; sway = [1, 0, -1, 0][f]; }
  if (a === 'pain') ox = 2;
  const stag = a === 'stagger';
  const charge = a === 'charge';
  if (stag) oy = 5;
  // hanging cables (behind)
  part(p, (l) => {
    for (let i = 0; i < 6; i++) {
      const x0 = 11 + i * 2.8 + ox;
      const ph = Math.sin(i * 1.9 + f * 1.4) * 2 + sway * 1.5;
      const len = 14 + ((i * 5) % 7) - (stag ? 6 : 0);
      l.limb(x0, 38 + oy, x0 + ph * 0.6, 38 + oy + len * 0.55, 0.9, S.cable);
      l.limb(x0 + ph * 0.6, 38 + oy + len * 0.55, x0 + ph, Math.min(55, 38 + oy + len), 0.7, S.cable);
    }
  }, { bevel: false });
  for (let i = 0; i < 6; i++) {
    const x0 = 11 + i * 2.8 + ox, ph = Math.sin(i * 1.9 + f * 1.4) * 2 + sway * 1.5, len = 14 + ((i * 5) % 7) - (stag ? 6 : 0);
    if (i % 2 === 0) p.set(x0 + ph, Math.min(55, 38 + oy + len), stag ? 0x2a5a4a : S.mask, F_EMIT);
  }
  // robe
  part(p, (l) => {
    const hb = 44 + oy, j = (a === 'move' ? f : f + 1) % 2;
    l.poly([
      12 + ox, 21 + oy, 24 + ox, 21 + oy, 30 + ox, 30 + oy, 27 + ox, hb - 4,
      25 + ox + sway, hb + (j ? 2 : 0), 22 + ox, hb - 3, 19 + ox + sway, hb + 4, 16 + ox, hb - 2,
      13 + ox + sway, hb + (j ? 0 : 2), 10 + ox, hb - 4, 6 + ox, 30 + oy,
    ], S.cloak);
    for (let y = 24; y < 48; y++) {
      if (l.has(15 + ox, y + oy)) l.tint(15 + ox, y + oy, (c) => lit(c, -0.35));
      if (l.has(21 + ox, y + oy) && y > 27) l.tint(21 + ox, y + oy, (c) => lit(c, -0.35));
      for (let x = 23; x < 31; x++) if (l.has(x + ox, y + oy) && ((x + y) & 1)) l.tint(x + ox, y + oy, (c) => lit(c, -0.25));
    }
    // tatters
    for (let i = 0; i < 6; i++) { const x = 9 + ox + i * 3.4, y = 36 + oy + ((i * 3) % 5); l.clear(x, y); l.clear(x, y + 1); }
    // mantle with cable ribs
    l.poly([10 + ox, 21 + oy, 26 + ox, 21 + oy, 29 + ox, 27 + oy, 18 + ox, 30 + oy, 7 + ox, 27 + oy], S.cloak2);
    for (let x = 9; x < 28; x++) if (l.has(x + ox, 27 + oy)) l.set(x + ox, 27 + oy, S.trim);
    for (const x of [13, 18, 23]) for (let y = 30; y < 40; y++) if (l.has(x + ox, y + oy)) l.set(x + ox, y + oy, S.cable);
    if (stag) l.poly([14 + ox, 26 + oy, 22 + ox, 26 + oy, 21 + ox, 36 + oy, 15 + ox, 36 + oy], 0x0e0c12);
  });
  // ghostly tapered fade below the hem
  for (let y = 44 + oy; y < 56; y++) {
    const t = (y - 44 - oy) / 10;
    const half = 7 * (1 - t);
    for (let x = Math.floor(18 + ox - half + sway * t * 2); x <= 18 + ox + half + sway * t * 2; x++) {
      if (bayer(x, y) < 0.75 - t * 0.85) p.blend(x, y, mix(S.cloak, 0x5a8a7a, t * 0.6), 200 - t * 140);
    }
  }
  if (stag) exposedCore(p, r, 18 + ox, 31 + oy, 3.2, f);
  // sleeves / arms + orbs
  const hands: number[][] = [];
  part(p, (l) => {
    let L: number[], R: number[];
    if (charge) { L = [9, 6]; R = [27, 6]; }
    else if (a === 'attack') { L = [5, 34]; R = f === 0 ? [32, 18] : [27, 26]; }
    else if (stag) { L = [7, 40]; R = [29, 40]; }
    else { L = [5 - sway, 33]; R = [31 - sway, 33]; }
    const ls = [9 + ox, 24 + oy], rs = [27 + ox, 24 + oy];
    const le = [(ls[0] + L[0] + ox) / 2 - 2, (ls[1] + L[1] + oy) / 2 + (charge ? 2 : 0)];
    const re = [(rs[0] + R[0] + ox) / 2 + 2, (rs[1] + R[1] + oy) / 2 + (charge ? 2 : 0)];
    l.limb(ls[0], ls[1], le[0], le[1], 2.2, S.cloak2); l.limb(le[0], le[1], L[0] + ox, L[1] + oy, 1.6, S.cloak);
    l.limb(rs[0], rs[1], re[0], re[1], 2.2, S.cloak2); l.limb(re[0], re[1], R[0] + ox, R[1] + oy, 1.6, S.cloak);
    for (const H of [[L[0] + ox, L[1] + oy], [R[0] + ox, R[1] + oy]]) {
      hands.push(H);
      l.ball(H[0], H[1], 1.6, 1.6, S.hand);
      for (const d of [-1, 0, 1]) l.set(H[0] + d * 1.4, H[1] + (charge ? -2 : 2), lit(S.hand, -0.2));
    }
  });
  // hood + mask
  part(p, (l) => {
    const hx = 18 + ox + (stag ? 1 : 0), hy = 15 + oy + (stag ? 3 : 0);
    l.ball(hx, hy, 6.5, 7.5, S.cloak2);
    l.poly([hx - 3, hy - 5, hx + 1, hy - 11, hx + 3, hy - 5], S.cloak2);
    for (let y = hy - 6; y < hy + 8; y++) if (l.has(hx - 6, y)) l.set(hx - 6, y, S.trim);
    l.ellipse(hx, hy + 1, 4.4, 5.2, 0x06050a, F_FLAT);
  });
  {
    const hx = 18 + ox + (stag ? 1 : 0), hy = 15 + oy + (stag ? 3 : 0);
    const flash = a === 'pain';
    for (let y = -4; y <= 4; y++) for (let x = -3; x <= 3; x++) {
      if ((x / 3.4) ** 2 + (y / 4.4) ** 2 > 1) continue;
      let c = y < -1 || x < -1 ? S.maskHi : S.mask;
      if (bayer(hx + x, hy + y) < 0.2) c = mix(c, 0x2a6a5a, 0.4);
      if (stag && x > 0 && f === 0) c = mul(S.mask, 0.45);
      if (flash) c = 0xffffff;
      p.set(hx + x, hy + 1 + y, c, F_EMIT);
    }
    // hollow eyes + mouth slit
    for (const ex of [-2, 1]) { p.set(hx + ex, hy, 0x020203, F_FLAT); p.set(hx + ex + 1, hy, 0x020203, F_FLAT); p.set(hx + ex, hy + 1, 0x020203, F_FLAT); p.set(hx + ex + 1, hy + 1, 0x101418, F_FLAT); }
    if (charge || a === 'attack') { p.set(hx - 1, hy + 1, HEX_HOT, F_EMIT); p.set(hx + 2, hy + 1, HEX_HOT, F_EMIT); }
    p.set(hx - 1, hy + 4, 0x0a1210, F_FLAT); p.set(hx, hy + 4, 0x0a1210, F_FLAT); p.set(hx + 1, hy + 4, 0x0a1210, F_FLAT);
    if (stag) { p.line(hx + 1, hy - 3, hx - 1, hy + 4, 0x020203, F_FLAT); }
  }
  // violet orbs
  if (!stag) {
    hands.forEach(([x, y], i) => {
      let rad = 1.8 + ((a === 'idle' || a === 'move') && f % 2 ? 0.4 : 0);
      if (a === 'attack' && i === 1) rad = f === 0 ? 2.8 : 4;
      if (charge) rad = 1.6;
      glowBlob(p, x, y + (charge ? -1 : 1), rad, HEX_HOT, HEX, HEX_EDGE);
    });
    if (a === 'attack' && f === 1) { glint(p, hands[1][0], hands[1][1] + 1, 0xffffff, HEX, 2); sparks(p, r, hands[1][0], hands[1][1], 6, 4); }
    if (charge) {
      const R = 4.5 + f * 1.6;
      glowBlob(p, 18 + ox, 4 + oy + 1, R, f ? 0xffffff : HEX_HOT, HEX_HOT, HEX, 0.35, r);
      glowBlob(p, 18 + ox, 5 + oy, R * 0.45, 0xffffff, 0xffffff, HEX_HOT);
      for (const [x, y] of hands) p.line(x, y - 1, 18 + ox + (x < 18 ? -2 : 2), 5 + oy, HEX, F_EMIT);
      for (let i = 0; i < 8; i++) { const t = r() * 6.28, d = R + 1 + r() * 3; p.set(18 + ox + Math.cos(t) * d, 5 + oy + Math.sin(t) * d, i % 2 ? HEX : HEX_EDGE, F_EMIT); }
    }
  } else {
    for (const [x, y] of hands) p.set(x, y + 1, HEX_EDGE, F_EMIT);
  }
  if (a === 'pain') sparks(p, r, 18 + ox, 24 + oy, 6, 7);
}

function deadWraith(p: Pix, S: WraithStyle, r: Rng): void {
  part(p, (l) => { for (let i = 0; i < 5; i++) l.limb(6 + i * 6, 54, 9 + i * 5.5, 50 + (i % 2) * 2, 0.8, S.cable); }, { bevel: false });
  part(p, (l) => {
    l.poly([2, 55, 6, 48, 14, 45, 24, 46, 32, 49, 34, 55], S.cloak);
    l.poly([8, 49, 22, 46, 26, 50, 12, 52], S.cloak2);
    for (let x = 6; x < 32; x += 4) l.clear(x, 55);
  });
  // cracked mask lying face-up
  for (let y = -2; y <= 2; y++) for (let x = -3; x <= 3; x++) if ((x / 3.4) ** 2 + (y / 2.4) ** 2 <= 1) p.set(26 + x, 51 + y, x > 0 ? mul(S.mask, 0.35) : mul(S.mask, 0.6), x > 0 ? F_FLAT : F_EMIT);
  p.set(25, 51, 0x020203, F_FLAT); p.set(27, 51, 0x020203, F_FLAT); p.line(27, 49, 26, 53, 0x020203, F_FLAT);
  p.set(10, 53, HEX_EDGE, F_EMIT); p.set(11, 53, 0x3a0a5a, F_EMIT);
  for (let i = 0; i < 6; i++) p.blend(6 + r() * 24, 42 + r() * 6, 0x5a8a7a, 70);
}

// ======================================================================
// registry
// ======================================================================
export const WAVE2_TYPES = ['leech', 'sentinel', 'bomber', 'mortar', 'bulwark', 'wraith'];

export function enemyDef2(type: string, elite: boolean): EnemyDef | null {
  switch (type) {
    case 'leech': { const S = elite ? LEECH_ELITE : LEECH; return { w: 28, h: 20, worldH: 0.7, draw: (p, ps, r) => drawLeech(p, ps, S, r), dead: (p, r) => deadLeech(p, S, r), hasCharge: false }; }
    case 'sentinel': { const S = elite ? SENT_ELITE : SENT; return { w: 40, h: 48, worldH: 2.2, draw: (p, ps, r) => drawSentinel(p, ps, S, r), dead: (p, r) => deadSentinel(p, S, r), hasCharge: true }; }
    case 'bomber': { const S = elite ? BOMBER_ELITE : BOMBER; return { w: 30, h: 40, worldH: 1.6, draw: (p, ps, r) => drawBomber(p, ps, S, r), dead: (p, r) => deadBomber(p, S, r), hasCharge: true }; }
    case 'mortar': { const S = elite ? MORTAR_ELITE : MORTAR; return { w: 44, h: 40, worldH: 1.8, draw: (p, ps, r) => drawMortar(p, ps, S, r), dead: (p, r) => deadMortar(p, S, r), hasCharge: true }; }
    case 'bulwark': { const S = elite ? BULWARK_ELITE : BULWARK; return { w: 48, h: 60, worldH: 2.7, draw: (p, ps, r) => drawBulwark(p, ps, S, r), dead: (p, r) => deadBulwark(p, S, r), hasCharge: false }; }
    case 'wraith': { const S = elite ? WRAITH_ELITE : WRAITH; return { w: 36, h: 56, worldH: 2.4, draw: (p, ps, r) => drawWraith(p, ps, S, r), dead: (p, r) => deadWraith(p, S, r), hasCharge: true }; }
    default: return null;
  }
}


