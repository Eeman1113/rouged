/**
 * ROUGED audio engine.
 *
 * Owns the single AudioContext and the mixing graph:
 *
 *   sfx sources -> out(gain -> panner) -> sfxBus -> slowmoFilter -> master
 *                                    \-> reverbSend -> convolver -> reverbReturn -> master
 *   music       -> musicBus -> duckGain -> master
 *   voice       -> voiceBus -> master
 *   master -> glue compressor -> brickwall limiter -> destination
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

  /** Final output stages. */
  private compressor: DynamicsCompressorNode;
  private limiter: DynamicsCompressorNode;
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
  private timeScale = 1;

  constructor() {
    const ctx = createContext();
    this.ctx = ctx;

    // --- master chain ---
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 5;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.18;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -2.5;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.08;

    this.master.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(ctx.destination);

    // --- buses ---
    this.sfxBus = ctx.createGain();
    this.slowFilter = ctx.createBiquadFilter();
    this.slowFilter.type = 'lowpass';
    this.slowFilter.frequency.value = 22000;
    this.slowFilter.Q.value = 0.7;
    this.sfxBus.connect(this.slowFilter);
    this.slowFilter.connect(this.master);

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

    // --- shared buffers ---
    this.noiseBuffer = this.makeNoise(2);
  }

  // ---------------------------------------------------------------- buffers

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
      if (until < this.duckUntil && g.value < target) return;
      this.duckUntil = until;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(target, t + 0.015);
      g.setValueAtTime(target, until);
      g.linearRampToValueAtTime(1, until + 0.35);
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
