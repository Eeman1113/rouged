// Viewmodel registry: rigs per weapon, pose → rendered frame cache (LRU), fx sprite caches.
import { Scene, renderScene, focal, Frame } from './viewmodel3d';
import { Rig } from './viewmodelRig';
import { Anim, Pose, applyAnim, frameCount } from './viewmodelAnim';
import { pulseRig } from './viewmodelPulse';
import { breacherRig } from './viewmodelBreacher';
import { lanceRig } from './viewmodelLance';
import { ripperRig } from './viewmodelRipper';
import { buildFist } from './viewmodelFist';
import { handTestRig } from './viewmodelHandTest';
import { makeFlash, makePuff, FLASH_PULSE, FLASH_SHOT, FLASH_LANCE } from './viewmodelFx';

export const VM_VFOV = 58;

const RIGS: Record<string, Rig> = { pulse: pulseRig, breacher: breacherRig, lance: lanceRig, ripper: ripperRig, handtest: handTestRig };
export function getRig(id: string): Rig { return RIGS[id] ?? pulseRig; }

const MAX_FRAMES = 560;
const frames = new Map<string, Frame>();
export let vmRenderMs = 0;
export let vmRenderCount = 0;

function clipFor(baseH: number): { x0: number; y0: number; x1: number; y1: number } {
  return { x0: -Math.round(baseH * 1.0), y0: -Math.round(baseH / 2) - 20, x1: Math.round(baseH * 1.0), y1: Math.round(baseH / 2) + 30 };
}

function cached(key: string, make: () => Frame): Frame {
  const hit = frames.get(key);
  if (hit) { frames.delete(key); frames.set(key, hit); return hit; }
  const t0 = performance.now();
  const f = make();
  vmRenderMs = performance.now() - t0;
  vmRenderCount++;
  frames.set(key, f);
  if (frames.size > MAX_FRAMES) { const first = frames.keys().next().value; if (first !== undefined) frames.delete(first); }
  return f;
}

export function poseKey(p: Pose): string {
  let s = '';
  for (const k in p) s += Math.round(p[k] * 1000) + ',';
  return s;
}

export function getFrame(id: string, p: Pose, baseH: number): Frame {
  const rig = getRig(id);
  return cached(`${id}|${baseH}|${poseKey(p)}`, () => {
    const sc = new Scene();
    rig.build(sc, p);
    return renderScene(sc, focal(baseH, VM_VFOV), clipFor(baseH));
  });
}

export const FIST_FRAMES = 16;
export function getFist(u: number, baseH: number): Frame {
  const fi = Math.max(0, Math.min(FIST_FRAMES - 1, Math.floor(u * FIST_FRAMES)));
  return cached(`fist|${baseH}|${fi}`, () => {
    const sc = new Scene();
    buildFist(sc, fi / (FIST_FRAMES - 1));
    return renderScene(sc, focal(baseH, VM_VFOV), clipFor(baseH));
  });
}

// ------------------------------------------------------------------ fx sprites
const fxCache = new Map<string, HTMLCanvasElement>();
function fxm(key: string, make: () => HTMLCanvasElement): HTMLCanvasElement {
  let c = fxCache.get(key);
  if (!c) { c = make(); fxCache.set(key, c); }
  return c;
}
export const vmFx = {
  apply(p: Pose, a: Anim, fi: number): void { applyAnim(p, a, fi); },
  flash(kind: 'pulse' | 'breacher' | 'lance', big: number, seed: number): HTMLCanvasElement {
    return fxm(`fl|${kind}|${big}|${seed}`, () => {
      if (kind === 'pulse') return makeFlash(FLASH_PULSE, big ? 6 : 3.5, big ? 7 : 5, 10 + seed * 7 + big, 0.8);
      if (kind === 'breacher') return makeFlash(FLASH_SHOT, big ? 10 : 6, big ? 9 : 6, 40 + seed * 7 + big, 0.85);
      return makeFlash(FLASH_LANCE, big ? 13 : 7, big ? 11 : 7, 70 + seed * 7 + big, 1);
    });
  },
  /** kind 0 smoke, 1 vapour; u = remaining life 0..1 (density) */
  puff(kind: number, size: number, u: number): HTMLCanvasElement {
    const s = Math.max(1, Math.min(14, size));
    const d = Math.max(1, Math.min(4, Math.ceil(u * 4)));
    return fxm(`pf|${kind}|${s}|${d}`, () => kind === 1 ? makePuff(s, 0xe8fcff, 0x6ab8d0, d * 0.2) : makePuff(s, 0x9a9590, 0x45403e, d * 0.19));
  },
};
export { frameCount };
