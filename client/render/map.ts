// Builds the 3D room from RoomGeo: merged textured box geometry, emissive trim, doors, lights, decor.

import * as THREE from 'three';
import type { Box, RoomGeo, Decor } from '../../shared/mapData';
import { BIOME_LIGHT } from '../../shared/mapData';
import type { DoorKind, RoomKind } from '../../shared/protocol';
import {
  getWallTexture, getFloorTexture, getCeilingTexture, getCrateTexture, getDoorTexture, getTerminalTexture,
  getHubTexture, getMirrorTexture, getBodySprite, Biome,
} from './sprites';
import { tex, textCanvas } from './tex';

const TILE = 2; // meters per texture repeat

export interface DoorView {
  slot: number;
  kind: DoorKind;
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  label: THREE.Sprite;
  open: boolean;
  t: number; // 0 closed .. 1 open
  baseY: number;
  x: number; z: number; nx: number; nz: number;
  light: THREE.PointLight;
}

const DOOR_COLORS: Record<DoorKind, number> = { standard: 0x3b8cff, elite: 0xff2a2a, unknown: 0xffc83b, corrupted: 0x6dff5a };
const DOOR_LABEL: Record<DoorKind, string> = { standard: 'STANDARD', elite: 'ELITE', unknown: '???', corrupted: 'C0RRUPT3D' };
const KIND_LABEL: Record<RoomKind, string> = { combat: 'COMBAT', arena: 'ARENA', gauntlet: 'GAUNTLET', anomaly: 'ANOMALY', boss: '!! WARDEN !!', hub: 'HUB' };

function pushBoxGeometry(b: Box, pos: number[], uv: number[], nrm: number[], idx: number[], skipBottom = true, uvScale = 1) {
  const faces: { n: [number, number, number]; v: [number, number, number][]; u: (p: [number, number, number]) => [number, number] }[] = [
    { n: [0, 0, 1], v: [[b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1]], u: (p) => [p[0], p[1]] },
    { n: [0, 0, -1], v: [[b.x1, b.y0, b.z0], [b.x0, b.y0, b.z0], [b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0]], u: (p) => [-p[0], p[1]] },
    { n: [1, 0, 0], v: [[b.x1, b.y0, b.z1], [b.x1, b.y0, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1]], u: (p) => [-p[2], p[1]] },
    { n: [-1, 0, 0], v: [[b.x0, b.y0, b.z0], [b.x0, b.y0, b.z1], [b.x0, b.y1, b.z1], [b.x0, b.y1, b.z0]], u: (p) => [p[2], p[1]] },
    { n: [0, 1, 0], v: [[b.x0, b.y1, b.z1], [b.x1, b.y1, b.z1], [b.x1, b.y1, b.z0], [b.x0, b.y1, b.z0]], u: (p) => [p[0], -p[2]] },
    { n: [0, -1, 0], v: [[b.x0, b.y0, b.z0], [b.x1, b.y0, b.z0], [b.x1, b.y0, b.z1], [b.x0, b.y0, b.z1]], u: (p) => [p[0], p[2]] },
  ];
  for (let f = 0; f < faces.length; f++) {
    if (f === 5 && (skipBottom || b.y0 <= 0.001)) continue;
    const face = faces[f];
    const base = pos.length / 3;
    for (const v of face.v) {
      pos.push(v[0], v[1], v[2]);
      nrm.push(face.n[0], face.n[1], face.n[2]);
      const [u, w] = face.u(v);
      uv.push((u / TILE) * uvScale, (w / TILE) * uvScale);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function buildMerged(boxes: Box[], mat: THREE.Material, uvScale = 1): THREE.Mesh | null {
  if (!boxes.length) return null;
  const pos: number[] = [], uv: number[] = [], nrm: number[] = [], idx: number[] = [];
  for (const b of boxes) pushBoxGeometry(b, pos, uv, nrm, idx, false, uvScale);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return new THREE.Mesh(g, mat);
}

export class MapView {
  group = new THREE.Group();
  doors: DoorView[] = [];
  terminals: { mesh: THREE.Mesh; frame: number; t: number }[] = [];
  mirrors: { mesh: THREE.Mesh; t: number; frame: number }[] = [];
  floaters: { obj: THREE.Object3D; base: number; phase: number }[] = [];
  roomLights: THREE.PointLight[] = [];
  fixtures: THREE.Mesh[] = [];
  flickerAmt = 0;
  lightBase: number[] = [];
  geo: RoomGeo | null = null;
  emissiveColor = new THREE.Color();
  time = 0;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
    for (let i = 0; i < 6; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 30, 1.2);
      l.position.set(0, -50, 0);
      this.scene.add(l);
      this.roomLights.push(l);
    }
  }

  clear() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
      for (const mt of mats) mt.dispose();
    });
    this.scene.remove(this.group);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.doors = [];
    this.terminals = [];
    this.mirrors = [];
    this.floaters = [];
    this.fixtures = [];
    for (const l of this.roomLights) { l.intensity = 0; l.position.set(0, -50, 0); }
  }

  build(geo: RoomGeo, opts: { runCount: number; tally?: number; bodyVariant?: number; showBody?: boolean; showMirror?: boolean; extraBodies?: number; flicker?: number; corpses?: boolean; whisper?: string }) {
    this.clear();
    this.geo = geo;
    const hub = geo.desc.kind === 'hub';
    const biome = (hub ? 0 : geo.desc.biome) as Biome;
    const L = BIOME_LIGHT[hub ? 3 : geo.desc.biome];
    this.emissiveColor.setHex(L.emissive);
    this.flickerAmt = opts.flicker ?? (geo.desc.kind === 'anomaly' ? 0.4 : 0.05);
    const anomaly = geo.desc.kind === 'anomaly';

    const lambert = (c: HTMLCanvasElement, color = 0xffffff) => new THREE.MeshLambertMaterial({ map: tex(c, true), color });
    const wallTex = hub ? getHubTexture('wall') : getWallTexture(biome, 0);
    const groups: Record<string, { boxes: Box[]; mat: THREE.Material; uv?: number }> = {
      wall0: { boxes: [], mat: lambert(wallTex) },
      wall1: { boxes: [], mat: lambert(hub ? getHubTexture('wall') : getWallTexture(biome, 1)) },
      wall2: { boxes: [], mat: lambert(hub ? getHubTexture('wall') : getWallTexture(biome, 2)) },
      crate: { boxes: [], mat: lambert(hub ? getHubTexture('floor') : getCrateTexture(biome)), uv: 2 },
      platform: { boxes: [], mat: lambert(hub ? getHubTexture('floor') : getFloorTexture(biome), 0xd0c8c0) },
      trim: { boxes: [], mat: new THREE.MeshBasicMaterial({ color: this.emissiveColor.clone().multiplyScalar(hub ? 1.2 : 2.6), fog: true }) },
      anomaly: { boxes: [], mat: new THREE.MeshLambertMaterial({ map: tex(getWallTexture(biome, 2), true), color: 0x99ff99, emissive: 0x0a3a0a }) },
      alcove: { boxes: [], mat: lambert(wallTex, 0x8a8a8a) },
    };
    for (const b of geo.boxes) {
      if (b.mat === 'wall' || b.mat === 'pillar') groups['wall' + Math.min(2, b.tex ?? 0)].boxes.push(b);
      else if (b.mat === 'crate') groups.crate.boxes.push(b);
      else if (b.mat === 'platform') groups.platform.boxes.push(b);
      else if (b.mat === 'trim') groups.trim.boxes.push(b);
      else if (b.mat === 'anomaly') groups.anomaly.boxes.push(b);
      else if (b.mat === 'alcove') groups.alcove.boxes.push(b);
    }
    for (const k of Object.keys(groups)) {
      const g = groups[k];
      const m = buildMerged(g.boxes, g.mat, g.uv ?? 1);
      if (m) {
        this.group.add(m);
        if (k === 'anomaly') this.floaters.push({ obj: m, base: 0, phase: 0 });
      }
    }

    // floor + ceiling
    const pad = 6;
    const fw = geo.w + pad * 2, fd = geo.d + pad * 2;
    const floorTex = tex(hub ? getHubTexture('floor') : getFloorTexture(biome), true).clone();
    floorTex.repeat.set(fw / TILE, fd / TILE);
    floorTex.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw, fd), new THREE.MeshLambertMaterial({ map: floorTex }));
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);
    const ceilTex = tex(hub ? getHubTexture('wall') : getCeilingTexture(biome), true).clone();
    ceilTex.repeat.set(fw / TILE, fd / TILE);
    ceilTex.needsUpdate = true;
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(fw, fd), new THREE.MeshLambertMaterial({ map: ceilTex, color: 0x8a8a8a }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = geo.h;
    this.group.add(ceil);

    // lights + fixtures
    geo.lights.slice(0, this.roomLights.length).forEach((l, i) => {
      const pl = this.roomLights[i];
      pl.color.setHex(l.color);
      pl.intensity = l.intensity;
      pl.distance = l.range;
      pl.position.set(l.x, l.y, l.z);
      const fx = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(l.color).multiplyScalar(3) }));
      fx.position.set(l.x, geo.h - 0.08, l.z);
      this.group.add(fx);
      this.fixtures.push(fx);
    });
    this.lightBase = geo.lights.map((l) => l.intensity);

    // doors
    for (const ds of geo.doors) {
      const kind = ds.entry ? 'standard' : ds.kind;
      const p = ds.panel;
      const w = Math.max(p.x1 - p.x0, p.z1 - p.z0), hgt = p.y1 - p.y0;
      const mat = new THREE.MeshLambertMaterial({ map: tex(getDoorTexture(kind, false)), color: ds.entry ? 0x777777 : 0xffffff });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(p.x1 - p.x0, hgt, p.z1 - p.z0), mat);
      mesh.position.set((p.x0 + p.x1) / 2, hgt / 2, (p.z0 + p.z1) / 2);
      this.group.add(mesh);
      const color = ds.entry ? 0x331111 : DOOR_COLORS[kind];
      const glow = new THREE.Mesh(new THREE.BoxGeometry(ds.nx ? 0.1 : w, 0.22, ds.nz ? 0.1 : w), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(ds.entry ? 1 : 3.2) }));
      glow.position.set(ds.x + ds.nx * 0.05, p.y1 + 0.35, ds.z + ds.nz * 0.05);
      this.group.add(glow);
      const nextLbl = ds.entry ? '' : `${DOOR_LABEL[kind]}\n${geo.desc.kind === 'hub' ? 'DEPLOY' : KIND_LABEL[ds.nextKind]}`;
      const lc = textCanvas(nextLbl, '#' + new THREE.Color(color).getHexString(), 22, "'VT323', monospace", '#000');
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(lc), transparent: true, depthWrite: false, fog: true }));
      const s = 0.035;
      label.scale.set(lc.width * s, lc.height * s, 1);
      label.position.set(ds.x + ds.nx * 0.8, p.y1 + 1.4, ds.z + ds.nz * 0.8);
      label.visible = false;
      this.group.add(label);
      const light = new THREE.PointLight(color, 0, 7, 1.5);
      light.position.set(ds.x + ds.nx * 1.0, 2.5, ds.z + ds.nz * 1.0);
      // door lights share the dynamic budget: only for non-entry doors, max 3
      if (!ds.entry && this.doors.filter((d) => d.light.parent).length < 3) this.group.add(light);
      this.doors.push({ slot: ds.slot, kind, mesh, glow, label, open: false, t: 0, baseY: hgt / 2, x: ds.x, z: ds.z, nx: ds.nx, nz: ds.nz, light });
    }

    // decor
    for (const d of geo.decor) this.addDecor(d, geo, opts, biome);
    if (anomaly && opts.corpses) {
      // rooms full of your own corpses
      for (const d of geo.decor.filter((x) => x.kind === 'corpse')) this.addCorpse(d.x, d.z, (d.v ?? 0) % 4);
    }
    if (hub && opts.extraBodies) {
      for (let i = 0; i < opts.extraBodies; i++) this.addCorpse(-3 + i * 1.6, -2 + (i % 2) * 2.5, Math.min(3, (opts.bodyVariant ?? 0)));
    }
  }

  private addCorpse(x: number, z: number, v: number) {
    const c = getBodySprite(v);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(c.width / 24, c.height / 24), new THREE.MeshLambertMaterial({ map: tex(c), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = (x * 13.37 + z * 7.1) % (Math.PI * 2);
    m.position.set(x, 0.03, z);
    this.group.add(m);
  }

  private wallPlane(d: Decor, w: number, h: number, mat: THREE.Material): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(d.x + d.nx * 0.02, d.y, d.z + d.nz * 0.02);
    m.rotation.y = Math.atan2(d.nx, d.nz);
    this.group.add(m);
    return m;
  }

  private addDecor(d: Decor, geo: RoomGeo, opts: Parameters<MapView['build']>[1], biome: Biome) {
    switch (d.kind) {
      case 'terminal': {
        const m = this.wallPlane(d, 1.8, 1.35, new THREE.MeshBasicMaterial({ map: tex(getTerminalTexture(0)), color: new THREE.Color(1.6, 1.6, 1.6) }));
        this.terminals.push({ mesh: m, frame: 0, t: 0 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(d.nx ? 0.2 : 2.1, 1.65, d.nz ? 0.2 : 2.1), new THREE.MeshLambertMaterial({ color: 0x222222 }));
        frame.position.set(d.x - d.nx * 0.08, d.y, d.z - d.nz * 0.08);
        this.group.add(frame);
        break;
      }
      case 'tally': {
        const n = opts.tally ?? 0;
        const c = getHubTexture('tally', n);
        this.wallPlane(d, 4.4, 2.2, new THREE.MeshLambertMaterial({ map: tex(c), transparent: true }));
        break;
      }
      case 'mirror': {
        if (!opts.showMirror) break;
        const m = this.wallPlane(d, 1.0, 2.0, new THREE.MeshBasicMaterial({ map: tex(getMirrorTexture(0)), color: 0xbbbbbb }));
        this.mirrors.push({ mesh: m, t: 0, frame: 0 });
        break;
      }
      case 'body': {
        if (!opts.showBody) break;
        this.addCorpse(d.x, d.z, opts.bodyVariant ?? 0);
        break;
      }
      case 'chair': {
        const mat = new THREE.MeshLambertMaterial({ color: 0x5a5550 });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), mat); seat.position.set(d.x, 0.5, d.z);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.08), mat); back.position.set(d.x, 0.8, d.z + 0.28 * (d.nz || 1));
        const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0x333030, wireframe: true })); legs.position.set(d.x, 0.25, d.z);
        // the chair moves between deaths
        const off = ((opts.runCount * 2654435761) >>> 0) % 7 / 7;
        for (const o of [seat, back, legs]) { o.position.x += off * 1.2 - 0.6; o.rotation.y = off * 2; this.group.add(o); }
        break;
      }
      case 'text': {
        if (!opts.whisper) break;
        const c = textCanvas(opts.whisper, '#7dff7a', 26, "'VT323', monospace", '#2f2');
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, color: new THREE.Color(1.8, 1.8, 1.8), depthWrite: false }));
        s.scale.set(c.width * 0.03, c.height * 0.03, 1);
        s.position.set(d.x, d.y, d.z);
        this.group.add(s);
        this.floaters.push({ obj: s, base: d.y, phase: d.x });
        break;
      }
      case 'pipe': {
        const mat = new THREE.MeshLambertMaterial({ color: 0x6a4a35 });
        for (let i = 0; i < 2; i++) {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, geo.h, 6), mat);
          p.position.set(d.x + d.nx * (0.3 + i * 0.4), geo.h / 2, d.z + d.nz * (0.3 + i * 0.4) + (d.nx ? i * 0.5 : 0));
          this.group.add(p);
        }
        break;
      }
      case 'vat': {
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 8), new THREE.MeshBasicMaterial({ color: biome === 2 ? new THREE.Color(1.6, 0.2, 0.25) : new THREE.Color(1.6, 0.7, 0.2), transparent: true, opacity: 0.55 }));
        glass.position.set(d.x + d.nx * 0.9, 1.4, d.z + d.nz * 0.9);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        cap.position.copy(glass.position); cap.position.y = 2.7;
        this.group.add(glass, cap);
        break;
      }
      case 'server': {
        const rack = new THREE.Mesh(new THREE.BoxGeometry(d.nx ? 0.7 : 1.2, 2.6, d.nz ? 0.7 : 1.2), new THREE.MeshLambertMaterial({ map: tex(getWallTexture(1, 1), true), color: 0x8899aa }));
        rack.position.set(d.x + d.nx * 0.36, 1.3, d.z + d.nz * 0.36);
        const leds = new THREE.Mesh(new THREE.BoxGeometry(d.nx ? 0.02 : 0.9, 1.8, d.nz ? 0.02 : 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 1.2, 2.2), transparent: true, opacity: 0.25 }));
        leds.position.set(d.x + d.nx * 0.73, 1.4, d.z + d.nz * 0.73);
        this.group.add(rack, leds);
        break;
      }
      case 'cable': {
        const mat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5 + i, 4), mat);
          c.position.set(d.x + d.nx * (0.4 + i * 0.3), geo.h - (1.5 + i) / 2, d.z + d.nz * (0.4 + i * 0.3) + i * 0.3);
          this.group.add(c);
        }
        break;
      }
      default: break;
    }
  }

  setDoorOpen(slot: number, open: boolean) {
    const d = this.doors.find((x) => x.slot === slot);
    if (!d || d.open === open) return;
    d.open = open;
    d.label.visible = open;
    (d.mesh.material as THREE.MeshLambertMaterial).map = tex(getDoorTexture(d.kind, open));
  }

  showDoorLabels(on: boolean) {
    for (const d of this.doors) if (d.slot >= 0) d.label.visible = on;
  }

  update(dt: number) {
    this.time += dt;
    for (const d of this.doors) {
      const target = d.open ? 1 : 0;
      d.t += (target - d.t) * Math.min(1, dt * 4);
      d.mesh.position.y = d.baseY + d.t * (d.baseY * 2 - 0.25);
      d.light.intensity = d.slot >= 0 ? (d.open ? 6 + Math.sin(this.time * 4) * 1.5 : 1.2) : 0;
      if (d.label.visible) d.label.position.y += Math.sin(this.time * 2 + d.slot) * 0.002;
    }
    for (const t of this.terminals) {
      t.t += dt;
      if (t.t > 0.12) { t.t = 0; t.frame++; (t.mesh.material as THREE.MeshBasicMaterial).map = tex(getTerminalTexture(t.frame % 8)); }
    }
    for (const m of this.mirrors) {
      m.t += dt;
      if (m.t > 0.4) { m.t = 0; m.frame++; (m.mesh.material as THREE.MeshBasicMaterial).map = tex(getMirrorTexture(m.frame % 4)); }
    }
    for (const f of this.floaters) {
      if (f.obj instanceof THREE.Sprite) f.obj.position.y = f.base + Math.sin(this.time * 0.8 + f.phase) * 0.25;
      else f.obj.position.y = Math.sin(this.time * 0.5) * 0.15;
    }
    // light flicker
    if (this.flickerAmt > 0) {
      this.roomLights.forEach((l, i) => {
        if (i >= this.lightBase.length) return;
        const fl = Math.random() < this.flickerAmt * 0.06 ? 0.15 + Math.random() * 0.4 : 1;
        l.intensity = this.lightBase[i] * fl;
        const fx = this.fixtures[i];
        if (fx) fx.visible = fl > 0.5;
      });
    }
  }
}
