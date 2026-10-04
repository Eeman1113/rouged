// ROUGED — the Handler's voice, via the Web Speech API.
// Clean and clinical early; drifting and glitching mid-game; split across voices late;
// after the reveal, clean again — slower, warmer.

import { handlerPhase } from '../story/handlerLines';

export interface HandlerVoiceOpts {
  runCount: number;
  priority?: number; /* higher interrupts lower */
}

type ChunkKind = 'speak' | 'other' | 'glitch' | 'pause';
interface Chunk {
  kind: ChunkKind;
  text: string;
}

interface PhaseVoice {
  pitch: number;
  rate: number;
  drift: number; // +/- pitch drift per chunk
  rateDrift: number;
  dropChance: number; // chance a spoken chunk is swallowed by static
  glitchScale: number; // multiplier on [g] burst duration
  subtitleGlitch: number; // 0..1 passed to onSubtitle
  charCorrupt: number; // chance per letter of █ in subtitles
  splitOther: boolean; // use a different voice for [other]
}

const PHASES: PhaseVoice[] = [
  { pitch: 0.7, rate: 0.95, drift: 0, rateDrift: 0, dropChance: 0, glitchScale: 0.6, subtitleGlitch: 0, charCorrupt: 0, splitOther: false },
  { pitch: 0.7, rate: 0.95, drift: 0.05, rateDrift: 0.02, dropChance: 0.04, glitchScale: 0.8, subtitleGlitch: 0.15, charCorrupt: 0, splitOther: false },
  { pitch: 0.68, rate: 0.94, drift: 0.1, rateDrift: 0.04, dropChance: 0.07, glitchScale: 1, subtitleGlitch: 0.3, charCorrupt: 0.01, splitOther: true },
  { pitch: 0.66, rate: 0.93, drift: 0.15, rateDrift: 0.06, dropChance: 0.1, glitchScale: 1.2, subtitleGlitch: 0.5, charCorrupt: 0.025, splitOther: true },
  { pitch: 0.64, rate: 0.92, drift: 0.2, rateDrift: 0.08, dropChance: 0.15, glitchScale: 1.5, subtitleGlitch: 0.75, charCorrupt: 0.045, splitOther: true },
  { pitch: 0.65, rate: 0.9, drift: 0.18, rateDrift: 0.07, dropChance: 0.12, glitchScale: 1.5, subtitleGlitch: 0.8, charCorrupt: 0.04, splitOther: true },
  { pitch: 0.9, rate: 0.88, drift: 0, rateDrift: 0, dropChance: 0, glitchScale: 0, subtitleGlitch: 0.05, charCorrupt: 0, splitOther: false },
];

const PRIMARY_PREFS = [
  'Daniel', 'Google UK English Male', 'Microsoft Guy', 'Microsoft David', 'Alex', 'Aaron', 'Arthur', 'Fred', 'Oliver', 'Rishi',
];
const OTHER_PREFS = [
  'Whisper', 'Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Zira', 'Tessa', 'Fiona', 'Microsoft Aria', 'Victoria',
];

function getSynth(): SpeechSynthesis | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = (window as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
    if (!s || typeof SpeechSynthesisUtterance === 'undefined') return null;
    return s;
  } catch {
    return null;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** First rough syllable of a word, for spoken stutters: "candidate" -> "can". */
function firstSyllable(word: string): string {
  const m = /^[^aeiouy]*[aeiouy]+[^aeiouy]?/i.exec(word);
  return m ? m[0] : word.slice(0, 2);
}

/** Convert "c~c~candidate" into something TTS will say as a stutter. */
function speakableStutters(text: string): string {
  return text.replace(/((?:[A-Za-z']+~)+)([A-Za-z']+)/g, (_m: string, pre: string, word: string) => {
    const reps = pre.split('~').filter((p) => p.length > 0).length;
    const syl = firstSyllable(word);
    let out = '';
    for (let i = 0; i < reps; i++) out += syl + '— ';
    return out + word;
  });
}

function parseMarkup(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const re = /\[g\]|\[pause\]|\[other\]([\s\S]*?)\[\/other\]/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  const pushSpeak = (s: string): void => {
    // split into sentence-ish pieces so individual pieces can glitch out
    const parts = s.split(/(?<=[.!?…])\s+/);
    for (const p of parts) {
      const t = p.trim();
      if (t.length > 0) chunks.push({ kind: 'speak', text: t });
    }
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pushSpeak(text.slice(last, m.index));
    const tok = m[0].toLowerCase();
    if (tok === '[g]') chunks.push({ kind: 'glitch', text: '' });
    else if (tok === '[pause]') chunks.push({ kind: 'pause', text: '' });
    else {
      const inner = (m[1] ?? '').trim();
      if (inner.length > 0) chunks.push({ kind: 'other', text: inner });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) pushSpeak(text.slice(last));
  return chunks;
}

function subtitleText(text: string, pv: PhaseVoice, phase: number, rnd: () => number): string {
  let s = text
    .replace(/\[g\]/gi, phase >= 3 && phase <= 5 ? '█' : '')
    .replace(/\[pause\]/gi, '')
    .replace(/\[other\]([\s\S]*?)\[\/other\]/gi, '$1')
    .replace(/~/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (pv.charCorrupt > 0) {
    let out = '';
    for (const ch of s) out += /[A-Za-z]/.test(ch) && rnd() < pv.charCorrupt ? '█' : ch;
    s = out;
  }
  return s;
}

function estimateMs(text: string, rate: number): number {
  return 350 + (text.length * 70) / Math.max(0.5, rate);
}

export class HandlerVoice {
  private readonly onSubtitle: (text: string, glitch: number) => void;
  private readonly onGlitch: (dur: number) => void;
  private enabled = true;
  private volume = 1;
  private isSpeaking = false;
  private curPriority = 0;
  private pending: { text: string; opts: HandlerVoiceOpts } | null = null;
  private gen = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private primary: SpeechSynthesisVoice | null = null;
  private other: SpeechSynthesisVoice | null = null;
  private readonly rnd: () => number = Math.random;

  constructor(onSubtitle: (text: string, glitch: number) => void, onGlitch: (dur: number) => void) {
    this.onSubtitle = onSubtitle;
    this.onGlitch = onGlitch;
    try {
      const synth = getSynth();
      if (synth) {
        this.pickVoices();
        const prev = synth.onvoiceschanged;
        synth.onvoiceschanged = (ev: Event): void => {
          try {
            this.pickVoices();
            if (typeof prev === 'function') prev.call(synth, ev);
          } catch {
            /* ignore */
          }
        };
        if (typeof synth.addEventListener === 'function') {
          synth.addEventListener('voiceschanged', () => this.pickVoices());
        }
      }
    } catch {
      /* never throw */
    }
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) {
      try {
        getSynth()?.cancel();
      } catch {
        /* ignore */
      }
    }
  }

  setVolume(v: number): void {
    this.volume = clamp(Number.isFinite(v) ? v : 1, 0, 1);
  }

  cancel(): void {
    this.pending = null;
    this.stopCurrent();
  }

  say(text: string, opts: HandlerVoiceOpts): void {
    try {
      if (!text) return;
      const pr = opts.priority ?? 0;
      if (this.isSpeaking) {
        if (pr > this.curPriority) {
          this.stopCurrent();
          this.start(text, opts);
        } else {
          this.pending = { text, opts }; // keep at most one, drop older
        }
        return;
      }
      this.start(text, opts);
    } catch {
      /* never throw */
    }
  }

  // ------------------------------------------------------------- internals

  private pickVoices(): void {
    const synth = getSynth();
    if (!synth) return;
    let voices: SpeechSynthesisVoice[] = [];
    try {
      voices = synth.getVoices();
    } catch {
      voices = [];
    }
    if (voices.length === 0) return;
    const en = voices.filter((v) => /^en/i.test(v.lang));
    const pool = en.length > 0 ? en : voices;
    const find = (prefs: string[], exclude: SpeechSynthesisVoice | null): SpeechSynthesisVoice | null => {
      for (const p of prefs) {
        const v = pool.find((x) => x.name.indexOf(p) !== -1 && x !== exclude);
        if (v) return v;
      }
      return null;
    };
    this.primary = find(PRIMARY_PREFS, null) ?? pool[0] ?? null;
    this.other = find(OTHER_PREFS, this.primary) ?? pool.find((v) => v !== this.primary) ?? this.primary;
  }

  private clearTimers(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  private later(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== t);
      try {
        fn();
      } catch {
        /* ignore */
      }
    }, Math.max(0, ms));
    this.timers.push(t);
  }

  private stopCurrent(): void {
    this.gen++;
    this.clearTimers();
    this.isSpeaking = false;
    try {
      getSynth()?.cancel();
    } catch {
      /* ignore */
    }
  }

  private start(text: string, opts: HandlerVoiceOpts): void {
    const gen = ++this.gen;
    this.clearTimers();
    this.isSpeaking = true;
    this.curPriority = opts.priority ?? 0;

    const phase = handlerPhase(opts.runCount);
    const pv = PHASES[phase] ?? PHASES[0]!;
    const chunks = parseMarkup(text);
    const display = subtitleText(text, pv, phase, this.rnd);

    try {
      this.onSubtitle(display, pv.subtitleGlitch);
    } catch {
      /* caller error shouldn't break voice */
    }

    const synth = this.enabled ? getSynth() : null;
    if (!synth || this.volume <= 0) {
      // Silent mode: hold the "speaking" state for roughly as long as the line would take.
      let ms = 0;
      for (const c of chunks) {
        if (c.kind === 'pause') ms += 450;
        else if (c.kind === 'glitch') ms += 200;
        else ms += estimateMs(c.text, pv.rate);
      }
      this.later(ms, () => this.finish(gen));
      return;
    }
    if (!this.primary) this.pickVoices();
    try {
      if (synth.paused) synth.resume();
    } catch {
      /* ignore */
    }
    this.runChunk(chunks, 0, gen, pv, phase, synth);
  }

  private runChunk(chunks: Chunk[], i: number, gen: number, pv: PhaseVoice, phase: number, synth: SpeechSynthesis): void {
    if (gen !== this.gen) return;
    if (i >= chunks.length) {
      this.finish(gen);
      return;
    }
    const c = chunks[i]!;
    const next = (): void => this.runChunk(chunks, i + 1, gen, pv, phase, synth);

    if (c.kind === 'pause') {
      this.later(phase === 6 ? 650 : 450, next);
      return;
    }
    if (c.kind === 'glitch') {
      if (pv.glitchScale <= 0) {
        this.later(250, next); // post-reveal: a breath, not static
        return;
      }
      const dur = (0.12 + this.rnd() * 0.22) * pv.glitchScale;
      this.fireGlitch(dur);
      this.later(dur * 1000, next);
      return;
    }

    // Spoken chunk. Sometimes the static swallows it whole.
    if (pv.dropChance > 0 && chunks.length > 1 && this.rnd() < pv.dropChance) {
      const dur = clamp(estimateMs(c.text, pv.rate) / 1000 * 0.5, 0.15, 0.9);
      this.fireGlitch(dur);
      this.later(dur * 1000, next);
      return;
    }

    const isOther = c.kind === 'other';
    const spoken = speakableStutters(c.text);
    let pitch = pv.pitch + (this.rnd() * 2 - 1) * pv.drift;
    let rate = pv.rate + (this.rnd() * 2 - 1) * pv.rateDrift;
    let voice = this.primary;
    if (isOther) {
      if (pv.splitOther) {
        voice = this.other ?? this.primary;
        pitch = this.rnd() < 0.5 ? 0.25 + this.rnd() * 0.15 : 1.35 + this.rnd() * 0.3;
        rate = 0.8 + this.rnd() * 0.15;
      } else {
        pitch = pv.pitch - 0.15;
        rate = pv.rate - 0.05;
      }
    }

    let done = false;
    const finishChunk = (): void => {
      if (done) return;
      done = true;
      if (gen !== this.gen) return;
      this.later(phase === 6 ? 120 : 60, next);
    };

    try {
      const u = new SpeechSynthesisUtterance(spoken);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = 'en-US';
      }
      u.pitch = clamp(pitch, 0, 2);
      u.rate = clamp(rate, 0.5, 2);
      u.volume = this.volume;
      u.onend = finishChunk;
      u.onerror = finishChunk;
      synth.speak(u);
      // Safety net: some engines never fire onend.
      this.later(estimateMs(spoken, u.rate) * 2 + 1500, finishChunk);
    } catch {
      this.later(estimateMs(spoken, pv.rate), finishChunk);
    }
  }

  private fireGlitch(dur: number): void {
    try {
      this.onGlitch(dur);
    } catch {
      /* ignore */
    }
  }

  private finish(gen: number): void {
    if (gen !== this.gen) return;
    this.isSpeaking = false;
    this.curPriority = 0;
    const p = this.pending;
    this.pending = null;
    if (p) this.start(p.text, p.opts);
  }
}
