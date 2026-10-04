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
export const SLIDE_EYE_HEIGHT = 1.0;
export const SLIDE_TIME = 0.45;
export const SLIDE_BOOST = 1.25;

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
