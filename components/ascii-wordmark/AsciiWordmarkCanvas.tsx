'use client';

import { useEffect, useRef } from 'react';
import { AsciiWordmarkRenderer } from '@/lib/ascii-wordmark/renderer';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';

interface AsciiWordmarkCanvasProps {
  word?: string;
  inkColor?: string;
  className?: string;
}

/**
 * AsciiWordmarkCanvas
 * Seamless, frameless GPGPU ASCII flow-field particle simulation directly embedded in section backgrounds.
 */
export function AsciiWordmarkCanvas({
  word = 'KKS',
  inkColor = '#34d399',
  className = '',
}: AsciiWordmarkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: AsciiWordmarkRenderer | null = null;
    let isDisposed = false;

    const mountRenderer = () => {
      if (isDisposed || renderer) return;
      renderer = new AsciiWordmarkRenderer(el, {
        word,
        inkColor,
        reducedMotion,
      });
      if (renderer.mount()) {
        renderer.start();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      mountRenderer();
      return () => {
        isDisposed = true;
        renderer?.dispose();
      };
    }

    const bootstrapObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          bootstrapObserver.disconnect();
          mountRenderer();
        }
      },
      { rootMargin: '250px' }
    );

    bootstrapObserver.observe(el);

    return () => {
      isDisposed = true;
      bootstrapObserver.disconnect();
      renderer?.dispose();
    };
  }, [word, inkColor, reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-label={`Interactive ASCII particle display: ${word}`}
      className={`relative w-full h-[325px] sm:h-[320px] md:h-[380px] overflow-hidden select-none pointer-events-auto ${className}`}
    />
  );
}
