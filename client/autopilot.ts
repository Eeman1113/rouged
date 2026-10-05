// ROUGED autopilot — the /test attract mode. A utility-AI player that drives the real game through
// the normal input path (held/pressed actions + analog move axes + yaw/pitch on the LocalPlayer).
// It reads the in-page authoritative sim for perception (enemy state, projectiles, telegraphs) but
// never edits damage, health or positions: every kill is a traced shot, every dodge is a real move.
//
// Layers:  perception (danger.ts) → decision (mode: combat / loot / shop / shrine / sweep / exit)
//          → steering (nav.ts distance fields + context steering over 16 directions vs. the threat
//          model) → reflexes (jump rings & low beams, duck high beams, dash out of hits / leeches)
//          → aim (smoothed yaw/pitch, headshots, trigger discipline: only fire when the ray hits).

import type { Game } from './game';
import type { Hub } from './hub';
import type { World } from './world';
import type { Meta } from './meta';
import type { AutopilotHook } from './main';
import { LocalTransport } from './net';
import type { Run } from '../server/run';
import type { Enemy } from '../server/enemies/base';
import type { SimPlayer } from '../server/player';
import type { RoomGeo } from '../shared/mapData';
import { raycastBoxes, rayVsSphere, rayVsCylinder } from '../shared/mapData';
import type { GameEvent, WeaponId, EnemyType, RunSummary } from '../shared/protocol';
import { ENEMIES } from '../shared/enemyDefs';
import { WEAPONS } from '../shared/weaponDefs';
import * as C from '../shared/constants';
import { Nav } from './autopilot/nav';
import { Danger, BossLike } from './autopilot/danger';
import { choosePedestal, chooseBuy, scoreDoor } from './autopilot/policy';
import { levelFromXp } from '../server/progression';

export interface AppLike {
  mode: string;
  game: Game | null;
  hub: Hub | null;
  meta: Meta;
  world: World;
  overlay: HTMLDivElement | null;
  paused: boolean;
  autopilot: AutopilotHook | null;
  togglePause(force?: boolean): void;
  enterHub(): void;
  closeTerminal(): void;
}

export interface RunLog { n: number; depth: number; rooms: number; kills: number; bosses: number; time: number; extracted: boolean; score: number; at: number; cause: string }

const LOG_KEY = 'rouged.autopilot.log.v1';
const NAMES: Partial<Record<EnemyType, string>> = { warden: 'WARDEN', echo: 'ECHO' };
const THREAT: Record<EnemyType, number> = {
  drone: 1.4, grunt: 2, brute: 3, stalker: 3, spider: 2.2, replica: 4, warden: 5, leech: 3, sentinel: 1.6,
  bomber: 5, mortar: 2.6, bulwark: 2.2, wraith: 3.6, echo: 2.2,
};
const LANCE_TARGETS = new Set<EnemyType>(['brute', 'bulwark', 'mortar', 'wraith', 'replica', 'stalker', 'sentinel', 'warden']);

type Vec = { x: number; z: number };
const DIRS: Vec[] = Array.from({ length: 16 }, (_, i) => ({ x: Math.cos((i / 16) * Math.PI * 2), z: Math.sin((i / 16) * Math.PI * 2) }));

function wrapA(a: number) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
function norm(v: Vec): Vec { const l = Math.hypot(v.x, v.z); return l > 1e-6 ? { x: v.x / l, z: v.z / l } : { x: 0, z: 0 }; }

export function loadRunLog(): RunLog[] {
  try { const r = localStorage.getItem(LOG_KEY); return r ? (JSON.parse(r) as RunLog[]) : []; } catch { return []; }
}
function saveRunLog(l: RunLog[]) { try { localStorage.setItem(LOG_KEY, JSON.stringify(l.slice(-300))); } catch { /* */ } }
export function clearRunLog() { try { localStorage.removeItem(LOG_KEY); } catch { /* */ } }

interface AimTarget { x: number; y: number; z: number; r: number; head: boolean }

export class Autopilot implements AutopilotHook {
  active = true;
  speed = 1;
  /** what the AI is doing, for the spectator overlay */
  status = 'BOOTING';
  reflex = '';
  reflexT = 0;
  /** session start (survives the housekeeping reloads), in performance.now() time */
  readonly bootAt = (() => {
    try {
      const k = 'rouged.autopilot.session';
      const v = Number(sessionStorage.getItem(k));
      if (!v) { sessionStorage.setItem(k, String(Date.now())); return performance.now(); }
      return performance.now() - (Date.now() - v);
    } catch { return performance.now(); }
  })();
  log: RunLog[] = loadRunLog();
  sessionRuns = 0;
  sessionKills = 0;
  lastRoomName = '';
  private roomDmg = 0;
  private roomHits = 0;

  private nav = new Nav();
  private danger = new Danger();
  private run: Run | null = null;
  private geo: RoomGeo | null = null;
  private game: Game | null = null;
  private t = 0;
  // per room
  private roomT = 0;
  private pedSlot = -1;
  private doorSlot = -1;
  private doorThrough = false;
  private sweepT = 0;
  private useCd = 0;
  // combat
  private targetId = -1;
  private targetHold = 0;
  private strafeDir = 1;
  private strafeT = 0;
  private weaponCd = 0;
  private reloadCd = 0;
  private prevView = new Map<number, { x: number; y: number; z: number; t: number; vx: number; vy: number; vz: number }>();
  private lanceAligned = 0;
  private calm = true;
  private shopLogged = false;
  private forceDirect = false;
  private doorFixKey = '';
  extractAt = Infinity;
  private doorBanned = new Set<number>();
  private oobT = 0;
  // movement
  private prevMove: Vec = { x: 0, z: 0 };
  private jumpHoldT = 0;
  private jumpGapT = 0;
  private crouchT = 0;
  private stuckT = 0;
  private stuckRef = { x: 0, z: 0, t: 0 };
  private unstickT = 0;
  private unstickDir: Vec = { x: 0, z: 0 };
  private wander: { x: number; z: number; t: number } | null = null;
  // watchdog (sim seconds)
  private progressSig = '';
  private progressT = 0;
  private hubT = 0;
  // menus (real time)
  private modeName = '';
  private modeSince = 0;
  private btnSeen = 0;
  private termSince = 0;
  private lastEnterHub = 0;
  private aimNoise = { yaw: 0, pitch: 0, t: 0 };

  constructor(public app: AppLike) {
    const loop = () => { try { this.menuTick(); } catch (err) { console.error(err); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // ───────────────────────────── frame hooks (called by App.frame) ─────────────────────────────

  runFrame(game: Game, dt: number) {
    if (!this.active) { game.update(dt); return; }
    const steps = Math.max(1, Math.min(4, Math.round(this.speed)));
    const w = game.world as World & { render: () => void };
    for (let i = 0; i < steps; i++) {
      try { this.think(game, dt); } catch (err) { console.error('[autopilot]', err); }
      if (i < steps - 1) {
        w.render = () => {};
        try { game.update(dt); } finally { delete (w as unknown as Record<string, unknown>).render; }
      } else game.update(dt);
      if (this.app.game !== game) break; // the run ended mid-step
    }
  }

  hubFrame(hub: Hub, dt: number) {
    if (!this.active) { hub.update(dt); return; }
    const inp = hub.world.input, lp = hub.world.player;
    inp.held.clear(); inp.botFwd = 0; inp.botRight = 0;
    this.hubT += dt;
    this.game = null;
    if (this.hubT < 1.4) {
      // a look around the room that changes every death
      lp.yaw = Math.sin(this.hubT * 2.2) * 0.6; lp.pitch = -0.05;
      this.status = 'WAKING UP · HUB';
    } else {
      // walk north through the door to deploy
      const want = Math.atan2(-(0 - lp.x), -(-9 - lp.z));
      lp.yaw += wrapA(want - lp.yaw) * Math.min(1, dt * 8);
      lp.pitch += (0 - lp.pitch) * Math.min(1, dt * 6);
      inp.botFwd = 1;
      inp.held.add('sprint');
      this.status = 'DEPLOYING · RUN ' + (this.app.meta.runCount + 1);
    }
    hub.update(dt);
  }

  setActive(on: boolean) {
    this.active = on;
    const inp = this.app.world.input;
    inp.botFwd = 0; inp.botRight = 0;
    inp.held.clear();
    if (!on) { this.status = 'MANUAL CONTROL'; if (this.app.mode === 'run' || this.app.mode === 'hub') inp.requestLock(); }
    else inp.exitLock();
  }

  // ───────────────────────────── menus / screens (real time) ─────────────────────────────

  private menuTick() {
    const app = this.app;
    const now = performance.now();
    if (app.mode !== this.modeName) { this.modeName = app.mode; this.modeSince = now; this.btnSeen = 0; if (app.mode === 'hub') this.hubT = 0; }
    if (!this.active) return;
    if (this.reflexT > 0) this.reflexT -= 1 / 60;
    if (app.paused && (app.mode === 'run' || app.mode === 'hub')) app.togglePause(false);
    const priv = app as unknown as { termEl: HTMLElement | null; splashDone: boolean };
    if (priv.termEl) {
      if (!this.termSince) this.termSince = now;
      else if (now - this.termSince > 2500) { app.closeTerminal(); this.termSince = 0; }
    } else this.termSince = 0;
    switch (app.mode) {
      case 'title': {
        if (now - this.lastEnterHub > 2000 && now - this.modeSince > 600) {
          this.lastEnterHub = now;
          priv.splashDone = true;
          app.enterHub();
        }
        this.status = 'BOOTING';
        break;
      }
      case 'death': {
        this.status = 'REVIEWING THE RUN';
        if (now - this.modeSince > 3600) {
          const b = app.overlay?.querySelector<HTMLElement>('#b-again');
          // attract mode runs for hours: GPU resources pile up run over run, so between runs (save is
          // already banked) we start from a clean page every so often
          const mem = (app.world.r as unknown as { renderer?: { info: { memory: { geometries: number; textures: number } } } }).renderer?.info.memory;
          if (mem && (mem.geometries > 7000 || mem.textures > 1400)) {
            try { sessionStorage.setItem('rouged.autopilot.speed', String(this.speed)); } catch { /* */ }
            console.log('[autopilot] fresh page between runs (gpu memory housekeeping)');
            location.reload();
            this.lastEnterHub = now + 60000;
          } else if (b && now - this.lastEnterHub > 1500) { this.lastEnterHub = now; b.click(); }
        }
        break;
      }
      case 'reveal': {
        this.status = 'WATCHING THE TRUTH';
        const b = app.overlay?.querySelector<HTMLElement>('button');
        if (b) {
          if (!this.btnSeen) this.btnSeen = now;
          else if (now - this.btnSeen > 2600) { this.btnSeen = now + 5000; b.click(); }
        }
        break;
      }
      default: break;
    }
  }

  // ───────────────────────────── the brain ─────────────────────────────

  private think(game: Game, dt: number) {
    const w = game.world, inp = w.input, lp = w.player;
    if (!(game.net instanceof LocalTransport)) return;
    const run = game.net.run;
    if (this.game !== game) this.onNewGame(game, run);
    if (run.geo && run.geo !== this.geo) this.onNewRoom(run);
    this.t += dt;
    this.nav.tick(dt);
    // the client applies door openings to whatever geometry is loaded when the snapshot lands; at ×2/×4
    // the doors can open during the 220ms room fade, before the new room's solids exist — re-sync them
    const wg = w.geo;
    if (wg && run.room && wg.desc.seed === run.room.seed && game.openDoors.size) {
      const key = wg.desc.seed + ':' + [...game.openDoors].join(',');
      if (key !== this.doorFixKey) { this.doorFixKey = key; w.setOpenDoors(game.openDoors); for (const sl of game.openDoors) w.map.setDoorOpen(sl, true); }
    }
    if (run.geo) this.nav.setOpenDoors(run.geo.doors.filter((d) => !d.entry && run.openDoors.has(d.slot)));
    inp.held.clear(); inp.botFwd = 0; inp.botRight = 0;
    this.useCd -= dt; this.weaponCd -= dt; this.reloadCd -= dt; this.targetHold -= dt;
    this.jumpGapT -= dt;
    if (this.reflexT > 0) this.reflexT -= dt;
    const me = run.players.get(game.me);
    if (!me || !game.started || run.state === 'lobby') { this.status = 'LINKING'; return; }
    if (game.ended || run.ended) { this.status = 'TERMINATED'; return; }
    if (!game.alive || !me.alive) { this.status = 'SIGNAL LOST'; return; }
    if (run.transitionT >= 0) { this.status = 'TRANSITIONING'; inp.botFwd = 1; return; }
    if (game.cinematic) { this.status = 'WATCHING'; return; }
    this.roomT += dt;
    this.watchdog(game, run, me);

    const pos = { x: lp.x, z: lp.z };
    this.danger.prepare(run, pos.x, lp.y, pos.z);
    const enemies = [...run.enemies.values()].filter((e) => e.alive);
    const active = enemies.filter((e) => e.spawnT <= 0);

    // ── decide: goal (where to go), look (where to aim), fire ──
    let goal: Vec | null = null;      // world point to move toward (null = hold position)
    let goalDir: Vec | null = null;   // or an explicit direction
    let aim: AimTarget | null = null;
    let lookAt: Vec | null = null;
    let allowSprint = false;
    let bhop = false;
    let weaponWant: WeaponId | null = null;
    let fireMode: 'none' | 'shoot' = 'none';
    let targetEnemy: Enemy | null = null;
    const hpFrac = me.hp / Math.max(1, me.mods.maxHp);

    // leech on us: dash it off
    const latched = enemies.some((e) => (e as Enemy & { latched?: unknown }).latched === me);

    const inCombat = active.length > 0 || run.spawnQueue.length > 0 || (!run.cleared && (run.state === 'combat' || run.state === 'boss'));
    if (inCombat && active.length) {
      const pick = this.pickTarget(game, run, me, active, pos);
      targetEnemy = pick;
      if (pick) {
        const v = w.ents.enemies.get(pick.id);
        const d = Math.hypot(pick.x - pos.x, pick.z - pos.z);
        weaponWant = this.chooseWeapon(game, me, pick, d, active, pos);
        aim = this.aimPointFor(game, pick, v, weaponWant);
        const eye = { x: lp.x, y: lp.y + lp.eyeY, z: lp.z };
        const vis = aim ? this.losTo(game, eye, aim) : false;
        const pl = this.positionFor(game, run, me, pick, d, vis, weaponWant, hpFrac, active, pos);
        goal = pl.goal; goalDir = pl.dir;
        const label = NAMES[pick.type] ?? ENEMIES[pick.type].name;
        const bossName = pick.type === 'warden' ? (run.boss?.name ?? 'WARDEN') : '';
        if (pl.glory) this.status = `GLORY KILL · ${label}`;
        else this.status = `${vis ? 'ENGAGING' : 'HUNTING'} ${bossName || label}${pick.elite ? ' (ELITE)' : ''} · ${Math.round(d)}m`;
        if (vis) fireMode = 'shoot';
        if (pl.glory && d - ENEMIES[pick.type].radius < C.GLORY_RANGE + 0.3 && this.useCd <= 0) { inp.pressed.add('glory'); this.useCd = 0.35; }
      }
      // grab a health drop mid-fight when hurting
      if (hpFrac < 0.5) {
        const drop = this.nearestDrop(run, pos, (k) => k === 'hp' || (k === 'armor' && me.armor < 50), 12);
        if (drop) { goal = drop; goalDir = null; this.status = 'GRABBING HEALTH'; }
      }
    } else if (inCombat) {
      // waiting for spawns: drift toward the room centre, face the far end
      goal = { x: 0, z: 0 };
      lookAt = { x: 0, z: -run.geo.d / 2 };
      this.status = run.room.kind === 'boss' ? 'BRACING · ' + (run.boss?.name ?? 'WARDEN') : 'WAITING FOR CONTACT';
      if (Math.hypot(pos.x, pos.z) < 3) goal = null;
    } else {
      const r = this.peaceful(game, run, me, pos, hpFrac, dt);
      goal = r.goal; goalDir = r.dir ?? null; lookAt = r.look; allowSprint = r.sprint; bhop = r.bhop;
      if (r.use && this.useCd <= 0) { inp.pressed.add('use'); this.useCd = 0.3; }
    }
    if (this.wander) {
      if (this.t > this.wander.t) this.wander = null;
      else { goal = { x: this.wander.x, z: this.wander.z }; goalDir = null; this.status = 'REROUTING'; }
    }

    // ── steering ──
    let desired: Vec = { x: 0, z: 0 };
    let steerDist = 0;
    if (goalDir) desired = goalDir;
    else if (goal) {
      const st = this.nav.steer(pos.x, pos.z, goal.x, goal.z);
      if (st) { desired = norm({ x: st.x - pos.x, z: st.z - pos.z }); steerDist = st.dist; if (!st.direct) bhop = false; }
      else desired = norm({ x: goal.x - pos.x, z: goal.z - pos.z });
      const gd = Math.hypot(goal.x - pos.x, goal.z - pos.z);
      if (gd < 0.35) desired = { x: 0, z: 0 };
      else if (gd < 1.2) desired = { x: desired.x * (gd / 1.2), z: desired.z * (gd / 1.2) };
      if (steerDist < 7) bhop = false;
    }
    if (this.unstickT > 0) { this.unstickT -= dt; desired = this.unstickDir; }
    const speed = C.BASE_SPEED * lp.params.speedMult;
    const choice = this.chooseMove(run, desired, speed, enemies);
    if (this.forceDirect && !inCombat && goal) {
      const dd = norm({ x: goal.x - pos.x, z: goal.z - pos.z });
      choice.dir = dd; choice.mag = 1; choice.panic = false; choice.dodging = false;
      if (this.stuckT > 0.3 && this.jumpHoldT <= 0 && this.jumpGapT <= 0) this.jumpHoldT = 0.4;
    }
    this.forceDirect = false;
    let move = choice.dir;
    this.calm = !choice.dodging && !choice.panic;
    const moveMag = choice.mag;

    // ── reflexes ──
    const onGround = lp.s.onGround;
    if (this.danger.shockwaveJump(run, onGround)) this.flagReflex('JUMPING SHOCKWAVE', 0.5);
    const beam = this.danger.beamReflex(run, dt, onGround);
    if (beam === 'jump' && this.jumpHoldT <= 0 && this.jumpGapT <= 0) { this.jumpHoldT = 0.42; this.flagReflex('JUMPING BEAM', 0.4); }
    if (beam === 'duck') { this.crouchT = 0.2; this.flagReflex('DUCKING BEAM', 0.3); }
    if (this.reflex === 'JUMPING SHOCKWAVE' && this.reflexT > 0.45 && this.jumpHoldT <= 0 && this.jumpGapT <= 0) this.jumpHoldT = 0.45;
    const dashReady = lp.s.dashCharges >= 1 && lp.s.dashT <= 0;
    if (dashReady && (latched || choice.panic)) {
      if (latched) { this.flagReflex('SHAKING OFF LEECH', 0.5); if (Math.hypot(move.x, move.z) < 0.1) move = DIRS[Math.floor(Math.random() * 16)]; }
      else this.flagReflex(choice.panicWhy, 0.6);
      inp.pressed.add('dash');
    } else if (choice.dodging && this.reflexT <= 0) this.flagReflex(choice.panicWhy || 'DODGING', 0.25);

    // waist-high box ahead on our path: jump + push forward = mantle
    if (moveMag > 0.5 && onGround && this.jumpHoldT <= 0 && this.jumpGapT <= 0 && (this.nav.climbAt(pos.x + move.x * 0.8, pos.z + move.z * 0.8) && !this.nav.climbAt(pos.x, pos.z))) this.jumpHoldT = 0.4;

    // ── stuck detection (wanting to move, not moving) ──
    this.stuckCheck(game, run, pos, move, moveMag, dt);

    // ── aim ──
    let wantYaw = lp.yaw, wantPitch = 0;
    if (aim) {
      const lead = this.viewVel(targetEnemy?.id ?? -1);
      const ax = aim.x + lead.vx * 0.05, ay = aim.y + lead.vy * 0.05, az = aim.z + lead.vz * 0.05;
      const dx = ax - lp.x, dy = ay - (lp.y + lp.eyeY), dz = az - lp.z;
      wantYaw = Math.atan2(-dx, -dz);
      wantPitch = Math.atan2(dy, Math.hypot(dx, dz));
    } else {
      const lt = lookAt ?? (Math.hypot(move.x, move.z) > 0.2 ? { x: pos.x + move.x * 5, z: pos.z + move.z * 5 } : null);
      if (lt) wantYaw = Math.atan2(-(lt.x - pos.x), -(lt.z - pos.z));
      wantPitch = -0.06;
    }
    this.turn(game, wantYaw, wantPitch, dt, !!aim);

    // ── apply movement ──
    const yaw = lp.yaw;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const mm = Math.min(1, moveMag);
    inp.botFwd = (move.x * fx + move.z * fz) * mm;
    inp.botRight = (move.x * rx + move.z * rz) * mm;
    this.prevMove = { x: move.x * mm, z: move.z * mm };
    if ((allowSprint || !aim) && inp.botFwd > 0.6) inp.held.add('sprint');
    if (this.jumpHoldT > 0) { this.jumpHoldT -= dt; inp.held.add('jump'); if (this.jumpHoldT <= 0) this.jumpGapT = 0.08; }
    else if (bhop && mm > 0.8 && this.jumpGapT <= 0 && !aim) inp.held.add('jump');
    if (this.crouchT > 0) { this.crouchT -= dt; inp.held.add('slide'); }

    // ── weapons ──
    this.handleWeapons(game, me, weaponWant, aim, fireMode, targetEnemy, active, pos, dt);
  }

  private flagReflex(text: string, t: number) { this.reflex = text; this.reflexT = Math.max(this.reflexT, t); }

  // ───────────────────────────── lifecycle ─────────────────────────────

  private onNewGame(game: Game, run: Run) {
    this.game = game;
    this.run = run;
    this.geo = null;
    this.danger.attach(run);
    this.danger.onEvent = (ev) => this.onSimEvent(ev);
    this.progressT = run.time; this.progressSig = '';
    this.prevView.clear();
    // how deep this run means to go before walking out (it still extracts early when hurt);
    // one run in six never extracts — the Endless showcase
    const plan = [15, 20, 20, 25, 25, 30, 35, 40, 40, Infinity, Infinity];
    this.extractAt = plan[Math.floor(Math.random() * plan.length)];
    const orig = game.cb.onEnd.bind(game.cb);
    game.cb.onEnd = (s, meId, extras) => { this.recordRun(s); orig(s, meId, extras); };
    console.log(`[autopilot] run ${this.app.meta.runCount + 1} start · plans to extract at ${this.extractAt} · level ${levelFromXp(this.app.meta.xp).level} · seed ${run.seedStr}`);
  }

  private onNewRoom(run: Run) {
    this.geo = run.geo;
    this.nav.setGeo(run.geo);
    this.roomT = 0; this.doorBanned.clear(); this.shopLogged = false; this.pedSlot = -1; this.doorSlot = -1; this.doorThrough = false; this.sweepT = 0;
    this.targetId = -1; this.wander = null; this.unstickT = 0; this.stuckT = 0;
    this.progressT = run.time;
    this.lastRoomName = `${run.room.index + 1} · ${run.room.kind.toUpperCase()}${run.room.door !== 'standard' ? ' (' + run.room.door.toUpperCase() + ')' : ''}${run.room.mutator ? ' · ' + run.room.mutator.toUpperCase() : ''}`;
    const me = run.players.get('local');
    console.log(`[autopilot] room ${this.lastRoomName} · hp ${me ? Math.round(me.hp) + '/' + me.mods.maxHp : '?'} · scrap ${me?.scrap ?? 0} · last room: ${this.roomHits} hits / ${Math.round(this.roomDmg)} dmg`);
    this.roomDmg = 0; this.roomHits = 0;
  }

  private onSimEvent(ev: GameEvent) {
    if (ev.e === 'kill' && ev.by === 'local') this.sessionKills++;
    if (ev.e === 'playerHit' && ev.id === 'local') { this.roomDmg += ev.dmg; this.roomHits++; }
    if (ev.e === 'pick' && ev.id === 'local') console.log(`[autopilot] picked ${ev.powerup} (${ev.rarity})`);
    if (ev.e === 'buy' && ev.id === 'local') console.log(`[autopilot] bought ${ev.item.kind}${ev.item.offer ? ' ' + ev.item.offer.id : ''} for ${ev.item.price}`);
    if (ev.e === 'playerDeath' && ev.id === 'local') console.log(`[autopilot] DIED in room ${this.lastRoomName}`);
  }

  private recordRun(s: RunSummary) {
    this.sessionRuns++;
    const entry: RunLog = {
      n: this.app.meta.runCount + 1, depth: s.depth, rooms: s.rooms, kills: s.kills, bosses: s.bosses, time: s.timeSec,
      extracted: s.extracted, score: s.score, at: Date.now(), cause: s.extracted ? 'EXTRACTED' : this.lastRoomName,
    };
    this.log.push(entry);
    saveRunLog(this.log);
    console.log(`[autopilot] RUN END ${JSON.stringify(entry)}`);
  }

  /** No progress for a long while: reroute, then force the exit, then give up on the run. */
  private watchdog(game: Game, run: Run, me: SimPlayer) {
    // shoved out through a wall (a physics edge case): there is no way back in — end the run
    const out = Math.abs(me.x) > run.geo.w / 2 + 1 || Math.abs(me.z) > run.geo.d / 2 + 1;
    if (out && this.roomT > 2 && run.transitionT < 0 && !run.geo.doors.some((d) => run.openDoors.has(d.slot) && Math.hypot(me.x - d.x, me.z - d.z) < 6)) {
      if (this.oobT === 0) console.warn(`[autopilot] outside the room at ${me.x.toFixed(1)},${me.z.toFixed(1)} (room ${run.geo.w}×${run.geo.d})`);
      this.oobT += 1 / 30;
    } else this.oobT = 0;
    let hpSum = 0;
    for (const e of run.enemies.values()) hpSum += e.hp;
    const sig = `${run.room.index}|${me.kills}|${Math.round(hpSum / 15)}|${me.pedestals ? 1 : 0}|${run.openDoors.size}|${me.scrap}|${run.spawnQueue.length}|${run.wave}`;
    if (sig !== this.progressSig) { this.progressSig = sig; this.progressT = run.time; if (this.oobT <= 8) return; }
    const idle = run.time - this.progressT;
    const calmRoom = run.cleared && run.enemies.size === 0;
    // can't get through this door? try another one
    if (calmRoom && idle > 12 && this.doorSlot >= 0 && !this.doorBanned.has(this.doorSlot) && run.openDoors.size > 1) {
      console.warn(`[autopilot] door ${this.doorSlot} unreachable for ${Math.round(idle)}s — picking another`);
      this.doorBanned.add(this.doorSlot); this.doorSlot = -1; this.progressT = run.time;
    }
    if (idle > (calmRoom ? 20 : 40) && !this.wander && Math.floor(idle) % (calmRoom ? 6 : 12) === 4) {
      // stage 1: shake it up — pick a random reachable point and go there
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * (run.geo.w - 4), z = (Math.random() - 0.5) * (run.geo.d - 4);
        if (!this.nav.blockedAt(x, z)) { this.wander = { x, z, t: this.t + 4 }; break; }
      }
      this.nav.avoid(me.x, me.z, 8);
      const en = [...run.enemies.values()].slice(0, 8).map((e) => `${e.type}@${e.x.toFixed(1)},${e.y.toFixed(1)},${e.z.toFixed(1)} hp${Math.round(e.hp)}${e.spawnT > 0 ? ' spawning' : ''}${e.aware ? '' : ' unaware'}`).join('; ');
      console.warn(`[autopilot] watchdog: no progress for ${Math.round(idle)}s in ${this.lastRoomName} — rerouting · ${this.status} · me ${me.x.toFixed(1)},${me.y.toFixed(1)},${me.z.toFixed(1)} · state ${run.state} cleared ${run.cleared} queue ${run.spawnQueue.length} doors ${[...run.openDoors]} · shop ${me.shop ? me.shop.length : 'null'} · client room ${game.room?.kind}/${game.world.geo?.desc.kind} · lp ${game.world.player.x.toFixed(1)},${game.world.player.z.toFixed(1)} · ${en}`);
    }
    if (idle > 150 || this.oobT > 8) {
      console.warn('[autopilot] watchdog: abandoning a stuck run');
      this.progressT = run.time;
      for (const p of run.players.values()) { p.hp = 0; p.alive = false; p.died = true; }
      this.lastRoomName += ' (ABANDONED)';
      run.endRun();
      game.net.update(0.01, 1);
    }
  }

  // ───────────────────────────── peaceful: loot, shop, shrine, sweep, exit ─────────────────────────────

  private peaceful(game: Game, run: Run, me: SimPlayer, pos: Vec, hpFrac: number, dt: number): { goal: Vec | null; dir?: Vec; look: Vec | null; use: boolean; sprint: boolean; bhop: boolean } {
    const level = levelFromXp(this.app.meta.xp + game.runXp).level;
    const owned = me.powerups.map((p) => p.id);
    // 1. pedestals
    if (me.pedestals && me.pedestals.length) {
      let ped = me.pedestals.find((p) => p.slot === this.pedSlot) ?? null;
      if (!ped) { ped = choosePedestal(me.pedestals, owned, level, run.room.index); this.pedSlot = ped?.slot ?? -1; }
      if (ped) {
        const d = Math.hypot(ped.x - pos.x, ped.z - pos.z);
        const r = ped.offer.rarity.toUpperCase();
        this.status = `LOOTING ${r} PEDESTAL · ${ped.offer.id.toUpperCase().replace('_', ' ')}`;
        // approach from the near side, stop in reach and look at it
        return { goal: d > 1.1 ? { x: ped.x, z: ped.z + 0.9 } : null, look: { x: ped.x, z: ped.z }, use: d < 2.2, sprint: d > 4, bhop: false };
      }
    }
    // 2. the Broker
    if (me.shop) {
      const it = chooseBuy(me.shop, me.scrap, me.hp, me.mods.maxHp, me.armor, owned, level, run.room.index);
      if (!this.shopLogged) { this.shopLogged = true; console.log(`[autopilot] shop: scrap ${me.scrap} → ${it ? it.kind + ' ' + (it.offer?.id ?? '') : 'nothing'} · ${me.shop.map((i) => i.kind + (i.offer ? ':' + i.offer.id + '/' + i.offer.rarity : '') + '$' + i.price + (i.sold ? 'X' : '')).join(' ')}`); }
      if (it) {
        const d = Math.hypot(it.x - pos.x, it.z - pos.z);
        this.status = `BUYING ${it.kind === 'powerup' && it.offer ? it.offer.id.toUpperCase() : it.kind.toUpperCase()} · ${it.price}◆`;
        return { goal: d > 1.0 ? { x: it.x, z: it.z + 0.8 } : null, look: { x: it.x, z: it.z }, use: d < 1.8, sprint: d > 4, bhop: false };
      }
    }
    // 3. shrine (sanctuary / Wren's door)
    if (me.shrine && (me.hp < me.mods.maxHp * 0.97 || me.armor < 60)) {
      const sh = run.geo.decor.find((dd) => dd.kind === 'shrine');
      if (sh) {
        const d = Math.hypot(sh.x - pos.x, sh.z - pos.z);
        this.status = 'RESTING AT THE SHRINE';
        const fi = this.nav.nearestFree(sh.x + sh.nx * 1.2, sh.z + sh.nz * 1.2, 3);
        const gp = fi >= 0 ? this.nav.center(fi) : { x: sh.x, z: sh.z };
        return { goal: d > 1.6 ? gp : null, look: { x: sh.x, z: sh.z }, use: d < 2.4, sprint: d > 4, bhop: false };
      }
    }
    // 4. sweep drops (scrap always, health/armor when useful), bounded in time
    this.sweepT += dt;
    if (this.sweepT < 9) {
      const drop = this.nearestDrop(run, pos, (k) => k === 'scrap' || (k === 'hp' && hpFrac < 0.98 && !me.mods.martyr) || (k === 'armor' && me.armor < C.PLAYER_MAX_ARMOR && !me.mods.noArmor), 40);
      if (drop) { this.status = 'SWEEPING DROPS'; return { goal: drop, look: null, use: false, sprint: true, bhop: false }; }
    }
    // 5. doors
    const open = run.geo.doors.filter((d) => !d.entry && run.openDoors.has(d.slot));
    if (!open.length) {
      this.status = run.happy && !run.happy.decided ? 'REMEMBERING' : 'WAITING FOR THE DOORS';
      return { goal: run.room.kind === 'happy' ? null : { x: 0, z: 0 }, look: null, use: false, sprint: false, bhop: false };
    }
    let door = open.find((d) => d.slot === this.doorSlot) ?? null;
    if (!door) {
      const snapDoors = game.latest?.doors ?? [];
      const depth = run.room.index + 1;
      const allowed = open.filter((d) => !this.doorBanned.has(d.slot));
      const pool = allowed.length ? allowed : open;
      let best = pool[0], bs = -Infinity;
      for (const d of pool) {
        const sd = snapDoors.find((x) => x.slot === d.slot);
        const sc = scoreDoor({ slot: d.slot, kind: d.kind, nextKind: sd?.nextKind ?? d.nextKind, mutator: d.mutator }, { hpFrac, scrap: me.scrap, depth, level, armor: me.armor, rng: Math.random(), extractAt: this.extractAt });
        if (sc > bs) { bs = sc; best = d; }
      }
      door = best; this.doorSlot = best.slot;
      const sd = snapDoors.find((x) => x.slot === best.slot);
      console.log(`[autopilot] door → ${best.kind} (${sd?.nextKind ?? best.nextKind}) hp ${Math.round(hpFrac * 100)}%`);
    }
    const sd = game.latest?.doors.find((x) => x.slot === door!.slot);
    const label = door.kind === 'extract' ? 'EXTRACTING' : `EXITING → ${door.kind.toUpperCase()} DOOR${sd && sd.nextKind !== 'combat' ? ' (' + sd.nextKind.toUpperCase() + ')' : ''}`;
    this.status = label;
    // the doorway cells are open in our nav grid: path straight through to a point outside
    const out = { x: door.x - door.nx * 2.6, z: door.z - door.nz * 2.6 };
    const depthIn = (pos.x - door.x) * door.nx + (pos.z - door.z) * door.nz; // >0 inside the room
    const lateral = Math.abs((pos.x - door.x) * door.nz - (pos.z - door.z) * door.nx);
    this.doorThrough = depthIn < 2.5;
    // lined up with the opening: just run through it (jumping/mantling anything in the way)
    this.forceDirect = depthIn < 3.2 && lateral < 1.3 && this.unstickT <= 0;
    return { goal: out, look: this.doorThrough ? out : null, use: false, sprint: true, bhop: depthIn > 9 };
  }

  private nearestDrop(run: Run, pos: Vec, want: (k: 'hp' | 'armor' | 'ammo' | 'scrap') => boolean, maxD: number): Vec | null {
    let best: Vec | null = null, bd = maxD;
    for (const d of run.drops) {
      if (!want(d.kind)) continue;
      const dist = Math.hypot(d.x - pos.x, d.z - pos.z);
      if (dist < bd && !this.nav.blockedAt(d.x, d.z)) { bd = dist; best = { x: d.x, z: d.z }; }
    }
    return best;
  }

  // ───────────────────────────── combat decisions ─────────────────────────────

  private pickTarget(game: Game, run: Run, me: SimPlayer, list: Enemy[], pos: Vec): Enemy | null {
    const lp = game.world.player;
    const eye = { x: lp.x, y: lp.y + lp.eyeY, z: lp.z };
    let best: Enemy | null = null, bs = -Infinity, curScore = -Infinity;
    const hpFrac = me.hp / me.mods.maxHp;
    for (const e of list) {
      const v = game.world.ents.enemies.get(e.id);
      if (!v) continue;
      const d = Math.hypot(e.x - pos.x, e.z - pos.z);
      let threat = THREAT[e.type] ?? 2;
      if (e.type === 'bomber') threat *= d < 9 ? 3 : 1.2;
      if (e.type === 'leech') threat *= d < 7 ? 2 : 1;
      if (e.type === 'stalker' && (e as Enemy & { aiming?: boolean }).aiming) threat *= 2.6;
      if (e.type === 'brute') threat *= d < 10 ? 1.8 : 1;
      if (e.type === 'wraith' && e.tell > 0.2) threat *= 1.6;
      if (e.elite) threat *= 1.3;
      if (e.type === 'warden') {
        const b = e as BossLike;
        if (b.bs === 'transition' || b.bs === 'intro' || (b.shieldV ?? 0) > 0.7) threat *= 0.15;
        // adds first while they're on top of us
        const adds = list.filter((o) => o !== e && Math.hypot(o.x - pos.x, o.z - pos.z) < 12).length;
        if (adds) threat *= 0.45;
      }
      // damage reality: frontal shields
      let dmgK = 1;
      if (e.type === 'sentinel' && this.frontalTo(e, pos)) dmgK = 0.12;
      if (e.staggered) { threat *= hpFrac < 0.9 ? 2.2 : 1.4; dmgK = 3; }
      const aim = this.aimPointFor(game, e, v, d < 7 ? 'breacher' : 'pulse');
      const vis = aim ? this.losTo(game, eye, aim) : false;
      const dps = (d < 7 ? 220 : d < 14 ? 190 : 170) * (aim?.head ? 1.7 : 1) * dmgK;
      const ttk = e.hp / dps;
      let score = (threat * (vis ? 1 : 0.18)) / (ttk + 0.6 + d * 0.025);
      if (e.id === this.targetId) { score *= 1.35; curScore = score; }
      if (score > bs) { bs = score; best = e; }
    }
    if (best && best.id !== this.targetId) {
      if (this.targetHold > 0 && curScore > 0 && bs < curScore * 1.25) return run.enemies.get(this.targetId) ?? best;
      this.targetId = best.id; this.targetHold = 0.5;
    }
    return best;
  }

  private frontalTo(e: Enemy, pos: Vec): boolean {
    // is a shot from pos travelling into this enemy's face?
    const dx = e.x - pos.x, dz = e.z - pos.z;
    const l = Math.hypot(dx, dz) || 1;
    const fx = -Math.sin(e.yaw), fz = -Math.cos(e.yaw);
    return (dx / l) * fx + (dz / l) * fz < -0.35;
  }

  private chooseWeapon(game: Game, me: SimPlayer, e: Enemy, d: number, list: Enemy[], pos: Vec): WeaponId {
    const unlocked = game.priv?.unlockedWeapons ?? me.unlocked;
    const ammo = game.ammo;
    const closest = list.reduce((m, o) => Math.min(m, Math.hypot(o.x - pos.x, o.z - pos.z) - o.def.radius), 99);
    const boss = e.type === 'warden' || e.type === 'echo';
    let want: WeaponId = 'pulse';
    if (!boss && d - e.def.radius < 6.5 && e.type !== 'sentinel' && ammo.breacher >= 1 / 14) want = 'breacher';
    else if (unlocked.includes('lance') && ammo.lance >= 0.25 && LANCE_TARGETS.has(e.type) && d > 9 && closest > 8 && !(boss && (e as BossLike).bs === 'idle' && Math.random() < 0)) want = 'lance';
    if (want === 'pulse' && ammo.pulse < 1 / 60) want = ammo.breacher > 0.2 && d < 16 ? 'breacher' : 'pulse';
    if (want === 'breacher' && ammo.breacher < 1 / 14 && ammo.pulse > 0.05) want = 'pulse';
    if (!unlocked.includes(want)) want = 'pulse';
    return want;
  }

  /** Where to put the crosshair on this enemy (the view the client traces against). */
  private aimPointFor(game: Game, e: Enemy, v: { x: number; y: number; z: number; last: { core?: number; wy?: number }; spawnFx: number } | undefined, weapon: WeaponId | null): AimTarget | null {
    if (!v) return null;
    const def = ENEMIES[e.type];
    const hs = C.HITBOX_SCALE;
    const boss = e.type === 'warden' || e.type === 'echo';
    const lp = game.world.player;
    const eye = { x: lp.x, y: lp.y + lp.eyeY, z: lp.z };
    const dist = Math.hypot(v.x - eye.x, v.z - eye.z);
    if (boss) {
      const core = v.last.core ?? 0;
      const wy = v.last.wy ?? def.headY;
      if (core > 0.5) return { x: v.x, y: v.y + wy, z: v.z, r: def.headR * hs * (1 + core * 0.5), head: true };
      const by = Math.min(wy - def.headR * 1.6, def.headY - def.headR * 0.6) * 0.5;
      return { x: v.x, y: v.y + Math.max(1.2, by), z: v.z, r: def.radius * hs * 0.8, head: false };
    }
    const head = { x: v.x, y: v.y + def.headY, z: v.z, r: def.headR * hs, head: true };
    const body = def.flying
      ? { x: v.x, y: v.y + def.height * 0.5, z: v.z, r: def.radius * hs * 1.2, head: false }
      : { x: v.x, y: v.y + (def.headY - def.headR * 0.6) * 0.55, z: v.z, r: def.radius * hs, head: false };
    if (def.headR <= 0) return body;
    // breacher: centre mass high (pellets catch the head too); everything else: the head when we can see it
    if (weapon === 'breacher' && e.type !== 'bulwark') return { ...body, y: (body.y + head.y) * 0.5, r: body.r };
    if (e.type === 'bulwark' || dist < 45 || weapon === 'lance') {
      if (this.losTo(game, eye, head)) return head;
    }
    return body;
  }

  private losTo(game: Game, eye: { x: number; y: number; z: number }, p: { x: number; y: number; z: number }): boolean {
    const dx = p.x - eye.x, dy = p.y - eye.y, dz = p.z - eye.z;
    const L = Math.hypot(dx, dy, dz);
    if (L < 0.2) return true;
    return raycastBoxes(game.world.player.boxes, eye.x, eye.y, eye.z, dx / L, dy / L, dz / L, L) >= L - 0.35;
  }

  /** Combat positioning: weapon range band, strafing, glory approach, low-HP kiting, line-of-sight hunting. */
  private positionFor(game: Game, run: Run, me: SimPlayer, e: Enemy, d: number, vis: boolean, weapon: WeaponId, hpFrac: number, list: Enemy[], pos: Vec): { goal: Vec | null; dir: Vec | null; glory: boolean } {
    const boss = e.type === 'warden' || e.type === 'echo';
    // glory kills: walk in and execute (heals) — unless the room is too hot
    const crowd = list.filter((o) => o !== e && !o.staggered && Math.hypot(o.x - pos.x, o.z - pos.z) < 7).length;
    if (e.staggered && (boss ? (e as BossLike).bs === 'finish' : d < 16 && crowd < 3)) {
      return { goal: { x: e.x, z: e.z }, dir: null, glory: true };
    }
    let min = 8, max = 17;
    if (weapon === 'breacher') { min = 2.5; max = 6; }
    else if (weapon === 'lance') { min = 11; max = 26; }
    if (boss) {
      const b = e as BossLike;
      min = Math.max(9, (b.prefMin ?? 8) + 2); max = Math.max(min + 5, (b.prefMax ?? 16) + 3);
      if (b.bs === 'break') { min = 6; max = 13; }
    }
    if (e.type === 'brute' || e.type === 'bomber' || e.type === 'bulwark') { min = Math.max(min, e.type === 'bomber' ? 7 : 6); max = Math.max(max, min + 4); }
    if (e.type === 'leech') { min = Math.max(min, 5); max = Math.max(max, 12); }
    if (e.type === 'sentinel') { min = 6; max = 14; }
    if (hpFrac < 0.35 && weapon !== 'breacher') { min += 5; max += 7; }
    if (weapon === 'breacher' && (e.type === 'brute' || e.type === 'bulwark') && e.hp > e.maxHp * 0.35) { min = 4.5; max = 7; }

    // sentinels: circle around to the back
    if (e.type === 'sentinel' && this.frontalTo(e, pos) && vis) {
      const ox = pos.x - e.x, oz = pos.z - e.z;
      const l = Math.hypot(ox, oz) || 1;
      const side = (ox * Math.cos(e.yaw) - oz * Math.sin(e.yaw)) > 0 ? 1 : -1;
      const tang = { x: (-oz / l) * side, z: (ox / l) * side };
      const radial = (l - 9) * 0.15;
      return { goal: null, dir: norm({ x: tang.x - (ox / l) * radial, z: tang.z - (oz / l) * radial }), glory: false };
    }
    if (!vis) {
      // hunt: move to where we can see it
      return { goal: { x: e.x, z: e.z }, dir: null, glory: false };
    }
    // separation from the pack
    let sx = 0, sz = 0;
    for (const o of list) {
      const dx = pos.x - o.x, dz = pos.z - o.z, dd = Math.hypot(dx, dz);
      if (dd < 6 && dd > 0.01 && !o.staggered) { sx += (dx / dd) * (6 - dd) / 6; sz += (dz / dd) * (6 - dd) / 6; }
    }
    const tx = e.x - pos.x, tz = e.z - pos.z, tl = Math.hypot(tx, tz) || 1;
    const to = { x: tx / tl, z: tz / tl };
    this.strafeT -= 1 / 60;
    if (this.strafeT <= 0) { this.strafeT = 0.7 + Math.random() * 1.1; if (Math.random() < 0.6) this.strafeDir *= -1; }
    const perp = { x: -to.z * this.strafeDir, z: to.x * this.strafeDir };
    let dir: Vec;
    if (d > max) dir = { x: to.x * 0.8 + perp.x * 0.35, z: to.z * 0.8 + perp.z * 0.35 };
    else if (d < min) dir = { x: -to.x * 0.85 + perp.x * 0.4, z: -to.z * 0.85 + perp.z * 0.4 };
    else dir = { x: perp.x, z: perp.z };
    dir = norm({ x: dir.x + sx * 0.8, z: dir.z + sz * 0.8 });
    // keep away from walls: if the direction runs into geometry soon, flip the strafe
    if (this.nav.blockedAt(pos.x + dir.x * 1.6, pos.z + dir.z * 1.6)) {
      this.strafeDir *= -1;
      if (d > max) return { goal: { x: e.x, z: e.z }, dir: null, glory: false };
    }
    void run; void me;
    return { goal: null, dir, glory: false };
  }

  // ───────────────────────────── steering ─────────────────────────────

  /** Context steering: score 16 headings (+ standing still) against the goal and the threat model. */
  private chooseMove(run: Run, desired: Vec, speed: number, enemies: Enemy[]): { dir: Vec; mag: number; panic: boolean; dodging: boolean; panicWhy: string } {
    const me = this.danger.me;
    const want = Math.hypot(desired.x, desired.z);
    const dn = want > 1e-3 ? { x: desired.x / want, z: desired.z / want } : { x: 0, z: 0 };
    const samples = [0.12, 0.3, 0.5];
    const hw = run.geo.w / 2, hd = run.geo.d / 2;
    const bossNear = enemies.some((e) => (e.type === 'warden' || e.type === 'brute' || e.type === 'bulwark') && Math.hypot(e.x - me.x, e.z - me.z) < 12);
    const sw = [1.3, 1.0, 0.7];
    const evalDir = (u: Vec, sp: number) => {
      let c = 0, blockedAt = 99;
      for (let i = 0; i < samples.length; i++) {
        const t = samples[i];
        const tt = Math.min(t, blockedAt);
        const x = me.x + u.x * sp * tt, z = me.z + u.z * sp * tt;
        if (sp > 0 && blockedAt === 99 && this.nav.blockedAt(x, z)) { blockedAt = Math.max(0, t - 0.15); c += i === 0 ? 1.4 : 0.6; }
        c += this.danger.pointCost(run, x, z, t, enemies) * sw[i];
        // never get pinned between a Warden and a wall (its body shoves you, and the shove can go through)
        if (bossNear) { const m = Math.min(hw - Math.abs(x), hd - Math.abs(z)); if (m < 4.5) c += 1.6 * (1 - m / 4.5) * sw[i]; }
      }
      const ux = blockedAt < 99 ? 0 : u.x * sp, uz = blockedAt < 99 ? 0 : u.z * sp;
      c += this.danger.projectileCost(ux, uz, 0.6);
      return c;
    };
    const stayDanger = evalDir({ x: 0, z: 0 }, 0);
    let best: Vec = { x: 0, z: 0 }, bc = Infinity, bestDanger = stayDanger;
    const goalW = 1.4;
    const cand: { u: Vec; sp: number }[] = [{ u: { x: 0, z: 0 }, sp: 0 }];
    for (const u of DIRS) cand.push({ u, sp: speed });
    for (const { u, sp } of cand) {
      const dg = sp === 0 ? stayDanger : evalDir(u, sp);
      let goalCost: number;
      if (want < 1e-3) goalCost = sp === 0 ? 0 : 0.35;
      else goalCost = sp === 0 ? goalW * want : goalW * want * (1 - (u.x * dn.x + u.z * dn.z)) * 0.5 + (1 - want) * 0.3;
      const inertia = sp === 0 ? 0 : 0.18 * (1 - (u.x * this.prevMove.x + u.z * this.prevMove.z));
      const c = dg + goalCost + inertia;
      if (c < bc) { bc = c; best = u; bestDanger = dg; }
    }
    // magnitude: full speed unless we're settling on a goal point
    let mag = best.x || best.z ? (want > 1e-3 && bestDanger < 0.5 ? Math.max(0.35, Math.min(1, want)) : 1) : 0;
    if (!best.x && !best.z) mag = 0;
    const dodging = bestDanger > 0.6 || stayDanger > 1.5;
    // panic: standing here will hurt and moving barely helps → dash
    const panic = stayDanger > 4 && bestDanger > 2.2;
    let why = '';
    if (dodging || panic) {
      if (this.danger.projs.length && this.danger.projectileCost(0, 0, 0.5) > 1) why = 'DODGING PROJECTILES';
      else if (this.danger.areas.length) why = 'CLEARING THE BLAST ZONE';
      else if (this.danger.tells.length) why = 'SIDESTEPPING TELEGRAPH';
      else why = 'EVADING';
    }
    void enemies;
    return { dir: best, mag, panic, dodging, panicWhy: why };
  }

  private stuckCheck(game: Game, run: Run, pos: Vec, move: Vec, mag: number, dt: number) {
    const lp = game.world.player;
    const wantMove = mag > 0.5 && (move.x || move.z);
    this.stuckRef.t += dt;
    if (this.stuckRef.t > 0.5) {
      const moved = Math.hypot(pos.x - this.stuckRef.x, pos.z - this.stuckRef.z);
      if (wantMove && moved < 0.8 && lp.s.mantleT !== undefined && !(lp.s.mantleT > 0)) this.stuckT += this.stuckRef.t; else this.stuckT = Math.max(0, this.stuckT - this.stuckRef.t * 2);
      this.stuckRef = { x: pos.x, z: pos.z, t: 0 };
    }
    if (this.stuckT > 0.5 && this.jumpHoldT <= 0 && this.jumpGapT <= 0) this.jumpHoldT = 0.35; // mantle / hop over it
    if (this.stuckT > 1.4 && this.unstickT <= 0) {
      const a = Math.random() * Math.PI * 2;
      this.unstickDir = { x: Math.cos(a), z: Math.sin(a) };
      this.unstickT = 0.6;
      this.nav.avoid(pos.x + move.x * 1.0, pos.z + move.z * 1.0, 5);
      this.stuckT = 0.6;
      void run;
    }
  }

  // ───────────────────────────── aim + weapons ─────────────────────────────

  private viewVel(id: number): { vx: number; vy: number; vz: number } {
    const g = this.game;
    if (!g) return { vx: 0, vy: 0, vz: 0 };
    const v = g.world.ents.enemies.get(id);
    if (!v) return { vx: 0, vy: 0, vz: 0 };
    const p = this.prevView.get(id);
    if (!p || this.t - p.t > 0.3) { this.prevView.set(id, { x: v.x, y: v.y, z: v.z, t: this.t, vx: 0, vy: 0, vz: 0 }); return { vx: 0, vy: 0, vz: 0 }; }
    const dt = this.t - p.t;
    if (dt > 0.04) {
      const k = 0.5;
      p.vx = p.vx * (1 - k) + ((v.x - p.x) / dt) * k; p.vy = p.vy * (1 - k) + ((v.y - p.y) / dt) * k; p.vz = p.vz * (1 - k) + ((v.z - p.z) / dt) * k;
      p.x = v.x; p.y = v.y; p.z = v.z; p.t = this.t;
    }
    return p;
  }

  /** Smooth, rate-limited, slightly imperfect turning (a very good human, not a snap-bot). */
  private turn(game: Game, wantYaw: number, wantPitch: number, dt: number, combat: boolean) {
    const lp = game.world.player;
    this.aimNoise.t -= dt;
    if (this.aimNoise.t <= 0) { this.aimNoise = { yaw: (Math.random() - 0.5) * 0.004, pitch: (Math.random() - 0.5) * 0.003, t: 0.25 + Math.random() * 0.3 }; }
    const ey = wrapA(wantYaw + (combat ? this.aimNoise.yaw : 0) - lp.yaw);
    const ep = wantPitch + (combat ? this.aimNoise.pitch : 0) - lp.pitch;
    const maxRate = combat ? 16 : 7; // rad/s
    const k = combat ? 22 : 9;
    const sy = Math.sign(ey) * Math.min(Math.abs(ey) * k * dt + (Math.abs(ey) > 0.6 ? 2 * dt : 0), maxRate * dt, Math.abs(ey));
    const spch = Math.sign(ep) * Math.min(Math.abs(ep) * k * dt, maxRate * dt, Math.abs(ep));
    lp.yaw += sy;
    lp.pitch = Math.max(-1.45, Math.min(1.45, lp.pitch + spch));
  }

  /** Would a hitscan ray along the current view hit this enemy's view before a wall? */
  private rayHits(game: Game, id: number, spreadPad: number): boolean {
    const lp = game.world.player;
    const v = game.world.ents.enemies.get(id);
    if (!v) return false;
    const def = ENEMIES[v.type];
    const ox = lp.x, oy = lp.y + lp.eyeY, oz = lp.z;
    const dx = -Math.sin(lp.yaw) * Math.cos(lp.pitch), dy = Math.sin(lp.pitch), dz = -Math.cos(lp.yaw) * Math.cos(lp.pitch);
    const hs = C.HITBOX_SCALE;
    const boss = v.type === 'warden' || v.type === 'echo';
    const dist = Math.hypot(v.x - ox, v.z - oz);
    const pad = spreadPad * dist;
    const th = rayVsSphere(ox, oy, oz, dx, dy, dz, v.x, v.y + (boss ? v.last.wy ?? def.headY : def.headY), v.z, def.headR * hs * (boss ? 1 + (v.last.core ?? 0) * 0.5 : 1) + pad * 0.5);
    const tb = def.flying
      ? rayVsSphere(ox, oy, oz, dx, dy, dz, v.x, v.y + def.height * 0.5, v.z, def.radius * hs * 1.2 + pad * 0.5)
      : rayVsCylinder(ox, oy, oz, dx, dy, dz, v.x, v.z, v.y, v.y + def.headY - def.headR * 0.6, def.radius * hs + pad * 0.5);
    const t = th >= 0 && tb >= 0 ? Math.min(th, tb) : Math.max(th, tb);
    if (t < 0) return false;
    const wall = raycastBoxes(lp.boxes, ox, oy, oz, dx, dy, dz, t + 0.5);
    return wall >= t - 0.05;
  }

  private handleWeapons(game: Game, me: SimPlayer, want: WeaponId | null, aim: AimTarget | null, mode: 'none' | 'shoot', target: Enemy | null, list: Enemy[], pos: Vec, dt: number) {
    const inp = game.world.input;
    const cur = game.weapon;
    void me; void dt;
    // switch
    if (want && want !== cur && this.weaponCd <= 0 && !(game.charging && game.lanceCharge > 0.6)) {
      inp.pressed.add(want === 'pulse' ? 'w1' : want === 'breacher' ? 'w2' : want === 'lance' ? 'w3' : 'w4');
      this.weaponCd = 0.35;
      return;
    }
    // reload when it's quiet
    const threatNear = list.some((e) => Math.hypot(e.x - pos.x, e.z - pos.z) < 22);
    if (game.reloadT <= 0 && this.reloadCd <= 0 && cur !== 'ripper' && game.ammo[cur] < (threatNear ? 0.02 : 0.45) && !game.charging) {
      if (!target || !threatNear || game.ammo[cur] < WEAPONS[cur].ammoCost) { inp.pressed.add('reload'); this.reloadCd = 0.6; return; }
    }
    if (mode !== 'shoot' || !aim || !target || game.reloadT > 0) {
      // keep the lance charged while hunting? no — release safely
      return;
    }
    const def = WEAPONS[cur];
    // long, quiet shots: aim down sights (tighter spread, the scope's zoom on the spectator view)
    const td = Math.hypot(target.x - pos.x, target.z - pos.z);
    if (this.calm && ((cur === 'pulse' && td > 22) || (cur === 'lance' && td > 14))) inp.held.add('aim');
    if (def.kind === 'charge') {
      const aligned = this.rayHits(game, target.id, 0);
      if (game.charging && game.lanceCharge >= 0.97 && aligned) { this.lanceAligned++; if (this.lanceAligned >= 1) return; } // release = fire
      this.lanceAligned = 0;
      inp.held.add('fire');
      return;
    }
    if (def.kind === 'melee') {
      const d = Math.hypot(target.x - pos.x, target.z - pos.z) - target.def.radius;
      if (d < C.RIPPER_RANGE) inp.held.add('fire');
      return;
    }
    const spreadPad = def.kind === 'shotgun' ? def.spread * 0.6 : 0;
    if (game.fireCd <= 0 && this.rayHits(game, target.id, spreadPad)) {
      // tap-fire: one frame on, frames off — the PULSE keeps first-shot accuracy at full cadence
      inp.held.add('fire');
      inp.pressed.add('fire');
    }
  }
}
