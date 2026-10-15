'use client';

/**
 * @file components/ui/initial-app-loader.tsx
 * @description Pure, minimal full-screen preloader featuring the raw ASCII Line spinner (| / - \).
 * Uses compositor-driven CSS steps and opacity transitions so the SSR DOM node painted at FCP
 * is never mutated via textContent or detached from the DOM (preventing late LCP resets).
 */

import React, { useEffect, useState } from 'react';
import { markAppLoaded } from '@/hooks/use-app-loaded';
import { FEATURE_FLAGS } from '@/lib/app-config';

const LOADER_KEYFRAMES_CSS = `
@keyframes kks-ascii-reel {
  0% { transform: translate3d(0, 0%, 0); }
  25% { transform: translate3d(0, -25%, 0); }
  50% { transform: translate3d(0, -50%, 0); }
  75% { transform: translate3d(0, -75%, 0); }
  100% { transform: translate3d(0, -100%, 0); }
}
`;

/**
 * Clean initial application loader using only the raw ASCII Line animation.
 * Fades out smoothly once the page is interactive while keeping the initial paint record intact.
 */
export function InitialAppLoader(): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState<boolean>(FEATURE_FLAGS.initialLoader);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    const finishLoading = () => {
      setIsLoading(false);
      markAppLoaded();
    };

    if (!FEATURE_FLAGS.initialLoader) {
      finishLoading();
      return;
    }

    if (document.readyState === 'complete') {
      const rafId = requestAnimationFrame(finishLoading);
      return () => cancelAnimationFrame(rafId);
    }

    const timerId = setTimeout(finishLoading, 80);

    const handleLoad = () => {
      clearTimeout(timerId);
      finishLoading();
    };

    window.addEventListener('load', handleLoad, { once: true, passive: true });

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timerId);
    };
  }, []);

  return (
    <div
      id="app-initial-loading-screen"
      aria-hidden={!isLoading}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 text-zinc-200 select-none pointer-events-none transition-opacity duration-150 ease-out ${
        isLoading ? 'opacity-100' : 'opacity-0 invisible'
      }`}
    >
      <style dangerouslySetInnerHTML={{ __html: LOADER_KEYFRAMES_CSS }} />
      <span
        role="status"
        aria-label="Loading"
        className="inline-flex overflow-hidden font-mono leading-none tabular-nums select-none"
        style={{ height: '32px', fontSize: '32px', lineHeight: '32px' }}
      >
        <span
          aria-hidden="true"
          className="flex flex-col will-change-transform"
          style={{
            animation: isLoading ? 'kks-ascii-reel 360ms steps(1, end) infinite' : 'none',
          }}
        >
          <span style={{ height: '32px' }}>|</span>
          <span style={{ height: '32px' }}>/</span>
          <span style={{ height: '32px' }}>-</span>
          <span style={{ height: '32px' }}>\</span>
        </span>
        <span className="sr-only">Loading</span>
      </span>
    </div>
  );
}

