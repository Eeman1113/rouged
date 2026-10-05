/**
 * ROUGED dynamic procedural metal.
 *
 * A 16th-note step sequencer (lookahead scheduling against ctx.currentTime) that
 * arranges a full industrial/djent band per biome:
 *
 *   base       pads, pulse bass and a biome "color" (anvils, arps, heartbeat, music box,
 *              tribal toms, march snares, glitch swells)
 *   combat     THE DROP: kit (pre-rendered kick/snare/hats/cymbals), double-tracked
 *              palm-muted guitars through an amp-sim + cab chain, FM growl bass
 *   aggression denser riff variant, open hats, china on every bar, ghost notes
 *   rampage    16th double-kick, 16th hats + ride bell, screaming lead with glide/vibrato/delay
 *   boss       half-time breakdown riff, war drums, choir + brass, sub drops
 *
 * Transitions are musical, not instant: layer changes are quantised to the next
 * beat / half-bar / bar, the combat drop is preceded by a riser, a reverse cymbal and
 * a snare roll + tom fill, then lands with crash + impact. Leaving combat fades the
 * band through a closing lowpass. Biome changes happen on bar lines with a filter
 * sweep. death() tape-stops everything (all sources share a pitch-bend bus) and
 * leaves one sustained note. silence() closes a filter while fading, and the music
 * re-enters on a downbeat with an impact.
 *
 * CPU: drums, chugs and FX are pre-rendered AudioBuffers (one source + one gain
 * per hit); stems that are faded out are not scheduled; nodes disconnect on end.
 */
import { audio } from './engine';
import * as S from './synth';

type BiomeId = number | 'hub' | 'happy';
type Layer = 'combat' | 'aggression' | 'rampage' | 'boss';
const LAYERS: readonly Layer[] = ['combat', 'aggression', 'rampage', 'boss'];
type Color = 'anvil' | 'arp' | 'heart' | 'musicbox' | 'tribal' | 'march' | 'glitch' | 'none';

interface BiomeDef {
  bpm: number;
  root: number; // guitar root midi (low string)
  scale: number[];
  prog: number[]; // chord scale-degree per bar (4-bar phrase)
  riff: string; // 32 steps (2 bars)
  riffAgg: string; // 32 steps, denser
  breakdown: string; // 32 steps, half-time boss breakdown
  padType: OscillatorType;
  padCut: number;
  drive: number; // amp gain
  color: Color;
  leadType: OscillatorType;
  swing: number;
  hub?: boolean;
  /** hub-style ambient with a music-box melody on top (THE HAPPY PLACE) */
  sparkle?: boolean;
}

const MINOR = [0, 2, 3, 5, 7, 8, 10];
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];
const HARM_MINOR = [0, 2, 3, 5, 7, 8, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const LOCRIAN = [0, 1, 3, 5, 6, 8, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/*
 * Riff notation (16 chars per bar): lowercase = palm-muted chug, uppercase = open
 * power chord, letter = semitone offset from the bar root (a=0, b=1 ... m=12),
 * '-' holds the previous open chord, '!' = pinch-harmonic squeal, '.' = rest.
 */
const BIOMES: Record<string, BiomeDef> = {
  // FOUNDRY: rust, anvils, E minor
  '0': {
    bpm: 140, root: 40, scale: MINOR, prog: [0, 0, 5, 6],
    riff: 'aa.aa.aaA---aa.a' + 'aa.aa.aaF---D-c-',
    riffAgg: 'aaaa.aaaA-aaaa.a' + 'aaaa.aaaF-aaD-C-',
    breakdown: 'A-----a.a...a.A-' + 'B-----a.a...!...',
    padType: 'sawtooth', padCut: 1100, drive: 11, color: 'anvil', leadType: 'sawtooth', swing: 0,
  },
  // ARCHIVE: cold servers, D minor, syncopated groupings of three
  '1': {
    bpm: 150, root: 38, scale: MINOR, prog: [0, 0, 6, 5],
    riff: 'a..a..a..a..a.a.' + 'a..a..a..a..D-C-',
    riffAgg: 'aa.aa.aa.aa.aaa.' + 'aa.aa.aa.aa.F-D-',
    breakdown: 'A--.a..A--.a..a.' + 'B--.a..B--.!...a',
    padType: 'triangle', padCut: 1900, drive: 9, color: 'arp', leadType: 'square', swing: 0,
  },
  // THE CORE: red, organic, C# phrygian
  '2': {
    bpm: 160, root: 37, scale: PHRYGIAN, prog: [0, 0, 1, 0],
    riff: 'aab.aab.aabaA-B-' + 'aab.aab.aaba!...',
    riffAgg: 'aabaaabaaabaA-B-' + 'aabaaabaaabaH-G-',
    breakdown: 'A-------a.a.B---' + 'A-------a.a.a!..',
    padType: 'sawtooth', padCut: 800, drive: 14, color: 'heart', leadType: 'sawtooth', swing: 0,
  },
  // THE NURSERY: sterile, a wrong lullaby over the chugs, A harmonic minor
  '3': {
    bpm: 132, root: 33, scale: HARM_MINOR, prog: [0, 0, 5, 4],
    riff: 'a.a.aa.aG---a.a.' + 'a.a.aa.aF---L-G-',
    riffAgg: 'aaa.aaa.G-aaa.a.' + 'aaa.aaa.F-aaL-G-',
    breakdown: 'A-----G-----a.a.' + 'A-----F-----!.a.',
    padType: 'sine', padCut: 2400, drive: 10, color: 'musicbox', leadType: 'triangle', swing: 0,
  },
  // THE CANOPY: jungle, tribal toms + synth, G dorian
  '4': {
    bpm: 145, root: 31, scale: DORIAN, prog: [0, 0, 6, 3],
    riff: 'a.aa.aa.a.aaF-D-' + 'a.aa.aa.a.aaJ-H-',
    riffAgg: 'aaaa.aaaa.aaF-D-' + 'aaaa.aaaa.aaJ-H-',
    breakdown: 'A---a.a.A---a.a.' + 'F---a.a.D---!...',
    padType: 'triangle', padCut: 1500, drive: 10, color: 'tribal', leadType: 'square', swing: 0.12,
  },
  // THE FRONT: war march, relentless gallops, D phrygian
  '5': {
    bpm: 175, root: 38, scale: PHRYGIAN, prog: [0, 0, 1, 6],
    riff: 'a.aaa.aaa.aaA-B-' + 'a.aaa.aaa.aaH-G-',
    riffAgg: 'aaaaaaaaaaaaA-B-' + 'aaaaaaaaaaaaH-G-',
    breakdown: 'A---B---a.a.a.a.' + 'A---H---G---!...',
    padType: 'sawtooth', padCut: 750, drive: 15, color: 'march', leadType: 'sawtooth', swing: 0,
  },
  // THE MIRROR: inside the AI, vast and glitched, B locrian
  '6': {
    bpm: 136, root: 35, scale: LOCRIAN, prog: [0, 0, 1, 4],
    riff: 'a..a..a.F---a.b.' + 'a..a..a.G---b.a.',
    riffAgg: 'aa.aa.aaF---aabb' + 'aa.aa.aaG---bbaa',
    breakdown: 'A-------B-------' + 'G-------a.a.!...',
    padType: 'sawtooth', padCut: 650, drive: 13, color: 'glitch', leadType: 'sawtooth', swing: 0,
  },
  hub: {
    bpm: 72, root: 38, scale: MINOR, prog: [0, 5, 3, 4],
    riff: '.'.repeat(32), riffAgg: '.'.repeat(32), breakdown: '.'.repeat(32),
    padType: 'triangle', padCut: 1100, drive: 4, color: 'none', leadType: 'sine', swing: 0, hub: true,
  },
  // THE HAPPY PLACE: F major, I–IV–vi–V, a music box that is only slightly wrong
  happy: {
    bpm: 84, root: 41, scale: MAJOR, prog: [0, 3, 5, 4],
    riff: '.'.repeat(32), riffAgg: '.'.repeat(32), breakdown: '.'.repeat(32),
    padType: 'triangle', padCut: 2600, drive: 3, color: 'none', leadType: 'sine', swing: 0, hub: true, sparkle: true,
  },
};

const LOOKAHEAD = 0.14;
const TICK_MS = 25;
const MAX_VOICES = 260;

interface RiffStep {
  k: 0 | 1 | 2 | 3 | 4; // none, chug, open, pinch, hold
  off: number;
  len: number; // steps (open chords)
}

interface LeadEv {
  deg: number;
  len: number;
}

function parseRiff(s: string): RiffStep[] {
  const out: RiffStep[] = [];
  for (let i = 0; i < 32; i++) {
    const c = s[i] ?? '.';
    if (c === '.') out.push({ k: 0, off: 0, len: 0 });
    else if (c === '-') out.push({ k: 4, off: 0, len: 0 });
    else if (c === '!') out.push({ k: 3, off: 0, len: 3 });
    else {
      const lower = c.toLowerCase();
      const off = lower.charCodeAt(0) - 97;
      if (c === lower) out.push({ k: 1, off, len: 1 });
      else {
        let len = 1;
        while (i + len < 32 && s[i + len] === '-') len++;
        out.push({ k: 2, off, len });
      }
    }
  }
  return out;
}

const RHYTHMS: number[][] = [
  [4, 2, 2, 4, 2, 2],
  [3, 3, 2, 3, 3, 2],
  [2, 2, 2, 2, 4, 4],
  [6, 2, 4, 4],
  [3, 3, 3, 3, 4],
  [2, 1, 1, 2, 2, 4, 4],
  [4, 4, 2, 2, 2, 2],
];

function driveCurve(k: number): Float32Array<ArrayBuffer> {
  const n = 2048;
  const c = new Float32Array(n);
  const norm = Math.tanh(k);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    // slightly asymmetric for even harmonics (tube-ish), DC removed later by highpass
    c[i] = Math.tanh(k * (x + 0.12 * x * x)) / norm;
  }
  return c;
}

const hz = S.mtof;

type Src = OscillatorNode | AudioBufferSourceNode;

// ====================================================================== state

class MusicSystem {
  private ctx: AudioContext;
  private sr: number;

  // ---- mix graph
  private mix: GainNode;
  private bus: GainNode; // silence / stop / death fades
  private tone: BiquadFilterNode; // global intensity lowpass
  private fxOut: GainNode; // risers, impacts, fills (bypasses silence so pre-boss swells play)
  private bend: ConstantSourceNode | null = null; // tape-stop pitch bus (cents)

  private padFilter: BiquadFilterNode;
  private pulseLP: BiquadFilterNode;
  private padFader: GainNode;
  private pump: GainNode; // sidechain pump (pads / boss pads) on kicks
  private combatBus: GainNode;
  private combatLP: BiquadFilterNode;
  private drumIn: GainNode;
  private drumRoom: GainNode;
  private drumFader: GainNode;
  private gtrIn: GainNode[] = [];
  private gtrShaper: WaveShaperNode[] = [];
  private gtrFader: GainNode;
  private bassIn: GainNode;
  private bassFader: GainNode;
  private leadIn: GainNode;
  private leadDelay: DelayNode;
  private leadFader: GainNode;
  private choirIn: GainNode;
  private bossFader: GainNode;

  // ---- buffers
  private B: Record<string, AudioBuffer> = {};
  private chugCache = new Map<string, AudioBuffer>();
  private riserBuf: AudioBuffer | null = null;

  // ---- arrangement
  private def: BiomeDef = BIOMES['0'];
  private biomeId: BiomeId = 0;
  private pendingBiome: BiomeId | null = null;
  private pendingBiomeStep = 0;
  private riff: RiffStep[] = [];
  private riffAgg: RiffStep[] = [];
  private breakdown: RiffStep[] = [];
  private progSemis: number[] = [0, 0, 0, 0];
  private lead: (LeadEv | null)[] = [];
  private lullaby: number[] = [];

  // ---- layers
  private want: Record<Layer, boolean> = { combat: false, aggression: false, rampage: false, boss: false };
  private on: Record<Layer, boolean> = { combat: false, aggression: false, rampage: false, boss: false };
  private onSince: Record<Layer, number> = { combat: 0, aggression: 0, rampage: 0, boss: 0 };
  private pend: Record<Layer, number | null> = { combat: null, aggression: null, rampage: null, boss: null };
  private offUntil: Record<Layer, number> = { combat: 0, aggression: 0, rampage: 0, boss: 0 };

  // ---- lead voice (persistent while rampage plays, for real portamento)
  private leadVoice: { oscs: OscillatorNode[]; env: GainNode; vib: GainNode; lfo: OscillatorNode; lastEnd: number } | null = null;

  // ---- transport
  private timer: ReturnType<typeof setInterval> | null = null;
  private playing = false;
  private dead = false;
  private needsReentry = true;
  private silencedUntil = 0;
  private step = 0;
  private nextTime = 0;
  private intensity = 0;
  private lastToneI = -1;
  private toneLockUntil = 0;
  private voices = 0;
  private prevHit = false;

  constructor() {
    const ctx = audio.ctx;
    this.ctx = ctx;
    this.sr = ctx.sampleRate;
    const g = (v: number, dest?: AudioNode | AudioParam): GainNode => {
      const n = ctx.createGain();
      n.gain.value = v;
      if (dest instanceof AudioParam) n.connect(dest);
      else if (dest) n.connect(dest);
      return n;
    };
    const f = (type: BiquadFilterType, freq: number, q: number, dest?: AudioNode, gainDb = 0): BiquadFilterNode => {
      const n = ctx.createBiquadFilter();
      n.type = type;
      n.frequency.value = freq;
      n.Q.value = q;
      n.gain.value = gainDb;
      if (dest) n.connect(dest);
      return n;
    };

    // master section: mix -> bus -> tone -> hp -> musicBus (+ reverb send)
    const hp = f('highpass', 28, 0.7, audio.musicBus);
    this.tone = f('lowpass', 6000, 0.5, hp);
    this.bus = g(0, this.tone);
    // band sits ~-15 dB RMS at the master in combat so guns / kills punch over it
    this.mix = g(0.55, this.bus);
    const verb = g(0.1, audio.reverbSend);
    this.tone.connect(verb);
    this.fxOut = g(1, audio.musicBus);
    const fxVerb = g(0.25, audio.reverbSend);
    this.fxOut.connect(fxVerb);

    try {
      const b = ctx.createConstantSource();
      b.offset.value = 0;
      b.start();
      this.bend = b;
    } catch {
      this.bend = null;
    }

    // ---- base: pads + pulse through pump
    const baseTrim = g(1.5, this.mix);
    this.pump = g(1, baseTrim);
    this.padFader = g(1, this.pump);
    this.padFilter = f('lowpass', 1100, 0.9, this.padFader);
    try {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const lg = g(350, this.padFilter.frequency);
      lfo.connect(lg);
      lfo.start();
    } catch {
      /* ignore */
    }
    this.pulseLP = f('lowpass', 520, 1.2, this.padFader);

    // ---- combat bus with closing lowpass for the exit
    this.combatLP = f('lowpass', 20000, 0.7, this.mix);
    this.combatBus = g(1, this.combatLP);

    // drums: in -> glue comp -> makeup -> fader; snare room via drumRoom
    this.drumFader = g(0, this.combatBus);
    const drumMake = g(1.45, this.drumFader);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 6;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.12;
    comp.connect(drumMake);
    this.drumIn = g(1, comp);
    this.drumRoom = g(0.32, audio.reverbSend);

    // guitars: double-tracked amp sims panned hard-ish L/R
    this.gtrFader = g(0, this.combatBus);
    for (let side = 0; side < 2; side++) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = side ? 0.72 : -0.72;
      pan.connect(this.gtrFader);
      const post = g(0.14, pan);
      const hpOut = f('highpass', 65, 0.7, post);
      const cab2 = f('lowpass', 7600, 0.6, hpOut);
      const cab1 = f('lowpass', 5200, 0.9, cab2);
      const thump = f('peaking', 115, 0.9, cab1, 4);
      const scoop = f('peaking', 480, 1.0, thump, -5);
      const presence = f('peaking', 2600, 1.2, scoop, 3);
      const sh = ctx.createWaveShaper();
      sh.oversample = '2x';
      sh.connect(presence);
      const preGain = g(0.55, sh);
      const mid = f('peaking', 750, 0.8, preGain, 7); // tube-screamer style mid push
      const tight = f('highpass', 85, 0.7, mid); // tighten the low end before the amp
      const input = g(1, tight);
      this.gtrIn.push(input);
      this.gtrShaper.push(sh);
    }

    // bass: in -> grit -> lp -> fader
    this.bassFader = g(0, this.combatBus);
    const bassOut = g(0.42, this.bassFader);
    const bassLp = f('lowpass', 2600, 0.7, bassOut);
    const bassSh = ctx.createWaveShaper();
    bassSh.curve = driveCurve(1.6);
    bassSh.connect(bassLp);
    this.bassIn = g(0.9, bassSh);

    // lead: in -> drive -> presence -> lp -> fader, + dotted-8th feedback delay on the right
    this.leadFader = g(0, this.mix);
    const leadLp = f('lowpass', 6200, 1.1, this.leadFader);
    const leadPres = f('peaking', 2100, 1, leadLp, 4);
    const leadSh = ctx.createWaveShaper();
    leadSh.curve = driveCurve(3.2);
    leadSh.oversample = '2x';
    leadSh.connect(leadPres);
    this.leadIn = g(1, leadSh);
    this.leadDelay = ctx.createDelay(1.5);
    this.leadDelay.delayTime.value = 0.3;
    const fb = g(0.32);
    const dlp = f('lowpass', 3200, 0.7);
    const dpan = ctx.createStereoPanner();
    dpan.pan.value = 0.55;
    const dOut = g(0.38, dpan);
    dpan.connect(this.leadFader);
    leadLp.connect(this.leadDelay);
    this.leadDelay.connect(dlp);
    dlp.connect(fb);
    fb.connect(this.leadDelay);
    dlp.connect(dOut);

    // boss: choir formants + brass, through the pump
    this.bossFader = g(0, this.pump);
    this.choirIn = g(1);
    for (const [fr, q, gg] of [
      [780, 6, 1],
      [1150, 7, 0.55],
      [2800, 9, 0.22],
    ] as const) {
      const bp = f('bandpass', fr, q, g(gg, this.bossFader));
      this.choirIn.connect(bp);
    }
    // a little low body so the choir is not thin
    this.choirIn.connect(f('lowpass', 420, 0.7, g(0.35, this.bossFader)));

    this.buildBuffers();
    this.applyBiome(0, ctx.currentTime, false);
  }

  // ------------------------------------------------------------ buffers

  private toBuf(chs: Float32Array[]): AudioBuffer {
    const b = this.ctx.createBuffer(chs.length, chs[0].length, this.sr);
    for (let c = 0; c < chs.length; c++) b.getChannelData(c).set(chs[c]);
    return b;
  }

  private buildBuffers(): void {
    const sr = this.sr;
    const mk = (k: string, fn: () => Float32Array[]): void => {
      try {
        this.B[k] = this.toBuf(fn());
      } catch {
        /* ignore */
      }
    };
    mk('kick', () => S.renderKick(sr, 0));
    mk('kickT', () => S.renderKick(sr, 1));
    mk('kickH', () => S.renderKick(sr, 2));
    mk('snare', () => S.renderSnare(sr));
    mk('hatC', () => S.renderHat(sr, false));
    mk('hatO', () => S.renderHat(sr, true));
    mk('ride', () => S.renderRide(sr));
    mk('crash', () => S.renderCrash(sr, false));
    mk('china', () => S.renderCrash(sr, true));
    mk('tom', () => S.renderTom(sr));
    mk('impact', () => S.renderImpact(sr));
    mk('sub', () => S.renderSubDrop(sr));
    mk('clang', () => S.renderClang(sr));
    mk('shaker', () => S.renderShaker(sr));
    mk('bell', () => S.renderBell(sr));
    const c = this.B['crash'];
    if (c) {
      const chs: Float32Array[] = [];
      for (let i = 0; i < c.numberOfChannels; i++) chs.push(c.getChannelData(i).slice(0, Math.floor(sr * 1.6)));
      mk('revCrash', () => S.reverse(chs));
    }
  }

  private riser(): AudioBuffer | null {
    if (!this.riserBuf) {
      try {
        this.riserBuf = this.toBuf(S.renderRiser(this.sr, 4));
      } catch {
        this.riserBuf = null;
      }
    }
    return this.riserBuf;
  }

  private chugBuf(midi: number, side: number, bass: boolean): AudioBuffer | null {
    const key = (bass ? 'b' : 'g') + midi + ':' + side;
    let b = this.chugCache.get(key);
    if (!b) {
      try {
        b = this.toBuf(bass ? S.renderBassChug(this.sr, midi) : S.renderChug(this.sr, midi, side));
      } catch {
        return null;
      }
      if (this.chugCache.size > 96) this.chugCache.clear();
      this.chugCache.set(key, b);
    }
    return b;
  }

  // ------------------------------------------------------------ public

  start(): void {
    try {
      if (this.dead) this.revive();
      if (this.playing) return;
      this.playing = true;
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.06;
      this.needsReentry = true;
      this.fxOut.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02);
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
      const t = this.ctx.currentTime;
      this.bus.gain.setTargetAtTime(0, t, 0.12);
      this.fxOut.gain.setTargetAtTime(0, t, 0.12);
      this.needsReentry = true;
      this.killLead(t + 0.6);
    } catch {
      /* ignore */
    }
  }

  setBiome(b: BiomeId): void {
    try {
      if (b === this.biomeId && this.pendingBiome === null) return;
      if (b === this.biomeId) {
        this.pendingBiome = null;
        return;
      }
      const now = this.ctx.currentTime;
      const hubSwap = !!BIOMES[String(b)]?.hub || !!BIOMES[String(this.biomeId)]?.hub;
      if (!this.playing || hubSwap || this.needsReentry || this.dead) {
        this.pendingBiome = null;
        this.applyBiome(b, now, this.playing);
        if (this.playing) this.needsReentry = true; // land the new biome on a downbeat
        return;
      }
      // next bar line (at least ~0.3s away so the swell has room)
      const sd = this.sd();
      let left = (16 - (this.step % 16)) % 16;
      if (left * sd + (this.nextTime - now) < 0.3) left += 16;
      this.pendingBiome = b;
      this.pendingBiomeStep = this.step + left;
      const at = this.nextTime + left * sd;
      this.revSwell(at, 0.22);
    } catch {
      /* ignore */
    }
  }

  setLayers(l: { combat: boolean; aggression: boolean; rampage: boolean; boss: boolean }): void {
    try {
      this.want.combat = !!l.combat;
      this.want.aggression = !!l.aggression;
      this.want.rampage = !!l.rampage;
      this.want.boss = !!l.boss;
    } catch {
      /* ignore */
    }
  }

  /** tape-stop the whole band, then one sustained note */
  death(): void {
    try {
      if (this.dead) return;
      this.dead = true;
      this.needsReentry = true;
      const t = this.ctx.currentTime;
      const TS = 0.95; // tape-stop length
      if (this.bend) {
        const p = this.bend.offset;
        p.cancelScheduledValues(t);
        p.setValueAtTime(0, t);
        // speed falls ~linearly -> pitch (cents) falls slowly, then plummets
        const pts = 8;
        for (let i = 1; i <= pts; i++) {
          const k = i / pts;
          const speed = Math.max(0.04, 1 - 0.96 * k);
          p.linearRampToValueAtTime(1200 * Math.log2(speed), t + TS * k);
        }
      }
      this.tone.frequency.cancelScheduledValues(t);
      this.tone.frequency.setValueAtTime(Math.max(200, this.tone.frequency.value), t);
      this.tone.frequency.setTargetAtTime(320, t, TS * 0.45);
      this.toneLockUntil = t + 3;
      this.bus.gain.setTargetAtTime(0, t + TS * 0.7, 0.08);
      this.fxOut.gain.setTargetAtTime(0, t + TS * 0.5, 0.08);
      this.killLead(t + TS + 0.3);
      for (const L of LAYERS) {
        this.on[L] = false;
        this.pend[L] = null;
      }
      this.deathNote(t + TS * 0.75);
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    try {
      const now = this.ctx.currentTime;
      if (this.dead) this.revive();
      if (this.silencedUntil > now) this.silencedUntil = now;
      this.fxOut.gain.setTargetAtTime(1, now, 0.02);
      if (!this.playing) this.start();
    } catch {
      /* ignore */
    }
  }

  silence(sec: number): void {
    try {
      if (!(sec > 0)) return;
      const t = this.ctx.currentTime;
      const until = t + sec;
      this.silencedUntil = until;
      this.needsReentry = true;
      // filter closes while the band fades
      this.tone.frequency.cancelScheduledValues(t);
      this.tone.frequency.setValueAtTime(Math.max(200, this.tone.frequency.value), t);
      this.tone.frequency.setTargetAtTime(260, t, 0.16);
      this.toneLockUntil = until;
      this.bus.gain.setTargetAtTime(0, t + 0.05, 0.17);
      for (const L of LAYERS) this.pend[L] = null;
      // build back in: swell lands exactly on the re-entry downbeat
      if (sec >= 1 && sec < 30 && this.playing) {
        const sd = this.sd();
        let at = this.nextTime;
        // re-entry happens on the first grid slot at/after `until` (relabelled as a downbeat)
        if (until > at) at += Math.ceil((until - at) / sd - 1e-6) * sd;
        this.revSwell(at, 0.3);
        this.riserTo(Math.max(t + 0.3, at - Math.min(2.5, sec * 0.8)), at, 0.16);
      }
    } catch {
      /* ignore */
    }
  }

  setIntensity(x: number): void {
    try {
      const v = Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0;
      this.intensity = v;
      if (Math.abs(v - this.lastToneI) > 0.04) this.updateTone(this.ctx.currentTime);
    } catch {
      /* ignore */
    }
  }

  /** Manually advance the scheduler (offline rendering / tests). */
  debugTick(): void {
    this.tick();
  }

  // ------------------------------------------------------------ internal

  private sd(): number {
    return 60 / this.def.bpm / 4;
  }

  private revive(): void {
    this.dead = false;
    this.needsReentry = true;
    const t = this.ctx.currentTime;
    if (this.bend) {
      this.bend.offset.cancelScheduledValues(t);
      this.bend.offset.setValueAtTime(0, t);
    }
    this.toneLockUntil = 0;
  }

  private effWant(L: Layer): boolean {
    if (L === 'combat') return this.want.combat || this.want.aggression || this.want.rampage || this.want.boss;
    return this.want[L];
  }

  private toneTarget(): number {
    if (this.def.hub) return 3400;
    if (this.on.combat) {
      if (this.on.rampage || this.on.boss) return 20000;
      return Math.min(20000, 9000 + 11000 * Math.pow(this.intensity, 0.7) + (this.on.aggression ? 3000 : 0));
    }
    return 5200 + 2500 * this.intensity;
  }

  private updateTone(t: number): void {
    if (t < this.toneLockUntil || this.dead) return;
    this.lastToneI = this.intensity;
    this.tone.frequency.setTargetAtTime(this.toneTarget(), t, 0.2);
  }

  private applyBiome(b: BiomeId, t: number, sweep: boolean): void {
    this.biomeId = b;
    this.def = BIOMES[String(b)] ?? BIOMES['0'];
    const D = this.def;
    this.chugCache.clear();
    this.riff = parseRiff(D.riff);
    this.riffAgg = parseRiff(D.riffAgg);
    this.breakdown = parseRiff(D.breakdown);
    this.progSemis = D.prog.map((d) => {
      const s = D.scale[((d % 7) + 7) % 7];
      return s > 6 ? s - 12 : s;
    });
    const curve = driveCurve(D.drive);
    for (const sh of this.gtrShaper) sh.curve = curve;
    this.padFilter.frequency.setTargetAtTime(D.padCut, t, 0.4);
    this.leadDelay.delayTime.setTargetAtTime(this.sd() * 3, t, 0.05);
    const seed = typeof b === 'number' ? b + 1 : 99;
    this.lead = this.makeLead(seed);
    this.lullaby = this.makeLullaby(seed);
    if (sweep && !this.dead) {
      // filter sweep the new biome in over a bar
      const bar = this.sd() * 16;
      this.tone.frequency.setValueAtTime(450, t);
      this.tone.frequency.setTargetAtTime(this.toneTarget(), t, bar * 0.35);
      this.toneLockUntil = t + bar;
    }
  }

  private scaleNote(deg: number): number {
    const sc = this.def.scale;
    const o = Math.floor(deg / sc.length);
    return sc[((deg % sc.length) + sc.length) % sc.length] + 12 * o;
  }

  /** deterministic 4-bar lead: A B A' C(climax) built on the chord progression */
  private makeLead(seed: number): (LeadEv | null)[] {
    const r = S.mulberry(seed * 7919 + 17);
    const prog = this.def.prog;
    const out: (LeadEv | null)[] = new Array(64).fill(null);
    const chordTones = (cd: number, near: number): number => {
      let best = cd;
      let bd = 1e9;
      for (const o of [-7, 0, 7]) {
        for (const c of [0, 2, 4]) {
          const d = cd + c + o;
          const dist = Math.abs(d - near);
          if (dist < bd) {
            bd = dist;
            best = d;
          }
        }
      }
      return best;
    };
    const genBar = (cd: number, start: number, climax: boolean): { at: number; len: number; deg: number }[] => {
      const rh = RHYTHMS[Math.floor(r() * RHYTHMS.length)];
      const notes: { at: number; len: number; deg: number }[] = [];
      let at = 0;
      let deg = chordTones(cd, start);
      for (let i = 0; i < rh.length; i++) {
        if (i > 0) {
          const mv = [-2, -1, -1, 1, 1, 2, 3, -3][Math.floor(r() * 8)];
          deg += mv;
          if (r() < 0.25) deg = chordTones(cd, deg + (r() < 0.5 ? 2 : -2));
        }
        if (i === rh.length - 1) deg = chordTones(cd, climax ? deg + 3 : deg);
        deg = Math.max(cd - 2, Math.min(cd + (climax ? 11 : 9), deg));
        notes.push({ at, len: rh[i], deg });
        at += rh[i];
      }
      return notes;
    };
    let shift = prog[2] - prog[0];
    while (shift > 3) shift -= 7;
    while (shift < -3) shift += 7;
    const A = genBar(prog[0], 4, false);
    const Bb = genBar(prog[1], A[A.length - 1].deg, false);
    const A2 = A.map((n) => ({ ...n, deg: n.deg + shift }));
    const C = genBar(prog[3], 7, true);
    const bars = [A, Bb, A2, C];
    bars.forEach((bar, bi) => {
      for (const n of bar) out[bi * 16 + n.at] = { deg: n.deg, len: n.len };
    });
    return out;
  }

  /** "wrong" lullaby for THE NURSERY (scale degrees, 16 eighth notes) */
  private makeLullaby(seed: number): number[] {
    const base = [4, 2, 4, 2, 4, 5, 4, 2, 3, 1, 3, 1, 3, 4, 3, 0];
    const r = S.mulberry(seed * 313);
    return base.map((d) => (r() < 0.12 ? d + 1 : d));
  }

  private tick(): void {
    try {
      if (!this.playing) return;
      const now = this.ctx.currentTime;
      // fell behind (background tab / suspend): resync instead of bursting
      if (this.nextTime < now - 0.2) this.nextTime = now + 0.03;
      let guard = 0;
      while (this.nextTime < now + LOOKAHEAD && guard++ < 64) {
        if (this.needsReentry && !this.dead && this.nextTime >= this.silencedUntil) {
          const st = this.step % 16;
          // land on a downbeat: relabel this grid slot as a bar start
          if (st !== 0) this.step += 16 - st;
          if (this.pendingBiome !== null) this.pendingBiomeStep = this.step;
          this.reentry(this.step, this.nextTime);
        }
        this.scheduleStep(this.step, this.nextTime);
        this.nextTime += this.sd();
        this.step++;
      }
    } catch {
      /* ignore */
    }
  }

  private reentry(s: number, t: number): void {
    this.needsReentry = false;
    this.toneLockUntil = 0;
    for (const L of LAYERS) {
      this.pend[L] = null;
      const w = this.effWant(L) && !this.def.hub;
      this.on[L] = w;
      this.onSince[L] = s;
      if (!w) this.offUntil[L] = 0;
    }
    const c = this.on.combat;
    this.fader(this.drumFader, c ? 1 : 0, t, 0.006);
    this.fader(this.gtrFader, c ? 1 : 0, t, 0.006);
    this.fader(this.bassFader, c ? 1 : 0, t, 0.006);
    this.combatLP.frequency.setTargetAtTime(c ? 20000 : 400, t, 0.01);
    this.fader(this.leadFader, this.on.rampage ? 1 : 0, t, 0.01);
    this.fader(this.bossFader, this.on.boss ? 1 : 0, t, 0.03);
    this.fader(this.padFader, this.padLevel(), t, 0.1);
    if (this.on.rampage) this.ensureLead(t);
    this.bus.gain.setTargetAtTime(1, t, c ? 0.008 : 0.12);
    this.tone.frequency.setTargetAtTime(this.toneTarget(), t, c ? 0.01 : 0.15);
    this.lastToneI = this.intensity;
    if (c) this.dropHit(t, this.on.boss);
  }

  private padLevel(): number {
    if (this.on.boss) return 0.3;
    if (this.on.combat) return 0.5;
    return 1;
  }

  private fader(g: GainNode, v: number, t: number, tc: number): void {
    g.gain.setTargetAtTime(v, t, tc);
  }

  // ------------------------------------------------------------ transitions

  private quantize(L: Layer, turnOn: boolean, s: number): number {
    const nextBar = (lead: number): number => Math.ceil((s + lead) / 16) * 16;
    if (turnOn) {
      if (L === 'combat' || L === 'boss') return nextBar(4);
      if (L === 'aggression') return Math.ceil((s + 2) / 8) * 8;
      return Math.ceil((s + 1) / 4) * 4; // rampage: next beat
    }
    const minBars = L === 'combat' ? 2 : L === 'aggression' ? 1 : 2;
    return Math.max(nextBar(1), this.onSince[L] + minBars * 16);
  }

  private transitions(s: number, t: number): void {
    for (const L of LAYERS) {
      const p = this.pend[L];
      if (p !== null && s >= p) {
        this.pend[L] = null;
        this.apply(L, !this.on[L], s, t);
      }
    }
    for (const L of LAYERS) {
      const w = this.effWant(L);
      const p = this.pend[L];
      if (p !== null) {
        // on-transitions of combat/boss are committed (the riser is already rolling)
        const committed = !this.on[L] && (L === 'combat' || L === 'boss');
        if (!committed && w === this.on[L]) this.pend[L] = null;
        continue;
      }
      if (w === this.on[L]) continue;
      if (L !== 'combat' && !this.on.combat) {
        // these ride on the combat drop
        continue;
      }
      const target = this.quantize(L, w, s);
      this.pend[L] = target;
      if (w) this.preroll(L, t, t + (target - s) * this.sd());
    }
  }

  private preroll(L: Layer, t: number, at: number): void {
    if (L === 'combat') {
      this.riserTo(t, at, 0.2);
      this.revSwell(at, 0.24);
    } else if (L === 'boss') {
      this.riserTo(t, at, 0.24);
      this.revSwell(at, 0.3);
    } else if (L === 'rampage') {
      this.revSwell(at, 0.2);
    }
  }

  private apply(L: Layer, v: boolean, s: number, t: number): void {
    this.on[L] = v;
    if (v) this.onSince[L] = s;
    const D = 6; // offUntil = t + D*tc
    if (L === 'combat') {
      if (v) {
        this.fader(this.drumFader, 1, t, 0.006);
        this.fader(this.gtrFader, 1, t, 0.006);
        this.fader(this.bassFader, 1, t, 0.006);
        this.combatLP.frequency.setTargetAtTime(20000, t, 0.006);
        // everything else that is wanted lands on the same downbeat
        for (const o of LAYERS) {
          if (o === 'combat') continue;
          this.pend[o] = null;
          if (this.want[o]) this.apply(o, true, s, t);
        }
        this.dropHit(t, this.on.boss);
      } else {
        const tc = 0.55;
        this.fader(this.drumFader, 0, t, tc);
        this.fader(this.gtrFader, 0, t, tc);
        this.fader(this.bassFader, 0, t, tc);
        this.combatLP.frequency.setTargetAtTime(380, t, 0.45);
        this.offUntil.combat = t + tc * D;
        for (const o of LAYERS) {
          if (o === 'combat') continue;
          this.pend[o] = null;
          if (this.on[o]) this.apply(o, false, s, t);
        }
        this.oneShot('crash', t, this.fxOut, 0.16);
      }
    } else if (L === 'rampage') {
      if (v) {
        this.ensureLead(t);
        this.fader(this.leadFader, 1, t, 0.008);
        if (this.onSince.combat !== s) {
          this.oneShot('crash', t, this.drumIn, 0.4);
          this.oneShot('kickH', t, this.drumIn, 0.6);
        }
      } else {
        this.fader(this.leadFader, 0, t, 0.25);
        this.offUntil.rampage = t + 0.25 * D;
      }
    } else if (L === 'boss') {
      if (v) {
        this.fader(this.bossFader, 1, t, 0.05);
        this.dropHit(t, true);
      } else {
        this.fader(this.bossFader, 0, t, 0.7);
        this.offUntil.boss = t + 0.7 * D;
      }
    } else if (L === 'aggression') {
      if (v) this.oneShot('china', t, this.drumIn, 0.3);
    }
    this.fader(this.padFader, this.padLevel(), t, 0.4);
    this.updateTone(t);
  }

  /** crash + impact + heavy kick on the drop downbeat */
  private dropHit(t: number, boss: boolean): void {
    this.oneShot('crash', t, this.drumIn, 0.42);
    this.oneShot('kickH', t, this.drumIn, 0.85);
    this.oneShot('impact', t, this.fxOut, boss ? 0.6 : 0.42);
    if (boss) {
      this.oneShot('sub', t, this.fxOut, 0.5);
      this.oneShot('china', t, this.drumIn, 0.3);
    }
    this.pumpAt(t, 0.25);
  }

  // ------------------------------------------------------------ sequencer

  private scheduleStep(s: number, t: number): void {
    if (this.pendingBiome !== null && s >= this.pendingBiomeStep) {
      const b = this.pendingBiome;
      this.pendingBiome = null;
      this.applyBiome(b, t, true);
      if (this.on.combat) this.oneShot('crash', t, this.drumIn, 0.38);
    }
    if (this.dead || this.needsReentry || t < this.silencedUntil) return;
    const D = this.def;
    const st = s % 16;
    const bar = Math.floor(s / 16);
    if (D.hub) {
      this.hubStep(st, bar, t);
      return;
    }
    this.transitions(s, t);
    const sd = this.sd();

    const comb = this.on.combat;
    const playComb = comb || t < this.offUntil.combat;
    const agg = comb && this.on.aggression;
    const ramp = comb && this.on.rampage;
    const boss = comb && this.on.boss;
    const phraseBar = bar % 8;
    const progSemi = this.progSemis[bar % 4];
    const chordDeg = D.prog[bar % 4];
    const ri = (bar % 2) * 16 + st;

    // lead voice cleanup once faded
    if (this.leadVoice && !this.on.rampage && t > this.offUntil.rampage) this.killLead(t);

    // ---------------------------------------------------------- BASE
    this.baseStep(st, bar, t, sd, comb, chordDeg, progSemi);

    // build-up into a pending drop: snare roll then tom fill (fx path, not faded)
    const pc = this.pend.combat;
    if (pc !== null && !comb) {
      const left = pc - s;
      if (left <= 8 && left > 4) {
        if (left % 2 === 0) this.oneShot('snare', t, this.fxOut, 0.2 + (8 - left) * 0.05);
      } else if (left <= 4 && left > 0) {
        this.oneShot('snare', t, this.fxOut, 0.3 + (4 - left) * 0.06);
        this.oneShot('tom', t, this.fxOut, 0.5, [1.7, 1.35, 1.05, 0.8][4 - left] ?? 1);
      }
    }
    const pb = this.pend.boss;
    if (pb !== null && !this.on.boss && comb) {
      const left = pb - s;
      if (left <= 4 && left > 0) this.oneShot('tom', t, this.drumIn, 0.6, [1.2, 1.0, 0.85, 0.7][4 - left] ?? 1);
    }

    if (!playComb) {
      this.prevHit = false;
      return;
    }

    // ---------------------------------------------------------- DRUMS
    const pat = boss ? this.breakdown : agg ? this.riffAgg : this.riff;
    const r = pat[ri];
    const hit = r.k === 1 || r.k === 2;
    const fill = phraseBar === 7 && st >= 12 && !boss;
    const pa = this.pend.aggression;
    const pr = this.pend.rampage;
    const preFill = (pa !== null && pa - s <= 2 && pa - s > 0) || (pr !== null && pr - s <= 2 && pr - s > 0);

    // kick (follows the riff: djent lock)
    if (ramp && !boss) {
      this.oneShot('kickT', t, this.drumIn, st % 4 === 0 ? 0.9 : 0.62);
    } else if (hit) {
      this.oneShot(boss ? 'kickH' : this.prevHit ? 'kickT' : 'kick', t, this.drumIn, boss ? 0.85 : 0.88);
    } else if (st === 0) {
      this.oneShot('kick', t, this.drumIn, 0.85);
    } else if (agg && r.k === 4 && st % 2 === 0) {
      this.oneShot('kickT', t, this.drumIn, 0.55); // double-kick under held chords
    }
    this.prevHit = hit;
    if (st % 4 === 0) this.pumpAt(t, ramp ? 0.42 : 0.35);

    // snare / fills
    if (fill || preFill) {
      const k = fill ? st - 12 : 2;
      this.oneShot('tom', t, this.drumIn, 0.62, [1.7, 1.4, 1.1, 0.82][k] ?? 1.2);
      if (st % 2 === 0) this.snare(t, 0.6);
    } else if (boss) {
      if (st === 8) {
        this.snare(t, 0.95);
        this.oneShot('china', t, this.drumIn, 0.26);
      }
      if (r.k === 4 && st % 4 === 2) this.oneShot('tom', t, this.drumIn, 0.5, 0.72); // war drums
    } else {
      if (st === 4 || st === 12) this.snare(t, 0.85);
      else if (agg && (st === 7 || st === 15)) this.snare(t, 0.18);
      else if (ramp && st === 14 && bar % 2 === 1) this.snare(t, 0.5);
    }

    // hats / cymbals
    if (boss) {
      if (st % 4 === 0 && st !== 8) this.oneShot('ride', t, this.drumIn, 0.26);
      else if (st % 2 === 0) this.oneShot('hatC', t, this.drumIn, 0.12);
    } else if (ramp) {
      this.oneShot('hatC', t, this.drumIn, st % 2 === 0 ? 0.26 : 0.15);
      if (st % 4 === 0) this.oneShot('ride', t, this.drumIn, 0.2);
    } else if (agg) {
      if (st % 4 === 2) this.oneShot('hatO', t, this.drumIn, 0.2);
      else if (st % 2 === 0) this.oneShot('hatC', t, this.drumIn, 0.2);
    } else if (st % 2 === 0) {
      this.oneShot('hatC', t, this.drumIn, st % 4 === 2 ? 0.24 : 0.13);
    }
    if (st === 0) {
      if (phraseBar === 0 || boss) this.oneShot('crash', t, this.drumIn, 0.36);
      else if (agg || ramp) this.oneShot('china', t, this.drumIn, 0.2);
      else if (phraseBar === 4) this.oneShot('crash', t, this.drumIn, 0.26);
    }

    // biome color inside the kit
    if (D.color === 'anvil' && (st === 4 || st === 12)) this.oneShot('clang', t, this.drumIn, 0.13, st === 4 ? 1 : 0.94);
    if (D.color === 'tribal' && !boss && (st === 3 || st === 7 || st === 10 || st === 14)) {
      this.oneShot('tom', t, this.drumIn, 0.34, [1.25, 1.0, 1.4, 0.85][(st >> 2) & 3]);
    }
    if (D.color === 'march' && !ramp && !boss && (st === 14 || st === 15)) this.snare(t, 0.22);

    // ---------------------------------------------------------- GUITARS + BASS
    const midi = D.root + progSemi + r.off;
    if (r.k === 1) {
      this.chug(midi, t);
      this.bassChug(midi - 12, t);
    } else if (r.k === 2) {
      const dur = r.len * sd;
      this.openChord(midi, t, dur);
      this.bassOpen(midi - 12, t, dur);
    } else if (r.k === 3) {
      this.pinch(D.root + progSemi, t, 3 * sd);
    }
    // aggression: harmonic squeal accents at the end of each 2-bar riff
    if (agg && !boss && ri === 30 && this.intensity > 0.3) this.pinch(D.root + progSemi + 7, t, 2 * sd);

    // ---------------------------------------------------------- LEAD
    if (ramp && this.leadVoice) {
      const ev = this.lead[(bar % 4) * 16 + st];
      if (ev) {
        let lr = D.root + 12;
        while (lr < 60) lr += 12;
        while (lr > 71) lr -= 12;
        const m = lr + this.scaleNote(ev.deg);
        this.leadNote(hz(m), t, ev.len * sd);
      }
    }

    // ---------------------------------------------------------- BOSS
    if (boss || (t < this.offUntil.boss && this.bossFader.gain.value > 0.01)) {
      if (st === 0) {
        const barLen = sd * 16;
        const root = D.root + progSemi + 12;
        this.choir(root, t, barLen);
        if (bar % 2 === 0) {
          this.brass(root + 12, t, sd * 6);
          this.oneShot('sub', t, this.fxOut, boss ? 0.42 : 0.2);
        }
      }
    }
  }

  /** snare with an extra room send (crushing, roomy backbeat) */
  private snare(t: number, v: number): void {
    const buf = this.B['snare'];
    if (!buf || !this.canVoice()) return;
    this.playBuf(buf, t, this.drumIn, v, 1, 0, undefined, this.drumRoom, 0.6);
  }

  private baseStep(st: number, bar: number, t: number, sd: number, comb: boolean, chordDeg: number, progSemi: number): void {
    const D = this.def;
    const barLen = sd * 16;
    const swingT = st % 2 === 1 ? t + D.swing * sd : t;
    if (st === 0) {
      // pad chord (triad from the scale, around the 3rd octave)
      const pr = D.root + 12;
      for (const d of [chordDeg, chordDeg + 2, chordDeg + 4]) {
        const m = pr + this.scaleNote(d);
        this.osc(this.padFilter, D.padType, hz(m), t, 0.35, barLen - 0.25, 0.7, 0.03, -9);
        this.osc(this.padFilter, D.padType, hz(m), t, 0.35, barLen - 0.25, 0.7, 0.03, 9);
      }
      this.osc(this.padFilter, 'sine', hz(D.root + progSemi), t, 0.3, barLen - 0.2, 0.6, 0.07);
    }
    const bassM = D.root + progSemi - (D.root >= 36 ? 12 : 0);
    switch (D.color) {
      case 'heart':
        if (st === 0) this.oneShot('kick', t, this.pulseLP, comb ? 0.25 : 0.42, 0.7);
        if (st === 3) this.oneShot('kick', t, this.pulseLP, comb ? 0.17 : 0.3, 0.72);
        if (!comb && st % 4 === 2) this.pulseNote(bassM, t, 0.4);
        break;
      case 'march':
        if (!comb) {
          if (st === 0) this.oneShot('tom', t, this.padFader, 0.38, 0.55);
          if (st === 0 || st === 8) this.oneShot('snare', t, this.padFader, 0.12);
          if (st === 6 || st === 7 || st === 14 || st === 15) this.oneShot('snare', t, this.padFader, 0.06);
          if (st % 2 === 0) this.pulseNote(bassM, t, 0.5);
        }
        break;
      case 'tribal':
        if (!comb) {
          const pat = 'x..x..x...x.x...';
          if (pat[st] === 'x') this.oneShot('tom', t, this.padFader, 0.3, [0.7, 0.85, 1.0, 1.2][(st * 3 + bar) % 4]);
          if (st % 2 === 0 || st % 4 === 3) this.oneShot('shaker', swingT, this.padFader, st % 4 === 0 ? 0.12 : 0.07);
          if (st % 4 === 0) this.pulseNote(bassM, t, 0.45);
        }
        break;
      case 'arp': {
        const order = [0, 2, 4, 2, 7, 4, 2, 4];
        const m = D.root + 36 + this.scaleNote(chordDeg + order[st % 8]) + (st >= 8 ? 12 : 0);
        this.oneShot('bell', t, this.padFader, comb ? 0.05 : 0.075, hz(m) / 880);
        if (!comb) {
          this.oneShot('hatC', t, this.padFader, st % 4 === 2 ? 0.05 : 0.025);
          if (st % 2 === 0) this.pulseNote(bassM, t, 0.4);
        }
        break;
      }
      case 'musicbox':
        if (st % 2 === 0) {
          const i = (bar % 2) * 8 + st / 2;
          const deg = this.lullaby[i] ?? 0;
          const m = D.root + 48 + this.scaleNote(deg);
          // detuned, slowly drifting: a lullaby that is *wrong*
          const wrong = 1 + 0.012 * Math.sin(bar * 1.7 + st) + (i % 5 === 3 ? 0.03 : 0);
          this.oneShot('bell', t, this.padFader, comb ? 0.06 : 0.1, (hz(m) / 880) * wrong);
        }
        if (!comb && st % 4 === 0) this.pulseNote(bassM, t, 0.35);
        break;
      case 'anvil':
        if (!comb) {
          if (st === 8 && bar % 2 === 1) this.oneShot('clang', t, this.padFader, 0.14);
          if (st % 2 === 0) this.pulseNote(bassM, t, st % 4 === 0 ? 0.55 : 0.35);
          if (st % 4 === 2) this.oneShot('hatC', t, this.padFader, 0.04);
        }
        break;
      case 'glitch':
        if (st === 0 && bar % 2 === 0) this.revSwellBuf(t + barLen * 2, 0.12, this.padFader);
        if (st % 4 === 0 && !comb) this.pulseNote(bassM, t, 0.45);
        {
          // deterministic stutters
          const h = ((bar * 131 + st * 71) >>> 0) % 13;
          if (h === 0 || h === 5) {
            const rate = [0.5, 0.707, 1, 1.414, 2][(bar + st) % 5];
            for (let i = 0; i < 3; i++) this.oneShot('bell', t + i * sd * 0.5, this.padFader, 0.05, rate);
          }
        }
        break;
      default:
        if (!comb && st % 2 === 0) this.pulseNote(bassM, t, 0.4);
    }
  }

  private hubStep(st: number, bar: number, t: number): void {
    const D = this.def;
    const sd = this.sd();
    const barLen = sd * 16;
    const deg = D.prog[bar % 4];
    if (st === 0 && bar % 2 === 0) {
      for (const d of [deg, deg + 2, deg + 4]) {
        const m = D.root + 12 + this.scaleNote(d);
        this.osc(this.padFilter, 'triangle', hz(m), t, 1.4, barLen * 2 - 1.4, 1.6, 0.05, 5);
        this.osc(this.padFilter, 'sine', hz(m + 12), t, 1.6, barLen * 2 - 1.6, 1.6, 0.025, -4);
      }
      this.osc(this.padFilter, 'sine', hz(D.root + this.scaleNote(deg) - 12), t, 1.5, barLen * 2 - 1.5, 1.5, 0.1);
    }
    if (D.sparkle) {
      // a music box: the lullaby in a major key, every seventh note a hair flat
      if (st % 2 === 0 && bar % 4 !== 3) {
        const i = (bar % 2) * 8 + st / 2;
        const m = D.root + 36 + this.scaleNote((this.lullaby[i] ?? 0) + deg);
        const wrong = (bar * 8 + st / 2) % 7 === 6 ? 0.985 : 1;
        this.oneShot('bell', t, this.padFader, st % 8 === 0 ? 0.075 : 0.05, (hz(m) / 880) * wrong);
      }
      if (st === 8 && bar % 2 === 1) this.oneShot('bell', t, this.padFader, 0.03, hz(D.root + 48 + this.scaleNote(deg + 4)) / 880);
      return;
    }
    const h = ((bar * 37 + st * 11) >>> 0) % 23;
    if (st % 2 === 0 && (h === 3 || h === 14)) {
      const m = D.root + 36 + this.scaleNote([0, 2, 4, 6, 7][(bar + st) % 5] + deg);
      this.oneShot('bell', t, this.padFader, 0.045, hz(m) / 880);
    }
  }

  // ------------------------------------------------------------ instruments

  private canVoice(): boolean {
    return this.voices < MAX_VOICES;
  }

  private bindSrc(n: Src, extra: AudioNode[]): void {
    const bend = this.bend;
    if (bend) {
      try {
        bend.connect(n.detune);
      } catch {
        /* ignore */
      }
    }
    this.voices++;
    n.onended = () => {
      this.voices--;
      if (bend) {
        try {
          bend.disconnect(n.detune);
        } catch {
          /* ignore */
        }
      }
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
      for (const e of extra) {
        try {
          e.disconnect();
        } catch {
          /* ignore */
        }
      }
    };
  }

  /** play a pre-rendered buffer */
  private oneShot(key: string, t: number, dest: AudioNode, vol: number, rate = 1): AudioBufferSourceNode | null {
    const buf = this.B[key];
    if (!buf || !this.canVoice()) return null;
    return this.playBuf(buf, t, dest, vol, rate);
  }

  private playBuf(
    buf: AudioBuffer,
    t: number,
    dest: AudioNode,
    vol: number,
    rate = 1,
    offset = 0,
    stopAt?: number,
    send?: AudioNode,
    sendAmt = 0,
  ): AudioBufferSourceNode {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = vol;
    if (offset > 0) {
      // joining a swell/riser mid-way: fade in instead of popping
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.12);
    }
    s.connect(g);
    g.connect(dest);
    const extra: AudioNode[] = [g];
    if (send && sendAmt > 0) {
      const sg = ctx.createGain();
      sg.gain.value = vol * sendAmt;
      s.connect(sg);
      sg.connect(send);
      extra.push(sg);
    }
    this.bindSrc(s, extra);
    s.start(t, offset);
    if (stopAt !== undefined) {
      g.gain.setValueAtTime(vol, Math.max(t + (offset > 0 ? 0.12 : 0), stopAt - 0.012));
      g.gain.linearRampToValueAtTime(0, stopAt);
      s.stop(stopAt + 0.01);
    }
    return s;
  }

  /** reverse cymbal ending exactly at `at` */
  private revSwell(at: number, vol: number): void {
    this.revSwellBuf(at, vol, this.fxOut);
  }

  private revSwellBuf(at: number, vol: number, dest: AudioNode): void {
    const buf = this.B['revCrash'];
    if (!buf) return;
    const now = this.ctx.currentTime;
    const start = at - buf.duration;
    if (start >= now) this.playBuf(buf, start, dest, vol);
    else {
      const off = now + 0.01 - start;
      if (off < buf.duration - 0.05) this.playBuf(buf, now + 0.01, dest, vol, 1, off);
    }
  }

  /** riser from t to at (cut on the downbeat) */
  private riserTo(t: number, at: number, vol: number): void {
    const buf = this.riser();
    const dur = at - t;
    if (!buf || dur < 0.25) return;
    const off = Math.max(0, buf.duration - dur);
    this.playBuf(buf, t, this.fxOut, vol, 1, off, at);
  }

  private pumpAt(t: number, depth: number): void {
    const p = this.pump.gain;
    p.setTargetAtTime(1 - depth, t, 0.004);
    p.setTargetAtTime(1, t + 0.03, 0.07);
  }

  /**
   * Generic enveloped oscillator: attack a, hold h, release r (exponential).
   */
  private osc(dest: AudioNode, type: OscillatorType, f: number, t: number, a: number, h: number, r: number, peak: number, detune = 0): void {
    if (!this.canVoice()) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    const g = ctx.createGain();
    const hold = Math.max(0, h);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
    o.connect(g);
    g.connect(dest);
    this.bindSrc(o, [g]);
    o.start(t);
    o.stop(t + a + hold + r + 0.02);
  }

  private pulseNote(m: number, t: number, vol: number): void {
    const b = this.chugBuf(m, 0, true);
    if (b && this.canVoice()) this.playBuf(b, t, this.pulseLP, vol * 0.5);
  }

  private chug(m: number, t: number): void {
    for (let side = 0; side < 2; side++) {
      const b = this.chugBuf(m, side, false);
      if (b && this.canVoice()) this.playBuf(b, t + side * 0.0045, this.gtrIn[side], 1);
    }
  }

  private bassChug(m: number, t: number): void {
    while (m < 28) m += 12;
    const b = this.chugBuf(m, 0, true);
    if (b && this.canVoice()) this.playBuf(b, t, this.bassIn, 0.95);
  }

  /** ringing power chord (root, fifth, octave), double-tracked */
  private openChord(m: number, t: number, dur: number): void {
    if (!this.canVoice()) return;
    const ctx = this.ctx;
    const f0 = hz(m);
    const end = t + dur;
    for (let side = 0; side < 2; side++) {
      const g = ctx.createGain();
      const ts = t + side * 0.005;
      g.gain.setValueAtTime(0, ts);
      g.gain.linearRampToValueAtTime(0.34, ts + 0.003);
      g.gain.setTargetAtTime(0.24, ts + 0.02, 0.15);
      g.gain.setValueAtTime(0.24, Math.max(ts + 0.03, end - 0.02));
      g.gain.exponentialRampToValueAtTime(0.0005, end + 0.07);
      g.connect(this.gtrIn[side]);
      const det = side ? 7 : -6;
      const parts: [number, number][] = [
        [1, 0.5],
        [1.4983, 0.4],
        [2, 0.28],
      ];
      const oscs: OscillatorNode[] = [];
      for (const [mul, lvl] of parts) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f0 * mul;
        o.detune.value = det + (mul === 2 ? -det * 0.5 : 0);
        const og = ctx.createGain();
        og.gain.value = lvl;
        o.connect(og);
        og.connect(g);
        this.bindSrc(o, oscs.length === 0 ? [og, g] : [og]);
        o.start(ts);
        o.stop(end + 0.1);
        oscs.push(o);
      }
    }
  }

  /** pinch-harmonic squeal through the amps */
  private pinch(m: number, t: number, dur: number): void {
    if (!this.canVoice()) return;
    const ctx = this.ctx;
    const f = hz(m) * 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.006);
    g.gain.setTargetAtTime(0.18, t + 0.05, 0.12);
    g.gain.setTargetAtTime(0, t + dur, 0.05);
    g.connect(this.gtrIn[0]);
    g.connect(this.gtrIn[1]);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.94, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 7.5;
    const lg = ctx.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * 0.025, t + dur * 0.6);
    lfo.connect(lg);
    lg.connect(o.frequency);
    o.connect(g);
    this.bindSrc(o, [g]);
    this.bindSrc(lfo, [lg]);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.3);
    lfo.stop(t + dur + 0.3);
  }

  /** sustained growl bass with tempo-synced wobble */
  private bassOpen(m: number, t: number, dur: number): void {
    if (!this.canVoice()) return;
    while (m < 28) m += 12;
    const ctx = this.ctx;
    const f = hz(m);
    const end = t + dur;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.004);
    g.gain.setValueAtTime(0.5, Math.max(t + 0.01, end - 0.02));
    g.gain.exponentialRampToValueAtTime(0.0005, end + 0.08);
    g.connect(this.bassIn);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 5;
    lp.frequency.value = 500;
    lp.connect(g);
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = f;
    const sq = ctx.createOscillator();
    sq.type = 'square';
    sq.frequency.value = f * 1.004;
    const sqg = ctx.createGain();
    sqg.gain.value = 0.4;
    sq.connect(sqg);
    sqg.connect(lp);
    saw.connect(lp);
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = f;
    const subg = ctx.createGain();
    subg.gain.value = 0.8;
    sub.connect(subg);
    subg.connect(g);
    const lfo = ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.value = (this.def.bpm / 60) * 2;
    const lg = ctx.createGain();
    lg.gain.value = 380;
    lfo.connect(lg);
    lg.connect(lp.frequency);
    const stop = end + 0.12;
    this.bindSrc(saw, [lp, g]);
    this.bindSrc(sq, [sqg]);
    this.bindSrc(sub, [subg]);
    this.bindSrc(lfo, [lg]);
    for (const o of [saw, sq, sub, lfo]) {
      o.start(t);
      o.stop(stop);
    }
  }

  private ensureLead(t: number): void {
    if (this.leadVoice) return;
    try {
      const ctx = this.ctx;
      const env = ctx.createGain();
      env.gain.value = 0;
      env.connect(this.leadIn);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6.3;
      const vib = ctx.createGain();
      vib.gain.value = 0;
      lfo.connect(vib);
      const oscs: OscillatorNode[] = [];
      const type = this.def.leadType;
      for (const [mul, det, lvl] of [
        [1, -11, 0.5],
        [1, 11, 0.5],
        [0.5, 0, 0.3],
      ] as const) {
        const o = ctx.createOscillator();
        o.type = mul === 0.5 ? 'square' : type;
        o.frequency.value = 440 * mul;
        o.detune.value = det;
        const og = ctx.createGain();
        og.gain.value = lvl;
        o.connect(og);
        og.connect(env);
        vib.connect(o.detune);
        this.bindSrc(o, [og]);
        o.start(t);
        oscs.push(o);
      }
      this.bindSrc(lfo, [vib, env]);
      lfo.start(t);
      this.leadVoice = { oscs, env, vib, lfo, lastEnd: 0 };
    } catch {
      this.leadVoice = null;
    }
  }

  private killLead(at: number): void {
    const lv = this.leadVoice;
    if (!lv) return;
    this.leadVoice = null;
    try {
      lv.env.gain.setTargetAtTime(0, Math.max(this.ctx.currentTime, at - 0.1), 0.03);
      for (const o of lv.oscs) o.stop(at + 0.1);
      lv.lfo.stop(at + 0.1);
    } catch {
      /* ignore */
    }
  }

  private leadNote(f: number, t: number, dur: number): void {
    const lv = this.leadVoice;
    if (!lv) return;
    const legato = Math.abs(t - lv.lastEnd) < 0.02;
    const muls = [1, 1, 0.5];
    lv.oscs.forEach((o, i) => {
      const target = f * muls[i];
      if (legato) o.frequency.setTargetAtTime(target, t, 0.018);
      else {
        // scoop up into the note (screaming lead articulation)
        o.frequency.setValueAtTime(target * 0.93, t);
        o.frequency.setTargetAtTime(target, t, 0.025);
      }
    });
    const e = lv.env.gain;
    e.setTargetAtTime(0.13, t, legato ? 0.01 : 0.003);
    e.setTargetAtTime(0.1, t + 0.06, 0.1);
    e.setTargetAtTime(0, t + dur * 0.93, 0.025);
    const v = lv.vib.gain;
    v.setTargetAtTime(0, t, 0.01);
    if (dur > 0.22) v.setTargetAtTime(30, t + Math.min(0.18, dur * 0.4), 0.08);
    lv.lastEnd = t + dur;
  }

  private choir(root: number, t: number, len: number): void {
    const D = this.def;
    const third = D.scale[2];
    for (const m of [root, root + 7, root + 12, root + 12 + third]) {
      this.osc(this.choirIn, 'sawtooth', hz(m), t, 0.45, len - 0.4, 0.7, 0.05, -12);
      this.osc(this.choirIn, 'sawtooth', hz(m), t, 0.45, len - 0.4, 0.7, 0.05, 12);
    }
  }

  /** brass swell: saws through an opening lowpass */
  private brass(root: number, t: number, len: number): void {
    if (!this.canVoice()) return;
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 1.4;
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.exponentialRampToValueAtTime(3200, t + 0.12);
    lp.frequency.exponentialRampToValueAtTime(1100, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.05);
    g.gain.setValueAtTime(0.14, t + len * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0005, t + len + 0.3);
    lp.connect(g);
    g.connect(this.bossFader);
    const third = this.def.scale[2];
    let first = true;
    for (const m of [root - 12, root, root + 7, root + third]) {
      for (const det of [-8, 8]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(hz(m) * 0.97, t);
        o.frequency.exponentialRampToValueAtTime(hz(m), t + 0.07);
        o.detune.value = det;
        const og = ctx.createGain();
        og.gain.value = 0.25;
        o.connect(og);
        og.connect(lp);
        this.bindSrc(o, first ? [og, lp, g] : [og]);
        first = false;
        o.start(t);
        o.stop(t + len + 0.35);
      }
    }
  }

  private deathNote(t: number): void {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.connect(audio.musicBus);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.5);
    g.gain.setTargetAtTime(0.0001, t + 1.2, 1.1);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(2200, t);
    lp.frequency.exponentialRampToValueAtTime(220, t + 5);
    lp.connect(g);
    const send = ctx.createGain();
    send.gain.value = 0.6;
    g.connect(send);
    send.connect(audio.reverbSend);
    let root = this.def.root;
    while (root < 45) root += 12;
    const f = hz(root);
    const oscs: OscillatorNode[] = [];
    for (const [type, mul, det, lvl] of [
      ['triangle', 1, 0, 0.6],
      ['sawtooth', 1, 7, 0.25],
      ['sawtooth', 1, -7, 0.25],
      ['sine', 0.5, 0, 0.7],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f * mul;
      o.detune.value = det;
      const og = ctx.createGain();
      og.gain.value = lvl;
      o.connect(og);
      og.connect(lp);
      o.start(t);
      o.stop(t + 6.5);
      oscs.push(o);
      o.onended = () => {
        try {
          o.disconnect();
          og.disconnect();
        } catch {
          /* ignore */
        }
      };
    }
    oscs[0].addEventListener('ended', () => {
      try {
        lp.disconnect();
        g.disconnect();
        send.disconnect();
      } catch {
        /* ignore */
      }
    });
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
  setBiome(b: number | 'hub' | 'happy'): void {
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

/** Advance the music scheduler by hand (offline rendering / level tests only). */
export function __musicTick(): void {
  try {
    sys()?.debugTick();
  } catch {
    /* ignore */
  }
}
