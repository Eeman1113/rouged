/**
 * ROUGED procedural sound effects. Every sound is synthesized at call time from
 * oscillators, the shared noise buffer, filters and waveshapers.
 *
 * All functions are fire-and-forget, never throw, and are silently skipped while
 * the AudioContext is not running (so nothing piles up and blasts on unlock).
 */
import { audio, V3 } from './engine';

export interface LoopHandle {
  set(v: number): void;
  stop(): void;
}

// ====================================================================== utils

const NOOP_HANDLE: LoopHandle = { set() {}, stop() {} };
const MAX_VOICES = 96;
let activeVoices = 0;

const semi = (n: number): number => Math.pow(2, n / 12);
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const jit = (amt: number): number => 1 + (Math.random() * 2 - 1) * amt;
const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
const mod = (n: number, m: number): number => ((Math.floor(n) % m) + m) % m;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function running(): boolean {
  try {
    return audio.ctx.state === 'running';
  } catch {
    return false;
  }
}

/** true when the mixer is saturated; low-priority sounds should bail. */
function busy(): boolean {
  return activeVoices > MAX_VOICES * 0.75;
}

const lastFire = new Map<string, number>();
function throttle(key: string, ms: number): boolean {
  const t = now();
  const prev = lastFire.get(key) ?? -1e9;
  if (t - prev < ms) return true;
  lastFire.set(key, t);
  return false;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const curveCache = new Map<number, Float32Array<ArrayBuffer>>();
/** Soft-clip / overdrive curve. amount ~1 (warm) .. 100 (fuzz). */
function driveCurve(amount: number): Float32Array<ArrayBuffer> {
  const key = Math.round(amount);
  const cached = curveCache.get(key);
  if (cached) return cached;
  const n = 1024;
  const c = new Float32Array(n);
  const k = Math.max(0.01, key);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  curveCache.set(key, c);
  return c;
}

let crushCurve: Float32Array<ArrayBuffer> | null = null;
/** Hard quantizing curve: cheap "bitcrush" for digital glitches. */
function bitCurve(): Float32Array<ArrayBuffer> {
  if (crushCurve) return crushCurve;
  const n = 1024;
  const c = new Float32Array(n);
  const steps = 6;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.round(x * steps) / steps;
  }
  crushCurve = c;
  return c;
}

// ====================================================================== Voice

interface ToneOpts {
  type?: OscillatorType;
  f: number;
  f2?: number; // sweep target
  sweep?: number; // sweep duration (default: whole envelope)
  t?: number; // start offset (s) relative to voice start
  a?: number; // attack
  h?: number; // hold
  d: number; // decay
  g: number; // peak gain
  detune?: number; // cents
  vib?: { rate: number; depth: number }; // depth in Hz
  steps?: number[]; // stepped pitch multipliers (sample & hold), each stepDur long
  stepDur?: number;
  dest?: AudioNode;
}

interface NoiseOpts {
  t?: number;
  a?: number;
  h?: number;
  d: number;
  g: number;
  type?: BiquadFilterType;
  f?: number;
  f2?: number;
  q?: number;
  rate?: number;
  dest?: AudioNode;
}

/**
 * One sound event. Owns all nodes it creates; when every source has ended, the
 * whole sub-graph (including the engine out() chain) is disconnected.
 */
class Voice {
  readonly ctx: AudioContext;
  readonly t: number;
  readonly out: GainNode;
  private nodes: AudioNode[] = [];
  private pending = 0;
  private disposed = false;

  constructor(pos?: V3, vol = 1, reverb = 0.12, bus?: AudioNode) {
    this.ctx = audio.ctx;
    this.t = this.ctx.currentTime + 0.004;
    this.out = audio.out(pos, vol, reverb, bus);
    activeVoices++;
  }

  /** world-quiet sounds can be skipped entirely */
  get audible(): boolean {
    return this.out.gain.value > 0.003;
  }

  track<T extends AudioNode>(n: T): T {
    this.nodes.push(n);
    return n;
  }

  src<T extends AudioScheduledSourceNode>(n: T, start: number, stop?: number): T {
    this.nodes.push(n);
    this.pending++;
    n.onended = () => {
      this.pending--;
      if (this.pending <= 0) this.dispose();
    };
    n.start(start);
    if (stop !== undefined) n.stop(stop);
    return n;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    activeVoices--;
    for (const n of this.nodes) {
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
    this.nodes.length = 0;
    audio.release(this.out);
  }

  /** if nothing was started, clean up immediately */
  finish(): void {
    if (this.pending <= 0) this.dispose();
  }

  /** gain node into a node or (for LFO modulation) an AudioParam */
  gain(v = 1, dest?: AudioNode | AudioParam): GainNode {
    const g = this.track(this.ctx.createGain());
    g.gain.value = v;
    if (dest instanceof AudioParam) g.connect(dest);
    else g.connect(dest ?? this.out);
    return g;
  }

  filter(type: BiquadFilterType, freq: number, q = 0.8, dest?: AudioNode): BiquadFilterNode {
    const f = this.track(this.ctx.createBiquadFilter());
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    f.connect(dest ?? this.out);
    return f;
  }

  drive(amount: number, dest?: AudioNode): WaveShaperNode {
    const w = this.track(this.ctx.createWaveShaper());
    w.curve = driveCurve(amount);
    w.oversample = '2x';
    w.connect(dest ?? this.out);
    return w;
  }

  /** stereo panner feeding dest (default: voice output) for width */
  pan(p: number, dest?: AudioNode): StereoPannerNode {
    const n = this.track(this.ctx.createStereoPanner());
    n.pan.value = clamp(p, -1, 1);
    n.connect(dest ?? this.out);
    return n;
  }

  /** send the whole voice into the short stereo room (slapback / width) */
  room(amt: number): void {
    if (amt <= 0) return;
    try {
      const g = this.track(this.ctx.createGain());
      g.gain.value = amt;
      this.out.connect(g);
      g.connect(audio.roomSend);
    } catch {
      /* ignore */
    }
  }

  crush(dest?: AudioNode): WaveShaperNode {
    const w = this.track(this.ctx.createWaveShaper());
    w.curve = bitCurve();
    w.connect(dest ?? this.out);
    return w;
  }

  /** percussive envelope gain node feeding dest */
  env(at: number, a: number, h: number, d: number, peak: number, dest?: AudioNode): GainNode {
    const g = this.track(this.ctx.createGain());
    const p = g.gain;
    p.setValueAtTime(0, at);
    p.linearRampToValueAtTime(peak, at + Math.max(0.0005, a));
    if (h > 0) p.setValueAtTime(peak, at + a + h);
    p.exponentialRampToValueAtTime(0.0001, at + a + h + Math.max(0.003, d));
    g.connect(dest ?? this.out);
    return g;
  }

  tone(o: ToneOpts): OscillatorNode {
    const at = this.t + (o.t ?? 0);
    const a = o.a ?? 0.002;
    const h = o.h ?? 0;
    const end = at + a + h + o.d;
    const osc = this.ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    const fr = osc.frequency;
    fr.setValueAtTime(o.f, at);
    if (o.steps && o.steps.length) {
      const sd = o.stepDur ?? 0.03;
      for (let i = 0; i < o.steps.length; i++) fr.setValueAtTime(Math.max(1, o.f * o.steps[i]), at + i * sd);
    } else if (o.f2 !== undefined) {
      fr.exponentialRampToValueAtTime(Math.max(1, o.f2), at + (o.sweep ?? a + h + o.d));
    }
    if (o.detune) osc.detune.value = o.detune;
    if (o.vib) {
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = o.vib.rate;
      const lg = this.track(this.ctx.createGain());
      lg.gain.value = o.vib.depth;
      lfo.connect(lg);
      lg.connect(fr);
      this.src(lfo, at, end + 0.02);
    }
    osc.connect(this.env(at, a, h, o.d, o.g, o.dest));
    return this.src(osc, at, end + 0.02);
  }

  noise(o: NoiseOpts): AudioBufferSourceNode {
    const at = this.t + (o.t ?? 0);
    const a = o.a ?? 0.001;
    const h = o.h ?? 0;
    const end = at + a + h + o.d;
    const s = this.ctx.createBufferSource();
    s.buffer = audio.noiseBuffer;
    s.loop = true;
    s.playbackRate.value = o.rate ?? 1;
    const e = this.env(at, a, h, o.d, o.g, o.dest);
    if (o.type) {
      const f = this.filter(o.type, o.f ?? 1000, o.q ?? 0.8, e);
      if (o.f2 !== undefined) {
        f.frequency.setValueAtTime(o.f ?? 1000, at);
        f.frequency.exponentialRampToValueAtTime(Math.max(10, o.f2), end);
      }
      s.connect(f);
    } else {
      s.connect(e);
    }
    s.start(at, Math.random() * 1.5);
    // src() would call start again; register manually
    this.registerStarted(s, end + 0.02);
    return s;
  }

  private registerStarted(s: AudioScheduledSourceNode, stop: number): void {
    this.nodes.push(s);
    this.pending++;
    s.onended = () => {
      this.pending--;
      if (this.pending <= 0) this.dispose();
    };
    s.stop(stop);
  }

  /** un-enveloped looping noise source (for loops) */
  noiseLoop(dest: AudioNode, rate = 1): AudioBufferSourceNode {
    const s = this.ctx.createBufferSource();
    s.buffer = audio.noiseBuffer;
    s.loop = true;
    s.playbackRate.value = rate;
    s.connect(dest);
    this.nodes.push(s);
    this.pending++;
    s.onended = () => {
      this.pending--;
      if (this.pending <= 0) this.dispose();
    };
    s.start(this.t, Math.random() * 1.5);
    return s;
  }

  /** un-enveloped oscillator (for loops) */
  osc(type: OscillatorType, f: number, dest: AudioNode, detune = 0): OscillatorNode {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(dest);
    return this.src(o, this.t);
  }
}

/** Run fn safely; skip when the context is not running. */
function play(fn: () => void): void {
  if (!running()) return;
  try {
    fn();
  } catch {
    /* never throw from audio */
  }
}

function playLoop(fn: () => LoopHandle): LoopHandle {
  if (!running()) return NOOP_HANDLE;
  try {
    return fn();
  } catch {
    return NOOP_HANDLE;
  }
}

/** Build a loop handle that fades `master` and stops all sources of the voice. */
function loopHandle(v: Voice, master: GainNode, level: number, onSet: (x: number) => void, fade = 0.08): LoopHandle {
  let stopped = false;
  master.gain.setValueAtTime(0, v.t);
  master.gain.linearRampToValueAtTime(level, v.t + 0.05);
  return {
    set(x: number) {
      if (stopped) return;
      try {
        onSet(clamp(x, 0, 1));
      } catch {
        /* ignore */
      }
    },
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        const t = v.ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0, t + fade);
        stopVoiceSources(v, t + fade + 0.02);
      } catch {
        v.dispose();
      }
    },
  };
}

// track loop sources per voice so loopHandle can stop them
const loopSources = new WeakMap<Voice, AudioScheduledSourceNode[]>();
function loopSrc<T extends AudioScheduledSourceNode>(v: Voice, s: T): T {
  let arr = loopSources.get(v);
  if (!arr) {
    arr = [];
    loopSources.set(v, arr);
  }
  arr.push(s);
  return s;
}
function stopVoiceSources(v: Voice, at: number): void {
  const arr = loopSources.get(v);
  if (!arr || !arr.length) {
    v.dispose();
    return;
  }
  for (const s of arr) {
    try {
      s.stop(at);
    } catch {
      /* already stopped */
    }
  }
}

// ============================================================ shared layers

/** inharmonic metal partials */
function metal(v: Voice, f: number, t: number, d: number, g: number, ratios: readonly number[] = [1, 2.76, 5.4, 8.93], dest?: AudioNode): void {
  ratios.forEach((r, i) => {
    v.tone({ type: 'sine', f: f * r * jit(0.01), t, d: d / (1 + i * 0.6), g: g / (1 + i * 0.8), dest });
  });
}

/** short sub-bass kick/thump */
function thump(v: Voice, f1: number, f2: number, d: number, g: number, t = 0, dest?: AudioNode): void {
  v.tone({ type: 'sine', f: f1, f2, sweep: d * 0.8, t, a: 0.001, d, g, dest });
}

/** transient click */
function click(v: Voice, g: number, t = 0, hp = 3500, d = 0.006): void {
  v.noise({ t, d, g, type: 'highpass', f: hp, q: 0.7 });
}

interface FormantOpts {
  f0: number[]; // pitch per syllable
  vowels: [number, number][]; // formant (F1,F2) per syllable
  syl: number; // syllable length
  g: number;
  drive?: number;
  ring?: number; // ring-mod frequency (robotic)
  type?: OscillatorType;
  voices?: number; // detuned stack
  t?: number;
}

/** Robotic formant voice: bandpassed saw stack with per-syllable pitch & vowel. */
function formantVoice(v: Voice, o: FormantOpts): void {
  const at = v.t + (o.t ?? 0);
  const n = Math.max(o.f0.length, o.vowels.length);
  const dur = n * o.syl;
  // amplitude envelope with syllable gating
  const amp = v.gain(0);
  const ag = amp.gain;
  ag.setValueAtTime(0, at);
  for (let i = 0; i < n; i++) {
    const s = at + i * o.syl;
    ag.linearRampToValueAtTime(o.g, s + 0.012);
    ag.linearRampToValueAtTime(o.g * 0.55, s + o.syl * 0.85);
  }
  ag.linearRampToValueAtTime(0, at + dur + 0.04);

  let sink: AudioNode = amp;
  if (o.ring) {
    const rm = v.gain(0.5, amp);
    const lfo = v.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = o.ring;
    const lg = v.track(v.ctx.createGain());
    lg.gain.value = 0.5;
    lfo.connect(lg);
    lg.connect(rm.gain);
    v.src(lfo, at, at + dur + 0.1);
    sink = rm;
  }
  const f1 = v.filter('bandpass', o.vowels[0][0], 6, sink);
  const f2 = v.filter('bandpass', o.vowels[0][1], 8, sink);
  const low = v.filter('lowpass', 500, 0.7, v.gain(0.35, sink));
  for (let i = 0; i < n; i++) {
    const vw = o.vowels[Math.min(i, o.vowels.length - 1)];
    const s = at + i * o.syl;
    f1.frequency.linearRampToValueAtTime(vw[0], s + 0.03);
    f2.frequency.linearRampToValueAtTime(vw[1], s + 0.03);
  }
  const pre = v.drive(o.drive ?? 8, f1);
  pre.connect(f2);
  pre.connect(low);
  const count = o.voices ?? 1;
  for (let k = 0; k < count; k++) {
    const osc = v.ctx.createOscillator();
    osc.type = o.type ?? 'sawtooth';
    osc.detune.value = count > 1 ? (k - (count - 1) / 2) * 14 : 0;
    for (let i = 0; i < n; i++) {
      const f = o.f0[Math.min(i, o.f0.length - 1)];
      const s = at + i * o.syl;
      if (i === 0) osc.frequency.setValueAtTime(f, s);
      else osc.frequency.exponentialRampToValueAtTime(f, s + 0.025);
    }
    osc.connect(pre);
    v.src(osc, at, at + dur + 0.1);
  }
}

const VOWELS: [number, number][] = [
  [730, 1090], // a
  [530, 1840], // e
  [300, 2200], // i
  [570, 840], // o
  [440, 1020], // u
  [660, 1700], // ae
];

/** chord helper: saw/triangle stack through optional filter */
function chord(v: Voice, freqs: number[], o: { t?: number; a?: number; h?: number; d: number; g: number; type?: OscillatorType; detune?: number; dest?: AudioNode }): void {
  const each = o.g / Math.max(1, freqs.length);
  for (const f of freqs) {
    v.tone({ type: o.type ?? 'sawtooth', f, t: o.t, a: o.a ?? 0.005, h: o.h, d: o.d, g: each, detune: -(o.detune ?? 0), dest: o.dest });
    if (o.detune) v.tone({ type: o.type ?? 'sawtooth', f, t: o.t, a: o.a ?? 0.005, h: o.h, d: o.d, g: each * 0.8, detune: o.detune, dest: o.dest });
  }
}

const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

/**
 * Synth-brass stab: detuned saws with a pitch scoop, through a lowpass whose
 * envelope snaps open (the "blat") then settles, with a touch of grit.
 */
function brass(v: Voice, midis: number[], t: number, h: number, d: number, g: number, bright: number, dest?: AudioNode): void {
  const at = v.t + t;
  const lp = v.filter('lowpass', 280, 1.3, dest);
  lp.frequency.setValueAtTime(280, at);
  lp.frequency.exponentialRampToValueAtTime(bright, at + 0.06);
  lp.frequency.exponentialRampToValueAtTime(Math.max(300, bright * 0.35), at + 0.06 + h + d);
  const dz = v.drive(4, lp);
  const each = g / Math.max(1, midis.length);
  for (const m of midis) {
    for (const det of [-9, 9]) {
      v.tone({ type: 'sawtooth', f: hz(m) * 0.97, f2: hz(m), sweep: 0.05, t, a: 0.012, h, d, g: each * 0.55, detune: det, dest: dz });
    }
  }
}

function heartbeat(muffled: boolean): void {
  const v = new Voice(undefined, muffled ? 0.75 : 1, 0.02);
  const dest = v.filter('lowpass', muffled ? 160 : 260, 0.7);
  thump(v, 75, 38, 0.14, 0.9, 0, dest);
  thump(v, 68, 36, 0.18, 0.65, 0.17, dest);
  v.noise({ d: 0.03, g: 0.08, type: 'lowpass', f: 400 });
}

function clack(v: Voice, t: number, f: number, g: number): void {
  v.noise({ t, d: 0.025, g, type: 'bandpass', f: f * 2.5, q: 2 });
  v.tone({ type: 'square', f, f2: f * 0.6, t, d: 0.018, g: g * 0.25, dest: v.filter('lowpass', 3000) });
  metal(v, f * 1.6, t, 0.06, g * 0.12, [1, 2.4]);
}

// ======================================================================= sfx

export const sfx = {
  // ----------------------------------------------------------- weapons

  pulseShot(): void {
    play(() => {
      const p = jit(0.04);
      const v = new Voice(undefined, 0.8, 0.08);
      v.room(0.22);
      // 1. transient: click + bright blip
      click(v, 0.75, 0, 3000, 0.008);
      v.tone({ type: 'square', f: 3200 * p, f2: 1400, d: 0.01, g: 0.1, dest: v.filter('highpass', 1500) });
      // 2. crack: driven band of noise
      v.noise({ d: 0.04, g: 0.45, dest: v.drive(18, v.filter('bandpass', 2600 * p, 0.9)) });
      // 3. laser body: falling saw + square through grit
      const body = v.drive(10, v.filter('lowpass', 6500, 1.2));
      v.tone({ type: 'sawtooth', f: 1900 * p, f2: 210, sweep: 0.075, d: 0.085, g: 0.24, dest: body });
      v.tone({ type: 'square', f: 950 * p, f2: 105, sweep: 0.06, d: 0.07, g: 0.09, dest: body });
      // 4. zappy stereo tail (fast-vibrato triangles, panned apart)
      const z = pick([0.94, 1, 1.06]);
      v.tone({ type: 'triangle', f: 2600 * p * z, f2: 700, sweep: 0.14, t: 0.008, d: 0.15, g: 0.06, vib: { rate: 67, depth: 380 }, dest: v.pan(-0.55) });
      v.tone({ type: 'triangle', f: 2750 * p * z, f2: 740, sweep: 0.14, t: 0.011, d: 0.15, g: 0.06, vib: { rate: 73, depth: 400 }, dest: v.pan(0.55) });
      // 5. sub thump
      thump(v, 165 * p, 46, 0.08, 0.72);
      // 6. mechanical bolt tick
      v.noise({ t: 0.045, d: 0.012, g: 0.06, type: 'bandpass', f: 5200, q: 4 });
    });
  },

  breacherShot(): void {
    play(() => {
      const v = new Voice(undefined, 1, 0.35);
      v.room(0.5);
      const p = jit(0.03);
      // doubled transient (two barrels a hair apart = thick, cannon-like onset)
      for (const off of [0, 0.016]) click(v, 0.85, off, 1500, 0.014);
      v.noise({ d: 0.06, g: 0.55, dest: v.drive(30, v.filter('bandpass', 1800, 0.7)) });
      // blast body, stereo
      v.noise({ d: 0.5, g: 0.5, type: 'lowpass', f: 6000 * p, f2: 240, q: 0.8, dest: v.pan(-0.35) });
      v.noise({ t: 0.012, d: 0.55, g: 0.5, type: 'lowpass', f: 5200 * p, f2: 200, q: 0.8, dest: v.pan(0.35) });
      v.noise({ d: 0.14, g: 0.35, type: 'bandpass', f: 1100, q: 0.8 });
      // cannon sub drop + chest punch
      v.tone({ type: 'sine', f: 125 * p, f2: 30, sweep: 0.4, a: 0.001, d: 0.5, g: 0.95, dest: v.drive(4) });
      v.tone({ type: 'triangle', f: 70 * p, f2: 28, sweep: 0.5, d: 0.6, g: 0.28 });
      v.tone({ type: 'sine', f: 240 * p, f2: 70, sweep: 0.08, d: 0.12, g: 0.32 });
      // rumble tail
      v.noise({ t: 0.05, a: 0.04, d: 1.1, g: 0.16, type: 'lowpass', f: 700, f2: 90, q: 0.7 });
      // barrel ring
      metal(v, 820 * p, 0.005, 0.35, 0.045, [1, 2.76, 5.4]);
      audio.duck(0.5, 0.28);
    });
  },

  breacherReload(): void {
    play(() => {
      const v = new Voice(undefined, 0.65, 0.1);
      v.room(0.25);
      // break open
      clack(v, 0, 760, 0.55);
      v.noise({ t: 0.03, d: 0.06, g: 0.12, type: 'bandpass', f: 3500, f2: 1800, q: 2 });
      // two spent shells clatter on the floor (bouncing brass tinks)
      for (let s = 0; s < 2; s++) {
        const dest = v.pan(s ? 0.5 : -0.4);
        let t = 0.2 + s * 0.05 + rnd(0, 0.03);
        let gap = rnd(0.07, 0.1);
        let g = 0.15;
        const f = rnd(2300, 3000);
        for (let b = 0; b < 4; b++) {
          metal(v, f * jit(0.02), t, 0.12, g, [1, 1.58, 2.31], dest);
          v.noise({ t, d: 0.006, g: g * 0.6, type: 'highpass', f: 4000, dest });
          t += gap;
          gap *= 0.62;
          g *= 0.55;
        }
      }
      // slam shut
      clack(v, 0.38, 560, 0.7);
      thump(v, 140, 60, 0.06, 0.35, 0.38);
    });
  },

  lanceCharge(): LoopHandle {
    return playLoop(() => {
      const v = new Voice(undefined, 1, 0.15);
      const master = v.gain(0);
      const lp = v.filter('lowpass', 500, 5, master);
      const dz = v.drive(8, lp);
      const o1 = loopSrc(v, v.osc('sawtooth', 70, dz, -8));
      const o2 = loopSrc(v, v.osc('sawtooth', 70, dz, 8));
      const sub = loopSrc(v, v.osc('sine', 35, v.gain(0.5, master)));
      // harmonics (stereo)
      const h3g = v.gain(0.04, v.pan(-0.4, master));
      const h3 = loopSrc(v, v.osc('sine', 210, h3g));
      const h5g = v.gain(0, v.pan(0.4, master));
      const h5 = loopSrc(v, v.osc('sine', 350, h5g));
      // whine with tremolo
      const trem = v.gain(0.03, master);
      const tremDepth = v.gain(0.02, trem.gain);
      const hi = loopSrc(v, v.osc('sine', 560, trem));
      const lfo = loopSrc(v, v.osc('sine', 6, tremDepth));
      // instability (two detuned LFOs wobbling the pitch near full charge)
      const wob = v.gain(0, o1.frequency);
      wob.connect(o2.frequency);
      const wobHi = v.gain(0, hi.frequency);
      const lA = loopSrc(v, v.osc('sine', 9, wob));
      const lB = loopSrc(v, v.osc('sine', 5.3, wob));
      lA.connect(wobHi);
      // crackle: band of noise gated by a square LFO
      const crk = v.gain(0, master);
      loopSrc(v, v.noiseLoop(v.filter('bandpass', 3800, 1.4, crk)));
      const gate = v.gain(0, crk.gain);
      const gl = loopSrc(v, v.osc('square', 31, gate));
      let last = -1;
      const apply = (x: number): void => {
        if (Math.abs(x - last) < 0.008) return;
        last = x;
        const t = v.ctx.currentTime;
        const tc = 0.05;
        const f = 70 * Math.pow(2, x * 2.6);
        o1.frequency.setTargetAtTime(f, t, tc);
        o2.frequency.setTargetAtTime(f * 1.006, t, tc);
        sub.frequency.setTargetAtTime(f / 2, t, tc);
        h3.frequency.setTargetAtTime(f * 3, t, tc);
        h5.frequency.setTargetAtTime(f * 5, t, tc);
        hi.frequency.setTargetAtTime(f * 8, t, tc);
        h3g.gain.setTargetAtTime(0.04 + x * 0.09, t, tc);
        h5g.gain.setTargetAtTime(x * x * 0.06, t, tc);
        lp.frequency.setTargetAtTime(450 + x * x * 6000, t, tc);
        lfo.frequency.setTargetAtTime(6 + x * 26, t, tc);
        trem.gain.setTargetAtTime(0.03 + x * 0.1, t, tc);
        tremDepth.gain.setTargetAtTime((0.03 + x * 0.1) * 0.8, t, tc);
        const x3 = x * x * x;
        wob.gain.setTargetAtTime(x3 * f * 0.05, t, tc);
        wobHi.gain.setTargetAtTime(x3 * f * 8 * 0.02, t, tc);
        lA.frequency.setTargetAtTime(9 + x * 14, t, tc);
        lB.frequency.setTargetAtTime(5.3 + x * 9, t, tc);
        crk.gain.setTargetAtTime(x * x * 0.12, t, tc);
        gate.gain.setTargetAtTime(x * x * 0.12, t, tc);
        gl.frequency.setTargetAtTime(25 + x * 55, t, tc);
        master.gain.setTargetAtTime(0.07 + x * 0.17, t, tc);
      };
      const h = loopHandle(v, master, 0.07, apply);
      apply(0);
      return h;
    });
  },

  lanceFire(power: number): void {
    play(() => {
      const pw = clamp(Number.isFinite(power) ? power : 0, 0, 1);
      const v = new Voice(undefined, 0.8 + pw * 0.2, 0.25 + pw * 0.35);
      v.room(0.35);
      click(v, 0.9, 0, 2000, 0.012);
      v.noise({ d: 0.035, g: 0.5, type: 'highpass', f: 2500, q: 0.7, dest: v.drive(20) });
      // beam: detuned stereo pair of falling saws + squares
      const dzL = v.drive(12 + pw * 30, v.filter('lowpass', 7500, 1, v.pan(-0.5)));
      const dzR = v.drive(12 + pw * 30, v.filter('lowpass', 7500, 1, v.pan(0.5)));
      const sw = 0.14 + pw * 0.25;
      const len = 0.2 + pw * 0.35;
      v.tone({ type: 'sawtooth', f: 2800, f2: 170, sweep: sw, d: len, g: 0.2, dest: dzL });
      v.tone({ type: 'sawtooth', f: 2850, f2: 175, sweep: sw, d: len, g: 0.2, detune: 15, dest: dzR });
      v.tone({ type: 'square', f: 1400, f2: 85, sweep: sw * 1.1, d: len * 1.05, g: 0.1, dest: dzL });
      v.tone({ type: 'square', f: 1420, f2: 88, sweep: sw * 1.1, d: len * 1.05, g: 0.1, dest: dzR });
      // plasma blast
      v.noise({ d: len, g: 0.28 + pw * 0.2, type: 'bandpass', f: 7000, f2: 700, q: 1.3 });
      // sub
      thump(v, 150, 30, 0.25 + pw * 0.5, 0.6 + pw * 0.38);
      v.tone({ type: 'sine', f: 75, f2: 26, sweep: 0.4 + pw * 0.4, t: 0.01, d: 0.4 + pw * 0.6, g: 0.22 + pw * 0.3, dest: v.drive(3) });
      // thunder tail, scaled by power
      if (pw > 0.25) {
        const tl = 0.6 + pw * 1.6;
        v.noise({ t: 0.04, a: 0.03, d: tl, g: 0.16 + pw * 0.2, type: 'lowpass', f: 900, f2: 120, q: 0.7, rate: 0.5 });
        const n = 3 + Math.floor(pw * 6);
        for (let i = 0; i < n; i++) {
          const t = 0.08 + Math.pow(Math.random(), 1.3) * tl * 0.7;
          v.noise({ t, a: 0.01, d: rnd(0.1, 0.35), g: rnd(0.08, 0.17) * pw, type: 'lowpass', f: rnd(400, 1400), q: 0.8, rate: 0.6, dest: v.pan(rnd(-0.7, 0.7)) });
        }
      }
      if (pw > 0.6) metal(v, 1800, 0.01, 0.7, 0.07 * pw, [1, 1.5, 2.01]);
      if (pw > 0.4) audio.duck(0.25 + 0.4 * pw, 0.2 + 0.4 * pw);
    });
  },

  ripperLoop(): LoopHandle {
    return playLoop(() => {
      const v = new Voice(undefined, 1, 0.05);
      v.room(0.12);
      const master = v.gain(0);
      // two-stroke engine: pulse train -> heavy drive -> resonant body
      const body = v.filter('bandpass', 750, 0.9, master);
      const lpOut = v.filter('lowpass', 2400, 0.8, master);
      const dz = v.drive(38, body);
      dz.connect(lpOut);
      const motor = loopSrc(v, v.osc('square', 50, dz));
      const motor2 = loopSrc(v, v.osc('sawtooth', 100, v.gain(0.45, dz), 14));
      // RPM irregularity
      const wob = v.gain(3, motor.frequency);
      wob.connect(motor2.frequency);
      const wl = loopSrc(v, v.osc('sine', 9, wob));
      const wob2 = v.gain(2, motor.frequency);
      loopSrc(v, v.osc('sine', 2.7, wob2));
      // exhaust putter: noise amplitude-modulated by the motor itself
      const putt = v.gain(0.12, master);
      loopSrc(v, v.noiseLoop(v.filter('bandpass', 320, 1.2, putt), 0.6));
      motor.connect(v.gain(0.12, putt.gain));
      // chain chatter
      const chain = v.gain(0.03, master);
      loopSrc(v, v.noiseLoop(v.filter('highpass', 2600, 0.7, chain), 1.2));
      const chainGate = v.gain(0.03, chain.gain);
      const cg = loopSrc(v, v.osc('square', 190, chainGate));
      // cutting: driven grind + wet meat
      const grind = v.gain(0, master);
      loopSrc(v, v.noiseLoop(v.drive(60, v.filter('bandpass', 1300, 0.8, grind)), 0.9));
      const grindMod = v.gain(0, grind.gain);
      const gm = loopSrc(v, v.osc('sine', 23, grindMod));
      const meat = v.gain(0, master);
      loopSrc(v, v.noiseLoop(v.filter('lowpass', 480, 1.5, meat), 0.35));
      const meatMod = v.gain(0, meat.gain);
      loopSrc(v, v.osc('sine', 13, meatMod));
      let last: boolean | null = null;
      const apply = (x: number): void => {
        const cut = x > 0.5;
        if (cut === last) return;
        last = cut;
        const t = v.ctx.currentTime;
        const tc = cut ? 0.05 : 0.15;
        motor.frequency.setTargetAtTime(cut ? 88 : 50, t, tc);
        motor2.frequency.setTargetAtTime(cut ? 176 : 100, t, tc);
        wob.gain.setTargetAtTime(cut ? 7 : 3, t, tc);
        wl.frequency.setTargetAtTime(cut ? 17 : 9, t, tc);
        putt.gain.setTargetAtTime(cut ? 0.06 : 0.12, t, tc);
        chain.gain.setTargetAtTime(cut ? 0.1 : 0.03, t, tc);
        chainGate.gain.setTargetAtTime(cut ? 0.1 : 0.03, t, tc);
        cg.frequency.setTargetAtTime(cut ? 330 : 190, t, tc);
        body.frequency.setTargetAtTime(cut ? 1250 : 750, t, tc);
        grind.gain.setTargetAtTime(cut ? 0.16 : 0, t, tc);
        grindMod.gain.setTargetAtTime(cut ? 0.12 : 0, t, tc);
        gm.frequency.setTargetAtTime(cut ? 29 : 23, t, tc);
        meat.gain.setTargetAtTime(cut ? 0.32 : 0, t, tc);
        meatMod.gain.setTargetAtTime(cut ? 0.28 : 0, t, tc);
        master.gain.setTargetAtTime(cut ? 0.3 : 0.17, t, tc);
      };
      const h = loopHandle(v, master, 0.17, apply, 0.15);
      apply(0);
      return h;
    });
  },

  ripperHit(): void {
    play(() => {
      if (throttle('ripperHit', 40)) return;
      const v = new Voice(undefined, 0.65, 0.05);
      v.noise({ d: 0.07, g: 0.42, type: 'bandpass', f: rnd(1300, 2100), f2: 400, q: 2.2, dest: v.drive(20) });
      v.noise({ d: 0.06, g: 0.38, type: 'lowpass', f: 700, rate: 0.45 });
      thump(v, 140, 55, 0.06, 0.5);
      v.tone({ type: 'sawtooth', f: 85, steps: [1, 1.35, 0.8, 1.2], stepDur: 0.014, d: 0.06, g: 0.15, dest: v.drive(30, v.filter('lowpass', 1600)) });
      if (Math.random() < 0.35) metal(v, rnd(3000, 4500), 0, 0.06, 0.04, [1, 1.41]);
    });
  },

  dryFire(): void {
    play(() => {
      const v = new Voice(undefined, 0.5, 0.03);
      click(v, 0.6, 0, 3000, 0.008);
      v.tone({ type: 'square', f: 1800, f2: 900, d: 0.012, g: 0.1 });
      v.noise({ t: 0.03, d: 0.01, g: 0.25, type: 'bandpass', f: 4000, q: 2 });
    });
  },

  weaponSwitch(): void {
    play(() => {
      const v = new Voice(undefined, 0.5, 0.05);
      v.noise({ d: 0.12, g: 0.18, type: 'bandpass', f: 2500, f2: 6000, q: 3 });
      clack(v, 0.02, 700, 0.4);
      clack(v, 0.14, 950, 0.45);
    });
  },

  // ----------------------------------------------------------- feedback

  hit(consecutive: number): void {
    play(() => {
      if (throttle('hit', 25)) return;
      const p = semi(clamp(consecutive, 0, 24) * 0.5);
      const v = new Voice(undefined, 0.85, 0.02);
      click(v, 0.5, 0, 6000, 0.004);
      v.tone({ type: 'triangle', f: 1400 * p, f2: 1180 * p, d: 0.04, g: 0.32 });
      v.tone({ type: 'sine', f: 2800 * p, d: 0.018, g: 0.07 });
      v.tone({ type: 'sine', f: 190, f2: 90, d: 0.03, g: 0.16 });
    });
  },

  headshot(): void {
    play(() => {
      if (throttle('headshot', 30)) return;
      const j = jit(0.02);
      const v = new Voice(undefined, 0.65, 0.12);
      v.room(0.2);
      click(v, 0.55, 0, 6500, 0.004);
      // skull crack
      v.tone({ type: 'square', f: 900, f2: 200, sweep: 0.02, d: 0.025, g: 0.14, dest: v.drive(20, v.filter('lowpass', 3500)) });
      // metallic ping, stereo
      metal(v, 3150 * j, 0, 0.22, 0.24, [1, 1.39, 1.87, 2.63], v.pan(-0.3));
      metal(v, 3150 * j * 1.004, 0.002, 0.2, 0.16, [1, 1.41, 1.9], v.pan(0.3));
      v.tone({ type: 'triangle', f: 4800, f2: 5200, d: 0.06, g: 0.09 });
    });
  },

  kill(variation: number): void {
    play(() => {
      if (throttle('kill', 35)) return;
      const shifts = [0, 0.35, -0.25, 0.6, -0.5, 0.2, -0.1];
      const p = semi(shifts[mod(variation, shifts.length)]);
      const v = new Voice(undefined, 1, 0.1);
      v.room(0.15);
      // 1. transient click
      click(v, 0.85, 0, 3800, 0.005);
      // 2. crunchy "tock" body + flesh
      v.tone({ type: 'square', f: 820, f2: 150, sweep: 0.03, d: 0.035, g: 0.2, dest: v.drive(28, v.filter('lowpass', 3000)) });
      v.noise({ d: 0.03, g: 0.2, type: 'bandpass', f: 1500, q: 1.2 });
      // 3. the DING: stereo-detuned bell, fifth + octave sparkle, gentle top end (never fatiguing)
      const lp = v.filter('lowpass', 7500, 0.7);
      const ding = v.filter('highpass', 800, 0.7, lp);
      const f = 2093 * p;
      v.tone({ type: 'triangle', f, t: 0.002, a: 0.001, d: 0.17, g: 0.36, dest: v.pan(-0.3, ding) });
      v.tone({ type: 'sine', f: f * 1.007, t: 0.002, a: 0.001, d: 0.16, g: 0.28, dest: v.pan(0.3, ding) });
      v.tone({ type: 'sine', f: f * 1.5, t: 0.003, a: 0.001, d: 0.11, g: 0.09, dest: ding });
      v.tone({ type: 'sine', f: f * 2, t: 0.003, a: 0.001, d: 0.06, g: 0.05, dest: ding });
      v.tone({ type: 'sine', f: f * 2.76, t: 0.002, a: 0.001, d: 0.025, g: 0.04, dest: ding });
      // 4. sub thump (mildly driven so it reads on laptop speakers)
      v.tone({ type: 'sine', f: 130, f2: 44, sweep: 0.1, a: 0.001, d: 0.17, g: 0.75, dest: v.drive(3) });
      v.tone({ type: 'sine', f: 260, f2: 90, sweep: 0.06, a: 0.001, d: 0.07, g: 0.15 });
      audio.duck(0.42, 0.13);
    });
  },

  gloryKill(): void {
    play(() => {
      const v = new Voice(undefined, 1, 0.35);
      v.room(0.35);
      // bone crunch: stereo burst of micro-crunches + snap
      const cL = v.drive(60, v.filter('bandpass', 1300, 1.2, v.pan(-0.4)));
      const cR = v.drive(60, v.filter('bandpass', 1500, 1.2, v.pan(0.4)));
      let ct = 0;
      for (let i = 0; i < 9; i++) {
        v.noise({ t: ct, d: rnd(0.012, 0.035), g: rnd(0.35, 0.6), dest: i % 2 ? cL : cR });
        ct += rnd(0.01, 0.02);
      }
      v.noise({ d: 0.02, g: 0.5, type: 'highpass', f: 2500, dest: v.drive(30) });
      v.noise({ d: 0.25, g: 0.38, type: 'lowpass', f: 2200, f2: 250, q: 1, rate: 0.6 });
      // metal crush
      const mdz = v.drive(15, v.filter('lowpass', 5000));
      metal(v, 340, 0.01, 0.45, 0.3, [1, 1.52, 2.39, 3.32], mdz);
      v.tone({ type: 'sawtooth', f: 220, steps: [1, 0.7, 1.2, 0.5, 0.9, 0.4], stepDur: 0.025, d: 0.15, g: 0.18, dest: mdz });
      // bass drop
      thump(v, 170, 28, 0.6, 1.0, 0.005);
      v.tone({ type: 'triangle', f: 85, f2: 26, sweep: 0.55, t: 0.02, d: 0.7, g: 0.32, dest: v.drive(5) });
      // reversed swell into a final snap
      const S = 0.62;
      const sw = v.filter('bandpass', 600, 1.2);
      sw.frequency.setValueAtTime(600, v.t + 0.1);
      sw.frequency.exponentialRampToValueAtTime(5000, v.t + S);
      v.noise({ t: 0.1, a: S - 0.1, d: 0.02, g: 0.28, dest: sw });
      v.tone({ type: 'sawtooth', f: 110, f2: 440, sweep: S - 0.1, t: 0.1, a: S - 0.1, d: 0.03, g: 0.07, dest: v.filter('lowpass', 2500) });
      click(v, 0.5, S, 2500, 0.01);
      thump(v, 110, 40, 0.18, 0.5, S);
      v.tone({ type: 'sine', f: 1760, t: S, a: 0.002, d: 0.9, g: 0.12 });
      v.tone({ type: 'sine', f: 2640 * 1.003, t: S, a: 0.002, d: 0.7, g: 0.06 });
      v.tone({ type: 'sine', f: 880, t: S, a: 0.01, d: 1.1, g: 0.08 });
      audio.duck(0.6, 0.75);
    });
  },

  gibSplat(pos?: V3): void {
    play(() => {
      if (throttle('gib', 30) || busy()) return;
      const v = new Voice(pos, 0.75, 0.15);
      if (!v.audible) return v.finish();
      for (let i = 0; i < 3; i++) {
        const t = i * rnd(0.02, 0.05);
        v.noise({ t, d: rnd(0.06, 0.12), g: 0.45 / (1 + i * 0.5), type: 'bandpass', f: rnd(1500, 2600), f2: rnd(250, 450), q: 3 });
      }
      v.noise({ d: 0.1, g: 0.35, type: 'lowpass', f: 1100, rate: 0.6 });
      thump(v, 95, 40, 0.1, 0.5);
    });
  },

  metalDebris(pos?: V3): void {
    play(() => {
      if (throttle('debris', 40) || busy()) return;
      const v = new Voice(pos, 0.45, 0.2);
      if (!v.audible) return v.finish();
      const n = 5 + Math.floor(Math.random() * 4);
      let t = 0;
      for (let i = 0; i < n; i++) {
        t += rnd(0.03, 0.12);
        const g = 0.35 * Math.pow(0.82, i);
        metal(v, rnd(500, 1700), t, rnd(0.08, 0.22), g, [1, 2.76, 5.4]);
        v.noise({ t, d: 0.01, g: g * 0.6, type: 'highpass', f: 3000 });
      }
    });
  },

  armorBreak(): void {
    play(() => {
      const v = new Voice(undefined, 0.85, 0.25);
      click(v, 0.7, 0, 3000, 0.01);
      for (let i = 0; i < 6; i++) {
        v.tone({ type: 'sine', f: rnd(2500, 7000), t: i * rnd(0.008, 0.02), d: rnd(0.08, 0.25), g: 0.08 });
      }
      v.noise({ d: 0.25, g: 0.35, type: 'highpass', f: 3500, f2: 1200 });
      v.tone({ type: 'square', f: 1200, f2: 260, sweep: 0.3, d: 0.32, g: 0.12, dest: v.filter('lowpass', 3000) });
      thump(v, 110, 40, 0.18, 0.55);
    });
  },

  playerHurt(dmg: number): void {
    play(() => {
      if (throttle('hurt', 60)) return;
      const k = clamp(dmg / 40, 0.2, 1);
      const v = new Voice(undefined, 0.6 + k * 0.4, 0.05);
      thump(v, 150, 55, 0.12 + k * 0.1, 0.7 + k * 0.3);
      v.noise({ d: 0.08 + k * 0.08, g: 0.3 + k * 0.25, type: 'bandpass', f: 800, f2: 300, q: 1.2, dest: v.drive(25) });
      v.tone({ type: 'sawtooth', f: 260, f2: 120, d: 0.1 + k * 0.1, g: 0.12 * k, dest: v.drive(40, v.filter('lowpass', 1200)) });
      audio.duck(0.2 * k, 0.15);
    });
  },

  playerDeath(): void {
    play(() => {
      const v = new Voice(undefined, 1, 0.5);
      // impact
      thump(v, 120, 25, 1.2, 1.0);
      v.noise({ d: 0.5, g: 0.5, type: 'lowpass', f: 3000, f2: 120 });
      // glitchy collapsing digital tone
      const glitch = v.crush(v.filter('lowpass', 4000, 3));
      const steps: number[] = [];
      for (let i = 0; i < 40; i++) steps.push(Math.pow(0.93, i) * (Math.random() < 0.25 ? rnd(1.5, 3) : 1));
      v.tone({ type: 'sawtooth', f: 900, steps, stepDur: 0.045, t: 0.05, d: 1.9, g: 0.3, dest: glitch });
      v.tone({ type: 'square', f: 450, f2: 25, sweep: 1.8, t: 0.05, d: 1.9, g: 0.15, dest: v.drive(50, v.filter('lowpass', 1500)) });
      // stutter bursts of static
      for (let i = 0; i < 9; i++) {
        v.noise({ t: 0.1 + i * rnd(0.08, 0.2), d: rnd(0.02, 0.07), g: rnd(0.15, 0.3), type: 'bandpass', f: rnd(800, 5000), q: 2 });
      }
      // final power-down
      v.tone({ type: 'sine', f: 220, f2: 20, sweep: 1.4, t: 0.6, a: 0.05, d: 1.6, g: 0.3 });
      audio.duck(0.8, 2);
    });
  },

  lowHpHeartbeat(): void {
    play(() => heartbeat(false));
  },

  // ----------------------------------------------------------- movement

  dash(): void {
    play(() => {
      const v = new Voice(undefined, 0.75, 0.12);
      v.room(0.15);
      click(v, 0.3, 0, 2500, 0.008);
      // thrust
      v.tone({ type: 'sine', f: 70, f2: 150, a: 0.01, d: 0.16, g: 0.4 });
      thump(v, 120, 50, 0.08, 0.35);
      // whoosh sweeping across the stereo field
      const pn = v.pan(-0.7);
      pn.pan.setValueAtTime(-0.7, v.t);
      pn.pan.linearRampToValueAtTime(0.7, v.t + 0.25);
      v.noise({ a: 0.025, d: 0.25, g: 0.55, type: 'bandpass', f: 500, f2: 3800, q: 1.4, dest: pn });
      v.noise({ t: 0.04, a: 0.02, d: 0.22, g: 0.28, type: 'bandpass', f: 3200, f2: 700, q: 1.2 });
      // jet hiss
      v.noise({ a: 0.005, d: 0.12, g: 0.12, type: 'highpass', f: 5000 });
    });
  },

  jump(): void {
    play(() => {
      const v = new Voice(undefined, 0.38, 0.03);
      v.noise({ d: 0.07, g: 0.38, type: 'bandpass', f: 600, f2: 1800, q: 0.9 });
      v.tone({ type: 'sine', f: 150, f2: 260, d: 0.08, g: 0.3 });
      thump(v, 110, 60, 0.05, 0.3);
    });
  },

  land(hard: boolean): void {
    play(() => {
      const v = new Voice(undefined, hard ? 0.95 : 0.45, hard ? 0.18 : 0.04);
      if (hard) v.room(0.3);
      thump(v, hard ? 125 : 100, hard ? 28 : 45, hard ? 0.3 : 0.1, hard ? 0.95 : 0.8);
      v.noise({ d: hard ? 0.18 : 0.06, g: 0.4, type: 'lowpass', f: hard ? 1100 : 600, f2: hard ? 200 : 300 });
      if (hard) {
        v.noise({ d: 0.03, g: 0.3, dest: v.drive(25, v.filter('bandpass', 900, 0.8)) });
        metal(v, rnd(400, 700), 0.01, 0.25, 0.12);
        clack(v, 0.03, 500, 0.25);
        for (let i = 0; i < 4; i++) v.noise({ t: 0.05 + i * rnd(0.03, 0.07), d: 0.012, g: 0.07, type: 'highpass', f: 3000, dest: v.pan(rnd(-0.7, 0.7)) });
        audio.duck(0.2, 0.12);
      }
    });
  },

  slide(): LoopHandle {
    return playLoop(() => {
      const v = new Voice(undefined, 1, 0.05);
      const master = v.gain(0);
      const scrape = v.filter('bandpass', 2200, 2.5, master);
      loopSrc(v, v.noiseLoop(scrape, 0.8));
      // wobble the scrape filter
      loopSrc(v, v.osc('sine', 7, v.gain(600, scrape.frequency)));
      // sparks: high noise gated by a fast LFO
      const sparks = v.gain(0.15, master);
      loopSrc(v, v.noiseLoop(v.filter('highpass', 6500, 0.7, sparks), 1.3));
      loopSrc(v, v.osc('square', 23, v.gain(0.15, sparks.gain)));
      loopSrc(v, v.osc('sine', 60, v.gain(0.06, master)));
      return loopHandle(v, master, 0.3, (x) => master.gain.setTargetAtTime(0.15 + x * 0.2, v.ctx.currentTime, 0.05), 0.12);
    });
  },

  footstep(): void {
    play(() => {
      if (throttle('step', 90) || busy()) return;
      const v = new Voice(undefined, 0.42, 0.02);
      const p = jit(0.08);
      thump(v, 95 * p, 42, 0.07, 0.65);
      v.noise({ d: 0.035, g: 0.3, type: 'lowpass', f: 1500 * p, q: 0.7 });
      v.noise({ t: 0.004, d: 0.02, g: 0.09, type: 'bandpass', f: 3200 * p, q: 1.5 });
      if (Math.random() < 0.45) metal(v, 820 * p, 0.003, 0.05, 0.035, [1, 2.76]);
    });
  },

  // ----------------------------------------------------------- enemies

  droneWhine(pos: V3): void {
    play(() => {
      if (busy()) return;
      const v = new Voice(pos, 0.4, 0.15);
      if (!v.audible) return v.finish();
      const f = rnd(1600, 2000);
      const bp = v.filter('bandpass', f * 1.2, 3);
      v.tone({ type: 'sawtooth', f, f2: f * 1.5, a: 0.03, d: 0.32, g: 0.4, vib: { rate: 28, depth: 60 }, dest: bp });
      v.tone({ type: 'sine', f: f / 2, f2: f * 0.7, a: 0.03, d: 0.3, g: 0.12 });
    });
  },

  gruntVoice(pos: V3): void {
    play(() => {
      if (throttle('grunt', 80) || busy()) return;
      const v = new Voice(pos, 0.7, 0.18);
      if (!v.audible) return v.finish();
      const n = 2 + Math.floor(Math.random() * 3);
      const base = rnd(105, 145);
      const f0: number[] = [];
      const vowels: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        f0.push(base * rnd(0.85, 1.25));
        vowels.push(pick(VOWELS));
      }
      formantVoice(v, { f0, vowels, syl: rnd(0.07, 0.11), g: 0.55, drive: 10, ring: rnd(40, 70) });
    });
  },

  bruteRoar(pos: V3): void {
    play(() => {
      const v = new Voice(pos, 1, 0.35);
      if (!v.audible) return v.finish();
      formantVoice(v, {
        f0: [62, 70, 58, 46],
        vowels: [VOWELS[3], VOWELS[0], VOWELS[0], VOWELS[4]],
        syl: 0.24,
        g: 0.6,
        drive: 40,
        ring: 31,
        voices: 3,
      });
      v.noise({ a: 0.05, d: 0.9, g: 0.25, type: 'bandpass', f: 500, f2: 250, q: 1.2 });
      v.tone({ type: 'sine', f: 50, f2: 32, a: 0.05, d: 0.9, g: 0.45 });
    });
  },

  bruteStomp(pos: V3): void {
    play(() => {
      const v = new Voice(pos, 1, 0.2);
      if (!v.audible) return v.finish();
      thump(v, 75, 24, 0.4, 1.0);
      v.noise({ d: 0.25, g: 0.4, type: 'lowpass', f: 400, f2: 100 });
      metal(v, rnd(180, 260), 0.005, 0.3, 0.12, [1, 2.76]);
      for (let i = 0; i < 3; i++) v.noise({ t: 0.05 + i * rnd(0.03, 0.08), d: 0.015, g: 0.12, type: 'highpass', f: 2500 });
    });
  },

  stalkerChirp(pos: V3): void {
    play(() => {
      if (busy()) return;
      const v = new Voice(pos, 0.45, 0.2);
      if (!v.audible) return v.finish();
      for (let i = 0; i < 3; i++) {
        const f = rnd(2300, 2900);
        v.tone({ type: 'sine', f, f2: f * 1.6, t: i * 0.055, d: 0.04, g: 0.35, vib: { rate: 90, depth: 300 } });
      }
    });
  },

  stalkerShot(pos: V3): void {
    play(() => {
      const v = new Voice(pos, 1, 0.5);
      if (!v.audible) return v.finish();
      click(v, 1.0, 0, 2000, 0.02);
      v.noise({ d: 0.07, g: 0.6, type: 'highpass', f: 3500, f2: 1500 });
      v.tone({ type: 'sawtooth', f: 2400, f2: 110, sweep: 0.12, d: 0.14, g: 0.25, dest: v.drive(15) });
      thump(v, 130, 40, 0.18, 0.55);
    });
  },

  spiderTick(pos: V3): void {
    play(() => {
      if (throttle('spider', 35) || busy()) return;
      const v = new Voice(pos, 0.35, 0.05);
      if (!v.audible) return v.finish();
      const n = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) v.noise({ t: i * rnd(0.025, 0.05), d: 0.006, g: 0.5, type: 'bandpass', f: rnd(4000, 6500), q: 4 });
    });
  },

  enemyShoot(kind: 'bolt' | 'plasma' | 'orb' | 'rocket' | 'spit' | 'replica', pos: V3): void {
    play(() => {
      if (throttle('eshoot:' + kind, 30) || busy()) return;
      const v = new Voice(pos, 0.6, 0.2);
      if (!v.audible) return v.finish();
      const p = jit(0.05);
      switch (kind) {
        case 'bolt':
          v.tone({ type: 'square', f: 950 * p, f2: 280, d: 0.12, g: 0.3, dest: v.filter('lowpass', 4000) });
          click(v, 0.3, 0, 3000, 0.008);
          break;
        case 'plasma':
          v.tone({ type: 'sawtooth', f: 620 * p, f2: 140, d: 0.22, g: 0.3, vib: { rate: 35, depth: 120 }, dest: v.filter('lowpass', 3000, 3) });
          v.noise({ d: 0.15, g: 0.2, type: 'bandpass', f: 2500, f2: 600, q: 2 });
          break;
        case 'orb':
          v.tone({ type: 'sine', f: 280 * p, f2: 520, a: 0.02, d: 0.3, g: 0.35, vib: { rate: 14, depth: 30 } });
          v.tone({ type: 'triangle', f: 560 * p, f2: 1040, a: 0.02, d: 0.25, g: 0.12 });
          break;
        case 'rocket':
          thump(v, 110, 45, 0.15, 0.6);
          v.noise({ a: 0.02, d: 0.55, g: 0.45, type: 'lowpass', f: 1500, f2: 400 });
          v.noise({ d: 0.3, g: 0.2, type: 'bandpass', f: 3000, f2: 1200, q: 1.5 });
          break;
        case 'spit':
          for (let i = 0; i < 3; i++) v.noise({ t: i * 0.025, d: 0.07, g: 0.35, type: 'bandpass', f: rnd(1300, 1900), f2: 500, q: 3 });
          v.tone({ type: 'sine', f: 240, f2: 110, d: 0.08, g: 0.2 });
          break;
        case 'replica': {
          const dz = v.crush(v.filter('lowpass', 5000));
          v.tone({ type: 'sawtooth', f: 1450 * p, f2: 160, sweep: 0.08, d: 0.09, g: 0.3, dest: dz });
          click(v, 0.5, 0, 2500, 0.01);
          thump(v, 160, 48, 0.09, 0.45);
          break;
        }
      }
    });
  },

  enemyPain(type: string, pos: V3): void {
    play(() => {
      if (throttle('pain:' + type, 50) || busy()) return;
      const v = new Voice(pos, 0.5, 0.12);
      if (!v.audible) return v.finish();
      const h = hashStr(type);
      const isBig = /brute|warden|boss/i.test(type);
      const isSmall = /drone|spider/i.test(type);
      const base = isBig ? 90 : isSmall ? 900 : 260 + (h % 200);
      const steps = [1, rnd(1.2, 1.6), rnd(0.7, 0.9), rnd(1.1, 1.4)];
      const dest = v.filter('bandpass', base * 3, 2, v.drive(isBig ? 30 : 12));
      v.tone({ type: 'square', f: base, steps, stepDur: 0.035, d: 0.13, g: 0.4, dest });
      v.noise({ d: 0.04, g: 0.15, type: 'bandpass', f: 2000, q: 2 });
    });
  },

  enemyDeath(type: string, pos: V3): void {
    play(() => {
      if (throttle('edeath', 20)) return;
      const big = /brute|warden|boss/i.test(type);
      const small = /drone|spider/i.test(type);
      const v = new Voice(pos, big ? 1 : 0.75, big ? 0.35 : 0.2);
      if (!v.audible) return v.finish();
      const h = hashStr(type);
      const base = (big ? 220 : small ? 1200 : 480) * (1 + (h % 7) * 0.03) * jit(0.04);
      const len = big ? 0.8 : small ? 0.25 : 0.4;
      v.tone({ type: 'sawtooth', f: base, f2: base * 0.1, d: len, g: 0.3, dest: v.drive(35, v.filter('lowpass', 3000, 2)) });
      v.tone({ type: 'square', f: base * 1.5, steps: [1, 0.6, 1.3, 0.4, 0.8, 0.25], stepDur: len / 6, d: len, g: 0.1, dest: v.crush(v.filter('lowpass', 2500)) });
      v.noise({ d: len * 0.6, g: 0.35, type: 'lowpass', f: 3000, f2: 200 });
      thump(v, big ? 90 : 120, big ? 25 : 40, big ? 0.6 : 0.25, big ? 0.9 : 0.5);
      if (!small) metal(v, rnd(500, 900), 0.02, 0.3, 0.1);
    });
  },

  explosion(pos: V3 | undefined, size: number): void {
    play(() => {
      if (throttle('boom', 25)) return;
      const s = clamp(Number.isFinite(size) ? size : 1, 0.5, 3);
      const v = new Voice(pos, clamp(0.65 + s * 0.18, 0, 1), 0.3 + s * 0.1);
      if (!v.audible) return v.finish();
      v.room(0.3);
      const len = 0.55 + s * 0.35;
      // crack
      click(v, 0.85, 0, 1400, 0.016);
      v.noise({ d: 0.05, g: 0.55, dest: v.drive(40, v.filter('bandpass', 1600, 0.7)) });
      // blast (stereo) + distorted mid
      v.noise({ d: len, g: 0.55, type: 'lowpass', f: 5000, f2: 140, q: 0.8, dest: v.pan(-0.4) });
      v.noise({ t: 0.01, d: len, g: 0.55, type: 'lowpass', f: 4400, f2: 120, q: 0.8, dest: v.pan(0.4) });
      v.noise({ d: len * 0.5, g: 0.38, dest: v.drive(50, v.filter('bandpass', 850, 0.7)) });
      // sub
      thump(v, 95, 20, len, 1.0);
      v.tone({ type: 'triangle', f: 55, f2: 22, d: len * 1.1, g: 0.3, dest: v.drive(6) });
      // crackling debris, scattered across the field
      const pL = v.pan(-0.7);
      const pR = v.pan(0.7);
      const n = Math.floor(6 + s * 6);
      for (let i = 0; i < n; i++) {
        const t = 0.06 + Math.pow(Math.random(), 1.6) * len * 1.2;
        v.noise({ t, d: rnd(0.004, 0.015), g: rnd(0.06, 0.16), type: 'highpass', f: rnd(2500, 6000), dest: i % 2 ? pL : pR });
      }
      for (let i = 0; i < 2 + Math.floor(s); i++) {
        metal(v, rnd(300, 900), 0.15 + Math.random() * len, 0.1, 0.05, [1, 2.76], i % 2 ? pR : pL);
      }
      // long rumbling tail
      v.noise({ t: 0.08, a: 0.1, d: 1.2 + s * 0.8, g: 0.2, type: 'lowpass', f: 500, f2: 80, rate: 0.5 });
      const near = audio.spatial(pos).gain;
      if (near > 0.3) audio.duck(0.35 * near * Math.min(1, s / 1.5), 0.3 + s * 0.1);
    });
  },

  mineArm(pos: V3): void {
    play(() => {
      const v = new Voice(pos, 0.5, 0.15);
      if (!v.audible) return v.finish();
      v.tone({ type: 'square', f: 1200, d: 0.06, g: 0.2, dest: v.filter('lowpass', 4000) });
      v.tone({ type: 'square', f: 1800, t: 0.1, d: 0.08, g: 0.22, dest: v.filter('lowpass', 4000) });
      click(v, 0.2, 0, 3000, 0.005);
    });
  },

  teslaArc(pos?: V3): void {
    play(() => {
      if (throttle('tesla', 40) || busy()) return;
      const v = new Voice(pos, 0.55, 0.15);
      if (!v.audible) return v.finish();
      const buzz = v.drive(60, v.filter('bandpass', 2400, 1.2));
      v.tone({ type: 'sawtooth', f: 120, steps: [1, 1.5, 0.75, 2, 1.25, 0.9, 1.8, 1], stepDur: 0.028, d: 0.22, g: 0.3, dest: buzz });
      for (let i = 0; i < 8; i++) {
        v.noise({ t: Math.random() * 0.22, d: rnd(0.005, 0.02), g: rnd(0.25, 0.5), type: 'highpass', f: rnd(3000, 7000) });
      }
    });
  },

  wardenRoar(): void {
    play(() => {
      const v = new Voice(undefined, 1, 0.6);
      formantVoice(v, {
        f0: [48, 55, 52, 44, 36],
        vowels: [VOWELS[3], VOWELS[0], VOWELS[5], VOWELS[0], VOWELS[4]],
        syl: 0.42,
        g: 0.55,
        drive: 70,
        ring: 23,
        voices: 4,
      });
      v.noise({ a: 0.1, h: 1.2, d: 0.8, g: 0.3, type: 'bandpass', f: 600, f2: 180, q: 1 });
      v.tone({ type: 'sine', f: 34, f2: 26, a: 0.15, h: 1.2, d: 0.9, g: 0.6 });
      thump(v, 90, 24, 0.8, 0.9);
      audio.duck(0.6, 2.2);
    });
  },

  // ----------------------------------------------------------- world / ui

  doorOpen(pos?: V3): void {
    play(() => {
      const v = new Voice(pos, 0.7, 0.25);
      if (!v.audible) return v.finish();
      clack(v, 0, 300, 0.5);
      thump(v, 90, 40, 0.15, 0.5);
      v.noise({ t: 0.03, a: 0.05, h: 0.3, d: 0.4, g: 0.25, type: 'highpass', f: 2500, f2: 5000 });
      v.tone({ type: 'sawtooth', f: 48, f2: 72, sweep: 0.6, t: 0.05, a: 0.08, h: 0.4, d: 0.25, g: 0.25, dest: v.filter('lowpass', 300, 2) });
      clack(v, 0.85, 240, 0.5);
      thump(v, 70, 30, 0.2, 0.6, 0.85);
    });
  },

  doorLocked(): void {
    play(() => {
      const v = new Voice(undefined, 0.5, 0.08);
      const lp = v.filter('lowpass', 1400, 1);
      for (const t of [0, 0.17]) {
        v.tone({ type: 'square', f: 110, t, h: 0.1, d: 0.03, g: 0.25, dest: lp });
        v.tone({ type: 'square', f: 117, t, h: 0.1, d: 0.03, g: 0.2, dest: lp });
      }
      clack(v, 0, 400, 0.3);
    });
  },

  roomClear(): void {
    play(() => {
      const v = new Voice(undefined, 0.8, 0.4);
      clack(v, 0, 500, 0.5);
      thump(v, 100, 40, 0.2, 0.6);
      const lp = v.filter('lowpass', 3500, 0.7);
      const notes = [64, 71, 76, 80, 83]; // E maj add 9-ish rising
      notes.forEach((m, i) => {
        v.tone({ type: 'triangle', f: hz(m), t: 0.05 + i * 0.06, a: 0.005, d: 1.0 - i * 0.08, g: 0.22, dest: lp });
        v.tone({ type: 'sawtooth', f: hz(m), t: 0.05 + i * 0.06, a: 0.01, d: 0.6, g: 0.05, detune: 7, dest: lp });
      });
      v.tone({ type: 'sine', f: hz(40), t: 0.05, a: 0.02, d: 1.2, g: 0.3 });
      audio.duck(0.3, 0.6);
    });
  },

  pedestalRise(): void {
    play(() => {
      const v = new Voice(undefined, 0.8, 0.3);
      // accelerating drumroll with crescendo
      let t = 0;
      let iv = 0.13;
      let i = 0;
      while (t < 1.4) {
        const k = t / 1.4;
        v.noise({ t, d: 0.05, g: 0.08 + k * 0.25, type: 'bandpass', f: 1700, q: 1 });
        if (i % 2 === 0) v.tone({ type: 'triangle', f: 170 + k * 40, f2: 110, t, d: 0.06, g: 0.1 + k * 0.2 });
        t += iv;
        iv = Math.max(0.028, iv * 0.9);
        i++;
      }
      // rising tone
      const lp = v.filter('lowpass', 400, 2);
      lp.frequency.setValueAtTime(400, v.t);
      lp.frequency.exponentialRampToValueAtTime(3500, v.t + 1.5);
      v.tone({ type: 'sawtooth', f: 110, f2: 440, sweep: 1.5, a: 1.3, d: 0.25, g: 0.18, dest: lp });
      v.tone({ type: 'sawtooth', f: 165, f2: 660, sweep: 1.5, a: 1.3, d: 0.25, g: 0.1, detune: 9, dest: lp });
      v.noise({ a: 1.4, d: 0.2, g: 0.15, type: 'highpass', f: 4000 });
      thump(v, 110, 40, 0.25, 0.6, 1.5);
    });
  },

  rarityReveal(rarity: 'common' | 'rare' | 'epic' | 'legendary'): void {
    play(() => {
      if (rarity === 'common') {
        const v = new Voice(undefined, 0.6, 0.25);
        v.tone({ type: 'triangle', f: hz(76), d: 0.3, g: 0.3 });
        v.tone({ type: 'triangle', f: hz(83), t: 0.08, d: 0.4, g: 0.3 });
        thump(v, 100, 50, 0.1, 0.3);
        return;
      }
      if (rarity === 'rare') {
        const v = new Voice(undefined, 0.7, 0.35);
        [74, 78, 81, 86].forEach((m, i) => {
          v.tone({ type: 'triangle', f: hz(m), t: i * 0.07, d: 0.6, g: 0.25, dest: v.pan(-0.3 + i * 0.2) });
          v.tone({ type: 'sine', f: hz(m + 12), t: i * 0.07, d: 0.3, g: 0.06 });
        });
        thump(v, 110, 45, 0.15, 0.45);
        audio.duck(0.3, 0.6);
        return;
      }
      if (rarity === 'epic') {
        const v = new Voice(undefined, 0.85, 0.45);
        v.room(0.2);
        thump(v, 120, 35, 0.3, 0.7);
        click(v, 0.5, 0, 2500, 0.01);
        const lp = v.filter('lowpass', 800, 1.5);
        lp.frequency.setValueAtTime(800, v.t);
        lp.frequency.exponentialRampToValueAtTime(5000, v.t + 0.5);
        [69, 72, 76, 79].forEach((m, i) => v.tone({ type: 'triangle', f: hz(m + 12), t: i * 0.06, d: 0.25, g: 0.18, dest: v.pan(-0.4 + i * 0.27) }));
        chord(v, [hz(57), hz(64), hz(69), hz(72), hz(76)], { t: 0.25, a: 0.08, h: 0.3, d: 0.9, g: 0.42, detune: 9, dest: lp });
        brass(v, [45, 57, 64], 0.25, 0.25, 0.7, 0.25, 2600);
        thump(v, 90, 30, 0.4, 0.6, 0.25);
        for (let i = 0; i < 8; i++) v.tone({ type: 'sine', f: hz(pick([88, 91, 93, 95, 100])), t: 0.3 + i * 0.1, d: 0.2, g: 0.05, dest: v.pan(rnd(-0.6, 0.6)) });
        audio.duck(0.5, 1.2);
        return;
      }
      // ---------------- LEGENDARY: riser -> BLOOM -> lydian brass fanfare -> shimmer
      const v = new Voice(undefined, 1, 0.6);
      v.room(0.3);
      // opening impact + gong
      thump(v, 80, 28, 1.0, 0.85);
      click(v, 0.6, 0, 2000, 0.012);
      v.noise({ d: 0.6, g: 0.32, type: 'lowpass', f: 2500, f2: 150 });
      metal(v, 220, 0.0, 2.2, 0.12, [1, 1.47, 2.09, 2.56, 3.37]);
      // rising supersaw chord (A lydian), filter opening, panned wide
      const riseLp = v.filter('lowpass', 250, 2.5);
      riseLp.frequency.setValueAtTime(250, v.t);
      riseLp.frequency.exponentialRampToValueAtTime(7000, v.t + 1.6);
      const riseNotes = [57, 64, 69, 71, 73, 76];
      riseNotes.forEach((m, i) => {
        const dest = v.pan(i % 2 ? 0.45 : -0.45, riseLp);
        for (const dt of [-11, 0, 11]) {
          v.tone({ type: 'sawtooth', f: hz(m - 5), f2: hz(m), sweep: 1.5, a: 1.5, h: 0.05, d: 0.25, g: 0.04, detune: dt, dest });
        }
      });
      // riser noise + accelerating snare roll
      v.noise({ a: 1.55, d: 0.08, g: 0.24, type: 'bandpass', f: 600, f2: 9000, q: 1.5 });
      let rt = 0.5;
      let iv = 0.14;
      while (rt < 1.58) {
        const k = (rt - 0.5) / 1.1;
        v.noise({ t: rt, d: 0.05, g: 0.05 + k * 0.18, type: 'bandpass', f: 1800, q: 0.9 });
        rt += iv;
        iv = Math.max(0.025, iv * 0.86);
      }
      // shimmer twinkles throughout
      const sparkle = [81, 85, 88, 90, 93, 97, 100, 102, 105];
      const sL = v.pan(-0.6);
      const sR = v.pan(0.6);
      let k = 0;
      for (let t = 0.25; t < 3.0; t += rnd(0.05, 0.09)) {
        v.tone({ type: 'sine', f: hz(pick(sparkle)), t, a: 0.004, d: 0.3, g: 0.035 + (t > 1.6 ? 0.025 : 0), dest: k++ % 2 ? sL : sR });
      }
      // THE BLOOM at 1.6s
      const B = 1.6;
      thump(v, 70, 22, 1.4, 1.0, B);
      v.tone({ type: 'sine', f: 60, f2: 24, sweep: 1.2, t: B, a: 0.005, d: 1.4, g: 0.35, dest: v.drive(3) });
      v.noise({ t: B, d: 1.6, g: 0.3, type: 'highpass', f: 4000, f2: 2000 });
      click(v, 0.6, B, 2000, 0.01);
      const bloomLp = v.filter('lowpass', 9000, 0.7);
      chord(v, [hz(45), hz(57), hz(64), hz(69), hz(73), hz(76), hz(81), hz(88)], { type: 'sawtooth', t: B, a: 0.05, h: 0.3, d: 1.1, g: 0.5, detune: 12, dest: bloomLp });
      chord(v, [hz(69), hz(76), hz(81), hz(85)], { type: 'triangle', t: B, a: 0.02, h: 0.35, d: 1.2, g: 0.3 });
      v.tone({ type: 'sine', f: hz(33), t: B, a: 0.05, h: 0.4, d: 0.8, g: 0.38 });
      // lydian brass fanfare: I - II - I (the "you got it" cadence)
      brass(v, [57, 64, 69, 73], B + 0.5, 0.1, 0.18, 0.32, 3600);
      brass(v, [59, 66, 71, 75], B + 0.72, 0.1, 0.18, 0.34, 3800);
      brass(v, [45, 57, 64, 69, 73, 76], B + 0.94, 0.55, 1.2, 0.5, 4500);
      thump(v, 100, 32, 0.5, 0.6, B + 0.94);
      v.noise({ t: B + 0.94, d: 1.4, g: 0.2, type: 'highpass', f: 5000, f2: 2500, dest: v.pan(0.3) });
      audio.duck(0.75, 3.4);
    });
  },

  powerupPick(): void {
    play(() => {
      const v = new Voice(undefined, 0.7, 0.3);
      [72, 76, 79, 84, 88].forEach((m, i) => {
        v.tone({ type: 'square', f: hz(m), t: i * 0.04, d: 0.12, g: 0.08, dest: v.filter('lowpass', 5000) });
        v.tone({ type: 'sine', f: hz(m), t: i * 0.04, d: 0.25, g: 0.18 });
      });
      v.noise({ t: 0.15, d: 0.3, g: 0.08, type: 'highpass', f: 7000 });
      thump(v, 140, 60, 0.12, 0.35);
    });
  },

  pedestalShatter(): void {
    play(() => {
      const v = new Voice(undefined, 0.85, 0.4);
      click(v, 0.8, 0, 2500, 0.01);
      v.noise({ d: 0.35, g: 0.45, type: 'highpass', f: 5000, f2: 2500 });
      for (let i = 0; i < 18; i++) {
        v.tone({ type: 'sine', f: rnd(3000, 9500), t: Math.pow(Math.random(), 1.6) * 0.45, a: 0.001, d: rnd(0.05, 0.25), g: rnd(0.04, 0.1) });
      }
      thump(v, 120, 50, 0.15, 0.4);
    });
  },

  synergyDiscover(): void {
    play(() => {
      const v = new Voice(undefined, 0.9, 0.5);
      // mysterious glitch prelude (stepped, crushed)
      const g = v.crush(v.filter('lowpass', 5000, 2));
      const steps: number[] = [];
      for (let i = 0; i < 14; i++) steps.push(pick([1, 1.414, 0.707, 2, 1.189, 2.828]));
      v.tone({ type: 'square', f: 660, steps, stepDur: 0.035, d: 0.5, g: 0.12, dest: g });
      v.tone({ type: 'sine', f: hz(62), t: 0, a: 0.05, d: 0.5, g: 0.15 });
      v.tone({ type: 'sine', f: hz(68), t: 0, a: 0.05, d: 0.5, g: 0.12 }); // tritone
      for (let i = 0; i < 5; i++) v.noise({ t: i * 0.1, d: 0.02, g: 0.12, type: 'bandpass', f: rnd(1500, 6000), q: 3 });
      // triumphant resolution
      const R = 0.5;
      thump(v, 110, 35, 0.4, 0.8, R);
      const lp = v.filter('lowpass', 1200, 1.5);
      lp.frequency.setValueAtTime(1200, v.t + R);
      lp.frequency.exponentialRampToValueAtTime(7000, v.t + R + 0.3);
      chord(v, [hz(50), hz(62), hz(66), hz(69), hz(74), hz(78)], { t: R, a: 0.03, h: 0.25, d: 1.1, g: 0.55, detune: 10, dest: lp });
      [86, 90, 93, 98].forEach((m, i) => v.tone({ type: 'triangle', f: hz(m), t: R + 0.08 + i * 0.07, d: 0.5, g: 0.08 }));
      audio.duck(0.5, 1.4);
    });
  },

  levelUp(): void {
    play(() => {
      const v = new Voice(undefined, 0.85, 0.4);
      v.room(0.2);
      const lp = v.filter('lowpass', 4500);
      // rising arpeggio
      [60, 64, 67, 72].forEach((m, i) => {
        const dest = v.pan(-0.45 + i * 0.3);
        v.tone({ type: 'triangle', f: hz(m), t: i * 0.07, d: 0.4, g: 0.2, dest });
        v.tone({ type: 'sawtooth', f: hz(m), t: i * 0.07, d: 0.25, g: 0.05, dest: lp });
      });
      // triumphant brass chord + timpani hit + cymbal swell
      const T = 0.32;
      brass(v, [48, 60, 67, 72, 76, 79], T, 0.3, 0.8, 0.5, 4200);
      chord(v, [hz(72), hz(76), hz(79), hz(84)], { type: 'triangle', t: T, a: 0.01, h: 0.25, d: 0.8, g: 0.28 });
      thump(v, 120, 42, 0.35, 0.7, T);
      click(v, 0.4, T, 2500, 0.01);
      v.noise({ t: T, d: 0.9, g: 0.14, type: 'highpass', f: 6000, f2: 3500 });
      [84, 88, 91, 96].forEach((m, i) => v.tone({ type: 'sine', f: hz(m), t: T + 0.1 + i * 0.06, d: 0.35, g: 0.05, dest: v.pan(i % 2 ? 0.5 : -0.5) }));
      audio.duck(0.45, 1);
    });
  },

  uiClick(): void {
    play(() => {
      const v = new Voice(undefined, 0.35, 0);
      v.tone({ type: 'square', f: 1800, f2: 1200, d: 0.015, g: 0.25, dest: v.filter('lowpass', 5000) });
      click(v, 0.2, 0, 4000, 0.004);
    });
  },

  uiHover(): void {
    play(() => {
      if (throttle('hover', 40)) return;
      const v = new Voice(undefined, 0.15, 0);
      v.tone({ type: 'sine', f: 2400, d: 0.012, g: 0.3 });
    });
  },

  streak(level: 1 | 2 | 3 | 4): void {
    play(() => {
      const L = clamp(Math.round(level), 1, 4);
      const v = new Voice(undefined, 0.8 + L * 0.05, 0.3 + L * 0.08);
      v.room(0.3);
      const r = 40 + [0, 2, 3, 5][L - 1]; // E2 rising per level
      const ch = [r, r + 12, r + 19, r + 24];
      const hitAt = (t: number, g: number): void => {
        thump(v, 120, 40, 0.2, 0.75 * g, t);
        click(v, 0.5 * g, t, 2500, 0.01);
        v.noise({ t, d: 0.15, g: 0.22 * g, type: 'lowpass', f: 3000, f2: 300 });
      };
      if (L === 1) {
        // DOUBLE: da-DAAA
        brass(v, ch, 0, 0.04, 0.12, 0.3, 2800);
        brass(v, ch, 0.14, 0.18, 0.4, 0.36, 3200);
        hitAt(0, 0.8);
        hitAt(0.14, 1);
      } else if (L === 2) {
        // TRIPLE: three rising stabs
        brass(v, ch, 0, 0.04, 0.1, 0.3, 3000);
        brass(v, ch, 0.11, 0.04, 0.1, 0.32, 3200);
        brass(v, ch.map((m) => m + 3), 0.22, 0.22, 0.45, 0.38, 3800);
        hitAt(0, 0.7);
        hitAt(0.11, 0.8);
        hitAt(0.22, 1);
        v.noise({ t: 0.22, d: 0.6, g: 0.15, type: 'highpass', f: 5000 });
        for (const m of [r + 36, r + 43]) v.tone({ type: 'square', f: hz(m), t: 0.22, a: 0.005, h: 0.1, d: 0.35, g: 0.035, dest: v.filter('lowpass', 5000) });
      } else if (L === 3) {
        // stutter build -> big chord + crash
        for (let i = 0; i < 3; i++) {
          brass(v, ch, i * 0.075, 0.02, 0.06, 0.24, 2800 + i * 400);
          hitAt(i * 0.075, 0.55 + i * 0.1);
        }
        const T = 0.25;
        brass(v, [r - 12, ...ch, r + 27], T, 0.35, 0.6, 0.48, 4200);
        hitAt(T, 1);
        thump(v, 80, 26, 0.6, 0.7, T);
        v.noise({ t: T, d: 1.0, g: 0.24, type: 'highpass', f: 4000, f2: 2000, dest: v.pan(-0.3) });
        v.tone({ type: 'sawtooth', f: hz(r + 24), f2: hz(r + 36), sweep: 0.4, t: T, d: 0.5, g: 0.05, dest: v.drive(20, v.filter('lowpass', 4000)) });
      } else {
        // RAMPAGE: impact, sub drop, braam, siren scream, crash
        thump(v, 70, 22, 1.1, 1.0);
        v.tone({ type: 'sine', f: 55, f2: 22, sweep: 1.0, a: 0.005, d: 1.2, g: 0.4, dest: v.drive(4) });
        click(v, 0.8, 0, 1800, 0.014);
        v.noise({ d: 0.5, g: 0.4, type: 'lowpass', f: 3000, f2: 120 });
        v.noise({ d: 0.05, g: 0.4, dest: v.drive(40, v.filter('bandpass', 1400, 0.7)) });
        brass(v, [r - 12, r, r + 7, r + 12, r + 15, r + 19], 0, 0.6, 1.2, 0.55, 4000);
        chord(v, [hz(r + 24), hz(r + 31), hz(r + 36)], { type: 'triangle', t: 0.02, a: 0.05, h: 0.5, d: 0.8, g: 0.18 });
        v.tone({ type: 'sawtooth', f: hz(r + 24), f2: hz(r + 43), sweep: 0.6, t: 0.05, a: 0.05, h: 0.3, d: 0.5, g: 0.06, vib: { rate: 7, depth: 25 }, dest: v.drive(25, v.filter('lowpass', 5000, 2)) });
        v.noise({ d: 1.4, g: 0.3, type: 'highpass', f: 3500, f2: 1500, dest: v.pan(-0.4) });
        v.noise({ t: 0.01, d: 1.4, g: 0.3, type: 'highpass', f: 3800, f2: 1600, dest: v.pan(0.4) });
        metal(v, hz(r + 36), 0.02, 1.2, 0.08, [1, 1.5, 2.01, 3]);
        // stutter re-hits
        for (let i = 1; i <= 3; i++) {
          brass(v, ch, 0.62 + i * 0.09, 0.02, 0.07, 0.2, 3000);
          hitAt(0.62 + i * 0.09, 0.5);
        }
      }
      audio.duck(0.3 + L * 0.12, 0.3 + L * 0.2);
    });
  },

  comboTick(combo: number): void {
    play(() => {
      if (throttle('combo', 30)) return;
      const v = new Voice(undefined, 0.3, 0.05);
      const f = 800 * semi(clamp(combo, 0, 24));
      v.tone({ type: 'sine', f, d: 0.04, g: 0.4 });
      v.tone({ type: 'square', f: f * 2, d: 0.015, g: 0.04 });
    });
  },

  staticBurst(dur?: number): void {
    play(() => {
      const d = clamp(dur ?? 0.3, 0.03, 4);
      const v = new Voice(undefined, 0.45, 0.05, audio.voiceBus);
      v.noise({ a: 0.005, h: d * 0.8, d: d * 0.2, g: 0.25, type: 'bandpass', f: 2200, q: 0.7 });
      const n = Math.ceil(d * 25);
      for (let i = 0; i < n; i++) {
        v.noise({ t: Math.random() * d, d: rnd(0.005, 0.03), g: rnd(0.2, 0.5), type: 'bandpass', f: rnd(800, 5000), q: 2 });
      }
      v.tone({ type: 'square', f: 60, a: 0.005, h: d * 0.8, d: d * 0.2, g: 0.04, dest: v.filter('lowpass', 800) });
    });
  },

  bossIntro(): void {
    play(() => {
      const v = new Voice(undefined, 1, 0.6);
      // low impact
      thump(v, 70, 20, 1.6, 1.0);
      v.noise({ d: 1.2, g: 0.5, type: 'lowpass', f: 1500, f2: 60 });
      metal(v, 110, 0, 2.5, 0.15, [1, 2.76, 5.4]);
      // braam: stacked saws, driven, filter opens then closes
      const lp = v.filter('lowpass', 150, 3);
      lp.frequency.setValueAtTime(150, v.t);
      lp.frequency.exponentialRampToValueAtTime(2400, v.t + 0.6);
      lp.frequency.exponentialRampToValueAtTime(180, v.t + 3);
      const dz = v.drive(30, lp);
      for (const m of [33, 40, 45, 48]) {
        for (const dt of [-14, 0, 14]) v.tone({ type: 'sawtooth', f: hz(m), a: 0.08, h: 1.2, d: 1.7, g: 0.07, detune: dt, dest: dz });
      }
      v.tone({ type: 'sine', f: hz(21), a: 0.1, h: 1.5, d: 1.5, g: 0.5 });
      audio.duck(0.8, 3);
    });
  },

  terminalBeep(): void {
    play(() => {
      const v = new Voice(undefined, 0.35, 0.05);
      const lp = v.filter('lowpass', 3500);
      v.tone({ type: 'square', f: 1000, d: 0.05, g: 0.2, dest: lp });
      v.tone({ type: 'square', f: 1500, t: 0.07, d: 0.07, g: 0.2, dest: lp });
    });
  },

  pickupHealth(): void {
    play(() => {
      const v = new Voice(undefined, 0.6, 0.2);
      v.tone({ type: 'sine', f: hz(72), f2: hz(79), sweep: 0.1, d: 0.25, g: 0.35 });
      v.tone({ type: 'triangle', f: hz(79), t: 0.08, d: 0.3, g: 0.25 });
      v.tone({ type: 'sine', f: hz(84), t: 0.14, d: 0.25, g: 0.12 });
    });
  },

  pickupArmor(): void {
    play(() => {
      const v = new Voice(undefined, 0.65, 0.2);
      clack(v, 0, 600, 0.45);
      metal(v, 1200, 0.01, 0.3, 0.12, [1, 2.4, 3.8]);
      v.tone({ type: 'square', f: hz(67), f2: hz(74), sweep: 0.12, t: 0.04, d: 0.2, g: 0.1, dest: v.filter('lowpass', 3000) });
    });
  },

  pickupAmmo(): void {
    play(() => {
      const v = new Voice(undefined, 0.6, 0.1);
      clack(v, 0, 900, 0.45);
      clack(v, 0.08, 1100, 0.4);
      v.tone({ type: 'triangle', f: hz(76), t: 0.1, d: 0.12, g: 0.15 });
    });
  },

  heartbeatLow(): void {
    play(() => heartbeat(true));
  },

  timerTick(urgent: boolean): void {
    play(() => {
      const v = new Voice(undefined, urgent ? 0.6 : 0.35, 0.05);
      const f = urgent ? 1500 : 1000;
      v.tone({ type: 'sine', f, d: 0.05, g: 0.4 });
      v.tone({ type: 'triangle', f: f * 2.01, d: 0.02, g: 0.1 });
      if (urgent) v.tone({ type: 'sine', f: f * 1.5, t: 0.09, d: 0.05, g: 0.3 });
    });
  },

  hubAmbience(): LoopHandle {
    return playLoop(() => {
      const v = new Voice(undefined, 1, 0.4);
      const master = v.gain(0);
      const lp = v.filter('lowpass', 220, 1.5, master);
      loopSrc(v, v.osc('sawtooth', 41.2, lp, -7));
      loopSrc(v, v.osc('sawtooth', 41.2, lp, 7));
      loopSrc(v, v.osc('sawtooth', 61.7, v.gain(0.4, lp)));
      // slow filter breathing
      loopSrc(v, v.osc('sine', 0.07, v.gain(90, lp.frequency)));
      // electrical hum
      loopSrc(v, v.osc('sine', 60, v.gain(0.1, master)));
      loopSrc(v, v.osc('sine', 120, v.gain(0.04, master)));
      // air / ventilation
      const air = v.filter('bandpass', 700, 0.6, v.gain(0.12, master));
      loopSrc(v, v.noiseLoop(air, 0.5));
      loopSrc(v, v.osc('sine', 0.11, v.gain(300, air.frequency)));
      const h = loopHandle(v, master, 0.35, (x) => master.gain.setTargetAtTime(0.35 * x, v.ctx.currentTime, 0.3), 1.0);
      master.gain.cancelScheduledValues(v.t);
      master.gain.setValueAtTime(0, v.t);
      master.gain.linearRampToValueAtTime(0.35, v.t + 2);
      return h;
    });
  },
};
