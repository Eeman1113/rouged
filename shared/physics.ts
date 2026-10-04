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
  // ── extended movement state (optional for backward compat; filled in by stepPlayer) ──
  sprinting?: boolean;
  crouched?: boolean;
  wallRun?: boolean;
  coyoteT?: number;
  jumpBufT?: number;
  jumpCut?: boolean; // variable-height jump still cuttable
  groundT?: number; // time since landing
  airSprint?: boolean; // left the ground sprinting
  landT?: number; // landing recovery remaining
  slideCd?: number; // boosted-slide cooldown
  slideBoosted?: boolean;
  dashDx?: number; dashDz?: number; dashExit?: number;
  mantleT?: number; mantleDur?: number;
  mantleY0?: number; mantleY1?: number;
  mantleSx?: number; mantleSz?: number; mantleTx?: number; mantleTz?: number;
  mantleExit?: number; mantleCd?: number;
  lastWallNx?: number; lastWallNz?: number;
  wallCoyote?: number;
  hopBlock?: boolean; // jump still held from a mantle: no auto-hop until released
  groundY?: number; // height of the last ground we stood on
}

export interface PInput {
  fwd: number; // -1..1
  right: number; // -1..1
  jump: boolean; // held
  dash: boolean; // pressed this step
  crouch: boolean; // held
  yaw: number;
  /** sprint intent (hold or latched toggle, already resolved by the client) */
  sprint?: boolean;
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
  mantled?: boolean;
  sprintStart?: boolean;
  wallJump?: boolean;
  /** a freshly-timed bunny hop (bonus speed) */
  bhop?: boolean;
  /** footstep while sprinting / crouched (for cadence-aware sfx) */
  stepKind?: 'walk' | 'sprint' | 'crouch';
}

type FullState = Required<PState>;

export function newPState(x: number, y: number, z: number, maxDash: number): PState {
  const s: PState = { x, y, z, vx: 0, vy: 0, vz: 0, onGround: true, dashT: 0, dashCharges: maxDash, slideT: 0, jumpsLeft: 0, jumpHeldPrev: false, crouchHeldPrev: false, wallT: 0, wallNx: 0, wallNz: 0, airTime: 0, stepDist: 0 };
  return fillState(s);
}

/** Fill any missing extended fields with defaults (idempotent). */
export function fillState(s: PState): FullState {
  s.sprinting ??= false; s.crouched ??= false; s.wallRun ??= false;
  s.coyoteT ??= 0; s.jumpBufT ??= 0; s.jumpCut ??= false; s.groundT ??= 0; s.airSprint ??= false; s.landT ??= 0;
  s.slideCd ??= 0; s.slideBoosted ??= false; s.dashDx ??= 0; s.dashDz ??= 0; s.dashExit ??= 0;
  s.mantleT ??= 0; s.mantleDur ??= 0; s.mantleY0 ??= 0; s.mantleY1 ??= 0; s.mantleSx ??= 0; s.mantleSz ??= 0; s.mantleTx ??= 0; s.mantleTz ??= 0;
  s.mantleExit ??= 0; s.mantleCd ??= 0; s.lastWallNx ??= 0; s.lastWallNz ??= 0; s.wallCoyote ??= 0; s.hopBlock ??= false; s.groundY ??= s.y;
  return s as FullState;
}

const JUMP_V = Math.sqrt(2 * C.GRAVITY * C.JUMP_HEIGHT);
/** horizontal penetration below which a hit counts as a grazed corner and we slide around it */
const CORNER_NUDGE = 0.12;

function overlaps(b: Box, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  return x0 < b.x1 && x1 > b.x0 && y0 < b.y1 && y1 > b.y0 && z0 < b.z1 && z1 > b.z0;
}

function anyOverlap(boxes: Box[], x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  for (const b of boxes) if (overlaps(b, x0, y0, z0, x1, y1, z1)) return true;
  return false;
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
      // grazed a corner: slip around it instead of snagging
      const pLo = pos.z + r - b.z0, pHi = b.z1 - (pos.z - r);
      const pen = Math.min(pLo, pHi);
      if (pen < CORNER_NUDGE && Math.abs(dx) > 1e-4) {
        const nz = pLo < pHi ? b.z0 - r - 0.0001 : b.z1 + r + 0.0001;
        if (!anyOverlap(boxes, pos.x - r, pos.y, nz - r, pos.x + r, pos.y + h, nz + r)) { pos.z = nz; continue; }
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
      const pLo = pos.x + r - b.x0, pHi = b.x1 - (pos.x - r);
      const pen = Math.min(pLo, pHi);
      if (pen < CORNER_NUDGE && Math.abs(dz) > 1e-4) {
        const nx = pLo < pHi ? b.x0 - r - 0.0001 : b.x1 + r + 0.0001;
        if (!anyOverlap(boxes, nx - r, pos.y, pos.z - r, nx + r, pos.y + h, pos.z + r)) { pos.x = nx; continue; }
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

/** Highest walkable surface under the body within maxDrop (floor plane y=0 included), or -Infinity. */
export function groundBelow(boxes: Box[], x: number, y: number, z: number, r: number, maxDrop: number): number {
  let best = y - maxDrop <= 0 ? 0 : -Infinity;
  for (const b of boxes) {
    if (b.y1 > y + 1e-4 || b.y1 < y - maxDrop || b.y1 <= best) continue;
    if (x - r < b.x1 && x + r > b.x0 && z - r < b.z1 && z + r > b.z0) best = b.y1;
  }
  return best;
}

function fits(boxes: Box[], x: number, y: number, z: number, r: number, h: number) {
  return !anyOverlap(boxes, x - r, y, z - r, x + r, y + h, z + r);
}

/** Normal of a wall touching the body's side (prefers hint), or [0,0]. */
function wallTouch(boxes: Box[], x: number, y: number, z: number, r: number, h: number, hx: number, hz: number): [number, number] {
  const e = 0.07, y0 = y + 0.2, y1 = y + h - 0.1;
  const side = (nx: number, nz: number) => {
    if (nx === 1) return anyOverlap(boxes, x - r - e, y0, z - r + 0.05, x - r, y1, z + r - 0.05);
    if (nx === -1) return anyOverlap(boxes, x + r, y0, z - r + 0.05, x + r + e, y1, z + r - 0.05);
    if (nz === 1) return anyOverlap(boxes, x - r + 0.05, y0, z - r - e, x + r - 0.05, y1, z - r);
    return anyOverlap(boxes, x - r + 0.05, y0, z + r, x + r - 0.05, y1, z + r + e);
  };
  if ((hx || hz) && side(hx, hz)) return [hx, hz];
  if (side(1, 0)) return [1, 0];
  if (side(-1, 0)) return [-1, 0];
  if (side(0, 1)) return [0, 1];
  if (side(0, -1)) return [0, -1];
  return [0, 0];
}

/**
 * Probe a ledge in direction (dx,dz) (unit, axis-aligned). Returns the ledge top + landing spot if the
 * wall in front tops out within mantle reach and there's room to climb onto it.
 */
function findLedge(boxes: Box[], s: FullState, dx: number, dz: number, extraJumps: number): { top: number; tx: number; tz: number } | null {
  const r = C.PLAYER_RADIUS;
  const px = s.x + dx * 0.12, pz = s.z + dz * 0.12;
  let top = -Infinity;
  for (const b of boxes) {
    if (!overlaps(b, px - r, s.y + 0.02, pz - r, px + r, s.y + C.PLAYER_HEIGHT, pz + r)) continue;
    if (b.y1 > top) top = b.y1;
  }
  if (!isFinite(top)) return null;
  const rise = top - s.y;
  if (rise < C.MANTLE_MIN || rise > C.MANTLE_REACH) return null;
  // waist-to-chest high relative to where you jumped from (or already within waist reach of your feet)
  if (top - s.groundY > C.MANTLE_MAX_HEIGHT + (s.jumpsLeft < extraJumps ? C.JUMP_HEIGHT : 0) && rise > C.MANTLE_WAIST) return null;
  // room above our head to rise in place, and room on top of the ledge to stand (at least crouched)
  if (!fits(boxes, s.x, s.y, s.z, r, top - s.y + C.CROUCH_HEIGHT)) return null;
  const tx = s.x + dx * (r * 2 + 0.15), tz = s.z + dz * (r * 2 + 0.15);
  if (!fits(boxes, tx, top + 0.002, tz, r, C.CROUCH_HEIGHT)) return null;
  // must actually be supported there (not a thin rail)
  if (groundBelow(boxes, tx, top + 0.002, tz, r * 0.6, 0.06) < top - 0.05) return null;
  return { top, tx, tz };
}

function easeOut(t: number) { return 1 - (1 - t) * (1 - t) * (1 - t); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t); }

/**
 * AAA-tuned movement: very fast accel/decel ground model, sprint, crouch, power slide with a
 * downhill friction curve, coyote time + jump buffering + variable jump height, auto bunny-hop
 * (timed hops slightly better), Quake-flavoured air strafing, dash bursts, mantling onto
 * waist-to-chest-high ledges, and (powerup-gated) double jump / wall run / wall jump.
 */
export function stepPlayer(s0: PState, inp: PInput, p: PhysParams, boxes: Box[], dt: number): PEvents {
  const s = fillState(s0);
  const ev: PEvents = { jumped: false, landed: 0, dashed: false, slideStart: false, footstep: false, wallrun: false };
  const run = C.BASE_SPEED * p.speedMult;
  const sprintV = run * C.SPRINT_MULT;
  const crouchV = run * C.CROUCH_MULT;
  const bhopCap = run * C.BHOP_CAP_MULT;
  const gm = p.gravityMult ?? 1;
  const jumpV = JUMP_V * Math.sqrt(p.jumpMult) * Math.sqrt(gm) * (gm < 1 ? 1.25 : 1);
  const r = C.PLAYER_RADIUS;
  const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
  // forward = (-sin, -cos), right = (cos, -sin)
  let wx = -sin * inp.fwd + cos * inp.right;
  let wz = -cos * inp.fwd - sin * inp.right;
  let wl = Math.hypot(wx, wz);
  if (wl > 1) { wx /= wl; wz /= wl; wl = 1; }
  const moving = wl > 0.05;
  const ux = moving ? wx / wl : 0, uz = moving ? wz / wl : 0; // unit wish dir

  // ── timers ──
  if (s.dashCharges < p.maxDash) s.dashCharges = Math.min(p.maxDash, s.dashCharges + dt / p.dashCooldown);
  if (s.dashCharges > p.maxDash) s.dashCharges = p.maxDash;
  s.coyoteT = Math.max(0, s.coyoteT - dt);
  s.jumpBufT = Math.max(0, s.jumpBufT - dt);
  s.slideCd = Math.max(0, s.slideCd - dt);
  s.landT = Math.max(0, s.landT - dt);
  s.mantleCd = Math.max(0, s.mantleCd - dt);
  s.wallCoyote = Math.max(0, s.wallCoyote - dt);
  if (s.onGround) s.groundT += dt;

  const jumpPressed = inp.jump && !s.jumpHeldPrev;
  const crouchPressed = inp.crouch && !s.crouchHeldPrev;
  s.jumpHeldPrev = inp.jump;
  s.crouchHeldPrev = inp.crouch;
  if (jumpPressed) s.jumpBufT = C.JUMP_BUFFER;
  if (!inp.jump) s.hopBlock = false;

  // variable jump height: releasing early cuts the rise
  if (s.jumpCut) {
    if (s.vy <= 0) s.jumpCut = false;
    else if (!inp.jump) {
      if (s.vy > jumpV * C.JUMP_CUT_MIN) s.vy = Math.max(jumpV * C.JUMP_CUT_MIN, s.vy * C.JUMP_CUT);
      s.jumpCut = false;
    }
  }

  // ── mantle in progress: scripted, collision-checked climb ──
  if (s.mantleT > 0) {
    stepMantle(s, boxes, dt, ev, p);
    return ev;
  }

  // ── crouch / stand ──
  const canStand = fits(boxes, s.x, s.y, s.z, r, C.PLAYER_HEIGHT);
  s.crouched = inp.crouch || (!canStand && (s.crouched || s.slideT > 0));

  // ── dash ──
  let hs = Math.hypot(s.vx, s.vz);
  if (inp.dash && s.dashCharges >= 1 && s.dashT <= 0) {
    s.dashCharges -= 1;
    let dx = ux, dz = uz;
    if (!moving) { dx = -sin; dz = -cos; }
    s.dashDx = dx; s.dashDz = dz;
    s.dashExit = Math.max(sprintV * C.DASH_EXIT_MULT, Math.min(hs, C.DASH_SPEED));
    s.dashT = C.DASH_TIME;
    s.slideT = 0;
    s.sprinting = false;
    if (s.vy < 0 || !s.onGround) s.vy = 0;
    ev.dashed = true;
  }

  // ── sprint (forward-ish only; strafe/back cancels) ──
  const fwdish = inp.fwd > 0.3 && inp.fwd >= Math.abs(inp.right) * 0.55;
  const wasSprint = s.sprinting;
  if (s.onGround) s.sprinting = !!inp.sprint && fwdish && !s.crouched && s.slideT <= 0 && s.dashT <= 0;
  else s.sprinting = s.sprinting && !!inp.sprint && fwdish;
  if (s.sprinting && !wasSprint && s.onGround) ev.sprintStart = true;

  // ── jumps ──
  let jumped = false;
  const canGroundJump = s.onGround || s.coyoteT > 0;
  if (canGroundJump && (s.jumpBufT > 0 || (inp.jump && s.onGround && !s.hopBlock))) {
    const fresh = s.jumpBufT > 0;
    const chain = s.onGround && s.groundT <= dt * 1.5; // landed on this/previous step
    if (s.dashT > 0) {
      // dash-jump: cash the dash into momentum
      const keep = Math.min(hs, run * C.DASH_JUMP_KEEP_MULT);
      if (hs > keep) { s.vx *= keep / hs; s.vz *= keep / hs; }
      s.dashT = 0;
    } else if (chain && fresh && hs > run * 0.8 && hs < bhopCap) {
      const k = Math.min(C.BHOP_TIMED_GAIN, bhopCap / hs);
      s.vx *= k; s.vz *= k;
      ev.bhop = true;
    }
    s.vy = jumpV;
    s.onGround = false;
    s.coyoteT = 0; s.jumpBufT = 0;
    s.jumpCut = inp.jump; // only cuttable if the key is still down at takeoff
    s.jumpsLeft = p.extraJumps;
    s.slideT = 0;
    s.airSprint = s.sprinting;
    jumped = true;
    ev.jumped = true;
  } else if (jumpPressed && !s.onGround) {
    if (p.wallRunTime > 0 && (s.wallRun || s.wallCoyote > 0) && (s.wallNx || s.wallNz)) {
      // wall jump: kick off the wall, keep (and slightly boost) the run along it
      const nx = s.wallNx, nz = s.wallNz;
      const along = s.vx * nz * nz + s.vz * nx * nx; // component parallel to an axis-aligned wall
      s.vy = jumpV * 0.95;
      if (nx) { s.vx = nx * C.WALL_JUMP_PUSH; s.vz = along * 1.05 + uz * 2; }
      else { s.vz = nz * C.WALL_JUMP_PUSH; s.vx = along * 1.05 + ux * 2; }
      s.lastWallNx = nx; s.lastWallNz = nz;
      s.wallT = 0; s.wallRun = false; s.wallCoyote = 0;
      s.jumpBufT = 0; s.jumpCut = false;
      s.jumpsLeft = Math.max(s.jumpsLeft, p.extraJumps);
      jumped = true;
      ev.jumped = true; ev.wallJump = true;
    } else if (s.jumpsLeft > 0 && !landingSoon(s, boxes, gm)) {
      s.jumpsLeft--;
      s.vy = jumpV * 0.9;
      // double jump redirects momentum toward the stick (keeps speed)
      if (moving) { const sp = Math.max(s.airSprint ? sprintV : run, Math.hypot(s.vx, s.vz)); s.vx = ux * sp; s.vz = uz * sp; }
      s.dashT = 0;
      s.jumpBufT = 0;
      s.jumpCut = true;
      jumped = true;
      ev.jumped = true;
    }
    // else: stays buffered for the landing
  }
  hs = Math.hypot(s.vx, s.vz);

  // ── slide start (crouch pressed while moving fast on the ground) ──
  if (!jumped && s.onGround && s.slideT <= 0 && s.dashT <= 0 && crouchPressed && hs > run * C.SLIDE_MIN_SPEED_MULT) {
    startSlide(s, run, sprintV, wasSprint || s.sprinting, ev);
    hs = Math.hypot(s.vx, s.vz);
  }

  // ── horizontal ──
  if (s.dashT > 0) {
    const age = C.DASH_TIME - s.dashT;
    const t = age / C.DASH_TIME;
    // crisp burst: hits ~80% instantly, peaks within 2 frames, eases out toward the exit speed
    const prof = t < 0.12 ? 0.8 + 0.2 * (t / 0.12) : 1 - 0.3 * Math.pow((t - 0.12) / 0.88, 2);
    const sp = C.DASH_SPEED * prof;
    // slight steering for feel, never toward a stop
    if (moving) {
      const k = Math.min(1, 5 * dt);
      let dx = s.dashDx + (ux - s.dashDx) * k, dz = s.dashDz + (uz - s.dashDz) * k;
      const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      if (dx * s.dashDx + dz * s.dashDz > 0.5) { s.dashDx = dx; s.dashDz = dz; }
    }
    s.vx = s.dashDx * sp; s.vz = s.dashDz * sp;
    s.dashT -= dt;
    if (s.dashT <= 0) {
      s.dashT = 0;
      const h2 = Math.hypot(s.vx, s.vz);
      if (h2 > s.dashExit) { s.vx *= s.dashExit / h2; s.vz *= s.dashExit / h2; }
    }
  } else if (s.slideT > 0 && s.onGround && !jumped) {
    const age = C.SLIDE_TIME - s.slideT;
    const prog = age / C.SLIDE_TIME;
    const decel = C.SLIDE_FRICTION + C.SLIDE_FRICTION_RAMP * prog * prog;
    let ns = Math.max(0, hs - decel * dt);
    let dx = hs > 1e-4 ? s.vx / hs : ux, dz = hs > 1e-4 ? s.vz / hs : uz;
    if (moving && hs > 1e-4) {
      // limited steering
      const cross = dx * uz - dz * ux, dot = dx * ux + dz * uz;
      const ang = Math.atan2(cross, dot);
      const a = Math.max(-C.SLIDE_STEER * dt, Math.min(C.SLIDE_STEER * dt, ang));
      const c = Math.cos(a), sn = Math.sin(a);
      const ndx = dx * c - dz * sn, ndz = dx * sn + dz * c;
      dx = ndx; dz = ndz;
      if (dot < -0.3) ns = Math.max(0, ns - 10 * dt); // pulling back scrubs speed
    }
    s.vx = dx * ns; s.vz = dz * ns;
    s.slideT -= dt;
    if (s.slideT <= 0 || ns < run * C.SLIDE_END_SPEED_MULT || (!inp.crouch && age > C.SLIDE_MIN_TIME)) s.slideT = 0;
  } else if (s.onGround && !jumped) {
    if (s.slideT > 0) s.slideT = 0;
    let maxV = s.crouched ? crouchV : s.sprinting ? sprintV : run;
    if (s.landT > 0) maxV *= 0.85;
    if (moving) {
      const tx = ux * maxV * wl, tz = uz * maxV * wl;
      const vdot = hs > 1e-4 ? (s.vx * ux + s.vz * uz) / hs : 1;
      if (hs > maxV + 0.05 && vdot > -0.3) {
        // carrying momentum (bhop/dash/slide exit): bleed the excess, steer quickly
        // momentum above sprint speed bleeds exponentially; sprint → run/crouch is a quick sprint-out
        let ns = hs;
        const top = Math.max(maxV, sprintV);
        if (ns > top) ns = top + (ns - top) * Math.exp(-C.OVERSPEED_DECAY * dt);
        if (ns > maxV) ns = Math.max(maxV, ns - C.SPRINT_OUT_DECEL * dt);
        const k = Math.min(1, C.OVERSPEED_STEER * dt);
        let dx = s.vx / hs + (ux - s.vx / hs) * k, dz = s.vz / hs + (uz - s.vz / hs) * k;
        const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
        s.vx = dx * ns; s.vz = dz * ns;
      } else {
        moveToward(s, tx, tz, C.GROUND_ACCEL * dt);
      }
    } else {
      const ns = Math.max(0, hs - (C.GROUND_DECEL + Math.max(0, hs - run) * 6) * dt);
      if (hs > 1e-4) { s.vx *= ns / hs; s.vz *= ns / hs; } else { s.vx = 0; s.vz = 0; }
    }
  } else {
    // air
    if (s.slideT > 0 && !jumped) s.slideT = 0;
    const airMax = s.airSprint ? sprintV : run;
    const ac = p.airControl;
    if (moving) {
      const vdot = hs > 1e-4 ? (s.vx * ux + s.vz * uz) / hs : 1;
      if (vdot < -0.5 && hs > 0.5) {
        // pulling back against your momentum: air brake
        moveToward(s, ux * airMax * 0.5, uz * airMax * 0.5, C.AIR_BRAKE * ac * dt);
      } else {
        // DOOM-style steering: rotate velocity toward the stick without bleeding speed,
        // and build up to run/sprint speed if we took off slower than that
        let nh = hs;
        const want = airMax * wl;
        if (nh < want) nh = Math.min(want, nh + C.AIR_ACCEL * ac * dt);
        let dx = ux, dz = uz;
        if (hs > 1e-3) {
          const vx0 = s.vx / hs, vz0 = s.vz / hs;
          const ang = Math.atan2(vx0 * uz - vz0 * ux, vx0 * ux + vz0 * uz);
          const a = ang * (1 - Math.exp(-ac * C.AIR_STEER * dt));
          const c = Math.cos(a), sn = Math.sin(a);
          dx = vx0 * c - vz0 * sn; dz = vx0 * sn + vz0 * c;
        }
        s.vx = dx * nh; s.vz = dz * nh;
        // Quake-style air strafe: lets a good curve add a little speed (capped)
        const cur = s.vx * ux + s.vz * uz;
        const add = C.AIR_STRAFE_SPEED - cur;
        const h2 = Math.hypot(s.vx, s.vz);
        if (add > 0 && h2 < bhopCap) {
          const a = Math.min(add, C.AIR_STRAFE_ACCEL * ac * dt);
          s.vx += ux * a; s.vz += uz * a;
          // never let the strafe term gain past the old speed by much on a plain turn
          const h3 = Math.hypot(s.vx, s.vz);
          const lim = Math.max(h2, Math.min(bhopCap, hs + 0.04));
          if (h3 > lim) { s.vx *= lim / h3; s.vz *= lim / h3; }
        }
      }
    }
  }

  // ── wall-run state (decided before integrating gravity) ──
  let wallRunning = false;
  if (p.wallRunTime > 0 && !s.onGround && !jumped && s.dashT <= 0 && s.airTime > 0.06) {
    const [nx, nz] = wallTouch(boxes, s.x, s.y, s.z, r, C.PLAYER_HEIGHT, s.wallNx, s.wallNz);
    if (nx || nz) {
      s.wallNx = nx; s.wallNz = nz; s.wallCoyote = 0.15;
      const sameAsLast = nx === s.lastWallNx && nz === s.lastWallNz;
      const along = nx ? s.vz : s.vx;
      const intoOrAlong = moving && (ux * -nx + uz * -nz > -0.2);
      if (!sameAsLast && s.wallT < p.wallRunTime && intoOrAlong && Math.abs(along) > run * 0.5 && s.vy < 4 && !inp.crouch) {
        wallRunning = true;
        const sp = Math.max(Math.abs(along), run) * Math.sign(along);
        if (nx) { s.vz = sp; s.vx = -nx * 1.5; } else { s.vx = sp; s.vz = -nz * 1.5; }
        if (!s.wallRun) s.vy = Math.max(s.vy * 0.3, 0);
        s.jumpsLeft = Math.max(s.jumpsLeft, p.extraJumps);
      }
    } else if (s.wallCoyote <= 0) { s.wallNx = 0; s.wallNz = 0; }
  }
  s.wallRun = wallRunning;

  // ── gravity ──
  let g = C.GRAVITY * gm;
  if (s.vy < 0) g *= C.FALL_GRAVITY_MULT;
  if (s.dashT > 0) { g = 0; s.vy = 0; }
  if (wallRunning) { g = C.GRAVITY * C.WALLRUN_GRAVITY; if (s.vy < -1) s.vy = -1; ev.wallrun = true; s.wallT += dt; }
  s.vy -= g * dt;
  if (s.vy < -40) s.vy = -40;

  // ── integrate ──
  const wasGround = s.onGround;
  const preVy = s.vy;
  const preVx = s.vx, preVz = s.vz;
  const h = s.crouched || s.slideT > 0 ? C.CROUCH_HEIGHT : C.PLAYER_HEIGHT;
  const pos = { x: s.x, y: s.y, z: s.z };
  const res = moveBody(pos, r, h, s.vx * dt, s.vy * dt, s.vz * dt, boxes, wasGround ? C.STEP_UP : 0.3);
  const movedH = Math.hypot(pos.x - s.x, pos.z - s.z);
  s.x = pos.x; s.y = pos.y; s.z = pos.z;
  if (res.hitX) s.vx = 0;
  if (res.hitZ) s.vz = 0;
  if (res.ceil && s.vy > 0) { s.vy = 0; s.jumpCut = false; }

  // ground snap: walking off stairs / small edges keeps you planted (no fake airtime)
  let ground = res.ground;
  if (!ground && wasGround && !jumped && s.vy <= 0) {
    const top = groundBelow(boxes, s.x, s.y, s.z, r, C.STEP_DOWN);
    if (isFinite(top) && fits(boxes, s.x, top, s.z, r, h)) { s.y = top; ground = true; }
  }

  // ── mantle: blocked in the air while pushing into a waist-to-chest-high ledge ──
  if (!ground && (res.hitX || res.hitZ) && moving && s.mantleCd <= 0 && (inp.jump || inp.fwd > 0.3) && !inp.crouch) {
    const cands: [number, number, number][] = [];
    if (res.hitX) cands.push([-res.wallNx, 0, Math.abs(ux)]);
    if (res.hitZ) cands.push([0, -res.wallNz, Math.abs(uz)]);
    cands.sort((a, b) => b[2] - a[2]);
    for (const [dx, dz] of cands) {
      if (ux * dx + uz * dz < 0.4) continue;
      const L = findLedge(boxes, s, dx, dz, p.extraJumps);
      if (!L) continue;
      const rise = L.top - s.y;
      s.mantleDur = C.MANTLE_TIME + C.MANTLE_TIME_PER_M * rise;
      s.mantleT = s.mantleDur;
      s.mantleY0 = s.y; s.mantleY1 = L.top + 0.001;
      s.mantleSx = s.x; s.mantleSz = s.z; s.mantleTx = L.tx; s.mantleTz = L.tz;
      const preH = Math.hypot(preVx, preVz);
      s.mantleExit = Math.min(sprintV, Math.max(run * 0.75, preH * 0.85));
      s.vx = 0; s.vy = 0; s.vz = 0;
      s.dashT = 0; s.slideT = 0; s.jumpCut = false; s.wallRun = false;
      s.onGround = false;
      ev.mantled = true;
      return ev;
    }
  }

  if (ground) {
    if (!wasGround) {
      if (preVy < -2) ev.landed = -preVy;
      if (-preVy > C.LAND_HARD_SPEED && !inp.crouch) s.landT = C.LAND_RECOVER_TIME;
      s.groundT = 0;
    }
    if (s.vy < 0) s.vy = 0;
    s.onGround = true;
    s.groundY = s.y;
    s.wallT = 0; s.wallNx = 0; s.wallNz = 0; s.wallRun = false; s.lastWallNx = 0; s.lastWallNz = 0;
    s.airTime = 0;
    s.jumpsLeft = p.extraJumps;
    s.airSprint = false;
    // landing slide if crouch is held and we're carrying speed
    const hs2 = Math.hypot(s.vx, s.vz);
    if (!wasGround && inp.crouch && s.slideT <= 0 && s.dashT <= 0 && hs2 > run * C.SLIDE_MIN_SPEED_MULT) {
      startSlide(s, run, sprintV, s.sprinting || hs2 >= sprintV * 0.95, ev);
    }
  } else {
    if (wasGround && !jumped) { s.coyoteT = C.COYOTE_TIME; s.airSprint = s.sprinting; }
    s.onGround = false;
    s.airTime += dt;
  }

  if (s.onGround && s.slideT <= 0) {
    s.stepDist += movedH;
    const stride = s.crouched ? 1.7 : s.sprinting ? 3.0 : 2.4;
    if (s.stepDist > stride) { s.stepDist = 0; ev.footstep = true; ev.stepKind = s.crouched ? 'crouch' : s.sprinting ? 'sprint' : 'walk'; }
  }
  return ev;
}

function moveToward(s: FullState, tx: number, tz: number, maxDelta: number) {
  const dx = tx - s.vx, dz = tz - s.vz;
  const l = Math.hypot(dx, dz);
  if (l <= maxDelta || l < 1e-6) { s.vx = tx; s.vz = tz; return; }
  s.vx += (dx / l) * maxDelta; s.vz += (dz / l) * maxDelta;
}

function startSlide(s: FullState, run: number, sprintV: number, fromSprint: boolean, ev: PEvents) {
  const hs = Math.hypot(s.vx, s.vz);
  if (hs < 1e-4) return;
  let ns = hs;
  if (s.slideCd <= 0) {
    const cap = run * C.SLIDE_BOOST_CAP_MULT;
    const add = C.SLIDE_BOOST_ADD * (fromSprint ? 1 : 0.6);
    if (hs < cap) ns = Math.min(cap, hs + add);
    s.slideCd = C.SLIDE_COOLDOWN;
    s.slideBoosted = true;
  } else s.slideBoosted = false;
  void sprintV;
  s.vx *= ns / hs; s.vz *= ns / hs;
  s.slideT = C.SLIDE_TIME;
  s.sprinting = false;
  s.crouched = true;
  ev.slideStart = true;
}

/** Falling and about to land within the jump buffer window (keep the press for a timed hop instead of burning a double jump). */
function landingSoon(s: FullState, boxes: Box[], gm: number): boolean {
  if (s.vy >= 0) return false;
  const t = C.JUMP_BUFFER;
  const drop = -s.vy * t + 0.5 * C.GRAVITY * gm * C.FALL_GRAVITY_MULT * t * t + 0.02;
  return isFinite(groundBelow(boxes, s.x, s.y, s.z, C.PLAYER_RADIUS, drop));
}

function stepMantle(s: FullState, boxes: Box[], dt: number, ev: PEvents, p: PhysParams) {
  void ev;
  const r = C.PLAYER_RADIUS;
  s.mantleT -= dt;
  const prog = Math.min(1, 1 - s.mantleT / s.mantleDur);
  // rise (front-loaded), then roll forward onto the ledge
  const yp = easeOut(Math.min(1, prog / 0.6));
  const ny = s.mantleY0 + (s.mantleY1 - s.mantleY0) * yp;
  const hp = prog < 0.5 ? 0 : easeInOut((prog - 0.5) / 0.5);
  const nx = s.mantleSx + (s.mantleTx - s.mantleSx) * hp;
  const nz = s.mantleSz + (s.mantleTz - s.mantleSz) * hp;
  // vertical is pre-validated (clear column); horizontal goes through collision with step-up
  s.y = ny;
  const pos = { x: s.x, y: s.y, z: s.z };
  moveBody(pos, r, C.CROUCH_HEIGHT, nx - s.x, 0, nz - s.z, boxes, Math.max(0.05, s.mantleY1 - s.y + 0.01));
  s.x = pos.x; s.y = Math.max(pos.y, s.y); s.z = pos.z;
  s.vx = 0; s.vz = 0; s.vy = 0;
  s.crouched = !fits(boxes, s.x, s.y, s.z, r, C.PLAYER_HEIGHT);
  s.sprinting = false;
  if (s.mantleT <= 0) {
    s.mantleT = 0;
    const dx = s.mantleTx - s.mantleSx, dz = s.mantleTz - s.mantleSz;
    const l = Math.hypot(dx, dz) || 1;
    s.vx = (dx / l) * s.mantleExit; s.vz = (dz / l) * s.mantleExit;
    s.onGround = true; s.groundT = 0; s.groundY = s.y;
    s.airTime = 0; s.jumpsLeft = p.extraJumps;
    s.wallT = 0; s.wallNx = 0; s.wallNz = 0; s.lastWallNx = 0; s.lastWallNz = 0;
    s.mantleCd = 0.15;
    s.hopBlock = s.jumpHeldPrev;
    // a jump pressed during the climb fires right as you top out
    if (s.jumpBufT > 0) s.jumpBufT = Math.max(s.jumpBufT, dt * 2);
  }
}

/** Simple ground entity movement (enemies) with stepping. */
export function moveEntity(pos: { x: number; y: number; z: number }, r: number, h: number, dx: number, dz: number, boxes: Box[], flying: boolean, dy = 0) {
  if (flying) return moveBody(pos, r, h, dx, dy, dz, boxes, 0);
  const res = moveBody(pos, r, h, dx, -0.05, dz, boxes, 0.6);
  return res;
}
