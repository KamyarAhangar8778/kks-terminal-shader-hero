'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SITE_CONFIG } from '@/lib/app-config';
import { ensureFontsCached } from '@/lib/font-cache';
import { DEFAULT_TEXT } from './swirl/default-text';
import {
  DEFAULT_STAGE,
  useSwirlStage,
  type StageConfig,
  type StageEvents,
} from './swirl/use-swirl-stage';

interface TerminalShaderCanvasProps {
  word?: string;
}

/**
 * Hand-tuned 5-row slant ASCII stencil for "KKS", matching the exact proportions
 * and kerning of SLANT_ARLAN / SLANT_KAMILA in components/hero/swirl/resolver.ts.
 */
const SLANT_KKS = [
  '    __ __    __ __    _____',
  '   / //_/   / //_/   / ___/',
  '  / ,<     / ,<      \\__ \\ ',
  ' / /| |   / /| |    ___/ / ',
  '/_/ |_|  /_/ |_|   /____/  ',
];

const WAVEFRONT_CONFIG: StageConfig = {
  ...DEFAULT_STAGE,
  shock: true,
  trail: false,
  turbulence: 0.42,
  wavePattern: 'wavefront',
  rows: SLANT_KKS,
  word: SITE_CONFIG.brand.shortName,
  style: 'slant',
  text: DEFAULT_TEXT,
  zoom: 0.56,
  scanlines: 0.42,
  aberration: 1.2,
  curvature: 0.72,
  gradient: true,
  gradientAngle: 0.38 * Math.PI * 2,
  gradientFlow: 0.085,
  inkStops: ['#334155', '#64748b', '#94a3b8', '#e2e8f0', '#6ee7b7', '#7dd3fc', '#f8fafc'],
  logoColor: '#ffffff',
  bg: '#060608',
};

/**
 * Fullscreen Hero Background Canvas running the WebGL2 ASCII Swirl "Wavefront" shader model
 * from `components/hero/swirl` at 60 FPS with click shockwaves (no hover/pointer-move effect).
 */
export const TerminalShaderCanvas: React.FC<TerminalShaderCanvasProps> = ({
  word = SITE_CONFIG.brand.shortName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [painted, setPainted] = useState(false);

  const cfgRef = useRef<StageConfig>({
    ...WAVEFRONT_CONFIG,
    rows: word === SITE_CONFIG.brand.shortName ? SLANT_KKS : undefined,
    word,
  });

  useEffect(() => {
    void ensureFontsCached();
  }, []);

  useEffect(() => {
    cfgRef.current = {
      ...WAVEFRONT_CONFIG,
      rows: word === SITE_CONFIG.brand.shortName ? SLANT_KKS : undefined,
      word,
    };
  }, [word]);

  const eventsRef = useRef<StageEvents>({
    onFirstFrame: () => setPainted(true),
  });

  const handleFail = useCallback(() => {
    setFailed(true);
  }, []);

  const stage = useSwirlStage(canvasRef, cfgRef, handleFail, eventsRef);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      stage.current.burst(x, y);
    },
    [stage]
  );

  if (failed) {
    return (
      <div
        id="terminal-shader-fallback"
        className="absolute inset-0 w-full h-full bg-[#060608] pointer-events-none select-none z-0"
      />
    );
  }

  return (
    <canvas
      id="terminal-shader-canvas"
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      style={{ opacity: painted ? 1 : 0 }}
      className="absolute inset-0 block w-full h-full cursor-pointer select-none z-[1] transition-opacity duration-500 ease-out motion-reduce:transition-none touch-manipulation"
    />
  );
};
