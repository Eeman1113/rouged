// The Face HUD: your scanned mind. Mirrors health, damage, and streaks. It ages across runs.
import { getFace, FaceState } from '../render/sprites';

export class FaceHud {
  private hurtT = 0;
  private grinT = 0;
  private lookT = 0;
  private look: 'look_left' | 'look_right' | null = null;
  private frameT = 0;
  frame = 0;
  dead = false;
  age = 0;

  hurt(fromLeft: boolean | null) {
    this.hurtT = 0.35;
    if (fromLeft !== null) { this.look = fromLeft ? 'look_left' : 'look_right'; this.lookT = 0.6; }
  }
  grin(t = 1.2) { this.grinT = Math.max(this.grinT, t); }

  update(dt: number) {
    this.hurtT -= dt; this.grinT -= dt; this.lookT -= dt;
    this.frameT += dt;
    if (this.frameT > 0.18) { this.frameT = 0; this.frame++; }
    if (Math.random() < dt * 0.4) this.lookT = 0.4, this.look = Math.random() < 0.5 ? 'look_left' : 'look_right';
  }

  canvas(hpFrac: number): HTMLCanvasElement {
    let s: FaceState;
    if (this.dead) s = 'dead';
    else if (this.hurtT > 0) s = 'ouch';
    else if (this.grinT > 0) s = 'grin';
    else if (hpFrac < 0.2) s = 'critical';
    else if (hpFrac < 0.45) s = 'damaged';
    else if (hpFrac < 0.75) s = 'hurt';
    else if (this.lookT > 0 && this.look) s = this.look;
    else s = 'healthy';
    return getFace(s, this.age, this.frame);
  }
}
