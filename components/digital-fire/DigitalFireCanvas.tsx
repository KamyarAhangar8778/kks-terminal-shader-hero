/**
 * @file components/digital-fire/DigitalFireCanvas.tsx
 * @description بوم رندر آتش دیجیتالی با رزولوشن بالا با استفاده از کاراکترهای ASCII/یونیکد شبیه TextArt
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { FireSimulator } from '@/lib/digital-fire/fire-simulator';
import {
  FIRE_CHAR_SETS,
  FIRE_PALETTES,
  FIRE_HEAT_LEVELS,
  selectRealisticFireGlyph,
} from '@/lib/digital-fire/fire-palettes';
import type { FireCharMode, FirePaletteId } from '@/lib/digital-fire/types';
import { ensureFontsCached, getCachedMonoFontFamily } from '@/lib/font-cache';

interface DigitalFireCanvasProps {
  paletteId?: FirePaletteId;
  charMode?: FireCharMode;
  className?: string;
}

/**
 * کامپوننت بوم آتش دیجیتالی واقع‌گرایانه با ترکیب کاراکترهای ASCII و Unicode
 */
export const DigitalFireCanvas: React.FC<DigitalFireCanvasProps> = ({
  paletteId = 'emerald',
  charMode = 'hybrid',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const simulatorRef = useRef<FireSimulator | null>(null);

  const dimensionsRef = useRef<{ width: number; height: number }>({ width: 400, height: 180 });

  // محاسبه پیکربندی سلول‌ها با تراکم بالا برای ایجاد بافت طبیعی و پرجزئیات شعله‌ها
  const getCellMetrics = useCallback((width: number) => {
    const isMobile = width < 640;
    const cellW = isMobile ? 5.6 : 6.2;
    const cellH = isMobile ? 8.0 : 8.6;
    const fontSize = isMobile ? 8 : 9;
    return { cellW, cellH, fontSize };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = false;
    let tick = 0;

    const isInitialMobile = (canvas.offsetWidth || 400) < 640;
    let dpr = Math.min(window.devicePixelRatio || 1, isInitialMobile ? 1.75 : 2);
    let cssWidth = canvas.offsetWidth || 400;
    let cssHeight = canvas.offsetHeight || 180;
    dimensionsRef.current = { width: cssWidth, height: cssHeight };

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    const metrics = getCellMetrics(cssWidth);
    const cols = Math.max(20, Math.floor(cssWidth / metrics.cellW));
    const rows = Math.max(12, Math.floor(cssHeight / metrics.cellH));

    const simulator = new FireSimulator(cols, rows, FIRE_HEAT_LEVELS);
    simulatorRef.current = simulator;

    const currentPalette = FIRE_PALETTES[paletteId] || FIRE_PALETTES.solar;
    const currentSet = FIRE_CHAR_SETS[charMode] || FIRE_CHAR_SETS.hybrid;
    const chars = currentSet.chars;
    const numChars = chars.length;

    // Pre-compute heat-to-char-index LUT (Uint8Array) to eliminate per-cell division/floor in 60FPS loop
    const heatToCharIndex = new Uint8Array(FIRE_HEAT_LEVELS + 1);
    for (let h = 1; h <= FIRE_HEAT_LEVELS; h++) {
      heatToCharIndex[h] = Math.min(
        numChars - 1,
        (((h / FIRE_HEAT_LEVELS) * (numChars - 1)) | 0) + 1
      );
    }

    // Pre-allocated flat bucket buffers for zero-allocation heat-batched Canvas2D rendering
    const bucketHead = new Int32Array(FIRE_HEAT_LEVELS + 1);
    let maxGridCells = cols * rows;
    let bucketNext = new Int32Array(maxGridCells);
    let cellChars: string[] = new Array<string>(maxGridCells).fill(' ');
    let cellPosX = new Float32Array(cols);
    let cellPosY = new Float32Array(rows);

    const updateGridPositions = (w: number, h: number, cCount: number, rCount: number) => {
      const total = cCount * rCount;
      if (total > maxGridCells) {
        maxGridCells = total;
        bucketNext = new Int32Array(maxGridCells);
        cellChars = new Array<string>(maxGridCells).fill(' ');
      }
      if (cellPosX.length < cCount) cellPosX = new Float32Array(cCount);
      if (cellPosY.length < rCount) cellPosY = new Float32Array(rCount);
      const cW = w / cCount;
      const cH = h / rCount;
      const halfW = cW * 0.5;
      const halfH = cH * 0.5;
      for (let x = 0; x < cCount; x++) cellPosX[x] = x * cW + halfW;
      for (let y = 0; y < rCount; y++) cellPosY[y] = y * cH + halfH;
    };
    updateGridPositions(cssWidth, cssHeight, cols, rows);

    const buildGlowGradient = (_w: number, h: number): CanvasGradient => {
      const grad = ctx.createLinearGradient(0, h, 0, h * 0.35);
      grad.addColorStop(
        0,
        currentPalette.glowColor.replace('0.22', '0.16').replace('0.25', '0.16')
      );
      grad.addColorStop(
        0.45,
        currentPalette.glowColor.replace('0.22', '0.04').replace('0.25', '0.04')
      );
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      return grad;
    };

    let cachedGlowGradient = buildGlowGradient(cssWidth, cssHeight);
    let isWarmedUp = false;

    void ensureFontsCached();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          const isMobileViewport = (canvas.offsetWidth || 400) < 640;
          dpr = Math.min(window.devicePixelRatio || 1, isMobileViewport ? 1.75 : 2);
          cssWidth = canvas.offsetWidth || 400;
          cssHeight = canvas.offsetHeight || 180;
          dimensionsRef.current = { width: cssWidth, height: cssHeight };

          canvas.width = Math.floor(cssWidth * dpr);
          canvas.height = Math.floor(cssHeight * dpr);

          const newMetrics = getCellMetrics(cssWidth);
          const newCols = Math.max(20, Math.floor(cssWidth / newMetrics.cellW));
          const newRows = Math.max(12, Math.floor(cssHeight / newMetrics.cellH));

          simulator.resize(newCols, newRows);
          updateGridPositions(cssWidth, cssHeight, simulator.cols, simulator.rows);
          cachedGlowGradient = buildGlowGradient(cssWidth, cssHeight);
        }
      }
    });

    resizeObserver.observe(canvas);

    const syncLoopState = () => {
      const shouldRun = isVisible && !document.hidden;
      cancelAnimationFrame(animationFrameId);
      if (shouldRun) {
        if (!isWarmedUp) {
          for (let i = 0; i < 35; i++) {
            simulator.step(i, 0);
          }
          isWarmedUp = true;
        }
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    // توقف رندر هنگام خروج از صفحه یا مخفی شدن تب برای حفظ بهینه مصرف پردازنده و باتری
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          isVisible = entry.isIntersecting;
          syncLoopState();
        }
      },
      { rootMargin: '120px' }
    );

    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', syncLoopState, { passive: true });

    const renderLoop = () => {
      if (!isVisible) return;

      // اجرای گام فیزیک آتش
      if (!prefersReducedMotion) {
        simulator.step(tick, 0);
      }

      // پاک‌سازی کانواس
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      const simCols = simulator.cols;
      const simRows = simulator.rows;
      const cellW = cssWidth / simCols;
      const cellH = cssHeight / simRows;
      const fontSize = Math.max(8, (cellH * 0.95) | 0);

      ctx.font = `700 ${fontSize}px ${getCachedMonoFontFamily()}, "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const heatBuffer = simulator.heatBuffer;
      const paletteColors = currentPalette.colors;
      const isHybridMode = charMode === 'hybrid';
      const slowTick = (tick * 0.45) | 0;

      // ۱. دسته‌بندی سلول‌های فعال بر اساس سطح حرارت (Heat Bucketing) جهت کاهش ۹۸٪ تغییر وضعیت Canvas2D
      bucketHead.fill(-1);
      for (let y = 0; y < simRows; y++) {
        const rowOffset = y * simCols;
        const yHash = y * 29 + slowTick;

        for (let x = 0; x < simCols; x++) {
          const idx = rowOffset + x;
          const heat = heatBuffer[idx]!;
          if (heat <= 0) continue;

          let ch: string;
          if (isHybridMode) {
            const leftH = x > 0 ? heatBuffer[idx - 1]! : heat;
            const rightH = x + 1 < simCols ? heatBuffer[idx + 1]! : heat;
            const cellHash = (x * 13 + yHash) ^ (heat * 7);
            ch = selectRealisticFireGlyph(heat, rightH - leftH, cellHash);
          } else {
            const charIdx =
              heatToCharIndex[heat <= FIRE_HEAT_LEVELS ? heat : FIRE_HEAT_LEVELS] ?? 0;
            ch = chars[charIdx] ?? chars[0] ?? ' ';
          }
          if (ch === ' ') continue;

          const hBucket = heat <= FIRE_HEAT_LEVELS ? heat : FIRE_HEAT_LEVELS;
          cellChars[idx] = ch;
          bucketNext[idx] = bucketHead[hBucket]!;
          bucketHead[hBucket] = idx;
        }
      }

      let lastFillStyle = '';
      let lastAlpha = 1.0;

      for (let h = 1; h <= FIRE_HEAT_LEVELS; h++) {
        let idx = bucketHead[h]!;
        if (idx === -1) continue;

        const targetAlpha = h <= 4 ? 0.28 + h * 0.16 : 1.0;
        if (targetAlpha !== lastAlpha) {
          ctx.globalAlpha = targetAlpha;
          lastAlpha = targetAlpha;
        }

        const colorIdx = h < FIRE_HEAT_LEVELS ? h : FIRE_HEAT_LEVELS - 1;
        const targetColor = paletteColors[colorIdx] ?? '#ffffff';
        if (targetColor !== lastFillStyle) {
          ctx.fillStyle = targetColor;
          lastFillStyle = targetColor;
        }

        while (idx !== -1) {
          const y = (idx / simCols) | 0;
          const x = idx - y * simCols;
          ctx.fillText(cellChars[idx]!, cellPosX[x]!, cellPosY[y]!);
          idx = bucketNext[idx]!;
        }
      }
      if (lastAlpha !== 1.0) {
        ctx.globalAlpha = 1.0;
      }

      // ۲. رندر اخگرهای دیجیتال شناور (۰ و ۱ با فونت Kode Mono)
      for (let i = 0; i < simulator.embers.length; i++) {
        const ember = simulator.embers[i];
        if (!ember) continue;
        const alpha = Math.max(0, 1 - ember.life / ember.maxLife);
        ctx.globalAlpha = alpha;
        if (ember.color !== lastFillStyle) {
          ctx.fillStyle = ember.color;
          lastFillStyle = ember.color;
        }
        ctx.fillText(ember.char, ember.x * cellW, ember.y * cellH);
      }
      ctx.globalAlpha = 1.0;

      // هاله درخشان نور کف آتش (کش‌شده)
      ctx.fillStyle = cachedGlowGradient;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      ctx.restore();

      tick++;
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', syncLoopState);
    };
  }, [paletteId, charMode, prefersReducedMotion, getCellMetrics]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full block pointer-events-none ${className}`}
      style={{ imageRendering: 'auto' }}
      aria-hidden="true"
    />
  );
};
