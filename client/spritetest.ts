// Dev page: renders every procedural sprite scaled up. Open /spritetest.html in the vite dev server.
import * as S from './render/sprites';

const root = document.getElementById('root') as HTMLDivElement;
const stats = document.getElementById('stats') as HTMLDivElement;

function scaled(c: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const o = document.createElement('canvas');
  o.width = c.width * k;
  o.height = c.height * k;
  const ctx = o.getContext('2d');
  if (ctx) { ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, o.width, o.height); }
  return o;
}
function section(title: string): HTMLDivElement {
  const h = document.createElement('h2'); h.textContent = title; root.appendChild(h);
  const row = document.createElement('div'); row.className = 'row'; root.appendChild(row);
  return row;
}
function add(row: HTMLDivElement, c: HTMLCanvasElement, label: string, k = 4): void {
  const d = document.createElement('div'); d.className = 'cell';
  d.appendChild(scaled(c, k));
  const s = document.createElement('span'); s.textContent = label; d.appendChild(s);
  row.appendChild(d);
}

const t0 = performance.now();
const types: S.EnemyType[] = ['drone', 'grunt', 'brute', 'stalker', 'spider', 'replica', 'leech', 'sentinel', 'bomber', 'mortar', 'bulwark', 'wraith', 'warden'];
const sets: [string, S.EnemySpriteSet][] = [];
for (const t of types) {
  const vs = t === 'warden' ? [0, 1, 2, 3, 4, 5, 6] : [0, 1];
  for (const v of vs) sets.push([`${t}${v ? ':' + v : ''}`, S.getEnemySprites(t, v)]);
}
const weapons: S.WeaponId[] = ['pulse', 'breacher', 'lance', 'ripper'];
const ws = weapons.map((w) => S.getWeaponSprites(w));
const faceStates: S.FaceState[] = ['healthy', 'hurt', 'damaged', 'critical', 'grin', 'dead', 'ouch', 'look_left', 'look_right'];
for (const f of faceStates) S.getFace(f, 0, 0);
S.getGibSprites(); S.getBloodSprites(); S.getExplosionFrames();
for (let b = 0; b < 7; b++) for (let v = 0; v < 4; v++) S.getWallTexture(b as S.Biome, v);
const t1 = performance.now();
stats.textContent = `generation (enemies+weapons+faces+fx+walls): ${(t1 - t0).toFixed(1)} ms`;

for (const [name, s] of sets) {
  const k = s.w > 64 ? 2 : 4;
  const row = section(`${name}  ${s.w}x${s.h}  worldH ${s.worldH}`);
  s.idle.forEach((c, i) => add(row, c, `idle${i}`, k));
  s.move.forEach((c, i) => add(row, c, `move${i}`, k));
  s.attack.forEach((c, i) => add(row, c, `atk${i}`, k));
  add(row, s.pain, 'pain', k);
  s.stagger.forEach((c, i) => add(row, c, `stag${i}`, k));
  s.charge.forEach((c, i) => add(row, c, `chg${i}`, k));
  add(row, s.dead, 'dead', k);
}
weapons.forEach((w, i) => {
  const row = section(`weapon ${w}`);
  add(row, ws[i].idle, 'idle', 2);
  ws[i].fire.forEach((c, j) => add(row, c, `fire${j}`, 2));
  ws[i].extra.forEach((c, j) => add(row, c, `extra${j}`, 2));
});
for (const age of [0, 0.5, 1]) {
  const row = section(`faces age ${age}`);
  for (const f of faceStates) for (let fr = 0; fr < 4; fr++) if (fr === 0 || f === 'healthy' || f === 'damaged' || f === 'critical') add(row, S.getFace(f, age, fr), `${f}${fr}`, 3);
}
{
  const row = section('fx');
  S.getGibSprites().forEach((c, i) => add(row, c, `gib${i}`));
  S.getBloodSprites().forEach((c, i) => add(row, c, `bl${i}`));
  for (let i = 0; i < 4; i++) add(row, S.getBloodDecal(i), `decal${i}`, 3);
  add(row, S.getScorchDecal(), 'scorch', 3);
  add(row, S.getSparkSprite(), 'spark', 6);
  add(row, S.getMuzzleSprite(), 'muzzle');
  for (const k of ['bolt', 'plasma', 'orb', 'rocket', 'spit', 'replica', 'shell', 'hex'] as const) add(row, S.getProjectileSprite(k), k);
  S.getExplosionFrames().forEach((c, i) => add(row, c, `exp${i}`, 3));
  add(row, S.getMineSprite(false), 'mine'); add(row, S.getMineSprite(true), 'armed');
  for (const k of ['hp', 'armor', 'ammo'] as const) add(row, S.getPickupSprite(k), k);
}
{
  const row = section('pedestal icons');
  for (const c of ['weapon', 'movement', 'passive', 'onkill', 'curse', 'legendary'] as const)
    for (const r of ['common', 'rare', 'epic', 'legendary'] as const) add(row, S.getPedestalIcon(c, r), `${c[0]}${r[0]}`, 3);
}
for (let b = 0; b < 7; b++) {
  const row = section(`biome ${b} textures`);
  for (let v = 0; v < 4; v++) add(row, S.getWallTexture(b as S.Biome, v), `wall${v}`, 3);
  add(row, S.getFloorTexture(b as S.Biome), 'floor', 3);
  add(row, S.getCeilingTexture(b as S.Biome), 'ceil', 3);
  add(row, S.getCrateTexture(b as S.Biome), 'crate', 3);
  // tiling check
  const tile = document.createElement('canvas'); tile.width = 128; tile.height = 64;
  const tc = tile.getContext('2d');
  if (tc) { const w = S.getWallTexture(b as S.Biome, 0); tc.drawImage(w, 0, 0); tc.drawImage(w, 64, 0); }
  add(row, tile, 'tile x2', 2);
}
{
  const row = section('hub / doors / props');
  add(row, S.getHubTexture('wall'), 'hubwall', 3);
  add(row, S.getHubTexture('floor'), 'hubfloor', 3);
  for (const n of [3, 17, 63]) add(row, S.getHubTexture('tally', n), `tally${n}`, 3);
  for (const k of ['standard', 'elite', 'unknown', 'corrupted', 'extract', 'shop', 'sanctuary', 'trial'] as const) { add(row, S.getDoorTexture(k, false), k, 2); }
  add(row, S.getDoorTexture('standard', true), 'open', 2);
  for (let f = 0; f < 4; f++) add(row, S.getTerminalTexture(f), `term${f}`, 3);
  for (let f = 0; f < 4; f++) add(row, S.getMirrorTexture(f), `mirror${f}`, 3);
  for (let v = 0; v < 4; v++) add(row, S.getBodySprite(v), `body${v}`, 3);
  add(row, S.getVendorSprite(0), 'broker0', 3); add(row, S.getVendorSprite(1), 'broker1', 3);
  add(row, S.getShrineSprite(), 'shrine', 3); add(row, S.getShieldSprite(), 'shield', 3); add(row, S.getScrapSprite(), 'scrap', 4);
  for (let v = 0; v < 6; v++) add(row, S.getFoliageSprite(v), `foliage${v}`, 3);
}
