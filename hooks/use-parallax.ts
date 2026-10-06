'use client';

import { useRef } from 'react';
import { useMotionValue } from 'motion/react';

export interface ParallaxOptions {
  /** Offset distance in pixels (e.g., -50 to 50) or percentage */
  distance?: number;
  /** Custom scroll target container ref */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Damping factor for spring smoothing (default: 25) */
  damping?: number;
  /** Stiffness for spring smoothing (default: 200) */
  stiffness?: number;
  /** Invert the parallax direction */
  reverse?: boolean;
}

/**
 * Provides a stable container ref and static zero-offset MotionValues so
 * glassmorphic (`backdrop-blur`) sections render once onto static GPU layers
 * without triggering per-frame backdrop re-sampling during scroll.
 *
 * @param {ParallaxOptions} [_options] - Configuration options.
 * @returns {{ ref: React.RefObject<HTMLDivElement | null>; y: import('motion/react').MotionValue<number>; scrollProgress: import('motion/react').MotionValue<number> }}
 */
export function useParallax() {
  const internalRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const scrollProgress = useMotionValue(0);

  return {
    ref: internalRef,
    y,
    scrollProgress,
  };
}
