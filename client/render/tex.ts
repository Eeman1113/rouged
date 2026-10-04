import * as THREE from 'three';

const cache = new WeakMap<HTMLCanvasElement, THREE.CanvasTexture>();

/** Canvas → nearest-filtered texture, cached per canvas. */
export function tex(c: HTMLCanvasElement, repeat = false): THREE.CanvasTexture {
  let t = cache.get(c);
  if (!t) {
    t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
    cache.set(c, t);
  }
  return t;
}

/** Text → canvas (pixel font look) */
export function textCanvas(text: string, color: string, px = 16, font = "'VT323', monospace", glow = ''): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  ctx.font = `${px}px ${font}`;
  const lines = text.split('\n');
  const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + 8;
  c.width = Math.max(8, w); c.height = Math.ceil(px * 1.1 * lines.length) + 6;
  const g = c.getContext('2d')!;
  g.font = `${px}px ${font}`;
  g.textBaseline = 'top';
  g.imageSmoothingEnabled = false;
  if (glow) { g.shadowColor = glow; g.shadowBlur = 6; }
  g.fillStyle = color;
  lines.forEach((l, i) => g.fillText(l, 4, 3 + i * px * 1.1));
  return c;
}
