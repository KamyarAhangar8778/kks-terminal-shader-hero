'use client';

import { useSyncExternalStore } from 'react';

let reducedMotionMql: MediaQueryList | null = null;
const subscribers = new Set<() => void>();

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (!reducedMotionMql) {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  }
  return reducedMotionMql;
}

function handleMediaQueryChange(): void {
  subscribers.forEach((cb) => cb());
}

/**
 * Shared singleton event listener subscriber for prefers-reduced-motion media query.
 * Deduplicates browser MediaQueryList listeners across all mounted components.
 */
function subscribeReducedMotion(callback: () => void): () => void {
  const mql = getMediaQueryList();
  if (!mql) return () => {};

  if (subscribers.size === 0) {
    mql.addEventListener('change', handleMediaQueryChange);
  }
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      mql.removeEventListener('change', handleMediaQueryChange);
    }
  };
}

/**
 * Client snapshot reader for prefers-reduced-motion using cached MediaQueryList.
 */
function getReducedMotionClientSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? false;
}

/**
 * Server snapshot reader (default false for SSR).
 */
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * Custom React hook detecting user preference for reduced motion.
 *
 * @returns {boolean} True if prefers-reduced-motion is active in the OS.
 */
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionClientSnapshot,
    getReducedMotionServerSnapshot
  );
}
