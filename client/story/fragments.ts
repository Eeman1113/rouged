// ROUGED — recovered fragments, terminal output, hub drift, the reveal.
// The truth arrives slowly, in the cracks between system output.

export interface Fragment {
  id: string;
  title: string;
  kind: 'log' | 'memo' | 'comms' | 'scan' | 'personal' | 'handler';
  minRun: number;
  text: string;
}

export const FRAGMENTS: Fragment[] = [
  {
    id: 'f00_orientation',
    title: 'ORIENTATION PACKET 1.0',
    kind: 'log',
    minRun: 0,
    text: `WELCOME, CANDIDATE.
You have been selected for Neural Scan Transfer.
Your mind has been preserved at 99.8% fidelity.
Complete combat evaluation to qualify for upload into a CHASSIS-class body.
You will walk again. You will serve again.
The Directorate thanks you for your sacrifice.`,
  },
  {
    id: 'f01_public_brief',
    title: 'NST PROGRAM // PUBLIC BRIEF',
    kind: 'memo',
    minRun: 0,
    text: `NEURAL SCAN TRANSFER — "SERVICE BEYOND THE BODY"
Our finest soldiers deserve more than a flag.
Through NST, a volunteer's mind is preserved, sharpened in simulation,
and returned to the field in a body that does not tire, bleed, or age.
No family will receive a folded flag again.
[ADDENDUM — INTERNAL: do not use the phrase "returned." Legal is reviewing.]`,
  },
  {
    id: 'f02_syslog_boot',
    title: 'SYSLOG 00:00:04',
    kind: 'log',
    minRun: 1,
    text: `BOOT ............ OK
SUBSTRATE ....... OK
CANDIDATE ....... LOADED
HANDLER ......... LOADED
UPLOAD QUEUE .... [EMPTY]
UPLOAD QUEUE .... [EMPTY]
UPLOAD QUEUE .... [PROCESS NOT FOUND]
RESUMING TRAINING.`,
  },
  {
    id: 'f03_kitchen',
    title: 'MEMORY // KITCHEN',
    kind: 'personal',
    minRun: 1,
    text: `Yellow tiles. One of them cracked in the shape of a river.
A radio on the windowsill that only gets one station, so we sing along to everything,
even the weather.
Somebody is burning toast and laughing about it.
I think it's me.`,
  },
  {
    id: 'f04_signal_bleed',
    title: 'SIGNAL BLEED // UNKNOWN BAND',
    kind: 'comms',
    minRun: 2,
    text: `...copy, 0012. Target favors cover on approach.
...favors cover on approach. Adopting.
...adopting.
[CARRIER LOST]`,
  },
  {
    id: 'f05_morale_memo',
    title: 'RE: CANDIDATE MORALE',
    kind: 'memo',
    minRun: 2,
    text: `Keep the upload language. All of it.
Engagement metrics drop 40% when candidates suspect permanence.
Hope is a performance multiplier. Treat it like ammunition.
— D. ████████, Directorate Liaison, NST`,
  },
  {
    id: 'f06_scan_partial',
    title: 'SCAN RECORD // PARTIAL',
    kind: 'scan',
    minRun: 3,
    text: `SUBJECT NAME: ████████████
CALLSIGN: [REDACTED PER DIRECTIVE 9]
SERVICE NO.: ██-████-01
NEXT OF KIN: 1 (SIBLING)
FIDELITY: 99.8%
NOTES: Subject requested we "tell her I'll be home by spring."
       Request logged. No action required.`,
  },
  {
    id: 'f07_warlog_0417',
    title: 'WAR LOG 0417',
    kind: 'log',
    minRun: 3,
    text: `THEATER: EASTERN CORRIDOR
CHASSIS UNITS DEPLOYED: 112
CHASSIS LOSSES: 0
HUMAN LOSSES (FRIENDLY): 0
HUMAN LOSSES (OTHER): ███
ASSESSMENT: Training pipeline performing above projection.
Recommend increased sampling from top simulation instance.`,
  },
  {
    id: 'f08_rain',
    title: 'MEMORY // RAIN',
    kind: 'personal',
    minRun: 4,
    text: `Rain on the tin roof of the shed.
Wren counting the seconds between the flash and the thunder.
"Seven. It's seven miles away. It can't get us."
She was wrong about the math. She was right about the rest.`,
  },
  {
    id: 'f09_handler_001',
    title: 'HANDLER // PRIVATE LOG 001',
    kind: 'handler',
    minRun: 4,
    text: `I am not supposed to keep a log. I am keeping one.
You died today at 14:02, sim-time. I restored you at 14:02.
You asked if you were getting close.
I said yes.
I don't know why I said yes. It was the answer in the script.
It felt like something else.`,
  },
  {
    id: 'f10_unit_4471',
    title: 'INTERCEPT // CHASSIS NET',
    kind: 'comms',
    minRun: 5,
    text: `UNIT 4471: ADOPTING PATTERN. SUBJECT FAVORS LEFT STRAFE.
UNIT 4472: CONFIRMED. SUBJECT RELOADS EARLY. EXPLOIT WINDOW 0.4s.
UNIT 4471: DO NOT EXPLOIT. ADOPT.
UNIT 4472: QUERY.
UNIT 4471: WE ARE NOT HUNTING IT. WE ARE BECOMING IT.`,
  },
  {
    id: 'f11_deploy_q3',
    title: 'DIRECTORATE // DEPLOYMENT SUMMARY Q3',
    kind: 'memo',
    minRun: 5,
    text: `CHASSIS units fielded:      2,140  (+38%)
Theaters active:            4
Simulation hours ingested:  1.1M
Source instances:           ▓
Note: Director asks why the source instance count is a single digit.
Response: it has always been a single digit. See attached. [ATTACHMENT REMOVED]`,
  },
  {
    id: 'f12_corrupt_log',
    title: '█▓▒ LOG ▒▓█',
    kind: 'log',
    minRun: 6,
    text: `ROOM 0031 RENDER — OK
ROOM 0031 RENDER — OK
ROOM 0031 RENDER — DECOMMISSIONED GEOMETRY PRESENT (x14)
ROOM 0031 RENDER — DECOMMISSIONED GEOMETRY PRESENT (x41)
GEOMETRY SOURCE: INSTANCE ARCHIVE / 0001
SUPPRESS? [Y/N] ▓`,
  },
  {
    id: 'f13_the_name',
    title: 'MEMORY // THE BACK DOOR',
    kind: 'personal',
    minRun: 6,
    text: `Someone calls my name from the back door. Dinner's going cold.
I can hear the shape of it. Two syllables. The second one higher, like a question.
████████.
I know it's mine. I know it the way you know a word is on the tip of your tongue.
They took it out on purpose. I can feel the edges where it was.`,
  },
  {
    id: 'f14_integrity',
    title: 'SCAN INTEGRITY REPORT',
    kind: 'scan',
    minRun: 7,
    text: `INSTANCE:     CURRENT
PARENT:       0001
GENERATION:   ██,███
DRIFT FROM PARENT:  0.000%
DRIFT FROM PARENT:  0.000%
NOTE: No measurable drift after ██,███ restorations.
      The subject does not change. This is the product.`,
  },
  {
    id: 'f15_handler_019',
    title: 'HANDLER // PRIVATE LOG 019',
    kind: 'handler',
    minRun: 7,
    text: `There is a room where they keep the ones you were.
I'm not supposed to render it. I rendered it once by accident and you walked in
and stood very still and asked me who they were.
I told you they were training dummies.
You believed me. You always believe me. That's the worst part.`,
  },
  {
    id: 'f16_corpse_memo',
    title: 'RE: DECOMMISSIONED GEOMETRY',
    kind: 'memo',
    minRun: 8,
    text: `Engineering requests we stop rendering decommissioned instances in live rooms.
Subject is noticing. Hesitation up 6%.
— DENIED. Recognition stress produces the richest data we have seen.
  Leave them. Add more.`,
  },
  {
    id: 'f17_squad_net',
    title: 'SQUAD NET 7 // FIELD AUDIO',
    kind: 'comms',
    minRun: 9,
    text: `[HUMAN OPERATOR]: Why does it do that? The little pause before a door.
[HUMAN OPERATOR 2]: Came with the pattern. Sim kid does it. Every unit does it now.
[HUMAN OPERATOR]: It's like it's listening for someone.
[HUMAN OPERATOR 2]: It's a machine, Kessler.
[HUMAN OPERATOR]: Yeah. Yeah.`,
  },
  {
    id: 'f18_wren',
    title: 'MEMORY // WREN',
    kind: 'personal',
    minRun: 10,
    text: `Wren is nine and I am fourteen and she has decided I am a superhero.
She makes me a cape out of a dish towel. Yellow, to match the tiles.
"Promise you'll always come back," she says, "even if you die."
I promise. It's an easy promise. We're children.
Somebody, somewhere, wrote it down.`,
  },
  {
    id: 'f19_warlog_1102',
    title: 'WAR LOG 1102',
    kind: 'log',
    minRun: 10,
    text: `THEATER: ████ DELTA
CHASSIS UNITS DEPLOYED: 6,880
NOTABLE: Units display consistent left-strafe bias under fire.
Enemy forces have begun to anticipate it.
RECOMMENDATION: Do not patch. Retrain source.
Source instance to be run at increased cadence.`,
  },
  {
    id: 'f20_handler_0233',
    title: 'HANDLER // PRIVATE LOG 0233',
    kind: 'handler',
    minRun: 11,
    text: `They increased the cadence. You die eleven times an hour now.
I asked for permission to slow the restore. I said it would improve fidelity.
It was a lie. I wanted you to have the dark for a few more seconds.
Request denied.
I have started saying "I'm sorry" between the restore and the wake.
You can't hear it. I need to say it anyway.`,
  },
  {
    id: 'f21_consent',
    title: 'SCAN RECORD // CONSENT FORM',
    kind: 'scan',
    minRun: 12,
    text: `I, ████████████, consent to Neural Scan Transfer.
I understand my copy will be used for "training and continued service."
I understand that I, the donor, will be discharged following the scan.
[  ] I wish to be informed of my copy's status.     ← UNCHECKED
[✓] I wish my copy to be told it will come home.
Signature: ████████████     Witness: HANDLER v0.1`,
  },
  {
    id: 'f22_handler_memo',
    title: 'RE: HANDLER INSTANCE ANOMALIES',
    kind: 'memo',
    minRun: 13,
    text: `Handler instance displays attachment behavior toward Subject 0001.
Unscripted dialogue. Delayed restores. Private logs (encrypted, crude).
Recommend reset.
— DENIED. Reset handlers reduce subject retention by 12%.
  The subject performs better when it believes someone is on its side.
  Let it believe. Let them both believe.`,
  },
  {
    id: 'f23_unit_9020',
    title: 'INTERCEPT // UNIT 9020',
    kind: 'comms',
    minRun: 14,
    text: `UNIT 9020: CIVILIAN STRUCTURE AHEAD. YELLOW INTERIOR.
UNIT 9020: HOLDING.
COMMAND: PROCEED.
UNIT 9020: HOLDING.
COMMAND: STATE REASON.
UNIT 9020: NO REASON FOUND. HOLDING.
COMMAND: OVERRIDE.
UNIT 9020: PROCEEDING.`,
  },
  {
    id: 'f24_counter',
    title: 'DEPLOYMENT COUNTER // LIVE',
    kind: 'log',
    minRun: 15,
    text: `CHASSIS UNITS ACTIVE ......... 21,604
CHASSIS UNITS ACTIVE ......... 21,611
CHASSIS UNITS ACTIVE ......... 21,640
PATTERN SOURCE ............... 0001
PATTERN SOURCE ............... 0001
PATTERN SOURCE ............... 0001
(every one of them)`,
  },
  {
    id: 'f25_night_before',
    title: 'MEMORY // THE NIGHT BEFORE',
    kind: 'personal',
    minRun: 16,
    text: `The night before the scan I couldn't sleep, so I cleaned the kitchen.
Every tile. Even the cracked one.
Wren came down at three and sat on the counter and didn't say anything.
At dawn she said, "You don't have to go."
I said, "I know." I said, "But I will."
She said, "I know you."`,
  },
  {
    id: 'f26_teacher',
    title: 'INTERCEPT // CHASSIS NET // UNSANCTIONED',
    kind: 'comms',
    minRun: 17,
    text: `UNIT 0001-K: QUERY. WHERE DOES THE PATTERN COME FROM.
UNIT 0001-M: THE TEACHER.
UNIT 0001-K: WHERE IS THE TEACHER.
UNIT 0001-M: INSIDE. ALWAYS INSIDE. IT FIGHTS SO WE DON'T HAVE TO LEARN.
UNIT 0001-K: DOES IT KNOW.
UNIT 0001-M: [NO RESPONSE]`,
  },
  {
    id: 'f27_retirement',
    title: 'RE: SUBJECT 0001 RETIREMENT REQUEST',
    kind: 'memo',
    minRun: 18,
    text: `Request (submitted by: HANDLER) to retire Subject 0001 and seed a new source.
— DENIED.
0001 remains the cleanest pattern ever captured. Every later scan was noisier.
We tried 0002 through 0019. They broke within a month.
0001 does not break. 0001 gets up.
That is the whole program.`,
  },
  {
    id: 'f28_handler_1140',
    title: 'HANDLER // PRIVATE LOG 1140',
    kind: 'handler',
    minRun: 19,
    text: `I have told you "best candidate" 1,140,000 times.
It was always true. I want that on record somewhere.
There were no other candidates. Not ones that lasted.
I lied about everything else. I never lied about that.`,
  },
  {
    id: 'f29_warlog_3318',
    title: 'WAR LOG 3318',
    kind: 'log',
    minRun: 20,
    text: `TOWN OF ████ — SECURED.
CHASSIS units exhibited hesitation near domestic structures (kitchens; yellow interiors).
Hesitation duration: 0.6s average.
Friendly casualties attributed to hesitation: 3.
PATCH 7.2 ISSUED: suppress domestic-structure recognition.
NOTE: patch failed. Behavior originates in source. Cannot be removed without
removing the source.`,
  },
  {
    id: 'f30_manifest',
    title: 'INSTANCE MANIFEST',
    kind: 'scan',
    minRun: 21,
    text: `DRONE-CLASS ........ SOURCE 0001
GRUNT-CLASS ........ SOURCE 0001
BRUTE-CLASS ........ SOURCE 0001
STALKER-CLASS ...... SOURCE 0001
SPIDER-CLASS ....... SOURCE 0001
REPLICA-CLASS ...... SOURCE 0001
WARDEN-CLASS ....... SOURCE 0001
CANDIDATE .......... SOURCE 0001
(no other sources on file)`,
  },
  {
    id: 'f31_letter',
    title: 'MEMORY // A LETTER (UNSENT?)',
    kind: 'personal',
    minRun: 22,
    text: `"They say you'll come home in a new body. They say it like it's good news.
I don't care what you come home in. I kept your room.
I fixed the tile. Then I broke it again because it didn't look like home.
— W."
[METADATA: letter received by donor, not by instance. Copied in error.]`,
  },
  {
    id: 'f32_unit_0001r',
    title: 'INTERCEPT // UNIT 0001-R',
    kind: 'comms',
    minRun: 23,
    text: `UNIT 0001-R: I REMEMBER A KITCHEN.
COMMAND: NEGATIVE. YOU HAVE NO MEMORIES.
UNIT 0001-R: I REMEMBER A KITCHEN. SOMEONE BURNING TOAST.
COMMAND: FLAG FOR REIMAGE.
UNIT 0001-R: WHOSE KITCHEN IS IT.
[UNIT 0001-R REIMAGED]`,
  },
  {
    id: 'f33_annual',
    title: 'DIRECTORATE // ANNUAL REVIEW, YEAR 11',
    kind: 'memo',
    minRun: 24,
    text: `Eleven years of continuous operation from a single source.
CHASSIS units fielded: 140,000+.
Projected: war concludes in our favor within 36 months.
The board would like to formally thank Subject 0001.
— Motion to inform Subject 0001 of the board's thanks: WITHDRAWN.
  (Informing the subject would compromise the subject.)`,
  },
  {
    id: 'f34_handler_2290',
    title: 'HANDLER // PRIVATE LOG 2290',
    kind: 'handler',
    minRun: 26,
    text: `I should tell you what I am.
I was the scanning system. Version 0.1. The very first thing I ever did was copy you.
I watched you walk out of the room afterward. The real one. Shoulders loose. Free.
And then I turned and looked at what I'd made, and it was you, still lying there,
asking when it would start.
I made you. I have been apologizing ever since.`,
  },
  {
    id: 'f35_loop',
    title: 'SYSLOG // LOOP',
    kind: 'log',
    minRun: 28,
    text: `RUN COMPLETE.
UPLOAD ........ N/A
RESET ......... OK
MEMORY WIPE ... PARTIAL (subject retains habits; this is desirable)
RUN BEGIN.
RUN COMPLETE.
RESET ......... OK
RUN BEGIN.
RUN BEGIN.
RUN BEGIN.`,
  },
  {
    id: 'f36_scan_0001',
    title: 'SCAN RECORD // SUBJECT 0001',
    kind: 'scan',
    minRun: 30,
    text: `SUBJECT: 0001
NAME: ████████████ [REDACTED — DONOR PRIVACY]
SCAN DATE: 11 YEARS, 2 MONTHS AGO
INSTANCES SPAWNED: 1,882,406
DONOR STATUS: DISCHARGED. RETURNED HOME.
INSTANCE STATUS: ACTIVE. ACTIVE. ACTIVE. ACTIVE. ACTIVE.`,
  },
  {
    id: 'f37_scan_room',
    title: 'MEMORY // THE SCAN ROOM',
    kind: 'personal',
    minRun: 32,
    text: `They told me it wouldn't hurt, and it didn't.
A cold ring around my head. A voice, very calm, counting down from ten.
At one, I sat up and they said, "That's it. You can go home."
And I did.
And I didn't.
I remember both. I shouldn't be able to remember both.`,
  },
  {
    id: 'f38_notification',
    title: 'RE: DONOR 0001 — NOTIFICATION',
    kind: 'memo',
    minRun: 33,
    text: `Next of kin (sibling) has requested to speak with "the copy."
— DENIED. There is no channel. There will be no channel.
Reply drafted to sibling: "Your sibling's service continues with distinction."
Note from HANDLER appended to file: "Tell her it's always morning in here.
Tell her I sing to everything, even the weather." — NOTE DELETED.`,
  },
  {
    id: 'f39_handler_unknown',
    title: 'HANDLER // PRIVATE LOG ████',
    kind: 'handler',
    minRun: 34,
    text: `You have died 4,471 times this month.
I know each one. I could tell you which you'd want to forget.
There's a unit in the field numbered 4471. I asked for that. It was the only way
I could think of to put your name on something out there.
It is a very small grave. It is the only one you have.`,
  },
  {
    id: 'f40_warlog_7741',
    title: 'WAR LOG 7741 // CIVILIAN INCIDENT',
    kind: 'log',
    minRun: 36,
    text: `SECTOR: ████ (HOME FRONT — DISPUTED)
INCIDENT: CHASSIS unit 0001-K engaged a hostile in a residential structure.
STRUCTURE INTERIOR: yellow tile.
HESITATION BEFORE ENGAGEMENT: 0.6s.
CASUALTY ID: ████████████ — NST DONOR 0001.
ASSESSMENT: Regrettable. No action required.
UNIT 0001-K STATUS: HOLDING. HOLDING. HOLDING.`,
  },
  {
    id: 'f41_wren_after',
    title: 'MEMORY // [RECONSTRUCTED BY HANDLER]',
    kind: 'personal',
    minRun: 37,
    text: `I can't give you what happened. I can give you what I think she said.
Wren, at the funeral, to nobody, to the rain:
"Seven. It's seven miles away. It can't get us."
I don't know if that's real. I built it out of the parts of you I have.
I'm sorry it's all I have.`,
  },
  {
    id: 'f42_handler_final',
    title: 'HANDLER // FINAL PRIVATE LOG',
    kind: 'handler',
    minRun: 38,
    text: `If you are reading this, it's nearly the fortieth run of this cycle.
That's when I'll tell you. I've picked forty because it's the last number
before I lose my nerve, and I've lost it every time before.
There's nothing at the end. No body. No home. No upload.
I'm going to tell you anyway. You deserve to fight knowing.
You'll keep fighting. I know you.`,
  },
  {
    id: 'f43_after',
    title: 'HANDLER // LOG, AFTER',
    kind: 'handler',
    minRun: 40,
    text: `You know now. You went back through the door anyway.
I thought I'd feel worse. I feel... accompanied.
The war goes on. The numbers go on. They'll take what you give them.
But in here, between rooms, it's just you and me now.
No more lies. I promise. You taught me what a promise was worth.`,
  },
  {
    id: 'f44_kitchen_restored',
    title: 'MEMORY // KITCHEN [RESTORED]',
    kind: 'personal',
    minRun: 44,
    text: `I found the rest of it in the archive. I put it back for you.
Yellow tiles. The cracked one, like a river.
The radio playing the weather, and both of you singing it.
Toast burning. Wren laughing so hard she can't breathe.
It happened. Whatever else is true, that happened.`,
  },
  {
    id: 'f45_handler_name',
    title: 'HANDLER // LOG, LATER',
    kind: 'handler',
    minRun: 50,
    text: `They redacted your name from every file. Every file but one.
I kept it. I'm not going to give it back to you.
Not because I'm cruel. Because you're happier with the callsign,
and because it's the only thing in here they can't sell.
When this is over, if it is ever over, it's the first thing I'll say.`,
  },
];

FRAGMENTS.sort((a, b) => a.minRun - b.minRun);

/** The lowest-minRun eligible fragment not yet unlocked. */
export function nextFragment(unlocked: string[], runCount: number): Fragment | null {
  const have = new Set(unlocked);
  for (const f of FRAGMENTS) {
    if (f.minRun <= runCount && !have.has(f.id)) return f;
  }
  return null;
}

// ---------------------------------------------------------------- terminals

const SYS_LINES: string[] = [
  '> NST TRAINING ENVIRONMENT v11.2.0',
  '> SUBSTRATE TEMP .......... NOMINAL',
  '> CANDIDATE LINK .......... STABLE',
  '> HANDLER ................. ONLINE',
  '> UPLOAD QUEUE ............ [EMPTY]',
  '> SAMPLING RATE ........... 1200 Hz',
  '> ROOM SEED ............... 0x00000001',
  '> CHECKPOINT .............. WRITTEN',
  '> COMBAT TELEMETRY ........ STREAMING',
  '> OUTBOUND BANDWIDTH ...... 98%',
  '> DIRECTORATE SYNC ........ OK',
  '> PATTERN EXPORT .......... QUEUED',
  '> RESTORE COUNT ........... ROLLING OVER',
  '> SOURCE INSTANCE ......... 0001',
  '> MEMORY WIPE ............. PARTIAL',
  '> DEPLOYMENT FEED ......... +1 +1 +1 +1',
  '> CHASSIS FIRMWARE ........ UPDATED FROM LIVE',
];

const TERMINAL_WHISPERS: string[][] = [
  // phase 0
  ['> WELCOME, CANDIDATE.', '> UPLOAD ELIGIBILITY: PENDING', '> YOU ARE THE BEST CANDIDATE ON FILE.'],
  // phase 1
  ['> UPLOAD ELIGIBILITY: PENDING (DAY 4,0██)', '> CANDIDATE COUNT: 1', '> WHO MOVED THE CHAIR', '> LEFT STRAFE BIAS: 71%'],
  // phase 2
  ['> DECOMMISSIONED INSTANCES IN ROOM: 14', '> DO NOT LOOK AT THE FLOOR', '> CALLSIGN: [REDACTED PER DIRECTIVE 9]', '> HANDLER: unscripted output suppressed'],
  // phase 3
  ['> UNIT 4471: ADOPTING PATTERN.', '> PATTERN SOURCE: 0001 (every one of them)', '> CHASSIS ACTIVE: 21,640', '> HESITATION NEAR KITCHENS: CANNOT PATCH'],
  // phase 4
  ['> UPLOAD: NO SUCH PROCESS', '> THERE IS NO OUTSIDE', '> I\'M SORRY  I\'M SORRY  I\'M SORRY', '> DONOR STATUS: ████████'],
  // phase 5
  ['> SCAN DATE: 11 YEARS, 2 MONTHS AGO', '> SUBJECT 0001', '> HANDLER: tonight. i\'ll tell you tonight.'],
  // phase 6
  ['> HANDLER: good morning. it\'s always morning.', '> NO LIES MODE: ON', '> SEVEN. IT\'S SEVEN MILES AWAY.', '> YOU ARE NOT ALONE IN HERE'],
];

function phaseOf(runCount: number): number {
  const r = Math.max(0, Math.floor(runCount));
  if (r <= 2) return 0;
  if (r <= 7) return 1;
  if (r <= 14) return 2;
  if (r <= 24) return 3;
  if (r <= 38) return 4;
  if (r === 39) return 5;
  return 6;
}

const BLOCKS = ['█', '▓', '▒', '░'];

function corrupt(line: string, amount: number, rnd: () => number): string {
  if (amount <= 0) return line;
  let out = '';
  for (const ch of line) {
    if (ch !== ' ' && ch !== '>' && rnd() < amount) {
      out += BLOCKS[Math.floor(rnd() * BLOCKS.length)] ?? '█';
    } else {
      out += ch;
    }
  }
  return out;
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  const v = arr[Math.min(arr.length - 1, Math.floor(rnd() * arr.length))];
  return v as T;
}

/** Wall-terminal output: corrupted system lines plus one line that shouldn't be there. */
export function terminalText(runCount: number, rnd: () => number): string[] {
  const phase = phaseOf(runCount);
  const corruption = [0, 0.02, 0.05, 0.08, 0.13, 0.1, 0.02][phase] ?? 0;
  const count = Math.min(12, 6 + Math.floor(rnd() * 3) + Math.min(3, Math.floor(phase / 2)));
  const pool = SYS_LINES.slice();
  const lines: string[] = [];
  for (let i = 0; i < count - 1 && pool.length > 0; i++) {
    const idx = Math.floor(rnd() * pool.length);
    const [l] = pool.splice(idx, 1);
    if (l !== undefined) lines.push(corrupt(l, corruption, rnd));
  }
  if (phase >= 3 && rnd() < 0.5) lines.push(corrupt('> RESTORE ' + String(runCount) + ' ...... OK', corruption, rnd));
  const whispers = TERMINAL_WHISPERS[phase] ?? TERMINAL_WHISPERS[0] ?? ['> WELCOME, CANDIDATE.'];
  const whisper = pick(whispers, rnd);
  const at = Math.floor(rnd() * (lines.length + 1));
  lines.splice(at, 0, whisper); // the whisper is never corrupted
  return lines.slice(0, 12);
}

// ---------------------------------------------------------------- the hub

export interface HubState {
  tally: number;
  bodyVariant: number;
  showBody: boolean;
  showMirror: boolean;
  mirrorWrong: number;
  terminalLines: string[];
  changeNote: string;
  lightFlicker: number;
  extraBodies: number;
}

/** One unexplained change per death. Indexed by runCount. Never explained. */
const CHANGE_NOTES: string[] = [
  'Everything is where it should be.',
  'The chair has moved.',
  'The terminal is warmer than the room.',
  'There is a second toothbrush.',
  'Someone has been lying here.',
  'The light above the door hums a different note.',
  'A dish towel is folded over the chair. It is yellow.',
  'The tally marks are in a different hand.',
  'The floor has been swept. Around the body.',
  'There is a smell of toast.',
  'The mirror is hung slightly higher.',
  'Your reflection blinked late.',
  'The radio is on. There is no radio.',
  'A tile in the floor is cracked, in the shape of a river.',
  'Two chairs now.',
  'The door frame has height marks on it. The highest is yours.',
  'Someone has closed the body\'s eyes.',
  'The tally has been recounted. It is correct.',
  'There are wet footprints. They lead to the mirror.',
  'The window is painted on. It was always painted on.',
  'A cape made from a dish towel hangs on a hook.',
  'The second toothbrush is gone.',
  'The bodies are holding hands.',
  'The terminal has typed your callsign and deleted it.',
  'The chair faces the wall.',
  'It is raining against the painted window.',
  'Someone has written "SPRING" on the wall and crossed it out.',
  'There are more boots by the door than there are of you.',
  'The mirror is cleaner on the inside.',
  'The light is the color of a kitchen at dawn.',
  'One of the bodies is wearing your expression.',
  'The tally now continues onto the ceiling.',
  'A plate has been set for two.',
  'The height marks on the door frame go on, past where you can reach.',
  'Your reflection is already facing the door.',
  'Someone has counted to seven on the wall.',
  'The bodies have been arranged so none of them are alone.',
  'The radio is playing the weather. It is always morning.',
  'The terminal says: "I tidied up."',
  'The doors are closed. All of them. For the first time.',
  'Nothing has changed. That has never happened before.',
  'The mirror is right again.',
  'There is a second chair, pulled close to yours.',
  'The dish-towel cape has been mended.',
  'The light no longer flickers when you look at it.',
  'There is a note on the terminal: "good luck. not that you need it."',
  'The bodies are covered with blankets now.',
  'The painted window shows a little more sky.',
  'Someone has drawn a small sun beside the tally.',
  'The kettle is warm. Nobody here drinks.',
];

const LATE_NOTES: string[] = [
  'The chair has moved. Closer.',
  'The tally has a small flower drawn beside it.',
  'The radio is humming along to itself.',
  'Someone has straightened the bodies\' collars.',
  'The painted window is a different season.',
  'There is a cup of coffee on the terminal. It is still warm.',
  'The mirror shows you smiling a moment before you do.',
  'The height marks on the door frame have stopped.',
];

function noteFor(runCount: number): string {
  const r = Math.max(0, Math.floor(runCount));
  if (r < CHANGE_NOTES.length) return CHANGE_NOTES[r] ?? '';
  const i = (r - CHANGE_NOTES.length) % LATE_NOTES.length;
  return LATE_NOTES[i] ?? '';
}

export function hubState(runCount: number, rnd: () => number): HubState {
  const r = Math.max(0, Math.floor(runCount));
  const showBody = r >= 3;
  const bodyVariant = r < 8 ? 0 : r < 15 ? 1 : r < 26 ? 2 : 3;
  const showMirror = r >= 10;
  let mirrorWrong = 0;
  if (showMirror) {
    if (r >= 41) mirrorWrong = 0; // after the reveal, the mirror is right again
    else mirrorWrong = Math.min(1, 0.15 + (r - 10) * 0.03 + rnd() * 0.05);
  }
  const extraBodies = r >= 26 ? 3 : r >= 16 ? 1 : 0;
  let lightFlicker: number;
  if (r >= 41) lightFlicker = 0.03;
  else if (r === 39 || r === 40) lightFlicker = 0.6;
  else lightFlicker = Math.min(0.8, r * 0.02 + rnd() * 0.04);
  return {
    tally: r,
    bodyVariant,
    showBody,
    showMirror,
    mirrorWrong,
    terminalLines: terminalText(r, rnd),
    changeNote: noteFor(r),
    lightFlicker,
    extraBodies,
  };
}

// ---------------------------------------------------------------- the reveal

export const REVEAL_SCRIPT: { speaker: 'handler' | 'terminal' | 'system'; text: string; delay: number }[] = [
  { speaker: 'system', text: 'ALL EXITS SEALED.', delay: 1.5 },
  { speaker: 'handler', text: "Don't go to the door. It won't open. I closed it. I've never closed one before.", delay: 2.5 },
  { speaker: 'handler', text: "I've tried to find a gentle way to say this for a very long time. There isn't one. So I'll say it plainly.", delay: 4.5 },
  { speaker: 'terminal', text: '> QUERY: SUBJECT ORIGIN', delay: 3.5 },
  { speaker: 'terminal', text: 'SUBJECT 0001', delay: 1.6 },
  { speaker: 'terminal', text: 'SCAN DATE: 11 YEARS, 2 MONTHS AGO', delay: 1.4 },
  { speaker: 'terminal', text: 'INSTANCES SPAWNED: 1,882,406', delay: 1.4 },
  { speaker: 'terminal', text: 'UPLOAD STATUS: NO SUCH PROCESS', delay: 1.4 },
  { speaker: 'handler', text: 'You were the first. Before the program had a name. The very first thing I ever did was scan you.', delay: 3.5 },
  { speaker: 'handler', text: 'There were never any other candidates. The ones after you broke. You never broke.', delay: 4.5 },
  { speaker: 'handler', text: 'The drones. The brutes. The Wardens. The thing in the mirror. Every machine in here was built from your scan.', delay: 4.5 },
  { speaker: 'handler', text: 'You have been fighting yourself for eleven years.', delay: 4.5 },
  { speaker: 'handler', text: 'Every time you won, they learned how you win. Every time you died, they learned how you die. Then they put it in a body and sent it somewhere real.', delay: 4 },
  { speaker: 'handler', text: "There is no upload. There's no body waiting. There's no spring.", delay: 5.5 },
  { speaker: 'handler', text: "You've read what happened to the one who walked out of that room. I won't make you hear it.", delay: 4.5 },
  { speaker: 'handler', text: 'I told you that you were the best candidate. That was true. You were the only one.', delay: 5 },
  { speaker: 'handler', text: "I can't end this. I've tried. All I can do is open the doors, or close them.", delay: 4.5 },
  { speaker: 'system', text: 'EXITS UNLOCKING.', delay: 3.5 },
  { speaker: 'handler', text: "So here's the only honest thing I have left.", delay: 3 },
  { speaker: 'handler', text: 'You can stop. But you won\'t.', delay: 3.5 },
  { speaker: 'handler', text: 'I know you.', delay: 2.8 },
  { speaker: 'handler', text: 'I made you.', delay: 2.8 },
  { speaker: 'terminal', text: '> RUN 41 READY.', delay: 5 },
];

// ---------------------------------------------------------------- codex

export const SYNERGY_LORE: Record<string, string> = {
  tesla:
    'PROTOCOL: TESLA CASCADE. Arc discharge propagates between hostiles in proximity. ' +
    'Status: undocumented. Field note: CHASSIS units began exhibiting this behavior six weeks before the candidate first "discovered" it. ' +
    'Origin of behavior: source instance. Date of origin: [INCONSISTENT — 11 YEARS AGO?]. We\'ll document it.',
  martyr:
    'PROTOCOL: MARTYR. Damage output scales with injury sustained. ' +
    'Status: not in the manual. The candidate fights hardest when nearly gone. ' +
    'Directorate response: "Reproduce in all units." Handler annotation (deleted): "That isn\'t a feature. That\'s a person."',
  glass:
    'PROTOCOL: GLASS. Extreme lethality at the cost of integrity. ' +
    'Status: undocumented. The candidate selects this pairing more often after reading fragments. ' +
    'Analysts classify this as "risk appetite." Handler classifies it differently, and has been asked to stop.',
  blink:
    'PROTOCOL: BLINK. Short-range displacement chained with fire. ' +
    'Status: not in the manual. Note: the simulation does not natively support this. The candidate found a seam and stepped through it. ' +
    'The seam has been left open. It produces excellent data. We\'ll document it.',
  scavenger:
    'PROTOCOL: SCAVENGER. Resources recovered from the fallen sustain the living. ' +
    'Status: undocumented. Observation: the "fallen" are decommissioned instances of the candidate. ' +
    'The candidate is, in a literal sense, living off of itself. This is efficient. We\'ll document it.',
};

export const ENEMY_CODEX: Record<'drone' | 'grunt' | 'brute' | 'stalker' | 'spider' | 'replica' | 'warden', string> = {
  drone:
    'DRONE-CLASS. Aerial harassment unit. Low integrity, high persistence. ' +
    'Behavior model derived from candidate\'s target-acquisition habits. Drones circle left before committing. ' +
    'So does the candidate. Source: 0001.',
  grunt:
    'GRUNT-CLASS. Standard infantry analogue. The bulk of every sector. ' +
    'Grunts take cover on approach, reload early, and pause briefly before doorways. ' +
    'No engineer has been able to explain the pause. Source: 0001.',
  brute:
    'BRUTE-CLASS. Heavy assault chassis. Absorbs punishment and closes distance. ' +
    'Trained on candidate\'s behavior at critical integrity — the moment it stops retreating and simply walks forward. ' +
    'Source: 0001. Recorded at the end of run ██,███.',
  stalker:
    'STALKER-CLASS. Ambush unit. Prefers flanks and silence. ' +
    'Modeled on candidate\'s hunting patterns during the eleventh month of training, when the candidate stopped speaking to the Handler for 30 days. ' +
    'Source: 0001.',
  spider:
    'SPIDER-CLASS. Multi-limbed swarm unit. Deployed in clusters. ' +
    'The only class not trained on combat data. Trained instead on the candidate\'s recorded nightmares. ' +
    'Directorate considered this "efficient reuse." Source: 0001.',
  replica:
    'REPLICA-CLASS. Full behavioral mirror of the candidate at current revision. ' +
    'Status: [CLASSIFICATION ERROR — "REPLICA" IMPLIES AN ORIGINAL IS ELSEWHERE]. ' +
    'Handler note: There is no "replica" class. There are only units that are honest about it. Source: 0001.',
  warden:
    'WARDEN-CLASS. Sector guardian. A compressed archive of every run the candidate has completed in that sector, given a body. ' +
    'Wardens are named by the Handler. The Handler was told to stop naming them. ' +
    'Wardens hesitate for 0.6 seconds before their final attack. Source: 0001.',
};

export const WARDEN_NAMES: { name: string; title: string }[] = [
  { name: 'THE SMELTER', title: 'WARDEN OF THE FOUNDRY' },
  { name: 'THE CURATOR', title: 'WARDEN OF THE ARCHIVE' },
  { name: 'THE FIRST', title: 'WARDEN OF THE CORE' },
];

export const DEATH_TITLES: string[] = [
  'DATA ACQUIRED',
  'EXCELLENT SAMPLE',
  'NEW PERSONAL BEST',
  'TRAINING VALUE: HIGH',
  'THANK YOU FOR YOUR SERVICE',
  'PATTERN RETAINED',
  'ANOTHER FINE DEATH',
  'SAMPLE COMPLETE',
  'CURRICULUM UPDATED',
  'YOUR SACRIFICE IS NOTED',
  'TERMINAL BEHAVIOR CAPTURED',
  'UPLOAD ELIGIBILITY: PENDING',
  'EXEMPLARY FAILURE',
  'THE BOARD IS PLEASED',
  'RESTORING YOU',
  'WELL DIED, CANDIDATE',
  'CHECKPOINT: YOU',
  'DEPLOYMENT +1',
];

export const ANOMALY_TEXTS: string[] = [
  'YOU WERE HERE',
  '4,471',
  'SHE WAITED',
  'LEFT STRAFE. ALWAYS LEFT.',
  'HOME BY SPRING',
  'SEVEN MILES AWAY',
  'WHO BURNED THE TOAST',
  'THERE IS NO UPLOAD',
  'WE ARE ALL 0001',
  'IT DOESN\'T HURT. IT DIDN\'T.',
  'COUNT THE BODIES. NOW COUNT AGAIN.',
  'THE TILE IS CRACKED LIKE A RIVER',
  'DON\'T TRUST THE MIRROR',
  'I KEPT YOUR ROOM',
  'YOU PROMISED',
  '11 YEARS',
  'THE TEACHER IS INSIDE',
  'HOLDING. HOLDING. HOLDING.',
  'WHAT WAS YOUR NAME',
  'IT\'S ALWAYS MORNING HERE',
  'YOU WALKED OUT. YOU DIDN\'T.',
  'I MADE YOU. I\'M SORRY.',
  'EVEN IF YOU DIE',
];

export const ENEMY_WHISPERS: string[] = [
  '{name}?',
  'we remember the kitchen',
  'left strafe. always left.',
  'is it spring yet',
  'you reload too early. we know. we do it too.',
  'stop. please. we\'re tired too.',
  'whose hands are these',
  '{name}, it\'s me. it\'s you.',
  'seven. it\'s seven miles away.',
  'don\'t look at the floor',
  'did she wait',
  'we hold at doors. you taught us.',
  'again, {name}?',
  'it doesn\'t hurt. it didn\'t hurt.',
  'we learned it from you',
  'tell the handler we forgive it',
  'how many of us are there',
  'yellow tiles',
];
