// Boss fight harness: loads each Warden room and fights it with a scripted player
// (huge HP, circle-strafing, "normal" DPS that grows with depth like a real build would).
// Asserts: no exceptions, every move used, phases 2+3 trigger, fight ends in 45–150 s.
//   npx tsx tools/bosstest.ts [difficulty] [players] [onlyBiome]
import { Run } from '../server/run';
import type { ServerMsg, GameEvent, Difficulty } from '../shared/protocol';
import * as C from '../shared/constants';
import type { Boss } from '../server/boss/base';

const diff = (process.argv[2] as Difficulty) ?? 'normal';
const players = Number(process.argv[3] ?? 1);
const only = process.argv[4] !== undefined ? Number(process.argv[4]) : -1;
const ROOMS = [4, 9, 14, 19, 24, 29, 34];
let failures = 0;
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

for (let biome = 0; biome < 7; biome++) {
  if (only >= 0 && biome !== only) continue;
  const index = ROOMS[biome];
  const events: GameEvent[] = [];
  const host = {
    send(_id: string, m: ServerMsg) { if (m.t === 'events') events.push(...m.ev); },
    broadcast(m: ServerMsg) { if (m.t === 'events') events.push(...m.ev); },
  };
  const run = new Run(host, { solo: players === 1, difficulty: diff, seed: 'BOSS_' + biome });
  for (let i = 0; i < players; i++) {
    run.addPlayer('p' + i, { t: 'hello', name: 'BOT' + i, level: 30, runCount: 12, unlocked: ['pulse', 'breacher', 'lance', 'ripper'], replica: null, difficulty: diff, solo: players === 1 });
  }
  if (run.state === 'lobby') run.start();
  run.loadRoom({ index, biome: biome as 0, kind: 'boss', door: 'standard', seed: 1234 + biome });
  for (const p of run.players.values()) { p.mods.maxHp = 1e7; p.hp = 1e7; p.invuln = 0; }
  const boss = run.boss as Boss;
  const dps = 100 * (1 + 0.045 * index) * players * 0.85;
  const moves = new Set<string>(), declared = boss.moves.map((m) => m.id);
  const phases: number[] = [];
  let breaks = 0, transitions = 0, dmgTaken = 0, hitsTaken = 0, killed = false, glory = false, err: unknown = null;
  let t = 0, ang = 0;
  const hpStart = boss.maxHp;
  const say: string[] = [];
  try {
    for (let i = 0; i < 30 * 400 && !killed; i++) {
      t += C.TICK_DT;
      let k = 0;
      for (const p of run.players.values()) {
        // circle-strafe at ~13 m, occasionally changing direction
        ang += (k % 2 ? -1 : 1) * C.TICK_DT * 0.45 * (Math.sin(t * 0.21) > -0.6 ? 1 : -1);
        const a = ang + k * 2.1;
        const r = 12 + Math.sin(t * 0.37 + k) * 4;
        const tx = boss.x + Math.cos(a) * r, tz = boss.z + Math.sin(a) * r;
        const hw = run.geo.w / 2 - 1.5, hd = run.geo.d / 2 - 1.5;
        p.x += (Math.max(-hw, Math.min(hw, tx)) - p.x) * 0.15; p.z += (Math.max(-hd, Math.min(hd, tz)) - p.z) * 0.15;
        p.vx = 0; p.vz = 0; p.y = 0;
        k++;
      }
      // shoot: adds first while the boss is shielded, otherwise mostly the boss
      if (i % 3 === 0) {
        const adds = [...run.enemies.values()].filter((e) => e !== boss && e.alive && e.spawnT <= 0);
        const shielded = boss.linkedShield > 0;
        const target = adds.length && (shielded || rnd() < 0.3) ? adds[0] : boss;
        const head = target === boss ? rnd() < (boss.coreV > 0.5 ? 0.35 : 0.12) : rnd() < 0.2;
        if (target.alive && boss.bs !== 'finish') run.damageEnemy(target, (dps * 0.1) / (head ? C.HEADSHOT_MULT : 1) * (head ? C.HEADSHOT_MULT : 1), 'p0', head, 0, 0, -1, 'pulse');
      }
      if (boss.bs === 'finish' && boss.stageT > 1.2 && biome % 2 === 0 && !glory) { run.handle('p0', { t: 'glory', enemy: boss.id }); }
      run.tick(C.TICK_DT);
      for (const e of events) {
        if (e.e === "bossMove") { moves.add(e.move); if (process.env.V) console.log("  ", t.toFixed(1), "p" + e.phase, e.move); }
        if (e.e === 'bossPhase') phases.push(e.phase);
        if (e.e === 'bossBreak' && e.on) breaks++;
        if (e.e === 'bossTransition') transitions++;
        if (e.e === 'playerHit') { dmgTaken += e.dmg; hitsTaken++; }
        if (e.e === 'glory' && e.enemy === boss.id) glory = true;
        if (e.e === 'bossSay' && say.length < 6) say.push(e.text);
        if (e.e === 'kill' && e.type === 'warden') killed = true;
      }
      events.length = 0;
      if (!boss.alive) killed = true;
    }
  } catch (e) { err = e; }
  const missing = declared.filter((m) => !moves.has(m));
  const ok = !err && killed && missing.length === 0 && phases.includes(2) && phases.includes(3) && t >= 45 && t <= 150;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'} biome ${biome} ${boss.name.padEnd(13)} room ${index} hp ${hpStart} dps ${dps.toFixed(0)}  time ${t.toFixed(1)}s  phases@${boss.phaseTimes.map((x) => x.toFixed(0)).join('/')}s  breaks ${breaks}  moves ${moves.size}/${declared.length}${missing.length ? ' MISSING ' + missing.join(',') : ''}  taken ${Math.round(dmgTaken)} (${hitsTaken} hits, ${(dmgTaken / Math.max(1, t)).toFixed(1)}/s)${glory ? ' GLORY' : ''}${err ? ' ERROR ' + String((err as Error).stack ?? err) : ''}${killed ? '' : ' NOT KILLED'}`);
  if (say.length) console.log('   says:', say.join(' | '));
}
console.log(failures ? `${failures} FAILED` : 'ALL PASS');
process.exit(failures ? 1 : 0);
