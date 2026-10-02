// Procedural DOOM-style pixel sprites — every enemy is drawn in code on a
// canvas, upscaled with nearest-neighbor. No image assets.
import * as THREE from 'three';

type Palette = Record<string, string>;

function makeTexture(rows: string[], pal: Palette): THREE.CanvasTexture {
  const h = rows.length;
  const w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = pal[ch] || '#f0f';
      g.fillRect(x, y, 1, 1);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function spriteMat(rows: string[], pal: Palette): THREE.SpriteMaterial {
  return new THREE.SpriteMaterial({ map: makeTexture(rows, pal), transparent: true, alphaTest: 0.1 });
}

// ── palettes ──
const metal = '#5a544a', dark = '#2a2723', red = '#ff2020', orange = '#ff8020',
  bone = '#e8e0d0', green = '#4dff6a', steel = '#7a766c', black = '#0a0a0a';

// ── DRONE: small hovering eye ──
const DRONE = [
  '....mmmm....',
  '..mmDDDDmm..',
  '.mDDDDDDDDm.',
  'mDDRRRRRRDDm',
  'mDRRrrrrRRDm',
  'mDRRrRRrRRDm',
  'mDDRRRRRRDDm',
  '.mDDDDDDDDm.',
  '..mmDkkDmm..',
  '....kkkk....',
];
const DRONE_PAL: Palette = { m: metal, D: dark, R: red, r: '#801010', k: black };

// ── GRUNT: humanoid soldier with rifle ──
const GRUNT = [
  '....HHHH....',
  '...HEEEEH...',
  '...HRRRRH...',
  '....HHHH....',
  '..TTTTTTTT..',
  '.TTTTTTTTTT.',
  '.TTTOOOOTTT.',
  'RTTTOOOOTTTR',
  'RTTTTTTTTTTR',
  '.TTTTTTTTTT.',
  '..TTTTTTTT..',
  '..TTT..TTT..',
  '..LLL..LLL..',
  '..LLL..LLL..',
  '..LLL..LLL..',
  '..LL....LL..',
  '.LLL....LLL.',
  '.LLL....LLL.',
];
const GRUNT_PAL: Palette = { H: steel, E: dark, R: red, T: metal, O: orange, L: dark };

// ── BRUTE: huge armored tank ──
const BRUTE = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HRRRRRRH....',
  '....HHHHHHHH....',
  '..AAAAAAAAAAAA..',
  '.AAAAAAAAAAAAAA.',
  'AAAOOOOOOOOOOAAA',
  'AAAOORRRRRROOAAA',
  'AAAOORRRRRROOAAA',
  'AAAOOOOOOOOOOAAA',
  '.AAAAAAAAAAAAAA.',
  '.AAAAAAAAAAAAAA.',
  '..AAAA....AAAA..',
  '..AAAA....AAAA..',
  '..LLLL....LLLL..',
  '..LLLL....LLLL..',
  '..LLLL....LLLL..',
  '.LLLLL....LLLLL.',
  '.LLLLL....LLLLL.',
  'LLLLLL....LLLLLL',
];
const BRUTE_PAL: Palette = { H: dark, R: red, A: '#6a4a30', O: orange, L: '#3a2a20' };

// ── STALKER: slim shimmer sniper ──
const STALKER = [
  '...SSSS...',
  '..SSSSSS..',
  '..SGGGGS..',
  '...SSSS...',
  '..SSSSSS..',
  '.SSSSSSSS.',
  '.SSSSSSSS.',
  '..SSSSSS..',
  '..SS..SS..',
  '..SS..SS..',
  '..SS..SS..',
  '.SS....SS.',
  '.SS....SS.',
  'SS......SS',
];
const STALKER_PAL: Palette = { S: '#4a5a6a', G: green };

// ── SPIDER: low multi-leg mine-layer ──
const SPIDER = [
  '..L......L..',
  '...L....L...',
  'L..LBBBBL..L',
  '.LLBBBBBBLL.',
  '..LBBKKBBL..',
  'L.LBKKKKBL.L',
  '..LBBKKBBL..',
  '.LLBBBBBBLL.',
  'L..LBBBBL..L',
  '...L....L...',
  '..L......L..',
];
const SPIDER_PAL: Palette = { L: steel, B: dark, K: orange };

// ── REPLICA: a copy of you — bone white, silent ──
const REPLICA = [
  '....WWWW....',
  '...WWWWWW...',
  '...WkkkkW...',
  '....WWWW....',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  '.WWWWWWWWWW.',
  'RWWWWWWWWWWR',
  'RWWWWWWWWWWR',
  '.WWWWWWWWWW.',
  '..WWWWWWWW..',
  '..WWW..WWW..',
  '..WWW..WWW..',
  '..WWW..WWW..',
  '..WWW..WWW..',
  '..WW....WW..',
  '.WWW....WWW.',
  '.WWW....WWW.',
];
const REPLICA_PAL: Palette = { W: bone, k: black, R: red };

// ── WARDEN variants (boss) — big hulking frame ──
function wardenRows(core: string): string[] {
  return [
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '......HHRRRRRRRRHH......',
    '......HHHHHHHHHHHH......',
    '....AAAAAAAAAAAAAAAA....',
    '..AAAAAAAAAAAAAAAAAAAA..',
    '.AAAAAAAAAAAAAAAAAAAAAA.',
    'AAAA' + 'CCCCCCCCCCCCCCCC' + 'AAAA',
    'AAAAC' + core + core + core + core + core + core + core + core + core + core + core + core + core + core + 'CAAAA',
    'AAAAC' + core + core + 'RRRRRRRR' + core + core + 'CAAAA',
    'AAAAC' + core + core + 'RRRRRRRR' + core + core + 'CAAAA',
    'AAAAC' + core + core + core + core + core + core + core + core + core + core + core + core + core + core + 'CAAAA',
    'AAAA' + 'CCCCCCCCCCCCCCCC' + 'AAAA',
    '.AAAAAAAAAAAAAAAAAAAAAA.',
    '..AAAAAAAAAAAAAAAAAAAA..',
    '..AAAAAA........AAAAAA..',
    '..AAAAAA........AAAAAA..',
    '..LLLLLL........LLLLLL..',
    '..LLLLLL........LLLLLL..',
    '..LLLLLL........LLLLLL..',
    '.LLLLLLL........LLLLLLL.',
    '.LLLLLLL........LLLLLLL.',
    'LLLLLLLL........LLLLLLLL',
  ];
}

export interface SpriteDef { mat: THREE.SpriteMaterial; w: number; h: number; }

export function droneSprite(): SpriteDef { return { mat: spriteMat(DRONE, DRONE_PAL), w: 1.1, h: 0.9 }; }
export function gruntSprite(): SpriteDef { return { mat: spriteMat(GRUNT, GRUNT_PAL), w: 1.2, h: 1.8 }; }
export function bruteSprite(): SpriteDef { return { mat: spriteMat(BRUTE, BRUTE_PAL), w: 2.2, h: 2.6 }; }
export function stalkerSprite(): SpriteDef { return { mat: spriteMat(STALKER, STALKER_PAL), w: 1.0, h: 1.9 }; }
export function spiderSprite(): SpriteDef { return { mat: spriteMat(SPIDER, SPIDER_PAL), w: 1.5, h: 1.0 }; }
export function replicaSprite(): SpriteDef { return { mat: spriteMat(REPLICA, REPLICA_PAL), w: 1.2, h: 1.8 }; }
export function wardenSprite(biome: number): SpriteDef {
  const cores = ['O', 'E', 'K'];
  const pal: Palette = { H: dark, R: red, A: metal, L: '#222', C: '#332e28', O: orange, E: '#3a9adf', K: '#ff2050' };
  return { mat: spriteMat(wardenRows(cores[biome % 3]), pal), w: 4.2, h: 4.4 };
}

// Muzzle flash texture (additive)
export function flashTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.4, 'rgba(255,160,60,0.8)');
  grad.addColorStop(1, 'rgba(255,80,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 16);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
}

// Stagger marker — pulsing gold skull-ish chevron drawn per-frame in HUD instead.
export { makeTexture };
