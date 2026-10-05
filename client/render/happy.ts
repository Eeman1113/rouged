// THE HAPPY PLACE — renders the reconstructed street from RoomGeo.happy: sky dome, the sun (and a
// real shadow-casting sunlight), drifting clouds, houses, trees, fences, hedges, the swing, the bike,
// pollen and birds. corrupt() bruises all of it over a couple of seconds. Everything here is added
// to MapView's group, so MapView.clear() disposes it; dispose() undoes the renderer-level changes.

import * as THREE from 'three';
import type { Box, HappyHouse, RoomGeo } from '../../shared/mapData';
import type { SceneRenderer } from './scene';
import { getHappyTexture, getHappyWindow, getCloudSprite, getBirdSprite, HappyTexture, WindowKind } from './sprites';
import { tex, textCanvas } from './tex';

type V3 = [number, number, number];

/** Merged-geometry builder: positions, normals, uvs, vertex colors. */
class MB {
  pos: number[] = []; nrm: number[] = []; uv: number[] = []; col: number[] = []; idx: number[] = [];
  private c = new THREE.Color();
  private vert(p: V3, n: V3, u: number, v: number, c: THREE.Color) {
    this.pos.push(p[0], p[1], p[2]); this.nrm.push(n[0], n[1], n[2]); this.uv.push(u, v); this.col.push(c.r, c.g, c.b);
  }
  /** planar convex polygon (fan), normal from the first three vertices */
  poly(vs: V3[], uvs: [number, number][], color: number | THREE.Color) {
    const c = typeof color === 'number' ? this.c.setHex(color) : color;
    const a = vs[0], b = vs[1], d = vs[2];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const base = this.pos.length / 3;
    vs.forEach((p, i) => this.vert(p, [nx, ny, nz], uvs[i][0], uvs[i][1], c));
    for (let i = 1; i < vs.length - 1; i++) this.idx.push(base, base + i, base + i + 1);
  }
  /** axis-aligned box; uv = meters × s */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number | THREE.Color, s = 0.5, bottom = false) {
    const F: [V3[], (p: V3) => [number, number]][] = [
      [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], (p) => [p[0], p[1]]],
      [[[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], (p) => [-p[0], p[1]]],
      [[[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], (p) => [-p[2], p[1]]],
      [[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], (p) => [p[2], p[1]]],
      [[[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], (p) => [p[0], -p[2]]],
      [[[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], (p) => [p[0], p[2]]],
    ];
    F.forEach(([vs, u], i) => { if (i === 5 && !bottom) return; this.poly(vs, vs.map((p) => { const q = u(p); return [q[0] * s, q[1] * s] as [number, number]; }), color); });
  }
  /** vertical quad centered at (cx,cy,cz) facing (nx,nz) */
  quad(cx: number, cy: number, cz: number, nx: number, nz: number, w: number, h: number, color: number | THREE.Color, uv: [number, number, number, number] = [0, 0, 1, 1]) {
    const rx = nz * (w / 2), rz = -nx * (w / 2), hh = h / 2;
    this.poly([[cx - rx, cy - hh, cz - rz], [cx + rx, cy - hh, cz + rz], [cx + rx, cy + hh, cz + rz], [cx - rx, cy + hh, cz - rz]],
      [[uv[0], uv[1]], [uv[2], uv[1]], [uv[2], uv[3]], [uv[0], uv[3]]], color);
  }
  /** horizontal quad (facing up) */
  flat(x0: number, z0: number, x1: number, z1: number, y: number, color: number | THREE.Color, s = 0.5) {
    this.poly([[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]], [[x0 * s, -z1 * s], [x1 * s, -z1 * s], [x1 * s, -z0 * s], [x0 * s, -z0 * s]], color);
  }
  /** append a three.js geometry, flat-shaded, transformed */
  geom(g: THREE.BufferGeometry, m: THREE.Matrix4, color: number | THREE.Color, uvs = 1) {
    const ng = g.index ? g.toNonIndexed() : g;
    const p = ng.getAttribute('position'), uv = ng.getAttribute('uv');
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      const tri: V3[] = [];
      for (let k = 0; k < 3; k++) { v.fromBufferAttribute(p, i + k).applyMatrix4(m); tri.push([v.x, v.y, v.z]); }
      this.poly(tri, [0, 1, 2].map((k) => (uv ? [uv.getX(i + k) * uvs, uv.getY(i + k) * uvs] : [0, 0]) as [number, number]), color);
    }
    if (ng !== g) ng.dispose();
    g.dispose();
  }
  /** thin box from a to b (struts, chains, braces) */
  strut(a: V3, b: V3, t: number, color: number | THREE.Color) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2),
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / L, dy / L, dz / L)),
      new THREE.Vector3(1, 1, 1));
    this.geom(new THREE.BoxGeometry(t, L, t), m, color, 0.5);
  }
  mesh(mat: THREE.Material, shadow: 'cast' | 'recv' | 'both' | 'none' = 'both'): THREE.Mesh | null {
    if (!this.idx.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    m.castShadow = shadow === 'cast' || shadow === 'both';
    m.receiveShadow = shadow === 'recv' || shadow === 'both';
    return m;
  }
}

// ───────────────────────────── the sky ─────────────────────────────

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uTop, uHor, uBelow, uSunCol, uSun;
uniform vec3 cTop, cHor, cBelow;
uniform float uC, uTime;
varying vec3 vDir;
float bayer4(vec2 p) {
  vec2 q = mod(floor(p), 4.0);
  float i = q.x + q.y * 4.0;
  // 4x4 ordered dither table
  if (i < 1.0) return 0.0; if (i < 2.0) return 8.0; if (i < 3.0) return 2.0; if (i < 4.0) return 10.0;
  if (i < 5.0) return 12.0; if (i < 6.0) return 4.0; if (i < 7.0) return 14.0; if (i < 8.0) return 6.0;
  if (i < 9.0) return 3.0; if (i < 10.0) return 11.0; if (i < 11.0) return 1.0; if (i < 12.0) return 9.0;
  if (i < 13.0) return 15.0; if (i < 14.0) return 7.0; if (i < 15.0) return 13.0; return 5.0;
}
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  float dith = (bayer4(gl_FragCoord.xy) + 0.5) / 16.0 - 0.5;
  // banded gradient: a pixel-art sky, not a photograph
  float g = clamp(pow(max(h, 0.0), 0.5) + dith * 0.045, 0.0, 1.0);
  g = floor(g * 14.0 + 0.5) / 14.0;
  vec3 calm = mix(uHor, uTop, g);
  if (h < 0.0) calm = mix(uHor, uBelow, clamp(-h * 5.0, 0.0, 1.0));
  float s = max(dot(d, normalize(uSun)), 0.0);
  float halo = pow(s, 120.0) * 0.22 + pow(s, 12.0) * 0.05;
  calm += uSunCol * floor((halo + dith * 0.012) * 32.0) / 32.0;
  // the bruise: bleeds down from the zenith; banded, scanning, glitching
  vec3 bad = mix(cHor, cTop, clamp(g * 1.2, 0.0, 1.0));
  if (h < 0.0) bad = mix(cHor, cBelow, clamp(-h * 5.0, 0.0, 1.0));
  bad *= 0.78 + 0.22 * sin(h * 70.0 - uTime * 2.4);
  float row = floor(h * 90.0);
  float gl = step(0.975, hash(row * 17.0 + floor(uTime * 9.0)));
  bad = mix(bad, vec3(0.35, 0.0, 0.015), gl * 0.7);
  bad += vec3(0.25, 0.02, 0.02) * pow(s, 40.0); // where the sun was
  float k = clamp((uC * 1.7 - (1.0 - h)) * 2.5 + dith * 0.4, 0.0, 1.0);
  gl_FragColor = vec4(mix(calm, bad, k), 1.0);
}`;

// ───────────────────────────── palette ─────────────────────────────

const CALM = {
  fog: 0xbcd6ec, fogD: 0.011, hemiSky: 0xbcdcff, hemiGround: 0x6a8a48, hemiI: 1.05, sun: 0xfff0d8, sunI: 2.5,
};
const BAD = {
  fog: 0x22060a, fogD: 0.03, hemiSky: 0x6a1a22, hemiGround: 0x120406, hemiI: 0.8, sun: 0xff2a1a, sunI: 0.75,
};
/** toward the sun: south-west, fairly high */
const SUN_DIR = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();

const lerpHex = (a: number, b: number, t: number, out: THREE.Color) => out.setHex(a).lerp(new THREE.Color(b), t);

export class HappyScene {
  private sky: THREE.Mesh;
  private skyU: Record<string, THREE.IUniform>;
  private sunLight: THREE.DirectionalLight;
  private sun: THREE.Sprite;
  private sunGlow: THREE.Sprite;
  private eclipse: THREE.Sprite;
  private clouds: { s: THREE.Sprite; a: number; r: number; y: number; speed: number; jump: boolean; t: number }[] = [];
  private birds: { s: THREE.Sprite; a: number; r: number; y: number; speed: number; ph: number }[] = [];
  private pollen: THREE.Points;
  private pollenVel: Float32Array;
  private swing: THREE.Group | null = null;
  private tints: { mat: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial | THREE.SpriteMaterial | THREE.PointsMaterial; calm: THREE.Color; bad: THREE.Color }[] = [];
  /** lamp heads, in geo.lights order (MapView flickers them with the lamp lights) */
  lampHeads: THREE.Mesh[] = [];
  /** 0 calm … 1 fully corrupted */
  c = 0;
  private cTarget = 0;
  private cRate = 0.5;
  private time = 0;
  private prevShadow: boolean;
  private tmp = new THREE.Color();

  constructor(private group: THREE.Group, private r: SceneRenderer, geo: RoomGeo, alcoves: Box[]) {
    const H = geo.happy!;
    const hw = geo.w / 2, hd = geo.d / 2;
    const lam = (t: HappyTexture | null, o: THREE.MeshLambertMaterialParameters = {}) => {
      const m = new THREE.MeshLambertMaterial({ map: t ? tex(getHappyTexture(t), true) : null, vertexColors: true, ...o });
      return m;
    };
    const add = (mb: MB, mat: THREE.Material, shadow: 'cast' | 'recv' | 'both' | 'none' = 'both') => { const m = mb.mesh(mat, shadow); if (m) group.add(m); return m; };
    const tintable = <M extends HappyScene['tints'][number]['mat']>(mat: M, bad: number | THREE.Color): M => {
      this.tints.push({ mat, calm: mat.color.clone(), bad: typeof bad === 'number' ? new THREE.Color(bad) : bad });
      return mat;
    };

    // ── renderer: real shadows while we're here
    this.prevShadow = r.renderer.shadowMap.enabled;
    r.renderer.shadowMap.enabled = r.quality !== 'low';
    r.renderer.shadowMap.type = THREE.PCFShadowMap;

    // ── sky dome (follows the camera)
    this.skyU = {
      uTop: { value: new THREE.Color(0x1e5cc4) }, uHor: { value: new THREE.Color(0xb4d0ea) }, uBelow: { value: new THREE.Color(0x9ab8c8) },
      uSunCol: { value: new THREE.Color(0xfff0c0) }, uSun: { value: SUN_DIR.clone() },
      cTop: { value: new THREE.Color(0x060103) }, cHor: { value: new THREE.Color(0x6a0c14) }, cBelow: { value: new THREE.Color(0x1a0306) },
      uC: { value: 0 }, uTime: { value: 0 },
    };
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(170, 32, 16), new THREE.ShaderMaterial({
      uniforms: this.skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
    }));
    this.sky.renderOrder = -10;
    this.sky.frustumCulled = false;
    group.add(this.sky);

    // ── the sun: an HDR disc (blooms), a soft glow, and the eclipse that comes later
    const sunMat = new THREE.SpriteMaterial({ map: tex(getHappyTexture('sun')), color: new THREE.Color(1.9, 1.75, 1.45), fog: false, depthWrite: false });
    this.sun = new THREE.Sprite(sunMat);
    this.sun.scale.set(9, 9, 1);
    this.sun.position.copy(SUN_DIR).multiplyScalar(150);
    this.sun.renderOrder = -9;
    tintable(sunMat, new THREE.Color(0.5, 0.02, 0.02));
    const glowMat = new THREE.SpriteMaterial({ map: tex(getHappyTexture('glow')), color: new THREE.Color(0.32, 0.27, 0.18), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending });
    this.sunGlow = new THREE.Sprite(glowMat);
    this.sunGlow.scale.set(44, 44, 1);
    this.sunGlow.position.copy(this.sun.position);
    this.sunGlow.renderOrder = -9;
    tintable(glowMat, new THREE.Color(0.5, 0.0, 0.0));
    this.eclipse = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(getHappyTexture('sun')), color: 0x000000, fog: false, depthWrite: false, transparent: true, opacity: 0 }));
    this.eclipse.scale.set(8, 8, 1);
    this.eclipse.position.copy(SUN_DIR).multiplyScalar(149);
    this.eclipse.renderOrder = -8;
    group.add(this.sunGlow, this.sun, this.eclipse);

    // ── sunlight with soft shadows
    this.sunLight = new THREE.DirectionalLight(CALM.sun, CALM.sunI);
    this.sunLight.position.copy(SUN_DIR).multiplyScalar(60);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.castShadow = r.quality !== 'low';
    const sc = this.sunLight.shadow.camera;
    sc.left = -36; sc.right = 36; sc.top = 36; sc.bottom = -36; sc.near = 1; sc.far = 140;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.03;
    this.sunLight.shadow.radius = 2;
    group.add(this.sunLight, this.sunLight.target);

    // ── clouds: drifting round the dome. Three shapes, so the same cloud keeps coming back.
    for (let i = 0; i < 15; i++) {
      const v = i % 3;
      const same = i % 5 === 0; // these ones are *exactly* the same cloud
      const mat = new THREE.SpriteMaterial({ map: tex(getCloudSprite(same ? 0 : v)), color: new THREE.Color(0.74, 0.74, 0.77), fog: false, depthWrite: false, transparent: true, alphaTest: 0.5 });
      tintable(mat, new THREE.Color(0.05, 0.012, 0.018));
      const s = new THREE.Sprite(mat);
      const k = same ? 1.25 : 0.85 + ((i * 0.37) % 1) * 0.8;
      s.scale.set(34 * k, 15.6 * k, 1);
      s.renderOrder = -8;
      group.add(s);
      this.clouds.push({ s, a: (i / 15) * Math.PI * 2 + ((i * 1.7) % 1) * 0.3, r: 118 + ((i * 7.3) % 1) * 30, y: 30 + ((i * 3.1) % 1) * 34, speed: 0.0042 + ((i * 2.3) % 1) * 0.002, jump: i === 7, t: 0 });
    }

    // ── birds, far up
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(getBirdSprite(0)), color: new THREE.Color(0.6, 0.6, 0.65), transparent: true, alphaTest: 0.5, depthWrite: false }));
      s.scale.set(1.3, 0.87, 1);
      group.add(s);
      this.birds.push({ s, a: i * 1.3, r: 26 + i * 6, y: 20 + i * 2.2, speed: 0.11 + i * 0.015, ph: i * 0.7 });
    }

    // ── ground: grass forever, low hills in the haze
    const grassMat = tintable(lam('grass'), 0x6a5048);
    const ground = new MB();
    ground.flat(-210, -210, 210, 210, 0, 0xffffff, 0.5);
    add(ground, grassMat, 'recv');
    const hills = new MB();
    const hillPts: [number, number, number, number][] = [[-120, -110, 70, 16], [30, -150, 90, 22], [140, -60, 60, 14], [130, 90, 80, 18], [-40, 150, 90, 20], [-150, 40, 70, 15]];
    for (const [x, z, rr, hh] of hillPts) hills.geom(new THREE.IcosahedronGeometry(1, 2), new THREE.Matrix4().compose(new THREE.Vector3(x, -hh * 0.35, z), new THREE.Quaternion(), new THREE.Vector3(rr, hh, rr)), 0x8ab07a, 20);
    add(hills, tintable(lam('grass', { flatShading: true }), 0x3a2a2a), 'none');

    // ── the street: asphalt, paint, sidewalks, curbs, walkways
    const [rx0, rx1] = H.roadNS, [rz0, rz1] = H.roadEW, wk = H.walk, FAR = 90;
    const road = new MB();
    road.flat(rx0, -FAR, rx1, FAR, 0.012, 0xffffff);
    road.flat(-FAR, rz0, rx0, rz1, 0.014, 0xffffff); road.flat(rx1, rz0, FAR, rz1, 0.014, 0xffffff);
    add(road, tintable(lam('asphalt'), 0x5a4a4a), 'recv');
    const paint = new MB();
    const midZ = (rz0 + rz1) / 2;
    for (let z = -FAR; z < FAR; z += 3) if (z + 1.6 < rz0 - 2.4 || z > rz1 + 2.4) paint.flat(-0.08, z, 0.08, z + 1.6, 0.02, 0xf2c83a);
    for (let x = -FAR; x < FAR; x += 3) if (x + 1.6 < rx0 - 2.4 || x > rx1 + 2.4) paint.flat(x, midZ - 0.08, x + 1.6, midZ + 0.08, 0.022, 0xf2c83a);
    for (let x = rx0 + 0.4; x < rx1 - 0.3; x += 0.9) paint.flat(x, rz1 + 0.25, x + 0.45, rz1 + 1.85, 0.02, 0xf4f2ea); // crosswalk
    add(paint, tintable(lam(null), 0x4a1010), 'recv');
    const walk = new MB();
    const curb = new MB();
    for (const sx of [-1, 1]) {
      const a = sx < 0 ? rx0 - wk : rx1, b = sx < 0 ? rx0 : rx1 + wk, edge = sx < 0 ? rx0 : rx1;
      for (const [z0, z1] of [[-FAR, rz0 - wk], [rz1 + wk, FAR]] as [number, number][]) {
        walk.flat(a, z0, b, z1, 0.03, 0xffffff);
        curb.box(edge - 0.09, 0, z0, edge + 0.09, 0.13, z1, 0xd8d4cc);
      }
    }
    for (const [z0, z1, edge] of [[rz0 - wk, rz0, rz0], [rz1, rz1 + wk, rz1]] as [number, number, number][]) {
      for (const [x0, x1] of [[-FAR, rx0], [rx1, FAR]] as [number, number][]) {
        walk.flat(x0, z0, x1, z1, 0.03, 0xffffff);
        curb.box(x0, 0, edge - 0.09, x1, 0.13, edge + 0.09, 0xd8d4cc);
      }
    }
    const walkMat = tintable(lam('sidewalk'), 0x6a5a5a);
    add(walk, walkMat, 'recv');
    add(curb, walkMat, 'both');

    // ── houses
    const M = {
      siding: new MB(), roof: new MB(), brick: new MB(), trim: new MB(), ply: new MB(), porch: new MB(), door: new MB(),
      win: { day: new MB(), lit: new MB(), kitchen: new MB(), wren: new MB() } as Record<WindowKind, MB>,
    };
    for (const h of H.houses) this.house(h, M, walk, rx0, rx1);
    add(M.siding, tintable(lam('siding'), 0x8a7a7a));
    add(M.roof, tintable(lam('shingles', { side: THREE.DoubleSide }), 0x5a4040));
    add(M.brick, tintable(lam('brick'), 0x6a4a4a));
    const trimMat = tintable(lam('wood'), 0x7a6a6a);
    add(M.trim, trimMat);
    add(M.ply, tintable(lam('plywood'), 0x5a4a3a));
    add(M.porch, tintable(lam('porch'), 0x5a4a4a));
    add(M.door, tintable(lam('door'), 0x5a3a3a));
    const winMat = (k: WindowKind, c: THREE.Color, bad: THREE.Color | null) => {
      const m = new THREE.MeshBasicMaterial({ map: tex(getHappyWindow(k)), color: c, fog: true });
      if (bad) tintable(m, bad);
      return m;
    };
    add(M.win.day, winMat('day', new THREE.Color(0.82, 0.82, 0.85), new THREE.Color(0.02, 0.0, 0.01)), 'none');
    add(M.win.lit, winMat('lit', new THREE.Color(1.1, 1.05, 0.95), new THREE.Color(0.02, 0.0, 0.01)), 'none');
    // Wren's windows are always lit. Always.
    add(M.win.kitchen, winMat('kitchen', new THREE.Color(0.9, 0.86, 0.78), null), 'none');
    add(M.win.wren, winMat('wren', new THREE.Color(1.05, 0.98, 0.85), null), 'none');
    // the sign on the back of the house with no back
    const nb = H.houses.find((h) => h.noBack);
    if (nb) {
      const c = textCanvas('SET 0001-H\nREAR ELEVATION\nNOT RENDERED', '#3a2a1a', 20, "'VT323', monospace");
      const back = this.side(nb, opposite(nb.face));
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(c.width * 0.022, c.height * 0.022), new THREE.MeshLambertMaterial({ map: tex(c), transparent: true }));
      sign.position.set(back.cx + back.nx * 0.03, 2.4, back.cz + back.nz * 0.03);
      sign.rotation.y = Math.atan2(back.nx, back.nz);
      group.add(sign);
    }

    // ── perimeter hedges (the invisible walls, dressed), gaps at the gates; alcoves become hedge arches
    const hedge = new MB();
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const gaps = (side: 'n' | 's' | 'e' | 'w') => geo.doors.filter((d) => d.side === side).map((d) => (side === 'n' || side === 's' ? d.x : d.z));
    const run = (side: 'n' | 's' | 'e' | 'w') => {
      const g = gaps(side).sort((a, b) => a - b);
      const len = side === 'n' || side === 's' ? hw : hd;
      let cur = -len - 1.4;
      const segs: [number, number][] = [];
      for (const o of g) { segs.push([cur, o - 1.6]); cur = o + 1.6; }
      segs.push([cur, len + 1.4]);
      for (const [s0, s1] of segs) {
        for (let a = s0; a < s1 - 0.01; a += 1.8) {
          const b = Math.min(s1, a + 1.8), hh = 2.15 + rnd() * 0.45, j = rnd() * 0.15;
          if (side === 'n') hedge.box(a, 0, -hd - 1.4, b, hh, -hd + 0.12 + j, 0xffffff);
          else if (side === 's') hedge.box(a, 0, hd - 0.12 - j, b, hh, hd + 1.4, 0xffffff);
          else if (side === 'w') hedge.box(-hw - 1.4, 0, a, -hw + 0.12 + j, hh, b, 0xffffff);
          else hedge.box(hw - 0.12 - j, 0, a, hw + 1.4, hh, b, 0xffffff);
        }
      }
    };
    for (const s of ['n', 's', 'e', 'w'] as const) run(s);
    for (const b of alcoves) hedge.box(b.x0 - 0.05, b.y0, b.z0 - 0.05, b.x1 + 0.05, b.y1 + 0.15, b.z1 + 0.05, 0xb8ccb0);
    // foundation shrubs along the house fronts
    const shrub = new MB();
    for (const h of H.houses) {
      const f = this.side(h, h.face);
      for (const o of [-0.38, -0.22, 0.22, 0.38]) {
        const L = f.len * o, x = f.cx + f.rx * L + f.nx * 0.55, z = f.cz + f.rz * L + f.nz * 0.55;
        shrub.geom(new THREE.IcosahedronGeometry(0.62, 0), new THREE.Matrix4().compose(new THREE.Vector3(x, 0.4, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(o, o * 3, 0)), new THREE.Vector3(1, 0.8, 1)), o > 0 ? 0xc8e8b0 : 0xa8d098, 2);
      }
    }
    const hedgeMat = tintable(lam('hedge'), 0x4a3a30);
    add(hedge, hedgeMat);
    add(shrub, tintable(lam('leaves', { flatShading: true }), 0x4a3a30));

    // ── trees
    const bark = new MB(), leaves = new MB();
    for (const t of H.trees) {
      const trunkH = t.h * 0.62;
      bark.geom(new THREE.CylinderGeometry(0.2, 0.32, trunkH, 7, 1, true), new THREE.Matrix4().makeTranslation(t.x, trunkH / 2, t.z), 0xffffff, 1);
      const tone = [0xffffff, 0xe0f0c0, 0xf0f8d0][t.v];
      const blobs = 4 + (t.v % 2);
      for (let i = 0; i < blobs; i++) {
        const a = i * 2.4 + t.x, k = i === 0 ? 0 : 0.55;
        const br = t.r * (i === 0 ? 1 : 0.7 + ((i * 0.31 + t.z) % 0.2));
        leaves.geom(new THREE.IcosahedronGeometry(br, 1),
          new THREE.Matrix4().compose(new THREE.Vector3(t.x + Math.cos(a) * t.r * k, t.h - t.r * 0.25 + (i === 0 ? 0 : -0.5 + (i % 2) * 0.9), t.z + Math.sin(a) * t.r * k), new THREE.Quaternion().setFromEuler(new THREE.Euler(a, a * 0.7, 0)), new THREE.Vector3(1, 0.85, 1)),
          tone, 2.2);
      }
    }
    add(bark, tintable(lam('bark'), 0x3a2a2a));
    add(leaves, tintable(lam('leaves', { flatShading: true }), 0x3a2422));

    // ── picket fences
    const fence = new MB();
    for (const f of H.fences) {
      const alongZ = f.x0 === f.x1;
      const a0 = alongZ ? Math.min(f.z0, f.z1) : Math.min(f.x0, f.x1), a1 = alongZ ? Math.max(f.z0, f.z1) : Math.max(f.x0, f.x1);
      const c = alongZ ? f.x0 : f.z0;
      for (let a = a0 + 0.06; a < a1; a += 0.22) {
        if (alongZ) { fence.box(c - 0.025, 0, a - 0.045, c + 0.025, 0.92, a + 0.045, 0xffffff); fence.box(c - 0.025, 0.92, a - 0.025, c + 0.025, 1.0, a + 0.025, 0xffffff); }
        else { fence.box(a - 0.045, 0, c - 0.025, a + 0.045, 0.92, c + 0.025, 0xffffff); fence.box(a - 0.025, 0.92, c - 0.025, a + 0.025, 1.0, c + 0.025, 0xffffff); }
      }
      for (const y of [0.28, 0.72]) {
        if (alongZ) fence.box(c + 0.025, y, a0, c + 0.07, y + 0.08, a1, 0xe8e8e0);
        else fence.box(a0, y, c + 0.025, a1, y + 0.08, c + 0.07, 0xe8e8e0);
      }
    }
    add(fence, trimMat);

    // ── props: lamps, mailbox, swing set, bike
    const paintProps = new MB();
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.05, 0.95, 0.7) });
    for (const l of H.lamps) {
      const toRoad = l.x < 0 ? 1 : -1;
      paintProps.geom(new THREE.CylinderGeometry(0.08, 0.12, 4.4, 6), new THREE.Matrix4().makeTranslation(l.x, 2.2, l.z), 0x2a3a34);
      paintProps.box(l.x - 0.05, 4.25, l.z - 0.05, l.x + toRoad * 0.95, 4.35, l.z + 0.05, 0x2a3a34);
      paintProps.box(l.x + toRoad * 0.7, 4.0, l.z - 0.2, l.x + toRoad * 1.1, 4.25, l.z + 0.2, 0x2a3a34);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.34), lampHeadMat);
      head.position.set(l.x + toRoad * 0.9, 3.97, l.z);
      group.add(head);
      this.lampHeads.push(head);
    }
    {
      const m = H.mailbox;
      paintProps.box(m.x - 0.06, 0, m.z - 0.06, m.x + 0.06, 1.0, m.z + 0.06, 0x8a6a4a);
      paintProps.box(m.x - 0.38, 1.0, m.z - 0.2, m.x + 0.32, 1.28, m.z + 0.2, 0x3a5a9a);
      paintProps.geom(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8, 1, false, 0, Math.PI), new THREE.Matrix4().compose(new THREE.Vector3(m.x - 0.03, 1.28, m.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), new THREE.Vector3(1, 1, 1)), 0x3a5a9a);
      paintProps.box(m.x + 0.1, 1.2, m.z + 0.2, m.x + 0.14, 1.62, m.z + 0.24, 0xd83a2a); // the flag is up. there's mail.
      paintProps.box(m.x + 0.14, 1.46, m.z + 0.2, m.x + 0.36, 1.62, m.z + 0.24, 0xd83a2a);
    }
    {
      const s = H.swing, top = 2.5;
      for (const sx of [-1.7, 1.7]) for (const sz of [-0.9, 0.9]) paintProps.strut([s.x + sx, 0, s.z + sz], [s.x + sx, top, s.z], 0.09, 0xd84a3a);
      paintProps.geom(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6), new THREE.Matrix4().compose(new THREE.Vector3(s.x, top, s.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), new THREE.Vector3(1, 1, 1)), 0x3a7ac8);
      // two swings; one moves on its own
      for (const [i, ox] of [[0, -0.65], [1, 0.65]] as [number, number][]) {
        const sw = new MB();
        sw.strut([-0.22, 0, 0], [-0.22, -1.85, 0], 0.025, 0x9a9aa0); sw.strut([0.22, 0, 0], [0.22, -1.85, 0], 0.025, 0x9a9aa0);
        sw.box(-0.28, -1.92, -0.12, 0.28, -1.86, 0.12, i ? 0xf2c83a : 0x3ab0a0);
        const piv = new THREE.Group();
        piv.position.set(s.x + ox, top - 0.05, s.z);
        const m = sw.mesh(tintable(lam(null), 0x2a1a1a), 'cast');
        if (m) piv.add(m);
        group.add(piv);
        if (i === 1) this.swing = piv;
      }
    }
    {
      // a kid's bike, leaning on the fence
      const b = H.bike;
      const bike = new MB();
      for (const oz of [-0.42, 0.42]) bike.geom(new THREE.TorusGeometry(0.3, 0.035, 5, 14), new THREE.Matrix4().compose(new THREE.Vector3(0, 0.33, oz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1)), 0x202024);
      bike.strut([0, 0.33, -0.42], [0, 0.62, 0.05], 0.05, 0xd83a5a); bike.strut([0, 0.62, 0.05], [0, 0.33, 0.42], 0.05, 0xd83a5a);
      bike.strut([0, 0.33, -0.42], [0, 0.72, -0.32], 0.05, 0xd83a5a); bike.strut([0, 0.62, 0.05], [0, 0.82, 0.08], 0.04, 0xd83a5a);
      bike.box(-0.06, 0.82, 0.0, 0.06, 0.86, 0.2, 0x202024);
      bike.strut([0, 0.72, -0.32], [0, 0.9, -0.36], 0.04, 0x9a9aa0); bike.box(-0.24, 0.88, -0.38, 0.24, 0.92, -0.34, 0x9a9aa0);
      const m = bike.mesh(tintable(lam(null), 0x2a1a1a), 'cast');
      if (m) { m.position.set(b.x, 0, b.z); m.rotation.set(0, b.rot, -0.22); group.add(m); }
    }
    add(paintProps, tintable(lam(null), 0x3a2a2a));

    // ── flower beds by the porches
    {
      const n = 60 * H.houses.length;
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const FL = [0xff7aa8, 0xffe060, 0xffffff, 0xff5a4a, 0xb88aff].map((x) => new THREE.Color(x));
      let i = 0;
      for (const h of H.houses) {
        const f = this.side(h, h.face);
        for (let k = 0; k < 60; k++) {
          const L = (rnd() - 0.5) * f.len * 0.9;
          if (Math.abs(L) < 1.9) { k--; continue; }
          pos.set([f.cx + f.rx * L + f.nx * (0.3 + rnd() * 0.9), 0.12 + rnd() * 0.3, f.cz + f.rz * L + f.nz * (0.3 + rnd() * 0.9)], i * 3);
          const c = FL[Math.floor(rnd() * FL.length)];
          col.set([c.r, c.g, c.b], i * 3);
          i++;
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const fm = tintable(new THREE.PointsMaterial({ size: 0.14, vertexColors: true }), 0x2a0a0a);
      group.add(new THREE.Points(g, fm));
    }

    // ── pollen / dandelion seeds drifting in the light
    {
      const n = 320;
      const pos = new Float32Array(n * 3);
      this.pollenVel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos.set([(rnd() - 0.5) * geo.w, 0.3 + rnd() * 6, (rnd() - 0.5) * geo.d], i * 3);
        this.pollenVel.set([0.15 + rnd() * 0.25, (rnd() - 0.4) * 0.12, (rnd() - 0.5) * 0.2], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pm = tintable(new THREE.PointsMaterial({ color: new THREE.Color(0.8, 0.76, 0.6), size: 2, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false }), new THREE.Color(0.3, 0.02, 0.02));
      this.pollen = new THREE.Points(g, pm);
      this.pollen.frustumCulled = false;
      group.add(this.pollen);
    }
    this.apply();
  }

  /** geometry helpers for one side of a house body */
  private side(h: HappyHouse, s: HappyHouse['face']) {
    const cx = (h.x0 + h.x1) / 2, cz = (h.z0 + h.z1) / 2;
    const nx = s === 'e' ? 1 : s === 'w' ? -1 : 0, nz = s === 's' ? 1 : s === 'n' ? -1 : 0;
    const len = nx ? h.z1 - h.z0 : h.x1 - h.x0;
    const px = s === 'e' ? h.x1 : s === 'w' ? h.x0 : cx, pz = s === 's' ? h.z1 : s === 'n' ? h.z0 : cz;
    return { cx: px, cz: pz, nx, nz, len, rx: nz, rz: -nx };
  }

  private house(h: HappyHouse, M: { siding: MB; roof: MB; brick: MB; trim: MB; ply: MB; porch: MB; door: MB; win: Record<WindowKind, MB> }, walk: MB, rx0: number, rx1: number) {
    const ridgeZ = h.face === 'e' || h.face === 'w'; // ridge runs parallel to the street
    const back = opposite(h.face);
    const color = new THREE.Color(h.color);
    const shutter = new THREE.Color(h.doorColor).multiplyScalar(0.7);
    const B = h.body, R = h.roof, ov = 0.45;
    const twoStory = B > 5.5;
    for (const s of ['n', 'e', 's', 'w'] as const) {
      const f = this.side(h, s);
      const half = f.len / 2;
      const ax = f.cx - f.rx * half, az = f.cz - f.rz * half, bx = f.cx + f.rx * half, bz = f.cz + f.rz * half;
      const wallMb = s === back && h.noBack ? M.ply : M.siding;
      const wallCol = s === back && h.noBack ? 0xffffff : color;
      wallMb.poly([[ax, 0, az], [bx, 0, bz], [bx, B, bz], [ax, B, az]], [[0, 0], [f.len * 0.5, 0], [f.len * 0.5, B * 0.5], [0, B * 0.5]], wallCol);
      // gable triangles on the ends of the ridge
      const gable = ridgeZ ? s === 'n' || s === 's' : s === 'e' || s === 'w';
      if (gable) {
        wallMb.poly([[ax, B, az], [bx, B, bz], [f.cx, B + R, f.cz]], [[0, B * 0.5], [f.len * 0.5, B * 0.5], [f.len * 0.25, (B + R) * 0.5]], wallCol);
        if (!(s === back && h.noBack)) this.window(M, f, 0, B + R * 0.38, 0.62, 0.7, 'day', null);
      }
      // corner boards
      M.trim.box(ax - 0.07, 0, az - 0.07, ax + 0.07, B, az + 0.07, 0xffffff);
      if (s === back && h.noBack) {
        // a film-set flat: braces holding the facade up
        for (const o of [-0.35, 0, 0.35]) {
          const x = f.cx + f.rx * f.len * o, z = f.cz + f.rz * f.len * o;
          M.ply.strut([x + f.nx * 0.08, B - 0.4, z + f.nz * 0.08], [x + f.nx * 2.6, 0, z + f.nz * 2.6], 0.14, 0xd8c8a8);
          M.ply.box(x + f.nx * 2.4 - 0.3, 0, z + f.nz * 2.4 - 0.3, x + f.nx * 2.4 + 0.3, 0.3, z + f.nz * 2.4 + 0.3, 0xa89878);
        }
        continue;
      }
      // windows + door
      const front = s === h.face;
      const lows = front ? [-0.3, 0.3] : f.len > 7.5 ? [-0.25, 0.25] : [0];
      for (const o of lows) {
        const kind: WindowKind = h.wren && front && o < 0 ? 'kitchen' : 'day';
        this.window(M, f, f.len * o, 1.75, 1.15, 1.4, kind, front ? shutter : null);
      }
      if (twoStory) {
        for (const o of front ? [-0.3, 0.3] : [0]) {
          const kind: WindowKind = h.wren && front && o < 0 ? 'wren' : 'day';
          this.window(M, f, f.len * o, 4.35, 1.05, 1.3, kind, front ? shutter : null);
        }
      }
      if (front) {
        const py = h.porch ? 0.28 : 0;
        M.door.quad(f.cx + f.nx * 0.03, py + 1.08, f.cz + f.nz * 0.03, f.nx, f.nz, 1.05, 2.16, h.doorColor);
        for (const o of [-0.6, 0.6]) lbox(M.trim, f, o, 0.06, py, py + 2.3, 0.075, 0.06, 0xffffff);
        lbox(M.trim, f, 0, 0.06, py + 2.16, py + 2.32, 0.68, 0.06, 0xffffff);
        if (h.porch) {
          lbox(M.porch, f, 0, 0.8, 0, 0.28, 1.6, 0.8, 0xffffff);
          lbox(M.porch, f, 0, 1.82, 0, 0.14, 1.0, 0.22, 0xe0d8d0); // the step
          for (const o of [-1.45, 1.45]) lbox(M.trim, f, o, 1.48, 0.28, 2.75, 0.08, 0.08, 0xffffff);
          lbox(M.trim, f, 0, 0.85, 2.75, 2.9, 1.75, 0.95, 0xffffff);
          // the walk out to the sidewalk (on the street only)
          if (!h.backdrop && f.nx) {
            const ox = f.cx + f.nx * 2.04, edge = f.nx > 0 ? rx0 - 2 : rx1 + 2;
            walk.flat(Math.min(ox, edge), f.cz - 0.75, Math.max(ox, edge), f.cz + 0.75, 0.028, 0xf0ece4);
          }
        }
      }
    }
    // foundation band
    M.brick.box(h.x0 - 0.04, 0, h.z0 - 0.04, h.x1 + 0.04, 0.42, h.z1 + 0.04, 0xffffff);
    // the roof
    const x0 = h.x0 - ov, x1 = h.x1 + ov, z0 = h.z0 - ov, z1 = h.z1 + ov, cx = (h.x0 + h.x1) / 2, cz = (h.z0 + h.z1) / 2;
    const eaveDrop = (ov / ((ridgeZ ? h.x1 - h.x0 : h.z1 - h.z0) / 2)) * R;
    const ey = B - eaveDrop, top = B + R;
    const rc = new THREE.Color(h.roofColor);
    if (ridgeZ) {
      const sl = Math.hypot(cx - x0, top - ey);
      M.roof.poly([[x0, ey, z1], [x0, ey, z0], [cx, top, z0], [cx, top, z1]], [[z1 * 0.5, 0], [z0 * 0.5, 0], [z0 * 0.5, sl * 0.5], [z1 * 0.5, sl * 0.5]], rc);
      M.roof.poly([[x1, ey, z0], [x1, ey, z1], [cx, top, z1], [cx, top, z0]], [[z0 * 0.5, 0], [z1 * 0.5, 0], [z1 * 0.5, sl * 0.5], [z0 * 0.5, sl * 0.5]], rc);
      M.roof.box(cx - 0.14, top - 0.08, z0, cx + 0.14, top + 0.1, z1, rc.clone().multiplyScalar(0.7));
      M.trim.box(x0 - 0.04, ey - 0.22, z0, x0 + 0.08, ey + 0.02, z1, 0xffffff);
      M.trim.box(x1 - 0.08, ey - 0.22, z0, x1 + 0.04, ey + 0.02, z1, 0xffffff);
      if (h.chimney) { const chx = cx + (h.x1 - h.x0) * 0.2, chz = h.z0 + 1.3; M.brick.box(chx - 0.42, B + R * 0.3, chz - 0.42, chx + 0.42, top + 1.1, chz + 0.42, 0xffffff); M.trim.box(chx - 0.5, top + 1.1, chz - 0.5, chx + 0.5, top + 1.22, chz + 0.5, 0x8a8a8a); }
    } else {
      const sl = Math.hypot(cz - z0, top - ey);
      M.roof.poly([[x0, ey, z0], [x1, ey, z0], [x1, top, cz], [x0, top, cz]], [[x0 * 0.5, 0], [x1 * 0.5, 0], [x1 * 0.5, sl * 0.5], [x0 * 0.5, sl * 0.5]], rc);
      M.roof.poly([[x1, ey, z1], [x0, ey, z1], [x0, top, cz], [x1, top, cz]], [[x1 * 0.5, 0], [x0 * 0.5, 0], [x0 * 0.5, sl * 0.5], [x1 * 0.5, sl * 0.5]], rc);
      M.roof.box(x0, top - 0.08, cz - 0.14, x1, top + 0.1, cz + 0.14, rc.clone().multiplyScalar(0.7));
      M.trim.box(x0, ey - 0.22, z0 - 0.04, x1, ey + 0.02, z0 + 0.08, 0xffffff);
      M.trim.box(x0, ey - 0.22, z1 - 0.08, x1, ey + 0.02, z1 + 0.04, 0xffffff);
      if (h.chimney) { const chx = h.x0 + 1.3, chz = cz + (h.z1 - h.z0) * 0.2; M.brick.box(chx - 0.42, B + R * 0.3, chz - 0.42, chx + 0.42, top + 1.1, chz + 0.42, 0xffffff); M.trim.box(chx - 0.5, top + 1.1, chz - 0.5, chx + 0.5, top + 1.22, chz + 0.5, 0x8a8a8a); }
    }
  }

  private window(M: { trim: MB; win: Record<WindowKind, MB> }, f: ReturnType<HappyScene['side']>, lat: number, y: number, w: number, h: number, kind: WindowKind, shutter: THREE.Color | null) {
    const x = f.cx + f.rx * lat + f.nx * 0.035, z = f.cz + f.rz * lat + f.nz * 0.035;
    M.win[kind].quad(x, y, z, f.nx, f.nz, w, h, 0xffffff);
    // sill
    const sx = f.nz ? w / 2 + 0.1 : 0.12, sz = f.nx ? w / 2 + 0.1 : 0.12;
    M.trim.box(x - sx + f.nx * 0.06, y - h / 2 - 0.1, z - sz + f.nz * 0.06, x + sx + f.nx * 0.06, y - h / 2, z + sz + f.nz * 0.06, 0xffffff);
    if (shutter) for (const s of [-1, 1]) {
      const o = s * (w / 2 + 0.24);
      M.trim.quad(x + f.rx * o + f.nx * 0.005, y, z + f.rz * o + f.nz * 0.005, f.nx, f.nz, 0.4, h + 0.05, shutter, [0, 0, 0.5, 1]);
    }
  }

  /** start (or finish) the corruption: ~t seconds from calm to bruised */
  corrupt(t: number) { this.cTarget = 1; this.cRate = 1 / Math.max(0.2, t); }

  private apply() {
    const c = this.c;
    const r = this.r;
    const fog = r.scene.fog as THREE.FogExp2;
    lerpHex(CALM.fog, BAD.fog, c, fog.color);
    fog.density = CALM.fogD + (BAD.fogD - CALM.fogD) * c;
    (r.scene.background as THREE.Color).copy(fog.color);
    lerpHex(CALM.hemiSky, BAD.hemiSky, c, r.ambient.color);
    lerpHex(CALM.hemiGround, BAD.hemiGround, c, r.ambient.groundColor);
    r.ambient.intensity = CALM.hemiI + (BAD.hemiI - CALM.hemiI) * c;
    lerpHex(CALM.sun, BAD.sun, c, this.sunLight.color);
    this.sunLight.intensity = CALM.sunI + (BAD.sunI - CALM.sunI) * c;
    this.skyU.uC.value = c;
    for (const t of this.tints) t.mat.color.copy(t.calm).lerp(t.bad, Math.min(1, c * 1.15));
    (this.eclipse.material as THREE.SpriteMaterial).opacity = Math.min(1, c * 1.4);
    const sk = 1 + c * 0.35;
    this.sun.scale.set(9 * sk, 9 * sk, 1);
  }

  update(dt: number) {
    this.time += dt;
    const cam = this.r.camera.position;
    this.sky.position.copy(cam);
    this.skyU.uTime.value = this.time;
    if (this.c !== this.cTarget) {
      this.c = Math.min(this.cTarget, this.c + dt * this.cRate);
      // the light stutters while it goes
      if (this.c < 1 && Math.random() < 0.25) this.sunLight.intensity *= 0.3;
    }
    this.apply();
    // clouds drift; one of them keeps snapping back to where it was
    for (const cl of this.clouds) {
      cl.a += cl.speed * dt * (1 - this.c * 0.9);
      if (cl.jump) { cl.t += dt; if (cl.t > 19) { cl.t = 0; cl.a -= cl.speed * 19; } }
      cl.s.position.set(Math.cos(cl.a) * cl.r, cl.y, Math.sin(cl.a) * cl.r);
    }
    // birds circle (and stop, mid-flap, when it goes wrong)
    for (const b of this.birds) {
      if (this.c < 0.5) b.a += b.speed * dt;
      b.s.position.set(Math.cos(b.a) * b.r, b.y + Math.sin(b.a * 3 + b.ph) * 0.8, Math.sin(b.a) * b.r);
      const f = this.c >= 0.5 ? 0 : Math.floor(this.time * 5 + b.ph * 3) % 2;
      (b.s.material as THREE.SpriteMaterial).map = tex(getBirdSprite(f));
    }
    // the empty swing never stops
    if (this.swing) this.swing.rotation.x = Math.sin(this.time * 1.7) * (0.32 + this.c * 0.3);
    // pollen drifts on a summer breeze; ash falls
    const a = this.pollen.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = a.array as Float32Array, v = this.pollenVel;
    const hw = 24, fall = this.c;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] += (v[i] * (1 - fall) + Math.sin(this.time * 0.7 + i) * 0.05) * dt;
      arr[i + 1] += (v[i + 1] * (1 - fall) - fall * (0.5 + (i % 7) * 0.08) + Math.sin(this.time * 1.3 + i * 0.37) * 0.04) * dt;
      arr[i + 2] += v[i + 2] * (1 - fall) * dt;
      if (arr[i] > hw) arr[i] -= hw * 2; else if (arr[i] < -hw) arr[i] += hw * 2;
      if (arr[i + 2] > hw) arr[i + 2] -= hw * 2; else if (arr[i + 2] < -hw) arr[i + 2] += hw * 2;
      if (arr[i + 1] < 0.1) arr[i + 1] += 6; else if (arr[i + 1] > 6.5) arr[i + 1] -= 6;
    }
    a.needsUpdate = true;
  }

  dispose() {
    this.r.renderer.shadowMap.enabled = this.prevShadow;
    this.sunLight.shadow.map?.dispose();
    this.sunLight.dispose();
  }
}

/** axis-aligned box placed relative to a house side: `lat` along the wall, `n` out from it */
function lbox(mb: MB, f: { cx: number; cz: number; nx: number; nz: number; rx: number; rz: number }, lat: number, n: number, y0: number, y1: number, hLat: number, hN: number, color: number) {
  const x = f.cx + f.rx * lat + f.nx * n, z = f.cz + f.rz * lat + f.nz * n;
  const ex = Math.abs(f.rx) * hLat + Math.abs(f.nx) * hN, ez = Math.abs(f.rz) * hLat + Math.abs(f.nz) * hN;
  mb.box(x - ex, y0, z - ez, x + ex, y1, z + ez, color);
}

function opposite(s: HappyHouse['face']): HappyHouse['face'] {
  return s === 'n' ? 's' : s === 's' ? 'n' : s === 'e' ? 'w' : 'e';
}
