'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { ArrowUp, Terminal, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { MOTION_EASINGS } from '@/lib/motion-tokens';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { FEATURE_FLAGS, SITE_CONFIG } from '@/lib/app-config';

const DigitalFireContainer = dynamic(
  () =>
    import('@/components/digital-fire/DigitalFireContainer').then((m) => m.DigitalFireContainer),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full h-[140px] sm:h-[180px] md:h-[220px] bg-[#000000]"
        aria-hidden="true"
      />
    ),
  }
);

/**
 * Smooth scroll to top of the page.
 */
function scrollToTop(): void {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Footer Component
 *
 * Renders the bottom cybernetic telemetry footer containing system status indicators,
 * navigation links, and copyright notices.
 *
 * @returns {React.ReactElement} The rendered Footer.
 */
export const Footer: React.FC = () => {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <footer
      id="main-app-footer"
      className="relative w-full bg-[#000000] border-t border-white/[0.08] text-zinc-400 font-mono text-xs select-none"
      style={{ viewTransitionName: 'main-app-footer' }}
    >
      {/* Top Accent Light Bar */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="adaptive-container pt-10 pb-3">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-3.5 border-b border-white/[0.08]">
          {/* Column 1: Brand & Identity */}
          <aside
            aria-label={`مشخصات برند ${SITE_CONFIG.brand.shortName}`}
            className="flex flex-col items-start gap-2"
          >
            <p
              className="text-zinc-400 text-xs leading-relaxed max-w-sm font-sans text-right md:text-right"
              dir="rtl"
            >
              {SITE_CONFIG.brand.subtitle}
            </p>
          </aside>

          {/* Column 2: Navigation & Telemetry Links */}
          <nav
            aria-label="لینک‌های دسترسی سریع و بخش‌های وب‌سایت"
            className="flex flex-col gap-1.5 md:items-end"
          >
            <div className="w-full max-w-xs">
              <div
                className="text-zinc-200 font-bold tracking-wider text-[11px] uppercase border-b border-white/[0.08] pb-1 flex items-center gap-1.5 font-mono tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{SITE_CONFIG.telemetry.directoryTitle}</span>
              </div>
              <ul className="space-y-0.5 text-xs font-mono list-none p-0 m-0 pt-1" dir="ltr">
                {SITE_CONFIG.nav.quickLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target={
                        link.isExternal && FEATURE_FLAGS.openLinksInNewTab ? '_blank' : undefined
                      }
                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                      aria-label={link.ariaLabel}
                      className="text-zinc-300 hover:text-emerald-300 transition-colors flex items-center justify-between group py-1.5 px-1.5 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        {link.label}
                        {link.isExternal ? (
                          <ArrowUpRight
                            className="w-3 h-3 text-zinc-300 group-hover:text-emerald-400 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono">
          <small className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono font-normal whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.brand.copyrightOwner}. ALL RIGHTS
              RESERVED.
            </span>
          </small>

          {FEATURE_FLAGS.backToTopButton ? (
            <LazyMotion features={domAnimation}>
              <m.button
                type="button"
                onClick={scrollToTop}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.12, ease: MOTION_EASINGS.entrance }}
                aria-label="بازگشت به ابتدای صفحه"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(12,12,15,0.85)] border border-white/[0.12] hover:border-emerald-500/60 hover:bg-emerald-950/20 text-xs text-zinc-200 hover:text-emerald-300 transition-colors duration-200 min-h-[38px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ArrowUp className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{SITE_CONFIG.telemetry.backToTopLabel}</span>
              </m.button>
            </LazyMotion>
          ) : null}
        </div>
      </div>

      {/* Decorative High-Resolution Digital ASCII / Unicode Fire */}
      {FEATURE_FLAGS.footerHorizon ? <DigitalFireContainer /> : null}
    </footer>
  );
};
