// The Hub: the starting room. It changes every death. The Handler comments on none of it.

import type { RoomDesc } from '../shared/protocol';
import { generateRoom } from '../shared/mapData';
import { hashString } from '../shared/rng';
import type { World } from './world';
import type { Meta } from './meta';
import { hubState, HubState, terminalText } from './story/fragments';
import { music } from './audio/music';
import { sfx, LoopHandle } from './audio/sfx';

export class Hub {
  state: HubState;
  noteEl: HTMLDivElement;
  ambience: LoopHandle | null = null;
  idleT = 25;
  deployed = false;
  terminal = { x: 0, z: 0 };
  mirror = { x: 0, z: 0 };
  paused = false;

  constructor(public world: World, public meta: Meta, public cb: { onDeploy(): void; onTerminal(lines: string[]): void }, quiet = false) {
    const rc = meta.runCount;
    let s = hashString('hub' + rc);
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    this.state = hubState(rc, rnd);
    const desc: RoomDesc = { index: 0, biome: 0, kind: 'hub', door: 'standard', seed: hashString('hub') };
    const geo = generateRoom(desc);
    world.loadGeo(geo, {
      runCount: rc, tally: this.state.tally, bodyVariant: this.state.bodyVariant, showBody: this.state.showBody,
      showMirror: this.state.showMirror, extraBodies: this.state.extraBodies, flicker: this.state.lightFlicker,
    });
    world.map.setDoorOpen(0, true);
    world.map.showDoorLabels(true);
    world.setOpenDoors(new Set([0]));
    const sp = geo.playerSpawns[0];
    world.player.teleport(0, 0, geo.d / 2 - 2.2, 0);
    void sp;
    const term = geo.decor.find((d) => d.kind === 'terminal')!;
    this.terminal = { x: term.x + term.nx * 1.2, z: term.z + term.nz * 1.2 };
    const mir = geo.decor.find((d) => d.kind === 'mirror')!;
    this.mirror = { x: mir.x + mir.nx * 1.2, z: mir.z + mir.nz * 1.2 };
    world.hud.show(false);
    world.hud.hubMode(true);
    music.setBiome('hub');
    music.start();
    music.resume();
    music.setLayers({ combat: false, aggression: false, rampage: false, boss: false });
    if (!quiet) this.ambience = sfx.hubAmbience();
    this.noteEl = document.createElement('div');
    this.noteEl.className = 'hub-note';
    this.noteEl.textContent = this.state.changeNote;
    document.getElementById('screens')!.appendChild(this.noteEl);
    if (!quiet) setTimeout(() => this.noteEl.classList.add('on'), 1200);
    setTimeout(() => this.noteEl.classList.remove('on'), 9000);
    if (rc === 0 && !quiet) setTimeout(() => world.say('hubIdle', rc, 2, 0), 2500);
  }

  update(dt: number) {
    const w = this.world;
    const inp = w.input;
    const lp = w.player;
    if (!this.paused) {
      const look = inp.consumeLook();
      lp.yaw -= look.dx;
      lp.pitch = Math.max(-1.45, Math.min(1.45, lp.pitch - look.dy));
      const ax = inp.axes();
      const sp = inp.sprintInput();
      const ev = lp.update(dt, { fwd: ax.fwd, right: ax.right, jump: inp.held.has('jump'), dash: inp.pressed.has('dash'), crouch: inp.held.has('slide'), sprint: sp.hold, sprintToggle: sp.toggle }, 1);
      if (ev.footstep) sfx.footstep();
      if (ev.jumped) sfx.jump();
      if (ev.dashed) sfx.dash();
      if (ev.landed || ev.mantled) sfx.land(false);
    } else inp.consumeLook();

    // prompts
    const h = w.hud;
    let prompt: string | null = null;
    const dt2 = Math.hypot(this.terminal.x - lp.x, this.terminal.z - lp.z);
    if (dt2 < 2) {
      prompt = inp.touchMode ? 'USE · TERMINAL' : '[E] TERMINAL';
      if (inp.pressed.has('use')) { sfx.terminalBeep(); this.cb.onTerminal(terminalText(this.meta.runCount, Math.random)); }
    }
    h.prompt(prompt);
    // the door: walk through to deploy
    if (!this.deployed && lp.z < -w.geo!.d / 2 - 0.4) {
      this.deployed = true;
      sfx.doorOpen();
      this.cb.onDeploy();
    }
    this.idleT -= dt;
    if (this.idleT <= 0) { this.idleT = 40 + Math.random() * 30; w.say('hubIdle', this.meta.runCount, 1, 30); }

    w.map.update(dt);
    w.ents.update(dt, lp.yaw, w.r.camera.position, false);
    w.gore.update(dt, lp.yaw);
    w.fx.update(dt);
    w.r.update(dt);
    w.updateFx(dt);
    w.updateCamera(dt, Math.hypot(lp.s.vx, lp.s.vz));
    w.render();
    inp.endFrame();
  }

  dispose() {
    this.ambience?.stop();
    this.noteEl.remove();
    this.world.hud.prompt(null);
    this.world.hud.hubMode(false);
  }
}
