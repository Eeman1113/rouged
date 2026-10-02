// ═══════════════════════════════════════════════════════
// ROUGED — Tuning constants (GDD §18)
// ═══════════════════════════════════════════════════════

// DOPAMINE ENGINE
export const HITMARKER_DURATION = 0.08;
export const SCREEN_SHAKE_HIT = 2;
export const SCREEN_SHAKE_KILL = 6;
export const SLOWMO_GLORY_KILL = 0.12;
export const SCORE_POPUP_DURATION = 0.8;
export const KILLFEED_DURATION = 4;
export const COMBO_DECAY_TIME = 4;

// PLAYER
export const PLAYER_HP = 100;
export const PLAYER_MAX_HP = 200;
export const BASE_SPEED = 9;
export const JUMP_VEL = 5.4;
export const AIR_CONTROL = 0.6;
export const DASH_CHARGES = 1;
export const DASH_COOLDOWN = 2.0;
export const DASH_SPEED = 25;
export const DASH_TIME = 0.16;
export const GRAVITY = 18;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_HEIGHT = 1.7;
export const EYE_HEIGHT = 1.6;

// COMBAT
export const HEADSHOT_MULT = 2.0;
export const GLORY_THRESHOLD = 0.15;
export const GLORY_HEAL = 25;
export const GLORY_ARMOR = 1;
export const RESPAWN_TIME = 2.0;
export const SPAWN_PROTECT = 1.5;

// WEAPONS
export const PULSE_DMG = 22;
export const PULSE_RPM = 480;
export const BREACHER_DMG = 15;
export const BREACHER_PELLETS = 8;
export const BREACHER_RPM = 120;
export const LANCE_MIN_DMG = 60;
export const LANCE_MAX_DMG = 200;
export const LANCE_CHARGE_TIME = 1.1;
export const RIPPER_DPS = 40;
export const RIPPER_RANGE = 2.6;

// ENEMIES (Normal)
export const DRONE_HP = 30;
export const GRUNT_HP = 80;
export const BRUTE_HP = 300;
export const STALKER_HP = 60;
export const SPIDER_HP = 50;
export const REPLICA_HP = 100;
export const WARDEN_HP = 2000;

export const ENEMY_ACCURACY = 0.65;
export const ENEMY_REACTION_MIN = 0.15;
export const ENEMY_REACTION_MAX = 0.35;

// ROOMS
export const ROOMS_PER_BIOME = 5;
export const BIOMES = 3;
export const TOTAL_ROOMS = 15;

// STREAK / COMBO
export const COMBO_WINDOW = 4.0;
export const DOUBLE_KILL_WINDOW = 3.0;
export const TRIPLE_KILL_WINDOW = 5.0;
export const MEGA_KILL_WINDOW = 6.0;
export const RAMPAGE_THRESHOLD = 5;

// POWERUP RARITY
export const RARITY_COMMON_RATE = 0.55;
export const RARITY_RARE_RATE = 0.28;
export const RARITY_EPIC_RATE = 0.13;
export const RARITY_LEGENDARY_RATE = 0.04;
export const PITY_TIMER = 3;

// PROGRESSION
export const XP_PER_KILL = 10;
export const XP_PER_ROOM = 25;
export const XP_PER_BOSS = 200;
export const XP_LEVEL_CURVE = 1.35;

export const MAX_AMMO = 100;
