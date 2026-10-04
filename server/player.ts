import type { ShopItem, Pedestal, PlayerPrivate, PlayerSnap, Rarity, ReplicaProfile, WeaponId } from '../shared/protocol';
import { computeMods, Mods, statsFromMods } from '../shared/powerupDefs';
import * as C from '../shared/constants';

const COLORS = [0x6cff9a, 0x5ac8ff, 0xffc84a, 0xff6ad5];

export class SimPlayer {
  x = 0; y = 0; z = 0;
  vx = 0; vy = 0; vz = 0;
  yaw = 0; pitch = 0;
  hp: number = C.PLAYER_HP;
  armor = 0;
  alive = true;
  weapon: WeaponId = 'pulse';
  firing = false;
  dashing = false;
  sliding = false;
  invuln: number = C.SPAWN_PROTECT;
  ghostT = 0;
  overclockT = 0;
  ripperOn = false;
  lastSeq = 0;
  lastShot: Record<WeaponId, number> = { pulse: -9, breacher: -9, lance: -9, ripper: -9 };
  ammo: Record<WeaponId, number> = { pulse: 1, breacher: 1, lance: 1, ripper: 1 };
  powerups: { id: string; rarity: Rarity }[] = [];
  synergies: string[] = [];
  mods: Mods;
  pedestals: Pedestal[] | null = null;
  shop: ShopItem[] | null = null;
  shrine = false;
  scrap = 0;
  phoenixUsed = false;
  reaperRefill = false;
  wasDashing = false;
  reloadW: WeaponId | null = null;
  reloadT = 0;
  dashHit = new Set<number>();
  lastOffer: string[] = [];
  pityCount = 0;
  killTimes: number[] = [];
  streakLevel = 0;
  lastKillT = -99;
  executionerCount = 0;
  slideHit = new Set<number>();
  trailT = 0;
  color: number;
  privDirty = true;
  privT = 0;
  doorVote = -1;
  lastHurtT = -99;
  // stats
  score = 0;
  kills = 0;
  headshots = 0;
  glories = 0;
  rooms = 0;
  bosses = 0;
  anomalies = 0;
  peakCombo = 1;
  bestStreak = 0;
  weaponKills: Record<WeaponId, number> = { pulse: 0, breacher: 0, lance: 0, ripper: 0 };
  died = false;
  xp = 0;
  // replica profiling
  dashes = 0;
  jumps = 0;
  strafeAccum = 0;
  distAccum = 0;
  distSamples = 0;
  shots = 0;
  shotHits = 0;
  lastY = 0;

  constructor(
    public id: string,
    public name: string,
    public level: number,
    public runCount: number,
    public unlocked: WeaponId[],
    public replicaProfile: ReplicaProfile | null,
    index: number,
  ) {
    this.color = COLORS[index % COLORS.length];
    this.mods = computeMods([], level);
    this.hp = this.mods.maxHp;
  }

  recompute() {
    const prevMax = this.mods.maxHp;
    this.mods = computeMods(this.powerups, this.level);
    if (this.mods.maxHp > prevMax) this.hp += this.mods.maxHp - prevMax;
    this.hp = Math.min(this.hp, this.mods.maxHp);
    if (this.mods.noArmor) this.armor = 0;
    this.privDirty = true;
  }

  heal(n: number) {
    if (!this.alive || n <= 0) return;
    this.hp = Math.min(this.mods.maxHp, this.hp + n);
  }

  addArmor(n: number) {
    if (this.mods.noArmor || !this.alive) return;
    this.armor = Math.min(C.PLAYER_MAX_ARMOR, this.armor + n);
  }

  snap(): PlayerSnap {
    return {
      id: this.id, name: this.name,
      x: this.x, y: this.y, z: this.z, yaw: this.yaw, pitch: this.pitch,
      hp: Math.ceil(this.hp), maxHp: this.mods.maxHp, armor: Math.ceil(this.armor),
      alive: this.alive, weapon: this.weapon, invuln: this.invuln,
      score: this.score, kills: this.kills, color: this.color, scrap: this.scrap, firing: this.firing, ghost: this.ghostT > 0,
    };
  }

  priv(dashCharges: number): PlayerPrivate {
    return {
      powerups: this.powerups.slice(),
      synergies: this.synergies.slice(),
      dashCharges,
      maxDash: this.mods.maxDash,
      ammo: { ...this.ammo },
      unlockedWeapons: this.unlocked.slice(),
      pedestals: this.pedestals,
      shop: this.shop,
      shrine: this.shrine,
      scrap: this.scrap,
      stats: statsFromMods(this.mods),
    };
  }

  favoriteWeapon(): WeaponId {
    let best: WeaponId = 'pulse', n = -1;
    for (const w of Object.keys(this.weaponKills) as WeaponId[]) if (this.weaponKills[w] > n) { n = this.weaponKills[w]; best = w; }
    return best;
  }
}
