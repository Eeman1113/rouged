// Room generation from authored chunk templates + a seed. Deterministic: same RoomDesc → same geometry,
// on the client (rendering, physics) and server (AI, validation).

import type { BiomeId, DoorKind, Mutator, RoomDesc, RoomKind, Vec3 } from './protocol';
import * as C from './constants';
import { Rng, mixSeed } from './rng';

export type BoxMat = 'wall' | 'pillar' | 'crate' | 'platform' | 'trim' | 'anomaly' | 'door' | 'alcove';

export interface Box {
  x0: number; y0: number; z0: number;
  x1: number; y1: number; z1: number;
  mat: BoxMat;
  tex?: number; // texture variant
}

export interface DoorSlot {
  slot: number;
  side: 'n' | 'e' | 'w' | 's';
  x: number; z: number; // center of the opening, on the wall plane
  nx: number; nz: number; // inward normal
  kind: DoorKind;
  nextKind: RoomKind;
  mutator?: Mutator;
  panel: Box; // blocking panel while closed
  entry: boolean; // the door you came in through (always sealed)
}

export interface Light { x: number; y: number; z: number; color: number; intensity: number; range: number }

export interface Decor {
  kind: 'terminal' | 'corpse' | 'body' | 'mirror' | 'tally' | 'text' | 'cable' | 'server' | 'vat' | 'pipe' | 'chair' | 'foliage' | 'vendor' | 'shrine' | 'wreck';
  x: number; y: number; z: number;
  nx: number; nz: number; // facing normal for wall-mounted decor
  v?: number;
}

export interface NavGrid {
  ox: number; oz: number; // world position of cell (0,0) min corner
  cell: number;
  cols: number; rows: number;
  blocked: Uint8Array; // 1 = blocked
}

export interface RoomGeo {
  desc: RoomDesc;
  w: number; d: number; h: number;
  boxes: Box[];
  doors: DoorSlot[];
  playerSpawns: Vec3[];
  enemySpawns: Vec3[];
  pedestals: { x: number; z: number }[];
  lights: Light[];
  decor: Decor[];
  nav: NavGrid;
  ambient: number;
  fog: number;
  bounds: { x0: number; z0: number; x1: number; z1: number };
  /** THE HAPPY PLACE only: the render-side layout of the street (collision lives in `boxes`). */
  happy?: HappyLayout;
}

// ───────────────────────────── THE HAPPY PLACE ─────────────────────────────

export interface HappyHouse {
  x0: number; z0: number; x1: number; z1: number;
  /** side the front door faces */
  face: 'n' | 'e' | 'w' | 's';
  /** wall height (eaves) and ridge height above the eaves */
  body: number; roof: number;
  color: number; roofColor: number; trim: number; doorColor: number;
  wren: boolean;
  /** a film-set flat: the back was never rendered */
  noBack: boolean;
  chimney: boolean;
  porch: boolean;
  /** render-only (the street beyond the hedges) */
  backdrop: boolean;
}

export interface HappyLayout {
  houses: HappyHouse[];
  trees: { x: number; z: number; r: number; h: number; v: number }[];
  /** picket fence runs (axis-aligned, along x or z) */
  fences: { x0: number; z0: number; x1: number; z1: number }[];
  lamps: { x: number; z: number }[];
  mailbox: { x: number; z: number };
  swing: { x: number; z: number };
  bike: { x: number; z: number; rot: number };
  /** road strips: north-south x range, east-west z range */
  roadNS: [number, number];
  roadEW: [number, number];
  walk: number; // sidewalk width
  /** where the memory tears open when it corrupts */
  ambush: Vec3[];
  /** Wren's front door (the heal) */
  wrenDoor: { x: number; z: number };
}

export const HAPPY_SIZE = 46;

/** Pastel siding, the colors a child would pick. */
const HOUSE_COLORS = [0xf2efe6, 0xbfe0f0, 0xf6d9a8, 0xcfe8c4, 0xf4c8c4, 0xe4d8f0];
const ROOF_COLORS = [0x8a4a3a, 0x4a5a72, 0x6a5a4a, 0x7a3a3a, 0x3e5a4a];

function happyStreet(b: Builder, rng: Rng, hw: number, hd: number, decor: Decor[]): HappyLayout {
  const houses: HappyHouse[] = [];
  const pick = <T>(a: T[]) => a[rng.int(0, a.length - 1)];
  const house = (x0: number, z0: number, x1: number, z1: number, face: HappyHouse['face'], o: Partial<HappyHouse> = {}) => {
    const h: HappyHouse = {
      x0, z0, x1, z1, face, body: 4.4, roof: 2.8, color: pick(HOUSE_COLORS), roofColor: pick(ROOF_COLORS), trim: 0xffffff,
      doorColor: pick([0xb8322a, 0x2a5a8a, 0x2f6a3a, 0xe8c040, 0x5a3a2a]), wren: false, noBack: false, chimney: rng.chance(0.6), porch: true, backdrop: false, ...o,
    };
    houses.push(h);
    if (!h.backdrop) {
      // the body is solid all the way to the ridge: nobody stands on these roofs
      b.add(x0, 0, z0, x1, h.body + h.roof, z1, 'wall', 3);
      if (h.porch) {
        const cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
        if (face === 'e') b.add(x1, 0, cz - 1.6, x1 + 1.6, 0.28, cz + 1.6, 'platform', 0);
        else if (face === 'w') b.add(x0 - 1.6, 0, cz - 1.6, x0, 0.28, cz + 1.6, 'platform', 0);
        else if (face === 's') b.add(cx - 1.6, 0, z1, cx + 1.6, 0.28, z1 + 1.6, 'platform', 0);
        else b.add(cx - 1.6, 0, z0 - 1.6, cx + 1.6, 0.28, z0, 'platform', 0);
      }
    }
    return h;
  };
  // the four houses on the street
  house(-19, 5, -11, 13, 'e');
  const wren = house(11, 5, 19, 13, 'w', { wren: true, body: 6.2, roof: 3, color: 0xf8f0dc, roofColor: 0x7a3a32, doorColor: 0xe8c040, chimney: true });
  house(-18, -19.5, -11, -12.5, 'e', { noBack: true, color: 0xbfe0f0 });
  house(11, -20, 19, -12.5, 'w', { body: 5.2 });
  // beyond the hedges: the rest of the street, render-only (and suspiciously identical)
  const bc = pick(HOUSE_COLORS), br = pick(ROOF_COLORS);
  for (const z of [-15, 0, 15]) {
    house(-hw - 16, z - 4, -hw - 8, z + 4, 'e', { backdrop: true, color: bc, roofColor: br, chimney: true });
    house(hw + 8, z - 4, hw + 16, z + 4, 'w', { backdrop: true, color: bc, roofColor: br, chimney: true });
  }
  for (const x of [-17, -4, 9]) house(x - 4, -hd - 16, x + 4, -hd - 8, 's', { backdrop: true, color: bc, roofColor: br, chimney: true });
  for (const x of [-12, 12]) house(x - 4, hd + 8, x + 4, hd + 16, 'n', { backdrop: true, color: bc, roofColor: br, chimney: true });

  // trees: trunk is solid, the canopy is just light
  const trees: HappyLayout['trees'] = [];
  const tree = (x: number, z: number, r = rng.range(2.2, 3.1), h = rng.range(4.6, 6.2)) => {
    trees.push({ x, z, r, h, v: rng.int(0, 2) });
    if (Math.abs(x) < hw && Math.abs(z) < hd) b.add(x - 0.32, 0, z - 0.32, x + 0.32, h * 0.62, z + 0.32, 'pillar', 1);
  };
  tree(-8.3, 19); tree(8.4, 19.6); tree(-8.3, 2.9); tree(8.3, 2.7);
  tree(-15.5, 19.2); tree(-20.6, 1.9); tree(-8.3, -13.2); tree(8.4, -18.6); tree(-20.6, -21);
  // the street beyond: trees between the backdrop houses, then a far skyline of tall ones
  for (const sx of [-1, 1]) {
    for (const z of [-22.5, -7.5, 7.5, 22.5]) tree(sx * (hw + 12), z + rng.range(-0.6, 0.6), rng.range(2.6, 3.4), rng.range(5.5, 7));
    for (const z of [-10, 8, 20]) tree(sx * (hw + 5), z, rng.range(2.2, 2.8), rng.range(4.5, 5.8));
  }
  for (const x of [-10.5, 2.5, 15.5]) tree(x, -hd - 12 + rng.range(-1, 1), rng.range(2.6, 3.4), rng.range(5.5, 7));
  for (const x of [-12, 6]) tree(x, -hd - 5, rng.range(2.2, 2.8), rng.range(4.5, 5.8));
  for (const x of [0, -22, 22]) tree(x, hd + 12 + rng.range(-1, 1), rng.range(2.6, 3.4), rng.range(5.5, 7));
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rng.range(-0.08, 0.08), R = rng.range(56, 72);
    tree(Math.cos(a) * R, Math.sin(a) * R, rng.range(4, 6), rng.range(8, 12));
  }

  // picket fences along the front yards (gaps for the walkways)
  const fences: HappyLayout['fences'] = [];
  const F = 0.95;
  const fence = (x0: number, z0: number, x1: number, z1: number) => {
    fences.push({ x0, z0, x1, z1 });
    const t = 0.09;
    if (x0 === x1) b.add(x0 - t, 0, Math.min(z0, z1), x0 + t, F, Math.max(z0, z1), 'crate', 0);
    else b.add(Math.min(x0, x1), 0, z0 - t, Math.max(x0, x1), F, z0 + t, 'crate', 0);
  };
  for (const sx of [-1, 1]) {
    const x = sx * 5.95;
    fence(x, 1.0, x, 7.4); fence(x, 10.6, x, 21.2);
    fence(x, -21.4, x, -17.6); fence(x, -14.4, x, -11);
  }

  // street furniture (posts are solid, the rest is scenery)
  const lamps = [{ x: -4.9, z: 13.5 }, { x: 4.9, z: 13.5 }, { x: -4.9, z: -15.5 }, { x: 4.9, z: -15.5 }];
  for (const l of lamps) b.add(l.x - 0.12, 0, l.z - 0.12, l.x + 0.12, 4.4, l.z + 0.12, 'pillar', 2);
  const mailbox = { x: 6.6, z: 7.0 };
  b.add(mailbox.x - 0.1, 0, mailbox.z - 0.1, mailbox.x + 0.1, 1.15, mailbox.z + 0.1, 'crate', 0);
  const swing = { x: 16, z: 18.2 };
  for (const sx of [-1.7, 1.7]) b.add(swing.x + sx - 0.12, 0, swing.z - 0.9, swing.x + sx + 0.12, 2.5, swing.z + 0.9, 'pillar', 2);
  const bike = { x: -5.25, z: 13.4, rot: 0.12 };

  // Wren's porch: her door is the heal
  const wrenDoor = { x: wren.x0 - 0.7, z: (wren.z0 + wren.z1) / 2 };
  decor.push({ kind: 'shrine', x: wrenDoor.x, y: 0.28, z: wrenDoor.z, nx: -1, nz: 0, v: 1 });
  // a voice in the yard, by the swing
  decor.push({ kind: 'text', x: swing.x, y: 2.3, z: swing.z - 1.4, nx: 0, nz: 1, v: 2 });

  const ambush: Vec3[] = [
    { x: -8.6, y: 0, z: 9 }, { x: 8.6, y: 0, z: 9 }, { x: -8.6, y: 0, z: -16 }, { x: 8.6, y: 0, z: -16 },
    { x: 0, y: 0, z: -19.5 }, { x: -19.5, y: 0, z: -5 }, { x: 19.5, y: 0, z: -5 }, { x: -20.5, y: 0, z: -15.5 },
    { x: -2.5, y: 0, z: -10 }, { x: 2.5, y: 0, z: -12 },
  ];
  return {
    houses, trees, fences, lamps, mailbox, swing, bike, roadNS: [-3.5, 3.5], roadEW: [-8.5, -1.5], walk: 2,
    ambush, wrenDoor,
  };
}

const WALL_T = 1; // wall thickness
const DOOR_W = 3.2;
const DOOR_H = 4.2;
const ALCOVE = 2.6;

export const BIOME_NAMES = ['FOUNDRY', 'ARCHIVE', 'THE CORE', 'THE NURSERY', 'THE CANOPY', 'THE FRONT', 'THE MIRROR'];
export type BiomeLight = { key: number; fill: number; fog: number; ambient: number; emissive: number };
export const BIOME_LIGHT: Record<number, BiomeLight> = {
  0: { key: 0xff8a3a, fill: 0xffb070, fog: 0x1a0d07, ambient: 0x5a3a2a, emissive: 0xff6a1a },
  1: { key: 0x5aa8ff, fill: 0x9fd0ff, fog: 0x060c16, ambient: 0x2a3a5a, emissive: 0x3aa0ff },
  2: { key: 0xff2a3a, fill: 0xff7070, fog: 0x160406, ambient: 0x5a2228, emissive: 0xff1a3a },
  3: { key: 0xb8ffd0, fill: 0xe8fff0, fog: 0x0a1510, ambient: 0x4a6a58, emissive: 0x6dff9a },
  4: { key: 0x9aff6a, fill: 0xffe9a0, fog: 0x0a1a0a, ambient: 0x3a5a2a, emissive: 0x3affc8 },
  5: { key: 0xff9a40, fill: 0xbfb0a0, fog: 0x1a1612, ambient: 0x5a5048, emissive: 0xff7a20 },
  6: { key: 0xe8ffff, fill: 0x80ffff, fog: 0x050808, ambient: 0x6a7a7a, emissive: 0x6affff },
};
export const HUB_LIGHT: BiomeLight = { key: 0xfff1d6, fill: 0xd8e4ff, fog: 0x0b0b0c, ambient: 0x606060, emissive: 0xfff0d0 };
export function lightFor(kind: RoomKind, biome: number): BiomeLight { return kind === 'hub' ? HUB_LIGHT : BIOME_LIGHT[biome] ?? BIOME_LIGHT[0]; }

/** Biomes run 0..6 once, then the Endless cycles them again. */
export function biomeOf(index: number): BiomeId {
  const b = Math.floor(index / C.ROOMS_PER_BIOME);
  return (b < C.BIOMES ? b : (b - C.BIOMES) % C.BIOMES) as BiomeId;
}

export function isBossIndex(index: number): boolean {
  return index % 5 === 4;
}

/** 0 inside the main descent; grows by one per full cycle of the Endless. */
export function cycleOf(index: number): number {
  return Math.max(0, Math.floor(index / (C.ROOMS_PER_BIOME * C.BIOMES)));
}

export const MUTATORS: Mutator[] = ['darkness', 'overclock', 'lowgrav', 'bloodmoon', 'silence', 'swarm'];
export const MUTATOR_NAME: Record<Mutator, string> = { darkness: 'LIGHTS OUT', overclock: 'OVERCLOCK', lowgrav: 'LOW GRAVITY', bloodmoon: 'BLOOD MOON', silence: 'SILENCE', swarm: 'SWARM' };

// ───────────────────────────── door planning ─────────────────────────────

export interface DoorPlan { kind: DoorKind; nextKind: RoomKind; mutator?: Mutator }

/** The exits a room offers. Deterministic per (run seed, room desc). */
export function planDoors(desc: RoomDesc, _totalRooms = 0): DoorPlan[] {
  const rng = new Rng(mixSeed(desc.seed, 0xd00d));
  const next = desc.index + 1;
  if (isBossIndex(next)) return [{ kind: 'standard', nextKind: 'boss' }];
  if (desc.kind === 'boss') {
    // past THE CORE every Warden offers the choice: walk out, or go deeper
    if (next >= C.EXTRACT_FROM) return [{ kind: 'extract', nextKind: 'hub' }, { kind: 'elite', nextKind: 'combat', mutator: next > C.FINAL_ROOM && rng.chance(0.5) ? rng.pick(MUTATORS) : undefined }];
    return [{ kind: 'standard', nextKind: 'combat' }];
  }
  const count = desc.kind === 'gauntlet' ? 2 : desc.index === 0 ? 2 : rng.int(2, 3);
  const kinds: DoorKind[] = ['standard', 'elite', 'unknown', 'corrupted', 'shop', 'sanctuary', 'trial', 'memory'];
  const rest = desc.kind === 'shop' || desc.kind === 'sanctuary' || desc.kind === 'happy';
  // THE HAPPY PLACE: rare, from room 3, never twice running, never on the doorstep of a Warden
  const memoryOk = next >= 3 && !rest && !isBossIndex(next + 1);
  const weights = [42, 22, 13, desc.kind === 'anomaly' ? 0 : 12, desc.index >= 2 && !rest ? 10 : 0, desc.index >= 3 && !rest ? 7 : 0, desc.index >= 4 ? 7 : 0, memoryOk ? 6 : 0];
  const plans: DoorPlan[] = [];
  const used = new Set<DoorKind>();
  for (let i = 0; i < count; i++) {
    let k: DoorKind = 'standard';
    for (let tries = 0; tries < 10; tries++) {
      k = rng.weighted(kinds, weights);
      if (!used.has(k)) break;
    }
    if (i === 0 && !used.has('standard') && rng.chance(0.55)) k = 'standard';
    used.add(k);
    let nk: RoomKind;
    if (k === 'standard') nk = rng.weighted<RoomKind>(['combat', 'arena', 'gauntlet'], [60, 20, 20]);
    else if (k === 'elite') nk = rng.weighted<RoomKind>(['combat', 'arena'], [70, 30]);
    else if (k === 'unknown') nk = rng.weighted<RoomKind>(['arena', 'gauntlet', 'combat'], [40, 30, 30]);
    else if (k === 'shop') nk = 'shop';
    else if (k === 'sanctuary') nk = 'sanctuary';
    else if (k === 'trial') nk = 'trial';
    else if (k === 'memory') nk = 'happy';
    else nk = 'anomaly';
    let mutator: Mutator | undefined;
    const combatish = nk === 'combat' || nk === 'arena' || nk === 'gauntlet' || nk === 'trial';
    if (nk === 'trial') mutator = rng.pick<Mutator>(['bloodmoon', 'overclock', 'darkness', 'swarm']);
    else if (combatish && desc.index >= 2 && rng.chance(Math.min(0.5, 0.16 + desc.index * 0.012))) mutator = rng.pick(MUTATORS);
    plans.push({ kind: k, nextKind: nk, mutator });
  }
  return plans;
}

// ───────────────────────────── generation ─────────────────────────────

class Builder {
  boxes: Box[] = [];
  keepClear: { x0: number; z0: number; x1: number; z1: number }[] = [];
  constructor(public rng: Rng) {}
  add(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: BoxMat, tex = 0): Box {
    const b: Box = {
      x0: Math.min(x0, x1), y0: Math.min(y0, y1), z0: Math.min(z0, z1),
      x1: Math.max(x0, x1), y1: Math.max(y0, y1), z1: Math.max(z0, z1), mat, tex,
    };
    this.boxes.push(b);
    return b;
  }
  /** place an obstacle centered at (x,z) with half sizes, rejecting overlaps with keep-clear zones / other obstacles */
  tryPlace(x: number, z: number, hx: number, hz: number, y0: number, y1: number, mat: BoxMat, tex = 0, pad = 0.9): boolean {
    const r = { x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz };
    for (const k of this.keepClear) if (r.x0 < k.x1 && r.x1 > k.x0 && r.z0 < k.z1 && r.z1 > k.z0) return false;
    for (const b of this.boxes) {
      if (b.mat === 'wall' || b.mat === 'trim' || b.mat === 'alcove' || b.mat === 'door') continue;
      if (r.x0 - pad < b.x1 && r.x1 + pad > b.x0 && r.z0 - pad < b.z1 && r.z1 + pad > b.z0) return false;
    }
    this.add(r.x0, y0, r.z0, r.x1, y1, r.z1, mat, tex);
    return true;
  }
  clear(x: number, z: number, hx: number, hz: number) {
    this.keepClear.push({ x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz });
  }
}

interface WallDoor { side: 'n' | 'e' | 'w' | 's'; offset: number; plan: DoorPlan | null; entry: boolean; slot: number }

function buildShell(b: Builder, w: number, d: number, h: number, doors: WallDoor[], doorSlots: DoorSlot[]) {
  const hw = w / 2, hd = d / 2;
  // each side: list of door openings along it
  const sides: ('n' | 'e' | 'w' | 's')[] = ['n', 'e', 'w', 's'];
  for (const side of sides) {
    const ds = doors.filter((dd) => dd.side === side).sort((a, c) => a.offset - c.offset);
    const horizontal = side === 'n' || side === 's';
    const len = horizontal ? w : d;
    const half = len / 2;
    let cursor = -half - WALL_T;
    const segs: [number, number][] = [];
    for (const dd of ds) {
      const a = dd.offset - DOOR_W / 2, c = dd.offset + DOOR_W / 2;
      segs.push([cursor, a]);
      cursor = c;
    }
    segs.push([cursor, half + WALL_T]);
    const fixed = side === 'n' ? -hd - WALL_T : side === 's' ? hd : side === 'w' ? -hw - WALL_T : hw;
    for (const [s0, s1] of segs) {
      if (s1 - s0 < 0.01) continue;
      if (horizontal) b.add(s0, 0, fixed, s1, h, fixed + WALL_T, 'wall', 0);
      else b.add(fixed, 0, s0, fixed + WALL_T, h, s1, 'wall', 0);
    }
    // lintels above doors + alcoves
    for (const dd of ds) {
      const a = dd.offset - DOOR_W / 2, c = dd.offset + DOOR_W / 2;
      if (horizontal) {
        b.add(a, DOOR_H, fixed, c, h, fixed + WALL_T, 'wall', 1);
        const out = side === 'n' ? fixed - ALCOVE : fixed + WALL_T;
        const outEnd = side === 'n' ? fixed : fixed + WALL_T + ALCOVE;
        b.add(a - WALL_T, 0, out, a, DOOR_H + 0.5, outEnd, 'alcove');
        b.add(c, 0, out, c + WALL_T, DOOR_H + 0.5, outEnd, 'alcove');
        const backZ = side === 'n' ? out - WALL_T : outEnd;
        b.add(a - WALL_T, 0, backZ, c + WALL_T, DOOR_H + 0.5, backZ + WALL_T, 'alcove');
        b.add(a - WALL_T, DOOR_H, out, c + WALL_T, DOOR_H + 0.5, outEnd, 'alcove');
      } else {
        b.add(fixed, DOOR_H, a, fixed + WALL_T, h, c, 'wall', 1);
        const out = side === 'w' ? fixed - ALCOVE : fixed + WALL_T;
        const outEnd = side === 'w' ? fixed : fixed + WALL_T + ALCOVE;
        b.add(out, 0, a - WALL_T, outEnd, DOOR_H + 0.5, a, 'alcove');
        b.add(out, 0, c, outEnd, DOOR_H + 0.5, c + WALL_T, 'alcove');
        const backX = side === 'w' ? out - WALL_T : outEnd;
        b.add(backX, 0, a - WALL_T, backX + WALL_T, DOOR_H + 0.5, c + WALL_T, 'alcove');
        b.add(out, DOOR_H, a - WALL_T, outEnd, DOOR_H + 0.5, c + WALL_T, 'alcove');
      }
      // door panel (in the wall plane)
      let panel: Box;
      let x = 0, z = 0, nx = 0, nz = 0;
      if (horizontal) {
        panel = { x0: a, y0: 0, z0: fixed + 0.2, x1: c, y1: DOOR_H, z1: fixed + WALL_T - 0.2, mat: 'door' };
        x = dd.offset; z = side === 'n' ? -hd : hd; nz = side === 'n' ? 1 : -1;
      } else {
        panel = { x0: fixed + 0.2, y0: 0, z0: a, x1: fixed + WALL_T - 0.2, y1: DOOR_H, z1: c, mat: 'door' };
        z = dd.offset; x = side === 'w' ? -hw : hw; nx = side === 'w' ? 1 : -1;
      }
      doorSlots.push({
        slot: dd.slot, side, x, z, nx, nz,
        kind: dd.plan ? dd.plan.kind : 'standard',
        nextKind: dd.plan ? dd.plan.nextKind : 'combat',
        mutator: dd.plan?.mutator,
        panel, entry: dd.entry,
      });
      b.clear(x + nx * 3, z + nz * 3, 2.6, 2.6);
    }
  }
}

function addTrim(b: Builder, w: number, d: number, h: number, y: number) {
  const hw = w / 2, hd = d / 2, t = 0.12;
  b.add(-hw, y, -hd, hw, y + 0.18, -hd + t, 'trim');
  b.add(-hw, y, hd - t, hw, y + 0.18, hd, 'trim');
  b.add(-hw, y, -hd, -hw + t, y + 0.18, hd, 'trim');
  b.add(hw - t, y, -hd, hw, y + 0.18, hd, 'trim');
  void h;
}

function placeDoorsOnWalls(rng: Rng, plans: DoorPlan[], w: number, d: number, kind: RoomKind): WallDoor[] {
  const doors: WallDoor[] = [{ side: 's', offset: 0, plan: null, entry: true, slot: -1 }];
  if (kind === 'hub') return [{ side: 'n', offset: 0, plan: plans[0] ?? { kind: 'standard', nextKind: 'combat' }, entry: false, slot: 0 }];
  const n = plans.length;
  const options: WallDoor['side'][] = n === 1 ? ['n'] : n === 2 ? (kind === 'gauntlet' ? ['n', 'n'] : rng.chance(0.5) ? ['n', 'e'] : ['w', 'n']) : ['w', 'n', 'e'];
  for (let i = 0; i < n; i++) {
    const side = options[i];
    let offset = 0;
    if (kind === 'gauntlet' && n === 2) offset = i === 0 ? -w / 4 + 0.5 : w / 4 - 0.5;
    else if (side === 'n') offset = n === 1 ? 0 : kind === 'happy' ? rng.range(-2.4, 2.4) : rng.range(-w / 6, w / 6); // the happy street's road runs out at the north gate
    else offset = rng.range(-d / 6, -d / 12); // side doors toward the far half
    doors.push({ side, offset, plan: plans[i], entry: false, slot: i });
  }
  return doors;
}

function buildNav(boxes: Box[], bounds: RoomGeo['bounds']): NavGrid {
  const cell = 1;
  const ox = Math.floor(bounds.x0) - 1, oz = Math.floor(bounds.z0) - 1;
  const cols = Math.ceil(bounds.x1 - ox) + 2, rows = Math.ceil(bounds.z1 - oz) + 2;
  const blocked = new Uint8Array(cols * rows);
  for (const bx of boxes) {
    if (bx.y0 > 1.6 || bx.y1 < 0.3) continue;
    const pad = 0.25;
    const c0 = Math.max(0, Math.floor((bx.x0 - pad - ox) / cell)), c1 = Math.min(cols - 1, Math.floor((bx.x1 + pad - ox) / cell - 1e-6));
    const r0 = Math.max(0, Math.floor((bx.z0 - pad - oz) / cell)), r1 = Math.min(rows - 1, Math.floor((bx.z1 + pad - oz) / cell - 1e-6));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) blocked[r * cols + c] = 1;
  }
  // everything outside the room bounds is blocked
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + (c + 0.5) * cell, z = oz + (r + 0.5) * cell;
    if (x < bounds.x0 + 0.3 || x > bounds.x1 - 0.3 || z < bounds.z0 + 0.3 || z > bounds.z1 - 0.3) blocked[r * cols + c] = 1;
  }
  return { ox, oz, cell, cols, rows, blocked };
}

export function navBlockedAt(nav: NavGrid, x: number, z: number): boolean {
  const c = Math.floor((x - nav.ox) / nav.cell), r = Math.floor((z - nav.oz) / nav.cell);
  if (c < 0 || r < 0 || c >= nav.cols || r >= nav.rows) return true;
  return nav.blocked[r * nav.cols + c] === 1;
}

function interiorCombat(b: Builder, w: number, d: number, h: number, biome: BiomeId) {
  const rng = b.rng;
  const hw = w / 2, hd = d / 2;
  const templates = ['pillars', 'crates', 'platform', 'lanes', 'ring'];
  const chosen = rng.shuffle(templates.slice()).slice(0, rng.int(1, 2));
  for (const t of chosen) {
    if (t === 'pillars') {
      const nx = rng.int(2, 3), nz = rng.int(2, 3);
      const s = rng.range(0.8, 1.3);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const x = -hw + (w * (i + 1)) / (nx + 1), z = -hd + (d * (j + 1)) / (nz + 1);
        b.tryPlace(x, z, s, s, 0, h, 'pillar', rng.int(0, 2));
      }
    } else if (t === 'crates') {
      const n = rng.int(7, 12);
      for (let i = 0; i < n; i++) {
        const x = rng.range(-hw + 3, hw - 3), z = rng.range(-hd + 3, hd - 6);
        const ch = rng.pick([1.0, 1.2, 1.4, 2.2]);
        const sz = rng.range(0.6, 1.1);
        if (b.tryPlace(x, z, sz, sz, 0, ch, 'crate', 0) && rng.chance(0.35)) {
          b.tryPlace(x + sz * 2 + 0.05, z, sz * 0.9, sz * 0.9, 0, ch * 0.8, 'crate', 0, 0);
        }
      }
    } else if (t === 'platform') {
      const pw = rng.range(4, 6), pd = rng.range(3, 5);
      const z = rng.range(-hd / 3, 0);
      b.tryPlace(0, z - 2, pw, pd, 0, 1.0, 'platform', 0);
      b.tryPlace(-pw - 2.5, z + 3, 1.2, 1.2, 0, 0.55, 'crate', 0, 0.2);
      b.tryPlace(pw + 2.5, z + 3, 1.2, 1.2, 0, 0.55, 'crate', 0, 0.2);
      b.tryPlace(-pw - 3, z - 6, 0.9, 0.9, 0, h, 'pillar', 1);
      b.tryPlace(pw + 3, z - 6, 0.9, 0.9, 0, h, 'pillar', 1);
    } else if (t === 'lanes') {
      const n = rng.int(2, 4);
      for (let i = 0; i < n; i++) {
        const z = -hd + (d * (i + 1)) / (n + 1) - 2;
        const len = rng.range(4, 8);
        const x = rng.range(-hw / 2, hw / 2);
        b.tryPlace(x, z, len / 2, 0.4, 0, 2.2, 'wall', 2);
      }
    } else if (t === 'ring') {
      const r = Math.min(hw, hd) * 0.5;
      const n = rng.int(5, 7);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rng.range(0, 0.4);
        b.tryPlace(Math.cos(a) * r, Math.sin(a) * r - 2, 0.9, 0.9, 0, rng.pick([1.2, 2.4, h]), rng.chance(0.5) ? 'crate' : 'pillar', 0);
      }
    }
  }
  void biome;
}

/** THE CANOPY: trunks and roots instead of pillars. */
function jungle(b: Builder, w: number, d: number, h: number) {
  const rng = b.rng;
  const hw = w / 2, hd = d / 2;
  const n = Math.round((w * d) / 45);
  for (let i = 0; i < n; i++) {
    const x = rng.range(-hw + 2, hw - 2), z = rng.range(-hd + 2, hd - 7);
    const r = rng.range(0.35, 0.8);
    b.tryPlace(x, z, r, r, 0, h, 'pillar', 1, 1.6);
    if (rng.chance(0.4)) b.tryPlace(x + rng.range(-1.6, 1.6), z + rng.range(-1.6, 1.6), rng.range(0.5, 1.2), rng.range(0.3, 0.6), 0, rng.range(0.4, 0.9), 'crate', 0, 0.2);
  }
}

function lightsFor(rng: Rng, biome: number, w: number, d: number, h: number, count: number): Light[] {
  const L = BIOME_LIGHT[biome];
  const lights: Light[] = [];
  const cols = Math.max(1, Math.round(Math.sqrt(count * (w / d))));
  const rows = Math.max(1, Math.ceil(count / cols));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (lights.length >= count) break;
    lights.push({
      x: -w / 2 + (w * (i + 0.5)) / cols + rng.range(-1, 1),
      y: h - 0.8,
      z: -d / 2 + (d * (j + 0.5)) / rows + rng.range(-1, 1),
      color: rng.chance(0.75) ? L.key : L.fill,
      intensity: rng.range(28, 40),
      range: Math.max(w, d) * 0.75,
    });
  }
  return lights;
}

export function generateRoom(desc: RoomDesc, totalRooms = 15): RoomGeo {
  const rng = new Rng(mixSeed(desc.seed, 0x600d));
  const b = new Builder(rng);
  const biome = desc.biome;
  let w = 30, d = 30, h = 7;
  switch (desc.kind) {
    case 'combat': w = rng.int(26, 38); d = rng.int(28, 40); h = rng.pick([6, 7, 8]); break;
    case 'arena': w = 40; d = 40; h = 10; break;
    case 'gauntlet': w = 12; d = rng.int(56, 68); h = 6; break;
    case 'anomaly': w = rng.int(18, 24); d = rng.int(20, 26); h = 9; break;
    case 'boss': w = 50; d = 50; h = 16; break;
    case 'hub': w = 10; d = 12; h = 4.2; break;
    case 'shop': w = 18; d = 18; h = 6; break;
    case 'sanctuary': w = 14; d = 16; h = 8; break;
    case 'trial': w = 30; d = 30; h = 9; break;
    // open sky: the "walls" are invisible and tall enough that nobody jumps out of the memory
    case 'happy': w = HAPPY_SIZE; d = HAPPY_SIZE; h = 14; break;
  }
  if (desc.reveal) { w = 50; d = 50; h = 16; }
  const plans = desc.kind === 'hub' ? [{ kind: 'standard' as DoorKind, nextKind: 'combat' as RoomKind }] : planDoors(desc, totalRooms);
  const wallDoors = placeDoorsOnWalls(rng, plans, w, d, desc.kind);
  const doorSlots: DoorSlot[] = [];
  const hw = w / 2, hd = d / 2;

  // keep clear: player spawn zone near the entry, pedestal zone
  b.clear(0, hd - 3.5, 4.5, 3.5);
  const pedZ = desc.kind === 'gauntlet' ? -hd + 9 : desc.kind === 'boss' ? 0 : desc.kind === 'happy' ? 6 : -1;
  const pedestals = desc.kind === 'shop'
    ? [{ x: -5, z: -1 }, { x: -1.7, z: -1 }, { x: 1.7, z: -1 }, { x: 5, z: -1 }, { x: -3.3, z: 2.4 }, { x: 3.3, z: 2.4 }]
    : [{ x: -2.6, z: pedZ }, { x: 2.6, z: pedZ }, { x: 0, z: pedZ - 3.2 }];
  if (desc.kind !== 'hub') b.clear(0, pedZ - 1.5, 4.5, 3.4);

  buildShell(b, w, d, h, wallDoors, doorSlots);
  if (desc.kind !== 'happy') addTrim(b, w, d, h, Math.min(h - 1, 3.2));

  const decor: Decor[] = [];
  const enemySpawns: Vec3[] = [];
  let happy: HappyLayout | undefined;

  if (desc.kind === 'combat' || desc.kind === 'trial') {
    if (desc.biome === 4) jungle(b, w, d, h);
    interiorCombat(b, w, d, h, desc.biome);
  } else if (desc.kind === 'arena') {
    // stepped circle (pixel circle) — reads as a pit
    const R = 18;
    for (let z = -hd; z < hd; z += 2) {
      const zc = z + 1;
      const dx = Math.sqrt(Math.max(0, R * R - zc * zc));
      if (dx < hw - 0.5) {
        const keepOpen = Math.abs(zc) < DOOR_W && false;
        if (!keepOpen) {
          // don't block doors: skip slabs near door centers
          const nearDoor = doorSlots.some((ds) => (ds.side === 'e' || ds.side === 'w') && Math.abs(ds.z - zc) < 3.5);
          if (!nearDoor) {
            // carve corridors toward north/south doors
            const gaps = doorSlots.filter((ds) => (ds.side === 'n' && zc < 0) || (ds.side === 's' && zc > 0)).map((ds) => [ds.x - 2.6, ds.x + 2.6]);
            for (const [a0, a1] of [[-hw, -dx], [dx, hw]]) {
              let segs: [number, number][] = [[a0, a1]];
              for (const [g0, g1] of gaps) {
                const next: [number, number][] = [];
                for (const [s0, s1] of segs) {
                  if (g1 <= s0 || g0 >= s1) { next.push([s0, s1]); continue; }
                  if (g0 > s0) next.push([s0, g0]);
                  if (g1 < s1) next.push([g1, s1]);
                }
                segs = next;
              }
              for (const [s0, s1] of segs) if (s1 - s0 > 0.05) b.add(s0, 0, z, s1, h, z + 2, 'wall', 2);
            }
          } else {
            b.add(-hw, 0, z, -dx, 0.4, z + 2, 'platform', 0);
            b.add(dx, 0, z, hw, 0.4, z + 2, 'platform', 0);
          }
        }
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      b.tryPlace(Math.cos(a) * 10, Math.sin(a) * 10, 1, 1, 0, i % 2 ? 1.3 : h, i % 2 ? 'crate' : 'pillar', 1);
    }
    b.tryPlace(0, -2, 3, 3, 0, 0.8, 'platform', 0, 0);
  } else if (desc.kind === 'gauntlet') {
    for (let z = hd - 10; z > -hd + 14; z -= rng.range(5, 7.5)) {
      const side = rng.chance(0.5) ? -1 : 1;
      b.tryPlace(side * rng.range(1.5, 3.5), z, rng.range(0.8, 1.6), 0.6, 0, rng.pick([1.2, 1.4, 2.4]), 'crate', 0, 0.3);
      if (rng.chance(0.3)) b.tryPlace(-side * 4.4, z - 2, 0.6, 0.6, 0, h, 'pillar', 1, 0.2);
    }
  } else if (desc.kind === 'anomaly') {
    // impossible geometry: floating blocks, a hanging slab, a staircase into the ceiling
    for (let i = 0; i < 9; i++) {
      const x = rng.range(-hw + 2, hw - 2), z = rng.range(-hd + 2, hd - 7), y = rng.range(3.2, h - 1.2);
      const s = rng.range(0.4, 1.4);
      b.add(x - s, y, z - s, x + s, y + s * rng.range(0.6, 2), z + s, 'anomaly', rng.int(0, 2));
    }
    for (let i = 0; i < 5; i++) b.add(hw - 2.5, 0.6 * i, -hd + 3 + i * 1.2, hw - 0.2, 0.6 * i + 0.6, -hd + 4.2 + i * 1.2, 'platform', 0);
    decor.push({ kind: 'terminal', x: 0, y: 1.8, z: -hd + 0.05, nx: 0, nz: 1, v: 0 });
    decor.push({ kind: 'text', x: rng.range(-hw / 2, hw / 2), y: 2.6, z: rng.range(-hd / 2, 0), nx: 0, nz: 1, v: rng.int(0, 999) });
    for (let i = 0; i < 6; i++) decor.push({ kind: 'corpse', x: rng.range(-hw + 2, hw - 2), y: 0, z: rng.range(-hd + 3, hd - 7), nx: 0, nz: 1, v: rng.int(0, 3) });
  } else if (desc.kind === 'boss' || desc.reveal) {
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.tryPlace(sx * 13, sz * 13, 2, 2, 0, h, 'pillar', 2, 0);
    for (const [sx, sz] of [[-1, 0], [1, 0], [0, -1]]) b.tryPlace(sx * 17, sz * 17, 2.5, 2.5, 0, 1.0, 'platform', 0, 0);
    for (let i = 0; i < 6; i++) b.tryPlace(rng.range(-18, 18), rng.range(-18, 14), 0.8, 0.8, 0, 1.3, 'crate', 0);
    if (desc.reveal) decor.push({ kind: 'terminal', x: 0, y: 2.2, z: hd - 0.05, nx: 0, nz: -1, v: 1 });
  } else if (desc.kind === 'shop') {
    decor.push({ kind: 'vendor', x: 0, y: 0, z: -hd + 2.6, nx: 0, nz: 1, v: 0 });
    b.add(-3, 0, -hd + 1.2, 3, 0.9, -hd + 1.9, 'crate', 0); // the counter
    decor.push({ kind: 'text', x: 0, y: 4.2, z: -hd + 1.5, nx: 0, nz: 1, v: 1 });
  } else if (desc.kind === 'sanctuary') {
    decor.push({ kind: 'shrine', x: 0, y: 0, z: -2, nx: 0, nz: 1, v: 0 });
    decor.push({ kind: 'terminal', x: -hw + 0.05, y: 1.7, z: 1, nx: 1, nz: 0, v: 2 });
    for (let i = 0; i < 4; i++) b.add(-hw + 1 + i * 0.01, 0, -hd + 2 + i * 3, -hw + 1.6, 0.5, -hd + 3.2 + i * 3, 'crate', 0);
  } else if (desc.kind === 'happy') {
    happy = happyStreet(b, rng, hw, hd, decor);
  } else if (desc.kind === 'hub') {
    decor.push({ kind: 'terminal', x: hw - 0.05, y: 1.6, z: -1, nx: -1, nz: 0, v: 0 });
    decor.push({ kind: 'tally', x: -hw + 0.04, y: 1.9, z: 0, nx: 1, nz: 0, v: 0 });
    decor.push({ kind: 'mirror', x: hw - 0.05, y: 1.6, z: 3, nx: -1, nz: 0, v: 0 });
    decor.push({ kind: 'body', x: -hw + 1.6, y: 0, z: -hd + 1.8, nx: 0, nz: 1, v: 0 });
    decor.push({ kind: 'chair', x: 2.4, y: 0, z: hd - 2.4, nx: 0, nz: -1, v: 0 });
    b.add(hw - 1.4, 0, -hd + 0.5, hw - 0.1, 0.9, -hd + 2.5, 'crate', 0); // cot / bench
  }

  // decorative wall props
  if (desc.kind === 'combat' || desc.kind === 'arena' || desc.kind === 'gauntlet' || desc.kind === 'trial') {
    const DECOR: Decor['kind'][][] = [['pipe', 'vat'], ['server', 'cable'], ['vat', 'cable'], ['vat', 'vat', 'cable'], ['foliage', 'foliage'], ['wreck', 'pipe'], ['server', 'cable']];
    const kindsByBiome = DECOR[desc.biome] ?? DECOR[0];
    const n = rng.int(3, 6);
    for (let i = 0; i < n; i++) {
      const side = rng.int(0, 1);
      const z = rng.range(-hd + 2, hd - 2);
      decor.push({ kind: rng.pick(kindsByBiome), x: side ? hw - 0.05 : -hw + 0.05, y: 0, z, nx: side ? -1 : 1, nz: 0, v: rng.int(0, 2) });
    }
  }

  // enemy spawns: grid sample of free cells away from the entry
  const bounds = { x0: -hw, z0: -hd, x1: hw, z1: hd };
  const nav = buildNav(b.boxes.concat(doorSlots.map((ds) => ds.panel)), bounds);
  const cand: Vec3[] = [];
  for (let z = -hd + 2; z < hd - 9; z += 2) for (let x = -hw + 2; x < hw - 2; x += 2) {
    if (navBlockedAt(nav, x, z) || navBlockedAt(nav, x + 0.8, z) || navBlockedAt(nav, x - 0.8, z) || navBlockedAt(nav, x, z + 0.8) || navBlockedAt(nav, x, z - 0.8)) continue;
    cand.push({ x, y: 0, z });
  }
  rng.shuffle(cand);
  // prefer spots farther from the entry
  cand.sort((a, c) => a.z - c.z + rng.range(-8, 8));
  enemySpawns.push(...cand);

  const playerSpawns: Vec3[] = [
    { x: -1.2, y: 0, z: hd - 2.5 }, { x: 1.2, y: 0, z: hd - 2.5 },
    { x: -1.2, y: 0, z: hd - 4.5 }, { x: 1.2, y: 0, z: hd - 4.5 },
  ];

  // the jungle: foliage everywhere there is floor
  if (desc.biome === 4 && desc.kind !== 'hub' && desc.kind !== 'shop' && desc.kind !== 'sanctuary') {
    for (let i = 0; i < Math.round((w * d) / 14); i++) {
      const x = rng.range(-hw + 0.6, hw - 0.6), z = rng.range(-hd + 0.6, hd - 0.6);
      if (Math.abs(x) < 3 && z > hd - 7) continue;
      decor.push({ kind: 'foliage', x, y: 0, z, nx: 0, nz: 1, v: rng.int(0, 5) });
    }
  }

  const lightCount = desc.kind === 'hub' ? 1 : desc.kind === 'gauntlet' ? 5 : desc.kind === 'boss' ? 6 : 4;
  const lights = lightsFor(rng, biome, w, d, h, lightCount);
  // the street lamps are on in broad daylight (nobody told the memory)
  if (happy) happy.lamps.forEach((l, i) => { if (lights[i]) Object.assign(lights[i], { x: l.x + (l.x < 0 ? 0.9 : -0.9), y: 4.2, z: l.z, color: 0xffd890, intensity: 7, range: 9 }); });
  if (desc.kind === 'hub') { lights[0].x = 0; lights[0].z = 0; lights[0].intensity = 14; lights[0].range = 14; lights[0].y = h - 0.4; }
  if (desc.kind === 'anomaly') for (const l of lights) { l.color = 0x7dff7a; l.intensity *= 0.7; }
  if (desc.kind === 'sanctuary') for (const l of lights) { l.color = 0xfff0c8; l.intensity *= 0.8; }
  if (desc.kind === 'shop') for (const l of lights) { l.color = 0xffd27a; }
  if (desc.mutator === 'darkness') for (const l of lights) l.intensity *= 0.18;
  if (desc.mutator === 'bloodmoon') for (const l of lights) l.color = 0xff1a10;

  return {
    desc, w, d, h, boxes: b.boxes, doors: doorSlots.sort((a, c) => a.slot - c.slot), playerSpawns, enemySpawns,
    pedestals, lights, decor, nav,
    ambient: desc.kind === 'anomaly' ? 0.35 : desc.kind === 'happy' ? 1.0 : 0.5,
    happy,
    fog: desc.kind === 'happy' ? 0.011 : desc.kind === 'hub' ? 0.03 : desc.kind === 'anomaly' ? 0.06 : desc.mutator === 'darkness' ? 0.075 : desc.biome === 4 ? 0.05 : desc.biome === 5 ? 0.045 : 0.035,
    bounds,
  };
}

/** Solid boxes for collision given which doors are currently open. */
export function solidsFor(geo: RoomGeo, openSlots: Set<number> | null): Box[] {
  const out = geo.boxes.slice();
  for (const ds of geo.doors) {
    if (ds.entry || !openSlots || !openSlots.has(ds.slot)) out.push(ds.panel);
  }
  return out;
}

/** Ray vs AABB list. Returns distance to the first hit, or Infinity. */
export function raycastBoxes(boxes: Box[], ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxDist: number): number {
  let best = maxDist;
  const ix = 1 / (dx || 1e-9), iy = 1 / (dy || 1e-9), iz = 1 / (dz || 1e-9);
  for (const b of boxes) {
    let t0 = (b.x0 - ox) * ix, t1 = (b.x1 - ox) * ix;
    let tmin = Math.min(t0, t1), tmax = Math.max(t0, t1);
    t0 = (b.y0 - oy) * iy; t1 = (b.y1 - oy) * iy;
    tmin = Math.max(tmin, Math.min(t0, t1)); tmax = Math.min(tmax, Math.max(t0, t1));
    t0 = (b.z0 - oz) * iz; t1 = (b.z1 - oz) * iz;
    tmin = Math.max(tmin, Math.min(t0, t1)); tmax = Math.min(tmax, Math.max(t0, t1));
    if (tmax >= Math.max(0, tmin) && tmin < best) best = Math.max(0, tmin);
  }
  // floor & ceiling-less: floor at y=0
  if (dy < 0) { const tf = -oy / dy; if (tf >= 0 && tf < best) best = tf; }
  return best;
}

export function hasLOS(boxes: Box[], ax: number, ay: number, az: number, bx: number, by: number, bz: number): boolean {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-4) return true;
  return raycastBoxes(boxes, ax, ay, az, dx / len, dy / len, dz / len, len) >= len - 0.05;
}

/** Ray vs vertical capsule approximated as a cylinder segment + sphere test. Returns t or -1 */
export function rayVsSphere(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, cx: number, cy: number, cz: number, r: number): number {
  const lx = cx - ox, ly = cy - oy, lz = cz - oz;
  const tca = lx * dx + ly * dy + lz * dz;
  if (tca < 0) return -1;
  const d2 = lx * lx + ly * ly + lz * lz - tca * tca;
  if (d2 > r * r) return -1;
  return tca - Math.sqrt(r * r - d2);
}

export function rayVsCylinder(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, cx: number, cz: number, y0: number, y1: number, r: number): number {
  // project onto XZ
  const fx = ox - cx, fz = oz - cz;
  const a = dx * dx + dz * dz;
  if (a < 1e-9) return -1;
  const bq = 2 * (fx * dx + fz * dz);
  const c = fx * fx + fz * fz - r * r;
  const disc = bq * bq - 4 * a * c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  let t = (-bq - sq) / (2 * a);
  if (t < 0) t = (-bq + sq) / (2 * a);
  if (t < 0) return -1;
  const y = oy + dy * t;
  if (y < y0 || y > y1) return -1;
  return t;
}
