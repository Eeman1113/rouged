// Headless smoke test: a bot plays a full run against the real sim.
import { Run } from '../server/run';
import type { ServerMsg, Snapshot, Pedestal } from '../shared/protocol';
import * as C from '../shared/constants';

let snap = null as Snapshot | null;
let peds = null as Pedestal[] | null;
let ended = false;
const counts: Record<string, number> = {};
const host = {
  send(_id: string, m: ServerMsg) { handle(m); },
  broadcast(m: ServerMsg) { handle(m); },
  ended() { ended = true; },
};
function handle(m: ServerMsg) {
  if (m.t === 'snap') snap = m.s;
  if (m.t === 'priv') peds = m.p.pedestals;
  if (m.t === 'events') for (const e of m.ev) {
    counts[e.e] = (counts[e.e] ?? 0) + 1;
    if (e.e === 'roomLoad') console.log(`room ${e.room.index} ${e.room.kind} biome ${e.room.biome} door ${e.room.door} ${e.room.mutator ?? ''}`);
    if (e.e === 'trueEnding' || e.e === 'extractOffer' || e.e === 'trial' || e.e === 'shop') console.log('EVENT', e.e);
    if (e.e === 'runEnd') console.log('END', JSON.stringify(e.summary[0]).slice(0, 300));
    if (e.e === 'synergy') console.log('SYNERGY', e.synergy);
  }
}

const run = new Run(host, { solo: true, difficulty: (process.argv[2] as 'normal') ?? 'normal', seed: 'ABCD_22' });
run.addPlayer('p1', { t: 'hello', name: 'BOT', level: 30, runCount: 12, unlocked: ['pulse', 'breacher', 'lance', 'ripper'], replica: null, difficulty: 'normal', solo: true });
const p = run.players.get('p1')!;
p.mods.maxHp = 100000; p.hp = 100000; // god mode bot
let seq = 0, t = 0;
const t0 = Date.now();
const maxRoom = Number(process.argv[3] ?? 45);
for (let i = 0; i < 30 * 60 * 600 && !ended && (!run.room || run.room.index < maxRoom); i++) {
  t += C.TICK_DT;
  const s = snap as Snapshot | null;
  if (s) {
    const me = s.players[0];
    let tx = me.x, tz = me.z;
    const alive = s.enemies.filter((e) => e.anim !== 'dead');
    if (alive.length) {
      const e = alive[0];
      tx = e.x * 0.8; tz = e.z * 0.8;
      if (i % 6 === 0) {
        const dx = e.x - me.x, dy = e.y + 1 - (me.y + 1.6), dz = e.z - me.z;
        run.handle('p1', { t: 'shot', weapon: 'pulse', ox: me.x, oy: me.y + 1.6, oz: me.z, dx, dy, dz, hits: [{ id: e.id, head: Math.random() < 0.3, n: 1 }] });
      }
      if (i % 10 === 0) run.handle('p1', { t: 'glory', enemy: e.id });
    } else if (peds && peds.length) {
      tx = peds[0].x; tz = peds[0].z;
      if (Math.hypot(me.x - tx, me.z - tz) < 2) run.handle('p1', { t: 'pick', slot: 0 });
    } else {
      const door = s.doors.find((d) => d.open && d.kind !== 'extract');
      if (door) {
        tx = door.x - door.nx * 1.2; tz = door.z - door.nz * 1.2;
        if (Math.hypot(me.x - tx, me.z - tz) < 1.5) run.handle('p1', { t: 'door', slot: door.slot });
      }
    }
    // teleport-walk toward target (validation clamps big jumps)
    const dx = tx - me.x, dz = tz - me.z, l = Math.hypot(dx, dz);
    const step = Math.min(l, 0.5);
    run.handle('p1', { t: 'input', seq: ++seq, x: me.x + (l ? dx / l * step : 0), y: 0, z: me.z + (l ? dz / l * step : 0), vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, weapon: 'pulse', firing: true, dashing: false, sliding: false });
  }
  p.invuln = 99; run.tick(C.TICK_DT);
}
console.log('ticks', Math.round(t * 30), 'sim time', t.toFixed(0) + 's', 'wall', Date.now() - t0 + 'ms');
console.log(counts);
console.log('room', run.room.index, run.room.kind, run.geo.w, run.geo.d, 'state', run.state, 'enemies', [...run.enemies.values()].map((e) => `${e.type}@${e.x.toFixed(1)},${e.y.toFixed(1)},${e.z.toFixed(1)} hp${e.hp.toFixed(0)} spawnT${e.spawnT.toFixed(2)}`), 'queue', run.spawnQueue.length, 'player', p.x.toFixed(1), p.z.toFixed(1), 'wave', run.wave, run.waves.length);
