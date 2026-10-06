'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary capturing runtime failures.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Route error caught:', error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] bg-[#000000] text-zinc-200 font-sans p-4 text-center">
      <section
        aria-labelledby="route-error-title"
        className="rounded-2xl border border-rose-500/30 bg-zinc-950/90 p-8 max-w-md w-full shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
        dir="rtl"
      >
        <h2 id="route-error-title" className="text-xl font-bold text-rose-400 mb-2">
          خطا در بارگذاری بخش
        </h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          خطایی در پردازش رخ داد. لطفاً مجدداً تلاش نمایید.
        </p>
        <button
          id="retry-route-button"
          type="button"
          onClick={() => reset()}
          className="inline-block py-2.5 px-5 rounded-lg bg-zinc-900 border border-rose-500/40 hover:border-rose-400 text-zinc-100 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer"
        >
          تلاش مجدد
        </button>
      </section>
    </main>
  );
}
