// Dev page: boss animation contact sheets. /bosstest.html?v=0&legacy=1
import * as S from './render/sprites';
const root = document.getElementById('root') as HTMLDivElement;
const q = new URLSearchParams(location.search);
function scaled(c: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const o = document.createElement('canvas'); o.width = c.width * k; o.height = c.height * k;
  const ctx = o.getContext('2d'); if (ctx) { ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, o.width, o.height); }
  return o;
}
function section(title: string): HTMLDivElement {
  const h = document.createElement('h2'); h.textContent = title; root.appendChild(h);
  const row = document.createElement('div'); row.className = 'row'; root.appendChild(row); return row;
}
function add(row: HTMLDivElement, c: HTMLCanvasElement, label: string, k = 2): void {
  const d = document.createElement('div'); d.className = 'cell'; d.appendChild(scaled(c, k));
  const s = document.createElement('span'); s.textContent = label; d.appendChild(s); row.appendChild(d);
}
const vs = (q.get('v') ?? '0,1,2,3,4,5,6').split(',').map(Number);
if (q.get('legacy')) {
  for (const v of vs) {
    const s = S.getEnemySprites('warden', v);
    const row = section(`legacy warden ${v}`);
    s.idle.forEach((c, i) => add(row, c, `idle${i}`)); s.move.forEach((c, i) => add(row, c, `move${i}`));
    s.attack.forEach((c, i) => add(row, c, `atk${i}`)); add(row, s.pain, 'pain');
    s.stagger.forEach((c, i) => add(row, c, `stag${i}`)); s.charge.forEach((c, i) => add(row, c, `chg${i}`)); add(row, s.dead, 'dead');
  }
}
import { bossFrame, bossDeadFrame, clipNames, clipInfo, BOSS_MOVES } from './render/art/boss';
if (!q.get('legacy')) {
  const k = Number(q.get('k') ?? 2);
  const dmg = Number(q.get('dmg') ?? 0);
  const only = q.get('clips')?.split(',');
  for (const v of vs) {
    const t0 = performance.now();
    let n = 0;
    for (const c of clipNames(v, BOSS_MOVES[v])) {
      if (only && !only.some((o) => c.startsWith(o))) continue;
      const row = section(`boss ${v} · ${c}`);
      const info = clipInfo(v, c);
      for (let i = 0; i < info.n; i++) { add(row, bossFrame(v, c, i, dmg), `${i}`, k); n++; }
      if (c === 'death') add(row, bossDeadFrame(v), 'dead', k);
    }
    const st = document.getElementById('stats')!;
    st.textContent += ` boss ${v}: ${n} frames ${(performance.now() - t0).toFixed(0)}ms;`;
  }
}
