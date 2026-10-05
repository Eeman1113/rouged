// Spectator overlay for /test: what the AI pilot is doing, how it's doing, and the controls
// (speed, take over / resume, reset the AI save). Styled like the game's HUD.

import type { Autopilot, AppLike } from '../autopilot';
import { LocalTransport } from '../net';

const CSS = `
#ap-hud { position: absolute; left: 14px; top: 96px; z-index: 40; width: 270px; font-family: var(--px); font-size: 9px; letter-spacing: 1px; line-height: 1.7;
  color: var(--bone); background: rgba(4, 6, 4, .62); border-left: 3px solid var(--term); padding: 10px 12px 10px; pointer-events: auto; user-select: none; }
#ap-hud .badge { display: inline-block; color: #000; background: var(--term); padding: 3px 7px 2px; font-size: 9px; margin-bottom: 8px; box-shadow: 0 0 14px rgba(89,255,122,.55); }
#ap-hud .badge.off { background: var(--amber); box-shadow: 0 0 14px rgba(255,180,58,.5); }
#ap-hud .badge i { font-style: normal; display: inline-block; width: 7px; height: 7px; background: #000; margin-right: 6px; animation: apblink 1s steps(2) infinite; }
@keyframes apblink { 50% { opacity: 0; } }
#ap-hud .status { font-family: var(--vt); font-size: 21px; line-height: 1.05; color: var(--term); text-shadow: 0 0 8px rgba(89,255,122,.5), 1px 1px 0 #000; min-height: 44px; margin-bottom: 6px; letter-spacing: 0; }
#ap-hud .status.reflex { color: var(--amber); text-shadow: 0 0 8px rgba(255,180,58,.6), 1px 1px 0 #000; }
#ap-hud .room { color: var(--amber); font-size: 8px; margin-bottom: 6px; }
#ap-hud .kv { display: grid; grid-template-columns: 1fr auto; gap: 0 10px; }
#ap-hud .kv .k { color: #8f8a7c; }
#ap-hud .kv .v { text-align: right; }
#ap-hud .kv .v.gold { color: var(--legend); }
#ap-hud .runs { margin-top: 7px; font-family: var(--vt); font-size: 16px; line-height: 1.05; color: #b9b2a0; letter-spacing: 0; }
#ap-hud .runs b { color: var(--bone); font-weight: normal; }
#ap-hud .runs .x { color: var(--term); }
#ap-hud .ctl { display: flex; gap: 5px; margin-top: 9px; flex-wrap: wrap; }
#ap-hud button { font-family: var(--px); font-size: 8px; letter-spacing: 1px; color: var(--bone); background: rgba(0,0,0,.6); border: 1px solid #555; padding: 5px 7px 4px; cursor: pointer; }
#ap-hud button:hover { border-color: var(--term); color: var(--term); }
#ap-hud button.on { border-color: var(--term); color: #000; background: var(--term); }
#ap-hud button.warn { border-color: var(--blood); color: #ff8a8a; }
#ap-hud .hint { margin-top: 6px; font-size: 7px; color: #77736a; }
#ap-toast { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 41; font-family: var(--px); font-size: 10px; letter-spacing: 2px; color: #000;
  background: var(--amber); padding: 7px 12px 6px; pointer-events: none; animation: apblink 1.4s steps(2) infinite; box-shadow: 0 0 18px rgba(255,180,58,.5); }
@media (max-width: 700px) { #ap-hud { width: 210px; top: 70px; font-size: 8px; } #ap-hud .status { font-size: 17px; } }
`;

function fmtTime(s: number) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(ss).padStart(2, '0');
}

function esc(t: string) { return t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string)); }

export function mountOverlay(ap: Autopilot, app: AppLike, opts: { level: () => number; reset: () => void; unlockAudio: () => void }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const root = document.getElementById('root')!;
  const el = document.createElement('div');
  el.id = 'ap-hud';
  el.innerHTML = `
    <div class="badge" id="ap-badge"><i></i>AI PILOT</div>
    <div class="status" id="ap-status">BOOTING</div>
    <div class="room" id="ap-room"></div>
    <div class="kv" id="ap-kv"></div>
    <div class="runs" id="ap-runs"></div>
    <div class="ctl">
      <button data-speed="1" class="on">×1</button><button data-speed="2">×2</button><button data-speed="4">×4</button>
      <button id="ap-take">TAKE OVER</button>
    </div>
    <div class="ctl"><button id="ap-reset" class="warn">RESET AI SAVE</button></div>
    <div class="hint">[O] TOGGLE AI · OWN SAVE SLOT, YOUR PROGRESS IS UNTOUCHED</div>`;
  root.appendChild(el);
  // keep clicks on the panel from reaching the game canvas
  el.addEventListener('pointerdown', (e) => e.stopPropagation());
  el.addEventListener('mousedown', (e) => e.stopPropagation());

  const $ = <T extends HTMLElement>(id: string) => el.querySelector('#' + id) as T;
  const speedBtns = [...el.querySelectorAll<HTMLButtonElement>('[data-speed]')];
  const paintSpeed = () => speedBtns.forEach((b) => b.classList.toggle('on', Number(b.dataset.speed) === ap.speed));
  speedBtns.forEach((b) => b.onclick = () => { ap.speed = Number(b.dataset.speed); paintSpeed(); opts.unlockAudio(); });
  paintSpeed();
  const take = $<HTMLButtonElement>('ap-take');
  const toggle = () => {
    ap.setActive(!ap.active);
    take.textContent = ap.active ? 'TAKE OVER' : 'RESUME AI';
    $('ap-badge').classList.toggle('off', !ap.active);
    $('ap-badge').innerHTML = ap.active ? '<i></i>AI PILOT' : '<i></i>YOU ARE PILOTING';
    if (ap.active && app.paused) app.togglePause(false);
  };
  take.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyO' && !e.repeat) toggle(); });
  let armed = 0;
  const reset = $<HTMLButtonElement>('ap-reset');
  reset.onclick = () => {
    if (performance.now() - armed > 3000) { armed = performance.now(); reset.textContent = 'CLICK AGAIN TO WIPE'; setTimeout(() => { reset.textContent = 'RESET AI SAVE'; }, 3000); return; }
    opts.reset();
  };

  // sound needs a user gesture
  const toast = document.createElement('div');
  toast.id = 'ap-toast';
  toast.textContent = 'CLICK ANYWHERE FOR SOUND';
  root.appendChild(toast);
  const unlock = () => { opts.unlockAudio(); toast.remove(); window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);

  const stEl = $('ap-status'), roomEl = $('ap-room'), kvEl = $('ap-kv'), runsEl = $('ap-runs');
  let lastKv = '', lastRuns = '', lastSt = '';
  const paint = () => {
    const g = app.game;
    const run = g && g.net instanceof LocalTransport ? g.net.run : null;
    const me = run?.players.get('local');
    const reflex = ap.active && ap.reflexT > 0 ? ap.reflex : '';
    const st = reflex || ap.status;
    if (st !== lastSt) { stEl.textContent = st; stEl.classList.toggle('reflex', !!reflex); lastSt = st; }
    roomEl.textContent = app.mode === 'run' && run?.room ? 'ROOM ' + ap.lastRoomName : app.mode.toUpperCase();
    const m = app.meta;
    const log = ap.log;
    const recent = log.slice(-10);
    const avg = recent.length ? recent.reduce((a, r) => a + r.depth, 0) / recent.length : 0;
    const depth = run?.room ? run.room.index + 1 : 0;
    const kills = m.totalKills + (app.mode === 'run' && me ? me.kills : 0);
    const kv = [
      ['RUN', String(m.runCount + (app.mode === 'run' ? 1 : 0))],
      ['DEPTH', app.mode === 'run' ? String(depth) : '—'],
      ['HP', me ? `${Math.max(0, Math.round(me.hp))}/${me.mods.maxHp}${me.armor > 0 ? ' +' + Math.round(me.armor) : ''}` : '—'],
      ['PLAN', app.mode === 'run' ? (isFinite(ap.extractAt) ? 'EXTRACT @ ' + ap.extractAt : 'THE ENDLESS') : '—'],
      ['BEST', String(Math.max(m.deepest, depth)), 'gold'],
      ['AVG (10)', avg ? avg.toFixed(1) : '—'],
      ['KILLS', kills.toLocaleString()],
      ['WARDENS', String(m.cores + (me?.bosses ?? 0))],
      ['LEVEL', String(opts.level())],
      ['UPTIME', fmtTime((performance.now() - ap.bootAt) / 1000)],
    ].map(([k, v, c]) => `<div class="k">${k}</div><div class="v ${c ?? ''}">${esc(v)}</div>`).join('');
    if (kv !== lastKv) { kvEl.innerHTML = kv; lastKv = kv; }
    const runs = log.slice(-5).reverse().map((r) => `#${r.n} <b>DEPTH ${r.depth}</b> · ${r.kills}K${r.extracted ? ' <span class="x">EXTRACTED</span>' : ''}`).join('<br/>');
    if (runs !== lastRuns) { runsEl.innerHTML = runs; lastRuns = runs; }
  };
  setInterval(paint, 200);
  paint();
}
