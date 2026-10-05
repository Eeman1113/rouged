// THE SMELTER — Warden of the Foundry. A furnace on legs: hammer arm, claw arm, chimneys.
// Learn: jump the shockwaves, bait the rush into a pillar (it stuns itself and the furnace door
// hangs open), shoot the furnace when it glows. Phase 2 floods lava lanes; phase 3 melts the cross.
import { Boss } from './base';
import type { Run } from '../run';

export class Smelter extends Boss {
  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 0, hpScale, 2.6, 'THE SMELTER');
    this.wy = 2.9; this.prefMin = 5; this.prefMax = 12;
    const P = 'plasma' as const;
    this.moves = [
      {
        id: 'hammer', name: 'HAMMERFALL', wind: 0.95, active: 0.3, recover: 1.1, w: [3, 3, 2.5], near: 0, far: 11, anim: 'attack', core: [0, 0.6, 1],
        combo: [['fan', 0.35], ['leap', 0.3, 2]],
        begin: () => {
          const t = this.tgt; if (!t) return;
          const a = this.aimYaw(t.x, t.z), d = Math.min(5.5, Math.max(3, this.distTo(t)));
          const p = this.freePoint(this.x + Math.sin(a) * d, this.z + Math.cos(a) * d, 1.5);
          this.m.ix = p.x; this.m.iz = p.z;
          this.tellCircle(p.x, p.z, 4.5, this.stageLen);
        },
        tick: (st, _t, dt) => { this.vx = 0; this.vz = 0; if (st === 0) this.faceTo(this.m.ix, this.m.iz, dt, 4); },
        enter: (st) => {
          if (st !== 1) return;
          this.run.explodeAt(this.m.ix, 0.3, this.m.iz, 4.5, 30 * this.dmgMult, null, 'boss');
          this.run.shockwave(this.m.ix, this.m.iz, 4.5, 24, 11, 16 * this.dmgMult);
          if (this.phase === 3) { const x = this.m.ix, z = this.m.iz; this.run.after(0.5, () => { if (this.alive && this.bs !== 'finish') this.run.shockwave(x, z, 3, 24, 13, 14 * this.dmgMult); }); }
        },
      },
      {
        id: 'leap', name: 'MOLTEN LEAP', wind: 0.8, active: 1.0, recover: 0.9, w: [2, 2.5, 3], near: 8, anim: 'charge', noBreak: true, core: [0, 0, 0.8],
        combo: [['fan', 0.4], ['hammer', 0.25, 2]],
        begin: () => {
          const t = this.tgt; if (!t) return;
          const p = this.freePoint(t.x + t.vx * 0.5, t.z + t.vz * 0.5, 4);
          this.m.sx = this.x; this.m.sz = this.z; this.m.lx = p.x; this.m.lz = p.z;
          this.tellCircle(p.x, p.z, 5, this.stageLength(this.cur!, 0) + this.stageLength(this.cur!, 1));
        },
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st === 0) { this.faceTo(this.m.lx, this.m.lz, dt, 6); return; }
          if (st === 1) {
            const k = Math.min(1, t / this.stageLen), e = k * k * (3 - 2 * k);
            this.x = this.m.sx + (this.m.lx - this.m.sx) * e; this.z = this.m.sz + (this.m.lz - this.m.sz) * e;
            this.lift = Math.sin(Math.PI * k) * 9;
          }
        },
        enter: (st) => {
          if (st !== 2) return;
          this.x = this.m.lx; this.z = this.m.lz; this.lift = 0;
          this.run.explodeAt(this.x, 0.3, this.z, 5.2, 32 * this.dmgMult, null, 'boss');
          this.run.shockwave(this.x, this.z, 5, 24, 12, 16 * this.dmgMult);
          if (this.phase >= 2) for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + this.run.rng.range(0, 1);
            const p = this.freePoint(this.x + Math.cos(a) * 6.5, this.z + Math.sin(a) * 6.5, 2);
            this.run.addZone({ kind: 'lava', shape: 'circle', x: p.x, z: p.z, w: 2.2, dps: 30 * this.dmgMult, warn: 0.6, life: 6 });
          }
        },
        end: () => { this.lift = 0; },
      },
      {
        id: 'fan', name: 'SLAG SPRAY', wind: 0.65, active: 1.1, recover: 0.7, w: [3, 2.5, 2], near: 6, far: 40, anim: 'attack',
        begin: () => { const t = this.tgt; if (t) this.tellCone(this.x, this.z, this.aimYaw(t.x, t.z), 0.6, 18, this.stageLen); },
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          const tg = this.tgt; if (!tg) return;
          this.faceTo(tg.x, tg.z, dt, st === 0 ? 4 : 2);
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.4 && k < 3) {
            this.m.k = k + 1;
            const n = this.phase === 3 ? 13 : this.phase === 2 ? 11 : 9;
            this.fan(P, n, 0.1, 17, 9, this.headY, this.aimYaw(tg.x, tg.z) + (k % 2 ? 0.05 : 0));
          }
        },
      },
      {
        id: 'charge', name: 'FURNACE RUSH', wind: 0.9, active: 2.0, recover: 1.2, w: [2, 2.5, 2.5], near: 8, anim: 'charge', core: [0, 0, 1],
        combo: [['fan', 0.3, 2]],
        begin: () => {
          const t = this.tgt; if (!t) return;
          const d = this.distTo(t) || 1;
          this.m.cdx = (t.x - this.x) / d; this.m.cdz = (t.z - this.z) / d;
          const e = this.beamEnd(this.x, this.z, Math.atan2(this.m.cdx, this.m.cdz), 46, 1.5);
          this.tellLine(this.x, this.z, e.x, e.z, 4.5, this.stageLen);
        },
        tick: (st, _t, dt) => {
          if (st === 0) { this.vx = 0; this.vz = 0; this.faceTo(this.x + this.m.cdx, this.z + this.m.cdz, dt, 8); return; }
          if (st === 1 && this.chargeStep(this.run, 21, dt, 34)) {
            this.m.wall = 1;
            this.run.emit({ e: 'explosion', x: this.x + this.m.cdx * 2, y: 2, z: this.z + this.m.cdz * 2, r: 4, kind: 'boss' });
            this.ring(P, 16, 1.2, 10, 9);
            this.advance(this.run);
          }
          if (st === 2) { this.vx *= 0.8; this.vz *= 0.8; }
        },
        enter: (st) => { if (st === 2 && this.m.wall) this.stageLen *= 1.8; if (st === 2) { this.vx = 0; this.vz = 0; } },
      },
      {
        id: 'vent', name: 'FURNACE VENT', wind: 0.95, active: 2.6, recover: 0.9, w: [1.5, 2.5, 2.5], near: 0, far: 16, anim: 'charge', core: [1, 1, 0.6],
        begin: () => {
          const t = this.tgt;
          this.m.a = (t ? this.aimYaw(t.x, t.z) : 0) + Math.PI / 2;
          this.m.dir = this.run.rng.chance(0.5) ? 1 : -1;
          this.tellCircle(this.x, this.z, 15, this.stageLen, 30);
        },
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st === 2) return;
          let a = this.m.a;
          if (st === 1) {
            const flip = this.phase === 3 && t > this.stageLen * 0.55;
            this.m.a += this.m.dir * (flip ? -1 : 1) * 1.35 * dt;
            a = this.m.a;
          }
          const e1 = this.beamEnd(this.x, this.z, a, 15, 0.55), e2 = this.beamEnd(this.x, this.z, a + Math.PI, 15, 0.55);
          this.beamAt(e2.x, e2.z, e1.x, e1.z, 0.55, 0.7, st === 1, 20);
        },
        end: () => { this.beam = null; },
      },
      {
        id: 'pour', name: 'MOLTEN POUR', wind: 0.8, active: 1.8, recover: 0.8, w: [0, 2, 2.5], anim: 'attack',
        tick: (st, t) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.6 && k < 3) {
            this.m.k = k + 1;
            for (const p of this.run.targets()) {
              const pts = [{ x: p.x + p.vx * 0.6, z: p.z + p.vz * 0.6 }];
              for (let i = 0; i < 1 + this.phase; i++) pts.push({ x: p.x + this.run.rng.range(-8, 8), z: p.z + this.run.rng.range(-8, 8) });
              for (const q of pts) {
                this.run.strike(q.x, q.z, 3, 1.2, 22 * this.dmgMult, 'rocket');
                this.run.after(1.2, () => { if (this.alive && this.bs !== 'finish') this.run.addZone({ kind: 'lava', shape: 'circle', x: q.x, z: q.z, w: 2.2, dps: 28 * this.dmgMult, warn: 0.2, life: 4 }); });
              }
            }
            this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'warden', x: this.x, y: 6, z: this.z });
          }
        },
      },
      {
        id: 'spiral', name: 'CRUCIBLE SPIN', wind: 0.7, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 8, anim: 'attack',
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt;
          this.m.spin = (this.m.spin ?? 0) + dt * 3.4;
          while (this.m.acc > 0.1) {
            this.m.acc -= 0.1;
            for (let k = 0; k < 4; k++) {
              const a = this.m.spin + (k * Math.PI) / 2;
              this.run.spawnProjectile({ kind: P, x: this.x, y: 1.4, z: this.z, vx: Math.sin(a) * 10, vy: 0, vz: Math.cos(a) * 10, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
            }
          }
          void t;
        },
      },
    ];
  }

  wakeMove() { return 'hammer'; }

  transitionName(phase: number) { return phase === 2 ? 'THE FLOOD' : 'MELTDOWN'; }

  onTransition(run: Run, phase: number) {
    const dps = 34 * this.dmgMult;
    if (phase === 2) {
      run.addZone({ kind: 'lava', shape: 'rect', x: 0, z: -2, w: 44, d: 3, dps, warn: 1.6, on: 5, off: 3.5 });
      run.addZone({ kind: 'lava', shape: 'rect', x: 0, z: 9, w: 44, d: 3, dps, warn: 2.4, on: 5, off: 3.5 });
    } else {
      run.addZone({ kind: 'lava', shape: 'rect', x: -9, z: 0, w: 3, d: 44, dps, warn: 1.8, on: 4, off: 4 });
      run.addZone({ kind: 'lava', shape: 'rect', x: 9, z: 0, w: 3, d: 44, dps, warn: 3.0, on: 4, off: 4 });
      this.summon(['drone', 'drone'], 2, 5);
    }
  }
}
