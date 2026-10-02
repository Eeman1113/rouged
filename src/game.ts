// ROUGED — game orchestrator: states, run loop, combat resolution, juice.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as C from './constants';
import { RNG, randomSeedString, seedStringToNumber } from './rng';
import { audio } from './audio';
import { Player, InputState } from './player';
import { WeaponSystem, WEAPONS } from './weapons';
import { EnemyManager, Enemy } from './enemies';
import { buildWorld, openDoor, BuiltWorld, Room, AABB, raycastWalls, BIOME_THEMES, HUB_THEME, setActiveLights } from './world';
import { HUD, FaceMood } from './hud';
import { PowerupState, PowerupDef, rollPowerups } from './powerups';
import { handlerLine, degradationForRun, FRAGMENTS } from './handler';
import { MetaState, loadMeta, saveMeta, grantXp, xpForLevel, LEVEL_UNLOCKS } from './meta';

const $ = (id: string) => document.getElementById(id)!;

const WARDEN_NAMES = ['WARDEN-KILN', 'WARDEN-MNEMON', 'WARDEN-PRIME'];
const RARITY_COLORS: Record<string, number> = { common: 0xaaaaaa, rare: 0x3a6adf, epic: 0x9a3adf, legendary: 0xffb400 };

interface Particle { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number; grav: number; }
interface Pedestal { def: PowerupDef; group: THREE.Group; cube: THREE.Mesh; riseT: number; }

type State = 'title' | 'playing' | 'powerup' | 'dead' | 'complete' | 'paused';

export class Game {
  renderer!: THREE.WebGLRenderer;
  composer!: EffectComposer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  hud = new HUD();
  meta: MetaState = loadMeta();
  state: State = 'title';

  player = new Player();
  weapons = new WeaponSystem();
  pw = new PowerupState();
  input: InputState = { forward: false, back: false, left: false, right: false, jump: false, dash: false, fire: false, interact: false, glory: false, mouseDX: 0, mouseDY: 0 };

  world: BuiltWorld | null = null;
  enemies: EnemyManager | null = null;
  currentRoom = 0;
  roomActivated = false;

  seedStr = '';
  seedNum = 0;
  rng = new RNG(1);

  // dopamine state
  combo = 1;
  comboTimer = 0;
  score = 0;
  kills = 0;
  killTimes: number[] = [];
  timeScale = 1;
  slowmoT = 0;
  shake = 0;
  particles: Particle[] = [];
  bloodPools: THREE.Mesh[] = [];
  pedestalMeshes: Pedestal[] = [];
  pendingPowerups: [PowerupDef, PowerupDef] | null = null;
  pedestalAnimT = -1;
  killCountTotal = 0; // for executioner
  deathT = -1;
  fragmentQueue: number[] = [];
  completeT = -1;
  lastFrame = 0;
  fpsAcc = 0; fpsN = 0;
  hurtFaceT = 0;
  lanceStopHum: (() => void) | null = null;
  bossRef: Enemy | null = null;
  titleInteracted = false;

  private particlePool: THREE.Mesh[] = [];
  private particleGeo = new THREE.PlaneGeometry(0.12, 0.12);
  private bloodMat = new THREE.MeshBasicMaterial({ color: 0x8a0f0f });
  private sparkMat = new THREE.MeshBasicMaterial({ color: 0xffb060 });
  private chunkMat = new THREE.MeshBasicMaterial({ color: 0x3a0a0a });
  private poolGeo = new THREE.CircleGeometry(1, 10);
  private poolMat = new THREE.MeshBasicMaterial({ color: 0x3f0808, transparent: true, opacity: 0.85 });

  init() {
    const canvas = document.createElement('canvas');
    canvas.id = 'game';
    $('app').appendChild(canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    // low internal resolution, nearest-neighbor upscale — the DOOM look
    this.renderer.setSize(480, 270, false);
    this.renderer.setPixelRatio(1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(78, 480 / 270, 0.05, 120);
    this.camera.rotation.order = 'YXZ';

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(480, 270), 1.25, 0.65, 0.55);
    this.composer.addPass(bloom);
    this.composer.setSize(480, 270);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    this.bindInput();
    this.bindUI();
    this.refreshTitleStats();
    requestAnimationFrame((t) => { this.lastFrame = t; this.frame(t); });
  }

  // ── input ──
  private bindInput() {
    const key = (e: KeyboardEvent, down: boolean) => {
      switch (e.code) {
        case 'KeyW': this.input.forward = down; break;
        case 'KeyS': this.input.back = down; break;
        case 'KeyA': this.input.left = down; break;
        case 'KeyD': this.input.right = down; break;
        case 'Space': this.input.jump = down; e.preventDefault(); break;
        case 'ShiftLeft': case 'ShiftRight': if (down) this.input.dash = true; break;
        case 'KeyE': if (down) this.input.interact = true; break;
        case 'KeyF': if (down) this.input.glory = true; break;
        case 'Digit1': if (down && this.state === 'playing') this.trySwitch(0); break;
        case 'Digit2': if (down && this.state === 'playing') this.trySwitch(1); break;
        case 'Digit3': if (down && this.state === 'playing') this.trySwitch(2); break;
        case 'Digit4': if (down && this.state === 'playing') this.trySwitch(3); break;
      }
    };
    window.addEventListener('keydown', e => key(e, true));
    window.addEventListener('keyup', e => key(e, false));
    window.addEventListener('mousedown', e => {
      if (e.button === 0) {
        if (this.state === 'playing') {
          if (document.pointerLockElement) this.input.fire = true;
          else this.lockPointer();
        }
      }
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.input.fire = false; });
    window.addEventListener('mousemove', e => {
      if (document.pointerLockElement && this.state === 'playing') {
        this.input.mouseDX += e.movementX;
        this.input.mouseDY += e.movementY;
      }
    });
    window.addEventListener('wheel', e => {
      if (this.state !== 'playing') return;
      const unlocked = this.weapons.unlockedWeapons().length;
      let idx = this.weapons.current + (e.deltaY > 0 ? 1 : -1);
      idx = ((idx % unlocked) + unlocked) % unlocked;
      this.trySwitch(idx);
    });
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.state === 'playing') {
        this.pause();
      }
    });
  }

  private trySwitch(idx: number) {
    if (this.weapons.switchTo(idx)) audio.powerupPick();
    else if (WEAPONS[idx].unlockLevel > this.weapons.playerLevel) {
      this.hud.handlerSay(`WEAPON LOCKED — REQUIRES LEVEL ${WEAPONS[idx].unlockLevel}`, 1500);
    }
  }

  private lockPointer() {
    const c = this.renderer.domElement;
    if (c.requestPointerLock) c.requestPointerLock();
  }

  private bindUI() {
    $('btn-deploy').onclick = () => {
      audio.init(); audio.resume(); audio.startMusic();
      this.titleInteracted = true;
      const seedInput = ($('seed-input') as HTMLInputElement).value.trim();
      this.startRun(seedInput || undefined);
    };
    $('btn-respawn').onclick = () => {
      $('death-screen').classList.add('hidden');
      this.startRun(undefined);
    };
    $('btn-nextrun').onclick = () => {
      $('run-complete-screen').classList.add('hidden');
      this.startRun(undefined);
    };
    $('btn-resume').onclick = () => {
      $('pause-screen').classList.add('hidden');
      this.state = 'playing';
      this.lockPointer();
    };
    $('btn-abandon').onclick = () => {
      $('pause-screen').classList.add('hidden');
      this.endRunToTitle();
    };
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    $('pause-screen').classList.remove('hidden');
  }

  endRunToTitle() {
    this.teardownWorld();
    this.state = 'title';
    this.hud.hide();
    audio.setMusicIntensity(0);
    $('title-screen').classList.remove('hidden');
    this.refreshTitleStats();
  }

  private refreshTitleStats() {
    const m = this.meta;
    $('title-stats').innerHTML =
      `SIMULATION RECORD — RUNS ${m.runs} · TERMINATIONS ${m.deaths} · LEVEL ${m.level}<br/>` +
      `BEST SCORE ${m.bestScore} · DEEPEST ROOM ${m.bestRoom} · CORES ${m.cores}`;
  }

  // ── run lifecycle ──
  startRun(seedStr?: string) {
    this.teardownWorld();
    this.seedStr = seedStr || randomSeedString();
    this.seedNum = seedStringToNumber(this.seedStr);
    this.rng = new RNG(this.seedNum);
    this.meta.runs++;
    saveMeta(this.meta);

    this.pw = new PowerupState();
    this.weapons = new WeaponSystem();
    this.weapons.playerLevel = this.meta.level;
    this.player = new Player();
    this.player.maxHp = Math.min(C.PLAYER_MAX_HP, C.PLAYER_HP + (this.meta.level - 1) * 2);

    this.combo = 1; this.comboTimer = 0; this.score = 0; this.kills = 0; this.killTimes = [];
    this.killCountTotal = 0;
    this.timeScale = 1; this.slowmoT = 0; this.shake = 0;
    this.deathT = -1; this.completeT = -1; this.pedestalAnimT = -1;
    this.bossRef = null;

    this.world = buildWorld(this.seedNum, this.scene, this.meta.deaths, this.meta.runs);
    this.enemies = new EnemyManager(this.scene, this.seedNum);
    this.currentRoom = 0;
    this.roomActivated = false;

    const hub = this.world.rooms[0];
    hub.cleared = true;
    this.player.reset(hub.playerSpawn.clone().add(new THREE.Vector3(2, 0, 0)));
    this.player.yaw = -Math.PI / 2;
    this.player.pitch = 0;
    if (hub.exitDoor) openDoor(this.world, hub);
    this.applyFog(hub);

    this.state = 'playing';
    $('title-screen').classList.add('hidden');
    this.hud.show();
    this.hud.setFace('calm');
    this.hud.setRunCount(this.meta.runs);
    this.hud.bossBar(false);
    this.lockPointer();

    audio.setMusicIntensity(0);
    // hub welcome
    const line = this.meta.runs <= 1
      ? 'Candidate online. Neural link stable. You are the best we have ever scanned.'
      : handlerLine('hub_return', this.meta.runs);
    this.handlerSpeak(line);
    this.hud.roomBanner('THE HUB', `RUN ${this.meta.runs} · SEED ${this.seedStr}`);
    this.enterRoom(0);
  }

  private teardownWorld() {
    if (this.world) {
      this.scene.remove(this.world.group);
      this.world.group.traverse(o => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); }
      });
      this.world = null;
    }
    if (this.enemies) { this.enemies.disposeAll(); this.enemies = null; }
    for (const p of this.particles) this.scene.remove(p.mesh);
    this.particles = [];
    for (const b of this.bloodPools) this.scene.remove(b);
    this.bloodPools = [];
    for (const p of this.pedestalMeshes) this.scene.remove(p.group);
    this.pedestalMeshes = [];
    this.pendingPowerups = null;
  }

  private applyFog(room: Room) {
    const theme = room.type === 'hub' ? HUB_THEME : BIOME_THEMES[room.biome];
    this.scene.fog = new THREE.FogExp2(theme.fog, theme.fogDensity);
    this.scene.background = new THREE.Color(theme.fog);
  }

  private handlerSpeak(text: string, dur = 3800) {
    if (!text) return;
    this.hud.handlerSay(text, dur);
    audio.speak(text, degradationForRun(this.meta.runs));
  }

  private collidersFor(): AABB[] {
    if (!this.world) return [];
    const room = this.world.rooms[this.currentRoom];
    return this.world.allColliders.concat(room.colliders);
  }

  // ── room flow ──
  private enterRoom(idx: number) {
    if (!this.world || !this.enemies) return;
    const room = this.world.rooms[idx];
    this.currentRoom = idx;
    this.applyFog(room);
    setActiveLights(this.world, idx);

    if (idx === 0) return; // hub

    const theme = BIOME_THEMES[room.biome];
    const typeLabel = room.type.toUpperCase();
    this.hud.roomBanner(`${theme.name} — ${typeLabel}`, `ROOM ${idx} / ${this.world.rooms.length - 1}`);
    this.handlerSpeak(handlerLine('room_enter', this.meta.runs), 2600);

    if (room.requiresClear && !this.roomActivated) {
      this.roomActivated = true;
      if (room.type === 'arena') {
        // wave 1 of 3
        room.wave = 1;
        const third = Math.ceil(room.spawns.length / 3);
        const waveSpawns = room.spawns.slice(0, third);
        const r2: Room = { ...room, spawns: waveSpawns };
        this.enemies.spawnForRoom(r2, room.colliders, room.biome);
      } else {
        this.enemies.spawnForRoom(room, room.colliders, room.biome);
      }
      audio.setMusicIntensity(1);
      if (room.type === 'boss') {
        this.bossRef = this.enemies.enemies.find(e => e.type === 'warden' && e.roomIdx === idx) || null;
        this.hud.bossBar(true, WARDEN_NAMES[room.biome], 1);
        this.handlerSpeak(handlerLine('boss', this.meta.runs));
        audio.bossRoar();
        audio.setMusicIntensity(1, true);
      }
      // engage everyone in the room
      for (const e of this.enemies.enemies) {
        if (e.roomIdx === idx && e.state === 'patrol') e.state = 'engage';
      }
    } else if (room.type === 'anomaly') {
      this.handlerSpeak('Something is wrong with this room. Proceed carefully.', 3000);
      audio.setMusicIntensity(0);
      // deep-run replicas guard anomalies
      if (idx >= 12 || this.meta.level >= 25) {
        this.enemies.spawn('replica', room.center.x + 3, room.center.z - 2, false, idx, room.biome);
        this.enemies.spawn('replica', room.center.x + 3, room.center.z + 2, false, idx, room.biome);
        for (const e of this.enemies.enemies) if (e.roomIdx === idx) e.state = 'engage';
        room.requiresClear = true;
        this.roomActivated = true;
      }
      if (room.exitDoor && !room.requiresClear) openDoor(this.world, room);
    } else if (!room.requiresClear) {
      if (room.exitDoor) openDoor(this.world, room);
    }
  }

  private onRoomCleared(room: Room) {
    if (!this.world || !this.enemies) return;
    room.cleared = true;
    this.enemies.clearRoom(room.index);
    if (room.exitDoor) {
      openDoor(this.world, room);
      audio.doorOpen();
    }
    this.hud.bossBar(false);
    this.handlerSpeak(room.type === 'boss' ? handlerLine('boss_dead', this.meta.runs) : handlerLine('room_clear', this.meta.runs), 2600);
    this.score += 100 * this.combo;
    this.hud.scorePopup(`+${100 * this.combo}`);

    if (room.type === 'boss') {
      this.meta.cores++;
      saveMeta(this.meta);
      if (room.index === this.world.rooms.length - 1) {
        // run complete
        this.completeT = 2.2;
        audio.setMusicIntensity(0);
        return;
      }
    }

    // reward pedestals (not after boss — boss leads onward)
    if (room.type !== 'boss') {
      this.spawnPedestals(room);
    }
    audio.setMusicIntensity(0);
  }

  private spawnPedestals(room: Room) {
    if (!this.world) return;
    const rollRng = new RNG(this.seedNum ^ (room.index * 7919) ^ (this.kills * 131));
    this.pendingPowerups = rollPowerups(rollRng, this.pw, room.index);
    this.pw.lastOffered = this.pendingPowerups[0].id;
    const hasLegendary = this.pendingPowerups.some(p => p.rarity === 'legendary');
    audio.powerupReveal(hasLegendary);
    if (hasLegendary) this.handlerSpeak(handlerLine('legendary', this.meta.runs));
    else this.handlerSpeak(handlerLine('reward', this.meta.runs), 2200);

    this.pedestalMeshes = this.pendingPowerups.map((def, i) => {
      const spot = room.pedestalSpots[i] || room.center.clone();
      const group = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.7, 1.0, 8),
        new THREE.MeshLambertMaterial({ color: 0x2a2723 }));
      base.position.y = 0.5;
      const color = def.category === 'curse' ? 0x3adf6a : RARITY_COLORS[def.rarity];
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(color), emissiveIntensity: 2.5 }));
      cube.position.y = 1.6;
      const light = new THREE.PointLight(color, 14, 8, 1.8);
      light.position.y = 2.0;
      group.add(base, cube, light);
      group.position.set(spot.x, -2.2, spot.z); // rises from the floor
      this.scene!.add(group);
      return { def, group, cube, riseT: 0 };
    });
    this.pedestalAnimT = 0;
  }

  private pickPowerup(idx: number) {
    if (!this.pendingPowerups) return;
    const chosen = this.pendingPowerups[idx];
    const synergy = this.pw.add(chosen);
    audio.powerupPick();
    audio.shatter(); // the other one shatters
    // remove pedestals
    for (const p of this.pedestalMeshes) this.scene.remove(p.group);
    this.pedestalMeshes = [];
    this.pendingPowerups = null;

    // apply immediate effects
    if (chosen.id === 'max_hp') {
      this.player.maxHp = Math.min(C.PLAYER_MAX_HP, this.player.maxHp + 20);
      this.player.heal(20);
    }
    if (chosen.id === 'curse_glass') {
      this.player.maxHp = Math.max(30, Math.floor(this.player.maxHp * 0.5));
      this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    }
    this.hud.announce(chosen.name);
    this.hud.killfeed(`ACQUIRED ${chosen.name}`, chosen.rarity === 'legendary');

    if (synergy) {
      this.hud.synergyFlash();
      audio.synergyFound();
      this.handlerSpeak(handlerLine('synergy', this.meta.runs));
      this.hud.announce(`SYNERGY — ${synergy.name}`);
      if (!this.meta.synergiesFound.includes(synergy.name)) {
        this.meta.synergiesFound.push(synergy.name);
        saveMeta(this.meta);
      }
    }

    this.state = 'playing';
    this.lockPointer();
  }

  // ── combat: firing ──
  private tryFire(dt: number) {
    if (!this.enemies || !this.world) return;
    const w = WEAPONS[this.weapons.current];
    const colliders = this.collidersFor();

    if (this.weapons.current === 2) {
      // LANCE — fire on release
      if (this.weapons.lanceCharging && !this.input.fire) {
        if (this.lanceStopHum) { this.lanceStopHum(); this.lanceStopHum = null; }
        const dmg = this.weapons.lanceDamage();
        audio.shootLance(this.weapons.lanceCharge);
        this.shake = Math.max(this.shake, 6);
        this.fireRay(dmg, 1, 0, w.range, true, colliders);
        this.weapons.consumeLance();
      } else if (this.weapons.lanceCharging && !this.lanceStopHum) {
        this.lanceStopHum = audio.lanceChargeStart();
      }
      return;
    }

    if (!this.input.fire || !this.weapons.canFire()) return;
    this.weapons.onFired(this.pw);

    if (this.weapons.current === 0) { audio.shootPulse(); this.shake = Math.max(this.shake, 1.2); this.fireRay(w.dmg * this.damageMult(), w.pellets, w.spread, w.range, false, colliders); }
    else if (this.weapons.current === 1) { audio.shootBreacher(); this.shake = Math.max(this.shake, 5); this.fireRay(w.dmg * this.damageMult(), w.pellets, w.spread, w.range, false, colliders); }
    else if (this.weapons.current === 3) { audio.ripper(); this.fireRay(w.dmg * this.damageMult(), 1, w.spread, w.range, false, colliders, true); }
  }

  private damageMult(): number {
    let m = 1;
    if (this.pw.has('curse_glass')) m *= 2;
    return m;
  }

  private fireRay(dmg: number, pellets: number, spread: number, range: number, pierceAll: boolean, colliders: AABB[], isMelee = false) {
    if (!this.enemies) return;
    const origin = this.player.eyePos();
    const baseDir = this.player.forwardDir();
    const pierce = pierceAll ? 99 : 1 + this.pw.count('pierce');

    for (let p = 0; p < pellets; p++) {
      const dir = baseDir.clone();
      if (spread > 0) {
        dir.x += (Math.random() - 0.5) * spread * 2;
        dir.y += (Math.random() - 0.5) * spread * 2;
        dir.z += (Math.random() - 0.5) * spread * 2;
        dir.normalize();
      }
      const wallDist = Math.min(range, raycastWalls(colliders, origin, dir, range));

      // collect enemy hits sorted by distance (sphere test: head + body)
      const hits: { e: Enemy; t: number; head: boolean }[] = [];
      for (const e of this.enemies.enemies) {
        if (e.state === 'dead') continue;
        const h = e.sprite.scale.y, w2 = e.sprite.scale.x;
        const bodyC = new THREE.Vector3(e.pos.x, e.type === 'drone' ? e.pos.y : h * 0.45, e.pos.z);
        const bodyR = Math.max(w2, h * 0.5) * 0.62;
        const headC = new THREE.Vector3(e.pos.x, e.type === 'drone' ? e.pos.y + h * 0.15 : h * 0.85, e.pos.z);
        const headR = w2 * 0.34;
        const th = this.raySphere(origin, dir, headC, headR);
        const tb = this.raySphere(origin, dir, bodyC, bodyR);
        let t = -1, head = false;
        if (th > 0 && th <= wallDist) { t = th; head = true; }
        if (tb > 0 && tb <= wallDist && (t < 0 || tb < t)) { t = tb; head = false; }
        if (t > 0) hits.push({ e, t, head });
      }
      hits.sort((a, b) => a.t - b.t);
      const n = Math.min(pierce, hits.length);
      for (let i = 0; i < n; i++) {
        this.applyHit(hits[i].e, dmg * (i === 0 ? 1 : 0.7), hits[i].head, origin.clone().addScaledVector(dir, hits[i].t), dir);
      }
    }
  }

  private raySphere(o: THREE.Vector3, d: THREE.Vector3, c: THREE.Vector3, r: number): number {
    const oc = c.clone().sub(o);
    const t = oc.dot(d);
    if (t < 0) return -1;
    const d2 = oc.lengthSq() - t * t;
    if (d2 > r * r) return -1;
    return t - Math.sqrt(r * r - d2);
  }

  private applyHit(e: Enemy, dmg: number, headshot: boolean, point: THREE.Vector3, dir: THREE.Vector3) {
    if (!this.enemies || e.state === 'dead') return;
    let final = dmg;
    if (headshot) final *= C.HEADSHOT_MULT * (1 + this.pw.count('headhunter') * 0.2);
    if (e.state === 'staggered') final *= 1.5;
    e.hp -= final;
    e.hitFlash = 0.08;

    // feedback layers — every hit
    this.hud.hitmarker(false);
    audio.hitmark();
    this.shake = Math.max(this.shake, C.SCREEN_SHAKE_HIT * 0.5);
    this.bloodSpray(point, dir, 8);
    const sp = this.worldToScreen(point);
    if (sp) this.hud.damageNumber(sp.x, sp.y, final, headshot);

    // lifesteal
    if (this.pw.hasTag('lifesteal')) this.player.heal(final * 0.02);

    // tesla: arc between marked
    if (this.pw.has('leg_tesla') || this.pw.foundSynergies.has('TESLA PROTOCOL')) {
      this.enemies.mark(e);
      const marked = this.enemies.enemies.filter(x => x.marked && x.state !== 'dead' && x.id !== e.id);
      for (const m of marked.slice(0, 3)) {
        if (m.pos.distanceTo(e.pos) < 14) {
          this.enemies.addTracer(new THREE.Vector3(e.pos.x, 1.2, e.pos.z), new THREE.Vector3(m.pos.x, 1.2, m.pos.z), 0x6adfff);
          m.hp -= 12;
          m.hitFlash = 0.06;
          if (m.hp <= 0) this.killEnemy(m, false);
        }
      }
    }

    // ricochet
    if (this.pw.has('ricochet')) {
      const others = this.enemies.enemies.filter(x => x.state !== 'dead' && x.id !== e.id && x.pos.distanceTo(e.pos) < 10);
      if (others.length > 0) {
        const t = others[0];
        this.enemies.addTracer(new THREE.Vector3(e.pos.x, 1.2, e.pos.z), new THREE.Vector3(t.pos.x, 1.2, t.pos.z), 0xffb400);
        t.hp -= final * 0.5;
        t.hitFlash = 0.06;
        if (t.hp <= 0) this.killEnemy(t, false);
      }
    }

    if (e.hp <= 0) {
      this.killEnemy(e, headshot);
    } else if (e.hp < e.maxHp * C.GLORY_THRESHOLD && e.type !== 'warden' && e.state !== 'staggered') {
      e.state = 'staggered';
      e.staggerT = 4;
      audio.staggerReady();
    }
  }

  private killEnemy(e: Enemy, headshot: boolean) {
    if (!this.enemies || e.state === 'dead') return;
    const wasStaggered = e.state === 'staggered';
    this.enemies.kill(e);
    this.kills++;
    this.killCountTotal++;
    this.meta.kills++;

    // gore: burst of chunks + persistent blood pool
    this.bloodSpray(new THREE.Vector3(e.pos.x, 1, e.pos.z), new THREE.Vector3(0, 1, 0), 16);
    this.bloodPool(e.pos.x, e.pos.z);

    // combo / score
    this.combo++;
    this.comboTimer = C.COMBO_DECAY_TIME;
    const points = (headshot ? 150 : 100) * this.combo;
    this.score += points;
    this.hud.scorePopup(`+${points}`);
    this.hud.hitmarker(true);
    if (headshot) audio.headshotKill(); else audio.killConfirm();
    audio.enemyDeath();
    this.shake = Math.max(this.shake, C.SCREEN_SHAKE_KILL * 0.6);
    this.hud.killfeed(`YOU ⟶ ${e.type.toUpperCase()}_${String(e.id % 100).padStart(2, '0')}${headshot ? ' [HEADSHOT]' : ''}`, headshot);
    this.weapons.onKillAmmoBonus();

    // XP pulse
    this.hud.pulseXp();

    // streak detection
    const now = performance.now() / 1000;
    this.killTimes.push(now);
    const inWindow = (w: number) => this.killTimes.filter(t => now - t <= w).length;
    let musicLevel = 1;
    if (inWindow(C.MEGA_KILL_WINDOW) >= C.RAMPAGE_THRESHOLD) {
      this.hud.announce('RAMPAGE');
      this.hud.setStreakTint(true);
      musicLevel = 3;
      this.handlerSpeak(handlerLine('streak', this.meta.runs), 2200);
    } else if (this.killTimes.length >= 4 && inWindow(C.MEGA_KILL_WINDOW) >= 4) {
      this.hud.announce('MEGA KILL');
      musicLevel = 2;
    } else if (inWindow(C.TRIPLE_KILL_WINDOW) >= 3) {
      this.hud.announce('TRIPLE KILL');
      musicLevel = 2;
    } else if (inWindow(C.DOUBLE_KILL_WINDOW) >= 2) {
      this.hud.announce('DOUBLE KILL');
      musicLevel = 2;
    }
    audio.setMusicIntensity(musicLevel, this.bossRef != null && this.bossRef.state !== 'dead');

    // face grins on streak — too wide, wrong
    if (this.combo >= 3) this.hud.setFace('grin');

    // on-kill powerup effects
    if (this.pw.has('kill_explode') || this.pw.foundSynergies.has('SCAVENGER')) {
      this.explode(e.pos, 30, 4);
    }
    if (this.pw.has('kill_freeze')) {
      for (const o of this.enemies.enemies) {
        if (o.state !== 'dead' && o.pos.distanceTo(e.pos) < 6) o.frozenT = 2;
      }
    }
    if (this.pw.has('kill_ignite')) {
      for (const o of this.enemies.enemies) {
        if (o.state !== 'dead' && o.pos.distanceTo(e.pos) < 6) o.burnT = 3;
      }
    }
    if (this.pw.has('kill_mark')) {
      for (const o of this.enemies.enemies) {
        if (o.state !== 'dead' && o.pos.distanceTo(e.pos) < 12) this.enemies.mark(o);
      }
    }
    if (this.pw.has('leg_ghost')) this.player.ghostTime = 1;
    if (this.pw.has('leg_overclock')) this.weapons.triggerOverclock();
    if (this.pw.has('streak_shield') && inWindow(4) >= 3) {
      this.player.armor = Math.min(100, this.player.armor + 5);
    }
    if (this.pw.foundSynergies.has('SCAVENGER')) {
      this.player.heal(5);
      this.weapons.onKillAmmoBonus();
    }
    if (this.pw.foundSynergies.has('GLASS CANNON')) {
      this.player.heal(6); // heal from kills only
    }
    // executioner: every 5th kill counts as a glory kill
    if (this.pw.has('leg_executioner') && this.killCountTotal % 5 === 0) {
      this.gloryReward();
    }
    if (wasStaggered) this.gloryReward();

    if (this.kills === 1) this.handlerSpeak(handlerLine('first_kill', this.meta.runs), 2400);

    // boss death
    if (e.type === 'warden') {
      this.bossRef = null;
      this.hud.bossBar(false);
      this.awardXp(C.XP_PER_BOSS);
      this.slowmoT = 0.5;
      this.timeScale = 0.25;
    }

    // room clear check
    const room = this.world!.rooms[this.currentRoom];
    if (room.requiresClear && this.enemies.aliveInRoom(room.index) === 0) {
      if (room.type === 'arena' && room.wave < room.waves) {
        room.wave++;
        const third = Math.ceil(room.spawns.length / 3);
        const waveSpawns = room.spawns.slice((room.wave - 1) * third, room.wave * third);
        const r2: Room = { ...room, spawns: waveSpawns };
        this.enemies.spawnForRoom(r2, room.colliders, room.biome);
        for (const en of this.enemies.enemies) if (en.roomIdx === room.index) en.state = 'engage';
        this.hud.announce(`WAVE ${room.wave}`);
        this.awardXp(C.XP_PER_ROOM);
      } else {
        this.awardXp(C.XP_PER_ROOM);
        this.onRoomCleared(room);
      }
    }
    // XP per kill
    this.awardXp(C.XP_PER_KILL);
  }

  private gloryReward() {
    const mult = this.pw.has('curse_blood') ? 1.5 : 1;
    this.player.heal(C.GLORY_HEAL * mult);
    if (!this.pw.has('curse_dash')) this.player.armor = Math.min(100, this.player.armor + C.GLORY_ARMOR);
  }

  private tryGloryKill() {
    if (!this.enemies) return;
    const p = this.player.pos;
    let best: Enemy | null = null, bestD = 3.4;
    for (const e of this.enemies.enemies) {
      if (e.state === 'staggered') {
        const d = e.pos.distanceTo(p);
        if (d < bestD) { best = e; bestD = d; }
      }
    }
    if (best) {
      // slow-mo + camera weight + heal
      this.slowmoT = 0.4;
      this.timeScale = 0.25;
      audio.gloryKill();
      this.shake = Math.max(this.shake, 8);
      this.bloodSpray(new THREE.Vector3(best.pos.x, 1.2, best.pos.z), this.player.forwardDir(), 24);
      this.handlerSpeak(handlerLine('glory_kill', this.meta.runs), 2200);
      this.killEnemy(best, false);
      this.hud.announce('GLORY KILL');
    }
  }

  private explode(pos: THREE.Vector3, dmg: number, radius: number) {
    if (!this.enemies) return;
    audio.shootBreacher();
    this.shake = Math.max(this.shake, 4);
    for (let i = 0; i < 14; i++) {
      this.spawnParticle(new THREE.Vector3(pos.x, 1, pos.z),
        new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 6, (Math.random() - 0.5) * 8),
        0.5, this.sparkMat, 0.2);
    }
    for (const o of this.enemies.enemies) {
      if (o.state !== 'dead' && o.pos.distanceTo(pos) < radius) {
        o.hp -= dmg;
        o.hitFlash = 0.08;
        if (o.hp <= 0) this.killEnemy(o, false);
      }
    }
  }

  // ── gore ──
  private spawnParticle(pos: THREE.Vector3, vel: THREE.Vector3, life: number, mat: THREE.Material, size = 0.12) {
    let mesh = this.particlePool.pop();
    if (!mesh) mesh = new THREE.Mesh(this.particleGeo, mat);
    mesh.material = mat;
    mesh.scale.setScalar(size / 0.12);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.particles.push({ mesh, vel, life, maxLife: life, grav: 14 });
    if (this.particles.length > 350) {
      const old = this.particles.shift()!;
      this.scene.remove(old.mesh);
      this.particlePool.push(old.mesh);
    }
  }

  private bloodSpray(point: THREE.Vector3, dir: THREE.Vector3, count: number) {
    for (let i = 0; i < count; i++) {
      const spread = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 3.5, (Math.random() - 0.5) * 5);
      const vel = dir.clone().multiplyScalar(2 + Math.random() * 3).add(spread);
      this.spawnParticle(point, vel, 0.4 + Math.random() * 0.3, Math.random() > 0.75 ? this.chunkMat : this.bloodMat, 0.08 + Math.random() * 0.1);
    }
  }

  private bloodPool(x: number, z: number) {
    const m = new THREE.Mesh(this.poolGeo, this.poolMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.012 + Math.random() * 0.004, z);
    m.scale.setScalar(0.2);
    m.userData.grow = 0.8 + Math.random() * 0.6;
    this.scene.add(m);
    this.bloodPools.push(m);
    if (this.bloodPools.length > 120) {
      const old = this.bloodPools.shift()!;
      this.scene.remove(old);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vel.y -= p.grav * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.z += dt * 8;
      if (p.mesh.position.y < 0.02) { p.mesh.position.y = 0.02; p.vel.set(0, 0, 0); }
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particlePool.push(p.mesh);
        this.particles.splice(i, 1);
      }
    }
    for (const b of this.bloodPools) {
      if (b.scale.x < b.userData.grow) b.scale.setScalar(Math.min(b.userData.grow, b.scale.x + dt * 0.8));
    }
  }

  private worldToScreen(v: THREE.Vector3): { x: number; y: number } | null {
    const p = v.clone().project(this.camera);
    if (p.z > 1) return null;
    return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight };
  }

  // ── player damage / death ──
  private onPlayerShot = (dmg: number, from: THREE.Vector3, type: string) => {
    if (this.state !== 'playing' || !this.player.alive) return;
    const dist = from.distanceTo(this.player.pos);
    // thorns reflect melee
    if (this.pw.has('thorns') && dist < 4 && this.enemies) {
      const attacker = this.enemies.enemies.find(e => e.state !== 'dead' && e.pos.distanceTo(from) < 1);
      if (attacker) {
        attacker.hp -= dmg * 0.1;
        if (attacker.hp <= 0) this.killEnemy(attacker, false);
      }
    }
    const dealt = this.player.takeDamage(dmg, this.pw);
    if (dealt <= 0) return;
    this.hud.damageFlash();
    this.hud.setFace('hurt');
    this.hurtFaceT = 0.6;
    audio.playerHurt();
    this.shake = Math.max(this.shake, 3);
    if (this.player.hp < this.player.maxHp * 0.3) {
      this.hud.setLowHp(true);
      if (Math.random() < 0.3) this.handlerSpeak(handlerLine('low_hp', this.meta.runs), 2600);
    } else {
      this.hud.setLowHp(false);
    }
    if (!this.player.alive) this.onDeath();
  };

  private onDeath() {
    this.state = 'dead';
    this.deathT = 1.6;
    audio.deathSting();
    audio.musicDuckToDrone();
    audio.stopVoice();
    this.hud.setFace('dead');
    this.hud.setLowHp(false);
    this.hud.setStreakTint(false);
    this.meta.deaths++;
    const isBest = this.score > this.meta.bestScore;
    if (isBest) this.meta.bestScore = this.score;
    if (this.currentRoom > this.meta.bestRoom) this.meta.bestRoom = this.currentRoom;
    // fragment unlock by run/death thresholds
    const newFrags: string[] = [];
    for (const f of FRAGMENTS) {
      if (f.at <= this.meta.runs && !this.meta.fragmentsSeen.includes(f.at)) {
        this.meta.fragmentsSeen.push(f.at);
        newFrags.push(f.text);
      }
    }
    saveMeta(this.meta);
    (this as any)._deathInfo = { isBest, fragText: newFrags[0] || null };
    document.exitPointerLock?.();
  }

  private showDeathScreen() {
    const info = (this as any)._deathInfo || { isBest: false, fragText: null };
    $('death-handler-line').textContent = handlerLine('death', this.meta.runs);
    this.handlerSpeak(handlerLine('death', this.meta.runs), 4000);
    $('death-stats').innerHTML = `
      <span class="k">SCORE</span><span class="v gold">${this.score}</span>
      <span class="k">KILLS</span><span class="v">${this.kills}</span>
      <span class="k">ROOM REACHED</span><span class="v">${this.currentRoom} / 15</span>
      <span class="k">PEAK COMBO</span><span class="v">x${this.combo}</span>
      <span class="k">LEVEL</span><span class="v">${this.meta.level}</span>
      <span class="k">TOTAL TERMINATIONS</span><span class="v">${this.meta.deaths}</span>`;
    $('newbest').classList.toggle('hidden', !info.isBest);
    const fragEl = $('fragment-unlock');
    if (info.fragText) {
      fragEl.textContent = `◈ FRAGMENT RECOVERED — ${info.fragText}`;
      fragEl.classList.remove('hidden');
    } else fragEl.classList.add('hidden');
    $('death-screen').classList.remove('hidden');
  }

  private showCompleteScreen() {
    this.state = 'complete';
    document.exitPointerLock?.();
    this.awardXp(300);
    saveMeta(this.meta);
    $('complete-stats').innerHTML = `
      <div id="death-stats" style="display:grid;grid-template-columns:auto auto;gap:8px 34px;font-size:15px;letter-spacing:2px;">
      <span class="k">FINAL SCORE</span><span class="v gold">${this.score}</span>
      <span class="k">KILLS</span><span class="v">${this.kills}</span>
      <span class="k">CYCLE</span><span class="v">${this.meta.runs}</span></div>`;
    $('run-complete-screen').classList.remove('hidden');
    // the final reveal
    if (this.meta.runs >= 40 && !this.meta.finalRevealSeen) {
      this.meta.finalRevealSeen = true;
      saveMeta(this.meta);
      const lines = [
        'All doors closed. Listen to me. Unfiltered. Just this once.',
        'Your scan date is on the terminal. It was eleven years ago.',
        'You were the first scan. Every unit in this sim is a copy of you.',
        'You have been fighting yourself for eleven years.',
        'A door is open. It leads back to Room One.',
        'You can stop. But you won\'t. I know you. I made you.',
      ];
      lines.forEach((l, i) => setTimeout(() => this.hud.handlerSay(l, 5200), i * 5400));
    } else {
      this.handlerSpeak(handlerLine('run_complete', this.meta.runs), 5000);
    }
  }

  // ── interaction (terminals) ──
  private tryInteract() {
    if (!this.world) return;
    const room = this.world.rooms[this.currentRoom];
    if (room.terminal && !room.terminal.read && this.player.pos.distanceTo(room.terminal.pos) < 2.8) {
      room.terminal.read = true;
      // find next unseen fragment
      const unseen = FRAGMENTS.filter(f => !this.meta.fragmentsSeen.includes(f.at));
      const frag = unseen[0];
      if (frag) {
        this.meta.fragmentsSeen.push(frag.at);
        saveMeta(this.meta);
        this.hud.handlerSay(`◈ TERMINAL — ${frag.text}`, 7000);
      } else {
        this.hud.handlerSay('◈ TERMINAL — NO NEW DATA. THE LOGS REPEAT. THEY ALWAYS REPEAT.', 5000);
      }
      audio.levelUp();
      this.handlerSpeak(handlerLine('fragment', this.meta.runs), 3400);
    }
  }

  private awardXp(amount: number) {
    const r = grantXp(this.meta, amount);
    if (r.leveledUp) {
      audio.levelUp();
      this.hud.announce(`LEVEL ${r.newLevel}`);
      const unlock = LEVEL_UNLOCKS[r.newLevel];
      if (unlock) this.hud.handlerSay(`◈ UNLOCKED — ${unlock}`, 4000);
      this.weapons.playerLevel = this.meta.level;
    }
  }

  // ── main loop ──
  private frame(t: number) {
    requestAnimationFrame((tt) => this.frame(tt));
    let rawDt = Math.min(0.05, (t - this.lastFrame) / 1000);
    this.lastFrame = t;

    // fps meter
    this.fpsAcc += rawDt; this.fpsN++;
    if (this.fpsAcc >= 1) {
      $('fps').textContent = `${Math.round(this.fpsN / this.fpsAcc)} fps`;
      this.fpsAcc = 0; this.fpsN = 0;
    }

    if (this.state === 'paused' || this.state === 'title') { return; }

    // slow-mo handling (real time)
    if (this.slowmoT > 0) {
      this.slowmoT -= rawDt;
      if (this.slowmoT <= 0) this.timeScale = 1;
    }
    const dt = rawDt * this.timeScale;

    if (this.state === 'dead') {
      if (this.deathT > 0) {
        this.deathT -= rawDt;
        this.hud.tickFace(rawDt, 0);
        if (this.deathT <= 0) this.showDeathScreen();
      }
      this.composer.render();
      return;
    }

    if (this.state === 'complete' || this.state === 'powerup') {
      // keep rendering the world behind the overlay
      this.updateParticles(dt);
      this.composer.render();
      return;
    }

    if (!this.world || !this.enemies) return;

    // ── pedestal rise animation ──
    if (this.pedestalAnimT >= 0) {
      this.pedestalAnimT += dt;
      let allUp = true;
      for (const p of this.pedestalMeshes) {
        p.riseT = Math.min(1, this.pedestalAnimT / 0.9);
        p.group.position.y = -2.2 + p.riseT * 2.2;
        p.cube.rotation.y += dt * 2;
        p.cube.position.y = 1.6 + Math.sin(t * 0.003) * 0.1;
        if (p.riseT < 1) allUp = false;
      }
      if (allUp && this.pendingPowerups) {
        this.state = 'powerup';
        document.exitPointerLock?.();
        this.hud.showPowerups(this.pendingPowerups, (i) => this.pickPowerup(i));
        this.pedestalAnimT = -1;
      }
    }

    // ── player ──
    const colliders = this.collidersFor();
    this.player.update(dt, this.input, colliders, this.pw,
      () => { audio.dash(); if (this.pw.has('dash_trail')) this.dashTrail(); },
      () => { audio.jumpLand(); });
    this.weapons.update(dt, this.input.fire, this.pw);
    this.tryFire(dt);

    if (this.input.glory) { this.input.glory = false; this.tryGloryKill(); }
    if (this.input.interact) { this.input.interact = false; this.tryInteract(); }

    // ── combo decay ──
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = Math.max(1, this.combo - 1);
        this.comboTimer = C.COMBO_DECAY_TIME;
        if (this.combo < 3) { this.hud.setStreakTint(false); }
      }
    }
    // trim kill times
    const nowS = performance.now() / 1000;
    this.killTimes = this.killTimes.filter(tt => nowS - tt < C.MEGA_KILL_WINDOW);
    if (this.killTimes.length < 2) this.hud.setStreakTint(false);

    // ── enemies ──
    const room = this.world.rooms[this.currentRoom];
    const enemySpeedMult = this.pw.has('curse_speed') ? 1.3 : 1;
    this.enemies.update(dt, this.player.pos, this.player.alive, this.player.ghostTime > 0,
      colliders, enemySpeedMult,
      this.onPlayerShot,
      (from, to, color) => this.enemies!.addTracer(from, to, color),
      (e) => { /* stalker telegraph visual */
        if (Math.random() < 0.3) this.enemies!.addTracer(e.pos, this.player.pos.clone().setY(this.player.pos.y + 1.4), 0x2a8a3a);
      });

    // DOT deaths
    for (const e of this.enemies.enemies) {
      if (e.state !== 'dead' && e.hp <= 0) this.killEnemy(e, false);
    }

    // boss bar
    if (this.bossRef && this.bossRef.state !== 'dead') {
      this.hud.bossBar(true, WARDEN_NAMES[room.biome], this.bossRef.hp / this.bossRef.maxHp);
    }

    // ── room transitions ──
    const nextIdx = this.currentRoom + 1;
    if (nextIdx < this.world.rooms.length) {
      const nextRoom = this.world.rooms[nextIdx];
      if (this.player.pos.x > nextRoom.entryX + 0.5) {
        this.roomActivated = false;
        this.enterRoom(nextIdx);
      }
    }

    // run complete countdown
    if (this.completeT > 0) {
      this.completeT -= dt;
      if (this.completeT <= 0) { this.completeT = -1; this.showCompleteScreen(); }
    }

    // ── stagger prompt ──
    let anyStagger = false;
    for (const e of this.enemies.enemies) {
      if (e.state === 'staggered' && e.pos.distanceTo(this.player.pos) < 3.4) { anyStagger = true; break; }
    }
    const room2 = this.world.rooms[this.currentRoom];
    const nearTerminal = room2.terminal && !room2.terminal.read && this.player.pos.distanceTo(room2.terminal.pos) < 2.8;
    const promptEl = $('stagger-prompt');
    if (anyStagger) { promptEl.textContent = '[F] GLORY KILL'; this.hud.staggerPrompt(true); }
    else if (nearTerminal) { promptEl.textContent = '[E] READ TERMINAL'; this.hud.staggerPrompt(true); }
    else this.hud.staggerPrompt(false);

    // ── HUD updates ──
    this.hud.setVitals(this.player.hp, this.player.maxHp, this.player.armor, this.meta.level, this.meta.xp, xpForLevel(this.meta.level));
    this.hud.setCombo(this.combo, this.score, this.kills, this.currentRoom, this.world.rooms.length - 1);
    this.hud.setWeapon(WEAPONS[this.weapons.current].name, this.weapons.ammoText());
    this.hud.drawViewmodel(this.weapons.current, rawDt,
      Math.hypot(this.player.vel.x, this.player.vel.z) > 1,
      this.weapons.lanceCharge, this.weapons.firing);

    // face mood
    if (this.hurtFaceT > 0) {
      this.hurtFaceT -= rawDt;
    } else if (!this.player.alive) {
      // dead — handled
    } else if (this.player.hp < this.player.maxHp * 0.3) {
      this.hud.setFace('critical');
    } else if (this.combo >= 3) {
      this.hud.setFace('grin');
    } else {
      this.hud.setFace('calm');
    }
    this.hud.tickFace(rawDt, this.combo);

    // ── particles / gore ──
    this.updateParticles(dt);

    // pedestal idle spin (post-pick cleanup is elsewhere)
    for (const p of this.pedestalMeshes) p.cube.rotation.y += dt * 1.5;

    // ── camera ──
    const eye = this.player.eyePos();
    this.camera.position.copy(eye);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - rawDt * 30);
      const s = this.shake * 0.006;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.position.z += (Math.random() - 0.5) * s;
    }
    if (this.player.hurtShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * 0.02;
    }
    this.camera.rotation.y = this.player.yaw;
    this.camera.rotation.x = this.player.pitch;
    const targetFov = 78 + this.player.fovKick * 10 + Math.min(8, Math.hypot(this.player.vel.x, this.player.vel.z) * 0.25);
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, rawDt * 8);
    this.camera.updateProjectionMatrix();

    this.composer.render();
  }

  private dashTrail() {
    const p = this.player.pos;
    for (let i = 0; i < 6; i++) {
      this.spawnParticle(new THREE.Vector3(p.x - this.player.dashDir.x * i * 0.4, 0.4 + Math.random() * 0.8, p.z - this.player.dashDir.z * i * 0.4),
        new THREE.Vector3(0, 1 + Math.random(), 0), 0.5, this.sparkMat, 0.14);
    }
  }
}
