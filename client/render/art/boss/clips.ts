// 3-stage move clips (wind-up → strike → recovery) tweened between key poses.
import { BP, BP0, XF, Clip, fr, ease, easeOut, lerp, strike } from './rig';

/** A move clip built from key poses: rest → W (wind-up) → A (strike) → rest. */
export interface MoveKeys {
  W: Partial<BP>; A: Partial<BP>; R?: Partial<BP>;
  /** pose at the start of the recovery (defaults to A) */
  L?: Partial<BP>; xl?: XF;
  n?: [number, number, number];
  xw?: XF; xa?: XF;
  /** active stage loops over time (sustained beams / sprays) */
  loop?: boolean;
  /** custom per-frame tweak for the active stage (k 0..1) */
  act?: (k: number) => Partial<BP>;
  /** tremble during the end of the wind-up (px) */
  shake?: number;
}

function mix(a: Partial<BP>, b: Partial<BP>, t: number): Partial<BP> {
  const out: Partial<BP> = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof BP>;
  for (const k of keys) out[k] = lerp(a[k] ?? BP0[k], b[k] ?? BP0[k], t);
  return out;
}
function mixXf(a: XF | undefined, b: XF | undefined, t: number): XF {
  const A = a ?? {}, B = b ?? {};
  const g = (k: keyof XF, d: number): number => lerp((A[k] as number | undefined) ?? d, (B[k] as number | undefined) ?? d, t);
  return { sy: g('sy', 1), sx: g('sx', 1), lean: g('lean', 0), lift: g('lift', 0), jit: g('jit', 0), white: g('white', 0) };
}

/** Expand MoveKeys into three clips: id.0 / id.1 / id.2 */
export function moveClips(id: string, k: MoveKeys): Record<string, Clip> {
  const [nw, na, nr] = k.n ?? [6, 4, 6];
  const R = k.R ?? {};
  return {
    [id + '.0']: {
      n: nw,
      pose: (i, n) => { const t = ease(fr(i, n) * 1.15); const p = mix(R, k.W, t); if (k.shake && t > 0.7) p.ox = (p.ox ?? 0) + (i % 2 ? k.shake : -k.shake); return p; },
      xf: (i, n) => mixXf(undefined, k.xw, ease(fr(i, n))),
    },
    [id + '.1']: {
      n: na, loop: k.loop,
      pose: (i, n) => {
        const f = fr(i, n);
        const base = k.loop ? k.A : mix(k.W, k.A, Math.min(1.1, strike(0.3 + f * 0.7)));
        return k.act ? { ...base, ...k.act(f) } : base;
      },
      xf: (i, n) => (k.loop ? mixXf(k.xa, k.xa, 1) : mixXf(k.xw, k.xa, easeOut(fr(i, n) * 1.4))),
    },
    [id + '.2']: {
      n: nr,
      pose: (i, n) => mix(k.L ?? k.A, R, ease(fr(i, n))),
      xf: (i, n) => mixXf(k.xl ?? k.xa, undefined, ease(fr(i, n))),
    },
  };
}

