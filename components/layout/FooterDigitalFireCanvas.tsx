'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { ensureFontsCached, getCachedMonoFontFamily } from '@/lib/font-cache';

/**
 * پالت کاراکترها و گرادیان حرارتی آتش دیجیتالی (ASCII / Unicode / Binary)
 * رتبه‌بندی شده از سردترین و کم‌حرارت‌ترین سطح تا کانون داغ سفید-فسفری.
 */
interface FireLevel {
  readonly charPool: readonly string[];
  readonly color: string;
}

const FIRE_LEVELS: readonly FireLevel[] = [
  // سطح ۰: خاموش / شفاف
  { charPool: [' '], color: 'transparent' },
  // سطح ۱: نوک زبانه‌های شعله (کاراکترهای سبک اسکی و باینری)
  { charPool: ['·', '^', ':', '0', '1'], color: 'rgba(16, 185, 129, 0.40)' },
  // سطح ۲: شعله بالایی با کاراکترهای باینری و یونیکد
  { charPool: ['0', '1', '~', '=', '+', '░'], color: 'rgba(52, 211, 153, 0.65)' },
  // سطح ۳: میانه شعله دیجیتال
  { charPool: ['1', '0', '*', '%', '░', '▒'], color: 'rgba(52, 211, 153, 0.88)' },
  // سطح ۴: بدنه اصلی آتش پر انرژی
  { charPool: ['1', '0', '#', '&', '▒', '▓'], color: '#6ee7b7' },
  // سطح ۵: مرکز داغ زبانه‌های آتش
  { charPool: ['█', '▓', '1', '0', '▲'], color: '#a7f3d0' },
  // سطح ۶: کانون سوختن در کف (سفید نئونی با کنتراست بالا)
  { charPool: ['█', '1', '0', '■'], color: '#ffffff' },
];

/**
 * FooterDigitalFireCanvas Component
 *
 * رندر آتش دیجیتالی شفاف با وضوح بالا (HiDPI / Retina Crisp Text)
 * بدون پیکسلی‌شدن و بدون حباب‌ها یا ذرات معلق فریز شده.
 * مجهز به کش تفاضلی (Dirty Checking) در لایه آف‌اسکرین برای حداقل بار پردازشی CPU.
 */
export const FooterDigitalFireCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = false;
    let tickCount = 0;

    let lastStepTime = 0;
    const stepInterval = 45; // نرخ گام انتشار فیزیک حرارت

    // ابعاد سلول‌ها جهت رزولوشن بالا و خطوط شارپ کاراکترهای ترمینال
    const cellWidth = 7;
    const cellHeight = 10;

    let cols = 0;
    let rows = 0;

    let currentHeat: Uint8Array = new Uint8Array(0);
    let nextHeat: Uint8Array = new Uint8Array(0);
    let cachedRenderMatrix: Uint8Array = new Uint8Array(0);

    // بافر آف‌اسکرین کش کاراکترها
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(canvas.offsetWidth * dpr);
      const height = Math.floor(canvas.offsetHeight * dpr);

      canvas.width = width;
      canvas.height = height;

      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      cols = Math.max(16, Math.floor(width / (cellWidth * dpr)));
      rows = Math.max(10, Math.floor(height / (cellHeight * dpr)));

      const total = cols * rows;
      currentHeat = new Uint8Array(total);
      nextHeat = new Uint8Array(total);
      cachedRenderMatrix = new Uint8Array(total);
      cachedRenderMatrix.fill(255); // پر کردن با مقدار نامعتبر برای اولین رندر

      if (offscreenCtx) {
        offscreenCtx.clearRect(0, 0, width, height);
        const fontSize = Math.floor(9 * dpr);
        offscreenCtx.font = `${fontSize}px ${getCachedMonoFontFamily()}`;
        offscreenCtx.textAlign = 'center';
        offscreenCtx.textBaseline = 'middle';
      }
    };

    updateDimensions();
    void ensureFontsCached().then(() => {
      updateDimensions();
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          updateDimensions();
        }
      }
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(renderLoop);
          } else {
            cancelAnimationFrame(animationFrameId);
          }
        }
      },
      { rootMargin: '100px' }
    );
    intersectionObserver.observe(canvas);

    const renderLoop = (timestamp: number) => {
      if (!isVisible) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scaledCellW = cellWidth * dpr;
      const scaledCellH = cellHeight * dpr;

      if (cols === 0 || rows === 0 || !offscreenCtx) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // ۱. به‌روزرسانی فیزیک شبیه‌سازی انتشار حرارت آتش
      if (timestamp - lastStepTime >= stepInterval) {
        lastStepTime = timestamp;
        tickCount++;

        // پاک‌سازی بافر مرحله بعدی تا هیچ ذره یا حرارت قدیمی در هوا حبس نشود
        nextHeat.fill(0);

        // تولید حرارت متناوب و موجی در ردیف پایینی بوم (کف آتش)
        const baseRow = rows - 1;
        const baseOffset = baseRow * cols;

        for (let c = 0; c < cols; c++) {
          const wave1 = Math.sin(c * 0.12 + tickCount * 0.05) * 0.5 + 0.5;
          const wave2 = Math.cos(c * 0.22 - tickCount * 0.03) * 0.5 + 0.5;
          const noise = Math.random();

          const baseEnergy = Math.floor(wave1 * 3.0 + wave2 * 1.8 + noise * 2.8);
          nextHeat[baseOffset + c] = Math.min(6, Math.max(0, baseEnergy));
        }

        // انتقال حرارت به سمت بالا با زوال قطعی (بدون جا ماندن هیچ حبابی در فضا)
        for (let r = rows - 1; r > 0; r--) {
          const rowOffset = r * cols;
          const targetRowOffset = (r - 1) * cols;

          for (let c = 0; c < cols; c++) {
            const heat = currentHeat[rowOffset + c] ?? 0;
            if (heat === 0) continue;

            // انحراف ملایم به چپ، راست یا مستقیم
            const drift = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            const targetCol = Math.max(0, Math.min(cols - 1, c + drift));

            // ضریب افت حرارت به ازای هر گام صعود
            const decay = Math.random() > 0.45 ? 1 : 0;
            const remainingHeat = Math.max(0, heat - decay);

            const targetIdx = targetRowOffset + targetCol;
            if (remainingHeat > (nextHeat[targetIdx] ?? 0)) {
              nextHeat[targetIdx] = remainingHeat;
            }
          }
        }

        // جایگزینی وضعیت جدید حرارتی
        currentHeat.set(nextHeat);

        // ۲. رندر تفاضلی در کش آف‌اسکرین (فقط سلول‌هایی که تغییر کرده‌اند ترسیم یا پاک می‌شوند)
        const slowTick = Math.floor(tickCount * 0.35);

        for (let r = 0; r < rows; r++) {
          const rowOffset = r * cols;
          const posY = r * scaledCellH;
          const centerY = posY + scaledCellH * 0.5;

          for (let c = 0; c < cols; c++) {
            const idx = rowOffset + c;
            const heat = currentHeat[idx] ?? 0;
            const prevHeat = cachedRenderMatrix[idx];

            // اگر سطح حرارت این سلول تغییر نکرده باشد، از کش قبلی استفاده می‌شود
            if (heat === prevHeat) continue;

            const posX = c * scaledCellW;
            const centerX = posX + scaledCellW * 0.5;

            // پاک کردن کاراکتر قبلی این سلول از بافر کش
            offscreenCtx.clearRect(posX, posY, scaledCellW, scaledCellH);

            // رندر کاراکتر جدید متناسب با حرارت
            if (heat > 0 && heat < FIRE_LEVELS.length) {
              const levelConfig = FIRE_LEVELS[heat];
              if (levelConfig) {
                const pool = levelConfig.charPool;
                const charIndex = (c * 5 + r * 11 + slowTick) % pool.length;
                const glyph = pool[charIndex] || '1';

                offscreenCtx.fillStyle = levelConfig.color;
                offscreenCtx.fillText(glyph, centerX, centerY);
              }
            }

            cachedRenderMatrix[idx] = heat;
          }
        }
      }

      // ۳. کپی سریع تصویر کش‌شده با شتاب سخت‌افزاری روی بوم اصلی
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      // ۴. درخشش ملایم زمینه در کف فوتر (Ambient Underglow)
      const glowGrad = ctx.createLinearGradient(
        0,
        canvas.height,
        0,
        canvas.height - scaledCellH * 4
      );
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.10)');
      glowGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, canvas.height - scaledCellH * 4, canvas.width, scaledCellH * 4);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none"
      aria-hidden="true"
    />
  );
};
