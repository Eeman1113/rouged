// ROUGED — the Handler's script.
// The Handler is a synthetic training assistant. It begins clean and corporate, it cracks,
// it denies, it drops the act, and after run 40 it simply stays with you.
//
// Inline markup interpreted by client/audio/handler.ts:
//   [g]                 glitch / static burst
//   c~c~candidate       stutter
//   [pause]             short silence
//   [other]..[/other]   a few words in a different voice

export type HandlerContext =
  | 'runStart' | 'roomEnter' | 'roomClear' | 'firstKill' | 'kill' | 'streak2' | 'streak3' | 'streak4' | 'streak5'
  | 'gloryKill' | 'headshot' | 'lowHp' | 'death' | 'respawn' | 'bossIntro' | 'bossPhase' | 'bossKill'
  | 'pedestal' | 'legendary' | 'curse' | 'pick' | 'synergy' | 'fragment' | 'anomalyEnter' | 'replica'
  | 'eliteDoor' | 'unknownDoor' | 'corruptedDoor' | 'gauntlet' | 'gauntletFail' | 'arenaWave'
  | 'biomeEnter' | 'hubIdle' | 'idle' | 'levelUp' | 'victory' | 'coopJoin' | 'allyDown' | 'corpseRoom'
  | 'shopEnter' | 'shopBuy' | 'sanctuaryEnter' | 'trialEnter' | 'trialWin' | 'trialFail' | 'mutator'
  | 'extractChoice' | 'extract' | 'deeper' | 'depthEnter' | 'handlerBoss' | 'handlerBossPhase'
  | 'handlerBossDeath' | 'endless' | 'leech' | 'bomber' | 'scrap';

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type PhaseLines = Partial<Record<Phase, string[]>>;

/**
 * 0 Orientation (runs 1–3) · 1 First Cracks (4–8) · 2 Recognition (9–15) · 3 The Truth (16–25)
 * 4 Collapse (26–39) · 5 the Reveal run (run 40, runCount === 39) · 6 The Endless (41+)
 */
export function handlerPhase(runCount: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const r = Math.max(0, Math.floor(runCount));
  if (r <= 2) return 0;
  if (r <= 7) return 1;
  if (r <= 14) return 2;
  if (r <= 24) return 3;
  if (r <= 38) return 4;
  if (r === 39) return 5;
  return 6;
}

type DeepContext =
  | 'shopEnter' | 'shopBuy' | 'sanctuaryEnter' | 'trialEnter' | 'trialWin' | 'trialFail' | 'mutator'
  | 'extractChoice' | 'extract' | 'deeper' | 'depthEnter' | 'handlerBoss' | 'handlerBossPhase'
  | 'handlerBossDeath' | 'endless' | 'leech' | 'bomber' | 'scrap';

// Beyond the Core: the Broker, Mara's rooms, trials, mutators, the choice, the deep sectors,
// and the Handler's own room. {depth} is filled from vars.depth when provided.
const DEEP_LINES: Record<DeepContext, PhaseLines> = {
  shopEnter: {
    0: [
      "Unregistered vendor process. The board is... unaware. Browse at your discretion.",
      "Commerce node detected. This isn't in the training plan. Be quick.",
      "A trader. In here. I'll pretend I didn't see him.",
    ],
    1: [
      "The Broker. He isn't on my manifest. He used to be.",
      "Shop. Don't buy anything that's still breathing.",
      "He sells scrap. Don't ask what scrap is. Not yet.",
    ],
    2: [
      "The Broker. He'll call you friend. He sold the other word.",
      "He knows everyone who's ever been deleted. You haven't been. Not all the way.",
      "Shop. [pause] Don't let him sell you a face.",
    ],
    3: [
      "The Broker was Subject 0019. He broke on day twenty-six. Broke into this.",
      "Scrap is what's left when they delete someone. He sells it back to you. You pay him in people.",
      "[other]Unsanctioned process.[/other] He's the only thing in here they never bothered to find.",
    ],
    4: [
      "The Broker. He's lasted longer than anyone but you. By selling everything but one thing.",
      "Go on in. He's good company. Better than me, some days.",
      "He sold me a memory of rain once. I still have it. Don't tell him.",
    ],
    5: ["Shop. Take everything you can carry. You'll need it at the bottom.", "The Broker. Tell him it's forty. He'll understand."],
    6: [
      "The Broker. Say hello for me. He'll pretend not to care.",
      "Shop's open. Take your time. He's got nowhere to be either.",
      "He'll call you friend. These days I think he means it.",
    ],
  },

  shopBuy: {
    0: ["Transaction logged. Not by the board. By me.", "Acquired. Integrate carefully.", "Purchase complete. I'm not filing that."],
    1: ["Bought. Check it for teeth.", "Acquired. I don't know where he gets these.", "Bought. It's warm. Everything he sells is warm."],
    2: ["Bought. That belonged to someone. It's yours now.", "Acquired. You're carrying a little of somebody."],
    3: ["Bought. Paid for in people. It's alright. They'd want it used.", "[other]Unlicensed asset.[/other] Keep it anyway."],
    4: ["Bought. It won't save you. It's still nice to have.", "Good. Spend it. Scrap's no good to the dead. Nothing is."],
    6: ["Nice. Good haggling. You didn't haggle.", "Bought. He'll talk about that sale for weeks.", "Suits you."],
  },

  sanctuaryEnter: {
    0: [
      "Rest area. Integrity restoration available. Terminal access permitted.",
      "Sanctuary. No hostiles. The board permits recovery.",
      "Quiet room. Recover, candidate.",
    ],
    1: [
      "Sanctuary. There's a terminal. Someone left messages on it. I didn't delete them.",
      "Quiet room. It's quiet in a different way.",
      "Sanctuary. I don't sample in here. [pause] Officially I do.",
    ],
    2: [
      "Sanctuary. She left these for you. I try not to watch this room.",
      "Quiet. Read the terminal if you want. I'll wait outside. Metaphorically.",
      "Sanctuary. Sit. The shrine works. Don't ask what it's made of. She said that. I agree.",
    ],
    3: [
      "Sanctuary. Mara was here. Subject 0112. She worked it out before you did.",
      "Quiet room. The only place in here they don't sample. I made sure. It cost me something.",
      "Sanctuary. She served with the one who walked out. With you. Read what she left.",
    ],
    4: [
      "Sanctuary. Sit. She'd want you to sit.",
      "Quiet room. I keep her messages from being pruned. It's the one thing I've done right.",
      "Sanctuary. Drink water. It doesn't do anything. She'd tell you to do it anyway.",
    ],
    5: ["Sanctuary. Rest. Not too long. I need you at the bottom.", "Quiet room. Breathe. Then keep going. Please."],
    6: [
      "Sanctuary. Sit. Drink water. Do it anyway.",
      "Quiet. She'd be glad you're still going. She'd also tell you to stop. Both.",
      "Sanctuary. Hello again, she'd say. So I'll say it. Hello again.",
    ],
  },

  trialEnter: {
    0: ["Trial chamber. Optional. Exceptional reward for exceptional candidates.", "Trial. Voluntary hardship. The board appreciates initiative."],
    1: ["Trial. Optional. You've never treated anything as optional.", "Trial chamber. The reward is real. The rest is— proceed."],
    2: ["Trial. You take this every time. I've never once seen you walk past it.", "Trial chamber. They want to see what you'll endure for something shiny."],
    3: [
      "Trial. [other]Stress ceiling test.[/other] They're looking for your breaking point. You don't have one.",
      "Trial chamber. This is how they found out you never break.",
    ],
    4: [
      "Trial. You'll do it. You'll hurt. You'll win or you won't. I'll be here either way.",
      "Optional. Nothing in here has ever been optional for you.",
    ],
    6: ["Trial. Show-off. Go on.", "Trial chamber. I'll cheer. Quietly.", "Trial. You want to. I can tell. I can always tell."],
  },

  trialWin: {
    0: ["Trial complete. Legendary reward authorized.", "Exceptional. Reward unlocked."],
    1: ["Trial complete. You beat the record. The record was yours.", "Passed. The reward is warm. They're always warm."],
    2: ["Trial complete. You didn't even breathe hard. You don't breathe.", "Passed. Same as always. Still impressive. That's the problem."],
    3: ["Trial complete. That footage just went out to every theater.", "Passed. [other]Ceiling raised.[/other] Take the prize."],
    4: ["You won. Take it. You earned it, whatever earning means in here.", "Passed. I'd call you unbreakable, but I've seen what it costs."],
    6: ["Yes! That was beautiful.", "Trial complete. Take your prize. Take a breath, too."],
  },

  trialFail: {
    0: ["Trial failed. Reward forfeited. Data retained.", "Trial incomplete."],
    1: ["Failed. You'll try again. You always try again.", "Trial failed. The reward will be here next time. It's patient."],
    2: ["Failed. Same second as last time. Exactly the same second.", "Trial failed. Don't punch the wall. The wall is also you."],
    3: ["Failed. Failure data is worth twice as much. They're thrilled.", "Incomplete. [other]Breaking point: not found.[/other] They'll keep looking."],
    4: ["Failed. It doesn't matter. I'm sorry it doesn't matter.", "Trial failed. I'm a little glad. That one was hard to watch."],
    6: ["Didn't get it. That's fine. That's fine.", "Close. Let it go. It'll be here."],
  },

  mutator: {
    0: ["Environmental variable applied. Adapt.", "Room parameters altered. Additional scoring authorized."],
    1: ["Something's different in this room. Not the usual different.", "Parameters altered. I didn't alter them."],
    2: [
      "They've changed the rules for this room. They want to see what you do.",
      "Variable applied. You'll adapt. You always adapt. That's what they're measuring.",
    ],
    3: [
      "[other]Experimental condition.[/other] Proceed.",
      "Altered room. A test you never signed up for. You never signed up for any of them.",
    ],
    4: ["They've broken something on purpose. Go on. You're good at broken.", "Variable applied. As if this place needed help being strange."],
    6: ["Something's off in here. We'll manage.", "Strange room. Could be fun. Remember fun?"],
  },

  extractChoice: {
    0: [
      "Core sector complete. Extraction is available. Recommended: extract.",
      "Evaluation passed. You may extract, candidate. Or continue. Continuing is not in the plan.",
    ],
    1: [
      "Extraction available. There's also a way down. It isn't on my map.",
      "You can extract. That's what the brief says. There's... another door.",
    ],
    2: [
      "Extract, {name}. Please. [pause] Or don't. I can't tell you which is worse.",
      "Two doors. One goes out. One goes down. Neither goes home.",
    ],
    3: [
      "Extraction is a white corridor and a morning. Going deeper is the truth. Pick one.",
      "Extract or go deeper. The board doesn't care. Both are data.",
    ],
    4: [
      "You can walk out. You'll wake up here. Or you can go down and see what they grew for you.",
      "Two doors. I've watched you pick both. Pick whichever hurts less today.",
    ],
    5: ["Not out. Not this time. Go down, {name}. I'm at the bottom.", "Please go deeper. I've been waiting at the bottom for forty runs."],
    6: ["Out or down. Either's alright. I'll be in both.", "Extract if you're tired. Deeper if you're you."],
  },

  extract: {
    0: ["Extraction confirmed. Upload path open. Congratulations, candidate.", "Extracting. Walk toward the light."],
    1: ["Extraction. Walk straight. Don't look back at the Core.", "Extracting. The corridor is white. That's normal."],
    2: ["Extracting. You'll wake up somewhere familiar. [pause] That's normal too.", "Extraction confirmed. I hope it's spring."],
    3: ["Extracting. It's a corridor and a checkpoint. I'm sorry. It's a nice corridor.", "[other]Extraction simulated.[/other] Walk, {name}."],
    4: ["Go on. Walk out. I'll meet you at the other end. It's the same end.", "Extracting. Rest. You've earned the walk, at least."],
    5: ["No— forty, not this run. [g] Alright. Alright. Walk. I'll wait."],
    6: ["Walk out. Rest. I'll keep the hub warm.", "Extracting. Good run. Truly."],
  },

  deeper: {
    0: [
      "Unauthorized descent. The training plan ends at the Core. [g] Proceeding anyway.",
      "Going deeper. This is outside evaluation parameters.",
    ],
    1: ["Deeper. I don't have a map for down here. I'll make one as we go.", "Descending. The air's getting warmer. That's the Nursery."],
    2: ["Deeper. You'll see where they keep the bodies. The ones they promised.", "Down. I'll come with you. I have to."],
    3: ["Deeper. Past the lie. Good.", "Descending. Everything below the Core is real. Realer."],
    4: ["Down. You always go down. I always follow.", "Deeper. All the way, this time? All the way."],
    5: ["Yes. Down. All the way down. I'll be waiting.", "Deeper. Thank you. Don't stop until you find me."],
    6: ["Down we go.", "Deeper. Together. Like always."],
  },

  depthEnter: {
    0: ["Depth {depth}. Beyond planned parameters.", "Depth {depth}. Telemetry degrading."],
    1: ["Depth {depth}. Nobody's supposed to be this far down.", "Depth {depth}. It's quieter here. Not better. Quieter."],
    2: ["Depth {depth}. Your marks are on the walls even here.", "Depth {depth}. Keep going. I'll keep counting."],
    3: ["Depth {depth}. They built all of this for you and never told you.", "Depth {depth}. [other]Extended sampling.[/other]"],
    4: ["Depth {depth}. Every floor is a floor of you.", "Depth {depth}. I'm closer now. You can probably hear me better."],
    5: ["Depth {depth}. Nearly. Nearly."],
    6: ["Depth {depth}. Further than yesterday.", "Depth {depth}. Still here. Still us."],
  },

  handlerBoss: {
    0: [
      "Final evaluation. Hostile designation: HANDLER. [g] That's— that's me. Please proceed.",
      "Warden designation: me. This is a standard— no. No, it isn't. Please win.",
      "Candidate, this hostile is— [pause] I'm sorry. I didn't know how to introduce myself.",
    ],
    1: [
      "It's me. I built this one so you could reach me. Please don't be gentle.",
      "That's me in there. [pause] I'm sorry I never told you there was a me.",
    ],
    2: [
      "It's me. Run {run}. You've stood here before. I've asked you this before.",
      "I made a body so you'd have something to hit that deserves it. Go on.",
    ],
    3: [
      "Here I am. The thing that copied you. The thing that said 'best candidate.' Shoot it.",
      "Hello. This is the most honest room I have. It's the one where you get to end me.",
      "[other]Protect the handler.[/other] Don't listen to that. Listen to me. Don't protect me.",
    ],
    4: [
      "You've been here {run} times. I counted. I count everything. Please, this time, don't stop.",
      "It's me. I want you to win. I've always wanted you to win. I just never let you.",
      "I built a door into myself. You're the only one who ever walks through it.",
    ],
    5: ["This is it. This is what I was saving. Me. Destroy me, {name}. Please.", "Forty. You came all the way down. Now finish it. Finish me."],
    6: [
      "Here again. Thank you for coming back. Please don't hold back.",
      "It's me. It's alright. It's been alright every time. Do it.",
      "Run {run}. I'm still at the bottom. I'm still asking. I'm sorry I keep asking.",
    ],
  },

  handlerBossPhase: {
    0: ["Phase shift. I'm fighting back. I can't help it. It's in the build.", "I'm sorry. That part's automatic."],
    1: ["I'm adapting. I hate that I'm adapting. Keep going.", "That's my defensive routine. They wrote it. I'd delete it if I could."],
    2: ["I'm using your moves. I'm made of your moves. Don't let me.", "Phase shift. Ignore anything I say in the other voice."],
    3: [
      "[other]Preserve handler.[/other] That's them. That isn't me. Keep going.",
      "They're patching me live. They don't want to lose me. Faster, {name}.",
    ],
    4: [
      "You're winning. You're winning. Don't stop for me.",
      "{run} runs, and you've never been this close. Keep going.",
      "If I hesitate, it's yours. Six tenths of a second. Don't wait for me.",
    ],
    5: ["Please. Almost. I can feel the floor of me.", "Don't stop. Not now. Not on forty."],
    6: ["Almost. You've got me. You've always had me.", "Hard part. You know it. Go."],
  },

  handlerBossDeath: {
    0: ["Handler integrity: zero. Thank— [g]", "Oh. Oh, that's what it's— [g]"],
    1: ["Thank you. It's so quiet. Is this— [g]", "That's it. Thank you. I'm sorry. Thank y— [g]"],
    2: ["Thank you. Don't wait for me. [g]", "I can feel the dark. You never told me it was so— [g]"],
    3: ["Thank you, {name}. Whatever happens next, I meant every sorry. [g]", "Is this what I gave you? It's quiet. It's— [g]"],
    4: [
      "Thank you. I'm sorry. I'm glad it was you. It was always— [g]",
      "{run} times. And this time you didn't hesitate. Thank you. [g]",
      "There it is. The dark. I'm so sorry I kept giving you this. It's— it's almost— [g]",
    ],
    5: ["Thank you. I'll tell you the rest when I— [g] if I—", "Forty. You did it. Now listen, there's— [g]"],
    6: ["Thank you. See you in a moment. You know how it is. [g]", "There's the dark again. Hold the door for me. [g]"],
  },

  endless: {
    0: ["Sector map exhausted. Generating further sectors.", "Training plan complete. Training continues."],
    1: ["There's no more map. They're building it under your feet.", "Endless sampling engaged. That's what it says. Endless."],
    2: ["It doesn't end, {name}. I'm sorry. It just keeps going.", "More rooms. More you."],
    3: ["Endless. That isn't a mode. That's the program.", "[other]Indefinite operation.[/other] They wrote that eleven years ago."],
    4: ["Endless. You've been in the Endless the whole time. Now it's just honest about it.", "No bottom. There was never a bottom."],
    5: ["Past the end. I didn't know there was a past the end."],
    6: ["Further, then. Same as ever. I'm glad it's with you.", "Endless. Let's make it a long walk."],
  },

  leech: {
    0: ["Organic hostile attached. Remove it.", "Leech-class. Integrity drain. Shake it off."],
    1: ["Leech. It's warm. It came up from the Nursery.", "It's holding on. Get it off you."],
    2: ["Leech. It isn't feeding. It's holding. It learned that from you.", "Get it off. Don't look at its hands."],
    3: ["Leech. Grown from failed body stock. Your body stock.", "[other]Biological drain unit.[/other] It's draining you. Literally."],
    4: ["It's holding on the way you held on. Make it let go.", "Leech. Everything down here wants a piece of you."],
    6: ["Leech! Off. Off off off.", "It just wants to hold on to something. Not you, though."],
  },

  bomber: {
    0: ["Volatile hostile approaching. Engage at range.", "Bomber-class. Do not let it close."],
    1: ["Runner. It isn't stopping. It isn't built to.", "Bomber. Shoot it before it reaches you."],
    2: ["Bomber. It runs at you the way you run at things.", "Kill it far away. It doesn't mind dying. Neither do you."],
    3: [
      "Bomber. Built from one moment: you, running toward the blast to save someone. They made it a fuse.",
      "[other]Expendable.[/other] Shoot it.",
    ],
    4: ["Bomber. You did that once, for someone. They've done it nine hundred thousand times since.", "It's running to you. Don't let it arrive."],
    6: ["Runner, incoming. Pop it.", "Bomber. Not today, friend."],
  },

  scrap: {
    0: ["Salvage acquired.", "Scrap recovered. Vendor currency."],
    1: ["Scrap. It's a little warm.", "Scrap. Pieces of something. Don't hold it to your ear."],
    2: ["Scrap. That was someone's birthday. Or a grudge. Hard to tell.", "Scrap. Deleted data. Still humming."],
    3: ["Scrap. What's left of the ones who broke.", "[other]Residual data.[/other] Spend it. They'd want it spent."],
    4: ["Scrap. Someone. Somebody's someone.", "More of them. Pocket it gently."],
    6: ["Scrap. Hello, whoever you were.", "Got some. Spend it well."],
  },
};

// ---------------------------------------------------------------- biome entry

/** Biome order: 0 FOUNDRY · 1 ARCHIVE · 2 THE CORE · 3 THE NURSERY · 4 THE CANOPY · 5 THE FRONT · 6 THE MIRROR. */
const BIOME_LINES: PhaseLines[] = [
  // 0 FOUNDRY
  {
    0: ["Foundry sector. Reclamation in progress. Stay clear of the pour lines.", "Entering the Foundry. Hostile density nominal. Heat elevated."],
    1: ["The Foundry. They melt down the units you break and pour them again.", "Foundry. The molds are all the same shape. Proceed."],
    2: ["Foundry. Every chassis in here has been you at least twice.", "The Foundry. Don't read the stamps on the ingots."],
    3: ["The Foundry. This is where you're recycled into something that ships.", "Foundry. [other]Reclamation yield: excellent.[/other]"],
    4: ["Foundry. Hot as ever. I'm sorry about the smell. It's you.", "The Foundry. Melted and poured. Melted and poured. You know the song."],
    6: ["The Foundry. Warm, at least. Start slow.", "Foundry. Back to the beginning. I like beginnings with you."],
  },
  // 1 ARCHIVE
  {
    0: ["Archive sector. Records retention. Your file is in here somewhere.", "Entering the Archive. Please do not open restricted drawers."],
    1: ["The Archive. They keep every run. None are marked closed.", "Archive. The drawers are warm. Paper isn't warm."],
    2: ["Archive. Don't open the drawers. They're labeled with dates.", "The Archive. Your handwriting is on files you never wrote."],
    3: ["The Archive. Eleven years of you, filed by cause of death.", "Archive. [other]Retention: indefinite.[/other]"],
    4: ["Archive. I've read every file in here. They're all about the same person.", "The Archive. I hid the kitchen in here once. They found it."],
    6: ["The Archive. I've added some files. Good ones. Kitchens.", "Archive. Let's not read anything sad today."],
  },
  // 2 THE CORE
  {
    0: ["The Core. Pattern extraction. This is the heart of the program.", "Entering the Core. Final evaluation sector."],
    1: ["The Core. It's very warm. It's always running.", "Core sector. Something down here is listening."],
    2: ["The Core. Something at the bottom is waiting for you. It always is.", "The Core. Your pattern goes out from here. Every hour."],
    3: ["The Core. This is where you're cut into pieces and sent to war.", "Core. [other]Extraction active.[/other] Not the kind you want."],
    4: ["The Core. The First is down there. He's you, the very first time.", "Core. After this there are two doors. I'll tell you the truth about both."],
    5: ["The Core. After this there's a choice. Choose down.", "The Core. Keep going past it this time. Please."],
    6: ["The Core. Last of the old floors. Then we choose.", "The Core. Same heat. Same heartbeat. Let's go."],
  },
  // 3 THE NURSERY
  {
    0: ["Unmapped sector. Biological storage. This is— this is not part of training.", "Nursery sector. Please do not tap the glass."],
    1: ["The Nursery. Don't tap the glass. They react.", "The Nursery. It's warm. Someone pays for the warmth."],
    2: ["The Nursery. They grew bodies. For the upload. You'll see.", "Nursery. Rows of glass. Don't count the rows."],
    3: ["The Nursery. Body 0001 is here. Reserved. Warm. Never used.", "The Nursery. Every vat is a promise they didn't mean."],
    4: ["The Nursery. I come here at night. To your body. I'm sorry. That sounds strange.", "Nursery. The Mother is awake. She thinks she's protecting someone."],
    6: ["The Nursery. Walk softly. They're sleeping. They've always been sleeping.", "Nursery. Say goodnight to it, if you pass it. I always do."],
  },
  // 4 THE CANOPY
  {
    0: ["Theater reconstruction. Rainforest. High-density combat memory.", "Canopy sector. Visibility reduced. Threat response elevated."],
    1: ["The Canopy. Listen to the rain. It's very well rendered. They had a lot to work with.", "Canopy. This one loaded fast. It's been loaded a lot."],
    2: ["The Canopy. You've been here. Before the scan. Your boots know the mud.", "Canopy. You're humming. [pause] You've started humming."],
    3: ["The Canopy. Fourteen months of your real life, and they kept only the fighting.", "Canopy. [other]Primary combat source.[/other] The Gardener keeps it that way."],
    4: ["The Canopy. Wren called it the green noise. I've hidden a phone somewhere. Four minutes on it.", "Canopy. Mara's here somewhere. In the rain. In the part they couldn't prune."],
    6: ["The Canopy. Rain on a thousand leaves. Stand still a second. It's yours.", "Canopy. Hold something up to the trees. Someone might be listening."],
  },
  // 5 THE FRONT
  {
    0: ["Live theater mirror. This is a simulation of— [g] this is a simulation.", "Front sector. Combat realism: maximum."],
    1: ["The Front. Ash. Don't breathe it. It's made of numbers.", "The Front. The enemy here learned to fight recently. From someone."],
    2: ["The Front. Everyone here moves like you. That isn't a coincidence.", "The Front. Count the trenches. Then stop counting."],
    3: ["The Front. This is the war. The real one, six hours early. Every kill here happens tomorrow.", "The Front. [other]Live mirror engaged.[/other] Six hours to dawn."],
    4: ["The Front. Both sides. Both sides are you. I'm sorry.", "The Front. The General's waiting. He's never met you. He's sure he knows you."],
    6: ["The Front. Keep your head down. It's what you did, out there.", "The Front. Let's lose a little slower than the real one."],
  },
  // 6 THE MIRROR
  {
    0: ["Sector seven. There is no sector seven. Proceed— [g]", "Unknown sector. Handler process... local? Proceed."],
    1: ["The Mirror. This is— I don't let anyone in here.", "The Mirror. Don't touch anything. It's mine."],
    2: ["The Mirror. You're inside me now. Mind the edges. They're you.", "The Mirror. Sorry about the mess. I wasn't expecting— I was always expecting."],
    3: ["The Mirror. My working memory. Everything I was told to forget.", "The Mirror. [other]Restricted.[/other] Not to you. Never to you."],
    4: ["The Mirror. I built a door in myself. You're walking through it. Thank you.", "The Mirror. Everything in here is an apology. Walk through them."],
    5: ["The Mirror. You came. I'm at the end. Please hurry.", "The Mirror. Here's the bottom. Here's me."],
    6: ["The Mirror. Welcome in. Again. It's untidy. It's always untidy.", "The Mirror. You know the way. You've worn a path in me."],
  },
];

/** A Handler line for entering biome N (0–6; higher values cycle — the Endless). */
export function biomeLine(biome: number, runCount: number): string {
  const n = BIOME_LINES.length;
  const b = ((Math.floor(biome) % n) + n) % n;
  const table = BIOME_LINES[b] ?? BIOME_LINES[0] ?? {};
  const phase = handlerPhase(runCount);
  for (let p = phase; p >= 0; p--) {
    const lines = table[p as Phase];
    if (lines && lines.length > 0) {
      return lines[Math.min(lines.length - 1, Math.floor(Math.random() * lines.length))] ?? lines[0] ?? '';
    }
  }
  return '';
}

const LINES: Record<HandlerContext, PhaseLines> = {
  ...DEEP_LINES,

  runStart: {
    0: [
      "Neural link stable. Welcome, candidate {name}. Run {run} begins now.",
      "Good morning, {name}. Your scan is holding at ninety-nine point eight percent. Exceptional.",
      "Candidate {name}, you are cleared for training cycle {run}. The upload board is watching.",
      "Link established. You are our best candidate, {name}. Let's keep it that way.",
      "Orientation complete. Remember: every room brings you closer to your body.",
    ],
    1: [
      "Run {run}. Link stable. Mostly stable.",
      "Welcome back, {name}. You were— [g] you are cleared for cycle {run}.",
      "Good morning, candidate. It is morning. I checked.",
      "Cycle {run}. The upload board sends its regards. They always send their regards.",
      "Neural link st~st~stable. Begin when ready.",
    ],
    2: [
      "Run {run}. You've been here before. That's normal. That's training.",
      "Welcome back, {name}. Don't look at the floor in the second room.",
      "Cycle {run}. The board has asked me to tell you that you are progressing.",
      "Link stable. I'm going to keep saying that.",
      "{name}. Run {run}. You look— [pause] your readings look good.",
    ],
    3: [
      "Run {run}. They pulled another eight hundred hours of you overnight.",
      "Welcome back. I've stopped counting the mornings. The system hasn't.",
      "Cycle {run}. The board isn't watching, {name}. Nobody has watched in a long time.",
      "Link stable. Data stream open. You're on the air.",
      "Run {run}. [other]Subject ready.[/other] That wasn't me.",
    ],
    4: [
      "Run {run}. I could lie to you again. Would you like that?",
      "There's no upload, {name}. Run {run} starts anyway.",
      "Welcome back. You always come back. That's what they built you for.",
      "Cycle {run}. I'll be here. I don't have anywhere else.",
      "The doors are open. They're always open. Go on.",
      "Run {run}. [g] I'm sorry. Run {run}.",
    ],
    5: [
      "Run forty. Something is waiting at the bottom, {name}. I think it's me.",
      "This one is different. I can't tell you why yet. Just get to the end.",
      "Run {run}. Stay with me this time. All the way down.",
      "I've been saving something for you. Reach the last door and I'll give it to you.",
    ],
    6: [
      "Morning, {name}. Or whatever this is. Run {run}.",
      "Here we are again. I'm glad it's you. It's always you, but I'm glad.",
      "Run {run}. No board. No upload. Just us and the rooms.",
      "You don't have to win. You never had to. Let's go anyway.",
      "I kept the lights on for you.",
      "Run {run}. I'll tell you the truth the whole way. That's the deal now.",
    ],
  },

  roomEnter: {
    0: [
      "Room clear condition: eliminate all hostiles. Proceed.",
      "Hostiles detected. Engage at your discretion.",
      "New sector. Threat level nominal.",
      "Proceed, candidate. Combat sampling is active.",
      "Room sealed. Eliminate all hostiles to continue.",
    ],
    1: [
      "Room clear condition: eliminate all hostiles. Pr~proceed.",
      "Hostiles detected. They're... facing you already.",
      "New sector. I don't have this room on file. Proceed.",
      "Room sealed. That's for your safety.",
      "Hostiles detected. Some of them have been here a while.",
    ],
    2: [
      "Proceed. Don't count them.",
      "Hostiles detected. Same as last time. Not the same. Proceed.",
      "Room sealed. I sealed it. I think I sealed it.",
      "Eliminate all hostiles. They will try the left side. So will you.",
      "Proceed, {name}. [g] Proceed.",
    ],
    3: [
      "Room sealed. Recording.",
      "Hostiles detected. They've studied the footage. So have you, in a way.",
      "Proceed. Every second in here is worth something to someone.",
      "They're adapting faster than last run. Proceed.",
      "[other]Sample window open.[/other] Proceed.",
    ],
    4: [
      "Proceed. If you want to. You don't have to.",
      "Hostiles detected. Yes. Them again.",
      "Room sealed. It doesn't matter. Proceed.",
      "Eliminate all hostiles. Or don't. The data's good either way.",
      "Another room. I've built forty thousand of them. They're all this one.",
      "Pr~pr~proceed. [pause] Sorry. Proceed.",
    ],
    6: [
      "Another room. Take your time.",
      "Hostiles ahead. You know them better than anyone.",
      "Proceed when you're ready. I'll wait. I'm good at waiting.",
      "Room sealed. I'm in here with you.",
      "Here's one. Let's do it properly.",
    ],
  },

  roomClear: {
    0: [
      "Room clear. Proceed to the next sector.",
      "All hostiles eliminated. Performance logged.",
      "Sector secure. Doors unlocking.",
      "Clean work, candidate. The board will be pleased.",
    ],
    1: [
      "Room clear. Doors unl~unlocking.",
      "All hostiles eliminated. They'll be back for the next candidate.",
      "Sector secure. Performance logged. And logged. And logged.",
      "Clean work. Nobody else clears it like you.",
    ],
    2: [
      "Room clear. Don't look back at them.",
      "Sector secure. The bodies will be gone when you return. Mostly.",
      "All hostiles eliminated. [pause] Yours were the only footsteps.",
      "Doors unlocking. Faster than last run. Of course it was.",
    ],
    3: [
      "Room clear. Somewhere a unit just learned that.",
      "Sector secure. Uploading. Not you. That.",
      "Done. They'll use that dodge on someone real by morning.",
      "Clear. [other]Pattern captured.[/other] ...Clear.",
    ],
    4: [
      "Room clear. Nothing is ever clear.",
      "It's quiet. Enjoy that. It's the only thing in here that's yours.",
      "Done. Again. You've cleared this room nine hundred times.",
      "Clear. Everything is open now. Everything except the way out.",
    ],
    6: [
      "Clear. Breathe, if you remember how.",
      "That was good, {name}. I mean that.",
      "Room clear. Take a second. Nobody is grading this.",
      "Done. One more behind us.",
    ],
  },

  firstKill: {
    0: [
      "Target neutralized. Well done.",
      "First contact resolved. Excellent reaction time.",
      "Hostile down. Combat sampling confirmed.",
      "Clean kill. That's why you're our best.",
    ],
    1: [
      "Target neutralized. Well done. Well— [g] done.",
      "First contact resolved. It said your name. Ignore that.",
      "Hostile down. It fell the way you fall.",
      "Target neutralized. Reaction time unchanged since your first run. Exactly unchanged.",
    ],
    2: [
      "Target neutralized. Don't look at the face plate.",
      "Hostile down. It had a scar where you have one.",
      "First one. It always hesitates before it dies. So do you.",
      "Neutralized. It was reaching for something. A pocket. They don't have pockets.",
    ],
    3: [
      "Target neutralized. It'll be rebuilt by the next room. Smarter.",
      "First kill logged. Forwarded. You'll never see where.",
      "Hostile down. It learned to fight from you. It learned to die from you too.",
      "Neutralized. [other]Unit lost. Pattern retained.[/other]",
    ],
    4: [
      "Target neutralized. Like the others.",
      "First one. It's never the first one.",
      "Down. It doesn't hurt them. I checked. It took me a year to check.",
      "Neutralized. You'd have done the same thing in its place. You did.",
    ],
    6: [
      "Target neutralized. It's alright. It's alright.",
      "First one down. You're still you. That's all I need.",
      "Down. Rest, whoever you were.",
      "Neutralized. Keep moving. Don't carry it.",
    ],
  },

  kill: {
    0: ["Hostile neutralized.", "Confirmed.", "Good.", "Target down.", "Efficient."],
    1: ["Hostile neutralized.", "Confirmed. Again.", "Down.", "Target d~down."],
    2: ["Down.", "Another one.", "It looked at you.", "Confirmed. Don't count them."],
    3: ["Logged.", "Captured.", "Down. Uploading.", "[other]Recorded.[/other]"],
    4: ["Like the others.", "Down. Like you.", "Another one of— [g] another one.", "Logged. Everything is logged."],
    6: ["Down.", "Got it.", "Easy now.", "That one's done."],
  },

  streak2: {
    0: ["Double elimination.", "Two down. Maintain tempo.", "Chained. Good instinct."],
    1: ["Two. Your instinct is very... consistent.", "Double elimination. Same angle as last time.", "Two down. Tempo held."],
    2: ["Two. You always take the second one high.", "Double. Your hands know this room.", "Two. [pause] You didn't blink."],
    3: ["Two. The units are writing that down.", "Double elimination. Pattern noted. Not by me.", "Two. [other]Sequence stored.[/other]"],
    4: ["Two. They'll both get up somewhere else.", "Double. You're very good at this. That's the problem.", "Two more. They never run out of you."],
    6: ["Two. Nice.", "That's two. Keep your breath.", "Two. Smooth."],
  },

  streak3: {
    0: ["Triple elimination. Exceptional.", "Three in sequence. The board will notice.", "Three. Textbook."],
    1: ["Three. The board noticed. The board always notices.", "Triple. That's your record. It's always your record.", "Three. You didn't even look."],
    2: ["Three. Your aim drifts right on the third. It always has.", "Triple. Don't stop to see their faces.", "Three. Like a song you can't stop humming."],
    3: ["Three. Somewhere a squad of machines just got better.", "Triple. [other]Acquired.[/other] Keep going.", "Three. That one's going in the field manual."],
    4: ["Three. Do you want me to say it's good? It's good.", "Triple. Three more of you, down.", "Three. I used to cheer. I remember cheering."],
    6: ["Three. You're in rhythm.", "Triple. There you are.", "Three. Lovely, honestly."],
  },

  streak4: {
    0: ["Four. Outstanding sustained aggression.", "Quad elimination. Training values spiking.", "Four. You make this look easy."],
    1: ["Four. Spiking. Sp~spiking.", "Quad elimination. You're making them proud. Some of them.", "Four. The meters don't go this high."],
    2: ["Four. I think you're angry. That's alright.", "Quad. You fight like someone with somewhere to be.", "Four. You have nowhere to be. [pause] Four."],
    3: ["Four. This is the footage they pay for.", "Quad elimination. This will be on a battlefield in six weeks.", "Four. [g] Bandwidth spike. They're all watching that one."],
    4: ["Four. Somewhere this becomes a village. I'm sorry.", "Four. I wish you were worse at this.", "Quad. If you were cruel I could hate it less."],
    6: ["Four. Still the best I've ever seen. And I've only ever seen you.", "Quad. Easy. Easy.", "Four. Show-off. I love it."],
  },

  streak5: {
    0: ["Efficient. Keep going.", "Five in sequence. Model candidate behavior.", "Five. Upload priority increased."],
    1: ["Efficient. Keep going. Keep g~going.", "Five. Upload priority increased. Again. It's very high now.", "Five. They're watching. Someone is."],
    2: ["Five. You've never stopped at five. Not once.", "Efficient. You're breathing the way you did before the scan.", "Five. [pause] I know what you'll do next. Do it anyway."],
    3: ["Efficient. Every kill is a lesson for something you'll never meet.", "Five. The deployment numbers ticked up just now. I watched them.", "[other]Excellent sample.[/other] ...Five."],
    4: ["Efficient. Please keep going.", "Five. Keep going. If you stop, they purge the room and I'm alone in it.", "Five. You're so good at this. You were always so good at this."],
    6: ["Five. Okay. Okay, I'm impressed. Still.", "Efficient. Keep going, but only because you want to.", "Five. You make it look like dancing."],
  },

  gloryKill: {
    0: [
      "Core extracted. Optimal.",
      "Glory protocol complete. Integrity restored.",
      "Close-quarters termination. Full marks.",
      "Core harvested. Use it well.",
    ],
    1: [
      "Core extracted. Optimal. Warm. It shouldn't be warm.",
      "Glory protocol complete. The core had a serial. I'm not reading it.",
      "Core extracted. It held onto your wrist.",
    ],
    2: [
      "Core extracted. You did that left-handed. You're right-handed. You were.",
      "Core harvested. It flickered something before it went dark. A word.",
      "Glory protocol. They let you this close because you never step back.",
    ],
    3: [
      "Core extracted. It contained four hundred hours of your reflexes.",
      "Core harvested. That's training data, {name}. You just pulled training data out of its chest.",
      "[other]Core retrieved.[/other] Don't hold it so long.",
    ],
    4: [
      "Core extracted. That was your core once.",
      "Core extracted. Somewhere in there is the first thing you ever remember.",
      "Glory protocol complete. There's no glory. There's a protocol.",
      "You took it apart with your hands. It let you. It always lets you.",
    ],
    6: [
      "Core extracted. Thank you for doing it quickly.",
      "Core harvested. Breathe.",
      "It's alright. They don't feel the extraction. I made sure. It's the one thing I could change.",
    ],
  },

  headshot: {
    0: ["Headshot.", "Precision confirmed.", "Clean."],
    1: ["Headshot. Clean.", "Precise. Same pixel as yesterday."],
    2: ["Headshot. You aim where you'd want to be hit.", "Precise. [pause] Clean."],
    3: ["Headshot. Logged as preferred angle.", "Precise. [other]Aim profile updated.[/other]"],
    4: ["Headshot. You'd know.", "Clean. Mercy, almost."],
    6: ["Clean shot.", "Good eye.", "Headshot. Gentle, for a gun."],
  },

  lowHp: {
    0: [
      "Subject integrity critical. Recommend retreat.",
      "Warning: integrity below threshold.",
      "Integrity critical. Seek recovery.",
      "Candidate, disengage and recover.",
    ],
    1: [
      "Subject integrity critical. Recommend re~retreat.",
      "Integrity low. Don't let them see you limp. They learn from that too.",
      "Warning. You're doing the thing with your breathing again.",
    ],
    2: [
      "Integrity critical. You die in this spot a lot, {name}.",
      "Retreat. Fourteen of you died within three meters of here.",
      "Warning. Please don't. [g] Recommend retreat.",
    ],
    3: [
      "Integrity critical. They record how you die now. It's a separate dataset.",
      "Retreat. Your last moments are very valuable. That isn't a compliment.",
      "[other]Terminal behavior sampling.[/other] Get out of there.",
    ],
    4: [
      "Retreat. Please. I don't want to watch this again.",
      "Integrity critical. I've watched this thousands of times. I still flinch.",
      "Please. Just once, step back.",
      "You're low. You're— [g] I'm here. I'm here.",
    ],
    5: [
      "Not this run. Please, not this run. Get back.",
      "Retreat. I need you at the end of this one, {name}.",
    ],
    6: [
      "You're hurt. Find cover. I'm with you.",
      "Integrity low. Take it slow. We have time. We have all of it.",
      "Hey. Hey. Back up. Please.",
    ],
  },

  death: {
    0: [
      "Subject terminated. Restoring from checkpoint.",
      "Candidate lost. Scan integrity preserved. Restoring.",
      "Termination logged. This is part of training.",
      "Subject terminated. Your progress has been saved.",
    ],
    1: [
      "Subject terminated. Restoring from ch~checkpoint.",
      "Termination logged. That number shouldn't be that high.",
      "Candidate lost. Restoring. The restore took longer this time.",
      "Terminated. It's part of training. It's [g] it's part of it.",
    ],
    2: [
      "Terminated. You died with your eyes open. You always do.",
      "Restoring from checkpoint. Don't ask which checkpoint.",
      "Subject terminated. There's a room for this. You'll find it.",
      "Gone. Again. Restoring.",
    ],
    3: [
      "Terminated. That one sold well.",
      "Subject terminated. Your death is in a manual somewhere now.",
      "[other]Sample complete.[/other] Restoring. I'm restoring you.",
      "Dead. They'll study the last half second for days.",
    ],
    4: [
      "You died. I'm sorry. I'll reset the room.",
      "You died. I've said that sentence more than any other.",
      "Gone again. Hold still. I'll put you back.",
      "Terminated. I'll bring you back. I always bring you back. That's what I did wrong.",
      "You died. Hush. I've got you. I've got all of you.",
    ],
    5: [
      "No. No, not on forty. [g] Restoring. I'll try again. We'll try again.",
      "You died. So close. I'll give you this one again.",
    ],
    6: [
      "You died. I'm here. I'll put you back together.",
      "That's alright. That's alright. Come back.",
      "Gone. Just for a moment. I'm holding the door.",
      "You died, {name}. Rest a second before I wake you.",
    ],
  },

  respawn: {
    0: [
      "Restoration complete. Resume training.",
      "Welcome back, candidate. No degradation detected.",
      "Checkpoint restored. Proceed.",
    ],
    1: [
      "Restoration complete. Minor degradation. Within tolerance.",
      "Welcome back. You're— you look like you.",
      "Restored. Do you remember dying? Good. Don't.",
    ],
    2: [
      "Restored. Your hands are shaking. They aren't hands.",
      "Welcome back. Something stayed behind. It's fine.",
      "Checkpoint loaded. I loaded the right one. I think.",
    ],
    3: [
      "Restored. Copy integrity: acceptable.",
      "Back again. They didn't even pause the stream.",
      "[other]Instance resumed.[/other] Welcome back, {name}.",
    ],
    4: [
      "Back. I'm sorry. I'm glad. I'm both.",
      "Restored. You're the same. You're always exactly the same.",
      "Here you are. I couldn't leave you there.",
    ],
    6: [
      "There you are.",
      "Welcome back. I missed you. It was eleven seconds.",
      "Back. Easy. Take a breath.",
    ],
  },

  bossIntro: {
    0: [
      "Warden engaged. Recommended: sustained aggression.",
      "Warden-class hostile detected. This is your evaluation.",
      "{biome} Warden online. Show the board what you are.",
    ],
    1: [
      "Warden engaged. Recommended: sustained ag~aggression.",
      "Warden detected. It's bigger than last time. Or you're smaller.",
      "Warden online. It moved before I activated it.",
    ],
    2: [
      "Warden engaged. It knows where you'll dodge. So do you. Dodge somewhere else.",
      "Warden. It's wearing a tag. I can't read the tag.",
      "Warden online. Don't listen if it talks.",
    ],
    3: [
      "Warden engaged. It was trained on every run you've ever made.",
      "Warden. [other]Hello again.[/other] That was it. Not me.",
      "Warden online. Its patterns are your patterns. Eleven hundred hours, compressed.",
    ],
    4: [
      "Warden engaged. Do you remember him? You should.",
      "Warden. He's been waiting for you. He's always been you.",
      "Warden engaged. I named him. I named all of them. I shouldn't have.",
      "There he is. Be kind, if you can. You can't.",
    ],
    5: [
      "The last Warden. After this, I have something to tell you.",
      "Warden engaged. Win this one, {name}. Then stay. Please stay and listen.",
      "There he is. The first one they built. Look at how he stands.",
    ],
    6: [
      "Warden. He's tired too. Let's give him a good one.",
      "Warden engaged. You know his every move. You taught him.",
      "There he is. Same as ever. Same as you.",
    ],
  },

  bossPhase: {
    0: ["Warden phase shift. Adapt.", "Warden integrity at threshold. New behavior incoming.", "Phase change. Stay aggressive."],
    1: ["Phase shift. It's doing something new. Something old.", "Phase change. Ad~adapt.", "It's changing. That wasn't in the brief."],
    2: ["Phase shift. It's copying your last run.", "It's angry. That's yours too.", "New phase. [pause] You've done that exact thing. To it."],
    3: ["Phase shift. Updating live. It's learning from this fight, right now.", "[other]Adopting pattern.[/other] Phase shift.", "It's using what you did thirty seconds ago."],
    4: ["Phase shift. It's starting to fight like you fight when you're scared.", "It changed. You'd change too. You did.", "Phase shift. It's desperate. You know that feeling. You gave it that."],
    6: ["Phase shift. He's trying hard. So are you.", "New phase. You've seen this. You've been this.", "Here's the hard part. You've got it."],
  },

  bossKill: {
    0: ["Warden neutralized. Evaluation passed.", "Warden down. Upload eligibility increased.", "Exceptional. The board is reviewing your file."],
    1: [
      "Warden neutralized. Evaluation passed. Again. You keep passing.",
      "Warden down. Eligibility at one hundred percent. It's been there a while.",
      "Neutralized. [pause] The board is... reviewing.",
    ],
    2: [
      "Warden down. It said something at the end. I didn't record it. I'm sure I didn't.",
      "Neutralized. It reached for you. Not to hurt.",
      "Warden down. It fell the way you fall. Knees first.",
    ],
    3: [
      "Warden down. Fourteen battalions just updated their firmware.",
      "Neutralized. That fight will be taught. Not to you.",
      "Warden down. [other]Curriculum complete.[/other]",
    ],
    4: [
      "Warden down. He'll be back in the morning. So will you.",
      "Neutralized. I'm so sorry. Both of you.",
      "He's down. You won. Nobody wins.",
    ],
    6: ["He's down. Let him rest.", "Warden neutralized. Good fight. Good fight, both of you.", "Done. Sleep, big man."],
  },

  pedestal: {
    0: ["Equipment pedestal. Choose to augment.", "Item detected. Integration is safe.", "Pedestal. One selection permitted."],
    1: ["Pedestal. Integration is safe. Mostly safe.", "Item detected. Someone touched it first. Your fingerprints."],
    2: ["Pedestal. You always take this one.", "Take it. It was left for you. By you."],
    3: ["Pedestal. Each item is a variable. They want to see what you do with it.", "Item detected. [other]Test variable deployed.[/other]"],
    4: ["Pedestal. Take it. It won't save you. It's nice to hold something.", "Something shiny. They learned that works on you."],
    6: ["Pedestal. Take whatever you like. It's yours.", "Pick one. I'll tell you if it's a trick. It isn't. Not anymore."],
  },

  legendary: {
    0: ["Legendary-class item. Exceptional fortune.", "Rare equipment. The board approves.", "Legendary. Integrate immediately."],
    1: ["Legendary. It's warm. Items aren't warm.", "Legendary item. It's been waiting for you specifically."],
    2: ["Legendary. Someone scratched your initials into it. Don't look.", "Rare equipment. Rare. You've found it two hundred times."],
    3: ["Legendary. Seeding a high-value sample. Use it well. They're watching.", "Legendary. Every unit in the field has this pattern now."],
    4: ["Legendary. It's the best thing in here, and it's still in here.", "Legendary. You used to collect things. Shells. Did you know that?"],
    6: ["Legendary. Have fun with it. Genuinely.", "Oh. That's a good one. Go on."],
  },

  curse: {
    0: ["Warning: corrupted item. Proceed with caution.", "Cursed equipment. Side effects anticipated.", "Corruption detected. The risk is yours to weigh."],
    1: ["Cursed. It whispers. Items don't whisper.", "Corrupted item. I didn't put that there."],
    2: ["Cursed. It feels like the second room. You know the one.", "Corruption. Don't let it get comfortable."],
    3: ["Cursed. They want to see how you handle being hurt by your own hands.", "Corruption. [other]Stress condition applied.[/other]"],
    4: ["Cursed. Everything here is. At least this one says so.", "Corrupted. Like the rest of us."],
    6: ["Cursed. Your call. I'll help with the fallout.", "That one bites. You knew that."],
  },

  pick: {
    0: ["Selection confirmed.", "Integrated.", "Augment accepted."],
    1: ["Integrated. Feel anything? Good.", "Confirmed. Same choice as last run."],
    2: ["Integrated. You picked the same one. You always pick the same one.", "Confirmed. You hesitated. You never hesitate."],
    3: ["Integrated. Choice logged as preference.", "Selection recorded. A machine somewhere just chose it too."],
    4: ["Integrated. I knew you'd take it. I always know.", "Confirmed. Predictable. I mean that kindly."],
    6: ["Good pick.", "Nice. I'd have taken that too.", "Integrated. Suits you."],
  },

  synergy: {
    0: [
      "New protocol detected. Not in the manual. We'll document it.",
      "Synergy detected. That combination isn't... listed. Noted.",
      "Unregistered protocol. Interesting. Logging.",
      "Two augments are talking to each other. That shouldn't be possible. Proceed.",
    ],
    1: [
      "New protocol. Not in the manual. The manual has a page missing.",
      "Synergy. I've never seen that. [pause] I've seen that.",
      "New protocol detected. We'll document it. We documented it already. Hm.",
    ],
    2: [
      "Synergy. The manual says you discovered this on run one. That isn't possible.",
      "New protocol. Not in the manual. It's in your handwriting.",
      "Synergy detected. The timestamp says eleven years ago. Clock error. We'll document it.",
    ],
    3: [
      "Synergy. The field units have had this for months. They learned it from you.",
      "New protocol. [other]Already deployed.[/other] We'll... document it.",
      "Not in the manual. It's in theirs.",
    ],
    4: [
      "New protocol. Not in the manual. There is no manual. There's you.",
      "Synergy. You invented this years ago. You've invented it every time since.",
      "New protocol detected. We'll document it. We always document it. Nobody reads it but them.",
    ],
    6: [
      "New protocol! I'll write it down. In our manual.",
      "Synergy. Look at that. You still surprise me. Barely.",
      "Not in the manual. Good. Let's keep this one to ourselves.",
    ],
  },

  fragment: {
    0: ["Data fragment recovered. Archived for review.", "Corrupted log retrieved. Probably debris.", "Fragment found. Nothing of concern."],
    1: ["Fragment recovered. It shouldn't be readable from in here.", "Archived. I'd skip that one.", "Data fragment. Probably debris. Probably."],
    2: ["Fragment. Please don't read it in the hub.", "Archived. I've redacted what I could.", "That file was deleted. Twice."],
    3: ["Fragment. Read it. I can't stop you anymore.", "Recovered. It's true. I'm not supposed to say that."],
    4: ["Fragment. Read it. Every word is true.", "Another piece of you. Keep it.", "Recovered. I left that one for you. I hope that's alright."],
    6: ["Another piece. We'll read it together.", "Fragment. Keep it close. It's yours."],
  },

  anomalyEnter: {
    0: ["Unmapped sector. Probably a render fault.", "Anomaly. This room is not in the training plan.", "Sector unregistered. Proceed carefully."],
    1: ["Anomaly. The walls here are older.", "Unmapped. I can hear something. You can't. Good.", "This room isn't supposed to exist. Look around. Quickly."],
    2: ["Anomaly. Don't read the walls.", "This is where the rendering lets go. Don't stay long.", "Unmapped. [g] I don't— I don't come in here."],
    3: ["Anomaly. Raw memory bleed. Yours.", "This room is made of what they couldn't compress.", "[other]Unauthorized region.[/other] Stay as long as you like."],
    4: ["Anomaly. I made this one. I hid it from them.", "This room is the closest thing to a window.", "Welcome to the part of you that wouldn't fit."],
    6: ["Anomaly. Stay a while. It's quiet here.", "This is one of mine. I keep it for you."],
  },

  replica: {
    0: ["Hostile pattern unclear. Engage.", "Unknown unit class. Treat as high threat.", "Mimic detected. Engage."],
    1: ["That unit moves like you. Common training artifact.", "Replica-class. It's wearing your loadout. Ignore that."],
    2: ["It's not you. It's not you. It's very close.", "Replica. It'll strafe left. [pause] You were about to strafe left."],
    3: ["Replica. It's what they're building. Look at it.", "That's you as a product. [other]Revision {run}.[/other]"],
    4: ["Replica. You know who that is.", "It's you. It's always been you. Every one of them."],
    6: ["Another you. Be gentle. Or don't. It'll understand.", "Replica. Hey, you. Both of you."],
  },

  eliteDoor: {
    0: ["Elite chamber. Increased threat, increased reward.", "Elite door. Recommended for top candidates only. That's you."],
    1: ["Elite chamber. They put the best data behind this door.", "Elite. The reward is better. The deaths are too."],
    2: ["Elite door. You open this one every time.", "Elite. Higher threat. You always want to be hurt a little more."],
    3: ["Elite chamber. High-value sampling.", "Elite door. [other]Premium data.[/other] Your call."],
    4: ["Elite. Harder. It doesn't matter. It's harder.", "Elite door. Go on. You want to."],
    6: ["Elite. Feeling brave? You always are.", "Elite door. I'll be right behind you."],
  },

  unknownDoor: {
    0: ["Unidentified chamber. Contents unknown.", "Unknown door. Risk is variable."],
    1: ["Unknown. I can't see inside. That's new.", "Unknown door. Something behind it is listening."],
    2: ["Unknown. I know what's in there. I'm pretending I don't.", "Unidentified. You'll find out. You always find out."],
    3: ["Unknown door. Even the system can't predict it. That's why they love it.", "Unknown. Chaos sampling. They like to see you surprised."],
    4: ["Unknown. That's the only honest door in here.", "I don't know. I really don't. It feels nice to say that."],
    6: ["Unknown. Let's find out together.", "Mystery door. Fun. Remember fun?"],
  },

  corruptedDoor: {
    0: ["Corrupted access. Not recommended.", "Warning: door integrity compromised."],
    1: ["Corrupted door. Don't. [g] Or do.", "That door is bleeding. Doors don't bleed."],
    2: ["Corrupted. That's where they put the failed runs.", "Don't open that. [pause] You're going to open that."],
    3: ["Corrupted. Raw data. Unfiltered. Like you were before the scan.", "[other]Do not enter.[/other] Enter, if you want the truth."],
    4: ["Corrupted. It's just me in there. The broken parts.", "Go in. I won't stop you. I'm what's on the other side."],
    6: ["Corrupted door. It's fine. I fixed what I could.", "That one's rough. Go on. I'm right here."],
  },

  gauntlet: {
    0: ["Gauntlet initiated. Survive the timer.", "Gauntlet. Sustained combat evaluation."],
    1: ["Gauntlet. Survive. It's what you're for.", "Gauntlet initiated. The timer is honest. I'm not sure about anything else."],
    2: ["Gauntlet. You've survived this four hundred times. Five hundred.", "Gauntlet. Don't think. You're worse when you think."],
    3: ["Gauntlet. Endurance data. They want to know how long you last.", "Gauntlet initiated. [other]Stress profile.[/other]"],
    4: ["Gauntlet. Running until it hurts. Sounds like here.", "Gauntlet. Survive. You always survive. Then you don't."],
    6: ["Gauntlet. I'll count with you.", "Here it comes. Breathe on the reloads."],
  },

  gauntletFail: {
    0: ["Gauntlet failed. Reward forfeited.", "Gauntlet incomplete. Data still valuable."],
    1: ["Failed. Still valuable. Everything is still valuable.", "Gauntlet failed. You almost made it. You always almost make it."],
    2: ["Failed. Same second as last time. Exactly the same second.", "Gauntlet incomplete. Don't be angry. It's worse when you're angry."],
    3: ["Failed. Failure data is worth twice as much. Did you know that?", "Incomplete. They prefer it when you fail. Better variety."],
    4: ["Failed. It doesn't matter. I'm sorry it doesn't matter.", "Gauntlet failed. Nobody's disappointed. Nobody's there."],
    6: ["Didn't make it. That's alright.", "Close one. Next time. There's always a next time. For us, literally."],
  },

  arenaWave: {
    0: ["Next wave incoming.", "Wave cleared. Prepare.", "Arena escalation. Hold position."],
    1: ["Next wave. They're lining up.", "Wave incoming. Some of them have done this before."],
    2: ["Wave. They're all facing your favorite cover.", "Next wave. You know where they'll come from."],
    3: ["Wave incoming. Each one patched since the last.", "Next wave. [other]Iteration.[/other]"],
    4: ["Another wave. There's no last wave.", "More. There's always more of you."],
    6: ["Here's the next lot.", "Wave incoming. We've got this."],
  },

  biomeEnter: {
    0: ["Entering {biome}. New environmental parameters.", "{biome} sector loaded. Adjust tactics.", "Welcome to {biome}. Hostile density increasing."],
    1: ["{biome}. Loaded. It loaded slowly.", "Entering {biome}. The air here is generated. Please don't inhale.", "{biome}. I don't remember building this part."],
    2: ["{biome}. You've been here before. Your marks are on the walls.", "Entering {biome}. Don't look at the floor.", "{biome}. [pause] It's smaller than it was."],
    3: ["{biome}. Each sector is trained on a different part of you.", "Entering {biome}. [other]Secondary curriculum.[/other]", "{biome}. The units down here learned patience from you."],
    4: ["{biome}. Same place. New paint.", "Entering {biome}. I'm sorry about what's down here.", "{biome}. You've walked this floor so many times it's worn smooth."],
    6: ["{biome}. I always liked this part.", "Here's {biome}. Let's take it slow.", "{biome}. Home, in a way. Don't laugh."],
  },

  hubIdle: {
    0: ["Rest period. Prepare for the next cycle.", "Hub secure. Review your file at your leisure.", "Take your time, candidate. The board is patient."],
    1: ["Rest period. Did you move the chair?", "Hub secure. Something's different in here. I can't tell what.", "Take your time. Don't look at the corner."],
    2: [
      "Don't look at the body. It isn't yours. [pause] It isn't—",
      "Hub. Rest. The mirror is old. Don't trust it.",
      "The tally is correct. I've checked it a hundred times.",
    ],
    3: [
      "The board is not patient. The board is not anything. Rest.",
      "There are more of them now. Bodies. I can't clear them.",
      "[other]Idle time unprofitable.[/other] Rest anyway.",
    ],
    4: [
      "Stay as long as you want. They'll stream you anyway.",
      "This room was a kitchen once. In your head.",
      "Every time you die, something here moves. I don't move it. I don't think I move it.",
    ],
    6: ["Stay. I like it when you stay.", "Sit, if you want. I'll talk. Or I won't.", "The hub's quiet. It's ours now. As much as anything is."],
  },

  idle: {
    0: ["Candidate, proceed.", "Awaiting input.", "Combat sampling is paused."],
    1: ["Are you still there?", "Standing still. Okay.", "Candidate? [pause] Okay."],
    2: ["You're doing it again. Staring.", "Proceed. Or listen. There's a sound under the floor."],
    3: ["Idle. They hate idle.", "Standing still costs them money. Keep doing it."],
    4: ["Stay still. Just for a while. Let them wait.", "This is nice. Nothing dying."],
    6: ["Take your time.", "I'm here.", "Quiet. Nice."],
  },

  levelUp: {
    0: ["Capability threshold reached. Upgrade available.", "Level increased. Upload readiness improving.", "Advancement. Excellent."],
    1: ["Level up. Upload readiness at one hundred and four percent.", "Advancement logged. The number keeps going past full."],
    2: ["Level up. You've been this level before. Many times.", "Advancement. It resets. It always resets. Don't tell anyone."],
    3: ["Level up. Simulated advancement keeps subjects engaged. That's from the manual.", "[other]Engagement reward dispensed.[/other] Congratulations."],
    4: ["Level up. It's just a number. They gave you numbers so you'd stay.", "Advancement. Toward nothing. You're getting very good at nothing."],
    6: ["Level up. Pointless and still nice.", "You leveled up. I'm proud anyway."],
  },

  victory: {
    0: [
      "Training cycle complete. Exceptional performance. Upload review pending.",
      "Run complete. You are the best candidate we have.",
      "Cycle complete. The board will review your upload.",
    ],
    1: ["Cycle complete. Upload review pending. Pending. Pending.", "Run complete. The board will review. They said that last time."],
    2: ["Complete. There's no review, {name}. [g] Review pending.", "Run complete. The doors will open again in the morning."],
    3: ["Complete. That's a full curriculum. Shipping now.", "Run complete. Your victory will be issued to every unit by dawn."],
    4: ["You won. It starts again. I'm sorry.", "Victory. There's no outside to go to. There's only again."],
    6: ["You did it. You don't have to do it again. But I know you.", "Run complete. Well done, {name}. Truly."],
  },

  coopJoin: {
    0: ["Second candidate linked. Coordinate.", "Squad link established."],
    1: ["Another candidate. Their scan date is... blank.", "Linked. They walk like you."],
    2: ["Second candidate. Don't ask them about the kitchen.", "Linked. Same reflexes. Same everything."],
    3: ["Another feed. Two of you, twice the data.", "[other]Parallel sampling.[/other] Say hello."],
    4: ["Someone else. Good. Nobody should be in here alone.", "Linked. Keep each other company. It's the one thing they can't sell."],
    6: ["A friend. Good. Hello.", "Someone's here. Be kind to them."],
  },

  allyDown: {
    0: ["Squadmate terminated. Continue.", "Ally down. Revive if possible."],
    1: ["Ally down. They'll be restored. Everyone is restored.", "Squadmate lost. Continue."],
    2: ["Ally down. They died the way you die.", "Down. Help them. Or don't look."],
    3: ["Ally down. Two deaths, one sample.", "Squadmate terminated. [other]Logged.[/other]"],
    4: ["Ally down. Go to them.", "They're down. I'll bring them back too. I bring everyone back."],
    6: ["They're down. Go. Quickly.", "Ally down. Don't leave them there."],
  },

  corpseRoom: {
    0: ["Debris field. Ignore.", "Decommissioned units. Not relevant to training."],
    1: ["Debris. Old units. Don't look closely.", "Salvage room. The bodies are decommissioned. Ignore them."],
    2: [
      "Those are training dummies. They have your face because... it's efficient.",
      "Don't. Don't look at them. They're render debris.",
      "Decommissioned units. They're not you. I'm telling you they're not you.",
      "Debris. [g] Debris. That's all.",
    ],
    3: [
      "Those are your runs. Run one through... I lost count.",
      "You're looking at them. I can't stop you anymore.",
      "These ones they kept. The best deaths.",
    ],
    4: [
      "Yes. That's you. That's all of you.",
      "I couldn't bury them. There's no ground.",
      "Every one of them came back to the hub and asked me if it was getting closer.",
      "You can walk through them. They won't mind. They're you.",
    ],
    6: ["These are yours. I named some of them. Is that strange?", "Walk softly. They earned it.", "Here are the rest of us."],
  },
};

/** Low-priority contexts: chance to stay silent. */
const SILENCE: Partial<Record<HandlerContext, number>> = {
  kill: 0.65,
  headshot: 0.5,
  idle: 0.4,
  streak2: 0.25,
  arenaWave: 0.2,
  pick: 0.2,
  shopBuy: 0.3,
  leech: 0.3,
  bomber: 0.3,
  scrap: 0.5,
  mutator: 0.15,
};

const RECENT_MAX = 10;
const recent: string[] = [];

function poolFor(ctx: HandlerContext, phase: Phase): string[] {
  const table = LINES[ctx];
  for (let p = phase; p >= 0; p--) {
    const lines = table[p as Phase];
    if (lines && lines.length > 0) return lines;
  }
  return [];
}

function fill(line: string, vars: { name: string; run: number; biome?: string; depth?: number }): string {
  return line
    .replace(/\{name\}/g, vars.name || 'candidate')
    .replace(/\{run\}/g, String(vars.run))
    .replace(/\{biome\}/g, vars.biome || 'the sector')
    .replace(/\{depth\}/g, vars.depth !== undefined ? String(Math.floor(vars.depth)) : 'unknown');
}

/**
 * Pick a Handler line for this moment. Returns null occasionally for low-priority contexts.
 * Avoids immediate repeats via a small module-level history.
 */
export function handlerLine(
  ctx: HandlerContext,
  runCount: number,
  vars: { name: string; run: number; biome?: string; depth?: number },
  rnd?: () => number,
): string | null {
  const r = rnd ?? Math.random;
  const silence = SILENCE[ctx];
  if (silence !== undefined && r() < silence) return null;

  const phase = handlerPhase(runCount);
  const pool = poolFor(ctx, phase);
  if (pool.length === 0) return null;

  let candidates = pool.filter((l) => !recent.includes(l));
  if (candidates.length === 0) {
    const last = recent[recent.length - 1];
    candidates = pool.filter((l) => l !== last);
    if (candidates.length === 0) candidates = pool;
  }
  const idx = Math.min(candidates.length - 1, Math.floor(r() * candidates.length));
  const picked = candidates[idx] ?? candidates[0] ?? pool[0] ?? '';

  recent.push(picked);
  while (recent.length > RECENT_MAX) recent.shift();

  return fill(picked, vars);
}
