// THE MOTHER — Warden of the Nursery. A gestation vat on insect legs; something curled inside.
// Learn: step off the tether line or get reeled in for the crush; shoot the vat while she births;
// her brood shields her until it thins out. Her water breaks: the floor becomes acid.
import { Boss } from './base';
import type { Run } from '../run';

export class Mother extends Boss {
  brood: number[] = [];
  broodT = 0;

  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 3, hpScale, 3.1, 'THE MOTHER');
    this.wy = 4.0; this.prefMin = 8; this.prefMax = 16;
    const S = 'spit' as const;
    this.moves = [
      {
        id: 'brood', name: 'BIRTHING', wind: 1.0, active: 0.4, recover: 0.9, w: [2.5, 2, 2], cd: 9, anim: 'charge', core: [1, 0.6, 0.3], safe: true,
        can: () => this.adds() < 7,
        enter: (st) => {
          if (st !== 1) return;
          const n = 2 + this.phase + (this.coop > 1 ? 1 : 0);
          for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; this.run.spawnEnemyNear('leech', this.x + Math.cos(a) * 4, this.z + Math.sin(a) * 4); }
          this.run.emit({ e: 'explosion', x: this.x, y: 1, z: this.z, r: 4, kind: 'mine' });
        },
      },
      {
        id: 'spray', name: 'NUTRIENT SPRAY', wind: 0.6, active: 1.0, recover: 0.7, w: [3, 2.5, 2], anim: 'attack',
        begin: () => { const t = this.tgt; if (t) this.tellCone(this.x, this.z, this.aimYaw(t.x, t.z), 0.75, 18, this.stageLen, 100); },
        tick: (st, t, dt) => {
          this.vx = 0; this.vz = 0;
          const tg = this.tgt; if (!tg) return;
          this.faceTo(tg.x, tg.z, dt, 3);
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.45 && k < 2) {
            this.m.k = k + 1;
            const a = this.aimYaw(tg.x, tg.z);
            for (const s of [-1, 1]) this.fan(S, 5 + this.phase, 0.09, 15, 8, 3.2, a + s * 0.32, this.x + Math.cos(a) * s * 2.5, this.z - Math.sin(a) * s * 2.5);
          }
        },
      },
      {
        id: 'lullaby', name: 'LULLABY', wind: 0.7, active: 1.6, recover: 0.8, w: [2.5, 2, 2], anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.55 && k < 3) { this.m.k = k + 1; this.ring(S, 22, 1.2, 7, 8, k * 0.143); }
        },
      },
      {
        id: 'tether', name: 'UMBILICAL', wind: 0.9, active: 0.3, recover: 1.5, w: [2, 2.5, 2.5], near: 6, far: 22, anim: 'charge',
        begin: () => {
          const t = this.tgt; if (!t) return;
          const d = this.distTo(t) || 1, l = d + 4;
          this.m.dx = (t.x - this.x) / d; this.m.dz = (t.z - this.z) / d; this.m.l = l;
          this.tellLine(this.x, this.z, this.x + this.m.dx * l, this.z + this.m.dz * l, 1.8, this.stageLen, 100);
        },
        tick: (st, _t, dt) => { this.vx = 0; this.vz = 0; if (st === 0) this.faceTo(this.x + this.m.dx, this.z + this.m.dz, dt, 6); if (st === 2 && !this.m.slam && this.stageT >= 0.75) this.crush(); },
        enter: (st) => {
          const run = this.run;
          if (st === 1) {
            this.beam = [this.x, 3, this.z, this.x + this.m.dx * this.m.l, 1.1, this.z + this.m.dz * this.m.l, 0.3, 1];
            for (const p of run.targets()) {
              const rx = p.x - this.x, rz = p.z - this.z;
              const along = rx * this.m.dx + rz * this.m.dz, perp = Math.abs(rx * this.m.dz - rz * this.m.dx);
              if (along > 0 && along < this.m.l && perp < 1.3 && p.y < 2.5) {
                // reeled in: pulled toward her, then crushed
                run.damagePlayer(p, 10 * this.dmgMult, this.x, 2, this.z, false, this, { x: -this.m.dx * Math.min(26, along * 1.6), y: 5, z: -this.m.dz * Math.min(26, along * 1.6) });
              }
            }
          }
          if (st === 2) { this.beam = null; this.tellCircle(this.x, this.z, 5.5, 0.75, 100); }
        },
        end: () => { this.beam = null; },
      },
      {
        id: 'acid', name: 'AMNIOTIC RAIN', wind: 0.7, active: 1.4, recover: 0.8, w: [2, 2.5, 2.5], anim: 'attack',
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.45 && k < 3) {
            this.m.k = k + 1;
            for (const p of this.run.targets()) {
              const tx = p.x + p.vx * 0.9 + this.run.rng.range(-3, 3), tz = p.z + p.vz * 0.9 + this.run.rng.range(-3, 3);
              const fl = 1.1;
              this.lob(S, tx, tz, fl, 14, 2.5);
              this.tellCircle(tx, tz, 2.6, fl, 100);
              this.run.after(fl, () => { if (this.alive && this.bs !== 'finish') this.run.addZone({ kind: 'acid', shape: 'circle', x: tx, z: tz, w: 2.6, dps: 26 * this.dmgMult, warn: 0.15, life: 5 }); });
            }
          }
        },
      },
      {
        id: 'scuttle', name: 'SCUTTLE', wind: 0.5, active: 1.5, recover: 0.5, w: [1.5, 1.5, 2], cd: 6, anim: 'move', safe: true,
        can: () => !!this.tgt && this.distTo(this.tgt) < 11,
        begin: () => {
          const t = this.tgt;
          const ax = t ? this.x - t.x : 1, az = t ? this.z - t.z : 0, l = Math.hypot(ax, az) || 1;
          const p = this.freePoint(this.x + (ax / l) * 16 + this.run.rng.range(-5, 5), this.z + (az / l) * 16 + this.run.rng.range(-5, 5), 5);
          this.m.tx = p.x; this.m.tz = p.z;
        },
        tick: (st, _t, dt) => {
          if (st !== 1) { this.vx = 0; this.vz = 0; return; }
          this.moveDir(this.run, this.m.tx - this.x, this.m.tz - this.z, 12, dt);
          this.m.drop = (this.m.drop ?? 0) - dt;
          if (this.m.drop <= 0) { this.m.drop = 0.35; this.run.addZone({ kind: 'acid', shape: 'circle', x: this.x, z: this.z, w: 1.7, dps: 22 * this.dmgMult, warn: 0.5, life: 3.5 }); }
          if (Math.hypot(this.m.tx - this.x, this.m.tz - this.z) < 1) this.advance(this.run);
        },
      },
      {
        id: 'cradle', name: 'CRADLE SONG', wind: 0.8, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 10, anim: 'attack', core: [0.6, 0.6, 0.3],
        enter: (st) => { if (st === 1 && this.adds() < 6) this.summon(['wraith'], 1, 5, 7); },
        tick: (st, _t, dt) => {
          this.vx = 0; this.vz = 0;
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt; this.m.spin = (this.m.spin ?? 0) + dt * 2.2;
          while (this.m.acc > 0.12) {
            this.m.acc -= 0.12;
            for (let k = 0; k < 3; k++) { const a = this.m.spin + (k * Math.PI * 2) / 3; this.run.spawnProjectile({ kind: S, x: this.x, y: 1.3, z: this.z, vx: Math.sin(a) * 8.5, vy: 0, vz: Math.cos(a) * 8.5, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 }); }
          }
        },
      },
    ];
  }

  crush() {
    this.m.slam = 1;
    this.run.explodeAt(this.x, 0.3, this.z, 5.5, 26 * this.dmgMult, null, 'boss');
    this.run.shockwave(this.x, this.z, 5, 16, 10, 12 * this.dmgMult, 0.55, 100);
  }

  update(run: Run, dt: number) {
    super.update(run, dt);
    if (this.brood.length) {
      this.brood = this.brood.filter((id) => run.enemies.get(id)?.alive);
      this.broodT -= dt;
      // her children shield her until the clutch thins out
      this.linkedShield = this.brood.length > 2 && this.broodT > 0 ? this.brood.length : 0;
      if (!this.linkedShield) this.brood = [];
    }
  }

  wakeMove() { return 'lullaby'; }

  transitionName(phase: number) { return phase === 2 ? 'BIRTH' : 'BROKEN WATER'; }

  onTransition(run: Run, phase: number) {
    if (phase === 2) {
      const before = new Set(run.enemies.keys());
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; run.spawnEnemyNear('leech', this.x + Math.cos(a) * 5, this.z + Math.sin(a) * 5); }
      this.summon(['wraith', 'wraith'], 2, 6, 10);
      for (const id of run.enemies.keys()) if (!before.has(id)) this.brood.push(id);
      this.broodT = 14;
    } else {
      for (const [x, z] of [[-14, -6], [14, -6], [0, 4], [-10, 14], [10, 14]]) run.addZone({ kind: 'acid', shape: 'circle', x, z, w: 3.6, dps: 28 * this.dmgMult, warn: 1.4, on: 3.5, off: 3.5 });
    }
  }
}
