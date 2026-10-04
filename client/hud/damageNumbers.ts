// Floating world-space popups: damage numbers, +score, whispers. Projected to screen each frame.
import * as THREE from 'three';
import * as C from '../../shared/constants';

interface Pop { el: HTMLDivElement; x: number; y: number; z: number; t: number; life: number; vy: number; jitter: number; active: boolean }

export class DamageNumbers {
  private pool: Pop[] = [];
  private v = new THREE.Vector3();
  constructor(private root: HTMLElement) {
    for (let i = 0; i < 48; i++) {
      const el = document.createElement('div');
      el.className = 'pop';
      el.style.display = 'none';
      root.appendChild(el);
      this.pool.push({ el, x: 0, y: 0, z: 0, t: 0, life: 1, vy: 0, jitter: 0, active: false });
    }
  }

  spawn(x: number, y: number, z: number, text: string, cls: string, life = C.DAMAGE_NUMBER_DURATION, vy = 1.4) {
    let p = this.pool.find((q) => !q.active);
    if (!p) p = this.pool.reduce((a, b) => (a.t / a.life > b.t / b.life ? a : b));
    p.active = true;
    p.x = x + (Math.random() - 0.5) * 0.5; p.y = y; p.z = z + (Math.random() - 0.5) * 0.5;
    p.t = 0; p.life = life; p.vy = vy; p.jitter = (Math.random() - 0.5) * 30;
    p.el.className = 'pop ' + cls;
    p.el.textContent = text;
    p.el.style.display = 'block';
  }

  update(dt: number, cam: THREE.Camera) {
    const w = window.innerWidth, h = window.innerHeight;
    for (const p of this.pool) {
      if (!p.active) continue;
      p.t += dt;
      if (p.t >= p.life) { p.active = false; p.el.style.display = 'none'; continue; }
      p.y += p.vy * dt;
      this.v.set(p.x, p.y, p.z).project(cam);
      if (this.v.z > 1) { p.el.style.display = 'none'; continue; }
      p.el.style.display = 'block';
      const k = p.t / p.life;
      const pop = k < 0.15 ? 1 + (0.15 - k) * 4 : 1;
      const sx = (this.v.x * 0.5 + 0.5) * w + p.jitter * k, sy = (-this.v.y * 0.5 + 0.5) * h;
      p.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%) scale(${pop.toFixed(2)})`;
      p.el.style.opacity = String(k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1);
    }
  }

  clear() { for (const p of this.pool) { p.active = false; p.el.style.display = 'none'; } }
}
