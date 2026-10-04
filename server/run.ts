// The authoritative simulation of one run. Environment-agnostic: runs in Node (co-op server)
// and in the browser (solo, via LocalTransport).

import type {
  ClientMsg, Difficulty, DoorSnap, EnemyType, GameEvent, ProjectileKind, ReplicaProfile, RoomDesc, RunState, RunSummary, ServerMsg, Snapshot, WeaponId,
} from '../shared/protocol';
import { generateRoom, solidsFor, Box, RoomGeo, navBlockedAt, isBossIndex } from '../shared/mapData';
import { Rng, hashString, mixSeed, randomSeedString, normalizeSeed } from '../shared/rng';
import { DIFFICULTY, DifficultyDef, ENEMIES } from '../shared/enemyDefs';
import * as C from '../shared/constants';
import { SimPlayer } from './player';
import { Enemy } from './enemies/base';
import { Drone } from './enemies/drone';
import { Grunt } from './enemies/grunt';
import { Brute } from './enemies/brute';
import { Stalker } from './enemies/stalker';
import { Spider } from './enemies/spider';
import { Replica } from './enemies/replica';
import { Warden } from './boss/warden';
import { TOTAL_ROOMS, composeEnemies, firstRoom, nextRoom, SpawnPlan } from './roomGraph';
import { makeOffers, applyPick } from './powerups';
import * as combat from './combat';

export interface RunHost {
  send(playerId: string, msg: ServerMsg): void;
  broadcast(msg: ServerMsg): void;
  ended?(run: Run): void;
}

export interface Projectile {
  id: number; kind: ProjectileKind;
  x: number; y: number; z: number; vx: number; vy: number; vz: number;
  dmg: number; owner: number; life: number; homing?: string; gravity: number; explode: number; r: number;
}
export interface Mine { id: number; x: number; y: number; z: number; armT: number; owner: number; life: number }
export interface Drop { id: number; kind: 'hp' | 'armor' | 'ammo'; x: number; y: number; z: number; amount: number; life: number }
export interface Hazard { x: number; z: number; r: number; dps: number; life: number; owner: string }

interface FlowField { t: number; dist: Int16Array }

export interface RunOptions {
  solo: boolean;
  difficulty: Difficulty;
  seed?: string;
  snapshotEvery?: number; // ticks between snapshots
}

let RUN_COUNTER = 0;

export class Run {
  id: string;
  seedStr: string;
  seed: number;
  solo: boolean;
  difficulty: Difficulty;
  diff: DifficultyDef;
  rng: Rng;
  time = 0;
  tickN = 0;
  state: RunState = 'lobby';
  lobbyT: number = C.LOBBY_WAIT;
  players = new Map<string, SimPlayer>();
  order: string[] = [];
  enemies = new Map<number, Enemy>();
  projectiles: Projectile[] = [];
  mines: Mine[] = [];
  drops: Drop[] = [];
  hazards: Hazard[] = [];
  room!: RoomDesc;
  geo!: RoomGeo;
  solids: Box[] = [];
  openDoors = new Set<number>();
  combo = 1;
  comboTimer = 0;
  events: GameEvent[] = [];
  nextId = 1;
  spawnQueue: { t: number; plan: SpawnPlan; x: number; z: number }[] = [];
  waves: SpawnPlan[][] = [];
  wave = 0;
  roomTimer = -1;
  timerFailed = false;
  cleared = false;
  doorsOpenAt = -1;
  doorCountdown = -1;
  transitionT = -1;
  transitionSlot = -1;
  endT = -1;
  victory = false;
  frenzy = false;
  boss: Warden | null = null;
  flow = new Map<string, FlowField>();
  snapshotEvery: number;
  startTime = 0;
  ended = false;
  hostId = '';
  gauntletBackSpawned = false;
  replicaProfile: ReplicaProfile | null = null;
  runCount = 0;
  teslaT = 0;
  private profT = 0;

  constructor(public host: RunHost, opts: RunOptions) {
    this.id = 'run' + (++RUN_COUNTER) + '_' + Math.floor(Math.random() * 1e6).toString(36);
    this.seedStr = opts.seed ? normalizeSeed(opts.seed) || randomSeedString() : randomSeedString();
    this.seed = hashString(this.seedStr);
    this.solo = opts.solo;
    this.difficulty = opts.difficulty;
    this.diff = DIFFICULTY[opts.difficulty];
    this.rng = new Rng(mixSeed(this.seed, 0x5151));
    this.snapshotEvery = opts.snapshotEvery ?? 1;
  }

  // ───────────────────────────── players ─────────────────────────────

  get playerCount() { return this.players.size; }

  addPlayer(id: string, hello: Extract<ClientMsg, { t: 'hello' }>): SimPlayer {
    const p = new SimPlayer(id, hello.name.slice(0, 16) || 'SUBJECT', hello.level, hello.runCount, hello.unlocked, hello.replica ?? null, this.order.length);
    this.players.set(id, p);
    this.order.push(id);
    if (!this.hostId) { this.hostId = id; this.runCount = hello.runCount; this.replicaProfile = hello.replica ?? null; }
    this.host.send(id, {
      t: 'welcome', id, runId: this.id, seed: this.seedStr, numericSeed: this.seed, host: id === this.hostId,
      state: this.state, lobbyEndsIn: this.lobbyT, players: this.players.size,
    });
    if (this.state === 'lobby') {
      this.broadcastLobby();
      if (this.solo || this.players.size >= C.MAX_PLAYERS) this.start();
    } else {
      // drop-in: spawn at next room transition — spectate until then
      p.alive = false;
      p.hp = 0;
      this.host.send(id, { t: 'events', ev: [{ e: 'roomLoad', room: this.room, spawns: [], runIndex: this.room.index, total: TOTAL_ROOMS }] });
      this.emit({ e: 'chat', text: `${p.name} joined — deploying next room` });
    }
    return p;
  }

  removePlayer(id: string) {
    const p = this.players.get(id);
    if (!p) return;
    this.players.delete(id);
    this.order = this.order.filter((o) => o !== id);
    this.flow.delete(id);
    for (const e of this.enemies.values()) if (e.target === p) e.target = null;
    if (this.hostId === id) this.hostId = this.order[0] ?? '';
    if (this.players.size === 0) { this.ended = true; this.host.ended?.(this); return; }
    if (this.state === 'lobby') this.broadcastLobby();
    else this.emit({ e: 'chat', text: `${p.name} disconnected` });
    this.checkAllDead();
  }

  broadcastLobby() {
    this.host.broadcast({ t: 'lobby', players: [...this.players.values()].map((p) => ({ id: p.id, name: p.name })), endsIn: this.lobbyT });
  }

  targets(): SimPlayer[] {
    const out: SimPlayer[] = [];
    for (const p of this.players.values()) if (p.alive && p.ghostT <= 0) out.push(p);
    return out;
  }

  alivePlayers(): SimPlayer[] {
    return [...this.players.values()].filter((p) => p.alive);
  }

  // ───────────────────────────── messages ─────────────────────────────

  handle(id: string, msg: ClientMsg) {
    const p = this.players.get(id);
    if (!p) return;
    switch (msg.t) {
      case 'input': this.onInput(p, msg); break;
      case 'shot': if (this.state !== 'lobby' && this.transitionT < 0) combat.handleShot(this, p, msg); break;
      case 'glory': combat.handleGlory(this, p, msg.enemy); break;
      case 'ripper': p.ripperOn = msg.on && p.unlocked.includes('ripper'); break;
      case 'pick': this.onPick(p, msg.slot); break;
      case 'door': this.onDoor(p, msg.slot); break;
      case 'begin': if (this.state === 'lobby' && id === this.hostId) this.start(); break;
      case 'ping': this.host.send(id, { t: 'pong', c: msg.c, s: this.time }); break;
      default: break;
    }
  }

  onInput(p: SimPlayer, m: Extract<ClientMsg, { t: 'input' }>) {
    if (m.seq <= p.lastSeq) return;
    p.lastSeq = m.seq;
    p.yaw = m.yaw; p.pitch = m.pitch;
    if (p.unlocked.includes(m.weapon)) p.weapon = m.weapon;
    p.firing = m.firing;
    if (!p.alive || this.transitionT >= 0) return;
    // validation: clamp implausible movement (client-predicted, server-sanity-checked)
    const dx = m.x - p.x, dz = m.z - p.z, dy = m.y - p.y;
    const dist = Math.hypot(dx, dz);
    const maxStep = 40 * (1 / 15) + 1.5;
    if (dist > maxStep) {
      p.x += (dx / dist) * maxStep; p.z += (dz / dist) * maxStep;
    } else { p.x = m.x; p.z = m.z; }
    p.y = Math.max(0, Math.min(20, p.y + Math.max(-15, Math.min(15, dy))));
    if (m.dashing && !p.dashing) p.dashes++;
    if (m.vy > 5 && p.vy <= 5) p.jumps++;
    p.vx = m.vx; p.vy = m.vy; p.vz = m.vz;
    p.dashing = m.dashing;
    if (m.sliding && !p.sliding) p.slideHit.clear();
    p.sliding = m.sliding;
  }

  // ───────────────────────────── run flow ─────────────────────────────

  start() {
    if (this.state !== 'lobby') return;
    this.startTime = this.time;
    this.loadRoom(firstRoom(this.seed));
  }

  loadRoom(desc: RoomDesc) {
    this.room = desc;
    this.geo = generateRoom(desc, TOTAL_ROOMS);
    this.openDoors.clear();
    this.solids = solidsFor(this.geo, this.openDoors);
    this.enemies.clear();
    this.projectiles = [];
    this.mines = [];
    this.drops = [];
    this.hazards = [];
    this.spawnQueue = [];
    this.waves = [];
    this.wave = 0;
    this.roomTimer = -1;
    this.timerFailed = false;
    this.cleared = false;
    this.doorsOpenAt = -1;
    this.doorCountdown = -1;
    this.transitionT = -1;
    this.boss = null;
    this.flow.clear();
    this.gauntletBackSpawned = false;
    this.frenzy = [...this.players.values()].some((p) => p.mods.frenzy);

    const spawns: { id: string; x: number; y: number; z: number; yaw: number }[] = [];
    let i = 0;
    for (const id of this.order) {
      const p = this.players.get(id)!;
      const sp = this.geo.playerSpawns[i++ % this.geo.playerSpawns.length];
      p.x = sp.x; p.y = 0; p.z = sp.z; p.vx = p.vy = p.vz = 0; p.yaw = 0;
      if (!p.alive) {
        // co-op: respawn at the start of the next room with 50% HP
        p.alive = true;
        p.hp = Math.max(1, Math.round(p.mods.maxHp * C.COOP_RESPAWN_HP));
        p.armor = 0;
      }
      p.invuln = C.SPAWN_PROTECT;
      p.pedestals = null;
      p.doorVote = -1;
      p.privDirty = true;
      spawns.push({ id, x: p.x, y: p.y, z: p.z, yaw: 0 });
    }
    this.emit({ e: 'roomLoad', room: desc, spawns, runIndex: desc.index, total: TOTAL_ROOMS });

    const n = Math.max(1, this.players.size);
    const roomRng = new Rng(mixSeed(desc.seed, 0xe7e7));
    switch (desc.kind) {
      case 'combat': {
        this.state = 'combat';
        this.queueSpawns(composeEnemies(desc, n, this.runCount, roomRng), 1.0, 'far');
        break;
      }
      case 'arena': {
        this.state = 'combat';
        for (let w = 0; w < 3; w++) {
          const plan = composeEnemies(desc, n, this.runCount, roomRng, 0.55 + w * 0.15);
          if (w === 2 && !plan.some((p) => p.type === 'brute')) plan.push({ type: 'brute', elite: desc.door === 'elite' });
          this.waves.push(plan);
        }
        this.nextWave();
        break;
      }
      case 'gauntlet': {
        this.state = 'combat';
        const plan = composeEnemies(desc, n, this.runCount, roomRng, 1.25);
        const half = Math.ceil(plan.length * 0.6);
        this.queueSpawns(plan.slice(0, half), 0.8, 'far');
        this.waves = [plan.slice(half)];
        this.roomTimer = 45 + desc.index * 1.5;
        break;
      }
      case 'anomaly': {
        this.state = 'reward';
        for (const p of this.players.values()) p.anomalies++;
        const replicaRoom = desc.index >= 11 || (this.hostLevel() >= 25 && desc.index >= 5);
        if (replicaRoom) {
          this.emit({ e: 'replica' });
          this.queueSpawns([{ type: 'replica', elite: false }, { type: 'replica', elite: desc.index >= 13 }], 2.5, 'far');
          this.state = 'combat';
        } else {
          this.doorsOpenAt = this.time + 2.5;
          this.cleared = true;
          this.offerPedestals('rare', 2);
        }
        break;
      }
      case 'boss': {
        this.state = 'boss';
        const variant = desc.biome;
        const w = new Warden(this.nextId++, 0, -12, this, variant, Math.pow(C.BOSS_HP_SCALE, n - 1));
        this.enemies.set(w.id, w);
        this.boss = w;
        this.emit({ e: 'bossIntro', name: w.name, title: ['WARDEN OF THE FOUNDRY', 'WARDEN OF THE ARCHIVE', 'WARDEN OF THE CORE'][variant] });
        break;
      }
      default: break;
    }
  }

  hostLevel(): number {
    return this.players.get(this.hostId)?.level ?? 1;
  }

  queueSpawns(plans: SpawnPlan[], delay: number, where: 'far' | 'near' | 'any') {
    const pts = this.geo.enemySpawns;
    if (!pts.length) return;
    const hd = this.geo.d / 2;
    let candidates = pts;
    if (where === 'far') candidates = pts.filter((p) => p.z < hd - 12);
    if (where === 'near') candidates = pts.filter((p) => p.z > hd - 14 && p.z < hd - 6);
    if (!candidates.length) candidates = pts;
    const used = new Set<number>();
    plans.forEach((plan, i) => {
      let k = Math.floor(this.rng.next() * candidates.length);
      for (let tries = 0; tries < 6 && used.has(k); tries++) k = Math.floor(this.rng.next() * candidates.length);
      used.add(k);
      const sp = candidates[k];
      this.spawnQueue.push({ t: this.time + delay + i * 0.18, plan, x: sp.x + this.rng.range(-0.4, 0.4), z: sp.z + this.rng.range(-0.4, 0.4) });
    });
  }

  nextWave() {
    if (this.wave >= this.waves.length) return false;
    const plan = this.waves[this.wave];
    this.wave++;
    this.emit({ e: 'wave', wave: this.wave });
    this.queueSpawns(plan, this.wave === 1 ? 1.0 : 1.6, 'any');
    return true;
  }

  createEnemy(type: EnemyType, x: number, z: number, elite: boolean): Enemy {
    const id = this.nextId++;
    switch (type) {
      case 'drone': return new Drone(id, type, x, z, elite, this);
      case 'grunt': return new Grunt(id, type, x, z, elite, this);
      case 'brute': return new Brute(id, type, x, z, elite, this);
      case 'stalker': return new Stalker(id, type, x, z, elite, this);
      case 'spider': return new Spider(id, type, x, z, elite, this);
      case 'replica': return new Replica(id, x, z, elite, this, this.replicaProfile);
      default: return new Grunt(id, 'grunt', x, z, elite, this);
    }
  }

  spawnEnemyNear(type: EnemyType, x: number, z: number) {
    const hw = this.geo.w / 2 - 2, hd = this.geo.d / 2 - 2;
    x = Math.max(-hw, Math.min(hw, x)); z = Math.max(-hd, Math.min(hd, z));
    if (navBlockedAt(this.geo.nav, x, z)) {
      const sp = this.geo.enemySpawns[Math.floor(this.rng.next() * this.geo.enemySpawns.length)];
      if (sp) { x = sp.x; z = sp.z; }
    }
    const e = this.createEnemy(type, x, z, false);
    e.aware = true;
    e.target = this.targets()[0] ?? null;
    e.state = 'engage';
    this.enemies.set(e.id, e);
  }

  onRoomCleared() {
    if (this.cleared) return;
    this.cleared = true;
    const isBoss = this.room.kind === 'boss';
    const xp = isBoss ? C.XP_PER_BOSS : C.XP_PER_ROOM;
    for (const p of this.players.values()) {
      p.rooms++;
      p.xp += xp;
      if (isBoss) p.bosses++;
    }
    this.emit({ e: 'roomClear', index: this.room.index, xp });
    this.state = 'reward';
    this.projectiles = [];
    this.mines = [];
    this.roomTimer = -1;
    if (isBoss && this.room.index >= TOTAL_ROOMS - 1) {
      // final warden down: the run is won
      this.victory = true;
      this.endT = this.time + 4;
      return;
    }
    this.offerPedestals(isBoss ? 'epic' : this.room.door === 'unknown' ? 'rare' : 'common', this.room.door === 'elite' ? 3 : 2);
    this.doorsOpenAt = this.time + 1.6;
  }

  offerPedestals(minRarity: 'common' | 'rare' | 'epic', count: number) {
    const spots = this.geo.pedestals;
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      const offers = makeOffers(this.rng, p, this.room.index, count, minRarity);
      offers.forEach((o, i) => { o.x = spots[i].x; o.z = spots[i].z; });
      p.pedestals = offers;
      p.privDirty = true;
      this.host.send(p.id, { t: 'events', ev: [{ e: 'pedestals', id: p.id, pedestals: offers }] });
    }
  }

  onPick(p: SimPlayer, slot: number) {
    if (!p.pedestals || !p.alive) return;
    const ped = p.pedestals.find((x) => x.slot === slot);
    if (!ped) return;
    if (Math.hypot(p.x - ped.x, p.z - ped.z) > 3.5) return;
    p.pedestals = null;
    const newSyn = applyPick(p, ped.offer.id, ped.offer.rarity);
    this.emit({ e: 'pick', id: p.id, powerup: ped.offer.id, rarity: ped.offer.rarity });
    for (const s of newSyn) this.emit({ e: 'synergy', id: p.id, synergy: s });
    this.frenzy = [...this.players.values()].some((pp) => pp.mods.frenzy);
    p.privDirty = true;
  }

  onDoor(p: SimPlayer, slot: number) {
    if (!p.alive || !this.openDoors.has(slot) || this.transitionT >= 0) return;
    const ds = this.geo.doors.find((d) => d.slot === slot);
    if (!ds) return;
    // must actually be at the door
    if (Math.hypot(p.x - (ds.x - ds.nx * 1.5), p.z - (ds.z - ds.nz * 1.5)) > 4) return;
    p.doorVote = slot;
    const alive = this.alivePlayers();
    const voted = alive.filter((a) => a.doorVote >= 0);
    if (voted.length >= alive.length) this.beginTransition(this.majorityDoor());
    else if (this.doorCountdown < 0) {
      this.doorCountdown = 6;
      this.emit({ e: 'chat', text: `${p.name} is at the door — leaving in 6s` });
    }
  }

  majorityDoor(): number {
    const counts = new Map<number, number>();
    for (const p of this.players.values()) if (p.doorVote >= 0) counts.set(p.doorVote, (counts.get(p.doorVote) ?? 0) + 1);
    let best = -1, n = -1;
    for (const [s, c] of counts) if (c > n) { n = c; best = s; }
    return best >= 0 ? best : [...this.openDoors][0] ?? 0;
  }

  beginTransition(slot: number) {
    if (this.transitionT >= 0) return;
    this.transitionT = this.solo ? 0.35 : 0.6;
    this.transitionSlot = slot;
    this.state = 'transition';
  }

  doTransition() {
    const ds = this.geo.doors.find((d) => d.slot === this.transitionSlot) ?? this.geo.doors.find((d) => !d.entry);
    if (!ds) return;
    const desc = nextRoom(this.seed, this.room, ds.slot, ds.kind, isBossIndex(this.room.index + 1) ? 'boss' : ds.nextKind);
    this.loadRoom(desc);
  }

  checkAllDead() {
    if (this.state === 'lobby' || this.endT >= 0) return;
    if (this.players.size > 0 && this.alivePlayers().length === 0) {
      this.endT = this.time + (this.solo ? 1.4 : 2.5);
      this.victory = false;
    }
  }

  endRun() {
    if (this.ended) return;
    this.ended = true;
    this.state = 'ended';
    const summary: RunSummary[] = [...this.players.values()].map((p) => ({
      id: p.id, name: p.name, kills: p.kills, headshots: p.headshots, glories: p.glories, rooms: p.rooms, bosses: p.bosses,
      score: p.score, peakCombo: p.peakCombo, bestStreak: p.bestStreak, timeSec: Math.round(this.time - this.startTime),
      died: !this.victory, victory: this.victory, anomalies: p.anomalies, favoriteWeapon: p.favoriteWeapon(),
      powerups: p.powerups.map((x) => x.id), synergies: p.synergies.slice(),
      xp: Math.round(p.xp * this.diff.xp), profile: this.profileOf(p),
    }));
    this.emit({ e: 'runEnd', summary });
    this.flush();
    this.host.ended?.(this);
  }

  profileOf(p: SimPlayer): ReplicaProfile {
    const mins = Math.max(0.5, (this.time - this.startTime) / 60);
    return {
      favoriteWeapon: p.favoriteWeapon(),
      dashRate: Math.min(40, p.dashes / mins),
      strafeBias: Math.max(-1, Math.min(1, p.strafeAccum / Math.max(1, Math.abs(p.strafeAccum) + 30))),
      aggression: p.distSamples ? Math.max(0, Math.min(1, 1 - p.distAccum / p.distSamples / 20)) : 0.5,
      jumpRate: Math.min(60, p.jumps / mins),
      accuracy: p.shots ? Math.min(1, p.shotHits / p.shots) : 0.4,
    };
  }

  // ───────────────────────────── spawning helpers ─────────────────────────────

  spawnProjectile(p: Omit<Projectile, 'id' | 'life' | 'r'> & { life?: number }) {
    const r = p.kind === 'orb' ? 0.45 : p.kind === 'rocket' ? 0.35 : p.kind === 'plasma' ? 0.32 : 0.22;
    this.projectiles.push({ ...p, id: this.nextId++, life: p.life ?? 6, r });
    if (this.projectiles.length > 260) this.projectiles.shift();
  }

  spawnMine(x: number, z: number, owner: number) {
    this.mines.push({ id: this.nextId++, x, y: 0, z, armT: 1.0, owner, life: 25 });
  }

  minesBy(owner: number) { return this.mines.filter((m) => m.owner === owner).length; }

  spawnDrop(kind: Drop['kind'], x: number, z: number, amount: number) {
    const d: Drop = { id: this.nextId++, kind, x, y: 0.4, z, amount, life: 30 };
    this.drops.push(d);
    this.emit({ e: 'drop', did: d.id, kind, x, y: d.y, z });
  }

  emit(ev: GameEvent) { this.events.push(ev); }

  alertSquad(src: Enemy, target: SimPlayer) {
    for (const e of this.enemies.values()) {
      if (e === src || e.aware) continue;
      if (Math.hypot(e.x - src.x, e.z - src.z) < 14) {
        e.aware = true; e.target = target; e.state = 'engage';
        e.reactT = this.rng.range(C.ENEMY_REACTION_MIN, C.ENEMY_REACTION_MAX) * this.diff.reaction * 1.5;
      }
    }
  }

  damageEnemy(e: Enemy, dmg: number, by: string, head: boolean, dx: number, dy: number, dz: number, weapon: WeaponId, silent = false) {
    combat.damageEnemy(this, e, dmg, by, head, dx, dy, dz, weapon, silent);
  }

  damagePlayer(p: SimPlayer, dmg: number, sx: number, sy: number, sz: number, melee: boolean, attacker: Enemy | null, knock?: { x: number; y: number; z: number }) {
    combat.damagePlayer(this, p, dmg, sx, sy, sz, melee, attacker, knock);
  }

  // ───────────────────────────── navigation ─────────────────────────────

  /** BFS flow field toward a player, cached ~0.3s. Returns a unit direction to move. */
  flowDir(x: number, z: number, target: SimPlayer): { x: number; z: number } {
    const nav = this.geo.nav;
    let ff = this.flow.get(target.id);
    if (!ff || this.time - ff.t > 0.3) {
      const dist = ff?.dist ?? new Int16Array(nav.cols * nav.rows);
      dist.fill(-1);
      const tc = Math.floor((target.x - nav.ox) / nav.cell), tr = Math.floor((target.z - nav.oz) / nav.cell);
      const q: number[] = [];
      if (tc >= 0 && tr >= 0 && tc < nav.cols && tr < nav.rows) { dist[tr * nav.cols + tc] = 0; q.push(tr * nav.cols + tc); }
      for (let h = 0; h < q.length; h++) {
        const i = q[h];
        const c = i % nav.cols, r = (i / nav.cols) | 0;
        const dv = dist[i] + 1;
        const nb = [c > 0 ? i - 1 : -1, c < nav.cols - 1 ? i + 1 : -1, r > 0 ? i - nav.cols : -1, r < nav.rows - 1 ? i + nav.cols : -1];
        for (const n of nb) {
          if (n < 0 || dist[n] !== -1 || nav.blocked[n]) continue;
          dist[n] = dv; q.push(n);
        }
      }
      ff = { t: this.time, dist };
      this.flow.set(target.id, ff);
    }
    const c = Math.floor((x - nav.ox) / nav.cell), r = Math.floor((z - nav.oz) / nav.cell);
    const here = c >= 0 && r >= 0 && c < nav.cols && r < nav.rows ? ff.dist[r * nav.cols + c] : -1;
    let best = -1, bx = 0, bz = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const cc = c + dc, rr = r + dr;
      if (cc < 0 || rr < 0 || cc >= nav.cols || rr >= nav.rows) continue;
      const v = ff.dist[rr * nav.cols + cc];
      if (v < 0) continue;
      // diagonal only if both orthogonals are open (no corner cutting)
      if (dr && dc && (ff.dist[r * nav.cols + cc] < 0 || ff.dist[rr * nav.cols + c] < 0)) continue;
      if (best < 0 || v < best) { best = v; bx = nav.ox + (cc + 0.5) * nav.cell; bz = nav.oz + (rr + 0.5) * nav.cell; }
    }
    if (best < 0 || (here >= 0 && best >= here && here <= 1)) {
      const dx = target.x - x, dz = target.z - z, l = Math.hypot(dx, dz) || 1;
      return { x: dx / l, z: dz / l };
    }
    const dx = bx - x, dz = bz - z, l = Math.hypot(dx, dz) || 1;
    return { x: dx / l, z: dz / l };
  }

  // ───────────────────────────── tick ─────────────────────────────

  tick(dt: number) {
    if (this.ended) return;
    this.time += dt;
    this.tickN++;
    if (this.state === 'lobby') {
      this.lobbyT -= dt;
      if (this.tickN % 15 === 0) this.broadcastLobby();
      if (this.lobbyT <= 0 && this.players.size > 0) this.start();
      return;
    }

    if (this.transitionT >= 0) {
      this.transitionT -= dt;
      if (this.transitionT < 0) this.doTransition();
      this.flush();
      return;
    }

    // spawn queue
    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const s = this.spawnQueue[i];
      if (this.time >= s.t) {
        this.spawnQueue.splice(i, 1);
        const e = this.createEnemy(s.plan.type, s.x, s.z, s.plan.elite);
        e.yaw = Math.atan2(-(0 - e.x), -(this.geo.d / 2 - e.z));
        this.enemies.set(e.id, e);
      }
    }

    this.updatePlayers(dt);
    for (const e of this.enemies.values()) if (e.alive) e.update(this, dt);
    this.separateEnemies();
    for (const [id, e] of this.enemies) if (!e.alive) this.enemies.delete(id);
    this.updateProjectiles(dt);
    this.updateMines(dt);
    this.updateHazards(dt);
    this.updateDrops(dt);
    combat.updateTesla(this, dt);

    // combo decay: 1x per COMBO_DECAY_TIME without a kill
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.combo--; this.comboTimer = this.combo > 1 ? C.COMBO_DECAY_TIME : 0; }
    }

    // room logic
    if (!this.cleared && (this.state === 'combat' || this.state === 'boss')) {
      if (this.room.kind === 'gauntlet') {
        this.roomTimer -= dt;
        // enemies from both ends: once players push forward, the back half drops in behind them
        const front = Math.min(...this.alivePlayers().map((p) => p.z), 999);
        if (!this.gauntletBackSpawned && (front < this.geo.d / 2 - 16 || this.roomTimer < 30)) {
          this.gauntletBackSpawned = true;
          this.queueSpawns(this.waves[0] ?? [], 0.3, 'near');
          this.waves = [];
        }
        if (this.roomTimer <= 0 && !this.timerFailed) { this.timerFailed = true; this.emit({ e: 'timerFail' }); }
        if (this.timerFailed && this.tickN % C.TICK_RATE === 0) {
          for (const p of this.alivePlayers()) this.damagePlayer(p, 8, p.x, p.y + 4, p.z, false, null);
        }
      }
      const pending = this.spawnQueue.length > 0 || (this.room.kind === 'gauntlet' && !this.gauntletBackSpawned);
      if (!pending && this.enemies.size === 0 && this.tickN > 5) {
        if (this.room.kind === 'arena' && this.wave < this.waves.length) this.nextWave();
        else this.onRoomCleared();
      }
    }

    if (this.doorsOpenAt >= 0 && this.time >= this.doorsOpenAt) {
      this.doorsOpenAt = -1;
      for (const d of this.geo.doors) if (!d.entry) this.openDoors.add(d.slot);
      this.solids = solidsFor(this.geo, this.openDoors);
      this.flow.clear();
      this.emit({ e: 'doorsOpen' });
    }
    if (this.doorCountdown >= 0) {
      this.doorCountdown -= dt;
      if (this.doorCountdown < 0) this.beginTransition(this.majorityDoor());
    }

    if (this.endT >= 0 && this.time >= this.endT) { this.endRun(); return; }

    this.flush();
  }

  updatePlayers(dt: number) {
    this.profT += dt;
    const sample = this.profT > 0.5;
    if (sample) this.profT = 0;
    for (const p of this.players.values()) {
      if (p.invuln > 0) p.invuln -= dt;
      if (p.ghostT > 0) p.ghostT -= dt;
      if (p.overclockT > 0) p.overclockT -= dt;
      if (!p.alive) continue;
      // ammo regen
      for (const w of ['pulse', 'breacher', 'lance'] as WeaponId[]) {
        p.ammo[w] = Math.min(1, p.ammo[w] + C.AMMO_REGEN * p.mods.ammoRegenMult * dt);
      }
      // dash fire trail
      if (p.dashing && p.mods.dashTrail) {
        p.trailT -= dt;
        if (p.trailT <= 0) { p.trailT = 0.05; this.hazards.push({ x: p.x, z: p.z, r: 1.3, dps: p.mods.dashTrailDps, life: 2.5, owner: p.id }); }
      }
      // slide blade
      if (p.sliding && p.mods.slideDamage) {
        for (const e of this.enemies.values()) {
          if (p.slideHit.has(e.id) || Math.hypot(e.x - p.x, e.z - p.z) > e.def.radius + 1.1 || e.def.flying) continue;
          p.slideHit.add(e.id);
          this.damageEnemy(e, p.mods.slideDmg * p.mods.damageMult, p.id, false, p.vx, 0, p.vz, 'ripper');
        }
      }
      // ripper (continuous melee)
      if (p.ripperOn && p.weapon === 'ripper') combat.ripperTick(this, p, dt);
      // replica profiling
      if (sample) {
        const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
        const rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
        void fx; void fz;
        const lateral = p.vx * rx + p.vz * rz;
        if (Math.abs(lateral) > 2) p.strafeAccum += lateral > 0 ? 1 : -1;
        let nd = Infinity;
        for (const e of this.enemies.values()) nd = Math.min(nd, Math.hypot(e.x - p.x, e.z - p.z));
        if (nd < 60) { p.distAccum += nd; p.distSamples++; }
      }
      // priv sync
      p.privT -= dt;
      if (p.privDirty || p.privT <= 0) {
        p.privDirty = false; p.privT = 0.5;
        this.host.send(p.id, { t: 'priv', p: p.priv(p.mods.maxDash) });
      }
    }
  }

  separateEnemies() {
    const arr = [...this.enemies.values()];
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const a = arr[i], b = arr[j];
      if (a.def.flying !== b.def.flying) continue;
      const dx = b.x - a.x, dz = b.z - a.z;
      const d = Math.hypot(dx, dz), min = a.def.radius + b.def.radius;
      if (d < min && d > 1e-4) {
        const push = (min - d) * 0.5;
        const wa = a.type === 'warden' ? 0 : 1, wb = b.type === 'warden' ? 0 : 1;
        a.x -= (dx / d) * push * wa; a.z -= (dz / d) * push * wa;
        b.x += (dx / d) * push * wb; b.z += (dz / d) * push * wb;
      }
    }
  }

  updateProjectiles(dt: number) {
    const keep: Projectile[] = [];
    for (const pr of this.projectiles) {
      pr.life -= dt;
      if (pr.life <= 0) continue;
      if (pr.homing) {
        const t = this.players.get(pr.homing);
        if (t && t.alive) {
          const dx = t.x - pr.x, dy = t.y + 1.1 - pr.y, dz = t.z - pr.z;
          const l = Math.hypot(dx, dy, dz) || 1;
          const sp = Math.hypot(pr.vx, pr.vy, pr.vz);
          const k = Math.min(1, 1.6 * dt);
          pr.vx += ((dx / l) * sp - pr.vx) * k; pr.vy += ((dy / l) * sp - pr.vy) * k; pr.vz += ((dz / l) * sp - pr.vz) * k;
        }
      }
      pr.vy -= pr.gravity * dt;
      const steps = Math.max(1, Math.ceil((Math.hypot(pr.vx, pr.vy, pr.vz) * dt) / 0.5));
      let dead = false;
      for (let s = 0; s < steps && !dead; s++) {
        pr.x += (pr.vx * dt) / steps; pr.y += (pr.vy * dt) / steps; pr.z += (pr.vz * dt) / steps;
        // players
        for (const p of this.players.values()) {
          if (!p.alive) continue;
          const dy = pr.y < p.y ? p.y - pr.y : pr.y > p.y + C.PLAYER_HEIGHT ? pr.y - (p.y + C.PLAYER_HEIGHT) : 0;
          const dxz = Math.hypot(pr.x - p.x, pr.z - p.z);
          if (dxz < C.PLAYER_RADIUS + pr.r && dy < pr.r) {
            if (pr.explode) this.explodeAt(pr.x, pr.y, pr.z, pr.explode, pr.dmg, null, pr.kind === 'rocket' ? 'rocket' : 'mine');
            else this.damagePlayer(p, pr.dmg, pr.x - pr.vx * 0.05, pr.y, pr.z - pr.vz * 0.05, false, this.enemies.get(pr.owner) ?? null);
            dead = true; break;
          }
        }
        if (dead) break;
        // world
        if (pr.y <= 0.05 || this.pointInSolid(pr.x, pr.y, pr.z)) {
          if (pr.explode) this.explodeAt(pr.x, Math.max(0.2, pr.y), pr.z, pr.explode, pr.dmg, null, pr.kind === 'rocket' ? 'rocket' : 'mine');
          dead = true;
        }
      }
      if (!dead) keep.push(pr);
    }
    this.projectiles = keep;
  }

  pointInSolid(x: number, y: number, z: number): boolean {
    for (const b of this.solids) if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1 && z > b.z0 && z < b.z1) return true;
    return false;
  }

  /** Enemy-sourced explosions hurt players; player-sourced (byPlayer) hurt enemies. */
  explodeAt(x: number, y: number, z: number, r: number, dmg: number, byPlayer: string | null, kind: 'kill' | 'mine' | 'rocket' | 'boss' | 'tesla') {
    this.emit({ e: 'explosion', x, y, z, r, kind });
    if (byPlayer) {
      for (const e of this.enemies.values()) {
        const d = Math.hypot(e.x - x, e.cy - y, e.z - z);
        if (d < r + e.def.radius) this.damageEnemy(e, dmg * (1 - (d / (r + e.def.radius)) * 0.5), byPlayer, false, e.x - x, 0.5, e.z - z, 'pulse');
      }
    } else {
      for (const p of this.alivePlayers()) {
        const d = Math.hypot(p.x - x, p.y + 0.9 - y, p.z - z);
        if (d < r + 0.4) {
          const l = d || 1;
          this.damagePlayer(p, dmg * (1 - (d / (r + 0.4)) * 0.4), x, y, z, false, null, { x: ((p.x - x) / l) * 8, y: 4, z: ((p.z - z) / l) * 8 });
        }
      }
    }
  }

  updateMines(dt: number) {
    const keep: Mine[] = [];
    for (const m of this.mines) {
      m.life -= dt;
      if (m.armT > 0) { m.armT -= dt; if (m.armT <= 0) this.emit({ e: 'mineArm', id: m.id }); }
      let boom = m.life <= 0;
      if (m.armT <= 0) for (const p of this.alivePlayers()) if (Math.hypot(p.x - m.x, p.z - m.z) < 1.8 && p.y < 1.5) boom = true;
      if (boom) { this.explodeAt(m.x, 0.4, m.z, 3.2, 24 * this.diff.damage, null, 'mine'); continue; }
      keep.push(m);
    }
    this.mines = keep;
  }

  updateHazards(dt: number) {
    if (!this.hazards.length) return;
    const keep: Hazard[] = [];
    for (const h of this.hazards) {
      h.life -= dt;
      if (h.life <= 0) continue;
      for (const e of this.enemies.values()) {
        if (e.def.flying && e.y > 2) continue;
        if (Math.hypot(e.x - h.x, e.z - h.z) < h.r + e.def.radius) this.damageEnemy(e, h.dps * dt, h.owner, false, 0, 1, 0, 'pulse', true);
      }
      keep.push(h);
    }
    this.hazards = keep.slice(-120);
  }

  updateDrops(dt: number) {
    const keep: Drop[] = [];
    for (const d of this.drops) {
      d.life -= dt;
      if (d.life <= 0) { this.emit({ e: 'dropGone', did: d.id }); continue; }
      let taken = false;
      for (const p of this.alivePlayers()) {
        if (Math.hypot(p.x - d.x, p.z - d.z) > 1.4 || Math.abs(p.y - d.y) > 2) continue;
        if (d.kind === 'hp') { if (p.hp >= p.mods.maxHp || p.mods.martyr) continue; p.heal(d.amount); }
        else if (d.kind === 'armor') { if (p.mods.noArmor || p.armor >= C.PLAYER_MAX_ARMOR) continue; p.addArmor(d.amount); }
        else { for (const w of ['pulse', 'breacher', 'lance'] as WeaponId[]) p.ammo[w] = Math.min(1, p.ammo[w] + d.amount); p.privDirty = true; }
        this.emit({ e: 'pickup', id: p.id, kind: d.kind, amount: d.amount });
        this.emit({ e: 'dropGone', did: d.id });
        taken = true; break;
      }
      if (!taken) keep.push(d);
    }
    this.drops = keep;
  }

  // ───────────────────────────── output ─────────────────────────────

  flush() {
    if (this.events.length) {
      this.host.broadcast({ t: 'events', ev: this.events });
      this.events = [];
    }
    if (this.tickN % this.snapshotEvery === 0 && this.state !== 'lobby') this.host.broadcast({ t: 'snap', s: this.snapshot() });
  }

  snapshot(): Snapshot {
    const doors: DoorSnap[] = this.geo.doors.filter((d) => !d.entry).map((d) => ({
      slot: d.slot, kind: d.kind, nextKind: isBossIndex(this.room.index + 1) ? 'boss' : d.nextKind, open: this.openDoors.has(d.slot),
      x: d.x, z: d.z, nx: d.nx, nz: d.nz,
      votes: [...this.players.values()].filter((p) => p.doorVote === d.slot).length,
    }));
    const b = this.boss;
    return {
      t: this.time, tick: this.tickN,
      players: [...this.players.values()].map((p) => p.snap()),
      enemies: [...this.enemies.values()].map((e) => e.snap()),
      projectiles: this.projectiles.map((p) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, z: p.z, vx: p.vx, vy: p.vy, vz: p.vz })),
      mines: this.mines.map((m) => ({ id: m.id, x: m.x, y: m.y, z: m.z, armed: m.armT <= 0 })),
      doors,
      combo: this.combo, comboTimer: this.comboTimer,
      state: this.state,
      roomTimer: this.roomTimer,
      wave: this.room?.kind === 'arena' ? this.wave : 0,
      bossHp: b && b.alive ? Math.ceil(b.hp) : 0, bossMaxHp: b ? b.maxHp : 0, bossName: b ? b.name : '',
      enemiesLeft: this.enemies.size + this.spawnQueue.length + (this.room?.kind === 'arena' ? this.waves.slice(this.wave).reduce((a, w) => a + w.length, 0) : 0) + (this.room?.kind === 'gauntlet' && !this.gauntletBackSpawned ? (this.waves[0]?.length ?? 0) : 0),
    };
  }
}

export { ENEMIES };
