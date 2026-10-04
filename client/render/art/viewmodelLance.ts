// LANCE — a long coil charge-beam cannon: a dark capacitor body, six blue induction coils marching
// down the barrel, two forked prongs and a floating crystal at the tip. Personality: heavy,
// patient, volatile. It hums; it builds; it *releases*.
//
// Animation beats
//  charge  : coils light one by one (6 levels, runtime setCharge), arcs crackle between the prongs
//            and along lit coils, the whole gun trembles harder the closer it gets to full.
//  fire    : enormous recoil spring + blue-white flash; coils drain dark then glow white-hot and
//            cool through cyan to blue (runtime heat ramp).
//  reload  : 0.00 cannon rolls to show its left flank, left hand leaves the foregrip
//            0.14 thumb cracks the side housing — it swings open on its lower hinge, smoke puffs
//            0.24 hand pulls the depleted (dark, smoking) coil cell out sideways, drops it
//            0.42 dives off-screen, returns with a fresh glowing cell, slots it home (0.62–0.72)
//            0.80 SLAMS the housing shut — sparks — coils boot up in a rising sweep
//  inspect : turn the barrel toward the light, coils ripple bright, left hand taps the housing.
//  equip   : hauled up from below, slow-heavy overshoot.
import { Scene, mat, T, RX, RZ, mm, TX_EMIT, TX_FLAT, FC_SIDE, FX_NX } from './viewmodel3d';
import { Rig, BASE_POSE, gunXf, arm } from './viewmodelRig';
import { E, k } from './viewmodelAnim';
import { lit, mix } from './core';

const CORE = 0x2a2e38, HOUSE = 0x3e4452, PLATE = 0x565e6c, DARK = 0x1c1e24;
const M_CORE = mat(CORE, { spec: 0.7 });
const M_HOUSE = mat(HOUSE, {
  spec: 0.5,
  tex: (_X, Y, Z, f) => {
    if (f === FX_NX && (Math.abs(Z + 0.06) < 0.0018 || Math.abs(Y + 0.012) < 0.0015)) return lit(HOUSE, -0.6) | TX_FLAT;
    if (f === FX_NX && Z > 0.04 && Z < 0.1 && Y > 0.0 && ((Math.floor(Z / 0.008)) & 1) === 0) return DARK | TX_FLAT;
    return -1;
  },
});
const M_PLATE = mat(PLATE, { spec: 0.8 });
const M_DARK = mat(DARK, { spec: 0.3 });

/** coil colour for index i given charge level (0..6), heat (0..1) and boot sweep (0..1). */
function coilCol(i: number, level: number, heat: number, boot: number): number[] {
  if (heat > 0.01) {
    if (heat > 0.75) return [0xffffff, 0xf0faff, 0xbfe6ff];
    if (heat > 0.5) return [0xeaffff, 0x9ae8ff, 0x4aa8ff];
    if (heat > 0.25) return [0x9ad8ff, 0x3a8cff, 0x1a4aa8];
    return [0x4a7ad8, 0x22489a, 0x122a5a];
  }
  const lv = Math.max(level, Math.round(boot * 6));
  if (i < lv) return lv >= 6 ? [0xffffff, 0xd8f4ff, 0x8ad0ff] : lv >= 4 ? [0xeaffff, 0x8ad0ff, 0x3a8cff] : [0xa8dcff, 0x3a8cff, 0x1a4aa8];
  return [0x3a6ac8, 0x1e3e8a, 0x10224a];
}
function coilMat(i: number, level: number, heat: number, boot: number): ReturnType<typeof mat> {
  const c = coilCol(i, level, heat, boot);
  return mat(c[1], {
    emit: true, noLine: true,
    tex: (X, Y, Z, f) => {
      if (f !== FC_SIDE) return 0x14161c | TX_FLAT;
      const a = Math.atan2(Y, X);
      const wind = ((Math.floor((Z + 1) * 400 + a * 1.2)) & 1) === 0;
      const lt = a > 1.4 && a < 2.9;
      return (lt ? c[0] : wind ? c[1] : c[2]) | TX_EMIT;
    },
  });
}
function cellMat(fresh: boolean): ReturnType<typeof mat> {
  return mat(0x3a8cff, {
    emit: true,
    tex: (X, Y, Z, f) => {
      if (f !== FC_SIDE) return 0x30343e;
      if (((Math.floor((Z + 1) / 0.009)) & 3) === 0) return (fresh ? 0x1a4aa8 : 0x161a24) | TX_EMIT;
      const a = Math.atan2(Y, X);
      if (!fresh) return (a > 1.5 && a < 2.8 ? 0x3a4250 : 0x22262e) | TX_FLAT;
      return (a > 1.5 && a < 2.8 ? 0xeaffff : a < -1 ? 0x1a4aa8 : 0x5ab0ff) | TX_EMIT;
    },
  });
}

const FG = { x: 0, y: 0.008, z: -0.3 };
const CELL = { x: -0.012, y: 0.062, z: -0.1 };
const ELBOW_R: [number, number, number] = [0.42, -0.55, -0.18];
const ELBOW_L: [number, number, number] = [-0.12, -0.56, -0.34];
const COILS = 6;

export const lanceRig: Rig = {
  id: 'lance',
  rest: { x: 0.205, y: -0.172, z: -0.4, pitch: -0.035, yaw: 0.02, roll: 0.05 },
  def: { ...BASE_POSE, coil: 0, heat: 0, boot: 0, door: 0, cellX: 0, cellY: 0, cellHand: 0, cellFresh: 1, cellGone: 0 },
  anims: {
    equip: { dur: 0.2, fps: 30, ch: { gp: k(0, -0.9, 1, 0, E.back), gy: k(0, -0.13, 1, 0, E.out), gr: k(0, -0.45, 1, 0, E.out), gyw: k(0, -0.15, 1, 0, E.out) } },
    reload: {
      dur: 1.35, fps: 24,
      ev: [[0.15, 'cellout'], [0.3, 'cellout'], [0.8, 'housing']],
      ch: {
        gr: k(0, 0, 0.12, -0.6, E.out, 0.78, -0.55, 0.8, -0.68, E.out, 0.86, -0.5, 1, 0, E.io),
        gp: k(0, 0, 0.12, 0.15, E.out, 0.78, 0.15, 0.81, 0.06, E.out, 0.86, 0.14, 1, 0, E.io),
        gyw: k(0, 0, 0.12, -0.05, 0.86, -0.05, 1, 0),
        gx: k(0, 0, 0.12, -0.03, E.out, 0.86, -0.03, 1, 0, E.io),
        gy: k(0, 0, 0.12, 0.045, E.out, 0.78, 0.045, 0.81, 0.03, E.out, 0.86, 0.045, 1, 0, E.io),
        door: k(0, 0, 0.13, 0, 0.17, 1, E.back, 0.74, 1, 0.8, 0, E.in3),
        // left hand: grab cell (0.2), pull out (0.3), drop (0.36), fetch (0.5), slot (0.7), slap door (0.8)
        lx: k(0, 0, 0.12, -0.04, 0.2, -0.035, 0.3, -0.09, E.out, 0.36, -0.08, 0.5, -0.06, 0.6, -0.09, 0.7, -0.035, E.in, 0.76, -0.04, 0.8, -0.03, E.in, 0.92, 0, E.io),
        ly: k(0, 0, 0.12, -0.02, E.out, 0.2, -0.01, 0.3, -0.015, 0.36, -0.04, 0.46, -0.25, E.in, 0.58, -0.02, E.out, 0.7, -0.01, 0.76, 0.06, 0.8, 0.05, E.in, 0.92, 0, E.io),
        lz: k(0, 0, 0.12, 0.15, E.out, 0.3, 0.16, 0.6, 0.16, 0.7, 0.16, 0.76, 0.17, 0.8, 0.17, 0.92, 0, E.io),
        lr: k(0, 0, 0.12, 0.5, 0.3, 0.6, 0.6, 0.6, 0.72, 0.4, 0.78, 0.8, 0.86, 0.6, 0.92, 0),
        lp: k(0, 0, 0.12, -0.4, 0.72, -0.4, 0.92, 0),
        lc: k(0, 1, 0.12, 0.3, 0.18, 0.3, 0.22, 0.8, 0.34, 0.8, 0.37, 0.3, 0.5, 0.8, 0.7, 0.8, 0.72, 0.2, 0.84, 0.2, 0.92, 1),
        lt: k(0, 0.6, 0.12, 0.2, 0.8, 0.2, 0.92, 0.6),
        // cell: out with hand (0.22–0.36), falls (0.36–0.46), fresh one in hand (0.5–0.7)
        cellX: k(0, 0, 0.22, 0, 0.3, -0.055, E.out, 0.36, -0.045, 0.6, -0.055, 0.7, 0, E.in),
        cellY: k(0, 0, 0.36, 0, 0.46, -0.35, E.in, 0.47, -0.3, E.step, 0.5, -0.3, 0.58, 0, E.out),
        cellHand: k(0, 0, 0.21, 0, 0.22, 1, E.step, 0.36, 1, 0.37, 0, E.step, 0.49, 0, 0.5, 1, E.step, 0.7, 1, 0.71, 0, E.step),
        cellFresh: k(0, 0, 0.47, 0, 0.48, 1, E.step),
        cellGone: k(0, 0, 0.46, 0, 0.47, 1, E.step, 0.49, 1, 0.5, 0, E.step),
        boot: k(0, 0, 0.82, 0, 0.98, 1, E.lin, 1, 0, E.step),
        heat: k(0, 0, 0.84, 0, 0.86, 0.6, E.step, 0.9, 0, E.lin),
      },
    },
    inspect: {
      dur: 1.6, fps: 24,
      ch: {
        gr: k(0, 0, 0.22, -0.65, E.io, 0.55, -0.6, 0.72, 0.3, E.io, 0.86, 0.25, 1, 0, E.io),
        gyw: k(0, 0, 0.22, -0.12, E.io, 0.55, -0.1, 0.72, 0.2, 1, 0, E.io),
        gp: k(0, 0, 0.22, 0.2, E.io, 0.55, 0.2, 0.72, 0.1, 1, 0, E.io),
        gy: k(0, 0, 0.22, 0.045, E.io, 0.34, 0.045, 0.37, 0.038, E.out, 0.4, 0.045, 0.43, 0.038, E.out, 0.46, 0.045, 0.72, 0.035, 1, 0, E.io),
        gx: k(0, 0, 0.22, -0.04, E.io, 0.72, -0.02, 1, 0, E.io),
        boot: k(0, 0, 0.25, 0, 0.45, 1, E.lin, 0.55, 0, E.out),
        lx: k(0, 0, 0.2, -0.03, 0.34, -0.03, 0.37, -0.012, E.in, 0.4, -0.03, E.out, 0.43, -0.012, E.in, 0.46, -0.03, 0.62, 0, E.io),
        ly: k(0, 0, 0.2, 0.06, 0.5, 0.06, 0.62, 0, E.io),
        lz: k(0, 0, 0.2, 0.22, 0.5, 0.22, 0.62, 0, E.io),
        lr: k(0, 0, 0.2, 0.6, 0.5, 0.6, 0.62, 0),
        lc: k(0, 1, 0.2, 0.2, 0.5, 0.2, 0.62, 1),
      },
    },
  },
  build(sc: Scene, p) {
    const G = gunXf(this.rest, p);
    const lv = Math.round(p.coil), heat = p.heat, boot = p.boot;
    sc.with(G, () => {
      sc.group(1, () => {
        // capacitor body
        sc.box(0, 0.062, -0.04, 0.03, 0.038, 0.14, M_HOUSE, undefined, 0.006);
        sc.box(0, 0.104, -0.03, 0.022, 0.006, 0.1, M_PLATE, undefined, 0.004);
                // pistol grip + guard
        sc.box(0, -0.02, 0.022, 0.016, 0.05, 0.022, M_DARK, RX(-0.32), 0.005);
        sc.box(0, 0.02, -0.03, 0.006, 0.004, 0.032, M_DARK);
        // rear twin capacitors glowing
        for (const sd of [-1, 1]) {
          sc.cyl(sd * 0.022, 0.102, 0.05, 0.009, 0.03, M_PLATE);
          sc.cyl(sd * 0.022, 0.102, 0.016, 0.0065, 0.004, coilMat(5, lv, heat, boot));
        }
      });
      // side housing door (hinged on its lower edge, swings out-left)
      sc.group(3, () => {
        sc.with(mm(T(-0.031, 0.03, CELL.z), RZ(-p.door * 1.25)), () => {
          sc.box(-0.004, 0.032, 0, 0.004, 0.032, 0.075, mat(PLATE, { spec: 0.8, tex: (_X, Y, Z, f) => (f === FX_NX && (Math.abs(Z) > 0.068 || Math.abs(Y - 0.02) < 0.0015) ? lit(PLATE, -0.5) | TX_FLAT : f === FX_NX && Math.abs(Y + 0.012) < 0.003 && Math.abs(Z) < 0.05 ? (lv > 0 || boot > 0.5 ? 0x8ad0ff : 0x1a3a7a) | TX_EMIT : -1) }));
          sc.point('housing', -0.01, 0.06, 0);
        });
      });
      // barrel: core + coils + spacers
      sc.group(2, () => {
        sc.cyl(0, 0.062, -0.38, 0.021, 0.25, M_CORE);
        sc.box(0, 0.095, -0.36, 0.006, 0.006, 0.22, M_PLATE);
        for (let i = 0; i < COILS; i++) {
          const z = -0.19 - i * 0.068;
          sc.cyl(0, 0.062, z, 0.034 - i * 0.0013, 0.013, coilMat(i, lv, heat, boot));
          sc.cyl(0, 0.062, z - 0.022, 0.026, 0.004, M_PLATE);
          sc.point('coil' + i, -0.03, 0.08, z);
        }
        // prongs + crystal
        for (const sd of [-1, 1]) {
          sc.seg(sd * 0.02, 0.062, -0.6, sd * 0.05, 0.068, -0.69, 0.009, M_PLATE, 0.006);
          sc.seg(sd * 0.05, 0.068, -0.69, sd * 0.042, 0.066, -0.75, 0.006, M_PLATE, 0.004);
        }
        sc.point('prongL', -0.042, 0.066, -0.75);
        sc.point('prongR', 0.042, 0.066, -0.75);
        const cc = coilCol(5, lv, heat, boot);
        sc.sph(0, 0.063, -0.69, 0.009, 0.009, 0.024, mat(cc[1], { emit: true, noLine: true, tex: (X, Y) => (X < 0 && Y > 0 ? cc[0] : X > 0.003 ? cc[2] : cc[1]) | TX_EMIT }), RZ(0.785));
        sc.point('tip', 0, 0.063, -0.72);
        sc.point('muzzle', 0, 0.063, -0.73);
        // foregrip
        sc.box(FG.x, FG.y, FG.z, 0.012, 0.034, 0.015, M_DARK, RX(0.3), 0.004);
        sc.box(0, 0.036, -0.3, 0.018, 0.008, 0.04, M_HOUSE);
      });
    });
    // coil cell (in housing / pulled out / in hand / falling)
    const cellFn = (): void => sc.group(4, () => {
      sc.cyl(0, 0, 0, 0.016, 0.05, cellMat(p.cellFresh > 0.5));
      sc.cyl(0, 0, -0.054, 0.018, 0.005, M_DARK);
      sc.cyl(0, 0, 0.054, 0.018, 0.005, M_DARK);
    });
    const LH = mm(G, mm(T(FG.x - 0.024 + p.lx, FG.y + 0.012 + p.ly, FG.z + 0.016 + p.lz), mm(RX(0.95 + p.lp), mm(RZ(Math.PI / 2 - 0.8 + p.lr), RX(p.lyw)))));
    if (p.cellGone < 0.5) {
      const falling = p.cellHand < 0.5 && p.cellY < -0.001;
      sc.with(mm(G, mm(T(CELL.x + p.cellX + (falling ? p.cellY * 0.1 : 0), CELL.y + p.cellY, CELL.z), RX(falling ? p.cellY * -4 : 0))), cellFn);
    }
    if (p.lhide < 0.5) arm(sc, LH, -1, p.lc, p.lt, ELBOW_L);
    const RH = mm(G, mm(T(0.024 + p.rx, 0.01 + p.ry, 0.004 + p.rz), mm(RX(0.75 + p.rp), mm(RZ(-Math.PI / 2 + 0.15 + p.rr), RX(p.ryw)))));
    if (p.rhide < 0.5) arm(sc, RH, 1, p.rc, p.rt, ELBOW_R);
    void mix;
  },
};
