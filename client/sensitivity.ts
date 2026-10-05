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

/** The 'preset' field tells the settings UI which chip to highlight AND how
 *  to decide, at save time, whether the user has overridden the preset to a
 *  'custom' value. 'valorant' is tracked separately so the badge sticks even
 *  after a re-open — it's the Valorant import path, not a manual tweak. */
export type SensPreset = 'noob' | 'pro' | 'godkiller' | 'custom' | 'valorant';

/** Target cm/360 at 800 DPI (the de-facto standard for aim training). From
 *  there sens is derived — same preset gives the same cm/360 at any DPI. */
const PRESET_CM_PER_360: Record<Exclude<SensPreset, 'custom' | 'valorant'>, number> = {
  noob:      45,  // slow, deliberate — safer learning speed
  pro:       22,  // competitive FPS pro range (CS2 / Valorant pros avg 25)
  godkiller:  8,  // flick-shot territory (DOOM/Quake speedrunners)
};

/** Reference DPI for every preset. We quote cm/360 at this DPI, then solve
 *  back to ROUGED's unitless sens — which stays the same across any DPI the
 *  player's mouse happens to be set to. */
export const PRESET_REFERENCE_DPI = 800;

/** Invert cmPer360() → ROUGED sens that gives `cm` at `dpi`. */
export function sensFromCmPer360(cm: number, dpi = PRESET_REFERENCE_DPI): number {
  // cm = (2π · 2.54) / (RAD_PER_COUNT · sens · dpi)
  return (Math.PI * 2 * 2.54) / (ROUGED_RAD_PER_COUNT * dpi * cm);
}

export const PRESET_SENS: Record<keyof typeof PRESET_CM_PER_360, number> = {
  noob:      sensFromCmPer360(PRESET_CM_PER_360.noob),
  pro:       sensFromCmPer360(PRESET_CM_PER_360.pro),
  godkiller: sensFromCmPer360(PRESET_CM_PER_360.godkiller),
};

export const PRESET_LABELS: Record<SensPreset, string> = {
  noob:      'NOOB · 45 CM/360',
  pro:       'PRO · 22 CM/360',
  godkiller: 'GOD KILLER · 8 CM/360',
  custom:    'CUSTOM',
  valorant:  'VALORANT IMPORT',
};

/** Legacy default — anyone whose saved sens is exactly this value hasn't
 *  touched the slider since the pre-presets build, so we migrate them to
 *  the new default (noob) instead of pinning them to an uncomfortable 9cm. */
export const LEGACY_DEFAULT_SENS = 1;

/** Classifies a saved sens against the three preset targets so we can show
 *  the right chip on a re-open even when the saved file predates presets. */
export function classifySens(sens: number): SensPreset {
  // Compare on the sens itself (small floats) with a loose epsilon so a
  // save-reload round-trip through JSON doesn't knock the chip off.
  const eq = (a: number, b: number) => Math.abs(a - b) < 1e-4;
  if (eq(sens, PRESET_SENS.noob))      return 'noob';
  if (eq(sens, PRESET_SENS.pro))       return 'pro';
  if (eq(sens, PRESET_SENS.godkiller)) return 'godkiller';
  return 'custom';
}
