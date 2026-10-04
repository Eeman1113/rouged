// ROUGED procedural pixel-art generator. Everything is drawn in code, deterministic (seeded),
// and cached on first request. Implementation lives in ./art/*.
import { Pix, makeRng, hashStr } from './art/core';
import { enemyDef, Pose, Act, EnemyDef } from './art/enemies';
import { wardenDef } from './art/warden';
import { enemyDef2 } from './art/enemies2';
import { wardenDef2 } from './art/warden2';
import { buildWall2, buildFloor2, buildCeiling2, buildCrate2 } from './art/textures2';
import { buildVendor, buildShrine, buildScrap, buildShield, buildProjectile2, buildFoliage } from './art/props';
import { buildWeapon } from './art/weapons';
import { buildFace } from './art/face';
import {
  buildGibs, buildBloodSprites, buildBloodDecal, buildScorch, buildSpark, buildMuzzle, buildProjectile,
  buildExplosion, buildMine, buildPickup, buildPedestalIcon,
} from './art/fx';
import {
  buildWall, buildFloor, buildCeiling, buildHub, buildDoor, buildTerminal, buildCrate, buildMirror, buildBody,
} from './art/textures';

// ------------------------------------------------------------------ enemies
export type EnemyType = 'drone' | 'grunt' | 'brute' | 'stalker' | 'spider' | 'replica' | 'warden'
  | 'leech' | 'sentinel' | 'bomber' | 'mortar' | 'bulwark' | 'wraith';
export interface EnemySpriteSet {
  w: number; h: number;
  worldH: number;
  idle: HTMLCanvasElement[];
  move: HTMLCanvasElement[];
  attack: HTMLCanvasElement[];
  pain: HTMLCanvasElement;
  stagger: HTMLCanvasElement[];
  charge: HTMLCanvasElement[];
  dead: HTMLCanvasElement;
}

const cache = new Map<string, unknown>();
function memo<T>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit !== undefined) return hit as T;
  const v = make();
  cache.set(key, v);
  return v;
}

function enemyFrame(def: EnemyDef, act: Act, f: number, seed: number): HTMLCanvasElement {
  const p = new Pix(def.w, def.h);
  const ps: Pose = { act, f };
  def.draw(p, ps, makeRng(seed + hashStr(act) + f * 101));
  return p.toCanvas();
}

export function getEnemySprites(type: EnemyType, variant = 0): EnemySpriteSet {
  const v = Math.max(0, Math.min(6, Math.floor(variant || 0)));
  const vk = type === 'warden' ? v : v === 1 ? 1 : 0;
  return memo(`enemy:${type}:${vk}`, () => {
    const def = type === 'warden' ? wardenDef2(vk) ?? wardenDef(vk) : enemyDef2(type, vk === 1) ?? enemyDef(type, vk === 1);
    const seed = hashStr(type) + vk * 7919;
    const fr = (a: Act, f: number): HTMLCanvasElement => enemyFrame(def, a, f, seed);
    const attack = [fr('attack', 0), fr('attack', 1)];
    const deadPix = new Pix(def.w, def.h);
    def.dead(deadPix, makeRng(seed + 99));
    return {
      w: def.w, h: def.h, worldH: def.worldH,
      idle: [fr('idle', 0), fr('idle', 1)],
      move: [fr('move', 0), fr('move', 1), fr('move', 2), fr('move', 3)],
      attack,
      pain: fr('pain', 0),
      stagger: [fr('stagger', 0), fr('stagger', 1)],
      charge: def.hasCharge ? [fr('charge', 0), fr('charge', 1)] : attack,
      dead: deadPix.toCanvas(),
    };
  });
}

// ------------------------------------------------------------------ weapons
export type WeaponId = 'pulse' | 'breacher' | 'lance' | 'ripper';
export interface WeaponSpriteSet {
  w: number; h: number;
  idle: HTMLCanvasElement;
  fire: HTMLCanvasElement[];
  extra: HTMLCanvasElement[];
}
export function getWeaponSprites(id: WeaponId): WeaponSpriteSet {
  return memo(`weapon:${id}`, () => buildWeapon(id));
}

// ------------------------------------------------------------------ face
export type FaceState = 'healthy' | 'hurt' | 'damaged' | 'critical' | 'grin' | 'dead' | 'ouch' | 'look_left' | 'look_right';
export function getFace(state: FaceState, age: number, frame: number): HTMLCanvasElement {
  const a = Math.round(Math.max(0, Math.min(1, age || 0)) * 10);
  const f = ((Math.floor(frame || 0) % 4) + 4) % 4;
  return memo(`face:${state}:${a}:${f}`, () => buildFace(state, a / 10, f));
}

// ------------------------------------------------------------------ fx
export function getGibSprites(): HTMLCanvasElement[] { return memo('gibs', buildGibs); }
export function getBloodSprites(): HTMLCanvasElement[] { return memo('blood', buildBloodSprites); }
export function getBloodDecal(i: number): HTMLCanvasElement {
  const k = ((Math.floor(i || 0) % 4) + 4) % 4;
  return memo(`blooddecal:${k}`, () => buildBloodDecal(k));
}
export function getScorchDecal(): HTMLCanvasElement { return memo('scorch', buildScorch); }
export function getSparkSprite(): HTMLCanvasElement { return memo('spark', buildSpark); }
export function getMuzzleSprite(): HTMLCanvasElement { return memo('muzzle', buildMuzzle); }
export type ProjectileSpriteKind = 'bolt' | 'plasma' | 'orb' | 'rocket' | 'spit' | 'replica' | 'shell' | 'hex';
export function getProjectileSprite(kind: ProjectileSpriteKind): HTMLCanvasElement {
  return memo(`proj:${kind}`, () => (kind === 'shell' || kind === 'hex' ? buildProjectile2(kind) : buildProjectile(kind)));
}
export function getExplosionFrames(): HTMLCanvasElement[] { return memo('explosion', buildExplosion); }
export function getMineSprite(armed: boolean): HTMLCanvasElement { return memo(`mine:${armed ? 1 : 0}`, () => buildMine(armed)); }
export function getPickupSprite(kind: 'hp' | 'armor' | 'ammo'): HTMLCanvasElement { return memo(`pickup:${kind}`, () => buildPickup(kind)); }
export function getPedestalIcon(
  category: 'weapon' | 'movement' | 'passive' | 'onkill' | 'curse' | 'legendary',
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
): HTMLCanvasElement {
  return memo(`ped:${category}:${rarity}`, () => buildPedestalIcon(category, rarity));
}

// ------------------------------------------------------------------ environment
/** 0 FOUNDRY, 1 ARCHIVE, 2 THE CORE, 3 THE NURSERY, 4 THE CANOPY, 5 THE FRONT, 6 THE MIRROR */
export type Biome = 0 | 1 | 2 | 3 | 4 | 5 | 6;
function biomeIdx(b: number): number { return Math.max(0, Math.min(6, Math.floor(b || 0))); }
export function getWallTexture(biome: Biome, variant: number): HTMLCanvasElement {
  const v = ((Math.floor(variant || 0) % 4) + 4) % 4;
  const b = biomeIdx(biome);
  return memo(`wall:${b}:${v}`, () => (b >= 3 ? buildWall2(b, v) : buildWall(b, v)));
}
export function getFloorTexture(biome: Biome): HTMLCanvasElement {
  const b = biomeIdx(biome);
  return memo(`floor:${b}`, () => (b >= 3 ? buildFloor2(b) : buildFloor(b)));
}
export function getCeilingTexture(biome: Biome): HTMLCanvasElement {
  const b = biomeIdx(biome);
  return memo(`ceil:${b}`, () => (b >= 3 ? buildCeiling2(b) : buildCeiling(b)));
}
export function getHubTexture(kind: 'wall' | 'floor' | 'tally', amount = 0): HTMLCanvasElement {
  const a = kind === 'tally' ? Math.max(0, Math.floor(amount || 0)) : 0;
  return memo(`hub:${kind}:${a}`, () => buildHub(kind, a));
}
export type DoorSpriteKind = 'standard' | 'elite' | 'unknown' | 'corrupted' | 'extract' | 'shop' | 'sanctuary' | 'trial';
export function getDoorTexture(kind: DoorSpriteKind, open: boolean): HTMLCanvasElement {
  return memo(`door:${kind}:${open ? 1 : 0}`, () => buildDoor(kind, open));
}
export function getTerminalTexture(frame: number): HTMLCanvasElement {
  const f = ((Math.floor(frame || 0) % 4) + 4) % 4;
  return memo(`term:${f}`, () => buildTerminal(f));
}
export function getCrateTexture(biome: Biome): HTMLCanvasElement {
  const b = biomeIdx(biome);
  return memo(`crate:${b}`, () => (b >= 3 ? buildCrate2(b) : buildCrate(b)));
}
export function getMirrorTexture(frame: number): HTMLCanvasElement {
  const f = ((Math.floor(frame || 0) % 4) + 4) % 4;
  return memo(`mirror:${f}`, () => buildMirror(f));
}
export function getBodySprite(variant: number): HTMLCanvasElement {
  const v = Math.max(0, Math.min(3, Math.floor(variant || 0)));
  return memo(`body:${v}`, () => buildBody(v));
}

// ------------------------------------------------------------------ npcs / props / pickups
/** THE BROKER — seated vendor, 40x56, 2 frames. */
export function getVendorSprite(frame: number): HTMLCanvasElement {
  const f = ((Math.floor(frame || 0) % 2) + 2) % 2;
  return memo(`vendor:${f}`, () => buildVendor(f));
}
/** Sanctuary healing shrine, 32x48. */
export function getShrineSprite(): HTMLCanvasElement { return memo('shrine', buildShrine); }
/** Scrap / data-shard run currency pickup, 12x12. */
export function getScrapSprite(): HTMLCanvasElement { return memo('scrap', buildScrap); }
/** Translucent blue energy shield plate for shield-hit flashes, 32x40. */
export function getShieldSprite(): HTMLCanvasElement { return memo('shield', buildShield); }
/** Jungle billboards: 0 tall fern, 1 broad-leaf bush, 2 hanging vine, 3 giant leaf cluster, 4 glowing mushrooms, 5 small palm. */
export function getFoliageSprite(v: number): HTMLCanvasElement {
  const k = ((Math.floor(v || 0) % 6) + 6) % 6;
  return memo(`foliage:${k}`, () => buildFoliage(k));
}
