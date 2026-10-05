// THE FIRST — Warden of the Core. The heart they built before you, out of you.
// Learn the rhythm: every beat is a ring to jump. The artery lash sweeps low. Vein Burst always
// leaves one lane open. It copies you (replicas) and, at the end, its heart races.
import { Boss } from './base';
import type { Run } from '../run';

export class First extends Boss {
  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 2, hpScale, 3.0, 'THE FIRST');
    this.wy = 3.1; this.prefMin = 7; this.prefMax = 15;
    const O = 'orb' as const;
    this.moves = [
      {
        id: 'heartbeat', name: 'HEARTBEAT', wind: 0.75, active: 1.5, recover: 0.8, w: [3, 2.5, 2.5], anim: 'charge', core: [0.5, 1, 0.3],
        combo: [['lash', 0.3, 2], ['veins', 0.25, 2]],
        tick: (st, t) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          const beats = this.phase === 3 ? 3 : 2;
          if (t >= k * 0.6 && k < beats) {
            this.m.k = k + 1;
            this.run.shockwave(this.x, this.z, 3, 24, 10, 15 * this.dmgMult, 0.55, 350);
            this.ring(O, 14 + this.phase * 2, 1.3, 8, 8);
            this.run.emit({ e: 'explosion', x: this.x, y: 3, z: this.z, r: 3, kind: 'kill' });
          }
        },
      },
      {
        id: 'lash', name: 'ARTERY LASH', wind: 0.8, active: 1.4, recover: 0.8, w: [2.5, 2.5, 2.5], near: 0, far: 15, anim: 'attack',
        begin: () => {
          const t = this.tgt;
          const c = t ? this.aimYaw(t.x, t.z) : 0;
          this.m.dir = this.run.rng.chance(0.5) ? 1 : -1;
          this.m.a = c - this.m.dir * 1.6;
          this.tellCone(this.x, this.z, c, 1.7, 15, this.stageLen, 350);
        },
        tick: (st, _t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st === 2) { this.beam = null; return; }
          if (st === 1) this.m.a += this.m.dir * (3.3 / this.stageLen) * dt;
          const e = this.beamEnd(this.x, this.z, this.m.a, 15, 0.5);
          this.beamAt(this.x, this.z, e.x, e.z, 0.5, 0.7, st === 1, 20);
        },
        end: () => { this.beam = null; },
      },
      {
        id: 'clot', name: 'CLOT BARRAGE', wind: 0.6, active: 1.7, recover: 0.8, w: [2, 2, 2], near: 8, anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.28 && k < 6) {
            this.m.k = k + 1;
            const ts = this.run.targets(); const tt = ts[k % ts.length];
            if (tt) this.shootAt(this.run, tt, 'rocket', 18, 15, { explode: 3, oy: 4.5, accuracy: 0.85 });
          }
        },
      },
      {
        id: 'scuttle', name: 'SCUTTLE STRIKE', wind: 0.7, active: 1.95, recover: 1.0, w: [2, 2.5, 2.5], near: 6, anim: 'charge', noBreak: true, core: [0, 0, 1],
        begin: () => { this.planHop(); this.tellCircle(this.m.lx, this.m.lz, 3.6, this.stageLen + 0.65, 350); },
        tick: (st, t) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          const hop = Math.min(2, Math.floor(t / 0.65)), ht = (t - hop * 0.65) / 0.65;
          if (hop !== (this.m.hop ?? 0)) {
            this.land();
            this.m.hop = hop; this.planHop();
            this.tellCircle(this.m.lx, this.m.lz, 3.6, 0.65, 350);
          }
          const e = Math.min(1, ht);
          this.x = this.m.sx + (this.m.lx - this.m.sx) * e; this.z = this.m.sz + (this.m.lz - this.m.sz) * e;
          this.lift = Math.sin(Math.PI * e) * 2.8;
        },
        enter: (st) => { if (st === 2) this.land(); },
        end: () => { this.lift = 0; },
      },
      {
        id: 'mimic', name: 'MIMICRY', wind: 1.0, active: 0.4, recover: 0.8, w: [0, 1.5, 1.5], cd: 24, anim: 'charge', safe: true,
        can: () => this.adds() < 3,
        enter: (st) => { if (st === 1) this.summon(['replica'], this.phase === 3 ? 2 : 1, 5, 6); },
      },
      {
        id: 'veins', name: 'VEIN BURST', wind: 0.8, active: 1.0, recover: 0.8, w: [2, 2.5, 2.5], anim: 'charge',
        begin: () => { const t = this.tgt; this.m.gap = (t ? this.aimYaw(t.x, t.z) : 0) + this.run.rng.range(-1.2, 1.2); },
        enter: (st) => {
          if (st !== 1) return;
          const rings = [[6, 8, 0.9], [11, 13, 1.25], [16, 18, 1.6]];
          for (const [r, n, d] of rings) for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            let da = a - this.m.gap; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
            if (Math.abs(da) < (this.coop > 1 ? 0.55 : 0.4)) continue;
            this.run.strike(this.x + Math.sin(a) * r, this.z + Math.cos(a) * r, 2.3, d, 22 * this.dmgMult, 'mine');
          }
        },
      },
      {
        id: 'systole', name: 'SYSTOLE', wind: 0.8, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 9, anim: 'charge', core: [0.5, 0.8, 0.3],
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt; this.m.spin = (this.m.spin ?? 0) + dt * 2.8;
          while (this.m.acc > 0.11) {
            this.m.acc -= 0.11;
            for (let k = 0; k < 2; k++) { const a = this.m.spin + k * Math.PI; this.run.spawnProjectile({ kind: O, x: this.x, y: 1.4, z: this.z, vx: Math.sin(a) * 9, vy: 0, vz: Math.cos(a) * 9, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 }); }
          }
          const b = this.m.b ?? 0;
          if (t >= b * 1.0 && b < 3) { this.m.b = b + 1; this.run.shockwave(this.x, this.z, 3, 22, 10, 13 * this.dmgMult, 0.55, 350); }
        },
      },
    ];
  }

  planHop() {
    const t = this.tgt;
    this.m.sx = this.x; this.m.sz = this.z;
    if (!t) { this.m.lx = this.x; this.m.lz = this.z; return; }
    const d = this.distTo(t) || 1, step = Math.min(d, 7);
    const p = this.freePoint(this.x + ((t.x - this.x) / d) * step, this.z + ((t.z - this.z) / d) * step, 3);
    this.m.lx = p.x; this.m.lz = p.z;
  }

  land() {
    this.x = this.m.lx; this.z = this.m.lz; this.lift = 0;
    this.run.explodeAt(this.x, 0.3, this.z, 3.6, 22 * this.dmgMult, null, 'boss');
  }

  wakeMove() { return 'heartbeat'; }

  transitionName(phase: number) { return phase === 2 ? 'MIMIC' : 'FLATLINE'; }

  onTransition(run: Run, phase: number) {
    if (phase === 2) {
      this.summon(['replica', 'replica'], 2, 6, 6);
      for (const [x, z] of [[-12, 2], [12, 2], [-6, 12], [6, -14]]) run.addZone({ kind: 'blood', shape: 'circle', x, z, w: 3.5, dps: 25 * this.dmgMult, warn: 1.2, on: 4, off: 4 });
    } else {
      this.summon(['brute'], 1, 6, 6);
    }
  }
}
