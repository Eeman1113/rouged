import type { Difficulty, EnemyType } from './protocol';
import * as C from './constants';

export interface EnemyDef {
  type: EnemyType;
  name: string;
  hp: number;
  radius: number; // collision radius (m)
  height: number; // visual height (m)
  headY: number; // head center height above feet (m)
  headR: number; // head hitbox radius
  speed: number;
  flying: boolean;
  score: number;
  armorDrop: number; // armor dropped on death
  staggerable: boolean;
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  drone: { type: 'drone', name: 'DRONE', hp: C.DRONE_HP, radius: 0.45, height: 0.9, headY: 0.45, headR: 0.25, speed: 7, flying: true, score: 50, armorDrop: 0, staggerable: false },
  grunt: { type: 'grunt', name: 'GRUNT', hp: C.GRUNT_HP, radius: 0.5, height: 1.9, headY: 1.62, headR: 0.24, speed: 3.6, flying: false, score: 100, armorDrop: 0, staggerable: true },
  brute: { type: 'brute', name: 'BRUTE', hp: C.BRUTE_HP, radius: 1.0, height: 3.0, headY: 2.55, headR: 0.38, speed: 3.0, flying: false, score: 350, armorDrop: 25, staggerable: true },
  stalker: { type: 'stalker', name: 'STALKER', hp: C.STALKER_HP, radius: 0.45, height: 2.0, headY: 1.75, headR: 0.22, speed: 5.0, flying: false, score: 200, armorDrop: 0, staggerable: true },
  spider: { type: 'spider', name: 'SPIDER', hp: C.SPIDER_HP, radius: 0.7, height: 1.0, headY: 0.6, headR: 0.3, speed: 6.0, flying: false, score: 150, armorDrop: 0, staggerable: true },
  replica: { type: 'replica', name: 'REPLICA', hp: C.REPLICA_HP, radius: 0.45, height: 1.85, headY: 1.6, headR: 0.22, speed: 8.0, flying: false, score: 500, armorDrop: 15, staggerable: true },
  leech: { type: 'leech', name: 'LEECH', hp: C.LEECH_HP, radius: 0.45, height: 0.7, headY: 0.4, headR: 0.25, speed: 8.0, flying: false, score: 120, armorDrop: 0, staggerable: false },
  sentinel: { type: 'sentinel', name: 'SENTINEL', hp: C.SENTINEL_HP, radius: 0.8, height: 2.2, headY: 1.75, headR: 0.3, speed: 0, flying: false, score: 300, armorDrop: 10, staggerable: true },
  bomber: { type: 'bomber', name: 'BOMBER', hp: C.BOMBER_HP, radius: 0.5, height: 1.6, headY: 1.35, headR: 0.24, speed: 7.2, flying: false, score: 150, armorDrop: 0, staggerable: false },
  mortar: { type: 'mortar', name: 'MORTAR', hp: C.MORTAR_HP, radius: 0.9, height: 1.8, headY: 1.3, headR: 0.32, speed: 2.6, flying: false, score: 250, armorDrop: 0, staggerable: true },
  bulwark: { type: 'bulwark', name: 'BULWARK', hp: C.BULWARK_HP, radius: 0.9, height: 2.7, headY: 2.35, headR: 0.3, speed: 2.6, flying: false, score: 400, armorDrop: 20, staggerable: true },
  wraith: { type: 'wraith', name: 'WRAITH', hp: C.WRAITH_HP, radius: 0.55, height: 2.4, headY: 2.0, headR: 0.28, speed: 4.5, flying: false, score: 350, armorDrop: 0, staggerable: true },
  echo: { type: 'echo', name: 'ECHO', hp: 300, radius: 2.0, height: 6.5, headY: 3.9, headR: 0.9, speed: 0, flying: false, score: 150, armorDrop: 0, staggerable: false },
  warden: { type: 'warden', name: 'WARDEN', hp: C.WARDEN_HP, radius: 2.4, height: 6.5, headY: 5.4, headR: 0.8, speed: 3.2, flying: false, score: 5000, armorDrop: 50, staggerable: false },
};

export interface DifficultyDef { accuracy: number; reaction: number; hp: number; damage: number; awareness: number; xp: number }
export const DIFFICULTY: Record<Difficulty, DifficultyDef> = {
  easy: { accuracy: 0.5, reaction: 1.4, hp: 0.8, damage: 0.65, awareness: 0.8, xp: 0.8 },
  normal: { accuracy: C.ENEMY_ACCURACY, reaction: 1, hp: 1, damage: 1, awareness: 1, xp: 1 },
  hard: { accuracy: 0.72, reaction: 0.8, hp: 1.2, damage: 1.3, awareness: 1.2, xp: 1.3 },
  nightmare: { accuracy: 0.8, reaction: 0.6, hp: 1.5, damage: 1.6, awareness: 1.5, xp: 1.7 },
};
