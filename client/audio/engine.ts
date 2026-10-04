/**
 * ROUGED audio engine.
 *
 * Owns the single AudioContext and the mixing graph:
 *
 *   sfx sources -> out(gain -> panner) -> sfxBus -> slowmoFilter -> master
 *                                    \-> reverbSend -> convolver (hall) -> reverbReturn -> master
 *                         (optional) roomSend -> short stereo room -> roomReturn -> master
 *   music       -> musicBus -> duckGain -> master
 *   voice       -> voiceBus -> master
 *   master -> DC/rumble highpass -> glue compressor -> makeup -> limiter -> soft clipper -> destination
 *
 * The glue comp + makeup make everything loud and dense; the limiter catches
 * peaks and the final soft clipper (asymptote 0.98) guarantees no hard clipping.
 *
 * Nothing here loads files: the reverb impulse and the noise buffer are generated.
 */

export interface V3 {
  x: number;
  y: number;
  z: number;
}

const NEAR = 4; // full volume within this radius (m)
const FAR = 45; // ~silent at this radius (m)

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function createContext(): AudioContext {
  const g = globalThis as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor: typeof AudioContext | undefined = g.AudioContext || g.webkitAudioContext;
  if (!Ctor) throw new Error('WebAudio not supported');
  try {
    return new Ctor({ latencyHint: 'interactive' });
  } catch {
    return new Ctor();
  }
}

export class AudioEngine {
  ctx: AudioContext;
  master: GainNode;
  sfxBus: GainNode;
  musicBus: GainNode;
  voiceBus: GainNode;
  reverbSend: GainNode;
  noiseBuffer: AudioBuffer;
  /** Short stereo early-reflection room (weapon slapback / width). */
  roomSend: GainNode;

  /** Final output stages. */
  private compressor: DynamicsCompressorNode;
  private limiter: DynamicsCompressorNode;
  private clipper: WaveShaperNode;
  /** Lowpass applied to the sfx bus during slow-mo. */
  private slowFilter: BiquadFilterNode;
  /** Music ducking stage (separate from the user music volume on musicBus). */
  private duckGain: GainNode;
  private convolver: ConvolverNode;
  private reverbReturn: GainNode;

  private listenerPos: V3 = { x: 0, y: 0, z: 0 };
  private listenerYaw = 0;
  private unlocked = false;
  private chains = new WeakMap<GainNode, AudioNode[]>();
  private duckUntil = 0;
  private duckTarget = 1;
  private timeScale = 1;

  /** `ctx` is only for offline rendering / tests; the game uses the default. */
  constructor(ctx: AudioContext = createContext()) {
    this.ctx = ctx;

    // --- master chain ---
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;

    const dc = ctx.createBiquadFilter();
    dc.type = 'highpass';
    dc.frequency.value = 22;
    dc.Q.value = 0.6;

    // glue: medium ratio, attack slow enough to let gun transients punch through
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 8;
    this.compressor.ratio.value = 3.2;
    this.compressor.attack.value = 0.006;
    this.compressor.release.value = 0.16;
    const makeup = ctx.createGain();
    makeup.gain.value = 1.75;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -2;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.06;

    // final soft clipper: linear to 0.7, then tanh knee to an asymptote of 0.98
    const pre = ctx.createGain();
    pre.gain.value = 0.5; // curve domain [-1,1] represents [-2,2]
    this.clipper = ctx.createWaveShaper();
    this.clipper.curve = AudioEngine.clipCurve();
    this.clipper.oversample = '2x';

    this.master.connect(dc);
    dc.connect(this.compressor);
    this.compressor.connect(makeup);
    makeup.connect(this.limiter);
    this.limiter.connect(pre);
    pre.connect(this.clipper);
    this.clipper.connect(ctx.destination);

    // --- buses ---
    this.sfxBus = ctx.createGain();
    this.slowFilter = ctx.createBiquadFilter();
    this.slowFilter.type = 'lowpass';
    this.slowFilter.frequency.value = 22000;
    this.slowFilter.Q.value = 0.7;
    this.sfxBus.connect(this.slowFilter);
    const sfxTrim = ctx.createGain();
    sfxTrim.gain.value = 0.7; // layered sfx are hot; keep the glue comp from crushing them
    this.slowFilter.connect(sfxTrim);
    sfxTrim.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.55;
    this.duckGain = ctx.createGain();
    this.musicBus.connect(this.duckGain);
    this.duckGain.connect(this.master);

    this.voiceBus = ctx.createGain();
    this.voiceBus.connect(this.master);

    // --- reverb ---
    this.reverbSend = ctx.createGain();
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.makeImpulse(2.6, 2.8);
    this.reverbReturn = ctx.createGain();
    this.reverbReturn.gain.value = 0.55;
    const preHp = ctx.createBiquadFilter();
    preHp.type = 'highpass';
    preHp.frequency.value = 180;
    this.reverbSend.connect(preHp);
    preHp.connect(this.convolver);
    this.convolver.connect(this.reverbReturn);
    this.reverbReturn.connect(this.master);

    // --- short room (early reflections, wide stereo) ---
    this.roomSend = ctx.createGain();
    const roomHp = ctx.createBiquadFilter();
    roomHp.type = 'highpass';
    roomHp.frequency.value = 140;
    const room = ctx.createConvolver();
    room.buffer = this.makeRoom(0.42);
    const roomReturn = ctx.createGain();
    roomReturn.gain.value = 0.5;
    this.roomSend.connect(roomHp);
    roomHp.connect(room);
    room.connect(roomReturn);
    roomReturn.connect(this.master);

    // --- shared buffers ---
    this.noiseBuffer = this.makeNoise(2);
  }

  // ---------------------------------------------------------------- buffers

  private static clipCurve(): Float32Array<ArrayBuffer> {
    const n = 4096;
    const c = new Float32Array(n);
    const knee = 0.7;
    const room = 0.98 - knee;
    for (let i = 0; i < n; i++) {
      const x = ((i / (n - 1)) * 2 - 1) * 2;
      const a = Math.abs(x);
      const y = a <= knee ? a : knee + room * Math.tanh((a - knee) / room);
      c[i] = x < 0 ? -y : y;
    }
    return c;
  }

  /** Dense, short stereo early reflections: concrete/metal room slap. */
  private makeRoom(seconds: number): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / rate;
        lp += 0.55 * (Math.random() * 2 - 1 - lp);
        d[i] = lp * Math.exp(-t / 0.07) * 0.5 * (t < 0.004 ? t / 0.004 : 1);
      }
      for (let k = 0; k < 14; k++) {
        const tt = 0.005 + Math.pow(Math.random(), 1.4) * 0.09 + ch * 0.0017;
        const idx = Math.floor(tt * rate);
        if (idx < len) d[idx] += (Math.random() < 0.5 ? -1 : 1) * (0.9 - tt * 7) * 0.8;
      }
    }
    return buf;
  }

  private makeNoise(seconds: number): AudioBuffer {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Industrial-hall impulse: early reflections + exponentially decaying, darkening noise tail. */
  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // one-pole lowpass whose coefficient closes over time -> tail gets darker
        const coef = 0.85 - 0.7 * t;
        lp = lp + coef * (Math.random() * 2 - 1 - lp);
        d[i] = lp * Math.pow(1 - t, decay);
      }
      // early reflections (metal room slapback)
      const taps = [0.011, 0.019, 0.027, 0.041, 0.058, 0.077];
      for (let k = 0; k < taps.length; k++) {
        const idx = Math.floor((taps[k] + ch * 0.0031) * rate);
        if (idx < len) d[idx] += (k % 2 ? -1 : 1) * (0.7 - k * 0.09);
      }
    }
    return buf;
  }

  // ---------------------------------------------------------------- control

  unlock(): void {
    try {
      if (this.ctx.state !== 'running') {
        void this.ctx.resume().catch(() => undefined);
      }
      if (!this.unlocked) {
        this.unlocked = true;
        // iOS: play a silent buffer inside the gesture
        const src = this.ctx.createBufferSource();
        src.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
        src.connect(this.ctx.destination);
        src.onended = () => src.disconnect();
        src.start(0);
      }
    } catch {
      /* ignore */
    }
  }

  setVolume(master: number, music: number, sfx: number): void {
    try {
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(clamp(master, 0, 1) * 0.9, t, 0.03);
      this.musicBus.gain.setTargetAtTime(clamp(music, 0, 1) * 0.55, t, 0.03);
      this.sfxBus.gain.setTargetAtTime(clamp(sfx, 0, 1), t, 0.03);
      this.voiceBus.gain.setTargetAtTime(Math.max(clamp(sfx, 0, 1), 0.5), t, 0.03);
    } catch {
      /* ignore */
    }
  }

  setListener(pos: V3, yaw: number): void {
    this.listenerPos.x = pos.x;
    this.listenerPos.y = pos.y;
    this.listenerPos.z = pos.z;
    this.listenerYaw = yaw;
  }

  spatial(pos?: V3): { gain: number; pan: number } {
    if (!pos) return { gain: 1, pan: 0 };
    const dx = pos.x - this.listenerPos.x;
    const dy = pos.y - this.listenerPos.y;
    const dz = pos.z - this.listenerPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    let gain = 1;
    if (dist > NEAR) {
      const f = clamp(1 - (dist - NEAR) / (FAR - NEAR), 0, 1);
      gain = f * f * (0.6 + 0.4 * f);
    }
    const hd = Math.sqrt(dx * dx + dz * dz);
    let pan = 0;
    let behind = 0;
    if (hd > 0.001) {
      const yaw = this.listenerYaw;
      // camera forward = (-sin yaw, 0, -cos yaw); right = (cos yaw, 0, -sin yaw)
      const rx = Math.cos(yaw);
      const rz = -Math.sin(yaw);
      const fx = -Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const side = (dx * rx + dz * rz) / hd;
      const front = (dx * fx + dz * fz) / hd;
      // fade panning in as the source leaves the near field
      pan = side * 0.85 * clamp(hd / 2, 0, 1);
      behind = front < 0 ? -front : 0;
    }
    gain *= 1 - behind * 0.2;
    return { gain: clamp(gain, 0, 1), pan: clamp(pan, -1, 1) };
  }

  /**
   * Output chain at a world position. Connect sources to the returned GainNode.
   * Call release(node) when done to disconnect the chain (sfx.ts does this automatically).
   */
  out(pos?: V3, vol = 1, reverb = 0.12, bus?: AudioNode): GainNode {
    const ctx = this.ctx;
    const s = this.spatial(pos);
    const input = ctx.createGain();
    input.gain.value = vol * s.gain;
    const panner = ctx.createStereoPanner();
    panner.pan.value = s.pan;
    input.connect(panner);
    panner.connect(bus ?? this.sfxBus);
    const nodes: AudioNode[] = [input, panner];
    // distant sounds are more reverberant
    const wet = reverb + (pos ? (1 - s.gain) * 0.25 : 0);
    if (wet > 0.001) {
      const send = ctx.createGain();
      send.gain.value = Math.min(1, wet) * Math.max(0.15, s.gain);
      input.connect(send);
      send.connect(this.reverbSend);
      nodes.push(send);
    }
    this.chains.set(input, nodes);
    return input;
  }

  /** Disconnect a chain created by out(). Safe to call multiple times. */
  release(node: GainNode): void {
    const nodes = this.chains.get(node);
    if (!nodes) return;
    this.chains.delete(node);
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
  }

  duck(amount: number, time: number): void {
    try {
      const t = this.ctx.currentTime;
      const target = clamp(1 - amount, 0.05, 1);
      const g = this.duckGain.gain;
      const until = t + Math.max(0.02, time);
      // never weaken an in-progress deeper duck
      if (t < this.duckUntil && this.duckTarget <= target && until <= this.duckUntil + 0.05) return;
      const deeper = t < this.duckUntil ? Math.min(target, this.duckTarget) : target;
      this.duckUntil = Math.max(until, t < this.duckUntil ? this.duckUntil : 0);
      this.duckTarget = deeper;
      const cur = g.value;
      g.cancelScheduledValues(t);
      g.setValueAtTime(cur, t);
      // fast dip (punch), short hold, smooth musical recovery
      g.linearRampToValueAtTime(Math.min(cur, deeper), t + 0.008);
      g.setValueAtTime(deeper, this.duckUntil);
      g.setTargetAtTime(1, this.duckUntil, 0.11);
    } catch {
      /* ignore */
    }
  }

  setTimeScale(s: number): void {
    try {
      const scale = clamp(s, 0.05, 1);
      if (Math.abs(scale - this.timeScale) < 0.001) return;
      this.timeScale = scale;
      const t = this.ctx.currentTime;
      const f = scale >= 0.999 ? 22000 : 500 * Math.pow(2, scale * 4.5); // 0.2 -> ~940Hz, 0.8 -> ~6kHz
      this.slowFilter.frequency.cancelScheduledValues(t);
      this.slowFilter.frequency.setTargetAtTime(f, t, 0.08);
      this.slowFilter.Q.setTargetAtTime(scale >= 0.999 ? 0.7 : 2.5, t, 0.08);
    } catch {
      /* ignore */
    }
  }
}

export const audio: AudioEngine = new AudioEngine();
