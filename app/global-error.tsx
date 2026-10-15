'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for capturing unhandled runtime exceptions.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-zinc-200 font-sans p-4 text-center">
        <section
          aria-labelledby="global-error-title"
          className="rounded-2xl border border-rose-500/30 bg-zinc-950/90 p-8 max-w-md w-full shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
        >
          <h1 id="global-error-title" className="text-2xl font-bold text-rose-400 mb-2">
            خطای غیرمنتظره سیستم
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            سیستم با خطای غیرمنتظره مواجه شد. لطفاً صفحه را مجدداً بارگذاری کنید.
          </p>
          <button
            id="retry-system-button"
            type="button"
            onClick={() => reset()}
            className="inline-block py-2.5 px-5 rounded-lg bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 text-zinc-100 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer"
          >
            تلاش مجدد
          </button>
        </section>
      </body>
    </html>
  );
}
