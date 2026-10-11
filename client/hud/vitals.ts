// VITALS: the bottom-right integrity readout (HP number + segmented health bar + plating + heart trace).
//
// Drawn on its own small canvas at devicePixelRatio, on an integer "art pixel" grid, so it stays crisp at any
// resolution and matches the game's chunky pixel look. (The shared hud2d canvas runs at the 3D internal
// resolution, 300 to 480 px tall, which would turn the number to mush on phones.)
//
// Everything is driven by real state: setState() every frame (hp / max / armor / alive), plus punctual
// events from the game: hit() on playerHit, beat() from the low-HP heartbeat timer, glory(), surge() on
// streaks, die() / revive(). HP going down leaves a "hard damage" ghost that holds then drains (re-armed
// by every hit); HP going up shows a green preview the fill sweeps up into.

const PX = "'Press Start 2P', 'Courier New', monospace";
const VT = "'VT323', 'Courier New', monospace";

// layout, in art pixels (unslanted). The bottom block leans "/" by 1 px every 2 rows.
const M = 4; // margin for shake / shards
const HEAD = 9; // header rows (label + trace)
const BOX_W = 42; // number box: a 3-digit Press Start 2P number clears both slanted edges
const GAP = 2;
const BAR_W = 88; // health bar (incl. 1px border)
const BAR_H = 14;
const PLATE_GAP = 2;
const PLATE_H = 4;
const BLOCK_H = BAR_H + PLATE_GAP + PLATE_H; // 20
const SLANT = Math.floor((BLOCK_H - 1) / 2); // 9
const BLOCK_W = BOX_W + GAP + BAR_W + SLANT;
const ART_W = M + BLOCK_W + M;
const ART_H = M + HEAD + 1 + BLOCK_H + 3;
const BAR_X = BOX_W + GAP; // inside the block canvas
const PLATE_W = BAR_W - 22; // room for the armor value at its right
const TRACE_W = 40;

const C = {
  bg: '#0a0606', empty: '#240909', emptyHi: '#2f0d0e', border: '#000000', boxEdge: '#5a0a0d',
  red: [226, 22, 30], redHi: [255, 90, 74], redLo: [138, 12, 16],
  bone: [241, 234, 216], green: [89, 255, 122], amber: [255, 180, 58], gold: [255, 200, 59],
  steel: [90, 184, 255], steelHi: [190, 228, 255], steelLo: [30, 80, 140],
};
type RGB = number[];
const BLACK: RGB = [0, 0, 0];
const STATIC: RGB = [140, 130, 120];
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const css = (c: RGB, a = 1) => a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
const grey = (c: RGB, k: number): RGB => { const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15; return mix(c, [l * 0.55, l * 0.5, l * 0.5], k); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (a: number, b: number) => { const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); };

/** ECG beat shape, one value per column (negative = up) */
const QRS = [0, -1, -1, 0, 1, -4, -2, 3, 1, 0, 0, -1, -1, 0];

interface Shard { x: number; y: number; vx: number; vy: number; life: number; c: RGB }
interface Sweep { t: number; dur: number; c: RGB; from: number; to: number }
interface Tag { n: number; t: number; c: RGB; armor: boolean }

export class Vitals {
  readonly el: HTMLElement;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  /** unslanted bottom block (number box + bar + plating) at 1 art px = 1 px */
  private blk = document.createElement('canvas');
  private bg: CanvasRenderingContext2D;
  private img = new ImageData(BLOCK_W, BLOCK_H);
  private pd = this.img.data;
  private tint = document.createElement('canvas');
  private tg: CanvasRenderingContext2D;
  private u = 3; // device px per art px
  private touch = false;
  private dpr = 1;
  private rawDpr = window.devicePixelRatio || 1;
  private lastTf = '';
  private sizedDpr = 0;

  /** motion comfort 0..1 (settings.shake; forced 0 under prefers-reduced-motion) */
  motion = 1;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  /** 0..1 dims the widget (sniper scope open) */
  dim = 0;

  // real state
  private hp = 100; private max = 100; private armor = 0; private alive = true;
  private init = false;
  // display state (HP units)
  private disp = 100;
  private fill = 100;
  private ghost = 100; private ghostHold = 0; private ghostVel = 0;
  private aFill = 0; private aGhost = 0; private aHold = 0; private aVel = 0;
  // fx
  private flash = 0; private shake = 0; private chroma = 0; private glitch = 0;
  private beatK = 0; private healK = 0; private gloryK = 0; private surgeK = 0; private surgeLvl = 0;
  private numPop = 0; private numHeal = 0;
  private energy = 0; private energyTarget = 0; private streak = 0; private shimmer = 0;
  private deathT = 0; private reviveT = 0;
  private sweeps: Sweep[] = [];
  private shards: Shard[] = [];
  private tags: Tag[] = [];
  private trickle = 0; private trickleT = 0;
  // heart trace
  private trace = new Float32Array(TRACE_W);
  private traceAcc = 0; private beatQ = -1; private beatTimer = 0.5;
  private time = 0;
  private last = 0;
  private sx = 0; private sy = 0; private sway = { x: 0, y: 0 };

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'vitals';
    this.el.id = 'h-vitals';
    this.cv = document.createElement('canvas');
    this.el.appendChild(this.cv);
    this.g = this.cv.getContext('2d')!;
    this.blk.width = BLOCK_W; this.blk.height = BLOCK_H;
    this.bg = this.blk.getContext('2d')!;
    this.tint.width = BLOCK_W; this.tint.height = BLOCK_H;
    this.tg = this.tint.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /** Pick the art-pixel size from the viewport: ~3 css px at 1080p, never under ~1.4 on phones, always whole device px.
   *  The width limit is the real free space between the face (bottom centre, ~0.17 x height wide) and the gutter. */
  resize() {
    const touch = this.touch = document.body.classList.contains('touch');
    const dpr = this.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const W = innerWidth, H = innerHeight;
    const faceHalf = 0.09 * H + 12;
    const portrait = touch && H > W;
    // desktop: gutter (18) to the face; touch landscape: stick (186) to the face; touch portrait: full width above the stick
    const room = portrait ? W - 36 : touch ? W / 2 - faceHalf - 186 : W / 2 - faceHalf - 18;
    const limit = Math.max(1 / dpr, room / (ART_W - 2 * M));
    const ucss = Math.min(5, portrait ? 2.2 : 5, limit, Math.max(H < 600 ? 1.6 : 1.4, Math.min(H, portrait ? W * 1.6 : H) / 360));
    let u = Math.max(1, Math.round(ucss * dpr));
    if (u > 1 && u / dpr > limit) u--;
    if (u === this.u && dpr === this.sizedDpr && this.cv.width === ART_W * u) return; // nothing changed: keep the backing store
    this.u = u; this.sizedDpr = dpr;
    this.cv.width = ART_W * u; this.cv.height = ART_H * u;
    this.cv.style.width = (this.cv.width / dpr) + 'px';
    this.cv.style.height = (this.cv.height / dpr) + 'px';
    this.el.style.setProperty('--vm', (M * u / dpr) + 'px');
    // art rows under the block (the shard pad): lets CSS sit the block's bottom edge on the shared HUD baseline
    this.el.style.setProperty('--vb', ((ART_H - (M + HEAD + 1 + BLOCK_H)) * u / dpr) + 'px');
  }

  /** Jump straight to the current state (new run, HUD shown again). */
  snap() {
    this.init = false;
    // drop anything left over from the last life (death static, tags, shards) so a new run starts clean
    this.sweeps.length = 0; this.shards.length = 0; this.tags.length = 0;
    this.trickle = 0; this.trickleT = 0; this.reviveT = 0; this.ghostHold = 0; this.aHold = 0;
    this.flash = this.shake = this.chroma = this.glitch = this.beatK = this.healK = this.gloryK = this.surgeK = this.numPop = this.numHeal = 0;
    this.beatTimer = 0.5; this.beatQ = -1;
  }

  setState(hp: number, max: number, armor: number, alive: boolean) {
    hp = Math.max(0, hp); max = Math.max(1, max); armor = Math.max(0, armor);
    if (!this.init) {
      this.init = true;
      this.hp = this.disp = this.fill = this.ghost = hp; this.max = max; this.armor = this.aFill = this.aGhost = armor; this.alive = alive;
      this.deathT = alive ? 0 : 1;
      return;
    }
    if (hp < this.hp) {
      // hard damage: the ghost keeps the old fill and waits; every new hit re-arms the hold
      this.ghost = Math.max(this.ghost, this.fill);
      this.fill = Math.min(this.fill, hp);
      this.ghostHold = 0.5; this.ghostVel = 0;
    } else if (hp > this.hp + 0.01) {
      const d = hp - this.hp;
      if (d >= 3) {
        this.healK = Math.min(1, 0.45 + d / 40);
        this.numHeal = 1;
        this.sweeps.push({ t: 0, dur: 0.42, c: C.green, from: 0, to: 1 });
        this.addTag(d, C.green, false);
      } else {
        // lifesteal trickles: coalesce into an edge spark + one tag
        this.trickle += d; this.trickleT = 0.5;
        this.healK = Math.max(this.healK, 0.35);
      }
    }
    if (armor < this.armor) {
      this.aGhost = Math.max(this.aGhost, this.aFill);
      this.aFill = armor; this.aHold = 0.45; this.aVel = 0;
    } else if (armor > this.armor + 0.01) {
      const d = armor - this.armor;
      if (d >= 3) { this.sweeps.push({ t: 0, dur: 0.4, c: C.steelHi, from: 0, to: 1 }); this.addTag(d, C.steel, true); }
    }
    if (alive && !this.alive) this.revive();
    this.hp = hp; this.max = max; this.armor = armor; this.alive = alive;
  }

  /** combo 1..10 and active streak level (0 when the streak window closed) */
  setEnergy(combo: number, streak: number) {
    this.energyTarget = clamp01((combo - 1) / 8 + streak * 0.12);
    this.streak = streak;
  }

  /** playerHit: punch scaled by damage (incl. armor-absorbed). */
  hit(dmg: number, armorBroke: boolean) {
    const k = clamp01(dmg / 30);
    this.flash = Math.max(this.flash, 0.5 + k * 0.5);
    this.shake = Math.max(this.shake, 0.35 + k);
    this.numPop = 1;
    if (dmg >= 18) { this.chroma = Math.max(this.chroma, 0.4 + k * 0.6); this.glitch = Math.max(this.glitch, 0.3 + k * 0.5); }
    if (armorBroke) this.burst(BAR_X + 2, PLATE_W, BAR_H + PLATE_GAP, PLATE_H, C.steelHi, 22);
  }

  /** Low-HP heartbeat (called from the same timer that plays the heartbeat sfx). */
  beat() {
    this.beatK = 1;
    this.beatQ = 0;
    this.beatTimer = 0.6; // idle beats resume promptly once HP climbs out of critical
  }

  glory() {
    this.gloryK = 1;
    this.sweeps.push({ t: 0, dur: 0.55, c: C.gold, from: 0, to: 1 });
  }

  surge(level: number) {
    this.surgeK = 1; this.surgeLvl = level;
    this.sweeps.push({ t: 0, dur: 0.35, c: level >= 3 ? [255, 255, 255] : C.amber, from: 0, to: 1 });
  }

  die() {
    this.alive = false;
    this.deathT = 0.001;
    this.glitch = 1; this.chroma = 1; this.flash = 1;
    this.burst(BAR_X + 2, Math.max(4, (this.ghost / this.max) * (BAR_W - 2)), 1, BAR_H - 2, C.red, 30);
  }

  revive() {
    this.deathT = 0;
    this.reviveT = 1.6;
    this.ghost = 0; this.fill = 0; // sweep up from nothing
    this.sweeps.push({ t: 0, dur: 0.6, c: C.gold, from: 0, to: 1 });
    this.gloryK = 1;
  }

  private addTag(n: number, c: RGB, armor: boolean) {
    const t = this.tags.find((x) => x.armor === armor && x.t < 0.35);
    if (t) { t.n += n; t.t = 0; } else this.tags.push({ n, t: 0, c, armor });
    if (this.tags.length > 3) this.tags.shift();
  }

  private burst(x: number, w: number, y: number, h: number, c: RGB, n: number) {
    for (let i = 0; i < n; i++) {
      this.shards.push({
        x: x + Math.random() * w, y: y + Math.random() * h,
        vx: (Math.random() - 0.3) * 60, vy: -20 - Math.random() * 50, life: 0.5 + Math.random() * 0.5,
        c: mix(c, [255, 255, 255], Math.random() * 0.5),
      });
    }
  }

  // ─────────────────────────── per frame ───────────────────────────

  draw(lookDX = 0, lookDY = 0) {
    const now = performance.now() / 1000;
    const dt = this.last ? Math.min(0.1, now - this.last) : 1 / 60;
    this.last = now;
    this.time += dt;
    if (document.body.classList.contains('touch') !== this.touch || (window.devicePixelRatio || 1) !== this.rawDpr) { this.rawDpr = window.devicePixelRatio || 1; this.resize(); } // touch switches on lazily; DPR changes across monitors
    const mot = this.reduced.matches ? 0 : clamp01(this.motion);
    const frac = this.hp / this.max;
    const crit = this.alive && frac < 0.3 ? 1 - frac / 0.3 : 0;
    const critOn = this.alive && frac < 0.3;

    // ── simulate
    if (this.hp < this.disp) this.disp = Math.max(this.hp, this.disp - Math.max(140 * dt, (this.disp - this.hp) * 16 * dt));
    else if (this.hp > this.disp) this.disp = Math.min(this.hp, this.disp + Math.max(45 * dt, (this.hp - this.disp) * 7 * dt));
    if (this.fill < this.hp) this.fill = Math.min(this.hp, this.fill + Math.max(30 * dt, (this.hp - this.fill) * 6 * dt) * (this.max / 100));
    else this.fill = this.hp;
    if (this.ghostHold > 0) this.ghostHold -= dt;
    else if (this.ghost > this.fill) { this.ghostVel += this.max * 2.2 * dt; this.ghost = Math.max(this.fill, this.ghost - this.ghostVel * dt); }
    this.ghost = Math.max(this.ghost, this.fill);
    if (this.aFill < this.armor) this.aFill = Math.min(this.armor, this.aFill + Math.max(40 * dt, (this.armor - this.aFill) * 7 * dt));
    else this.aFill = this.armor;
    if (this.aHold > 0) this.aHold -= dt;
    else if (this.aGhost > this.aFill) { this.aVel += 260 * dt; this.aGhost = Math.max(this.aFill, this.aGhost - this.aVel * dt); }
    this.aGhost = Math.max(this.aGhost, this.aFill);

    const decay = (v: number, r: number) => v * Math.exp(-r * dt);
    this.flash = decay(this.flash, 9); this.shake = decay(this.shake, 10); this.chroma = decay(this.chroma, 6); this.glitch = decay(this.glitch, 7);
    this.beatK = decay(this.beatK, 7); this.healK = decay(this.healK, 3.5); this.gloryK = decay(this.gloryK, 2.6); this.surgeK = decay(this.surgeK, 3);
    this.numPop = decay(this.numPop, 12); this.numHeal = decay(this.numHeal, 3);
    this.energy += (this.energyTarget - this.energy) * Math.min(1, dt * 4);
    this.shimmer = (this.shimmer + dt * (0.35 + this.energy * 1.6)) % 1.6;
    if (this.reviveT > 0) this.reviveT -= dt;
    if (this.deathT > 0) this.deathT += dt;
    if (this.trickleT > 0) { this.trickleT -= dt; if (this.trickleT <= 0 && this.trickle >= 1) { this.addTag(this.trickle, C.green, false); this.trickle = 0; } }
    for (const s of this.sweeps) s.t += dt;
    if (this.sweeps.some((s) => s.t >= s.dur)) this.sweeps = this.sweeps.filter((s) => s.t < s.dur);
    for (const t of this.tags) t.t += dt;
    if (this.tags.length && this.tags[0].t >= 1.1) this.tags = this.tags.filter((t) => t.t < 1.1);
    for (const s of this.shards) { s.life -= dt; s.vy += 140 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    if (this.shards.length) this.shards = this.shards.filter((s) => s.life > 0);

    // heart trace: rate follows HP and aggression; under 30% the game's heartbeat drives it (synced to the sfx)
    this.traceAcc += dt * 34;
    if (this.alive && !critOn) {
      this.beatTimer -= dt;
      if (this.beatTimer <= 0) { this.beatQ = 0; this.beatTimer = 60 / (62 + (1 - frac) * 50 + this.energy * 70); }
    }
    while (this.traceAcc >= 1) {
      this.traceAcc -= 1;
      this.trace.copyWithin(0, 1);
      let v = 0;
      if (this.alive && this.beatQ >= 0) {
        v = QRS[this.beatQ] * (critOn ? 1.15 : 0.8 + this.energy * 0.3);
        if (++this.beatQ >= QRS.length) this.beatQ = -1;
      } else if (!this.alive) v = Math.random() < 0.04 && this.deathT < 2 ? (Math.random() - 0.5) * 2 : 0;
      else v = Math.random() < 0.06 ? (Math.random() < 0.5 ? -0.6 : 0.6) : 0;
      this.trace[TRACE_W - 1] = v;
    }

    // ── widget transform: hit shake, heartbeat thump, look parallax (compositor only)
    const jit = this.shake * 7 * mot;
    if (jit > 0.05) { this.sx = (Math.random() * 2 - 1) * jit; this.sy = (Math.random() * 2 - 1) * jit * 0.6; } else { this.sx = this.sy = 0; }
    this.sway.x += (Math.max(-1, Math.min(1, -lookDX * 0.04)) * 5 * mot - this.sway.x) * Math.min(1, dt * 6);
    this.sway.y += (Math.max(-1, Math.min(1, -lookDY * 0.04)) * 3 * mot - this.sway.y) * Math.min(1, dt * 6);
    const sc = 1 + this.beatK * 0.035 * mot + this.numPop * 0.015 * mot;
    const tf = `translate(${(this.sx + this.sway.x).toFixed(1)}px,${(this.sy + this.sway.y).toFixed(1)}px) scale(${sc.toFixed(3)})`;
    if (tf !== this.lastTf) { this.lastTf = tf; this.el.style.transform = tf; }
    const op = (1 - this.dim * 0.3).toFixed(2);
    if (this.el.style.opacity !== op) this.el.style.opacity = op;

    // ── block: number box + bar + plating, unslanted at 1 art px
    // written straight into a pixel buffer (one putImageData per frame instead of ~500 fillRect + fillStyle parses)
    this.pd.fill(0);
    const P = this.put;
    const dead = this.deathT > 0 ? Math.min(1, this.deathT * 1.5) : 0;
    const desat = (c: RGB) => (dead > 0 ? grey(c, dead) : c);

    // number box
    P(0, 0, BOX_W, BLOCK_H, [10, 6, 6], 0.88);
    const boxC = desat(critOn ? mix([90, 10, 13], C.red, this.beatK) : [90, 10, 13]);
    P(0, 0, BOX_W, 1, boxC); P(0, BLOCK_H - 1, BOX_W, 1, boxC); P(0, 0, 1, BLOCK_H, boxC); P(BOX_W - 1, 0, 1, BLOCK_H, boxC);
    P(1, 1, BOX_W - 2, 1, desat(mix(C.red, [255, 255, 255], this.flash * 0.6)));

    // health bar
    const inner = BAR_W - 2;
    // one cell per 10 HP; past 140 max (VITALITY stacks) one per 20, so cells never shrink below ~6 art px
    const cells = Math.max(5, Math.min(14, Math.round(this.max / (this.max > 140 ? 20 : 10))));
    P(BAR_X, 0, BAR_W, BAR_H, BLACK);
    const fx = (this.fill / this.max) * inner, hx = (this.hp / this.max) * inner, gx = (this.ghost / this.max) * inner;
    const shimX = (this.shimmer - 0.3) * inner; // band centre, travels past the end
    const shimA = 0.12 + this.energy * 0.75;
    const rowsHi = 2, rowsLo = 2;
    for (let x = 0; x < inner; x++) {
      const cellEdge = cells > 1 && Math.floor(((x + 1) * cells) / inner) !== Math.floor((x * cells) / inner) && x < inner - 1;
      const px = BAR_X + 1 + x;
      let body: RGB, alpha = 1;
      const cx = x + 0.5;
      if (cx <= fx) {
        // live fill: red, heartbeat strobe when critical, combo shimmer, sweeps
        // aggression heats the fill toward orange and runs a ripple through the cells
        body = mix(C.red, [255, 96, 36], this.energy * 0.4);
        if (this.energy > 0.15) body = mix(body, [255, 200, 120], (this.energy - 0.15) * 0.45 * Math.max(0, Math.sin(x * 0.32 - this.time * 13)) ** 3);
        if (critOn) body = mix(body, [255, 58, 42], 0.5 + 0.5 * Math.sin(this.time * 9));
        const sd = Math.abs(cx - shimX);
        if (sd < 6) body = mix(body, this.streak >= 3 ? [255, 240, 200] : C.amber, (1 - sd / 6) * shimA);
        if (this.energy > 0.55 && ((x + Math.floor(this.time * 30)) % 9) === 0) body = mix(body, [255, 220, 160], (this.energy - 0.55) * 1.6);
        body = mix(body, [255, 255, 255], this.beatK * 0.55 + this.flash * 0.25);
        // corruption: whole cells blink out for a moment, more often the lower you are
        if (crit > 0.25 && hash(Math.floor((x * cells) / inner), Math.floor(this.time * 11)) < crit * 0.12) body = [70, 10, 12];
      } else if (cx <= hx) {
        body = mix(C.green, [255, 255, 255], 0.25 * Math.sin(this.time * 20) ** 2);
      } else if (cx <= gx) {
        body = this.ghostHold > 0.38 ? [255, 255, 255] : C.bone;
        alpha = 0.72 + (x % 2) * 0.18;
      } else {
        body = [36, 9, 9];
      }
      for (const s of this.sweeps) {
        const p = s.t / s.dur, edge = p * (inner + 14) - 7;
        const d = Math.abs(x - edge);
        if (d < 5 && cx <= Math.max(gx, hx) + 1) body = mix(body, s.c, (1 - d / 5) * (1 - p * 0.5));
      }
      body = desat(body);
      if (cellEdge) continue; // the black border shows through
      const filled = cx <= Math.max(gx, hx);
      P(px, 1, 1, rowsHi, filled ? mix(body, [Math.max(C.redHi[0], body[0]), Math.max(C.redHi[1], body[1]), Math.max(C.redHi[2], body[2])], 0.6) : [48, 13, 13], alpha);
      P(px, 1 + rowsHi, 1, BAR_H - 2 - rowsHi - rowsLo, body, alpha);
      P(px, BAR_H - 1 - rowsLo, 1, rowsLo, filled ? mix(body, BLACK, 0.45) : [26, 6, 7], alpha);
    }
    // leading edge spark (heals, trickles)
    if (this.healK > 0.02 && this.alive) {
      const ex = BAR_X + 1 + Math.min(inner - 1, Math.round(hx));
      P(ex - 1, 0, 2, BAR_H, mix(C.green, [255, 255, 255], 0.5), this.healK);
    }
    // death: static eats the bar right to left
    if (dead > 0) {
      const reach = inner * Math.min(1, this.deathT * 0.7);
      for (let i = 0; i < 26; i++) {
        const x = inner - Math.random() * reach;
        const lit = Math.random() < 0.5;
        P(BAR_X + 1 + (x | 0), 1 + ((Math.random() * (BAR_H - 2)) | 0), 1 + ((Math.random() * 3) | 0), 1, lit ? STATIC : BLACK, lit ? 0.5 : 0.6);
      }
    }

    // plating (armor), segmented by 10
    const py = BAR_H + PLATE_GAP;
    const showPlate = this.armor > 0 || this.aGhost > 0.5;
    P(BAR_X, py, PLATE_W, PLATE_H, BLACK);
    const pin = PLATE_W - 2;
    const af = (this.aFill / 100) * pin, ag = (this.aGhost / 100) * pin;
    for (let x = 0; x < pin; x++) {
      const edge = Math.floor(((x + 1) * 10) / pin) !== Math.floor((x * 10) / pin) && x < pin - 1;
      if (edge) continue;
      const cx = x + 0.5;
      let c: RGB = [16, 22, 34];
      if (cx <= af) c = mix(C.steel, [255, 255, 255], this.flash * 0.3);
      else if (cx <= ag) c = this.aHold > 0.3 ? [255, 255, 255] : [200, 225, 245];
      for (const s of this.sweeps) { const p = s.t / s.dur, d = Math.abs(x - p * (pin + 10) + 5); if (d < 4 && cx <= af) c = mix(c, [255, 255, 255], (1 - d / 4) * 0.8); }
      c = desat(c);
      P(BAR_X + 1 + x, py + 1, 1, 1, cx <= ag ? mix(c, [255, 255, 255], 0.35) : c);
      P(BAR_X + 1 + x, py + 2, 1, PLATE_H - 3, cx <= ag ? c : [10, 14, 22]);
      if (!showPlate) P(BAR_X + 1 + x, py + 1, 1, PLATE_H - 2, BLACK, 0.4);
    }

    this.bg.putImageData(this.img, 0, 0);

    // ── compose onto the widget canvas
    const g = this.g, u = this.u;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.cv.width, this.cv.height);
    g.imageSmoothingEnabled = false;
    const oy = M + HEAD + 1;
    // row slicing is motion: it follows the comfort setting all the way to zero (colour cues stay)
    const glitchK = Math.max(this.glitch, crit * 0.35, dead * 0.5 * (this.deathT < 1.5 ? 1 : 0.3)) * mot;
    // glow behind the bar: streak heat, glory gold, critical red
    const glowC = this.gloryK > 0.05 ? C.gold : critOn ? C.red : this.streak >= 3 ? [255, 90, 30] : C.amber;
    const glowA = Math.max(this.gloryK * 0.7, this.surgeK * 0.5, critOn ? 0.18 + this.beatK * 0.5 : 0, this.energy > 0.25 ? (this.energy - 0.25) * 0.9 : 0) * (1 - dead);
    if (glowA > 0.02) {
      g.save();
      g.shadowColor = css(glowC, Math.min(1, glowA));
      g.shadowBlur = (8 + glowA * 14) * u / 3;
      g.fillStyle = css(glowC, Math.min(1, glowA) * 0.5);
      for (let r = 0; r < BAR_H; r += 2) g.fillRect((M + BAR_X + this.slant(r)) * u, (oy + r) * u, BAR_W * u, 2 * u);
      g.restore();
    }
    const tintCopy = (c: string) => {
      const t = this.tg; t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, BLOCK_W, BLOCK_H);
      t.drawImage(this.blk, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = c; t.fillRect(0, 0, BLOCK_W, BLOCK_H);
      return this.tint;
    };
    const blit = (src: CanvasImageSource, dx: number, alpha: number, glitchRows: boolean) => {
      g.globalAlpha = alpha;
      for (let r = 0; r < BLOCK_H; r++) {
        let off = this.slant(r) + dx;
        if (glitchRows && glitchK > 0.05 && Math.random() < glitchK * 0.35) off += Math.round((Math.random() * 2 - 1) * (1 + glitchK * 4));
        g.drawImage(src, 0, r, BLOCK_W - SLANT, 1, (M + off) * u, (oy + r) * u, (BLOCK_W - SLANT) * u, u);
      }
      g.globalAlpha = 1;
    };
    const ch = this.chroma * (0.5 + 0.5 * mot) + (dead > 0 && this.deathT < 1.5 ? 0.6 : 0) + crit * 0.25 * (this.beatK > 0.3 ? 1 : 0);
    if (ch > 0.08) {
      const d = Math.max(1, Math.round(ch * 2));
      g.globalCompositeOperation = 'source-over';
      blit(tintCopy('rgba(255,30,40,1)'), -d, Math.min(0.7, ch), true);
      blit(tintCopy('rgba(40,220,255,1)'), d, Math.min(0.55, ch * 0.8), true);
    }
    blit(this.blk, 0, 1, true);

    // shards
    for (const s of this.shards) {
      const a = Math.min(1, s.life * 2);
      g.fillStyle = css(s.c, a);
      g.fillRect(Math.round((M + s.x + this.slant(Math.max(0, Math.min(BLOCK_H - 1, s.y)))) ) * u, Math.round(oy + s.y) * u, u, u);
    }

    // ── header: label + heart trace
    const headY = M + HEAD - 1;
    const labX = (M + this.slant(0) + 1) * u; // header spans the whole block: label over the box, trace over the bar end
    let label = 'INTEGRITY';
    let labC: RGB = [170, 150, 135];
    if (dead > 0) { label = Math.floor(this.time * 3) % 2 ? 'SIGNAL LOST' : 'SIGNAL L0ST'; labC = C.red; }
    else if (this.reviveT > 0) { label = 'SAMPLE RESTORED'; labC = C.gold; }
    else if (critOn) { label = Math.floor(this.time * 4) % 2 || crit > 0.7 ? 'INTEGRITY CRITICAL' : 'INTEGRITY CR1T1CAL'; labC = mix(C.red, [255, 255, 255], this.beatK * 0.6); }
    else if (this.gloryK > 0.2) { label = 'INTEGRITY +GLORY'; labC = C.gold; }
    else if (this.streak >= 3) { label = 'INTEGRITY OVERDRIVE'; labC = mix(C.amber, [255, 255, 255], 0.5 + 0.5 * Math.sin(this.time * 12)); }
    g.font = `${Math.round(u * 7)}px ${VT}`;
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = '#000'; g.fillText(label, labX + u * 0.6, headY * u + u * 0.6);
    g.fillStyle = css(labC); g.fillText(label, labX, headY * u);
    const labEnd = labX + g.measureText(label).width;

    // trace
    const tx0 = M + BLOCK_W - TRACE_W - 1, ty = M + 4;
    const trC: RGB = dead > 0 ? [120, 40, 40] : critOn ? mix(C.red, [255, 255, 255], this.beatK * 0.5) : mix(C.green, C.amber, this.energy * 0.6);
    for (let i = 0; i < TRACE_W; i++) {
      const v = Math.round(this.trace[i]);
      const fade = 0.25 + 0.75 * (i / TRACE_W);
      g.fillStyle = css(trC, fade);
      const y0 = Math.min(0, v), y1 = Math.max(0, v);
      g.fillRect((tx0 + i) * u, (ty + y0) * u, u, (y1 - y0 + 1) * u);
    }
    g.fillStyle = css(trC, 0.9 + 0.1 * Math.sin(this.time * 20)); g.fillRect((tx0 + TRACE_W) * u, (ty + Math.round(this.trace[TRACE_W - 1]) - 0) * u, u, u);

    // ── number (device-res pixel font, size on an 8 px grid so Press Start 2P stays crisp)
    // 3 glyphs must fit the box minus its slant (the box leans ~5 art px across the text height)
    const nSize = 8 * Math.max(1, Math.min(Math.round((u * 10.5) / 8), Math.floor(((BOX_W - 7) * u + 3) / 24)));
    const n = Math.max(0, Math.ceil(this.disp - 0.001));
    const txt = String(dead > 0 ? 0 : n);
    g.font = `${nSize}px ${PX}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const ncx = (M + this.slant(BLOCK_H / 2) + BOX_W / 2 + 0.5) * u, ncy = (oy + BLOCK_H / 2 + 0.6) * u;
    let numC: RGB = C.bone;
    if (critOn) numC = mix(C.red, [255, 120, 100], 0.5 + 0.5 * Math.sin(this.time * 9));
    if (this.numHeal > 0.05) numC = mix(numC, C.green, this.numHeal);
    numC = mix(numC, [255, 255, 255], Math.max(this.numPop, this.beatK * 0.6));
    if (dead > 0) numC = [90, 80, 78];
    const ps = 1 + this.numPop * 0.18;
    g.save();
    g.translate(Math.round(ncx), Math.round(ncy)); g.scale(ps, ps);
    if (ch > 0.08) {
      const d = Math.max(1, Math.round(ch * 2)) * u;
      g.globalAlpha = Math.min(0.8, ch); g.fillStyle = '#ff1e28'; g.fillText(txt, -d, 0);
      g.fillStyle = '#28dcff'; g.fillText(txt, d, 0); g.globalAlpha = 1;
    }
    g.fillStyle = '#000'; g.fillText(txt, u, u);
    g.fillStyle = css(numC); g.fillText(txt, 0, 0);
    g.restore();

    // armor value at the right of the plating strip
    // small readouts in VT323: legible at phone sizes, no 8 px grid to respect
    const aSize = Math.round(u * 6.5);
    if (showPlate) {
      g.font = `${aSize}px ${VT}`; g.textAlign = 'left'; g.textBaseline = 'middle';
      const ay = (oy + BAR_H + PLATE_GAP + PLATE_H / 2) * u;
      const ax = (M + BAR_X + PLATE_W + this.slant(BAR_H + PLATE_GAP + 1) + 2) * u;
      const aTxt = this.armor > 0 ? Math.ceil(this.armor) + ' PLATE' : 'BROKEN';
      g.fillStyle = '#000'; g.fillText(aTxt, ax + u * 0.7, ay + u * 0.7);
      g.fillStyle = css(desat(mix(C.steel, [255, 255, 255], Math.max(this.flash * 0.4, this.aHold > 0 ? 0.6 : 0))));
      g.fillText(aTxt, ax, ay);
    }

    // floating +N tags: in the header right after the label, newest first
    g.font = `${Math.round(u * 7.5)}px ${VT}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    let tx = labEnd + 4 * u;
    for (let i = this.tags.length - 1; i >= 0; i--) {
      const t = this.tags[i];
      const k = t.t / 1.1;
      const a = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      const s = '+' + Math.round(t.n);
      const x = tx;
      if (x + g.measureText(s).width > (tx0 - 2) * u) break; // no room before the trace (long label)
      tx += g.measureText(s).width + 3 * u;
      const y = (headY - k * 3) * u;
      g.fillStyle = `rgba(0,0,0,${a})`; g.fillText(s, x + u * 0.7, y + u * 0.7);
      g.fillStyle = css(mix(t.c, [255, 255, 255], k < 0.15 ? 0.6 : 0), a); g.fillText(s, x, y);
    }
  }

  /** source-over fill of an art-pixel rect in the block buffer (same result as fillRect with an rgba colour) */
  private put = (x: number, y: number, w: number, h: number, c: RGB, a = 1) => {
    const d = this.pd;
    const x0 = Math.max(0, x | 0), x1 = Math.min(BLOCK_W, (x + w) | 0), y0 = Math.max(0, y | 0), y1 = Math.min(BLOCK_H, (y + h) | 0);
    if (a <= 0) return;
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * BLOCK_W + xx) * 4;
        if (a >= 1) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; continue; }
        const da = d[i + 3] / 255, oa = a + da * (1 - a);
        const kd = (da * (1 - a)) / oa, ks = a / oa;
        d[i] = c[0] * ks + d[i] * kd; d[i + 1] = c[1] * ks + d[i + 1] * kd; d[i + 2] = c[2] * ks + d[i + 2] * kd; d[i + 3] = oa * 255;
      }
    }
  };

  /** row → horizontal offset of the "/" lean (row 0 = top of the block) */
  private slant(r: number) { return Math.floor((BLOCK_H - 1 - r) / 2); }
}
