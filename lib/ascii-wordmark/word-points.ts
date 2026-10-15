/**
 * Word rasterizer and target point sampler for particle flow simulation
 */

import { getCachedMonoFontFamily } from '@/lib/font-cache';

export interface WordPoints {
  positions: Float32Array;
  count: number;
  aspect: number;
}

const wordLitCache = new Map<string, { buffer: Int32Array; length: number }>();

function getLitPackedCoords(
  word: string,
  W: number,
  H: number,
  stride: number
): { buffer: Int32Array; length: number } | null {
  const fontStack = getCachedMonoFontFamily();
  const cacheKey = `${word}::${fontStack}`;
  const cached = wordLitCache.get(cacheKey);
  if (cached) return cached;

  const c =
    typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(W, H);
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true }) as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) return null;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = 240;
  ctx.font = `700 ${fontSize}px ${fontStack}`;
  const margin = 80;
  const measured = ctx.measureText(word).width;
  if (measured > W - margin) {
    fontSize = Math.floor(fontSize * ((W - margin) / measured));
    ctx.font = `700 ${fontSize}px ${fontStack}`;
  }
  ctx.fillText(word, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const maxSamples = ((W / stride) | 0) * ((H / stride) | 0);
  const buffer = new Int32Array(maxSamples);
  let length = 0;

  for (let y = 0; y < H; y += stride) {
    const rowBase = y * W;
    for (let x = 0; x < W; x += stride) {
      const a = data[(rowBase + x) * 4 + 3];
      if (a !== undefined && a > 128) {
        buffer[length++] = (x << 16) | y;
      }
    }
  }

  const result = { buffer, length };
  wordLitCache.set(cacheKey, result);
  return result;
}

export function buildWordPoints(word: string, size: number): WordPoints {
  const count = size * size;
  const W = 1024;
  const H = 320;
  const aspect = W / H;

  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    const positions = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      positions[i * 4 + 0] = (Math.random() - 0.5) * 2 * aspect;
      positions[i * 4 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 4 + 2] = (Math.random() - 0.5) * 0.08;
      positions[i * 4 + 3] = Math.random();
    }
    return { positions, count, aspect };
  }

  const stride = 2;
  const lit = getLitPackedCoords(word, W, H, stride);
  if (!lit) {
    return { positions: new Float32Array(count * 4), count, aspect: W / H };
  }

  const positions = new Float32Array(count * 4);
  const fallbackPacked = ((W >> 1) << 16) | (H >> 1);
  const { buffer, length } = lit;
  const invW = (2 * aspect) / W;
  const invH = 2 / H;

  for (let i = 0; i < count; i++) {
    const packed =
      length > 0 ? (buffer[(Math.random() * length) | 0] ?? fallbackPacked) : fallbackPacked;
    const px = packed >>> 16;
    const py = packed & 0xffff;
    const jx = (Math.random() - 0.5) * stride;
    const jy = (Math.random() - 0.5) * stride;
    const nx = (px + jx) * invW - aspect;
    const ny = -(py + jy) * invH + 1;
    const nz = (Math.random() - 0.5) * 0.08;

    const baseIdx = i * 4;
    positions[baseIdx + 0] = nx;
    positions[baseIdx + 1] = ny;
    positions[baseIdx + 2] = nz;
    positions[baseIdx + 3] = Math.random();
  }

  return { positions, count, aspect };
}
