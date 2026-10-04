// PULSE — the workhorse. Personality: clean, precise, military-sleek; a boxy gunmetal rifle with a
// living amber energy strip down its flank and a cyan emitter eye at the muzzle. It never fumbles.
//
// Animation beats
//  idle    : breathing sway (runtime), strip shimmers.
//  fire    : sharp short kick (spring), strip pulses white-hot from the cell forward, cyan flash.
//  reload  : 0.00 rifle rolls right & lifts, left hand leaves the foregrip
//            0.14 thumb jabs the release → spent cell (dull, cracked glow) drops free + vapour puff
//            0.24 hand dips off-screen for a fresh cell
//            0.44 hand returns with a bright cell, lines it up under the well (anticipation dip)
//            0.58 SLAP — cell seats, whole rifle jolts up, spark
//            0.68 hand to the charging handle, yank it back → spring forward
//            0.80 strip relights cell→muzzle in a sweep, rifle rolls back to rest
//  inspect : rifle rolls/yaws to show off the strip, left hand pats the receiver twice, settles.
//  equip   : swings up from below with a slight roll, overshoot settle.
import { Scene, mat, T, RX, RY, RZ, mm, TX_EMIT, TX_FLAT, FX_NX, FX_PZ, FX_PY, FC_CAP0, FC_SIDE } from './viewmodel3d';
import { Rig, BASE_POSE, gunXf, arm, M_ARMOR } from './viewmodelRig';
import { E, k, Anim } from './viewmodelAnim';
import { lit, mix } from './core';

const BODY = 0x3c414a, TOP = 0x5a616c, DARK = 0x22252b, ACC = 0x4a4e58;
const AMBER = [0xfff4d0, 0xffc040, 0xd07010, 0x5a2a08];

const M_BODY = mat(BODY, {
  spec: 0.5,
  tex: (X, Y, Z, f) => {
    if (f === FX_NX) { // left flank: panel seams + strip channel + vents near the rear
      if (Math.abs(Z + 0.02) < 0.002 || Math.abs(Z - 0.06) < 0.002) return lit(BODY, -0.5) | TX_FLAT;
      if (Z > 0.0 && Z < 0.05 && Y < -0.01 && ((Math.floor(Z / 0.008)) & 1) === 0 && Y > -0.03) return DARK | TX_FLAT;
      if (Math.abs(Y + 0.032) < 0.002) return lit(BODY, -0.35);
    }
    if (f === FX_PY && Math.abs(X) < 0.003) return lit(BODY, -0.4);
    return -1;
  },
});
const M_TOP = mat(TOP, {
  spec: 0.7,
  tex: (X, _Y, Z, f) => {
    if (f === FX_PY && Math.abs(X) < 0.012) { const zz = ((Z % 0.014) + 0.014) % 0.014; if (zz < 0.004) return lit(TOP, -0.6) | TX_FLAT; }
    return -1;
  },
});
const M_DARK = mat(DARK, { spec: 0.3 });
const M_LOWER = mat(0x2c3038, {
  spec: 0.4,
  tex: (_X, Y, Z, f) => {
    if (f === FX_NX && Math.abs(Z - 0.03) < 0.002) return 0x15171b | TX_FLAT;
    if (f === FX_NX && Y < -0.008 && Z > -0.12 && Z < -0.04 && ((Math.floor(Z / 0.009)) & 1) === 0) return 0x15171b | TX_FLAT;
    return -1;
  },
});
const M_ACC = mat(ACC, { spec: 0.6 });
const M_SHROUD = mat(0x383c45, {
  spec: 0.6,
  cut: (_X, Y, Z, f) => f === FX_NX && Math.abs(Y) < 0.011 && Math.abs(Z) < 0.07 && ((((Z % 0.024) + 0.024) % 0.024) < 0.011),
  tex: (_X, Y, Z, f) => {
    if (f === FX_PY) { const zz = ((Z % 0.024) + 0.024) % 0.024; if (zz < 0.008) return lit(0x464b55, -0.5); }
    return -1;
  },
});

function stripMat(level: number, phase: number): ReturnType<typeof mat> {
  // level 0 = dark, 1 = normal, 2+ = pulse (brighter wave)
  return mat(AMBER[2], {
    emit: level > 0,
    noLine: true,
    tex: (_X, Y, Z) => {
      if (level <= 0) return mix(AMBER[3], DARK, 0.4) | TX_FLAT;
      const edge = Math.abs(Y) > 0.0035;
      const wave = level >= 2 ? Math.abs(((Z + 0.3) * 10 + phase) % 1) < 0.35 : ((Z * 60) | 0) % 9 === 0;
      if (level >= 3) return (edge ? AMBER[1] : AMBER[0]) | TX_EMIT;
      return (edge ? AMBER[2] : wave ? AMBER[0] : AMBER[1]) | TX_EMIT;
    },
  });
}
function cellMat(state: number): ReturnType<typeof mat> {
  // 0 spent (dull), 1 fresh bright
  const c0 = state ? 0xeaffff : 0x6aa0a8, c1 = state ? 0x4ae8ff : 0x2a5a66, c2 = state ? 0x1a8aaa : 0x163038;
  return mat(c1, {
    emit: true,
    tex: (X, Y, _Z, f) => {
      if (f !== FC_SIDE) return 0x30343a;
      const rib = ((Math.floor((_Z + 1) / 0.012)) & 3) === 0;
      if (rib) return c2 | TX_EMIT;
      const a = Math.atan2(Y, X);
      return (a > 1.6 && a < 2.9 ? c0 : a < -1 ? c2 : c1) | TX_EMIT;
    },
  });
}

const FG = { x: 0, y: 0.018, z: -0.25 }; // foregrip
const WELL = { x: 0, y: -0.005, z: -0.1 };
const ELBOW_R: [number, number, number] = [0.4, -0.55, -0.18];
const ELBOW_L: [number, number, number] = [-0.1, -0.55, -0.32];

export const pulseRig: Rig = {
  id: 'pulse',
  rest: { x: 0.2, y: -0.16, z: -0.4, pitch: -0.03, yaw: 0.02, roll: 0.05 },
  def: {
    ...BASE_POSE,
    strip: 1, sp: 0, chg: 0,
    // cell: 0 = seated, >0 = drop distance; cellHand: 1 = new cell carried by the left hand
    cell: 0, cellRot: 0, cellHand: 0, cellFresh: 1,
  },
  anims: {
    equip: {
      dur: 0.2, fps: 30,
      ch: { gp: k(0, -0.9, 1, 0, E.back), gy: k(0, -0.1, 1, 0, E.out), gr: k(0, -0.4, 1, 0, E.out), gyw: k(0, -0.15, 1, 0, E.out) },
    },
    reload: {
      dur: 1.15, fps: 24,
      ev: [[0.17, 'vapour'], [0.6, 'slap'], [0.74, 'click'], [0.82, 'relight']],
      ch: {
        gr: k(0, 0, 0.12, -0.55, E.out, 0.5, -0.6, 0.58, -0.5, E.out, 0.64, -0.62, E.out, 0.7, -0.35, 0.8, -0.3, 1, 0, E.io),
        gp: k(0, 0, 0.12, 0.18, E.out, 0.56, 0.2, 0.6, 0.27, E.out, 0.66, 0.16, 0.86, 0.1, 1, 0, E.io),
        gyw: k(0, 0, 0.12, 0.2, E.out, 0.7, 0.18, 0.8, 0.05, 1, 0),
        gx: k(0, 0, 0.12, -0.03, E.out, 0.85, -0.025, 1, 0),
        gy: k(0, 0, 0.12, 0.03, E.out, 0.56, 0.03, 0.6, 0.045, E.out, 0.66, 0.025, 1, 0, E.io),
        // left hand: off grip → to cell → down → back with fresh → slap → charge handle → grip
        lx: k(0, 0, 0.12, 0.0, 0.2, 0.0, 0.3, 0.02, 0.44, 0.02, 0.56, 0.0, 0.6, 0.0, 0.68, -0.02, 0.72, -0.03, 0.8, -0.03, 0.92, 0),
        ly: k(0, 0, 0.12, -0.04, E.out, 0.18, -0.05, 0.3, -0.3, E.in, 0.44, -0.12, E.out, 0.52, -0.1, 0.56, -0.12, E.antic, 0.6, -0.065, E.out, 0.66, 0.02, 0.7, 0.07, E.out, 0.78, 0.075, 0.92, 0, E.io),
        lz: k(0, 0, 0.12, 0.19, E.out, 0.2, 0.19, 0.44, 0.19, 0.6, 0.19, 0.66, 0.12, 0.7, 0.1, E.out, 0.73, 0.1, 0.76, 0.16, E.out, 0.8, 0.13, 0.92, 0, E.io),
        lp: k(0, 0, 0.12, 0.5, 0.56, 0.5, 0.66, 0, 0.92, 0),
        lr: k(0, 0, 0.12, -0.2, 0.3, -0.5, 0.56, -0.3, 0.66, 0.2, 0.8, 0.2, 0.92, 0),
        lc: k(0, 1, 0.1, 0.5, 0.14, 0.75, 0.18, 0.5, 0.3, 0.8, 0.56, 0.85, 0.62, 0.45, 0.68, 0.5, 0.72, 1, 0.8, 1, 0.86, 0.5, 0.95, 1),
        // cell: spent drops (0.15→0.3), fresh rides in hand (0.3→0.6)
        cell: k(0, 0, 0.15, 0, 0.3, 0.42, E.in, 0.31, 0.11, E.step, 0.44, 0.06, E.out, 0.56, 0.07, 0.6, 0, E.in),
        cellRot: k(0, 0, 0.15, 0, 0.3, 1.3, E.in, 0.31, 0.25, E.step, 0.44, 0.12, 0.56, 0.08, 0.6, 0),
        cellHand: k(0, 0, 0.3, 0, 0.31, 1, E.step, 0.6, 1, 0.61, 0, E.step),
        cellFresh: k(0, 1, 0.14, 1, 0.15, 0, E.step, 0.3, 0, 0.31, 1, E.step),
        strip: k(0, 1, 0.14, 1, 0.15, 0, E.step, 0.82, 0, 0.83, 3, E.step, 0.9, 1, E.step),
        sp: k(0, 0, 0.83, 0, 0.9, 1),
        chg: k(0, 0, 0.73, 0, 0.77, 1, E.out, 0.81, 0, E.in),
      },
    },
    inspect: {
      dur: 1.6, fps: 24,
      ch: {
        // roll the flank up to the light, hold, then flip to show the top, settle
        gr: k(0, 0, 0.2, -0.75, E.io, 0.5, -0.7, 0.68, 0.4, E.io, 0.85, 0.35, 1, 0, E.io),
        gyw: k(0, 0, 0.2, -0.12, E.io, 0.5, -0.1, 0.68, 0.22, E.io, 0.85, 0.2, 1, 0, E.io),
        gp: k(0, 0, 0.2, 0.18, E.io, 0.5, 0.2, 0.68, 0.1, 0.85, 0.08, 1, 0, E.io),
        gx: k(0, 0, 0.2, -0.04, E.io, 0.5, -0.04, 0.68, -0.02, 1, 0, E.io),
        gy: k(0, 0, 0.2, 0.04, E.io, 0.3, 0.04, 0.33, 0.034, E.out, 0.36, 0.04, 0.4, 0.034, E.out, 0.43, 0.04, 0.68, 0.03, 1, 0, E.io),
        // left hand: off the grip, two pats on the flank (gun bounces on each), back
        lx: k(0, 0, 0.16, -0.02, 0.28, -0.03, 0.33, -0.008, E.in, 0.36, -0.03, E.out, 0.4, -0.008, E.in, 0.44, -0.03, 0.55, -0.02, 0.7, 0, E.io),
        ly: k(0, 0, 0.16, 0.05, E.out, 0.5, 0.05, 0.7, 0, E.io),
        lz: k(0, 0, 0.16, 0.1, E.out, 0.5, 0.1, 0.7, 0, E.io),
        lr: k(0, 0, 0.16, 0.6, 0.5, 0.6, 0.7, 0),
        lc: k(0, 1, 0.16, 0.15, 0.52, 0.15, 0.68, 1),
        lt: k(0, 0.6, 0.16, 0.1, 0.52, 0.1, 0.68, 0.6),
        strip: k(0, 1, 0.33, 1, 0.34, 3, E.step, 0.37, 1, E.step, 0.4, 1, 0.41, 3, E.step, 0.44, 1, E.step),
      },
    },
  },
  build(sc: Scene, p) {
    const G = gunXf(this.rest, p);
    const stripLv = Math.round(p.strip + (p.strip > 0 ? p.sp * 1.6 : 0));
    sc.with(G, () => {
      sc.group(1, () => {
        // upper receiver (light) + lower receiver (dark), strip runs in the seam
        sc.box(0, 0.088, -0.02, 0.024, 0.019, 0.21, M_BODY);
        sc.box(0, 0.11, -0.04, 0.019, 0.006, 0.17, M_TOP, undefined, 0.004);
        sc.box(0, 0.051, -0.05, 0.022, 0.018, 0.16, M_LOWER);
        sc.box(-0.004, 0.06, 0.09, 0.022, 0.026, 0.07, M_LOWER, RX(0.08)); // rear block
        // sight with red dot + front post
        sc.box(0, 0.122, -0.03, 0.008, 0.006, 0.026, mat(DARK, { tex: (X, Y, _Z, f) => (f === FX_PZ && Math.abs(X) < 0.003 && Math.abs(Y) < 0.003 ? 0xff3020 | TX_EMIT : -1) }));
        sc.box(0, 0.127, -0.012, 0.003, 0.004, 0.004, M_ACC);
        // charging handle
        sc.box(-0.028, 0.094, -0.13 + p.chg * 0.05, 0.007, 0.006, 0.012, M_ACC);
        // pistol grip + trigger guard
        sc.box(0, -0.02, 0.022, 0.016, 0.05, 0.022, M_DARK, RX(-0.32), 0.005);
        sc.box(0, 0.026, -0.03, 0.006, 0.004, 0.032, M_DARK);
        sc.box(0, 0.03, -0.058, 0.006, 0.012, 0.004, M_DARK);
      });
      sc.group(2, () => {
        // shroud + brake + emitter
        sc.box(0, 0.08, -0.31, 0.018, 0.021, 0.085, M_SHROUD);
        sc.box(0, 0.103, -0.31, 0.01, 0.003, 0.08, M_TOP);
        sc.box(0, 0.08, -0.31, 0.0125, 0.012, 0.075, mat(0xffa030, { emit: true, noLine: true, tex: (_X, Y, Z) => ((Math.abs(Y) < 0.004 && ((Z * 80) | 0) % 3 === 0 ? (stripLv >= 2 ? 0xfff0c0 : 0xffb040) : stripLv >= 1 ? 0xb05010 : 0x401808) | TX_EMIT) }));
        sc.box(0, 0.08, -0.41, 0.016, 0.016, 0.018, M_DARK, undefined, 0.005);
        sc.cyl(0, 0.08, -0.44, 0.0125, 0.014, M_ACC, undefined, -0.12);
        sc.cyl(0, 0.08, -0.429, 0.0145, 0.0025, mat(0x4ae8ff, { emit: true, noLine: true, tex: (X, Y) => (Y > 0.005 ? 0xeaffff : X < -0.008 ? 0x8af4ff : 0x2ab8e8) | TX_EMIT }));
        sc.cyl(0, 0.08, -0.455, 0.0095, 0.0015, mat(0x4ae8ff, { emit: true, noLine: true, tex: (X, Y) => (Math.hypot(X, Y) < 0.004 ? 0xeaffff : 0x4ae8ff) | TX_EMIT }));
        sc.point('muzzle', 0, 0.08, -0.46);
        // angled foregrip
        sc.box(FG.x, FG.y, FG.z, 0.011, 0.034, 0.014, M_DARK, RX(0.3), 0.004);
        sc.box(0, 0.052, -0.27, 0.016, 0.008, 0.06, M_LOWER);
      });
      // energy strip down the left flank
      sc.group(3, () => {
        sc.box(-0.0242, 0.069, -0.06, 0.0014, 0.0045, 0.16, stripMat(stripLv, p.sp * 3));
      });
      // mag well
      sc.group(1, () => sc.box(WELL.x, WELL.y + 0.025, WELL.z, 0.021, 0.014, 0.025, M_LOWER));
      sc.point('well', WELL.x, WELL.y - 0.02, WELL.z);
      sc.point('eject', -0.03, 0.08, -0.02);
    });
    // energy cell
    const cellFn = (): void => {
      sc.group(4, () => {
        sc.cyl(0, 0, 0, 0.0165, 0.038, cellMat(p.cellFresh), RX(Math.PI / 2));
        sc.cyl(0, 0.043, 0, 0.019, 0.006, M_DARK, RX(Math.PI / 2));
        sc.cyl(0, -0.043, 0, 0.019, 0.007, M_DARK, RX(Math.PI / 2));
        sc.box(0, 0.05, 0, 0.012, 0.003, 0.012, M_ACC);
      });
    };
    // left hand transform (gun space), vertical-grip hold: back of hand faces the camera (-x)
    const LH = mm(G, mm(T(FG.x - 0.024 + p.lx, FG.y + 0.012 + p.ly, FG.z + 0.016 + p.lz), mm(RX(0.95 + p.lp), mm(RZ(Math.PI / 2 - 0.8 + p.lr), RY(p.lyw)))));
    if (p.cellHand > 0.5) {
      // carried in the left fingers, just in front of the palm
      sc.with(mm(LH, T(0.0, -0.035, -0.02)), () => sc.with(RZ(-Math.PI / 2), () => cellFn()));
    } else {
      sc.with(mm(G, mm(T(WELL.x + p.cell * 0.05, WELL.y - 0.04 - p.cell, WELL.z - p.cell * 0.1), RX(p.cellRot * 0.6))), () => sc.with(RZ(p.cellRot), cellFn));
    }
    if (p.lhide < 0.5) arm(sc, LH, -1, p.lc, p.lt, ELBOW_L);
    // right hand on the pistol grip: back of hand faces +x, knuckles vertical
    const RH = mm(G, mm(T(0.024 + p.rx, 0.01 + p.ry, 0.004 + p.rz), mm(RX(0.75 + p.rp), mm(RZ(-Math.PI / 2 + 0.15 + p.rr), RY(-0.1 + p.ryw)))));
    if (p.rhide < 0.5) arm(sc, RH, 1, p.rc, p.rt, ELBOW_R);
    void FX_PY; void FC_CAP0; void M_ARMOR;
  },
};
