// Keyboard + mouse (pointer lock) + touch + gamepad/DualSense, unified into one per-frame state.
import { Pad, BTN } from './gamepad';

export type Action = 'fwd' | 'back' | 'left' | 'right' | 'jump' | 'dash' | 'slide' | 'sprint' | 'sprintT' | 'fire' | 'use' | 'glory' | 'reload' | 'inspect' | 'w1' | 'w2' | 'w3' | 'w4' | 'wnext' | 'wprev' | 'wlast' | 'pause' | 'stats';

const KEYMAP: Record<string, Action> = {
  KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  // movement: Shift = sprint (hold, or toggle via Input.sprintToggle), Ctrl/C = crouch · slide, Alt/V/Mouse4-5 = dash
  Space: 'jump', ShiftLeft: 'sprint', ShiftRight: 'sprint', ControlLeft: 'slide', KeyC: 'slide', ControlRight: 'slide',
  AltLeft: 'dash', AltRight: 'dash', KeyV: 'dash',
  KeyE: 'use', KeyF: 'glory', Digit1: 'w1', Digit2: 'w2', Digit3: 'w3', Digit4: 'w4', KeyQ: 'wlast',
  KeyR: 'reload', KeyT: 'inspect',
  Escape: 'pause', KeyP: 'pause', Tab: 'stats',
};

export class Input {
  held = new Set<Action>();
  pressed = new Set<Action>();
  released = new Set<Action>();
  dx = 0;
  dy = 0;
  sensitivity = 1;
  invertY = false;
  locked = false;
  touchMode = false;
  enabled = true;
  onPause: () => void = () => {};
  onLockChange: (locked: boolean) => void = () => {};
  private canvas: HTMLElement;
  private touchLookId: number | null = null;
  private touchLookX = 0;
  private touchLookY = 0;
  private stickId: number | null = null;
  private stickCx = 0;
  private stickCy = 0;
  stickX = 0;
  pad = new Pad();
  padSens = 1;
  gyroMode: 'off' | 'always' | 'l2' = 'l2';
  gyroSens = 1;
  /** true while the most recent input came from a controller */
  padActive = false;
  padAim = false; // L2 held: aim-assist focus
  private padHeld = new Set<Action>();
  private padLookX = 0;
  private padLookY = 0;
  private padMoveX = 0;
  private padMoveY = 0;
  private lastKbm = 0;
  stickY = 0;
  /** keyboard sprint mode: false = hold Shift, true = tap Shift to toggle (auto-cancels when you stop) */
  sprintToggle = false;

  constructor(canvas: HTMLElement, private touchRoot: HTMLElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      this.lastKbm = performance.now();
      const a = KEYMAP[e.code];
      if (e.code === 'Tab' || e.code === 'Space' || e.code === 'AltLeft' || e.code === 'AltRight' || (e.ctrlKey && e.code !== 'ControlLeft')) e.preventDefault();
      if (!a) return;
      if (a === 'pause') { if (!e.repeat) this.onPause(); return; }
      if (!this.held.has(a)) this.pressed.add(a);
      this.held.add(a);
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') e.preventDefault(); // no browser menu-bar focus
      const a = KEYMAP[e.code];
      if (!a) return;
      this.held.delete(a);
      this.released.add(a);
    });
    window.addEventListener('blur', () => { for (const a of this.held) this.released.add(a); this.held.clear(); });
    window.addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      if (e.button === 0) { this.pressed.add('fire'); this.held.add('fire'); }
      if (e.button === 2) { this.pressed.add('glory'); this.held.add('glory'); }
      if (e.button === 1) { this.pressed.add('use'); }
      if (e.button === 3 || e.button === 4) { e.preventDefault(); this.pressed.add('dash'); } // side buttons dash
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) { this.held.delete('fire'); this.released.add('fire'); }
      if (e.button === 2) { this.held.delete('glory'); this.released.add('glory'); }
      if ((e.button === 3 || e.button === 4) && this.locked) e.preventDefault(); // don't navigate back/forward
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('wheel', (e) => {
      if (!this.locked) return;
      if (e.deltaY > 0) this.pressed.add('wnext'); else if (e.deltaY < 0) this.pressed.add('wprev');
    }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      // clamp absurd spikes some browsers produce on lock
      if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) this.lastKbm = performance.now();
      this.dx += e.movementX;
      this.dy += e.movementY;
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas;
      if (!this.locked) { for (const a of this.held) this.released.add(a); this.held.clear(); }
      this.onLockChange(this.locked);
    });
    if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window && navigator.maxTouchPoints > 0 && !matchMedia('(pointer: fine)').matches) {
      this.enableTouch();
    }
  }

  requestLock() {
    if (this.touchMode) { this.locked = true; this.onLockChange(true); return; }
    const el = this.canvas as HTMLElement & { requestPointerLock(opts?: unknown): Promise<void> | void };
    const attempt = (opts?: unknown) => {
      try {
        const r = el.requestPointerLock(opts);
        return r && typeof (r as Promise<void>).then === 'function' ? (r as Promise<void>) : Promise.resolve();
      } catch (e) { return Promise.reject(e); }
    };
    attempt({ unadjustedMovement: true }).catch(() => attempt().catch(() => { /* lock unavailable (unfocused/background) — click the canvas to retry */ }));
  }

  exitLock() {
    if (this.touchMode) { this.locked = false; this.onLockChange(false); return; }
    if (document.pointerLockElement) document.exitPointerLock();
  }

  axes(): { fwd: number; right: number } {
    let f = 0, r = 0;
    if (this.held.has('fwd')) f += 1;
    if (this.held.has('back')) f -= 1;
    if (this.held.has('right')) r += 1;
    if (this.held.has('left')) r -= 1;
    if (this.touchMode) { f += -this.stickY; r += this.stickX; }
    f += -this.padMoveY; r += this.padMoveX;
    return { fwd: Math.max(-1, Math.min(1, f)), right: Math.max(-1, Math.min(1, r)) };
  }

  /** Sprint intent for this frame: `hold` = sprint while true, `toggle` = flip the latched sprint. */
  sprintInput(): { hold: boolean; toggle: boolean } {
    const touchAuto = this.touchMode && this.stickY < -0.85; // touch: push the stick to the rim to sprint
    if (this.sprintToggle) return { hold: touchAuto, toggle: this.pressed.has('sprint') || this.pressed.has('sprintT') };
    return { hold: this.held.has('sprint') || touchAuto, toggle: this.pressed.has('sprintT') };
  }

  consumeLook(): { dx: number; dy: number } {
    const k = 0.0022 * this.sensitivity;
    const out = { dx: this.dx * k + this.padLookX, dy: this.dy * k * (this.invertY ? -1 : 1) + this.padLookY * (this.invertY ? -1 : 1) };
    this.dx = 0; this.dy = 0; this.padLookX = 0; this.padLookY = 0;
    return out;
  }

  /** Poll the controller and fold it into actions. Call once per frame before reading input. */
  pollPad(dt: number, gameplay: boolean) {
    const ps = this.pad.poll();
    this.pad.update(dt);
    if (!ps.connected) { for (const a of this.padHeld) { this.held.delete(a); this.released.add(a); } this.padHeld.clear(); this.padMoveX = this.padMoveY = 0; this.padActive = false; return; }
    if (this.pad.lastActive > this.lastKbm) this.padActive = true; else if (this.lastKbm > this.pad.lastActive) this.padActive = false;
    if (!gameplay) { for (const a of this.padHeld) { this.held.delete(a); } this.padHeld.clear(); this.padMoveX = this.padMoveY = 0; return; }
    const map: [number, Action][] = [
      [BTN.CROSS, 'jump'], [BTN.CIRCLE, 'slide'], [BTN.L1, 'dash'], [BTN.L3, 'sprintT'], [BTN.R2, 'fire'],
      [BTN.SQUARE, 'use'], [BTN.R3, 'glory'], [BTN.L2, 'glory'], [BTN.R1, 'wnext'], [BTN.TRIANGLE, 'wlast'],
      [BTN.UP, 'w1'], [BTN.RIGHT, 'w2'], [BTN.DOWN, 'w3'], [BTN.LEFT, 'w4'],
    ];
    const now = new Set<Action>();
    for (const [b, a] of map) if (ps.buttons[b]) now.add(a);
    for (const a of now) { if (!this.held.has(a)) this.pressed.add(a); this.held.add(a); }
    for (const a of this.padHeld) if (!now.has(a)) { this.held.delete(a); this.released.add(a); }
    this.padHeld = now;
    if (ps.pressed.has(BTN.OPTIONS) || ps.pressed.has(BTN.TOUCHPAD) || ps.pressed.has(BTN.CREATE)) this.onPause();
    this.padMoveX = ps.lx; this.padMoveY = ps.ly;
    this.padAim = ps.l2 > 0.35;
    // right stick: response curve (fine near center, fast at the edge) + edge acceleration
    const m = Math.hypot(ps.rx, ps.ry);
    if (m > 0) {
      const curved = Math.pow(m, 1.8) * (m > 0.95 ? 1.35 : 1);
      const rate = 3.6 * this.padSens * (this.padAim ? 0.55 : 1);
      this.padLookX += (ps.rx / m) * curved * rate * dt;
      this.padLookY += (ps.ry / m) * curved * rate * 0.75 * dt;
    }
    // gyro aim (WebHID DualSense)
    const hid = this.pad.hid;
    if (hid.connected && (this.gyroMode === 'always' || (this.gyroMode === 'l2' && this.padAim))) {
      this.padLookX += -hid.gyroYaw * this.gyroSens * dt;
      this.padLookY += -hid.gyroPitch * this.gyroSens * dt;
    }
  }

  endFrame() {
    this.pressed.clear();
    this.released.clear();
  }

  // ───────────────────────────── touch ─────────────────────────────

  enableTouch() {
    if (this.touchMode) return;
    this.touchMode = true;
    document.body.classList.add('touch');
    const root = this.touchRoot;
    root.classList.add('on');
    root.innerHTML = `
      <div class="t-look"></div>
      <div class="t-stick"><div class="t-knob"></div></div>
      <div class="t-btn t-fire" data-a="fire">FIRE</div>
      <div class="t-btn t-jump" data-a="jump">JUMP</div>
      <div class="t-btn t-dash" data-a="dash">DASH</div>
      <div class="t-btn t-slide" data-a="slide">SLIDE</div>
      <div class="t-btn t-use" data-a="use">USE</div>
      <div class="t-btn t-wpn" data-a="wnext">WPN</div>
      <div class="t-btn t-pause" data-a="pause">II</div>`;
    const look = root.querySelector('.t-look') as HTMLElement;
    const stick = root.querySelector('.t-stick') as HTMLElement;
    const knob = root.querySelector('.t-knob') as HTMLElement;
    look.addEventListener('touchstart', (e) => {
      for (const t of Array.from(e.changedTouches)) if (this.touchLookId === null) { this.touchLookId = t.identifier; this.touchLookX = t.clientX; this.touchLookY = t.clientY; }
      e.preventDefault();
    }, { passive: false });
    look.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) if (t.identifier === this.touchLookId) {
        this.dx += (t.clientX - this.touchLookX) * 2.2; this.dy += (t.clientY - this.touchLookY) * 2.2;
        this.touchLookX = t.clientX; this.touchLookY = t.clientY;
      }
      e.preventDefault();
    }, { passive: false });
    const endLook = (e: TouchEvent) => { for (const t of Array.from(e.changedTouches)) if (t.identifier === this.touchLookId) this.touchLookId = null; };
    look.addEventListener('touchend', endLook); look.addEventListener('touchcancel', endLook);
    stick.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      this.stickId = t.identifier;
      const r = stick.getBoundingClientRect();
      this.stickCx = r.left + r.width / 2; this.stickCy = r.top + r.height / 2;
      e.preventDefault();
    }, { passive: false });
    stick.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) if (t.identifier === this.stickId) {
        let x = (t.clientX - this.stickCx) / 60, y = (t.clientY - this.stickCy) / 60;
        const l = Math.hypot(x, y);
        if (l > 1) { x /= l; y /= l; }
        this.stickX = x; this.stickY = y;
        knob.style.transform = `translate(${x * 45}px, ${y * 45}px)`;
      }
      e.preventDefault();
    }, { passive: false });
    const endStick = () => { this.stickId = null; this.stickX = 0; this.stickY = 0; knob.style.transform = ''; };
    stick.addEventListener('touchend', endStick); stick.addEventListener('touchcancel', endStick);
    root.querySelectorAll<HTMLElement>('.t-btn').forEach((b) => {
      const a = b.dataset.a as Action;
      b.addEventListener('touchstart', (e) => {
        e.preventDefault();
        b.classList.add('on');
        if (a === 'pause') { this.onPause(); return; }
        this.pressed.add(a); this.held.add(a);
        if (a === 'use') this.pressed.add('glory');
      }, { passive: false });
      const up = (e: Event) => { e.preventDefault(); b.classList.remove('on'); this.held.delete(a); this.released.add(a); };
      b.addEventListener('touchend', up, { passive: false }); b.addEventListener('touchcancel', up, { passive: false });
    });
  }
}
