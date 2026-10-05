// THE GENERAL — Warden of the Front. A war-mech that has been fighting you for eleven years.
// Learn: the cockpit hatch opens while it radios artillery (shoot the visor); the gatling sweeps —
// strafe against it; the walking barrage leaves gaps that alternate row to row. It calls in squads.
import { Boss } from './base';
import type { Run } from '../run';

export class General extends Boss {
  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 5, hpScale, 3.3, 'THE GENERAL');
    this.wy = 5.1; this.prefMin = 9; this.prefMax = 18; this.armor = 0.95;
    this.moves = [
      {
        id: 'artillery', name: 'CALL ARTILLERY', wind: 0.7, active: 2.2, recover: 0.8, w: [3, 2.5, 2.5], anim: 'attack', core: [0.8, 1, 0.5],
        tick: (st, t) => {
          this.vx *= 0.9; this.vz *= 0.9;
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.7 && k < 3) {
            this.m.k = k + 1;
            for (const p of this.run.targets()) {
              this.run.strike(p.x + p.vx * 0.65, p.z + p.vz * 0.65, 4, 1.3, 24 * this.dmgMult, 'rocket');
              for (let i = 0; i < this.phase; i++) this.run.strike(p.x + this.run.rng.range(-9, 9), p.z + this.run.rng.range(-9, 9), 4, 1.3 + this.run.rng.range(0, 0.4), 24 * this.dmgMult, 'rocket');
            }
          }
        },
      },
      {
        id: 'gatling', name: 'SUPPRESSING FIRE', wind: 0.8, active: 2.2, recover: 0.8, w: [2.5, 2.5, 2], near: 6, anim: 'attack',
        begin: () => {
          const t = this.tgt; const c = t ? this.aimYaw(t.x, t.z) : 0;
          this.m.dir = this.run.rng.chance(0.5) ? 1 : -1; this.m.a = c - this.m.dir * 0.55;
          this.tellCone(this.x, this.z, c, 0.6, 26, this.stageLen, 30);
        },
        tick: (st, _t, dt) => {
          this.vx = 0; this.vz = 0;
          this.faceTo(this.x + Math.sin(this.m.a), this.z + Math.cos(this.m.a), dt, 6);
          if (st !== 1) return;
          this.m.a += this.m.dir * (1.1 / this.stageLen) * dt;
          this.m.acc = (this.m.acc ?? 0) + dt;
          while (this.m.acc > 0.065) {
            this.m.acc -= 0.065;
            const a = this.m.a + this.run.rng.range(-0.04, 0.04);
            const ox = this.x + Math.cos(a) * -2.2, oz = this.z - Math.sin(a) * -2.2;
            this.run.spawnProjectile({ kind: 'bolt', x: ox, y: 2.4, z: oz, vx: Math.sin(a) * 30, vy: -0.6, vz: Math.cos(a) * 30, dmg: 4 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
            if (((this.m.n = (this.m.n ?? 0) + 1) % 4) === 0) this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'grunt', x: ox, y: 2.4, z: oz });
          }
        },
      },
      {
        id: 'cannon', name: 'SIEGE CANNON', wind: 1.2, active: 0.2, recover: 1.0, w: [2, 2, 2], near: 8, anim: 'charge',
        combo: [['treads', 0.3, 2]],
        begin: () => { const t = this.tgt; if (t) { this.lastAimX = t.x; this.lastAimY = t.y + 0.9; this.lastAimZ = t.z; } this.aiming = true; },
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          const tt = this.tgt;
          if (st === 0 && tt && t < this.stageLen - 0.3) {
            const k = Math.min(1, dt * 2.4);
            this.lastAimX += (tt.x - this.lastAimX) * k; this.lastAimY += (tt.y + 0.9 - this.lastAimY) * k; this.lastAimZ += (tt.z - this.lastAimZ) * k;
            this.faceTo(tt.x, tt.z, dt, 4);
          }
          if (st >= 1) this.aiming = false;
        },
        enter: (st) => {
          if (st !== 1) return;
          const ox = this.x, oy = 2.6, oz = this.z;
          const dx = this.lastAimX - ox, dy = this.lastAimY - oy, dz = this.lastAimZ - oz, l = Math.hypot(dx, dy, dz) || 1;
          this.run.spawnProjectile({ kind: 'rocket', x: ox, y: oy, z: oz, vx: (dx / l) * 38, vy: (dy / l) * 38, vz: (dz / l) * 38, dmg: 30 * this.dmgMult, owner: this.id, gravity: 0, explode: 5 });
          this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'mortar', x: ox, y: oy, z: oz });
        },
      },
      {
        id: 'treads', name: 'TREAD CHARGE', wind: 0.9, active: 2.0, recover: 1.1, w: [2, 2, 2.5], near: 8, anim: 'charge', core: [0, 0, 1],
        begin: () => {
          const t = this.tgt; if (!t) return;
          const d = this.distTo(t) || 1;
          this.m.cdx = (t.x - this.x) / d; this.m.cdz = (t.z - this.z) / d;
          const e = this.beamEnd(this.x, this.z, Math.atan2(this.m.cdx, this.m.cdz), 46, 1.5);
          this.tellLine(this.x, this.z, e.x, e.z, 4.5, this.stageLen, 30);
        },
        tick: (st, _t, dt) => {
          if (st === 0) { this.vx = 0; this.vz = 0; this.faceTo(this.x + this.m.cdx, this.z + this.m.cdz, dt, 8); return; }
          if (st === 1 && this.chargeStep(this.run, 19, dt, 32)) {
            this.m.wall = 1;
            this.run.emit({ e: 'explosion', x: this.x + this.m.cdx * 2, y: 2, z: this.z + this.m.cdz * 2, r: 4, kind: 'boss' });
            this.run.shockwave(this.x, this.z, 3, 16, 11, 12 * this.dmgMult);
            this.advance(this.run);
          }
          if (st === 2) { this.vx = 0; this.vz = 0; }
        },
        enter: (st) => { if (st === 2 && this.m.wall) this.stageLen *= 1.7; },
      },
      {
        id: 'mines', name: 'MINEFIELD', wind: 0.6, active: 1.2, recover: 0.7, w: [1.5, 2, 2], cd: 12, anim: 'attack',
        can: () => this.run.mines.length < 8,
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          const n = 6 + this.phase * 2;
          if (t >= k * (1.0 / n) && k < n) {
            this.m.k = k + 1;
            const p = this.freePoint(this.run.rng.range(-20, 20), this.run.rng.range(-18, 18), 2);
            this.lob('shell', p.x, p.z, 1.0, 0, 0, 5.5);
            this.run.after(1.0, () => { if (this.alive && this.bs !== 'finish' && this.run.mines.length < 16) this.run.spawnMine(p.x, p.z, this.id); });
          }
        },
      },
      {
        id: 'barrage', name: 'ROCKET BARRAGE', wind: 0.6, active: 1.7, recover: 0.8, w: [2, 2, 1.5], near: 10, anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.28 && k < 6) { this.m.k = k + 1; const ts = this.run.targets(); const tt = ts[k % ts.length]; if (tt) this.shootAt(this.run, tt, 'rocket', 20, 16, { explode: 3, oy: 5.4, accuracy: 0.8 }); }
        },
      },
      {
        id: 'rally', name: 'RALLY', wind: 0.9, active: 0.4, recover: 0.8, w: [0, 1.5, 1.5], cd: 22, anim: 'charge', safe: true,
        can: () => this.adds() < 4,
        enter: (st) => { if (st === 1) this.summon(this.phase === 3 ? ['bulwark', 'bomber', 'grunt'] : ['bulwark', 'grunt', 'grunt'], 3, 7, 8); },
      },
      {
        id: 'carpet', name: 'WALKING BARRAGE', wind: 0.8, active: 3.2, recover: 0.8, w: [0, 0, 2.5], cd: 9, anim: 'attack',
        begin: () => { const t = this.tgt; this.m.dir = t && t.z < this.z ? -1 : 1; this.m.row = 0; },
        tick: (st, t) => {
          if (st !== 1) return;
          const row = this.m.row;
          if (row < 8 && t >= row * 0.4) {
            this.m.row = row + 1;
            const z = this.m.dir * (-21 + row * 6);
            for (let c = 0; c < 7; c++) {
              const x = -19.5 + c * 6.5 + (row % 2 ? 3.25 : 0);
              if (x > 22) continue;
              this.run.strike(x, z, 2.4, 1.1, 24 * this.dmgMult, 'rocket');
            }
          }
        },
      },
    ];
  }

  wakeMove() { return 'barrage'; }

  transitionName(phase: number) { return phase === 2 ? 'ARTILLERY BARRAGE' : 'LAST STAND'; }

  onTransition(run: Run, phase: number) {
    if (phase === 2) {
      this.transLen = 2.4;
      for (let i = 0; i < 22; i++) {
        const x = run.rng.range(-22, 22), z = run.rng.range(-22, 22);
        run.strike(x, z, 3.4, 0.9 + run.rng.range(0, 1.8), 24 * this.dmgMult, 'rocket');
      }
      this.summon(['bulwark', 'grunt'], 2, 8, 8);
    } else {
      this.transLen = 1.8;
      for (let i = 0; i < 8; i++) { const p = this.freePoint(run.rng.range(-20, 20), run.rng.range(-18, 18), 2); run.spawnMine(p.x, p.z, this.id); }
      this.summon(['bomber', 'bomber'], 2, 7, 8);
    }
  }
}
