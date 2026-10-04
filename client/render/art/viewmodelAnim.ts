// Keyframe animation for viewmodel rigs: named float channels, per-segment easing, events.
// Every anim is authored in normalised time 0..1 (so reloads can be stretched to any duration)
// and sampled at a fixed frame rate so rendered poses can be cached by frame index.

export type Ease = (t: number) => number;
export const E = {
  lin: (t: number) => t,
  in: (t: number) => t * t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  io: (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  in3: (t: number) => t * t * t,
  out3: (t: number) => 1 - (1 - t) ** 3,
  /** overshoot then settle */
  back: (t: number) => { const c = 2.2; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
  /** anticipation (dips back before going) */
  antic: (t: number) => { const c = 1.9; return (c + 1) * t * t * t - c * t * t; },
  /** springy settle */
  spring: (t: number) => 1 - Math.exp(-6 * t) * Math.cos(t * 11),
  step: (t: number) => (t < 1 ? 0 : 1),
  hold: (_t: number) => 0,
};

/** [time 0..1, value, ease of the segment arriving at this key] */
export type Key = [number, number, Ease?];
export type Track = Key[];
export type Pose = Record<string, number>;

export interface Anim {
  /** nominal duration (s) — frame count = ceil(dur*fps) */
  dur: number;
  fps: number;
  ch: Record<string, Track>;
  /** [time 0..1, event name] for 2D fx */
  ev?: [number, string][];
  loop?: boolean;
}

export function sampleTrack(tr: Track, t: number): number {
  if (t <= tr[0][0]) return tr[0][1];
  for (let i = 1; i < tr.length; i++) {
    const b = tr[i];
    if (t <= b[0]) {
      const a = tr[i - 1];
      const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * (b[2] ?? E.io)(u);
    }
  }
  return tr[tr.length - 1][1];
}

export function frameCount(a: Anim): number { return Math.max(1, Math.ceil(a.dur * a.fps)); }

/** Sample an anim at frame index fi into pose (channels not in the anim keep their value). */
export function applyAnim(pose: Pose, a: Anim, fi: number): void {
  const n = frameCount(a);
  const t = n <= 1 ? 1 : Math.min(1, fi / (n - 1));
  for (const k in a.ch) pose[k] = sampleTrack(a.ch[k], t);
}

/** Build a track from compact pairs, all with the same ease: k(0,0, .2,1, 1,0) */
export function k(...v: (number | Ease)[]): Track {
  const out: Track = [];
  let i = 0;
  while (i < v.length) {
    const t = v[i++] as number, val = v[i++] as number;
    let e: Ease | undefined;
    if (typeof v[i] === 'function') e = v[i++] as Ease;
    out.push([t, val, e]);
  }
  return out;
}
