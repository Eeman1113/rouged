import type { PlayerStats, Rarity } from './protocol';
import * as C from './constants';

export type PowerCategory = 'weapon' | 'movement' | 'passive' | 'onkill' | 'curse' | 'legendary';

export interface PowerupDef {
  id: string;
  name: string;
  category: PowerCategory;
  /** s = rarity scale (common .4, rare 1, epic 2) */
  desc: (s: number) => string;
  twist?: string; // extra effect granted at epic rarity
}

export const RARITY_SCALE: Record<Rarity, number> = { common: 0.4, rare: 1, epic: 2, legendary: 1 };
export const RARITY_COLOR: Record<Rarity, string> = { common: '#9a9a9a', rare: '#3b8cff', epic: '#b44cff', legendary: '#ffc83b' };
export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const POWERUPS: PowerupDef[] = [
  // ── weapon mods
  { id: 'overload', name: 'OVERLOAD', category: 'weapon', desc: (s) => `+${pct(0.15 * s)} fire rate`, twist: 'Shots ignore 10% of armor' },
  { id: 'piercer', name: 'PIERCER', category: 'weapon', desc: (s) => `Bullets pierce ${s >= 2 ? 2 : 1} enem${s >= 2 ? 'ies' : 'y'}` },
  { id: 'ricochet', name: 'RICOCHET', category: 'weapon', desc: (s) => `Hits ricochet to a nearby enemy for ${pct(0.5 * s)} damage` },
  { id: 'deadeye', name: 'DEADEYE', category: 'weapon', desc: (s) => `+${pct(0.2 * s)} headshot damage` },
  { id: 'pulse_amp', name: 'PULSE AMP', category: 'weapon', desc: (s) => `+${pct(0.25 * s)} PULSE damage. Rounds carry charge.` },
  // ── movement
  { id: 'airdash', name: 'AIR DASH', category: 'movement', desc: (s) => `+${s >= 2 ? 2 : 1} dash charge` },
  { id: 'dashtrail', name: 'DASH TRAIL', category: 'movement', desc: (s) => `Dashing leaves fire (${Math.round(25 * s)}/s)` },
  { id: 'doublejump', name: 'DOUBLE JUMP', category: 'movement', desc: (s) => (s >= 2 ? 'Jump twice more in the air' : 'Jump again in the air') },
  { id: 'wallrun', name: 'WALL RUN', category: 'movement', desc: (s) => `Run along walls for ${(0.8 + 0.6 * s).toFixed(1)}s` },
  { id: 'slideblade', name: 'SLIDE BLADE', category: 'movement', desc: (s) => `Sliding into enemies deals ${Math.round(60 * s)} damage` },
  { id: 'fleet', name: 'FLEET', category: 'movement', desc: (s) => `+${pct(0.1 * s)} move speed, +${pct(0.1 * s)} jump` },
  // ── passive
  { id: 'vitality', name: 'VITALITY', category: 'passive', desc: (s) => `+${Math.round(20 * s)} max HP` },
  { id: 'lifesteal', name: 'LIFESTEAL', category: 'passive', desc: (s) => `Heal ${pct(0.04 * s)} of damage dealt` },
  { id: 'streakshield', name: 'STREAK SHIELD', category: 'passive', desc: (s) => `Kill streaks grant ${Math.round(10 * s)} armor` },
  { id: 'scavenge', name: 'SCAVENGE', category: 'passive', desc: (s) => `+${pct(0.5 * s)} ammo regeneration` },
  { id: 'thorns', name: 'THORNS', category: 'passive', desc: (s) => `Reflect ${pct(0.25 * s)} of melee damage` },
  // ── on-kill
  { id: 'detonate', name: 'DETONATE', category: 'onkill', desc: (s) => `Killed enemies explode for ${Math.round(30 * s)} area damage` },
  { id: 'cryo', name: 'CRYO', category: 'onkill', desc: (s) => `Kills freeze nearby enemies for ${(1 + s).toFixed(1)}s` },
  { id: 'immolate', name: 'IMMOLATE', category: 'onkill', desc: (s) => `Kills ignite nearby enemies (${Math.round(12 * s)}/s)` },
  { id: 'chain', name: 'CHAIN', category: 'onkill', desc: (s) => `Kills mark enemies within ${Math.round(8 + 4 * s)}m. Marked take +15% and are visible through walls.` },
  // ── curses (high risk / high reward)
  { id: 'curse_glass', name: 'CURSE: GLASS', category: 'curse', desc: () => '+100% damage, -50% max HP' },
  { id: 'curse_starve', name: 'CURSE: STARVE', category: 'curse', desc: () => 'No health drops, +50% glory kill HP' },
  { id: 'curse_frenzy', name: 'CURSE: FRENZY', category: 'curse', desc: () => 'Enemies +30% speed, loot rarity +1 tier' },
  { id: 'curse_naked', name: 'CURSE: NAKED', category: 'curse', desc: () => 'No armor, +2 dash charges' },
  // ── legendary (changes how you play)
  { id: 'tesla', name: 'TESLA PROTOCOL', category: 'legendary', desc: () => 'Chain lightning arcs between marked enemies. Hits mark.' },
  { id: 'martyr', name: 'MARTYR ENGINE', category: 'legendary', desc: () => 'Damage taken heals nearby allies (or burns enemies, alone). You cannot self-heal.' },
  { id: 'executioner', name: 'EXECUTIONER', category: 'legendary', desc: () => 'Every 5th kill is an instant glory kill from any range' },
  { id: 'ghost', name: 'GHOST', category: 'legendary', desc: () => 'Become invisible for 1s after every kill' },
  { id: 'overclock', name: 'OVERCLOCK', category: 'legendary', desc: () => 'Fire rate doubles for 3s after each kill' },
];

export const POWERUP_BY_ID: Record<string, PowerupDef> = Object.fromEntries(POWERUPS.map((p) => [p.id, p]));

export interface SynergyDef { id: string; name: string; requires: string[][]; desc: string }
/** Hidden combos — never shown in the UI until discovered. Each requirement group is "any of". */
export const SYNERGIES: SynergyDef[] = [
  { id: 'tesla', name: 'TESLA PROTOCOL', requires: [['pulse_amp'], ['chain'], ['overload']], desc: 'Lightning arcs between all marked enemies' },
  { id: 'martyr', name: 'MARTYR ENGINE', requires: [['lifesteal'], ['thorns'], ['curse_glass', 'curse_starve', 'curse_frenzy', 'curse_naked']], desc: 'Damage taken heals allies' },
  { id: 'glass', name: 'GLASS CANNON', requires: [['curse_glass'], ['lifesteal']], desc: 'Massive damage, heal from kills only' },
  { id: 'blink', name: 'BLINK', requires: [['airdash'], ['dashtrail'], ['ghost']], desc: 'Teleport-dash, no cooldown' },
  { id: 'scavenger', name: 'SCAVENGER', requires: [['scavenge'], ['detonate'], ['lifesteal']], desc: 'Every kill drops ammo + HP' },
];

export function activeSynergies(ids: string[]): string[] {
  const set = new Set(ids);
  return SYNERGIES.filter((s) => s.requires.every((group) => group.some((g) => set.has(g)))).map((s) => s.id);
}

/** Everything a powerup loadout does. Client uses the PlayerStats half for physics/firing. */
export interface Mods extends PlayerStats {
  lifesteal: number;
  thorns: number;
  streakShield: number;
  detonate: number;
  cryo: number;
  immolate: number;
  chainRadius: number;
  ricochetDmg: number;
  pulseAmp: number;
  dashTrailDps: number;
  slideDmg: number;
  armorPierce: number;
  tesla: boolean;
  martyr: boolean;
  executioner: boolean;
  ghost: boolean;
  overclock: boolean;
  noArmor: boolean;
  noHealthDrops: boolean;
  gloryHealMult: number;
  frenzy: boolean;
  lootBonus: number;
  glassCannon: boolean;
  scavenger: boolean;
  wallRunTime: number;
  extraJumps: number;
}

export function baseMods(): Mods {
  return {
    speedMult: 1, jumpMult: 1, airControl: C.AIR_CONTROL, maxDash: C.DASH_CHARGES, dashCooldown: C.DASH_COOLDOWN,
    doubleJump: false, wallRun: false, slideDamage: false, dashTrail: false, blink: false,
    maxHp: C.PLAYER_HP, fireRateMult: 1, damageMult: 1, headshotMult: C.HEADSHOT_MULT, pierce: 0, ricochet: 0, ammoRegenMult: 1,
    lifesteal: 0, thorns: 0, streakShield: 0, detonate: 0, cryo: 0, immolate: 0, chainRadius: 0, ricochetDmg: 0,
    pulseAmp: 0, dashTrailDps: 0, slideDmg: 0, armorPierce: 0,
    tesla: false, martyr: false, executioner: false, ghost: false, overclock: false,
    noArmor: false, noHealthDrops: false, gloryHealMult: 1, frenzy: false, lootBonus: 0, glassCannon: false, scavenger: false,
    wallRunTime: 0, extraJumps: 0,
  };
}

export function computeMods(powerups: { id: string; rarity: Rarity }[], level = 1): Mods {
  const m = baseMods();
  // permanent meta-progression boosts: +2 max HP per level, +0.5% damage per level
  m.maxHp += Math.min(40, (level - 1) * 2);
  m.damageMult *= 1 + Math.min(0.2, (level - 1) * 0.005);
  for (const p of powerups) {
    const s = RARITY_SCALE[p.rarity];
    const epic = p.rarity === 'epic';
    switch (p.id) {
      case 'overload': m.fireRateMult *= 1 + 0.15 * s; if (epic) m.armorPierce += 0.1; break;
      case 'piercer': m.pierce += s >= 2 ? 2 : 1; break;
      case 'ricochet': m.ricochet += 1; m.ricochetDmg = Math.max(m.ricochetDmg, 0.5 * s); break;
      case 'deadeye': m.headshotMult += 0.2 * s * C.HEADSHOT_MULT; break;
      case 'pulse_amp': m.pulseAmp += 0.25 * s; break;
      case 'airdash': m.maxDash += s >= 2 ? 2 : 1; break;
      case 'dashtrail': m.dashTrail = true; m.dashTrailDps += 25 * s; break;
      case 'doublejump': m.doubleJump = true; m.extraJumps += s >= 2 ? 2 : 1; break;
      case 'wallrun': m.wallRun = true; m.wallRunTime = Math.max(m.wallRunTime, 0.8 + 0.6 * s); break;
      case 'slideblade': m.slideDamage = true; m.slideDmg += 60 * s; break;
      case 'fleet': m.speedMult *= 1 + 0.1 * s; m.jumpMult *= 1 + 0.1 * s; m.airControl = Math.min(1, m.airControl + 0.05 * s); break;
      case 'vitality': m.maxHp += 20 * s; break;
      case 'lifesteal': m.lifesteal += 0.04 * s; break;
      case 'streakshield': m.streakShield += 10 * s; break;
      case 'scavenge': m.ammoRegenMult += 0.5 * s; break;
      case 'thorns': m.thorns += 0.25 * s; break;
      case 'detonate': m.detonate += 30 * s; break;
      case 'cryo': m.cryo = Math.max(m.cryo, 1 + s); break;
      case 'immolate': m.immolate += 12 * s; break;
      case 'chain': m.chainRadius = Math.max(m.chainRadius, 8 + 4 * s); break;
      case 'curse_glass': m.damageMult *= 2; m.maxHp *= 0.5; break;
      case 'curse_starve': m.noHealthDrops = true; m.gloryHealMult *= 1.5; break;
      case 'curse_frenzy': m.frenzy = true; m.lootBonus += 1; break;
      case 'curse_naked': m.noArmor = true; m.maxDash += 2; break;
      case 'tesla': m.tesla = true; m.chainRadius = Math.max(m.chainRadius, 10); break;
      case 'martyr': m.martyr = true; break;
      case 'executioner': m.executioner = true; break;
      case 'ghost': m.ghost = true; break;
      case 'overclock': m.overclock = true; break;
    }
  }
  // synergies
  const syn = activeSynergies(powerups.map((p) => p.id));
  if (syn.includes('tesla')) { m.tesla = true; m.chainRadius = Math.max(m.chainRadius, 12); }
  if (syn.includes('martyr')) m.martyr = true;
  if (syn.includes('glass')) { m.glassCannon = true; m.damageMult *= 1.5; }
  if (syn.includes('blink')) { m.blink = true; m.dashCooldown = 0.25; }
  if (syn.includes('scavenger')) m.scavenger = true;
  m.maxHp = Math.round(Math.min(C.PLAYER_MAX_HP, Math.max(25, m.maxHp)));
  m.maxDash = Math.min(5, m.maxDash);
  return m;
}

export function statsFromMods(m: Mods): PlayerStats {
  return {
    speedMult: m.speedMult, jumpMult: m.jumpMult, airControl: m.airControl, maxDash: m.maxDash, dashCooldown: m.dashCooldown,
    doubleJump: m.doubleJump, wallRun: m.wallRun, slideDamage: m.slideDamage, dashTrail: m.dashTrail, blink: m.blink,
    maxHp: m.maxHp, fireRateMult: m.fireRateMult, damageMult: m.damageMult, headshotMult: m.headshotMult,
    pierce: m.pierce, ricochet: m.ricochet, ammoRegenMult: m.ammoRegenMult,
  };
}

/** extra fields the client needs for physics that aren't in PlayerStats */
export function physicsExtras(m: Mods): { extraJumps: number; wallRunTime: number } {
  return { extraJumps: m.extraJumps, wallRunTime: m.wallRunTime };
}
