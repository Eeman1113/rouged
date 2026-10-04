// Gore is simulated, not animated: directional blood spray, flying gibs that bounce and persist,
// blood decals that pool on the floor, scorch marks on walls.

import * as THREE from 'three';
import type { Box } from '../../shared/mapData';
import { getGibSprites, getBloodSprites, getBloodDecal, getScorchDecal } from './sprites';
import { tex } from './tex';

interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; size: number; c: number }
interface Gib { mesh: THREE.Mesh; vx: number; vy: number; vz: number; spin: number; rest: boolean; t: number }
interface Decal { mesh: THREE.Mesh; grow: number; target: number }

const MAX_PARTICLES = 900;
const MAX_GIBS = 220;
const MAX_DECALS = 180;

export class Gore {
  group = new THREE.Group();
  particles: Particle[] = [];
  points: THREE.Points;
  posAttr: THREE.BufferAttribute;
  colAttr: THREE.BufferAttribute;
  sizeAttr: THREE.BufferAttribute;
  gibs: Gib[] = [];
  decals: Decal[] = [];
  boxes: Box[] = [];
  private gibTex: THREE.Texture[];
  private decalTex: THREE.Texture[];
  private scorch: THREE.Texture;
  private palette = [new THREE.Color(0.75, 0.04, 0.05), new THREE.Color(0.45, 0.02, 0.03), new THREE.Color(0.22, 0.01, 0.01), new THREE.Color(0.18, 0.14, 0.12), new THREE.Color(1.6, 0.9, 0.3)];

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
    this.colAttr = new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
    this.sizeAttr = new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES), 1);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('color', this.colAttr);
    geo.setAttribute('size', this.sizeAttr);
    const blood = getBloodSprites()[0];
    const mat = new THREE.PointsMaterial({ size: 0.14, map: tex(blood), vertexColors: true, transparent: true, alphaTest: 0.4, sizeAttenuation: true, depthWrite: false });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
    this.gibTex = getGibSprites().map((c) => tex(c));
    this.decalTex = [0, 1, 2, 3].map((i) => tex(getBloodDecal(i)));
    this.scorch = tex(getScorchDecal());
  }

  clear() {
    for (const g of this.gibs) this.group.remove(g.mesh);
    for (const d of this.decals) this.group.remove(d.mesh);
    this.gibs = []; this.decals = []; this.particles = [];
  }

  /** Directional blood spray from a hit point. */
  spray(x: number, y: number, z: number, dx: number, dy: number, dz: number, n: number, force = 6, mech = false) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const s = force * (0.4 + Math.random());
      this.particles.push({
        x, y, z,
        vx: dx * s + (Math.random() - 0.5) * force * 0.8,
        vy: dy * s + Math.random() * force * 0.6,
        vz: dz * s + (Math.random() - 0.5) * force * 0.8,
        life: 0.5 + Math.random() * 0.6,
        size: 0.08 + Math.random() * 0.12,
        c: mech && Math.random() < 0.35 ? (Math.random() < 0.5 ? 3 : 4) : Math.floor(Math.random() * 3),
      });
    }
  }

  sparks(x: number, y: number, z: number, n: number) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      this.particles.push({ x, y, z, vx: (Math.random() - 0.5) * 9, vy: Math.random() * 6, vz: (Math.random() - 0.5) * 9, life: 0.25 + Math.random() * 0.3, size: 0.06, c: 4 });
    }
  }

  /** Dismemberment: chunks fly along the kill vector. */
  burst(x: number, y: number, z: number, dx: number, dz: number, n: number, scale = 1) {
    for (let i = 0; i < n; i++) {
      if (this.gibs.length >= MAX_GIBS) { const old = this.gibs.shift()!; this.group.remove(old.mesh); }
      const t = this.gibTex[Math.floor(Math.random() * this.gibTex.length)];
      const img = t.image as HTMLCanvasElement;
      const s = 0.035 * scale * (0.8 + Math.random() * 0.6);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(img.width * s, img.height * s), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
      mesh.position.set(x + (Math.random() - 0.5) * 0.4 * scale, y + (Math.random() - 0.5) * 0.6 * scale, z + (Math.random() - 0.5) * 0.4 * scale);
      const f = 4 + Math.random() * 6;
      this.gibs.push({
        mesh, vx: dx * f + (Math.random() - 0.5) * 6, vy: 3 + Math.random() * 7, vz: dz * f + (Math.random() - 0.5) * 6,
        spin: (Math.random() - 0.5) * 20, rest: false, t: 0,
      });
      this.group.add(mesh);
    }
  }

  decal(x: number, z: number, size: number, scorch = false, y = 0.015 + Math.random() * 0.01) {
    if (this.decals.length >= MAX_DECALS) { const old = this.decals.shift()!; this.group.remove(old.mesh); }
    const mat = new THREE.MeshLambertMaterial({ map: scorch ? this.scorch : this.decalTex[Math.floor(Math.random() * 4)], transparent: true, alphaTest: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(size * 0.3);
    this.group.add(mesh);
    this.decals.push({ mesh, grow: 0, target: size });
  }

  wallDecal(x: number, y: number, z: number, nx: number, nz: number, size: number, scorch = false) {
    if (this.decals.length >= MAX_DECALS) { const old = this.decals.shift()!; this.group.remove(old.mesh); }
    const mat = new THREE.MeshLambertMaterial({ map: scorch ? this.scorch : this.decalTex[Math.floor(Math.random() * 4)], transparent: true, alphaTest: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    mesh.position.set(x + nx * 0.02, y, z + nz * 0.02);
    mesh.rotation.y = Math.atan2(nx, nz);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    this.group.add(mesh);
    this.decals.push({ mesh, grow: 1, target: size });
  }

  private solidAt(x: number, y: number, z: number): Box | null {
    for (const b of this.boxes) if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1 && z > b.z0 && z < b.z1) return b;
    return null;
  }

  update(dt: number, camYaw: number) {
    // particles
    let n = 0;
    const keep: Particle[] = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vy -= 20 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y <= 0.02) {
        if (p.c < 3 && Math.random() < 0.18) this.decal(p.x, p.z, 0.35 + Math.random() * 0.4);
        continue;
      }
      const b = this.solidAt(p.x, p.y, p.z);
      if (b) {
        if (p.c < 3 && Math.random() < 0.25) {
          // splat on the face we entered from
          const dx0 = p.x - b.x0, dx1 = b.x1 - p.x, dz0 = p.z - b.z0, dz1 = b.z1 - p.z, dy1 = b.y1 - p.y;
          const m = Math.min(dx0, dx1, dz0, dz1, dy1);
          if (m === dy1) this.decal(p.x, p.z, 0.3, false, b.y1 + 0.015);
          else if (m === dx0) this.wallDecal(b.x0, p.y, p.z, -1, 0, 0.35);
          else if (m === dx1) this.wallDecal(b.x1, p.y, p.z, 1, 0, 0.35);
          else if (m === dz0) this.wallDecal(p.x, p.y, b.z0, 0, -1, 0.35);
          else this.wallDecal(p.x, p.y, b.z1, 0, 1, 0.35);
        }
        continue;
      }
      keep.push(p);
      if (n < MAX_PARTICLES) {
        this.posAttr.setXYZ(n, p.x, p.y, p.z);
        const c = this.palette[p.c];
        this.colAttr.setXYZ(n, c.r, c.g, c.b);
        this.sizeAttr.setX(n, p.size);
        n++;
      }
    }
    this.particles = keep;
    this.points.geometry.setDrawRange(0, n);
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;

    // gibs
    for (const g of this.gibs) {
      g.mesh.rotation.set(0, camYaw, g.t * g.spin);
      if (g.rest) continue;
      g.t += dt;
      g.vy -= 22 * dt;
      const m = g.mesh.position;
      const nx = m.x + g.vx * dt, ny = m.y + g.vy * dt, nz = m.z + g.vz * dt;
      if (this.solidAt(nx, m.y, m.z)) g.vx *= -0.4; else m.x = nx;
      if (this.solidAt(m.x, m.y, nz)) g.vz *= -0.4; else m.z = nz;
      const floorB = this.solidAt(m.x, ny, m.z);
      const floorY = floorB ? floorB.y1 : 0;
      if (ny <= floorY + 0.06) {
        m.y = floorY + 0.06;
        if (Math.abs(g.vy) > 2.5) {
          g.vy = -g.vy * 0.35; g.vx *= 0.6; g.vz *= 0.6;
          if (Math.random() < 0.5) this.decal(m.x, m.z, 0.5 + Math.random() * 0.4, false, floorY + 0.015);
        } else { g.vy = 0; g.vx *= 0.8; g.vz *= 0.8; if (Math.hypot(g.vx, g.vz) < 0.3) g.rest = true; }
      } else m.y = ny;
    }

    // decals grow into pools
    for (const d of this.decals) {
      if (d.grow < 1) {
        d.grow = Math.min(1, d.grow + dt * 1.6);
        const s = d.target * (0.3 + 0.7 * d.grow);
        d.mesh.scale.set(s, s, s);
      }
    }
  }
}
