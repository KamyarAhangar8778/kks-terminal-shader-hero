import { WEIGHT_REGULAR, WEIGHT_BOLD, type GlyphAtlas } from './glyph-atlas';
import { sampleTrail, type TrailField } from './trail-field';

export const TWIST_RATE = 0.1;

export const CORE_FLOOR = 0.1;

export const FORMATION_SEC = 1.8;

export const STENCIL_HALO = 4;

export const FIELD_EXTENT = 1.0;

const easeOutQuad = (t: number) => t * (2 - t);
const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface Target {
  rows: string[];
  stencil: boolean[][];
}

export function carveStencil(rows: string[]): boolean[][] {
  const w = Math.max(0, ...rows.map((l) => l.length));
  return rows.map((line) => {
    const isInk = (x: number) => x >= 0 && x < w && line[x] !== undefined && line[x] !== ' ';
    return Array.from({ length: w }, (_u, x) => {
      if (isInk(x) || isInk(x - 1) || isInk(x + 1)) return true;

      let left = false;
      let right = false;
      for (let d = 1; d <= STENCIL_HALO; d++) {
        if (isInk(x - d)) left = true;
        if (isInk(x + d)) right = true;
      }
      return left && right;
    });
  });
}

export function makeTarget(rows: string[]): Target {
  const w = Math.max(0, ...rows.map((l) => l.length));
  const padded = rows.map((l) => l.padEnd(w, ' '));
  return { rows: padded, stencil: carveStencil(padded) };
}

export interface FieldBuffers {
  bounds: Float32Array;
  glyphUvs: Float32Array;
  colors: Float32Array;
}

export function makeBuffers(maxCells: number): FieldBuffers {
  return {
    bounds: new Float32Array(maxCells * 4),
    glyphUvs: new Float32Array(maxCells * 4),
    colors: new Float32Array(maxCells * 4),
  };
}

export interface FieldGrid {
  cols: number;
  rows: number;
  inkSize: number;
  vOffset: number;
  targetX: number;
  targetY: number;
}

export type InkMode = 'rows' | 'axis';

export interface InkPaint {
  stops: [number, number, number][];

  angle: number;

  flow: number;

  gradient: boolean;

  mode: InkMode;
}

const HUE_DRIFT = 0.12;

const HUE_DRIFT_SPEED = 0.6;

const SPEED_DIM = 0.55;

export interface Shock {
  x: number;
  y: number;
  age: number;
}

const WAKE_PUSH = 0.34;
const SWIRL_GAIN = 4.5;
const TRAIL_NOISE = 0.9;
const FLARE_GAIN = 2.4;

const SHOCK_SPEED = 1.4;
const SHOCK_WIDTH = 0.13;
const SHOCK_PUSH = 0.12;
const SHOCK_FADE = 1.9;

const cellHash = (col: number, row: number) => {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const LUT_SIZE = 4096;
const LUT_MASK = LUT_SIZE - 1;
const RAD_TO_LUT = LUT_SIZE / (Math.PI * 2);
const SIN_LUT = new Float32Array(LUT_SIZE);
const COS_LUT = new Float32Array(LUT_SIZE);
for (let i = 0; i < LUT_SIZE; i++) {
  const a = (i / LUT_SIZE) * Math.PI * 2;
  SIN_LUT[i] = Math.sin(a);
  COS_LUT[i] = Math.cos(a);
}

interface GridStaticCache {
  cols: number;
  rows: number;
  targetX: number;
  targetY: number;
  targetRowsRef: string[];
  xArr: Float32Array;
  yArr: Float32Array;
  snxArr: Float32Array;
  snyArr: Float32Array;
  fxArr: Float32Array;
  fyArr: Float32Array;
  invCoreDist: Float32Array;
  speedBright: Float32Array;
  jitterArr: Float32Array;
  driftCos: Float32Array;
  driftSin: Float32Array;
  shimmerCos: Float32Array;
  shimmerSin: Float32Array;
  waveSin: Float32Array;
  waveCos: Float32Array;
  inLogoMask: Uint8Array;
  wordCharCodes: Uint16Array;
}

const gridCacheMap = new WeakMap<FieldGrid, GridStaticCache>();

function getOrBuildGridCache(grid: FieldGrid, target: Target): GridStaticCache {
  const existing = gridCacheMap.get(grid);
  if (
    existing &&
    existing.cols === grid.cols &&
    existing.rows === grid.rows &&
    existing.targetX === grid.targetX &&
    existing.targetY === grid.targetY &&
    existing.targetRowsRef === target.rows
  ) {
    return existing;
  }

  const { cols, rows, targetX, targetY } = grid;
  const total = rows * cols;
  const xArr = new Float32Array(cols);
  const snxArr = new Float32Array(cols);
  const fxArr = new Float32Array(cols);
  for (let col = 0; col < cols; col++) {
    xArr[col] = ((col * 2) / cols - 1) * FIELD_EXTENT;
    snxArr[col] = ((col + 0.5) / cols) * 2 - 1;
    fxArr[col] = (col * 2) / cols - 1;
  }

  const yArr = new Float32Array(rows);
  const snyArr = new Float32Array(rows);
  const fyArr = new Float32Array(rows);
  for (let row = 0; row < rows; row++) {
    yArr[row] = (1 - (row * 2) / rows) * FIELD_EXTENT;
    snyArr[row] = ((row + 0.5) / rows) * 2 - 1;
    fyArr[row] = 1 - (row * 2) / rows;
  }

  const invCoreDist = new Float32Array(total);
  const speedBright = new Float32Array(total);
  const jitterArr = new Float32Array(total);
  const driftCos = new Float32Array(total);
  const driftSin = new Float32Array(total);
  const shimmerCos = new Float32Array(total);
  const shimmerSin = new Float32Array(total);
  const waveSin = new Float32Array(total);
  const waveCos = new Float32Array(total);
  const inLogoMask = new Uint8Array(total);
  const wordCharCodes = new Uint16Array(total);

  const waveDirX = Math.cos(WAVE_DIR);
  const waveDirY = Math.sin(WAVE_DIR);
  const tw = target.rows;
  const tWidth = tw[0]?.length ?? 0;

  let idx = 0;
  for (let row = 0; row < rows; row++) {
    const y = yArr[row]!;
    const sny = snyArr[row]!;
    const ty = row - targetY;
    const inTargetY = ty >= 0 && ty < tw.length;
    const stencilRow = inTargetY ? target.stencil[ty] : undefined;
    const targetLine = inTargetY ? tw[ty] : undefined;

    for (let col = 0; col < cols; col++, idx++) {
      const x = xArr[col]!;
      const snx = snxArr[col]!;
      const dist = Math.sqrt(x * x + y * y);
      invCoreDist[idx] = TWIST_RATE / Math.max(CORE_FLOOR, dist);
      speedBright[idx] = mix(SPEED_DIM, 1, clamp01(1 - dist));

      const j = cellHash(col, row);
      jitterArr[idx] = j;
      const jAngle = j * Math.PI * 2;
      const cj = Math.cos(jAngle);
      const sj = Math.sin(jAngle);
      driftCos[idx] = cj * HUE_DRIFT * j;
      driftSin[idx] = sj * HUE_DRIFT * j;
      shimmerCos[idx] = cj * 0.06 * j;
      shimmerSin[idx] = sj * 0.06 * j;

      const phase0 = (snx * waveDirX + sny * waveDirY) * WAVE_FREQ * Math.PI;
      waveSin[idx] = Math.sin(phase0);
      waveCos[idx] = Math.cos(phase0);

      const tx = col - targetX;
      if (inTargetY && tx >= 0 && tx < tWidth && stencilRow?.[tx]) {
        inLogoMask[idx] = 1;
        const wc = targetLine?.[tx];
        wordCharCodes[idx] = wc && wc !== ' ' ? wc.charCodeAt(0) : 0;
      }
    }
  }

  const cache: GridStaticCache = {
    cols,
    rows,
    targetX,
    targetY,
    targetRowsRef: target.rows,
    xArr,
    yArr,
    snxArr,
    snyArr,
    fxArr,
    fyArr,
    invCoreDist,
    speedBright,
    jitterArr,
    driftCos,
    driftSin,
    shimmerCos,
    shimmerSin,
    waveSin,
    waveCos,
    inLogoMask,
    wordCharCodes,
  };
  gridCacheMap.set(grid, cache);
  return cache;
}

function pushCell(
  buf: FieldBuffers,
  atlas: GlyphAtlas,
  glyphSlot: number,
  x: number,
  baseline: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
  state: { count: number }
) {
  if (alpha <= 0) return;
  const o = state.count * 4;
  if (o + 3 >= buf.bounds.length) return;
  const uvsFlat = atlas.uvsFlat;
  const uo = glyphSlot * 4;
  if (uo + 3 >= uvsFlat.length) return;
  const x0 = x - atlas.pad;
  const y0 = baseline - atlas.baseline;
  buf.bounds[o] = x0;
  buf.bounds[o + 1] = y0;
  buf.bounds[o + 2] = x0 + atlas.cellW;
  buf.bounds[o + 3] = y0 + atlas.cellH;
  buf.glyphUvs[o] = uvsFlat[uo]!;
  buf.glyphUvs[o + 1] = uvsFlat[uo + 1]!;
  buf.glyphUvs[o + 2] = uvsFlat[uo + 2]!;
  buf.glyphUvs[o + 3] = uvsFlat[uo + 3]!;
  buf.colors[o] = r;
  buf.colors[o + 1] = g;
  buf.colors[o + 2] = b;
  buf.colors[o + 3] = alpha;
  state.count++;
}

export interface ComposeArgs {
  grid: FieldGrid;
  atlas: GlyphAtlas;
  buffers: FieldBuffers;
  source: string[];
  target: Target;

  elapsed: number;
  paint: InkPaint;

  logo: [number, number, number];

  slotOf: (ch: string, weight: number) => number;

  trail?: TrailField;

  trailStrength?: number;

  trailFlare?: [number, number, number];

  shocks?: Shock[];

  turbulence?: number;

  wavePattern?: WavePattern;
}

export type WavePattern = 'wavefront' | 'ripples' | 'flow' | 'cloth';

const WAVE_AMP = 0.16;
const WAVE_FREQ = 2.4;
const WAVE_SPEED = 0.9;
const WAVE_DIR = Math.PI * 0.15;

const vnoise = (x: number, y: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const h = (a: number, b: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = h(xi, yi);
  const b = h(xi + 1, yi);
  const c = h(xi, yi + 1);
  const d = h(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
};

let cachedSlotFn: ((ch: string, weight: number) => number) | null = null;
const asciiSlotReg = new Int32Array(128);
const asciiSlotBold = new Int32Array(128);

function ensureAsciiSlots(slotOf: (ch: string, weight: number) => number) {
  if (cachedSlotFn === slotOf) return;
  cachedSlotFn = slotOf;
  for (let code = 0; code < 128; code++) {
    const ch = String.fromCharCode(code);
    asciiSlotReg[code] = slotOf(ch, WEIGHT_REGULAR);
    asciiSlotBold[code] = slotOf(ch, WEIGHT_BOLD);
  }
}

export function composeField(args: ComposeArgs): number {
  const {
    grid,
    atlas,
    buffers,
    source,
    target,
    elapsed,
    paint,
    logo,
    slotOf,
    trail,
    shocks,
    turbulence,
  } = args;
  const wavePattern = args.wavePattern ?? 'wavefront';
  const trailStrength = args.trailStrength ?? 1;
  const flare = args.trailFlare;
  const { sin, cos, sqrt, floor, round, exp, max, PI } = Math;

  ensureAsciiSlots(slotOf);
  const gc = getOrBuildGridCache(grid, target);

  const spin = elapsed * 0.001;
  const turbOn = !!turbulence && turbulence > 0.001;
  const tWave = spin * WAVE_SPEED;
  const waveDirX = cos(WAVE_DIR);
  const waveDirY = sin(WAVE_DIR);
  const cosTWavePi = cos(tWave * PI);
  const sinTWavePi = sin(tWave * PI);
  const formation = easeOutQuad(clamp01(spin / FORMATION_SEC));

  const lum = 0.299 * logo[0] + 0.587 * logo[1] + 0.114 * logo[2];
  const hi0 = lum < 0.5 ? mix(logo[0], 1, 0.5) : mix(logo[0], 0, 0.35);
  const hi1 = lum < 0.5 ? mix(logo[1], 1, 0.5) : mix(logo[1], 0, 0.35);
  const hi2 = lum < 0.5 ? mix(logo[2], 1, 0.5) : mix(logo[2], 0, 0.35);
  const logo0 = logo[0];
  const logo1 = logo[1];
  const logo2 = logo[2];

  const lines = source;
  const numLines = lines.length || 1;
  const state = { count: 0 };

  const trailOn = !!trail;
  const ts = { heat: 0, fx: 0, fy: 0 };
  const shockOn = !!shocks && shocks.length > 0;

  const cols = grid.cols;
  const rows = grid.rows;
  const invRows = 1 / rows;
  const halfW = cols * atlas.advance * 0.5;
  const halfH = rows * grid.inkSize * 0.5;
  const angleCos = cos(paint.angle);
  const angleSin = sin(paint.angle);

  const sinDriftT = sin(spin * HUE_DRIFT_SPEED);
  const cosDriftT = cos(spin * HUE_DRIFT_SPEED);
  const stops = paint.stops;
  const stopsLen = stops.length;
  const isGrad = paint.gradient && stopsLen >= 2;
  const isAxisMode = paint.mode === 'axis';
  const paintFlow = paint.flow;
  const baseStop = stops[0] ?? [1, 1, 1];
  const baseR = baseStop[0];
  const baseG = baseStop[1];
  const baseB = baseStop[2];

  const {
    xArr,
    yArr,
    snxArr,
    snyArr,
    fxArr,
    fyArr,
    invCoreDist,
    speedBright,
    jitterArr,
    driftCos,
    driftSin,
    shimmerCos,
    shimmerSin,
    waveSin,
    waveCos,
    inLogoMask,
    wordCharCodes,
  } = gc;

  const waveAmp = turbOn ? WAVE_AMP * turbulence! : 0;
  const advance = atlas.advance;
  const inkSize = grid.inkSize;
  const vOffset = grid.vOffset;

  let cellIdx = 0;
  for (let row = 0; row < rows; row++) {
    const y = yArr[row]!;
    const baseline = vOffset + row * inkSize;
    const sny = snyArr[row]!;
    const fy = fyArr[row]!;

    for (let col = 0; col < cols; col++, cellIdx++) {
      const x = xArr[col]!;
      const snx = snxArr[col]!;

      let heat = 0;
      if (trailOn) {
        sampleTrail(trail!, snx, sny, ts);
        heat = ts.heat;
      }
      const twist = spin * invCoreDist[cellIdx]! * (1 + SWIRL_GAIN * heat * trailStrength);
      const lutIdx = ((twist * RAD_TO_LUT) | 0) & LUT_MASK;
      const s = SIN_LUT[lutIdx]!;
      const cse = COS_LUT[lutIdx]!;
      const rx = x * cse + y * s;
      const ry = x * s - y * cse;

      const sampleCol = ((rx + 1) * 0.5 * cols) | 0;
      const sampleRow = floor((ry + 1) * 0.5 * rows);
      const lineIdx = ((sampleRow % numLines) + numLines) % numLines;
      const srcLine = lines[lineIdx] ?? '';
      let chCode =
        sampleCol >= 0 && sampleCol < srcLine.length ? srcLine.charCodeAt(sampleCol) : 32;

      let resolvedCode = 32;
      const inLogo = inLogoMask[cellIdx] === 1;
      if (inLogo) {
        const wCode = wordCharCodes[cellIdx]!;
        if (wCode !== 0) {
          chCode = round(mix(chCode, wCode, formation));
          resolvedCode = chCode;
        } else if (formation > 0.5) {
          chCode = 32;
        }
      }
      if (chCode === 32 && resolvedCode === 32) continue;

      let dx = 0;
      let dy = 0;

      if (trailOn && !inLogo && heat > 0.001) {
        const noise = 1 + (jitterArr[cellIdx]! - 0.5) * TRAIL_NOISE;
        const push = WAKE_PUSH * heat * trailStrength * noise;
        dx += (ts.fx - ts.fy * 0.5) * push;
        dy += (ts.fy + ts.fx * 0.5) * push;
      }
      if (shockOn && !inLogo) {
        for (let k = 0; k < shocks!.length; k++) {
          const sh = shocks![k];
          if (!sh) continue;
          const ox = snx - sh.x;
          const oy = sny - sh.y;
          const r = sqrt(ox * ox + oy * oy);
          const ringR = sh.age * SHOCK_SPEED;
          const d = (r - ringR) / SHOCK_WIDTH;
          if (d > -3.2 && d < 3.2) {
            const crest = exp(-d * d - sh.age * SHOCK_FADE);
            if (crest > 0.002) {
              const push = (SHOCK_PUSH * crest) / max(0.0001, r);
              dx += ox * push;
              dy += oy * push;
            }
          }
        }
      }
      if (turbOn && !inLogo) {
        if (wavePattern === 'wavefront') {
          const w = waveSin[cellIdx]! * cosTWavePi - waveCos[cellIdx]! * sinTWavePi;
          dx += waveAmp * w * waveDirX;
          dy += waveAmp * w * waveDirY;
        } else if (wavePattern === 'ripples') {
          const r = sqrt(snx * snx + sny * sny);
          const w = sin(r * WAVE_FREQ * PI * 1.6 - tWave * PI);
          const inv = (waveAmp * w) / max(0.08, r);
          dx += snx * inv;
          dy += sny * inv;
        } else if (wavePattern === 'flow') {
          const nx = vnoise(snx * 1.6 + tWave * 0.4, sny * 1.6);
          const ny = vnoise(sny * 1.6 - tWave * 0.4 + 7.3, snx * 1.6 + 3.1);
          dx += waveAmp * 1.4 * nx;
          dy += waveAmp * 1.4 * ny;
        } else {
          dx += waveAmp * 1.3 * sin(sny * WAVE_FREQ * PI * 0.9 + tWave * PI * 1.2);
          dy += waveAmp * 0.35 * sin(snx * WAVE_FREQ * PI + tWave * PI);
        }
      }

      const px = col * advance + dx * halfW;
      const by = baseline + dy * halfH;
      const bright = speedBright[cellIdx]!;

      let cr: number;
      let cg: number;
      let cb: number;

      if (!isGrad) {
        const shimmer = 1 + (sinDriftT * shimmerCos[cellIdx]! + cosDriftT * shimmerSin[cellIdx]!);
        const gain = clamp01(bright * shimmer);
        cr = baseR * gain;
        cg = baseG * gain;
        cb = baseB * gain;
      } else {
        const fx = fxArr[col]!;
        let t = isAxisMode
          ? (fx * angleCos + fy * angleSin) * 0.5 + 0.5 + paintFlow
          : (((sampleRow % rows) + rows) % rows) * invRows + paintFlow;
        t += sinDriftT * driftCos[cellIdx]! + cosDriftT * driftSin[cellIdx]!;
        t = t - floor(t);

        const seg = t * stopsLen;
        const segFloor = floor(seg);
        const i = segFloor % stopsLen;
        const j = (i + 1) % stopsLen;
        const f = seg - segFloor;
        const a = stops[i]!;
        const b = stops[j] ?? a;

        cr = (a[0] + (b[0] - a[0]) * f) * bright;
        cg = (a[1] + (b[1] - a[1]) * f) * bright;
        cb = (a[2] + (b[2] - a[2]) * f) * bright;
      }

      if (flare && heat > 0.001 && !inLogo) {
        const ft = clamp01(heat * FLARE_GAIN * trailStrength);
        cr += (flare[0] - cr) * ft;
        cg += (flare[1] - cg) * ft;
        cb += (flare[2] - cb) * ft;
      }
      if (chCode !== 32) {
        const regSlot =
          chCode < 128
            ? asciiSlotReg[chCode]!
            : slotOf(String.fromCharCode(chCode), WEIGHT_REGULAR);
        pushCell(buffers, atlas, regSlot, px, by, cr, cg, cb, 1, state);
      }
      if (resolvedCode !== 32) {
        const boldSlot =
          resolvedCode < 128
            ? asciiSlotBold[resolvedCode]!
            : slotOf(String.fromCharCode(resolvedCode), WEIGHT_BOLD);
        pushCell(buffers, atlas, boldSlot, px, by, logo0, logo1, logo2, formation, state);
        pushCell(buffers, atlas, boldSlot, px, by, hi0, hi1, hi2, formation * 0.5, state);
      }
    }
  }
  return state.count;
}
