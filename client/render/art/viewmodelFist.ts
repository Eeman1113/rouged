// Shared GLORY KILL: the off-hand gauntlet. 0.00 the fist cocks in low-left close to the lens,
// 0.18 drives forward toward the crosshair (punch), 0.34 impact hold — fingers open and bite,
// 0.46 clench on a sparking core, 0.55 rip it back toward the camera, palm turning to show it,
// 0.85 drop away off the bottom-left. The gun dips out of the way at runtime.
import { Scene, mat, TX_EMIT } from './viewmodel3d';
import { hand, forearm, T, R, mm } from './viewmodelRig';
import { sampleTrack, E, k } from './viewmodelAnim';

const X = k(0, -0.3, 0.18, -0.24, E.out, 0.3, -0.04, E.in3, 0.46, -0.04, 0.62, -0.14, E.out, 0.85, -0.16, 1, -0.4, E.in);
const Y = k(0, -0.32, 0.18, -0.2, E.out, 0.3, -0.04, E.in3, 0.46, -0.045, 0.62, -0.13, E.out, 0.85, -0.15, 1, -0.45, E.in);
const Z = k(0, -0.28, 0.18, -0.3, E.antic, 0.3, -0.62, E.in3, 0.46, -0.6, 0.62, -0.36, E.out, 0.85, -0.38, 1, -0.3, E.in);
const ROLL = k(0, -0.5, 0.3, -0.25, 0.46, -0.25, 0.7, 1.2, E.io, 1, 1.3);
const PITCH = k(0, 0.2, 0.3, 0.05, 0.46, 0.05, 0.7, 0.45, E.io, 1, 0.6);
const CURL = k(0, 1, 0.32, 1, 0.37, 0.25, E.out, 0.44, 0.25, 0.48, 0.85, E.in, 1, 0.85);
const ELBOW: [number, number, number] = [-0.6, -0.4, -0.2];

export function buildFist(sc: Scene, u: number): void {
  const s = (tr: ReturnType<typeof k>): number => sampleTrack(tr, u);
  const xf = mm(T(s(X), s(Y), s(Z)), R(s(PITCH), -0.55, s(ROLL)));
  sc.with(xf, () => {
    sc.group(91, () => { hand(sc, -1, s(CURL), 0.9, { big: 1.25 }); forearm(sc, ELBOW, 1.25); });
    if (u > 0.44) {
      // the ripped-out core, clenched in the fingers
      sc.group(95, () => {
        sc.sph(0, -0.03, -0.035, 0.024, 0.022, 0.024, mat(0xff5a20, { emit: true, noLine: true, tex: (x, y) => (x < -0.006 && y > 0.004 ? 0xfff0c0 : x > 0.01 ? 0xa01810 : 0xff8a30) | TX_EMIT }));
        sc.point('core', 0, -0.03, -0.035);
      });
    }
    sc.point('knuckle', 0, 0, -0.04);
  });
}
