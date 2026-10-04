// Wire protocol + shared type vocabulary. Used by client, server sim, and the ws server.

export type EnemyType = 'drone' | 'grunt' | 'brute' | 'stalker' | 'spider' | 'replica' | 'warden' | 'leech' | 'sentinel' | 'bomber' | 'mortar' | 'bulwark' | 'wraith';
export type WeaponId = 'pulse' | 'breacher' | 'lance' | 'ripper';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type DoorKind = 'standard' | 'elite' | 'unknown' | 'corrupted' | 'extract' | 'shop' | 'sanctuary' | 'trial';
export type RoomKind = 'combat' | 'arena' | 'gauntlet' | 'anomaly' | 'boss' | 'hub' | 'shop' | 'sanctuary' | 'trial';
export type Mutator = 'darkness' | 'overclock' | 'lowgrav' | 'bloodmoon' | 'silence' | 'swarm';
export type BiomeId = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type RunState = 'lobby' | 'combat' | 'reward' | 'boss' | 'transition' | 'ended';

export type EnemyAnim = 'idle' | 'move' | 'attack' | 'pain' | 'stagger' | 'charge' | 'dead';

export interface Vec3 { x: number; y: number; z: number }

/** Describes one room. Both sides call generateRoom(desc) to get identical geometry. */
export interface RoomDesc {
  index: number; // 0-based room index within the run (0..14)
  biome: BiomeId;
  kind: RoomKind;
  door: DoorKind; // the door the players came through (risk tier)
  seed: number;
  /** Set on the final "reveal" room only. */
  reveal?: boolean;
  mutator?: Mutator;
}

export interface PlayerSnap {
  id: string;
  name: string;
  x: number; y: number; z: number;
  yaw: number; pitch: number;
  hp: number; maxHp: number; armor: number;
  alive: boolean;
  weapon: WeaponId;
  invuln: number;
  score: number;
  kills: number;
  color: number;
  scrap: number;
  firing: boolean;
  ghost: boolean;
}

export interface EnemySnap {
  id: number;
  type: EnemyType;
  x: number; y: number; z: number;
  yaw: number;
  hp: number; maxHp: number;
  anim: EnemyAnim;
  /** 0..1 telegraph (stalker laser, brute charge wind-up, warden attack) */
  tell: number;
  cloak: number; // 0 visible .. 1 invisible
  marked: boolean;
  frozen: boolean;
  burning: boolean;
  elite: boolean;
  /** stalker laser target, when aiming */
  aimX?: number; aimY?: number; aimZ?: number;
  phase?: number;
}

export type ProjectileKind = 'bolt' | 'plasma' | 'orb' | 'rocket' | 'spit' | 'replica' | 'shell' | 'hex';

export interface ProjectileSnap {
  id: number;
  kind: ProjectileKind;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

export interface MineSnap { id: number; x: number; y: number; z: number; armed: boolean }

export interface PedestalOffer {
  id: string; // powerup id
  rarity: Rarity;
}

export interface Pedestal {
  slot: number; // 0 or 1
  x: number; z: number;
  offer: PedestalOffer;
}

export interface ShopItem {
  slot: number;
  kind: 'powerup' | 'heal' | 'armor' | 'reroll';
  x: number; z: number;
  price: number;
  offer?: PedestalOffer;
  sold: boolean;
}

export interface DoorSnap {
  slot: number;
  kind: DoorKind;
  nextKind: RoomKind;
  open: boolean;
  x: number; z: number; // door center
  nx: number; nz: number; // inward-facing normal (points into the room)
  votes: number;
  mutator?: Mutator;
}

export interface Snapshot {
  t: number; // server time (s)
  tick: number;
  players: PlayerSnap[];
  enemies: EnemySnap[];
  projectiles: ProjectileSnap[];
  mines: MineSnap[];
  doors: DoorSnap[];
  combo: number; // shared multiplier
  comboTimer: number; // seconds left before decay
  state: RunState;
  roomTimer: number; // gauntlet countdown (or -1)
  wave: number; // arena wave (1..3), 0 otherwise
  bossHp: number; bossMaxHp: number; bossName: string;
  enemiesLeft: number;
}

/** Player inventory, private per player. */
export interface PlayerPrivate {
  powerups: { id: string; rarity: Rarity }[];
  synergies: string[];
  dashCharges: number;
  maxDash: number;
  ammo: Record<WeaponId, number>; // 0..1 fraction of magazine
  unlockedWeapons: WeaponId[];
  pedestals: Pedestal[] | null;
  shop: ShopItem[] | null;
  shrine: boolean; // sanctuary heal available
  scrap: number;
  stats: PlayerStats;
}

/** Derived stats after powerups (also used by client physics). */
export interface PlayerStats {
  speedMult: number;
  jumpMult: number;
  airControl: number;
  maxDash: number;
  dashCooldown: number;
  doubleJump: boolean;
  wallRun: boolean;
  slideDamage: boolean;
  dashTrail: boolean;
  blink: boolean;
  maxHp: number;
  fireRateMult: number;
  damageMult: number;
  headshotMult: number;
  pierce: number;
  ricochet: number;
  ammoRegenMult: number;
}

// ───────────────────────────── events (server → client) ─────────────────────────────

export type GameEvent =
  | { e: 'hit'; enemy: number; by: string; dmg: number; head: boolean; x: number; y: number; z: number; dx: number; dy: number; dz: number; weapon: WeaponId }
  | { e: 'kill'; enemy: number; type: EnemyType; by: string; head: boolean; glory: boolean; x: number; y: number; z: number; dx: number; dy: number; dz: number; score: number; combo: number; elite: boolean; weapon: WeaponId }
  | { e: 'stagger'; enemy: number }
  | { e: 'glory'; enemy: number; by: string; type: EnemyType; x: number; y: number; z: number }
  | { e: 'playerHit'; id: string; dmg: number; x: number; y: number; z: number; armorBroke: boolean; kx?: number; ky?: number; kz?: number }
  | { e: 'playerDeath'; id: string; by: string }
  | { e: 'respawn'; id: string; x: number; y: number; z: number; yaw: number }
  | { e: 'streak'; id: string; level: 1 | 2 | 3 | 4; kills: number }
  | { e: 'enemyFire'; enemy: number; type: EnemyType; x: number; y: number; z: number }
  | { e: 'enemyAlert'; enemy: number; type: EnemyType }
  | { e: 'explosion'; x: number; y: number; z: number; r: number; kind: 'kill' | 'mine' | 'rocket' | 'boss' | 'tesla' }
  | { e: 'arc'; x1: number; y1: number; z1: number; x2: number; y2: number; z2: number }
  | { e: 'roomLoad'; room: RoomDesc; spawns: { id: string; x: number; y: number; z: number; yaw: number }[]; runIndex: number; total: number }
  | { e: 'roomClear'; index: number; xp: number }
  | { e: 'wave'; wave: number }
  | { e: 'pedestals'; id: string; pedestals: Pedestal[] }
  | { e: 'pick'; id: string; powerup: string; rarity: Rarity }
  | { e: 'synergy'; id: string; synergy: string }
  | { e: 'doorsOpen' }
  | { e: 'bossIntro'; name: string; title: string }
  | { e: 'bossPhase'; phase: number }
  | { e: 'mineArm'; id: number }
  | { e: 'pickup'; id: string; kind: 'hp' | 'armor' | 'ammo'; amount: number }
  | { e: 'drop'; did: number; kind: 'hp' | 'armor' | 'ammo' | 'scrap'; x: number; y: number; z: number }
  | { e: 'dropGone'; did: number }
  | { e: 'timerFail' }
  | { e: 'runEnd'; summary: RunSummary[] }
  | { e: 'chat'; text: string }
  | { e: 'replica' }
  | { e: 'revealStart' }
  | { e: 'telegraph'; x: number; z: number; r: number; t: number }
  | { e: 'shop'; id: string; items: ShopItem[] }
  | { e: 'buy'; id: string; slot: number; item: ShopItem }
  | { e: 'shrine'; id: string; x: number; z: number }
  | { e: 'trial'; state: 'start' | 'win' | 'fail'; time: number }
  | { e: 'scrap'; id: string; amount: number }
  | { e: 'latch'; enemy: number; id: string; on: boolean }
  | { e: 'shieldHit'; enemy: number; x: number; y: number; z: number }
  | { e: 'phoenix'; id: string }
  | { e: 'trueEnding' }
  | { e: 'extractOffer' };

export interface RunSummary {
  id: string;
  name: string;
  kills: number;
  headshots: number;
  glories: number;
  rooms: number;
  bosses: number;
  score: number;
  peakCombo: number;
  bestStreak: number;
  timeSec: number;
  died: boolean;
  victory: boolean;
  anomalies: number;
  favoriteWeapon: WeaponId;
  powerups: string[];
  synergies: string[];
  xp: number;
  profile: ReplicaProfile;
  depth: number;
  extracted: boolean;
  trueEnding: boolean;
  scrap: number;
}

// ───────────────────────────── messages ─────────────────────────────

export interface InputMsg {
  t: 'input';
  seq: number;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  yaw: number; pitch: number;
  weapon: WeaponId;
  firing: boolean;
  dashing: boolean;
  sliding: boolean;
}

/** Client-side hit claim. The server validates plausibility, computes damage itself. */
export interface ShotMsg {
  t: 'shot';
  weapon: WeaponId;
  ox: number; oy: number; oz: number;
  dx: number; dy: number; dz: number;
  /** enemies hit by the client-side trace: enemy id + headshot + pellet count */
  hits: { id: number; head: boolean; n: number }[];
  charge?: number; // lance 0..1
}

export type ClientMsg =
  | InputMsg
  | ShotMsg
  | { t: 'hello'; name: string; level: number; runCount: number; unlocked: WeaponId[]; replica?: ReplicaProfile | null; difficulty: Difficulty; seed?: string; solo: boolean }
  | { t: 'glory'; enemy: number }
  | { t: 'pick'; slot: number }
  | { t: 'door'; slot: number }
  | { t: 'begin' }
  | { t: 'ripper'; on: boolean }
  | { t: 'buy'; slot: number }
  | { t: 'reload'; weapon: WeaponId }
  | { t: 'shrine' }
  | { t: 'ping'; c: number };

export type ServerMsg =
  | { t: 'welcome'; id: string; runId: string; seed: string; numericSeed: number; host: boolean; state: RunState; lobbyEndsIn: number; players: number }
  | { t: 'lobby'; players: { id: string; name: string }[]; endsIn: number }
  | { t: 'snap'; s: Snapshot }
  | { t: 'events'; ev: GameEvent[] }
  | { t: 'priv'; p: PlayerPrivate }
  | { t: 'pong'; c: number; s: number }
  | { t: 'error'; msg: string };

/** Data recorded from a player's previous run, used to drive the Replica. */
export interface ReplicaProfile {
  favoriteWeapon: WeaponId;
  dashRate: number; // dashes per minute
  strafeBias: number; // -1..1
  aggression: number; // 0..1 (avg distance to enemies inverse)
  jumpRate: number;
  accuracy: number; // 0..1
}
