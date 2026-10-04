// Client-side prediction of the local player using the shared deterministic physics.

import { newPState, stepPlayer, PState, PhysParams, PEvents } from '../shared/physics';
import type { Box } from '../shared/mapData';
import * as C from '../shared/constants';
import type { InputMsg, WeaponId } from '../shared/protocol';

export interface FrameInput { fwd: number; right: number; jump: boolean; dash: boolean; crouch: boolean }

export class LocalPlayer {
  s: PState;
  yaw = 0;
  pitch = 0;
  params: PhysParams = { speedMult: 1, jumpMult: 1, airControl: C.AIR_CONTROL, maxDash: C.DASH_CHARGES, dashCooldown: C.DASH_COOLDOWN, extraJumps: 0, wallRunTime: 0 };
  boxes: Box[] = [];
  acc = 0;
  seq = 0;
  dashQueued = false;
  // camera feel
  eyeY: number = C.EYE_HEIGHT;
  landDip = 0;
  fovKick = 0;
  bobT = 0;
  bobAmt = 0;
  roll = 0;
  prevX = 0; prevY = 0; prevZ = 0;
  alpha = 0;
  frozen = false;

  constructor() {
    this.s = newPState(0, 0, 0, this.params.maxDash);
  }

  teleport(x: number, y: number, z: number, yaw: number) {
    this.s.x = x; this.s.y = y; this.s.z = z;
    this.s.vx = this.s.vy = this.s.vz = 0;
    this.s.dashT = 0; this.s.slideT = 0;
    this.prevX = x; this.prevY = y; this.prevZ = z;
    this.yaw = yaw; this.pitch = 0;
  }

  knock(x: number, y: number, z: number) {
    this.s.vx += x; this.s.vz += z; this.s.vy = Math.max(this.s.vy, y);
    if (y > 0) this.s.onGround = false;
  }

  /** Advance with fixed steps. Returns accumulated events for juice. */
  update(dt: number, inp: FrameInput, scale: number): PEvents {
    const all: PEvents = { jumped: false, landed: 0, dashed: false, slideStart: false, footstep: false, wallrun: false };
    if (inp.dash) this.dashQueued = true;
    if (this.frozen) return all;
    this.acc += Math.min(0.1, dt) * scale;
    let n = 0;
    while (this.acc >= C.PHYSICS_DT && n < 10) {
      this.prevX = this.s.x; this.prevY = this.s.y; this.prevZ = this.s.z;
      const ev = stepPlayer(this.s, { fwd: inp.fwd, right: inp.right, jump: inp.jump, dash: this.dashQueued, crouch: inp.crouch, yaw: this.yaw }, this.params, this.boxes, C.PHYSICS_DT);
      this.dashQueued = false;
      all.jumped ||= ev.jumped; all.dashed ||= ev.dashed; all.slideStart ||= ev.slideStart; all.footstep ||= ev.footstep; all.wallrun ||= ev.wallrun;
      if (ev.landed) all.landed = Math.max(all.landed, ev.landed);
      this.acc -= C.PHYSICS_DT;
      n++;
    }
    this.alpha = this.acc / C.PHYSICS_DT;
    // camera feel
    const sliding = this.s.slideT > 0;
    const targetEye = sliding ? C.SLIDE_EYE_HEIGHT : C.EYE_HEIGHT;
    this.eyeY += (targetEye - this.eyeY) * Math.min(1, dt * 14);
    if (all.landed) this.landDip = Math.min(0.35, all.landed * 0.025);
    this.landDip *= Math.max(0, 1 - dt * 9);
    if (all.dashed) this.fovKick = 1;
    this.fovKick *= Math.max(0, 1 - dt * 5);
    const hs = Math.hypot(this.s.vx, this.s.vz);
    const bobTarget = this.s.onGround && !sliding ? Math.min(1, hs / C.BASE_SPEED) : 0;
    this.bobAmt += (bobTarget - this.bobAmt) * Math.min(1, dt * 10);
    this.bobT += dt * (6 + hs * 0.5);
    // strafe roll
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    const lateral = (this.s.vx * rx + this.s.vz * rz) / C.BASE_SPEED;
    const wantRoll = -lateral * 0.018 + (all.wallrun || (this.s.wallNx || this.s.wallNz) ? 0.08 * Math.sign(-(this.s.wallNx * rx + this.s.wallNz * rz) || 1) : 0);
    this.roll += (wantRoll - this.roll) * Math.min(1, dt * 8);
    return all;
  }

  get x() { return this.prevX + (this.s.x - this.prevX) * this.alpha; }
  get y() { return this.prevY + (this.s.y - this.prevY) * this.alpha; }
  get z() { return this.prevZ + (this.s.z - this.prevZ) * this.alpha; }

  inputMsg(weapon: WeaponId, firing: boolean): InputMsg {
    return {
      t: 'input', seq: ++this.seq,
      x: this.s.x, y: this.s.y, z: this.s.z, vx: this.s.vx, vy: this.s.vy, vz: this.s.vz,
      yaw: this.yaw, pitch: this.pitch, weapon, firing,
      dashing: this.s.dashT > 0, sliding: this.s.slideT > 0,
    };
  }
}
