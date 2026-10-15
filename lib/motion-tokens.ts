/**
 * @fileoverview Motion Design Tokens & Choreography System
 *
 * Implements the definitive motion tokens, easing curves, spring physics,
 * and choreographed animation variants conforming to DESIGN.md and the
 * Motion Design Skill (Archetype: Premium / Precision Engineering).
 */

import type { Variants } from 'motion/react';

/**
 * Standard Cubic-Bezier Easing Curves.
 * Conforms to the directional easing rules:
 * - Entrance: Decelerate curve for dignified arrival
 * - Exit: Accelerate curve for crisp departure
 * - Smooth: Balanced curve for continuous spatial moves & ambient layers
 */
export const MOTION_EASINGS = {
  /** Decelerate entrance curve: fast start, gentle landing */
  entrance: [0.16, 1, 0.3, 1] as const,
  /** Accelerate exit curve: gentle start, fast departure */
  exit: [0.7, 0, 0.84, 0] as const,
  /** Premium smooth floating / transition curve */
  smooth: [0.4, 0, 0.2, 1] as const,
  /** Material Design 3 emphasized curve */
  emphasized: [0.05, 0.7, 0.1, 1] as const,
  /** Sharp error oscillation curve */
  shake: [0.36, 0.07, 0.19, 0.97] as const,
};

/**
 * Duration Palette (in seconds) matching the Premium Engineering archetype.
 * Follows the 1/3 Rule and element weight hierarchy.
 */
export const MOTION_DURATIONS = {
  /** Micro-feedback & button press anticipation (100ms) */
  micro: 0.1,
  /** Quick interactive feedback, icons & badge settles (150ms) */
  quick: 0.15,
  /** Standard card transitions & state changes (250ms - 300ms) */
  standard: 0.28,
  /** Heavy dialogs, alert reveals & section entrances (400ms - 500ms) */
  slow: 0.45,
  /** Continuous ambient breathing loops (2000ms - 2500ms) */
  ambient: 2.4,
};

/**
 * Choreographed Stagger Container Variants.
 * Enforces the stagger budget constraint:
 * 2-3 items * 0.08s = 0.16s - 0.24s (well under the 500ms total budget cap).
 */
export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.075,
    },
  },
};

/**
 * Card / Item Slide-and-Fade Entrance Variants (1/3 rule: 20px displacement).
 * Duration increased by 50% for a richer, more prolonged slide-up presence.
 */
export const itemEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: MOTION_EASINGS.entrance,
    },
  },
};

/**
 * Staggered Slide-Up Text Reveal Container Variants.
 * 50% prolonged stagger and delay for deliberate visual pacing.
 */
export const textRevealContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: (custom: { staggerDelay?: number; delay?: number } = {}) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delay ?? 0.075,
      staggerChildren: custom.staggerDelay ?? 0.068,
    },
  }),
};

/**
 * Slide-Up Masked Word Variants for headings (masked vertical emergence).
 * Duration increased by 50% from 0.45s to 0.68s for a cinematic, prolonged reveal.
 */
export const textRevealWordVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.68,
      ease: MOTION_EASINGS.entrance,
    },
  },
};
