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

interface SourceCodeCache {
  numLines: number;
  maxLen: number;
  codes: Uint16Array;
}

const sourceCacheMap = new WeakMap<string[], SourceCodeCache>();

function getOrBuildSourceCache(source: string[]): SourceCodeCache {
  const existing = sourceCacheMap.get(source);
  if (existing) return existing;

  const numLines = source.length || 1;
  let maxLen = 1;
  for (let i = 0; i < source.length; i++) {
    const len = source[i]!.length;
    if (len > maxLen) maxLen = len;
  }
  const codes = new Uint16Array(numLines * maxLen);
  codes.fill(32);
  for (let r = 0; r < source.length; r++) {
    const line = source[r]!;
    const rowOff = r * maxLen;
    for (let c = 0; c < line.length; c++) {
      codes[rowOff + c] = line.charCodeAt(c);
    }
  }
  const built: SourceCodeCache = { numLines, maxLen, codes };
  sourceCacheMap.set(source, built);
  return built;
}

const GRAD_LUT_SIZE = 1024;
const GRAD_LUT_MASK = GRAD_LUT_SIZE - 1;
const gradLutCache = new WeakMap<[number, number, number][], Float32Array>();

function getOrBuildGradLut(stops: [number, number, number][]): Float32Array {
  const existing = gradLutCache.get(stops);
  if (existing) return existing;

  const lut = new Float32Array(GRAD_LUT_SIZE * 3);
  const stopsLen = stops.length;
  for (let k = 0; k < GRAD_LUT_SIZE; k++) {
    const t = k / GRAD_LUT_SIZE;
    const seg = t * stopsLen;
    const segFloor = seg | 0;
    const i = segFloor % stopsLen;
    const j = (i + 1) % stopsLen;
    const f = seg - segFloor;
    const a = stops[i]!;
    const b = stops[j] ?? a;
    const o = k * 3;
    lut[o] = a[0] + (b[0] - a[0]) * f;
    lut[o + 1] = a[1] + (b[1] - a[1]) * f;
    lut[o + 2] = a[2] + (b[2] - a[2]) * f;
  }
  gradLutCache.set(stops, lut);
  return lut;
}

const MAX_ACTIVE_SHOCKS = 8;
const shockXArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockYArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockRingRArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockMinRSqArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockMaxRArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockMaxRSqArr = new Float32Array(MAX_ACTIVE_SHOCKS);
const shockAgeFadeArr = new Float32Array(MAX_ACTIVE_SHOCKS);

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
  const sc = getOrBuildSourceCache(source);
  const { numLines, maxLen: srcMaxLen, codes: srcCodes } = sc;

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
  const halfFormation = formation * 0.5;

  const trailOn = !!trail && trail.hasHeat;
  const ts = { heat: 0, fx: 0, fy: 0 };

  let activeShockCount = 0;
  if (shocks && shocks.length > 0) {
    const limit = shocks.length < MAX_ACTIVE_SHOCKS ? shocks.length : MAX_ACTIVE_SHOCKS;
    for (let k = 0; k < limit; k++) {
      const sh = shocks[k];
      if (!sh) continue;
      const ringR = sh.age * SHOCK_SPEED;
      const minR = ringR > 3.2 * SHOCK_WIDTH ? ringR - 3.2 * SHOCK_WIDTH : 0;
      const maxR = ringR + 3.2 * SHOCK_WIDTH;
      shockXArr[activeShockCount] = sh.x;
      shockYArr[activeShockCount] = sh.y;
      shockRingRArr[activeShockCount] = ringR;
      shockMinRSqArr[activeShockCount] = minR * minR;
      shockMaxRArr[activeShockCount] = maxR;
      shockMaxRSqArr[activeShockCount] = maxR * maxR;
      shockAgeFadeArr[activeShockCount] = sh.age * SHOCK_FADE;
      activeShockCount++;
    }
  }
  const shockOn = activeShockCount > 0;
  const invShockWidth = 1 / SHOCK_WIDTH;

  const cols = grid.cols;
  const rows = grid.rows;
  const halfCols = cols * 0.5;
  const halfRows = rows * 0.5;
  const invRows = 1 / rows;
  const advance = atlas.advance;
  const inkSize = grid.inkSize;
  const vOffset = grid.vOffset;
  const halfW = cols * advance * 0.5;
  const halfH = rows * inkSize * 0.5;
  const halfAngleCos = cos(paint.angle) * 0.5;
  const halfAngleSin = sin(paint.angle) * 0.5;

  const sinDriftT = sin(spin * HUE_DRIFT_SPEED);
  const cosDriftT = cos(spin * HUE_DRIFT_SPEED);
  const stops = paint.stops;
  const stopsLen = stops.length;
  const isGrad = paint.gradient && stopsLen >= 2;
  const gradLut = isGrad ? getOrBuildGradLut(stops) : null;
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
  const isWavefront = wavePattern === 'wavefront';
  const waveAmpDirX = waveAmp * waveDirX;
  const waveAmpDirY = waveAmp * waveDirY;

  const bounds = buffers.bounds;
  const glyphUvs = buffers.glyphUvs;
  const colors = buffers.colors;
  const maxBufOffset = bounds.length - 4;
  const uvsFlat = atlas.uvsFlat;
  const maxUvOffset = uvsFlat.length - 4;
  const atlasPad = atlas.pad;
  const atlasBaseline = atlas.baseline;
  const cellW = atlas.cellW;
  const cellH = atlas.cellH;
  const flare0 = flare ? flare[0] : 0;
  const flare1 = flare ? flare[1] : 0;
  const flare2 = flare ? flare[2] : 0;
  const hasFlare = !!flare;

  let count = 0;
  let cellIdx = 0;
  for (let row = 0; row < rows; row++) {
    const y = yArr[row]!;
    const baseline = vOffset + row * inkSize;
    const sny = snyArr[row]!;
    const fy = fyArr[row]!;
    const axisRowBase = fy * halfAngleSin + 0.5 + paintFlow;

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

      const sampleCol = ((rx + 1) * halfCols) | 0;
      const sampleRow = floor((ry + 1) * halfRows);
      let lineIdx = sampleRow % numLines;
      if (lineIdx < 0) lineIdx += numLines;
      let chCode =
        sampleCol >= 0 && sampleCol < srcMaxLen ? srcCodes[lineIdx * srcMaxLen + sampleCol]! : 32;

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

      if (!inLogo) {
        if (trailOn && heat > 0.001) {
          const noise = 1 + (jitterArr[cellIdx]! - 0.5) * TRAIL_NOISE;
          const push = WAKE_PUSH * heat * trailStrength * noise;
          dx += (ts.fx - ts.fy * 0.5) * push;
          dy += (ts.fy + ts.fx * 0.5) * push;
        }
        if (shockOn) {
          for (let k = 0; k < activeShockCount; k++) {
            const ox = snx - shockXArr[k]!;
            const maxR = shockMaxRArr[k]!;
            if (ox <= -maxR || ox >= maxR) continue;
            const oy = sny - shockYArr[k]!;
            if (oy <= -maxR || oy >= maxR) continue;
            const rSq = ox * ox + oy * oy;
            if (rSq <= shockMinRSqArr[k]! || rSq >= shockMaxRSqArr[k]!) continue;
            const r = sqrt(rSq);
            const d = (r - shockRingRArr[k]!) * invShockWidth;
            const crest = exp(-d * d - shockAgeFadeArr[k]!);
            if (crest > 0.002) {
              const push = (SHOCK_PUSH * crest) / (r > 0.0001 ? r : 0.0001);
              dx += ox * push;
              dy += oy * push;
            }
          }
        }
        if (turbOn) {
          if (isWavefront) {
            const w = waveSin[cellIdx]! * cosTWavePi - waveCos[cellIdx]! * sinTWavePi;
            dx += waveAmpDirX * w;
            dy += waveAmpDirY * w;
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
        let t: number;
        if (isAxisMode) {
          t = fxArr[col]! * halfAngleCos + axisRowBase;
        } else {
          let sr = sampleRow % rows;
          if (sr < 0) sr += rows;
          t = sr * invRows + paintFlow;
        }
        t += sinDriftT * driftCos[cellIdx]! + cosDriftT * driftSin[cellIdx]!;
        const lutOffset = (((t * GRAD_LUT_SIZE) | 0) & GRAD_LUT_MASK) * 3;
        cr = gradLut![lutOffset]! * bright;
        cg = gradLut![lutOffset + 1]! * bright;
        cb = gradLut![lutOffset + 2]! * bright;
      }

      if (hasFlare && heat > 0.001 && !inLogo) {
        const ft = clamp01(heat * FLARE_GAIN * trailStrength);
        cr += (flare0 - cr) * ft;
        cg += (flare1 - cg) * ft;
        cb += (flare2 - cb) * ft;
      }

      const x0 = px - atlasPad;
      const y0 = by - atlasBaseline;
      const x1 = x0 + cellW;
      const y1 = y0 + cellH;

      if (chCode !== 32) {
        const regSlot =
          chCode < 128
            ? asciiSlotReg[chCode]!
            : slotOf(String.fromCharCode(chCode), WEIGHT_REGULAR);
        const o = count * 4;
        const uo = regSlot * 4;
        if (o <= maxBufOffset && uo <= maxUvOffset) {
          bounds[o] = x0;
          bounds[o + 1] = y0;
          bounds[o + 2] = x1;
          bounds[o + 3] = y1;
          glyphUvs[o] = uvsFlat[uo]!;
          glyphUvs[o + 1] = uvsFlat[uo + 1]!;
          glyphUvs[o + 2] = uvsFlat[uo + 2]!;
          glyphUvs[o + 3] = uvsFlat[uo + 3]!;
          colors[o] = cr;
          colors[o + 1] = cg;
          colors[o + 2] = cb;
          colors[o + 3] = 1;
          count++;
        }
      }
      if (resolvedCode !== 32 && formation > 0) {
        const boldSlot =
          resolvedCode < 128
            ? asciiSlotBold[resolvedCode]!
            : slotOf(String.fromCharCode(resolvedCode), WEIGHT_BOLD);
        const uo = boldSlot * 4;
        if (uo <= maxUvOffset) {
          const u0 = uvsFlat[uo]!;
          const u1 = uvsFlat[uo + 1]!;
          const u2 = uvsFlat[uo + 2]!;
          const u3 = uvsFlat[uo + 3]!;
          let o = count * 4;
          if (o <= maxBufOffset) {
            bounds[o] = x0;
            bounds[o + 1] = y0;
            bounds[o + 2] = x1;
            bounds[o + 3] = y1;
            glyphUvs[o] = u0;
            glyphUvs[o + 1] = u1;
            glyphUvs[o + 2] = u2;
            glyphUvs[o + 3] = u3;
            colors[o] = logo0;
            colors[o + 1] = logo1;
            colors[o + 2] = logo2;
            colors[o + 3] = formation;
            count++;
          }
          o = count * 4;
          if (o <= maxBufOffset) {
            bounds[o] = x0;
            bounds[o + 1] = y0;
            bounds[o + 2] = x1;
            bounds[o + 3] = y1;
            glyphUvs[o] = u0;
            glyphUvs[o + 1] = u1;
            glyphUvs[o + 2] = u2;
            glyphUvs[o + 3] = u3;
            colors[o] = hi0;
            colors[o + 1] = hi1;
            colors[o + 2] = hi2;
            colors[o + 3] = halfFormation;
            count++;
          }
        }
      }
    }
  }
  return count;
}
