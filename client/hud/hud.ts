// HUD: DOM layer (numbers, bars, feeds) + low-res 2D canvas layer (weapon sprite, face, crosshair, hitmarkers).

import type { Pedestal, Rarity, ShopItem, WeaponId } from '../../shared/protocol';
import { POWERUP_BY_ID, RARITY_COLOR } from '../../shared/powerupDefs';
import { WEAPONS } from '../../shared/weaponDefs';
import * as C from '../../shared/constants';
import { Viewmodel, ViewMotion } from './viewmodel';
import { KillFeed, esc } from './killfeed';
import { Announcer } from './announcer';
import { DamageNumbers } from './damageNumbers';
import { FaceHud } from './face';

const $ = <T extends HTMLElement = HTMLElement>(root: HTMLElement, sel: string) => root.querySelector(sel) as T;

export class Hud {
  root: HTMLElement;
  ctx: CanvasRenderingContext2D;
  killfeed: KillFeed;
  announcer: Announcer;
  pops: DamageNumbers;
  face = new FaceHud();
  els: Record<string, HTMLElement> = {};
  // weapon viewmodel state
  weapon: WeaponId = 'pulse';
  fireT = 99;
  extraT = 99;
  charge = 0;
  ripperOn = false;
  switchT = 1;
  kick = 0;
  hitT = 99;
  hitKill = false;
  hitHead = false;
  gloryT = 99;
  /** First-person viewmodel (weapon + hands). */
  vm = new Viewmodel();
  /** Movement state for the viewmodel, filled by the game each frame (dashing, airborne, lookDX/DY, sprinting, crouching). */
  motion: Partial<ViewMotion> = {};
  hpFrac = 1;
  visible = false;
  private handlerTimer = 0;
  private lastHp = -1;
  private lastScore = -1;
  private lastCombo = -1;
  private chatT: number[] = [];
  private canvasW = 640;
  private canvasH = 480;

  constructor(root: HTMLElement, private canvas: HTMLCanvasElement) {
    this.root = root;
    root.innerHTML = `
      <div class="hud-tl"><div class="room" id="h-room"></div><div class="seed" id="h-seed"></div><div class="score" id="h-score">0</div><div class="scrap" id="h-scrap">◆ 0</div></div>
      <div class="hud-tc">
        <div class="boss hidden" id="h-boss"><div class="boss-name"></div><div class="boss-bar"><div class="boss-fill"></div></div><div class="boss-phase"></div></div>
        <div class="timer hidden" id="h-timer"></div>
        <div class="wave hidden" id="h-wave"></div>
        <div class="left" id="h-left"></div>
        <div class="mutator hidden" id="h-mut"></div>
      </div>
      <div id="h-killfeed"></div>
      <div id="h-announce"></div>
      <div id="h-handler"><span class="who">HANDLER</span><span class="txt"></span></div>
      <div id="h-combo"><span class="x">x</span><span class="n">1</span><div class="bar"><i></i></div></div>
      <div id="h-prompt"></div>
      <div id="h-pedestal"></div>
      <div id="h-chat"></div>
      <div id="h-powerups"></div>
      <div class="hud-bottom">
        <div class="hb-left">
          <div class="stat hp" id="h-hp"><div class="lbl">HEALTH</div><div class="v">100</div></div>
          <div class="stat ar" id="h-ar"><div class="lbl">ARMOR</div><div class="v">0</div></div>
        </div>
        <div class="hb-right">
          <div class="stat ammo" id="h-ammo"><div class="lbl">PULSE</div><div class="v">100%</div></div>
          <div class="weapons" id="h-weapons"></div>
          <div class="dash" id="h-dash"></div>
        </div>
      </div>
      <div id="h-xp"><div class="fill"></div><div class="lvl">LV 1</div></div>
      <div id="h-pops"></div>`;
    for (const id of ['h-scrap', 'h-mut', 'h-room', 'h-seed', 'h-score', 'h-boss', 'h-timer', 'h-wave', 'h-left', 'h-handler', 'h-combo', 'h-prompt', 'h-pedestal', 'h-chat', 'h-powerups', 'h-hp', 'h-ar', 'h-ammo', 'h-weapons', 'h-dash', 'h-xp']) this.els[id] = $(root, '#' + id);
    this.killfeed = new KillFeed($(root, '#h-killfeed'));
    this.announcer = new Announcer($(root, '#h-announce'));
    this.pops = new DamageNumbers($(root, '#h-pops'));
    this.ctx = canvas.getContext('2d')!;
    this.show(false);
  }

  show(on: boolean) {
    this.visible = on;
    if (on) this.root.classList.remove('hub');
    this.root.classList.toggle('off', !on);
    if (!on) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hubMode(on: boolean) {
    this.root.classList.toggle('hub', on);
    this.root.classList.toggle('off', !on && !this.visible);
  }

  resize(w: number, h: number) {
    this.canvasW = w; this.canvasH = h;
    this.canvas.width = w; this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }

  // ───────────────────────────── DOM setters ─────────────────────────────

  setRoom(text: string) { this.els['h-room'].textContent = text; }
  setSeed(seed: string) { this.els['h-seed'].textContent = 'SEED ' + seed; }

  setScore(n: number) {
    if (n === this.lastScore) return;
    const el = this.els['h-score'];
    el.textContent = n.toLocaleString();
    if (n > this.lastScore && this.lastScore >= 0) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    this.lastScore = n;
  }

  setHp(hp: number, max: number, armor: number) {
    this.hpFrac = Math.max(0, hp / Math.max(1, max));
    const el = this.els['h-hp'];
    const v = el.querySelector('.v') as HTMLElement;
    if (hp !== this.lastHp) {
      v.textContent = String(Math.max(0, Math.ceil(hp)));
      v.classList.remove('flash'); void v.offsetWidth; v.classList.add('flash');
      this.lastHp = hp;
    }
    el.classList.toggle('low', this.hpFrac < 0.3);
    (this.els['h-ar'].querySelector('.v') as HTMLElement).textContent = String(Math.ceil(armor));
    this.els['h-ar'].style.opacity = armor > 0 ? '1' : '0.35';
  }

  setAmmo(weapon: WeaponId, frac: number) {
    const el = this.els['h-ammo'];
    (el.querySelector('.lbl') as HTMLElement).textContent = WEAPONS[weapon].name;
    (el.querySelector('.v') as HTMLElement).textContent = weapon === 'ripper' ? '∞' : Math.floor(frac * 100) + '%';
    (el.querySelector('.v') as HTMLElement).style.color = frac < 0.15 && weapon !== 'ripper' ? '#ff3a2a' : '';
  }

  setWeapons(unlocked: WeaponId[], current: WeaponId) {
    const html = (['pulse', 'breacher', 'lance', 'ripper'] as WeaponId[]).map((w) =>
      `<div class="w ${w === current ? 'on' : ''} ${unlocked.includes(w) ? '' : 'lock'}">${WEAPONS[w].slot}</div>`).join('');
    if (this.els['h-weapons'].innerHTML !== html) this.els['h-weapons'].innerHTML = html;
  }

  setDash(charges: number, max: number) {
    let html = '';
    for (let i = 0; i < max; i++) {
      const f = Math.max(0, Math.min(1, charges - i));
      html += f >= 1 ? '<i class="full"></i>' : f > 0 ? `<i class="part" style="--p:${Math.round(f * 100)}%"></i>` : '<i></i>';
    }
    this.els['h-dash'].innerHTML = html;
  }

  setCombo(n: number, frac: number) {
    const el = this.els['h-combo'];
    el.classList.toggle('on', n > 1);
    el.classList.toggle('hot', n >= 5);
    (el.querySelector('.n') as HTMLElement).textContent = String(n);
    (el.querySelector('.bar i') as HTMLElement).style.width = Math.round(frac * 100) + '%';
    if (n > this.lastCombo && n > 1) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    this.lastCombo = n;
  }

  setXp(frac: number, level: number, pulse = false) {
    const el = this.els['h-xp'];
    (el.querySelector('.fill') as HTMLElement).style.width = (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%';
    (el.querySelector('.lvl') as HTMLElement).textContent = 'LV ' + level;
    if (pulse) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
  }

  setBoss(name: string | null, frac = 1, phase = 1) {
    const el = this.els['h-boss'];
    if (!name) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    (el.querySelector('.boss-name') as HTMLElement).textContent = name;
    (el.querySelector('.boss-fill') as HTMLElement).style.width = (frac * 100).toFixed(1) + '%';
    (el.querySelector('.boss-phase') as HTMLElement).textContent = 'PHASE ' + 'I'.repeat(phase);
  }

  setTimer(sec: number | null) {
    const el = this.els['h-timer'];
    if (sec === null || sec < -0.5) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.textContent = sec <= 0 ? 'PURGE' : sec.toFixed(1);
    el.classList.toggle('urgent', sec < 10);
  }

  setWave(n: number) {
    const el = this.els['h-wave'];
    if (!n) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.textContent = `WAVE ${n}/3`;
  }

  setEnemiesLeft(n: number, show: boolean) {
    this.els['h-left'].textContent = show && n > 0 ? `${n} HOSTILE${n === 1 ? '' : 'S'}` : '';
  }

  setPowerups(list: { id: string; rarity: Rarity }[]) {
    const html = list.map((p) => `<i style="background:${RARITY_COLOR[p.rarity]}" title="${POWERUP_BY_ID[p.id]?.name ?? p.id}"></i>`).join('');
    if (this.els['h-powerups'].innerHTML !== html) this.els['h-powerups'].innerHTML = html;
  }

  prompt(text: string | null) {
    const el = this.els['h-prompt'];
    if (!text) { el.classList.remove('on'); return; }
    if (el.textContent !== text) el.textContent = text;
    el.classList.add('on');
  }

  pedestalInfo(p: Pedestal | null, key: string) {
    const el = this.els['h-pedestal'];
    if (!p) { el.classList.remove('on'); return; }
    const def = POWERUP_BY_ID[p.offer.id];
    const s = { common: 0.4, rare: 1, epic: 2, legendary: 1 }[p.offer.rarity];
    const color = RARITY_COLOR[p.offer.rarity];
    el.style.borderColor = color;
    el.innerHTML = `<div class="r" style="color:${color}">${p.offer.rarity.toUpperCase()} · ${def.category.toUpperCase()}</div>
      <div class="nm" style="color:${color}">${esc(def.name)}</div>
      <div class="ds">${esc(def.desc(s))}</div>
      ${p.offer.rarity === 'epic' && def.twist ? `<div class="tw">+ ${esc(def.twist)}</div>` : ''}
      <div class="k">[${key}] TAKE · THE OTHER SHATTERS</div>`;
    el.classList.add('on');
  }

  setScrap(n: number) {
    const el = this.els['h-scrap'];
    const t = '◆ ' + n;
    if (el.textContent !== t) { el.textContent = t; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }

  setMutator(text: string | null) {
    const el = this.els['h-mut'];
    if (!text) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.textContent = '⚠ ' + text;
  }

  shopInfo(item: ShopItem | null, key: string, scrap: number) {
    const el = this.els['h-pedestal'];
    if (!item) { el.classList.remove('on'); return; }
    const can = scrap >= item.price;
    if (item.kind === 'powerup' && item.offer) {
      const def = POWERUP_BY_ID[item.offer.id];
      const sc = { common: 0.4, rare: 1, epic: 2, legendary: 1 }[item.offer.rarity];
      const color = RARITY_COLOR[item.offer.rarity];
      el.style.borderColor = color;
      el.innerHTML = `<div class="r" style="color:${color}">${item.offer.rarity.toUpperCase()} · ${def.category.toUpperCase()}</div><div class="nm" style="color:${color}">${esc(def.name)}</div><div class="ds">${esc(def.desc(sc))}</div>
        <div class="k" style="color:${can ? '#2affd0' : '#ff4a4a'}">[${key}] BUY — ${item.price} SCRAP${can ? '' : ' (NOT ENOUGH)'}</div>`;
    } else {
      el.style.borderColor = '#2affd0';
      el.innerHTML = `<div class="nm" style="color:#2affd0">${item.kind === 'heal' ? 'FIELD REPAIR' : 'PLATING'}</div><div class="ds">${item.kind === 'heal' ? 'Restore 60 HP.' : '+50 armor.'}</div>
        <div class="k" style="color:${can ? '#2affd0' : '#ff4a4a'}">[${key}] BUY — ${item.price} SCRAP${can ? '' : ' (NOT ENOUGH)'}</div>`;
    }
    el.classList.add('on');
  }

  handlerSay(text: string, glitch: number, who = 'HANDLER') {
    const el = this.els['h-handler'];
    (el.querySelector('.who') as HTMLElement).textContent = who;
    el.dataset.who = who;
    (el.querySelector('.txt') as HTMLElement).textContent = text;
    el.classList.add('on');
    if (glitch > 0.3) { el.classList.remove('glitch'); void el.offsetWidth; el.classList.add('glitch'); }
    clearTimeout(this.handlerTimer);
    this.handlerTimer = window.setTimeout(() => el.classList.remove('on'), 1800 + text.length * 55);
  }

  chat(text: string) {
    const el = this.els['h-chat'];
    const d = document.createElement('div');
    d.textContent = text;
    el.appendChild(d);
    while (el.children.length > 5) el.firstElementChild?.remove();
    setTimeout(() => d.remove(), 6000);
    this.chatT.push(Date.now());
  }

  // ───────────────────────────── 2D layer ─────────────────────────────

  /** ADS blend 0..1, set by the game every frame */
  ads = 0;
  adsWeapon: WeaponId = 'pulse';

  /** Lance sniper scope: black mask, lens tint, mil-dot reticle, charge ring. */
  private drawScope(g: CanvasRenderingContext2D, W: number, H: number, ads: number) {
    const cx = W / 2, cy = H / 2;
    const k = Math.min(1, (ads - 0.05) / 0.6);
    const r = Math.round(H * (0.62 - 0.2 * k));
    g.save();
    g.globalAlpha = k;
    // mask
    g.fillStyle = '#000';
    g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, r, 0, Math.PI * 2, true); g.fill();
    // lens tint + vignette ring
    const grd = g.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
    grd.addColorStop(0, 'rgba(40,120,170,0.06)'); grd.addColorStop(0.85, 'rgba(0,10,20,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0.95)');
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    // reticle: thin lines, dark core with a pale edge so it reads on any scene
    g.shadowColor = 'rgba(210,235,255,0.9)'; g.shadowBlur = 0; g.shadowOffsetX = 1; g.shadowOffsetY = 1;
    g.fillStyle = 'rgba(5,8,10,0.95)';
    g.fillRect(Math.round(cx - r), Math.round(cy), Math.round(r - 10), 1); g.fillRect(Math.round(cx + 10), Math.round(cy), Math.round(r - 10), 1);
    g.fillRect(Math.round(cx), Math.round(cy + 10), 1, Math.round(r - 10)); g.fillRect(Math.round(cx), Math.round(cy - r * 0.5), 1, Math.round(r * 0.5 - 10));
    g.fillRect(Math.round(cx - r), Math.round(cy - 1), Math.round(r * 0.35), 3); g.fillRect(Math.round(cx + r * 0.65), Math.round(cy - 1), Math.round(r * 0.35), 3);
    g.fillRect(Math.round(cx - 1), Math.round(cy + r * 0.65), 3, Math.round(r * 0.35));
    for (let i = 1; i <= 4; i++) { const d = Math.round(i * r * 0.12); g.fillRect(Math.round(cx + d - 1), Math.round(cy - 2), 2, 5); g.fillRect(Math.round(cx - d - 1), Math.round(cy - 2), 2, 5); g.fillRect(Math.round(cx - 2), Math.round(cy + d - 1), 5, 2); }
    g.shadowOffsetX = 0; g.shadowOffsetY = 0;
    g.fillStyle = '#ff3a2a'; g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 2, 2);
    // charge ring
    if (this.charge > 0.01) {
      g.strokeStyle = this.charge >= 0.99 ? '#ffffff' : '#5ac8ff';
      g.lineWidth = 3;
      g.beginPath(); g.arc(cx, cy, r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.charge); g.stroke();
      g.font = "10px 'Press Start 2P', monospace"; g.textAlign = 'center'; g.fillStyle = g.strokeStyle;
      g.fillText(this.charge >= 0.99 ? 'FULL CHARGE' : Math.round(this.charge * 100) + '%', cx, Math.round(cy + r * 0.42));
    }
    g.restore();
  }

  hitmarker(kill: boolean, head: boolean) {
    this.hitT = 0;
    this.hitKill = kill || (this.hitKill && this.hitT < C.HITMARKER_DURATION * 2.5);
    this.hitHead = head;
  }

  weaponFire() { this.fireT = 0; this.kick = 1; if (this.weapon === 'breacher') this.extraT = -0.12; this.vm.fire(); }
  weaponSwitch(w: WeaponId) { if (w !== this.weapon) { this.weapon = w; this.switchT = 0; this.fireT = 99; this.extraT = 99; this.vm.setWeapon(w); } }
  glory() { this.gloryT = 0; this.vm.glory(); }
  /** Full reload animation stretched to `duration` seconds. */
  reload(duration: number) { this.vm.reload(duration); }
  /** Weapon inspect (cancelled by fire / reload / switch). */
  inspect() { this.vm.inspect(); }
  get reloading(): boolean { return this.vm.reloading; }
  /** Muzzle position on the HUD canvas for the current frame. */
  muzzle(): { x: number; y: number } { return this.vm.muzzle(); }

  draw(dt: number, bob: { t: number; amt: number; land: number; sliding: boolean }) {
    if (!this.visible) return;
    const g = this.ctx;
    const W = this.canvasW, H = this.canvasH;
    g.clearRect(0, 0, W, H);
    this.fireT += dt; this.extraT += dt; this.switchT += dt; this.hitT += dt; this.gloryT += dt;
    this.kick *= Math.max(0, 1 - dt * 14);
    this.face.update(dt);

    // ── weapon viewmodel (3D-posed pixel-art rig, see ./viewmodel.ts)
    this.vm.setCharge(this.weapon === 'lance' ? this.charge : 0);
    this.vm.setRipper(this.weapon === 'ripper' && this.ripperOn, this.weapon === 'ripper' && this.ripperOn);
    const mo = this.motion;
    this.vm.draw(g, W, H, dt, {
      bobT: bob.t, bobAmt: bob.amt, land: bob.land, sliding: bob.sliding,
      dashing: !!mo.dashing, airborne: !!mo.airborne, lookDX: mo.lookDX ?? 0, lookDY: mo.lookDY ?? 0,
      sprinting: !!mo.sprinting, crouching: !!mo.crouching, ads: this.ads,
    });
    mo.lookDX = 0; mo.lookDY = 0;

    // ── crosshair / sights
    const cx = Math.round(W / 2), cy = Math.round(H / 2);
    const ads = this.ads;
    if (this.weapon === 'lance' && ads > 0.05) this.drawScope(g, W, H, ads);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    if (this.weapon === 'pulse' && ads > 0.5) {
      // holographic red-dot
      const r = 7;
      g.fillStyle = 'rgba(255,60,40,0.9)';
      for (let k = 0; k < 24; k++) { const t = (k / 24) * Math.PI * 2; if (k % 6 === 0) continue; g.fillRect(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1); }
      g.fillStyle = '#ff2a1a'; g.fillRect(cx - 1, cy - 1, 2, 2);
      g.fillStyle = 'rgba(255,120,90,0.35)'; g.fillRect(cx - 2, cy - 2, 4, 4);
    } else if (this.weapon === 'lance' && ads > 0.6) {
      // the scope draws its own reticle
    } else if (this.weapon === 'breacher') {
      const r = Math.round(10 - ads * 4);
      for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; g.fillRect(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1); }
      g.fillRect(cx, cy, 1, 1);
    } else if (this.weapon === 'ripper') {
      g.fillRect(cx - 1, cy - 1, 3, 3);
    } else {
      const gap = this.weapon === 'lance' ? 4 - this.charge * 3 : 3;
      g.fillRect(cx - gap - 4, cy, 4, 1); g.fillRect(cx + gap + 1, cy, 4, 1);
      g.fillRect(cx, cy - gap - 4, 1, 4); g.fillRect(cx, cy + gap + 1, 1, 4);
      g.fillRect(cx, cy, 1, 1);
    }

    // ── hitmarker (white X; red X on kill)
    const hd = this.hitKill ? 0.2 : C.HITMARKER_DURATION;
    if (this.hitT < hd) {
      const k = this.hitT / hd;
      const s = (k < 0.5 ? 1 + k * 0.8 : 1.4 - (k - 0.5) * 0.8) * (this.hitKill ? 1.6 : 1);
      const len = Math.round(5 * s), off = Math.round(4 * s);
      g.fillStyle = this.hitKill ? '#ff2a2a' : this.hitHead ? '#ffd23a' : '#ffffff';
      for (let i = 0; i < len; i++) {
        const d = off + i;
        const t = this.hitKill ? 2 : 1;
        g.fillRect(cx + d, cy + d, t, t); g.fillRect(cx - d, cy + d, t, t);
        g.fillRect(cx + d, cy - d, t, t); g.fillRect(cx - d, cy - d, t, t);
      }
    } else if (this.hitT > hd) this.hitKill = false;

    // ── face (bottom center)
    const fs = Math.max(1, Math.round(H / 220));
    const fc = this.face.canvas(this.hpFrac);
    const fw = fc.width * fs, fh = fc.height * fs;
    const fx = Math.round(W / 2 - fw / 2), fy = H - fh - 6 * fs;
    g.fillStyle = 'rgba(10,6,6,0.85)';
    g.fillRect(fx - 3 * fs, fy - 3 * fs, fw + 6 * fs, fh + 6 * fs);
    g.fillStyle = '#3a1a14';
    g.fillRect(fx - 3 * fs, fy - 3 * fs, fw + 6 * fs, fs);
    g.drawImage(fc, fx, fy, fw, fh);
  }
}
