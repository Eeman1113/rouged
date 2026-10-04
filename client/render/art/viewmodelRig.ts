// Shared viewmodel rig pieces: palette, armored gauntlets + forearms, gun transform, Rig type.
import { Scene, M, T, R, RX, RY, RZ, S, mm, mat, Mat, FC_SIDE, FX_PY, TX_FLAT } from './viewmodel3d';
import type { Anim, Pose } from './viewmodelAnim';
import { lit } from './core';

export const ARMOR = 0x4e5e48, ARMOR2 = 0x646c62, GLOVE = 0x3c4438, KNUCK = 0x8a9288;

export const M_ARMOR = mat(ARMOR, { spec: 0.4, bias: -0.12 });
export const M_ARMOR2 = mat(ARMOR2, { spec: 0.6, bias: -0.08 });
export const M_GLOVE = mat(GLOVE, { bias: 0.05 });
export const M_KNUCK = mat(KNUCK, { spec: 1 });
/** back-of-hand plates: centre ridge, rivets */
const M_PLATE = mat(ARMOR, {
  spec: 0.5, bias: -0.1,
  tex: (X, Y, Z, f) => {
    if (f !== FX_PY) return -1;
    if (Math.abs(X) < 0.0035) return lit(ARMOR, 0.35);
    if (Math.abs(X) < 0.006) return lit(ARMOR, -0.5) | TX_FLAT;
    if (Math.abs(Math.abs(X) - 0.027) < 0.004 && Math.abs(Z - 0.012) < 0.004) return KNUCK;
    void Y; return -1;
  },
});
const M_PLATE2 = mat(ARMOR2, {
  spec: 0.6, bias: -0.15,
  tex: (X, _Y, _Z, f) => (f === FX_PY && Math.abs(X) < 0.003 ? lit(ARMOR2, 0.4) : -1),
});
/** segmented bracer: dark gaps + rivets, local Z along the forearm */
const M_BRACER = mat(0x46523f, {
  spec: 0.4,
  bias: -0.28,
  tex: (X, Y, Z, f) => {
    if (f !== FC_SIDE) return -1;
    const zz = ((Z % 0.045) + 0.045) % 0.045;
    if (zz < 0.006) return lit(GLOVE, -0.45) | TX_FLAT;
    if (zz < 0.011) return GLOVE;
    const a = Math.atan2(Y, X);
    if (zz > 0.02 && zz < 0.026 && Math.abs(((a * 3) % (Math.PI * 2)) - 2.4) < 0.25) return KNUCK;
    return -1;
  },
});

export interface Rest { x: number; y: number; z: number; pitch: number; yaw: number; roll: number }
export interface Rig {
  id: string;
  rest: Rest;
  /** default channel values */
  def: Pose;
  anims: Record<string, Anim>;
  build(sc: Scene, p: Pose): void;
}

/** Common channels every gun rig understands. */
export const BASE_POSE: Pose = {
  gx: 0, gy: 0, gz: 0, gp: 0, gyw: 0, gr: 0,
  lx: 0, ly: 0, lz: 0, lp: 0, lyw: 0, lr: 0, lc: 1, lt: 0.6, lhide: 0,
  rx: 0, ry: 0, rz: 0, rp: 0, ryw: 0, rr: 0, rc: 1, rt: 0.6, rhide: 0,
};

/** Gun transform in camera space (rest pose + animated offsets, rotation about the grip). */
export function gunXf(rest: Rest, p: Pose): M {
  return mm(T(rest.x + p.gx, rest.y + p.gy, rest.z + p.gz), R(rest.pitch + p.gp, rest.yaw + p.gyw, rest.roll + p.gr));
}

const FINGERS: [number, number, number][] = [
  [0.034, 0.024, 0.02],
  [0.038, 0.026, 0.021],
  [0.035, 0.024, 0.02],
  [0.029, 0.02, 0.017],
];

/**
 * Armored gauntlet at the current transform. Hand frame: origin = middle of the knuckle line,
 * -z toward the fingers, +y = back of the hand, palm toward -y, thumb on -x (mirror with side=-1
 * for the left hand). curl 0 = flat open hand, 1 = tight fist. thumb 0 = alongside, 1 = across.
 */
export function hand(sc: Scene, side: 1 | -1, curl: number, thumb: number, opts: { spread?: number; fist?: boolean; big?: number } = {}): void {
  const s = opts.big ?? 1;
  sc.push(S(side * s, s, s));
  // palm + layered back plates
  sc.box(0, -0.002, 0.044, 0.042, 0.015, 0.044, M_GLOVE, undefined, 0.006);
  sc.box(0, 0.015, 0.058, 0.036, 0.007, 0.026, M_PLATE, RX(0.1), 0.006);
  sc.box(0, 0.017, 0.026, 0.04, 0.007, 0.014, M_PLATE2, RX(-0.05), 0.005);
  sc.box(0, 0.013, 0.004, 0.044, 0.006, 0.008, M_ARMOR, undefined, 0.004);
  // wrist cuff
  sc.cyl(0, 0, 0.094, 0.036, 0.016, M_ARMOR, undefined, 0.15, 0.03);
  const ang = [1.45, 1.55, 1.15];
  for (let i = 0; i < 4; i++) {
    const fx = -0.031 + i * 0.0205;
    const L = FINGERS[i];
    const spread = (opts.spread ?? 0) * (i - 1.5) * 0.12;
    sc.push(mm(T(fx, -0.002, 0), RY(-spread)));
    sc.sph(0, 0.021, 0.002, 0.0085, 0.0075, 0.0085, M_KNUCK);
    for (let j = 0; j < 3; j++) {
      const a = curl * ang[j] * (i === 3 ? 1.08 : 1);
      sc.push(RX(-a));
      const r = 0.0105 - j * 0.0012;
      sc.cyl(0, 0, -L[j] / 2, r, L[j] / 2 + 0.003, M_GLOVE, undefined, 0, r * 0.95);
      if (j === 0) sc.box(0, r * 0.75, -L[j] / 2, r * 0.9, 0.0035, L[j] / 2 - 0.002, M_ARMOR2, undefined, 0.002);
      if (j === 2) sc.sph(0, 0, -L[j], r, r, r * 1.1, M_GLOVE);
      sc.push(T(0, 0, -L[j]));
    }
    for (let j = 0; j < 3; j++) { sc.pop(); sc.pop(); }
    sc.pop();
  }
  // thumb
  sc.push(mm(T(-0.04, -0.008, 0.052), mm(RY(0.55 - thumb * 1.05), RX(-0.35 - thumb * 0.4))));
  sc.cyl(0, 0, -0.018, 0.013, 0.02, M_GLOVE);
  sc.box(0, 0.009, -0.018, 0.011, 0.004, 0.016, M_ARMOR2, undefined, 0.002);
  sc.push(mm(T(0, 0, -0.036), RX(-0.2 - thumb * 0.6)));
  sc.cyl(0, 0, -0.014, 0.0115, 0.016, M_GLOVE);
  sc.sph(0, 0, -0.028, 0.0112, 0.0112, 0.012, M_GLOVE);
  sc.pop();
  sc.pop();
  sc.pop();
}

/** Forearm from the current transform's wrist point (hand frame +z ~0.1) to an elbow in camera space. */
export function forearm(sc: Scene, elbow: [number, number, number], big = 1): void {
  const w = sc.world(0, 0, 0.1 * big);
  const w2 = sc.world(0, 0, 0.13 * big);
  // direction from wrist toward elbow
  sc.root(() => {
    sc.seg(w[0], w[1], w[2], elbow[0], elbow[1], elbow[2], 0.038 * big, M_BRACER, 0.062 * big);
    sc.seg(w2[0], w2[1], w2[2], w2[0] + (elbow[0] - w2[0]) * 0.18, w2[1] + (elbow[1] - w2[1]) * 0.18, w2[2] + (elbow[2] - w2[2]) * 0.18, 0.045 * big, M_ARMOR2, 0.05 * big);
  });
}

/** Hand + forearm placed with a full local transform. */
export function arm(sc: Scene, xf: M, side: 1 | -1, curl: number, thumb: number, elbow: [number, number, number], opts: { spread?: number; big?: number } = {}): void {
  sc.with(xf, () => {
    sc.group(side > 0 ? 90 : 91, () => {
      hand(sc, side, curl, thumb, opts);
      forearm(sc, elbow, opts.big ?? 1);
    });
  });
}

export { T, R, RX, RY, RZ, S, mm, mat };
export type { Mat, M, Pose };
