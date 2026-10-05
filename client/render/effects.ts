// Transient world effects: tracers, lance beams, explosions, tesla arcs, muzzle flashes, spawn-ins, fire.

import * as THREE from 'three';
import { getExplosionFrames, getMuzzleSprite, getSparkSprite } from './sprites';
import { tex } from './tex';
import { glowTex } from './entities';

interface Fx { obj: THREE.Object3D; life: number; max: number; kind: 'line' | 'sprite' | 'anim' | 'beam' | 'mesh'; frames?: THREE.Texture[]; vx?: number; vy?: number; vz?: number; grow?: number; fill?: boolean }

export class Effects {
  group = new THREE.Group();
  list: Fx[] = [];
  private explosionTex: THREE.Texture[];
  private muzzleTex: THREE.Texture;
  private sparkTex: THREE.Texture;

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
    this.explosionTex = getExplosionFrames().map((c) => tex(c));
    this.muzzleTex = tex(getMuzzleSprite());
    this.sparkTex = tex(getSparkSprite());
  }

  clear() {
    for (const f of this.list) this.group.remove(f.obj);
    this.list = [];
  }

  private add(f: Fx) {
    this.group.add(f.obj);
    this.list.push(f);
    if (this.list.length > 260) { const o = this.list.shift()!; this.group.remove(o.obj); }
  }

  tracer(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: THREE.Color, life = 0.07) {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)]);
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    this.add({ obj: new THREE.Line(g, m), life, max: life, kind: 'line' });
  }

  /** thick bright beam (Lance) */
  beam(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, width: number, color: THREE.Color, life = 0.25) {
    const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
    const len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(width, width, len, 6, 1, true);
    geo.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.lookAt(b);
    this.add({ obj: m, life, max: life, kind: 'beam' });
    // core
    const core = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    core.position.copy(m.position); core.quaternion.copy(m.quaternion); core.scale.set(0.35, 0.35, 1);
    this.add({ obj: core, life: life * 0.7, max: life * 0.7, kind: 'beam' });
  }

  explosion(x: number, y: number, z: number, size: number) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.explosionTex[0], color: new THREE.Color(2.2, 2, 1.8), transparent: true, depthWrite: false }));
    s.position.set(x, y, z);
    s.scale.set(size, size, 1);
    this.add({ obj: s, life: 0.5, max: 0.5, kind: 'anim', frames: this.explosionTex, grow: 1.3 });
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(5, 2.2, 0.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    g.position.set(x, y, z);
    g.scale.set(size * 2, size * 2, 1);
    this.add({ obj: g, life: 0.25, max: 0.25, kind: 'sprite' });
  }

  muzzle(x: number, y: number, z: number, color: THREE.Color, size = 0.7) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.muzzleTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(x, y, z);
    s.scale.set(size, size, 1);
    s.material.rotation = Math.random() * Math.PI;
    this.add({ obj: s, life: 0.06, max: 0.06, kind: 'sprite' });
  }

  impact(x: number, y: number, z: number, color: THREE.Color) {
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.position.set(x, y, z);
      s.scale.set(0.12, 0.12, 1);
      this.add({ obj: s, life: 0.2, max: 0.2, kind: 'sprite', vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4, vz: (Math.random() - 0.5) * 6 });
    }
  }

  arc(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const pts: THREE.Vector3[] = [];
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const j = i === 0 || i === n ? 0 : 0.5;
      pts.push(new THREE.Vector3(x1 + (x2 - x1) * t + (Math.random() - 0.5) * j, y1 + (y2 - y1) * t + (Math.random() - 0.5) * j, z1 + (z2 - z1) * t + (Math.random() - 0.5) * j));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    this.add({ obj: new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(1.5, 3, 6), transparent: true, blending: THREE.AdditiveBlending })), life: 0.18, max: 0.18, kind: 'line' });
  }

  spawnIn(x: number, y: number, z: number, h: number, color: THREE.Color) {
    const geo = new THREE.CylinderGeometry(0.6, 0.6, h * 1.6, 8, 1, true);
    geo.translate(0, h * 0.8, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    this.add({ obj: m, life: 0.6, max: 0.6, kind: 'mesh', grow: -0.8 });
  }

  fire(x: number, z: number) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(4, 1.5, 0.3), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    s.position.set(x + (Math.random() - 0.5) * 0.6, 0.3, z + (Math.random() - 0.5) * 0.6);
    s.scale.set(0.9, 1.2, 1);
    this.add({ obj: s, life: 0.6 + Math.random() * 0.6, max: 1.2, kind: 'sprite', vy: 1.2 });
  }

  shards(x: number, y: number, z: number, color: THREE.Color, n = 14) {
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, color: color.clone().multiplyScalar(2), transparent: true, depthWrite: false }));
      s.position.set(x, y + Math.random(), z);
      s.scale.set(0.18, 0.18, 1);
      this.add({ obj: s, life: 0.8, max: 0.8, kind: 'sprite', vx: (Math.random() - 0.5) * 7, vy: 2 + Math.random() * 5, vz: (Math.random() - 0.5) * 7 });
    }
  }

  ring(x: number, y: number, z: number, r: number, color: THREE.Color) {
    const geo = new THREE.RingGeometry(r * 0.85, r, 32);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, y + 0.05, z);
    m.scale.setScalar(0.2);
    this.add({ obj: m, life: 0.45, max: 0.45, kind: 'mesh', grow: 2.2 });
  }

  /** Ground warning: a ring that fills as the strike approaches. */
  telegraph(x: number, z: number, r: number, t: number) {
    const ringGeo = new THREE.RingGeometry(r * 0.9, r, 28); ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.3, 0.08), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    ring.position.set(x, 0.06, z);
    this.add({ obj: ring, life: t, max: t, kind: 'mesh' });
    const discGeo = new THREE.CircleGeometry(r, 28); discGeo.rotateX(-Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.1, 0.04), transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }));
    disc.position.set(x, 0.05, z);
    disc.scale.setScalar(0.05);
    this.add({ obj: disc, life: t, max: t, kind: 'mesh', grow: -1 * 0 + 0.0001, fill: true });
  }

  /** camera position, set by the game each frame (for proximity fading) */
  cam = new THREE.Vector3(0, -999, 0);

  update(dt: number) {
    const keep: Fx[] = [];
    for (const f of this.list) {
      f.life -= dt;
      if (f.life <= 0) {
        this.group.remove(f.obj);
        const m = f.obj as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material)?.dispose();
        continue;
      }
      const k = f.life / f.max;
      const mat = (f.obj as THREE.Mesh).material as THREE.Material & { opacity: number; map?: THREE.Texture | null };
      if (f.kind === 'anim' && f.frames) {
        const i = Math.min(f.frames.length - 1, Math.floor((1 - k) * f.frames.length));
        mat.map = f.frames[i];
        const s = f.obj.scale.x * (1 + dt * (f.grow ?? 0));
        f.obj.scale.set(s, s, 1);
        mat.opacity = Math.min(1, k * 2);
      } else if (f.fill) {
        // telegraph disc: grows to full as the strike lands
        const sc = Math.max(0.05, 1 - k);
        f.obj.scale.setScalar(sc);
        mat.opacity = 0.18 + (1 - k) * 0.3 + (Math.sin(performance.now() / 50) > 0 ? 0.08 : 0);
        keep.push(f);
        continue;
      } else if (f.kind === 'mesh' && f.max > 0.9 && !f.grow) {
        mat.opacity = 0.5 + Math.sin(performance.now() / 60) * 0.4;
      } else {
        mat.opacity = k;
      }
      // never white out the screen: sprites that engulf the camera fade with proximity
      if ((f.kind === 'anim' || f.kind === 'sprite') && f.obj instanceof THREE.Sprite) {
        const near = f.obj.scale.x * 1.1;
        const d = f.obj.position.distanceTo(this.cam);
        if (d < near) mat.opacity *= Math.max(0.04, Math.pow(d / near, 3));
      }
      if (f.vx !== undefined || f.vy !== undefined) {
        f.obj.position.x += (f.vx ?? 0) * dt; f.obj.position.y += (f.vy ?? 0) * dt; f.obj.position.z += (f.vz ?? 0) * dt;
        if (f.vy !== undefined && f.kind === 'sprite' && f.vx !== undefined) f.vy -= 14 * dt;
      }
      if (f.kind === 'mesh' && f.grow) { const s = Math.max(0.01, f.obj.scale.x + f.grow * dt * (f.grow > 0 ? 3 : 1)); f.obj.scale.set(s, f.grow > 0 ? s : f.obj.scale.y, s); }
      keep.push(f);
    }
    this.list = keep;
  }
}

// ───────────────────────────── boss fight visuals ─────────────────────────────

const hueColor = (hue: number | undefined, k = 4): THREE.Color => {
  if (hue === undefined) return new THREE.Color(4, 0.6, 0.15).multiplyScalar(k / 4);
  const c = new THREE.Color().setHSL(((hue % 360) + 360) % 360 / 360, 1, 0.5);
  return c.multiplyScalar(k);
};

interface Tell { obj: THREE.Object3D; fill?: THREE.Mesh; life: number; max: number; kind: 'line' | 'cone' | 'circle' }
interface Wave { wall: THREE.Mesh; ring: THREE.Mesh; r: number; r1: number; speed: number }
interface ZoneView { id: number; kind: string; group: THREE.Group; mats: THREE.MeshBasicMaterial[]; state: string; t: number; base: THREE.Color; shape: string; w: number; d: number }
interface Debris { s: THREE.Sprite; vx: number; vy: number; vz: number; life: number; spin: number }

/** Telegraph decals, shockwave walls, persistent hazard zones and debris for Warden fights. */
export class BossFx {
  group = new THREE.Group();
  tells: Tell[] = [];
  waves: Wave[] = [];
  zones = new Map<number, ZoneView>();
  debris: Debris[] = [];
  time = 0;
  private sparkTex: THREE.Texture;
  constructor(scene: THREE.Scene) { scene.add(this.group); this.sparkTex = tex(getSparkSprite()); }

  clear() {
    for (const t of this.tells) this.group.remove(t.obj);
    for (const w of this.waves) { this.group.remove(w.wall); this.group.remove(w.ring); }
    for (const z of this.zones.values()) this.group.remove(z.group);
    for (const d of this.debris) this.group.remove(d.s);
    this.tells = []; this.waves = []; this.zones.clear(); this.debris = [];
  }

  private mat(c: THREE.Color, opacity: number, additive = false): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false });
  }

  tell(e: { shape: 'line' | 'cone' | 'circle'; x: number; z: number; x2?: number; z2?: number; r?: number; w?: number; a?: number; arc?: number; t: number; hue?: number }) {
    const c = hueColor(e.hue, 1.25);
    const g = new THREE.Group();
    let fill: THREE.Mesh | undefined;
    if (e.shape === 'line') {
      const x2 = e.x2 ?? e.x, z2 = e.z2 ?? e.z, w = e.w ?? 2;
      const len = Math.hypot(x2 - e.x, z2 - e.z) || 0.1;
      const plane = new THREE.PlaneGeometry(w, len); plane.rotateX(-Math.PI / 2); plane.translate(0, 0, -len / 2);
      const base = new THREE.Mesh(plane, this.mat(c.clone().multiplyScalar(0.35), 0.35));
      g.add(base);
      const fg = new THREE.PlaneGeometry(w, len); fg.rotateX(-Math.PI / 2); fg.translate(0, 0, -len / 2);
      fill = new THREE.Mesh(fg, this.mat(c, 0.45)); fill.scale.set(1, 1, 0.02); g.add(fill);
      for (const s of [-1, 1]) {
        const eg = new THREE.PlaneGeometry(0.12, len); eg.rotateX(-Math.PI / 2); eg.translate(s * w / 2, 0.01, -len / 2);
        g.add(new THREE.Mesh(eg, this.mat(c, 0.9)));
      }
      g.position.set(e.x, 0.07, e.z);
      g.rotation.y = Math.atan2(-(x2 - e.x), -(z2 - e.z));
    } else if (e.shape === 'cone') {
      const r = e.r ?? 10, arc = e.arc ?? 0.6, a = e.a ?? 0;
      const mk = (rr: number, op: number, col: THREE.Color) => { const geo = new THREE.CircleGeometry(rr, 28, -arc, arc * 2); geo.rotateX(-Math.PI / 2); return new THREE.Mesh(geo, this.mat(col, op)); };
      const base = mk(r, 0.28, c.clone().multiplyScalar(0.4));
      g.add(base);
      fill = mk(r, 0.5, c); fill.scale.setScalar(0.03); g.add(fill);
      const rim = new THREE.RingGeometry(r * 0.96, r, 28, 1, -arc, arc * 2); rim.rotateX(-Math.PI / 2); g.add(new THREE.Mesh(rim, this.mat(c, 0.9)));
      // cone yaw: the sim's yaw convention (atan2(dx,dz)); circle geometry starts on +x
      g.rotation.y = a - Math.PI / 2;
      g.position.set(e.x, 0.07, e.z);
    } else {
      const r = e.r ?? 3;
      const ring = new THREE.RingGeometry(r * 0.9, r, 40); ring.rotateX(-Math.PI / 2);
      g.add(new THREE.Mesh(ring, this.mat(c, 0.9)));
      const disc = new THREE.CircleGeometry(r, 40); disc.rotateX(-Math.PI / 2);
      g.add(new THREE.Mesh(disc, this.mat(c.clone().multiplyScalar(0.3), 0.22)));
      fill = new THREE.Mesh(disc.clone(), this.mat(c, 0.4)); fill.scale.setScalar(0.05); g.add(fill);
      g.position.set(e.x, 0.07, e.z);
    }
    this.group.add(g);
    this.tells.push({ obj: g, fill, life: e.t, max: e.t, kind: e.shape });
  }

  shockwave(x: number, z: number, r0: number, r1: number, speed: number, h: number, hue?: number) {
    const c = hueColor(hue ?? 25, 1.3);
    const wg = new THREE.CylinderGeometry(1, 1, 1, 64, 1, true); wg.translate(0, 0.5, 0);
    // fades toward the top so it reads as a heat wall, not a light source
    const cols: number[] = []; const pos = wg.getAttribute('position');
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); const k = y > 0.5 ? 0.15 : 1; cols.push(k, k, k); }
    wg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const wm = this.mat(c, 0.5, true); wm.vertexColors = true;
    const wall = new THREE.Mesh(wg, wm);
    wall.position.set(x, 0, z); wall.scale.set(r0, h + 0.15, r0);
    const rg = new THREE.RingGeometry(0.92, 1, 48); rg.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(rg, this.mat(hueColor(hue ?? 25, 1.6), 0.9, true));
    ring.position.set(x, 0.08, z); ring.scale.setScalar(r0);
    this.group.add(wall, ring);
    this.waves.push({ wall, ring, r: r0, r1, speed });
  }

  zone(e: { id: number; kind: string; shape: 'rect' | 'circle'; x: number; z: number; w: number; d: number; state: string; t: number }) {
    let z = this.zones.get(e.id);
    if (e.state === 'end') { if (z) { this.group.remove(z.group); this.zones.delete(e.id); } return; }
    if (e.kind === 'dark' || e.kind === 'invert') return; // world-level effects handled by the game
    if (!z) {
      const base = e.kind === 'lava' ? new THREE.Color(1.0, 0.32, 0.04) : e.kind === 'acid' ? new THREE.Color(0.35, 0.95, 0.1) : e.kind === 'thorns' ? new THREE.Color(0.25, 0.7, 0.15) : e.kind === 'static' ? new THREE.Color(0.4, 1.0, 0.85) : e.kind === 'blood' ? new THREE.Color(0.8, 0.04, 0.06) : new THREE.Color(0.8, 0.8, 0.8);
      const group = new THREE.Group();
      group.position.set(e.x, 0.06, e.z);
      const mats: THREE.MeshBasicMaterial[] = [];
      const flat = (w: number, d: number, col: THREE.Color, op: number, y = 0) => {
        const geo = e.shape === 'circle' ? new THREE.CircleGeometry(w, 36) : new THREE.PlaneGeometry(w, d);
        geo.rotateX(-Math.PI / 2);
        const m = this.mat(col, op); mats.push(m);
        const mesh = new THREE.Mesh(geo, m); mesh.position.y = y; group.add(mesh); return mesh;
      };
      flat(e.shape === 'circle' ? e.w : e.w, e.d, base, 0.5);
      flat(e.shape === 'circle' ? e.w * 0.6 : e.w * 0.96, e.shape === 'circle' ? e.d : e.d * 0.35, base.clone().multiplyScalar(1.6), 0.4, 0.01);
      if (e.kind === 'thorns') {
        // a low bramble wall to hop
        const bm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.5, 0.15), transparent: true, opacity: 0.95 });
        mats.push(bm);
        const box = new THREE.Mesh(new THREE.BoxGeometry(e.w, 0.85, e.d), bm); box.position.y = 0.42; group.add(box);
        for (let i = 0; i < Math.max(e.w, e.d) / 0.6; i++) {
          const sp = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.4, 0.3) }));
          const t = i * 0.6 - Math.max(e.w, e.d) / 2;
          sp.position.set(e.w > e.d ? t : (Math.random() - 0.5) * e.w, 0.95, e.w > e.d ? (Math.random() - 0.5) * e.d : t);
          sp.rotation.z = (Math.random() - 0.5) * 0.8;
          group.add(sp);
        }
      }
      this.group.add(group);
      z = { id: e.id, kind: e.kind, group, mats, state: e.state, t: 0, base, shape: e.shape, w: e.w, d: e.d };
      this.zones.set(e.id, z);
    }
    z.state = e.state; z.t = 0;
  }

  /** Debris chunks flung from impacts and deaths. */
  burst(x: number, y: number, z: number, n: number, color: THREE.Color, force = 7) {
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, color, transparent: true, depthWrite: false }));
      const sz = 0.15 + Math.random() * 0.35;
      s.scale.set(sz, sz, 1);
      s.position.set(x + (Math.random() - 0.5), y + Math.random(), z + (Math.random() - 0.5));
      this.group.add(s);
      const a = Math.random() * Math.PI * 2, f = force * (0.4 + Math.random() * 0.8);
      this.debris.push({ s, vx: Math.cos(a) * f, vy: 3 + Math.random() * force, vz: Math.sin(a) * f, life: 1.2 + Math.random() * 0.8, spin: (Math.random() - 0.5) * 10 });
    }
    if (this.debris.length > 300) for (const d of this.debris.splice(0, this.debris.length - 300)) this.group.remove(d.s);
  }

  update(dt: number) {
    this.time += dt;
    const keep: Tell[] = [];
    for (const t of this.tells) {
      t.life -= dt;
      if (t.life <= 0) { this.group.remove(t.obj); continue; }
      const k = 1 - t.life / t.max;
      if (t.fill) {
        if (t.kind === 'line') t.fill.scale.set(1, 1, Math.max(0.02, k));
        else t.fill.scale.setScalar(Math.max(0.03, k));
        (t.fill.material as THREE.MeshBasicMaterial).opacity = 0.18 + k * 0.3 + (t.life < 0.25 && Math.sin(this.time * 60) > 0 ? 0.2 : 0);
      }
      keep.push(t);
    }
    this.tells = keep;
    const wk: Wave[] = [];
    for (const w of this.waves) {
      w.r += w.speed * dt;
      if (w.r > w.r1) { this.group.remove(w.wall); this.group.remove(w.ring); continue; }
      const fade = 1 - (w.r / w.r1) ** 3;
      w.wall.scale.set(w.r, w.wall.scale.y, w.r);
      w.ring.scale.setScalar(w.r);
      (w.wall.material as THREE.MeshBasicMaterial).opacity = 0.32 * fade;
      (w.ring.material as THREE.MeshBasicMaterial).opacity = 0.9 * fade;
      wk.push(w);
    }
    this.waves = wk;
    for (const z of this.zones.values()) {
      z.t += dt;
      const blink = Math.sin(this.time * 14) > 0;
      const on = z.state === 'on', warn = z.state === 'warn';
      const flick = z.kind === 'static' && on ? 0.6 + Math.random() * 0.5 : 1;
      const lava = z.kind === 'lava' || z.kind === 'acid' ? 0.85 + 0.15 * Math.sin(this.time * 3 + z.id) : 1;
      const k = on ? 1 * flick * lava : warn ? (blink ? 0.5 : 0.18) : 0.12;
      z.mats.forEach((m, i) => {
        if (z.kind === 'thorns' && i >= 2) return;
        m.opacity = (i === 0 ? 0.55 : 0.45) * k;
        m.color.copy(z.base).multiplyScalar(on ? 1 : warn ? 0.8 : 0.35);
      });
    }
    const dk: Debris[] = [];
    for (const d of this.debris) {
      d.life -= dt;
      if (d.life <= 0) { this.group.remove(d.s); continue; }
      d.vy -= 18 * dt;
      d.s.position.x += d.vx * dt; d.s.position.y += d.vy * dt; d.s.position.z += d.vz * dt;
      if (d.s.position.y < 0.1) { d.s.position.y = 0.1; d.vy *= -0.3; d.vx *= 0.6; d.vz *= 0.6; }
      d.s.material.rotation += d.spin * dt;
      d.s.material.opacity = Math.min(1, d.life * 2);
      dk.push(d);
    }
    this.debris = dk;
  }
}
