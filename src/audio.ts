// ROUGED — Audio engine: synthesized SFX, dynamic layered music, Handler voice.
// Everything is generated with WebAudio — no external assets.

type LayerName = 'base' | 'combat' | 'aggression' | 'rampage' | 'boss';

class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  sfxBus!: GainNode;
  musicBus!: GainNode;
  voiceBus!: GainNode;
  private musicLayers = new Map<LayerName, GainNode>();
  private musicTimer: number | null = null;
  private step = 0;
  private bpm = 132;
  private nextStepTime = 0;
  hitStreak = 0;
  private lastHitTime = 0;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.34;
    this.musicBus.connect(this.master);
    this.voiceBus = this.ctx.createGain();
    this.voiceBus.gain.value = 1.0;
    this.voiceBus.connect(this.master);
    const layerNames: LayerName[] = ['base', 'combat', 'aggression', 'rampage', 'boss'];
    for (const n of layerNames) {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.connect(this.musicBus);
      this.musicLayers.set(n, g);
    }
    this.setLayer('base', 1);
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  setLayer(name: LayerName, target: number, fade = 1.2) {
    if (!this.ctx) return;
    const g = this.musicLayers.get(name);
    if (!g) return;
    g.gain.cancelScheduledValues(this.ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(target, this.ctx.currentTime + fade);
  }

  // intensity 0=calm hub, 1=combat, 2=streak3+, 3=rampage, +boss flag
  setMusicIntensity(level: number, boss = false) {
    this.setLayer('base', 1);
    this.setLayer('combat', level >= 1 ? 1 : 0);
    this.setLayer('aggression', level >= 2 ? 1 : 0);
    this.setLayer('rampage', level >= 3 ? 1 : 0);
    this.setLayer('boss', boss ? 1 : 0);
  }

  musicDuckToDrone() {
    // on death: everything drops except a single sustained note
    for (const n of ['combat', 'aggression', 'rampage', 'boss'] as LayerName[]) this.setLayer(n, 0, 0.15);
    this.setLayer('base', 0.4, 0.4);
  }

  startMusic() {
    if (!this.ctx || this.musicTimer !== null) return;
    this.nextStepTime = this.ctx.currentTime + 0.05;
    this.step = 0;
    const stepDur = 60 / this.bpm / 4; // 16th notes
    const tick = () => {
      if (!this.ctx) return;
      while (this.nextStepTime < this.ctx.currentTime + 0.12) {
        this.scheduleStep(this.step, this.nextStepTime, stepDur);
        this.nextStepTime += stepDur;
        this.step = (this.step + 1) % 64;
      }
    };
    this.musicTimer = window.setInterval(tick, 40);
  }

  stopMusic() {
    if (this.musicTimer !== null) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }

  private scheduleStep(step: number, t: number, stepDur: number) {
    if (!this.ctx) return;
    const bar = Math.floor(step / 16);
    const s16 = step % 16;
    const root = 41.2; // E1
    const minor = [0, 2, 3, 5, 7, 8, 10];
    // BASE: dark drone — alternating root/fifth every bar
    if (s16 === 0) {
      const f = bar % 4 === 3 ? root * Math.pow(2, 3 / 12) : root;
      this.tone(this.musicLayers.get('base')!, f, t, stepDur * 15, 'sawtooth', 0.20, 300);
      this.tone(this.musicLayers.get('base')!, f / 2, t, stepDur * 15, 'sine', 0.30, 200);
    }
    // COMBAT: kick on quarters + hats on 8ths
    if (s16 % 4 === 0) this.kick(this.musicLayers.get('combat')!, t, 0.7);
    if (s16 % 2 === 1) this.hat(this.musicLayers.get('combat')!, t, 0.10);
    // AGGRESSION: driving 8th bassline + offbeat snare-ish noise
    if (s16 % 2 === 0) {
      const deg = minor[[0, 0, 3, 5, 0, 0, 6, 5][(s16 / 2) | 0]];
      this.tone(this.musicLayers.get('aggression')!, root * 2 * Math.pow(2, deg / 12), t, stepDur * 1.6, 'square', 0.10, 900);
    }
    if (s16 === 4 || s16 === 12) this.noiseBurst(this.musicLayers.get('aggression')!, t, 0.09, 0.18, 1800);
    // RAMPAGE: fast arp 16ths
    {
      const deg = [0, 3, 5, 7, 10, 7, 5, 3][step % 8];
      this.tone(this.musicLayers.get('rampage')!, root * 4 * Math.pow(2, deg / 12), t, stepDur * 0.9, 'sawtooth', 0.07, 2400);
    }
    // BOSS: dissonant tritone stabs + slow toms
    if (s16 === 0 || s16 === 6 || s16 === 10) {
      this.tone(this.musicLayers.get('boss')!, root * 2, t, stepDur * 3, 'sawtooth', 0.16, 700);
      this.tone(this.musicLayers.get('boss')!, root * 2 * Math.pow(2, 6 / 12), t, stepDur * 3, 'sawtooth', 0.12, 700);
    }
    if (s16 % 8 === 2) this.kick(this.musicLayers.get('boss')!, t, 0.9, 90);
  }

  private tone(bus: GainNode, freq: number, t: number, dur: number, type: OscillatorType, vol: number, lp = 4000) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = lp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  private kick(bus: GainNode, t: number, vol: number, startFreq = 150) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(startFreq, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.11);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + 0.16);
  }

  private hat(bus: GainNode, t: number, vol: number) {
    this.noiseBurst(bus, t, 0.03, vol, 8000, 'highpass');
  }

  noiseBurst(bus: GainNode, t: number, dur: number, vol: number, freq = 3000, type: BiquadFilterType = 'bandpass', q = 1) {
    if (!this.ctx) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t);
  }

  // ── SFX ──────────────────────────────────────────
  private now() { return this.ctx ? this.ctx.currentTime : 0; }

  shootPulse() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.05, 0.30, 2600);
    this.toneSfx(880 + Math.random() * 120, t, 0.06, 'square', 0.16);
    this.toneSfx(140, t, 0.07, 'sine', 0.30);
  }
  shootBreacher() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.22, 0.55, 900, 'lowpass');
    this.kickSfx(t, 0.8, 120);
    this.toneSfx(320, t, 0.1, 'sawtooth', 0.2, 1200);
  }
  lanceChargeStart(): (() => void) {
    if (!this.ctx) return () => {};
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(80, this.now());
    o.frequency.linearRampToValueAtTime(900, this.now() + 1.1);
    const g = this.ctx.createGain();
    g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.12, this.now() + 0.15);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 2000;
    o.connect(f); f.connect(g); g.connect(this.sfxBus);
    o.start();
    return () => { try { o.stop(); g.disconnect(); } catch (_) {} };
  }
  shootLance(power: number) {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.3, 0.4, 3000);
    this.toneSfx(1600, t, 0.28, 'sawtooth', 0.25, 5000);
    this.toneSfx(90, t, 0.3, 'sine', 0.4);
    this.toneSfx(2000 + power * 4, t, 0.15, 'square', 0.12, 6000);
  }
  ripper() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.08, 0.14, 400 + Math.random() * 300, 'bandpass', 3);
  }
  dash() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.18, 0.25, 600, 'bandpass', 0.6);
  }
  jumpLand() {
    if (!this.ctx) return;
    this.noiseBurst(this.sfxBus, this.now(), 0.06, 0.1, 300, 'lowpass');
  }

  hitmark() {
    if (!this.ctx) return;
    const t = this.now();
    // pitch rises with consecutive hits
    const nowMs = performance.now();
    if (nowMs - this.lastHitTime > 900) this.hitStreak = 0;
    this.lastHitTime = nowMs;
    this.hitStreak = Math.min(this.hitStreak + 1, 24);
    const freq = 1200 * Math.pow(2, this.hitStreak * 0.03 / 1.0);
    this.toneSfx(freq, t, 0.04, 'square', 0.14, 8000);
  }

  killConfirm() {
    if (!this.ctx) return;
    const t = this.now();
    const p = 1 + (Math.random() - 0.5) * 0.08; // slight pitch shift per kill
    // click + ding + sub-bass thump
    this.noiseBurst(this.sfxBus, t, 0.03, 0.3, 4000, 'highpass');
    this.toneSfx(1560 * p, t, 0.16, 'sine', 0.28);
    this.toneSfx(2340 * p, t + 0.01, 0.12, 'sine', 0.14);
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(110 * p, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + 0.22);
  }

  headshotKill() {
    this.killConfirm();
    if (!this.ctx) return;
    this.toneSfx(3120, this.now() + 0.02, 0.1, 'sine', 0.18);
  }

  gloryKill() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.3, 0.5, 500, 'lowpass');
    this.noiseBurst(this.sfxBus, t + 0.05, 0.2, 0.4, 1800, 'bandpass', 2);
    this.kickSfx(t, 1.0, 80);
    this.toneSfx(60, t, 0.4, 'sine', 0.5);
  }

  playerHurt() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.15, 0.35, 400, 'lowpass');
    this.toneSfx(180, t, 0.12, 'sawtooth', 0.2, 800);
  }

  enemyDeath() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.25, 0.3, 700, 'lowpass');
    this.toneSfx(220, t, 0.2, 'sawtooth', 0.16, 900);
  }

  powerupReveal(legendary: boolean) {
    if (!this.ctx) return;
    const t = this.now();
    if (legendary) {
      // rising synth chord — the jackpot sound
      const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0];
      notes.forEach((f, i) => {
        this.toneSfx(f, t + i * 0.09, 1.4, 'sawtooth', 0.14, 4000);
        this.toneSfx(f * 2, t + i * 0.09, 1.0, 'sine', 0.08);
      });
      this.toneSfx(1046.5, t + 0.55, 2.0, 'sine', 0.16);
    } else {
      // drumroll-ish riser
      for (let i = 0; i < 10; i++) this.noiseBurst(this.sfxBus, t + i * 0.05, 0.03, 0.08 + i * 0.012, 2000);
      this.toneSfx(520, t + 0.5, 0.5, 'sawtooth', 0.12, 3000);
    }
  }

  powerupPick() {
    if (!this.ctx) return;
    const t = this.now();
    this.toneSfx(660, t, 0.12, 'square', 0.16);
    this.toneSfx(990, t + 0.08, 0.2, 'square', 0.14);
  }

  shatter() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.25, 0.3, 5000, 'highpass');
    this.noiseBurst(this.sfxBus, t + 0.03, 0.2, 0.2, 3000, 'bandpass', 4);
  }

  synergyFound() {
    if (!this.ctx) return;
    const t = this.now();
    [523, 622, 784, 1046, 1244].forEach((f, i) => this.toneSfx(f, t + i * 0.07, 0.9, 'sawtooth', 0.13, 5000));
  }

  doorOpen() {
    if (!this.ctx) return;
    const t = this.now();
    this.noiseBurst(this.sfxBus, t, 0.4, 0.15, 250, 'lowpass');
    this.toneSfx(90, t, 0.35, 'sawtooth', 0.1, 400);
  }

  levelUp() {
    if (!this.ctx) return;
    const t = this.now();
    [440, 554, 659, 880].forEach((f, i) => this.toneSfx(f, t + i * 0.08, 0.4, 'square', 0.12, 4000));
  }

  deathSting() {
    if (!this.ctx) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 1.4);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    o.connect(f); f.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + 1.6);
  }

  staggerReady() {
    if (!this.ctx) return;
    this.toneSfx(1980, this.now(), 0.09, 'sine', 0.2);
  }

  bossRoar() {
    if (!this.ctx) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(160, t + 0.5);
    o.frequency.linearRampToValueAtTime(55, t + 1.2);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 700;
    o.connect(f); f.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + 1.5);
    this.noiseBurst(this.sfxBus, t + 0.1, 0.8, 0.25, 300, 'lowpass');
  }

  private toneSfx(freq: number, t: number, dur: number, type: OscillatorType, vol: number, lp = 8000) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = lp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  private kickSfx(t: number, vol: number, startFreq = 150) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(startFreq, t);
    o.frequency.exponentialRampToValueAtTime(36, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + 0.18);
  }

  // ── Handler voice (speechSynthesis + degradation) ──
  speak(text: string, degradation: number) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92 + degradation * 0.05 + (Math.random() - 0.5) * degradation * 0.25;
      u.pitch = Math.max(0.1, 0.55 - degradation * 0.2 + (Math.random() - 0.5) * degradation * 0.6);
      u.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => /en[-_]/i.test(v.lang) && /male|daniel|google uk english male/i.test(v.name))
        || voices.find(v => /en[-_]/i.test(v.lang)) || voices[0];
      if (v) u.voice = v;
      // glitch: chance to drop the line into stutter
      if (degradation > 0.4 && Math.random() < degradation * 0.35) {
        const words = text.split(' ');
        const i = Math.floor(Math.random() * words.length);
        u.text = words.slice(0, i + 1).join(' ') + '… ' + words[i] + '… ' + words.slice(i + 1).join(' ');
      }
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }
  stopVoice() { try { window.speechSynthesis?.cancel(); } catch (_) {} }
}

export const audio = new AudioEngine();
