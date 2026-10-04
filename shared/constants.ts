// ═══════════════════════════════════════════════════════
// ROUGED — tuning constants (GDD §18)
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// DOPAMINE ENGINE (the most important section)
// ═══════════════════════════════════════════════════════
export const HITMARKER_DURATION = 0.08; // s
export const HIT_SOUND_PITCH_RISE = 0.03; // semitones per consecutive hit (scaled x10 in practice for audibility)
export const SCREEN_SHAKE_HIT = 2; // px (internal-res)
export const SCREEN_SHAKE_KILL = 6; // px
export const SLOWMO_GLORY_KILL = 0.12; // s (kill slow-mo)
export const GLORY_SLOWMO = 0.4; // s (glory kill execution)
export const SCORE_POPUP_DURATION = 0.8; // s
export const DAMAGE_NUMBER_DURATION = 0.6; // s
export const KILLFEED_DURATION = 4; // s
export const COMBO_DECAY_TIME = 4; // s

// ═══════════════════════════════════════════════════════
// NETWORK
// ═══════════════════════════════════════════════════════
export const TICK_RATE = 30;
export const TICK_DT = 1 / TICK_RATE;
export const SNAPSHOT_RATE = 20;
export const INTERP_BUFFER_MS = 100;
export const LOCAL_INTERP_BUFFER_MS = 40;
export const PHYSICS_DT = 1 / 60;
export const DEFAULT_PORT = 8787;

// ═══════════════════════════════════════════════════════
// PLAYER
// ═══════════════════════════════════════════════════════
export const PLAYER_HP = 100;
export const PLAYER_MAX_HP = 200;
export const PLAYER_MAX_ARMOR = 100;
export const BASE_SPEED = 9; // m/s
export const JUMP_HEIGHT = 1.2; // m
export const GRAVITY = 24; // m/s²
export const AIR_CONTROL = 0.6;
export const DASH_CHARGES = 1;
export const DASH_COOLDOWN = 2.0; // s
export const DASH_SPEED = 25; // m/s
export const DASH_TIME = 0.16; // s
export const PLAYER_RADIUS = 0.4;
export const PLAYER_HEIGHT = 1.8;
export const EYE_HEIGHT = 1.6;
export const SLIDE_EYE_HEIGHT = 0.85;
export const SLIDE_TIME = 0.9; // s, max power-slide duration (ends earlier if speed bleeds off)
export const SLIDE_BOOST = 1.25; // legacy multiplier (kept for reference)

// ── movement feel (shared/physics.ts) ──
export const SPRINT_MULT = 1.35; // sprint speed = run × this (forward-ish only, no stamina)
export const CROUCH_MULT = 0.5; // crouch-walk speed = run × this
export const CROUCH_HEIGHT = 1.1; // m, crouch / slide collision height (server hitboxes stay full height)
export const CROUCH_EYE_HEIGHT = 1.0;
export const GROUND_ACCEL = 130; // m/s², 0→run in ~70ms
export const GROUND_DECEL = 85; // m/s², release → stop in ~0.1s
export const OVERSPEED_DECAY = 4; // 1/s, excess over max ground speed bleeds exponentially
export const SPRINT_OUT_DECEL = 40; // m/s², sprint → run speed drop (~80ms)
export const OVERSPEED_STEER = 9; // 1/s, steering rate while carrying extra momentum on ground
export const AIR_STEER = 6; // × airControl, 1/s (exponential turn toward the stick, speed-preserving)
export const AIR_ACCEL = 50; // × airControl, m/s² up to run/sprint speed in the air
export const AIR_STRAFE_SPEED = 1.2; // m/s, Quake-style air-strafe wish cap (lets you curve-gain a little)
export const AIR_STRAFE_ACCEL = 40; // m/s²
export const AIR_BRAKE = 22; // m/s², pulling back against your velocity in the air
export const FALL_GRAVITY_MULT = 1.12; // slightly heavier on the way down = snappier arcs
export const COYOTE_TIME = 0.1; // s
export const JUMP_BUFFER = 0.12; // s
export const JUMP_CUT = 0.5; // release early: vy × this
export const JUMP_CUT_MIN = 0.42; // ... but never below jumpV × this
export const BHOP_TIMED_GAIN = 1.05; // freshly-timed hop on landing frame
export const BHOP_CAP_MULT = 1.9; // × run, no hop / strafe gains past this
export const LAND_HARD_SPEED = 17; // m/s impact → brief recovery
export const LAND_RECOVER_TIME = 0.12; // s at 85% max speed
export const SLIDE_MIN_SPEED_MULT = 0.7; // × run to start a slide
export const SLIDE_END_SPEED_MULT = 0.6; // × run, slide ends below this
export const SLIDE_BOOST_ADD = 3.6; // m/s added on a sprint slide (60% on a run slide)
export const SLIDE_BOOST_CAP_MULT = 1.8; // × run, boost never pushes past this
export const SLIDE_COOLDOWN = 0.9; // s between boosted slides (no infinite boost spam)
export const SLIDE_FRICTION = 3; // m/s² at slide start ...
export const SLIDE_FRICTION_RAMP = 20; // ... + this × progress² (downhill-style curve)
export const SLIDE_STEER = 1.6; // rad/s
export const SLIDE_MIN_TIME = 0.12; // s before releasing crouch cancels the slide
export const DASH_EXIT_MULT = 1.0; // × sprint speed kept after a dash
export const DASH_JUMP_KEEP_MULT = 1.9; // × run kept on a dash-jump
export const MANTLE_MIN = 0.3; // m above feet (below: step-up handles it)
export const MANTLE_REACH = 1.6; // m above feet at the moment of contact
export const MANTLE_MAX_HEIGHT = 1.75; // m above the ground you jumped from (chest-high)
export const MANTLE_WAIST = 0.9; // m above feet: always mantleable (catching ledges mid-fall)
export const MANTLE_TIME = 0.14; // s base ...
export const MANTLE_TIME_PER_M = 0.1; // ... + per metre climbed
export const WALL_JUMP_PUSH = 7.5; // m/s off the wall
export const WALLRUN_GRAVITY = 0.12; // × gravity while wall-running
export const STEP_UP = 0.55; // m (ground)
export const STEP_DOWN = 0.4; // m ground snap so stairs/edges don't make you airborne

// ═══════════════════════════════════════════════════════
// COMBAT
// ═══════════════════════════════════════════════════════
export const HEADSHOT_MULT = 2.0;
export const GLORY_THRESHOLD = 0.15; // 15% HP
export const GLORY_RANGE = 3.2; // m
export const GLORY_HEAL = 25; // HP
export const GLORY_ARMOR = 1;
export const STAGGER_TIME = 3.0; // s an enemy stays staggered before recovering
export const RESPAWN_TIME = 2.0; // s
export const SPAWN_PROTECT = 1.5; // s
export const HITBOX_SCALE = 1.2; // capsules 20% larger than the visual
export const AMMO_REGEN = 0.06; // fraction of mag per second
export const AMMO_ON_KILL = 0.12; // fraction of mag on kill

// ═══════════════════════════════════════════════════════
// WEAPONS
// ═══════════════════════════════════════════════════════
export const PULSE_DMG = 22;
export const PULSE_RPM = 480;
export const BREACHER_DMG = 15;
export const BREACHER_PELLETS = 8;
export const BREACHER_RPM = 120;
export const LANCE_MIN_DMG = 60;
export const LANCE_MAX_DMG = 200;
export const LANCE_CHARGE_TIME = 1.1; // s to full
export const RIPPER_DPS = 40;
export const RIPPER_RANGE = 2.6;
export const RELOAD_TIME = { pulse: 1.15, breacher: 0.95, lance: 1.35, ripper: 0.9 } as const; // s

// ═══════════════════════════════════════════════════════
// ENEMIES (Normal difficulty)
// ═══════════════════════════════════════════════════════
export const DRONE_HP = 30;
export const GRUNT_HP = 80;
export const BRUTE_HP = 300;
export const STALKER_HP = 60;
export const SPIDER_HP = 50;
export const LEECH_HP = 40;
export const SENTINEL_HP = 170;
export const BOMBER_HP = 45;
export const MORTAR_HP = 120;
export const BULWARK_HP = 260;
export const WRAITH_HP = 90;
export const REPLICA_HP = 100;
export const WARDEN_HP = 2000;
export const ENEMY_ACCURACY = 0.65;
export const ENEMY_REACTION_MIN = 0.15; // s
export const ENEMY_REACTION_MAX = 0.35; // s
export const ENEMY_FOV = 120; // degrees
export const ENEMY_SIGHT = 30; // m

// ═══════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════
export const ROOMS_PER_BIOME = 5;
export const BOSS_EVERY = 5;
export const BIOMES = 7; // FOUNDRY, ARCHIVE, THE CORE, THE NURSERY, THE CANOPY, THE FRONT, THE MIRROR
export const EXTRACT_FROM = 15; // first EXTRACT / GO DEEPER choice after this many rooms
export const FINAL_ROOM = 35; // THE HANDLER — then the Endless
export const DEPTH_HP_SCALE = 0.06; // per room past EXTRACT_FROM
export const DEPTH_DMG_SCALE = 0.03;

// ═══════════════════════════════════════════════════════
// CO-OP SCALING
// ═══════════════════════════════════════════════════════
export const ENEMY_COUNT_SCALE = 1.4; // per extra player
export const BOSS_HP_SCALE = 1.6; // per extra player
export const COOP_RESPAWN_HP = 0.5;

// ═══════════════════════════════════════════════════════
// STREAK / COMBO
// ═══════════════════════════════════════════════════════
export const COMBO_WINDOW = 4.0; // s
export const DOUBLE_KILL_WINDOW = 3.0; // s
export const TRIPLE_KILL_WINDOW = 5.0; // s
export const MEGA_KILL_WINDOW = 6.0; // s
export const RAMPAGE_THRESHOLD = 5; // kills in window
export const COMBO_MAX = 10;

// ═══════════════════════════════════════════════════════
// POWERUP RARITY (variable reward / gambling)
// ═══════════════════════════════════════════════════════
export const RARITY_COMMON_RATE = 0.55;
export const RARITY_RARE_RATE = 0.28;
export const RARITY_EPIC_RATE = 0.13;
export const RARITY_LEGENDARY_RATE = 0.04;
export const PITY_TIMER = 3; // reward rooms without rare+
export const LEGENDARY_MIN_ROOM = 8;
export const CURSE_MIN_ROOM = 5;

// ═══════════════════════════════════════════════════════
// PROGRESSION
// ═══════════════════════════════════════════════════════
export const XP_PER_KILL = 10;
export const XP_PER_ROOM = 25;
export const XP_PER_BOSS = 200;
export const XP_LEVEL_BASE = 100;
export const XP_LEVEL_CURVE = 1.35; // exponential

// ═══════════════════════════════════════════════════════
// MATCH
// ═══════════════════════════════════════════════════════
export const LOBBY_WAIT = 15; // s
export const MAX_PLAYERS = 4;
export const DEATH_SPECTATE_DELAY = 0; // s

// ═══════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════
export const INTERNAL_HEIGHT = 480;
