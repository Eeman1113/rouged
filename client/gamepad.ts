// DualSense (and any standard-mapping pad) support.
//  • Gamepad API: sticks, triggers, every button, dual-rumble haptics. Works in all modern browsers.
//  • WebHID (Chrome/Edge, opt-in): adaptive triggers, lightbar, player LEDs, gyro aim, rumble over USB + Bluetooth.

export const BTN = {
  CROSS: 0, CIRCLE: 1, SQUARE: 2, TRIANGLE: 3, L1: 4, R1: 5, L2: 6, R2: 7,
  CREATE: 8, OPTIONS: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15, PS: 16, TOUCHPAD: 17,
} as const;

export type TriggerEffect =
  | { mode: 'off' }
  | { mode: 'rigid'; start: number; force: number } // continuous resistance from start (0..1)
  | { mode: 'section'; start: number; end: number; force: number } // a "click" wall between start..end
  | { mode: 'vibrate'; start: number; freq: number; amp: number }; // buzz once pulled past start

export interface PadState {
  connected: boolean;
  id: string;
  isDualSense: boolean;
  lx: number; ly: number; rx: number; ry: number;
  l2: number; r2: number;
  buttons: boolean[];
  pressed: Set<number>;
  released: Set<number>;
}

const DEAD = 0.12;

function deadzone(x: number, y: number): [number, number] {
  const m = Math.hypot(x, y);
  if (m < DEAD) return [0, 0];
  const k = Math.min(1, (m - DEAD) / (1 - DEAD)) / m;
  return [x * k, y * k];
}

// ───────────────────────────── CRC32 for Bluetooth output reports ─────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes: Uint8Array, seed = 0xffffffff): number {
  let c = seed;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Minimal WebHID typings (not in lib.dom for every TS version)
interface HIDDeviceLike {
  opened: boolean;
  productId: number;
  vendorId: number;
  productName: string;
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  addEventListener(type: 'inputreport', cb: (e: { reportId: number; data: DataView }) => void): void;
  collections?: { outputReports?: { reportId: number }[] }[];
}
interface HIDLike {
  requestDevice(opts: { filters: { vendorId: number; productId?: number }[] }): Promise<HIDDeviceLike[]>;
  getDevices(): Promise<HIDDeviceLike[]>;
  addEventListener(type: 'disconnect', cb: (e: { device: HIDDeviceLike }) => void): void;
}

const SONY = 0x054c;
const DS_PIDS = [0x0ce6, 0x0df2]; // DualSense, DualSense Edge

/** Enhanced DualSense link over WebHID. */
export class DualSenseHID {
  dev: HIDDeviceLike | null = null;
  bt = false;
  seq = 0;
  // desired output state
  rumbleL = 0; rumbleR = 0;
  r2: TriggerEffect = { mode: 'off' };
  l2: TriggerEffect = { mode: 'off' };
  light: [number, number, number] = [255, 20, 20];
  playerLeds = 0;
  private dirty = true;
  private sendT = 0;
  private sending = false;
  // gyro (rad/s, after calibration offset)
  gyroYaw = 0;
  gyroPitch = 0;
  private gyroBias = [0, 0, 0];
  private biasSamples = 0;
  private stillT = 0;
  onChange: (connected: boolean) => void = () => {};

  static supported(): boolean { return typeof navigator !== 'undefined' && 'hid' in navigator; }
  private get hid(): HIDLike { return (navigator as unknown as { hid: HIDLike }).hid; }

  /** Must be called from a user gesture. */
  async connect(): Promise<boolean> {
    if (!DualSenseHID.supported()) return false;
    try {
      const devs = await this.hid.requestDevice({ filters: DS_PIDS.map((productId) => ({ vendorId: SONY, productId })) });
      if (!devs.length) return false;
      await this.attach(devs[0]);
      return true;
    } catch { return false; }
  }

  /** Reconnect silently to a previously-permitted pad. */
  async autoConnect(): Promise<boolean> {
    if (!DualSenseHID.supported()) return false;
    try {
      const devs = (await this.hid.getDevices()).filter((d) => d.vendorId === SONY && DS_PIDS.includes(d.productId));
      if (!devs.length) return false;
      await this.attach(devs[0]);
      return true;
    } catch { return false; }
  }

  private async attach(d: HIDDeviceLike) {
    if (!d.opened) await d.open();
    this.dev = d;
    // USB exposes output report 0x02; Bluetooth uses 0x31
    const outs = (d.collections ?? []).flatMap((c) => c.outputReports ?? []).map((r) => r.reportId);
    this.bt = !outs.includes(0x02) && outs.includes(0x31);
    this.biasSamples = 0;
    this.gyroBias = [0, 0, 0];
    d.addEventListener('inputreport', (e) => this.onInput(e.reportId, e.data));
    this.hid.addEventListener('disconnect', (e) => { if (e.device === this.dev) { this.dev = null; this.onChange(false); } });
    this.dirty = true;
    this.onChange(true);
  }

  get connected() { return !!this.dev; }

  private onInput(reportId: number, data: DataView) {
    // USB full report 0x01; BT full report 0x31 has one extra leading byte.
    let off: number;
    if (reportId === 0x01 && data.byteLength >= 27) off = 0;
    else if (reportId === 0x31 && data.byteLength >= 28) { off = 1; this.bt = true; }
    else return;
    const gx = data.getInt16(off + 15, true), gy = data.getInt16(off + 17, true), gz = data.getInt16(off + 19, true);
    // auto-calibrate bias while the pad sits still
    const mag = Math.abs(gx - this.gyroBias[0]) + Math.abs(gy - this.gyroBias[1]) + Math.abs(gz - this.gyroBias[2]);
    if (this.biasSamples < 60) {
      this.gyroBias[0] += (gx - this.gyroBias[0]) / (this.biasSamples + 1);
      this.gyroBias[1] += (gy - this.gyroBias[1]) / (this.biasSamples + 1);
      this.gyroBias[2] += (gz - this.gyroBias[2]) / (this.biasSamples + 1);
      this.biasSamples++;
    } else if (mag < 40) {
      this.stillT++;
      if (this.stillT > 120) { const k = 0.01; this.gyroBias[0] += (gx - this.gyroBias[0]) * k; this.gyroBias[1] += (gy - this.gyroBias[1]) * k; this.gyroBias[2] += (gz - this.gyroBias[2]) * k; }
    } else this.stillT = 0;
    // ~16.4 LSB per deg/s
    const toRad = (v: number) => (v / 16.4) * (Math.PI / 180);
    this.gyroPitch = toRad(gx - this.gyroBias[0]);
    this.gyroYaw = toRad(gy - this.gyroBias[1]);
  }

  setRumble(l: number, r: number) {
    const L = Math.round(Math.max(0, Math.min(1, l)) * 255), R = Math.round(Math.max(0, Math.min(1, r)) * 255);
    if (L !== this.rumbleL || R !== this.rumbleR) { this.rumbleL = L; this.rumbleR = R; this.dirty = true; }
  }
  setTriggers(l2: TriggerEffect, r2: TriggerEffect) {
    if (JSON.stringify(l2) !== JSON.stringify(this.l2) || JSON.stringify(r2) !== JSON.stringify(this.r2)) { this.l2 = l2; this.r2 = r2; this.dirty = true; }
  }
  setLight(r: number, g: number, b: number) {
    const c: [number, number, number] = [r | 0, g | 0, b | 0];
    if (c.some((v, i) => Math.abs(v - this.light[i]) > 3)) { this.light = c; this.dirty = true; }
  }
  setPlayerLeds(n: number) {
    // 5 LEDs, lit from the center outward
    const patterns = [0, 0b00100, 0b01010, 0b10101, 0b11011, 0b11111];
    const p = patterns[Math.max(0, Math.min(5, n))];
    if (p !== this.playerLeds) { this.playerLeds = p; this.dirty = true; }
  }

  private trig(e: TriggerEffect): number[] {
    const b = new Array(11).fill(0);
    const u = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
    switch (e.mode) {
      case 'off': b[0] = 0x05; break;
      case 'rigid': b[0] = 0x01; b[1] = u(e.start); b[2] = u(e.force); break;
      case 'section': b[0] = 0x02; b[1] = u(e.start); b[2] = u(e.end); b[3] = u(e.force); break;
      case 'vibrate': b[0] = 0x06; b[1] = Math.round(e.freq); b[2] = u(e.amp); b[3] = u(e.start); break;
    }
    return b;
  }

  /** Call every frame; sends at most ~60Hz and only when state changed. */
  update(dt: number) {
    if (!this.dev || !this.dirty || this.sending) return;
    this.sendT -= dt;
    if (this.sendT > 0) return;
    this.sendT = 1 / 60;
    this.dirty = false;
    const c = new Uint8Array(47);
    c[0] = 0x01 | 0x02 | 0x04 | 0x08; // compatible vibration, haptics select, R2 + L2 effects
    c[1] = 0x04 | 0x10; // lightbar + player indicator
    c[2] = this.rumbleR; // right (high-freq) motor
    c[3] = this.rumbleL; // left (low-freq) motor
    c.set(this.trig(this.r2), 10);
    c.set(this.trig(this.l2), 21);
    c[37] = 0x02; // valid_flag2: lightbar setup
    c[40] = 0x02; // lightbar setup: fade in
    c[41] = 0x00; // brightness: high
    c[42] = this.playerLeds;
    c[43] = this.light[0]; c[44] = this.light[1]; c[45] = this.light[2];
    this.sending = true;
    let p: Promise<void>;
    if (!this.bt) {
      p = this.dev.sendReport(0x02, c);
    } else {
      // BT: [seq|tag] + common + padding, CRC32 over 0xA2,0x31,payload
      const payload = new Uint8Array(77);
      payload[0] = (this.seq << 4) & 0xf0;
      this.seq = (this.seq + 1) & 0x0f;
      payload[1] = 0x10;
      payload.set(c, 2);
      const crcIn = new Uint8Array(1 + 1 + 73);
      crcIn[0] = 0xa2; crcIn[1] = 0x31; crcIn.set(payload.subarray(0, 73), 2);
      const crc = crc32(crcIn);
      payload[73] = crc & 0xff; payload[74] = (crc >>> 8) & 0xff; payload[75] = (crc >>> 16) & 0xff; payload[76] = (crc >>> 24) & 0xff;
      p = this.dev.sendReport(0x31, payload.subarray(0, 77));
    }
    p.catch(() => { /* device busy / unplugged */ }).finally(() => { this.sending = false; });
  }

  async reset() {
    this.setRumble(0, 0);
    this.setTriggers({ mode: 'off' }, { mode: 'off' });
    this.sendT = 0;
    this.update(1);
  }
}

/** Polls navigator.getGamepads() and exposes edge-detected buttons + haptics. */
export class Pad {
  state: PadState = { connected: false, id: '', isDualSense: false, lx: 0, ly: 0, rx: 0, ry: 0, l2: 0, r2: 0, buttons: [], pressed: new Set(), released: new Set() };
  hid = new DualSenseHID();
  private prev: boolean[] = [];
  private rumbleT = 0;
  private rumbleStrong = 0;
  private rumbleWeak = 0;
  lastActive = 0; // performance.now() of last pad input
  onConnect: (id: string) => void = () => {};

  constructor() {
    window.addEventListener('gamepadconnected', (e) => this.onConnect((e as GamepadEvent).gamepad.id));
    this.hid.autoConnect();
  }

  private gp(): Gamepad | null {
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    let best: Gamepad | null = null;
    for (const g of list) if (g && g.connected) { if (!best || g.timestamp > best.timestamp) best = g; }
    return best;
  }

  poll(): PadState {
    const s = this.state;
    s.pressed.clear(); s.released.clear();
    const g = this.gp();
    if (!g) { s.connected = false; this.prev = []; return s; }
    s.connected = true;
    s.id = g.id;
    s.isDualSense = /dualsense|054c.*0ce6|054c.*0df2|wireless controller/i.test(g.id);
    const ax = g.axes;
    [s.lx, s.ly] = deadzone(ax[0] ?? 0, ax[1] ?? 0);
    [s.rx, s.ry] = deadzone(ax[2] ?? 0, ax[3] ?? 0);
    const b = g.buttons;
    s.l2 = b[BTN.L2]?.value ?? 0;
    s.r2 = b[BTN.R2]?.value ?? 0;
    s.buttons = b.map((x, i) => (i === BTN.L2 || i === BTN.R2 ? x.value > 0.35 : x.pressed));
    for (let i = 0; i < s.buttons.length; i++) {
      if (s.buttons[i] && !this.prev[i]) s.pressed.add(i);
      if (!s.buttons[i] && this.prev[i]) s.released.add(i);
    }
    if (s.pressed.size || Math.abs(s.lx) + Math.abs(s.ly) + Math.abs(s.rx) + Math.abs(s.ry) > 0.2 || s.r2 > 0.1 || s.l2 > 0.1) this.lastActive = performance.now();
    this.prev = s.buttons.slice();
    return s;
  }

  /** Layered rumble: strongest request wins for its duration. strong = low-freq, weak = high-freq. */
  rumble(strong: number, weak: number, ms: number) {
    const now = performance.now();
    if (now < this.rumbleT && strong <= this.rumbleStrong && weak <= this.rumbleWeak) return;
    this.rumbleT = now + ms;
    this.rumbleStrong = strong;
    this.rumbleWeak = weak;
    if (this.hid.connected) { this.hid.setRumble(strong, weak); return; }
    const g = this.gp() as (Gamepad & { vibrationActuator?: { playEffect(t: string, p: object): Promise<unknown> } }) | null;
    try { g?.vibrationActuator?.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: Math.min(1, strong), weakMagnitude: Math.min(1, weak) }).catch(() => {}); } catch { /* unsupported */ }
  }

  update(dt: number) {
    if (this.hid.connected) {
      if (performance.now() > this.rumbleT) { this.rumbleStrong = 0; this.rumbleWeak = 0; this.hid.setRumble(0, 0); }
      this.hid.update(dt);
    }
  }
}
