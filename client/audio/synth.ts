/**
 * Offline (plain JS) DSP helpers used to pre-render reusable one-shot buffers:
 * drum kit, palm-muted guitar chugs, growl-bass chugs, impacts, risers.
 *
 * Rendering into AudioBuffers once and replaying them through a single
 * AudioBufferSourceNode is far cheaper than building 5-10 nodes per hit.
 */

export const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** deterministic PRNG */
export function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type BqType = 'lp' | 'hp' | 'bp' | 'peak';

/** RBJ biquad (direct form I). */
export class Biquad {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  constructor(private sr: number, type?: BqType, f?: number, q?: number, db?: number) {
    if (type) this.set(type, f ?? 1000, q ?? 0.707, db ?? 0);
  }
  set(type: BqType, f: number, q: number, db = 0): this {
    const w = (2 * Math.PI * Math.max(10, Math.min(f, this.sr * 0.45))) / this.sr;
    const cs = Math.cos(w);
    const al = Math.sin(w) / (2 * Math.max(0.05, q));
    let b0 = 1;
    let b1 = 0;
    let b2 = 0;
    let a0 = 1;
    let a1 = 0;
    let a2 = 0;
    if (type === 'lp') {
      b0 = (1 - cs) / 2;
      b1 = 1 - cs;
      b2 = b0;
      a0 = 1 + al;
      a1 = -2 * cs;
      a2 = 1 - al;
    } else if (type === 'hp') {
      b0 = (1 + cs) / 2;
      b1 = -(1 + cs);
      b2 = b0;
      a0 = 1 + al;
      a1 = -2 * cs;
      a2 = 1 - al;
    } else if (type === 'bp') {
      b0 = al;
      b1 = 0;
      b2 = -al;
      a0 = 1 + al;
      a1 = -2 * cs;
      a2 = 1 - al;
    } else {
      const A = Math.pow(10, db / 40);
      b0 = 1 + al * A;
      b1 = -2 * cs;
      b2 = 1 - al * A;
      a0 = 1 + al / A;
      a1 = -2 * cs;
      a2 = 1 - al / A;
    }
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
    return this;
  }
  run(x: number): number {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    // flush denormals
    this.y1 = Math.abs(y) < 1e-15 ? 0 : y;
    return y;
  }
}

/** band-limited (polyBLEP) sawtooth */
export class Saw {
  phase: number;
  inc = 0;
  constructor(private sr: number, f: number, phase = 0) {
    this.phase = phase - Math.floor(phase);
    this.freq(f);
  }
  freq(f: number): void {
    this.inc = Math.min(0.49, Math.max(0, f / this.sr));
  }
  next(): number {
    const t = this.phase;
    const dt = this.inc;
    let v = 2 * t - 1;
    if (t < dt) {
      const x = t / dt;
      v -= x + x - x * x - 1;
    } else if (t > 1 - dt) {
      const x = (t - 1) / dt;
      v -= x * x + x + x + 1;
    }
    this.phase += dt;
    if (this.phase >= 1) this.phase -= 1;
    return v;
  }
}

/** Reasonably square-ish metallic oscillator bank (808-style cymbal source). */
const METAL_F = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];

export interface Rendered {
  data: Float32Array[];
  sr: number;
}

function make(sr: number, sec: number, ch = 1): Float32Array[] {
  const n = Math.max(1, Math.floor(sr * sec));
  const out: Float32Array[] = [];
  for (let c = 0; c < ch; c++) out.push(new Float32Array(n));
  return out;
}

/** normalise to peak, apply short fade-out at the end to avoid clicks */
function finish(chs: Float32Array[], sr: number, peak = 0.95): Float32Array[] {
  let m = 0;
  for (const d of chs) for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i]));
  const k = m > 1e-6 ? peak / m : 1;
  const fade = Math.min(Math.floor(sr * 0.006), chs[0].length);
  for (const d of chs) {
    for (let i = 0; i < d.length; i++) d[i] *= k;
    for (let i = 0; i < fade; i++) d[d.length - 1 - i] *= i / fade;
  }
  return chs;
}

const tanh = Math.tanh;

// ---------------------------------------------------------------- drum kit

/** kind: 0 normal, 1 tight (double-kick), 2 heavy (boss / drops) */
export function renderKick(sr: number, kind: 0 | 1 | 2): Float32Array[] {
  const len = kind === 1 ? 0.2 : kind === 2 ? 0.75 : 0.42;
  const [d] = make(sr, len);
  const rnd = mulberry(11 + kind);
  const hp = new Biquad(sr, 'hp', 3200, 0.7);
  let ph = 0;
  const ampTau = kind === 1 ? 0.075 : kind === 2 ? 0.32 : 0.17;
  const sat = kind === 2 ? 2.6 : 1.7;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const f =
      kind === 2
        ? 38 + 210 * Math.exp(-t / 0.024) + 34 * Math.exp(-t / 0.2)
        : kind === 1
          ? 52 + 240 * Math.exp(-t / 0.014) + 30 * Math.exp(-t / 0.06)
          : 47 + 190 * Math.exp(-t / 0.019) + 40 * Math.exp(-t / 0.11);
    ph += (2 * Math.PI * f) / sr;
    const atk = t < 0.0012 ? t / 0.0012 : 1;
    const body = Math.sin(ph) * Math.exp(-t / ampTau) * atk;
    const n = hp.run(rnd() * 2 - 1) * Math.exp(-t / 0.0024) * (kind === 1 ? 0.75 : 0.5);
    const beater = Math.sin(2 * Math.PI * 1650 * t) * Math.exp(-t / 0.0035) * 0.35;
    d[i] = tanh(sat * (body + n + beater)) / tanh(sat);
  }
  return finish([d], sr, 0.95);
}

export function renderSnare(sr: number): Float32Array[] {
  const [d] = make(sr, 0.45);
  const rnd = mulberry(23);
  const hp = new Biquad(sr, 'hp', 750, 0.7);
  const lp = new Biquad(sr, 'lp', 9500, 0.7);
  const crackHp = new Biquad(sr, 'hp', 3200, 0.8);
  const peak = new Biquad(sr, 'peak', 2200, 1.2, 5);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const f = 178 + 70 * Math.exp(-t / 0.009);
    ph += (2 * Math.PI * f) / sr;
    const body = Math.sin(ph) * Math.exp(-t / 0.055) * 0.85 + Math.sin(ph * 1.86) * Math.exp(-t / 0.035) * 0.35;
    const w = rnd() * 2 - 1;
    const nz = peak.run(lp.run(hp.run(w))) * (Math.exp(-t / 0.12) * 0.9 + Math.exp(-t / 0.3) * 0.12);
    const crack = crackHp.run(w) * Math.exp(-t / 0.011) * 0.8;
    const atk = t < 0.0008 ? t / 0.0008 : 1;
    d[i] = tanh(1.6 * (body + nz + crack) * atk) / tanh(1.6);
  }
  return finish([d], sr, 0.95);
}

/** closed (open=false) or open hi-hat */
export function renderHat(sr: number, open: boolean): Float32Array[] {
  const [d] = make(sr, open ? 0.45 : 0.08);
  const rnd = mulberry(open ? 41 : 37);
  const bp = new Biquad(sr, 'bp', 10000, 0.9);
  const hp = new Biquad(sr, 'hp', 7000, 0.7);
  const ph = METAL_F.map(() => rnd());
  const tau = open ? 0.13 : 0.016;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    let m = 0;
    for (let k = 0; k < METAL_F.length; k++) {
      ph[k] += (METAL_F[k] * 1.6) / sr;
      m += ph[k] % 1 < 0.5 ? 1 : -1;
    }
    const x = m / 6 + (rnd() * 2 - 1) * 0.6;
    const atk = t < 0.0006 ? t / 0.0006 : 1;
    d[i] = hp.run(bp.run(x)) * Math.exp(-t / tau) * atk;
  }
  return finish([d], sr, 0.9);
}

export function renderRide(sr: number): Float32Array[] {
  const [d] = make(sr, 1.1);
  const rnd = mulberry(53);
  const bp = new Biquad(sr, 'bp', 5200, 0.8);
  const ph = METAL_F.map(() => rnd());
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    let m = 0;
    for (let k = 0; k < METAL_F.length; k++) {
      ph[k] += (METAL_F[k] * 2.3) / sr;
      m += ph[k] % 1 < 0.5 ? 1 : -1;
    }
    const wash = bp.run(m / 6 + (rnd() * 2 - 1) * 0.3) * Math.exp(-t / 0.4);
    const bell =
      (Math.sin(2 * Math.PI * 2380 * t) * 0.5 + Math.sin(2 * Math.PI * 3570 * t) * 0.3 + Math.sin(2 * Math.PI * 5130 * t) * 0.2) *
      Math.exp(-t / 0.28);
    const atk = t < 0.0008 ? t / 0.0008 : 1;
    d[i] = (wash + bell * 0.35) * atk;
  }
  return finish([d], sr, 0.85);
}

/** stereo crash; china=true gives a trashy, distorted china */
export function renderCrash(sr: number, china: boolean): Float32Array[] {
  const chs = make(sr, china ? 1.3 : 2.4, 2);
  for (let c = 0; c < 2; c++) {
    const d = chs[c];
    const rnd = mulberry((china ? 71 : 61) + c * 7);
    const hp = new Biquad(sr, 'hp', china ? 1400 : 3600, 0.7);
    const bp = new Biquad(sr, 'bp', china ? 2700 : 6500, china ? 0.8 : 0.5);
    const lp = new Biquad(sr, 'lp', 13000, 0.7);
    const ph = METAL_F.map(() => rnd());
    for (let i = 0; i < d.length; i++) {
      const t = i / sr;
      let m = 0;
      for (let k = 0; k < METAL_F.length; k++) {
        ph[k] += (METAL_F[k] * (china ? 1.3 : 2.9) * (1 + c * 0.013)) / sr;
        m += ph[k] % 1 < 0.5 ? 1 : -1;
      }
      const x = (rnd() * 2 - 1) * 0.8 + (m / 6) * 0.5;
      let y = lp.run(hp.run(x) * 0.7 + bp.run(x) * 0.6);
      const atk = t < 0.002 ? t / 0.002 : 1;
      const env = china ? Math.exp(-t / 0.28) + 0.15 * Math.exp(-t / 0.7) : Math.exp(-t / 0.5) + 0.3 * Math.exp(-t / 1.3);
      y *= env * atk;
      d[i] = china ? tanh(3 * y) : y;
    }
  }
  return finish(chs, sr, 0.9);
}

/** tom at ~100Hz; play at different playbackRates for hi/mid/floor */
export function renderTom(sr: number): Float32Array[] {
  const [d] = make(sr, 0.55);
  const rnd = mulberry(83);
  const lp = new Biquad(sr, 'lp', 2200, 0.7);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const f = 98 + 70 * Math.exp(-t / 0.03);
    ph += (2 * Math.PI * f) / sr;
    const body = Math.sin(ph) * Math.exp(-t / 0.2) + Math.sin(ph * 1.5) * Math.exp(-t / 0.07) * 0.25;
    const hit = lp.run(rnd() * 2 - 1) * Math.exp(-t / 0.012) * 0.45;
    const atk = t < 0.001 ? t / 0.001 : 1;
    d[i] = tanh(1.8 * (body + hit) * atk) / tanh(1.8);
  }
  return finish([d], sr, 0.92);
}

/** stereo cinematic impact: sub boom + blast + click */
export function renderImpact(sr: number): Float32Array[] {
  const chs = make(sr, 2.0, 2);
  for (let c = 0; c < 2; c++) {
    const d = chs[c];
    const rnd = mulberry(97 + c * 13);
    const lp = new Biquad(sr, 'lp', 1800, 0.7);
    const hp = new Biquad(sr, 'hp', 2500, 0.7);
    let ph = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / sr;
      const f = 29 + 95 * Math.exp(-t / 0.07);
      ph += (2 * Math.PI * f) / sr;
      if (i % 64 === 0) lp.set('lp', 300 + 2600 * Math.exp(-t / 0.12), 0.8);
      const boom = Math.sin(ph) * (Math.exp(-t / 0.65) * (t < 0.002 ? t / 0.002 : 1));
      const w = rnd() * 2 - 1;
      const blast = lp.run(w) * Math.exp(-t / 0.35) * 0.9;
      const click = hp.run(w) * Math.exp(-t / 0.006) * 0.7;
      d[i] = tanh(2.2 * (boom + blast + click)) / tanh(2.2);
    }
  }
  return finish(chs, sr, 0.95);
}

export function renderSubDrop(sr: number): Float32Array[] {
  const [d] = make(sr, 2.4);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const f = 23 + 75 * Math.exp(-t / 0.45);
    ph += (2 * Math.PI * f) / sr;
    const atk = t < 0.01 ? t / 0.01 : 1;
    const x = Math.sin(ph) * Math.exp(-t / 0.95) * atk;
    d[i] = tanh(1.8 * x) / tanh(1.8); // harmonics keep it audible on small speakers
  }
  return finish([d], sr, 0.95);
}

/** FOUNDRY anvil clang */
export function renderClang(sr: number): Float32Array[] {
  const [d] = make(sr, 1.0);
  const rnd = mulberry(101);
  const bp = new Biquad(sr, 'bp', 3200, 2);
  const parts = [
    [1, 0.6, 1],
    [2.76, 0.35, 0.55],
    [5.4, 0.2, 0.32],
    [8.93, 0.12, 0.2],
    [13.3, 0.07, 0.12],
  ];
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    let x = 0;
    for (const [r, tau, g] of parts) x += Math.sin(2 * Math.PI * 520 * r * t) * Math.exp(-t / tau) * g;
    x += bp.run(rnd() * 2 - 1) * Math.exp(-t / 0.015) * 1.2;
    d[i] = x;
  }
  return finish([d], sr, 0.9);
}

export function renderShaker(sr: number): Float32Array[] {
  const [d] = make(sr, 0.09);
  const rnd = mulberry(107);
  const bp = new Biquad(sr, 'bp', 6800, 1.2);
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const env = t < 0.008 ? t / 0.008 : Math.exp(-(t - 0.008) / 0.025);
    d[i] = bp.run(rnd() * 2 - 1) * env;
  }
  return finish([d], sr, 0.9);
}

/** FM bell at 880Hz: arps / music box (play with playbackRate) */
export function renderBell(sr: number): Float32Array[] {
  const [d] = make(sr, 1.6);
  const f = 880;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    const I = 1.8 * Math.exp(-t / 0.25);
    const x = Math.sin(2 * Math.PI * f * t + I * Math.sin(2 * Math.PI * f * 3.5 * t));
    const h = Math.sin(2 * Math.PI * f * 3 * t) * 0.18 * Math.exp(-t / 0.15);
    const atk = t < 0.002 ? t / 0.002 : 1;
    d[i] = (x * Math.exp(-t / 0.55) + h) * atk;
  }
  return finish([d], sr, 0.9);
}

// ---------------------------------------------------------- pitched one-shots

/**
 * Palm-muted guitar chug (pre-amp: the amp chain distorts it).
 * side 0/1 = left/right double-track (different detune + phase).
 */
export function renderChug(sr: number, midi: number, side: number): Float32Array[] {
  const [d] = make(sr, 0.2);
  const f = mtof(midi);
  const rnd = mulberry(midi * 31 + side * 7 + 3);
  const det = side ? [1.0029, 0.9982, 2.003] : [0.9975, 1.0018, 1.998];
  const s1 = new Saw(sr, f * det[0], rnd());
  const s2 = new Saw(sr, f * det[1], rnd());
  const s3 = new Saw(sr, f * det[2], rnd());
  const lp = new Biquad(sr, 'lp', 1800, 1.3);
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    if (i % 32 === 0) lp.set('lp', 260 + 1900 * Math.exp(-t / 0.022), 1.4);
    const x = s1.next() * 0.45 + s2.next() * 0.45 + s3.next() * 0.18;
    const env = (t < 0.0015 ? t / 0.0015 : 1) * (Math.exp(-t / 0.075) * 0.85 + 0.15 * Math.exp(-t / 0.02));
    d[i] = lp.run(x) * env;
  }
  return finish([d], sr, 0.75);
}

/** FM growl bass chug */
export function renderBassChug(sr: number, midi: number): Float32Array[] {
  const [d] = make(sr, 0.26);
  const f = mtof(midi);
  const lp = new Biquad(sr, 'lp', 1500, 1.1);
  let pc = 0;
  let pm = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    pc += (2 * Math.PI * f) / sr;
    pm += (2 * Math.PI * f * 1.0) / sr;
    if (i % 32 === 0) lp.set('lp', 170 + 1700 * Math.exp(-t / 0.03), 1.2);
    const I = 1.4 + 2.6 * Math.exp(-t / 0.04);
    const growl = Math.sin(pc + I * Math.sin(pm));
    const sub = Math.sin(pc) * 0.75;
    const env = (t < 0.002 ? t / 0.002 : 1) * Math.exp(-t / 0.11);
    d[i] = tanh(1.7 * (lp.run(growl) + sub) * env) / tanh(1.7);
  }
  return finish([d], sr, 0.85);
}

/** riser: filtered noise sweep with pitch-rising saws (stereo), length sec */
export function renderRiser(sr: number, sec: number): Float32Array[] {
  const chs = make(sr, sec, 2);
  for (let c = 0; c < 2; c++) {
    const d = chs[c];
    const rnd = mulberry(131 + c);
    const bp = new Biquad(sr, 'bp', 400, 1.4);
    const s1 = new Saw(sr, 110, rnd());
    const s2 = new Saw(sr, 165, rnd());
    const lp = new Biquad(sr, 'lp', 400, 2);
    for (let i = 0; i < d.length; i++) {
      const t = i / sr;
      const k = t / sec;
      if (i % 64 === 0) {
        bp.set('bp', 300 * Math.pow(30, k), 1.6);
        lp.set('lp', 300 * Math.pow(20, k), 3);
        s1.freq(110 * Math.pow(4, k) * (c ? 1.004 : 0.996));
        s2.freq(165 * Math.pow(4, k) * (c ? 0.997 : 1.003));
      }
      const env = Math.pow(k, 2.2);
      const x = bp.run(rnd() * 2 - 1) * 1.6 + lp.run(s1.next() + s2.next()) * 0.35;
      d[i] = x * env;
    }
  }
  return finish(chs, sr, 0.9);
}

export function reverse(chs: Float32Array[]): Float32Array[] {
  return chs.map((d) => {
    const r = new Float32Array(d.length);
    for (let i = 0; i < d.length; i++) r[i] = d[d.length - 1 - i];
    // ramp the very end (the original attack) to avoid a click on cut
    const n = Math.min(64, r.length);
    for (let i = 0; i < n; i++) r[r.length - 1 - i] *= i / n;
    return r;
  });
}
