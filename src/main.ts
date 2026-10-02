// ROUGED — entry point
import { Game } from './game';

const game = new Game();
game.init();
(window as any).__rouged = game; // debug/testing handle
