// Deterministic player + entity movement against AABBs. Fixed timestep (PHYSICS_DT).
// Used by client prediction and server validation / AI movement.

import type { Box } from './mapData';
import * as C from './constants';

export interface PState {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  onGround: boolean;
  dashT: number; // remaining dash time
  dashCharges: number; // float, regenerates
  slideT: number; // remaining slide time
  jumpsLeft: number;
  jumpHeldPrev: boolean;
  crouchHeldPrev: boolean;
  wallT: number; // wall-run time used
  wallNx: number; wallNz: number; // current wall-run normal
  airTime: number;
  stepDist: number;
}

export interface PInput {
  fwd: number; // -1..1
  right: number; // -1..1
  jump: boolean; // held
  dash: boolean; // pressed this step
  crouch: boolean; // held
  yaw: number;
}

export interface PhysParams {
  speedMult: number;
  jumpMult: number;
  airControl: number;
  maxDash: number;
  dashCooldown: number;
  extraJumps: number;
  wallRunTime: number;
  gravityMult?: number;
}

export interface PEvents {
  jumped: boolean;
  landed: number; // 0 or impact speed
  dashed: boolean;
  slideStart: boolean;
  footstep: boolean;
  wallrun: boolean;
}

export function newPState(x: number, y: number, z: number, maxDash: number): PState {
  return { x, y, z, vx: 0, vy: 0, vz: 0, onGround: true, dashT: 0, dashCharges: maxDash, slideT: 0, jumpsLeft: 0, jumpHeldPrev: false, crouchHeldPrev: false, wallT: 0, wallNx: 0, wallNz: 0, airTime: 0, stepDist: 0 };
}

const JUMP_V = Math.sqrt(2 * C.GRAVITY * C.JUMP_HEIGHT);

function overlaps(b: Box, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  return x0 < b.x1 && x1 > b.x0 && y0 < b.y1 && y1 > b.y0 && z0 < b.z1 && z1 > b.z0;
}

/** Move a vertical box (radius r, height h) by (dx,dy,dz) against boxes. Mutates pos, returns contact flags. */
export function moveBody(
  pos: { x: number; y: number; z: number },
  r: number, h: number,
  dx: number, dy: number, dz: number,
  boxes: Box[], stepUp: number,
): { hitX: boolean; hitZ: boolean; ground: boolean; ceil: boolean; wallNx: number; wallNz: number } {
  let hitX = false, hitZ = false, ground = false, ceil = false, wallNx = 0, wallNz = 0;
  // X
  if (dx !== 0) {
    pos.x += dx;
    for (const b of boxes) {
      if (!overlaps(b, pos.x - r, pos.y, pos.z - r, pos.x + r, pos.y + h, pos.z + r)) continue;
      if (stepUp > 0 && b.y1 - pos.y <= stepUp && b.y1 - pos.y > 0 && !anyOverlap(boxes, pos.x - r, b.y1 + 0.001, pos.z - r, pos.x + r, b.y1 + h, pos.z + r)) {
        pos.y = b.y1 + 0.001; continue;
      }
      if (dx > 0) { pos.x = b.x0 - r - 0.0001; wallNx = -1; } else { pos.x = b.x1 + r + 0.0001; wallNx = 1; }
      hitX = true;
    }
  }
  // Z
  if (dz !== 0) {
    pos.z += dz;
    for (const b of boxes) {
      if (!overlaps(b, pos.x - r, pos.y, pos.z - r, pos.x + r, pos.y + h, pos.z + r)) continue;
      if (stepUp > 0 && b.y1 - pos.y <= stepUp && b.y1 - pos.y > 0 && !anyOverlap(boxes, pos.x - r, b.y1 + 0.001, pos.z - r, pos.x + r, b.y1 + h, pos.z + r)) {
        pos.y = b.y1 + 0.001; continue;
      }
      if (dz > 0) { pos.z = b.z0 - r - 0.0001; wallNz = -1; } else { pos.z = b.z1 + r + 0.0001; wallNz = 1; }
      hitZ = true;
    }
  }
  // Y
  pos.y += dy;
  if (pos.y <= 0) { pos.y = 0; if (dy <= 0) ground = true; }
  for (const b of boxes) {
    if (!overlaps(b, pos.x - r, pos.y, pos.z - r, pos.x + r, pos.y + h, pos.z + r)) continue;
    if (dy <= 0 && pos.y - dy >= b.y1 - 0.05) { pos.y = b.y1; ground = true; }
    else if (dy > 0) { pos.y = b.y0 - h - 0.001; ceil = true; }
    else { pos.y = b.y1; ground = true; }
  }
  // ground probe (standing still on a box)
  if (!ground && dy <= 0) {
    if (pos.y <= 0.0001) ground = true;
    else if (anyOverlap(boxes, pos.x - r, pos.y - 0.02, pos.z - r, pos.x + r, pos.y, pos.z + r)) ground = true;
  }
  return { hitX, hitZ, ground, ceil, wallNx, wallNz };
}

function anyOverlap(boxes: Box[], x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  for (const b of boxes) if (overlaps(b, x0, y0, z0, x1, y1, z1)) return true;
  return false;
}

/**
 * Quake-lite movement: instant ground response, auto bunny-hop (hold space, keep momentum),
 * dash bursts, slide on crouch, air control, optional double jump / wall run.
 */
export function stepPlayer(s: PState, inp: PInput, p: PhysParams, boxes: Box[], dt: number): PEvents {
  const ev: PEvents = { jumped: false, landed: 0, dashed: false, slideStart: false, footstep: false, wallrun: false };
  const speed = C.BASE_SPEED * p.speedMult;
  const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
  // forward = (-sin, -cos), right = (cos, -sin)
  let wx = -sin * inp.fwd + cos * inp.right;
  let wz = -cos * inp.fwd - sin * inp.right;
  const wl = Math.hypot(wx, wz);
  if (wl > 1) { wx /= wl; wz /= wl; }
  const moving = wl > 0.05;

  // dash charges regen
  if (s.dashCharges < p.maxDash) s.dashCharges = Math.min(p.maxDash, s.dashCharges + dt / p.dashCooldown);
  if (s.dashCharges > p.maxDash) s.dashCharges = p.maxDash;

  // dash
  if (inp.dash && s.dashCharges >= 1 && s.dashT <= 0) {
    s.dashCharges -= 1;
    let dx = wx, dz = wz;
    if (!moving) { dx = -sin; dz = -cos; }
    const l = Math.hypot(dx, dz) || 1;
    s.vx = (dx / l) * C.DASH_SPEED; s.vz = (dz / l) * C.DASH_SPEED;
    if (s.vy < 0) s.vy = 0;
    s.dashT = C.DASH_TIME;
    ev.dashed = true;
  }

  const hspeed = Math.hypot(s.vx, s.vz);
  if (s.dashT > 0) {
    s.dashT -= dt;
    if (s.dashT <= 0) {
      // exit dash keeping some momentum
      const keep = Math.max(speed * 1.25, 0) / Math.max(1e-3, hspeed);
      if (keep < 1) { s.vx *= keep; s.vz *= keep; }
    }
  } else if (s.slideT > 0) {
    s.slideT -= dt;
    // low friction, slight steering
    const f = Math.max(0, 1 - 1.1 * dt);
    s.vx *= f; s.vz *= f;
    if (moving) { s.vx += wx * speed * 0.8 * dt; s.vz += wz * speed * 0.8 * dt; }
    if (!inp.crouch && s.slideT < C.SLIDE_TIME - 0.15) s.slideT = 0;
  } else if (s.onGround) {
    // instant response; if faster than run speed (bhop/dash), decay excess while steering
    if (hspeed <= speed + 0.01) {
      s.vx = wx * speed; s.vz = wz * speed;
    } else {
      const f = Math.max(0, 1 - 4.5 * dt);
      const ns = Math.max(speed, hspeed * f);
      let dx = s.vx / hspeed, dz = s.vz / hspeed;
      if (moving) { dx = dx * 0.85 + wx * 0.15; dz = dz * 0.85 + wz * 0.15; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; }
      s.vx = dx * ns; s.vz = dz * ns;
    }
  } else {
    // air control: steer toward wish velocity, preserve momentum above run speed
    const ac = p.airControl;
    if (moving) {
      const target = Math.max(speed, hspeed);
      const tx = wx * target, tz = wz * target;
      const k = Math.min(1, ac * 6 * dt);
      s.vx += (tx - s.vx) * k; s.vz += (tz - s.vz) * k;
    }
  }

  // slide start: crouch pressed while moving on ground, or landing with crouch held
  const crouchPressed = inp.crouch && !s.crouchHeldPrev;
  if (s.onGround && crouchPressed && s.slideT <= 0 && Math.hypot(s.vx, s.vz) > speed * 0.5) {
    const hs = Math.hypot(s.vx, s.vz);
    const boost = Math.max(hs, speed * C.SLIDE_BOOST) / hs;
    s.vx *= boost; s.vz *= boost;
    s.slideT = C.SLIDE_TIME;
    ev.slideStart = true;
  }

  // jump (auto bunny-hop: holding jump re-jumps on landing, no friction frame)
  const jumpPressed = inp.jump && !s.jumpHeldPrev;
  if (inp.jump && s.onGround) {
    s.vy = JUMP_V * Math.sqrt(p.jumpMult) * Math.sqrt(p.gravityMult ?? 1) * ((p.gravityMult ?? 1) < 1 ? 1.25 : 1);
    s.onGround = false;
    s.jumpsLeft = p.extraJumps;
    s.slideT = 0;
    ev.jumped = true;
    // tiny bhop reward: keep momentum, nudge speed
    const hs = Math.hypot(s.vx, s.vz);
    if (hs > speed * 0.9 && hs < speed * 1.45) { s.vx *= 1.04; s.vz *= 1.04; }
  } else if (jumpPressed && !s.onGround) {
    if (s.wallT > 0 && (s.wallNx || s.wallNz)) {
      // wall jump
      s.vy = JUMP_V * 0.95;
      s.vx += s.wallNx * 7; s.vz += s.wallNz * 7;
      s.wallT = 99; s.wallNx = 0; s.wallNz = 0;
      ev.jumped = true;
    } else if (s.jumpsLeft > 0) {
      s.jumpsLeft--;
      s.vy = JUMP_V * 0.9 * Math.sqrt(p.jumpMult);
      if (moving) { const hs = Math.max(speed, Math.hypot(s.vx, s.vz)); s.vx = wx * hs; s.vz = wz * hs; }
      ev.jumped = true;
    }
  }
  s.jumpHeldPrev = inp.jump;
  s.crouchHeldPrev = inp.crouch;

  // gravity (reduced during dash and wall run)
  let g = C.GRAVITY * (p.gravityMult ?? 1);
  if (s.dashT > 0) g = 0;
  const wallRunning = p.wallRunTime > 0 && !s.onGround && s.wallT < p.wallRunTime && (s.wallNx !== 0 || s.wallNz !== 0) && moving && s.vy < 2;
  if (wallRunning) { g = C.GRAVITY * 0.12; if (s.vy < -1) s.vy = -1; ev.wallrun = true; }
  s.vy -= g * dt;
  if (s.vy < -40) s.vy = -40;

  const wasGround = s.onGround;
  const preVy = s.vy;
  const pos = { x: s.x, y: s.y, z: s.z };
  const res = moveBody(pos, C.PLAYER_RADIUS, s.slideT > 0 ? 1.0 : C.PLAYER_HEIGHT, s.vx * dt, s.vy * dt, s.vz * dt, boxes, s.onGround ? 0.55 : 0.3);
  const movedH = Math.hypot(pos.x - s.x, pos.z - s.z);
  s.x = pos.x; s.y = pos.y; s.z = pos.z;
  if (res.hitX) s.vx = 0;
  if (res.hitZ) s.vz = 0;
  if (res.ceil && s.vy > 0) s.vy = 0;

  // wall contact for wall-run
  if (!res.ground && (res.wallNx || res.wallNz) && p.wallRunTime > 0) {
    if (s.wallNx !== res.wallNx || s.wallNz !== res.wallNz) { s.wallNx = res.wallNx; s.wallNz = res.wallNz; }
    // project velocity along the wall so you keep running
    if (res.wallNx) s.vz = (Math.abs(s.vz) < speed ? Math.sign(s.vz || wz || 1) * speed : s.vz);
    if (res.wallNz) s.vx = (Math.abs(s.vx) < speed ? Math.sign(s.vx || wx || 1) * speed : s.vx);
  } else if (!res.hitX && !res.hitZ) {
    if (!wallRunning) { s.wallNx = 0; s.wallNz = 0; }
  }
  if (wallRunning) s.wallT += dt;

  if (res.ground) {
    if (!wasGround && preVy < -2) ev.landed = -preVy;
    if (s.vy < 0) s.vy = 0;
    s.onGround = true;
    s.wallT = 0; s.wallNx = 0; s.wallNz = 0;
    s.airTime = 0;
    // landing slide if crouch is held
    if (!wasGround && inp.crouch && s.slideT <= 0 && Math.hypot(s.vx, s.vz) > speed * 0.6) {
      const hs = Math.hypot(s.vx, s.vz);
      const boost = Math.max(hs, speed * C.SLIDE_BOOST) / hs;
      s.vx *= boost; s.vz *= boost;
      s.slideT = C.SLIDE_TIME;
      ev.slideStart = true;
    }
  } else {
    s.onGround = false;
    s.airTime += dt;
  }

  if (s.onGround && s.slideT <= 0) {
    s.stepDist += movedH;
    if (s.stepDist > 2.4) { s.stepDist = 0; ev.footstep = true; }
  }
  return ev;
}

/** Simple ground entity movement (enemies) with stepping. */
export function moveEntity(pos: { x: number; y: number; z: number }, r: number, h: number, dx: number, dz: number, boxes: Box[], flying: boolean, dy = 0) {
  if (flying) return moveBody(pos, r, h, dx, dy, dz, boxes, 0);
  const res = moveBody(pos, r, h, dx, -0.05, dz, boxes, 0.6);
  return res;
}
