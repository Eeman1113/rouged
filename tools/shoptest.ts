// Exercise the Broker + Sanctuary + Extract paths directly.
import { Run } from '../server/run';
import type { ServerMsg, ShopItem } from '../shared/protocol';
import * as C from '../shared/constants';
let shop = null as ShopItem[] | null; const ev: string[] = [];
const host = { send(_: string, m: ServerMsg) { h(m); }, broadcast(m: ServerMsg) { h(m); } };
function h(m: ServerMsg) { if (m.t === 'priv') shop = m.p.shop; if (m.t === 'events') for (const e of m.ev) ev.push(e.e === 'buy' ? 'buy:' + e.item.kind : e.e); }
const run = new Run(host, { solo: true, difficulty: 'normal', seed: 'SHOP_01' });
run.addPlayer('p', { t: 'hello', name: 'B', level: 10, runCount: 5, unlocked: ['pulse'], replica: null, difficulty: 'normal', solo: true });
const p = run.players.get('p')!;
run.loadRoom({ index: 6, biome: 1, kind: 'shop', door: 'shop', seed: 123 });
for (let i = 0; i < 20; i++) run.tick(C.TICK_DT);
p.scrap = 500;
for (const it of shop ?? []) { p.x = it.x; p.z = it.z; run.handle('p', { t: 'buy', slot: it.slot }); }
console.log('scrap left', p.scrap, 'powerups', p.powerups.map((x) => x.id + ':' + x.rarity).join(','));
run.loadRoom({ index: 7, biome: 1, kind: 'sanctuary', door: 'sanctuary', seed: 9 });
p.hp = 10; const sh = run.geo.decor.find((d) => d.kind === 'shrine')!; p.x = sh.x; p.z = sh.z + 1;
run.handle('p', { t: 'shrine' }); console.log('hp after shrine', p.hp);
run.loadRoom({ index: 14, biome: 2, kind: 'boss', door: 'standard', seed: 77 });
for (let i = 0; i < 80; i++) run.tick(C.TICK_DT);
for (const e of run.enemies.values()) run.damageEnemy(e, 1e9, 'p', false, 0, 0, 1, 'pulse');
for (let i = 0; i < 80; i++) run.tick(C.TICK_DT);
const ex = run.geo.doors.find((d) => d.kind === 'extract')!;
p.x = ex.x - ex.nx * 1.5; p.z = ex.z - ex.nz * 1.5; run.handle('p', { t: 'door', slot: ex.slot });
for (let i = 0; i < 30; i++) run.tick(C.TICK_DT);
console.log([...new Set(ev)].join(' '));
