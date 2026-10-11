// Progression gate: you have to beat every sector's Warden to reach THE HANDLER and the true ending.
// Tries every skip path we know of against the real sim and asserts it's blocked, then checks a
// legit descent (solo and co-op) still reaches the ending.
//   npx tsx tools/progresstest.ts
import { Run } from '../server/run';
import type { GameEvent, RoomDesc, RunSummary, ServerMsg, DoorKind, RoomKind } from '../shared/protocol';
import { planDoors, isBossIndex, biomeOf } from '../shared/mapData';
import * as C from '../shared/constants';

let fails = 0;
const check = (ok: boolean, msg: string) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };

interface Harness { run: Run; ev: GameEvent[]; summary: RunSummary[] | null }

function make(seed: string, solo: boolean, ids: string[]): Harness {
  const h: Harness = { run: null as unknown as Run, ev: [], summary: null };
  const on = (m: ServerMsg) => { if (m.t === 'events') for (const e of m.ev) { h.ev.push(e); if (e.e === 'runEnd') h.summary = e.summary; } };
  h.run = new Run({ send: (_id, m) => on(m), broadcast: on }, { solo, difficulty: 'normal', seed });
  for (const id of ids) join(h, id);
  if (!solo) h.run.handle(ids[0], { t: 'begin' });
  return h;
}

function join(h: Harness, id: string) {
  h.run.addPlayer(id, { t: 'hello', name: id.toUpperCase(), level: 30, runCount: 12, unlocked: ['pulse', 'breacher', 'lance', 'ripper'], replica: null, difficulty: 'normal', solo: h.run.solo });
}

/** god mode for whoever's alive (dead co-op players stay dead) */
function god(run: Run) { for (const p of run.players.values()) if (p.alive) { p.hp = p.mods.maxHp; p.invuln = 99; } }

function tick(h: Harness, n = 1) { for (let i = 0; i < n; i++) { god(h.run); h.run.tick(C.TICK_DT); } }

/** shoot everything in the room (as `by`) */
function shootAll(run: Run, by: string) {
  for (const e of [...run.enemies.values()]) if (e.alive && e.spawnT <= 0) run.damageEnemy(e, 4000, by, true, 0, 1, 0, 'pulse');
}

/** stand at a door and ask to use it (every alive player votes for it) */
function useDoor(run: Run, slot: number) {
  const d = run.geo.doors.find((x) => x.slot === slot);
  if (!d) return;
  for (const p of run.alivePlayers()) { p.x = d.x - d.nx * 1.5; p.z = d.z - d.nz * 1.5; run.handle(p.id, { t: 'door', slot }); }
}

/** play the run forward (legitimately) until room `target` has loaded; `pick` chooses the exit */
function advanceTo(h: Harness, target: number, pick: (k: DoorKind) => boolean = (k) => k !== 'extract', limit = 30 * 60 * 30): boolean {
  const run = h.run;
  const by = run.order[0];
  for (let i = 0; i < limit && !run.ended; i++) {
    if (run.room.index >= target && run.transitionT < 0) return run.room.index === target;
    if (run.enemies.size) shootAll(run, by);
    if (run.openDoors.size && run.transitionT < 0) {
      const doors = run.geo.doors.filter((d) => run.openDoors.has(d.slot) && pick(d.kind));
      const d = doors.find((x) => x.kind === 'standard') ?? doors[0];
      if (d && i % 10 === 0) useDoor(run, d.slot);
    }
    tick(h);
  }
  return run.room.index === target;
}

/** kill the current room's Warden for real and wait until the room clears */
function killWarden(h: Harness, by = h.run.order[0], silent = false) {
  for (let i = 0; i < 30 * 60 && !h.run.cleared; i++) {
    if (silent) { for (const e of h.run.enemies.values()) if (e.alive && e.spawnT <= 0) h.run.damageEnemy(e, 4000, by, false, 0, 1, 0, 'pulse', true); }
    else shootAll(h.run, by);
    tick(h);
  }
}

const doorsOf = (run: Run) => run.geo.doors.filter((d) => !d.entry);
const evCount = (h: Harness, e: GameEvent['e']) => h.ev.filter((x) => x.e === e).length;

// ───────────────────────────── 1. door planning / index arithmetic ─────────────────────────────
console.log('\n── door planning: no door ever routes around a Warden');
{
  let bad = 0, total = 0;
  const kinds: RoomKind[] = ['combat', 'arena', 'gauntlet', 'anomaly', 'shop', 'sanctuary', 'trial', 'happy', 'boss'];
  for (let index = 0; index < 80; index++) for (const kind of kinds) for (let seed = 1; seed <= 60; seed++) {
    if (kind === 'boss' && !isBossIndex(index)) continue;
    const desc: RoomDesc = { index, biome: biomeOf(index), kind, door: 'standard', seed: seed * 7919 + index };
    const plans = planDoors(desc);
    total++;
    if (isBossIndex(index + 1) && !(plans.length === 1 && plans[0].nextKind === 'boss')) bad++;
    if (plans.some((p) => p.kind === 'extract') && !(kind === 'boss' && index + 1 >= C.EXTRACT_FROM)) bad++;
  }
  check(bad === 0, `every room before a Warden has exactly one door, into the Warden (${total} rooms planned, ${bad} bad)`);
}

// ───────────────────────────── 2. legit solo descent ─────────────────────────────
console.log('\n── legit solo descent');
const legit = make('PROG_A', true, ['p1']);
{
  const { run } = legit;
  check(advanceTo(legit, C.FINAL_ROOM - 1), `reached THE HANDLER's room (index ${run.room.index}, kind ${run.room.kind})`);
  check(run.room.kind === 'boss' && run.room.biome === 6, 'room 35 is THE HANDLER');
  check(run.wardensDown.size === C.BIOMES - 1, `six sector Wardens down before it (${[...run.wardensDown].join(',')})`);
  killWarden(legit);
  const te = legit.ev.find((e) => e.e === 'trueEnding') as Extract<GameEvent, { e: 'trueEnding' }> | undefined;
  check(!!te && run.trueEnding, 'true ending fires when THE HANDLER dies');
  check(!!te?.ids?.includes('p1'), 'and it is addressed to the player');
  tick(legit, 30 * 23);
  const ex = doorsOf(run).find((d) => d.kind === 'extract')!;
  check(!!ex && run.openDoors.has(ex.slot), 'after the ending: EXTRACT is open');
  useDoor(run, ex.slot); tick(legit, 30);
  const s = legit.summary?.[0];
  check(!!s && s.trueEnding && s.extracted && s.bosses === 7, `summary: trueEnding ${s?.trueEnding}, extracted ${s?.extracted}, wardens ${s?.bosses}`);
}

// ───────────────────────────── 3. boss room exits before the Warden is dead ─────────────────────────────
console.log('\n── boss room: nobody leaves before the Warden is dead');
{
  const h = make('PROG_B', true, ['p1']);
  const { run } = h;
  advanceTo(h, 4);
  check(run.room.kind === 'boss', 'room 5 is a Warden');
  const boss = run.boss!;
  // door spam at every door, through intro + fight
  for (let i = 0; i < 30 * 8; i++) { for (const d of run.geo.doors) useDoor(run, d.slot); tick(h); }
  check(run.room.index === 4 && run.openDoors.size === 0, 'door spam during the fight does nothing');
  // force a transition the way a malicious/buggy vote would
  for (const d of doorsOf(run)) { run.beginTransition(d.slot); tick(h, 25); }
  check(run.room.index === 4 && boss.alive, 'beginTransition() on a sealed boss door is refused');
  // a door countdown carried in from somewhere can't fire it either
  run.doorCountdown = 0.01; for (const p of run.players.values()) p.doorVote = doorsOf(run)[0].slot; tick(h, 30);
  check(run.room.index === 4, 'a stray door countdown is refused');
  // boss despawn (dropped from the enemy list while alive): the room must NOT clear
  run.enemies.delete(boss.id); tick(h, 30 * 5);
  check(!run.cleared && run.openDoors.size === 0 && run.enemies.has(boss.id), 'a Warden that vanishes without dying is put back, doors stay shut');
  // phase transition: hammer it into a transition and try to leave mid set-piece
  for (let i = 0; i < 30 * 20 && boss.phase < 2; i++) { shootAll(run, 'p1'); tick(h); }
  for (const d of doorsOf(run)) useDoor(run, d.slot);
  tick(h, 10);
  check(run.room.index === 4, `mid phase transition (phase ${boss.phase}): still locked in`);
  // finish state: hp is 1 and it's kneeling. Still not dead.
  for (let i = 0; i < 30 * 30 && (boss as unknown as { bs: string }).bs !== 'finish'; i++) { shootAll(run, 'p1'); tick(h); }
  for (const d of doorsOf(run)) useDoor(run, d.slot);
  tick(h, 3);
  check(boss.alive && run.room.index === 4 && !run.cleared, 'kneeling (finisher) Warden: still locked in');
  killWarden(h);
  check(run.cleared && !boss.alive && run.wardensDown.has(0), 'Warden dead: room clears, ledger has THE SMELTER');
  tick(h, 60);
  check(run.openDoors.size > 0, 'and only now the doors open');
}

// ───────────────────────────── 4. extraction is an early exit, not the ending ─────────────────────────────
console.log('\n── extraction at depth 15');
{
  const h = make('PROG_C', true, ['p1']);
  const { run } = h;
  advanceTo(h, 14);
  for (let i = 0; i < 30 * 6; i++) { shootAll(run, 'p1'); tick(h); if (run.cleared) break; }
  const ex = doorsOf(run).find((d) => d.kind === 'extract')!;
  check(!!ex, 'THE CORE Warden offers EXTRACT');
  if (!run.cleared) { useDoor(run, ex.slot); tick(h, 20); check(!run.ended, 'EXTRACT is sealed while the Warden lives'); }
  killWarden(h); tick(h, 60);
  useDoor(run, ex.slot); tick(h, 30);
  const s = h.summary?.[0];
  check(!!s && s.extracted && !s.trueEnding, `extracted after 3 Wardens: extracted ${s?.extracted}, trueEnding ${s?.trueEnding}`);
  check(evCount(h, 'trueEnding') === 0, 'no true-ending event');
}

// ───────────────────────────── 5. co-op drop-in ─────────────────────────────
console.log('\n── co-op drop-in (the reported bug: a late joiner rode the run into THE HANDLER)');
{
  const h = make('PROG_D', false, ['a']);
  const { run } = h;
  tick(h, 5);
  check(run.acceptsDropIn(), 'drop-in open in room 1');
  advanceTo(h, 2);
  check(run.acceptsDropIn(), 'drop-in open before the first Warden');
  join(h, 'early');
  advanceTo(h, 4);
  check(!run.acceptsDropIn(), 'drop-in closed during the first Warden fight');
  join(h, 'midfight'); // a misbehaving host lets someone in anyway
  killWarden(h, 'a');
  check(!run.acceptsDropIn(), 'drop-in closed once a Warden is down');
  const pa = run.players.get('a')!, pe = run.players.get('early')!, pm = run.players.get('midfight')!;
  check(pa.bosses === 1 && pe.bosses === 1 && pm.bosses === 0, `Warden credit only for those present when it began (a ${pa.bosses}, early ${pe.bosses}, midfight ${pm.bosses})`);
  advanceTo(h, 30);
  join(h, 'late'); // joins at depth 31: missed six Wardens
  check(advanceTo(h, C.FINAL_ROOM - 1), 'the run reaches THE HANDLER');
  // 'early' is dead during the finale: still part of the team that beat every Warden
  const early = run.players.get('early')!; early.alive = false; early.hp = 0;
  killWarden(h, 'a');
  const te = h.ev.find((e) => e.e === 'trueEnding') as Extract<GameEvent, { e: 'trueEnding' }> | undefined;
  check(!!te, 'true ending fires for the run');
  check(!!te?.ids?.includes('a') && !!te?.ids?.includes('early'), 'addressed to the players who were there for every Warden (even if dead right now)');
  check(!te?.ids?.includes('late') && !te?.ids?.includes('midfight'), 'NOT to drop-ins who skipped Wardens');
  advanceTo(h, C.FINAL_ROOM + 1);
  join(h, 'endless'); // drops into the Endless after the ending
  run.endRun();
  const by = (id: string) => h.summary?.find((s) => s.id === id);
  check(!!by('a')?.trueEnding && !!by('early')?.trueEnding, 'summary: trueEnding for the full-descent players');
  check(!by('late')?.trueEnding && !by('midfight')?.trueEnding && !by('endless')?.trueEnding, 'summary: no trueEnding for late / mid-fight / Endless joiners');
}

// ───────────────────────────── 6. co-op: someone leaves mid boss fight ─────────────────────────────
console.log('\n── co-op: a player disconnects during a Warden');
{
  const h = make('PROG_E', false, ['a', 'b']);
  const { run } = h;
  advanceTo(h, 4);
  tick(h, 30 * 3);
  run.removePlayer('b');
  tick(h, 30 * 3);
  check(run.room.index === 4 && !run.cleared && run.openDoors.size === 0 && !!run.boss?.alive, 'host leaving mid-fight opens nothing');
  // the last player dies: run ends as a death, not a clear
  const a = run.players.get('a')!;
  a.invuln = 0; a.armor = 0; run.damagePlayer(a, 1e9, a.x, 1, a.z, false, null);
  for (let i = 0; i < 30 * 5 && !run.ended; i++) run.tick(C.TICK_DT);
  const s = h.summary?.[0];
  check(!!s && !s.victory && !s.trueEnding && run.wardensDown.size === 0, 'wipe during a Warden: death, no credit');
}

// ───────────────────────────── 7. boss killed by a hazard (burn / dash trail) still counts ─────────────────────────────
console.log('\n── Warden killed by a hazard');
{
  const h = make('PROG_F', true, ['p1']);
  advanceTo(h, 4);
  killWarden(h, 'p1', true);
  check(h.run.cleared && h.run.wardensDown.has(0) && h.run.players.get('p1')!.bosses === 1, 'silent hazard kill: room clears, Warden credited');
}

// ───────────────────────────── 8. a run that starts mid-descent (seeded/saved start) ─────────────────────────────
console.log('\n── a run loaded straight into the depths');
{
  const h = make('PROG_G', true, ['p1']);
  const { run } = h;
  tick(h, 5);
  run.loadRoom({ index: C.FINAL_ROOM - 2, biome: 6, kind: 'combat', door: 'standard', seed: 4242 });
  for (let i = 0; i < 30 * 60 && !run.cleared; i++) { shootAll(run, 'p1'); tick(h); }
  tick(h, 60);
  check(run.cleared && run.openDoors.size === 0, "room 34 cleared without the six Wardens: the door to THE HANDLER stays shut (and isn't offered)");
  const d = doorsOf(run)[0];
  run.openDoors.add(d.slot); // even if the client thinks it's open
  useDoor(run, d.slot); run.beginTransition(d.slot); tick(h, 30);
  check(run.room.index === C.FINAL_ROOM - 2, 'and walking through it anyway is refused');
  // the Handler fight itself, loaded directly: no ending without the other six
  run.loadRoom({ index: C.FINAL_ROOM - 1, biome: 6, kind: 'boss', door: 'standard', seed: 4243 });
  killWarden(h);
  check(evCount(h, 'trueEnding') === 0 && !run.trueEnding, 'killing THE HANDLER without the other six Wardens is not the true ending');
}

// ───────────────────────────── 9. Endless wraparound ─────────────────────────────
console.log('\n── the Endless: THE HANDLER again at depth 70');
{
  const h = make('PROG_H', true, ['p1']);
  tick(h, 5);
  h.run.loadRoom({ index: 69, biome: biomeOf(69), kind: 'boss', door: 'standard', seed: 6969 });
  check(biomeOf(69) === 6, 'depth 70 is THE MIRROR again');
  killWarden(h);
  check(evCount(h, 'trueEnding') === 0 && h.run.wardensDown.size === 0, 'an Endless Handler is not the true ending and fills no descent ledger');
}
check(evCount(legit, 'trueEnding') === 1, 'legit run: exactly one true ending');

console.log(fails ? `\n${fails} FAILED` : '\nALL OK');
process.exit(fails ? 1 : 0);
