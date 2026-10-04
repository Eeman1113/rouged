// Dev-only rig: shows gauntlets in several poses for tuning (vmtest weapon id 'handtest').
import { Rig, BASE_POSE, hand, T, R, mm } from './viewmodelRig';

export const handTestRig: Rig = {
  id: 'handtest',
  rest: { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, roll: 0 },
  def: { ...BASE_POSE },
  anims: {},
  build(sc, p) {
    const curls = [0, 0.5, 1, 1];
    curls.forEach((c, i) => {
      const x = -0.24 + i * 0.16;
      const th = i === 3 ? 1 : 0.4;
      sc.with(mm(T(x, 0.05, -0.6), R(Math.PI / 2 - 0.3 + p.gp, p.gyw, 0)), () => hand(sc, 1, c, th));
      sc.with(mm(T(x, -0.12, -0.6), R(Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3, 0)), () => hand(sc, i === 3 ? -1 : 1, c, th));
    });
  },
};
