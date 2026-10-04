// Dev page: live viewmodel preview with buttons for every animation + contact-sheet capture.
// Open /vmtest.html in the vite dev server. window.vmt.sheet(...) renders frame strips.
import { Viewmodel, ViewMotion, WeaponId } from './hud/viewmodel';
import * as VR from './render/art/viewmodelRigs';

const view = document.getElementById('view') as HTMLCanvasElement;
const info = document.getElementById('info') as HTMLSpanElement;
let W = 853, H = 480;
view.width = W; view.height = H;
const g = view.getContext('2d')!;

function makeBg(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!;
  const hz = h * 0.5;
  let gr = x.createLinearGradient(0, 0, 0, hz);
  gr.addColorStop(0, '#1a0e0c'); gr.addColorStop(1, '#3a1810');
  x.fillStyle = gr; x.fillRect(0, 0, w, hz);
  gr = x.createLinearGradient(0, hz, 0, h);
  gr.addColorStop(0, '#2a140e'); gr.addColorStop(1, '#5a3020');
  x.fillStyle = gr; x.fillRect(0, hz, w, h - hz);
  x.strokeStyle = 'rgba(0,0,0,0.5)';
  for (let i = -20; i <= 20; i++) { x.beginPath(); x.moveTo(w / 2, hz); x.lineTo(w / 2 + i * w * 0.12, h); x.stroke(); }
  for (let j = 1; j < 14; j++) { const y = hz + (h - hz) * Math.pow(j / 14, 2.2); x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
  // pillars
  x.fillStyle = '#160a08'; x.fillRect(w * 0.2, 0, w * 0.12, h * 0.62); x.fillRect(w * 0.7, 0, w * 0.14, h * 0.64);
  x.fillStyle = '#ff9a30'; x.fillRect(0, h * 0.4, w * 0.2, 2); x.fillRect(w * 0.84, h * 0.4, w * 0.16, 2);
  return c;
}
let bg = makeBg(W, H);

const motion: ViewMotion = { bobT: 0, bobAmt: 0, land: 0, sliding: false, dashing: false, airborne: false, lookDX: 0, lookDY: 0, sprinting: false, crouching: false };
let vm = new Viewmodel();
let weapon: WeaponId = 'pulse';
const tog = { walk: false, sprint: false, slide: false, sway: false, auto: false, ripper: false, cut: false, crouch: false };
let charge = 0, autoT = 0;

function crosshair(x: CanvasRenderingContext2D, w: number, h: number): void {
  const cx = Math.round(w / 2), cy = Math.round(h / 2);
  x.fillStyle = 'rgba(255,255,255,0.85)';
  x.fillRect(cx - 7, cy, 4, 1); x.fillRect(cx + 4, cy, 4, 1); x.fillRect(cx, cy - 7, 1, 4); x.fillRect(cx, cy + 4, 1, 4); x.fillRect(cx, cy, 1, 1);
}

function stepMotion(dt: number, t: number): void {
  const walking = tog.walk || tog.sprint;
  motion.bobAmt += ((walking && !tog.slide ? 1 : 0) - motion.bobAmt) * Math.min(1, dt * 10);
  motion.bobT += dt * (tog.sprint ? 11 : 8);
  motion.sprinting = tog.sprint; motion.sliding = tog.slide; motion.crouching = tog.crouch;
  motion.lookDX = tog.sway ? Math.sin(t * 2.2) * 2.2 * dt : 0;
  motion.lookDY = tog.sway ? Math.cos(t * 1.7) * 0.8 * dt : 0;
  motion.land *= Math.max(0, 1 - dt * 9);
}

let last = performance.now(), T = 0, avg = 0;
function frame(): void {
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  stepMotion(dt, T);
  if (tog.auto) { autoT -= dt; if (autoT <= 0) { autoT += weapon === 'breacher' ? 0.5 : weapon === 'lance' ? 0.8 : 0.125; vm.fire(); } }
  vm.setCharge(charge);
  vm.setRipper(tog.ripper || tog.cut, tog.cut);
  g.imageSmoothingEnabled = false;
  g.drawImage(bg, 0, 0);
  const t0 = performance.now();
  vm.draw(g, W, H, dt, motion);
  const ms = performance.now() - t0;
  avg = avg * 0.95 + ms * 0.05;
  crosshair(g, W, H);
  const mz = vm.muzzle();
  g.fillStyle = '#f0f'; g.fillRect(mz.x, mz.y, 1, 1);
  info.textContent = `draw ${avg.toFixed(2)}ms  last render ${VR.vmRenderMs.toFixed(1)}ms  renders ${VR.vmRenderCount}  reloading ${vm.reloading}`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function btn(parent: string, label: string, fn: (b: HTMLButtonElement) => void): HTMLButtonElement {
  const b = document.createElement('button'); b.textContent = label; b.onclick = () => fn(b);
  document.getElementById(parent)!.appendChild(b); return b;
}
const wbtn: HTMLButtonElement[] = [];
for (const w of ['pulse', 'breacher', 'lance', 'ripper'] as WeaponId[]) wbtn.push(btn('weapons', w, (b) => { weapon = w; vm.setWeapon(w); wbtn.forEach((x) => x.classList.remove('on')); b.classList.add('on'); }));
btn('acts', 'fire', () => vm.fire());
btn('acts', 'reload', () => vm.reload(({ pulse: 1.15, breacher: 0.95, lance: 1.35, ripper: 0.9 })[weapon]));
btn('acts', 'inspect', () => vm.inspect());
btn('acts', 'glory', () => vm.glory());
btn('acts', 'land', () => { motion.land = 0.35; });
btn('acts', 'charge+fire', () => { let c = 0; const id = setInterval(() => { c += 0.02; charge = Math.min(1, c); if (c >= 1.2) { clearInterval(id); vm.fire(); charge = 0; } }, 20); });
for (const k of Object.keys(tog) as (keyof typeof tog)[]) btn('toggles', k, (b) => { tog[k] = !tog[k]; b.classList.toggle('on', tog[k]); });
(document.getElementById('charge') as HTMLInputElement).oninput = (e) => { charge = +(e.target as HTMLInputElement).value; };
(document.getElementById('res') as HTMLSelectElement).onchange = (e) => {
  const [w, h] = (e.target as HTMLSelectElement).value.split('x').map(Number);
  W = w; H = h; view.width = W; view.height = H; bg = makeBg(W, H);
};

// ------------------------------------------------------------------ contact sheets (for screenshots)
type Act = 'idle' | 'fire' | 'auto' | 'reload' | 'inspect' | 'glory' | 'equip' | 'charge' | 'sprint' | 'slide' | 'ripper' | 'cut' | 'walk';
function sheet(w: WeaponId, act: Act, n = 12, span = 1.2, cols = 4, crop = [0.3, 0.25, 1, 1], res = [853, 480], zoom = 1, overrides: Record<string, number>[] = []): HTMLCanvasElement {
  const [sw, sh] = res;
  const v = new Viewmodel();
  const m: ViewMotion = { bobT: 0, bobAmt: 0, land: 0, sliding: false, dashing: false, airborne: false, lookDX: 0, lookDY: 0 };
  const off = document.createElement('canvas'); off.width = sw; off.height = sh;
  const ox = off.getContext('2d')!; ox.imageSmoothingEnabled = false;
  const b = makeBg(sw, sh);
  if (act === 'equip') v.setWeapon(w === 'pulse' ? 'breacher' : 'pulse');
  v.setWeapon(w);
  const dt = 1 / 60;
  let ch = 0;
  const run = (secs: number, fn?: (t: number) => void): void => { for (let t = 0; t < secs; t += dt) { fn?.(t); v.setCharge(ch); ox.drawImage(b, 0, 0); v.draw(ox, sw, sh, dt, m); } };
  if (act !== 'equip') run(0.5);
  if (act === 'fire' || act === 'auto') v.fire();
  if (act === 'reload') v.reload(({ pulse: 1.15, breacher: 0.95, lance: 1.35, ripper: 0.9 })[w]);
  if (act === 'inspect') v.inspect();
  if (act === 'glory') v.glory();
  if (act === 'sprint') { m.sprinting = true; }
  if (act === 'slide') { m.sliding = true; }
  if (act === 'ripper') v.setRipper(true, false);
  if (act === 'cut') v.setRipper(true, true);
  const cx0 = Math.round(crop[0] * sw), cy0 = Math.round(crop[1] * sh), cw = Math.round((crop[2] - crop[0]) * sw), chh = Math.round((crop[3] - crop[1]) * sh);
  const rows = Math.ceil(n / cols);
  const Z = zoom;
  const out = document.createElement('canvas'); out.width = cols * cw * Z; out.height = rows * (chh * Z + 12);
  const o = out.getContext('2d')!; o.imageSmoothingEnabled = false; o.fillStyle = '#111'; o.fillRect(0, 0, out.width, out.height);
  let tt = 0, autoT = 0.125;
  for (let i = 0; i < n; i++) {
    const target = (i / Math.max(1, n - 1)) * span;
    Viewmodel.debugPose = overrides[i] ?? null;
    while (tt < target - 1e-6) {
      tt += dt;
      if (act === 'auto') { autoT -= dt; if (autoT <= 0) { autoT += 0.125; v.fire(); } }
      if (act === 'charge') { ch = Math.min(1, tt / (span * 0.75)); if (tt >= span * 0.75 && ch >= 1) { v.fire(); ch = 0; } }
      if (act === 'walk' || act === 'sprint') { m.bobAmt = 1; m.bobT += dt * (act === 'sprint' ? 11 : 8); }
      v.setCharge(ch);
      ox.drawImage(b, 0, 0); v.draw(ox, sw, sh, dt, m);
    }
    if (tt === 0) { ox.drawImage(b, 0, 0); v.draw(ox, sw, sh, 0, m); }
    crosshair(ox, sw, sh);
    const x = (i % cols) * cw * Z, y = Math.floor(i / cols) * (chh * Z + 12);
    o.drawImage(off, cx0, cy0, cw, chh, x, y + 12, cw * Z, chh * Z);
    o.fillStyle = '#ffa020'; o.font = '10px monospace'; o.fillText(`${w} ${act} t=${target.toFixed(2)} ${overrides[i] ? JSON.stringify(overrides[i]) : ''}`, x + 3, y + 10);
    o.strokeStyle = '#333'; o.strokeRect(x + 0.5, y + 12.5, cw * Z - 1, chh * Z - 1);
  }
  Viewmodel.debugPose = null;
  return out;
}
function showSheet(...a: Parameters<typeof sheet>): void {
  const root = document.getElementById('sheet')!;
  root.innerHTML = '';
  const c = sheet(...a);
  root.appendChild(c);
}
(window as unknown as { vmt: unknown }).vmt = { sheet, showSheet, vm: () => vm, VR, tog, motion, setCharge: (c: number) => { charge = c; } };
