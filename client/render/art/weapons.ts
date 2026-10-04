// First-person weapon sprites (160x120), DOOM style: gun bottom-center, armored gloved hands.
import { Pix, Rng, makeRng, part, glowBlob, sparks, mul, mix, lit, ramp, F_EMIT, F_FLAT, bayer } from './core';

export const WW = 160, WH = 120;

const ARMOR = 0x4e5e48, ARMOR2 = 0x646c62, GLOVE = 0x3c4438, KNUCK = 0x8a9288;

/** Tapered shaded cylinder (perspective barrels). */
export function cyl(l: Pix, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, col: number, flag = 0): void {
  const R = Math.max(r0, r1);
  const minx = Math.floor(Math.min(x0, x1) - R - 1), maxx = Math.ceil(Math.max(x0, x1) + R + 1);
  const miny = Math.floor(Math.min(y0, y1) - R - 1), maxy = Math.ceil(Math.max(y0, y1) + R + 1);
  const vx = x1 - x0, vy = y1 - y0, len2 = vx * vx + vy * vy || 1, len = Math.sqrt(len2);
  let nx = -vy / len, ny = vx / len;
  if (nx * -0.8 + ny * -0.4 < 0) { nx = -nx; ny = -ny; }
  for (let y = miny; y <= maxy; y++)
    for (let x = minx; x <= maxx; x++) {
      const px = x + 0.5 - x0, py = y + 0.5 - y0;
      let t = (px * vx + py * vy) / len2;
      if (t < 0 || t > 1) continue;
      const rr = r0 + (r1 - r0) * t;
      const qx = px - vx * t, qy = py - vy * t;
      const d = Math.sqrt(qx * qx + qy * qy);
      if (d > rr) continue;
      const side = (qx * nx + qy * ny) / rr;
      // specular stripe on lit side
      const l2 = side > 0.45 && side < 0.65 ? 1 : side * 0.85;
      l.set(x, y, ramp(col, l2, x, y), flag);
    }
}

/** Armored gloved fist seen from the back. dir=1 forearm toward bottom-right, -1 toward bottom-left. */
function hand(l: Pix, cx: number, cy: number, s: number, dir: number): void {
  // forearm/bracer
  cyl(l, cx + 7 * s * dir, cy + 6 * s, 8 * s, cx + 20 * s * dir, WH + 14, 11 * s, ARMOR);
  for (let k = 0; k < 2; k++) {
    const t = 0.3 + k * 0.32;
    const bx = cx + (7 + 13 * t) * s * dir, by = cy + 6 * s + (WH + 10 - cy - 6 * s) * t;
    for (let i = -9; i <= 9; i++) l.set(bx + i * s * 0.9, by + Math.abs(i) * 0.25, lit(ARMOR, -0.55));
  }
  // fingers curling around the grip (toward the gun = -dir side)
  for (let i = 0; i < 4; i++) {
    const fy = cy - 5 * s + i * 3.6 * s;
    cyl(l, cx - 2 * s * dir, fy, 2.4 * s, cx - 11 * s * dir, fy + 1.5 * s, 2.1 * s, GLOVE);
    l.set(cx - 11 * s * dir, fy + 1.5 * s, lit(GLOVE, -0.5));
  }
  // back of hand: armored plate + knuckle studs
  l.ball(cx + 1 * s * dir, cy, 7.5 * s, 8.5 * s, ARMOR2);
  for (let i = 0; i < 4; i++) l.ball(cx - 5 * s * dir, cy - 5 * s + i * 3.6 * s, 1.9 * s, 1.6 * s, KNUCK);
  for (let j = -5; j <= 5; j++) l.set(cx + 3 * s * dir, cy + j * s, lit(ARMOR2, -0.45));
  // thumb over the top
  cyl(l, cx + 1 * s * dir, cy - 7 * s, 2.8 * s, cx - 7 * s * dir, cy - 9 * s, 2.3 * s, GLOVE);
}

function flash(p: Pix, r: Rng, x: number, y: number, rad: number, hot: number, mid: number, edge: number, rays: number): void {
  // translucent outer halo
  for (let yy = Math.floor(y - rad * 1.6); yy <= y + rad * 1.6; yy++)
    for (let xx = Math.floor(x - rad * 1.6); xx <= x + rad * 1.6; xx++) {
      const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y) / (rad * 1.6);
      if (d < 1 && !p.has(xx, yy) && bayer(xx, yy) > d * 0.9) p.blend(xx, yy, edge, 120, F_EMIT);
    }
  for (let i = 0; i < rays; i++) {
    const ang = (i / rays) * Math.PI * 2 + r() * 0.4;
    const L = rad * (1.4 + r() * 0.9);
    for (let d = rad * 0.5; d < L; d++) {
      const w = Math.max(0, Math.round((1 - d / L) * 2));
      for (let k = -w; k <= w; k++) p.set(x + Math.cos(ang) * d - Math.sin(ang) * k, y + Math.sin(ang) * d + Math.cos(ang) * k, d < L * 0.6 ? mid : edge, F_EMIT);
    }
  }
  glowBlob(p, x, y, rad, hot, mid, edge, 0.35, r);
}

function smoke(p: Pix, r: Rng, x: number, y: number, rad: number, alpha: number): void {
  for (let i = 0; i < 6; i++) {
    const cx = x + (r() - 0.5) * rad * 1.5, cy = y - r() * rad * 1.5, rr = rad * (0.4 + r() * 0.5);
    for (let yy = Math.floor(cy - rr); yy <= cy + rr; yy++)
      for (let xx = Math.floor(cx - rr); xx <= cx + rr; xx++) {
        const d = Math.hypot(xx - cx, yy - cy) / rr;
        if (d < 1 && bayer(xx, yy) > d * 0.8) p.blend(xx, yy, mix(0x8a8682, 0x4a4644, d), alpha);
      }
  }
}

// ------------------------------------------------------------------ PULSE
function drawPulse(p: Pix, r: Rng, dy: number, fl: number): void {
  const y = (v: number): number => v + dy;
  const BODY = 0x3c414a, TOP = 0x5a616c, DARK = 0x22252b;
  // left hand under the fore-grip (behind body)
  part(p, (l) => hand(l, 52, y(98), 1.35, -1));
  part(p, (l) => {
    l.poly([50, y(124), 110, y(124), 97, y(60), 63, y(60)], BODY);
    // side bevel panels
    l.poly([50, y(124), 58, y(124), 66, y(62), 63, y(60)], lit(BODY, 0.25));
    l.poly([102, y(124), 110, y(124), 97, y(60), 94, y(62)], lit(BODY, -0.45));
    // vents
    for (let k = 0; k < 4; k++) { l.rect(58 + k * 0.7, y(84 + k * 7), 6, 2, DARK); l.rect(97 - k * 0.7, y(84 + k * 7), 6, 2, DARK); }
    // panel seams
    l.line(70, y(120), 72, y(64), lit(BODY, -0.4)); l.line(90, y(120), 88, y(64), lit(BODY, -0.4));
  });
  part(p, (l) => {
    l.poly([63, y(62), 97, y(62), 92, y(44), 68, y(44)], TOP);
    l.box(69, y(32), 22, 14, BODY); // emitter housing
    l.rect(71, y(34), 18, 2, lit(BODY, 0.3));
    l.box(75, y(50), 10, 6, DARK); // sight block
  });
  // energy strip (amber) running back from the emitter
  for (let yy = y(56); yy < WH; yy++) {
    const t = (yy - y(56)) / 64;
    const w = 1 + Math.floor(t * 2.5);
    for (let k = -w; k <= w; k++) {
      const c = Math.abs(k) === w ? 0xc86a10 : k === 0 ? 0xfff0c0 : 0xffb030;
      p.set(80 + k, yy, (yy + (fl > 0 ? 1 : 0)) % 9 === 0 && Math.abs(k) < w ? 0xffd890 : c, F_EMIT);
    }
  }
  // cyan emitter
  p.ellipse(80, y(39), 6, 4, 0x0a1418, F_FLAT);
  glowBlob(p, 80, y(39), fl > 0 ? 4.5 : 3.5, 0xeaffff, 0x4ae8ff, 0x1a7a9a);
  p.set(77, y(51), 0xff3020, F_EMIT); p.set(83, y(51), 0xff3020, F_EMIT);
  part(p, (l) => hand(l, 110, y(104), 1.4, 1));
  if (fl === 2) flash(p, r, 80, y(30), 13, 0xffffff, 0x9af8ff, 0x2ab8e8, 9);
  if (fl === 1) flash(p, r, 80, y(32), 6, 0xffffff, 0x9af8ff, 0x2ab8e8, 6);
}

// ------------------------------------------------------------------ BREACHER
const GUNM = 0x4c4c54, RUST = 0x8a4a26, WOOD = 0x6e3c1e;

function rustify(l: Pix, r: Rng, n: number): void {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * WW), y = Math.floor(r() * WH);
    if (!l.has(x, y)) continue;
    const s = 1 + Math.floor(r() * 2);
    for (let j = 0; j < s; j++) for (let k = 0; k < s; k++) l.tint(x + j, y + k, (c) => mix(c, r() < 0.5 ? RUST : 0x5a2a14, 0.6));
  }
}

function woodGrain(l: Pix, r: Rng, x0: number, x1: number, y0: number, y1: number): void {
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      if (!l.has(x, y)) continue;
      const g = Math.sin(x * 0.55 + Math.sin(y * 0.18) * 2.2);
      if (g > 0.75) l.tint(x, y, (c) => lit(c, -0.35));
      else if (g < -0.9) l.tint(x, y, (c) => lit(c, 0.18));
      if (r() < 0.02) l.tint(x, y, (c) => lit(c, -0.5));
    }
}

function drawBreacher(p: Pix, r: Rng, dy: number, mode: 'idle' | 'fire0' | 'fire1' | 'fire2' | 'open' | 'eject' | 'shut'): void {
  const y = (v: number): number => v + dy;
  const rr = makeRng(77);
  const isOpen = mode === 'open' || mode === 'eject';
  // wooden fore-end + left hand
  part(p, (l) => {
    l.poly([52, y(124), 108, y(124), 101, y(86), 59, y(86)], WOOD);
    woodGrain(l, rr, 52, 108, y(86), WH);
    l.rect(58, y(86), 44, 2, GUNM);
  });
  if (!isOpen) {
    part(p, (l) => {
      cyl(l, 67, y(126), 12, 74.5, y(42), 7.2, GUNM);
      cyl(l, 93, y(126), 12, 85.5, y(42), 7.2, GUNM);
      // rib + bead
      l.poly([78, y(120), 82, y(120), 81, y(42), 79, y(42)], lit(GUNM, -0.4));
      for (let yy = 44; yy < 120; yy++) { const xx = 80 + (yy - 44) * 0; l.set(xx, y(yy), 0x141418, F_FLAT); }
      l.rect(79, y(38), 2, 3, 0xd8b050);
      rustify(l, rr, 70);
    });
    // muzzles
    for (const mx of [74.5, 85.5]) {
      p.ellipse(mx, y(42), 6.4, 3.8, lit(GUNM, 0.5), F_FLAT);
      p.ellipse(mx, y(42.4), 4.6, 2.6, 0x0a0808, F_FLAT);
      p.ellipse(mx, y(42.8), 2.8, 1.4, 0x000000, F_FLAT);
    }
    // hinge band
    part(p, (l) => { l.box(60, y(100), 40, 6, mul(GUNM, 0.8)); l.set(64, y(102), 0xd8b050); l.set(95, y(102), 0xd8b050); });
  } else {
    // barrels dropped: breech faces the player
    part(p, (l) => {
      cyl(l, 71, y(74), 9.5, 66, y(124), 11, GUNM);
      cyl(l, 89, y(74), 9.5, 94, y(124), 11, GUNM);
      rustify(l, rr, 50);
    });
    for (const bx of [71, 89]) {
      p.ellipse(bx, y(74), 9, 7, lit(GUNM, 0.45), F_FLAT);
      p.ellipse(bx, y(74), 6.5, 5, 0x0c0a0a, F_FLAT);
      if (mode === 'open') {
        p.ellipse(bx, y(74), 6, 4.6, 0xb08a3a, F_FLAT); // spent brass rims
        p.ellipse(bx, y(74), 4.2, 3.2, 0x7a2018, F_FLAT);
        p.ellipse(bx - 0.5, y(73.5), 1.4, 1.2, 0xe0c080, F_FLAT);
      }
    }
  }
  part(p, (l) => hand(l, 56, y(100), 1.35, -1));
  // receiver + grip + right hand
  part(p, (l) => {
    l.poly([96, y(124), 130, y(124), 124, y(98), 104, y(94)], WOOD);
    woodGrain(l, rr, 96, 132, y(94), WH);
    l.box(100, y(92), 22, 8, GUNM);
    l.rect(108, y(90), 6, 2, 0xb08a3a); // lever
  });
  part(p, (l) => hand(l, 116, y(106), 1.4, 1));
  if (mode === 'eject') {
    const shell = (sx: number, sy: number, ang: number): void => {
      part(p, (l) => {
        const dx = Math.cos(ang), dy2 = Math.sin(ang);
        cyl(l, sx, sy, 3.2, sx + dx * 9, sy + dy2 * 9, 3.2, 0xb01818);
        cyl(l, sx - dx * 1, sy - dy2 * 1, 3.6, sx + dx * 2, sy + dy2 * 2, 3.6, 0xc89a3a);
      });
    };
    shell(60, y(40), -2.2); shell(98, y(28), -0.9);
    smoke(p, r, 80, y(62), 9, 110);
  }
  if (mode === 'shut') {
    for (let i = 0; i < 4; i++) p.line(58 + i * 14, y(30), 60 + i * 13, y(44), 0xe8e0d0, F_EMIT);
    sparks(p, r, 80, y(98), 6, 6);
  }
  if (mode === 'fire0') { flash(p, r, 74, y(34), 14, 0xffffff, 0xffe070, 0xff7a18, 10); flash(p, r, 87, y(32), 12, 0xffffff, 0xffe070, 0xff7a18, 8); sparks(p, r, 80, y(22), 26, 24); }
  if (mode === 'fire1') { flash(p, r, 80, y(36), 6, 0xfff0b0, 0xffb040, 0xb04010, 5); smoke(p, r, 80, y(30), 10, 140); }
  if (mode === 'fire2') smoke(p, r, 80, y(24), 9, 90);
}

// ------------------------------------------------------------------ LANCE
function drawLance(p: Pix, r: Rng, dy: number, glow: number, fire: number): void {
  const y = (v: number): number => v + dy;
  const CORE = 0x2a2e38, HOUSE = 0x3e4452;
  const coil = glow >= 3 ? [0xffffff, 0xe0faff, 0x9ad8ff] : glow >= 2 ? [0xe0faff, 0x8ad0ff, 0x3a8cff] : glow >= 1 ? [0x9ad8ff, 0x3a8cff, 0x1a4aa8] : [0x5a9aff, 0x2a5ab8, 0x142a6a];
  part(p, (l) => hand(l, 48, y(102), 1.35, -1));
  // prongs
  part(p, (l) => {
    cyl(l, 72, y(42), 2.6, 73, y(18), 1.6, HOUSE);
    cyl(l, 88, y(42), 2.6, 87, y(18), 1.6, HOUSE);
  });
  // barrel core
  part(p, (l) => { cyl(l, 80, y(126), 17, 80, y(34), 8, CORE); });
  // coils
  for (let k = 0; k < 7; k++) {
    const t = k / 6.6;
    const cy = y(112 - t * 72);
    const rad = 16.5 - t * 8.5;
    for (let x = Math.floor(80 - rad - 1); x <= 80 + rad + 1; x++) {
      const nx = (x + 0.5 - 80) / (rad + 1);
      if (Math.abs(nx) > 1) continue;
      const yy = cy + Math.sqrt(1 - nx * nx) * 2.2;
      const c = Math.abs(nx) > 0.8 ? coil[2] : nx < -0.2 ? coil[0] : coil[1];
      p.set(x, yy, c, F_EMIT); p.set(x, yy - 1, Math.abs(nx) > 0.6 ? coil[2] : coil[1], F_EMIT);
      p.set(x, yy - 2, mix(coil[2], 0x101418, 0.5), F_FLAT);
    }
  }
  // rear housing + capacitors
  part(p, (l) => {
    l.poly([50, y(124), 110, y(124), 104, y(98), 56, y(98)], HOUSE);
    for (let x = 60; x < 102; x += 6) l.rect(x, y(104), 3, 14, mul(HOUSE, 0.6));
  });
  part(p, (l) => { cyl(l, 40, y(124), 7, 54, y(92), 5, 0x585e6a); cyl(l, 120, y(124), 7, 106, y(92), 5, 0x585e6a); });
  for (const [cx, cy] of [[54, 92], [106, 92]]) glowBlob(p, cx, y(cy), 2.4, coil[0], coil[1], coil[2]);
  part(p, (l) => hand(l, 114, y(106), 1.4, 1));
  // arcs between prongs
  if (glow >= 1) {
    const arcs = glow;
    for (let a = 0; a < arcs; a++) {
      let ax = 73, ay = y(20 + a * 4);
      while (ax < 87) { const nx = ax + 2, ny = ay + Math.round((r() - 0.5) * 4); p.line(ax, ay, nx, ny, a === 0 ? 0xffffff : coil[0], F_EMIT); ax = nx; ay = ny; }
    }
    if (glow >= 2) glowBlob(p, 80, y(26), 2 + glow, 0xffffff, coil[0], coil[1], 0.3, r);
    if (glow >= 3) {
      sparks(p, r, 80, y(60), 34, 18);
      for (let yy = 0; yy < WH; yy++) for (let xx = 0; xx < WW; xx++) if (!p.has(xx, yy) && Math.hypot(xx - 80, (yy - y(60)) * 0.6) < 40 && bayer(xx, yy) < 0.18) p.blend(xx, yy, 0x3a8cff, 70, F_EMIT);
    }
  }
  if (fire === 2) {
    // beam origin + column
    for (let yy = 0; yy < y(30); yy++) for (let k = -4; k <= 4; k++) p.set(80 + k, yy, Math.abs(k) < 2 ? 0xffffff : Math.abs(k) < 4 ? 0x9ae0ff : 0x3a8cff, F_EMIT);
    flash(p, r, 80, y(26), 15, 0xffffff, 0xbaf0ff, 0x3a8cff, 10);
  }
  if (fire === 1) { flash(p, r, 80, y(28), 6, 0xffffff, 0x9ae0ff, 0x2a6ad0, 5); smoke(p, r, 80, y(18), 8, 80); }
}

// ------------------------------------------------------------------ RIPPER
function drawRipper(p: Pix, r: Rng, dx: number, dy: number, phase: number, fire: boolean): void {
  const x = (v: number): number => v + dx, y = (v: number): number => v + dy;
  const HOUS = 0xc0401c, STEEL = 0x8c9098, DARK = 0x26262c;
  // bar + teeth
  part(p, (l) => {
    l.poly([x(69), y(90), x(91), y(90), x(87), y(28), x(73), y(28)], STEEL);
    l.ellipse(x(80), y(28), 7, 6, STEEL);
    for (let yy = 32; yy < 88; yy++) l.set(x(80), y(yy), lit(STEEL, -0.5));
    for (let yy = 34; yy < 88; yy += 9) { l.set(x(76), y(yy), lit(STEEL, 0.4)); l.set(x(84), y(yy), lit(STEEL, -0.4)); }
  }, { hi: 0.5 });
  // teeth along perimeter
  const tooth = (tx: number, ty: number, ox: number, oy: number): void => {
    p.set(tx, ty, 0xd0d4dc); p.set(tx + ox, ty + oy, 0xf0f2f6); p.set(tx + ox * 2, ty + oy * 2, 0x9aa0a8);
    p.set(tx + oy, ty + ox, 0x5a5e66);
  };
  for (let k = 0; k < 16; k++) {
    const t = (k + phase * 0.5) / 16;
    const yy = 88 - t * 60;
    const half = 11 - t * 4;
    tooth(Math.round(x(80 - half - 1)), Math.round(y(yy)), -1, -1);
    tooth(Math.round(x(80 + half)), Math.round(y(yy)), 1, -1);
  }
  for (let k = 0; k < 7; k++) { const a = Math.PI + (k + phase * 0.5) * (Math.PI / 7); tooth(Math.round(x(80 + Math.cos(a) * 8)), Math.round(y(28 + Math.sin(a) * 7)), Math.round(Math.cos(a)), -1); }
  // motor housing
  part(p, (l) => {
    l.poly([x(50), y(124), x(110), y(124), x(106), y(90), x(96), y(82), x(64), y(82), x(54), y(90)], HOUS);
    for (let k = 0; k < 5; k++) l.rect(x(58), y(96 + k * 5), 12, 2, mul(HOUS, 0.5));
    for (let xx = 56; xx < 106; xx += 2) for (let yy = 112; yy < 116; yy++) if (((xx >> 1) + (yy >> 1)) & 1) l.set(x(xx), y(yy), (xx >> 2) & 1 ? 0xe0b020 : DARK);
    l.box(x(84), y(92), 16, 12, mul(HOUS, 0.75));
    l.rect(x(86), y(96), 12, 1, DARK); l.rect(x(86), y(99), 12, 1, DARK);
    for (let i = 0; i < 40; i++) l.tint(x(52 + Math.floor(r() * 56)), y(84 + Math.floor(r() * 36)), (c) => lit(c, -0.3));
  });
  // exhaust
  part(p, (l) => cyl(l, x(108), y(98), 3, x(118), y(90), 2.5, DARK));
  // top handle (tube)
  part(p, (l) => {
    l.limb(x(56), y(94), x(58), y(70), 3, DARK);
    l.limb(x(58), y(70), x(102), y(70), 3, DARK);
    l.limb(x(102), y(70), x(104), y(94), 3, DARK);
  });
  part(p, (l) => hand(l, x(64), y(76), 1.25, -1));
  part(p, (l) => hand(l, x(116), y(108), 1.4, 1));
  if (fire) {
    sparks(p, r, x(80), y(26), 14, 22);
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.4, d = 6 + r() * 20;
      const bx = x(80) + Math.cos(a) * d, by = y(26) + Math.sin(a) * d;
      p.set(bx, by, r() < 0.5 ? 0xb0121a : 0x5a0a0e);
      if (r() < 0.4) p.set(bx + 1, by, 0x8c0f12);
    }
    glowBlob(p, x(80), y(24), 4, 0xffffff, 0xfff27a, 0xff8a20, 0.4, r);
  }
}

export interface WeaponFrames { w: number; h: number; idle: HTMLCanvasElement; fire: HTMLCanvasElement[]; extra: HTMLCanvasElement[] }

function make(fn: (p: Pix, r: Rng) => void, seed: number): HTMLCanvasElement {
  const p = new Pix(WW, WH);
  fn(p, makeRng(seed));
  return p.toCanvas();
}

export function buildWeapon(id: string): WeaponFrames {
  switch (id) {
    case 'breacher':
      return {
        w: WW, h: WH,
        idle: make((p, r) => drawBreacher(p, r, 0, 'idle'), 11),
        fire: [make((p, r) => drawBreacher(p, r, 9, 'fire0'), 12), make((p, r) => drawBreacher(p, r, 5, 'fire1'), 13), make((p, r) => drawBreacher(p, r, 2, 'fire2'), 14)],
        extra: [make((p, r) => drawBreacher(p, r, 10, 'open'), 15), make((p, r) => drawBreacher(p, r, 12, 'eject'), 16), make((p, r) => drawBreacher(p, r, -3, 'shut'), 17)],
      };
    case 'lance':
      return {
        w: WW, h: WH,
        idle: make((p, r) => drawLance(p, r, 0, 0, 0), 21),
        fire: [make((p, r) => drawLance(p, r, 8, 3, 2), 22), make((p, r) => drawLance(p, r, 4, 0, 1), 23)],
        extra: [make((p, r) => drawLance(p, r, 1, 1, 0), 24), make((p, r) => drawLance(p, r, 2, 2, 0), 25), make((p, r) => drawLance(p, r, 3, 3, 0), 26)],
      };
    case 'ripper':
      return {
        w: WW, h: WH,
        idle: make((p, r) => drawRipper(p, r, 0, 0, 0, false), 31),
        fire: [make((p, r) => drawRipper(p, r, -2, 2, 1, true), 32), make((p, r) => drawRipper(p, r, 2, 3, 0, true), 33)],
        extra: [make((p, r) => drawRipper(p, r, 0, 1, 1, false), 34), make((p, r) => drawRipper(p, r, 1, 0, 0, false), 35)],
      };
    case 'pulse':
    default:
      return {
        w: WW, h: WH,
        idle: make((p, r) => drawPulse(p, r, 0, 0), 1),
        fire: [make((p, r) => drawPulse(p, r, 6, 2), 2), make((p, r) => drawPulse(p, r, 3, 1), 3), make((p, r) => drawPulse(p, r, 1, 0), 4)],
        extra: [make((p, r) => drawPulse(p, r, 14, 0), 5)],
      };
  }
}

export { ARMOR, ARMOR2, GLOVE, F_EMIT };
