// Viewmodel micro-renderer. Weapons and hands are modelled from analytic primitives (boxes,
// tapered cylinders, ellipsoids) in real 3D camera space, then ray-cast at the HUD's low internal
// resolution into a Pix buffer and finished like hand-made pixel art: 4-tone dithered hue-shifted
// ramps, chamfered edge highlights, part-separation lines from depth/group discontinuities and a
// 1px dark silhouette outline. Because the projection is a true perspective camera, a barrel that
// points down -z naturally recedes toward the crosshair (the vanishing point) and we see the inner
// side + top of a weapon held low-right, exactly like a modern FPS viewmodel, with no sprite
// rotation anywhere. Each pose is rendered once and cached by the caller.
import { Pix, lit, mix, bayer, OUTLINE, F_EMIT, F_FLAT } from './core';

// ------------------------------------------------------------------ affine 3x4 matrices
export type M = Float64Array; // row-major [r00 r01 r02 tx | r10 r11 r12 ty | r20 r21 r22 tz]

export function ident(): M { const m = new Float64Array(12); m[0] = m[5] = m[10] = 1; return m; }
export function mm(a: M, b: M): M {
  const o = new Float64Array(12);
  for (let r = 0; r < 3; r++) {
    const a0 = a[r * 4], a1 = a[r * 4 + 1], a2 = a[r * 4 + 2];
    o[r * 4] = a0 * b[0] + a1 * b[4] + a2 * b[8];
    o[r * 4 + 1] = a0 * b[1] + a1 * b[5] + a2 * b[9];
    o[r * 4 + 2] = a0 * b[2] + a1 * b[6] + a2 * b[10];
    o[r * 4 + 3] = a0 * b[3] + a1 * b[7] + a2 * b[11] + a[r * 4 + 3];
  }
  return o;
}
export function T(x: number, y: number, z: number): M { const m = ident(); m[3] = x; m[7] = y; m[11] = z; return m; }
export function S(x: number, y: number, z: number): M { const m = new Float64Array(12); m[0] = x; m[5] = y; m[10] = z; return m; }
export function RX(a: number): M { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = -s; m[9] = s; m[10] = c; return m; }
export function RY(a: number): M { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = s; m[8] = -s; m[10] = c; return m; }
export function RZ(a: number): M { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = -s; m[4] = s; m[5] = c; return m; }
/** Euler helper: yaw (Y) * pitch (X) * roll (Z). pitch + = nose up, yaw + = nose left, roll + = top tilts left. */
export function R(pitch: number, yaw: number, roll: number): M { return mm(RY(yaw), mm(RX(pitch), RZ(roll))); }
export function inv(m: M): M {
  const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C || 1e-12, id = 1 / det;
  const o = new Float64Array(12);
  o[0] = A * id; o[1] = -(b * i - c * h) * id; o[2] = (b * f - c * e) * id;
  o[4] = B * id; o[5] = (a * i - c * g) * id; o[6] = -(a * f - c * d) * id;
  o[8] = C * id; o[9] = -(a * h - b * g) * id; o[10] = (a * e - b * d) * id;
  const tx = m[3], ty = m[7], tz = m[11];
  o[3] = -(o[0] * tx + o[1] * ty + o[2] * tz);
  o[7] = -(o[4] * tx + o[5] * ty + o[6] * tz);
  o[11] = -(o[8] * tx + o[9] * ty + o[10] * tz);
  return o;
}
export function xp(m: M, x: number, y: number, z: number): [number, number, number] {
  return [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
}

// ------------------------------------------------------------------ materials
/** Texture callbacks return a colour (shaded), colour|TX_EMIT (emissive, unshaded) or -1 (base). */
export const TX_EMIT = 0x1000000;
export const TX_FLAT = 0x2000000;
/** face ids handed to texture callbacks */
export const FX_PX = 0, FX_NX = 1, FX_PY = 2, FX_NY = 3, FX_PZ = 4, FX_NZ = 5, FC_SIDE = 6, FC_CAP0 = 7, FC_CAP1 = 8, FS = 9;
export type TexFn = (X: number, Y: number, Z: number, face: number) => number;
export interface Mat {
  col: number;
  emit?: boolean;
  /** specular strength 0..1 (metal glints) */
  spec?: number;
  /** ramp steps (default 4) */
  steps?: number;
  /** extra light bias -1..1 */
  bias?: number;
  tex?: TexFn;
  /** ordered-dither amplitude 0..1 (0 = hard bands) */
  dither?: number;
  /** see-through mask (vent slots, skeleton frames): true = no surface here */
  cut?: (X: number, Y: number, Z: number, face: number) => boolean;
  /** never receives part-separation lines (glows, smoke) */
  noLine?: boolean;
}
export function mat(col: number, o: Partial<Mat> = {}): Mat { return { col, ...o }; }

// ------------------------------------------------------------------ scene
const enum PT { Box = 0, Cyl = 1, Sph = 2 }
interface Prim {
  t: PT; A: M; L: M; hx: number; hy: number; hz: number; k: number; mat: Mat; g: number; ch: number; ox: number; oy: number; oz: number;
}

export class Scene {
  prims: Prim[] = [];
  pts: Record<string, [number, number, number]> = {};
  private st: M[] = [ident()];
  /** part group (separation lines are drawn between different groups) */
  g = 0;
  get top(): M { return this.st[this.st.length - 1]; }
  push(m: M): void { this.st.push(mm(this.top, m)); }
  pop(): void { if (this.st.length > 1) this.st.pop(); }
  /** run fn inside a pushed transform */
  with(m: M, fn: () => void): void { this.push(m); fn(); this.pop(); }
  group(id: number, fn: () => void): void { const o = this.g; this.g = id; fn(); this.g = o; }
  /** run fn in camera space (identity transform) */
  root(fn: () => void): void { const o = this.st; this.st = [ident()]; fn(); this.st = o; }

  private add(t: PT, local: M, hx: number, hy: number, hz: number, m: Mat, k = 0, ch = 0): void {
    const L = mm(this.top, mm(local, S(hx, hy, hz)));
    const A = inv(L);
    this.prims.push({ t, A, L, hx, hy, hz, k, mat: m, g: this.g, ch, ox: A[3], oy: A[7], oz: A[11] });
  }
  /** Box centred at (x,y,z), half extents h*, optional local rotation, chamfer width (metres). */
  box(x: number, y: number, z: number, hx: number, hy: number, hz: number, m: Mat, rot?: M, ch = 0.0035): void {
    this.add(PT.Box, rot ? mm(T(x, y, z), rot) : T(x, y, z), hx, hy, hz, m, 0, ch);
  }
  /** Cylinder along local z (length 2*hz), radius r (elliptic with ry), taper k: r(z)=r*(1+k*z/hz). */
  cyl(x: number, y: number, z: number, r: number, hz: number, m: Mat, rot?: M, k = 0, ry = r): void {
    this.add(PT.Cyl, rot ? mm(T(x, y, z), rot) : T(x, y, z), r, ry, hz, m, k);
  }
  sph(x: number, y: number, z: number, rx: number, ry: number, rz: number, m: Mat, rot?: M): void {
    this.add(PT.Sph, rot ? mm(T(x, y, z), rot) : T(x, y, z), rx, ry, rz, m);
  }
  /** Tapered cylinder between two points. */
  seg(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r0: number, m: Mat, r1 = r0): void {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
    const len = Math.hypot(dx, dy, dz) || 1e-6;
    const zx = dx / len, zy = dy / len, zz = dz / len;
    // x' = normalize(up × z')
    let ux = 0, uy = 1, uz = 0;
    if (Math.abs(zy) > 0.95) { ux = 1; uy = 0; }
    let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
    const xl = Math.hypot(xx, xy, xz); xx /= xl; xy /= xl; xz /= xl;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    const rot = ident();
    rot[0] = xx; rot[1] = yx; rot[2] = zx;
    rot[4] = xy; rot[5] = yy; rot[6] = zy;
    rot[8] = xz; rot[9] = yz; rot[10] = zz;
    const Rm = (r0 + r1) / 2, k = (r1 - r0) / (r0 + r1 || 1);
    this.cyl((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Rm, len / 2, m, rot, k);
  }
  /** Record a named point (current transform) for 2D effects. */
  point(name: string, x: number, y: number, z: number): void { this.pts[name] = xp(this.top, x, y, z); }
  /** Point in camera space from the current transform (for IK/cords). */
  world(x: number, y: number, z: number): [number, number, number] { return xp(this.top, x, y, z); }
}

// ------------------------------------------------------------------ rendering
export interface Frame {
  cv: HTMLCanvasElement | null;
  /** top-left of the canvas in base px relative to screen centre */
  ox: number; oy: number;
  /** named points projected to base px relative to screen centre */
  pts: Record<string, [number, number]>;
}

const LX = -0.42, LY = 0.78, LZ = 0.46; // key light (camera space, toward light)
const LL = Math.hypot(LX, LY, LZ);
const lx = LX / LL, ly = LY / LL, lz = LZ / LL;

/**
 * Ray-cast the scene. f = focal length in base px; clip = screen-space rect (base px rel. centre).
 */
export function renderScene(sc: Scene, f: number, clip: { x0: number; y0: number; x1: number; y1: number }): Frame {
  const pts: Record<string, [number, number]> = {};
  for (const k in sc.pts) {
    const p = sc.pts[k];
    const z = Math.min(-0.01, p[2]);
    pts[k] = [(f * p[0]) / -z, (-f * p[1]) / -z];
  }
  // ---- screen bounds per prim
  const n = sc.prims.length;
  const pz = new Float64Array(n);
  const rx0 = new Int32Array(n), ry0 = new Int32Array(n), rx1 = new Int32Array(n), ry1 = new Int32Array(n);
  let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
  for (let i = 0; i < n; i++) {
    const p = sc.prims[i];
    const e = p.t === PT.Cyl ? 1 + Math.abs(p.k) : 1;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, behind = false, zmin = 1e9;
    for (let c = 0; c < 8; c++) {
      const [X, Y, Z] = xp(p.L, c & 1 ? e : -e, c & 2 ? e : -e, c & 4 ? 1 : -1);
      if (-Z < zmin) zmin = -Z;
      if (Z > -0.02) { behind = true; continue; }
      const sx = (f * X) / -Z, sy = (-f * Y) / -Z;
      if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
    }
    if (behind) { x0 = clip.x0; y0 = clip.y0; x1 = clip.x1; y1 = clip.y1; }
    x0 = Math.max(clip.x0, Math.floor(x0) - 1); y0 = Math.max(clip.y0, Math.floor(y0) - 1);
    x1 = Math.min(clip.x1, Math.ceil(x1) + 1); y1 = Math.min(clip.y1, Math.ceil(y1) + 1);
    rx0[i] = x0; ry0[i] = y0; rx1[i] = x1; ry1[i] = y1; pz[i] = Math.max(0, zmin);
    if (x1 > x0 && y1 > y0) { bx0 = Math.min(bx0, x0); by0 = Math.min(by0, y0); bx1 = Math.max(bx1, x1); by1 = Math.max(by1, y1); }
  }
  if (bx1 <= bx0) return { cv: null, ox: 0, oy: 0, pts };
  bx0 -= 2; by0 -= 2; bx1 += 2; by1 += 2;
  const W = bx1 - bx0, H = by1 - by0;
  const N = W * H;
  const depth = new Float32Array(N).fill(1e9);
  const pid = new Int16Array(N).fill(-1);
  const face = new Uint8Array(N);

  // ---- intersection pass (front-to-back so hidden prims early-out on the depth test)
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => pz[a] - pz[b]);
  for (let oi = 0; oi < n; oi++) {
    const i = order[oi];
    const p = sc.prims[i];
    const zmin = pz[i];
    const A = p.A, ox = p.ox, oy = p.oy, oz = p.oz, k = p.k;
    for (let y = ry0[i]; y < ry1[i]; y++) {
      const Y = -(y + 0.5) / f;
      for (let x = rx0[i]; x < rx1[i]; x++) {
        const j = (y - by0) * W + (x - bx0);
        if (depth[j] < zmin) continue;
        const X = (x + 0.5) / f;
        const dx = A[0] * X + A[1] * Y - A[2], dy = A[4] * X + A[5] * Y - A[6], dz = A[8] * X + A[9] * Y - A[10];
        let t = 1e9, fc = 0;
        if (p.t === PT.Box) {
          let tn = -1e9, tf = 1e9, fn = 0;
          // x slab
          if (Math.abs(dx) < 1e-9) { if (ox < -1 || ox > 1) continue; } else {
            let a = (-1 - ox) / dx, b = (1 - ox) / dx, fa = FX_NX;
            if (a > b) { const s = a; a = b; b = s; fa = FX_PX; }
            if (a > tn) { tn = a; fn = fa; } if (b < tf) tf = b;
          }
          if (Math.abs(dy) < 1e-9) { if (oy < -1 || oy > 1) continue; } else {
            let a = (-1 - oy) / dy, b = (1 - oy) / dy, fa = FX_NY;
            if (a > b) { const s = a; a = b; b = s; fa = FX_PY; }
            if (a > tn) { tn = a; fn = fa; } if (b < tf) tf = b;
          }
          if (Math.abs(dz) < 1e-9) { if (oz < -1 || oz > 1) continue; } else {
            let a = (-1 - oz) / dz, b = (1 - oz) / dz, fa = FX_NZ;
            if (a > b) { const s = a; a = b; b = s; fa = FX_PZ; }
            if (a > tn) { tn = a; fn = fa; } if (b < tf) tf = b;
          }
          if (tn > tf || tn < 0.001) continue;
          t = tn; fc = fn;
        } else if (p.t === PT.Sph) {
          const a = dx * dx + dy * dy + dz * dz, b = ox * dx + oy * dy + oz * dz, c = ox * ox + oy * oy + oz * oz - 1;
          const disc = b * b - a * c;
          if (disc < 0) continue;
          t = (-b - Math.sqrt(disc)) / a;
          if (t < 0.001) continue;
          fc = FS;
        } else {
          const q = 1 + k * oz, pk = k * dz;
          const a = dx * dx + dy * dy - pk * pk, b = ox * dx + oy * dy - q * pk, c = ox * ox + oy * oy - q * q;
          if (Math.abs(a) > 1e-12) {
            const disc = b * b - a * c;
            if (disc >= 0) {
              const sq = Math.sqrt(disc);
              let t0 = (-b - sq) / a, t1 = (-b + sq) / a;
              if (t0 > t1) { const s = t0; t0 = t1; t1 = s; }
              if (t0 >= 0.001) { const zz = oz + t0 * dz; if (zz >= -1 && zz <= 1) { t = t0; fc = FC_SIDE; } }
              if (t >= 1e9 && t1 >= 0.001) { const zz = oz + t1 * dz; if (zz >= -1 && zz <= 1) { t = t1; fc = FC_SIDE; } }
            }
          }
          if (Math.abs(dz) > 1e-9) {
            for (let s = -1; s <= 1; s += 2) {
              const tt = (s - oz) / dz;
              if (tt < 0.001 || tt >= t) continue;
              const xx = ox + tt * dx, yy = oy + tt * dy, rr = 1 + k * s;
              if (xx * xx + yy * yy <= rr * rr) { t = tt; fc = s < 0 ? FC_CAP0 : FC_CAP1; }
            }
          }
          if (t >= 1e9) continue;
        }
        if (t < depth[j]) {
          if (p.mat.cut && p.mat.cut((ox + t * dx) * p.hx, (oy + t * dy) * p.hy, (oz + t * dz) * p.hz, fc)) continue;
          depth[j] = t; pid[j] = i; face[j] = fc;
        }
      }
    }
  }

  // ---- shading pass
  const pix = new Pix(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const j = y * W + x;
      const i = pid[j];
      if (i < 0) continue;
      const p = sc.prims[i];
      const A = p.A, t = depth[j];
      const sx = x + bx0, sy = y + by0;
      const X = (sx + 0.5) / f, Y = -(sy + 0.5) / f;
      const dx = A[0] * X + A[1] * Y - A[2], dy = A[4] * X + A[5] * Y - A[6], dz = A[8] * X + A[9] * Y - A[10];
      const hx = p.ox + t * dx, hy = p.oy + t * dy, hz = p.oz + t * dz;
      // local normal
      let nx = 0, ny = 0, nz = 0;
      const fc = face[j];
      if (p.t === PT.Box) {
        if (fc === FX_PX) nx = 1; else if (fc === FX_NX) nx = -1; else if (fc === FX_PY) ny = 1; else if (fc === FX_NY) ny = -1; else if (fc === FX_PZ) nz = 1; else nz = -1;
        if (p.ch > 0) { // chamfer: blend in the neighbouring face normal near edges
          const ex = 1 - p.ch / p.hx, ey = 1 - p.ch / p.hy, ez = 1 - p.ch / p.hz;
          if (nx === 0 && Math.abs(hx) > ex) nx = Math.sign(hx);
          if (ny === 0 && Math.abs(hy) > ey) ny = Math.sign(hy);
          if (nz === 0 && Math.abs(hz) > ez) nz = Math.sign(hz);
        }
      } else if (p.t === PT.Sph) { nx = hx; ny = hy; nz = hz; }
      else if (fc === FC_SIDE) { nx = hx; ny = hy; nz = -p.k * (1 + p.k * hz); }
      else nz = fc === FC_CAP0 ? -1 : 1;
      // to world: n_w = A^T n_l (A is world->local incl. inverse scale)
      let wx = A[0] * nx + A[4] * ny + A[8] * nz, wy = A[1] * nx + A[5] * ny + A[9] * nz, wz = A[2] * nx + A[6] * ny + A[10] * nz;
      const wl = Math.hypot(wx, wy, wz) || 1; wx /= wl; wy /= wl; wz /= wl;
      const m = p.mat;
      let col = m.col, emit = !!m.emit, flat = false;
      if (m.tex) {
        const r = m.tex(hx * p.hx, hy * p.hy, hz * p.hz, fc);
        if (r >= 0) { col = r & 0xffffff; if (r & TX_EMIT) emit = true; if (r & TX_FLAT) flat = true; }
      }
      if (emit) { pix.set(x, y, col, F_EMIT); continue; }
      if (flat) { pix.set(x, y, col, F_FLAT); continue; }
      const diff = wx * lx + wy * ly + wz * lz;
      // view vector (toward camera) for rim/spec
      const vl = Math.hypot(X, Y, 1);
      const vx = -X / vl, vy = -Y / vl, vz = 1 / vl;
      const facing = wx * vx + wy * vy + wz * vz;
      let l = diff * 1.05 - 0.12 + (m.bias ?? 0) - (p.t === PT.Box ? 0.12 : (1 - facing) * 0.25);
      let c = vramp(col, l, sx, sy, m.steps ?? 4, m.dither ?? (p.t === PT.Box ? 0.18 : 0.6));
      if (m.spec) {
        // half vector
        let hhx = lx + vx, hhy = ly + vy, hhz = lz + vz; const hl = Math.hypot(hhx, hhy, hhz); hhx /= hl; hhy /= hl; hhz /= hl;
        const s = wx * hhx + wy * hhy + wz * hhz;
        if (s > 0.985 - m.spec * 0.05) c = lit(col, 0.95);
        else if (s > 0.95 - m.spec * 0.06 && ((sx + sy) & 1) === 0) c = lit(col, 0.7);
      }
      void l;
      pix.set(x, y, c, 0);
    }

  // ---- part-separation lines (depth / group discontinuities): the farther pixel darkens
  const line = new Uint8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const j = y * W + x;
      const i = pid[j];
      if (i < 0) continue;
      const p = sc.prims[i];
      if (p.mat.noLine || p.mat.emit) continue;
      const d = depth[j];
      for (let nbi = 0; nbi < 4; nbi++) {
        const q = nbi === 0 ? (x > 0 ? j - 1 : -1) : nbi === 1 ? (x < W - 1 ? j + 1 : -1) : nbi === 2 ? (y > 0 ? j - W : -1) : (y < H - 1 ? j + W : -1);
        if (q < 0) continue;
        const iq = pid[q];
        if (iq < 0) continue;
        const pq = sc.prims[iq];
        if (pq.mat.noLine) continue;
        const dq = depth[q];
        const gap = d - dq;
        if ((pq.g !== p.g && gap > d * 0.012) || gap > 0.018 + d * 0.05) { line[j] = 1; break; }
      }
    }
  for (let j = 0; j < N; j++) if (line[j] && !(pix.f[j] & F_EMIT)) { pix.c[j] = mix(pix.c[j], OUTLINE, 0.78); pix.f[j] = F_FLAT; }
  pix.outline(OUTLINE);
  return { cv: pix.toCanvas(), ox: bx0, oy: by0, pts };
}

/** Quantised hue-shifted ramp with adjustable ordered-dither amplitude. */
function vramp(c: number, l: number, x: number, y: number, steps: number, amp: number): number {
  const v = ((Math.max(-1, Math.min(1, l)) + 1) / 2) * (steps - 1);
  let i = Math.floor(v + 0.5 + (bayer(x, y) - 0.5) * amp);
  if (i < 0) i = 0;
  if (i > steps - 1) i = steps - 1;
  const lv = (i / (steps - 1)) * 2 - 1;
  return lit(c, lv < 0 ? lv * 0.72 : lv * 0.55);
}

/** Focal length (base px) for a vertical fov. */
export function focal(baseH: number, vfovDeg: number): number { return baseH / 2 / Math.tan((vfovDeg * Math.PI) / 360); }
