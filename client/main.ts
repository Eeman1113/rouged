// ROUGED — app shell. Title → Hub → Run → Death → Hub. The loop is the point.

import { World } from './world';
import { Game } from './game';
import { Hub } from './hub';
import { LocalTransport, WsTransport, defaultServerUrl, Transport } from './net';
import { loadMeta, saveMeta, applyRun, metaLevel, Meta } from './meta';
import { audio } from './audio/engine';
import { sfx } from './audio/sfx';
import { music } from './audio/music';
import type { Difficulty, RunSummary } from '../shared/protocol';
import { normalizeSeed } from '../shared/rng';
import { newUnlocks, UNLOCKS } from '../server/progression';
import { DEATH_TITLES, FRAGMENTS, REVEAL_SCRIPT, EXTRACT_SCRIPT, SYNERGY_LORE, ENEMY_CODEX, Fragment } from './story/fragments';
import { SYNERGIES } from '../shared/powerupDefs';
import { handlerLine } from './story/handlerLines';
import { esc } from './hud/killfeed';
import {
  valorantToRouged, rougedToValorant, cmPer360, VALORANT_VFOV,
  presetSens, PRESET_LABELS, classifySens, type SensPreset, type NamedPreset,
} from './sensitivity';
import { BTN, DualSenseHID } from './gamepad';

type Mode = 'title' | 'hub' | 'run' | 'death' | 'reveal' | 'lobby';

class App {
  world = new World();
  meta: Meta = loadMeta();
  mode: Mode = 'title';
  hub: Hub | null = null;
  game: Game | null = null;
  screens = document.getElementById('screens')!;
  overlay: HTMLDivElement | null = null;
  paused = false;
  coop = false;
  seedInput = '';
  last = performance.now();
  private terminalOpen = false;

  constructor() {
    this.world.applySettings(this.meta);
    this.world.input.onPause = () => this.togglePause();
    this.world.input.onLockChange = (locked) => {
      if (!locked && (this.mode === 'run' || this.mode === 'hub') && !this.paused && !this.terminalOpen) this.togglePause(true);
    };
    document.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
    document.addEventListener('keydown', () => audio.unlock(), { capture: true });
    document.getElementById('gl')!.addEventListener('click', () => {
      if ((this.mode === 'run' || this.mode === 'hub') && !this.paused && !this.world.input.locked) this.world.input.requestLock();
    });
    this.world.input.pad.onConnect = () => { if (this.mode === 'title' && this.splashDone && this.overlay?.querySelector('.mm')) this.showMenu(); };
    this.world.input.pad.hid.onChange = () => { if (this.mode === 'title' && this.splashDone && this.overlay?.querySelector('.mm')) this.showMenu(); };
    this.showTitle();
    requestAnimationFrame((t) => this.frame(t));
    // dev hooks for automated testing
    (window as unknown as { rouged: unknown }).rouged = this;
  }

  frame(t: number) {
    const dt = Math.min(0.1, (t - this.last) / 1000);
    this.last = t;
    try {
      const gameplay = (this.mode === 'run' || this.mode === 'hub') && !this.paused && !this.terminalOpen;
      this.world.input.pollPad(dt, gameplay);
      if (!gameplay) this.menuNav();
      if (this.mode === 'run' && this.game) {
        this.game.paused = this.paused;
        this.game.update(dt);
      } else if (this.mode === 'hub' && this.hub) {
        this.hub.paused = this.paused || this.terminalOpen;
        this.hub.update(dt);
      } else if (this.mode === 'title' || this.mode === 'death' || this.mode === 'lobby' || this.mode === 'reveal') {
        // slow idle camera drift behind menus
        const lp = this.world.player;
        lp.yaw += dt * 0.05;
        this.world.map.update(dt);
        this.world.r.update(dt);
        this.world.updateFx(dt);
        this.world.updateCamera(dt, 0);
        this.world.render();
        if (this.mode === 'lobby' && this.game) this.game.net.update(dt, 1);
        this.world.input.endFrame();
      }
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame((tt) => this.frame(tt));
  }

  // ───────────────────────────── screens ─────────────────────────────

  setScreen(html: string, cls = 'dim'): HTMLDivElement {
    this.clearScreen();
    const d = document.createElement('div');
    d.className = 'screen ' + cls;
    d.innerHTML = html;
    this.screens.appendChild(d);
    this.overlay = d;
    d.querySelectorAll('button').forEach((b) => {
      b.addEventListener('mouseenter', () => sfx.uiHover());
      b.addEventListener('click', () => sfx.uiClick());
    });
    return d;
  }

  clearScreen() {
    this.overlay?.remove();
    this.overlay = null;
  }

  private splashDone = false;

  showTitle() {
    this.mode = 'title';
    this.disposeGame();
    this.disposeHub();
    this.world.hud.show(false);
    this.world.input.pad.hid.setTriggers({ mode: 'off' }, { mode: 'off' });
    // backdrop: the hub, empty
    const backdrop = new Hub(this.world, this.meta, { onDeploy: () => {}, onTerminal: () => {} }, true);
    backdrop.dispose();
    music.setBiome('hub');
    this.world.player.teleport(0, 0, 3.5, 0.3);
    if (!this.splashDone) { this.showSplash(); return; }
    this.showMenu();
  }

  /** "Press any button" — wakes audio and the controller (browsers hide pads until a press). */
  showSplash() {
    const d = this.setScreen(`
      <div class="title-logo">ROUGED</div>
      <div class="title-tag">"You were scanned. You were copied. You were told this was training.<br/>It was never training."</div>
      <div class="press-any">PRESS ANY BUTTON</div>
      <div class="splash-foot">KEYBOARD + MOUSE · DUALSENSE · TOUCH</div>`, 'menu-bg');
    const go = () => {
      window.removeEventListener('keydown', go); window.removeEventListener('pointerdown', go);
      if (this.splashDone) return;
      this.splashDone = true;
      audio.unlock();
      sfx.uiClick();
      this.showMenu();
    };
    setTimeout(() => { window.addEventListener('keydown', go); window.addEventListener('pointerdown', go); }, 150);
    this.splashGo = go;
    void d;
  }
  private splashGo: (() => void) | null = null;

  showMenu() {
    this.mode = 'title';
    const lv = metaLevel(this.meta);
    const fresh = this.meta.runCount === 0;
    const pad = this.world.input.pad.state;
    const hid = this.world.input.pad.hid;
    const d = this.setScreen(`
      <div class="mm">
        <div class="mm-left">
          <div class="title-logo mm-logo">ROUGED</div>
          <div class="mm-sub">NEURAL SCAN TRANSFER // COMBAT EVALUATION ${fresh ? 'v1' : 'CYCLE ' + (this.meta.runCount + 1)}</div>
          <nav class="mm-nav">
            <button class="mm-item primary" id="b-solo"><span>${fresh ? 'WAKE UP' : 'CONTINUE THE LOOP'}</span><i>${fresh ? 'begin evaluation' : 'run ' + (this.meta.runCount + 1)}</i></button>
            <button class="mm-item" id="b-coop"><span>CO-OP DEPLOY</span><i>1–4 subjects · shared seed</i></button>
            <button class="mm-item" id="b-config"><span>RUN CONFIG</span><i>${esc(this.meta.difficulty.toUpperCase())} · SEED ${esc(this.seedInput || 'RANDOM')}</i></button>
            <button class="mm-item" id="b-controls"><span>CONTROLS</span><i>keyboard · dualsense · touch</i></button>
            <button class="mm-item" id="b-codex"><span>CODEX</span><i>${this.meta.fragments.length}/${FRAGMENTS.length} fragments</i></button>
            <button class="mm-item" id="b-settings"><span>SETTINGS</span><i>video · audio · controller</i></button>
            <button class="mm-item" id="b-credits"><span>CREDITS</span><i>about this simulation</i></button>
          </nav>
        </div>
        <div class="mm-right panel">
          <h2>SUBJECT FILE</h2>
          <div class="mm-name">${esc(this.meta.name)}</div>
          <div class="mm-lv">LEVEL ${lv.level}</div>
          <div class="death-xp" style="width:100%"><div class="bar"><i style="width:${(lv.into / lv.need * 100).toFixed(1)}%"></i></div><div class="lv">${lv.into} / ${lv.need} XP</div></div>
          <div class="kv">
            <div class="k">RUNS LOGGED</div><div class="v">${this.meta.runCount}</div>
            <div class="k">TERMINATIONS</div><div class="v">${this.meta.deaths}</div>
            <div class="k">EXTRACTIONS</div><div class="v">${this.meta.extractions}</div>
            <div class="k">DEEPEST</div><div class="v gold">${this.meta.deepest ? 'DEPTH ' + this.meta.deepest : '—'}</div>
            <div class="k">BEST SCORE</div><div class="v gold">${this.meta.bestScore.toLocaleString()}</div>
            <div class="k">BEST MULTIPLIER</div><div class="v gold">x${this.meta.bestCombo}</div>
            <div class="k">TOTAL KILLS</div><div class="v">${this.meta.totalKills}</div>
            <div class="k">SYNERGIES</div><div class="v">${this.meta.synergies.length}/${SYNERGIES.length}</div>
            <div class="k">CORES</div><div class="v">${this.meta.cores}</div>
          </div>
          <div class="mm-quote">"${esc(handlerLine('hubIdle', this.meta.runCount, { name: this.meta.name, run: this.meta.runCount + 1 }) ?? 'Hub secure.')}"</div>
        </div>
      </div>
      <div class="mm-foot"><span id="pad-status">${pad.connected ? '🎮 ' + esc(shortPad(pad.id)) + (hid.connected ? ' · PRO FEATURES ON' : '') : 'NO CONTROLLER · CONNECT A DUALSENSE AND PRESS ANY BUTTON'}</span><span>${this.world.input.padActive ? '✕ SELECT · ◯ BACK' : 'CLICK / ENTER SELECT · ESC BACK'}</span></div>`, 'menu-bg');
    (d.querySelector('#b-solo') as HTMLElement).onclick = () => { this.coop = false; this.enterHub(); };
    (d.querySelector('#b-coop') as HTMLElement).onclick = () => this.showCoop();
    (d.querySelector('#b-config') as HTMLElement).onclick = () => this.showConfig();
    (d.querySelector('#b-controls') as HTMLElement).onclick = () => this.showControls();
    (d.querySelector('#b-codex') as HTMLElement).onclick = () => this.showCodex(() => this.showMenu());
    (d.querySelector('#b-settings') as HTMLElement).onclick = () => this.showSettings(() => this.showMenu());
    (d.querySelector('#b-credits') as HTMLElement).onclick = () => this.showCredits();
    this.focusFirst();
  }

  showConfig() {
    const lv = metaLevel(this.meta);
    const diffs: [Difficulty, number, string][] = [['easy', 1, 'bots miss more'], ['normal', 1, 'as designed'], ['hard', 7, 'they learned'], ['nightmare', 20, 'they learned from you']];
    const d = this.setScreen(`<div class="panel"><h2>RUN CONFIG</h2>
      <label class="field">SEED (SHARE IT: "TRY SEED F4NG_17")<input id="i-seed" placeholder="RANDOM" maxlength="12" value="${esc(this.seedInput)}"/></label>
      <h3>DIFFICULTY</h3>
      <div class="menu" style="width:100%">${diffs.map(([k, l, t]) => `<button class="btn ${this.meta.difficulty === k ? 'primary' : ''}" data-diff="${k}" ${lv.level < l ? 'disabled' : ''}>${k.toUpperCase()} — ${lv.level < l ? 'UNLOCKS AT LV ' + l : t}</button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn small" id="b-rand">RANDOM SEED</button><button class="btn primary small" id="b-back" data-back>DONE</button></div></div>`);
    const seed = d.querySelector('#i-seed') as HTMLInputElement;
    d.querySelectorAll<HTMLElement>('[data-diff]').forEach((b) => b.onclick = () => {
      this.meta.difficulty = b.dataset.diff as Difficulty; saveMeta(this.meta);
      d.querySelectorAll('[data-diff]').forEach((x) => x.classList.toggle('primary', x === b));
    });
    (d.querySelector('#b-rand') as HTMLElement).onclick = () => { seed.value = ''; };
    (d.querySelector('#b-back') as HTMLElement).onclick = () => { this.seedInput = normalizeSeed(seed.value); this.showMenu(); };
    this.focusFirst();
  }

  showCoop() {
    const url = this.meta.settings.serverUrl || defaultServerUrl();
    const d = this.setScreen(`<div class="panel"><h2>CO-OP DEPLOY</h2>
      <p>Drop-in co-op for 1–4 subjects. Shared seed, shared multiplier, individual powerups. The run starts when 4 join, after 15s, or when the host begins.</p>
      <label class="field">SIMULATION SERVER<input id="i-srv" value="${esc(url)}" placeholder="ws://host:8787"/></label>
      <p class="hint" style="text-align:left">Host one with <b>npm run server</b> (port 8787). On HTTPS pages use a <b>wss://</b> address.</p>
      <div class="row"><button class="btn primary" id="b-join">DEPLOY</button><button class="btn" id="b-back" data-back>BACK</button></div></div>`);
    (d.querySelector('#b-join') as HTMLElement).onclick = () => {
      this.meta.settings.serverUrl = (d.querySelector('#i-srv') as HTMLInputElement).value.trim();
      saveMeta(this.meta);
      this.coop = true;
      this.startRun(true);
    };
    (d.querySelector('#b-back') as HTMLElement).onclick = () => this.showMenu();
    this.focusFirst();
  }

  showControls() {
    const hid = this.world.input.pad.hid;
    const hidOk = DualSenseHID.supported();
    const d = this.setScreen(`<div class="panel wide"><h2>CONTROLS</h2>
      <div class="ctl-grid">
        <div><h3>KEYBOARD + MOUSE</h3><div class="kv">
          <div class="k">MOVE</div><div class="v">W A S D</div>
          <div class="k">AIM</div><div class="v">MOUSE</div>
          <div class="k">FIRE / CHARGE LANCE</div><div class="v">LMB (HOLD)</div>
          <div class="k">AIM / SCOPE</div><div class="v">RMB (HOLD)</div>
          <div class="k">GLORY KILL</div><div class="v">F</div>
          <div class="k">SPRINT (HOLD)</div><div class="v">SHIFT</div>
          <div class="k">JUMP (HOLD = BHOP) · MANTLE</div><div class="v">SPACE</div>
          <div class="k">CROUCH · SLIDE</div><div class="v">CTRL / C</div>
          <div class="k">DASH</div><div class="v">ALT / V / MOUSE 4-5</div>
          <div class="k">USE / TAKE POWERUP</div><div class="v">E</div>
          <div class="k">WEAPONS</div><div class="v">1-4 · WHEEL · Q</div>
          <div class="k">PAUSE</div><div class="v">ESC</div>
        </div></div>
        <div><h3>DUALSENSE</h3><div class="kv">
          <div class="k">MOVE / AIM</div><div class="v">L STICK / R STICK</div>
          <div class="k">FIRE</div><div class="v">R2</div>
          <div class="k">AIM / SCOPE</div><div class="v">L2</div>
          <div class="k">GLORY KILL</div><div class="v">R3</div>
          <div class="k">SPRINT (TOGGLE)</div><div class="v">L3</div>
          <div class="k">JUMP (HOLD = BHOP) · MANTLE</div><div class="v">✕</div>
          <div class="k">CROUCH · SLIDE</div><div class="v">◯</div>
          <div class="k">USE / TAKE POWERUP</div><div class="v">□</div>
          <div class="k">LAST WEAPON / NEXT</div><div class="v">△ / R1</div>
          <div class="k">DASH</div><div class="v">L1</div>
          <div class="k">PULSE · BREACHER · LANCE · RIPPER</div><div class="v">D-PAD ↑ → ↓ ←</div>
          <div class="k">PAUSE</div><div class="v">OPTIONS / TOUCHPAD</div>
        </div></div>
      </div>
      <h3>DUALSENSE PRO FEATURES</h3>
      <p>Standard mode gives every button, analog triggers and rumble. Pro mode (Chrome / Edge, USB or Bluetooth) adds <b>adaptive triggers</b> per weapon — PULSE chatters, BREACHER has a hard hammer break, LANCE tightens as it charges, RIPPER growls — plus a <b>lightbar</b> that tracks your integrity, <b>player LEDs</b> that show your multiplier, and <b>gyro aiming</b>.</p>
      <div class="row"><button class="btn ${hid.connected ? '' : 'primary'}" id="b-hid" ${hidOk ? '' : 'disabled'}>${hid.connected ? 'PRO FEATURES CONNECTED ✓' : hidOk ? 'ENABLE PRO FEATURES' : 'WEBHID NOT SUPPORTED IN THIS BROWSER'}</button><button class="btn" id="b-rumble">TEST RUMBLE</button><button class="btn" id="b-back" data-back>BACK</button></div>
      <p class="hint" id="hid-msg" style="text-align:left"></p></div>`);
    (d.querySelector('#b-hid') as HTMLElement).onclick = async () => {
      const ok = await hid.connect();
      (d.querySelector('#hid-msg') as HTMLElement).textContent = ok ? 'Connected. Squeeze R2.' : 'No DualSense selected.';
      if (ok) { hid.setTriggers({ mode: 'section', start: 0.3, end: 0.6, force: 1 }, { mode: 'rigid', start: 0.1, force: 0.6 }); hid.setLight(255, 30, 30); this.world.input.pad.rumble(0.8, 0.8, 300); setTimeout(() => this.showControls(), 600); }
    };
    (d.querySelector('#b-rumble') as HTMLElement).onclick = () => { this.world.input.pad.rumble(1, 0.2, 250); setTimeout(() => this.world.input.pad.rumble(0.1, 1, 250), 300); };
    (d.querySelector('#b-back') as HTMLElement).onclick = () => { hid.setTriggers({ mode: 'off' }, { mode: 'off' }); this.showMenu(); };
    this.focusFirst();
  }

  showCredits() {
    const d = this.setScreen(`<div class="panel"><h2>CREDITS</h2>
      <p><b>ROUGED</b> — a first-person roguelike about a training loop. The genre is the story.</p>
      <p>Design, code &amp; direction: <b>Eeman Majumder</b>.</p>
      <p>Every sprite, texture, sound and note of music is generated in code at runtime. No asset files. The Handler speaks through your browser's own voice.</p>
      <p>Built with Three.js, TypeScript and the Web Audio API.</p>
      <p class="hint" style="text-align:left">"You can stop. But you won't."</p>
      <button class="btn" id="b-back" data-back>BACK</button></div>`);
    (d.querySelector('#b-back') as HTMLElement).onclick = () => this.showMenu();
    this.focusFirst();
  }

  // ───────────────────────────── controller menu navigation ─────────────────────────────

  private focusables(): HTMLElement[] {
    const root = this.termEl ?? this.overlay;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input, select')).filter((e) => e.offsetParent !== null);
  }

  focusFirst() {
    if (!this.world.input.padActive) return;
    const f = this.focusables();
    f[0]?.focus();
  }

  private navRepeat = 0;
  menuNav() {
    const ps = this.world.input.pad.state;
    if (!ps.connected) return;
    if (this.mode === 'title' && !this.splashDone && ps.pressed.size) { this.splashGo?.(); return; }
    const list = this.focusables();
    if (!list.length) return;
    const cur = document.activeElement as HTMLElement | null;
    let i = cur ? list.indexOf(cur) : -1;
    const ly = ps.ly, lx = ps.lx;
    let dir = 0, side = 0;
    if (ps.pressed.has(BTN.DOWN)) dir = 1;
    if (ps.pressed.has(BTN.UP)) dir = -1;
    if (ps.pressed.has(BTN.RIGHT)) side = 1;
    if (ps.pressed.has(BTN.LEFT)) side = -1;
    const now = performance.now();
    if (!dir && Math.abs(ly) > 0.6 && now > this.navRepeat) { dir = ly > 0 ? 1 : -1; this.navRepeat = now + 180; }
    if (!side && Math.abs(lx) > 0.6 && now > this.navRepeat) { side = lx > 0 ? 1 : -1; this.navRepeat = now + 120; }
    if (Math.abs(ly) < 0.3 && Math.abs(lx) < 0.3) this.navRepeat = 0;
    const tag = cur?.tagName;
    if (side && cur && (tag === 'INPUT' || tag === 'SELECT')) {
      if (cur instanceof HTMLInputElement && cur.type === 'range') {
        const st = Number(cur.step) || 0.05;
        cur.value = String(Math.min(Number(cur.max), Math.max(Number(cur.min), Number(cur.value) + st * side)));
        cur.dispatchEvent(new Event('input'));
      } else if (cur instanceof HTMLSelectElement) {
        let j = cur.selectedIndex;
        do { j = (j + side + cur.options.length) % cur.options.length; } while (cur.options[j].disabled && j !== cur.selectedIndex);
        cur.selectedIndex = j;
        cur.dispatchEvent(new Event('change'));
      }
      sfx.uiHover();
    } else if (side) dir = side;
    if (dir) {
      i = i < 0 ? 0 : (i + dir + list.length) % list.length;
      list[i].focus();
      list[i].scrollIntoView({ block: 'nearest' });
      sfx.uiHover();
    }
    if (ps.pressed.has(BTN.CROSS)) {
      if (i < 0) { list[0].focus(); }
      else if (cur && tag === 'BUTTON') cur.click();
      else if (cur instanceof HTMLInputElement && cur.type !== 'range') { const v = prompt('', cur.value); if (v !== null) cur.value = v; }
    }
    if (this.paused && (ps.pressed.has(BTN.OPTIONS) || ps.pressed.has(BTN.TOUCHPAD))) { this.togglePause(false); return; }
    if (ps.pressed.has(BTN.CIRCLE)) {
      const root = this.termEl ?? this.overlay;
      if (this.termEl) { this.closeTerminal(); return; }
      if (this.paused) { this.togglePause(false); return; }
      const back = root?.querySelector<HTMLElement>('[data-back]');
      back?.click();
    }
  }

  enterHub() {
    this.disposeGame();
    this.disposeHub();
    this.clearScreen();
    this.mode = 'hub';
    this.paused = false;
    this.world.fade(true);
    setTimeout(() => {
      this.hub = new Hub(this.world, this.meta, {
        onDeploy: () => this.startRun(this.coop),
        onTerminal: (lines) => this.showTerminal(lines, null, true),
      });
      this.world.fade(false);
      this.world.input.requestLock();
    }, 250);
  }

  startRun(coop: boolean) {
    this.disposeHub();
    this.disposeGame();
    this.clearScreen();
    this.paused = false;
    let net: Transport;
    const opts = { difficulty: this.meta.difficulty, seed: this.seedInput || undefined, solo: !coop };
    if (coop) {
      const srv = this.meta.settings.serverUrl || defaultServerUrl();
      net = new WsTransport(srv);
      this.mode = 'lobby';
      this.setScreen(`<div class="panel" style="text-align:center"><h2>LINKING TO SIMULATION</h2><p>Connecting to ${esc(srv)}…</p><p class="hint">Run the co-op server with <b>npm run server</b>. Add <b>?server=ws://host:port</b> to the URL to use another host.</p><button class="btn small" id="b-cancel" data-back>CANCEL</button></div>`);
      (this.overlay!.querySelector('#b-cancel') as HTMLElement).onclick = () => this.showTitle();
    } else {
      net = new LocalTransport({ difficulty: this.meta.difficulty, seed: this.seedInput || undefined });
      this.mode = 'run';
    }
    this.world.hud.show(!coop);
    this.game = new Game(this.world, net, this.meta, {
      onEnd: (s, me, extras) => this.onRunEnd(s, me, extras),
      onDisconnect: (reason) => {
        this.disposeGame();
        this.world.input.exitLock();
        this.setScreen(`<div class="panel" style="text-align:center"><h2>SIGNAL LOST</h2><p>${esc(reason)}</p><button class="btn primary" id="b-back">BACK</button></div>`);
        (this.overlay!.querySelector('#b-back') as HTMLElement).onclick = () => this.showTitle();
        this.mode = 'title';
      },
      onLobby: (players, endsIn, host) => {
        if (this.mode !== 'lobby') return;
        this.setScreen(`<div class="panel" style="text-align:center"><h2>DEPLOYMENT LOBBY</h2>
          <p>Seed <b>${esc(this.game?.seed ?? '')}</b> · Run starts when 4 players join or in <b>${Math.ceil(endsIn)}s</b></p>
          <div class="lobby-list">${players.map((p) => esc(p.name)).join('<br/>') || '…'}</div>
          ${host ? '<button class="btn primary" id="b-begin">BEGIN NOW</button>' : ''}
          <button class="btn small" id="b-cancel" data-back>LEAVE</button></div>`);
        const b = this.overlay!.querySelector('#b-begin') as HTMLElement | null;
        if (b) b.onclick = () => this.game?.net.send({ t: 'begin' });
        (this.overlay!.querySelector('#b-cancel') as HTMLElement).onclick = () => this.showTitle();
      },
      onStarted: () => {
        this.mode = 'run';
        this.clearScreen();
        this.world.hud.show(true);
        this.world.input.requestLock();
      },
      onTerminal: (lines, frag) => this.showTerminal(lines, frag, false),
      onCinematic: (script, done) => this.playCinematic(script, done),
    }, opts);
    if (!coop) this.world.input.requestLock();
  }

  disposeGame() {
    if (this.game) { this.game.dispose(); this.game = null; }
  }

  disposeHub() {
    if (this.hub) { this.hub.dispose(); this.hub = null; }
  }

  togglePause(force?: boolean) {
    if (this.terminalOpen) { this.closeTerminal(); return; }
    if (this.mode !== 'run' && this.mode !== 'hub') { if (force === undefined) this.overlay?.querySelector<HTMLElement>('[data-back]')?.click(); return; }
    const next = force ?? !this.paused;
    if (next === this.paused) return;
    this.paused = next;
    if (this.paused) {
      this.world.input.exitLock();
      const d = this.setScreen(`
        <div class="title-logo" style="font-size:42px">PAUSED</div>
        <div class="menu" style="margin-top:20px">
          <button class="btn primary" id="b-resume" data-back>RESUME</button>
          <button class="btn" id="b-settings">SETTINGS</button>
          ${this.mode === 'run' ? '<button class="btn" id="b-abandon">ABANDON RUN</button>' : '<button class="btn" id="b-title">TITLE</button>'}
        </div>
        ${this.game ? `<div class="meta-line">SEED <b>${esc(this.game.seed)}</b></div>` : ''}`);
      (d.querySelector('#b-resume') as HTMLElement).onclick = () => this.togglePause(false);
      this.focusFirst();
      (d.querySelector('#b-settings') as HTMLElement).onclick = () => this.showSettings(() => { this.paused = false; this.togglePause(true); });
      const ab = d.querySelector('#b-abandon') as HTMLElement | null;
      if (ab) ab.onclick = () => {
        // abandoning is a death too
        const g = this.game;
        if (g && g.net instanceof LocalTransport) { const run = g.net.run; for (const p of run.players.values()) { p.hp = 0; p.alive = false; p.died = true; } run.endRun(); g.net.update(0.01, 1); }
        else this.showTitle();
        this.paused = false;
      };
      const tt = d.querySelector('#b-title') as HTMLElement | null;
      if (tt) tt.onclick = () => { this.paused = false; this.showTitle(); };
    } else {
      this.clearScreen();
      this.world.input.requestLock();
    }
  }

  showTerminal(lines: string[], frag: Fragment | null, hub: boolean) {
    this.terminalOpen = true;
    this.world.input.exitLock();
    const unlocked = FRAGMENTS.filter((f) => this.meta.fragments.includes(f.id));
    const body = [
      lines.join('\n'),
      frag ? `\n\n>> FRAGMENT RECOVERED: ${frag.title}\n${frag.text}` : '',
      hub ? `\n\n>> ARCHIVE (${unlocked.length}/${FRAGMENTS.length})\n` + unlocked.slice(-6).map((f) => `[${f.title}]\n${f.text}`).join('\n\n') : '',
      hub ? `\n\n>> SUBJECT RECORD\nRUNS LOGGED: ${this.meta.runCount}\nTERMINATIONS: ${this.meta.deaths}\nCOMPLETIONS: ${this.meta.victories}\nCORES: ${this.meta.cores}` : '',
    ].join('');
    const d = document.createElement('div');
    d.className = 'terminal-view';
    d.innerHTML = `<button class="btn small close">CLOSE [ESC / ◯]</button>${esc(body)}`;
    this.screens.appendChild(d);
    (d.querySelector('.close') as HTMLElement).onclick = () => this.closeTerminal();
    this.termEl = d;
    sfx.terminalBeep();
  }
  private termEl: HTMLDivElement | null = null;

  closeTerminal() {
    this.termEl?.remove();
    this.termEl = null;
    this.terminalOpen = false;
    this.world.input.requestLock();
  }

  onRunEnd(s: RunSummary, _me: string, extras: { fragment: Fragment | null; legendarySeen: boolean; enemiesSeen: string[] }) {
    const preRunCount = this.meta.runCount;
    const res = applyRun(this.meta, s);
    const lvNow = metaLevel(this.meta);
    // The Final Reveal: run 40
    const revealDue = !this.meta.revealSeen && (preRunCount >= 39 || lvNow.level >= 40) && (s.victory || s.rooms >= 10 || lvNow.level >= 40);
    setTimeout(() => {
      this.world.input.exitLock();
      this.world.voice.cancel();
      this.disposeGame();
      if (revealDue) this.showReveal();
      else if (s.extracted) this.showExtract(() => this.showDeath(s, res, extras.fragment));
      else this.showDeath(s, res, extras.fragment);
    }, s.victory ? 1500 : 900);
  }

  showDeath(s: RunSummary, res: ReturnType<typeof applyRun>, frag: Fragment | null) {
    this.mode = 'death';
    this.world.hud.show(false);
    const title = s.trueEnding && s.extracted ? 'IT LET YOU GO' : s.extracted ? 'EXTRACTED' : DEATH_TITLES[(this.meta.runCount * 7) % DEATH_TITLES.length];
    const lv = metaLevel(this.meta);
    const unlocks = newUnlocks(res.prevLevel, res.newLevel);
    const prevFrac = res.newLevel > res.prevLevel ? 0 : Math.max(0, (lv.into - res.xpGained) / lv.need);
    const line = handlerLine(s.victory ? 'victory' : 'death', preRunCountFor(this.meta), { name: this.meta.name, run: this.meta.runCount });
    const d = this.setScreen(`
      <div class="death-title">${esc(title)}</div>
      <div class="death-sub">${esc(line ?? 'Subject terminated. Restoring from checkpoint.')}</div>
      ${res.personalBest ? '<div class="pb">★ NEW PERSONAL BEST ★</div>' : ''}
      <div class="death-stats panel"><div class="kv">
        <div class="k">SCORE</div><div class="v gold">${s.score.toLocaleString()}</div>
        <div class="k">KILLS</div><div class="v">${s.kills}</div>
        <div class="k">HEADSHOTS</div><div class="v">${s.headshots}</div>
        <div class="k">GLORY KILLS</div><div class="v">${s.glories}</div>
        <div class="k">DEPTH REACHED</div><div class="v ${s.depth > 15 ? 'gold' : ''}">${s.depth}${s.extracted ? ' · EXTRACTED' : ''}</div>
        <div class="k">ROOMS CLEARED</div><div class="v">${s.rooms}</div>
        <div class="k">SCRAP</div><div class="v">${s.scrap}</div>
        <div class="k">WARDENS</div><div class="v">${s.bosses}</div>
        <div class="k">PEAK MULTIPLIER</div><div class="v gold">x${s.peakCombo}</div>
        <div class="k">BEST STREAK</div><div class="v">${s.bestStreak}</div>
        <div class="k">TIME</div><div class="v">${Math.floor(s.timeSec / 60)}:${String(s.timeSec % 60).padStart(2, '0')}</div>
      </div></div>
      <div class="death-xp"><div class="lv">+${res.xpGained} XP · LEVEL ${lv.level}${res.newLevel > res.prevLevel ? ' ▲' : ''}</div><div class="bar"><i id="xpfill" style="width:${(prevFrac * 100).toFixed(1)}%"></i></div></div>
      ${unlocks.map((u) => `<div class="unlock">UNLOCKED: ${esc(u.label)}</div>`).join('')}
      ${frag ? `<div class="frag-unlock"><b>FRAGMENT RECOVERED — ${esc(frag.title)}</b>\n${esc(frag.text)}</div>` : ''}
      <div class="menu" style="margin-top:16px"><button class="btn primary" id="b-again">WAKE UP [SPACE]</button><button class="btn small" id="b-title">TITLE</button></div>`, 'dim');
    setTimeout(() => { const f = d.querySelector('#xpfill') as HTMLElement | null; if (f) f.style.width = (lv.into / lv.need * 100).toFixed(1) + '%'; }, 80);
    if (res.newLevel > res.prevLevel) setTimeout(() => sfx.levelUp(), 600);
    if (res.personalBest) setTimeout(() => sfx.rarityReveal('epic'), 300);
    const again = () => { window.removeEventListener('keydown', key); this.enterHub(); };
    const key = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); again(); } };
    setTimeout(() => window.addEventListener('keydown', key), 400);
    (d.querySelector('#b-again') as HTMLElement).onclick = again;
    this.focusFirst();
    (d.querySelector('#b-title') as HTMLElement).onclick = () => { window.removeEventListener('keydown', key); this.showTitle(); };
  }

  showExtract(then: () => void) {
    this.mode = 'reveal';
    this.world.hud.show(false);
    const d = this.setScreen(`<div class="reveal-terminal" id="rv" style="color:#e9e2d0;text-shadow:0 0 12px #fff"></div>`, 'black');
    (d as HTMLElement).style.background = 'radial-gradient(ellipse at center, #fff 0%, #d8d8d0 20%, #000 75%)';
    const el = d.querySelector('#rv') as HTMLElement;
    let t = 0;
    for (const line of EXTRACT_SCRIPT) {
      t += line.delay * 1000;
      setTimeout(() => {
        const p = document.createElement('div');
        p.textContent = (line.speaker === 'terminal' ? '> ' : line.speaker === 'system' ? '[SYSTEM] ' : '') + line.text;
        p.style.margin = '6px 0';
        el.appendChild(p);
        if (line.speaker === 'handler') this.world.voice.say(line.text, { runCount: this.meta.runCount, priority: 9 });
        else this.world.cast.say('system', line.text, 2);
      }, t);
    }
    setTimeout(() => {
      const b = document.createElement('div');
      b.className = 'menu'; b.style.margin = '24px auto';
      b.innerHTML = '<button class="btn primary">OPEN YOUR EYES</button>';
      el.appendChild(b);
      const btn = b.querySelector('button') as HTMLElement;
      btn.onclick = then;
      if (this.world.input.padActive) btn.focus();
    }, t + 2000);
  }

  showReveal() {
    this.mode = 'reveal';
    this.meta.revealSeen = true;
    saveMeta(this.meta);
    this.world.hud.show(false);
    music.death();
    const d = this.setScreen(`<div class="reveal-terminal" id="rv"></div>`, 'black');
    const el = d.querySelector('#rv') as HTMLElement;
    let t = 0;
    for (const line of REVEAL_SCRIPT) {
      t += line.delay * 1000;
      setTimeout(() => {
        const p = document.createElement('div');
        p.textContent = (line.speaker === 'terminal' ? '> ' : line.speaker === 'system' ? '[SYSTEM] ' : '') + line.text;
        p.style.color = line.speaker === 'handler' ? '#cfe' : '';
        p.style.margin = '6px 0';
        el.appendChild(p);
        el.scrollTop = el.scrollHeight;
        if (line.speaker === 'handler') this.world.voice.say(line.text, { runCount: 39, priority: 9 });
        else sfx.terminalBeep();
      }, t);
    }
    setTimeout(() => {
      const b = document.createElement('div');
      b.className = 'menu';
      b.style.margin = '24px auto';
      b.innerHTML = `<button class="btn primary">A DOOR OPENS. IT LEADS BACK TO ROOM 1.</button>`;
      el.appendChild(b);
      (b.querySelector('button') as HTMLElement).onclick = () => { music.resume(); this.coop = false; this.startRun(false); };
    }, t + 2500);
  }

  /** In-run cinematic: lines type out over the frozen room; Handler lines are spoken in its voice. */
  playCinematic(script: { speaker: string; text: string; delay: number }[], done: () => void) {
    const el = document.createElement('div');
    el.className = 'cine';
    this.screens.appendChild(el);
    let t = 0;
    for (const line of script) {
      t += line.delay * 1000;
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = line.speaker === 'handler' ? 'h' : line.speaker === 'system' ? 's' : '';
        p.textContent = (line.speaker === 'terminal' ? '> ' : line.speaker === 'system' ? '[SYSTEM] ' : '') + line.text;
        p.style.margin = '5px 0';
        el.appendChild(p);
        while (el.children.length > 9) el.firstElementChild?.remove();
        if (line.speaker === 'handler') this.world.voice.say(line.text, { runCount: this.meta.runCount >= 40 ? 41 : 30, priority: 9 });
        else this.world.cast.say(line.speaker === 'system' ? 'directorate' : 'system', line.text, 2);
      }, t);
    }
    setTimeout(() => { el.style.transition = 'opacity 2s'; el.style.opacity = '0'; setTimeout(() => { el.remove(); done(); }, 2000); }, t + 3500);
  }

  showCodex(back: () => void) {
    const frags = FRAGMENTS.map((f) => this.meta.fragments.includes(f.id)
      ? `<div class="frag"><div class="t">${esc(f.title)} · ${f.kind.toUpperCase()}</div>${esc(f.text)}</div>`
      : `<div class="frag locked"><div class="t">▓▓▓▓▓▓▓▓ · LOCKED</div></div>`).join('');
    const syn = SYNERGIES.map((s) => this.meta.synergies.includes(s.id)
      ? `<li><b>${esc(s.name)}</b> — ${esc(s.desc)}<br/><span style="color:#8c8">${esc(SYNERGY_LORE[s.id] ?? '')}</span></li>`
      : `<li class="locked">??? — undiscovered protocol</li>`).join('');
    const enemies = (Object.keys(ENEMY_CODEX) as (keyof typeof ENEMY_CODEX)[]).map((k) => this.meta.enemiesSeen.includes(k)
      ? `<li><b>${k.toUpperCase()}</b> — ${esc(ENEMY_CODEX[k])}</li>` : `<li class="locked">${'?'.repeat(k.length)}</li>`).join('');
    const lv = metaLevel(this.meta);
    const unl = UNLOCKS.map((u) => `<li class="${lv.level >= u.level ? '' : 'locked'}">LV ${u.level} — ${esc(u.label)}</li>`).join('');
    const d = this.setScreen(`<div class="panel"><h2>CODEX</h2>
      <h3>SYNERGIES (${this.meta.synergies.length}/${SYNERGIES.length})</h3><ul>${syn}</ul>
      <h3>HOSTILES</h3><ul>${enemies}</ul>
      <h3>UNLOCKS</h3><ul>${unl}</ul>
      <h3>FRAGMENTS (${this.meta.fragments.length}/${FRAGMENTS.length})</h3>${frags}
      <div style="margin-top:16px"><button class="btn" id="b-back" data-back>BACK</button></div></div>`);
    (d.querySelector('#b-back') as HTMLElement).onclick = back;
    this.focusFirst();
  }

  showSettings(back: () => void) {
    const s = this.meta.settings;
    const d = this.setScreen(`<div class="panel"><h2>SETTINGS</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="field">CALLSIGN<input id="s-name" maxlength="16" value="${esc(this.meta.name)}"/></label>
        <label class="field">QUALITY<select id="s-q"><option value="high" ${s.quality === 'high' ? 'selected' : ''}>HIGH (480p + BLOOM)</option><option value="low" ${s.quality === 'low' ? 'selected' : ''}>LOW</option></select></label>
        <label class="field" style="grid-column:1/-1">SENSITIVITY PRESET <span id="v-preset" class="hint">${PRESET_LABELS[s.sensPreset]}</span>
          <div id="s-preset" class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">
            ${(['noob','pro','godkiller'] as const).map(p =>
              `<button type="button" class="btn small${s.sensPreset === p ? ' primary' : ''}" data-preset="${p}">${PRESET_LABELS[p].split(' ')[0]}${p === 'godkiller' ? ' KILLER' : ''}</button>`
            ).join('')}
            <button type="button" class="btn small${s.sensPreset === 'custom' ? ' primary' : ''}" data-preset="custom">CUSTOM</button>
          </div></label>
        <label class="field">SENSITIVITY <span id="v-sens">${s.sensitivity.toFixed(3)} · VALO ${rougedToValorant(s.sensitivity).toFixed(3)}</span><input id="s-sens" type="range" min="0.05" max="3" step="any" value="${s.sensitivity}"/></label>
        <label class="field">FOV (VERTICAL) <span id="v-fov">${s.fov.toFixed(1)}</span><input id="s-fov" type="range" min="60" max="115" step="any" value="${s.fov}"/></label>
        <label class="field">SCOPED SENS MULTIPLIER <span id="v-ads">${(s.adsMult ?? 1).toFixed(2)}</span><input id="s-ads" type="range" min="0.2" max="2" step="0.01" value="${s.adsMult ?? 1}"/></label>
        <label class="field">MOUSE DPI (FOR CM/360) <span id="v-cm">${cmPer360(s.sensitivity, s.dpi ?? 800).toFixed(1)} CM/360</span><input id="s-dpi" type="number" min="100" max="32000" step="50" value="${s.dpi ?? 800}"/></label>
      </div>
      <h3>IMPORT VALORANT SENSITIVITY</h3>
      <p style="margin:0 0 8px">Same mouse, same DPI, same cm/360. Copy the numbers from VALORANT → Settings → General → Mouse.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:end">
        <label class="field">VALORANT SENSITIVITY<input id="v-val" type="number" min="0.01" max="10" step="0.001" placeholder="e.g. 0.35" value="${rougedToValorant(s.sensitivity).toFixed(3)}"/></label>
        <label class="field">SCOPED MULTIPLIER<input id="v-valads" type="number" min="0.01" max="3" step="0.01" value="${(s.adsMult ?? 1).toFixed(2)}"/></label>
        <label class="field" style="flex-direction:row;align-items:center;gap:8px"><input id="v-valfov" type="checkbox" checked style="width:18px;height:18px"/>MATCH VALORANT FOV (103°)</label>
      </div>
      <div class="row" style="margin-top:10px"><button class="btn" id="b-valo">IMPORT</button></div>
      <p id="v-valmsg" class="hint" style="text-align:left;margin-top:6px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="field">MASTER<input id="s-master" type="range" min="0" max="1" step="0.05" value="${s.master}"/></label>
        <label class="field">MUSIC<input id="s-music" type="range" min="0" max="1" step="0.05" value="${s.music}"/></label>
        <label class="field">SFX<input id="s-sfx" type="range" min="0" max="1" step="0.05" value="${s.sfx}"/></label>
        <label class="field">SCREEN SHAKE<input id="s-shake" type="range" min="0" max="1.5" step="0.05" value="${s.shake}"/></label>
        <label class="field">HANDLER VOICE<select id="s-voice"><option value="1" ${s.voice ? 'selected' : ''}>ON</option><option value="0" ${!s.voice ? 'selected' : ''}>SUBTITLES ONLY</option></select></label>
        <label class="field">SPRINT (KEYBOARD)<select id="s-sprint"><option value="0" ${!s.sprintToggle ? 'selected' : ''}>HOLD SHIFT</option><option value="1" ${s.sprintToggle ? 'selected' : ''}>TOGGLE</option></select></label>
        <label class="field">INVERT Y<select id="s-inv"><option value="0" ${!s.invertY ? 'selected' : ''}>OFF</option><option value="1" ${s.invertY ? 'selected' : ''}>ON</option></select></label>
      </div>
      <h3>CONTROLLER</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="field">STICK SENSITIVITY<input id="s-pads" type="range" min="0.3" max="2.5" step="0.05" value="${s.padSens}"/></label>
        <label class="field">AIM ASSIST<input id="s-aa" type="range" min="0" max="1" step="0.05" value="${s.aimAssist}"/></label>
        <label class="field">RUMBLE<input id="s-rum" type="range" min="0" max="1" step="0.05" value="${s.rumble}"/></label>
        <label class="field">ADAPTIVE TRIGGERS<select id="s-trig"><option value="1" ${s.triggers ? 'selected' : ''}>ON</option><option value="0" ${!s.triggers ? 'selected' : ''}>OFF</option></select></label>
        <label class="field">GYRO AIM<select id="s-gyro"><option value="l2" ${s.gyro === 'l2' ? 'selected' : ''}>WHILE HOLDING L2</option><option value="always" ${s.gyro === 'always' ? 'selected' : ''}>ALWAYS</option><option value="off" ${s.gyro === 'off' ? 'selected' : ''}>OFF</option></select></label>
        <label class="field">GYRO SENSITIVITY (NEGATIVE = INVERT)<input id="s-gyros" type="range" min="-3" max="3" step="0.1" value="${s.gyroSens}"/></label>
      </div>
      <div style="margin-top:16px" class="row"><button class="btn primary" id="b-save" data-back>SAVE</button><button class="btn" id="b-reset">ERASE PROGRESS</button></div></div>`);
    const q = <T extends HTMLElement>(id: string) => d.querySelector('#' + id) as T;
    const refreshCm = () => { q('v-cm').textContent = cmPer360(Number(q<HTMLInputElement>('s-sens').value), Number(q<HTMLInputElement>('s-dpi').value) || 800).toFixed(1) + ' CM/360'; };

    // Preset chips. Clicking one pins the sens slider to the preset's exact
    // value AND remembers the choice so the chip stays highlighted on
    // re-open. Dragging the slider or running the Valorant import flips the
    // chip to 'CUSTOM' / 'VALORANT IMPORT' respectively — tracked via
    // `currentPreset` while the dialog is open, committed on SAVE.
    let currentPreset: SensPreset = s.sensPreset;
    const curDpi = () => Number(q<HTMLInputElement>('s-dpi').value) || 800;
    // A preset is a cm/360 target: solve it for THIS mouse's DPI.
    const applyPreset = (preset: NamedPreset) => {
      const sens = presetSens(preset, curDpi());
      const sensEl = q<HTMLInputElement>('s-sens');
      sensEl.min = String(Math.min(Number(sensEl.min), sens)); sensEl.max = String(Math.max(Number(sensEl.max), sens));
      sensEl.value = String(sens);
      q('v-sens').textContent = `${sens.toFixed(3)} · VALO ${rougedToValorant(sens).toFixed(3)}`;
      refreshCm();
    };
    const paintPreset = () => {
      q('v-preset').textContent = PRESET_LABELS[currentPreset];
      d.querySelectorAll<HTMLButtonElement>('#s-preset [data-preset]').forEach(btn => {
        btn.classList.toggle('primary', btn.dataset.preset === currentPreset);
      });
    };
    d.querySelectorAll<HTMLButtonElement>('#s-preset [data-preset]').forEach(btn => {
      btn.onclick = () => {
        const preset = btn.dataset.preset as SensPreset;
        currentPreset = preset;
        if (preset !== 'custom') applyPreset(preset as NamedPreset);
        paintPreset();
        sfx.uiClick();
      };
    });

    q<HTMLInputElement>('s-sens').oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      q('v-sens').textContent = `${v.toFixed(3)} · VALO ${rougedToValorant(v).toFixed(3)}`;
      refreshCm();
      // Human dragged the slider — mark Custom unless the value happens to
      // land exactly on a preset (classifySens handles that).
      currentPreset = classifySens(v, curDpi());
      paintPreset();
    };
    q<HTMLInputElement>('s-fov').oninput = (e) => { q('v-fov').textContent = Number((e.target as HTMLInputElement).value).toFixed(1); };
    q<HTMLInputElement>('s-ads').oninput = (e) => { q('v-ads').textContent = Number((e.target as HTMLInputElement).value).toFixed(2); };
    q<HTMLInputElement>('s-dpi').oninput = () => {
      // on a named preset, a DPI change keeps the preset's cm/360 (re-solves the sens)
      if (currentPreset === 'noob' || currentPreset === 'pro' || currentPreset === 'godkiller') applyPreset(currentPreset);
      else refreshCm();
    };
    q('b-valo').onclick = () => {
      const val = Number(q<HTMLInputElement>('v-val').value);
      if (!(val > 0 && val < 20)) { q('v-valmsg').textContent = 'Enter your VALORANT sensitivity (e.g. 0.35).'; return; }
      const sens = valorantToRouged(val);
      const sensEl = q<HTMLInputElement>('s-sens');
      sensEl.min = String(Math.min(Number(sensEl.min), sens)); sensEl.max = String(Math.max(Number(sensEl.max), sens));
      sensEl.value = String(sens); sensEl.dispatchEvent(new Event('input'));
      // The input event above re-ran my classifier and (likely) set
      // currentPreset to 'custom'. Overwrite with 'valorant' so the chip
      // shows this came from the import flow, not a manual tweak.
      currentPreset = 'valorant';
      paintPreset();
      const ads = Number(q<HTMLInputElement>('v-valads').value) || 1;
      q<HTMLInputElement>('s-ads').value = String(ads); q<HTMLInputElement>('s-ads').dispatchEvent(new Event('input'));
      if (q<HTMLInputElement>('v-valfov').checked) { q<HTMLInputElement>('s-fov').value = String(VALORANT_VFOV); q<HTMLInputElement>('s-fov').dispatchEvent(new Event('input')); }
      const dpi = Number(q<HTMLInputElement>('s-dpi').value) || 800;
      q('v-valmsg').textContent = `Imported: VALORANT ${val} → ROUGED ${sens.toFixed(4)} (${cmPer360(sens, dpi).toFixed(1)} cm/360 at ${dpi} DPI). Press SAVE.`;
      sfx.uiClick();
    };
    q('b-save').onclick = () => {
      this.meta.name = (q<HTMLInputElement>('s-name').value.trim().toUpperCase() || 'CANDIDATE').slice(0, 16);
      s.quality = q<HTMLSelectElement>('s-q').value as 'high' | 'low';
      s.sensitivity = Number(q<HTMLInputElement>('s-sens').value);
      s.sensPreset = currentPreset;
      s.fov = Number(q<HTMLInputElement>('s-fov').value);
      s.adsMult = Number(q<HTMLInputElement>('s-ads').value) || 1;
      s.dpi = Number(q<HTMLInputElement>('s-dpi').value) || 800;
      s.master = Number(q<HTMLInputElement>('s-master').value);
      s.music = Number(q<HTMLInputElement>('s-music').value);
      s.sfx = Number(q<HTMLInputElement>('s-sfx').value);
      s.shake = Number(q<HTMLInputElement>('s-shake').value);
      s.voice = q<HTMLSelectElement>('s-voice').value === '1';
      s.invertY = q<HTMLSelectElement>('s-inv').value === '1';
      s.sprintToggle = q<HTMLSelectElement>('s-sprint').value === '1';
      s.padSens = Number(q<HTMLInputElement>('s-pads').value);
      s.aimAssist = Number(q<HTMLInputElement>('s-aa').value);
      s.rumble = Number(q<HTMLInputElement>('s-rum').value);
      s.triggers = q<HTMLSelectElement>('s-trig').value === '1';
      s.gyro = q<HTMLSelectElement>('s-gyro').value as 'off' | 'always' | 'l2';
      s.gyroSens = Number(q<HTMLInputElement>('s-gyros').value);
      saveMeta(this.meta);
      this.world.applySettings(this.meta);
      back();
    };
    this.focusFirst();
    let armed = false;
    q('b-reset').onclick = () => {
      if (!armed) { armed = true; q('b-reset').textContent = 'CLICK AGAIN TO ERASE'; return; }
      localStorage.removeItem('rouged.meta.v1');
      this.meta = loadMeta();
      this.world.applySettings(this.meta);
      this.showTitle();
    };
  }
}

function shortPad(id: string) {
  if (/dualsense edge/i.test(id) || /0df2/i.test(id)) return 'DUALSENSE EDGE';
  if (/dualsense|0ce6|wireless controller/i.test(id)) return 'DUALSENSE';
  return id.replace(/\(.*?\)/g, '').trim().slice(0, 28).toUpperCase() || 'CONTROLLER';
}

function preRunCountFor(m: Meta) { return Math.max(0, m.runCount - 1); }

new App();
