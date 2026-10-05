// Sensitivity conversion. Both games turn a fixed angle per raw mouse count, so matching that angle
// gives the exact same cm/360 at any DPI (pointer lock reads raw counts via unadjustedMovement).

/** ROUGED: radians turned per mouse count at sensitivity 1 (see Input.consumeLook). */
export const ROUGED_RAD_PER_COUNT = 0.0022;
/** Valorant: 0.07° per count per sensitivity unit. */
export const VALORANT_DEG_PER_COUNT = 0.07;

export function valorantToRouged(valSens: number): number {
  return (valSens * VALORANT_DEG_PER_COUNT * Math.PI) / 180 / ROUGED_RAD_PER_COUNT;
}

export function rougedToValorant(sens: number): number {
  return (sens * ROUGED_RAD_PER_COUNT * 180) / Math.PI / VALORANT_DEG_PER_COUNT;
}

/** Distance in cm for one full 360° turn. */
export function cmPer360(rougedSens: number, dpi: number): number {
  const counts = (Math.PI * 2) / (ROUGED_RAD_PER_COUNT * rougedSens);
  return (counts / dpi) * 2.54;
}

/** Valorant's fixed 103° horizontal FOV (16:9) expressed as ROUGED's vertical FOV. */
export const VALORANT_VFOV = (2 * Math.atan(Math.tan((103 / 2) * (Math.PI / 180)) / (16 / 9)) * 180) / Math.PI; // ≈ 70.53
