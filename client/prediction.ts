// Client-side prediction of the local player using the shared deterministic physics,
// plus all first-person camera feel (spring-damped, frame-rate independent).

import { newPState, stepPlayer, PState, PhysParams, PEvents } from '../shared/physics';
import type { Box } from '../shared/mapData';
import * as C from '../shared/constants';
import type { InputMsg, WeaponId } from '../shared/protocol';

export interface FrameInput {
  fwd: number; right: number; jump: boolean; dash: boolean; crouch: boolean;
  /** sprint key held (hold mode) */
  sprint?: boolean;
  /** sprint toggle pressed this frame (DualSense L3 / keyboard toggle mode) */
  sprintToggle?: boolean;
}

/** Critically damped spring, exact for any dt. Returns [x, v]. */
function spring(x: number, v: number, target: number, omega: number, dt: number): [number, number] {
  const d = x - target;
  const e = Math.exp(-omega * dt);
  const k = v + omega * d;
  return [target + (d + k * dt) * e, (v - k * omega * dt) * e];
}

export class LocalPlayer {
  s: PState;
  yaw = 0;
  pitch = 0;
  params: PhysParams = { speedMult: 1, jumpMult: 1, airControl: C.AIR_CONTROL, maxDash: C.DASH_CHARGES, dashCooldown: C.DASH_COOLDOWN, extraJumps: 0, wallRunTime: 0 };
  boxes: Box[] = [];
  acc = 0;
  seq = 0;
  dashQueued = false;
  // sprint intent
  sprintLatch = false;
  private latchGrace = 0;
  private sprintBlockT = 0;
  // camera feel (read by World.updateCamera and the HUD viewmodel)
  eyeY: number = C.EYE_HEIGHT;
  private eyeV = 0;
  /** camera dip from landings (m, positive = down) */
  landDip = 0;
  private landV = 0;
  /** legacy 0..1 dash kick (decays) */
  fovKick = 0;
  /** total FOV offset in degrees (sprint/slide/speed springs + dash kick) */
  fovAdd = 0;
  private fovS = 0; private fovSV = 0;
  private fovK = 0; private fovKV = 0;
  bobT = 0;
  bobAmt = 0;
  /** head-bob offsets: vertical (m), lateral (m, camera-right), roll (rad) */
  bobY = 0; bobX = 0; bobRoll = 0;
  roll = 0;
  private rollV = 0;
  /** pitch nod from landings / mantles (rad, negative = down) */
  pitchOff = 0;
  private pitchV = 0;
  /** step-up/down smoothing offset added to the camera (m) */
  stepOff = 0;
  prevX = 0; prevY = 0; prevZ = 0;
  alpha = 0;
  frozen = false;

  constructor() {
    this.s = newPState(0, 0, 0, this.params.maxDash);
  }

  get sprinting(): boolean { return !!this.s.sprinting && this.s.slideT <= 0 && this.s.dashT <= 0; }
  get crouching(): boolean { return !!this.s.crouched && this.s.slideT <= 0; }
  get mantling(): boolean { return (this.s.mantleT ?? 0) > 0; }
  get sliding(): boolean { return this.s.slideT > 0; }

  /** Firing / charging: drop out of sprint now and hold it off briefly (toggle sprint is cleared). */
  suppressSprint(t = 0.35) {
    this.sprintBlockT = Math.max(this.sprintBlockT, t);
    this.sprintLatch = false;
    this.s.sprinting = false;
  }

  teleport(x: number, y: number, z: number, yaw: number) {
    const dc = this.s.dashCharges;
    this.s = newPState(x, y, z, this.params.maxDash);
    this.s.dashCharges = Math.min(dc, this.params.maxDash);
    this.prevX = x; this.prevY = y; this.prevZ = z;
    this.yaw = yaw; this.pitch = 0;
    this.stepOff = 0; this.landDip = 0; this.landV = 0; this.pitchOff = 0; this.pitchV = 0;
    this.sprintLatch = false;
  }

  knock(x: number, y: number, z: number) {
    this.s.vx += x; this.s.vz += z; this.s.vy = Math.max(this.s.vy, y);
    if (y > 0) { this.s.onGround = false; this.s.coyoteT = 0; this.s.jumpCut = false; }
    if (this.s.mantleT) this.s.mantleT = 0;
  }

  /** Advance with fixed steps. Returns accumulated events for juice. */
  update(dt: number, inp: FrameInput, scale: number): PEvents {
    const all: PEvents = { jumped: false, landed: 0, dashed: false, slideStart: false, footstep: false, wallrun: false, mantled: false, sprintStart: false, wallJump: false, bhop: false };
    if (inp.dash) this.dashQueued = true;
    if (this.frozen) return all;
    const s = this.s;

    // ── sprint intent: hold, or latched toggle that auto-cancels when you stop pushing forward ──
    if (inp.sprintToggle) { this.sprintLatch = !this.sprintLatch; this.latchGrace = 0.2; }
    this.latchGrace -= dt;
    const fwdish = inp.fwd > 0.3 && inp.fwd >= Math.abs(inp.right) * 0.55;
    if (this.sprintLatch && !fwdish && this.latchGrace <= 0) this.sprintLatch = false;
    this.sprintBlockT -= dt;
    const sprint = (!!inp.sprint || this.sprintLatch) && this.sprintBlockT <= 0;

    this.acc += Math.min(0.1, dt) * scale;
    let n = 0;
    let moved = 0;
    while (this.acc >= C.PHYSICS_DT && n < 10) {
      this.prevX = s.x; this.prevY = s.y; this.prevZ = s.z;
      const wasG = s.onGround, wasM = (s.mantleT ?? 0) > 0;
      const ev = stepPlayer(s, { fwd: inp.fwd, right: inp.right, jump: inp.jump, dash: this.dashQueued, crouch: inp.crouch, yaw: this.yaw, sprint }, this.params, this.boxes, C.PHYSICS_DT);
      this.dashQueued = false;
      // smooth stair steps / ground snaps: physics teleports vertically, the camera eases
      const dy = s.y - this.prevY;
      if (wasG && s.onGround && !wasM && !ev.jumped && Math.abs(dy) > 0.005 && Math.abs(dy) < 0.8) {
        this.stepOff = Math.max(-0.7, Math.min(0.7, this.stepOff - dy));
        this.prevY = s.y;
      }
      if (s.onGround && s.slideT <= 0) moved += Math.hypot(s.x - this.prevX, s.z - this.prevZ);
      all.jumped ||= ev.jumped; all.dashed ||= ev.dashed; all.slideStart ||= ev.slideStart; all.footstep ||= ev.footstep; all.wallrun ||= ev.wallrun;
      all.mantled ||= !!ev.mantled; all.sprintStart ||= !!ev.sprintStart; all.wallJump ||= !!ev.wallJump; all.bhop ||= !!ev.bhop;
      if (ev.stepKind) all.stepKind = ev.stepKind;
      if (ev.landed) all.landed = Math.max(all.landed, ev.landed);
      this.acc -= C.PHYSICS_DT;
      n++;
    }
    this.alpha = this.acc / C.PHYSICS_DT;
    this.feel(dt, all, moved);
    return all;
  }

  private feel(dt: number, all: PEvents, moved: number) {
    const s = this.s;
    const run = C.BASE_SPEED * this.params.speedMult;
    const sprintV = run * C.SPRINT_MULT;
    const sliding = s.slideT > 0;
    const mantling = this.mantling;
    const hs = Math.hypot(s.vx, s.vz);

    // eye height
    const targetEye = mantling ? C.EYE_HEIGHT - 0.2 : sliding ? C.SLIDE_EYE_HEIGHT : s.crouched ? C.CROUCH_EYE_HEIGHT : C.EYE_HEIGHT;
    [this.eyeY, this.eyeV] = spring(this.eyeY, this.eyeV, targetEye, 16, dt);

    // step smoothing
    this.stepOff *= Math.exp(-dt * 16);
    if (Math.abs(this.stepOff) < 1e-4) this.stepOff = 0;

    // landing dip spring (impulse scaled by fall speed; bhop chains get a lighter tap)
    if (all.landed) {
      const imp = Math.min(5.5, all.landed * 0.32) * (all.jumped ? 0.35 : sliding ? 0.5 : 1);
      this.landV += imp;
      if (all.landed > 10 && !all.jumped) this.pitchV -= Math.min(0.9, (all.landed - 10) * 0.06);
    }
    if (all.mantled) { this.pitchV -= 0.5; this.landV += 0.6; }
    [this.landDip, this.landV] = spring(this.landDip, this.landV, 0, 11, dt);
    if (this.landDip < 0) this.landDip = 0;
    [this.pitchOff, this.pitchV] = spring(this.pitchOff, this.pitchV, 0, 12, dt);

    // FOV: sprint / slide / overspeed / wall-run springs + dash kick impulse
    let fovT = 0;
    if (this.sprinting) fovT += 6;
    if (sliding) fovT += 8;
    if (s.dashT > 0) fovT += 6;
    if (s.wallRun) fovT += 4;
    fovT += Math.min(8, Math.max(0, hs - sprintV) * 0.55);
    [this.fovS, this.fovSV] = spring(this.fovS, this.fovSV, fovT, 8, dt);
    if (all.dashed) { this.fovKV += 150; this.fovKick = 1; }
    if (all.slideStart) this.fovKV += 50;
    [this.fovK, this.fovKV] = spring(this.fovK, this.fovKV, 0, 10, dt);
    this.fovKick *= Math.exp(-dt * 5);
    this.fovAdd = this.fovS + this.fovK;

    // head bob: phase tied to distance walked (= footstep cadence), amplitude by stance
    const stride = s.crouched ? 1.7 : this.sprinting ? 3.0 : 2.4;
    this.bobT += (moved / stride) * Math.PI + dt * 0.6;
    if (all.footstep) { const err = Math.round(this.bobT / Math.PI) * Math.PI - this.bobT; this.bobT += err * 0.5; }
    const stance = this.sprinting ? 1.3 : s.crouched ? 0.55 : 1;
    const bobTarget = s.onGround && !sliding && !mantling ? Math.min(1.2, hs / run) * stance : 0;
    this.bobAmt += (bobTarget - this.bobAmt) * (1 - Math.exp(-dt * 10));
    const sb = Math.sin(this.bobT);
    this.bobY = (Math.abs(sb) - 0.64) * 0.05 * this.bobAmt; // sharp low point = footfall
    this.bobX = sb * 0.022 * this.bobAmt;
    this.bobRoll = sb * 0.005 * this.bobAmt;

    // roll: strafe lean, wall-run tilt away from the wall, slide tilt
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    const lateral = (s.vx * rx + s.vz * rz) / C.BASE_SPEED;
    let wantRoll = -lateral * 0.014;
    if (s.wallRun && (s.wallNx || s.wallNz)) wantRoll += 0.11 * Math.sign(-(s.wallNx * rx + s.wallNz * rz) || 1);
    if (sliding) wantRoll += 0.045;
    wantRoll = Math.max(-0.16, Math.min(0.16, wantRoll));
    [this.roll, this.rollV] = spring(this.roll, this.rollV, wantRoll, 9, dt);
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
