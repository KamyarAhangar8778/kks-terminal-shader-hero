import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ASCII_VERT, ASCII_FRAG, TRAIL_LEN } from './shaders';
import { buildAtlas, RAMP } from './atlas';

export interface ComposerPassResult {
  composer: EffectComposer;
  asciiPass: ShaderPass;
  trailPos: THREE.Vector2[];
  trailAge: Float32Array;
}

export interface ComposerConfig {
  w: number;
  h: number;
  dpr: number;
  renderScale: number;
  cellDivisor: number;
  inkColor: string;
}

/**
 * Builds the postprocessing EffectComposer pipeline with ASCII glyph conversion shader pass.
 *
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
 * @param {THREE.Scene} scene - Scene containing particles.
 * @param {THREE.Camera} camera - Active perspective camera.
 * @param {ComposerConfig} config - Layout and rendering scale metrics.
 * @returns {ComposerPassResult} Initialized composer components and trail tracking buffers.
 */
export function setupComposerPass(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  config: ComposerConfig
): ComposerPassResult {
  const { w, h, dpr, renderScale, cellDivisor, inkColor } = config;
  const bw = Math.max(2, Math.round(w * renderScale));
  const bh = Math.max(2, Math.round(h * renderScale));

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));

  const atlas = buildAtlas(RAMP);
  const atlasTex = new THREE.CanvasTexture(atlas);
  atlasTex.minFilter = THREE.LinearFilter;
  atlasTex.magFilter = THREE.LinearFilter;

  const cell = (bw * dpr) / cellDivisor;
  const ink = new THREE.Color(inkColor);

  const trailPos = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector2(9999, 9999));
  const trailAge = new Float32Array(TRAIL_LEN).fill(1);

  const asciiPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(bw * dpr, bh * dpr) },
      uAsciiPixelSize: { value: cell },
      uAsciiTexture: { value: atlasTex },
      uCharCount: { value: new THREE.Vector2(RAMP.length, 1) },
      uAsciiContrast: { value: 1.4 },
      uAsciiBrightness: { value: 0.12 },
      uAsciiMin: { value: 0.0 },
      uAsciiMax: { value: 1.0 },
      uAspect: { value: w / h },
      uInk: { value: new THREE.Vector3(ink.r, ink.g, ink.b) },
      uTrail: { value: trailPos },
      uTrailAge: { value: trailAge },
      uTrailOn: { value: 0 },
    },
    vertexShader: ASCII_VERT,
    fragmentShader: ASCII_FRAG,
  });
  asciiPass.renderToScreen = true;
  composer.addPass(asciiPass);

  return { composer, asciiPass, trailPos, trailAge };
}

/**
 * Advances cursor interactive trail coordinates and decay age over time.
 */
export function advanceCursorTrail(
  trailPos: THREE.Vector2[],
  trailAge: Float32Array,
  mouseUv: THREE.Vector2,
  onCard: boolean,
  dt: number,
  asciiPass: ShaderPass
): void {
  const TRAIL_LIFE = 0.75;
  for (let i = 0; i < TRAIL_LEN; i++) {
    const age = trailAge[i] ?? 1;
    trailAge[i] = Math.min(1, age + dt / TRAIL_LIFE);
  }
  if (onCard) {
    for (let i = TRAIL_LEN - 1; i > 0; i--) {
      const curPos = trailPos[i];
      const prevPos = trailPos[i - 1];
      if (curPos && prevPos) {
        curPos.copy(prevPos);
      }
      const prevAge = trailAge[i - 1];
      if (prevAge !== undefined) {
        trailAge[i] = prevAge;
      }
    }
    const firstPos = trailPos[0];
    if (firstPos) {
      firstPos.copy(mouseUv);
    }
    trailAge[0] = 0;
  }

  const asciiUniforms = asciiPass.uniforms as Record<string, THREE.IUniform>;
  if (asciiUniforms.uTrailAge) {
    asciiUniforms.uTrailAge.value = trailAge;
  }
}
