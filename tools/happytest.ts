// THE HAPPY PLACE: load the room directly, pick a pedestal, check both endings of the memory.
//   corrupt path: memoryCorrupt → ambush (combat state, enemies from the street) → clear → doors open
//   calm path:    pick → doors open ~3s later, no enemies, no corruption
import { Run } from '../server/run';
import type { GameEvent, Pedestal, RoomDesc, ServerMsg } from '../shared/protocol';
import { generateRoom, planDoors, navBlockedAt } from '../shared/mapData';
import * as C from '../shared/constants';

let fails = 0;
const check = (ok: boolean, msg: string) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };

function scenario(name: string, desc: RoomDesc, runCount: number) {
  let peds: Pedestal[] | null = null;
  const ev: GameEvent[] = [];
  const host = {
    send(_: string, m: ServerMsg) { h(m); },
    broadcast(m: ServerMsg) { h(m); },
  };
  function h(m: ServerMsg) { if (m.t === 'priv') peds = m.p.pedestals; if (m.t === 'events') ev.push(...m.ev); }
  const run = new Run(host, { solo: true, difficulty: 'normal', seed: 'HAPPY_' + name });
  run.addPlayer('p', { t: 'hello', name: 'W', level: 20, runCount, unlocked: ['pulse', 'breacher', 'lance'], replica: null, difficulty: 'normal', solo: true });
  const p = run.players.get('p')!;
  p.mods.maxHp = 1e6; p.hp = 1e6;
  run.loadRoom(desc);
  const tick = (n: number) => { for (let i = 0; i < n; i++) run.tick(C.TICK_DT); };
  tick(10);
  console.log(`\n── ${name}: index ${desc.index} seed ${desc.seed} runCount ${runCount} → corrupt=${run.happy?.corrupt}`);
  check(run.state === 'reward', 'calm on entry (state reward)');
  check(run.enemies.size === 0, 'no enemies on entry');
  check(!!peds && (peds as Pedestal[]).length === 3, '3 pedestals offered');
  check(((peds ?? []) as Pedestal[]).every((x) => x.offer.rarity !== 'common'), 'pedestals are rare or better');
  check(p.shrine, "Wren's door heal available");
  // knock on her door
  const sh = run.geo.decor.find((d) => d.kind === 'shrine')!;
  p.hp = 10; p.x = sh.x - 0.5; p.z = sh.z;
  run.handle('p', { t: 'shrine' });
  check(p.hp === p.mods.maxHp, 'heal at the front door');
  // pick
  const first = (peds as Pedestal[] | null)?.[0];
  if (first) { p.x = first.x; p.z = first.z; run.handle('p', { t: 'pick', slot: first.slot }); }
  check(p.powerups.length === 1, 'picked a powerup');
  const corrupt = run.happy!.corrupt;
  tick(Math.round(C.TICK_RATE * 2));
  const mc = ev.find((e) => e.e === 'memoryCorrupt');
  if (corrupt) {
    check(!!mc, 'memoryCorrupt emitted shortly after the pick');
    check(run.state === 'combat', 'room flips to combat');
    tick(Math.round(C.TICK_RATE * 4));
    const n = run.enemies.size;
    check(n >= 4, `ambush spawned (${n} enemies: ${[...run.enemies.values()].map((e) => e.type).join(',')})`);
    const blocked = [...run.enemies.values()].filter((e) => run.pointInSolid(e.x, 1, e.z));
    check(!blocked.length, 'ambush not inside houses/trees ' + blocked.map((e) => `${e.type}@${e.x.toFixed(1)},${e.z.toFixed(1)}`).join(' '));
    check(!ev.some((e) => e.e === 'doorsOpen'), 'doors stay shut during the ambush');
    // kill everything (repeatedly, in case anything is still queued)
    for (let k = 0; k < 20 && (run.enemies.size || run.spawnQueue.length); k++) {
      for (const e of run.enemies.values()) run.damageEnemy(e, 1e9, 'p', false, 0, 0, 1, 'pulse');
      tick(10);
    }
    tick(Math.round(C.TICK_RATE * 3));
    check(ev.some((e) => e.e === 'roomClear'), 'room clear after the ambush');
    check(ev.some((e) => e.e === 'doorsOpen'), 'doors open after clearing');
  } else {
    check(!mc, 'no corruption');
    tick(Math.round(C.TICK_RATE * 2));
    check(ev.some((e) => e.e === 'doorsOpen'), 'doors open ~3s after the pick');
    check(run.enemies.size === 0 && run.spawnQueue.length === 0, 'still no enemies');
  }
  check(run.openDoors.size > 0, 'exits are open');
  return corrupt;
}

// find seeds for both paths (deterministic per room seed)
let seenCorrupt = false, seenCalm = false;
for (let seed = 7; seed < 60 && !(seenCorrupt && seenCalm); seed++) {
  const r = new Run({ send() {}, broadcast() {} }, { solo: true, difficulty: 'normal', seed: 'X' });
  r.addPlayer('p', { t: 'hello', name: 'W', level: 1, runCount: 5, unlocked: ['pulse'], replica: null, difficulty: 'normal', solo: true });
  r.loadRoom({ index: 9, biome: 1, kind: 'happy', door: 'memory', seed });
  const c = r.happy!.corrupt;
  if (c && !seenCorrupt) { seenCorrupt = true; scenario('corrupt', { index: 9, biome: 1, kind: 'happy', door: 'memory', seed }, 5); }
  if (!c && !seenCalm) { seenCalm = true; scenario('calm', { index: 9, biome: 1, kind: 'happy', door: 'memory', seed }, 5); }
}
check(seenCorrupt && seenCalm, 'both paths reachable');
// early runs, early rooms: it always holds
{
  const r = new Run({ send() {}, broadcast() {} }, { solo: true, difficulty: 'normal', seed: 'Y' });
  r.addPlayer('p', { t: 'hello', name: 'W', level: 1, runCount: 0, unlocked: ['pulse'], replica: null, difficulty: 'normal', solo: true });
  let any = false;
  for (let seed = 1; seed < 40; seed++) { r.loadRoom({ index: 4, biome: 0, kind: 'happy', door: 'memory', seed }); any ||= r.happy!.corrupt; }
  check(!any, 'never corrupts for new players in early rooms');
}
// geometry: no ceiling-height walls block the street, doors sit in hedge gaps, pedestals reachable
{
  const geo = generateRoom({ index: 9, biome: 1, kind: 'happy', door: 'memory', seed: 7 });
  check(!!geo.happy && geo.happy.houses.filter((h) => !h.backdrop).length >= 4, '4+ houses on the street');
  check(geo.pedestals.every((pp) => !navBlockedAt(geo.nav, pp.x, pp.z)), 'pedestals on walkable ground');
  check(geo.doors.filter((d) => !d.entry).every((d) => !navBlockedAt(geo.nav, d.x + d.nx * 2, d.z + d.nz * 2)), 'every exit is reachable');
  // BFS from the spawn: every exit + Wren's door + the mailbox reachable on the nav grid
  const nav = geo.nav, seen = new Uint8Array(nav.cols * nav.rows);
  const idx = (x: number, z: number) => Math.floor((z - nav.oz) / nav.cell) * nav.cols + Math.floor((x - nav.ox) / nav.cell);
  const q = [idx(0, geo.d / 2 - 3)]; seen[q[0]] = 1;
  for (let i = 0; i < q.length; i++) {
    const c = q[i], cc = c % nav.cols, rr = (c / nav.cols) | 0;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = cc + dc, nr = rr + dr;
      if (nc < 0 || nr < 0 || nc >= nav.cols || nr >= nav.rows) continue;
      const n = nr * nav.cols + nc;
      if (seen[n] || nav.blocked[n]) continue;
      seen[n] = 1; q.push(n);
    }
  }
  const reach = (x: number, z: number) => { for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (seen[idx(x + dx, z + dz)]) return true; return false; };
  check(geo.doors.filter((d) => !d.entry).every((d) => reach(d.x + d.nx * 1.5, d.z + d.nz * 1.5)), 'nav: all exits connected to the spawn');
  check(reach(geo.happy!.wrenDoor.x - 1, geo.happy!.wrenDoor.z), "nav: Wren's porch connected");
  check(geo.happy!.ambush.every((a) => reach(a.x, a.z)), 'nav: every ambush point connected');
}
// the door: rare, from room 3, never twice running, never right before a Warden
{
  let memory = 0, total = 0, bad = 0;
  for (let seed = 0; seed < 4000; seed++) for (const index of [1, 2, 3, 5, 6, 7, 8, 11, 12]) {
    const plans = planDoors({ index, biome: 0, kind: 'combat', door: 'standard', seed: seed * 31 + index });
    total += plans.length;
    for (const pl of plans) if (pl.kind === 'memory') { memory++; if (index + 1 < 3 || (index + 2) % 5 === 4) bad++; if (pl.nextKind !== 'happy') bad++; }
  }
  const fromHappy = planDoors({ index: 9, biome: 1, kind: 'happy', door: 'memory', seed: 5 }).some((p) => p.kind === 'memory');
  console.log(`\nmemory doors: ${memory}/${total} (${((memory / total) * 100).toFixed(1)}% of all doors)`);
  check(memory > 0 && bad === 0, 'memory door only where allowed');
  check(!fromHappy, 'never two happy places in a row');
}
console.log(fails ? `\n${fails} FAILED` : '\nALL OK');
process.exit(fails ? 1 : 0);
