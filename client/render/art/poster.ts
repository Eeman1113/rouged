// The ROUGED key-art poster, drawn in code from POSTER_ROWS pixel data (no image assets).
import { POSTER_W, POSTER_H, POSTER_CHARS, POSTER_PALETTE, POSTER_ROWS } from './posterData';

let cached: HTMLCanvasElement | null = null;

/** The poster at native resolution (173×252). Scale it up with imageSmoothingEnabled = false. */
export function buildPoster(): HTMLCanvasElement {
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = POSTER_W; c.height = POSTER_H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(POSTER_W, POSTER_H);
  const px = img.data;
  const rgb = POSTER_PALETTE.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let y = 0; y < POSTER_H; y++) {
    const row = POSTER_ROWS[y];
    for (let x = 0; x < POSTER_W; x++) {
      const col = rgb[POSTER_CHARS.indexOf(row[x])];
      const i = (y * POSTER_W + x) * 4;
      px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  cached = c;
  return c;
}

export { POSTER_W, POSTER_H };
