// Renderer: low internal resolution (480p) upscaled nearest-neighbor, aggressive bloom, heavy fog.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import * as C from '../../shared/constants';

export class SceneRenderer {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  width = 640;
  height = 480;
  baseFov = 90;
  shakeAmt = 0;
  shakeX = 0;
  shakeY = 0;
  /** dynamic light pool (fixed count to avoid shader recompiles) */
  dyn: { light: THREE.PointLight; life: number; max: number; base: number }[] = [];
  ambient: THREE.HemisphereLight;
  internalHeight: number = C.INTERNAL_HEIGHT;
  quality: 'high' | 'low' = 'high';

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, 4 / 3, 0.05, 220);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);
    this.scene.fog = new THREE.FogExp2(0x000000, 0.035);
    this.scene.background = new THREE.Color(0x000000);
    this.ambient = new THREE.HemisphereLight(0x8a7a6a, 0x201510, 0.9);
    this.scene.add(this.ambient);
    for (let i = 0; i < 4; i++) {
      const l = new THREE.PointLight(0xffaa55, 0, 12, 1.6);
      l.position.set(0, -100, 0);
      this.scene.add(l);
      this.dyn.push({ light: l, life: 0, max: 1, base: 0 });
    }
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(320, 240), 0.85, 0.45, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    if (matchMedia('(pointer: coarse)').matches) { this.internalHeight = 360; }
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.height = this.internalHeight;
    this.width = Math.round(this.height * aspect);
    this.renderer.setSize(this.width, this.height, false);
    this.composer.setSize(this.width, this.height);
    this.bloom.resolution.set(this.width / 2, this.height / 2);
    this.camera.aspect = aspect;
    // keep a consistent horizontal FOV feel on wide screens
    this.camera.updateProjectionMatrix();
  }

  setFog(color: number, density: number) {
    const f = this.scene.fog as THREE.FogExp2;
    f.color.setHex(color);
    f.density = density;
    (this.scene.background as THREE.Color).setHex(color);
  }

  setAmbient(sky: number, ground: number, intensity: number) {
    this.ambient.color.setHex(sky);
    this.ambient.groundColor.setHex(ground);
    this.ambient.intensity = intensity;
  }

  flashLight(x: number, y: number, z: number, color: number, intensity: number, range: number, life: number) {
    let slot = this.dyn[0];
    for (const d of this.dyn) if (d.life <= 0) { slot = d; break; } else if (d.life < slot.life) slot = d;
    slot.light.position.set(x, y, z);
    slot.light.color.setHex(color);
    slot.light.distance = range;
    slot.base = intensity;
    slot.light.intensity = intensity;
    slot.life = life; slot.max = life;
  }

  shake(px: number) {
    this.shakeAmt = Math.max(this.shakeAmt, px);
  }

  update(dt: number) {
    for (const d of this.dyn) {
      if (d.life > 0) {
        d.life -= dt;
        d.light.intensity = d.life > 0 ? d.base * (d.life / d.max) : 0;
      }
    }
    if (this.shakeAmt > 0.01) {
      // convert internal px to radians roughly
      const r = (this.shakeAmt / this.height) * (this.camera.fov * Math.PI / 180);
      this.shakeX = (Math.random() * 2 - 1) * r;
      this.shakeY = (Math.random() * 2 - 1) * r;
      this.shakeAmt *= Math.max(0, 1 - dt * 22);
    } else { this.shakeX = 0; this.shakeY = 0; this.shakeAmt = 0; }
  }

  render() {
    this.composer.render();
  }
}
