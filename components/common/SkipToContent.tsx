'use client';

import React from 'react';

/**
 * SkipToContent Component
 *
 * Implements WCAG 2.4.1 (Bypass Blocks) accessible navigation landmark.
 * Hidden by default, becomes visible when keyboard users press Tab upon entering the page.
 *
 * @returns {React.ReactElement} The accessible skip link element.
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      id="skip-to-content-link"
      href="#main-root"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[9999] px-4 py-2 rounded-lg bg-zinc-950/95 text-emerald-300 border border-emerald-400/80 font-sans text-xs font-medium shadow-[0_12px_32px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black whitespace-nowrap transition-transform"
      dir="rtl"
    >
      پرش به محتوای اصلی &crarr;
    </a>
  );
};
