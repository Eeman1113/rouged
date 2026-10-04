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
  warden: { type: 'warden', name: 'WARDEN', hp: C.WARDEN_HP, radius: 2.4, height: 6.5, headY: 5.4, headR: 0.8, speed: 3.2, flying: false, score: 5000, armorDrop: 50, staggerable: false },
};

export interface DifficultyDef { accuracy: number; reaction: number; hp: number; damage: number; awareness: number; xp: number }
export const DIFFICULTY: Record<Difficulty, DifficultyDef> = {
  easy: { accuracy: 0.5, reaction: 1.4, hp: 0.8, damage: 0.65, awareness: 0.8, xp: 0.8 },
  normal: { accuracy: C.ENEMY_ACCURACY, reaction: 1, hp: 1, damage: 1, awareness: 1, xp: 1 },
  hard: { accuracy: 0.72, reaction: 0.8, hp: 1.2, damage: 1.3, awareness: 1.2, xp: 1.3 },
  nightmare: { accuracy: 0.8, reaction: 0.6, hp: 1.5, damage: 1.6, awareness: 1.5, xp: 1.7 },
};
