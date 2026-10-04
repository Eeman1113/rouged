// Headless movement test: drives shared/physics.ts stepPlayer with scripted input and asserts feel targets.
// Run: npx tsx tools/movetest.ts
import { newPState, stepPlayer, PState, PInput, PhysParams, PEvents } from '../shared/physics';
import type { Box } from '../shared/mapData';
import * as C from '../shared/constants';

const DT = C.PHYSICS_DT;
const RUN = C.BASE_SPEED;
const SPRINT = RUN * C.SPRINT_MULT;
let fails = 0, passes = 0;
function check(name: string, ok: boolean, info = '') {
  if (ok) passes++; else fails++;
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
}
const f2 = (n: number) => n.toFixed(2);

function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Box {
  return { x0, y0, z0, x1, y1, z1, mat: 'crate' } as Box;
}
function params(o: Partial<PhysParams> = {}): PhysParams {
  return { speedMult: 1, jumpMult: 1, airControl: C.AIR_CONTROL, maxDash: 2, dashCooldown: C.DASH_COOLDOWN, extraJumps: 0, wallRunTime: 0, gravityMult: 1, ...o };
}
type In = Partial<PInput>;
const I = (o: In = {}): PInput => ({ fwd: 0, right: 0, jump: false, dash: false, crouch: false, yaw: 0, sprint: false, ...o });

class Sim {
  s: PState;
  t = 0;
  evs: PEvents[] = [];
  constructor(public boxes: Box[] = [], public p: PhysParams = params(), x = 0, y = 0, z = 0) { this.s = newPState(x, y, z, p.maxDash); }
  step(i: In): PEvents { const e = stepPlayer(this.s, I(i), this.p, this.boxes, DT); this.t += DT; this.evs.push(e); this.assertSane(); return e; }
  run(sec: number, i: In | ((t: number, s: PState) => In)): PEvents[] {
    const out: PEvents[] = [];
    const n = Math.round(sec / DT);
    for (let k = 0; k < n; k++) out.push(this.step(typeof i === 'function' ? i(k * DT, this.s) : i));
    return out;
  }
  get hs() { return Math.hypot(this.s.vx, this.s.vz); }
  insane = false;
  assertSane() {
    const s = this.s;
    if (![s.x, s.y, s.z, s.vx, s.vy, s.vz].every(Number.isFinite)) { this.insane = true; return; }
    const h = s.crouched || s.slideT > 0 ? C.CROUCH_HEIGHT : C.PLAYER_HEIGHT;
    for (const b of this.boxes) {
      const r = C.PLAYER_RADIUS - 0.01;
      if (s.x - r < b.x1 && s.x + r > b.x0 && s.y + 0.01 < b.y1 && s.y + h - 0.01 > b.y0 && s.z - r < b.z1 && s.z + r > b.z0) { this.insane = true; return; }
    }
  }
}

// ─── ground accel / friction ───
{
  const m = new Sim();
  m.run(0.1, { fwd: 1 });
  check('ground accel: full run speed within 100ms', Math.abs(m.hs - RUN) < 0.05, `${f2(m.hs)} m/s`);
  let n = 0; while (m.hs > 0.01 && n < 60) { m.step({}); n++; }
  check('ground decel: stop within ~120ms', n * DT <= 0.125, `${(n * DT * 1000).toFixed(0)}ms`);
  const m2 = new Sim(); m2.run(0.3, { fwd: 1 }); m2.run(0.2, { fwd: -1 });
  check('reverse direction quickly (<200ms)', m2.s.vz > RUN - 0.1, `vz ${f2(m2.s.vz)}`);
}

// ─── sprint ───
{
  const m = new Sim();
  const ev = m.run(0.4, { fwd: 1, sprint: true });
  check('sprint speed = 1.35x run', Math.abs(m.hs - SPRINT) < 0.05, `${f2(m.hs)} m/s`);
  check('sprintStart event fires once', ev.filter((e) => e.sprintStart).length === 1);
  m.run(0.2, { right: 1, sprint: true });
  check('pure strafe cancels sprint', !m.s.sprinting && Math.abs(m.hs - RUN) < 0.3, `${f2(m.hs)}`);
  const m2 = new Sim(); m2.run(0.4, { fwd: 1, right: 1, sprint: true });
  check('diagonal W+D sprint allowed', m2.s.sprinting === true && m2.hs > SPRINT - 0.1, `${f2(m2.hs)}`);
  const m3 = new Sim(); m3.run(0.4, { fwd: -1, sprint: true });
  check('backpedal never sprints', !m3.s.sprinting && m3.hs <= RUN + 0.01);
  const m4 = new Sim(); m4.run(0.4, { fwd: 1, sprint: true, crouch: true });
  check('crouch walk speed', Math.abs(m4.hs - RUN * C.CROUCH_MULT) < 0.1 && m4.s.crouched === true, `${f2(m4.hs)}`);
}

// ─── slide ───
{
  const m = new Sim();
  m.run(0.4, { fwd: 1, sprint: true });
  const e = m.step({ fwd: 1, sprint: true, crouch: true });
  const peak = m.hs;
  check('sprint slide starts with boost', e.slideStart === true && peak > SPRINT + 3, `peak ${f2(peak)} m/s`);
  const z0 = m.s.z; let t = 0;
  while (m.s.slideT > 0 && t < 3) { m.step({ fwd: 1, sprint: true, crouch: true }); t += DT; }
  check('slide lasts 0.6–0.95s', t > 0.6 && t < 0.95, `${f2(t)}s, ${f2(z0 - m.s.z)}m, exit ${f2(m.hs)} m/s`);
  check('slide exits into crouch when held', m.s.crouched === true);
  // slide-cancel-reslide spam is not boosted (cooldown)
  const sp = new Sim(); sp.run(0.4, { fwd: 1, sprint: true }); sp.step({ fwd: 1, sprint: true, crouch: true });
  sp.run(0.15, { fwd: 1, sprint: true, crouch: true }); sp.run(0.1, { fwd: 1, sprint: true });
  const before = sp.hs; const e2 = sp.step({ fwd: 1, sprint: true, crouch: true });
  check('slide cooldown blocks boost spam', e2.slideStart === true && sp.hs <= before + 0.01, `${f2(before)} → ${f2(sp.hs)}`);
  // slide cancel
  const c = new Sim(); c.run(0.4, { fwd: 1, sprint: true }); c.step({ fwd: 1, sprint: true, crouch: true });
  c.run(0.15, { fwd: 1, sprint: true, crouch: true }); c.step({ fwd: 1, sprint: true });
  check('releasing crouch cancels slide', c.s.slideT === 0 && !c.s.crouched);
  // slide jump keeps momentum
  const j = new Sim(); j.run(0.4, { fwd: 1, sprint: true }); j.step({ fwd: 1, sprint: true, crouch: true });
  j.run(0.15, { fwd: 1, sprint: true, crouch: true });
  const pre = j.hs; j.step({ fwd: 1, sprint: true, crouch: true, jump: true });
  check('slide-jump keeps momentum', j.s.vy > 5 && j.hs > pre - 0.3, `${f2(pre)} → ${f2(j.hs)} m/s`);
  const air = j.run(0.8, (tt, s) => ({ fwd: 1, sprint: true, crouch: true, jump: false }));
  check('landing with crouch held re-slides (slide hop)', air.some((x) => x.slideStart) && j.s.slideT > 0, `${f2(j.hs)} m/s`);
}

// ─── jumps ───
{
  const m = new Sim();
  let apex = 0;
  m.run(1.0, (t, s) => { apex = Math.max(apex, s.y); return { jump: t < 0.5 }; });
  check('full jump height ≈ 1.2m', Math.abs(apex - C.JUMP_HEIGHT) < 0.08, `${f2(apex)}m`);
  const m2 = new Sim(); let apex2 = 0;
  m2.run(1.0, (t, s) => { apex2 = Math.max(apex2, s.y); return { jump: t < 0.06 }; });
  check('tap jump is shorter (variable height)', apex2 < apex - 0.25 && apex2 > 0.45, `${f2(apex2)}m`);
  // coyote
  const plat = [box(-3, 0, -3, 3, 2, 3)];
  const run_off = (late: number) => {
    const c = new Sim(plat, params(), 0, 2, 2);
    let leftAt = -1, jumped = false;
    c.run(1.0, (t, s) => {
      if (leftAt < 0 && !s.onGround) leftAt = t;
      const press = leftAt >= 0 && t - leftAt >= late && t - leftAt < late + DT * 1.5;
      return { fwd: -1, jump: press };
    });
    jumped = c.evs.some((e) => e.jumped);
    return jumped;
  };
  check('coyote jump 66ms after leaving ledge', run_off(0.066));
  check('no coyote jump at 160ms', !run_off(0.16));
  // jump buffer
  const buf = (early: number) => {
    const b = new Sim(); b.s.y = 3; b.s.onGround = false;
    // fall time from 3m
    let landT = -1;
    const probe = new Sim(); probe.s.y = 3; probe.s.onGround = false;
    probe.run(2, (t, s) => { if (landT < 0 && s.onGround) landT = t; return {}; });
    let jumps = 0;
    b.run(1.2, (t) => ({ jump: t >= landT - early && t < landT - early + 0.05 }));
    jumps = b.evs.filter((e) => e.jumped).length;
    return jumps > 0;
  };
  check('jump buffered 100ms before landing', buf(0.1));
  check('no buffered jump 250ms before landing', !buf(0.25));
}

// ─── bunny hop ───
{
  const auto = new Sim(); auto.run(0.4, { fwd: 1 });
  auto.run(5, { fwd: 1, jump: true });
  check('auto-bhop keeps run speed (no friction loss)', auto.hs > RUN - 0.05, `${f2(auto.hs)} m/s, hops ${auto.evs.filter((e) => e.jumped).length}`);
  // timed hops: press shortly before each landing
  const tm = new Sim(); tm.run(0.4, { fwd: 1 });
  let held = 0;
  tm.run(8, (t, s) => {
    // press 50ms before predicted landing (when falling below 0.25m), hold until airborne
    if (!s.onGround && s.vy < 0 && s.y < 0.25 && held === 0) held = 0.12;
    if (s.onGround && held === 0) held = 0.05;
    const j = held > 0; held = Math.max(0, held - DT);
    return { fwd: 1, jump: j };
  });
  const bh = tm.evs.filter((e) => e.bhop).length;
  check('timed bhops gain speed', tm.hs > RUN * 1.3 && bh > 3, `${f2(tm.hs)} m/s after ${bh} timed hops`);
  check('bhop speed capped', tm.hs <= RUN * C.BHOP_CAP_MULT + 0.05);
  // air strafe turn: holding D and turning keeps speed
  const as = new Sim(); as.run(0.4, { fwd: 1, sprint: true }); as.step({ fwd: 1, sprint: true, jump: true });
  const h0 = as.hs; let yaw = 0;
  as.run(0.5, () => { yaw -= 2.5 * DT; return { right: 1, yaw, jump: true }; });
  check('air strafing keeps momentum', as.hs > h0 - 0.3, `${f2(h0)} → ${f2(as.hs)}`);
}

// ─── mantle ───
{
  const crate = [box(-1, 0, -4.5, 1, 1.2, -3)];
  const m = new Sim(crate, params(), 0, 0, 0);
  let mantled = false;
  let done = -1;
  m.run(1.2, (t, s) => { if (done < 0 && m.evs.some((e) => e.mantled) && !s.mantleT) done = t; return { fwd: done < 0 ? 1 : 0, jump: s.z < -1.9 && t < 0.6 }; });
  mantled = m.evs.some((e) => e.mantled);
  check('mantle onto 1.2m crate', mantled && Math.abs(m.s.y - 1.2) < 0.02, `y ${f2(m.s.y)} z ${f2(m.s.z)}`);
  const mt = new Sim(crate, params(), 0, 0, 0);
  let tStart = -1, tEnd = -1;
  mt.run(1.0, (t, s) => { if (s.mantleT && s.mantleT > 0 && tStart < 0) tStart = t; if (tStart >= 0 && tEnd < 0 && !s.mantleT) tEnd = t; return { fwd: tEnd < 0 ? 1 : 0, jump: s.z < -1.9 }; });
  check('mantle is quick (<300ms)', tEnd - tStart > 0.1 && tEnd - tStart < 0.3, `${((tEnd - tStart) * 1000).toFixed(0)}ms`);
  check('no auto-hop right after mantle while jump held', mt.s.onGround && Math.abs(mt.s.y - 1.2) < 0.02, `y ${f2(mt.s.y)}`);
  const wall = [box(-1, 0, -4.5, 1, 2.6, -3)];
  const w = new Sim(wall, params(), 0, 0, 0);
  w.run(1.5, { fwd: 1, jump: true });
  check('no mantle onto a 2.6m wall', !w.evs.some((e) => e.mantled) && w.s.y < 1.3);
  // falling past a ledge while pushing into it catches it
  const ledge = [box(-1, 0, -3, 1, 3, -1.5)];
  const f = new Sim(ledge, params(), 0, 2.5, -1.0); f.s.onGround = false; f.s.groundY = 2.5;
  let fd = -1;
  f.run(1, (t, s) => { if (fd < 0 && f.evs.some((e) => e.mantled) && !s.mantleT) fd = t; return { fwd: fd < 0 ? 1 : 0 }; });
  check('catch a ledge while falling + pushing forward', f.evs.some((e) => e.mantled) && Math.abs(f.s.y - 3) < 0.02, `y ${f2(f.s.y)}`);
}

// ─── dash ───
{
  const m = new Sim(); m.step({ jump: true }); m.run(0.15, { jump: true });
  const y0 = m.s.y, z0 = m.s.z;
  m.step({ dash: true, fwd: 1, jump: true });
  let k = 0; while ((m.s.dashT > 0) && k < 30) { m.step({ fwd: 1, jump: true }); k++; }
  const dist = z0 - m.s.z;
  check('air dash distance 3–4.5m', dist > 3 && dist < 4.5, `${f2(dist)}m in ${((k + 1) * DT * 1000).toFixed(0)}ms`);
  check('air dash holds altitude', Math.abs(m.s.y - y0) < 0.15, `Δy ${f2(m.s.y - y0)}`);
  check('dash exits with sprint-ish momentum', Math.abs(m.hs - SPRINT * C.DASH_EXIT_MULT) < 0.5, `${f2(m.hs)} m/s`);
  // dash-jump
  const dj = new Sim(); dj.run(0.2, { fwd: 1 }); dj.step({ fwd: 1, dash: true }); dj.run(0.05, { fwd: 1 });
  dj.step({ fwd: 1, jump: true });
  check('dash-jump carries momentum', dj.hs > SPRINT + 2 && dj.s.vy > 5, `${f2(dj.hs)} m/s`);
  // no tunneling through a thin wall
  const thin = [box(-3, 0, -2.1, 3, 3, -2.0)];
  const t = new Sim(thin);
  t.run(0.6, (tt) => ({ fwd: 1, dash: tt < DT }));
  check('dash does not tunnel thin wall', t.s.z > -2.0 && !t.insane, `z ${f2(t.s.z)}`);
  // dash charges regen
  const r = new Sim(); r.step({ dash: true }); r.run(0.3, {}); r.step({ dash: true }); r.run(0.3, {}); const e3 = r.step({ dash: true });
  check('dash charges consumed (2 max)', !e3.dashed && r.s.dashCharges < 1);
  r.run(C.DASH_COOLDOWN, {});
  check('dash charge regenerates', r.s.dashCharges >= 1);
}

// ─── edges / corners / stairs ───
{
  // diagonal into a box corner should slide around, not snag
  const pillar = [box(-0.5, 0, -3, 0.5, 3, -2)];
  const m = new Sim(pillar, params(), 0.8, 0, 0);
  m.run(1.0, { fwd: 1 });
  check('graze pillar corner without snagging', m.s.z < -3.5 && !m.insane, `z ${f2(m.s.z)} x ${f2(m.s.x)}`);
  // stairs: 0.3m steps, onGround stays true going up and down
  const stairs: Box[] = [];
  for (let i = 0; i < 6; i++) stairs.push(box(-2, 0, -2 - i * 0.6 - 0.6, 2, 0.3 * (i + 1), -2 - i * 0.6));
  stairs.push(box(-2, 0, -12, 2, 1.8, -5.6));
  const s = new Sim(stairs);
  let air = 0;
  s.run(1.2, (t, st) => { if (!st.onGround) air++; return { fwd: 1 }; });
  check('walk up stairs stays grounded', air === 0 && s.s.y > 1.7, `y ${f2(s.s.y)} airborne steps ${air}`);
  let air2 = 0, lands = 0;
  s.run(1.2, (t, st) => { if (!st.onGround) air2++; return { fwd: -1 }; });
  lands = s.evs.filter((e) => e.landed).length;
  check('walk down stairs stays grounded (ground snap)', air2 === 0 && s.s.y < 0.05 && lands === 0, `y ${f2(s.s.y)} airborne ${air2}`);
  // inside corner: pushing diagonally into a corner doesn't jitter or penetrate
  const corner = [box(-5, 0, -5, 5, 3, -4), box(-5, 0, -5, -4, 3, 5)];
  const c = new Sim(corner, params(), 0, 0, 0);
  c.run(1.5, { fwd: 1, right: -1, sprint: true });
  const px = c.s.x, pz = c.s.z;
  c.run(0.3, { fwd: 1, right: -1, sprint: true });
  check('inside corner: stable, no penetration', !c.insane && Math.hypot(c.s.x - px, c.s.z - pz) < 0.01, `(${f2(c.s.x)}, ${f2(c.s.z)})`);
  // pushing straight into a segmented wall (seams, door frame) never drifts sideways
  const seg = [box(-6, 0, -4, -1.0, 4, -3), box(-1.0, 0, -4, 1.0, 3, -3.2), box(1.0, 0, -4, 6, 4, -3), box(-1.0, 3, -4, 1.0, 4, -3)];
  for (const x0 of [-1.3, -1.0, -0.62, -0.5, 0, 0.55, 0.62, 1.0, 1.35]) {
    const sw = new Sim(seg, params(), x0, 0, 0);
    sw.run(1.5, { fwd: 1, sprint: true });
    if (Math.abs(sw.s.x - x0) > 0.13 || sw.insane) { check(`segmented wall push from x=${x0}`, false, `x ${f2(sw.s.x)}`); }
  }
  check('segmented wall: no sideways drift', true);
  // crouch under a low ceiling then release: stays crouched until clear
  const low = [box(-2, 1.3, -6, 2, 2, -2)];
  const l = new Sim(low); l.run(0.9, { fwd: 1, crouch: true }); l.run(0.1, { fwd: 0 });
  const under = l.s.z < -2.5;
  l.step({});
  check('cannot stand up under low ceiling', under && l.s.crouched === true && !l.insane, `z ${f2(l.s.z)}`);
}

// ─── double jump / wall run ───
{
  const d = new Sim([], params({ extraJumps: 1 }));
  let apex = 0;
  d.run(1.2, (t, s) => { apex = Math.max(apex, s.y); return { jump: t < 0.3 || (t > 0.35 && t < 0.6) }; });
  check('double jump reaches higher', apex > 1.8, `${f2(apex)}m`);
  const near = new Sim([], params({ extraJumps: 1 })); near.s.y = 0.15; near.s.vy = -6; near.s.onGround = false;
  near.step({ jump: true });
  check('press right before landing buffers (keeps double jump)', near.s.jumpsLeft === 1 || near.s.vy < 0);
  const wallB = [box(-1.0, 0, -30, -0.6, 6, 30)];
  const w = new Sim(wallB, params({ wallRunTime: 1.4 }), 0, 0, 0);
  w.run(0.3, { fwd: 1, sprint: true });
  const evs = w.run(0.6, (t) => ({ fwd: 1, right: -0.5, sprint: true, jump: t < 0.1 }));
  const wr = evs.filter((e) => e.wallrun).length;
  check('wall run engages along a wall', wr > 10 && w.s.y > 0.5, `${wr} steps, y ${f2(w.s.y)}`);
  const wj = w.step({ fwd: 1, right: -0.5, sprint: true, jump: true });
  check('wall jump kicks off the wall', !!wj.wallJump && w.s.vx > 5, `vx ${f2(w.s.vx)}`);
}

// ─── fuzz: random inputs in a cluttered room never penetrate / NaN ───
{
  let seed = 1234;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const boxes: Box[] = [box(-20, 0, -20, 20, 8, -19), box(-20, 0, 19, 20, 8, 20), box(-20, 0, -20, -19, 8, 20), box(19, 0, -20, 20, 8, 20)];
  for (let i = 0; i < 40; i++) {
    const x = (rnd() - 0.5) * 34, z = (rnd() - 0.5) * 34, w = 0.3 + rnd() * 3, d = 0.3 + rnd() * 3, h = [0.3, 0.6, 1.0, 1.2, 1.5, 2.5, 4][Math.floor(rnd() * 7)];
    if (Math.hypot(x, z) < 3) continue;
    boxes.push(box(x - w / 2, 0, z - d / 2, x + w / 2, h, z + d / 2));
  }
  boxes.push(box(-4, 1.3, -10, 4, 1.6, -6)); // low beam
  const m = new Sim(boxes, params({ extraJumps: 1, wallRunTime: 1.2, maxDash: 3, dashCooldown: 0.5 }));
  let cur: In = {}; let bad = 0; let maxSpeed = 0; let stuck = 0; let lastX = 0, lastZ = 0;
  for (let k = 0; k < 60 * 120; k++) {
    if (k % 20 === 0) cur = { fwd: Math.round(rnd() * 2 - 0.7), right: Math.round(rnd() * 2 - 1), jump: rnd() < 0.35, crouch: rnd() < 0.2, sprint: rnd() < 0.6, yaw: rnd() * Math.PI * 2 };
    m.step({ ...cur, dash: rnd() < 0.01 });
    if (m.insane) { bad++; m.insane = false; }
    maxSpeed = Math.max(maxSpeed, m.hs);
    if (k % 600 === 599) { if (Math.hypot(m.s.x - lastX, m.s.z - lastZ) < 0.01) stuck++; lastX = m.s.x; lastZ = m.s.z; }
  }
  check('fuzz 120s: no penetration / NaN', bad === 0, `${bad} bad steps, max speed ${f2(maxSpeed)}, pos (${f2(m.s.x)}, ${f2(m.s.y)}, ${f2(m.s.z)})`);
  check('fuzz: never permanently stuck', stuck < 3, `${stuck} 10s windows without movement`);
  check('fuzz: inside arena', Math.abs(m.s.x) < 19 && Math.abs(m.s.z) < 19 && m.s.y >= 0 && m.s.y < 8);
}

console.log(`\n${passes} passed, ${fails} failed`);
if (fails) process.exit(1);
