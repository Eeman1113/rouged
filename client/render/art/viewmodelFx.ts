// Pre-rendered 2D pixel effects for the viewmodel: muzzle flashes (per weapon palette, several
// random variants and sizes) and dithered smoke / vapour puffs. All drawn with core Pix helpers.
import { Pix, makeRng, glowBlob, bayer, mix, F_EMIT } from './core';

export interface FlashPal { hot: number; mid: number; edge: number }
export const FLASH_PULSE: FlashPal = { hot: 0xffffff, mid: 0xffd890, edge: 0xff9020 };
export const FLASH_PULSE2: FlashPal = { hot: 0xffffff, mid: 0x9af8ff, edge: 0x2ab8e8 };
export const FLASH_SHOT: FlashPal = { hot: 0xffffff, mid: 0xffe070, edge: 0xff7a18 };
export const FLASH_LANCE: FlashPal = { hot: 0xffffff, mid: 0xbaf0ff, edge: 0x3a8cff };

/** Star-burst flash: dithered halo + tapered rays + hot core. Returns canvas centred at (r*2, r*2). */
export function makeFlash(pal: FlashPal, rad: number, rays: number, seed: number, squash = 1): HTMLCanvasElement {
  const S = Math.ceil(rad * 4.2);
  const p = new Pix(S, S);
  const r = makeRng(seed);
  const x = S / 2, y = S / 2;
  for (let yy = 0; yy < S; yy++)
    for (let xx = 0; xx < S; xx++) {
      const d = Math.hypot(xx + 0.5 - x, (yy + 0.5 - y) / squash) / (rad * 1.7);
      if (d < 1 && bayer(xx, yy) > d * 0.95) p.blend(xx, yy, pal.edge, 110, F_EMIT);
    }
  for (let i = 0; i < rays; i++) {
    const ang = (i / rays) * Math.PI * 2 + r() * 0.5;
    const L = rad * (1.3 + r() * 0.9);
    for (let d = rad * 0.4; d < L; d += 0.7) {
      const w = Math.max(0, Math.round((1 - d / L) * 1.8));
      for (let k = -w; k <= w; k++)
        p.set(x + Math.cos(ang) * d - Math.sin(ang) * k, y + (Math.sin(ang) * d + Math.cos(ang) * k) * squash, d < L * 0.55 ? pal.mid : pal.edge, F_EMIT);
    }
  }
  glowBlob(p, x, y, rad, pal.hot, pal.mid, pal.edge, 0.35, r);
  return p.toCanvas();
}

/** Dithered round puff of a given radius (alpha via ordered dither so it stays pixel-crisp). */
export function makePuff(rad: number, col: number, dark: number, density: number): HTMLCanvasElement {
  const S = Math.ceil(rad * 2 + 2);
  const p = new Pix(S, S);
  const c = S / 2;
  for (let yy = 0; yy < S; yy++)
    for (let xx = 0; xx < S; xx++) {
      const d = Math.hypot(xx + 0.5 - c, yy + 0.5 - c) / rad;
      if (d > 1) continue;
      if (bayer(xx, yy) > (1 - d * d) * density) continue;
      const shade = Math.max(0, Math.min(1, (yy - c) / rad * 0.6 + 0.4 + (xx - c) / rad * 0.2));
      p.set(xx, yy, mix(col, dark, shade));
    }
  return p.toCanvas();
}
