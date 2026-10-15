/**
 * Core WebGL + GPGPU Ascii Wordmark Renderer engine
 */

import * as THREE from 'three';
import { type GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { type EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { type ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { buildWordPoints } from './word-points';
import { buildAtlas } from './atlas';
import { setupGPGPUPipeline } from './gpgpu-pipeline';
import { setupComposerPass, advanceCursorTrail } from './composer-pass';
import { ensureFontsCached } from '@/lib/font-cache';

const FLOW_INFLUENCE = 0.43;
const FLOW_STRENGTH = 1.09;
const FLOW_FREQUENCY = 0.53;
const MOUSE_STRENGTH = 0.08;
const MOUSE_SPEED_GAIN = 1.5;

const IS_TOUCH =
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false);

const FBO_SIZE = IS_TOUCH ? 96 : 200;
const MAX_DPR = IS_TOUCH ? 1.5 : 2;
const RENDER_SCALE = 0.5;

function getAsciiCellDivisor(viewportWidth: number): number {
  if (viewportWidth < 480) return 58;
  if (viewportWidth < 768) return 76;
  return 100;
}

export interface AsciiWordmarkOptions {
  word: string;
  inkColor: string;
  reducedMotion?: boolean;
}

export class AsciiWordmarkRenderer {
  private host: HTMLElement;
  private opts: AsciiWordmarkOptions;

  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private composer!: EffectComposer;
  private asciiPass!: ShaderPass;

  private gpgpu!: GPUComputationRenderer;
  private posVar!: ReturnType<GPUComputationRenderer['addVariable']>;
  private points!: THREE.Points;
  private pointsMat!: THREE.ShaderMaterial;

  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private onScreen = true;
  private disposed = false;

  private mouse = new THREE.Vector3(9999, 9999, 0);
  private prevMouse = new THREE.Vector3(9999, 9999, 0);
  private mouseSpeed = 0;

  // Pre-allocated vectors for unprojection to eliminate GC in pointer event handlers
  private readonly vRay = new THREE.Vector3();
  private readonly dirRay = new THREE.Vector3();

  private mouseUv = new THREE.Vector2(9999, 9999);
  private onCard = false;

  private trailPos: THREE.Vector2[] = [];
  private trailAge: Float32Array = new Float32Array(0);
  private trailOn = 0;
  private visibility = 0;
  private wordAspect = 3;
  private hostW = 0;
  private hostH = 0;
  private readonly WORD_MARGIN = 0.92;

  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private cleanupFns: (() => void)[] = [];

  constructor(host: HTMLElement, opts: AsciiWordmarkOptions) {
    this.host = host;
    this.opts = opts;
  }

  mount(): boolean {
    const { clientWidth: w, clientHeight: h } = this.host;
    if (w === 0 || h === 0) return false;
    this.hostW = w;
    this.hostH = h;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    this.host.appendChild(this.renderer.domElement);
    Object.assign(this.renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      touchAction: 'pan-y',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    });

    const { positions, count, aspect } = buildWordPoints(this.opts.word, FBO_SIZE);
    this.wordAspect = aspect;

    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.frameWord(w / h);
    this.camera.lookAt(0, 0, 0);

    const isReduced = !!this.opts.reducedMotion;
    const gpgpuResult = setupGPGPUPipeline(this.renderer, this.scene, positions, count, {
      fboSize: FBO_SIZE,
      flowInfluence: isReduced ? FLOW_INFLUENCE * 0.3 : FLOW_INFLUENCE,
      flowStrength: isReduced ? FLOW_STRENGTH * 0.25 : FLOW_STRENGTH,
      flowFrequency: isReduced ? FLOW_FREQUENCY * 0.5 : FLOW_FREQUENCY,
      mouseStrength: isReduced ? MOUSE_STRENGTH * 0.4 : MOUSE_STRENGTH,
    });

    if (!gpgpuResult) return false;
    this.gpgpu = gpgpuResult.gpgpu;
    this.posVar = gpgpuResult.posVar;
    this.points = gpgpuResult.points;
    this.pointsMat = gpgpuResult.pointsMat;

    const cellDivisor = getAsciiCellDivisor(w);
    const composerResult = setupComposerPass(this.renderer, this.scene, this.camera, {
      w,
      h,
      dpr,
      renderScale: RENDER_SCALE,
      cellDivisor,
      inkColor: this.opts.inkColor,
    });

    this.composer = composerResult.composer;
    this.asciiPass = composerResult.asciiPass;
    this.trailPos = composerResult.trailPos;
    this.trailAge = composerResult.trailAge;

    const pointsUniforms = this.pointsMat.uniforms as Record<string, THREE.IUniform>;
    if (pointsUniforms.uResolution) {
      pointsUniforms.uResolution.value.set(w * dpr, h * dpr);
    }
    if (IS_TOUCH && pointsUniforms.uSize) {
      pointsUniforms.uSize.value = 6.0;
    }

    this.bindEvents();

    void ensureFontsCached().then(() => {
      if (this.disposed || !this.asciiPass) return;
      const au = this.asciiPass.uniforms as Record<string, THREE.IUniform>;
      const tex = au.uAsciiTexture?.value as THREE.CanvasTexture | undefined;
      if (tex) {
        tex.image = buildAtlas() as HTMLCanvasElement;
        tex.needsUpdate = true;
      }
    });

    return true;
  }

  private bindEvents() {
    const onPointerMove = (e: PointerEvent) => {
      const w = this.hostW;
      const h = this.hostH;
      if (w === 0 || h === 0) return;

      const localX = e.offsetX;
      const localY = e.offsetY;
      const nx = (localX / w) * 2 - 1;
      const ny = -((localY / h) * 2 - 1);

      this.vRay.set(nx, ny, 0.5).unproject(this.camera);
      this.dirRay.subVectors(this.vRay, this.camera.position).normalize();
      const dist = -this.camera.position.z / this.dirRay.z;
      this.mouse.copy(this.camera.position).addScaledVector(this.dirRay, dist);

      this.mouseUv.set(localX / w, 1 - localY / h);
      this.onCard = true;
    };

    const onPointerLeave = () => {
      this.mouse.set(9999, 9999, 0);
      this.mouseUv.set(9999, 9999);
      this.onCard = false;
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      this.stop();
    };
    const onContextRestored = () => {
      this.resize();
      this.maybeStart();
    };
    const domEl = this.renderer.domElement;
    domEl.addEventListener('webglcontextlost', onContextLost);
    domEl.addEventListener('webglcontextrestored', onContextRestored);

    this.host.addEventListener('pointerdown', onPointerMove, { passive: true });
    this.host.addEventListener('pointermove', onPointerMove, { passive: true });
    this.host.addEventListener('pointerup', onPointerLeave, { passive: true });
    this.host.addEventListener('pointercancel', onPointerLeave, { passive: true });
    this.host.addEventListener('pointerleave', onPointerLeave, { passive: true });
    this.cleanupFns.push(() => {
      domEl.removeEventListener('webglcontextlost', onContextLost);
      domEl.removeEventListener('webglcontextrestored', onContextRestored);
      this.host.removeEventListener('pointerdown', onPointerMove);
      this.host.removeEventListener('pointermove', onPointerMove);
      this.host.removeEventListener('pointerup', onPointerLeave);
      this.host.removeEventListener('pointercancel', onPointerLeave);
      this.host.removeEventListener('pointerleave', onPointerLeave);
    });

    const onVis = () => (document.hidden ? this.stop() : this.maybeStart());
    document.addEventListener('visibilitychange', onVis, { passive: true });
    this.cleanupFns.push(() => document.removeEventListener('visibilitychange', onVis));

    this.io = new IntersectionObserver(
      (entries) => {
        this.onScreen = entries[0] ? entries[0].isIntersecting : true;
        if (this.onScreen) this.maybeStart();
        else this.stop();
      },
      { threshold: 0.01, rootMargin: '80px 0px' }
    );
    this.io.observe(this.host);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.host);
  }

  private frameWord(viewportAspect: number) {
    const halfV = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const tanV = Math.tan(halfV);
    const distForHeight = 1.0 / tanV;
    const distForWidth = this.wordAspect / (tanV * viewportAspect);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    // 25% larger size on mobile screens (1 / 1.25 = 0.80 camera distance scaling)
    const marginScale = isMobile ? 0.736 : this.WORD_MARGIN;
    const dist = Math.max(distForHeight, distForWidth) * marginScale;
    this.camera.position.set(0, 0, dist);
  }

  private resize() {
    if (this.disposed || !this.renderer) return;
    const { clientWidth: w, clientHeight: h } = this.host;
    if (w === 0 || h === 0) return;
    this.hostW = w;
    this.hostH = h;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.frameWord(w / h);
    this.camera.updateProjectionMatrix();

    const bw = Math.max(2, Math.round(w * RENDER_SCALE));
    const bh = Math.max(2, Math.round(h * RENDER_SCALE));
    const cellDivisor = getAsciiCellDivisor(w);
    const asciiUniforms = this.asciiPass.uniforms as Record<string, THREE.IUniform>;
    const pointsUniforms = this.pointsMat.uniforms as Record<string, THREE.IUniform>;

    if (asciiUniforms.uResolution) {
      asciiUniforms.uResolution.value.set(bw * dpr, bh * dpr);
    }
    if (asciiUniforms.uAsciiPixelSize) {
      asciiUniforms.uAsciiPixelSize.value = (bw * dpr) / cellDivisor;
    }
    if (asciiUniforms.uAspect) {
      asciiUniforms.uAspect.value = w / h;
    }
    if (pointsUniforms.uResolution) {
      pointsUniforms.uResolution.value.set(w * dpr, h * dpr);
    }
  }

  start() {
    this.onScreen = true;
    this.maybeStart();
  }

  private maybeStart() {
    if (
      this.disposed ||
      this.running ||
      !this.onScreen ||
      (typeof document !== 'undefined' && document.hidden)
    ) {
      return;
    }
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private loop = () => {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 1 / 30);
    const t = this.clock.elapsedTime;

    this.mouseSpeed = this.mouse.distanceTo(this.prevMouse);
    if (this.mouse.x > 9000) this.mouseSpeed = 0;
    this.prevMouse.copy(this.mouse);

    const cu = this.posVar.material.uniforms as Record<string, THREE.IUniform>;
    if (cu.uTime) cu.uTime.value = t;
    if (cu.uDeltaTime) cu.uDeltaTime.value = dt;
    if (cu.uMouse) (cu.uMouse.value as THREE.Vector3).copy(this.mouse);
    if (cu.uMouseSpeed) cu.uMouseSpeed.value = this.mouseSpeed * MOUSE_SPEED_GAIN;
    this.gpgpu.compute();

    const pointsUniforms = this.pointsMat.uniforms as Record<string, THREE.IUniform>;
    if (pointsUniforms.uParticlesTexture) {
      pointsUniforms.uParticlesTexture.value = this.gpgpu.getCurrentRenderTarget(
        this.posVar
      ).texture;
    }

    this.visibility = Math.min(1, this.visibility + dt * 0.9);
    if (pointsUniforms.uVisibility) {
      pointsUniforms.uVisibility.value = this.visibility;
    }

    if (this.onCard || this.trailOn > 0.001) {
      advanceCursorTrail(
        this.trailPos,
        this.trailAge,
        this.mouseUv,
        this.onCard,
        dt,
        this.asciiPass
      );
    }

    const au = this.asciiPass.uniforms as Record<string, THREE.IUniform>;
    this.trailOn += ((this.onCard ? 1 : 0) - this.trailOn) * Math.min(1, dt * 6);
    if (au.uTrailOn) {
      au.uTrailOn.value = this.trailOn;
    }

    this.composer.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  dispose() {
    this.disposed = true;
    this.stop();
    this.cleanupFns.forEach((fn) => fn());
    this.io?.disconnect();
    this.ro?.disconnect();
    this.points?.geometry.dispose();
    this.pointsMat?.dispose();
    const asciiUniforms = this.asciiPass?.uniforms as Record<string, THREE.IUniform> | undefined;
    (asciiUniforms?.uAsciiTexture?.value as THREE.Texture | undefined)?.dispose?.();
    this.gpgpu?.dispose?.();
    this.composer?.dispose?.();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
