// World: seeded run generation, rooms, doors, biomes, colliders, props.
import * as THREE from 'three';
import { RNG } from './rng';
import { ROOMS_PER_BIOME, BIOMES } from './constants';

export interface AABB { min: THREE.Vector3; max: THREE.Vector3; }

export type RoomType = 'hub' | 'combat' | 'arena' | 'gauntlet' | 'anomaly' | 'boss';
export type DoorColor = 'blue' | 'red' | 'gold' | 'green';

export interface EnemySpawn { type: string; x: number; z: number; elite: boolean; }

export interface Room {
  index: number;
  type: RoomType;
  biome: number;
  doorColor: DoorColor; // color of the door LEADING INTO this room
  center: THREE.Vector3;
  w: number; d: number;
  colliders: AABB[];
  group: THREE.Group;
  spawns: EnemySpawn[];
  playerSpawn: THREE.Vector3;
  exitDoor?: { panel: THREE.Mesh; frameMat: THREE.MeshStandardMaterial; color: DoorColor; x: number; z: number; open: boolean; nextType: RoomType; };
  entryX: number;
  terminal?: { pos: THREE.Vector3; read: boolean; fragIdx: number };
  pedestalSpots: THREE.Vector3[];
  lights: THREE.PointLight[];
  cleared: boolean;
  requiresClear: boolean;
  waves: number; // arena
  wave: number;
  gauntletTimer: number; // gauntlet
}

export interface BiomeTheme {
  name: string;
  fog: number;
  fogDensity: number;
  floor: string;
  wall: string;
  accent: number;
  ambient: number;
  ambientIntensity: number;
}

export const BIOME_THEMES: BiomeTheme[] = [
  { name: 'FOUNDRY', fog: 0x140b06, fogDensity: 0.045, floor: '#3a2a1a', wall: '#4a3520', accent: 0xff8020, ambient: 0xff9040, ambientIntensity: 0.35 },
  { name: 'ARCHIVE', fog: 0x060a12, fogDensity: 0.05, floor: '#1a2430', wall: '#22303f', accent: 0x3a9adf, ambient: 0x4080c0, ambientIntensity: 0.3 },
  { name: 'THE CORE', fog: 0x120505, fogDensity: 0.055, floor: '#2a1212', wall: '#381818', accent: 0xff2050, ambient: 0xc03040, ambientIntensity: 0.32 },
];
export const HUB_THEME: BiomeTheme = { name: 'THE HUB', fog: 0x0a0a0c, fogDensity: 0.03, floor: '#242428', wall: '#2e2e34', accent: 0x4dff6a, ambient: 0x8090a0, ambientIntensity: 0.4 };

const DOOR_COLORS: Record<DoorColor, number> = { blue: 0x3a6adf, red: 0xc01818, gold: 0xffb400, green: 0x3adf6a };

// ── pixel grime texture ──
function grimeTexture(base: string, rng: RNG): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 32, 32);
  const b = new THREE.Color(base);
  for (let i = 0; i < 90; i++) {
    const v = (rng.next() - 0.5) * 0.35;
    const col = b.clone();
    col.offsetHSL(0, 0, v * 0.12);
    g.fillStyle = '#' + col.getHexString();
    g.fillRect(rng.int(0, 31), rng.int(0, 31), rng.int(1, 3), rng.int(1, 2));
  }
  // panel lines
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.fillRect(0, 0, 32, 1); g.fillRect(0, 16, 32, 1); g.fillRect(0, 0, 1, 32); g.fillRect(16, 0, 1, 32);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}
function aabbAt(x: number, y: number, z: number, w: number, h: number, d: number): AABB {
  return { min: new THREE.Vector3(x - w / 2, y, z - d / 2), max: new THREE.Vector3(x + w / 2, y + h, z + d / 2) };
}

// ── run graph ──
export function planRun(seedNum: number): { type: RoomType; door: DoorColor }[] {
  const rng = new RNG(seedNum);
  const plan: { type: RoomType; door: DoorColor }[] = [];
  plan.push({ type: 'hub', door: 'blue' });
  for (let b = 0; b < BIOMES; b++) {
    for (let i = 0; i < ROOMS_PER_BIOME; i++) {
      const isBoss = i === ROOMS_PER_BIOME - 1;
      let type: RoomType;
      if (isBoss) type = 'boss';
      else {
        const r = rng.next();
        if (r < 0.14 && plan.length > 3) type = 'anomaly';
        else if (r < 0.45) type = 'combat';
        else if (r < 0.75) type = 'arena';
        else type = 'gauntlet';
      }
      // door color for the door leading INTO this room
      let door: DoorColor = 'blue';
      {
        const dr = rng.next();
        if (type === 'boss') door = 'red';
        else if (dr < 0.6) door = 'blue';
        else if (dr < 0.8) door = 'red';
        else if (dr < 0.92) door = 'gold';
        else { door = 'green'; type = 'anomaly'; }
      }
      plan.push({ type, door });
    }
  }
  return plan;
}

export interface BuiltWorld {
  rooms: Room[];
  group: THREE.Group;
  allColliders: AABB[];
}

export function buildWorld(seedNum: number, scene: THREE.Scene, metaDeaths: number, metaRuns: number): BuiltWorld {
  const rng = new RNG(seedNum ^ 0x9e3779b9);
  const plan = planRun(seedNum);
  const group = new THREE.Group();
  const rooms: Room[] = [];
  const allColliders: AABB[] = [];
  let cursorX = 0;

  for (let idx = 0; idx < plan.length; idx++) {
    const p = plan[idx];
    const biome = Math.min(BIOMES - 1, Math.floor(Math.max(0, idx - 1) / ROOMS_PER_BIOME));
    const theme = p.type === 'hub' ? HUB_THEME : BIOME_THEMES[biome];
    let w = 22, d = 22;
    if (p.type === 'hub') { w = 16; d = 14; }
    else if (p.type === 'arena') { w = 30; d = 30; }
    else if (p.type === 'gauntlet') { w = 34; d = 12; }
    else if (p.type === 'anomaly') { w = 18; d = 18; }
    else if (p.type === 'boss') { w = 34; d = 34; }

    // connector corridor from previous room
    if (idx > 0) {
      const corrLen = 8;
      const cx = cursorX + corrLen / 2;
      const cGroup = new THREE.Group();
      const fmat = new THREE.MeshLambertMaterial({ map: grimeTexture(theme.floor, rng) });
      fmat.map!.repeat.set(corrLen / 4, 1);
      const floor = box(corrLen, 0.2, 4, fmat, cx, -0.1, 0);
      cGroup.add(floor);
      const wmat = new THREE.MeshLambertMaterial({ map: grimeTexture(theme.wall, rng) });
      for (const sz of [-1, 1]) {
        const wall = box(corrLen, 4, 0.5, wmat, cx, 2, sz * 2.25);
        cGroup.add(wall);
        allColliders.push(aabbAt(cx, 0, sz * 2.25, corrLen, 4, 0.5));
      }
      group.add(cGroup);
      cursorX += corrLen;
    }

    const center = new THREE.Vector3(cursorX + w / 2, 0, 0);
    cursorX += w;

    const room: Room = {
      index: idx, type: p.type, biome, doorColor: p.door,
      center, w, d, colliders: [], group: new THREE.Group(), spawns: [],
      playerSpawn: new THREE.Vector3(center.x - w / 2 + 2, 0, 0),
      entryX: center.x - w / 2,
      pedestalSpots: [],
      lights: [],
      cleared: false,
      requiresClear: p.type === 'combat' || p.type === 'arena' || p.type === 'gauntlet' || p.type === 'boss',
      waves: p.type === 'arena' ? 3 : 1,
      wave: 0,
      gauntletTimer: p.type === 'gauntlet' ? 45 : 0,
    };

    buildRoomShell(room, theme, rng, allColliders, idx === plan.length - 1);
    decorateRoom(room, theme, rng, metaDeaths, metaRuns);
    if (room.requiresClear) placeSpawns(room, rng, p.door);

    // exit door (except final boss room)
    if (idx < plan.length - 1) {
      const next = plan[idx + 1];
      addExitDoor(room, next.door, next.type, rng);
    }

    group.add(room.group);
    rooms.push(room);
  }

  scene.add(group);
  return { rooms, group, allColliders };
}

function buildRoomShell(room: Room, theme: BiomeTheme, rng: RNG, allColliders: AABB[], isLast: boolean) {
  const { center, w, d } = room;
  const g = room.group;
  const H = 5;

  const fmat = new THREE.MeshLambertMaterial({ map: grimeTexture(theme.floor, rng) });
  fmat.map!.repeat.set(w / 4, d / 4);
  const floor = box(w, 0.2, d, fmat, center.x, -0.1, center.z);
  g.add(floor);

  const cmat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  const ceil = box(w, 0.2, d, cmat, center.x, H + 0.1, center.z);
  g.add(ceil);

  const wmat = new THREE.MeshLambertMaterial({ map: grimeTexture(theme.wall, rng) });
  wmat.map!.repeat.set(w / 4, 1.2);
  const wallT = 0.6;
  const doorW = 4, doorH = 3.2;

  // north/south walls (along X) — solid
  for (const sz of [-1, 1]) {
    const wall = box(w, H, wallT, wmat, center.x, H / 2, center.z + sz * (d / 2));
    g.add(wall);
    const col = aabbAt(center.x, 0, center.z + sz * (d / 2), w, H, wallT);
    room.colliders.push(col); allColliders.push(col);
  }
  // west wall (entry) — gap for doorway if not first
  const wx = center.x - w / 2;
  {
    const sideW = (w * 0 + d - doorW) / 2; // along Z
    for (const sz of [-1, 1]) {
      const seg = box(wallT, H, sideW, wmat, wx, H / 2, center.z + sz * (doorW / 2 + sideW / 2));
      g.add(seg);
      const col = aabbAt(wx, 0, center.z + sz * (doorW / 2 + sideW / 2), wallT, H, sideW);
      room.colliders.push(col); allColliders.push(col);
    }
    // lintel above door
    const lintel = box(wallT, H - doorH, doorW, wmat, wx, doorH + (H - doorH) / 2, center.z);
    g.add(lintel);
  }
  // east wall (exit)
  const ex = center.x + w / 2;
  {
    const sideW = (d - doorW) / 2;
    for (const sz of [-1, 1]) {
      const seg = box(wallT, H, sideW, wmat, ex, H / 2, center.z + sz * (doorW / 2 + sideW / 2));
      g.add(seg);
      const col = aabbAt(ex, 0, center.z + sz * (doorW / 2 + sideW / 2), wallT, H, sideW);
      room.colliders.push(col); allColliders.push(col);
    }
    const lintel = box(wallT, H - doorH, doorW, wmat, ex, doorH + (H - doorH) / 2, center.z);
    g.add(lintel);
  }

  // ceiling light strips
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(theme.accent), emissiveIntensity: 1.6 });
  const nLights = Math.max(2, Math.floor(w / 8));
  for (let i = 0; i < nLights; i++) {
    const lx = center.x - w / 2 + (i + 0.5) * (w / nLights);
    const strip = box(3, 0.1, 0.6, lightMat, lx, H - 0.05, center.z + (i % 2 === 0 ? -d / 4 : d / 4));
    g.add(strip);
    if (i % 2 === 0) {
      const pl = new THREE.PointLight(theme.accent, 12, 18, 1.8);
      pl.position.set(lx, H - 0.8, center.z);
      g.add(pl);
      room.lights.push(pl);
    }
  }
  // biome point light center
  const cl = new THREE.PointLight(theme.ambient, 20, Math.max(w, d) * 1.4, 1.6);
  cl.position.set(center.x, H - 1, center.z);
  g.add(cl);
  room.lights.push(cl);
}

function decorateRoom(room: Room, theme: BiomeTheme, rng: RNG, metaDeaths: number, metaRuns: number) {
  const { center, w, d } = room;
  const g = room.group;
  const propMat = new THREE.MeshLambertMaterial({ map: grimeTexture(theme.wall, rng) });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(theme.accent), emissiveIntensity: 2.0 });

  if (room.type === 'hub') {
    // terminal
    const term = box(1.2, 1.6, 0.4, propMat, center.x + 3, 0.8, center.z - d / 2 + 1.2);
    g.add(term);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x001100, emissive: new THREE.Color(0x4dff6a), emissiveIntensity: 1.8 }));
    screen.position.set(center.x + 3, 1.0, center.z - d / 2 + 1.45);
    g.add(screen);
    room.terminal = { pos: new THREE.Vector3(center.x + 3, 0, center.z - d / 2 + 2), read: false, fragIdx: -1 };
    // the tally — one scratch per death (cap 60)
    const tallyMat = new THREE.MeshBasicMaterial({ color: 0x8a8070 });
    const tally = Math.min(60, metaDeaths);
    for (let i = 0; i < tally; i++) {
      const s = box(0.04, 0.35, 0.02, tallyMat, center.x - w / 2 + 0.4 + (i % 20) * 0.16, 1.6 + Math.floor(i / 20) * 0.5, center.z - d / 2 + 0.35);
      s.rotation.z = (rng.next() - 0.5) * 0.3;
      g.add(s);
    }
    // the body — appears after run 3
    if (metaRuns >= 3) {
      const body = box(1.8, 0.35, 0.7, new THREE.MeshLambertMaterial({ color: 0x4a443c }), center.x - 3, 0.18, center.z + 2.5);
      body.rotation.y = rng.next() * 0.8;
      g.add(body);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1.1, 12), new THREE.MeshBasicMaterial({ color: 0x4a0808 }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(center.x - 3, 0.011, center.z + 2.5);
      g.add(pool);
    }
    // the mirror — after run 10
    if (metaRuns >= 10) {
      const mir = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x8a9aaa, metalness: 0.9, roughness: 0.1 }));
      mir.position.set(center.x - w / 2 + 0.4, 1.4, center.z + 3);
      mir.rotation.y = Math.PI / 2;
      g.add(mir);
    }
    const hl = new THREE.PointLight(0x4dff6a, 8, 10, 1.8);
    hl.position.set(center.x + 3, 2.5, center.z - d / 2 + 2);
    g.add(hl);
    room.lights.push(hl);
    return;
  }

  if (room.type === 'anomaly') {
    // weird tilted geometry, sickly green light
    const weird = new THREE.MeshStandardMaterial({ color: 0x1a2a1a, emissive: new THREE.Color(0x3adf6a), emissiveIntensity: 0.35 });
    for (let i = 0; i < 5; i++) {
      const s = rng.range(1, 3);
      const m = box(s, rng.range(2, 4.5), s, weird,
        center.x + rng.range(-w / 3, w / 3), rng.range(0.5, 2.5), center.z + rng.range(-d / 3, d / 3));
      m.rotation.set(rng.next() * 0.8, rng.next() * 3, rng.next() * 0.8);
      g.add(m);
    }
    const gl = new THREE.PointLight(0x3adf6a, 25, 20, 1.6);
    gl.position.set(center.x, 3.5, center.z);
    g.add(gl);
    room.lights.push(gl);
    // terminal with a fragment
    const term = box(1.2, 1.6, 0.4, propMat, center.x, 0.8, center.z + d / 2 - 1.4);
    g.add(term);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x001100, emissive: new THREE.Color(0x4dff6a), emissiveIntensity: 2.2 }));
    screen.position.set(center.x, 1.0, center.z + d / 2 - 1.65);
    screen.rotation.y = Math.PI;
    g.add(screen);
    room.terminal = { pos: new THREE.Vector3(center.x, 0, center.z + d / 2 - 2.2), read: false, fragIdx: -1 };
    room.requiresClear = false;
    return;
  }

  // combat-ish rooms: crates / pillars for cover
  const coverCount = room.type === 'boss' ? 4 : rng.int(3, 6);
  for (let i = 0; i < coverCount; i++) {
    const cw = rng.range(1.2, 2.6);
    const ch = rng.range(1.0, 2.2);
    const cx = center.x + rng.range(-w / 2 + 4, w / 2 - 4);
    const cz = center.z + rng.range(-d / 2 + 4, d / 2 - 4);
    const m = box(cw, ch, cw, propMat, cx, ch / 2, cz);
    g.add(m);
    room.colliders.push(aabbAt(cx, 0, cz, cw, ch, cw));
    // trim glow
    if (rng.chance(0.5)) {
      const trim = box(cw + 0.06, 0.08, cw + 0.06, glowMat, cx, ch + 0.04, cz);
      g.add(trim);
    }
  }

  if (room.type === 'arena') {
    // central raised platform ring
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.4, 0.3, 16), propMat);
    ring.position.set(center.x, 0.15, center.z);
    g.add(ring);
  }
  if (room.type === 'gauntlet') {
    // side alcove glows
    for (let i = 0; i < 4; i++) {
      const gx = center.x - w / 2 + 5 + i * (w - 10) / 3;
      const strip = box(1.6, 0.15, 0.15, glowMat, gx, 0.1, center.z - d / 2 + 0.5);
      g.add(strip);
      const strip2 = strip.clone(); strip2.position.z = center.z + d / 2 - 0.5;
      g.add(strip2);
    }
  }
  if (room.type === 'boss') {
    // dramatic pillars
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const px = center.x + sx * (w / 2 - 4);
      const pz = center.z + sz * (d / 2 - 4);
      const pillar = box(1.6, 5, 1.6, propMat, px, 2.5, pz);
      g.add(pillar);
      room.colliders.push(aabbAt(px, 0, pz, 1.6, 5, 1.6));
      const cap = box(1.8, 0.2, 1.8, glowMat, px, 4.6, pz);
      g.add(cap);
    }
    const bl = new THREE.PointLight(theme.accent, 40, 40, 1.4);
    bl.position.set(center.x, 4.2, center.z);
    g.add(bl);
    room.lights.push(bl);
  }

  // pedestal spots (where reward pedestals rise after clear)
  room.pedestalSpots = [
    new THREE.Vector3(center.x + w / 4, 0, center.z - 2.5),
    new THREE.Vector3(center.x + w / 4, 0, center.z + 2.5),
  ];
}

function addExitDoor(room: Room, color: DoorColor, nextType: RoomType, rng: RNG) {
  const { center, w } = room;
  const ex = center.x + w / 2;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(DOOR_COLORS[color]), emissiveIntensity: 2.5 });
  const g = room.group;
  // frame posts
  const post1 = box(0.3, 3.6, 0.3, frameMat, ex - 0.1, 1.8, center.z - 2.1);
  const post2 = box(0.3, 3.6, 0.3, frameMat, ex - 0.1, 1.8, center.z + 2.1);
  const top = box(0.3, 0.4, 4.5, frameMat, ex - 0.1, 3.4, center.z);
  g.add(post1, post2, top);
  // blocking panel (slides up when open)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, emissive: new THREE.Color(DOOR_COLORS[color]), emissiveIntensity: 0.35, transparent: true, opacity: 0.92 });
  const panel = box(0.35, 3.2, 4.0, panelMat, ex, 1.6, center.z);
  g.add(panel);
  const col = aabbAt(ex, 0, center.z, 0.5, 3.2, 4.2);
  room.colliders.push(col);
  room.exitDoor = { panel, frameMat, color, x: ex, z: center.z, open: false, nextType };
  // store the collider reference for removal
  (room.exitDoor as any).collider = col;
  const dl = new THREE.PointLight(DOOR_COLORS[color], 10, 9, 1.8);
  dl.position.set(ex - 1.5, 2.5, center.z);
  g.add(dl);
  room.lights.push(dl);
}

export function openDoor(world: BuiltWorld, room: Room) {
  if (!room.exitDoor || room.exitDoor.open) return;
  room.exitDoor.open = true;
  room.exitDoor.panel.visible = false;
  const col = (room.exitDoor as any).collider as AABB;
  const i1 = room.colliders.indexOf(col); if (i1 >= 0) room.colliders.splice(i1, 1);
  const i2 = world.allColliders.indexOf(col); if (i2 >= 0) world.allColliders.splice(i2, 1);
}

function placeSpawns(room: Room, rng: RNG, door: DoorColor) {
  const { center, w, d, biome, type } = room;
  const elite = door === 'red';
  const goldRoom = door === 'gold';
  let count = type === 'boss' ? 0 : rng.int(3, 5) + biome * 2;
  if (elite) count = Math.floor(count * 1.5);
  if (goldRoom) count += rng.int(1, 3);
  if (type === 'gauntlet') count += 3;

  const pools: string[][] = [
    ['drone', 'grunt', 'grunt', 'drone'],
    ['grunt', 'stalker', 'spider', 'drone', 'grunt'],
    ['brute', 'grunt', 'replica', 'stalker', 'brute', 'spider'],
  ];
  const pool = pools[biome];
  for (let i = 0; i < count; i++) {
    let etype = rng.pick(pool);
    if (etype === 'replica' && room.index < 12 && rng.chance(0.7)) etype = 'grunt';
    const x = center.x + rng.range(-w / 2 + 3, w / 2 - 3);
    const z = center.z + rng.range(-d / 2 + 3, d / 2 - 3);
    room.spawns.push({ type: etype, x, z, elite });
  }
  if (type === 'boss') {
    room.spawns.push({ type: 'warden', x: center.x + w / 4, z: center.z, elite: false });
  }
}

// simple collision helpers (XZ AABB vs circle)
export function collideCircle(colliders: AABB[], x: number, z: number, r: number): { x: number; z: number } {
  for (let iter = 0; iter < 3; iter++) {
    for (const c of colliders) {
      if (c.min.y > 1.4) continue; // overhead geometry doesn't block
      const nx = Math.max(c.min.x, Math.min(x, c.max.x));
      const nz = Math.max(c.min.z, Math.min(z, c.max.z));
      const dx = x - nx, dz = z - nz;
      const dist2 = dx * dx + dz * dz;
      if (dist2 < r * r && dist2 > 0.0001) {
        const dist = Math.sqrt(dist2);
        const push = (r - dist) / dist;
        x += dx * push; z += dz * push;
      } else if (dist2 <= 0.0001) {
        x += r; // degenerate: push out along X
      }
    }
  }
  return { x, z };
}

export function raycastWalls(colliders: AABB[], origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): number {
  // returns distance to nearest wall hit or maxDist (2.5D: check XZ + simple Y)
  let best = maxDist;
  const inv = new THREE.Vector3(1 / (dir.x || 1e-9), 1 / (dir.y || 1e-9), 1 / (dir.z || 1e-9));
  for (const c of colliders) {
    let t1 = (c.min.x - origin.x) * inv.x, t2 = (c.max.x - origin.x) * inv.x;
    let tmin = Math.min(t1, t2), tmax = Math.max(t1, t2);
    t1 = (c.min.y - origin.y) * inv.y; t2 = (c.max.y - origin.y) * inv.y;
    tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    t1 = (c.min.z - origin.z) * inv.z; t2 = (c.max.z - origin.z) * inv.z;
    tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    if (tmax >= Math.max(tmin, 0) && tmin < best && tmin > 0) best = tmin;
  }
  return best;
}

// only lights near the current room are active — forward renderer perf
export function setActiveLights(world: BuiltWorld, currentIdx: number) {
  for (const room of world.rooms) {
    const on = Math.abs(room.index - currentIdx) <= 1;
    for (const l of room.lights) l.visible = on;
  }
}
