// Run controller: consumes server snapshots/events, predicts the local player, traces shots,
// and turns every event into layered feedback. Milestone 7 lives here.

import * as THREE from 'three';
import type { EnemySnap, GameEvent, Pedestal, PlayerPrivate, PlayerSnap, RoomDesc, RunSummary, ServerMsg, Snapshot, WeaponId, Difficulty } from '../shared/protocol';
import { generateRoom, raycastBoxes, rayVsSphere, rayVsCylinder, BIOME_NAMES, Box, MUTATOR_NAME } from '../shared/mapData';
import type { ShopItem } from '../shared/protocol';
import { WARDEN_VOICE, ANNOUNCER } from './audio/voices';
import { BIOME_INFO, BROKER_LINES, maraLog, MUTATOR_INFO, TRUE_ENDING_SCRIPT, endlessLine } from './story/fragments';
import { biomeLine } from './story/handlerLines';
import { ENEMIES } from '../shared/enemyDefs';
import { WEAPONS, WEAPON_ORDER } from '../shared/weaponDefs';
import { computeMods, POWERUP_BY_ID, SYNERGIES, Mods } from '../shared/powerupDefs';
import * as C from '../shared/constants';
import type { World } from './world';
import type { Transport } from './net';
import type { Meta } from './meta';
import { sfx, LoopHandle } from './audio/sfx';
import { music } from './audio/music';
import { metaLevel } from './meta';
import { nextFragment, ENEMY_WHISPERS, ANOMALY_TEXTS, terminalText, Fragment } from './story/fragments';
import { handlerPhase } from './story/handlerLines';
import { projColor } from './render/entities';
import { levelFromXp } from '../server/progression';

const ENEMY_NAMES: Record<string, string> = { drone: 'DRONE', grunt: 'GRUNT', brute: 'BRUTE', stalker: 'STALKER', spider: 'SPIDER', replica: 'REPLICA', warden: 'WARDEN', leech: 'LEECH', sentinel: 'SENTINEL', bomber: 'BOMBER', mortar: 'MORTAR', bulwark: 'BULWARK', wraith: 'WRAITH' };
const STREAK_TEXT = ['', 'DOUBLE KILL', 'TRIPLE KILL', 'MEGA KILL', 'RAMPAGE'];

interface SnapEntry { t: number; s: Snapshot }

export interface GameCallbacks {
  onEnd(summary: RunSummary, me: string, extras: { fragment: Fragment | null; legendarySeen: boolean; enemiesSeen: string[] }): void;
  onDisconnect(reason: string): void;
  onLobby(players: { id: string; name: string }[], endsIn: number, host: boolean): void;
  onStarted(): void;
  onTerminal(lines: string[], fragment: Fragment | null): void;
  onCinematic(script: { speaker: string; text: string; delay: number }[], done: () => void): void;
}

export class Game {
  me = '';
  runId = '';
  seed = '';
  host = false;
  started = false;
  room: RoomDesc | null = null;
  roomTotal = 15;
  snaps: SnapEntry[] = [];
  latest: Snapshot | null = null;
  timeOffset = 0; // serverTime - localTime
  offsetInit = false;
  priv: PlayerPrivate | null = null;
  mods: Mods;
  weapon: WeaponId = 'pulse';
  lastWeapon: WeaponId = 'breacher';
  alive = true;
  hp = 100;
  maxHp = 100;
  armor = 0;
  score = 0;
  ammo: Record<WeaponId, number> = { pulse: 1, breacher: 1, lance: 1, ripper: 1 };
  fireCd = 0;
  sprayT = 0;
  lanceCharge = 0;
  charging = false;
  chargeLoop: LoopHandle | null = null;
  ripperLoop: LoopHandle | null = null;
  slideLoop: LoopHandle | null = null;
  ripperOn = false;
  sendAcc = 0;
  consecutiveHits = 0;
  lastHitT = 0;
  killVariation = 0;
  overclockT = 0;
  pedestals: Pedestal[] | null = null;
  openDoors = new Set<number>();
  doorSentT = 0;
  runXp = 0;
  level = 1;
  streakT = 0;
  streakLevel = 0;
  enemiesSeen = new Set<string>();
  legendarySeen = false;
  whisperCd = 4;
  firstKillDone = false;
  lowHpWarned = false;
  heartbeatT = 0;
  bossName = '';
  ended = false;
  paused = false;
  spectate: string | null = null;
  roomFragment: Fragment | null = null;
  terminalPos: { x: number; z: number } | null = null;
  focusPed: Pedestal | null = null;
  lastSnapT = 0;
  replicaRoom = false;
  scrap = 0;
  shop: ShopItem[] | null = null;
  focusShop: ShopItem | null = null;
  shrine = false;
  shrinePos: { x: number; z: number } | null = null;
  latchedBy = new Set<number>();
  latchEl: HTMLDivElement | null = null;
  brokerVisits = 0;
  aware = false;
  prevAlive = new Map<number, EnemySnap>();
  private tmpV = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private killedIds = new Set<number>();
  reloadT = 0;
  reloadW: WeaponId = 'pulse';
  lookDX = 0;
  lookDY = 0;

  /** right mouse / L2: aim down sights. Each weapon aims its own way. */
  aimT = 0;
  private baseSpeedMult = 1;
  updateAim(dt: number) {
    const w = this.world, inp = w.input, lp = w.player;
    const can = this.alive && !this.paused && this.weapon !== 'ripper' && this.reloadT <= 0 && lp.s.slideT <= 0 && lp.s.dashT <= 0 && !this.cinematic;
    const want = can && inp.held.has('aim');
    if (want) lp.suppressSprint(0.12);
    const rate = this.weapon === 'lance' ? 7 : 11;
    this.aimT += ((want ? 1 : 0) - this.aimT) * Math.min(1, dt * rate);
    if (this.aimT < 0.002) this.aimT = 0;
    const Z: Record<WeaponId, number> = { pulse: 1.6, breacher: 1.2, lance: 3.2, ripper: 1 };
    w.zoom = 1 + (Z[this.weapon] - 1) * this.aimT;
    lp.params.speedMult = this.baseSpeedMult * (1 - 0.32 * this.aimT);
    const h = w.hud as unknown as { ads?: number; adsWeapon?: WeaponId; motion?: Record<string, unknown> };
    h.ads = this.aimT; h.adsWeapon = this.weapon;
    if (h.motion) h.motion.ads = this.aimT;
  }

  /** R / □: full reload. Breacher reloads itself after each shot; this tops it up early. */
  startReload() {
    if (this.reloadT > 0 || !this.alive || this.charging) return;
    const wid = this.weapon;
    if (wid !== 'ripper' && this.ammo[wid] >= 0.999) return;
    const dur = C.RELOAD_TIME[wid];
    this.reloadT = dur;
    this.reloadW = wid;
    vm(this.world.hud).reload?.(dur);
    if (wid !== 'ripper') this.net.send({ t: 'reload', weapon: wid });
    sfx.weaponSwitch();
    if (wid === 'breacher') setTimeout(() => sfx.breacherReload(), dur * 450);
    this.rumble(0.15, 0.3, 120);
  }
  cinematic = false;
  private hazardFx = 0;
  private lastPhase = 1;
  private gloryCooldown = 0;
  private pendingFragment: Fragment | null = null;
  maraText = '';

  constructor(public world: World, public net: Transport, public meta: Meta, public cb: GameCallbacks, public opts: { difficulty: Difficulty; seed?: string; solo: boolean }) {
    this.mods = computeMods([], metaLevel(meta).level);
    const lv = metaLevel(meta);
    this.level = lv.level;
    world.hud.setXp(lv.into / lv.need, lv.level);
    net.onMessage = (m) => this.onMessage(m);
    net.onClose = (r) => { if (!this.ended) this.cb.onDisconnect(r); };
    net.send({
      t: 'hello', name: meta.name, level: lv.level, runCount: meta.runCount,
      unlocked: unlockedFor(lv.level), replica: meta.replica, difficulty: opts.difficulty, seed: opts.seed, solo: opts.solo,
    });
    this.weapon = 'pulse';
    world.hud.weaponSwitch('pulse');
  }

  get runCount() { return this.meta.runCount; }

  /** controller haptics: strong = low-frequency motor, weak = high-frequency motor */
  rumble(strong: number, weak: number, ms: number) {
    if (this.meta.settings.rumble <= 0) return;
    const k = this.meta.settings.rumble;
    this.world.input.pad.rumble(strong * k, weak * k, ms);
  }

  private lightFlash = 0;
  private lightColor: [number, number, number] = [255, 255, 255];
  flashLightbar(r: number, g: number, b: number, t = 0.25) { this.lightColor = [r, g, b]; this.lightFlash = t; }

  /** DualSense adaptive triggers + lightbar + player LEDs (WebHID only). */
  private updateDualSense(dt: number) {
    const hid = this.world.input.pad.hid;
    if (!hid.connected) return;
    if (this.meta.settings.triggers && this.alive && !this.paused) {
      let r2: import('./gamepad').TriggerEffect;
      switch (this.weapon) {
        case 'pulse': r2 = { mode: 'vibrate', start: 0.25, freq: Math.round(8 * this.mods.fireRateMult * (this.overclockT > 0 ? 2 : 1)), amp: 0.55 }; break; // machine-gun chatter
        case 'breacher': r2 = { mode: 'section', start: 0.2, end: 0.55, force: 1 }; break; // heavy hammer break
        case 'lance': r2 = { mode: 'rigid', start: 0.05, force: 0.15 + this.lanceCharge * 0.85 }; break; // tension builds with charge
        default: r2 = { mode: 'vibrate', start: 0.1, freq: 38, amp: this.ripperOn ? 1 : 0.4 }; // chainsaw motor
      }
      const staggered = [...this.world.ents.enemies.values()].some((v) => v.last.anim === 'stagger');
      const l2: import('./gamepad').TriggerEffect = staggered ? { mode: 'section', start: 0.3, end: 0.6, force: 0.8 } : { mode: 'rigid', start: 0.4, force: 0.12 };
      hid.setTriggers(l2, r2);
    } else hid.setTriggers({ mode: 'off' }, { mode: 'off' });
    // lightbar mirrors your integrity; flashes on kills; strobes red on rampage
    const frac = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp)));
    let col: [number, number, number] = frac > 0.5 ? [Math.round((1 - frac) * 2 * 255), 255, 40] : [255, Math.round(frac * 2 * 255), 20];
    if (!this.alive) col = [40, 0, 0];
    if (this.streakLevel >= 4 && this.streakT > 0) col = Math.floor(performance.now() / 90) % 2 ? [255, 0, 0] : [80, 0, 0];
    if (this.lightFlash > 0) { this.lightFlash -= dt; col = this.lightColor; }
    hid.setLight(col[0], col[1], col[2]);
    hid.setPlayerLeds(Math.ceil(((this.latest?.combo ?? 1) - 1) / 2));
  }

  /** gentle stickiness for controller aiming — never on mouse */
  private aimAssist(dt: number) {
    const inp = this.world.input;
    if (!inp.padActive || this.meta.settings.aimAssist <= 0 || !this.alive) return;
    const lp = this.world.player;
    const fx = -Math.sin(lp.yaw) * Math.cos(lp.pitch), fy = Math.sin(lp.pitch), fz = -Math.cos(lp.yaw) * Math.cos(lp.pitch);
    const ex = lp.x, ey = lp.y + lp.eyeY, ez = lp.z;
    let best: { ang: number; yaw: number; pitch: number } | null = null;
    const solids = lp.boxes;
    for (const v of this.world.ents.enemies.values()) {
      const def = ENEMIES[v.type];
      const tx = v.x - ex, ty = v.y + def.height * 0.6 - ey, tz = v.z - ez;
      const d = Math.hypot(tx, ty, tz);
      if (d > 45 || d < 0.5) continue;
      const ang = Math.acos(Math.max(-1, Math.min(1, (tx * fx + ty * fy + tz * fz) / d)));
      const lim = inp.padAim ? 0.3 : 0.12;
      if (ang > lim || (best && ang > best.ang)) continue;
      if (raycastBoxes(solids, ex, ey, ez, tx / d, ty / d, tz / d, d) < d - 0.3) continue;
      best = { ang, yaw: Math.atan2(-tx, -tz), pitch: Math.atan2(ty, Math.hypot(tx, tz)) };
    }
    if (!best) return;
    let dy = best.yaw - lp.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    const k = this.meta.settings.aimAssist * (inp.padAim ? 6 : 2.2) * dt;
    lp.yaw += dy * Math.min(1, k);
    lp.pitch += (best.pitch - lp.pitch) * Math.min(1, k * 0.7);
  }

  // ───────────────────────────── messages ─────────────────────────────

  onMessage(m: ServerMsg) {
    switch (m.t) {
      case 'welcome':
        this.me = m.id; this.runId = m.runId; this.seed = m.seed; this.host = m.host;
        this.world.hud.setSeed(m.seed);
        if (m.state === 'lobby' && !this.opts.solo) this.cb.onLobby([], m.lobbyEndsIn, m.host);
        break;
      case 'lobby':
        if (!this.started) this.cb.onLobby(m.players, m.endsIn, this.host);
        break;
      case 'snap': this.onSnap(m.s); break;
      case 'events': for (const e of m.ev) this.onEvent(e); break;
      case 'priv': this.onPriv(m.p); break;
      case 'error': this.world.hud.chat('SERVER: ' + m.msg); break;
      default: break;
    }
  }

  onSnap(s: Snapshot) {
    const now = performance.now() / 1000;
    const off = s.t - now;
    if (!this.offsetInit) { this.timeOffset = off; this.offsetInit = true; }
    else this.timeOffset += (off - this.timeOffset) * 0.05;
    if (off > this.timeOffset + 0.25 || off < this.timeOffset - 0.5) this.timeOffset = off; // resync after pauses
    this.snaps.push({ t: s.t, s });
    if (this.snaps.length > 30) this.snaps.shift();
    this.latest = s;
    this.lastSnapT = now;
    const me = s.players.find((p) => p.id === this.me);
    if (me) {
      this.hp = me.hp; this.maxHp = me.maxHp; this.armor = me.armor; this.score = me.score;
      if (me.alive && !this.alive) {
        this.alive = true;
        this.world.hud.face.dead = false;
      }
      this.alive = me.alive;
    }
    this.world.ents.syncProjectiles(s.projectiles);
    this.world.ents.syncMines(s.mines);
    // doors
    for (const d of s.doors) {
      if (d.open && !this.openDoors.has(d.slot)) { this.openDoors.add(d.slot); this.world.map.setDoorOpen(d.slot, true); this.world.setOpenDoors(this.openDoors); }
    }
    // music layers
    const aware = s.enemies.length > 0 && s.enemies.some((e) => e.anim !== 'idle');
    this.aware = aware;
    music.setLayers({
      combat: aware || s.state === 'boss',
      aggression: s.combo >= 3 || this.streakLevel >= 2,
      rampage: s.combo >= 6 || (this.streakLevel >= 4 && this.streakT > 0),
      boss: this.room?.kind === 'boss' && s.bossHp > 0,
    });
    music.setIntensity(Math.min(1, (s.combo - 1) / 8));
  }

  onPriv(p: PlayerPrivate) {
    const hadPeds = !!this.priv?.pedestals;
    this.priv = p;
    this.mods = computeMods(p.powerups, this.level);
    const lp = this.world.player;
    this.applyParams();
    this.scrap = p.scrap;
    this.shrine = p.shrine;
    if (p.shop) this.shop = p.shop;
    // server ammo is authoritative but we predict locally; only correct big drift
    for (const w of WEAPON_ORDER) if (Math.abs(p.ammo[w] - this.ammo[w]) > 0.2) this.ammo[w] = p.ammo[w];
    if (!p.pedestals && hadPeds) this.pedestals = null;
    this.world.hud.setPowerups(p.powerups);
  }

  /** physics params from mods + room mutator + combo (Blood Rush) */
  applyParams() {
    const lp = this.world.player;
    const mut = this.room?.mutator;
    const combo = this.latest?.combo ?? 1;
    lp.params = {
      speedMult: (this.baseSpeedMult = this.mods.speedMult * (mut === 'overclock' ? 1.15 : 1) * (1 + this.mods.bloodrush * (combo - 1))) * (1 - 0.32 * this.aimT),
      jumpMult: this.mods.jumpMult, airControl: mut === 'lowgrav' ? Math.min(1, this.mods.airControl + 0.2) : this.mods.airControl,
      maxDash: this.mods.maxDash, dashCooldown: this.mods.dashCooldown, extraJumps: this.mods.extraJumps, wallRunTime: this.mods.wallRunTime,
      gravityMult: mut === 'lowgrav' ? 0.45 : 1,
    };
  }

  // ───────────────────────────── events: the juice ─────────────────────────────

  onEvent(e: GameEvent) {
    const w = this.world;
    const mine = (id: string) => id === this.me;
    switch (e.e) {
      case 'roomLoad': this.loadRoom(e.room, e.spawns, e.total); break;
      case 'hit': {
        const self = mine(e.by);
        const v = w.ents.enemies.get(e.enemy);
        w.ents.hitFlash(e.enemy);
        const mech = v ? v.type === 'drone' || v.type === 'spider' || v.type === 'warden' : false;
        w.gore.spray(e.x, e.y, e.z, e.dx, e.dy * 0.5 + 0.2, e.dz, Math.min(12, 6 + Math.floor(e.dmg / 12)), 6, mech);
        if (mech) w.gore.sparks(e.x, e.y, e.z, 3);
        if (self) {
          const big = e.dmg >= 60;
          w.hud.pops.spawn(e.x, e.y + 0.3, e.z, String(e.dmg), 'dmg' + (e.head ? ' head' : '') + (big ? ' big' : ''));
          const now = performance.now();
          this.consecutiveHits = now - this.lastHitT < 600 ? this.consecutiveHits + 1 : 0;
          this.lastHitT = now;
          sfx.hit(this.consecutiveHits);
          this.rumble(0, 0.22, 30);
          if (e.head) sfx.headshot();
          w.hud.hitmarker(false, e.head);
          w.shake(C.SCREEN_SHAKE_HIT);
          if (e.weapon === 'ripper') { w.gore.spray(e.x, e.y, e.z, -this.dir.x, 0.5, -this.dir.z, 10, 7); sfx.ripperHit(); w.shake(3); }
        }
        break;
      }
      case 'kill': this.onKill(e); break;
      case 'stagger': {
        const v = w.ents.enemies.get(e.enemy);
        if (v) { sfx.enemyPain(v.type, v.group.position); w.gore.sparks(v.x, v.y + 1, v.z, 10); }
        break;
      }
      case 'glory': {
        if (mine(e.by)) {
          w.slowmo(C.GLORY_SLOWMO, 0.25);
          w.lookLockT = C.GLORY_SLOWMO;
          w.lookTarget = new THREE.Vector3(e.x, e.y, e.z);
          w.hud.glory();
          if (this.mods.reaper) w.player.s.dashCharges = this.mods.maxDash;
          sfx.gloryKill();
          this.rumble(1, 1, 380);
          this.flashLightbar(255, 60, 0, 0.4);
          w.shake(12);
          w.flash(0.35);
          w.tint('#ff2200', 0.5);
          w.hud.pops.spawn(e.x, e.y + 0.8, e.z, `+${Math.round(C.GLORY_HEAL * this.mods.gloryHealMult)} HP`, 'score', 1.2, 1.6);
          w.say('gloryKill', this.runCount, 2, 10);
        }
        w.gore.burst(e.x, e.y, e.z, 0, 0, 14, e.type === 'brute' ? 1.6 : 1.1);
        w.gore.spray(e.x, e.y, e.z, 0, 1, 0, 40, 9);
        break;
      }
      case 'playerHit': {
        if (mine(e.id)) {
          const lp = w.player;
          const dx = e.x - lp.x, dz = e.z - lp.z;
          const rx = Math.cos(lp.yaw), rz = -Math.sin(lp.yaw);
          const side = dx * rx + dz * rz;
          w.hud.face.hurt(Math.abs(side) > 0.5 ? side < 0 : null);
          w.hurtVignette(Math.min(0.9, 0.25 + e.dmg / 40));
          w.shake(3 + e.dmg / 6);
          sfx.playerHurt(e.dmg);
          this.rumble(Math.min(1, 0.3 + e.dmg / 30), 0.35, 160 + e.dmg * 4);
          this.flashLightbar(255, 0, 0, 0.15);
          if (e.armorBroke) { sfx.armorBreak(); w.hud.announcer.show('ARMOR BROKEN', 'sub'); }
          if (e.kx !== undefined) lp.knock(e.kx, e.ky ?? 0, e.kz ?? 0);
        }
        break;
      }
      case 'playerDeath': {
        if (mine(e.id)) {
          this.alive = false;
          w.hud.face.dead = true;
          sfx.playerDeath();
          this.rumble(1, 0.3, 700);
          music.death();
          w.slowmo(0.8, 0.3);
          w.flash(0.6);
          w.glitch(1);
          w.say('death', this.runCount, 5, 0);
          this.stopLoops();
          if (!this.opts.solo) w.hud.announcer.show('SIGNAL LOST', 'big', 'SPECTATING — RESPAWN NEXT ROOM', true);
        } else {
          const p = this.latest?.players.find((pp) => pp.id === e.id);
          w.hud.killfeed.push(e.by.toUpperCase(), p?.name ?? 'ALLY', ['DOWN'], false);
          w.say('allyDown', this.runCount, 2, 8);
        }
        break;
      }
      case 'streak': {
        if (mine(e.id)) {
          this.streakLevel = e.level;
          this.streakT = 6;
          const txt = STREAK_TEXT[e.level] + (e.level === 4 && e.kills > 5 ? ` x${e.kills}` : '');
          w.hud.announcer.show(txt, 'l' + e.level, undefined, true);
          w.cast.say('announcer', ANNOUNCER.streak[e.level], e.level >= 3 ? 3 : 0);
          sfx.streak(e.level);
          this.rumble(0.2 * e.level, 0.25 * e.level, 120 + e.level * 60);
          w.hud.face.grin(1 + e.level * 0.4);
          if (e.level >= 2) w.tint(e.level >= 4 ? '#ff0000' : e.level === 3 ? '#ff6a00' : '#ffaa00', 0.3 + e.level * 0.1);
          if (e.level >= 3) w.flash(0.25);
          if (e.level >= 3) w.shake(5);
          const ctx = (['streak2', 'streak2', 'streak3', 'streak4', 'streak5'] as const)[e.level];
          w.say(ctx, this.runCount, 2, e.level >= 4 ? 5 : 8);
        }
        break;
      }
      case 'enemyFire': {
        const pos = { x: e.x, y: e.y, z: e.z };
        if (e.type === 'stalker') { sfx.stalkerShot(pos); w.fx.muzzle(e.x, e.y, e.z, new THREE.Color(5, 0.6, 0.4), 1.4); w.r.flashLight(e.x, e.y, e.z, 0xff3322, 20, 10, 0.08); }
        else {
          const kind = e.type === 'warden' ? (this.room?.biome === 0 || this.room?.biome === 5 ? 'plasma' : 'orb') : e.type === 'spider' ? 'spit' : e.type === 'replica' ? 'replica' : e.type === 'mortar' ? 'rocket' : e.type === 'wraith' ? 'orb' : e.type === 'bulwark' ? 'plasma' : 'bolt';
          sfx.enemyShoot(kind, pos);
          w.fx.muzzle(e.x, e.y, e.z, projColor(kind), e.type === 'warden' ? 2 : 0.7);
        }
        break;
      }
      case 'enemyAlert': {
        const v = w.ents.enemies.get(e.enemy);
        const pos = v ? { x: v.x, y: v.y + 1, z: v.z } : undefined;
        if (!pos) break;
        if (e.type === 'grunt') sfx.gruntVoice(pos);
        else if (e.type === 'brute') sfx.bruteRoar(pos);
        else if (e.type === 'stalker') sfx.stalkerChirp(pos);
        else if (e.type === 'drone') sfx.droneWhine(pos);
        else if (e.type === 'spider' || e.type === 'leech') sfx.spiderTick(pos);
        else if (e.type === 'bomber') { sfx.mineArm(pos); setTimeout(() => sfx.mineArm(pos), 150); }
        else if (e.type === 'sentinel') sfx.stalkerChirp(pos);
        else if (e.type === 'mortar') sfx.bruteStomp(pos);
        else if (e.type === 'bulwark') sfx.gruntVoice(pos);
        else if (e.type === 'wraith') sfx.teslaArc(pos);
        // enemies say your name (run 4+)
        if (this.runCount >= 3 && e.type !== 'replica' && this.whisperCd <= 0 && Math.random() < 0.35) {
          this.whisperCd = 7;
          const line = ENEMY_WHISPERS[Math.floor(Math.random() * ENEMY_WHISPERS.length)].replace(/\{name\}/g, this.meta.name);
          w.hud.pops.spawn(pos.x, pos.y + 1.2, pos.z, line, 'whisper', 2.4, 0.3);
          w.cast.say('enemy', line, 0);
        }
        break;
      }
      case 'explosion': {
        const big = e.kind === 'boss';
        const size = big ? e.r * 0.9 : e.r * 1.3;
        if (e.kind === 'tesla') { w.fx.ring(e.x, 0, e.z, e.r, new THREE.Color(1.5, 3, 6)); sfx.teslaArc({ x: e.x, y: e.y, z: e.z }); break; }
        w.fx.explosion(e.x, e.y, e.z, size);
        w.r.flashLight(e.x, e.y + 0.5, e.z, 0xff8a3a, big ? 60 : 30, e.r * 4, 0.3);
        if (big) w.fx.ring(e.x, 0, e.z, e.r, new THREE.Color(4, 1.5, 0.4));
        const d = Math.hypot(e.x - w.player.x, e.z - w.player.z);
        w.shake(Math.max(0, (big ? 14 : 8) - d * 0.4));
        if (d < 18) this.rumble(Math.min(1, (big ? 1.2 : 0.8) - d * 0.05), 0.3, big ? 400 : 200);
        sfx.explosion({ x: e.x, y: e.y, z: e.z }, Math.min(3, e.r / 2));
        if (e.y < 1.5) w.gore.decal(e.x, e.z, Math.min(4, e.r * 0.8), true);
        break;
      }
      case 'arc': w.fx.arc(e.x1, e.y1, e.z1, e.x2, e.y2, e.z2); sfx.teslaArc({ x: e.x2, y: e.y2, z: e.z2 }); break;
      case 'roomClear': {
        sfx.roomClear();
        w.hud.announcer.show(this.room?.kind === 'boss' ? 'WARDEN DESTROYED' : 'ROOM CLEARED', this.room?.kind === 'boss' ? 'gold big' : 'l3', `+${e.xp} XP`);
        this.gainXp(e.xp);
        w.cast.say('announcer', this.room?.kind === 'boss' ? ANNOUNCER.wardenDown : ANNOUNCER.roomClear[Math.floor(Math.random() * 3)], this.room?.kind === 'boss' ? 2 : 0);
        w.say(this.room?.kind === 'boss' ? 'bossKill' : 'roomClear', this.runCount, 2, 4);
        w.hud.setBoss(null);
        break;
      }
      case 'wave': w.hud.announcer.show(`WAVE ${e.wave}`, 'l2', e.wave === 3 ? 'FINAL WAVE' : undefined); if (e.wave > 1) w.say('arenaWave', this.runCount, 1, 5); break;
      case 'pedestals': if (mine(e.id)) this.showPedestals(e.pedestals); break;
      case 'pick': {
        if (mine(e.id)) {
          const def = POWERUP_BY_ID[e.powerup];
          sfx.powerupPick();
          const shards = w.ents.shatterPedestals(-1);
          for (const s of shards) w.fx.shards(s.x, 1, s.z, new THREE.Color(s.color));
          if (shards.length > 1) setTimeout(() => sfx.pedestalShatter(), 120);
          w.hud.announcer.show(def.name, e.rarity === 'legendary' ? 'gold' : 'sub', def.desc({ common: 0.4, rare: 1, epic: 2, legendary: 1 }[e.rarity]));
          w.flash(0.2);
          this.pedestals = null;
          w.say('pick', this.runCount, 1, 10);
        }
        break;
      }
      case 'synergy': {
        if (mine(e.id)) {
          const s = SYNERGIES.find((x) => x.id === e.synergy);
          w.flash(1);
          w.glitch(1);
          sfx.synergyDiscover();
          this.rumble(0.8, 1, 500);
          this.flashLightbar(120, 255, 120, 1.2);
          w.hud.announcer.show(s?.name ?? 'NEW PROTOCOL', 'green big', 'HIDDEN SYNERGY DISCOVERED', true);
          w.cast.say('announcer', s?.name ?? ANNOUNCER.synergy, 3);
          w.say('synergy', this.runCount, 4, 0);
          if (!this.meta.synergies.includes(e.synergy)) this.meta.synergies.push(e.synergy);
        }
        break;
      }
      case 'doorsOpen': {
        sfx.doorOpen();
        break;
      }
      case 'bossIntro': {
        this.bossName = e.name;
        music.silence(2.2);
        sfx.bossIntro();
        this.rumble(1, 0.1, 900);
        setTimeout(() => sfx.wardenRoar(), 900);
        w.hud.announcer.show(e.name, 'big', e.title, true);
        w.wardenName = e.name;
        { const wv = WARDEN_VOICE[this.room?.biome ?? 0]; setTimeout(() => w.cast.say('warden', wv.intro[Math.floor(Math.random() * wv.intro.length)], 3), 1700); }
        if (this.room?.biome === 6) setTimeout(() => w.say('handlerBoss', this.runCount, 5, 0), 5200);
        w.shake(10);
        w.say('bossIntro', this.runCount, 3, 0);
        this.lastPhase = 1;
        break;
      }
      case 'bossPhase': {
        if (e.phase !== this.lastPhase) {
          this.lastPhase = e.phase;
          sfx.wardenRoar();
          w.shake(14);
          w.flash(0.4);
          w.hud.announcer.show('PHASE ' + 'I'.repeat(e.phase), 'l4', undefined, true);
          { const wv = WARDEN_VOICE[this.room?.biome ?? 0]; w.cast.say('warden', wv.phase[Math.floor(Math.random() * wv.phase.length)], 3); }
          if (this.room?.biome === 6) setTimeout(() => w.say('handlerBossPhase', this.runCount, 5, 0), 2500);
          w.say('bossPhase', this.runCount, 2, 0);
        }
        break;
      }
      case 'mineArm': {
        const m = w.ents.mines.get(e.id);
        if (m) sfx.mineArm(m.mesh.position);
        break;
      }
      case 'pickup': {
        if (mine(e.id)) {
          this.rumble(0.1, 0.4, 60);
          if (e.kind === 'hp') { sfx.pickupHealth(); w.hud.pops.spawn(w.player.x, w.player.y + 1.2, w.player.z - 0.8, `+${e.amount} HP`, 'score', 0.9); }
          else if (e.kind === 'armor') { sfx.pickupArmor(); w.hud.pops.spawn(w.player.x, w.player.y + 1.2, w.player.z - 0.8, `+${e.amount} ARMOR`, 'score', 0.9); }
          else { sfx.pickupAmmo(); for (const k of WEAPON_ORDER) this.ammo[k] = Math.min(1, this.ammo[k] + e.amount); }
        }
        break;
      }
      case 'drop': w.ents.addDrop(e.did, e.kind, e.x, e.y, e.z); break;
      case 'dropGone': w.ents.removeDrop(e.did); break;
      case 'timerFail': w.hud.announcer.show('PURGE PROTOCOL', 'l4', 'TIME EXPIRED', true); w.say('gauntletFail', this.runCount, 3, 0); sfx.staticBurst(0.6); break;
      case 'runEnd': this.finish(e.summary); break;
      case 'chat': w.hud.chat(e.text); break;
      case 'telegraph': w.fx.telegraph(e.x, e.z, e.r, e.t); break;
      case 'shop': if (mine(e.id)) { this.shop = e.items; w.ents.showShop(e.items); } break;
      case 'buy': {
        if (mine(e.id)) {
          w.ents.markSold(e.slot);
          sfx.powerupPick();
          this.rumble(0.3, 0.6, 120);
          const def = e.item.offer ? POWERUP_BY_ID[e.item.offer.id] : null;
          w.hud.announcer.show(def ? def.name : e.item.kind === 'heal' ? 'REPAIRED' : 'PLATED', 'sub', `-${e.item.price} SCRAP`);
          w.cast.say('broker', pickLine(BROKER_LINES.buy), 1);
          if (this.shop) { const it = this.shop.find((x) => x.slot === e.slot); if (it) it.sold = true; }
        }
        break;
      }
      case 'shrine': {
        if (mine(e.id)) {
          this.shrine = false;
          sfx.levelUp();
          w.flash(0.6);
          w.tint('#fff0c0', 0.5);
          w.hud.announcer.show('RESTORED', 'gold', 'INTEGRITY 100%');
          this.rumble(0.2, 0.5, 400);
          if (w.map.shrine) w.map.shrine.visible = false;
        }
        break;
      }
      case 'trial': {
        if (e.state === 'start') { w.hud.announcer.show('TRIAL', 'l4', `CLEAR IN ${Math.round(e.time)}s FOR A LEGENDARY`, true); w.cast.say('announcer', ANNOUNCER.trialStart, 2); w.say('trialEnter', this.runCount, 2, 0); }
        else if (e.state === 'win') { w.hud.announcer.show('TRIAL COMPLETE', 'gold big', 'LEGENDARY UNLOCKED', true); w.cast.say('announcer', ANNOUNCER.trialWin, 3); w.say('trialWin', this.runCount, 2, 0); w.flash(0.6); }
        else { w.hud.announcer.show('TRIAL FAILED', 'l4', 'FINISH THEM ANYWAY', true); w.cast.say('announcer', ANNOUNCER.trialFail, 2); w.say('trialFail', this.runCount, 2, 0); }
        break;
      }
      case 'scrap': if (mine(e.id)) { sfx.comboTick(3); w.hud.pops.spawn(w.player.x, w.player.y + 1.4, w.player.z - 0.6, `+${e.amount} ◆`, 'xp', 0.6, 1.2); if (Math.random() < 0.04) w.say('scrap', this.runCount, 0, 40); } break;
      case 'latch': {
        if (mine(e.id)) {
          if (e.on) { this.latchedBy.add(e.enemy); w.say('leech', this.runCount, 1, 20); sfx.gibSplat(); this.rumble(0.6, 0.2, 300); }
          else this.latchedBy.delete(e.enemy);
          if (this.latchedBy.size && !this.latchEl) { this.latchEl = document.createElement('div'); this.latchEl.className = 'latch-fx'; document.getElementById('root')!.appendChild(this.latchEl); }
          if (!this.latchedBy.size && this.latchEl) { this.latchEl.remove(); this.latchEl = null; }
        }
        break;
      }
      case 'shieldHit': {
        w.fx.impact(e.x, e.y, e.z, new THREE.Color(1.5, 2.5, 5));
        sfx.ripperHit();
        break;
      }
      case 'phoenix': {
        if (mine(e.id)) {
          w.flash(1); w.tint('#ff6600', 0.9); w.shake(16); w.slowmo(0.8, 0.3);
          w.hud.announcer.show('PHOENIX', 'gold big', 'NOT YET', true);
          w.cast.say('announcer', 'PHOENIX', 3);
          this.rumble(1, 1, 700);
          w.hud.face.dead = false;
        }
        break;
      }
      case 'extractOffer': {
        w.hud.announcer.show('EXTRACTION AVAILABLE', 'green big', 'WALK OUT — OR GO DEEPER', false);
        setTimeout(() => { w.cast.say('announcer', ANNOUNCER.extract, 1); w.say('extractChoice', this.runCount, 3, 0); }, 2500);
        break;
      }
      case 'trueEnding': {
        // THE HANDLER is destroyed. Everything stops.
        music.death();
        const wv = WARDEN_VOICE[6];
        w.cast.say('warden', wv.death[0], 3);
        this.cinematic = true;
        setTimeout(() => this.cb.onCinematic(TRUE_ENDING_SCRIPT, () => { this.cinematic = false; music.resume(); this.meta.trueEndingSeen = true; }), 2500);
        break;
      }
      case 'replica': {
        // the Handler will not comment.
        music.silence(3);
        this.replicaRoom = true;
        break;
      }
      default: break;
    }
  }

  onKill(e: Extract<GameEvent, { e: 'kill' }>) {
    const w = this.world;
    const self = e.by === this.me;
    this.killedIds.add(e.enemy);
    const v = w.ents.kill(e.enemy, e.dx, e.dz);
    const type = e.type;
    this.enemiesSeen.add(type);
    // gore: dismemberment scales with the violence
    const n = type === 'warden' ? 60 : type === 'brute' ? 22 : type === 'drone' ? 7 : 11;
    const scale = type === 'warden' ? 2.5 : type === 'brute' ? 1.5 : 1;
    w.gore.burst(e.x, e.y, e.z, e.dx, e.dz, n + (e.head ? 4 : 0), scale);
    w.gore.spray(e.x, e.y, e.z, e.dx, 0.4, e.dz, type === 'warden' ? 120 : 30, 8, type === 'drone' || type === 'spider');
    w.gore.decal(e.x + e.dx * 0.5, e.z + e.dz * 0.5, type === 'brute' || type === 'warden' ? 3 : 1.6);
    sfx.gibSplat(v ? v.group.position : undefined);
    if (type === 'drone' || type === 'spider' || type === 'warden') sfx.metalDebris(v ? v.group.position : undefined);
    sfx.enemyDeath(type, { x: e.x, y: e.y, z: e.z });
    if (self) {
      sfx.kill(this.killVariation++);
      this.rumble(0.5, 0.75, 90);
      this.flashLightbar(255, 255, 255, 0.08);
      w.hud.hitmarker(true, e.head);
      w.shake(C.SCREEN_SHAKE_KILL);
      const tags: string[] = [];
      if (e.head) tags.push('HEADSHOT');
      if (e.glory) tags.push('GLORY');
      if (e.elite) tags.push('ELITE');
      if (e.combo >= 5) tags.push('x' + e.combo);
      w.hud.killfeed.push('YOU', `${ENEMY_NAMES[type]}_${String(e.enemy % 100).padStart(2, '0')}`, tags, true);
      w.hud.pops.spawn(e.x, e.y + 0.9, e.z, `+${e.score}`, 'score', C.SCORE_POPUP_DURATION, 1.8);
      if (e.combo > 1) sfx.comboTick(e.combo);
      this.gainXp(C.XP_PER_KILL * Math.min(e.combo, 6) * (e.elite ? 1.5 : 1));
      if (this.mods.overclock) this.overclockT = 3;
      if (!this.firstKillDone) { this.firstKillDone = true; w.say('firstKill', this.runCount, 2, 0); }
      else if (e.head) w.say('headshot', this.runCount, 0, 12);
      else w.say('kill', this.runCount, 0, 14);
      w.r.flashLight(e.x, e.y, e.z, 0xff5530, 14, 6, 0.12);
    } else {
      const p = this.latest?.players.find((pp) => pp.id === e.by);
      if (p) w.hud.killfeed.push(p.name, ENEMY_NAMES[type], e.head ? ['HEADSHOT'] : [], false);
    }
    if (e.glory) w.slowmo(C.SLOWMO_GLORY_KILL, 0.35);
    if (type === 'warden') {
      w.slowmo(1.2, 0.2); w.flash(1); w.shake(20);
      const b = this.room?.biome ?? 0;
      if (b !== 6) w.cast.say('warden', WARDEN_VOICE[b].death[0], 3);
      else setTimeout(() => w.say('handlerBossDeath', this.runCount, 6, 0), 400);
    }
  }

  gainXp(n: number) {
    this.runXp += n;
    const lv = levelFromXp(this.meta.xp + this.runXp);
    if (lv.level > this.level) {
      // level ups mid-run are celebrated now, banked on death
      this.world.hud.announcer.show(`LEVEL ${lv.level}`, 'gold', 'PERMANENT UPGRADE');
      this.world.cast.say('announcer', ANNOUNCER.levelUp, 1);
      sfx.levelUp();
      this.world.say('levelUp', this.runCount, 1, 10);
      this.level = lv.level;
    }
    this.world.hud.setXp(lv.into / lv.need, lv.level, true);
  }

  showPedestals(list: Pedestal[]) {
    const w = this.world;
    this.pedestals = list;
    w.ents.showPedestals(list);
    sfx.pedestalRise();
    w.say('pedestal', this.runCount, 1, 20);
    const best = list.reduce((a, p) => Math.max(a, ['common', 'rare', 'epic', 'legendary'].indexOf(p.offer.rarity)), 0);
    const rarity = (['common', 'rare', 'epic', 'legendary'] as const)[best];
    setTimeout(() => {
      if (this.ended) return;
      sfx.rarityReveal(rarity);
      if (rarity === 'legendary') {
        this.legendarySeen = true;
        this.rumble(0.6, 1, 800);
        this.flashLightbar(255, 200, 40, 2.5);
        w.flash(0.8);
        w.tint('#ffcc00', 0.6);
        w.hud.announcer.show('LEGENDARY', 'gold big', 'IT CHANGES HOW YOU PLAY', true);
        w.cast.say('announcer', ANNOUNCER.legendary, 3);
        w.say('legendary', this.runCount, 3, 0);
        this.meta.legendariesSeen++;
      } else if (rarity === 'epic') {
        w.flash(0.3);
      }
      if (list.some((p) => POWERUP_BY_ID[p.offer.id]?.category === 'curse')) setTimeout(() => w.say('curse', this.runCount, 1, 30), 1600);
    }, 1300);
  }

  loadRoom(room: RoomDesc, spawns: { id: string; x: number; y: number; z: number; yaw: number }[], total: number) {
    const w = this.world;
    const first = !this.started;
    this.started = true;
    if (first) this.cb.onStarted();
    this.room = room;
    this.roomTotal = total;
    this.openDoors.clear();
    this.pedestals = null;
    this.killedIds.clear();
    this.replicaRoom = false;
    this.terminalPos = null;
    this.roomFragment = null;
    this.snaps = [];
    w.fade(true);
    const geo = generateRoom(room, total);
    const anomalyText = ANOMALY_TEXTS[(room.seed >>> 3) % ANOMALY_TEXTS.length];
    setTimeout(() => {
      w.loadGeo(geo, {
        runCount: this.runCount,
        corpses: this.runCount >= 8,
        whisper: room.kind === 'anomaly' ? anomalyText.replace(/\{name\}/g, this.meta.name) : undefined,
        flicker: room.kind === 'anomaly' ? 0.5 : handlerPhase(this.runCount) >= 3 ? 0.15 : 0.04,
      });
      const sp = spawns.find((s) => s.id === this.me);
      if (sp) {
        w.player.teleport(sp.x, sp.y, sp.z, sp.yaw);
        if (!this.alive) { this.alive = true; w.hud.face.dead = false; music.resume(); }
      }
      w.fade(false);
      // anything offered during the fade survives the rebuild
      if (this.shop) w.ents.showShop(this.shop);
      if (this.pedestals) w.ents.showPedestals(this.pedestals);
      const term = geo.decor.find((d) => d.kind === 'terminal');
      if (term) this.terminalPos = { x: term.x + term.nx * 1.5, z: term.z + term.nz * 1.5 };
    }, first ? 0 : 220);

    const biome = BIOME_NAMES[room.biome];
    const depth = room.index + 1;
    w.depth = depth;
    w.hud.setRoom(depth > total ? `${biome} · DEPTH ${depth}` : `${biome} · ${depth}/${total}`);
    music.setBiome(room.biome);
    if (first) { music.start(); music.resume(); }
    w.hud.setBoss(null);
    // mutators
    const mut = room.mutator;
    w.hud.setMutator(mut ? `${MUTATOR_INFO[mut]?.name ?? MUTATOR_NAME[mut]}` : null);
    w.muteHandler = mut === 'silence';
    if (mut === 'silence') music.silence(9999); else if (!first) music.resume();
    this.applyParams();
    this.shop = null; this.shrinePos = null; this.shrine = false; this.latchedBy.clear();
    if (this.latchEl) { this.latchEl.remove(); this.latchEl = null; }
    const sh = geo.decor.find((d) => d.kind === 'shrine');
    if (sh) { this.shrinePos = { x: sh.x, z: sh.z }; this.shrine = true; }
    if (mut) setTimeout(() => { w.hud.announcer.show(MUTATOR_INFO[mut]?.name ?? MUTATOR_NAME[mut], 'l4', MUTATOR_INFO[mut]?.desc); w.cast.say('announcer', MUTATOR_INFO[mut]?.name ?? MUTATOR_NAME[mut], 1); if (mut !== 'silence') w.say('mutator', this.runCount, 1, 30); }, 1400);
    // narration
    if (first) w.say('runStart', this.runCount, 3, 0);
    else if (room.index % 5 === 0 && room.kind !== 'boss') {
      const info = BIOME_INFO[room.biome];
      const endless = depth > total;
      w.hud.announcer.show(endless ? `DEPTH ${depth}` : biome, 'big', endless ? endlessLine(depth) : info?.subtitle ?? `SECTOR ${room.biome + 1}`);
      if (endless) { w.cast.say('announcer', ANNOUNCER.depth(depth), 2); w.say('endless', this.runCount, 3, 0); }
      else if (room.index >= 15 && room.index % 5 === 0) w.say(room.index === 15 ? 'deeper' : 'depthEnter', this.runCount, 3, 0);
      const line = biomeLine(room.biome, this.runCount);
      if (line && !w.muteHandler) setTimeout(() => w.voice.say(line, { runCount: this.runCount, priority: 3 }), 2200);
      if (info?.intro) info.intro.forEach((t, i) => setTimeout(() => w.hud.pops.spawn(w.player.x + Math.sin(w.player.yaw) * -6, 2.6, w.player.z - Math.cos(w.player.yaw) * 6, t, 'whisper', 3.2, 0.15), 3500 + i * 2600));
    }
    else if (room.kind === 'shop') {
      this.brokerVisits++;
      const lore = this.meta.runCount + this.brokerVisits > 4 && Math.random() < 0.4;
      setTimeout(() => w.cast.say('broker', lore ? pickLine(BROKER_LINES.lore) : pickLine(BROKER_LINES.greet), 2), 900);
      w.hud.announcer.show('THE BROKER', 'green', 'SCRAP FOR SALVATION');
      w.say('shopEnter', this.runCount, 1, 30);
    }
    else if (room.kind === 'sanctuary') {
      w.hud.announcer.show('SANCTUARY', 'gold', 'REST. READ. HEAL.');
      w.say('sanctuaryEnter', this.runCount, 1, 0);
      this.roomFragment = null;
      this.maraText = maraLog(this.runCount);
    }
    else if (room.kind === 'trial') { /* announced by the trial event */ }
    else if (room.kind === 'anomaly') {
      w.say('anomalyEnter', this.runCount, 3, 0);
      // corrupted doors carry story fragments
      const f = nextFragment(this.meta.fragments, this.runCount, room.biome);
      if (f) { this.roomFragment = f; this.pendingFragment = f; this.meta.fragments.push(f.id); w.hud.announcer.show('FRAGMENT DETECTED', 'green', 'ACCESS THE TERMINAL [E]'); }
      if (this.runCount >= 8) setTimeout(() => w.say('corpseRoom', this.runCount, 2, 0), 4000);
    }
    else if (room.kind === 'gauntlet') { w.hud.announcer.show('GAUNTLET', 'l3', 'BEAT THE CLOCK'); w.say('gauntlet', this.runCount, 2, 0); }
    else if (room.kind === 'arena') { w.hud.announcer.show('ARENA', 'l3', '3 WAVES'); }
    else if (room.kind !== 'boss') {
      if (room.door === 'elite') w.say('eliteDoor', this.runCount, 1, 0);
      else if (room.door === 'unknown') w.say('unknownDoor', this.runCount, 1, 0);
      else w.say('roomEnter', this.runCount, 1, 10);
    }
  }

  finish(summary: RunSummary[]) {
    if (this.ended) return;
    this.ended = true;
    this.stopLoops();
    const mineS = summary.find((s) => s.id === this.me) ?? summary[0];
    // a story fragment for the death, if earned
    let frag: Fragment | null = null;
    if (mineS && (mineS.rooms >= 3 || mineS.victory || this.runCount < 3)) {
      frag = nextFragment(this.meta.fragments, this.runCount);
      if (frag) this.meta.fragments.push(frag.id);
    }
    for (const t of this.enemiesSeen) if (!this.meta.enemiesSeen.includes(t)) this.meta.enemiesSeen.push(t);
    this.cb.onEnd(mineS, this.me, { fragment: frag ?? this.pendingFragment, legendarySeen: this.legendarySeen, enemiesSeen: [...this.enemiesSeen] });
  }

  stopLoops() {
    this.world.input.pad.hid.setTriggers({ mode: 'off' }, { mode: 'off' });
    this.chargeLoop?.stop(); this.chargeLoop = null;
    this.ripperLoop?.stop(); this.ripperLoop = null;
    this.slideLoop?.stop(); this.slideLoop = null;
    if (this.ripperOn) { this.ripperOn = false; this.net.send({ t: 'ripper', on: false }); }
    this.charging = false; this.lanceCharge = 0;
  }

  dispose() {
    this.stopLoops();
    this.net.close();
    this.world.ents.clearRoom();
  }

  // ───────────────────────────── interpolation ─────────────────────────────

  private sample(): { enemies: EnemySnap[]; players: Map<string, { x: number; y: number; z: number }> } {
    const out: EnemySnap[] = [];
    const players = new Map<string, { x: number; y: number; z: number }>();
    if (!this.snaps.length) return { enemies: out, players };
    const delay = (this.net.local ? C.LOCAL_INTERP_BUFFER_MS : C.INTERP_BUFFER_MS) / 1000;
    const rt = performance.now() / 1000 + this.timeOffset - delay;
    let a = this.snaps[0], b = this.snaps[this.snaps.length - 1];
    for (let i = 0; i < this.snaps.length - 1; i++) {
      if (this.snaps[i].t <= rt && this.snaps[i + 1].t >= rt) { a = this.snaps[i]; b = this.snaps[i + 1]; break; }
    }
    if (rt > b.t) a = b;
    const k = b.t > a.t ? Math.max(0, Math.min(1, (rt - a.t) / (b.t - a.t))) : 1;
    const amap = new Map(a.s.enemies.map((e) => [e.id, e]));
    for (const eb of b.s.enemies) {
      if (this.killedIds.has(eb.id)) continue;
      const ea = amap.get(eb.id);
      if (!ea) { if (k >= 0.99 || a === b) out.push(eb); continue; }
      out.push({ ...eb, x: ea.x + (eb.x - ea.x) * k, y: ea.y + (eb.y - ea.y) * k, z: ea.z + (eb.z - ea.z) * k });
    }
    const pa = new Map(a.s.players.map((p) => [p.id, p]));
    for (const pb of b.s.players) {
      const p0 = pa.get(pb.id);
      if (!p0) { players.set(pb.id, pb); continue; }
      players.set(pb.id, { x: p0.x + (pb.x - p0.x) * k, y: p0.y + (pb.y - p0.y) * k, z: p0.z + (pb.z - p0.z) * k });
    }
    return { enemies: out, players };
  }

  // ───────────────────────────── shooting ─────────────────────────────

  private eye(): THREE.Vector3 {
    const p = this.world.player;
    return this.tmpV.set(p.x, p.y + p.eyeY, p.z);
  }

  private aimDir(spread: number): THREE.Vector3 {
    const p = this.world.player;
    const yaw = p.yaw + (Math.random() - 0.5) * 2 * spread;
    const pitch = p.pitch + (Math.random() - 0.5) * 2 * spread;
    return new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  }

  /** Trace against what the player SEES (interpolated enemies), capsules 20% larger. */
  private trace(o: THREE.Vector3, d: THREE.Vector3, range: number, maxHits: number): { hits: { id: number; head: boolean; t: number }[]; end: number } {
    const solids = this.world.player.boxes;
    const wall = raycastBoxes(solids, o.x, o.y, o.z, d.x, d.y, d.z, range);
    const cands: { id: number; head: boolean; t: number }[] = [];
    for (const v of this.world.ents.enemies.values()) {
      if (v.spawnFx > 0.5) continue;
      const def = ENEMIES[v.type];
      const hs = C.HITBOX_SCALE;
      const th = rayVsSphere(o.x, o.y, o.z, d.x, d.y, d.z, v.x, v.y + def.headY, v.z, def.headR * hs);
      const tb = def.flying
        ? rayVsSphere(o.x, o.y, o.z, d.x, d.y, d.z, v.x, v.y + def.height * 0.5, v.z, def.radius * hs * 1.2)
        : rayVsCylinder(o.x, o.y, o.z, d.x, d.y, d.z, v.x, v.z, v.y, v.y + def.headY - def.headR * 0.6, def.radius * hs);
      let t = -1, head = false;
      if (th >= 0 && (tb < 0 || th <= tb + 0.3)) { t = th; head = true; }
      else if (tb >= 0) t = tb;
      if (t >= 0 && t < wall) cands.push({ id: v.id, head, t });
    }
    cands.sort((a, b) => a.t - b.t);
    const hits = cands.slice(0, maxHits);
    const end = hits.length >= maxHits && maxHits < 50 ? hits[hits.length - 1].t : wall;
    return { hits, end };
  }

  private muzzlePos(): THREE.Vector3 {
    const p = this.world.player;
    const f = this.aimDir(0);
    const r = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    return this.eye().clone().addScaledVector(f, 0.6).addScaledVector(r, 0.22).add(new THREE.Vector3(0, -0.22, 0));
  }

  private fire(dt: number) {
    const w = this.world;
    const inp = w.input;
    const def = WEAPONS[this.weapon];
    const rateMult = this.mods.fireRateMult * (this.overclockT > 0 ? 2 : 1);
    this.fireCd -= dt;
    const held = inp.held.has('fire') && !this.paused && this.reloadT <= 0;

    if (def.kind === 'melee') {
      if (held && !this.ripperOn) {
        this.ripperOn = true; this.net.send({ t: 'ripper', on: true });
        if (!this.ripperLoop) this.ripperLoop = sfx.ripperLoop();
      } else if (!held && this.ripperOn) {
        this.ripperOn = false; this.net.send({ t: 'ripper', on: false });
      }
      if (this.ripperLoop) {
        // cutting = something in reach
        let cutting = false;
        if (this.ripperOn) {
          const tr = this.trace(this.eye().clone(), this.aimDir(0), C.RIPPER_RANGE + 1, 3);
          cutting = tr.hits.length > 0;
          if (cutting) { this.sprayT -= dt; if (this.sprayT <= 0) { this.sprayT = 0.05; const v = w.ents.enemies.get(tr.hits[0].id); if (v) w.gore.spray(v.x, v.y + 1, v.z, 0, 0.6, 0, 6, 6); w.shake(1.5); } }
        }
        this.ripperLoop.set(cutting ? 1 : 0);
        if (this.ripperOn) this.rumble(cutting ? 0.55 : 0.12, cutting ? 1 : 0.4, 80);
      }
      w.hud.ripperOn = this.ripperOn;
      return;
    }
    if (this.ripperLoop) { this.ripperLoop.stop(); this.ripperLoop = null; }
    if (this.ripperOn) { this.ripperOn = false; this.net.send({ t: 'ripper', on: false }); }
    w.hud.ripperOn = false;

    if (def.kind === 'charge') {
      if (held && this.fireCd <= 0 && this.ammo.lance > def.ammoCost * 0.4) {
        if (!this.charging) { this.charging = true; this.lanceCharge = 0; this.chargeLoop = sfx.lanceCharge(); }
        this.lanceCharge = Math.min(1, this.lanceCharge + (dt * rateMult * this.mods.lanceCharge) / C.LANCE_CHARGE_TIME);
        this.chargeLoop?.set(this.lanceCharge);
        if (this.lanceCharge >= 1) w.shake(0.8);
      } else if (this.charging && !held) {
        this.shoot(def.id, this.lanceCharge);
        this.charging = false;
        this.chargeLoop?.stop(); this.chargeLoop = null;
        this.fireCd = def.interval / rateMult;
        this.lanceCharge = 0;
      }
      w.hud.charge = this.lanceCharge;
      return;
    }
    w.hud.charge = 0;
    if (held && this.fireCd <= 0) {
      const cost = def.ammoCost;
      if (this.ammo[this.weapon] < cost) {
        if (inp.pressed.has('fire')) sfx.dryFire();
        this.startReload(); // empty: reload automatically
        return;
      }
      this.shoot(def.id, 1);
      this.fireCd += def.interval / rateMult;
      if (this.fireCd < 0) this.fireCd = 0;
    }
    if (!held) { this.sprayT = Math.max(0, this.sprayT - dt * 3); if (this.fireCd < 0) this.fireCd = 0; }
  }

  private shoot(weapon: WeaponId, charge: number) {
    const w = this.world;
    const def = WEAPONS[weapon];
    const o = this.eye().clone();
    const mz = this.muzzlePos();
    const cost = def.ammoCost * (def.kind === 'charge' ? 0.4 + 0.6 * charge : 1);
    this.ammo[weapon] = Math.max(0, this.ammo[weapon] - cost);
    const hits: { id: number; head: boolean; n: number }[] = [];
    let anyHit = false, anyHead = false;
    const p = w.player;
    if (def.kind === 'shotgun') {
      const agg = new Map<string, { id: number; head: boolean; n: number }>();
      for (let i = 0; i < def.pellets + this.mods.extraPellets; i++) {
        const d = this.aimDir(def.spread * (1 - 0.45 * this.aimT));
        const tr = this.trace(o, d, def.range, 1 + this.mods.pierce);
        for (const h of tr.hits) {
          const k = h.id + (h.head ? 'h' : 'b');
          const a = agg.get(k) ?? { id: h.id, head: h.head, n: 0 };
          a.n++; agg.set(k, a);
          anyHit = true; anyHead ||= h.head;
        }
        const end = o.clone().addScaledVector(d, Math.min(tr.end, def.range));
        if (i % 2 === 0) w.fx.tracer(mz.x, mz.y, mz.z, end.x, end.y, end.z, new THREE.Color(3, 2, 1), 0.05);
        if (!tr.hits.length && tr.end < def.range) w.fx.impact(end.x, end.y, end.z, new THREE.Color(3, 2, 1));
      }
      hits.push(...agg.values());
      sfx.breacherShot();
      this.rumble(1, 0.6, 150);
      setTimeout(() => sfx.breacherReload(), 300);
      w.shake(7);
      p.pitch = Math.min(1.45, p.pitch + 0.045);
      // shotgun jump: kick yourself backward in the air
      if (!p.s.onGround && p.pitch < -0.6) p.knock(Math.sin(p.yaw) * 6, 7, Math.cos(p.yaw) * 6);
      w.r.flashLight(mz.x, mz.y, mz.z, 0xffb060, 26, 12, 0.07);
    } else if (def.kind === 'charge') {
      const d = this.aimDir(0);
      const tr = this.trace(o, d, def.range, 99);
      for (const h of tr.hits) { hits.push({ id: h.id, head: h.head, n: 1 }); anyHit = true; anyHead ||= h.head; }
      const end = o.clone().addScaledVector(d, tr.end);
      w.fx.beam(mz.x, mz.y, mz.z, end.x, end.y, end.z, 0.05 + charge * 0.12, new THREE.Color(0.6 + charge, 1.5 + charge * 2, 4 + charge * 3), 0.25 + charge * 0.2);
      w.fx.impact(end.x, end.y, end.z, new THREE.Color(1, 2, 4));
      sfx.lanceFire(charge);
      this.rumble(0.4 + charge * 0.6, 0.9, 120 + charge * 220);
      w.shake(3 + charge * 7);
      p.pitch = Math.min(1.45, p.pitch + 0.02 + charge * 0.04);
      w.r.flashLight(mz.x, mz.y, mz.z, 0x66aaff, 20 + charge * 30, 14, 0.12);
      if (charge > 0.9) w.flash(0.12);
    } else {
      // PULSE: perfect first-shot accuracy, spread when spraying
      const spread = (this.sprayT > 0.25 ? def.spread * Math.min(1, this.sprayT) : def.firstShotSpread) * (1 - 0.85 * this.aimT);
      this.sprayT = Math.min(1.5, this.sprayT + 0.18);
      for (let b = 0; b < (this.mods.hydra ? 3 : 1); b++) {
        const d = this.aimDir(b === 0 ? spread : spread + 0.03);
        const tr = this.trace(o, d, def.range, 1 + this.mods.pierce);
        for (const h of tr.hits) { hits.push({ id: h.id, head: h.head, n: 1 }); anyHit = true; anyHead ||= h.head; }
        const end = o.clone().addScaledVector(d, tr.end);
        w.fx.tracer(mz.x, mz.y, mz.z, end.x, end.y, end.z, b ? new THREE.Color(1, 3, 2.5) : new THREE.Color(3.5, 2.2, 0.8), 0.06);
        if (!tr.hits.length && tr.end < def.range) w.fx.impact(end.x, end.y, end.z, new THREE.Color(3, 2, 0.8));
      }
      sfx.pulseShot();
      this.rumble(0.12, 0.35, 45);
      w.shake(1.2);
      p.pitch = Math.min(1.45, p.pitch + 0.006);
      p.yaw += (Math.random() - 0.5) * 0.004;
      w.r.flashLight(mz.x, mz.y, mz.z, 0xffc070, 12, 9, 0.05);
    }
    w.hud.weaponFire();
    if (anyHit) w.hud.hitmarker(false, anyHead); // instant, predicted — the server confirms
    const dd = this.aimDir(0);
    this.dir.copy(dd);
    this.net.send({ t: 'shot', weapon, ox: o.x, oy: o.y, oz: o.z, dx: dd.x, dy: dd.y, dz: dd.z, hits, charge });
  }

  // ───────────────────────────── per-frame ─────────────────────────────

  update(dt: number) {
    const w = this.world;
    const inp = w.input;
    const lp = w.player;
    const scale = this.net.local ? w.timeScale : 1;
    const fxDt = dt * w.timeScale;
    this.whisperCd -= dt;
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) { this.ammo[this.reloadW] = 1; sfx.weaponSwitch(); }
    }
    if (inp.pressed.has('reload')) this.startReload();
    if (inp.pressed.has('inspect') && this.reloadT <= 0) vm(w.hud).inspect?.();
    this.overclockT -= dt;
    this.streakT -= dt;
    this.gloryCooldown -= dt;
    if (this.streakT <= 0) this.streakLevel = 0;

    // look
    if (!this.paused) {
      const look = inp.consumeLook();
      this.lookDX = look.dx; this.lookDY = look.dy;
      if (w.lookLockT <= 0) {
        const sensK = 1 / Math.pow(w.zoom, 0.85); // scoped = slower look
        lp.yaw -= look.dx * sensK;
        lp.pitch = Math.max(-1.45, Math.min(1.45, lp.pitch - look.dy * sensK));
        this.aimAssist(dt);
      }
    }

    // weapon select (instant, no lockout)
    const unlocked = this.priv?.unlockedWeapons ?? unlockedFor(this.level);
    const select = (wid: WeaponId) => {
      if (wid !== this.weapon && this.reloadT > 0) this.reloadT = 0; // switching cancels the reload
      if (!unlocked.includes(wid) || wid === this.weapon) return;
      this.lastWeapon = this.weapon;
      this.weapon = wid;
      w.hud.weaponSwitch(wid);
      sfx.weaponSwitch();
      if (this.charging) { this.charging = false; this.chargeLoop?.stop(); this.chargeLoop = null; this.lanceCharge = 0; }
    };
    if (inp.pressed.has('w1')) select('pulse');
    if (inp.pressed.has('w2')) select('breacher');
    if (inp.pressed.has('w3')) select('lance');
    if (inp.pressed.has('w4')) select('ripper');
    if (inp.pressed.has('wlast')) select(this.lastWeapon);
    if (inp.pressed.has('wnext') || inp.pressed.has('wprev')) {
      const list = WEAPON_ORDER.filter((x) => unlocked.includes(x));
      const i = list.indexOf(this.weapon);
      select(list[(i + (inp.pressed.has('wnext') ? 1 : list.length - 1)) % list.length]);
    }

    // movement (prediction)
    const alive = this.alive && this.started;
    if (alive && !this.paused) {
      const ax = inp.axes();
      // firing (or charging / revving the Ripper) snaps you out of sprint instantly; no shot delay
      if (inp.held.has('fire') || inp.pressed.has('fire') || this.charging || this.ripperOn) lp.suppressSprint();
      const sp = inp.sprintInput();
      const ev = lp.update(dt, { fwd: ax.fwd, right: ax.right, jump: inp.held.has('jump'), dash: inp.pressed.has('dash'), crouch: inp.held.has('slide'), sprint: sp.hold, sprintToggle: sp.toggle }, scale);
      if (ev.jumped) { sfx.jump(); if (ev.wallJump) this.rumble(0.2, 0.4, 70); }
      if (ev.bhop) this.rumble(0, 0.18, 30);
      if (ev.dashed) { sfx.dash(); w.shake(2); this.rumble(0.15, 0.55, 90); }
      if (ev.landed) {
        sfx.land(ev.landed > 12);
        if (ev.landed > 9) this.rumble(Math.min(0.7, ev.landed / 25), 0.1, 90);
        if (ev.landed > 14 && !ev.jumped) w.shake(Math.min(7, (ev.landed - 12) * 0.7));
      }
      if (ev.mantled) { sfx.land(false); this.rumble(0.12, 0.3, 80); }
      if (ev.sprintStart) this.rumble(0, 0.12, 35);
      if (ev.footstep) sfx.footstep();
      if (ev.slideStart && !this.slideLoop) { this.slideLoop = sfx.slide(); }
      if (lp.s.slideT <= 0 && this.slideLoop) { this.slideLoop.stop(); this.slideLoop = null; }
      if (lp.s.slideT > 0 && Math.random() < 0.5) w.gore.sparks(lp.x + (Math.random() - 0.5), lp.y + 0.05, lp.z + (Math.random() - 0.5), 1);
      if (lp.s.dashT > 0 && this.mods.dashTrail) { this.hazardFx -= dt; if (this.hazardFx <= 0) { this.hazardFx = 0.03; w.fx.fire(lp.x, lp.z); } }
      // fall out of the world safety
      if (lp.s.y < -5) lp.teleport(0, 0, 0, lp.yaw);
      this.fire(fxDt > 0 ? dt : dt);
    } else if (!this.alive) {
      if (this.slideLoop) { this.slideLoop.stop(); this.slideLoop = null; }
    }

    // network: send input at tick rate
    this.sendAcc += dt;
    if (this.sendAcc >= C.TICK_DT) {
      this.sendAcc = 0;
      if (this.started) this.net.send(lp.inputMsg(this.weapon, inp.held.has('fire') && alive));
    }

    // interactions
    if (alive) this.interact();
    this.updateDualSense(dt);
    this.updateAim(dt);

    // advance the local sim (solo)
    if (!this.paused || !this.net.local) this.net.update(dt, scale);

    // ammo regen (predicted)
    for (const k of ['pulse', 'breacher', 'lance'] as WeaponId[]) this.ammo[k] = Math.min(1, this.ammo[k] + C.AMMO_REGEN * this.mods.ammoRegenMult * dt * scale);

    // interpolate + views
    const smp = this.sample();
    const born = w.ents.syncEnemies(smp.enemies, this.room?.biome ?? 0);
    for (const b of born) {
      w.fx.spawnIn(b.x, b.y, b.z, ENEMIES[b.type].height, b.type === 'replica' ? new THREE.Color(0.5, 2.5, 3) : new THREE.Color(3, 0.6, 0.3));
      if (b.type !== 'replica') sfx.terminalBeep();
    }
    if (this.latest) {
      w.ents.syncPlayers(this.latest.players, this.me, smp.players);
      this.updateHud(this.latest);
    }
    const marked = this.mods.chainRadius > 0 || this.mods.tesla;
    w.ents.update(fxDt, lp.yaw, w.r.camera.position, marked);
    w.ents.faceCamera(lp.yaw);
    w.gore.update(fxDt, lp.yaw);
    w.fx.update(fxDt);
    w.map.update(fxDt);
    w.r.update(dt);
    w.updateFx(dt);

    // spectate when dead in co-op
    if (!this.alive && this.latest && !this.opts.solo) {
      const ally = this.latest.players.find((p) => p.alive && p.id !== this.me);
      const ip = ally ? smp.players.get(ally.id) : null;
      if (ip && ally) { lp.teleport(ip.x, ip.y, ip.z, lp.yaw); lp.yaw = ally.yaw; }
    }
    // death camera: sink to the floor
    if (!this.alive) lp.eyeY += (0.3 - lp.eyeY) * Math.min(1, dt * 3);
    const speed = Math.hypot(lp.s.vx, lp.s.vz);
    w.updateCamera(dt, speed);
    w.hud.pops.update(dt, w.r.camera);
    { const m = vm(w.hud).motion; if (m) { m.dashing = lp.s.dashT > 0; m.sprinting = lp.sprinting; m.mantling = lp.mantling; m.crouching = lp.crouching; m.airborne = !lp.s.onGround; m.lookDX = this.lookDX; m.lookDY = this.lookDY; } }
    w.hud.draw(fxDt, { t: lp.bobT, amt: lp.bobAmt, land: lp.landDip, sliding: lp.s.slideT > 0 });
    w.render();
    inp.endFrame();
  }

  private interact() {
    const w = this.world;
    const inp = w.input;
    const lp = w.player;
    let prompt: string | null = null;
    // glory kill: staggered enemy in reach
    let target: { id: number; d: number } | null = null;
    for (const v of w.ents.enemies.values()) {
      if (v.last.anim !== 'stagger') continue;
      const d = Math.hypot(v.x - lp.x, v.z - lp.z) - ENEMIES[v.type].radius;
      if (d < C.GLORY_RANGE + 0.6 && (!target || d < target.d)) target = { id: v.id, d };
    }
    if (target) {
      prompt = inp.padActive ? '[R3 / □] GLORY KILL' : inp.touchMode ? 'USE · GLORY KILL' : '[F] GLORY KILL';
      if ((inp.pressed.has('glory') || inp.pressed.has('use')) && this.gloryCooldown <= 0) {
        this.gloryCooldown = 0.3;
        this.net.send({ t: 'glory', enemy: target.id });
        // lunge toward the target
        const v = w.ents.enemies.get(target.id);
        if (v) { const dx = v.x - lp.x, dz = v.z - lp.z, l = Math.hypot(dx, dz) || 1; lp.knock((dx / l) * 10, 0, (dz / l) * 10); }
      }
    }
    // pedestals
    this.focusPed = null;
    if (this.pedestals && !target) {
      let best: Pedestal | null = null, bd = 3.2;
      const fx = -Math.sin(lp.yaw), fz = -Math.cos(lp.yaw);
      for (const p of this.pedestals) {
        const dx = p.x - lp.x, dz = p.z - lp.z;
        const d = Math.hypot(dx, dz);
        const facing = d < 1.6 || (dx * fx + dz * fz) / (d || 1) > 0.8;
        if (d < bd && facing) { bd = d; best = p; }
      }
      this.focusPed = best;
      if (best && inp.pressed.has('use')) this.net.send({ t: 'pick', slot: best.slot });
    }
    const useKey = inp.padActive ? '□' : inp.touchMode ? 'USE' : 'E';
    // the Broker's wares
    this.focusShop = null;
    if (this.shop && !target) {
      let best: ShopItem | null = null, bd = 2.6;
      for (const it of this.shop) { if (it.sold) continue; const d = Math.hypot(it.x - lp.x, it.z - lp.z); if (d < bd) { bd = d; best = it; } }
      this.focusShop = best;
      if (best && inp.pressed.has('use')) {
        if (this.scrap >= best.price) this.net.send({ t: 'buy', slot: best.slot });
        else { sfx.dryFire(); w.cast.say('broker', pickLine(BROKER_LINES.poor), 1); }
      }
    }
    if (this.focusShop) w.hud.shopInfo(this.focusShop, useKey, this.scrap);
    else w.hud.pedestalInfo(this.focusPed, useKey);
    // the shrine
    if (this.shrinePos && this.shrine && !target && Math.hypot(this.shrinePos.x - lp.x, this.shrinePos.z - lp.z) < 2.6) {
      prompt = `[${useKey}] REST AT THE SHRINE`;
      if (inp.pressed.has('use')) this.net.send({ t: 'shrine' });
    }
    // terminal (anomaly rooms)
    if (this.terminalPos && !target && !this.focusPed) {
      const d = Math.hypot(this.terminalPos.x - lp.x, this.terminalPos.z - lp.z);
      if (d < 2.6) {
        prompt = inp.padActive ? '[□] ACCESS TERMINAL' : inp.touchMode ? 'USE · ACCESS TERMINAL' : '[E] ACCESS TERMINAL';
        if (inp.pressed.has('use')) {
          sfx.terminalBeep();
          if (this.room?.kind === 'sanctuary') {
            this.cb.onTerminal(['> PLAYBACK: SUBJECT 0112 "MARA"', '> SOURCE: UNLOGGED', '', this.maraText], null);
            w.cast.say('mara', this.maraText, 3);
          } else {
            this.cb.onTerminal(terminalText(this.runCount, Math.random), this.roomFragment);
            if (this.roomFragment) w.cast.say('system', this.roomFragment.title + '. ' + this.roomFragment.text.split(/[.\n]/)[0], 2);
          }
        }
      }
    }
    w.hud.prompt(prompt);
    // □ with nothing to interact with = reload (keyboard has R)
    if (inp.padActive && inp.pressed.has('use') && !prompt && !this.focusPed && !this.focusShop) this.startReload();
    // doors: walk into an open doorway
    if (this.geoDoorCheck()) { /* sent */ }
  }

  private geoDoorCheck(): boolean {
    const g = this.world.geo;
    if (!g || !this.latest) return false;
    const lp = this.world.player;
    const now = performance.now();
    if (now - this.doorSentT < 300) return false;
    for (const d of g.doors) {
      if (d.entry || !this.openDoors.has(d.slot)) continue;
      // depth past the wall plane (outward = -normal)
      const depth = -((lp.x - d.x) * d.nx + (lp.z - d.z) * d.nz);
      const lateral = Math.abs((lp.x - d.x) * d.nz - (lp.z - d.z) * d.nx);
      if (depth > 0.4 && lateral < 2) {
        this.doorSentT = now;
        this.net.send({ t: 'door', slot: d.slot });
        return true;
      }
    }
    return false;
  }

  private updateHud(s: Snapshot) {
    const h = this.world.hud;
    h.setHp(this.hp, this.maxHp, this.armor);
    h.setScore(this.score);
    const meS = s.players.find((p) => p.id === this.me);
    if (meS) { this.scrap = meS.scrap; h.setScrap(meS.scrap); }
    if (this.mods.bloodrush > 0) this.applyParams();
    h.setCombo(s.combo, s.combo > 1 ? Math.max(0, s.comboTimer / C.COMBO_DECAY_TIME) : 0);
    h.setAmmo(this.weapon, this.ammo[this.weapon]);
    h.setWeapons(this.priv?.unlockedWeapons ?? unlockedFor(this.level), this.weapon);
    h.setDash(this.world.player.s.dashCharges, this.mods.maxDash);
    h.setTimer(this.room?.kind === 'gauntlet' && s.state === 'combat' ? s.roomTimer : null);
    h.setWave(s.wave);
    h.setEnemiesLeft(s.enemiesLeft, s.state === 'combat');
    if (s.bossMaxHp > 0 && s.bossHp > 0) h.setBoss(s.bossName, s.bossHp / s.bossMaxHp, s.enemies.find((e) => e.type === 'warden')?.phase ?? 1);
    // low HP: heartbeat + vignette + handler
    const frac = this.hp / Math.max(1, this.maxHp);
    this.world.lowHpPulse = this.alive && frac < 0.3 ? 1 : 0;
    if (this.alive && frac < 0.3) {
      this.heartbeatT -= 1 / 60;
      if (this.heartbeatT <= 0) { this.heartbeatT = 0.55 + frac * 2; sfx.lowHpHeartbeat(); }
      if (!this.lowHpWarned) { this.lowHpWarned = true; this.world.say('lowHp', this.runCount, 3, 12); }
    } else if (frac > 0.5) this.lowHpWarned = false;
    this.world.hud.face.age = Math.min(1, this.runCount / 40);
  }
}

/** viewmodel extras on the HUD (reload / inspect / motion) — optional until present */
function vm(h: unknown): { reload?(d: number): void; inspect?(): void; motion?: Record<string, number | boolean> } { return h as { reload?(d: number): void; inspect?(): void; motion?: Record<string, number | boolean> }; }

export function pickLine(a: string[]): string { return a[Math.floor(Math.random() * a.length)] ?? ''; }

export function unlockedFor(level: number): WeaponId[] {
  const w: WeaponId[] = ['pulse', 'breacher'];
  if (level >= 3) w.push('lance');
  if (level >= 5) w.push('ripper');
  return w;
}

export type { Box, PlayerSnap };
