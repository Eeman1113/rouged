// Transient world effects: tracers, lance beams, explosions, tesla arcs, muzzle flashes, spawn-ins, fire.

import * as THREE from 'three';
import { getExplosionFrames, getMuzzleSprite, getSparkSprite } from './sprites';
import { tex } from './tex';
import { glowTex } from './entities';

interface Fx { obj: THREE.Object3D; life: number; max: number; kind: 'line' | 'sprite' | 'anim' | 'beam' | 'mesh'; frames?: THREE.Texture[]; vx?: number; vy?: number; vz?: number; grow?: number }

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
      } else {
        mat.opacity = k;
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
