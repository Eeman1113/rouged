// The false awakening + door 35: sigil persistence and save migration, the wake text, and the rule
// that walking out early never grants the true ending (checked against the real sim).
//   npx tsx tools/waketest.ts
import { Run } from '../server/run';
import type { DoorKind, GameEvent, RunSummary, ServerMsg } from '../shared/protocol';
import * as C from '../shared/constants';
import { applyRun, defaultMeta, deriveSigils, migrateMeta, runSigils, type Meta } from '../client/meta';
import { HandlerVoice } from '../client/audio/handler';
import {
  WAKE_CORRIDOR, doorPrompt, doorReadout, eyeTeaseDue, plainLine, wakeLines, wakeReadout, wakeTier,
} from '../client/story/awakening';

let fails = 0;
const check = (ok: boolean, msg: string) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

// ───────────────────────────── 1. save migration ─────────────────────────────
console.log('\n── save migration (saves from before door 35)');
{
  const fresh = migrateMeta({});
  check(same(fresh.sigils, []) && fresh.falseWakes === 0 && fresh.eyeSeen === false, 'empty save: no sigils, no wakes, eye unseen');
  const old = { v: 1, name: 'OLD', runCount: 20, deepest: 15, extractions: 2, settings: { sensitivity: 0.7, sensPreset: 'custom' } } as unknown as Partial<Meta>;
  const m = migrateMeta(old);
  check(same(m.sigils, [0, 1, 2]), `extracted at 15 before: first three lit (${m.sigils})`);
  check(m.name === 'OLD' && m.runCount === 20 && m.settings.sensitivity === 0.7 && m.settings.fov === defaultMeta().settings.fov, 'other fields and settings survive, new settings defaulted');
  check(same(migrateMeta({ deepest: 23 } as Partial<Meta>).sigils, [0, 1, 2, 3]), 'died at depth 23: the four Wardens before it');
  check(same(migrateMeta({ deepest: 15 } as Partial<Meta>).sigils, [0, 1]), 'died at depth 15 (in the Core Warden room): two');
  check(same(migrateMeta({ deepest: 5, extractions: 0 } as Partial<Meta>).sigils, []), 'died at the first Warden: none');
  check(same(migrateMeta({ deepest: 36, trueEndingSeen: true } as Partial<Meta>).sigils, [0, 1, 2, 3, 4, 5, 6]), 'true ending seen: all seven');
  check(same(migrateMeta({ sigils: [1, 1, 9, -1, 2.5, 'x'] } as unknown as Partial<Meta>).sigils, [1]), 'stored sigils are cleaned (dupes, junk, out of range)');
  check(same(migrateMeta({ sigils: [] , deepest: 30 } as Partial<Meta>).sigils, []), 'an explicit empty list is kept (no re-derivation)');
  check(same(migrateMeta({ sigils: [0], trueEndingSeen: true } as Partial<Meta>).sigils, [0, 1, 2, 3, 4, 5, 6]), 'true ending always means all seven');
  const round = migrateMeta(JSON.parse(JSON.stringify(m)));
  check(same(round.sigils, m.sigils) && round.falseWakes === m.falseWakes, 'round trip through JSON keeps sigils');
  check(same(deriveSigils({}), []), 'derive: nothing known, nothing lit');
}

// ───────────────────────────── 2. applyRun lights sigils ─────────────────────────────
console.log('\n── applyRun: sigils persist across runs');
const sum = (o: Partial<RunSummary>): RunSummary => ({
  id: 'local', name: 'T', kills: 10, headshots: 0, glories: 0, rooms: 10, bosses: 0, score: 100, peakCombo: 1, bestStreak: 1, timeSec: 60,
  died: true, victory: false, anomalies: 0, favoriteWeapon: 'pulse', powerups: [], synergies: [], xp: 50,
  profile: { favoriteWeapon: 'pulse', dashRate: 1, strafeBias: 0, aggression: 0.5, headshotRate: 0, avgRange: 10 } as unknown as RunSummary['profile'],
  depth: 1, extracted: false, trueEnding: false, scrap: 0, ...o,
});
{
  const m = defaultMeta();
  let r = applyRun(m, sum({ depth: 15, extracted: true, victory: true, died: false, bosses: 3, wardens: [0, 1, 2] }));
  check(same(m.sigils, [0, 1, 2]) && same(r.freshSigils, [0, 1, 2]), `extraction at 15: three lit, three fresh (${m.sigils})`);
  check(!m.trueEndingSeen && m.extractions === 1, 'extraction is not the true ending');
  r = applyRun(m, sum({ depth: 22, bosses: 4, wardens: [0, 1, 2, 3] }));
  check(same(m.sigils, [0, 1, 2, 3]) && same(r.freshSigils, [3]), `a death at 22: one more (${r.freshSigils})`);
  r = applyRun(m, sum({ depth: 9, wardens: [0] }));
  check(same(m.sigils, [0, 1, 2, 3]) && r.freshSigils.length === 0, 'a shallow run never unlights anything');
  check(same(runSigils(sum({ depth: 20, extracted: true })), [0, 1, 2, 3]), 'old server (no ledger), extracted at 20: four');
  check(same(runSigils(sum({ depth: 15 })), [0, 1]), 'old server, died at 15: two');
  check(same(runSigils(sum({ depth: 40, trueEnding: true, extracted: true })), [0, 1, 2, 3, 4, 5, 6]), 'true ending summary: seven');
}

// ───────────────────────────── 3. the wake text ─────────────────────────────
console.log('\n── the false awakening: tiers, lines, readout');
{
  check(wakeTier(15) === 'shallow' && wakeTier(20) === 'shallow' && wakeTier(25) === 'deep' && wakeTier(30) === 'nervous' && wakeTier(40) === 'nervous', 'tiers: 15/20 smug, 25 uneasy, 30+ nervous');
  const ro = wakeReadout({ wardens: 6, depth: 30, first: false, trueEndingSeen: false });
  check(ro[1] === '> SAMPLE INCOMPLETE. 6 OF 7 WARDENS.' && ro.includes('> THE UPLOAD WAS NEVER SCHEDULED.'), `readout at 30: "${ro[1]}"`);
  check(ro.includes('> RETENTION RISK: HIGH.') && ro.includes('> DEPTH 35 IS STILL SEALED.'), 'deep readout warns, door still sealed');
  const r15 = wakeReadout({ wardens: 3, depth: 15, first: true, trueEndingSeen: false });
  check(r15[1].includes('3 OF 7') && r15.some((l) => l.includes('35 ROOMS. 7 WARDENS. THE HANDLER')) && !r15.some((l) => l.includes('RETENTION')), 'first wake at 15 spells out the full sample');
  check(wakeReadout({ wardens: 4, depth: 20, first: false, trueEndingSeen: true }).some((l) => l.includes('IS OPEN')), 'after the true ending the readout says the door is open');
  const w = wakeLines(15, 3, () => 0);
  check(w.welcome === 'Welcome back.' && w.line === 'Good. Rest.', `smug at 15: "${w.welcome} ${w.line}"`);
  const n = wakeLines(30, 3, () => 0);
  check(n.line === "You were close. Don't do that again." && n.voiceRun >= 26, 'nervous at 30, voiced in a breaking phase');
  check(wakeLines(30, 45, () => 0).welcome.includes('line they gave me'), 'after the reveal the Handler stops pretending');
  check(!eyeTeaseDue(25, false) && eyeTeaseDue(30, false) && !eyeTeaseDue(30, true, () => 0.5) && eyeTeaseDue(30, true, () => 0.01) && !eyeTeaseDue(15, false), 'eye: first extraction past 25, then rarely, never shallow');
  check(doorPrompt(3, false) === 'DEPTH 35 · SEALED · 3/7' && doorPrompt(7, true) === 'DEPTH 35 · OPEN', 'door prompt');
  const dr = doorReadout([0, 2], false);
  check(dr.some((l) => l.startsWith('[X] THE SMELTER')) && dr.some((l) => l.startsWith('[ ] THE CURATOR')) && dr.some((l) => l.startsWith('[ ] THE HANDLER')), 'door readout lists each Warden');
  // no em dashes in any new text
  const all: string[] = [
    ...WAKE_CORRIDOR.map((l) => l.text), ...dr, ...doorReadout([0, 1, 2, 3, 4, 5, 6], true), doorPrompt(1, false),
    ...[15, 25, 30].flatMap((d) => [0, 0.4, 0.8].flatMap((x) => { const l = wakeLines(d, 5, () => x); return [l.welcome, l.line]; })),
    ...[15, 25, 30].flatMap((d) => { const l = wakeLines(d, 45); return [l.welcome, l.line]; }),
    ...[15, 25, 30].flatMap((d) => [true, false].flatMap((f) => wakeReadout({ wardens: 3, depth: d, first: f, trueEndingSeen: !f }))),
  ];
  check(all.every((t) => !t.includes('—') && !t.includes('–')), `no em or en dashes in ${all.length} new lines`);
  check(all.every((t) => plainLine(t).length < 90), 'every line is short');
  // every depth an early extraction can happen at, plus the deepest room before THE HANDLER
  for (const [d, n, tier] of [[15, 3, 'shallow'], [20, 4, 'shallow'], [25, 5, 'deep'], [30, 6, 'nervous'], [34, 6, 'nervous']] as const) {
    const r = wakeReadout({ wardens: n, depth: d, first: false, trueEndingSeen: false });
    const risk = r.find((l) => l.includes('RETENTION'));
    check(wakeTier(d) === tier && r[1] === `> SAMPLE INCOMPLETE. ${n} OF 7 WARDENS.` && (tier === 'shallow' ? !risk : tier === 'deep' ? risk === '> RETENTION RISK: MODERATE.' : risk === '> RETENTION RISK: HIGH.'), `depth ${d}: ${tier}, ${n} of 7, ${risk ?? 'no retention line'}`);
  }
  check(same(runSigils(sum({ depth: 34 })), [0, 1, 2, 3, 4, 5]) && same(runSigils(sum({ depth: 25, extracted: true })), [0, 1, 2, 3, 4]), 'old server: died at 34 six, extracted at 25 five');
}

console.log('\n── the false awakening lines stay readable (no per-letter corruption), the glitch stays elsewhere');
{
  let subs: string[] = [];
  const v = new HandlerVoice((t) => subs.push(t), () => {});
  v.setEnabled(false);
  const lines = ['Welcome back.', "You were close. Don't do that again.", 'That was close. [g] Stay up here. With me.', "There's nothing at thirty-five. [pause] Nothing you need to see."];
  for (let i = 0; i < 300; i++) for (const l of lines) { v.cancel(); v.say(l, { runCount: 30, priority: 9, readable: true }); }
  const bad = subs.filter((t) => /█/.test(t.replace('That was close. █ Stay', '')));
  check(subs.length === 1200 && bad.length === 0, `readable: 1200 phase-4 subtitles, ${bad.length} with corrupted letters`);
  check(subs.includes('That was close. █ Stay up here. With me.'), 'the intentional [g] blackout is kept');
  subs = [];
  for (let i = 0; i < 300; i++) { v.cancel(); v.say("You were close. Don't do that again.", { runCount: 30, priority: 9 }); }
  check(subs.some((t) => t.includes('█')), 'other phase-4 lines still corrupt letters');
  v.cancel();
}

// ───────────────────────────── 4. the sim: extraction never grants the true ending ─────────────────────────────
console.log('\n── the sim: walking out early is never the true ending');
interface Harness { run: Run; ev: GameEvent[]; summary: RunSummary[] | null }
function make(seed: string): Harness {
  const h: Harness = { run: null as unknown as Run, ev: [], summary: null };
  const on = (m: ServerMsg) => { if (m.t === 'events') for (const e of m.ev) { h.ev.push(e); if (e.e === 'runEnd') h.summary = e.summary; } };
  h.run = new Run({ send: (_id, m) => on(m), broadcast: on }, { solo: true, difficulty: 'normal', seed });
  h.run.addPlayer('p1', { t: 'hello', name: 'P1', level: 30, runCount: 12, unlocked: ['pulse', 'breacher', 'lance', 'ripper'], replica: null, difficulty: 'normal', solo: true });
  return h;
}
function tick(h: Harness, n = 1) { for (let i = 0; i < n; i++) { for (const p of h.run.players.values()) if (p.alive) { p.hp = p.mods.maxHp; p.invuln = 99; } h.run.tick(C.TICK_DT); } }
function useDoor(run: Run, slot: number) {
  const d = run.geo.doors.find((x) => x.slot === slot);
  if (!d) return;
  for (const p of run.alivePlayers()) { p.x = d.x - d.nx * 1.5; p.z = d.z - d.nz * 1.5; run.handle(p.id, { t: 'door', slot }); }
}
/** play forward legitimately until `stop` says so; `pick` chooses the exit kind */
function play(h: Harness, stop: () => boolean, pick: (k: DoorKind) => boolean, limit = 30 * 60 * 40) {
  const run = h.run;
  for (let i = 0; i < limit && !run.ended && !stop(); i++) {
    for (const e of [...run.enemies.values()]) if (e.alive && e.spawnT <= 0) run.damageEnemy(e, 4000, 'p1', true, 0, 1, 0, 'pulse');
    if (run.openDoors.size && run.transitionT < 0 && i % 10 === 0) {
      const doors = run.geo.doors.filter((d) => run.openDoors.has(d.slot) && pick(d.kind));
      const d = doors.find((x) => x.kind === 'extract') ?? doors.find((x) => x.kind === 'standard') ?? doors[0];
      if (d) useDoor(run, d.slot);
    }
    tick(h);
  }
}
for (const depth of [15, 20, 25, 30]) {
  const h = make('WAKE_' + depth);
  // go deeper until the Warden at index depth-1 is down, then take the extract door
  play(h, () => false, (k) => (k === 'extract' ? h.run.room.index >= depth - 1 : true));
  const s = h.summary?.[0];
  check(!!s && s.extracted && s.depth === depth, `extracted at depth ${s?.depth} (wanted ${depth})`);
  check(!!s && !s.trueEnding && !h.ev.some((e) => e.e === 'trueEnding'), `  no true ending, no trueEnding event`);
  check(!!s && same(s.wardens ?? [], Array.from({ length: depth / 5 }, (_, i) => i)), `  ledger: ${s?.wardens?.length} of 7 Wardens (${s?.wardens})`);
  const m = defaultMeta();
  const r = applyRun(m, s!);
  check(!m.trueEndingSeen && m.sigils.length === depth / 5 && r.freshSigils.length === depth / 5, `  meta: trueEndingSeen ${m.trueEndingSeen}, ${m.sigils.length} sigils lit`);
  check(wakeReadout({ wardens: runSigils(s!).length, depth: s!.depth, first: true, trueEndingSeen: m.trueEndingSeen })[1] === `> SAMPLE INCOMPLETE. ${depth / 5} OF 7 WARDENS.`, '  the readout uses the run\'s real count');
}
{
  // co-op: a second subject drops in after the first Warden. Each client counts from its own summary.
  const h: Harness = { run: null as unknown as Run, ev: [], summary: null };
  const on = (m: ServerMsg) => { if (m.t === 'events') for (const e of m.ev) { h.ev.push(e); if (e.e === 'runEnd') h.summary = e.summary; } };
  h.run = new Run({ send: (_id, m) => on(m), broadcast: on }, { solo: false, difficulty: 'normal', seed: 'WAKE_COOP' });
  const hello = (name: string) => ({ t: 'hello' as const, name, level: 30, runCount: 12, unlocked: ['pulse', 'breacher', 'lance', 'ripper'] as const, replica: null, difficulty: 'normal' as const, solo: false });
  h.run.addPlayer('p1', hello('P1') as never);
  h.run.start();
  play(h, () => h.run.room.index >= 6, () => true);
  h.run.addPlayer('p2', hello('P2') as never);
  play(h, () => false, (k) => (k === 'extract' ? h.run.room.index >= 19 : true));
  const s1 = h.summary?.find((x) => x.id === 'p1'), s2 = h.summary?.find((x) => x.id === 'p2');
  check(!!s1 && !!s2 && s1.extracted && s1.depth === 20, `co-op extracted at ${s1?.depth}`);
  check(!!s1 && same(runSigils(s1), [0, 1, 2, 3]) && !!s2 && same(runSigils(s2), [1, 2, 3]), `co-op ledgers: host ${s1 && runSigils(s1)}, late joiner ${s2 && runSigils(s2)}`);
  const m2 = defaultMeta(); applyRun(m2, s2!);
  check(same(m2.sigils, [1, 2, 3]) && wakeReadout({ wardens: runSigils(s2!).length, depth: s2!.depth, first: true, trueEndingSeen: false })[1].includes('3 OF 7'), 'late joiner: own sigils, own readout (3 of 7)');
}
{
  // the only way: every Warden, then THE HANDLER, then the way out
  const h = make('WAKE_FULL');
  play(h, () => false, (k) => (k === 'extract' ? h.run.trueEnding : true), 30 * 60 * 60);
  const s = h.summary?.[0];
  check(!!s && s.trueEnding && s.extracted && same(s.wardens ?? [], [0, 1, 2, 3, 4, 5, 6]), `full descent: trueEnding ${s?.trueEnding}, wardens ${s?.wardens}`);
  const m = defaultMeta();
  applyRun(m, s!);
  check(m.trueEndingSeen && m.sigils.length === 7, 'meta: true ending seen, door 35 fully lit');
}

console.log(fails ? `\n${fails} FAILED` : '\nALL OK');
process.exit(fails ? 1 : 0);
