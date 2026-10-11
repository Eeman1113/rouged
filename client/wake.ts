// ROUGED — the false awakening. After an early extraction you open your eyes on a morning that the
// program paints from memory asset 0001-H (a window at 14 Maple Row, rain on the glass), the Handler
// says "Welcome back.", the morning tears, and you are standing in the white room again.
//
// The overlay is a 320x180 canvas inserted UNDER the HUD, so the Handler speaks with its usual voice
// and subtitles. The hub is built underneath while it plays; the cut simply removes the overlay.
// Text lives in story/awakening.ts.

import type { World } from './world';
import { sfx, LoopHandle } from './audio/sfx';
import { music } from './audio/music';
import { plainLine, wakeLines, wakeReadout } from './story/awakening';
import { esc } from './hud/killfeed';

export interface WakePlan {
  depth: number;
  /** Wardens this player beat this run */
  wardens: number;
  /** meta.runCount after the run was applied */
  runCount: number;
  /** first false awakening ever (unskippable, and the readout spells out the full sample) */
  first: boolean;
  eye: boolean;
  trueEndingSeen: boolean;
  reduced: boolean;
}

export interface WakeCallbacks {
  /** the overlay is gone: the hub is the world again */
  onCut(): void;
  /** the SAMPLE line just landed (light the new sigils) */
  onSample(): void;
  /** readout faded: the sequence is over */
  onDone(): void;
}

const W = 320, H = 180;
const TERM = '#59ff7a';

/** rough spoken length of a line, for the timeline (the voice queues anyway) */
function dur(text: string) { return Math.max(1.5, 0.45 + plainLine(text).length * 0.062); }
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

function hash(n: number) { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; }

/** The morning the program paints: a bedroom window, early light, a pink curtain, rain. */
function paintMorning(): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  // ceiling + wall, warm
  const wall = g.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#3a2a26'); wall.addColorStop(0.45, '#9a7464'); wall.addColorStop(1, '#5a3e36');
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  // ceiling seam
  g.fillStyle = 'rgba(30,20,18,.5)'; g.fillRect(0, 34, W, 2);
  // window: sky, pale and bright
  const wx = 168, wy = 44, ww = 104, wh = 100;
  const sky = g.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#fffaf0'); sky.addColorStop(0.6, '#ffe7c0'); sky.addColorStop(1, '#f2c79a');
  g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
  // a tree outside, soft
  g.fillStyle = 'rgba(120,150,110,.45)';
  for (let i = 0; i < 40; i++) { const x = wx + 6 + hash(i) * 50, y = wy + 40 + hash(i + 99) * 50; g.beginPath(); g.arc(x, y, 5 + hash(i + 7) * 8, 0, Math.PI * 2); g.fill(); }
  // frame + mullions
  g.fillStyle = '#5c4038';
  g.fillRect(wx - 5, wy - 5, ww + 10, 5); g.fillRect(wx - 5, wy + wh, ww + 10, 7); g.fillRect(wx - 5, wy, 5, wh); g.fillRect(wx + ww, wy, 5, wh);
  g.fillRect(wx + ww / 2 - 2, wy, 4, wh); g.fillRect(wx, wy + wh / 2 - 2, ww, 4);
  // light shafts falling left
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    g.fillStyle = `rgba(255,214,150,${0.07 + k * 0.02})`;
    g.beginPath(); g.moveTo(wx + 8 + k * 30, wy + 4); g.lineTo(wx + 30 + k * 30, wy + 4); g.lineTo(40 + k * 40, H); g.lineTo(0 + k * 40, H); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  // the curtain, the pink of the memory door
  for (let x = wx - 34; x < wx + 6; x++) {
    const fold = Math.sin((x - wx) * 0.55) * 0.5 + 0.5;
    g.fillStyle = `rgba(${200 + fold * 55 | 0},${140 + fold * 40 | 0},${150 + fold * 30 | 0},0.92)`;
    g.fillRect(x, wy - 14, 1, wh + 30 - (fold * 6 | 0));
  }
  // bed edge / blanket at the bottom
  const bed = g.createLinearGradient(0, H - 40, 0, H);
  bed.addColorStop(0, '#d9c2a8'); bed.addColorStop(1, '#8a6e5c');
  g.fillStyle = bed; g.beginPath(); g.moveTo(0, H - 26); g.quadraticCurveTo(W * 0.45, H - 46, W, H - 30); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  // vignette
  const v = g.createRadialGradient(W * 0.6, H * 0.45, 30, W * 0.5, H * 0.5, W * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,5,5,.75)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}

/** THE HANDLER's eye, the big CRT eye from its body: green outline, dark sclera, a pupil that looks at you. */
function paintEye(g: CanvasRenderingContext2D, cx: number, cy: number, alpha: number, jitter: number) {
  const rx = 82, ry = 46;
  g.save();
  g.globalAlpha = alpha;
  // the morning goes dark green under it
  g.fillStyle = 'rgba(2,14,6,0.72)'; g.fillRect(0, 0, W, H);
  for (let y = -ry; y <= ry; y++) {
    const xr = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) * (1 - Math.abs(y / ry) * 0.12);
    const off = jitter && hash(y * 13 + (jitter * 977 | 0)) < 0.08 ? (hash(y + jitter) - 0.5) * 18 : 0;
    g.fillStyle = (y & 1) ? '#0c3a1a' : '#08290f';
    g.fillRect(cx - xr + off, cy + y, xr * 2, 1);
    g.fillStyle = TERM;
    g.fillRect(cx - xr + off - 2, cy + y, 3, 1); g.fillRect(cx + xr + off - 1, cy + y, 3, 1);
  }
  g.fillStyle = TERM; g.fillRect(cx - 18, cy - ry - 1, 36, 2); g.fillRect(cx - 18, cy + ry - 1, 36, 2);
  const iris = g.createRadialGradient(cx, cy, 3, cx, cy, 36);
  iris.addColorStop(0, '#e8ffec'); iris.addColorStop(0.35, '#9dffb0'); iris.addColorStop(0.75, TERM); iris.addColorStop(1, 'rgba(31,106,51,0)');
  g.fillStyle = iris; g.beginPath(); g.arc(cx, cy, 36, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#020602'; g.beginPath(); g.ellipse(cx, cy, 11, 19, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(cx - 9, cy - 13, 4, 4);
  // scanlines over the whole thing
  g.fillStyle = 'rgba(0,0,0,0.28)';
  for (let y = (cy - ry) | 0; y < cy + ry; y += 2) g.fillRect(cx - rx - 4, y, rx * 2 + 8, 1);
  g.restore();
}

export class FalseAwakening {
  readonly el: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private morning = paintMorning();
  private snap: HTMLCanvasElement;
  private t = 0;
  private last = performance.now();
  private raf = 0;
  private rain: LoopHandle | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private cut = false;
  private disposed = false;
  private readout: HTMLDivElement | null = null;
  private hint: HTMLDivElement | null = null;
  private said = { welcome: false, line: false, eye: false, glitch: false };
  private lines: ReturnType<typeof wakeLines>;
  // timeline (seconds)
  private welcomeAt: number;
  private lineAt: number;
  private eyeAt: number;
  private glitchAt: number;
  private glitchLen: number;
  /** the latest the tear may wait for the voice */
  private glitchCap: number;
  private holdAt = 0;
  private skipped = false;
  readonly skippable: boolean;

  constructor(private world: World, private plan: WakePlan, private cb: WakeCallbacks) {
    this.lines = wakeLines(plan.depth, plan.runCount);
    this.skippable = !plan.first;
    const r = plan.reduced;
    this.welcomeAt = r ? 1.6 : 2.6;
    this.lineAt = this.welcomeAt + dur(this.lines.welcome);
    const lineLen = dur(this.lines.line);
    this.eyeAt = plan.eye ? this.lineAt + lineLen * 0.55 : Infinity;
    this.glitchAt = Math.max(this.lineAt + lineLen + 0.35, plan.eye ? this.eyeAt + 1.35 : 0);
    this.glitchLen = r ? 0.6 : 0.9;
    this.glitchCap = this.glitchAt + 3;

    this.el = document.createElement('div');
    this.el.className = 'wake';
    this.canvas = document.createElement('canvas');
    this.canvas.width = W; this.canvas.height = H;
    this.el.appendChild(this.canvas);
    this.g = this.canvas.getContext('2d')!;
    this.snap = document.createElement('canvas'); this.snap.width = W; this.snap.height = H;
    // under the HUD: the Handler's subtitles stay on top, as they always are
    const root = document.getElementById('root')!;
    root.insertBefore(this.el, document.getElementById('hud'));
    if (this.skippable) {
      this.hint = document.createElement('div');
      this.hint.className = 'wake-skip';
      this.hint.textContent = world.input.touchMode ? 'TAP TO SKIP' : world.input.padActive ? 'SKIP [✕]' : 'SKIP [SPACE]';
      this.el.appendChild(this.hint);
    }
    this.rain = sfx.morningRain();
    // failsafe: whatever happens to the frame loop, the morning always ends
    this.later(this.glitchCap + this.glitchLen + 12, () => this.doCut());
    this.draw();
    this.raf = requestAnimationFrame(() => this.tick());
  }

  /** Skip to the tear (only after the first false awakening). */
  skip() {
    // a short grace: the press that opened the eyes (key repeat, pad, tap) must not also skip them
    if (!this.skippable || this.cut || this.t >= this.glitchAt || this.t < 0.5) return;
    this.world.voice.cancel();
    this.skipped = true;
    this.said.welcome = this.said.line = this.said.eye = true;
    this.glitchAt = this.t;
    this.glitchLen = 0.4;
  }

  private tick() {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    const t = this.t;
    const w = this.world, p = this.plan;
    if (!this.said.welcome && t >= this.welcomeAt) { this.said.welcome = true; w.voice.say(this.lines.welcome, { runCount: this.lines.voiceRun, priority: 9, readable: true }); }
    if (!this.said.line && t >= this.lineAt) { this.said.line = true; w.voice.say(this.lines.line, { runCount: this.lines.voiceRun, priority: 9, readable: true }); }
    if (!this.said.eye && t >= this.eyeAt) { this.said.eye = true; sfx.staticBurst(0.25); }
    // the morning holds until the Handler has finished lying (a slow voice can run past the estimate)
    if (!this.said.glitch && t >= this.glitchAt && !this.skipped && w.voice.speaking && t < this.glitchCap) this.glitchAt = t + 0.05;
    // the band holds its breath: short holds keep it quiet without stacking swells (the hub resumes it on load)
    if (!this.said.glitch && t >= this.holdAt) { this.holdAt = t < 0.6 ? t : t + 0.3; music.silence(0.9); }
    if (!this.said.glitch && t >= this.glitchAt) {
      this.said.glitch = true;
      // it comes back in with the room: one swell landing on the cut
      music.silence(Math.max(1, this.glitchLen + 0.15));
      sfx.staticBurst(this.glitchLen);
      if (!p.reduced) w.glitch(1);
      this.rain?.stop(); this.rain = null;
    }
    if (t >= this.glitchAt + this.glitchLen) { this.doCut(); return; }
    this.draw();
    this.raf = requestAnimationFrame(() => this.tick());
  }

  /** eyelid openness 0..1 */
  private lids(t: number): number {
    if (this.plan.reduced) return 1;
    if (t < 0.6) return 0;
    if (t < 1.1) return 0.28 * ease((t - 0.6) / 0.5);
    if (t < 1.3) return 0.28;
    if (t < 1.55) return 0.28 - 0.25 * ease((t - 1.3) / 0.25);
    if (t < 1.8) return 0.03;
    return 0.03 + 0.97 * ease((t - 1.8) / 0.8);
  }

  private draw() {
    const g = this.g, t = this.t, p = this.plan;
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.drawImage(this.morning, 0, 0);
    // rain on the glass
    g.fillStyle = 'rgba(235,240,255,0.55)';
    const speed = p.reduced ? 0 : 1;
    for (let i = 0; i < 46; i++) {
      const x = 168 + hash(i * 3) * 104;
      const y = 44 + ((hash(i * 7) * 100 + t * speed * (40 + hash(i) * 40)) % 100);
      g.fillRect(x | 0, y | 0, 1, 2 + (hash(i * 5) * 4 | 0));
    }
    // dust in the light
    g.fillStyle = 'rgba(255,236,200,0.5)';
    for (let i = 0; i < 18; i++) {
      const x = (hash(i * 17) * 200 + Math.sin(t * 0.3 + i) * 6) % W, y = (hash(i * 23) * H + t * 3 * speed) % H;
      g.fillRect(x | 0, y | 0, 1, 1);
    }
    // the eye
    if (t >= this.eyeAt && t < this.eyeAt + 1.1) {
      const u = (t - this.eyeAt) / 1.1;
      let a: number;
      if (p.reduced) a = Math.sin(u * Math.PI);
      else a = u < 0.22 ? 1 : u < 0.34 ? 0 : u < 0.92 ? 1 : 0; // two flashes, under three a second
      if (a > 0) paintEye(g, 160 + (p.reduced ? 0 : (hash(t * 1000 | 0) - 0.5) * 3), 86, a, p.reduced ? 0 : t);
    }
    // the tear
    const gl = clamp01((t - this.glitchAt) / this.glitchLen);
    if (t >= this.glitchAt) {
      const sg = this.snap.getContext('2d')!;
      sg.drawImage(this.canvas, 0, 0);
      if (!p.reduced) {
        const bands = 6 + (gl * 16 | 0);
        for (let i = 0; i < bands; i++) {
          const y = Math.random() * H | 0, h = 2 + (Math.random() * 14 | 0), dx = (Math.random() - 0.5) * (10 + gl * 70);
          g.drawImage(this.snap, 0, y, W, h, dx, y, W, h);
        }
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.35 * gl;
        g.drawImage(this.snap, 3 + gl * 6, 0);
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 6; i++) {
          g.fillStyle = ['#ff3030', TERM, '#ffffff'][i % 3];
          g.globalAlpha = 0.25 + Math.random() * 0.4;
          g.fillRect(0, Math.random() * H, W, 1 + Math.random() * 3);
        }
        g.globalAlpha = 1;
      }
      const n = (p.reduced ? 500 : 2600) * gl;
      for (let i = 0; i < n; i++) { const v = Math.random() * 255 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * W | 0, Math.random() * H | 0, 1, 1); }
      if (gl > 0.65) { g.fillStyle = `rgba(0,0,0,${(gl - 0.65) / 0.35})`; g.fillRect(0, 0, W, H); }
    }
    // eyelids (soft edged)
    const o = this.lids(t);
    if (o < 1) {
      g.fillStyle = '#000';
      const ry = o * H * 0.62;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(-10, s < 0 ? -10 : H + 10);
        g.lineTo(-10, H / 2 + s * ry * 0.35);
        g.quadraticCurveTo(W / 2, H / 2 + s * ry * 1.65, W + 10, H / 2 + s * ry * 0.35);
        g.lineTo(W + 10, s < 0 ? -10 : H + 10);
        g.closePath(); g.fill();
      }
    }
    if (p.reduced && t < 1.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 1.4})`; g.fillRect(0, 0, W, H); }
    // focus: blurry until the eyes have opened
    const focus = p.reduced ? clamp01(t / 1.4) : clamp01((t - 1.8) / 2.0);
    this.canvas.style.filter = `blur(${(0.6 + (1 - focus) * 9).toFixed(1)}px)`;
  }

  private doCut() {
    if (this.cut) return;
    this.cut = true;
    cancelAnimationFrame(this.raf);
    this.rain?.stop(); this.rain = null;
    this.el.remove();
    if (!this.plan.reduced) this.world.flash(0.55);
    this.cb.onCut();
    // the white room: the readout
    const lines = wakeReadout({ wardens: this.plan.wardens, depth: this.plan.depth, first: this.plan.first, trueEndingSeen: this.plan.trueEndingSeen });
    const box = document.createElement('div');
    box.className = 'wake-readout';
    document.getElementById('screens')!.appendChild(box);
    this.readout = box;
    lines.forEach((ln, i) => this.later(0.35 + i * 0.9, () => {
      const d = document.createElement('div');
      d.innerHTML = i === 1 ? esc(ln).replace(/(\d+ OF \d+)/, '<b>$1</b>') : esc(ln);
      box.appendChild(d);
      sfx.terminalBeep();
      if (i === 1) this.cb.onSample();
    }));
    const end = 0.35 + lines.length * 0.9 + 5;
    this.later(end, () => { box.classList.add('out'); });
    this.later(end + 1.6, () => { box.remove(); this.readout = null; this.cb.onDone(); });
  }

  private later(sec: number, fn: () => void) {
    this.timers.push(setTimeout(() => { if (!this.disposed) fn(); }, sec * 1000));
  }

  get playing() { return !this.cut; }
  /** seconds since the overlay started / until it cuts to the room */
  get elapsed() { return this.t; }
  get cutAt() { return this.glitchAt + this.glitchLen; }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    for (const t of this.timers) clearTimeout(t);
    this.rain?.stop(); this.rain = null;
    this.el.remove();
    this.readout?.remove();
  }
}
