/**
 * ASCII character ramp and canvas atlas texture generator
 */

import { getCachedMonoFontFamily } from '@/lib/font-cache';

export const RAMP = ' .:-=+*#%KKS';

let cachedAtlasCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
let cachedRamp = '';
let cachedCell = 0;
let cachedFont = '';

export function buildAtlas(ramp = RAMP, cell = 64): HTMLCanvasElement | OffscreenCanvas {
  const fontStack = getCachedMonoFontFamily();
  if (cachedAtlasCanvas && cachedRamp === ramp && cachedCell === cell && cachedFont === fontStack) {
    return cachedAtlasCanvas;
  }

  const n = ramp.length;
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    return {} as HTMLCanvasElement;
  }
  const c =
    typeof document !== 'undefined'
      ? document.createElement('canvas')
      : new OffscreenCanvas(cell * n, cell);
  c.width = cell * n;
  c.height = cell;
  const ctx = c.getContext('2d') as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) return c;

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 ${Math.floor(cell * 0.74)}px ${fontStack}`;
  for (let i = 0; i < n; i++) {
    const ch = ramp[i];
    if (ch && ch !== ' ') ctx.fillText(ch, i * cell + cell / 2, cell / 2 + cell * 0.04);
  }

  cachedAtlasCanvas = c;
  cachedRamp = ramp;
  cachedCell = cell;
  cachedFont = fontStack;

  return c;
}
