// THE CURATOR — Warden of the Archive. A floating server monolith with one eye.
// Learn: duck the Index Gaze (or put a pillar between you), read the snaking gap in Stack Collapse,
// flank the shield pylons (they block from the front) to drop its barrier. The lights go out.
import { Boss } from './base';
import type { Run } from '../run';

export class Curator extends Boss {
  pylons: number[] = [];
  closeT = 0;
  arcT = 0;

  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 1, hpScale, 2.8, 'THE CURATOR');
    this.wy = 4.2; this.prefMin = 11; this.prefMax = 20;
    const O = 'orb' as const;
    this.moves = [
      {
        id: 'catalogue', name: 'CATALOGUE', wind: 0.7, active: 1.5, recover: 0.8, w: [3, 2.5, 2], anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.35 && k < 3 + this.phase) {
            this.m.k = k + 1;
            const ts = this.run.targets(); const tt = ts[k % ts.length];
            if (tt) this.shootAt(this.run, tt, O, 9, 11, { homing: true, accuracy: 1, oy: this.wy });
          }
        },
      },
      {
        id: 'gaze', name: 'INDEX GAZE', wind: 1.1, active: 2.4, recover: 0.9, w: [2, 2.5, 2.5], anim: 'charge', core: [1, 1, 0.5],
        combo: [['shelve', 0.3, 2]],
        begin: () => {
          const t = this.tgt;
          const c = t ? this.aimYaw(t.x, t.z) : 0;
          this.m.dir = this.run.rng.chance(0.5) ? 1 : -1;
          this.m.a = c - this.m.dir * 1.2;
          this.tellCone(this.x, this.z, c, 1.25, 28, this.stageLen, 200);
        },
        tick: (st, _t, dt) => {
          this.vx *= 0.9; this.vz *= 0.9;
          if (st === 2) { this.beam = null; return; }
          if (st === 1) this.m.a += this.m.dir * (2.4 / this.stageLen) * dt;
          const e = this.beamEnd(this.x, this.z, this.m.a, 30, 1.5);
          this.beamAt(this.x + Math.sin(this.m.a) * 1.5, this.z + Math.cos(this.m.a) * 1.5, e.x, e.z, 1.5, 0.6, st === 1, 22);
        },
        end: () => { this.beam = null; },
      },
      {
        id: 'shelve', name: 'RE-SHELVE', wind: 0.6, active: 0.45, recover: 0.8, w: [1.5, 2, 2], cd: 5, anim: 'charge', safe: true,
        tick: (st, t) => {
          if (st === 0) this.cloak = Math.min(1, t / this.stageLen);
          else if (st === 1) this.cloak = Math.max(0, 1 - t / this.stageLen);
          else this.cloak = 0;
        },
        enter: (st) => {
          const run = this.run;
          if (st === 1) {
            const t = this.tgt;
            run.emit({ e: 'explosion', x: this.x, y: 3, z: this.z, r: 4, kind: 'tesla' });
            for (let i = 0; i < 14; i++) {
              const p = this.freePoint(run.rng.range(-18, 18), run.rng.range(-18, 12), 4);
              if (!t || Math.hypot(p.x - t.x, p.z - t.z) > 13) { this.x = p.x; this.z = p.z; break; }
            }
            run.emit({ e: 'explosion', x: this.x, y: 3, z: this.z, r: 5, kind: 'tesla' });
          }
          if (st === 2) { this.ring(O, 18 + this.phase * 2, 1.4, 9, 9); if (this.phase >= 2) this.run.after(0.45, () => { if (this.alive && this.bs !== 'finish') this.ring(O, 18, 1.4, 9, 9); }); }
        },
        end: () => { this.cloak = 0; },
      },
      {
        id: 'snipe', name: 'PRECISION INDEX', wind: 1.3, active: 0.2, recover: 0.7, w: [2, 1.5, 1.5], near: 10, anim: 'charge',
        begin: () => { const t = this.tgt; if (t) { this.lastAimX = t.x; this.lastAimY = t.y + 1.1; this.lastAimZ = t.z; } this.aiming = true; },
        tick: (st, t, dt) => {
          this.vx *= 0.9; this.vz *= 0.9;
          const tt = this.tgt;
          if (st === 0 && tt && t < this.stageLen - 0.3) {
            const k = Math.min(1, dt * 2.6);
            this.lastAimX += (tt.x - this.lastAimX) * k; this.lastAimY += (tt.y + 1.1 - this.lastAimY) * k; this.lastAimZ += (tt.z - this.lastAimZ) * k;
          }
          if (st >= 1) this.aiming = false;
        },
        enter: (st) => {
          if (st !== 1) return;
          const ox = this.x, oy = this.y + this.wy, oz = this.z;
          const dx = this.lastAimX - ox, dy = this.lastAimY - oy, dz = this.lastAimZ - oz, l = Math.hypot(dx, dy, dz) || 1;
          for (let i = -1; i <= 1; i++) {
            const a = i * 0.05, cx = (dx / l) * Math.cos(a) - (dz / l) * Math.sin(a), cz = (dx / l) * Math.sin(a) + (dz / l) * Math.cos(a);
            this.run.spawnProjectile({ kind: 'bolt', x: ox, y: oy, z: oz, vx: cx * 55, vy: (dy / l) * 55, vz: cz * 55, dmg: 20 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
          }
          this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'stalker', x: ox, y: oy, z: oz });
        },
      },
      {
        id: 'shards', name: 'SHARD RAIN', wind: 0.7, active: 1.6, recover: 0.6, w: [2, 2.5, 2.5], anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.55 && k < 3) {
            this.m.k = k + 1;
            for (const p of this.run.targets()) {
              this.run.strike(p.x + p.vx * 0.5, p.z + p.vz * 0.5, 2.8, 0.95, 20 * this.dmgMult, 'tesla');
              for (let i = 0; i < this.phase; i++) this.run.strike(p.x + this.run.rng.range(-7, 7), p.z + this.run.rng.range(-7, 7), 2.8, 0.95 + this.run.rng.range(0, 0.3), 20 * this.dmgMult, 'tesla');
            }
          }
        },
      },
      {
        id: 'stacks', name: 'STACK COLLAPSE', wind: 0.8, active: 2.6, recover: 0.8, w: [0, 2, 2], cd: 6, anim: 'charge',
        begin: () => {
          // rows sweep across the arena toward the players; one gap per row, snaking
          this.m.axis = this.run.rng.chance(0.5) ? 1 : 0;
          this.m.gap = this.run.rng.int(2, 7);
          this.m.row = 0;
        },
        tick: (st, t) => {
          if (st !== 1) return;
          const row = this.m.row;
          if (row < 7 && t >= row * 0.35) {
            this.m.row = row + 1;
            this.m.gap = Math.max(1, Math.min(8, this.m.gap + this.run.rng.int(-1, 1)));
            const along = -21 + row * 6.5;
            for (let c = 0; c < 10; c++) {
              if (c === this.m.gap || (this.coop > 1 && c === this.m.gap + 1)) continue;
              const across = -20.25 + c * 4.5;
              const x = this.m.axis ? across : along, z = this.m.axis ? along : across;
              this.run.strike(x, z, 2.35, 1.0, 22 * this.dmgMult, 'tesla');
            }
          }
        },
      },
      {
        id: 'purge', name: 'ARCHIVE PURGE', wind: 0.8, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 9, anim: 'attack',
        tick: (st, _t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt;
          this.m.spin = (this.m.spin ?? 0) + dt * 2.6;
          while (this.m.acc > 0.12) {
            this.m.acc -= 0.12;
            for (let k = 0; k < 3; k++) {
              const a = this.m.spin + (k * Math.PI * 2) / 3;
              this.run.spawnProjectile({ kind: O, x: this.x, y: 1.5, z: this.z, vx: Math.sin(a) * 9, vy: 0, vz: Math.cos(a) * 9, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
            }
          }
        },
      },
    ];
  }

  visLift(): number { return this.bs === 'break' || this.bs === 'finish' ? 0 : 0.7 + Math.sin(this.fightT * 1.6) * 0.25; }

  position(run: Run, dt: number) {
    super.position(run, dt);
    const t = this.tgt;
    if (t && this.distTo(t) < 6) { this.closeT += dt; if (this.closeT > 1.6) { this.closeT = 0; this.comboQueue.push('shelve'); this.idleT = 0; } }
    else this.closeT = 0;
  }

  update(run: Run, dt: number) {
    super.update(run, dt);
    // pylons project a shield; arc lines show the link
    if (this.pylons.length) {
      this.pylons = this.pylons.filter((id) => run.enemies.get(id)?.alive);
      this.linkedShield = this.pylons.length;
      this.arcT -= dt;
      if (this.arcT <= 0 && this.pylons.length) {
        this.arcT = 0.8;
        for (const id of this.pylons) { const e = run.enemies.get(id)!; run.emit({ e: 'arc', x1: e.x, y1: 2, z1: e.z, x2: this.x, y2: this.y + 3.5, z2: this.z }); }
      }
      if (!this.pylons.length) { this.linkedShield = 0; run.emit({ e: 'explosion', x: this.x, y: 3.5, z: this.z, r: 5, kind: 'tesla' }); }
    }
  }

  spawnPylons(n: number) {
    const before = new Set(this.run.enemies.keys());
    const spots = [[-10, -9], [10, -9], [-10, 9], [10, 9]];
    for (let i = 0; i < n; i++) this.run.spawnEnemyNear('sentinel', spots[i][0], spots[i][1]);
    for (const id of this.run.enemies.keys()) if (!before.has(id)) this.pylons.push(id);
    this.linkedShield = this.pylons.length;
  }

  transitionName(phase: number) { return phase === 2 ? 'LIGHTS OUT' : 'DEEP ARCHIVE'; }

  onTransition(run: Run, phase: number) {
    run.addZone({ kind: 'dark', shape: 'circle', x: 0, z: 0, w: 40, dps: 0, warn: 0.6 });
    this.spawnPylons(phase === 2 ? 2 : 3);
    if (phase === 3) this.summon(['drone', 'drone'], 2, 6);
  }
}
