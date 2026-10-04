// BREACHER — a huge rusted side-by-side coach gun, walnut and pitted iron. Personality: brutal,
// mechanical, theatrical. Every shot is a door kicked in; every break-open is a little ritual.
//
// Animation beats
//  fire    : massive kick up-and-right (spring), both barrels flash, smoke rolls off the muzzles.
//  cycle   : (auto, 0.4s, starts ~0.07s after each shot)
//            0.00 top lever thumbed, barrels DROP on the hinge, rifle tilts to show the breech
//            0.22 ejector pops both hulls — they tumble up over the shoulder, breech smokes
//            0.18 left hand dives low, returns pinching two fresh red shells
//            0.50 thumbs them home (slide into the chambers)
//            0.70 FLICK — wrist snaps the barrels shut, jolt + spark at the hinge
//  reload  : same ritual, slower and showier: deeper drop, higher tumble, a wrist-spin flick shut
//            with overshoot.
//  inspect : roll to show the side plates, left hand runs along the barrels and taps the rib.
//  equip   : swung up from the hip with a heavy overshoot.
import { Scene, mat, T, RX, RY, RZ, mm, TX_FLAT, FC_SIDE, FC_CAP0, FX_NX, FX_PY, M } from './viewmodel3d';
import { Rig, BASE_POSE, gunXf, arm } from './viewmodelRig';
import { E, k, Anim, Track } from './viewmodelAnim';
import { lit, mix, hashStr, makeRng } from './core';

const IRON = 0x3e3e46, RUST = 0x8a4a26, WOOD = 0x6e3c1e, BRASS = 0xc89a3a, HULL = 0xb01818;

function rusty(base: number, amt: number): (X: number, Y: number, Z: number, f: number) => number {
  return (X, Y, Z) => {
    const h = hashStr(`${Math.floor(X * 160)},${Math.floor(Y * 160)},${Math.floor(Z * 160)}`) / 4294967296;
    if (h < amt) return mix(base, RUST, 0.55 + h);
    if (h < amt * 1.6) return mix(base, 0x5a2a14, 0.5);
    return -1;
  };
}
const M_IRON = mat(IRON, { spec: 0.6, tex: rusty(IRON, 0.12) });
const M_IRON2 = mat(0x5a5a62, { spec: 0.8, tex: rusty(0x5a5a62, 0.06) });
const M_BARREL = mat(0x45454d, {
  spec: 0.9,
  tex: (X, Y, Z, f) => {
    if (f === FC_CAP0 || f === 8) return Math.hypot(X, Y) < 0.015 ? 0x050404 | TX_FLAT : -1;
    if (f === FC_SIDE) { const r = rusty(0x45454d, 0.1)(X, Y, Z, f); if (r >= 0) return r; }
    return -1;
  },
});
const M_WOOD = mat(WOOD, {
  spec: 0.3, dither: 0.3,
  tex: (X, Y, Z) => {
    const g = Math.sin(Z * 90 + Y * 700 + Math.sin(Z * 40 + X * 300) * 1.4);
    if (g > 0.75) return lit(WOOD, -0.3);
    if (g < -0.95) return lit(WOOD, 0.18);
    return -1;
  },
});
const M_BRASS = mat(BRASS, { spec: 1 });
const M_GOLD = mat(0xd8b050, { spec: 1 });
function hullMat(spent: boolean): ReturnType<typeof mat> {
  const c = spent ? 0x6a1a14 : HULL;
  return mat(c, { spec: 0.4, tex: (_X, _Y, Z, f) => (f === FC_SIDE && ((Math.floor(Z / 0.006)) & 1) ? lit(c, -0.25) : -1) });
}

const HINGE = { y: 0.032, z: -0.105 };
const FORE = { x: 0, y: 0.0, z: -0.25 };
const ELBOW_R: [number, number, number] = [0.42, -0.55, -0.18];
const ELBOW_L: [number, number, number] = [-0.1, -0.56, -0.32];

/** Shell: hull + brass head, along local z, head at z=0, hull toward -z. */
function shell(sc: Scene, spent: boolean): void {
  sc.cyl(0, 0, -0.032, 0.0128, 0.03, hullMat(spent));
  sc.cyl(0, 0, -0.004, 0.0138, 0.005, M_BRASS);
  sc.cyl(0, 0, 0.0005, 0.0148, 0.0012, M_BRASS);
}

function breakAnim(slow: boolean): Anim {
  // shared choreography; `slow` = full reload with flourish
  const d = slow ? 1.0 : 0.4;
  const brkMax = slow ? 0.78 : 0.55;
  const ch: Record<string, Track> = {
    lever: k(0, 0, 0.08, 1, E.out, 0.7, 1, 0.76, 0, E.in),
    brk: k(0, 0, 0.18, brkMax, E.back, 0.66, brkMax, 0.72, brkMax + 0.05, E.out, 0.78, 0, E.in3),
    gp: slow ? k(0, 0, 0.18, 0.2, E.out, 0.66, 0.16, 0.72, 0.1, 0.8, 0.42, E.out, 0.9, -0.05, E.io, 1, 0, E.io)
      : k(0, 0, 0.18, 0.12, E.out, 0.66, 0.1, 0.78, 0.2, E.out, 1, 0, E.io),
    gr: slow ? k(0, 0, 0.18, -0.5, E.out, 0.66, -0.45, 0.8, 0.5, E.out, 0.9, -0.1, E.io, 1, 0, E.io)
      : k(0, 0, 0.18, -0.3, E.out, 0.66, -0.28, 0.8, 0.08, E.out, 1, 0, E.io),
    gyw: k(0, 0, 0.18, slow ? 0.25 : 0.12, E.out, 0.7, slow ? 0.22 : 0.1, 1, 0, E.io),
    gx: k(0, 0, 0.18, -0.03, E.out, 0.7, -0.03, 1, 0, E.io),
    gy: k(0, 0, 0.18, 0.04, E.out, 0.7, 0.04, 0.8, 0.065, E.out, 1, 0, E.io),
    ej: k(0, 0, 0.2, 0, 0.21, 0.01, E.step, slow ? 0.62 : 0.55, 1, E.lin),
    // left hand: drop off the fore-end, fetch shells, feed them, return
    lx: k(0, 0, 0.14, 0.01, 0.3, 0.03, 0.44, 0.012, E.out, 0.62, 0.006, 0.8, 0, E.io),
    ly: k(0, 0, 0.14, -0.04, E.in, 0.28, -0.2, E.in, 0.42, 0.05, E.out, 0.48, 0.055, 0.6, 0.045, 0.68, 0.025, 0.82, 0, E.io),
    lz: k(0, 0, 0.14, 0.02, 0.28, 0.06, 0.42, 0.11, E.out, 0.48, 0.12, 0.6, 0.095, E.in, 0.68, 0.08, 0.82, 0, E.io),
    lp: k(0, 0, 0.14, 0.2, 0.42, -0.5, 0.6, -0.5, 0.82, 0),
    lr: k(0, 0, 0.14, 0.2, 0.42, 0.9, 0.6, 0.9, 0.82, 0),
    lc: k(0, 1, 0.12, 0.5, 0.3, 0.7, 0.42, 0.62, 0.6, 0.62, 0.66, 0.3, 0.8, 1),
    lt: k(0, 0.6, 0.3, 0.6, 0.42, 0.2, 0.6, 0.1, 0.7, 0.6),
    hold: k(0, 0, 0.27, 0, 0.28, 1, E.step, 0.5, 1, 0.51, 0, E.step),
    ins: k(0, 1, 0.21, 1, 0.22, 0, E.step, 0.5, 0, 0.51, 0.05, E.step, 0.62, 1, E.in),
    spent: k(0, 1, 0.5, 1, 0.51, 0, E.step),
  };
  return { dur: d, fps: 30, ch, ev: [[0.2, 'eject'], [0.78, 'shut']] };
}

export const breacherRig: Rig = {
  id: 'breacher',
  rest: { x: 0.2, y: -0.168, z: -0.39, pitch: -0.035, yaw: 0.02, roll: 0.05 },
  def: { ...BASE_POSE, brk: 0, lever: 0, ej: 0, hold: 0, ins: 1, spent: 0 },
  anims: {
    equip: { dur: 0.2, fps: 30, ch: { gp: k(0, -1.0, 1, 0, E.back), gy: k(0, -0.12, 1, 0, E.out), gr: k(0, -0.5, 1, 0, E.out), gyw: k(0, -0.2, 1, 0, E.out) } },
    cycle: breakAnim(false),
    reload: breakAnim(true),
    inspect: {
      dur: 1.6, fps: 24,
      ch: {
        gr: k(0, 0, 0.2, -0.7, E.io, 0.55, -0.65, 0.72, 0.3, E.io, 0.86, 0.25, 1, 0, E.io),
        gyw: k(0, 0, 0.2, -0.1, E.io, 0.55, -0.1, 0.72, 0.2, 1, 0, E.io),
        gp: k(0, 0, 0.2, 0.2, E.io, 0.55, 0.22, 0.72, 0.1, 1, 0, E.io),
        gy: k(0, 0, 0.2, 0.045, E.io, 0.72, 0.035, 1, 0, E.io),
        gx: k(0, 0, 0.2, -0.04, E.io, 0.72, -0.02, 1, 0, E.io),
        // hand slides along the barrels then knocks twice on the rib
        lz: k(0, 0, 0.2, -0.06, E.io, 0.32, 0.06, 0.42, 0.06, 0.6, 0, E.io),
        ly: k(0, 0, 0.2, 0.03, 0.34, 0.07, E.out, 0.37, 0.05, E.in, 0.4, 0.07, E.out, 0.43, 0.05, E.in, 0.6, 0, E.io),
        lr: k(0, 0, 0.3, 0.5, 0.45, 0.5, 0.6, 0),
        lc: k(0, 1, 0.2, 0.4, 0.32, 0.9, 0.45, 0.9, 0.6, 1),
      },
    },
  },
  build(sc: Scene, p) {
    const G = gunXf(this.rest, p);
    const BX: M = mm(G, mm(T(0, HINGE.y, HINGE.z), RX(-p.brk)));
    const rr = makeRng(5);
    void rr;
    sc.with(G, () => {
      sc.group(1, () => {
        // action / receiver with side plates
        sc.box(0, 0.05, -0.055, 0.025, 0.026, 0.05, M_IRON, undefined, 0.006);
        sc.box(-0.0275, 0.052, -0.055, 0.0015, 0.022, 0.04, mat(0x6a6a72, { spec: 1, tex: (_X, Y, Z, f) => (f === FX_NX && Math.hypot(Y, Z + 0.01) < 0.006 ? 0xd8b050 : -1) }));
        sc.box(0, 0.082, -0.025, 0.006, 0.004, 0.015, M_GOLD, RY(p.lever * 0.7)); // top lever
        sc.box(0, 0.074, -0.05, 0.015, 0.006, 0.03, M_IRON2);
        // wrist + stock (walnut) running back off-screen, trigger guard
        sc.box(0, 0.032, 0.07, 0.02, 0.026, 0.1, M_WOOD, RX(-0.16), 0.006);
        
        sc.box(0, 0.012, -0.06, 0.005, 0.004, 0.035, M_IRON);
        sc.cyl(0.028, HINGE.y, HINGE.z, 0.008, 0.003, M_GOLD, RY(Math.PI / 2));
        sc.point('hinge', -0.03, HINGE.y, HINGE.z);
      });
    });
    // barrels on the hinge
    sc.with(BX, () => {
      sc.group(2, () => {
        for (const bx of [-0.0215, 0.0215]) {
          sc.cyl(bx, 0.036, -0.3, 0.0215, 0.295, M_BARREL, undefined, -0.05);
          sc.cyl(bx, 0.036, -0.585, 0.0215, 0.012, M_IRON2);
        }
        sc.box(0, 0.058, -0.3, 0.007, 0.004, 0.29, M_IRON);
        sc.box(0, 0.016, -0.3, 0.008, 0.006, 0.28, M_IRON);
        sc.sph(0, 0.064, -0.585, 0.0035, 0.0035, 0.0035, M_GOLD);
        sc.box(0, 0.036, -0.007, 0.044, 0.024, 0.007, M_IRON2, undefined, 0.004); // breech face lump
        sc.point('muzzle', -0.0215, 0.036, -0.61);
        sc.point('muzzle2', 0.0215, 0.036, -0.61);
        sc.point('breech', 0, 0.06, 0.0);
      });
      sc.group(5, () => sc.box(FORE.x, FORE.y - HINGE.y + 0.012, FORE.z - HINGE.z, 0.03, 0.017, 0.09, M_WOOD, undefined, 0.007));
      // chambered shells (visible when open)
      if (p.ej < 0.01 && p.ins > 0) {
        for (const bx of [-0.0215, 0.0215]) sc.with(T(bx, 0.036, 0.004 + (1 - p.ins) * 0.07), () => sc.group(6, () => shell(sc, p.spent > 0.5)));
      }
      if (p.ej >= 0.01 && p.ins > 0.02) {
        for (const bx of [-0.0215, 0.0215]) sc.with(mm(T(bx, 0.036 + (1 - p.ins) * 0.02, 0.004 + (1 - p.ins) * 0.07), RX((1 - p.ins) * 0.3)), () => sc.group(6, () => shell(sc, false)));
      }
    });
    // ejected hulls tumbling up over the shoulder (gun space ballistic arc)
    if (p.ej > 0.01 && p.ej < 0.99) {
      const t = p.ej * 0.42;
      [-1, 1].forEach((sd, i) => {
        const c = mm(BX, T(sd * 0.0215, 0.036, 0.0));
        const x0 = c[3], y0 = c[7], z0 = c[11];
        const vx = (i ? 0.75 : 0.5), vy = 1.5 + i * 0.25, vz = 0.35 + i * 0.1;
        const pos = T(x0 + vx * t, y0 + vy * t - 4.5 * t * t, z0 + vz * t);
        sc.with(mm(pos, mm(RX(t * (20 + i * 6)), RY(t * 9 * sd))), () => sc.group(7 + i, () => shell(sc, true)));
      });
    }
    // left hand: fore-end hold (pulse-style grip), shells pinched in the fingers when `hold`
    const LH = mm(G, mm(T(FORE.x - 0.03 + p.lx, FORE.y + 0.004 + p.ly, FORE.z + 0.02 + p.lz), mm(RX(0.95 + p.lp), mm(RZ(Math.PI / 2 - 0.8 + p.lr), RY(p.lyw)))));
    if (p.hold > 0.5) {
      for (const sd of [-1, 1]) sc.with(mm(LH, mm(T(sd * 0.012 + 0.004, -0.03, -0.035), RX(Math.PI / 2 + 0.3))), () => sc.group(6, () => shell(sc, false)));
    }
    if (p.lhide < 0.5) arm(sc, LH, -1, p.lc, p.lt, ELBOW_L);
    const RH = mm(G, mm(T(0.026 + p.rx, 0.02 + p.ry, 0.03 + p.rz), mm(RX(0.75 + p.rp), mm(RZ(-Math.PI / 2 + 0.15 + p.rr), RY(-0.1 + p.ryw)))));
    if (p.rhide < 0.5) arm(sc, RH, 1, p.rc, p.rt, ELBOW_R);
    void FX_PY;
  },
};
