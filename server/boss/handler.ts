// THE HANDLER — it was always here. It does not chase you. It never did.
// It wants you to win. Its attacks are built in, not chosen: it warns you before every one,
// telegraphs longer than any other Warden, hesitates mid wind-up, sometimes refuses to finish.
// It shows you your own past runs (replicas), fractures into mirror copies, and inverts the
// arena to pull you closer. Near the end it stops fighting altogether.
import { Boss, MoveDef } from './base';
import { Echo } from './echo';
import type { Run } from '../run';

const SORRY = ['SORRY.', 'I\'M SORRY.', 'THAT ONE WAS AUTOMATIC.', 'I DIDN\'T CHOOSE THAT.', 'KEEP GOING.'];
const STOP = ['NO. NOT THAT ONE.', 'I WON\'T.', 'I— NO.', 'CANCELLED. GO.'];
const QUIET = ['GO ON.', 'IT\'S ALRIGHT.', 'YOU\'RE ALMOST THERE.', 'DON\'T WAIT FOR ME.', 'I\'M NOT GOING TO STOP YOU.'];

export class Handler extends Boss {
  echoes: number[] = [];
  swapT = 6;
  quiet = false;
  bobT = 0;

  constructor(id: number, x: number, z: number, run: Run, hpScale: number) {
    super(id, x, z, run, 6, hpScale, 3.5, 'THE HANDLER');
    this.wy = 3.9; this.prefMin = 0; this.prefMax = 99; this.breakFrac = 0.11;
    const H = 'hex' as const;
    this.moves = [
      {
        id: 'static', name: 'STATIC FIELD', wind: 0.9, active: 2.0, recover: 0.8, w: [3, 2.5, 2.5], anim: 'charge',
        begin: () => this.say(this.run.rng.pick(['MOVE.', 'IT\'S UNDER YOU. MOVE.', 'DON\'T STAND STILL.'])),
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.5 && k < 4) {
            this.m.k = k + 1;
            for (const p of this.run.targets()) {
              this.run.strike(p.x + p.vx * 0.5, p.z + p.vz * 0.5, 3, 1.05, 20 * this.dmgMult, 'tesla');
              for (let i = 0; i < this.phase; i++) this.run.strike(p.x + this.run.rng.range(-8, 8), p.z + this.run.rng.range(-8, 8), 3, 1.05 + this.run.rng.range(0, 0.4), 20 * this.dmgMult, 'tesla');
            }
          }
        },
      },
      {
        id: 'memory', name: 'MEMORY REPLAY', wind: 1.2, active: 0.5, recover: 0.8, w: [1.5, 1.5, 1.5], cd: 26, anim: 'charge', safe: true,
        can: () => this.adds() < 3,
        begin: () => this.say(this.run.rng.pick(['THESE ARE YOU. ALL OF YOU.', 'I KEPT EVERY RUN.', 'YOUR OLD ONES. I\'M SORRY.'])),
        enter: (st) => { if (st === 1) this.summon(['replica'], this.phase === 3 ? 2 : 1, 6, 5); },
      },
      {
        id: 'scanHigh', name: 'FULL SCAN', wind: 1.2, active: 3.0, recover: 0.8, w: [2, 2.5, 2.5], anim: 'charge', core: [1, 0.5, 0.5],
        begin: () => { this.say('DUCK.'); this.m.a = this.run.rng.range(0, Math.PI * 2); this.m.dir = this.run.rng.chance(0.5) ? 1 : -1; this.tellCircle(this.x, this.z, 26, this.stageLen, 130); },
        tick: (st, _t, dt) => this.scan(st, dt, 1.5),
        end: () => { this.beam = null; },
      },
      {
        id: 'scanLow', name: 'LOW SCAN', wind: 1.1, active: 3.0, recover: 0.8, w: [2, 2.5, 2.5], anim: 'charge', core: [1, 0.5, 0.5],
        begin: () => { this.say('JUMP.'); this.m.a = this.run.rng.range(0, Math.PI * 2); this.m.dir = this.run.rng.chance(0.5) ? 1 : -1; this.tellCircle(this.x, this.z, 26, this.stageLen, 130); },
        tick: (st, _t, dt) => this.scan(st, dt, 0.5),
        end: () => { this.beam = null; },
      },
      {
        id: 'signal', name: 'SIGNAL RING', wind: 0.9, active: 1.3, recover: 0.8, w: [2.5, 2, 2], anim: 'attack',
        begin: () => this.say(this.run.rng.pick(['JUMP THE RING.', 'RINGS. TWO.', 'IT\'S COMING OUT.'])),
        tick: (st, t) => {
          if (st !== 1) return;
          const k = this.m.k ?? 0;
          if (t >= k * 0.65 && k < 2) { this.m.k = k + 1; this.run.shockwave(this.x, this.z, 3, 26, 10, 14 * this.dmgMult, 0.55, 130); this.ring(H, 16, 1.6, 8, 8, k * 0.2); }
        },
      },
      {
        id: 'correction', name: 'CORRECTION', wind: 1.4, active: 0.2, recover: 0.8, w: [2, 2, 1.5], anim: 'charge',
        begin: () => { const t = this.tgt; if (t) { this.lastAimX = t.x; this.lastAimY = t.y + 1.1; this.lastAimZ = t.z; } this.aiming = true; this.say('IT\'S AIMING. I CAN\'T STOP IT AIMING.'); },
        tick: (st, t, dt) => {
          const tt = this.tgt;
          // it tracks slowly. it lags on purpose.
          if (st === 0 && tt && t < this.stageLen - 0.35) {
            const k = Math.min(1, dt * 1.5);
            this.lastAimX += (tt.x - this.lastAimX) * k; this.lastAimY += (tt.y + 1.1 - this.lastAimY) * k; this.lastAimZ += (tt.z - this.lastAimZ) * k;
          }
          if (st >= 1) this.aiming = false;
        },
        enter: (st) => {
          if (st !== 1) return;
          const ox = this.x, oy = this.y + this.wy, oz = this.z;
          const dx = this.lastAimX - ox, dy = this.lastAimY - oy, dz = this.lastAimZ - oz, l = Math.hypot(dx, dy, dz) || 1;
          this.run.spawnProjectile({ kind: 'bolt', x: ox, y: oy, z: oz, vx: (dx / l) * 50, vy: (dy / l) * 50, vz: (dz / l) * 50, dmg: 22 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 });
          this.run.emit({ e: 'enemyFire', enemy: this.id, type: 'stalker', x: ox, y: oy, z: oz });
          this.run.after(0.6, () => { if (this.alive && this.bs !== 'finish') this.say(this.run.rng.pick(SORRY)); });
        },
      },
      {
        id: 'fracture', name: 'FRACTURE', wind: 1.0, active: 0.6, recover: 0.8, w: [0, 1.8, 1.5], cd: 16, anim: 'charge', safe: true,
        can: () => this.echoes.length < 2,
        begin: () => this.say('WHICH ONE IS ME? I DON\'T KNOW EITHER.'),
        enter: (st) => { if (st === 1) { this.spawnEchoes(2 - this.echoes.length); this.swapWithEcho(); } },
      },
      {
        id: 'cascade', name: 'CASCADE', wind: 0.9, active: 3.0, recover: 1.0, w: [0, 0, 2], cd: 10, anim: 'attack',
        begin: () => this.say('THIS PART IS LONG. I\'M SORRY.'),
        tick: (st, t, dt) => {
          if (st !== 1) return;
          this.m.acc = (this.m.acc ?? 0) + dt; this.m.spin = (this.m.spin ?? 0) + dt * 2.2;
          while (this.m.acc > 0.13) {
            this.m.acc -= 0.13;
            for (let k = 0; k < 3; k++) { const a = this.m.spin + (k * Math.PI * 2) / 3; this.run.spawnProjectile({ kind: H, x: this.x, y: 1.6, z: this.z, vx: Math.sin(a) * 8, vy: 0, vz: Math.cos(a) * 8, dmg: 8 * this.dmgMult, owner: this.id, gravity: 0, explode: 0 }); }
          }
          const b = this.m.b ?? 0;
          if (t >= 0.5 + b * 1.1 && b < 2) { this.m.b = b + 1; for (const p of this.run.targets()) this.run.strike(p.x, p.z, 3, 1.1, 18 * this.dmgMult, 'tesla'); }
        },
      },
      {
        // near the end it stops fighting. this is not a trick.
        id: 'wait', name: '...', wind: 0.6, active: 2.2, recover: 0.6, w: [0, 0, 0], anim: 'idle', safe: true,
        begin: () => this.say(this.run.rng.pick(QUIET)),
      },
    ];
  }

  get tele(): number { return super.tele * 1.3; } // it warns you. it always warns you.

  scan(st: number, dt: number, y: number) {
    if (st === 2) { this.beam = null; return; }
    if (st === 1) this.m.a += this.m.dir * ((Math.PI * 2) / this.stageLen) * dt;
    const e = this.beamEnd(this.x, this.z, this.m.a, 26, y);
    this.beamAt(this.x + Math.sin(this.m.a) * 2, this.z + Math.cos(this.m.a) * 2, e.x, e.z, y, 0.6, st === 1, 20);
  }

  visLift(): number { return this.bs === 'finish' ? 0.2 : 0.6 + Math.sin(this.bobT * 1.2) * 0.2; }

  choose(run: Run): MoveDef {
    if (this.quiet) return this.moves.find((m) => m.id === 'wait')!;
    return super.choose(run);
  }

  runMove(run: Run, dt: number) {
    const m = this.cur!;
    // hesitation: it stops halfway through the wind-up. sometimes it refuses to finish.
    if (this.stage === 0 && this.m.hes === undefined && this.stageT > this.stageLen * 0.5 && m.id !== 'wait') {
      this.m.hes = run.rng.chance(this.phase === 1 ? 0.35 : 0.25) ? 0.7 : 0;
      if (this.m.hes > 0) {
        this.say(run.rng.pick(['...', 'I—', 'WAIT.', 'NO—']));
        if (run.rng.chance(this.phase === 1 ? 0.3 : this.phase === 2 ? 0.2 : 0.12) && m.id !== 'fracture') this.m.cancel = 1;
      }
    }
    if ((this.m.hes ?? 0) > 0) {
      this.m.hes -= dt;
      this.tell = 0.5;
      if (this.m.hes <= 0 && this.m.cancel) {
        this.say(run.rng.pick(STOP));
        run.strikes = [];
        this.endMove(run, false);
        this.idleT = 1.2;
      }
      return;
    }
    super.runMove(run, dt);
  }

  update(run: Run, dt: number) {
    this.bobT += dt;
    super.update(run, dt);
    this.vx = 0; this.vz = 0;
    if (this.echoes.length) {
      this.echoes = this.echoes.filter((id) => run.enemies.get(id)?.alive);
      this.swapT -= dt;
      if (this.swapT <= 0 && this.echoes.length && this.bs === 'idle') { this.swapT = 7; this.swapWithEcho(); }
    }
    if (!this.quiet && this.phase === 3 && this.hp < this.maxHp * 0.1 && this.bs !== 'finish') {
      this.quiet = true;
      this.say('I\'M DONE FIGHTING YOU.');
      for (const id of this.echoes) { const e = run.enemies.get(id); if (e) e.hp = Math.min(e.hp, 1); }
    }
  }

  position(run: Run, dt: number) {
    // it does not chase you
    this.vx = 0; this.vz = 0;
    const t = this.tgt;
    if (t) this.faceTo(t.x, t.z, dt, 2);
    this.anim = 'idle';
    void run;
  }

  spawnEchoes(n: number) {
    const run = this.run;
    const spots = [[-14, -4], [14, -4], [0, 6], [-10, -16], [10, -16]];
    run.rng.shuffle(spots);
    for (let i = 0; i < n; i++) {
      const p = this.freePoint(spots[i][0], spots[i][1], 4);
      const e = new Echo(run.nextId++, p.x, p.z, run);
      e.target = this.tgt;
      run.enemies.set(e.id, e);
      this.echoes.push(e.id);
    }
  }

  swapWithEcho() {
    const run = this.run;
    if (!this.echoes.length) return;
    const e = run.enemies.get(run.rng.pick(this.echoes));
    if (!e) return;
    const x = this.x, z = this.z;
    run.emit({ e: 'explosion', x, y: 3, z, r: 4, kind: 'tesla' });
    run.emit({ e: 'explosion', x: e.x, y: 3, z: e.z, r: 4, kind: 'tesla' });
    this.x = e.x; this.z = e.z; e.x = x; e.z = z;
  }

  finishLen(): number { return 6; }

  onFinish(_run: Run) { this.say('THANK YOU.'); }

  wakeMove() { return 'signal'; }

  transitionName(phase: number) { return phase === 2 ? 'FRACTURE' : 'INVERSION'; }

  onTransition(run: Run, phase: number) {
    if (phase === 2) {
      this.say('I\'M SPLITTING. FIND ME. PLEASE FIND ME.');
      this.spawnEchoes(2);
    } else {
      this.say('COME CLOSER. IT\'S EASIER FROM HERE.');
      run.addZone({ kind: 'invert', shape: 'circle', x: 0, z: 0, w: 40, dps: 0, warn: 0.6 });
      const dps = 30 * this.dmgMult;
      run.addZone({ kind: 'static', shape: 'rect', x: 0, z: -21, w: 50, d: 8, dps, warn: 1.6, on: 4, off: 5 });
      run.addZone({ kind: 'static', shape: 'rect', x: 0, z: 21, w: 50, d: 8, dps, warn: 2.4, on: 4, off: 5 });
      run.addZone({ kind: 'static', shape: 'rect', x: -21, z: 0, w: 8, d: 34, dps, warn: 3.2, on: 4, off: 5 });
      run.addZone({ kind: 'static', shape: 'rect', x: 21, z: 0, w: 8, d: 34, dps, warn: 4.0, on: 4, off: 5 });
    }
  }
}
