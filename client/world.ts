// Shared rendering world: renderer + all views + local player + HUD. Used by the Hub and by runs.

import * as THREE from 'three';
import { SceneRenderer } from './render/scene';
import { MapView } from './render/map';
import { EntityViews } from './render/entities';
import { Gore } from './render/gore';
import { Effects } from './render/effects';
import { Hud } from './hud/hud';
import { Input } from './input';
import { LocalPlayer } from './prediction';
import { HandlerVoice } from './audio/handler';
import { VoiceCast, Speaker } from './audio/voices';
import { audio } from './audio/engine';
import { sfx } from './audio/sfx';
import { lightFor, RoomGeo, solidsFor } from '../shared/mapData';
import type { Meta } from './meta';
import { handlerLine, HandlerContext } from './story/handlerLines';
import { BIOME_NAMES } from '../shared/mapData';

export class World {
  r: SceneRenderer;
  map: MapView;
  ents: EntityViews;
  gore: Gore;
  fx: Effects;
  hud: Hud;
  input: Input;
  player = new LocalPlayer();
  voice: HandlerVoice;
  cast = new VoiceCast();
  geo: RoomGeo | null = null;
  timeScale = 1;
  slowT = 0;
  slowScale = 1;
  fadeEl = document.getElementById('fx-fade')!;
  tintEl = document.getElementById('fx-tint')!;
  vignetteEl = document.getElementById('fx-vignette')!;
  flashEl = document.getElementById('fx-flash')!;
  glitchEl = document.getElementById('fx-glitch')!;
  private flashV = 0;
  private vignV = 0;
  private glitchV = 0;
  private tintV = 0;
  lowHpPulse = 0;
  private lastLine = new Map<string, number>();
  meta!: Meta;
  shakeMult = 1;
  fovBase = 95;
  lookLockT = 0;
  lookTarget: THREE.Vector3 | null = null;
  wardenName = 'WARDEN';
  depth = 1;
  /** silence mutator: the Handler is cut off */
  muteHandler = false;

  constructor() {
    const gl = document.getElementById('gl') as HTMLCanvasElement;
    const hud2d = document.getElementById('hud2d') as HTMLCanvasElement;
    this.r = new SceneRenderer(gl);
    this.map = new MapView(this.r.scene);
    this.ents = new EntityViews(this.r.scene);
    this.gore = new Gore(this.r.scene);
    this.fx = new Effects(this.r.scene);
    this.hud = new Hud(document.getElementById('hud')!, hud2d);
    this.input = new Input(gl, document.getElementById('touch')!);
    this.hud.resize(this.r.width, this.r.height);
    window.addEventListener('resize', () => this.hud.resize(this.r.width, this.r.height));
    this.voice = new HandlerVoice(
      (text, glitch) => this.hud.handlerSay(text, glitch),
      (dur) => { sfx.staticBurst(dur); this.glitch(0.8); },
    );
    this.cast.handler = this.voice;
    const LABEL: Record<Speaker, string> = { announcer: 'ANNOUNCER', broker: 'THE BROKER', mara: 'MARA', warden: 'WARDEN', enemy: '???', system: 'SYSTEM', directorate: 'DIRECTORATE' };
    this.cast.onSubtitle = (sp, text) => { if (sp !== 'announcer' && sp !== 'enemy') this.hud.handlerSay(text, 0, sp === 'warden' ? this.wardenName : LABEL[sp]); };
  }

  applySettings(m: Meta) {
    this.meta = m;
    const s = m.settings;
    this.input.sensitivity = s.sensitivity;
    this.input.invertY = s.invertY;
    this.input.padSens = s.padSens;
    this.input.sprintToggle = s.sprintToggle;
    this.input.gyroMode = s.gyro;
    this.input.gyroSens = s.gyroSens;
    audio.setVolume(s.master, s.music, s.sfx);
    this.voice.setEnabled(s.voice);
    this.cast.enabled = s.voice;
    this.fovBase = s.fov;
    this.shakeMult = s.shake;
    if (s.quality !== this.r.quality) {
      this.r.quality = s.quality;
      this.r.internalHeight = s.quality === 'low' ? 300 : matchMedia('(pointer: coarse)').matches ? 360 : 480;
      this.r.bloom.enabled = s.quality !== 'low';
      this.r.resize();
      this.hud.resize(this.r.width, this.r.height);
    }
  }

  loadGeo(geo: RoomGeo, opts: Parameters<MapView['build']>[1]) {
    this.geo = geo;
    this.map.build(geo, opts);
    this.ents.clearRoom();
    this.ents.lights = geo.lights;
    this.ents.ambient = geo.desc.kind === 'hub' ? 0.6 : geo.ambient;
    this.gore.clear();
    this.fx.clear();
    this.gore.boxes = solidsFor(geo, null);
    this.player.boxes = solidsFor(geo, new Set());
    const L = lightFor(geo.desc.kind, geo.desc.biome);
    const fogColor = geo.desc.kind === 'anomaly' ? 0x041208 : geo.desc.mutator === 'bloodmoon' ? 0x1a0202 : geo.desc.mutator === 'darkness' ? 0x000000 : L.fog;
    this.r.setFog(fogColor, geo.fog);
    this.r.setAmbient(L.ambient, 0x080404, geo.desc.kind === 'hub' ? 1.1 : geo.desc.mutator === 'darkness' ? 0.25 : 0.85);
    this.ents.ambient *= geo.desc.mutator === 'darkness' ? 0.35 : 1;
  }

  setOpenDoors(open: Set<number>) {
    if (!this.geo) return;
    this.player.boxes = solidsFor(this.geo, open);
    this.gore.boxes = this.player.boxes;
  }

  // ───────────────────────────── screen fx ─────────────────────────────

  fade(on: boolean) { this.fadeEl.classList.toggle('on', on); }
  flash(v: number) { this.flashV = Math.max(this.flashV, v); }
  hurtVignette(v: number) { this.vignV = Math.max(this.vignV, v); }
  glitch(v: number) { this.glitchV = Math.max(this.glitchV, v); }
  tint(color: string, v: number) { this.tintEl.style.background = color; this.tintV = Math.max(this.tintV, v); }
  shake(px: number) { this.r.shake(px * this.shakeMult); }
  slowmo(duration: number, scale: number) { this.slowT = Math.max(this.slowT, duration); this.slowScale = Math.min(this.slowScale, scale); }

  updateFx(dt: number) {
    if (this.slowT > 0) {
      this.slowT -= dt;
      this.timeScale = this.slowScale;
      if (this.slowT <= 0) { this.timeScale = 1; this.slowScale = 1; }
    }
    audio.setTimeScale(this.timeScale);
    this.cast.update();
    this.flashV *= Math.max(0, 1 - dt * 9);
    this.vignV *= Math.max(0, 1 - dt * 3);
    this.glitchV *= Math.max(0, 1 - dt * 4);
    this.tintV *= Math.max(0, 1 - dt * 1.2);
    const low = this.lowHpPulse > 0 ? (0.25 + Math.sin(performance.now() / 160) * 0.12) * this.lowHpPulse : 0;
    this.flashEl.style.opacity = this.flashV.toFixed(3);
    this.vignetteEl.style.opacity = Math.min(1, this.vignV + low).toFixed(3);
    this.glitchEl.style.opacity = this.glitchV.toFixed(3);
    this.tintEl.style.opacity = Math.min(0.75, this.tintV).toFixed(3);
  }

  // ───────────────────────────── camera ─────────────────────────────

  updateCamera(dt: number, speed: number) {
    const p = this.player;
    const cam = this.r.camera;
    if (this.lookLockT > 0 && this.lookTarget) {
      this.lookLockT -= dt;
      const dx = this.lookTarget.x - p.x, dz = this.lookTarget.z - p.z, dy = this.lookTarget.y - (p.y + p.eyeY);
      const wantYaw = Math.atan2(-dx, -dz);
      const wantPitch = Math.atan2(dy, Math.hypot(dx, dz));
      let d = wantYaw - p.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      p.yaw += d * Math.min(1, dt * 14);
      p.pitch += (wantPitch - p.pitch) * Math.min(1, dt * 14);
    }
    void speed; // speed-based FOV now lives in LocalPlayer.fovAdd (springs)
    // motion comfort: the screen-shake setting also scales head bob / sway (0 = none)
    const mk = Math.max(0, Math.min(1, this.shakeMult));
    const rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    const sway = p.bobX * mk;
    cam.position.set(
      p.x + rx * sway,
      p.y + p.eyeY + p.stepOff - p.landDip + p.bobY * mk,
      p.z + rz * sway,
    );
    const pitch = Math.max(-1.55, Math.min(1.55, p.pitch + p.pitchOff * Math.max(0.35, mk)));
    cam.rotation.set(pitch + this.r.shakeY, p.yaw + this.r.shakeX, p.roll * Math.max(0.35, mk) + p.bobRoll * mk);
    const targetFov = Math.max(40, Math.min(150, this.fovBase + p.fovAdd));
    // springs already smooth the motion FOV; this only eases settings changes / big jumps
    cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-dt * 30));
    // vertical fov from horizontal-ish setting: treat setting as vertical-at-4:3
    cam.updateProjectionMatrix();
    audio.setListener({ x: cam.position.x, y: cam.position.y, z: cam.position.z }, p.yaw);
  }

  /** Handler line with per-context cooldown. */
  say(ctx: HandlerContext, runCount: number, priority = 1, cooldown = 6, biome?: number) {
    const now = performance.now() / 1000;
    const last = this.lastLine.get(ctx) ?? -99;
    if (now - last < cooldown) return;
    if (this.muteHandler && priority < 4) return;
    const line = handlerLine(ctx, runCount, { name: this.meta?.name ?? 'CANDIDATE', run: runCount + 1, biome: biome !== undefined ? BIOME_NAMES[biome] : undefined, depth: this.depth });
    if (!line) return;
    this.lastLine.set(ctx, now);
    this.voice.say(line, { runCount, priority });
  }

  render() { this.r.render(); }
}
