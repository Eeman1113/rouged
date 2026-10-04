// HUD face (32x36): DOOM-guy style, but a scanned digital mind — scanlines, glitch, pixelation.
import { Pix, makeRng, Rng, ramp, mix, mul, lit, gray, F_EMIT, F_FLAT, cr, cg, cb, rgb } from './core';

export type FaceStateK = 'healthy' | 'hurt' | 'damaged' | 'critical' | 'grin' | 'dead' | 'ouch' | 'look_left' | 'look_right';

const FW = 32, FH = 36;
const BG = 0x0b1214;
const SKIN = 0xc48a68;
const BLOOD = 0xa8121a, BLOOD_D = 0x5a060c;

type Eyes = 'open' | 'closed' | 'wide' | 'squeeze' | 'static' | 'empty' | 'squint';
type Mouth = 'neutral' | 'frown' | 'scream' | 'grin' | 'grimace' | 'slack';
interface FaceOpts {
  eyes: Eyes; look: number; mouth: Mouth; brow: number; // brow: + angry (inner down), - worried/raised
  pale: number; dx: number; dy: number; eyeDy: number;
}

function headHalfWidth(y: number, age: number): number {
  const cy = 17.5, ry = 13.5;
  const dy = (y + 0.5 - cy) / ry;
  if (Math.abs(dy) > 1) return 0;
  let w = 10.2 * Math.sqrt(1 - dy * dy);
  if (dy > 0.25) w *= 1 - (dy - 0.25) * (0.55 + age * 0.1);
  return w;
}

function drawFace(p: Pix, age: number, o: FaceOpts, r: Rng): void {
  const ox = o.dx, oy = o.dy;
  const skin = mix(gray(SKIN, age * 0.35 + o.pale * 0.5), 0xe8dcd0, o.pale * 0.35);
  const hair = mix(0x3a2416, 0xa4a29c, Math.min(1, age * 1.15));
  // collar / armor
  p.rect(10 + ox, 29, 12, 7, mul(skin, 0.62));
  for (let x = 10; x < 22; x++) p.set(x + ox, 29, mul(skin, 0.45));
  p.poly([2, 36, 3, 33, 10, 31, 22, 31, 29, 33, 30, 36], 0x4a5a46);
  p.poly([3, 36, 4, 34, 9, 33, 12, 36], 0x5c625c);
  p.poly([29, 36, 28, 34, 23, 33, 20, 36], 0x3a4636);
  p.set(16, 33, 0xc8faff, F_EMIT);
  // ears
  for (const ex of [5, 26]) { p.ellipse(ex + 0.5 + ox, 18 + oy, 1.6, 2.6, lit(skin, -0.25)); p.set(ex + ox + (ex < 16 ? 1 : 0), 18 + oy, lit(skin, -0.6)); }
  // head
  for (let y = 3; y < 32; y++) {
    const hw = headHalfWidth(y, age);
    if (hw <= 0) continue;
    for (let x = Math.round(16 - hw); x < Math.round(16 + hw); x++) {
      const nx = (x + 0.5 - 16) / hw, ny = (y + 0.5 - 17.5) / 13.5;
      let l = -nx * 0.55 - ny * 0.35 + 0.25;
      // cheek hollows with age, cheekbones
      if (y >= 19 && y <= 24 && Math.abs(nx) > 0.45 && Math.abs(nx) < 0.85) l -= 0.25 + age * 0.45;
      if (y === 18 && Math.abs(nx) > 0.4 && Math.abs(nx) < 0.8) l += 0.2;
      // eye sockets
      if (y >= 14 && y <= 17 && Math.abs(Math.abs(x - 15.5) - 5) < 3) l -= 0.2 + age * 0.25;
      p.set(x + ox, y + oy, ramp(skin, l, x, y, 5));
    }
  }
  // hair (buzz) — hairline recedes with age
  for (let y = 3; y < 11; y++) {
    const hw = headHalfWidth(y, age);
    for (let x = Math.round(16 - hw); x < Math.round(16 + hw); x++) {
      const nx = Math.abs(x + 0.5 - 16) / Math.max(1, hw);
      const line = 8 - age * 2.2 - (nx > 0.55 ? age * 2.5 : 0) + (nx > 0.85 ? 3 : 0);
      if (y > line) continue;
      if ((x + y * 3) % 5 === 0 || r() < 0.18) p.set(x + ox, y + oy, lit(hair, 0.25));
      else p.set(x + ox, y + oy, ramp(hair, -nx * 0.6 - 0.1, x, y, 3));
    }
  }
  // scar across left brow
  p.set(10 + ox, 11 + oy, mix(skin, 0xf0d0c0, 0.5)); p.set(11 + ox, 12 + oy, mix(skin, 0xf0d0c0, 0.5)); p.set(11 + ox, 13 + oy, mix(skin, 0x8a5040, 0.5));
  // wrinkles
  if (age > 0.35) for (let x = 12; x < 21; x++) if (x % 3 !== 0) p.set(x + ox, 9 + oy, lit(skin, -0.35));
  if (age > 0.6) for (let x = 11; x < 22; x++) if (x % 4 !== 1) p.set(x + ox, 11 + oy, lit(skin, -0.32));
  if (age > 0.5) { p.set(7 + ox, 16 + oy, lit(skin, -0.45)); p.set(7 + ox, 17 + oy, lit(skin, -0.4)); p.set(24 + ox, 16 + oy, lit(skin, -0.45)); p.set(24 + ox, 17 + oy, lit(skin, -0.4)); }
  // nasolabial folds
  if (age > 0.25) { p.line(13 + ox, 22 + oy, 11 + ox, 26 + oy, lit(skin, -0.3 - age * 0.25)); p.line(19 + ox, 22 + oy, 21 + ox, 26 + oy, lit(skin, -0.3 - age * 0.25)); }
  // stubble
  const stub = 0.12 + age * 0.55;
  const stubC = mix(0x3a2c24, 0xb8b4ac, age);
  for (let y = 22; y < 31; y++) for (let x = 7; x < 26; x++) {
    if (!p.has(x + ox, y + oy) || Math.abs(x - 16) < 2 && y < 24) continue;
    if (y < 24 && Math.abs(x - 16) > 7) continue;
    if (r() < stub * 0.6) p.tint(x + ox, y + oy, (c) => mix(c, stubC, 0.55));
  }
  // nose
  const ey = 15 + oy + o.eyeDy;
  for (let y = 15; y < 22; y++) { p.set(16 + ox, y + oy, lit(skin, 0.3)); p.set(17 + ox, y + oy, lit(skin, -0.25)); }
  p.set(14 + ox, 22 + oy, lit(skin, -0.55)); p.set(18 + ox, 22 + oy, lit(skin, -0.55));
  p.set(15 + ox, 22 + oy, lit(skin, -0.3)); p.set(16 + ox, 22 + oy, lit(skin, -0.15)); p.set(17 + ox, 22 + oy, lit(skin, -0.3));
  p.set(16 + ox, 21 + oy, lit(skin, 0.15));
  // brows
  for (let i = 0; i < 5; i++) {
    const t = i / 4; // 0 outer .. 1 inner
    const dyb = Math.round(o.brow * (t - 0.5) * 2);
    p.set(9 + i + ox, 13 + oy + dyb + (o.eyes === 'wide' ? -1 : 0), hair);
    p.set(23 - i + ox, 13 + oy + dyb + (o.eyes === 'wide' ? -1 : 0), hair);
  }
  // under-eye bags
  if (age > 0.3 || o.pale > 0.3) for (const bx of [10, 19]) for (let i = 0; i < 4; i++) p.set(bx + i + ox, ey + 2, lit(skin, -0.35));
  // eyes
  for (const [bx, side] of [[10, -1], [19, 1]] as const) {
    const x0 = bx + ox;
    switch (o.eyes) {
      case 'closed':
        for (let i = 0; i < 4; i++) p.set(x0 + i, ey + 1, lit(skin, -0.6));
        break;
      case 'squeeze':
        for (let i = 0; i < 4; i++) p.set(x0 + i, ey + (side < 0 ? (i < 2 ? i : 3 - i) : (i < 2 ? i : 3 - i)) , 0x2a1410);
        p.set(x0 + (side < 0 ? 0 : 3), ey - 1, 0x2a1410);
        break;
      case 'static':
        for (let y = -1; y < 3; y++) for (let i = -1; i < 5; i++) {
          const v = r();
          p.set(x0 + i, ey + y, v < 0.33 ? 0xffffff : v < 0.66 ? 0x8a9a9a : 0x1a2224, F_EMIT);
        }
        break;
      case 'empty':
        for (let y = 0; y < 2; y++) for (let i = 0; i < 4; i++) p.set(x0 + i, ey + y, 0x0a0606);
        break;
      default: {
        const rows = o.eyes === 'wide' ? 3 : o.eyes === 'squint' ? 1 : 2;
        const top = o.eyes === 'wide' ? ey - 1 : o.eyes === 'squint' ? ey + 1 : ey;
        for (let y = 0; y < rows; y++) for (let i = 0; i < 4; i++) p.set(x0 + i, top + y, i === 0 || i === 3 ? 0xc8beb4 : 0xece6dc);
        const ix = x0 + 1 + o.look + (o.look === 0 ? 0 : 0);
        if (o.eyes === 'wide') { p.set(ix + (o.look > 0 ? 1 : 0), ey, 0x101010); }
        else {
          p.set(ix, top, 0x3c5262); p.set(ix + 1, top, 0x2a3a46);
          if (rows > 1) { p.set(ix, top + 1, 0x2a3a46); p.set(ix + 1, top + 1, 0x101418); }
          p.set(ix, top, 0x6a8a9a);
        }
        for (let i = 0; i < 4; i++) p.set(x0 + i, top - 1, 0x2a1610);
      }
    }
  }
  // mouth
  const my = 25 + oy, mx = 16 + ox;
  const lipD = 0x6a2a26, lipL = mix(skin, 0xc06a5a, 0.4);
  switch (o.mouth) {
    case 'neutral':
      for (let x = -3; x <= 3; x++) p.set(mx + x - 0.5, my, lipD);
      for (let x = -2; x <= 2; x++) p.set(mx + x - 0.5, my + 1, lipL);
      break;
    case 'frown':
      for (let x = -3; x <= 3; x++) p.set(mx + x - 0.5, my + (Math.abs(x) === 3 ? 1 : 0), lipD);
      for (let x = -2; x <= 2; x++) p.set(mx + x - 0.5, my + 1, lipL);
      break;
    case 'slack':
      p.ellipse(mx - 0.5, my + 0.5, 2.4, 1.2, 0x2a0a0a);
      break;
    case 'scream':
      p.ellipse(mx - 0.5, my + 1, 3.6, 3.4, 0x1a0606);
      for (let x = -2; x <= 1; x++) p.set(mx + x, my - 2, 0xe0d8c8);
      p.set(mx - 1, my + 2, 0x6a1a1a); p.set(mx, my + 2, 0x6a1a1a);
      for (let x = -3; x <= 2; x++) p.set(mx + x, my - 3, lipD);
      break;
    case 'grin': {
      // too wide: nearly ear to ear, curling up
      for (let x = -9; x <= 8; x++) {
        const curl = Math.round(Math.pow(Math.abs(x + 0.5) / 9, 2.2) * 4);
        const yt = my - 1 - curl, yb = my + 2 - Math.round(curl * 0.6);
        p.set(mx + x, yt - 1, lipD);
        for (let y = yt; y <= yb; y++) {
          const gap = (x & 1) === 0 && Math.abs(x) < 8;
          p.set(mx + x, y, y === Math.round((yt + yb) / 2) ? 0x3a1212 : gap ? 0xa89c8c : 0xf2ecdc);
        }
        p.set(mx + x, yb + 1, lipD);
      }
      // cheeks pushed up
      for (const cx of [8, 23]) p.set(cx + ox, 20 + oy, lit(skin, 0.3));
      break;
    }
    case 'grimace':
      p.rect(mx - 4, my - 1, 8, 3, 0xe8e0d0);
      for (let x = -4; x < 4; x += 2) p.set(mx + x + 1, my - 1, 0x9a9080);
      for (let x = -4; x < 4; x++) p.set(mx + x, my, 0x5a2a22);
      for (let x = -5; x <= 4; x++) { p.set(mx + x, my - 2, lipD); p.set(mx + x, my + 2, lipD); }
      break;
  }
}

function bleed(p: Pix, r: Rng, x: number, y: number, len: number): void {
  for (let i = 0; i < len; i++) {
    p.set(x, y + i, i === len - 1 ? BLOOD_D : BLOOD);
    if (r() < 0.25) x += r() < 0.5 ? -1 : 1;
  }
  p.set(x, y + len, BLOOD_D);
}

function splat(p: Pix, r: Rng, x: number, y: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const xx = x + Math.round((r() - 0.5) * 5), yy = y + Math.round((r() - 0.5) * 4);
    if (p.get(xx, yy) !== BG && p.has(xx, yy)) p.set(xx, yy, r() < 0.6 ? BLOOD : BLOOD_D);
  }
}

function pixelate(p: Pix, r: Rng, n: number, sz: number): void {
  for (let k = 0; k < n; k++) {
    const x0 = 4 + Math.floor(r() * (FW - 8 - sz)), y0 = 4 + Math.floor(r() * (FH - 10 - sz));
    let R = 0, G = 0, B = 0, c = 0;
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) { const v = p.get(x0 + x, y0 + y); if (v >= 0) { R += cr(v); G += cg(v); B += cb(v); c++; } }
    if (!c) continue;
    const col = rgb(R / c, G / c, B / c);
    const off = r() < 0.5 ? Math.round((r() - 0.5) * 4) : 0;
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) p.set(x0 + x + off, y0 + y, col);
  }
}

function glitchRows(p: Pix, r: Rng, n: number, maxShift: number): void {
  for (let k = 0; k < n; k++) {
    const y = 3 + Math.floor(r() * 28), h = 1 + Math.floor(r() * 2);
    const d = (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * maxShift));
    for (let yy = y; yy < y + h; yy++) {
      const row: number[] = [];
      for (let x = 0; x < FW; x++) row.push(p.get(x, yy));
      const tintC = d > 0 ? 0x30e0ff : 0xff3050;
      for (let x = 0; x < FW; x++) { const c = row[Math.min(FW - 1, Math.max(0, x - d))]; if (c >= 0) p.set(x, yy, c === BG ? c : mix(c, tintC, 0.18)); }
    }
  }
}

function scanlines(p: Pix, strength: number): void {
  for (let y = 1; y < FH; y += 2) for (let x = 0; x < FW; x++) p.tint(x, y, (c) => mul(c, strength));
}

function shatter(src: Pix, r: Rng): Pix {
  const out = new Pix(FW, FH);
  out.fill(BG);
  const seeds: number[][] = [];
  for (let i = 0; i < 7; i++) seeds.push([6 + r() * 20, 5 + r() * 24]);
  const owner = new Int8Array(FW * FH);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    let best = 0, bd = 1e9, second = 1e9;
    seeds.forEach((s, i) => { const d = (x - s[0]) ** 2 + (y - s[1]) ** 2; if (d < bd) { second = bd; bd = d; best = i; } else if (d < second) second = d; });
    owner[y * FW + x] = Math.sqrt(second) - Math.sqrt(bd) < 0.9 ? -1 : best;
  }
  const offs = seeds.map((s) => {
    const dx = s[0] - 16, dy = s[1] - 17, m = Math.hypot(dx, dy) || 1;
    const k = 0.6 + r() * 1.4;
    return [Math.round((dx / m) * k), Math.round((dy / m) * k)];
  });
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const o = owner[y * FW + x];
    if (o < 0) continue;
    const c = src.get(x, y);
    if (c < 0 || c === BG) continue;
    const nx = x + offs[o][0], ny = y + offs[o][1];
    out.set(nx, ny, gray(c, 0.7));
  }
  // cyan digital edges on shards
  const cp = out.clone();
  for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
    if (cp.get(x, y) === BG) continue;
    if (cp.get(x + 1, y) === BG || cp.get(x, y + 1) === BG) { if (r() < 0.3) out.set(x, y, 0x5ad8e8, F_EMIT); }
  }
  return out;
}

export function buildFace(state: FaceStateK, age: number, frame: number): HTMLCanvasElement {
  const r = makeRng(1000 + frame * 77 + Math.round(age * 10) * 7 + state.length * 131);
  const fr = makeRng(4242 + state.length * 11); // stable per-state randomness
  const p = new Pix(FW, FH);
  p.fill(BG);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (((x + y * 2) % 7) === 0) p.set(x, y, 0x0f1a1c);
  const o: FaceOpts = { eyes: 'open', look: 0, mouth: 'neutral', brow: 0, pale: 0, dx: 0, dy: 0, eyeDy: 0 };
  const blink = frame % 4 === 3;
  switch (state) {
    case 'healthy': if (blink) o.eyes = 'closed'; break;
    case 'look_left': o.look = -1; o.dx = -1; break;
    case 'look_right': o.look = 1; o.dx = 1; break;
    case 'hurt': o.mouth = 'frown'; o.brow = 1; o.pale = 0.1; if (blink) o.eyes = 'closed'; break;
    case 'damaged': o.mouth = 'frown'; o.brow = 2; o.pale = 0.25; o.eyes = frame % 2 ? 'squint' : 'open'; o.dx = frame % 4 === 1 ? 1 : frame % 4 === 3 ? -1 : 0; o.eyeDy = frame % 4 === 2 ? 1 : 0; break;
    case 'critical': o.mouth = 'scream'; o.brow = -2; o.pale = 0.6; o.eyes = 'static'; o.dx = frame % 2; break;
    case 'grin': o.mouth = 'grin'; o.brow = -1; o.eyes = 'wide'; break;
    case 'ouch': o.mouth = 'grimace'; o.brow = 2; o.eyes = 'squeeze'; o.dx = -1; o.dy = 1; break;
    case 'dead': o.mouth = 'slack'; o.eyes = 'empty'; o.pale = 0.8; break;
  }
  drawFace(p, age, o, fr);
  // damage overlays
  if (state === 'hurt' || state === 'damaged' || state === 'critical' || state === 'ouch') {
    bleed(p, fr, 12 + o.dx, 6, state === 'hurt' ? 6 : 9);
    bleed(p, fr, 14 + o.dx, 23, 2);
  }
  if (state === 'damaged' || state === 'critical') {
    bleed(p, fr, 21 + o.dx, 8, 12);
    splat(p, fr, 9 + o.dx, 20, 8);
    for (let i = 0; i < 4; i++) p.tint(19 + i + o.dx, 18, (c) => mix(c, 0x5a2a5a, 0.5));
  }
  if (state === 'critical') { splat(p, fr, 22, 22, 10); splat(p, fr, 14, 10, 8); bleed(p, fr, 18 + o.dx, 27, 5); }
  if (state === 'damaged') pixelate(p, r, 3, 3);
  if (state === 'critical') pixelate(p, r, 5, 4);
  let out = p;
  if (state === 'dead') out = shatter(p, fr);
  // glitch
  const gl = state === 'critical' ? 4 : state === 'damaged' ? 2 : state === 'dead' ? 1 : frame % 4 === 2 ? 1 : 0;
  if (gl) glitchRows(out, r, gl, state === 'critical' ? 3 : 2);
  scanlines(out, state === 'dead' ? 0.7 : 0.86);
  // thin frame tint at the very top/bottom: digital capture border
  for (let x = 0; x < FW; x++) { out.set(x, 0, 0x1a3034, F_FLAT); out.set(x, FH - 1, 0x0a1012, F_FLAT); }
  return out.toCanvas();
}
