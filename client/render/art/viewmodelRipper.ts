// RIPPER — a two-handed industrial chainsaw: chipped orange-red motor housing with cooling fins,
// a wrap-over tube handle for the left fist, a long steel guide bar and a hungry chain.
// Personality: idling menace; it's never quite still, it coughs smoke, it wants to be used.
//
// Animation beats
//  idle    : chain creeps (runtime phase), motor puffs smoke from the exhaust, low rumble shake.
//  on      : chain runs (blurred), stronger vibration.
//  cutting : chain fully blurred + heavy vibration + sparks and gore spray at the bar tip.
//  reload  : PULL-START. 0.00 left hand lets go of the top handle, grabs the T-grip of the cord
//            0.18 YANK — cord whips out, whole saw jerks left/up; 0.30 it sputters (puffs, shudders)
//            0.40 cord rewinds, 0.50 it catches and ROARS (smoke burst, chain spins up),
//            0.60 hand returns to the top handle.
//  inspect : tilt the bar up to admire the teeth, left hand slaps the motor housing.
//  equip   : swung up from below, chain ticking.
import { Scene, mat, T, RX, RY, RZ, mm, TX_FLAT, TX_EMIT, FX_NX, FX_PY, FC_SIDE } from './viewmodel3d';
import { Rig, BASE_POSE, gunXf, arm } from './viewmodelRig';
import { E, k } from './viewmodelAnim';
import { lit, mix, hashStr } from './core';

const HOUS = 0xc0401c, STEEL = 0x8c9098, DARK = 0x26262c, YEL = 0xe0b020;
const chipped = (base: number) => (X: number, Y: number, Z: number): number => {
  const h = hashStr(`${Math.floor(X * 140)},${Math.floor(Y * 140)},${Math.floor(Z * 140)}`) / 4294967296;
  return h < 0.025 ? mix(base, 0x5a5a60, 0.8) : h < 0.05 ? lit(base, -0.4) : -1;
};
const M_HOUS = mat(HOUS, {
  spec: 0.5,
  tex: (X, Y, Z, f) => {
    if (f === FX_NX) {
      // cooling fins + warning stripe
      if (Y > 0.005 && Z > -0.06 && Z < 0.05 && ((Math.floor(Y / 0.009)) & 1) === 0) return lit(HOUS, -0.7) | TX_FLAT;
      if (Y < -0.035) return ((Math.floor((Z + Y) / 0.012)) & 1) ? YEL : DARK;
    }
    return chipped(HOUS)(X, Y, Z);
  },
});
const M_HOUS2 = mat(0x9a3014, { spec: 0.6, tex: (X, Y, Z) => chipped(0x9a3014)(X, Y, Z) });
const M_DARK = mat(DARK, { spec: 0.3 });
const M_STEEL = mat(STEEL, {
  spec: 0.9,
  tex: (_X, Y, Z, f) => {
    if (f === FX_NX && Math.abs(Y) < 0.003) return lit(STEEL, -0.45);
    if (f === FX_NX && Math.abs(Y) < 0.014 && ((Math.floor(Z / 0.035)) & 3) === 0 && Math.abs(Y) > 0.007) return lit(STEEL, -0.3);
    return -1;
  },
});
const M_TUBE = mat(0x2e3036, { spec: 0.7 });
const M_TOOTH = mat(0xd0d4dc, { spec: 1 });
const M_CORD = mat(0xd8d0b0, { spec: 0.2 });
const M_TGRIP = mat(YEL, { spec: 0.5 });
function blurMat(level: number): ReturnType<typeof mat> {
  return mat(0x9aa0a8, {
    spec: 0.6, noLine: true,
    tex: (_X, _Y, Z, f) => {
      if (f !== FX_NX && f !== FC_SIDE && f !== FX_PY) return -1;
      const s = ((Math.floor(Z * 300 + level * 3)) % 5);
      return (s === 0 ? 0xf0f2f6 : s === 2 ? 0x5a5e66 : level > 1 && s === 4 ? 0xfff0c0 | TX_EMIT : 0xb0b4bc);
    },
  });
}

const TOP = { x: -0.05, y: 0.085, z: -0.185 }; // left upright of the wrap handle
const CORD = { x: -0.056, y: 0.1, z: -0.06 }; // pull-start T-grip at rest
const ELBOW_R: [number, number, number] = [0.42, -0.55, -0.18];
const ELBOW_L: [number, number, number] = [-0.12, -0.58, -0.32];

export const ripperRig: Rig = {
  id: 'ripper',
  rest: { x: 0.2, y: -0.25, z: -0.42, pitch: 0.06, yaw: 0.04, roll: 0.04 },
  def: { ...BASE_POSE, chain: 0, blur: 0, cord: 0, lcord: 0 },
  anims: {
    equip: { dur: 0.2, fps: 30, ch: { gp: k(0, -0.8, 1, 0, E.back), gy: k(0, -0.12, 1, 0, E.out), gr: k(0, 0.4, 1, 0, E.out), gyw: k(0, -0.2, 1, 0, E.out) } },
    reload: {
      dur: 0.9, fps: 30,
      ev: [[0.3, 'sputter'], [0.38, 'sputter'], [0.5, 'roar']],
      ch: {
        lcord: k(0, 0, 0.14, 1, E.io, 0.46, 1, 0.62, 0, E.io),
        cord: k(0, 0, 0.16, 0, 0.24, 1, E.out3, 0.3, 0.95, 0.44, 0, E.in),
        lx: k(0, 0, 0.16, 0, 0.24, -0.02, 0.44, 0, 1, 0),
        ly: k(0, 0, 0.1, 0.03, 0.16, 0, 1, 0),
        lr: k(0, 0, 0.14, 0.5, 0.46, 0.5, 0.62, 0),
        lp: k(0, 0, 0.14, -0.3, 0.46, -0.3, 0.62, 0),
        lc: k(0, 1, 0.08, 0.4, 0.14, 1, 1, 1),
        gr: k(0, 0, 0.14, -0.15, E.io, 0.18, -0.1, 0.26, -0.35, E.out, 0.32, -0.2, 0.36, -0.28, 0.4, -0.18, 0.5, -0.25, 0.54, -0.12, 0.62, -0.05, 1, 0, E.io),
        gyw: k(0, 0, 0.14, 0.08, 0.18, 0.1, E.antic, 0.26, 0.28, E.out, 0.4, 0.1, 0.5, 0.12, 0.62, 0.02, 1, 0, E.io),
        gp: k(0, 0, 0.14, 0.05, 0.26, 0.14, E.out, 0.3, 0.04, 0.34, 0.1, 0.38, 0.03, 0.42, 0.08, 0.5, 0.0, 0.54, 0.14, E.out, 0.62, 0.05, 1, 0, E.io),
        gx: k(0, 0, 0.14, -0.02, 0.26, -0.04, E.out, 0.5, -0.02, 1, 0, E.io),
        blur: k(0, 0, 0.5, 0, 0.51, 1, E.step, 0.85, 1, 0.86, 0, E.step),
      },
    },
    inspect: {
      dur: 1.6, fps: 24,
      ch: {
        gp: k(0, 0, 0.22, 0.32, E.io, 0.55, 0.3, 0.72, 0.05, E.io, 1, 0, E.io),
        gr: k(0, 0, 0.22, -0.55, E.io, 0.55, -0.5, 0.72, 0.2, E.io, 0.86, 0.15, 1, 0, E.io),
        gyw: k(0, 0, 0.22, 0.12, E.io, 0.55, 0.12, 1, 0, E.io),
        gy: k(0, 0, 0.22, 0.05, E.io, 0.62, 0.05, 0.65, 0.04, E.out, 0.68, 0.05, 1, 0, E.io),
        gx: k(0, 0, 0.22, -0.03, E.io, 0.72, -0.02, 1, 0, E.io),
        // left hand slaps the housing at 0.64
        lcord: k(0, 0, 0.5, 0, 0.6, 0.7, E.io, 0.64, 0.85, E.in, 0.68, 0.7, E.out, 0.82, 0, E.io),
        lc: k(0, 1, 0.5, 1, 0.58, 0.1, 0.72, 0.1, 0.82, 1),
        lr: k(0, 0, 0.5, 0, 0.6, 0.6, 0.72, 0.6, 0.82, 0),
      },
    },
  },
  build(sc: Scene, p) {
    const G = gunXf(this.rest, p);
    sc.with(G, () => {
      sc.group(1, () => {
        // motor housing + rounded top + air filter cover
        sc.box(0, 0.075, -0.1, 0.048, 0.055, 0.1, M_HOUS, undefined, 0.008);
        sc.cyl(0, 0.13, -0.1, 0.042, 0.088, M_HOUS2, undefined, 0, 0.018);
        sc.box(0.02, 0.15, -0.06, 0.018, 0.008, 0.03, M_DARK);
        sc.box(-0.049, 0.06, -0.15, 0.004, 0.03, 0.03, M_DARK); // chain brake side cover
        // exhaust muffler (left front)
        sc.box(-0.052, 0.035, -0.175, 0.01, 0.012, 0.022, mat(0x3a3a40, { spec: 0.6, tex: (_X, _Y, Z, f) => (f === FX_NX && ((Math.floor(Z / 0.007)) & 1) ? 0x101012 | TX_FLAT : -1) }));
        sc.point('exhaust', -0.066, 0.035, -0.19);
        // rear trigger handle
        sc.box(0, -0.015, 0.03, 0.016, 0.045, 0.022, M_DARK, RX(-0.32), 0.005);
        sc.box(0, 0.03, 0.03, 0.017, 0.012, 0.05, M_HOUS2);
      });
      // wrap-over tube handle
      sc.group(2, () => {
        sc.seg(-0.05, 0.02, -0.19, -0.05, 0.15, -0.18, 0.009, M_TUBE);
        sc.seg(-0.05, 0.15, -0.18, -0.03, 0.17, -0.17, 0.009, M_TUBE);
        sc.seg(-0.03, 0.17, -0.17, 0.035, 0.17, -0.17, 0.009, M_TUBE);
        sc.seg(0.035, 0.17, -0.17, 0.05, 0.13, -0.16, 0.009, M_TUBE);
      });
      // guide bar + chain
      sc.with(mm(T(0, 0.055, -0.2), RX(0.06)), () => {
        sc.group(3, () => {
          sc.box(0, 0, -0.26, 0.005, 0.032, 0.25, M_STEEL, undefined, 0.003);
          sc.cyl(0, 0, -0.51, 0.032, 0.005, M_STEEL, RY(Math.PI / 2));
          sc.cyl(0, 0, -0.51, 0.007, 0.0062, M_DARK, RY(Math.PI / 2));
        });
        sc.group(4, () => {
          if (p.blur > 0.5) {
            const bm = blurMat(p.blur);
            sc.box(0, 0.035, -0.26, 0.0065, 0.004, 0.25, bm);
            sc.box(0, -0.035, -0.26, 0.0065, 0.004, 0.25, bm);
            sc.cyl(0, 0, -0.51, 0.0385, 0.0065, bm, RY(Math.PI / 2));
          } else {
            const ph = (p.chain / 4) * 0.025;
            for (let z = -0.005 - ph; z > -0.51; z -= 0.025) {
              sc.box(0, 0.036, z, 0.0065, 0.0045, 0.006, M_TOOTH);
              sc.box(0, 0.04, z - 0.004, 0.003, 0.003, 0.003, M_TOOTH);
              sc.box(0, -0.036, z - 0.012, 0.0065, 0.0045, 0.006, M_TOOTH);
            }
            for (let a = 0; a < 5; a++) {
              const t = (a + p.chain / 4) * (Math.PI / 5) - Math.PI / 2;
              sc.box(0, Math.sin(t) * 0.037, -0.51 - Math.cos(t) * 0.037, 0.0065, 0.0045, 0.0045, M_TOOTH, RX(-t));
            }
          }
        });
        sc.point('tip', 0, 0.0, -0.55);
        sc.point('muzzle', 0, 0.0, -0.55);
      });
      // pull cord + T-grip
      const cx = CORD.x - p.cord * 0.16, cy = CORD.y - p.cord * 0.03, cz = CORD.z + p.cord * 0.12;
      sc.group(5, () => {
        if (p.cord > 0.02) sc.seg(CORD.x + 0.004, CORD.y, CORD.z, cx, cy, cz, 0.0018, M_CORD);
        sc.box(cx - 0.004, cy, cz, 0.004, 0.006, 0.02, M_TGRIP, undefined, 0.002);
        sc.box(CORD.x + 0.006, CORD.y, CORD.z, 0.004, 0.012, 0.016, M_DARK);
      });
    });
    // left hand: top handle (overhand, knuckles up) blending to the cord grip
    const lc = p.lcord;
    const cx = CORD.x - p.cord * 0.16, cy = CORD.y - p.cord * 0.03, cz = CORD.z + p.cord * 0.12;
    const hx = TOP.x - 0.024 + (cx - 0.02 - TOP.x + 0.024) * lc + p.lx;
    const hy = TOP.y + 0.012 + (cy + 0.004 - TOP.y - 0.012) * lc + p.ly;
    const hz = TOP.z + 0.016 + (cz + 0.018 - TOP.z - 0.016) * lc + p.lz;
    const LH = mm(G, mm(T(hx, hy, hz), mm(RX(0.95 + p.lp), mm(RZ(Math.PI / 2 - 0.8 + p.lr), RY(p.lyw)))));
    if (p.lhide < 0.5) arm(sc, LH, -1, p.lc, p.lt, ELBOW_L);
    const RH = mm(G, mm(T(0.024 + p.rx, 0.016 + p.ry, 0.012 + p.rz), mm(RX(0.75 + p.rp), mm(RZ(-Math.PI / 2 + 0.15 + p.rr), RY(-0.1 + p.ryw)))));
    if (p.rhide < 0.5) arm(sc, RH, 1, p.rc, p.rt, ELBOW_R);
    void TX_EMIT;
  },
};
