// ROUGED procedural pixel-art generator. Everything is drawn in code, deterministic (seeded),
// and cached on first request. Implementation lives in ./art/*.
import { Pix, makeRng, hashStr } from './art/core';
import { enemyDef, Pose, Act, EnemyDef } from './art/enemies';
import { wardenDef } from './art/warden';
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
export type EnemyType = 'drone' | 'grunt' | 'brute' | 'stalker' | 'spider' | 'replica' | 'warden';
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
  const v = Math.max(0, Math.min(2, Math.floor(variant || 0)));
  const vk = type === 'warden' ? v : v === 1 ? 1 : 0;
  return memo(`enemy:${type}:${vk}`, () => {
    const def = type === 'warden' ? wardenDef(vk) : enemyDef(type, vk === 1);
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
export function getProjectileSprite(kind: 'bolt' | 'plasma' | 'orb' | 'rocket' | 'spit' | 'replica'): HTMLCanvasElement {
  return memo(`proj:${kind}`, () => buildProjectile(kind));
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
export type Biome = 0 | 1 | 2;
export function getWallTexture(biome: Biome, variant: number): HTMLCanvasElement {
  const v = ((Math.floor(variant || 0) % 4) + 4) % 4;
  return memo(`wall:${biome}:${v}`, () => buildWall(biome, v));
}
export function getFloorTexture(biome: Biome): HTMLCanvasElement { return memo(`floor:${biome}`, () => buildFloor(biome)); }
export function getCeilingTexture(biome: Biome): HTMLCanvasElement { return memo(`ceil:${biome}`, () => buildCeiling(biome)); }
export function getHubTexture(kind: 'wall' | 'floor' | 'tally', amount = 0): HTMLCanvasElement {
  const a = kind === 'tally' ? Math.max(0, Math.floor(amount || 0)) : 0;
  return memo(`hub:${kind}:${a}`, () => buildHub(kind, a));
}
export function getDoorTexture(kind: 'standard' | 'elite' | 'unknown' | 'corrupted', open: boolean): HTMLCanvasElement {
  return memo(`door:${kind}:${open ? 1 : 0}`, () => buildDoor(kind, open));
}
export function getTerminalTexture(frame: number): HTMLCanvasElement {
  const f = ((Math.floor(frame || 0) % 4) + 4) % 4;
  return memo(`term:${f}`, () => buildTerminal(f));
}
export function getCrateTexture(biome: Biome): HTMLCanvasElement { return memo(`crate:${biome}`, () => buildCrate(biome)); }
export function getMirrorTexture(frame: number): HTMLCanvasElement {
  const f = ((Math.floor(frame || 0) % 4) + 4) % 4;
  return memo(`mirror:${f}`, () => buildMirror(f));
}
export function getBodySprite(variant: number): HTMLCanvasElement {
  const v = Math.max(0, Math.min(3, Math.floor(variant || 0)));
  return memo(`body:${v}`, () => buildBody(v));
}
