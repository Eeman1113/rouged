// Enemies: roster, AI state machines, gore hooks. Client-simulated (solo).
import * as THREE from 'three';
import * as C from './constants';
import { RNG } from './rng';
import { AABB, collideCircle, raycastWalls, Room, EnemySpawn } from './world';
import { droneSprite, gruntSprite, bruteSprite, stalkerSprite, spiderSprite, replicaSprite, wardenSprite } from './sprites';

export type EnemyType = 'drone' | 'grunt' | 'brute' | 'stalker' | 'spider' | 'replica' | 'warden';

const HP_TABLE: Record<EnemyType, number> = {
  drone: C.DRONE_HP, grunt: C.GRUNT_HP, brute: C.BRUTE_HP,
  stalker: C.STALKER_HP, spider: C.SPIDER_HP, replica: C.REPLICA_HP, warden: C.WARDEN_HP,
};
const SPEED_TABLE: Record<EnemyType, number> = {
  drone: 6.5, grunt: 4.2, brute: 5.5, stalker: 5.0, spider: 4.6, replica: 8.0, warden: 3.4,
};
const RADIUS_TABLE: Record<EnemyType, number> = {
  drone: 0.5, grunt: 0.55, brute: 1.0, stalker: 0.5, spider: 0.7, replica: 0.5, warden: 1.8,
};

let nextId = 1;

export interface Enemy {
  id: number;
  type: EnemyType;
  hp: number; maxHp: number;
  pos: THREE.Vector3;
  sprite: THREE.Sprite;
  state: 'patrol' | 'engage' | 'flee' | 'staggered' | 'dead';
  reactionT: number;
  fireCd: number;
  strafeDir: number;
  strafeT: number;
  elite: boolean;
  marked: boolean;
  markSprite?: THREE.Sprite;
  frozenT: number;
  burnT: number;
  staggerT: number;
  hoverPhase: number;
  // stalker
  cloakT: number; telegraphT: number; telegraphLine?: THREE.Line;
  // spider
  mineCd: number;
  // warden
  phase: number; burstCount: number;
  // replica
  dashT: number;
  baseY: number;
  radius: number;
  speed: number;
  roomIdx: number;
  hitFlash: number;
}

export interface Mine {
  pos: THREE.Vector3;
  mesh: THREE.Mesh;
  armed: number;
  roomIdx: number;
}

export class EnemyManager {
  enemies: Enemy[] = [];
  mines: Mine[] = [];
  tracers: { line: THREE.Line; t: number }[] = [];
  scene: THREE.Scene;
  rng: RNG;

  constructor(scene: THREE.Scene, seed: number) {
    this.scene = scene;
    this.rng = new RNG(seed ^ 0x51ed);
  }

  spawnForRoom(room: Room, colliders: AABB[], biomeIdx: number) {
    for (const s of room.spawns) {
      this.spawn(s.type as EnemyType, s.x, s.z, s.elite, room.index, biomeIdx);
    }
  }

  spawn(type: EnemyType, x: number, z: number, elite: boolean, roomIdx: number, biomeIdx = 0): Enemy {
    let def;
    switch (type) {
      case 'drone': def = droneSprite(); break;
      case 'grunt': def = gruntSprite(); break;
      case 'brute': def = bruteSprite(); break;
      case 'stalker': def = stalkerSprite(); break;
      case 'spider': def = spiderSprite(); break;
      case 'replica': def = replicaSprite(); break;
      case 'warden': def = wardenSprite(biomeIdx); break;
    }
    const sprite = new THREE.Sprite(def.mat.clone());
    const scale = elite ? 1.15 : 1;
    sprite.scale.set(def.w * scale, def.h * scale, 1);
    const baseY = type === 'drone' ? 2.2 : def.h * scale / 2;
    sprite.position.set(x, baseY, z);
    this.scene.add(sprite);
    const hp = HP_TABLE[type] * (elite ? 1.5 : 1);
    const e: Enemy = {
      id: nextId++, type, hp, maxHp: hp,
      pos: new THREE.Vector3(x, baseY, z),
      sprite, state: 'patrol',
      reactionT: this.rng.range(C.ENEMY_REACTION_MIN, C.ENEMY_REACTION_MAX),
      fireCd: this.rng.range(0.5, 1.5),
      strafeDir: this.rng.chance(0.5) ? 1 : -1,
      strafeT: 0, elite,
      marked: false, frozenT: 0, burnT: 0, staggerT: 0,
      hoverPhase: this.rng.next() * 6.28,
      cloakT: 0, telegraphT: 0,
      mineCd: 3,
      phase: 0, burstCount: 0,
      dashT: 0,
      baseY, radius: RADIUS_TABLE[type], speed: SPEED_TABLE[type] * (elite ? 1.2 : 1),
      roomIdx, hitFlash: 0,
    };
    if (elite) sprite.material.color.setRGB(1.4, 0.8, 0.8);
    this.enemies.push(e);
    return e;
  }

  aliveInRoom(roomIdx: number): number {
    return this.enemies.filter(e => e.roomIdx === roomIdx && e.state !== 'dead').length;
  }

  hasLOS(e: Enemy, targetPos: THREE.Vector3, colliders: AABB[]): boolean {
    const dir = targetPos.clone().sub(e.pos);
    const dist = dir.length();
    dir.normalize();
    const wallDist = raycastWalls(colliders, e.pos, dir, dist);
    return wallDist >= dist - 0.1;
  }

  update(dt: number, playerPos: THREE.Vector3, playerAlive: boolean, playerGhost: boolean,
    colliders: AABB[], speedMult: number,
    onShootPlayer: (dmg: number, from: THREE.Vector3, type: EnemyType) => void,
    onTracer: (from: THREE.Vector3, to: THREE.Vector3, color: number) => void,
    onStalkerTelegraph: (e: Enemy) => void) {

    for (const e of this.enemies) {
      if (e.state === 'dead') continue;

      if (e.hitFlash > 0) {
        e.hitFlash -= dt;
        const f = Math.max(0, e.hitFlash) * 6;
        e.sprite.material.color.setRGB(1 + f, 1 + f, 1 + f);
        if (e.hitFlash <= 0) {
          if (e.elite) e.sprite.material.color.setRGB(1.4, 0.8, 0.8);
          else e.sprite.material.color.setRGB(1, 1, 1);
        }
      }

      // burn dot
      if (e.burnT > 0) {
        e.burnT -= dt;
        e.hp -= 8 * dt;
        if (e.hp <= 0) { /* death handled by game via damage check */ }
      }
      if (e.frozenT > 0) {
        e.frozenT -= dt;
        e.sprite.material.color.setRGB(0.6, 0.8, 1.6);
        continue; // frozen solid
      }

      const toPlayer = playerPos.clone().sub(e.pos); toPlayer.y = 0;
      const dist = toPlayer.length();
      const seesPlayer = playerAlive && !playerGhost && dist < 32 && this.hasLOS(e, new THREE.Vector3(playerPos.x, playerPos.y + 1.4, playerPos.z), colliders);

      // state transitions
      if (e.state === 'patrol' && seesPlayer) {
        e.state = 'engage';
        e.reactionT = this.rng.range(C.ENEMY_REACTION_MIN, C.ENEMY_REACTION_MAX);
      }
      if (e.state === 'engage' && !seesPlayer && e.type !== 'warden') {
        e.state = 'patrol';
      }
      if (e.state === 'engage' && e.hp < e.maxHp * 0.25 && e.type !== 'brute' && e.type !== 'warden' && e.type !== 'replica') {
        if (this.rng.chance(0.005)) e.state = 'flee';
      }
      if (e.state === 'flee' && e.hp > e.maxHp * 0.5) e.state = 'engage';

      // stagger check
      if (e.state !== 'staggered' && e.type !== 'warden' && e.hp > 0 && e.hp < e.maxHp * C.GLORY_THRESHOLD) {
        e.state = 'staggered';
        e.staggerT = 4;
      }
      if (e.state === 'staggered') {
        e.staggerT -= dt;
        const pulse = 1 + Math.sin(performance.now() * 0.02) * 0.15;
        e.sprite.material.color.setRGB(2 * pulse, 1.6 * pulse, 0.4 * pulse);
        if (e.staggerT <= 0) e.state = 'engage';
        this.syncSprite(e, dt);
        continue;
      }

      const spd = e.speed * speedMult * (e.frozenT > 0 ? 0 : 1);
      const dir = dist > 0.01 ? toPlayer.clone().normalize() : new THREE.Vector3();

      switch (e.type) {
        case 'drone': {
          e.hoverPhase += dt * 3;
          e.pos.y = e.baseY + Math.sin(e.hoverPhase) * 0.25;
          if (e.state === 'engage') {
            if (e.reactionT > 0) { e.reactionT -= dt; break; }
            if (dist > 2.2) this.move(e, dir, spd, dt, colliders);
            else {
              e.fireCd -= dt;
              if (e.fireCd <= 0) {
                e.fireCd = 0.8;
                onShootPlayer(e.elite ? 10 : 6, e.pos, e.type);
                onTracer(e.pos, playerPos.clone().setY(playerPos.y + 1.2), 0xff4040);
              }
            }
          } else this.wander(e, spd * 0.3, dt, colliders);
          break;
        }
        case 'grunt':
        case 'replica': {
          const idealMin = e.type === 'replica' ? 6 : 8, idealMax = e.type === 'replica' ? 12 : 15;
          if (e.state === 'engage') {
            if (e.reactionT > 0) { e.reactionT -= dt; break; }
            // strafe
            e.strafeT -= dt;
            if (e.strafeT <= 0) { e.strafeT = this.rng.range(0.8, 1.8); e.strafeDir *= -1; }
            const strafe = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(e.strafeDir);
            const moveDir = new THREE.Vector3();
            if (dist > idealMax) moveDir.add(dir);
            else if (dist < idealMin) moveDir.sub(dir);
            moveDir.add(strafe.multiplyScalar(0.7)).normalize();
            this.move(e, moveDir, spd, dt, colliders);
            // replica dashes like a player
            if (e.type === 'replica') {
              e.dashT -= dt;
              if (e.dashT <= 0) {
                e.dashT = this.rng.range(1.5, 3);
                this.move(e, moveDir, spd * 5, dt, colliders);
              }
            }
            e.fireCd -= dt;
            if (e.fireCd <= 0) {
              e.fireCd = e.type === 'replica' ? this.rng.range(0.25, 0.5) : this.rng.range(0.9, 1.6);
              const shots = e.type === 'replica' ? 1 : 3;
              for (let i = 0; i < shots; i++) {
                const hit = this.rng.chance(C.ENEMY_ACCURACY * (e.elite ? 1.1 : 1) * (e.type === 'replica' ? 0.8 : 1));
                const dmg = e.type === 'replica' ? 8 : 5;
                onTracer(e.pos, playerPos.clone().setY(playerPos.y + 1.3), e.type === 'replica' ? 0xe8e0d0 : 0xff3020);
                if (hit && playerAlive && !playerGhost) onShootPlayer(e.elite ? dmg * 1.4 : dmg, e.pos, e.type);
              }
            }
          } else this.wander(e, spd * 0.3, dt, colliders);
          break;
        }
        case 'brute': {
          if (e.state === 'engage') {
            if (e.reactionT > 0) { e.reactionT -= dt; break; }
            if (dist > 2.4) this.move(e, dir, spd, dt, colliders);
            else {
              e.fireCd -= dt;
              if (e.fireCd <= 0) {
                e.fireCd = 1.1;
                onShootPlayer(e.elite ? 32 : 22, e.pos, e.type);
              }
            }
          } else this.wander(e, spd * 0.25, dt, colliders);
          break;
        }
        case 'stalker': {
          if (e.state === 'engage') {
            // cloak while repositioning
            if (e.telegraphT > 0) {
              e.sprite.material.opacity = 1;
              e.telegraphT -= dt;
              onStalkerTelegraph(e);
              if (e.telegraphT <= 0) {
                const hit = this.rng.chance(0.6);
                onTracer(e.pos, playerPos.clone().setY(playerPos.y + 1.3), 0x4dff6a);
                if (hit && playerAlive && !playerGhost) onShootPlayer(e.elite ? 26 : 18, e.pos, e.type);
                e.cloakT = this.rng.range(1.2, 2.2);
              }
            } else {
              e.cloakT -= dt;
              e.sprite.material.opacity = Math.max(0.15, Math.min(1, 1 - e.cloakT));
              const away = dist < 14 ? dir.clone().negate() : new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(e.strafeDir);
              this.move(e, away, spd, dt, colliders);
              if (e.cloakT <= 0 && seesPlayer) e.telegraphT = 0.7; // laser sight warning
            }
          } else this.wander(e, spd * 0.3, dt, colliders);
          break;
        }
        case 'spider': {
          if (e.state === 'engage') {
            if (e.reactionT > 0) { e.reactionT -= dt; break; }
            if (dist < 6) this.move(e, dir.clone().negate(), spd, dt, colliders);
            else this.move(e, new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(e.strafeDir), spd * 0.7, dt, colliders);
            e.mineCd -= dt;
            if (e.mineCd <= 0 && seesPlayer) {
              e.mineCd = this.rng.range(2.5, 4);
              this.layMine(e);
            }
          } else this.wander(e, spd * 0.3, dt, colliders);
          break;
        }
        case 'warden': {
          if (e.state === 'engage') {
            // phase transitions
            const frac = e.hp / e.maxHp;
            const newPhase = frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2;
            if (newPhase > e.phase) { e.phase = newPhase; e.fireCd = 0.5; }
            if (dist > 6) this.move(e, dir, spd * (1 + e.phase * 0.4), dt, colliders);
            e.fireCd -= dt;
            if (e.fireCd <= 0) {
              e.fireCd = Math.max(0.6, 1.8 - e.phase * 0.5);
              e.burstCount++;
              const shots = 3 + e.phase * 2;
              for (let i = 0; i < shots; i++) {
                const hit = this.rng.chance(0.4);
                onTracer(e.pos, playerPos.clone().setY(playerPos.y + 1.3), 0xff2050);
                if (hit && playerAlive && !playerGhost) onShootPlayer(9 + e.phase * 3, e.pos, e.type);
              }
              // melee if close
              if (dist < 3.4 && playerAlive && !playerGhost) onShootPlayer(20, e.pos, e.type);
            }
          }
          break;
        }
      }

      this.syncSprite(e, dt);
    }

    // mines
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.armed -= dt;
      const mat = m.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(performance.now() * 0.012) * 1.2;
      const d = m.pos.distanceTo(playerPos);
      if (m.armed <= 0 && d < 2.0 && playerAlive) {
        onShootPlayer(15, m.pos, 'spider');
        this.scene.remove(m.mesh);
        this.mines.splice(i, 1);
      }
    }

    // fade tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.t -= dt;
      (t.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, t.t * 6);
      if (t.t <= 0) {
        this.scene.remove(t.line);
        this.tracers.splice(i, 1);
      }
    }

    // cleanup far-behind dead enemies' sprites are kept (persistent corpses) — only remove marked/telegraph extras
  }

  private wander(e: Enemy, spd: number, dt: number, colliders: AABB[]) {
    e.strafeT -= dt;
    if (e.strafeT <= 0) { e.strafeT = this.rng.range(1, 3); e.strafeDir = this.rng.chance(0.5) ? 1 : -1; }
    const ang = e.strafeDir * (e.hoverPhase + performance.now() * 0.0002);
    this.move(e, new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), spd, dt, colliders);
  }

  private move(e: Enemy, dir: THREE.Vector3, spd: number, dt: number, colliders: AABB[]) {
    const nx = e.pos.x + dir.x * spd * dt;
    const nz = e.pos.z + dir.z * spd * dt;
    const res = collideCircle(colliders, nx, nz, e.radius);
    e.pos.x = res.x; e.pos.z = res.z;
  }

  private syncSprite(e: Enemy, dt: number) {
    let y = e.baseY;
    if (e.type === 'drone') y = e.pos.y;
    if (e.type === 'warden') y = e.baseY + Math.sin(performance.now() * 0.002) * 0.1;
    e.sprite.position.set(e.pos.x, y, e.pos.z);
    if (e.markSprite) {
      e.markSprite.position.set(e.pos.x, y + e.sprite.scale.y * 0.7, e.pos.z);
    }
  }

  private layMine(e: Enemy) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x331a08, emissive: new THREE.Color(0xff8020), emissiveIntensity: 2 })
    );
    mesh.position.set(e.pos.x, 0.2, e.pos.z);
    this.scene.add(mesh);
    this.mines.push({ pos: new THREE.Vector3(e.pos.x, 0.2, e.pos.z), mesh, armed: 1.2, roomIdx: e.roomIdx });
  }

  addTracer(from: THREE.Vector3, to: THREE.Vector3, color: number) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, t: 0.15 });
  }

  mark(e: Enemy) {
    if (e.marked || e.state === 'dead') return;
    e.marked = true;
    const c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffb400';
    g.fillRect(3, 0, 2, 8); g.fillRect(0, 3, 8, 2);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const s = new THREE.Sprite(mat);
    s.scale.set(0.5, 0.5, 1);
    s.renderOrder = 999;
    this.scene.add(s);
    e.markSprite = s;
  }

  kill(e: Enemy) {
    e.state = 'dead';
    e.hp = 0;
    this.scene.remove(e.sprite);
    if (e.markSprite) this.scene.remove(e.markSprite);
    if (e.telegraphLine) this.scene.remove(e.telegraphLine);
  }

  clearRoom(roomIdx: number) {
    // remove mines from cleared rooms
    for (let i = this.mines.length - 1; i >= 0; i--) {
      if (this.mines[i].roomIdx === roomIdx) {
        this.scene.remove(this.mines[i].mesh);
        this.mines.splice(i, 1);
      }
    }
  }

  disposeAll() {
    for (const e of this.enemies) {
      this.scene.remove(e.sprite);
      if (e.markSprite) this.scene.remove(e.markSprite);
    }
    for (const m of this.mines) this.scene.remove(m.mesh);
    for (const t of this.tracers) this.scene.remove(t.line);
    this.enemies = [];
    this.mines = [];
    this.tracers = [];
  }
}
