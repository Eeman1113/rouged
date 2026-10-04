/**
 * ROUGED dynamic procedural music.
 *
 * A 16th-note step sequencer with lookahead scheduling against ctx.currentTime.
 * Five stems, each with its own fader that crossfades in ~0.6s:
 *   base       pad + bass pulse (+ arp in ARCHIVE, heartbeat pulse in THE CORE)
 *   combat     kick / snare / hats (+ anvil clangs in FOUNDRY)
 *   aggression distorted power-chord riff
 *   rampage    screaming lead + double-time hats
 *   boss       choir-ish formant pad + heavier drums
 *
 * Stems that are fully faded out are not scheduled at all, to save CPU.
 */
import { audio } from './engine';

type BiomeId = number | 'hub';
type LayerName = 'base' | 'combat' | 'aggression' | 'rampage' | 'boss';

interface Biome {
  root: number; // midi note of the tonic (octave 2)
  scale: number[];
  bpm: number;
  prog: number[]; // chord root scale degree per bar (4 bars)
  kick: string; // 16-char patterns: 'x' hit, '.' rest
  snare: string;
  riff: string; // 'o' open accent, 'm' palm-mute chug, '.' rest
  padType: OscillatorType;
  padCut: number;
  bassType: OscillatorType;
  bass16: boolean;
  arp: boolean;
  heartbeat: boolean;
  clang: boolean;
  drive: number;
  leadType: OscillatorType;
  swingHat: boolean;
  hub: boolean;
}

const MINOR = [0, 2, 3, 5, 7, 8, 10];
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];

const BIOMES: Record<string, Biome> = {
  '0': {
    // FOUNDRY: rust, industrial, E minor, 132
    root: 40,
    scale: MINOR,
    bpm: 132,
    prog: [0, 5, 3, 6],
    kick: 'x.....x.x.x.....',
    snare: '....x.......x...',
    riff: 'm.mmo.m.mmo.m.o.',
    padType: 'sawtooth',
    padCut: 900,
    bassType: 'sawtooth',
    bass16: false,
    arp: false,
    heartbeat: false,
    clang: true,
    drive: 40,
    leadType: 'sawtooth',
    swingHat: false,
    hub: false,
  },
  '1': {
    // ARCHIVE: cold, arpeggiated, D minor, 120
    root: 38,
    scale: MINOR,
    bpm: 120,
    prog: [0, 5, 2, 6],
    kick: 'x.....x...x.....',
    snare: '....x.......x..x',
    riff: 'o..m..o...m.o.m.',
    padType: 'triangle',
    padCut: 1600,
    bassType: 'square',
    bass16: false,
    arp: true,
    heartbeat: false,
    clang: false,
    drive: 22,
    leadType: 'square',
    swingHat: true,
    hub: false,
  },
  '2': {
    // THE CORE: red, pulsing, organic, C# phrygian, 140
    root: 37,
    scale: PHRYGIAN,
    bpm: 140,
    prog: [0, 1, 0, 6],
    kick: 'x..x..x...x..x..',
    snare: '....x.......x...',
    riff: 'mmmmo.mmmmo.o.o.',
    padType: 'sawtooth',
    padCut: 700,
    bassType: 'sawtooth',
    bass16: true,
    arp: false,
    heartbeat: true,
    clang: false,
    drive: 60,
    leadType: 'sawtooth',
    swingHat: false,
    hub: false,
  },
  '3': {
    // THE NURSERY: sterile, lullaby-wrong, A minor, 108 — music box arps over a slow pulse
    root: 45, scale: MINOR, bpm: 108, prog: [0, 3, 5, 4],
    kick: 'x.......x.......', snare: '........x.......', riff: 'o.......o...m...',
    padType: 'sine', padCut: 2200, bassType: 'triangle', bass16: false, arp: true, heartbeat: true, clang: false,
    drive: 14, leadType: 'triangle', swingHat: false, hub: false,
  },
  '4': {
    // THE CANOPY: humid, tribal toms + marimba-ish square arps, G dorian-ish, 126
    root: 43, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 126, prog: [0, 3, 4, 3],
    kick: 'x..x..x...x.x...', snare: '...x....x..x..x.', riff: 'm.o.m..om.o.m..o',
    padType: 'triangle', padCut: 1300, bassType: 'square', bass16: false, arp: true, heartbeat: false, clang: false,
    drive: 26, leadType: 'square', swingHat: true, hub: false,
  },
  '5': {
    // THE FRONT: war march, D phrygian, 148, relentless double kick
    root: 38, scale: PHRYGIAN, bpm: 148, prog: [0, 1, 6, 0],
    kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x.x.', riff: 'mmo.mmo.mmmmo.o.',
    padType: 'sawtooth', padCut: 650, bassType: 'sawtooth', bass16: true, arp: false, heartbeat: false, clang: true,
    drive: 75, leadType: 'sawtooth', swingHat: false, hub: false,
  },
  '6': {
    // THE MIRROR: inside the Handler — B locrian-ish, 96, sparse and enormous
    root: 35, scale: [0, 1, 3, 5, 6, 8, 10], bpm: 96, prog: [0, 1, 4, 0],
    kick: 'x...........x...', snare: '........x.......', riff: 'o.......o.o.....',
    padType: 'sawtooth', padCut: 500, bassType: 'sine', bass16: false, arp: true, heartbeat: true, clang: false,
    drive: 30, leadType: 'sine', swingHat: false, hub: false,
  },
  hub: {
    root: 38,
    scale: MINOR,
    bpm: 72,
    prog: [0, 5, 3, 4],
    kick: '................',
    snare: '................',
    riff: '................',
    padType: 'triangle',
    padCut: 1100,
    bassType: 'sine',
    bass16: false,
    arp: false,
    heartbeat: false,
    clang: false,
    drive: 10,
    leadType: 'sine',
    swingHat: false,
    hub: true,
  },
};

const LOOKAHEAD = 0.12; // seconds scheduled ahead
const TICK_MS = 25;
const FADE_TC = 0.2; // setTargetAtTime constant -> ~0.6s to settle

const hz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** deterministic PRNG for stable melodies per biome */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function driveCurve(k: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return c;
}

// ====================================================================== state

class MusicSystem {
  private ctx: AudioContext;
  private bus: GainNode; // all stems -> bus -> tone -> musicBus
  private tone: BiquadFilterNode;
  private layers: Record<LayerName, GainNode>;
  private on: Record<LayerName, boolean> = { base: true, combat: false, aggression: false, rampage: false, boss: false };
  private offUntil: Record<LayerName, number> = { base: 0, combat: 0, aggression: 0, rampage: 0, boss: 0 };

  // persistent per-stem processing
  private padFilter: BiquadFilterNode;
  private riffIn: GainNode;
  private riffShaper: WaveShaperNode;
  private riffFilter: BiquadFilterNode;
  private leadIn: GainNode;
  private leadShaper: WaveShaperNode;
  private choirIn: GainNode;
  private drumBus: GainNode;

  private biome: Biome = BIOMES['0'];
  private biomeId: BiomeId = 0;
  private pendingBiome: BiomeId | null = null;
  private lead: (number | null)[][] = [];

  private timer: ReturnType<typeof setInterval> | null = null;
  private playing = false;
  private dead = false;
  private silencedUntil = 0;
  private step = 0;
  private nextTime = 0;
  private intensity = 0.6;

  constructor() {
    const ctx = audio.ctx;
    this.ctx = ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = 0;
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.Q.value = 0.6;
    this.tone.frequency.value = this.toneFreq(this.intensity);
    this.bus.connect(this.tone);
    this.tone.connect(audio.musicBus);
    const send = ctx.createGain();
    send.gain.value = 0.18;
    this.bus.connect(send);
    send.connect(audio.reverbSend);

    const mk = (v: number): GainNode => {
      const g = ctx.createGain();
      g.gain.value = v;
      g.connect(this.bus);
      return g;
    };
    this.layers = { base: mk(1), combat: mk(0), aggression: mk(0), rampage: mk(0), boss: mk(0) };

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.Q.value = 1.2;
    this.padFilter.connect(this.layers.base);

    this.drumBus = ctx.createGain();
    this.drumBus.gain.value = 1;
    this.drumBus.connect(this.layers.combat);

    this.riffIn = ctx.createGain();
    this.riffShaper = ctx.createWaveShaper();
    this.riffShaper.oversample = '2x';
    this.riffFilter = ctx.createBiquadFilter();
    this.riffFilter.type = 'lowpass';
    this.riffFilter.frequency.value = 2600;
    this.riffFilter.Q.value = 1.4;
    const riffHp = ctx.createBiquadFilter();
    riffHp.type = 'highpass';
    riffHp.frequency.value = 70;
    this.riffIn.connect(this.riffShaper);
    this.riffShaper.connect(this.riffFilter);
    this.riffFilter.connect(riffHp);
    riffHp.connect(this.layers.aggression);

    this.leadIn = ctx.createGain();
    this.leadShaper = ctx.createWaveShaper();
    this.leadShaper.curve = driveCurve(18);
    const leadLp = ctx.createBiquadFilter();
    leadLp.type = 'lowpass';
    leadLp.frequency.value = 4200;
    leadLp.Q.value = 2;
    this.leadIn.connect(this.leadShaper);
    this.leadShaper.connect(leadLp);
    leadLp.connect(this.layers.rampage);

    // choir: parallel "ah" formants
    this.choirIn = ctx.createGain();
    for (const [f, q, g] of [
      [800, 5, 1],
      [1150, 6, 0.6],
      [2900, 8, 0.2],
    ] as const) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = q;
      const gg = ctx.createGain();
      gg.gain.value = g;
      this.choirIn.connect(bp);
      bp.connect(gg);
      gg.connect(this.layers.boss);
    }

    this.applyBiome(0);
  }

  private toneFreq(x: number): number {
    return Math.min(20000, 900 * Math.pow(2, Math.max(0, Math.min(1, x)) * 4.5));
  }

  // ----------------------------------------------------------------- public

  start(): void {
    try {
      this.dead = false;
      this.fadeBus(1, 0.4);
      if (this.playing) return;
      this.playing = true;
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.06;
      if (this.timer === null) this.timer = setInterval(() => this.tick(), TICK_MS);
      this.tick();
    } catch {
      /* ignore */
    }
  }

  stop(): void {
    try {
      this.playing = false;
      if (this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.fadeBus(0, 0.4);
    } catch {
      /* ignore */
    }
  }

  setBiome(b: BiomeId): void {
    try {
      if (b === this.biomeId && this.pendingBiome === null) return;
      // switching to/from hub is immediate; otherwise wait for the next bar
      if (!this.playing || b === 'hub' || this.biomeId === 'hub') {
        this.pendingBiome = null;
        this.applyBiome(b);
        if (this.playing) this.step = 0;
      } else {
        this.pendingBiome = b;
      }
    } catch {
      /* ignore */
    }
  }

  setLayers(l: { combat: boolean; aggression: boolean; rampage: boolean; boss: boolean }): void {
    try {
      this.setLayer('combat', !!l.combat);
      this.setLayer('aggression', !!l.aggression);
      this.setLayer('rampage', !!l.rampage);
      this.setLayer('boss', !!l.boss);
    } catch {
      /* ignore */
    }
  }

  death(): void {
    try {
      if (this.dead) return;
      this.dead = true;
      const t = this.ctx.currentTime;
      this.fadeBus(0, 0.25);
      // single sustained note, fading over ~4s
      const g = this.ctx.createGain();
      g.connect(audio.musicBus);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, t);
      lp.frequency.exponentialRampToValueAtTime(200, t + 4);
      lp.connect(g);
      const send = this.ctx.createGain();
      send.gain.value = 0.5;
      g.connect(send);
      send.connect(audio.reverbSend);
      const f = hz(this.biome.root + 12);
      const oscs: OscillatorNode[] = [];
      for (const [type, mul, det] of [
        ['triangle', 1, 0],
        ['sawtooth', 1, 6],
        ['sine', 0.5, 0],
      ] as const) {
        const o = this.ctx.createOscillator();
        o.type = type;
        o.frequency.value = f * mul;
        o.detune.value = det;
        o.connect(lp);
        o.start(t);
        o.stop(t + 4.4);
        oscs.push(o);
      }
      oscs[0].onended = () => {
        for (const o of oscs) o.disconnect();
        lp.disconnect();
        g.disconnect();
        send.disconnect();
      };
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    try {
      this.dead = false;
      this.silencedUntil = 0;
      this.fadeBus(1, 0.6);
      this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.05);
      if (!this.playing) this.start();
    } catch {
      /* ignore */
    }
  }

  silence(sec: number): void {
    try {
      const t = this.ctx.currentTime;
      const until = t + Math.max(0, sec);
      this.silencedUntil = until;
      const g = this.bus.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + 0.3);
      g.setValueAtTime(0, Math.max(t + 0.3, until));
      if (!this.dead) g.linearRampToValueAtTime(1, Math.max(t + 0.3, until) + 0.4);
    } catch {
      /* ignore */
    }
  }

  setIntensity(x: number): void {
    try {
      this.intensity = Math.max(0, Math.min(1, x));
      this.tone.frequency.setTargetAtTime(this.toneFreq(this.intensity), this.ctx.currentTime, 0.3);
    } catch {
      /* ignore */
    }
  }

  // --------------------------------------------------------------- internal

  private fadeBus(v: number, time: number): void {
    const t = this.ctx.currentTime;
    const g = this.bus.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(v, t + time);
  }

  private setLayer(name: LayerName, v: boolean): void {
    if (this.on[name] === v) return;
    this.on[name] = v;
    const t = this.ctx.currentTime;
    if (!v) this.offUntil[name] = t + 1.2;
    this.layers[name].gain.cancelScheduledValues(t);
    this.layers[name].gain.setTargetAtTime(v ? 1 : 0, t, FADE_TC);
  }

  private active(name: LayerName, t: number): boolean {
    if (this.biome.hub && name !== 'base') return false;
    return this.on[name] || t < this.offUntil[name];
  }

  private applyBiome(b: BiomeId): void {
    this.biomeId = b;
    this.biome = BIOMES[String(b)] ?? BIOMES['0'];
    const t = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(this.biome.padCut, t, 0.5);
    this.riffShaper.curve = driveCurve(this.biome.drive);
    this.lead = this.makeLead(typeof b === 'number' ? b + 1 : 9);
  }

  /** 4 bars x 16 steps of scale-degree offsets (null = rest/hold) */
  private makeLead(seed: number): (number | null)[][] {
    const r = mulberry(seed * 7919);
    const rhythms = ['x.x.x.xxx.x.x.xx', 'x..x..x.x.x.xxx.', 'x.xxx.x.x..xx.x.', 'xxx.x.x.x.xxx.x.'];
    const bars: (number | null)[][] = [];
    let deg = 4;
    for (let bar = 0; bar < 4; bar++) {
      const rh = rhythms[Math.floor(r() * rhythms.length)];
      const row: (number | null)[] = [];
      for (let s = 0; s < 16; s++) {
        if (rh[s] !== 'x') {
          row.push(null);
          continue;
        }
        // random walk biased toward chord tones (0,2,4,7)
        const stepBy = [-2, -1, 1, 2, 3, -3][Math.floor(r() * 6)];
        deg = Math.max(0, Math.min(11, deg + stepBy));
        if (s === 0 || r() < 0.3) deg = [0, 2, 4, 7][Math.floor(r() * 4)];
        row.push(deg);
      }
      bars.push(row);
    }
    return bars;
  }

  private scaleNote(deg: number): number {
    const sc = this.biome.scale;
    const o = Math.floor(deg / sc.length);
    return sc[((deg % sc.length) + sc.length) % sc.length] + 12 * o;
  }

  private tick(): void {
    try {
      if (!this.playing) return;
      const now = this.ctx.currentTime;
      // fell behind (background tab / long suspend): resync instead of bursting
      if (this.nextTime < now - 0.2) this.nextTime = now + 0.03;
      while (this.nextTime < now + LOOKAHEAD) {
        const sd = 60 / this.biome.bpm / 4;
        this.scheduleStep(this.step, this.nextTime, sd);
        this.nextTime += 60 / this.biome.bpm / 4;
        this.step++;
      }
    } catch {
      /* ignore */
    }
  }

  private scheduleStep(s: number, t: number, sd: number): void {
    const st = s % 16;
    if (st === 0 && this.pendingBiome !== null) {
      this.applyBiome(this.pendingBiome);
      this.pendingBiome = null;
    }
    if (this.dead || t < this.silencedUntil) return;
    const B = this.biome;
    const bar = Math.floor(s / 16) % 4;
    const deg = B.prog[bar];
    const chordRoot = B.root + this.scaleNote(deg);
    const triad = [deg, deg + 2, deg + 4].map((d) => B.root + this.scaleNote(d));
    const barLen = sd * 16;

    // ------------------------------------------------ base
    if (this.active('base', t)) {
      if (B.hub) {
        if (st === 0 && bar % 2 === 0) {
          for (const m of triad) {
            this.osc(this.padFilter, 'triangle', hz(m + 12), t, 1.2, barLen * 2, 1.5, 0.06, 5);
            this.osc(this.padFilter, 'sine', hz(m + 24), t, 1.5, barLen * 2, 1.5, 0.03, -4);
          }
          this.osc(this.layers.base, 'sine', hz(chordRoot - 12), t, 1.5, barLen * 2, 1.5, 0.12);
        }
        if (st === 6 && bar === 1) {
          const m = B.root + 36 + this.scaleNote([0, 2, 4, 6][Math.floor(Math.random() * 4)]);
          this.osc(this.layers.base, 'sine', hz(m), t, 0.005, 0.01, 2.2, 0.05);
          this.osc(this.layers.base, 'sine', hz(m) * 2.76, t, 0.005, 0.01, 0.8, 0.01);
        }
      } else {
        if (st === 0) {
          for (const m of triad) {
            this.osc(this.padFilter, B.padType, hz(m + 12), t, 0.25, barLen - 0.25, 0.4, 0.035, -8);
            this.osc(this.padFilter, B.padType, hz(m + 12), t, 0.25, barLen - 0.25, 0.4, 0.035, 8);
          }
        }
        const bassHit = B.bass16 ? true : st % 2 === 0;
        if (bassHit) {
          const accent = st % 4 === 0;
          this.bass(chordRoot, t, B.bass16 ? sd * 0.9 : sd * 1.6, accent ? 0.22 : 0.14, B.bassType);
        }
        if (B.arp) {
          const order = [0, 1, 2, 1, 0, 2, 1, 2];
          const m = triad[order[st % order.length]] + 24 + (st >= 8 ? 12 : 0);
          this.osc(this.layers.base, st % 2 ? 'square' : 'triangle', hz(m), t, 0.003, 0.01, sd * 1.8, st % 4 === 0 ? 0.06 : 0.035, 0, 3500);
        }
        if (B.heartbeat && (st === 0 || st === 3)) {
          this.kick(this.layers.base, t, st === 0 ? 0.35 : 0.25, false);
        }
      }
    }

    // ------------------------------------------------ combat drums
    const boss = this.active('boss', t);
    const ramp = this.active('rampage', t);
    if (this.active('combat', t)) {
      if (B.kick[st] === 'x') this.kick(this.drumBus, t, 0.8, boss);
      if (boss && st >= 12 && bar % 2 === 1) this.kick(this.drumBus, t, 0.55, true);
      if (B.snare[st] === 'x') this.snare(t, 0.5);
      const hatStep = ramp ? true : st % 2 === 0;
      if (hatStep) {
        const off = st % 4 === 2;
        const tt = B.swingHat && st % 2 === 1 ? t + sd * 0.15 : t;
        this.hat(tt, off ? 0.12 : 0.07, off && !ramp ? 0.09 : 0.03);
      }
      if (B.clang && st === 0 && bar % 2 === 0) this.clang(t);
      if (st === 0 && bar === 0) this.crash(t, boss ? 0.25 : 0.15);
      if (bar === 3 && st >= 12 && (boss || ramp)) this.tom(t, 90 + (15 - st) * 15);
    }

    // ------------------------------------------------ aggression riff
    if (this.active('aggression', t)) {
      const c = B.riff[st];
      if (c === 'o' || c === 'm') {
        const open = c === 'o';
        const r = chordRoot - 12;
        for (const m of [r, r + 7, r + 12]) {
          this.osc(this.riffIn, 'sawtooth', hz(m), t, 0.003, open ? sd * 2 : sd * 0.4, open ? 0.25 : 0.06, open ? 0.09 : 0.08, -7, open ? 0 : 900);
          this.osc(this.riffIn, 'sawtooth', hz(m), t, 0.003, open ? sd * 2 : sd * 0.4, open ? 0.25 : 0.06, open ? 0.07 : 0.06, 7, open ? 0 : 900);
        }
      }
    }

    // ------------------------------------------------ rampage lead
    if (ramp) {
      const row = this.lead[bar];
      const d = row ? row[st] : null;
      if (d !== null && d !== undefined) {
        let len = 1;
        while (st + len < 16 && row[st + len] === null) len++;
        const m = B.root + 24 + this.scaleNote(deg + d);
        const dur = sd * len * 0.92;
        this.leadNote(hz(m), t, dur);
      }
    }

    // ------------------------------------------------ boss choir
    if (boss && st === 0) {
      for (const m of [chordRoot, ...triad.map((x) => x + 12)]) {
        this.osc(this.choirIn, 'sawtooth', hz(m), t, 0.5, barLen - 0.4, 0.6, 0.08, -10);
        this.osc(this.choirIn, 'sawtooth', hz(m), t, 0.5, barLen - 0.4, 0.6, 0.08, 10);
      }
      this.osc(this.layers.boss, 'sine', hz(B.root - 12), t, 0.3, barLen - 0.3, 0.5, 0.18);
    }
  }

  // ------------------------------------------------------------ instruments

  /**
   * Generic enveloped oscillator: attack a, hold h (sustain), release r.
   * Optional lowpass with cutoff (adds a per-note filter).
   */
  private osc(dest: AudioNode, type: OscillatorType, f: number, t: number, a: number, h: number, r: number, peak: number, detune = 0, cutoff = 0): void {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + Math.max(0, h));
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + Math.max(0, h) + r);
    let filt: BiquadFilterNode | null = null;
    if (cutoff > 0) {
      filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = cutoff;
      o.connect(filt);
      filt.connect(g);
    } else {
      o.connect(g);
    }
    g.connect(dest);
    o.onended = () => {
      o.disconnect();
      if (filt) filt.disconnect();
      g.disconnect();
    };
    o.start(t);
    o.stop(t + a + Math.max(0, h) + r + 0.02);
  }

  private bass(m: number, t: number, len: number, peak: number, type: OscillatorType): void {
    const ctx = this.ctx;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 4;
    const open = 300 + this.intensity * 1400;
    f.frequency.setValueAtTime(open, t);
    f.frequency.exponentialRampToValueAtTime(110, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    f.connect(g);
    g.connect(this.layers.base);
    const o1 = ctx.createOscillator();
    o1.type = type;
    o1.frequency.value = hz(m);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = hz(m);
    const sub = ctx.createGain();
    sub.gain.value = 0.8;
    o1.connect(f);
    o2.connect(sub);
    sub.connect(g);
    o1.onended = () => {
      o1.disconnect();
      o2.disconnect();
      sub.disconnect();
      f.disconnect();
      g.disconnect();
    };
    o1.start(t);
    o2.start(t);
    o1.stop(t + len + 0.02);
    o2.stop(t + len + 0.02);
  }

  private leadNote(f: number, t: number, dur: number): void {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.008);
    g.gain.setValueAtTime(0.08, t + Math.max(0.01, dur - 0.03));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    g.connect(this.leadIn);
    const vib = ctx.createOscillator();
    vib.frequency.value = 6.5;
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(0, t);
    vg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.25, dur));
    vib.connect(vg);
    const oscs: OscillatorNode[] = [vib];
    for (const det of [-9, 9]) {
      const o = ctx.createOscillator();
      o.type = this.biome.leadType;
      // slight scoop into the note for that screaming feel
      o.frequency.setValueAtTime(f * 0.94, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
      o.detune.value = det;
      vg.connect(o.frequency);
      o.connect(g);
      oscs.push(o);
    }
    const end = t + dur + 0.1;
    oscs[0].onended = () => {
      for (const o of oscs) o.disconnect();
      vg.disconnect();
      g.disconnect();
    };
    for (const o of oscs) {
      o.start(t);
      o.stop(end);
    }
  }

  private noiseHit(dest: AudioNode, t: number, type: BiquadFilterType, f: number, q: number, d: number, peak: number): void {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = audio.noiseBuffer;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl);
    fl.connect(g);
    g.connect(dest);
    s.onended = () => {
      s.disconnect();
      fl.disconnect();
      g.disconnect();
    };
    s.start(t, Math.random() * 1.5);
    s.stop(t + d + 0.02);
  }

  private kick(dest: AudioNode, t: number, peak: number, heavy: boolean): void {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(heavy ? 170 : 150, t);
    o.frequency.exponentialRampToValueAtTime(heavy ? 38 : 45, t + (heavy ? 0.14 : 0.1));
    const g = ctx.createGain();
    const len = heavy ? 0.4 : 0.28;
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g);
    let sh: WaveShaperNode | null = null;
    if (heavy) {
      sh = ctx.createWaveShaper();
      sh.curve = driveCurve(4);
      g.connect(sh);
      sh.connect(dest);
    } else {
      g.connect(dest);
    }
    o.onended = () => {
      o.disconnect();
      g.disconnect();
      if (sh) sh.disconnect();
    };
    o.start(t);
    o.stop(t + len + 0.02);
    this.noiseHit(dest, t, 'highpass', 3000, 0.7, 0.008, peak * 0.3);
  }

  private snare(t: number, peak: number): void {
    this.noiseHit(this.drumBus, t, 'bandpass', 1900, 0.8, 0.18, peak);
    this.noiseHit(this.drumBus, t, 'highpass', 5000, 0.7, 0.08, peak * 0.4);
    this.osc(this.drumBus, 'triangle', 190, t, 0.001, 0, 0.09, peak * 0.5);
  }

  private hat(t: number, peak: number, d: number): void {
    this.noiseHit(this.drumBus, t, 'highpass', 7500, 0.7, d, peak);
  }

  private crash(t: number, peak: number): void {
    this.noiseHit(this.drumBus, t, 'highpass', 4500, 0.5, 1.3, peak);
  }

  private tom(t: number, f: number): void {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g);
    g.connect(this.drumBus);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
    o.start(t);
    o.stop(t + 0.27);
  }

  /** FOUNDRY anvil clang: inharmonic partials */
  private clang(t: number): void {
    const base = 520;
    [1, 2.76, 5.4, 8.93].forEach((r, i) => {
      this.osc(this.drumBus, 'sine', base * r, t, 0.001, 0, 0.5 / (1 + i * 0.7), 0.09 / (1 + i));
    });
    this.noiseHit(this.drumBus, t, 'bandpass', 3000, 2, 0.04, 0.15);
  }
}

let system: MusicSystem | null = null;
function sys(): MusicSystem | null {
  if (system) return system;
  try {
    system = new MusicSystem();
  } catch {
    system = null;
  }
  return system;
}

export const music = {
  start(): void {
    sys()?.start();
  },
  stop(): void {
    sys()?.stop();
  },
  setBiome(b: number | 'hub'): void {
    sys()?.setBiome(b);
  },
  setLayers(l: { combat: boolean; aggression: boolean; rampage: boolean; boss: boolean }): void {
    sys()?.setLayers(l);
  },
  death(): void {
    sys()?.death();
  },
  resume(): void {
    sys()?.resume();
  },
  silence(sec: number): void {
    sys()?.silence(sec);
  },
  setIntensity(x: number): void {
    sys()?.setIntensity(x);
  },
};
