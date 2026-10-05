// The seven Wardens. Each is its own Boss subclass (see ./base.ts for the fight framework).
import type { Run } from '../run';
import { Boss } from './base';
import { Smelter } from './smelter';
import { Curator } from './curator';
import { First } from './first';
import { Mother } from './mother';
import { Gardener } from './gardener';
import { General } from './general';
import { Handler } from './handler';

export const WARDEN_TITLES = ['THE SMELTER', 'THE CURATOR', 'THE FIRST', 'THE MOTHER', 'THE GARDENER', 'THE GENERAL', 'THE HANDLER'];
export const WARDEN_SUBTITLES = ['WARDEN OF THE FOUNDRY', 'WARDEN OF THE ARCHIVE', 'WARDEN OF THE CORE', 'WARDEN OF THE NURSERY', 'WARDEN OF THE CANOPY', 'WARDEN OF THE FRONT', 'IT WAS ALWAYS HERE'];

/** Kept for compatibility: every Warden is a Boss. */
export type Warden = Boss;

export function createWarden(id: number, x: number, z: number, run: Run, variant: number, hpScale: number): Boss {
  switch (variant) {
    case 1: return new Curator(id, x, z, run, hpScale);
    case 2: return new First(id, x, z, run, hpScale);
    case 3: return new Mother(id, x, z, run, hpScale);
    case 4: return new Gardener(id, x, z, run, hpScale);
    case 5: return new General(id, x, z, run, hpScale);
    case 6: return new Handler(id, x, z, run, hpScale);
    default: return new Smelter(id, x, z, run, hpScale);
  }
}
