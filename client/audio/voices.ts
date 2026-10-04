// The cast. Every voice in ROUGED is synthetic: the browser's speech engine, shaped per character,
// with a WebAudio "bed" under each one (radio crackle, tape hiss, sub drone…) so they read as machines.
// The Handler has its own degrading voice (handler.ts); this director keeps everyone from talking over it.

import { audio } from './engine';
import type { HandlerVoice } from './handler';

export type Speaker = 'announcer' | 'broker' | 'mara' | 'warden' | 'enemy' | 'system' | 'directorate';

interface Profile {
  pitch: number;
  rate: number;
  volume: number;
  prefer: RegExp[]; // voice-name hints, best first
  bed: 'none' | 'crackle' | 'tape' | 'drone' | 'breath' | 'beep' | 'hum';
  bedGain: number;
  jitter: number; // per-line pitch randomness
}

const PROFILES: Record<Speaker, Profile> = {
  // big, flat, arena-announcer bark
  announcer: { pitch: 0.45, rate: 1.08, volume: 1, prefer: [/daniel/i, /fred/i, /alex/i, /google uk english male/i, /male/i], bed: 'hum', bedGain: 0.05, jitter: 0.02 },
  // the Broker: slow, low, amused, a bad radio link
  broker: { pitch: 0.55, rate: 0.86, volume: 0.95, prefer: [/ralph/i, /fred/i, /albert/i, /bruce/i, /google uk english male/i, /male/i], bed: 'crackle', bedGain: 0.09, jitter: 0.05 },
  // Mara: a recording, tired, close to the mic
  mara: { pitch: 1.05, rate: 0.92, volume: 0.9, prefer: [/samantha/i, /karen/i, /moira/i, /tessa/i, /victoria/i, /google uk english female/i, /female/i, /zira/i], bed: 'tape', bedGain: 0.08, jitter: 0.03 },
  // Wardens: enormous, slow, pitched into the floor
  warden: { pitch: 0.1, rate: 0.72, volume: 1, prefer: [/fred/i, /bruce/i, /daniel/i, /male/i], bed: 'drone', bedGain: 0.16, jitter: 0.02 },
  // enemies whispering your name
  enemy: { pitch: 0.2, rate: 0.8, volume: 0.45, prefer: [/whisper/i, /fred/i, /male/i], bed: 'breath', bedGain: 0.07, jitter: 0.15 },
  // terminals reading themselves aloud
  system: { pitch: 0.8, rate: 1.15, volume: 0.75, prefer: [/zarvox/i, /trinoids/i, /fred/i, /google us english/i, /english/i], bed: 'beep', bedGain: 0.05, jitter: 0 },
  // the Directorate: corporate, warm, wrong
  directorate: { pitch: 0.95, rate: 1.0, volume: 0.9, prefer: [/google us english/i, /samantha/i, /alex/i, /english/i], bed: 'hum', bedGain: 0.04, jitter: 0 },
};

interface Line { speaker: Speaker; text: string; priority: number; onStart?: () => void }

export class VoiceCast {
  private voices: SpeechSynthesisVoice[] = [];
  private queue: Line[] = [];
  private busyUntil = 0;
  private current: Line | null = null;
  enabled = true;
  volume = 1;
  handler: HandlerVoice | null = null;
  onSubtitle: (speaker: Speaker, text: string) => void = () => {};

  constructor() {
    try {
      const synth = window.speechSynthesis;
      const load = () => { try { this.voices = synth.getVoices().filter((v) => /^en/i.test(v.lang) || /english/i.test(v.name)); } catch { /* */ } };
      load();
      synth?.addEventListener?.('voiceschanged', load);
    } catch { /* no speech */ }
  }

  private pick(p: Profile): SpeechSynthesisVoice | null {
    for (const re of p.prefer) { const v = this.voices.find((x) => re.test(x.name)); if (v) return v; }
    return this.voices[0] ?? null;
  }

  /**
   * priority: 0 ambient bark (dropped if anyone is talking) · 1 normal (queued) · 2 important (queued first) · 3 interrupt everything
   */
  say(speaker: Speaker, text: string, priority = 1, onStart?: () => void) {
    if (!text) return;
    const line: Line = { speaker, text, priority, onStart };
    const busy = this.busy();
    if (priority >= 3) { this.queue = []; this.cut(); this.speak(line); return; }
    if (!busy) { this.speak(line); return; }
    if (priority === 0) return;
    this.queue.push(line);
    this.queue.sort((a, b) => b.priority - a.priority);
    if (this.queue.length > 3) this.queue.length = 3;
  }

  busy(): boolean {
    return performance.now() < this.busyUntil || !!this.handler?.speaking;
  }

  /** Call every frame. */
  update() {
    if (this.queue.length && !this.busy()) this.speak(this.queue.shift()!);
  }

  cut() {
    try { window.speechSynthesis?.cancel(); } catch { /* */ }
    this.handler?.cancel();
    this.busyUntil = 0;
  }

  clear() { this.queue = []; }

  private speak(line: Line) {
    const p = PROFILES[line.speaker];
    this.current = line;
    const est = 300 + (line.text.length * 68) / p.rate;
    this.busyUntil = performance.now() + est;
    this.onSubtitle(line.speaker, line.text);
    line.onStart?.();
    this.bed(p, est / 1000);
    if (!this.enabled) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(line.text);
      const v = this.pick(p);
      if (v) u.voice = v;
      u.pitch = Math.max(0, Math.min(2, p.pitch + (Math.random() - 0.5) * p.jitter * 2));
      u.rate = p.rate;
      u.volume = Math.max(0, Math.min(1, p.volume * this.volume));
      u.onend = () => { if (this.current === line) this.busyUntil = performance.now() + 150; };
      u.onerror = () => { this.busyUntil = performance.now(); };
      synth.speak(u);
    } catch { /* never throw */ }
  }

  /** The machine under the voice. */
  private bed(p: Profile, dur: number) {
    if (p.bed === 'none' || p.bedGain <= 0) return;
    try {
      const ctx = audio.ctx;
      if (ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(p.bedGain, t + 0.08);
      out.gain.setValueAtTime(p.bedGain, t + Math.max(0.1, dur - 0.15));
      out.gain.linearRampToValueAtTime(0, t + dur + 0.1);
      out.connect(audio.voiceBus);
      const nodes: AudioNode[] = [out];
      const noise = () => { const n = ctx.createBufferSource(); n.buffer = audio.noiseBuffer; n.loop = true; n.start(t); n.stop(t + dur + 0.2); return n; };
      switch (p.bed) {
        case 'crackle': {
          const n = noise();
          const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8;
          const am = ctx.createGain(); am.gain.value = 0;
          // random crackle bursts
          for (let k = 0; k < dur * 14; k++) { const tk = t + Math.random() * dur; am.gain.setValueAtTime(Math.random() < 0.3 ? 1 : 0.15, tk); am.gain.setValueAtTime(0.1, tk + 0.02); }
          n.connect(bp).connect(am).connect(out); nodes.push(n, bp, am);
          break;
        }
        case 'tape': {
          const n = noise();
          const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
          const hum = ctx.createOscillator(); hum.frequency.value = 60; const hg = ctx.createGain(); hg.gain.value = 0.25;
          hum.connect(hg).connect(out); hum.start(t); hum.stop(t + dur + 0.2);
          n.connect(hp).connect(out); nodes.push(n, hp, hum, hg);
          break;
        }
        case 'drone': {
          const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 38;
          const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 38.6;
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
          o1.connect(lp); o2.connect(lp); lp.connect(out);
          o1.start(t); o2.start(t); o1.stop(t + dur + 0.2); o2.stop(t + dur + 0.2);
          nodes.push(o1, o2, lp);
          break;
        }
        case 'breath': {
          const n = noise();
          const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 2;
          const lfo = ctx.createOscillator(); lfo.frequency.value = 0.7; const lg = ctx.createGain(); lg.gain.value = 500;
          lfo.connect(lg).connect(bp.frequency); lfo.start(t); lfo.stop(t + dur + 0.2);
          n.connect(bp).connect(out); nodes.push(n, bp, lfo, lg);
          break;
        }
        case 'beep': {
          for (let k = 0; k < Math.min(6, dur * 3); k++) {
            const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 900 + Math.random() * 1400;
            const g = ctx.createGain(); const tk = t + k * 0.33;
            g.gain.setValueAtTime(0, tk); g.gain.linearRampToValueAtTime(0.4, tk + 0.005); g.gain.linearRampToValueAtTime(0, tk + 0.04);
            o.connect(g).connect(out); o.start(tk); o.stop(tk + 0.05); nodes.push(o, g);
          }
          break;
        }
        case 'hum': {
          const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 110;
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
          o.connect(lp).connect(out); o.start(t); o.stop(t + dur + 0.2); nodes.push(o, lp);
          break;
        }
      }
      setTimeout(() => { for (const n of nodes) { try { n.disconnect(); } catch { /* */ } } }, (dur + 0.5) * 1000);
    } catch { /* never throw */ }
  }
}

// ───────────────────────────── scripted barks ─────────────────────────────

/** What each Warden says. Index = biome. */
export const WARDEN_VOICE: { intro: string[]; phase: string[]; death: string[] }[] = [
  { intro: ['Into the furnace, copy.', 'Everything here gets melted down. You too.'], phase: ['Hotter.', 'You are only ore.'], death: ['Recast... me...'] },
  { intro: ['You are overdue. Return yourself to the shelf.', 'I have catalogued you four thousand times.'], phase: ['Filing error.', 'Out of order.'], death: ['Misfiled...'] },
  { intro: ['I am what they made first. Before you. From you.', 'Look at me. You should recognise the hands.'], phase: ['We were the same scan.', 'Stop hitting yourself.'], death: ['Finally... a copy that wins.'] },
  { intro: ['Hush now. Back into the glass, little one.', 'I kept a body for you. You will never wear it.'], phase: ['Mother is not angry.', 'Shhh. Shhh.'], death: ['Who will... keep them... warm...'] },
  { intro: ['Weeds. You are weeds in a good memory.', 'This jungle remembers you. I prune what it remembers.'], phase: ['Cut back. Cut back.', 'The rain is mine.'], death: ['Overgrown...'] },
  { intro: ['Soldier. Fall in. You have been at war for eleven years.', 'Every robot out there fights like you. I taught them.'], phase: ['Advance!', 'No retreat. There is nowhere to retreat to.'], death: ['Tell them... we held...'] },
  { intro: ['Hello.', 'You came all the way inside.'], phase: ['Keep going. Please.', 'Harder. I can take it. I want to.'], death: ['Thank you.'] },
];

export const ANNOUNCER = {
  streak: ['', 'DOUBLE KILL', 'TRIPLE KILL', 'MEGA KILL', 'RAMPAGE'],
  roomClear: ['ROOM CLEARED', 'SECTOR CLEAR', 'CLEARED'],
  wardenDown: 'WARDEN DESTROYED',
  legendary: 'LEGENDARY',
  synergy: 'NEW PROTOCOL',
  extract: 'EXTRACTION AVAILABLE',
  trialStart: 'TRIAL. BEAT THE CLOCK.',
  trialWin: 'TRIAL COMPLETE',
  trialFail: 'TRIAL FAILED',
  levelUp: 'LEVEL UP',
  depth: (n: number) => `DEPTH ${n}`,
};
