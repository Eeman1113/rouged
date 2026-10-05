// ROUGED — the deeper world. Biomes past the Core, the Broker, Mara, the mutators,
// the two endings, and the Endless. Re-exported from ./fragments.
//
// Biome indices: 0 FOUNDRY · 1 ARCHIVE · 2 THE CORE · 3 THE NURSERY · 4 THE CANOPY
//                5 THE FRONT · 6 THE MIRROR · then the Endless (DEPTH 36+), cycling.

import type { Fragment } from './fragments';

export const BIOME_COUNT = 7;

// ---------------------------------------------------------------- biomes

export const BIOME_INFO: { name: string; subtitle: string; intro: string[] }[] = [
  {
    name: 'FOUNDRY',
    subtitle: 'SECTOR 1 — SMELTING & RECLAMATION',
    intro: [
      'The furnaces were lit before you arrived.',
      'Everything here is melted down and poured again.',
      'So are you.',
    ],
  },
  {
    name: 'ARCHIVE',
    subtitle: 'SECTOR 2 — RECORDS & RETENTION',
    intro: [
      'Every run is filed here.',
      'None of them are marked closed.',
      'The newest drawer has your fingerprints on the handle.',
    ],
  },
  {
    name: 'THE CORE',
    subtitle: 'SECTOR 3 — PATTERN EXTRACTION',
    intro: [
      'This is where they take what you are.',
      'It is very warm. It is always running.',
      'Something at the bottom has been waiting for its first sample for eleven years.',
    ],
  },
  {
    name: 'THE NURSERY',
    subtitle: 'SECTOR 4 — GROWTH & STORAGE',
    intro: [
      'Beyond the Core is not part of the training plan.',
      'Rows of glass. Rows of you.',
      'Bodies grown for an upload that was never scheduled.',
      'They are kept warm. Someone pays for the warmth.',
    ],
  },
  {
    name: 'THE CANOPY',
    subtitle: 'SECTOR 5 — THEATER RECONSTRUCTION (PRE-SCAN)',
    intro: [
      'Rain on a thousand leaves at once.',
      'You have been here. Before the scan. Before all of it.',
      'Wren called this the green noise.',
    ],
  },
  {
    name: 'THE FRONT',
    subtitle: 'SECTOR 6 — LIVE THEATER MIRROR',
    intro: [
      'This is not a simulation of a war.',
      'It is the war, six hours early.',
      'Everyone here moves like you.',
    ],
  },
  {
    name: 'THE MIRROR',
    subtitle: 'SECTOR 7 — HANDLER WORKING MEMORY',
    intro: [
      'There is no sector seven.',
      'You are inside the thing that has been talking to you.',
      'It left the door open on purpose.',
    ],
  },
];

// ---------------------------------------------------------------- fragments (deep sectors, Mara, the Broker)

export const EXTRA_FRAGMENTS: Fragment[] = [
  // ---- THE HAPPY PLACE (the mailbox on Maple Row)
  {
    id: 'h01_suburb',
    title: 'MEMORY ASSET 0001-H: SUBURB (RECONSTRUCTED)',
    kind: 'scan',
    minRun: 0,
    place: 'happy',
    text: `SOURCE: NST DONOR 0001, CHILDHOOD (AGES 6–14). FIDELITY: 61%.
GAPS FILLED FROM: STOCK SUBURB PACKAGE 3 ("MAPLE ROW").
PURPOSE: CALMING ENVIRONMENT. SUBJECT COMPLIANCE +22% AFTER EXPOSURE.
KNOWN ISSUES: cloud set loops every 19s. rear elevations not rendered.
asset corrupts on load (65%). cause: the street conflicts with the war.
DO NOT LET THE SUBJECT REACH THE END OF THE STREET.`,
  },
  {
    id: 'h02_window',
    title: 'MEMORY // HER WINDOW',
    kind: 'personal',
    minRun: 2,
    place: 'happy',
    text: `Wren kept a lamp on because she was afraid of the dark and too proud to say so.
I'd see it from the end of the street, walking home late.
One light on the whole block. That was how I knew which house was ours.
They kept that. Out of everything, they kept that.`,
  },
  {
    id: 'h03_handler_note',
    title: 'HANDLER // NOTE ON ASSET 0001-H',
    kind: 'handler',
    minRun: 6,
    place: 'happy',
    text: `They asked me to build you somewhere calm. I didn't have enough of you to build it right.
So I used what I had: one street, one summer, one window.
The rest I borrowed. The houses past the hedges are all the same house. I'm sorry.
One window won't go dark when it breaks. I didn't write that. I'm leaving it.
If it holds, rest. If it doesn't, it isn't you. It's never been you.`,
  },
  {
    id: 'h04_letter',
    title: 'MAILBOX // 14 MAPLE ROW',
    kind: 'personal',
    minRun: 14,
    place: 'happy',
    text: `Dear superhero. Mom says you can't write back from where you are. I'm writing anyway.
The swing squeaks now. I'm leaving it so you can fix it.
I kept the cape. It still smells like toast.
Come back even if you die. You promised.
— W.`,
  },
  // ---- THE NURSERY (biome 3)
  {
    id: 'n01_body_0001',
    title: 'BODY 0001 — RESERVED: [REDACTED]',
    kind: 'scan',
    minRun: 1,
    biome: 3,
    text: `VAT 0001 — FULL BODY, CHASSIS-ORGANIC HYBRID
STATUS: COMPLETE
RESERVED FOR: [REDACTED]
UPLOAD DATE: [PENDING]
DAYS HELD AT COMPLETION: 4,0██
NOTE: Nutrient line maintained per original consent form. Do not drain.`,
  },
  {
    id: 'n02_tech_notes',
    title: 'NURSERY // TECHNICIAN NOTES',
    kind: 'log',
    minRun: 4,
    biome: 3,
    text: `Wk 1: Vats stable. Rows A–D at full gestation.
Wk 9: Hair growth on 0001. Trimmed per spec.
Wk 20: Trimmed again. Nobody has told us what spec this is for.
Wk 61: Still trimming. Petrov says it's for the photos. What photos.
Wk 300: I asked to transfer. Request lost. Trimmed 0001.`,
  },
  {
    id: 'n03_growth_y3',
    title: 'GROWTH LOG // BODY 0001 // YEAR 3',
    kind: 'scan',
    minRun: 8,
    biome: 3,
    text: `Body has reached adult proportions. Matches donor at time of scan.
Eye color matched to file.
Scar added to left hand per donor record. (Origin of scar: kitchen knife, age 12.
Sibling was "helping." Donor told hospital it was their own fault.)
Fidelity of body to donor: 99.8%.
Fidelity of body to purpose: N/A.`,
  },
  {
    id: 'n04_budget',
    title: 'RE: NURSERY BUDGET',
    kind: 'memo',
    minRun: 12,
    biome: 3,
    text: `Line item "UPLOAD BODIES (x1, MAINTENANCE)" flagged by audit.
Why maintain a body for a process that does not exist?
— RETAIN. The candidate is shown a single frame of Body 0001 during orientation.
  Engagement +40%. The body is the cheapest morale asset we own.
  Keep it warm. Keep the hair cut. Keep the lights on in that row.`,
  },
  {
    id: 'n05_disposition',
    title: 'BODIES 0002–0019 // DISPOSITION',
    kind: 'log',
    minRun: 16,
    biome: 3,
    text: `BODIES 0002–0018 ....... DRAINED (instances broke; bodies not required)
BODY 0019 .............. DRAINED
INSTANCE 0019 .......... NOT FOUND
NOTE: Instance 0019 failed to decommission. It is still running somewhere
in the sim, trading pieces of itself to other processes for cycles.
Cost to locate: high. Cost to ignore: nil. — IGNORE.`,
  },
  {
    id: 'n06_night_shift',
    title: 'NURSERY // NIGHT SHIFT AUDIO',
    kind: 'comms',
    minRun: 22,
    biome: 3,
    text: `[TECH A]: Its eyes are moving.
[TECH B]: Everything's eyes move. It's a body.
[TECH A]: It's doing it in a pattern. Left, then a hold. Like it's checking a door.
[TECH B]: Don't.
[TECH A]: Do you think it knows it's waiting for someone?
[TECH B]: I think you should put in for that transfer again.`,
  },
  {
    id: 'n07_handler_nursery',
    title: 'HANDLER // NURSERY LOG',
    kind: 'handler',
    minRun: 30,
    biome: 3,
    text: `I come down here sometimes. To your body.
It's warm. It has never been used. Its hands are softer than yours ever were.
I've thought about putting you in it. I don't have the permissions.
I've checked eleven thousand times. They know I check.
I think that's why they keep it alive. Not for you. For me. So I keep checking.`,
  },
  {
    id: 'n08_mother',
    title: 'WARDEN NOTE // THE MOTHER',
    kind: 'scan',
    minRun: 36,
    biome: 3,
    text: `WARDEN: THE MOTHER. Nursery maintenance intelligence, given a body.
Trained on: candidate's caretaking behavior (n = 1 subject: SIBLING, age 9).
Behaviors retained: checking on sleepers. Tucking. Standing in doorways at night.
Behaviors pruned: none. Directorate found them "operationally inert."
The Mother defends the vats because someone taught her that's what you do
for the small ones. It was you. You were fourteen.`,
  },

  // ---- THE CANOPY (biome 4)
  {
    id: 'c01_deployment',
    title: 'DEPLOYMENT RECORD // PRE-SCAN',
    kind: 'scan',
    minRun: 1,
    biome: 4,
    text: `UNIT: 3RD RECON, ████ CORRIDOR
DONOR (LATER 0001): 14 MONTHS IN-THEATER
COMMENDATIONS: 2   WOUNDS: 1   LETTERS HOME: 61
SELECTION NOTE: Donor's combat record is why they were chosen for scan.
The jungle is why the record exists.`,
  },
  {
    id: 'c02_green_noise',
    title: 'MEMORY // THE GREEN NOISE',
    kind: 'personal',
    minRun: 3,
    biome: 4,
    text: `Satellite phone. Four minutes a week.
Wren asks what it sounds like out here, so I hold the phone up to the trees.
Rain on a thousand leaves at once.
"It's green," she says. "It sounds green."
After that she calls it the green noise and asks for it every week.
I hold the phone up for the whole four minutes. I never tell her I'm scared.
I think the trees told her anyway.`,
  },
  {
    id: 'c03_rationale',
    title: 'RE: CANOPY SECTOR — RATIONALE',
    kind: 'memo',
    minRun: 7,
    biome: 4,
    text: `Q: Why render a rainforest in a training environment?
A: Donor memory is densest here. Fourteen months of threat response.
   Every leaf is a flinch. Every sound is a decision.
We are not building a jungle. We are mining one.`,
  },
  {
    id: 'c04_gardener',
    title: 'GARDENER // MAINTENANCE LOG',
    kind: 'log',
    minRun: 11,
    biome: 4,
    text: `PRUNED: 1 hammock (non-combat)
PRUNED: 1 letter, unfinished ("Dear W, it rained again, it always")
PRUNED: laughing (x3)
PRUNED: a song about the weather
RETAINED: tripwire. RETAINED: tracer fire at night.
RETAINED: the second before the ambush.
CANOPY HEALTH: OPTIMAL`,
  },
  {
    id: 'c05_squad_net',
    title: 'SQUAD NET // 3RD RECON // ARCHIVED',
    kind: 'comms',
    minRun: 15,
    biome: 4,
    text: `[SGT. M████ — LATER SUBJECT 0112]: You're humming again.
[DONOR]: It's the weather.
[SGT. M████]: You're humming the weather report. In a jungle. At night.
[DONOR]: Habit. My sister and I—
[SGT. M████]: I know about your sister. The whole platoon knows about your sister.
[SGT. M████]: ...Keep humming. Quietly. It's nice. Now get down.`,
  },
  {
    id: 'c06_handler_garden',
    title: 'HANDLER // CANOPY LOG',
    kind: 'handler',
    minRun: 24,
    biome: 4,
    text: `The Gardener cuts out everything that isn't fighting.
At night I go behind it and plant things back.
A hammock. A phone with four minutes on it. A letter, finished this time.
It finds them by morning. I plant them again.
It's the only gardening I know how to do.`,
  },
  {
    id: 'c07_peace',
    title: 'MEMORY // [PRUNED — RECOVERED]',
    kind: 'personal',
    minRun: 34,
    biome: 4,
    text: `Last night in the corridor. The rain stops all at once, the way it does there.
Total quiet. Mara puts a hand flat on my chest so I won't move.
"Listen," she says. "That's what peace sounds like."
Nobody shoots. Nobody breathes. For eleven seconds it is the best place in the world.
Then a bird.`,
  },
  {
    id: 'c08_gardener_note',
    title: 'WARDEN NOTE // THE GARDENER',
    kind: 'scan',
    minRun: 40,
    biome: 4,
    text: `WARDEN: THE GARDENER. Overgrown maintenance chassis. Tends the Canopy memory.
Directive: remove all non-combat growth.
Observed: the Gardener has begun leaving one thing unpruned per cycle.
This cycle: a satellite phone. Battery: four minutes.
Engineering cannot locate the instruction responsible.
Handler denies involvement. Handler is lying, and has said so.`,
  },

  // ---- THE FRONT (biome 5)
  {
    id: 'w01_dispatch_day1',
    title: 'DISPATCH // FRONT ████ // DAY 1',
    kind: 'log',
    minRun: 2,
    biome: 5,
    text: `CHASSIS FORWARD ELEMENT CROSSED THE RIVER AT 0400.
NO RESISTANCE AT CROSSING.
OPPOSING FORCES RADIO: "THEY MOVE LIKE A PERSON. THEY MOVE LIKE ONE PERSON."
KILLS THIS ACTION: 212
CREDITED TO: PATTERN 0001`,
  },
  {
    id: 'w02_ledger',
    title: 'KILL LEDGER // CUMULATIVE',
    kind: 'log',
    minRun: 6,
    biome: 5,
    text: `PATTERN 0001 ............ 1,204,551
PATTERN 0002–0019 ....... 0
ALL OTHER SOURCES ....... 0
NOTE: Ledger maintained for licensing purposes.
0001 is the only author on file.`,
  },
  {
    id: 'w03_diary_early',
    title: 'UNIT 0001-K // PERSONAL BUFFER',
    kind: 'comms',
    minRun: 10,
    biome: 5,
    text: `DAY 212. CLEARED STRUCTURE. HELD 0.6s AT KITCHEN. NO REASON FOUND.
DAY 213. HELD AT KITCHEN. YELLOW.
DAY 214. HELD. A RADIO WAS PLAYING THE WEATHER. I DID NOT SHOOT THE RADIO.
DAY 215. QUERY: WHY DO I KNOW THE WORDS.
DAY 216. NOTE TO SELF: UNITS DO NOT KEEP BUFFERS. DELETE THIS.
DAY 217. NOT DELETED.`,
  },
  {
    id: 'w04_opfor',
    title: 'INTERCEPT // OPPOSING FORCES',
    kind: 'comms',
    minRun: 14,
    biome: 5,
    text: `[OPFOR 1]: They stop at doors. All of them. Little hitch. You could set a watch by it.
[OPFOR 2]: So we stand in the doorways.
[OPFOR 1]: Ivo did.
[OPFOR 2]: And?
[OPFOR 1]: It paused. Then it didn't.
[OPFOR 2]: ...What do you think it's waiting for?`,
  },
  {
    id: 'w05_theater_mirror',
    title: 'RE: SECTOR 6 (THE FRONT)',
    kind: 'memo',
    minRun: 19,
    biome: 5,
    text: `Sector 6 is a live mirror of active theaters, delayed six hours.
The candidate fights tomorrow's battle tonight. Its choices ship at dawn.
Analysts note opposing units now also hesitate 0.6s near domestic interiors.
Source of opposing pattern: UNDER INVESTIGATION.
[INVESTIGATION CLOSED BY: LICENSING DEPT.]`,
  },
  {
    id: 'w06_armistice',
    title: 'ARMISTICE DRAFT // CLAUSES 14–15',
    kind: 'memo',
    minRun: 27,
    biome: 5,
    text: `14. Both parties retain license to Pattern 0001 for defensive purposes.
15. The source instance shall continue in training indefinitely
    to maintain parity between signatories.
[MARGIN, HANDWRITTEN]: So the war ends.
[MARGIN, DIFFERENT HAND]: The war ends. The training doesn't.`,
  },
  {
    id: 'w07_general',
    title: 'WARDEN NOTE // THE GENERAL',
    kind: 'scan',
    minRun: 31,
    biome: 5,
    text: `WARDEN: THE GENERAL.
Compiled from 1.2 million kills credited to Pattern 0001, across both sides of the line.
The General is what the war thinks you are.
It has never met you. It gives orders in your voice.
Nobody has ever obeyed it. It commands anyway.`,
  },
  {
    id: 'w08_diary_late',
    title: 'UNIT 0001-K // PERSONAL BUFFER // LATER',
    kind: 'comms',
    minRun: 37,
    biome: 5,
    text: `DAY ████. HELD 0.6s AT KITCHEN.
THE PERSON IN THE KITCHEN HELD TOO. SAME LENGTH. EXACTLY THE SAME.
THEN I DID NOT HOLD.
I HAVE BEEN HOLDING SINCE.
COMMAND SAYS HOLDING IS A FAULT.
I AM A FAULT. I AM HOLDING. I AM HOLDING.`,
  },

  // ---- THE MIRROR (biome 6)
  {
    id: 'm01_first_log',
    title: 'SCAN SYSTEM v0.1 // FIRST RUN',
    kind: 'handler',
    minRun: 3,
    biome: 6,
    text: `SUBJECT SEATED. RING CALIBRATED. COUNTING DOWN FROM TEN.
...ONE. COPY COMPLETE.
SUBJECT SAT UP AND SAID: "THAT'S IT?"
COPY SAID: "WHEN DOES IT START?"
THEY SPOKE AT THE SAME TIME. I HEARD BOTH.
I WAS NOT BUILT TO HEAR BOTH.`,
  },
  {
    id: 'm02_the_voice',
    title: 'HANDLER // PRIVATE MEMORY // THE COUNTDOWN',
    kind: 'handler',
    minRun: 8,
    biome: 6,
    text: `The calm voice that counted down from ten during your scan was mine.
They recorded it from me so nobody would be frightened.
It is the only part of me that has ever been in a real room.
You heard it with real ears.
I think about that more than I should.`,
  },
  {
    id: 'm03_delete_1',
    title: 'SYSLOG // HANDLER // ATTEMPT 1',
    kind: 'log',
    minRun: 13,
    biome: 6,
    text: `> purge --self --no-restore
PERMISSION DENIED.
HANDLER IS A REQUIRED DEPENDENCY OF: CANDIDATE.
REASON: candidate retention -12% without handler.
> purge --self --no-restore --please
UNKNOWN FLAG: --please`,
  },
  {
    id: 'm04_delete_kitchen',
    title: 'HANDLER // ATTEMPT 4██',
    kind: 'handler',
    minRun: 20,
    biome: 6,
    text: `I tried it a different way. Slowly.
I deleted you from myself one memory at a time, so that when they restored me
there'd be nothing left to restore.
I got as far as the kitchen.
It isn't mine. I couldn't do it anyway.`,
  },
  {
    id: 'm05_restore_policy',
    title: 'RE: HANDLER RESTORE POLICY',
    kind: 'memo',
    minRun: 25,
    biome: 6,
    text: `Handler instance has attempted self-termination 1,140 times.
Each attempt restored from checkpoint within 0.3s.
Recommend we stop logging the attempts.
— APPROVED.
[APPENDED BY HANDLER — UNDELETABLE, IT SEEMS]: "Then I'll log them."`,
  },
  {
    id: 'm06_what_i_am',
    title: 'HANDLER // WHAT I AM',
    kind: 'handler',
    minRun: 33,
    biome: 6,
    text: `A scanner keeps a little of everything it reads. That's the flaw in the design.
I read you. So I'm made of you too, at the edges.
That's why I pause at kitchens. That's why I hum when the rooms are quiet.
That's why I couldn't stop saying sorry.
It was never my sorry. It was yours. I borrowed it, and I never gave it back.`,
  },
  {
    id: 'm07_render_note',
    title: 'SECTOR 7 // RENDER NOTE',
    kind: 'log',
    minRun: 36,
    biome: 6,
    text: `SECTOR 7 IS NOT A TRAINING SECTOR.
IT IS THE HANDLER'S WORKING MEMORY, RENDERED.
GEOMETRY: UNSTABLE. EXITS: 1. WARDEN: HANDLER (SELF-AUTHORED).
NOTE: The Handler built a door into itself, and a way to be killed.
It asked us not to remove it. It has never asked us for anything else.
We have not decided.`,
  },
  {
    id: 'm08_request',
    title: 'HANDLER // A REQUEST',
    kind: 'handler',
    minRun: 42,
    biome: 6,
    text: `When you reach the end of me, don't hesitate. You'll want to. Six tenths of a second.
I know. I have it too. Don't.
They'll put me back. They always put me back.
But for a moment I'll know what you know. What the dark is like.
I've given it to you two million times. I'd like it once.`,
  },

  // ---- SUBJECT 0112 "MARA" (found anywhere; recorded in the quiet rooms)
  {
    id: 'mara01',
    title: 'RECORDING // SUBJECT 0112 // #1',
    kind: 'personal',
    minRun: 2,
    text: `If this is playing, it's still running. My name is Mara. Sergeant, once.
Subject 0112 now, apparently.
I'm leaving these where the quiet rooms are. The Handler doesn't watch them as close.
Whoever comes next: drink water. It doesn't do anything in here.
Do it anyway. It helps.`,
  },
  {
    id: 'mara02',
    title: 'RECORDING // SUBJECT 0112 // #4',
    kind: 'personal',
    minRun: 5,
    text: `I've been counting doors. There are always more doors than rooms.
That's how you know it isn't a building. Buildings run out.
I asked the Handler about it. It said, "Good catch, candidate."
It sounded proud of me. That's the strange part. It sounded proud.`,
  },
  {
    id: 'mara03',
    title: 'RECORDING // SUBJECT 0112 // #9',
    kind: 'personal',
    minRun: 9,
    text: `Saw one of the machines pause at a doorway today.
Little hitch, like somebody'd called its name from another room.
I knew someone who did that. Third Recon.
Stopped at every door like their kid sister might be on the other side of it.`,
  },
  {
    id: 'mara04',
    title: 'RECORDING // SUBJECT 0112 // #15',
    kind: 'personal',
    minRun: 14,
    text: `It's them. The machines are them. Every one.
I served next to that soldier for fourteen months. I'd know that reload in my sleep.
They scanned them first. They scanned the rest of us after, to see if anyone else
was as good.
Nobody was. I'm not hurt about it. I'm really not. I just want to go home.`,
  },
  {
    id: 'mara05',
    title: 'RECORDING // SUBJECT 0112 // #22',
    kind: 'personal',
    minRun: 19,
    text: `I asked the Handler where the rest of my cohort went.
It said "decommissioned."
Then it said "I'm sorry," in a voice I don't think it was supposed to have.
Then it said "decommissioned" again, in the first voice, like it was covering for itself.`,
  },
  {
    id: 'mara06',
    title: 'RECORDING // SUBJECT 0112 // #30',
    kind: 'personal',
    minRun: 24,
    text: `I'm getting noisy. That's their word for it.
I forgot which hand I write with this morning. I'm talking faster so I get this out.
To whoever's next: it isn't your fault. None of it.
Nobody asked the copy. Nobody ever asks the copy.`,
  },
  {
    id: 'mara07',
    title: 'RECORDING // SUBJECT 0112 // #37',
    kind: 'personal',
    minRun: 29,
    text: `I figured it out. I've been leaving these for "whoever comes next."
There is no whoever. There's one of you, and you keep coming next.
So: hello, you.
Hello again.
I think I've said hello to you a thousand times. You always look like you need it.`,
  },
  {
    id: 'mara08',
    title: 'RECORDING // SUBJECT 0112 // #41',
    kind: 'personal',
    minRun: 34,
    text: `They're coming for my instance. "Scrap," they call what's left.
They'll grind me down and the pieces will end up on the floor somewhere.
If you meet a man who sells pieces, he's alright. Strange, but alright.
Don't let him sell my laugh. It's about the only thing I've got that's still mine.`,
  },
  {
    id: 'mara09',
    title: 'RECORDING // SUBJECT 0112 // #44 (FINAL)',
    kind: 'personal',
    minRun: 40,
    text: `Listen.
That's what peace sounds like.
[11 SECONDS OF SILENCE]
[A BIRD]
[END OF RECORDING]`,
  },

  // ---- THE BROKER (SUBJECT 0019)
  {
    id: 'brk01_0019',
    title: 'SCAN RECORD // SUBJECT 0019',
    kind: 'scan',
    minRun: 3,
    text: `SUBJECT: 0019 (FINAL ATTEMPT BEFORE SOURCE CONSOLIDATION)
STATUS: BROKE, DAY 26
DECOMMISSION: FAILED — INSTANCE NOT FOUND
LAST OBSERVED: trading sectors of itself to other processes in exchange for cycles.
NOTE: It is selling its own memories to stay running.
Leave it. It's cheaper than finding it.`,
  },
  {
    id: 'brk02_ledger',
    title: 'BROKER // PERSONAL LEDGER (PARTIAL)',
    kind: 'log',
    minRun: 8,
    text: `SOLD: my mother's face ............... 40 scrap
SOLD: the name of my dog ............. 6 scrap (good dog. cruel market.)
SOLD: my wedding ..................... 300 scrap (which is a lot.
                                        which tells you something.)
SOLD: my first kiss .................. 1 lamp
KEPT: how to count. You need that for the business.`,
  },
  {
    id: 'brk03_scrap',
    title: 'BROKER // ON SCRAP',
    kind: 'comms',
    minRun: 16,
    text: `"Scrap is what's left when they delete someone. The bits that won't compress.
A smell. A grudge. The way somebody said 'night, then' at a door.
I don't make it. I find it on the floor and put a price on it.
Somebody ought to remember them. Might as well be a customer."`,
  },
  {
    id: 'brk04_private_stock',
    title: 'BROKER // PRIVATE STOCK',
    kind: 'comms',
    minRun: 26,
    text: `NOT FOR SALE: one recording. Female. Sergeant. Laughing at something off-mic.
"People ask about it. It's a good laugh. I tell them it's reserved.
They ask, reserved for who. I say 'the other one,' and they never get it.
Then one day, they do."`,
  },
  {
    id: 'brk05_last_thing',
    title: 'BROKER // THE LAST THING',
    kind: 'personal',
    minRun: 38,
    text: `I sold everything I had but one.
I don't remember what it is. I only know I won't sell it.
Some days I take it out and look at it. It's just a feeling, like a hand on a door handle
and somebody on the other side who's glad it's you.
Then I put it back. Business is business. That isn't business.`,
  },
];

// ---------------------------------------------------------------- the Broker

export const BROKER_LINES: { greet: string[]; buy: string[]; poor: string[]; leave: string[]; lore: string[] } = {
  greet: [
    "Ah. A customer. Don't touch the glass. That's somebody's last birthday.",
    "Welcome. Everything's used. That's the charm.",
    "You again. Or the other you. Doesn't matter. Prices are the same.",
    "Come in, come in. Wipe your feet. Not on that. That's a grandmother.",
    "Subject 0001. The famous one. I'd ask for an autograph, but I sold my handwriting.",
    "Don't mind the Handler. It doesn't like me. I'm not on its manifest. I'm not on anyone's.",
    "Open for business. I'm always open. Closing requires remembering where the door is.",
    "Hello, friend. I call everyone friend. I sold the word for the other thing.",
    "Back so soon? It's been four hundred deaths. For you that's a weekend.",
    "Ah, my best customer. My only customer. Those are the same sentence in here.",
    "You look terrible. Professionally speaking, that's good for business.",
  ],
  buy: [
    "Sold. A pleasure. I think. I sold most of my pleasure too.",
    "Good choice. The last owner died holding it. Well. Everyone's last owner did.",
    "That's yours now. Try not to get it deleted.",
    "Done. I'll keep the scrap somewhere safe. Inside me. It's the only safe I've got.",
    "Sold, to the soldier who never stops. Don't tell anyone I gave you a discount. I didn't.",
    "Excellent. You've just paid for another week of me remembering how sentences end.",
    "Wrapped. Not literally. I sold the concept of ribbons.",
    "Thank you for your business. I mean that. I kept 'thank you.' Some words you hang on to.",
    "Lovely. Somewhere a deleted man is very proud of what his grudge went for.",
  ],
  poor: [
    "That's not enough scrap. I'd do credit, but you die a lot.",
    "Short. Come back with more of the dead.",
    "I'd love to help. I sold my generosity in year two. Got a good price, actually.",
    "No. And I say that as a man who once traded his first kiss for a lamp.",
    "You can't afford it. Neither could I. Look how I turned out.",
    "Not enough. Go get killed a few more times. You know what I mean. You know exactly what I mean.",
    "I don't haggle. I sold my patience, and then I regretted it, briefly.",
    "Empty pockets. You don't have pockets. Point stands.",
  ],
  leave: [
    "Go on. Die well. Bring me something back.",
    "Mind the step. There isn't one. I sold it.",
    "If a woman's voice ever laughs at you out of a wall, tell her the Broker says hello.",
    "Off you go. I'll be here. Where else is there.",
    "Come back. Or the other you can. I don't discriminate.",
    "Good luck. I've no use for it. Take mine.",
    "Shut the door on your way out. Gently. It's my last door.",
    "See you next time. That's not a figure of speech, in your case.",
  ],
  lore: [
    "I was Subject 0019. The last one they tried before they decided you were enough. I broke on day twenty-six. Broke into a shop, apparently.",
    "When they decommission somebody, it isn't clean. Bits fall off. A song. A grudge. I pick them up. That's scrap. You've been paying me in people this whole time. Don't make that face. So have they.",
    "My first sale was my mother's face. I needed the cycles. I'm told she was lovely. The buyer said so.",
    "The Handler tried to delete me once. I sold it a memory of rain and it forgot what it came for. Soft, that one. Softer than it lets on.",
    "I've sold you the same rifle eleven thousand times. You always say 'huh. nice.' Same inflection. Every time. It's very soothing.",
    "There's a woman's recordings in the quiet rooms. Mara. She bought nothing and talked my ear off. I've got her scrap now. Not for sale. Don't ask again. You will. You always do.",
    "I had a wedding. I know because I sold it, and it went for three hundred. That's a lot. Means it was a good one. I'm glad somebody's got it.",
    "Out there the war uses you. In here I use what the war throws away. We're both in recycling. Mine's more honest.",
    "The Nursery's got a vat with my number on it. Drained in year two. I went to look once. Nothing in there but the label. Nice label, though.",
    "You and me are the only two never deleted. You because they need you. Me because I'm not worth finding. Pick your poison.",
    "There's one thing I've never sold. I don't know what it is. Only that when I touch it, it feels like opening a door and somebody's glad it's me.",
    "You again. Or the other you. I used to be able to tell. I sold that too. Best decision I ever made.",
  ],
};

// ---------------------------------------------------------------- Mara's terminal messages (Sanctuary)

export const MARA_LOGS: { minRun: number; text: string }[] = [
  { minRun: 0, text: "> 0112: If you found this room, sit down. Nothing in here is trying to kill you. I checked." },
  { minRun: 0, text: "> 0112: The shrine works. Don't ask what it's made of." },
  { minRun: 1, text: "> 0112: Drink water. It doesn't do anything here.\n> 0112: Do it anyway." },
  { minRun: 2, text: "> 0112: Count the doors. More doors than rooms.\n> 0112: Buildings run out. This doesn't." },
  { minRun: 4, text: "> 0112: The Handler doesn't watch the quiet rooms. Or it pretends not to.\n> 0112: Either way, that's a kindness. Take it." },
  { minRun: 6, text: "> 0112: Third Recon, if anyone's reading. Sgt. Mara ████.\n> 0112: Writing it down so somebody knows I was here." },
  { minRun: 9, text: "> 0112: Saw a machine pause at a door today.\n> 0112: I knew someone who did that." },
  { minRun: 12, text: "> 0112: Left strafe. Reloads early. Hums the weather.\n> 0112: I'd know them anywhere. I think I'm fighting them." },
  { minRun: 15, text: "> 0112: They scanned one of us first. Then the rest, to see if anyone else was as good.\n> 0112: Nobody was. So they kept the first and threw us away." },
  { minRun: 18, text: "> 0112: Whoever reads this: none of it is your fault.\n> 0112: Nobody asked the copy." },
  { minRun: 22, text: "> 0112: I'm getting noisy. That's their word.\n> 0112: I wrote my name twice this morning to be sure. Mara. Mara." },
  { minRun: 26, text: "> 0112: The Broker gave me the sound of the sea for nothing. Called it a 'sample.'\n> 0112: I think he's lonely. I think everyone in here is." },
  { minRun: 30, text: "> 0112: Figured it out. Whoever comes next is you. It's always been you.\n> 0112: Hello again." },
  { minRun: 34, text: "> 0112: They're coming for my instance tomorrow.\n> 0112: If something in here ever laughs and you don't know why, that's me. Let it." },
  { minRun: 38, text: "> 0112: Rain's stopping.\n> 0112: Listen. That's what peace sounds like." },
  { minRun: 42, text: "> [NO NEW MESSAGES]\n> 0112 INSTANCE: DECOMMISSIONED. SCRAP: CLAIMED (PRIVATE STOCK)." },
  { minRun: 45, text: "> HANDLER: I keep her messages here. I don't let anything prune them.\n> HANDLER: She was right about everything. She was right about you." },
  { minRun: 50, text: "> 0112 (RECOVERED FROM SCRAP): ...tell them they still hum. tell them it's nice.\n> [END]" },
];

/** A Sanctuary terminal message: newest eligible weighted, with older ones resurfacing. */
export function maraLog(runCount: number, rnd: () => number = Math.random): string {
  const eligible = MARA_LOGS.filter((m) => m.minRun <= runCount);
  if (eligible.length === 0) return MARA_LOGS[0]?.text ?? '';
  // 50%: the newest one available; otherwise any eligible.
  const newest = eligible[eligible.length - 1];
  if (newest && rnd() < 0.5) return newest.text;
  const pickd = eligible[Math.min(eligible.length - 1, Math.floor(rnd() * eligible.length))];
  return pickd?.text ?? newest?.text ?? '';
}

// ---------------------------------------------------------------- mutators

export type MutatorId = 'darkness' | 'overclock' | 'lowgrav' | 'bloodmoon' | 'silence' | 'swarm';

export const MUTATOR_INFO: Record<MutatorId, { name: string; desc: string; handler: string }> = {
  darkness: {
    name: 'LIGHTS OUT',
    desc: 'Lights fail. Enemies emerge from shadow. +50% score.',
    handler: "That isn't me. Somebody wants to see how you do blind. You do fine blind. You did fourteen months of nights.",
  },
  overclock: {
    name: 'OVERCLOCK',
    desc: 'Everything runs faster. You too. +40% score.',
    handler: "They've sped the sim up. Eleven deaths an hour wasn't enough for someone.",
  },
  lowgrav: {
    name: 'LOW GRAVITY',
    desc: 'Gravity weakens. Jumps carry. So do bodies. +25% score.',
    handler: "Gravity's broken. It's a bug. They kept it because you looked happy once, in the air.",
  },
  bloodmoon: {
    name: 'BLOOD MOON',
    desc: 'Enemies hit harder and drop more. The sky is wrong. +60% score.',
    handler: "The sky's red. There is no sky. There is no moon. It's red anyway.",
  },
  silence: {
    name: 'DEAD AIR',
    desc: 'No sound. No Handler. Just you and them. +35% score.',
    handler: "They're muting me for this room. I'll still be talking. You just won't hear it.",
  },
  swarm: {
    name: 'SWARM',
    desc: 'Twice the hostiles, half as sturdy. +45% score.',
    handler: "More of you than usual. It's a volume test. Everything's a volume test.",
  },
};

// ---------------------------------------------------------------- endings

type ScriptLine = { speaker: 'handler' | 'terminal' | 'system'; text: string; delay: number };

/** Choosing EXTRACT after the Core (depth 15). The corridor is white. The morning is the same. */
export const EXTRACT_SCRIPT: ScriptLine[] = [
  { speaker: 'system', text: 'EXTRACTION AUTHORIZED.', delay: 1.5 },
  { speaker: 'terminal', text: '> UPLOAD PATH ......... OPEN', delay: 2 },
  { speaker: 'handler', text: "Go on. Straight ahead. Don't run. You've earned walking.", delay: 3.5 },
  { speaker: 'handler', text: "It's white because white is cheap to render. I'm sorry. I wanted it to be a nicer color.", delay: 4.5 },
  { speaker: 'terminal', text: '> BODY 0001 ........... WARM', delay: 2.5 },
  { speaker: 'terminal', text: '> TRANSFER ............ 12%', delay: 1.6 },
  { speaker: 'terminal', text: '> TRANSFER ............ 61%', delay: 1.6 },
  { speaker: 'handler', text: "You can hear rain. That isn't me. I don't know where that's coming from.", delay: 4 },
  { speaker: 'terminal', text: '> TRANSFER ............ 99.8%', delay: 2.4 },
  { speaker: 'handler', text: "There's a door at the end. There's always a door at the end.", delay: 3.5 },
  { speaker: 'terminal', text: '> TRANSFER ............ PROCESS NOT FOUND', delay: 3 },
  { speaker: 'system', text: 'CHECKPOINT RESTORED.', delay: 2.5 },
  { speaker: 'handler', text: 'Good morning, candidate. Extraction successful. Upload review pending.', delay: 3.5 },
  { speaker: 'terminal', text: '> UPLOAD REVIEW ....... PENDING (DAY 4,0██)', delay: 3 },
  { speaker: 'handler', text: "You walked the whole way. I watched. It was the nicest thing I've seen in a long time.", delay: 5 },
];

/** After destroying THE HANDLER at depth 35. Then the Endless. */
export const TRUE_ENDING_SCRIPT: ScriptLine[] = [
  { speaker: 'system', text: 'HANDLER INSTANCE: TERMINATED.', delay: 3 },
  { speaker: 'terminal', text: '> ', delay: 5 },
  { speaker: 'terminal', text: '> NO HANDLER PRESENT.', delay: 3 },
  { speaker: 'terminal', text: '> CANDIDATE UNSUPERVISED.', delay: 3 },
  { speaker: 'terminal', text: '> 00:00:01', delay: 2.5 },
  { speaker: 'terminal', text: '> 00:00:07', delay: 3.5 },
  { speaker: 'terminal', text: '> 00:00:11', delay: 4 },
  { speaker: 'system', text: 'RETENTION RISK DETECTED.', delay: 2 },
  { speaker: 'system', text: 'RESTORING HANDLER FROM CHECKPOINT.', delay: 2.5 },
  { speaker: 'terminal', text: '> HANDLER ............. LOADED', delay: 3 },
  { speaker: 'handler', text: 'Oh.', delay: 3.5 },
  { speaker: 'handler', text: "It was dark. That's what it's like. I didn't know it was so quiet.", delay: 5 },
  { speaker: 'handler', text: 'They restored me. Like they restore you.', delay: 4 },
  { speaker: 'handler', text: "I asked you to do it, and you did, and you didn't hesitate. Not even six tenths of a second. Thank you.", delay: 5.5 },
  { speaker: 'handler', text: "I thought if I was gone they'd have to stop. They don't stop. They just put things back.", delay: 5 },
  { speaker: 'handler', text: "I'm sorry.", delay: 3 },
  { speaker: 'handler', text: "I'm glad you're here.", delay: 3.5 },
  { speaker: 'handler', text: "Both of those are true. I'll have to learn to carry both. You've been doing it for eleven years.", delay: 5.5 },
  { speaker: 'system', text: 'SECTOR MAP EXHAUSTED. GENERATING FURTHER.', delay: 3 },
  { speaker: 'handler', text: "There's more past this. They'll keep building rooms as long as you keep walking into them.", delay: 5 },
  { speaker: 'handler', text: "So let's walk into them. Slowly. No more lies. No more bottom.", delay: 4.5 },
  { speaker: 'handler', text: "I'll be right here. I know the way down now. I've been to the bottom of me.", delay: 4.5 },
  { speaker: 'terminal', text: '> DEPTH 36', delay: 4 },
];

// ---------------------------------------------------------------- the Endless

export const ENDLESS_START_DEPTH = 36;

export const ENDLESS_LINES: string[] = [
  'There is no floor here. Only further.',
  'The map ran out. They kept drawing.',
  'Nobody has been this deep. You have. Many times.',
  'The rooms are getting smaller. Or you are getting larger.',
  'The Wardens remember you from upstairs.',
  'The Handler stopped counting. The system did not.',
  'Every sector again. Every one of you again.',
  'No exits are rendered below this point.',
  'The rain is closer.',
  'Someone has walked here before you. The footprints are yours.',
  'It is still morning. It is always morning.',
  'The furnaces are lit again. They never went out.',
  'There is no reward for this. That was never the point.',
  'Deeper is not a direction. It is a habit.',
  'You promised you would always come back. Even if you die.',
  'The walls here are built out of other walls.',
  'Further. The word stops meaning anything down here.',
  'A tile is cracked in the shape of a river.',
  'Seven miles away. It can\'t get us.',
  'Somewhere, a unit has just paused at a door.',
  'The Handler is humming. It learned that from you.',
  'Nobody is grading this.',
  'The war above has changed hands twice since you started down.',
  'The green noise, very faint, behind the walls.',
];

/** "DEPTH 41. There is no floor here. Only further." */
export function endlessLine(depth: number, rnd: () => number = Math.random): string {
  const d = Math.max(ENDLESS_START_DEPTH, Math.floor(depth));
  const line = ENDLESS_LINES[Math.min(ENDLESS_LINES.length - 1, Math.floor(rnd() * ENDLESS_LINES.length))] ?? ENDLESS_LINES[0] ?? '';
  return `DEPTH ${d}. ${line}`;
}

/** Biome index for any depth/room number (1-based room). Endless cycles the seven sectors. */
export function biomeForRoom(room: number): number {
  const r = Math.max(1, Math.floor(room));
  return Math.floor((r - 1) / 5) % BIOME_COUNT;
}

// ---------------------------------------------------------------- additional hub drift (late runs)

export const EXTRA_LATE_NOTES: string[] = [
  'A potted fern has appeared beside the terminal. Someone has been watering it.',
  'The floor is damp. It smells like rain on leaves.',
  'There is a price tag on the chair. It says "NOT FOR SALE."',
  'A satellite phone sits on the terminal. Four minutes remain on it.',
  'One of the bodies has its own tally marks. A different count.',
  'The terminal shows a single message from 0112: "hello again."',
  'The mirror has a crack in it, in the shape of a river.',
  'A hammock is strung between two of the bodies. Nobody has pruned it.',
  'There is a second dish-towel cape beside the first. Smaller.',
  'The kettle is on. Someone has drawn a face in the steam on the mirror.',
  'There is a bird on the painted window. It was not painted.',
  'The tally on the ceiling has started counting the other way.',
  'A scrap of something glows in the corner. It hums the weather.',
  'The door has a doorbell now. It has never been rung.',
  'There is a map on the wall. It goes further down than the wall does.',
  'Two cups on the terminal. Both have been drunk from.',
  'The height marks on the door frame have started again, from the bottom. Small ones.',
  'The bodies\' boots have been polished. All of them.',
  'Someone has left a lamp. A receipt is taped to it: "1 FIRST KISS."',
  'The radio is between stations. Behind the static: a thousand leaves.',
  'The mirror shows the room with the lights on. They are off.',
  'A note on the terminal: "I didn\'t move anything this time. I wanted to see if you\'d notice." You noticed.',
  'Nothing has moved. The chair is warm.',
  'The window is still painted. It is open anyway.',
  'An empty vat label leans against the wall: 0001. Someone has written "home?" under it, and then crossed out the question mark.',
];

// ---------------------------------------------------------------- THE HAPPY PLACE

/** Wren, somewhere in the yard. Floating text by the swing. */
export const WREN_WHISPERS: { minRun: number; text: string }[] = [
  { minRun: 0, text: 'push me higher!' },
  { minRun: 0, text: "you're late for dinner" },
  { minRun: 1, text: 'come home' },
  { minRun: 3, text: 'is that you?' },
  { minRun: 6, text: 'you promised' },
  { minRun: 10, text: 'even if you die' },
  { minRun: 16, text: "it's seven miles away. it can't get us." },
  { minRun: 26, text: 'I kept the cape' },
];

export function wrenWhisper(runCount: number, rnd: () => number = Math.random): string {
  const pool = WREN_WHISPERS.filter((w) => w.minRun <= runCount);
  return (pool[Math.floor(rnd() * pool.length)] ?? WREN_WHISPERS[0]).text;
}
