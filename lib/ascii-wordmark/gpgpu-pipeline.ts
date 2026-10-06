import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { GPGPU_COMPUTE, PARTICLE_VERT, PARTICLE_FRAG } from './shaders';

export interface GPGPUPipelineResult {
  gpgpu: GPUComputationRenderer;
  posVar: ReturnType<GPUComputationRenderer['addVariable']>;
  points: THREE.Points;
  pointsMat: THREE.ShaderMaterial;
}

export interface GPGPUConfig {
  fboSize: number;
  flowInfluence: number;
  flowStrength: number;
  flowFrequency: number;
  mouseStrength: number;
}

/**
 * Initializes GPGPU computation simulation and particle mesh geometry.
 *
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
 * @param {THREE.Scene} scene - The target Three.js scene.
 * @param {Float32Array} positions - Particle initial point coordinates.
 * @param {number} count - Total particle count.
 * @param {GPGPUConfig} config - Physics configuration values.
 * @returns {GPGPUPipelineResult | null} The initialized pipeline components or null if unsupported.
 */
export function setupGPGPUPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  positions: Float32Array,
  count: number,
  config: GPGPUConfig
): GPGPUPipelineResult | null {
  const gpgpu = new GPUComputationRenderer(config.fboSize, config.fboSize, renderer);
  gpgpu.setDataType(THREE.HalfFloatType);

  const baseTex = gpgpu.createTexture();
  (baseTex.image.data as Float32Array).set(positions);

  const initTex = gpgpu.createTexture();
  (initTex.image.data as Float32Array).set(positions);

  const posVar = gpgpu.addVariable('uParticles', GPGPU_COMPUTE, initTex);
  gpgpu.setVariableDependencies(posVar, [posVar]);

  const u = posVar.material.uniforms as Record<string, THREE.IUniform>;
  u.uTime = { value: 0 };
  u.uDeltaTime = { value: 0 };
  u.uBase = { value: baseTex };
  u.uFlowFieldInfluence = { value: config.flowInfluence };
  u.uFlowFieldStrength = { value: config.flowStrength };
  u.uFlowFieldFrequency = { value: config.flowFrequency };
  u.uMouse = { value: new THREE.Vector3(9999, 9999, 0) };
  u.uMouseStrength = { value: config.mouseStrength };
  u.uMouseSpeed = { value: 0 };

  const err = gpgpu.init();
  if (err) {
    console.warn('[ascii-wordmark] GPGPU unsupported, skipping:', err);
    return null;
  }

  // Create Points Mesh Geometry
  const geo = new THREE.BufferGeometry();
  const uvs = new Float32Array(count * 2);
  const sizes = new Float32Array(count);
  let i = 0;
  for (let y = 0; y < config.fboSize; y++) {
    for (let x = 0; x < config.fboSize; x++) {
      uvs[i * 2] = (x + 0.5) / config.fboSize;
      uvs[i * 2 + 1] = (y + 0.5) / config.fboSize;
      sizes[i] = 0.6 + Math.random() * 0.8;
      i++;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aParticlesUv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setDrawRange(0, count);

  const pointsMat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uResolution: { value: new THREE.Vector2() },
      uSize: { value: 4 },
      uVisibility: { value: 0 },
      uParticlesTexture: { value: null },
    },
  });

  const points = new THREE.Points(geo, pointsMat);
  points.frustumCulled = false;
  scene.add(points);

  return { gpgpu, posVar, points, pointsMat };
}
