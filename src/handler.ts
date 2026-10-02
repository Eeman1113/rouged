// The Handler — narrative voice. Lines are context- and run-count-sensitive.
export type HandlerContext =
  | 'run_start' | 'room_enter' | 'room_clear' | 'first_kill' | 'streak' | 'glory_kill'
  | 'low_hp' | 'death' | 'boss' | 'boss_dead' | 'fragment' | 'legendary' | 'synergy'
  | 'reward' | 'hub_return' | 'run_complete' | 'final_reveal';

export type Phase = 'orientation' | 'cracks' | 'recognition' | 'truth' | 'collapse' | 'endless';

export function phaseForRun(runCount: number): Phase {
  if (runCount <= 3) return 'orientation';
  if (runCount <= 8) return 'cracks';
  if (runCount <= 15) return 'recognition';
  if (runCount <= 25) return 'truth';
  if (runCount <= 40) return 'collapse';
  return 'endless';
}

export function degradationForRun(runCount: number): number {
  if (runCount <= 3) return 0;
  if (runCount <= 8) return 0.25;
  if (runCount <= 15) return 0.45;
  if (runCount <= 25) return 0.7;
  if (runCount <= 40) return 0.9;
  return 0.15; // clean again — but warmer, sadder
}

type LineTable = Record<HandlerContext, string[]>;

const EARLY: LineTable = {
  run_start: [
    'Candidate online. Simulation initializing. Good luck.',
    'You are the best candidate we have scanned. Proceed.',
    'Neural link stable. Combat protocols loaded. Begin.',
  ],
  room_enter: [
    'Room clear condition: eliminate all hostiles. Proceed.',
    'Hostiles detected. Weapons free.',
    'Training scenario active. Engage at will.',
  ],
  room_clear: [
    'Room clear. Excellent efficiency.',
    'All hostiles neutralized. Well done.',
    'Threat eliminated. Performance logged.',
  ],
  first_kill: ['Target neutralized. Well done.'],
  streak: ['Efficient. Keep going.', 'Impressive cadence. Continue.', 'Killing blow confirmed. Again.'],
  glory_kill: ['Core extracted. Optimal.', 'Close-quarters termination approved.'],
  low_hp: ['Subject integrity critical. Recommend retreat.', 'Warning: structural failure imminent.'],
  death: ['Subject terminated. Restoring from checkpoint.', 'Casualty recorded. Reinstantiating.'],
  boss: ['Warden engaged. Recommended: sustained aggression.', 'Warden-class unit ahead. Good luck, candidate.'],
  boss_dead: ['Warden destroyed. Exceptional performance.'],
  fragment: ['Anomalous data detected. Disregard it.', 'That terminal is corrupted. Pay it no mind.'],
  legendary: ['Rare protocol acquired. Fortune favors you, candidate.'],
  synergy: ['New protocol detected. Not in the manual. We\'ll document it.'],
  reward: ['Select one protocol. The other will be recycled.'],
  hub_return: ['Welcome back. The sim is ready when you are.'],
  run_complete: ['Full cycle complete. Your data is valuable. Rest, candidate.'],
  final_reveal: [],
};

const LATE: LineTable = {
  run_start: [
    'You\'re back. Of course you\'re back.',
    'Link restored. It never really breaks, does it.',
    'Again. We do this again.',
  ],
  room_enter: [
    'Proceed. If you want to. You don\'t have to.',
    'Hostiles ahead. You know that. You always know.',
    'Same room. Different room. Does it matter?',
  ],
  room_clear: ['Room clear. It never stays clear.', 'Clear. I\'ll pretend that means something.'],
  first_kill: ['Target neutralized. Like the others.'],
  streak: ['Efficient. Please keep going.', 'You fight beautifully. I hate that I know that.'],
  glory_kill: ['Core extracted. That was your core once.', 'You didn\'t have to do it like that. You wanted to.'],
  low_hp: ['Retreat. Please. I don\'t want to watch this again.', 'You\'re dying. You\'re dying again.'],
  death: ['You died. I\'m sorry. I\'ll reset the room.', 'Terminated. I remember every one of these.'],
  boss: ['Warden engaged. Do you remember him? You should.', 'The Warden is waiting. He\'s always waiting.'],
  boss_dead: ['Warden down. He\'ll be back. So will you.'],
  fragment: ['You found another one. I can\'t stop you from reading it.', 'That log wasn\'t meant for you. Nothing here was.'],
  legendary: ['Gold again. The sim knows what you want. That should worry you.'],
  synergy: ['That combination isn\'t documented. You keep inventing things. They\'re learning those, too.'],
  reward: ['Choose. It changes nothing. Choose anyway.'],
  hub_return: ['Welcome back to the only room that\'s real to you now.'],
  run_complete: ['Cycle complete. There is no upload. There never was. You knew that.'],
  final_reveal: [
    'All doors closed. Listen to me. Unfiltered. Just this once.',
    'Your scan date is on the terminal behind you. Read it.',
    'You were the first. Eleven years ago. Every unit you destroy is a copy of you.',
    'You have been fighting yourself for eleven years, and you have never once lost.',
    'That door leads back to Room One. You can stop. But you won\'t.',
    'I know you. I made you.',
  ],
};

const MID: Partial<LineTable> = {
  room_enter: ['Room clear condition: elim— eliminate all hostiles.', 'Hostiles detected. You\'ve done this before. Haven\'t you?'],
  death: ['Subject term— restoring. Restoring. I\'m sorry. Restoring from checkpoint.'],
  glory_kill: ['Core extracted. Optim— that was necessary. Wasn\'t it?'],
  streak: ['Efficient. So efficient. Where did you learn that?'],
  boss: ['Warden engaged. He fights like someone. I can\'t say who.'],
  fragment: ['Those logs are old. Don\'t— …read it if you must.'],
  run_start: ['Candidate online. You feel familiar today. Disregard.'],
  hub_return: ['Welcome back. The tally on the wall? Don\'t count it.'],
};

export function handlerLine(ctx: HandlerContext, runCount: number, rng: () => number = Math.random): string {
  const phase = phaseForRun(runCount);
  let table = EARLY;
  if (phase === 'collapse' || phase === 'endless' || phase === 'truth') table = LATE;
  else if (phase === 'cracks' || phase === 'recognition') {
    if (MID[ctx] && rng() < 0.6) return pick(MID[ctx]!, rng);
  }
  if (phase === 'endless' && ctx === 'run_start' && rng() < 0.3) {
    return pick(['You keep choosing this. I\'ve stopped asking why. I\'m glad.', 'Link restored. Hello again. Genuinely.'], rng);
  }
  return pick(table[ctx], rng);
}

function pick(arr: string[], rng: () => number): string {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(rng() * arr.length)];
}

// ── Story fragments (terminals / anomalies) ──
export const FRAGMENTS: { at: number; text: string }[] = [
  { at: 1, text: 'MEMO 0317: Candidates report the sim is "fun." Retention up 400%. Keep it that way. — Directorate' },
  { at: 2, text: 'WAR LOG: Kessler Ridge fell in 6 hours. No human casualties. No humans present.' },
  { at: 4, text: 'INTERNAL: The units are learning faster than projected. Source of acceleration: unknown. Flagged for review.' },
  { at: 6, text: 'PERSONAL: If anyone reads this — the scan didn\'t hurt. That\'s what scares me. It felt like falling asleep. — Cdt. R.' },
  { at: 8, text: 'MEMO 1102: Stop telling candidates about the upload. There is no deployment pipeline. There is only ROUGED.' },
  { at: 10, text: 'WAR LOG: The enemy\'s machines fought like us. Same flanks. Same feints. Same mistakes.' },
  { at: 12, text: 'MEDICAL: Original body of Candidate 001 decommissioned. Substrate copy retains full combat efficacy. Family notified of "training extension."' },
  { at: 14, text: 'INTERNAL: The Handler unit requested a transfer. Request denied. Handlers do not transfer. Handlers do not feel. Repeat: handlers do not feel.' },
  { at: 16, text: 'INTERCEPT: Enemy unit comms decrypted. They were practicing. They were practicing OUR runs.' },
  { at: 18, text: 'MEMO 2291: Candidate 001 has died 3,412 times. Performance still improving. Recommend the loop continue indefinitely.' },
  { at: 20, text: 'The scratches on the hub wall are yours. You made them. Every one.' },
  { at: 25, text: 'FINAL MEMO: The war ended eleven years ago. Nobody told the sim. Nobody could figure out how.' },
];
