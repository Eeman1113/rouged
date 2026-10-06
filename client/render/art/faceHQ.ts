// High-detail HUD face, drawn in code from FACE_FRAMES pixel data (no image assets).
// On top of the static frames this adds the procedural layer:
//   • aging across runs — hair greys and skin weathers as `age` goes 0 → 1
//   • a scanned-mind scanline flicker and per-state glitch jitter, animated over 4 frames
import { FACE_W, FACE_H, FACE_CHARS, FACE_PALETTE, FACE_FRAMES } from './faceData';

export type FaceStateHQ = 'healthy' | 'hurt' | 'damaged' | 'critical' | 'grin' | 'dead' | 'ouch' | 'look_left' | 'look_right';

type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BASE: RGB[] = FACE_PALETTE.map(hexToRgb);

function hsl(c: RGB): [number, number, number] {
  const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

/** Palette for a given age: hair (dark warm browns) greys, skin (warm oranges) desaturates and weathers. */
const paletteCache = new Map<number, RGB[]>();
function agedPalette(age: number): RGB[] {
  const key = Math.round(age * 10);
  const hit = paletteCache.get(key);
  if (hit) return hit;
  const a = key / 10;
  const pal = BASE.map((c): RGB => {
    const [h, s, l] = hsl(c);
    const warm = h >= 10 && h <= 45;
    if (warm && l < 0.3 && s < 0.45) {
      // hair / stubble: toward ash grey, lighter as it whitens
      const grey = (c[0] + c[1] + c[2]) / 3 + 70 * a;
      const k = a * 0.85;
      return [c[0] + (grey - c[0]) * k, c[1] + (grey - c[1]) * k, c[2] + (grey * 1.04 - c[2]) * k];
    }
    if (warm && s >= 0.45 && l >= 0.3) {
      // skin: weathered — desaturate a little, darken slightly, pull toward a sallow grey
      const grey = (c[0] + c[1] + c[2]) / 3;
      const k = a * 0.32;
      const dark = 1 - a * 0.1;
      return [(c[0] + (grey - c[0]) * k) * dark, (c[1] + (grey - c[1]) * k) * dark, (c[2] + (grey - c[2]) * k) * dark];
    }
    return c;
  });
  paletteCache.set(key, pal);
  return pal;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const GLITCH: Record<FaceStateHQ, { rows: number; shift: number }> = {
  healthy: { rows: 0, shift: 0 }, look_left: { rows: 0, shift: 0 }, look_right: { rows: 0, shift: 0 },
  hurt: { rows: 1, shift: 1 }, ouch: { rows: 1, shift: 1 }, grin: { rows: 1, shift: 1 },
  damaged: { rows: 3, shift: 2 }, critical: { rows: 5, shift: 3 }, dead: { rows: 8, shift: 4 },
};

export function buildFaceHQ(state: FaceStateHQ, age: number, frame: number): HTMLCanvasElement {
  const rows = FACE_FRAMES[state] ?? FACE_FRAMES.healthy;
  const pal = agedPalette(age);
  const c = document.createElement('canvas');
  c.width = FACE_W; c.height = FACE_H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(FACE_W, FACE_H);
  const px = img.data;
  const r = rng(9137 + frame * 101 + state.length * 7919);
  // per-row horizontal glitch offsets (frame 0 is always clean so the face reads)
  const offs = new Int8Array(FACE_H);
  const gl = GLITCH[state];
  if (frame > 0) for (let i = 0; i < gl.rows; i++) {
    const y = Math.floor(r() * FACE_H), len = 1 + Math.floor(r() * 3), d = (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * gl.shift));
    for (let k = 0; k < len && y + k < FACE_H; k++) offs[y + k] = d;
  }
  for (let y = 0; y < FACE_H; y++) {
    const row = rows[y];
    // scanned-mind scanlines: every 4th row a touch darker, rolling with the frame
    const scan = (y + frame) % 4 === 0 ? 0.86 : 1;
    for (let x = 0; x < FACE_W; x++) {
      const sx = x - offs[y];
      if (sx < 0 || sx >= FACE_W) continue;
      const v = FACE_CHARS.indexOf(row[sx]);
      if (v <= 0) continue;
      const col = pal[v - 1];
      const i = (y * FACE_W + x) * 4;
      px[i] = Math.min(255, col[0] * scan); px[i + 1] = Math.min(255, col[1] * scan); px[i + 2] = Math.min(255, col[2] * scan); px[i + 3] = 255;
    }
  }
  // critical / dead: a few stray static pixels flicker around the head
  if (state === 'critical' || state === 'dead') {
    const n = state === 'dead' ? 26 : 10;
    for (let k = 0; k < n; k++) {
      const x = Math.floor(r() * FACE_W), y = Math.floor(r() * FACE_H * 0.7);
      const i = (y * FACE_W + x) * 4, v = 110 + Math.floor(r() * 120);
      px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

export { FACE_W, FACE_H };
