'use client';

/**
 * @file components/hero/HeroSocialLinks.tsx
 * @description Renders cybernetic icon buttons in the top-left corner of the HeroSection
 * linking to GitHub, Telegram, and X (Twitter) profiles.
 */

import React from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { IconBrandGithub, IconBrandTelegram, IconBrandX } from '@tabler/icons-react';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { SITE_CONFIG } from '@/lib/app-config';

const ICON_MAP = {
  github: IconBrandGithub,
  telegram: IconBrandTelegram,
  x: IconBrandX,
} as const;

const SOCIAL_HOVER_ANIMATION = { scale: 1.08, y: -2, transition: { duration: 0.15 } };
const SOCIAL_TAP_ANIMATION = { scale: 0.94, transition: { duration: 0.1 } };

/**
 * HeroSocialLinks Component
 *
 * Positioned in the top-left corner of the HeroSection with subtle backdrop blur,
 * high-contrast borders, accessible labels, and smooth hover feedback.
 *
 * @returns {React.ReactElement} Navigation container containing social icon links.
 */
export const HeroSocialLinks: React.FC = () => {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <LazyMotion features={domAnimation}>
      <nav
        id="hero-social-navigation"
        aria-label="پیوندهای شبکه‌های اجتماعی"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-40 flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-950/75 border border-white/[0.08] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.65)] pointer-events-auto"
        style={{ viewTransitionName: 'hero-social-nav' }}
        dir="ltr"
      >
        {SITE_CONFIG.socialLinks.map((item) => {
          const Icon = ICON_MAP[item.iconType];
          return (
            <m.a
              key={item.id}
              id={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              title={item.title}
              data-interactive="true"
              whileHover={prefersReducedMotion ? undefined : SOCIAL_HOVER_ANIMATION}
              whileTap={prefersReducedMotion ? undefined : SOCIAL_TAP_ANIMATION}
              className="group relative flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 hover:text-white hover:border-emerald-400/45 hover:bg-emerald-500/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors duration-150"
            >
              <Icon
                className="w-4 h-4 sm:w-[17px] sm:h-[17px] transition-transform duration-150 group-hover:drop-shadow-[0_0_8px_rgba(110,231,183,0.45)]"
                strokeWidth={1.85}
                aria-hidden="true"
              />
            </m.a>
          );
        })}
      </nav>
    </LazyMotion>
  );
};
