'use client';

/**
 * @file components/ui/initial-app-loader.tsx
 * @description Pure, minimal full-screen preloader featuring the raw ASCII Line spinner (| / - \).
 */

import React, { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react';
import { AsciiLineLoader } from '@/components/motion/loader';
import { EASE_OUT } from '@/lib/ease';
import { markAppLoaded } from '@/hooks/use-app-loaded';
import { FEATURE_FLAGS } from '@/lib/app-config';

/**
 * Clean initial application loader using only the raw ASCII Line animation.
 * Disappears once the page and all assets are fully loaded.
 */
export function InitialAppLoader(): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState<boolean>(FEATURE_FLAGS.initialLoader);

  useEffect(() => {
    const preFallback = document.getElementById('pre-hydration-loader');
    if (preFallback) {
      preFallback.remove();
    }

    const win = window as unknown as { __asciiPreInterval?: number };
    if (win.__asciiPreInterval) {
      clearInterval(win.__asciiPreInterval);
    }

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

    const timerId = setTimeout(finishLoading, 120);

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
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isLoading ? (
          <m.div
            id="app-initial-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 text-zinc-200 select-none pointer-events-none"
          >
            <AsciiLineLoader size={32} />
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
