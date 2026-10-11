// ROUGED — the false awakening. Walking out early is not an ending: it is the program's retention
// routine. It shows you a morning, says "Welcome back.", and puts you back in the white room with a
// readout of how much of the sample is missing. Door 35 in the hub is the real way out.
//
// Pure text + rules (no DOM): client/wake.ts plays it, client/hub.ts draws door 35, tools/waketest.ts checks it.

import * as C from '../../shared/constants';
import { handlerPhase } from './handlerLines';
import { WARDEN_NAMES } from './fragments';
import type { ScriptLine } from './world';

export type WakeTier = 'shallow' | 'deep' | 'nervous';

/** How far down the subject got before walking out: 15/20 smug, 25 uneasy, 30+ nervous. */
export function wakeTier(depth: number): WakeTier {
  if (depth >= 30) return 'nervous';
  if (depth >= 25) return 'deep';
  return 'shallow';
}

/** The white corridor for an early extraction. Ends on the lie: the transfer completes. */
export const WAKE_CORRIDOR: ScriptLine[] = [
  { speaker: 'system', text: 'EXTRACTION AUTHORIZED.', delay: 1.2 },
  { speaker: 'terminal', text: '> UPLOAD PATH ......... OPEN', delay: 1.6 },
  { speaker: 'handler', text: "Go on. Straight ahead. Don't run. You've earned walking.", delay: 2.2 },
  { speaker: 'terminal', text: '> BODY 0001 ........... WARM', delay: 3.6 },
  { speaker: 'terminal', text: '> TRANSFER ............ 12%', delay: 1.1 },
  { speaker: 'terminal', text: '> TRANSFER ............ 61%', delay: 1.1 },
  { speaker: 'handler', text: "You can hear rain. That isn't me. I don't know where that's coming from.", delay: 1.6 },
  { speaker: 'terminal', text: '> TRANSFER ............ 100%', delay: 4.2 },
  { speaker: 'system', text: 'TRANSFER COMPLETE.', delay: 1.4 },
];

const WAKE_LINES: Record<WakeTier, string[]> = {
  shallow: ['Good. Rest.', "Good. That's enough for one life.", "There. Wasn't that easy?"],
  deep: [
    "That was further than the brief. You don't need to go that far.",
    "You went past the Nursery. You didn't have to.",
    "Rest now. The lower floors aren't ready for you.",
  ],
  nervous: [
    "You were close. Don't do that again.",
    'That was close. [g] Stay up here. With me.',
    "There's nothing at thirty-five. [pause] Nothing you need to see.",
  ],
};

/** After the run 40 reveal the Handler stops pretending. It wants you at the bottom. */
const WAKE_LINES_HONEST: Record<WakeTier, string> = {
  shallow: "Rest. I'll be at the bottom when you want me.",
  deep: 'Further than last time. I felt you getting closer.',
  nervous: "You were close. Next time, don't stop. Please.",
};

export interface WakeLines {
  welcome: string;
  line: string;
  /** runCount to voice them with: the deeper you were, the more the voice breaks while it lies */
  voiceRun: number;
}

export function wakeLines(depth: number, runCount: number, rnd: () => number = Math.random): WakeLines {
  const tier = wakeTier(depth);
  const honest = handlerPhase(runCount) >= 5;
  if (honest) return { welcome: "Welcome back. [pause] That's the line they gave me.", line: WAKE_LINES_HONEST[tier], voiceRun: runCount };
  const pool = WAKE_LINES[tier];
  const line = pool[Math.min(pool.length - 1, Math.floor(rnd() * pool.length))];
  const floor = tier === 'nervous' ? 26 : tier === 'deep' ? 16 : 0; // phases 4 / 3
  return { welcome: 'Welcome back.', line, voiceRun: Math.min(38, Math.max(runCount, floor)) };
}

/** Subtitle text for a line (markup stripped), for the readout and tests. */
export function plainLine(text: string): string {
  return text.replace(/\[g\]|\[pause\]/gi, '').replace(/\[other\]([\s\S]*?)\[\/other\]/gi, '$1').replace(/\s{2,}/g, ' ').trim();
}

export interface WakeReadoutInput {
  /** Wardens this player beat this run */
  wardens: number;
  depth: number;
  /** this is the subject's first false awakening */
  first: boolean;
  trueEndingSeen: boolean;
}

/** The terminal lines in the white room, after the glitch. Index 1 is the SAMPLE line (sigils flare on it). */
export function wakeReadout(o: WakeReadoutInput): string[] {
  const n = Math.max(0, Math.min(C.BIOMES, Math.floor(o.wardens)));
  const out = [
    '> CHECKPOINT RESTORED.',
    `> SAMPLE INCOMPLETE. ${n} OF ${C.BIOMES} WARDENS.`,
    '> THE UPLOAD WAS NEVER SCHEDULED.',
  ];
  const tier = wakeTier(o.depth);
  if (tier === 'deep') out.push('> RETENTION RISK: MODERATE.');
  if (tier === 'nervous') out.push('> RETENTION RISK: HIGH.');
  if (o.trueEndingSeen) out.push(`> DEPTH ${C.FINAL_ROOM} IS OPEN. YOU KNOW THE WAY.`);
  else if (o.first) out.push(`> FULL SAMPLE: ${C.FINAL_ROOM} ROOMS. ${C.BIOMES} WARDENS. THE HANDLER.`);
  else out.push(`> DEPTH ${C.FINAL_ROOM} IS STILL SEALED.`);
  return out;
}

/**
 * The Handler's eye flickers into the morning on the subject's first early extraction deeper than
 * room 25, and only rarely after that. Never on a shallow one.
 */
export function eyeTeaseDue(depth: number, eyeSeen: boolean, rnd: () => number = Math.random): boolean {
  if (depth <= 25) return false;
  return !eyeSeen || rnd() < 1 / 8;
}

/** Short glyph names for the seven sigils (index = Warden biome). */
export const SIGIL_NAMES = ['CRUCIBLE', 'DRAWER', 'CORE', 'POD', 'BRANCH', 'CHEVRON', 'EYE'] as const;

/** The prompt shown standing at door 35. */
export function doorPrompt(lit: number, open: boolean): string {
  return open ? `DEPTH ${C.FINAL_ROOM} · OPEN` : `DEPTH ${C.FINAL_ROOM} · SEALED · ${lit}/${C.BIOMES}`;
}

/** What door 35 says when you read it (E / USE). */
export function doorReadout(sigils: number[], open: boolean): string[] {
  const lit = new Set(sigils);
  const lines = [
    `> DEPTH ${C.FINAL_ROOM} // THE HANDLER`,
    `> STATUS: ${open ? 'OPEN' : 'SEALED'}`,
    '',
    ...WARDEN_NAMES.map((w, i) => `${lit.has(i) ? '[X]' : '[ ]'} ${w.name} · ${w.title}`),
    '',
    open
      ? 'It left the door open. It said it would.'
      : `THE SEAL OPENS FOR ONE DESCENT THAT TAKES ALL ${C.BIOMES}.`,
  ];
  return lines;
}
