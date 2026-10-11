// Door 35 in the hub: a sealed gunmetal door with a round vault seal and seven Warden sigils.
// Every pixel is painted here at runtime (no assets). Decoration only: no collision boxes.
//
// Sigils (index = Warden biome): 0 SMELTER crucible · 1 CURATOR drawer · 2 THE FIRST core ·
// 3 THE MOTHER pod · 4 THE GARDENER branch · 5 THE GENERAL chevrons · 6 THE HANDLER eye.

import * as THREE from 'three';
import { tex } from './tex';

export const DOOR35 = { x: -3.3, z: -6, w: 2.4, h: 3.6 };
const CW = 128, CH = 192; // canvas px for the door (53.3 px per metre)
const PPM = CW / DOOR35.w;
const SEAL = { x: 64, y: 82, r: 40 };
const SOCKET_R = 9;
const LABEL_Y = 148; // the THE HANDLER stencil (door-canvas px)
const N = 7;

/** socket centre in door-canvas px */
function socket(i: number): { x: number; y: number } {
  const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
  return { x: SEAL.x + Math.cos(a) * SEAL.r, y: SEAL.y + Math.sin(a) * SEAL.r };
}

/** Draw sigil `i` in a 16-unit box centred on (cx, cy), `s` px per unit. */
export function drawSigil(g: CanvasRenderingContext2D, i: number, cx: number, cy: number, s: number, color: string, lw: number) {
  const P = (x: number, y: number): [number, number] => [cx + (x - 8) * s, cy + (y - 8) * s];
  g.save();
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
  const poly = (pts: [number, number][], close = false) => { g.beginPath(); pts.forEach(([x, y], k) => { const [px, py] = P(x, y); if (k) g.lineTo(px, py); else g.moveTo(px, py); }); if (close) g.closePath(); g.stroke(); };
  const dot = (x: number, y: number, r: number) => { const [px, py] = P(x, y); g.beginPath(); g.arc(px, py, r * s, 0, Math.PI * 2); g.fill(); };
  const ring = (x: number, y: number, rx: number, ry = rx) => { const [px, py] = P(x, y); g.beginPath(); g.ellipse(px, py, rx * s, ry * s, 0, 0, Math.PI * 2); g.stroke(); };
  switch (i) {
    case 0: poly([[3, 6], [5, 13], [11, 13], [13, 6]], true); dot(8, 2.8, 1.4); break; // crucible + pour
    case 1: poly([[3, 3], [13, 3], [13, 13], [3, 13]], true); poly([[3, 8], [13, 8]]); poly([[6.8, 5.5], [9.2, 5.5]]); poly([[6.8, 10.5], [9.2, 10.5]]); break; // drawer
    case 2: ring(8, 8, 5.5); dot(8, 8, 1.9); break; // the core
    case 3: ring(8, 8, 3.6, 6.2); dot(8, 10, 1.5); break; // a pod in glass
    case 4: poly([[8, 14.5], [8, 2]]); poly([[8, 10.5], [3.8, 6.3]]); poly([[8, 7], [12.2, 2.8]]); break; // branch
    case 5: poly([[3, 3.5], [8, 7.5], [13, 3.5]]); poly([[3, 8.5], [8, 12.5], [13, 8.5]]); break; // chevrons
    default: { // the eye
      const [ax, ay] = P(1.8, 8), [bx, by] = P(14.2, 8), [t1x, t1y] = P(8, 1.6), [t2x, t2y] = P(8, 14.4);
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(t1x, t1y, bx, by); g.quadraticCurveTo(t2x, t2y, ax, ay); g.stroke();
      dot(8, 8, 2.1);
    }
  }
  g.restore();
}

// 3x5 pixel font for the stencils
const FONT: Record<string, string> = {
  '3': '111001111001111', '5': '111100111001111', T: '111010010010010', H: '101101111101101', E: '111100111100111',
  A: '010101111101101', N: '101111111111101', D: '110101101101110', L: '100100100100111', R: '110101110101101',
  O: '111101101101111', P: '111101111100100', ' ': '000000000000000',
};
function stencil(g: CanvasRenderingContext2D, text: string, cx: number, y: number, sc: number, color: string, gap = 1) {
  const w = text.length * (3 + gap) * sc - gap * sc;
  let x = Math.round(cx - w / 2);
  g.fillStyle = color;
  for (const ch of text) {
    const m = FONT[ch] ?? FONT[' '];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (m[r * 3 + c] === '1') g.fillRect(x + c * sc, y + r * sc, sc, sc);
    x += (3 + gap) * sc;
  }
}

const canvases = new Map<string, HTMLCanvasElement>();
function memo(key: string, build: () => HTMLCanvasElement) { let c = canvases.get(key); if (!c) { c = build(); canvases.set(key, c); } return c; }

function hash(n: number) { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; }

function paintClosed(label = true): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // frame
  g.fillStyle = '#1d1c19'; g.fillRect(0, 0, CW, CH);
  g.fillStyle = '#3a3731'; g.fillRect(2, 2, CW - 4, CH - 2);
  g.fillStyle = '#141311'; g.fillRect(7, 7, CW - 14, CH - 7);
  // leaves
  for (const [x0, x1] of [[8, 63], [65, 120]]) {
    g.fillStyle = '#4a4741'; g.fillRect(x0, 8, x1 - x0, CH - 8);
    g.fillStyle = '#57534c'; g.fillRect(x0, 8, x1 - x0, 2);
    g.fillStyle = '#3b3934'; g.fillRect(x1 - 2, 8, 2, CH - 8);
  }
  // grime + scratches
  for (let i = 0; i < 900; i++) {
    const x = 8 + Math.floor(hash(i * 3 + 1) * 112), y = 8 + Math.floor(hash(i * 7 + 2) * (CH - 8));
    const v = hash(i * 11 + 5);
    g.fillStyle = v < 0.5 ? 'rgba(20,18,15,0.35)' : v < 0.8 ? 'rgba(110,104,92,0.25)' : 'rgba(120,70,30,0.35)';
    g.fillRect(x, y, 1, v > 0.93 ? 3 : 1);
  }
  // ribs + rivets
  for (const y of [30, 140]) { g.fillStyle = '#2c2a26'; g.fillRect(10, y, 108, 3); g.fillStyle = '#625e56'; g.fillRect(10, y + 3, 108, 1); }
  g.fillStyle = '#6f6a60';
  for (let y = 14; y < CH - 4; y += 14) for (const x of [11, 59, 69, 116]) { g.fillRect(x, y, 2, 2); }
  // seam
  g.fillStyle = '#0c0b0a'; g.fillRect(63, 8, 2, CH - 8);
  // hazard band
  for (let x = 8; x < 120; x++) for (let y = 166; y < 182; y++) {
    const stripe = Math.floor((x + y) / 6) % 2 === 0;
    g.fillStyle = stripe ? 'rgba(170,120,34,0.75)' : 'rgba(16,14,12,0.8)';
    if (hash(x * 131 + y * 7) > 0.18) g.fillRect(x, y, 1, 1);
  }
  // the seal: a recessed ring with seven sockets
  g.fillStyle = '#26241f'; g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r + 13, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6d685e'; g.lineWidth = 2; g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r + 12, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#121110'; g.lineWidth = 3; g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#3d3a34'; g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r - 12, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5c584f'; g.lineWidth = 1; g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r - 12, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < N; i++) {
    const s = socket(i);
    g.fillStyle = '#100f0d'; g.beginPath(); g.arc(s.x, s.y, SOCKET_R + 1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#77726a'; g.lineWidth = 1; g.beginPath(); g.arc(s.x, s.y, SOCKET_R + 1, 0, Math.PI * 2); g.stroke();
    drawSigil(g, i, s.x, s.y, 0.95, '#57534b', 1.2);
  }
  // stencils
  stencil(g, '35', SEAL.x, SEAL.y - 12, 5, '#cfc6b2', 1);
  if (label) stencil(g, 'THE HANDLER', 64, LABEL_Y, 2, '#a59d8a', 1);
  return c;
}

function paintOpen(): HTMLCanvasElement {
  const closed = paintClosed(false);
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(closed, 0, 0);
  // the leaves part: a bright gap down the middle, the halves pushed outward
  const gap = 7;
  g.drawImage(closed, 8, 8, 56, CH - 8, 8 - gap, 8, 56, CH - 8);
  g.drawImage(closed, 64, 8, 56, CH - 8, 64 + gap, 8, 56, CH - 8);
  const grd = g.createLinearGradient(64 - gap, 0, 64 + gap, 0);
  grd.addColorStop(0, '#9fe8b0'); grd.addColorStop(0.5, '#f4fff6'); grd.addColorStop(1, '#9fe8b0');
  g.fillStyle = grd; g.fillRect(64 - gap, 8, gap * 2, CH - 8);
  // frame back on top of the shifted leaves
  g.fillStyle = '#3a3731'; g.fillRect(2, 2, 5, CH - 2); g.fillRect(CW - 7, 2, 5, CH - 2); g.fillRect(2, 2, CW - 4, 5);
  g.fillStyle = '#1d1c19'; g.fillRect(0, 0, 2, CH); g.fillRect(CW - 2, 0, 2, CH); g.fillRect(0, 0, CW, 2);
  // the seal stays whole across the gap, cracked down the middle: every sigil still reads
  g.save(); g.beginPath(); g.arc(SEAL.x, SEAL.y, SEAL.r + 13, 0, Math.PI * 2); g.clip();
  g.drawImage(closed, 0, 0);
  g.strokeStyle = '#d8ffe0'; g.lineWidth = 1; g.beginPath();
  let y = SEAL.y - SEAL.r - 13, x = 64;
  g.moveTo(x, y);
  while (y < SEAL.y + SEAL.r + 13) { y += 5; x = 64 + (Math.round(hash(y) * 4) - 2); g.lineTo(x, y); }
  g.stroke(); g.restore();
  stencil(g, 'THE HANDLER', 64, LABEL_Y, 2, '#a59d8a', 1);
  return c;
}

function paintGlow(i: number): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = 40; c.height = 40;
  const g = c.getContext('2d')!;
  const col = i === 6 ? '89,255,122' : '255,214,140';
  const halo = g.createRadialGradient(20, 20, 2, 20, 20, 20);
  halo.addColorStop(0, `rgba(${col},0.35)`); halo.addColorStop(0.5, `rgba(${col},0.1)`); halo.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = halo; g.fillRect(0, 0, 40, 40);
  drawSigil(g, i, 20, 20, 0.95, i === 6 ? '#c8ffd4' : '#fff1cc', 1.7);
  return c;
}

const FLARE_T = 1.6;

export class SealedDoor {
  readonly group = new THREE.Group();
  private glows: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; lit: boolean; flareAt: number }[] = [];
  private seam: THREE.MeshBasicMaterial | null = null;
  private t = 0;
  /** where to stand to read it */
  readonly front = { x: DOOR35.x, z: DOOR35.z + 1.1 };
  /** just above the THE HANDLER stencil: the [E] prompt stands on it, over the bare rim under the seal, covering neither */
  readonly promptAnchor = new THREE.Vector3(DOOR35.x, DOOR35.h - (LABEL_Y - 5) / PPM, DOOR35.z + 0.05);

  /** `sigils` already lit; `open` once the true ending has been seen */
  constructor(sigils: number[], readonly open: boolean) {
    const base = new THREE.Mesh(
      new THREE.PlaneGeometry(DOOR35.w, DOOR35.h),
      new THREE.MeshLambertMaterial({ map: tex(memo(open ? 'open' : 'closed', open ? paintOpen : () => paintClosed())), color: 0xd8d2c6 }),
    );
    base.position.set(DOOR35.x, DOOR35.h / 2, DOOR35.z + 0.03);
    this.group.add(base);
    const lit = new Set(sigils);
    for (let i = 0; i < N; i++) {
      const s = socket(i);
      const mat = new THREE.MeshBasicMaterial({ map: tex(memo('glow' + i, () => paintGlow(i))), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0, 0, 0) });
      const size = 40 / PPM;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
      mesh.position.set(DOOR35.x + (s.x - CW / 2) / PPM, DOOR35.h - s.y / PPM, DOOR35.z + 0.05);
      mesh.visible = lit.has(i);
      this.group.add(mesh);
      this.glows.push({ mesh, mat, lit: lit.has(i), flareAt: -1 });
    }
    if (open) {
      this.seam = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.95, 0.8), transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
      // light through the gap, above and below the seal (and clear of the text)
      for (const [y0, y1] of [[8, SEAL.y - SEAL.r - 13], [160, CH]]) {
        const hgt = (y1 - y0) / PPM;
        const seam = new THREE.Mesh(new THREE.PlaneGeometry(10 / PPM, hgt), this.seam);
        seam.position.set(DOOR35.x, DOOR35.h - (y0 + y1) / 2 / PPM, DOOR35.z + 0.06);
        this.group.add(seam);
      }
    }
    this.update(0);
  }

  litCount(): number { return this.glows.filter((g) => g.lit).length; }

  /** Light these sigils with a flare, `delay` seconds from now, staggered. Returns when the last lands. */
  flare(list: number[], delay: number): number {
    let at = this.t + delay;
    for (const i of list) {
      const g = this.glows[i];
      if (!g || g.lit) continue;
      g.lit = true; g.flareAt = at; g.mesh.visible = false;
      at += 0.5;
    }
    return at - this.t;
  }

  update(dt: number) {
    this.t += dt;
    this.glows.forEach((g, i) => {
      if (!g.lit) return;
      let k: number;
      if (g.flareAt >= 0) {
        const u = (this.t - g.flareAt) / FLARE_T;
        if (u < 0) { g.mesh.visible = false; return; }
        g.mesh.visible = true;
        k = u < 0.2 ? (u / 0.2) * 2.6 : u < 1 ? 2.6 - (u - 0.2) / 0.8 * 1.85 : 0.75;
        g.mesh.scale.setScalar(u < 1 ? 1 + (1 - u) * 0.5 : 1);
        if (u >= 1) { g.flareAt = -1; g.mesh.scale.setScalar(1); }
      } else k = 0.75 + Math.sin(this.t * 1.4 + i * 0.9) * 0.1;
      g.mat.color.setScalar(k);
    });
    if (this.seam) this.seam.opacity = 0.6 + Math.sin(this.t * 2.1) * 0.1;
  }
}
