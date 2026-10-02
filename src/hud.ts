// HUD: DOM overlay + face HUD canvas + weapon viewmodel canvas.
import { PowerupDef, RARITY_LABEL, RARITY_CLASS } from './powerups';

export type FaceMood = 'calm' | 'hurt' | 'critical' | 'grin' | 'dead';

const $ = (id: string) => document.getElementById(id)!;

export class HUD {
  faceCtx: CanvasRenderingContext2D;
  vmCanvas: HTMLCanvasElement;
  vmCtx: CanvasRenderingContext2D;
  vmRecoil = 0;
  vmBob = 0;
  private handlerTimer: number | null = null;
  private faceMood: FaceMood = 'calm';
  private faceGlitch = 0;
  private deathAnim = 0;
  private runCount = 0;

  constructor() {
    this.faceCtx = ($('face') as HTMLCanvasElement).getContext('2d')!;
    this.vmCanvas = document.createElement('canvas');
    this.vmCanvas.width = 96; this.vmCanvas.height = 64;
    this.vmCanvas.style.cssText = 'position:absolute;right:6%;bottom:0;width:384px;height:256px;image-rendering:pixelated;pointer-events:none;';
    $('hud').appendChild(this.vmCanvas);
    this.vmCtx = this.vmCanvas.getContext('2d')!;
  }

  show() { $('hud').classList.remove('hidden'); }
  hide() { $('hud').classList.add('hidden'); }

  setRunCount(n: number) { this.runCount = n; }

  setVitals(hp: number, maxHp: number, armor: number, level: number, xp: number, xpNeed: number) {
    $('hp-num').textContent = `${Math.ceil(hp)} / ${maxHp}`;
    ($('hp-fill') as HTMLElement).style.transform = `scaleX(${Math.max(0, hp / maxHp)})`;
    $('armor-num').textContent = `${Math.floor(armor)}`;
    ($('armor-fill') as HTMLElement).style.transform = `scaleX(${Math.max(0, Math.min(1, armor / 100))})`;
    $('level-label').textContent = `LV ${level}`;
    $('xp-num').textContent = `${Math.floor(xp)} / ${xpNeed} XP`;
    ($('xp-fill') as HTMLElement).style.transform = `scaleX(${Math.max(0, Math.min(1, xp / xpNeed))})`;
  }

  pulseXp() {
    const bar = $('xp-bar');
    bar.classList.remove('pulse');
    void (bar as HTMLElement).offsetWidth;
    bar.classList.add('pulse');
    setTimeout(() => bar.classList.remove('pulse'), 250);
  }

  setCombo(mult: number, score: number, kills: number, roomIdx: number, totalRooms: number) {
    const el = $('combo-mult');
    el.textContent = `x${mult}`;
    el.style.color = mult >= 5 ? '#ff3020' : mult >= 3 ? '#ffb400' : mult >= 2 ? '#e8e0d0' : '#8a8070';
    el.style.textShadow = mult >= 2 ? `0 0 ${4 * mult}px currentColor` : 'none';
    $('score-line').textContent = `SCORE ${score}`;
    $('kills-line').textContent = `KILLS ${kills} · ROOM ${roomIdx}/${totalRooms}`;
  }

  setWeapon(name: string, ammo: string) {
    $('weapon-name').textContent = name;
    $('weapon-ammo').textContent = ammo;
  }

  hitmarker(kill: boolean) {
    const el = $('hitmarker');
    el.classList.remove('pop', 'kill');
    void el.offsetWidth;
    el.style.opacity = '1';
    if (kill) el.classList.add('kill');
    el.classList.add('pop');
    setTimeout(() => { el.style.opacity = '0'; }, kill ? 200 : 80);
  }

  killfeed(text: string, headshot: boolean) {
    const feed = $('killfeed');
    const div = document.createElement('div');
    if (headshot) div.classList.add('hs');
    div.textContent = text;
    feed.prepend(div);
    while (feed.children.length > 6) feed.removeChild(feed.lastChild!);
    setTimeout(() => { div.style.opacity = '0'; div.style.transition = 'opacity 0.5s'; setTimeout(() => div.remove(), 500); }, 4000);
  }

  announce(text: string) {
    const el = $('announcer');
    el.classList.remove('show');
    void el.offsetWidth;
    el.textContent = text;
    el.classList.add('show');
  }

  roomBanner(title: string, sub: string) {
    const el = $('room-banner');
    el.classList.remove('show');
    void el.offsetWidth;
    el.innerHTML = `${title}<span class="sub">${sub}</span>`;
    el.classList.add('show');
  }

  handlerSay(text: string, duration = 3800) {
    const el = $('handler-sub');
    el.innerHTML = `<span class="who">HANDLER //</span> ${text}`;
    el.classList.add('show');
    if (this.handlerTimer) clearTimeout(this.handlerTimer);
    this.handlerTimer = window.setTimeout(() => el.classList.remove('show'), duration);
  }

  damageNumber(sx: number, sy: number, amount: number, crit: boolean) {
    const el = document.createElement('div');
    el.className = 'dmgnum' + (crit ? ' crit' : '');
    el.textContent = crit ? `${Math.round(amount)}!` : `${Math.round(amount)}`;
    el.style.left = `${sx + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${sy - 10}px`;
    $('hud').appendChild(el);
    setTimeout(() => el.remove(), 650);
  }

  scorePopup(text: string) {
    const el = document.createElement('div');
    el.className = 'dmgnum score';
    el.textContent = text;
    el.style.left = '50%';
    el.style.top = '46%';
    $('hud').appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  staggerPrompt(show: boolean) {
    $('stagger-prompt').classList.toggle('show', show);
  }

  damageFlash() {
    const el = $('damage-flash');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 130);
  }

  setStreakTint(on: boolean) {
    $('streak-tint').style.opacity = on ? '1' : '0';
  }

  setLowHp(on: boolean) {
    $('lowhp-pulse').classList.toggle('on', on);
  }

  bossBar(show: boolean, name = '', frac = 1) {
    $('boss-bar').classList.toggle('hidden', !show);
    if (name) $('boss-name').textContent = name;
    ($('boss-fill') as HTMLElement).style.transform = `scaleX(${Math.max(0, frac)})`;
  }

  synergyFlash() {
    const el = $('synergy-flash');
    el.style.transition = 'none';
    el.style.opacity = '0.9';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.7s';
      el.style.opacity = '0';
    });
  }

  // ── face HUD ──
  setFace(mood: FaceMood) {
    if (mood === 'dead') this.deathAnim = 1;
    this.faceMood = mood;
    this.faceGlitch = 0.12;
  }

  tickFace(dt: number, streak: number) {
    if (this.faceGlitch > 0) this.faceGlitch -= dt;
    const g = this.faceCtx;
    const W = 21, H = 21;
    g.clearRect(0, 0, W, H);
    // background scanlines
    g.fillStyle = '#0a0c0a';
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(77,255,106,0.05)';
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);

    const mood = this.faceMood;
    const aging = Math.min(8, Math.floor(this.runCount / 5)); // face ages with runs
    const skin = aging > 5 ? '#9a9284' : aging > 2 ? '#b0a890' : '#c0b89c';
    const dark = '#1a1a1a';

    if (mood === 'dead') {
      // shattered — fragments drifting
      this.deathAnim = Math.max(0, this.deathAnim - dt * 0.5);
      const f = 1 - this.deathAnim;
      g.fillStyle = skin;
      for (let i = 0; i < 24; i++) {
        const a = i * 2.399, r = f * 14;
        g.fillRect(10 + Math.cos(a) * r, 10 + Math.sin(a) * r + f * 6, 1, 1);
      }
      return;
    }

    // head
    g.fillStyle = skin;
    g.fillRect(5, 2, 11, 16);
    g.fillRect(6, 18, 9, 2);
    // hair/helmet shadow
    g.fillStyle = dark;
    g.fillRect(5, 2, 11, 3);
    // aging streaks
    if (aging > 0) {
      g.fillStyle = '#e0dcd0';
      for (let i = 0; i < aging; i++) g.fillRect(6 + i, 2, 1, 2);
    }
    // eyes
    const eyeY = 9;
    if (mood === 'critical') {
      // static eyes
      g.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        g.fillRect(7, eyeY + (i % 2), Math.random() > 0.5 ? 2 : 0, 1);
        g.fillRect(12, eyeY + ((i + 1) % 2), Math.random() > 0.5 ? 2 : 0, 1);
      }
    } else {
      g.fillStyle = mood === 'grin' ? '#ffb400' : dark;
      g.fillRect(7, eyeY, 2, mood === 'hurt' ? 1 : 2);
      g.fillRect(12, eyeY, 2, mood === 'hurt' ? 1 : 2);
    }
    // mouth
    g.fillStyle = dark;
    if (mood === 'calm') g.fillRect(8, 14, 5, 1);
    else if (mood === 'hurt') { g.fillRect(8, 14, 5, 1); g.fillRect(9, 15, 3, 1); }
    else if (mood === 'critical') g.fillRect(8, 13, 5, 4); // silent scream
    else if (mood === 'grin') {
      // too wide. wrong.
      g.fillRect(6, 13, 9, 2);
      g.fillRect(5, 12, 1, 1); g.fillRect(15, 12, 1, 1);
      g.fillStyle = '#fff';
      for (let x = 7; x < 15; x += 2) g.fillRect(x, 13, 1, 1);
    }
    // glitch pixels
    if (this.faceGlitch > 0) {
      for (let i = 0; i < 12; i++) {
        g.fillStyle = Math.random() > 0.5 ? '#4dff6a' : '#c01818';
        g.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, 2, 1);
      }
    }
    // damage twitch
    if (mood === 'hurt' && Math.random() > 0.7) {
      g.fillStyle = 'rgba(192,24,24,0.5)';
      g.fillRect(5, 2, 11, 16);
    }
  }

  // ── weapon viewmodel ──
  drawViewmodel(weaponIdx: number, dt: number, moving: boolean, chargeFrac: number, firing: boolean) {
    if (firing) this.vmRecoil = Math.min(1, this.vmRecoil + 0.7);
    this.vmRecoil = Math.max(0, this.vmRecoil - dt * 6);
    if (moving) this.vmBob += dt * 9;
    const g = this.vmCtx;
    g.clearRect(0, 0, 96, 64);
    const bx = Math.sin(this.vmBob) * 2;
    const by = Math.abs(Math.cos(this.vmBob)) * 1.5 + this.vmRecoil * 8;
    const ox = 30 + bx, oy = 18 + by;

    const body = '#3a352c', darkC = '#1a1814', accent = '#c01818', glow = '#ff8020';

    if (weaponIdx === 0) {
      // PULSE rifle
      g.fillStyle = darkC; g.fillRect(ox + 20, oy + 16, 30, 10);
      g.fillStyle = body; g.fillRect(ox + 8, oy + 12, 34, 12);
      g.fillStyle = '#4a453c'; g.fillRect(ox + 8, oy + 10, 20, 4);
      g.fillStyle = accent; g.fillRect(ox + 12, oy + 14, 4, 3);
      g.fillStyle = glow; g.fillRect(ox + 44, oy + 17, 6, 6); // cell
    } else if (weaponIdx === 1) {
      // BREACHER double barrel
      g.fillStyle = darkC; g.fillRect(ox + 6, oy + 12, 44, 9);
      g.fillStyle = darkC; g.fillRect(ox + 6, oy + 23, 44, 9);
      g.fillStyle = body; g.fillRect(ox + 10, oy + 30, 22, 12);
      g.fillStyle = '#5a2418'; g.fillRect(ox + 10, oy + 34, 22, 8);
      g.fillStyle = glow; g.fillRect(ox + 48, oy + 14, 3, 5); g.fillRect(ox + 48, oy + 25, 3, 5);
    } else if (weaponIdx === 2) {
      // LANCE
      g.fillStyle = darkC; g.fillRect(ox + 14, oy + 14, 40, 8);
      g.fillStyle = body; g.fillRect(ox + 10, oy + 20, 30, 14);
      const ch = Math.floor(chargeFrac * 10);
      for (let i = 0; i < 10; i++) {
        g.fillStyle = i < ch ? '#6adfff' : '#12303a';
        g.fillRect(ox + 12 + i * 3, oy + 22, 2, 4);
      }
      g.fillStyle = chargeFrac >= 1 ? '#b0f0ff' : '#2a6a8a';
      g.fillRect(ox + 52, oy + 15, 5, 6);
    } else {
      // RIPPER chainsaw
      g.fillStyle = '#5a2418'; g.fillRect(ox + 8, oy + 24, 20, 16);
      g.fillStyle = body; g.fillRect(ox + 24, oy + 16, 34, 12);
      g.fillStyle = '#8a8578';
      const off = firing ? (performance.now() / 40) % 4 : 0;
      for (let i = 0; i < 9; i++) g.fillRect(ox + 26 + i * 4 - (off % 4), oy + 14, 2, 3);
      g.fillStyle = accent; g.fillRect(ox + 12, oy + 26, 6, 5);
    }
    // muzzle flash
    if (this.vmRecoil > 0.5 && weaponIdx !== 3) {
      g.fillStyle = `rgba(255,200,100,${(this.vmRecoil - 0.4) * 1.4})`;
      g.fillRect(ox + 50, oy + 8, 14, 14);
      g.fillStyle = `rgba(255,255,220,${(this.vmRecoil - 0.4) * 1.2})`;
      g.fillRect(ox + 54, oy + 12, 7, 7);
    }
  }

  // ── screens ──
  showPowerups(defs: [PowerupDef, PowerupDef], onPick: (idx: number) => void) {
    const screen = $('powerup-screen');
    const wrap = $('pedestals');
    wrap.innerHTML = '';
    defs.forEach((def, i) => {
      const el = document.createElement('div');
      const cls = def.category === 'curse' ? 'r-curse' : RARITY_CLASS[def.rarity];
      el.className = `pedestal ${cls}`;
      el.innerHTML = `<div class="rarity">${def.category === 'curse' ? '⚠ CURSE ⚠' : RARITY_LABEL[def.rarity]}</div>
        <div class="pname">${def.name}</div>
        <div class="pdesc">${def.desc}</div>
        <div class="pick">[ CLICK TO CLAIM — THE OTHER SHATTERS ]</div>`;
      el.onclick = () => {
        screen.classList.add('hidden');
        onPick(i);
      };
      wrap.appendChild(el);
    });
    screen.classList.remove('hidden');
  }

  hidePowerups() { $('powerup-screen').classList.add('hidden'); }
}
