// Enemy billboards (DOOM-style sprites), other players, projectiles, mines, drops, pedestals.

import * as THREE from 'three';
import type { EnemySnap, MineSnap, Pedestal, PlayerSnap, ProjectileKind, ProjectileSnap, EnemyType, ShopItem } from '../../shared/protocol';
import { ENEMIES } from '../../shared/enemyDefs';
import { POWERUP_BY_ID, RARITY_COLOR } from '../../shared/powerupDefs';
import type { Light } from '../../shared/mapData';
import { getEnemySprites, getProjectileSprite, getMineSprite, getPickupSprite, getPedestalIcon, getScrapSprite, EnemySpriteSet } from './sprites';
import { tex, textCanvas } from './tex';
import { bossFrame, bossDeadFrame, bossArt, clipInfo, prewarmBoss } from './art/boss';
import { FH as BOSS_FH } from './art/boss/rig';

const glowTexCanvas = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(8, 8, 0, 8, 8, 8);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.4, 'rgba(255,255,255,.6)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 16, 16);
  return c;
})();
export const glowTex = () => tex(glowTexCanvas);

const shadowTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(8, 8, 0, 8, 8, 8);
  grd.addColorStop(0, 'rgba(0,0,0,.7)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 16, 16);
  return c;
})();

const EYE_COLOR: Record<EnemyType, THREE.Color> = {
  drone: new THREE.Color(6, 0.4, 0.2), grunt: new THREE.Color(6, 0.3, 0.2), brute: new THREE.Color(6, 2.2, 0.3), stalker: new THREE.Color(6, 0.2, 0.2),
  spider: new THREE.Color(6, 2.4, 0.4), replica: new THREE.Color(0.6, 3.5, 4), warden: new THREE.Color(7, 1.2, 0.3),
  leech: new THREE.Color(6, 0.6, 0.6), sentinel: new THREE.Color(2, 3.5, 6), bomber: new THREE.Color(6, 2, 0.2), mortar: new THREE.Color(6, 1.5, 0.3),
  bulwark: new THREE.Color(6, 2.6, 0.4), wraith: new THREE.Color(1.5, 5, 4), echo: new THREE.Color(0.4, 6, 1.5),
};

export interface EnemyView {
  id: number;
  type: EnemyType;
  sprites: EnemySpriteSet;
  group: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  xray: THREE.Mesh;
  eye: THREE.Sprite;
  shadow: THREE.Mesh;
  laser: THREE.Line | null;
  animT: number;
  flash: number;
  dead: boolean;
  deadT: number;
  last: EnemySnap;
  x: number; y: number; z: number;
  spawnFx: number;
  whisperT: number;
  boss?: BossExtra;
}

/** Extra render state for Wardens (and the Handler's echoes). */
interface BossExtra {
  v: number;
  core: THREE.Sprite;
  shield: THREE.Mesh;
  beam: THREE.Mesh;
  beamCore: THREE.Mesh;
  feed: THREE.Line;
  glow: [THREE.Color, THREE.Color];
  painT: number;
  px: number; pz: number; speed: number;
  deathT: number;
  loopT: number;
  lastClip: string;
}

const BOSS_HUE = [new THREE.Color(2.6, 0.9, 0.2), new THREE.Color(2.6, 0.4, 0.8), new THREE.Color(2.6, 0.4, 0.35), new THREE.Color(0.7, 2.6, 0.5), new THREE.Color(0.9, 2.6, 0.7), new THREE.Color(2.6, 1.2, 0.25), new THREE.Color(0.4, 2.6, 0.9)];
export function bossHue(v: number): THREE.Color { return BOSS_HUE[Math.max(0, Math.min(6, v | 0))]; }
const hexColor = (h: number, k = 4): THREE.Color => new THREE.Color(((h >> 16) & 255) / 255 * k, ((h >> 8) & 255) / 255 * k, (h & 255) / 255 * k);

export class EntityViews {
  group = new THREE.Group();
  enemies = new Map<number, EnemyView>();
  corpses: EnemyView[] = [];
  players = new Map<string, { group: THREE.Group; mesh: THREE.Mesh; label: THREE.Sprite; x: number; y: number; z: number }>();
  projectiles = new Map<number, { sprite: THREE.Sprite; glow: THREE.Sprite; snap: ProjectileSnap; t: number }>();
  mines = new Map<number, { mesh: THREE.Mesh; glow: THREE.Sprite; armed: boolean }>();
  drops = new Map<number, { sprite: THREE.Sprite; x: number; y: number; z: number; t: number }>();
  pedestals: { slot: number; group: THREE.Group; icon: THREE.Sprite; beam: THREE.Mesh; column: THREE.Mesh; rise: number; ped: Pedestal; light: THREE.PointLight | null; shattered: boolean }[] = [];
  lights: Light[] = [];
  ambient = 0.5;
  time = 0;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
  }

  clearRoom() {
    this.clearShop();
    for (const v of this.enemies.values()) this.group.remove(v.group);
    for (const v of this.corpses) this.group.remove(v.group);
    for (const p of this.projectiles.values()) { this.group.remove(p.sprite); this.group.remove(p.glow); }
    for (const m of this.mines.values()) { this.group.remove(m.mesh); this.group.remove(m.glow); }
    for (const d of this.drops.values()) this.group.remove(d.sprite);
    this.clearPedestals();
    this.enemies.clear(); this.corpses = []; this.projectiles.clear(); this.mines.clear(); this.drops.clear();
  }

  clearPedestals() {
    for (const p of this.pedestals) { this.group.remove(p.group); if (p.light) this.group.remove(p.light); }
    this.pedestals = [];
  }

  /** brightness at a point from room lights (sprites are unlit: fake it) */
  lightAt(x: number, y: number, z: number, out: THREE.Color): THREE.Color {
    out.setRGB(this.ambient, this.ambient, this.ambient);
    for (const l of this.lights) {
      const d = Math.hypot(l.x - x, l.y - y, l.z - z);
      const k = Math.max(0, 1 - d / l.range) * (l.intensity / 34) * 1.3;
      if (k <= 0) continue;
      out.r += ((l.color >> 16) & 255) / 255 * k;
      out.g += ((l.color >> 8) & 255) / 255 * k;
      out.b += (l.color & 255) / 255 * k;
    }
    out.r = Math.min(1.25, out.r); out.g = Math.min(1.25, out.g); out.b = Math.min(1.25, out.b);
    return out;
  }

  private makeEnemy(s: EnemySnap, biome: number): EnemyView {
    if (s.type === 'warden' || s.type === 'echo') return this.makeBoss(s, s.type === 'echo' ? s.v ?? 6 : biome);
    const sprites = getEnemySprites(s.type, s.elite ? 1 : 0);
    const def = ENEMIES[s.type];
    const worldH = sprites.worldH;
    const worldW = (worldH * sprites.w) / sprites.h;
    const geo = new THREE.PlaneGeometry(worldW, worldH);
    geo.translate(0, worldH / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ map: tex(sprites.idle[0]), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
    const mesh = new THREE.Mesh(geo, mat);
    const xmat = new THREE.MeshBasicMaterial({ map: tex(sprites.idle[0]), transparent: true, opacity: 0.35, color: new THREE.Color(1.5, 0.3, 2), depthTest: false, depthWrite: false, alphaTest: 0.5, fog: false });
    const xray = new THREE.Mesh(geo, xmat);
    xray.renderOrder = 10;
    xray.visible = false;
    const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: EYE_COLOR[s.type], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const es = s.type === 'brute' ? 0.5 : 0.28;
    eye.scale.set(es, es, 1);
    eye.position.y = def.headY;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(def.radius * 2.6, def.radius * 2.6), new THREE.MeshBasicMaterial({ map: tex(shadowTex), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    const group = new THREE.Group();
    group.add(mesh, xray, eye);
    this.group.add(group);
    this.group.add(shadow);
    return {
      id: s.id, type: s.type, sprites, group, mesh, mat, xray, eye, shadow, laser: null, animT: Math.random() * 3, flash: 0,
      dead: false, deadT: 0, last: s, x: s.x, y: s.y, z: s.z, spawnFx: 1, whisperT: 0,
    };
  }

  private makeBoss(s: EnemySnap, v: number): EnemyView {
    const art = bossArt(v);
    const def = ENEMIES[s.type];
    const H = (art.worldH * BOSS_FH) / 112, W = H;
    const geo = new THREE.PlaneGeometry(W, H);
    geo.translate(0, H / 2 - (3 / BOSS_FH) * H, 0);
    const idle = bossFrame(v, 'idle', 0);
    const mat = new THREE.MeshBasicMaterial({ map: tex(idle), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
    const mesh = new THREE.Mesh(geo, mat);
    const xmat = new THREE.MeshBasicMaterial({ map: tex(idle), transparent: true, opacity: 0.35, color: new THREE.Color(1.5, 0.3, 2), depthTest: false, depthWrite: false, alphaTest: 0.5, fog: false });
    const xray = new THREE.Mesh(geo, xmat);
    xray.renderOrder = 10; xray.visible = false;
    const glow: [THREE.Color, THREE.Color] = [hexColor(art.glow[0], 2.5), hexColor(art.glow[1], 2.5)];
    const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: glow[0], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    eye.scale.set(1.6, 1.6, 1);
    eye.position.y = def.headY;
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: glow[1], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    core.position.y = s.wy ?? def.headY;
    const shield = new THREE.Mesh(new THREE.SphereGeometry(H * 0.52, 20, 14), new THREE.MeshBasicMaterial({ color: glow[1].clone().multiplyScalar(0.25), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, wireframe: false }));
    shield.position.y = H * 0.45;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(def.radius * 3.4, def.radius * 3.4), new THREE.MeshBasicMaterial({ map: tex(shadowTex), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02;
    const bgeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); bgeo.rotateX(Math.PI / 2);
    const beam = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial({ color: bossHue(v), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    const beamCore = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.visible = false; beamCore.visible = false;
    const feed = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: bossHue(v), transparent: true, blending: THREE.AdditiveBlending }));
    feed.visible = false;
    const group = new THREE.Group();
    group.add(mesh, xray, eye, core);
    this.group.add(group, shadow, shield, beam, beamCore, feed);
    if (s.type === 'warden') prewarmBoss(v, [0]);
    const view: EnemyView = {
      id: s.id, type: s.type, sprites: getEnemySprites('warden', v), group, mesh, mat, xray, eye, shadow, laser: null, animT: 0, flash: 0,
      dead: false, deadT: 0, last: s, x: s.x, y: s.y, z: s.z, spawnFx: s.type === 'echo' ? 1 : 0, whisperT: 0,
      boss: { v, core, shield, beam, beamCore, feed, glow, painT: 0, px: s.x, pz: s.z, speed: 0, deathT: -1, loopT: 0, lastClip: '' },
    };
    return view;
  }

  /** Choose a boss animation frame from the snapshot's move/stage/progress. */
  private bossPick(v: EnemyView, dt: number): HTMLCanvasElement {
    const b = v.boss!, s = v.last;
    const dmg = Math.max(0, Math.min(2, (s.phase ?? 1) - 1));
    const move = s.move ?? 'idle';
    let clip = 'idle', i = 0;
    const T = (c: string, t: number): number => Math.floor(Math.max(0, Math.min(0.999, t)) * clipInfo(b.v, c).n);
    const loop = (c: string, fps: number): number => Math.floor(b.loopT * fps) % clipInfo(b.v, c).n;
    if (b.deathT >= 0) { clip = 'death'; i = Math.min(clipInfo(b.v, 'death').n - 1, Math.floor((b.deathT / 2.6) * clipInfo(b.v, 'death').n)); }
    else if (move === 'intro') { clip = 'intro'; i = T(clip, s.moveT ?? 0); }
    else if (move === 'transition') { clip = 'trans'; i = T(clip, s.moveT ?? 0); }
    else if (move === 'break') { clip = 'break'; const t = s.moveT ?? 0; i = t < 0.18 ? T(clip, t / 0.18 * 0.5) : 4 + (Math.floor(b.loopT * 6) % 4); }
    else if (move === 'finish') { clip = 'finish'; i = loop(clip, 7); }
    else if (move === 'idle') {
      if (b.painT > 0) { clip = 'pain'; i = Math.min(2, Math.floor((1 - b.painT / 0.22) * 3)); }
      else if (b.speed > 0.9) { clip = 'move'; i = loop(clip, Math.min(12, 5 + b.speed * 1.2)); }
      else { clip = 'idle'; i = loop(clip, 5); }
    } else {
      clip = `${move}.${s.moveStage ?? 0}`;
      const info = clipInfo(b.v, clip);
      i = info.loop ? Math.floor(b.loopT * 11) % info.n : T(clip, s.moveT ?? 0);
    }
    if (clip !== b.lastClip) { b.lastClip = clip; }
    void dt;
    return bossFrame(b.v, clip, i, dmg);
  }

  private updateBoss(v: EnemyView, dt: number, tmp: THREE.Color) {
    const b = v.boss!, s = v.last;
    b.loopT += dt;
    if (b.painT > 0) b.painT -= dt;
    const sp = Math.hypot(v.x - b.px, v.z - b.pz) / Math.max(1e-3, dt);
    b.speed += (sp - b.speed) * Math.min(1, dt * 8);
    b.px = v.x; b.pz = v.z;
    const frame = this.bossPick(v, dt);
    const t = tex(frame);
    if (v.mat.map !== t) { v.mat.map = t; (v.xray.material as THREE.MeshBasicMaterial).map = t; }
    // weak point glow: pulses hard when open
    const core = s.core ?? 0;
    const cm = b.core.material as THREE.SpriteMaterial;
    b.core.position.y = s.wy ?? ENEMIES[v.type].headY;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * (core > 0.5 ? 16 : 5));
    cm.opacity = core > 0.05 ? Math.min(0.75, core * (0.35 + pulse * 0.4)) : 0;
    const cs = 0.6 + core * 1.5;
    b.core.scale.set(cs, cs, 1);
    // eye glow intensifies on the wind-up
    (v.eye.material as THREE.SpriteMaterial).opacity = Math.min(0.85, 0.3 + s.tell * 0.5 + Math.sin(this.time * 8 + v.id) * 0.1);
    const es = 0.9 + s.tell * 0.9;
    v.eye.scale.set(es, es, 1);
    // invulnerability bubble
    const sh = s.shield ?? 0;
    b.shield.position.set(v.x, v.y + (b.shield.geometry as THREE.SphereGeometry).parameters.radius * 0.85, v.z);
    const smat = b.shield.material as THREE.MeshBasicMaterial;
    smat.opacity = sh * (0.18 + 0.1 * Math.sin(this.time * 9));
    b.shield.visible = sh > 0.02;
    b.shield.scale.setScalar(1 + Math.sin(this.time * 3) * 0.02);
    // beams
    const bm = s.beam;
    if (bm && bm.length >= 8) {
      const a = new THREE.Vector3(bm[0], bm[1], bm[2]), c = new THREE.Vector3(bm[3], bm[4], bm[5]);
      const len = a.distanceTo(c);
      const live = bm[7] > 0.5;
      const w = live ? bm[6] * (0.42 + Math.sin(this.time * 40) * 0.06) : 0.04 + Math.sin(this.time * 30) * 0.02;
      for (const m of [b.beam, b.beamCore]) {
        m.visible = true;
        m.position.copy(a).add(c).multiplyScalar(0.5);
        m.lookAt(c);
        const k = m === b.beamCore ? 0.35 : 1;
        m.scale.set(w * k, w * k, len);
      }
      (b.beam.material as THREE.MeshBasicMaterial).opacity = live ? 0.85 : 0.55 + Math.sin(this.time * 25) * 0.3;
      b.beamCore.visible = live;
      const fp = b.feed.geometry.getAttribute('position') as THREE.BufferAttribute;
      fp.setXYZ(0, v.x, v.y + (s.wy ?? ENEMIES[v.type].headY), v.z); fp.setXYZ(1, a.x, a.y, a.z); fp.needsUpdate = true;
      b.feed.visible = live;
    } else { b.beam.visible = false; b.beamCore.visible = false; b.feed.visible = false; }
    // lighting / tints
    this.lightAt(v.x, v.y + 2, v.z, tmp);
    tmp.multiplyScalar(1.1);
    if (s.burning) tmp.r += 0.5 + Math.sin(this.time * 30) * 0.3;
    if (s.move === 'break') { const p = 0.5 + Math.sin(this.time * 14) * 0.5; tmp.r += p * 0.6; tmp.g += p * 0.3; }
    if (s.tell > 0.05 && s.move !== 'break') tmp.r += s.tell * 0.35;
    if (v.flash > 0) { tmp.lerp(new THREE.Color(3, 3, 3), Math.min(1, v.flash) * 0.7); v.flash -= dt * 12; }
    if (v.spawnFx > 0) { v.spawnFx -= dt * 2.2; tmp.setRGB(1 + v.spawnFx * 3, 1 + v.spawnFx * 3, 1 + v.spawnFx * 3); v.mesh.scale.set(Math.max(0.05, 1 - v.spawnFx * 0.9), 1 + v.spawnFx * 0.6, 1); } else v.mesh.scale.set(1, 1, 1);
    if (v.type === 'echo') { tmp.multiplyScalar(0.8); tmp.g += 0.25 + Math.sin(this.time * 20 + v.id) * 0.1; }
    v.mat.color.copy(tmp);
    v.mat.opacity = 1 - s.cloak * 0.92;
    v.mat.alphaTest = s.cloak > 0.4 ? 0.01 : 0.5;
    v.eye.visible = s.cloak < 0.5;
  }

  /** Sync enemies from the interpolated snapshot. Returns ids that appeared this frame. */
  syncEnemies(list: EnemySnap[], biome: number): EnemyView[] {
    const seen = new Set<number>();
    const born: EnemyView[] = [];
    for (const s of list) {
      seen.add(s.id);
      let v = this.enemies.get(s.id);
      if (!v) {
        v = this.makeEnemy(s, biome);
        this.enemies.set(s.id, v);
        born.push(v);
      }
      v.last = s;
      v.x = s.x; v.y = s.y; v.z = s.z;
    }
    for (const [id, v] of this.enemies) {
      if (!seen.has(id) && !v.dead) {
        // vanished without a kill event (e.g. room change) — just remove
        this.group.remove(v.group); this.group.remove(v.shadow);
        if (v.laser) this.group.remove(v.laser);
        if (v.boss) this.removeBossExtras(v);
        this.enemies.delete(id);
      }
    }
    return born;
  }

  hitFlash(id: number) {
    const v = this.enemies.get(id);
    if (v) { v.flash = v.boss ? 0.45 : 1; if (v.boss && v.boss.painT <= 0 && Math.random() < 0.3) v.boss.painT = 0.22; }
  }

  private removeBossExtras(v: EnemyView) {
    const b = v.boss!;
    this.group.remove(b.shield, b.beam, b.beamCore, b.feed);
  }

  /** Enemy died: becomes a persistent corpse. */
  kill(id: number, dx: number, dz: number): EnemyView | null {
    const v = this.enemies.get(id);
    if (!v) return null;
    this.enemies.delete(id);
    v.dead = true;
    v.deadT = 0;
    if (v.boss) {
      // multi-stage death: the collapse / blast-apart clip plays, then the wreck stays
      v.boss.deathT = 0;
      v.boss.shield.visible = false; v.boss.beam.visible = false; v.boss.beamCore.visible = false; v.boss.feed.visible = false;
      (v.boss.core.material as THREE.SpriteMaterial).opacity = 1;
      if (v.type === 'echo') { v.boss.deathT = 2.6; }
    } else v.mat.map = tex(v.sprites.dead);
    v.xray.visible = false;
    v.eye.visible = false;
    if (v.laser) { this.group.remove(v.laser); v.laser = null; }
    // knock the corpse along the shot direction a little
    if (!v.boss) { v.group.position.x += dx * 0.4; v.group.position.z += dz * 0.4; }
    v.group.position.y = 0;
    v.mat.opacity = 1;
    this.corpses.push(v);
    if (this.corpses.length > 60) {
      const old = this.corpses.shift()!;
      this.group.remove(old.group); this.group.remove(old.shadow);
    }
    return v;
  }

  update(dt: number, camYaw: number, camPos: THREE.Vector3, markedXray: boolean) {
    this.time += dt;
    const tmp = new THREE.Color();
    for (const v of this.enemies.values()) {
      const s = v.last;
      v.animT += dt;
      v.group.position.set(v.x, v.y, v.z);
      v.shadow.position.set(v.x, 0.02, v.z);
      v.group.rotation.y = camYaw;
      if (v.boss) { this.updateBoss(v, dt, tmp); continue; }
      const sp = v.sprites;
      let frame: HTMLCanvasElement;
      const a = s.anim;
      if (a === 'stagger') frame = sp.stagger[Math.floor(v.animT * 6) % 2];
      else if (a === 'pain') frame = sp.pain;
      else if (a === 'attack') frame = sp.attack[Math.floor(v.animT * 8) % 2];
      else if (a === 'charge') frame = sp.charge[Math.floor(v.animT * 10) % 2];
      else if (a === 'move') frame = sp.move[Math.floor(v.animT * (s.type === 'drone' ? 12 : 7)) % 4];
      else frame = sp.idle[Math.floor(v.animT * 2) % 2];
      const t = tex(frame);
      if (v.mat.map !== t) { v.mat.map = t; (v.xray.material as THREE.MeshBasicMaterial).map = t; }
      // lighting + status tint
      this.lightAt(v.x, v.y + 1, v.z, tmp);
      if (s.frozen) tmp.setRGB(0.5, 0.9, 1.6);
      if (s.burning) tmp.r += 0.6 + Math.sin(this.time * 30) * 0.3;
      if (a === 'stagger') { const p = 0.6 + Math.sin(this.time * 18) * 0.4; tmp.setRGB(1.2 + p, 0.7 + p * 0.5, 0.3); }
      if (s.tell > 0.05 && a !== 'stagger') tmp.r += s.tell * 0.8;
      if (v.flash > 0) { tmp.setRGB(3, 3, 3); v.flash -= dt * 12; }
      if (v.spawnFx > 0) { v.spawnFx -= dt * 2.2; tmp.setRGB(1 + v.spawnFx * 3, 1 + v.spawnFx * 3, 1 + v.spawnFx * 3); v.mesh.scale.set(Math.max(0.05, 1 - v.spawnFx * 0.9), 1 + v.spawnFx * 0.6, 1); } else v.mesh.scale.set(1, 1, 1);
      v.mat.color.copy(tmp);
      v.mat.opacity = 1 - s.cloak * 0.92;
      v.mat.alphaTest = s.cloak > 0.4 ? 0.01 : 0.5;
      v.eye.visible = s.cloak < 0.5;
      (v.eye.material as THREE.SpriteMaterial).opacity = 0.6 + Math.sin(this.time * 8 + v.id) * 0.3;
      v.xray.visible = markedXray && s.marked;
      // stalker / warden laser sight
      if (s.aimX !== undefined) {
        if (!v.laser) {
          const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
          v.laser = new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(5, 0.2, 0.2), transparent: true }));
          this.group.add(v.laser);
        }
        const pos = v.laser.geometry.getAttribute('position') as THREE.BufferAttribute;
        const ey = v.y + ENEMIES[s.type].headY;
        pos.setXYZ(0, v.x, ey, v.z);
        // extend beyond the aim point
        const dx = s.aimX - v.x, dy = (s.aimY ?? 0) - ey, dz = (s.aimZ ?? 0) - v.z;
        pos.setXYZ(1, v.x + dx * 1.6, ey + dy * 1.6, v.z + dz * 1.6);
        pos.needsUpdate = true;
        (v.laser.material as THREE.LineBasicMaterial).opacity = 0.4 + s.tell * 0.6;
      } else if (v.laser) { this.group.remove(v.laser); v.laser = null; }
    }
    for (const c of this.corpses) {
      c.deadT += dt;
      c.group.rotation.y = camYaw;
      if (c.boss) {
        const b = c.boss;
        if (b.deathT >= 0 && b.deathT < 2.6) {
          b.deathT += dt;
          c.mat.map = tex(this.bossPick(c, dt));
          const cm = b.core.material as THREE.SpriteMaterial;
          cm.opacity = Math.max(0, 1 - b.deathT / 2.2) * (0.6 + Math.random() * 0.4);
          const sc = 2 + b.deathT * 3; b.core.scale.set(sc, sc, 1);
        } else if (b.deathT >= 2.6) {
          b.deathT = -2;
          c.mat.map = tex(c.type === 'echo' ? bossDeadFrame(6) : bossDeadFrame(b.v));
          (b.core.material as THREE.SpriteMaterial).opacity = 0;
          if (c.type === 'echo') c.group.visible = false;
        }
      }
      this.lightAt(c.group.position.x, 0.5, c.group.position.z, tmp);
      c.mat.color.copy(tmp).multiplyScalar(0.85);
    }
    // projectiles: extrapolate from last snapshot
    for (const p of this.projectiles.values()) {
      p.t += dt;
      const x = p.snap.x + p.snap.vx * p.t, y = p.snap.y + p.snap.vy * p.t, z = p.snap.z + p.snap.vz * p.t;
      p.sprite.position.set(x, y, z);
      p.glow.position.set(x, y, z);
      // don't let a volley sliding past the lens bloom out the whole screen
      const cd = Math.hypot(x - camPos.x, y - camPos.y, z - camPos.z);
      (p.glow.material as THREE.SpriteMaterial).opacity = cd < 8 ? 0.08 + (cd / 8) * 0.52 : 0.6;
    }
    for (const m of this.mines.values()) {
      (m.glow.material as THREE.SpriteMaterial).opacity = m.armed ? (Math.sin(this.time * 14) > 0 ? 1 : 0.15) : 0.3;
    }
    for (const s of this.shop) {
      const icon = s.group.children[1];
      if (icon) icon.position.y = 1.45 + Math.sin(this.time * 2 + s.slot) * 0.08;
    }
    for (const d of this.drops.values()) {
      d.t += dt;
      d.sprite.position.set(d.x, d.y + 0.25 + Math.sin(d.t * 3) * 0.12, d.z);
    }
    // pedestals
    for (const p of this.pedestals) {
      if (p.rise < 1) p.rise = Math.min(1, p.rise + dt / 1.4);
      const e = 1 - Math.pow(1 - p.rise, 3);
      p.column.position.y = -1.1 + e * 1.1 + 0.55;
      p.icon.position.y = e * 1.1 + 0.85 + Math.sin(this.time * 2.4 + p.slot) * 0.1;
      p.icon.material.rotation = Math.sin(this.time * 1.5 + p.slot) * 0.15;
      (p.beam.material as THREE.MeshBasicMaterial).opacity = (0.12 + Math.sin(this.time * 3 + p.slot) * 0.05) * e;
      p.beam.scale.set(1, e, 1);
      if (p.light) p.light.intensity = 5 * e * (p.ped.offer.rarity === 'legendary' ? 2.5 : 1);
    }
    void camPos;
  }

  syncPlayers(list: PlayerSnap[], selfId: string, interp: Map<string, { x: number; y: number; z: number }>) {
    const seen = new Set<string>();
    for (const p of list) {
      if (p.id === selfId) continue;
      seen.add(p.id);
      let v = this.players.get(p.id);
      if (!v) {
        const sprites = getEnemySprites('replica', 0);
        const worldH = 1.85, worldW = (worldH * sprites.w) / sprites.h;
        const geo = new THREE.PlaneGeometry(worldW, worldH); geo.translate(0, worldH / 2, 0);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex(sprites.idle[0]), transparent: true, alphaTest: 0.5, color: new THREE.Color(p.color).multiplyScalar(1.3) }));
        const lc = textCanvas(p.name, '#' + new THREE.Color(p.color).getHexString(), 20, "'VT323', monospace", '#000');
        const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(lc), transparent: true, depthTest: false }));
        label.scale.set(lc.width * 0.025, lc.height * 0.025, 1);
        label.position.y = 2.25;
        const group = new THREE.Group();
        group.add(mesh, label);
        this.group.add(group);
        v = { group, mesh, label, x: p.x, y: p.y, z: p.z };
        this.players.set(p.id, v);
      }
      const ip = interp.get(p.id);
      v.x = ip ? ip.x : p.x; v.y = ip ? ip.y : p.y; v.z = ip ? ip.z : p.z;
      v.group.position.set(v.x, v.y, v.z);
      v.group.visible = p.alive;
      const sprites = getEnemySprites('replica', 0);
      const moving = true;
      const frame = p.firing ? sprites.attack[Math.floor(this.time * 8) % 2] : moving ? sprites.move[Math.floor(this.time * 7) % 4] : sprites.idle[0];
      (v.mesh.material as THREE.MeshBasicMaterial).map = tex(frame);
      (v.mesh.material as THREE.MeshBasicMaterial).opacity = p.ghost ? 0.3 : 1;
    }
    for (const [id, v] of this.players) if (!seen.has(id)) { this.group.remove(v.group); this.players.delete(id); }
  }

  faceCamera(camYaw: number) {
    for (const v of this.players.values()) v.group.rotation.y = camYaw;
  }

  syncProjectiles(list: ProjectileSnap[]) {
    const seen = new Set<number>();
    for (const s of list) {
      seen.add(s.id);
      let p = this.projectiles.get(s.id);
      if (!p) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(getProjectileSprite(s.kind)), color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, depthWrite: false }));
        const sz = s.kind === 'orb' ? 0.9 : s.kind === 'rocket' ? 0.7 : s.kind === 'plasma' ? 0.6 : 0.45;
        sprite.scale.set(sz, sz, 1);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: projColor(s.kind), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
        glow.scale.set(sz * 2.4, sz * 2.4, 1);
        this.group.add(sprite, glow);
        p = { sprite, glow, snap: s, t: 0 };
        this.projectiles.set(s.id, p);
      }
      p.snap = s; p.t = 0;
    }
    for (const [id, p] of this.projectiles) if (!seen.has(id)) { this.group.remove(p.sprite); this.group.remove(p.glow); this.projectiles.delete(id); }
  }

  syncMines(list: MineSnap[]) {
    const seen = new Set<number>();
    for (const s of list) {
      seen.add(s.id);
      let m = this.mines.get(s.id);
      if (!m) {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshBasicMaterial({ map: tex(getMineSprite(false)), transparent: true, alphaTest: 0.5 }));
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(s.x, 0.04, s.z);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(6, 0.5, 0.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        glow.scale.set(0.6, 0.6, 1);
        glow.position.set(s.x, 0.2, s.z);
        this.group.add(mesh, glow);
        m = { mesh, glow, armed: false };
        this.mines.set(s.id, m);
      }
      if (s.armed !== m.armed) { m.armed = s.armed; (m.mesh.material as THREE.MeshBasicMaterial).map = tex(getMineSprite(s.armed)); }
    }
    for (const [id, m] of this.mines) if (!seen.has(id)) { this.group.remove(m.mesh); this.group.remove(m.glow); this.mines.delete(id); }
  }

  addDrop(id: number, kind: 'hp' | 'armor' | 'ammo' | 'scrap', x: number, y: number, z: number) {
    if (this.drops.has(id)) return;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(kind === 'scrap' ? getScrapSprite() : getPickupSprite(kind)), color: kind === 'scrap' ? new THREE.Color(2.6, 2.6, 2.6) : new THREE.Color(1.6, 1.6, 1.6) }));
    const sz = kind === 'scrap' ? 0.35 : 0.6;
    sprite.scale.set(sz, sz, 1);
    this.group.add(sprite);
    this.drops.set(id, { sprite, x, y, z, t: Math.random() * 6 });
  }

  removeDrop(id: number) {
    const d = this.drops.get(id);
    if (d) { this.group.remove(d.sprite); this.drops.delete(id); }
  }

  showPedestals(list: Pedestal[]) {
    this.clearPedestals();
    for (const ped of list) {
      const def = POWERUP_BY_ID[ped.offer.id];
      const cat = def?.category ?? 'passive';
      const color = new THREE.Color(RARITY_COLOR[ped.offer.rarity]);
      const group = new THREE.Group();
      group.position.set(ped.x, 0, ped.z);
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.1, 8), new THREE.MeshLambertMaterial({ color: 0x3a3836, emissive: color.clone().multiplyScalar(0.15) }));
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(3) }));
      ring.position.y = 0.5;
      column.add(ring);
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(getPedestalIcon(cat, ped.offer.rarity)), color: new THREE.Color(1.8, 1.8, 1.8), transparent: true }));
      icon.scale.set(0.8, 0.8, 1);
      const beamH = ped.offer.rarity === 'legendary' ? 14 : ped.offer.rarity === 'epic' ? 8 : 5;
      const beamGeo = new THREE.CylinderGeometry(0.35, 0.5, beamH, 8, 1, true);
      beamGeo.translate(0, beamH / 2, 0);
      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(2.5), transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      group.add(column, icon, beam);
      this.group.add(group);
      let light: THREE.PointLight | null = null;
      if (this.pedestals.length < 1 || ped.offer.rarity === 'legendary') {
        light = new THREE.PointLight(color, 0, 8, 1.5);
        light.position.set(ped.x, 1.8, ped.z);
        this.group.add(light);
      }
      this.pedestals.push({ slot: ped.slot, group, icon, beam, column, rise: 0, ped, light, shattered: false });
    }
  }

  shop: { slot: number; group: THREE.Group; item: ShopItem }[] = [];

  showShop(items: ShopItem[]) {
    this.clearShop();
    for (const it of items) {
      const group = new THREE.Group();
      group.position.set(it.x, 0, it.z);
      const rarity = it.offer?.rarity ?? 'common';
      const color = new THREE.Color(it.kind === 'powerup' ? RARITY_COLOR[rarity] : it.kind === 'heal' ? '#ff4a4a' : '#5ab8ff');
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x2a2f2e, emissive: color.clone().multiplyScalar(0.12) }));
      column.position.y = 0.5;
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex(it.kind === 'powerup' ? getPedestalIcon(POWERUP_BY_ID[it.offer!.id]?.category ?? 'passive', rarity) : getPickupSprite(it.kind === 'heal' ? 'hp' : 'armor')),
        color: new THREE.Color(1.8, 1.8, 1.8), transparent: true,
      }));
      icon.scale.set(0.7, 0.7, 1); icon.position.y = 1.45;
      const lc = textCanvas(`${it.price} ◆`, '#2affd0', 22, "'VT323', monospace", '#000');
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(lc), transparent: true, depthWrite: false }));
      label.scale.set(lc.width * 0.022, lc.height * 0.022, 1); label.position.y = 2.05;
      group.add(column, icon, label);
      group.visible = !it.sold;
      this.group.add(group);
      this.shop.push({ slot: it.slot, group, item: it });
    }
  }

  markSold(slot: number) {
    const s = this.shop.find((x) => x.slot === slot);
    if (s) { s.group.visible = false; s.item.sold = true; }
  }

  clearShop() {
    for (const s of this.shop) this.group.remove(s.group);
    this.shop = [];
  }

  shatterPedestals(keepSlot: number): { x: number; z: number; color: number }[] {
    const out: { x: number; z: number; color: number }[] = [];
    for (const p of this.pedestals) {
      out.push({ x: p.ped.x, z: p.ped.z, color: new THREE.Color(RARITY_COLOR[p.ped.offer.rarity]).getHex() });
      void keepSlot;
    }
    this.clearPedestals();
    return out;
  }
}

export function projColor(k: ProjectileKind): THREE.Color {
  switch (k) {
    case 'bolt': return new THREE.Color(4, 0.4, 0.3);
    case 'plasma': return new THREE.Color(4, 1.6, 0.3);
    case 'orb': return new THREE.Color(3, 0.4, 3.5);
    case 'rocket': return new THREE.Color(4, 2.4, 0.5);
    case 'spit': return new THREE.Color(1, 4, 0.6);
    case 'replica': return new THREE.Color(0.6, 3, 4);
    case 'shell': return new THREE.Color(4, 1.8, 0.4);
    case 'hex': return new THREE.Color(3, 0.6, 4.5);
    default: return new THREE.Color(3, 3, 3);
  }
}
