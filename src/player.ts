// Player: pointer-lock FPS movement — instant response, auto-bhop, dash, slide.
import * as THREE from 'three';
import * as C from './constants';
import { collideCircle, AABB } from './world';
import { PowerupState } from './powerups';

export interface InputState {
  forward: boolean; back: boolean; left: boolean; right: boolean;
  jump: boolean; dash: boolean; fire: boolean; interact: boolean; glory: boolean;
  mouseDX: number; mouseDY: number;
}

export class Player {
  pos = new THREE.Vector3(0, 0, 0);
  vel = new THREE.Vector3(0, 0, 0);
  yaw = 0; pitch = 0;
  onGround = true;
  hp = C.PLAYER_HP;
  maxHp = C.PLAYER_HP;
  armor = 0;
  dashCharges = C.DASH_CHARGES;
  dashCooldowns: number[] = [];
  dashTime = 0;
  dashDir = new THREE.Vector3();
  fovKick = 0;
  sliding = 0;
  jumpHeld = false;
  jumpsUsed = 0;
  spawnProtect = 0;
  ghostTime = 0; // invisible after kill (GHOST legendary)
  alive = true;
  hurtShake = 0;
  eyeBob = 0;

  reset(spawn: THREE.Vector3) {
    this.pos.copy(spawn);
    this.vel.set(0, 0, 0);
    this.hp = this.maxHp;
    this.armor = 0;
    this.dashCooldowns = [];
    this.dashTime = 0;
    this.alive = true;
    this.spawnProtect = C.SPAWN_PROTECT;
    this.ghostTime = 0;
  }

  maxDashes(pw: PowerupState): number {
    let d = C.DASH_CHARGES + pw.count('dash_charge') + (pw.has('curse_dash') ? 2 : 0);
    return Math.min(3, d);
  }

  speedMult(pw: PowerupState): number {
    return 1 + pw.count('speed') * 0.12;
  }

  update(dt: number, input: InputState, colliders: AABB[], pw: PowerupState, onDash: () => void, onLand: () => void) {
    if (!this.alive) return;
    // look
    this.yaw -= input.mouseDX * 0.0022;
    this.pitch -= input.mouseDY * 0.0022;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
    input.mouseDX = 0; input.mouseDY = 0;

    if (this.spawnProtect > 0) this.spawnProtect -= dt;
    if (this.ghostTime > 0) this.ghostTime -= dt;
    if (this.hurtShake > 0) this.hurtShake -= dt;

    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const wish = new THREE.Vector3();
    if (input.forward) { wish.x -= sin; wish.z -= cos; }
    if (input.back) { wish.x += sin; wish.z += cos; }
    if (input.left) { wish.x -= cos; wish.z += sin; }
    if (input.right) { wish.x += cos; wish.z -= sin; }
    const hasInput = wish.lengthSq() > 0;
    if (hasInput) wish.normalize();

    const speed = C.BASE_SPEED * this.speedMult(pw);

    // dash
    for (let i = this.dashCooldowns.length - 1; i >= 0; i--) {
      this.dashCooldowns[i] -= dt;
      if (this.dashCooldowns[i] <= 0) this.dashCooldowns.splice(i, 1);
    }
    if (input.dash) {
      input.dash = false;
      const blink = pw.foundSynergies.has('BLINK');
      if (blink || this.dashCooldowns.length < this.maxDashes(pw)) {
        if (!blink) this.dashCooldowns.push(C.DASH_COOLDOWN);
        this.dashTime = C.DASH_TIME;
        this.dashDir.copy(hasInput ? wish : new THREE.Vector3(-sin, 0, -cos));
        if (blink) {
          // teleport-dash
          const target = this.pos.clone().addScaledVector(this.dashDir, 6);
          const res = collideCircle(colliders, target.x, target.z, C.PLAYER_RADIUS);
          this.pos.x = res.x; this.pos.z = res.z;
        }
        this.fovKick = 1;
        onDash();
      }
    }

    if (this.dashTime > 0) {
      this.dashTime -= dt;
      this.vel.x = this.dashDir.x * C.DASH_SPEED;
      this.vel.z = this.dashDir.z * C.DASH_SPEED;
      this.vel.y = 0;
    } else {
      // ground accel: instant response; air: partial control
      const ctl = this.onGround ? 1 : C.AIR_CONTROL;
      const tx = wish.x * speed, tz = wish.z * speed;
      const rate = this.onGround ? 14 : 7;
      this.vel.x += (tx - this.vel.x) * Math.min(1, rate * ctl * dt);
      this.vel.z += (tz - this.vel.z) * Math.min(1, rate * ctl * dt);
      // friction when no input on ground
      if (!hasInput && this.onGround) {
        this.vel.x *= Math.max(0, 1 - 12 * dt);
        this.vel.z *= Math.max(0, 1 - 12 * dt);
      }
      // gravity
      this.vel.y -= C.GRAVITY * dt;
    }

    // jump / auto-bhop
    const maxJumps = pw.has('double_jump') ? 2 : 1;
    if (input.jump) {
      if (this.onGround && !this.jumpHeld) {
        this.vel.y = C.JUMP_VEL;
        this.onGround = false;
        this.jumpsUsed = 1;
      } else if (!this.onGround && !this.jumpHeld && this.jumpsUsed < maxJumps) {
        this.vel.y = C.JUMP_VEL * 0.9;
        this.jumpsUsed++;
      } else if (this.onGround && this.jumpHeld) {
        // auto bunny-hop: hold space, keep momentum
        this.vel.y = C.JUMP_VEL;
        this.onGround = false;
      }
      this.jumpHeld = true;
    } else {
      this.jumpHeld = false;
    }

    // integrate
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.pos.y += this.vel.y * dt;

    // floor
    const wasAir = !this.onGround;
    if (this.pos.y <= 0) {
      this.pos.y = 0;
      this.vel.y = 0;
      this.onGround = true;
      this.jumpsUsed = 0;
      if (wasAir) {
        // slide on landing if moving fast
        const sp = Math.hypot(this.vel.x, this.vel.z);
        if (sp > C.BASE_SPEED * 1.05) this.sliding = 0.35;
        onLand();
      }
    } else {
      this.onGround = false;
    }
    if (this.sliding > 0) this.sliding -= dt;

    // wall collision
    const res = collideCircle(colliders, this.pos.x, this.pos.z, C.PLAYER_RADIUS);
    this.pos.x = res.x; this.pos.z = res.z;

    // fov kick decay
    this.fovKick = Math.max(0, this.fovKick - dt * 3);
    this.eyeBob += dt * (this.onGround ? Math.hypot(this.vel.x, this.vel.z) : 0);
  }

  takeDamage(amount: number, pw: PowerupState): number {
    if (!this.alive || this.spawnProtect > 0) return 0;
    let dmg = amount;
    if (this.armor > 0 && !pw.has('curse_dash')) {
      const absorbed = Math.min(this.armor, dmg * 0.6);
      this.armor -= absorbed;
      dmg -= absorbed;
    }
    this.hp -= dmg;
    this.hurtShake = 0.35;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return dmg;
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  eyePos(): THREE.Vector3 {
    const slideDrop = this.sliding > 0 ? 0.5 : 0;
    const bob = Math.sin(this.eyeBob * 1.6) * 0.03;
    return new THREE.Vector3(this.pos.x, this.pos.y + C.EYE_HEIGHT - slideDrop + bob, this.pos.z);
  }

  forwardDir(): THREE.Vector3 {
    const cp = Math.cos(this.pitch);
    return new THREE.Vector3(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
  }
}
