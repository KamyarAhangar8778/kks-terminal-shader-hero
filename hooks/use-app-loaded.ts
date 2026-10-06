'use client';

/**
 * @file hooks/use-app-loaded.ts
 * @description Hook and dispatcher to manage initial application loading state.
 * Allows components (such as HeroSection) to orchestrate choreographies that
 * trigger precisely when the initial loading screen completes.
 */

import { useSyncExternalStore } from 'react';

declare global {
  interface Window {
    __kksAppLoaded?: boolean;
  }
}

const APP_LOADED_EVENT = 'kks:app-loaded';

/**
 * Marks the application as loaded and dispatches a global window event.
 * Safe for multiple invocations; persists the loaded flag on window.
 */
export function markAppLoaded(): void {
  if (typeof window === 'undefined') return;
  window.__kksAppLoaded = true;
  window.dispatchEvent(new CustomEvent(APP_LOADED_EVENT));
}

function subscribeAppLoaded(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(APP_LOADED_EVENT, callback);
  return () => {
    window.removeEventListener(APP_LOADED_EVENT, callback);
  };
}

function getAppLoadedClientSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__kksAppLoaded);
}

function getAppLoadedServerSnapshot(): boolean {
  return false;
}

/**
 * Custom React hook that returns whether the initial application loading
 * screen has completed its sequence using React concurrent external store synchronization.
 *
 * @returns {boolean} True if the initial loader has completed, false while still loading.
 */
export function useAppLoaded(): boolean {
  return useSyncExternalStore(
    subscribeAppLoaded,
    getAppLoadedClientSnapshot,
    getAppLoadedServerSnapshot
  );
}
