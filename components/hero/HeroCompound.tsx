'use client';

import React, { createContext, use, useMemo } from 'react';
import { TerminalShaderCanvas } from './TerminalShaderCanvas';
import { HeroSocialLinks } from './HeroSocialLinks';
import { FEATURE_FLAGS, SITE_CONFIG } from '@/lib/app-config';

export interface HeroState {
  terminalShader: boolean;
  heroSocialLinks: boolean;
}

export interface HeroActions {
  onPulse?: () => void;
}

export interface HeroMeta {
  sectionId: string;
}

export interface HeroContextValue {
  state: HeroState;
  actions: HeroActions;
  meta: HeroMeta;
}

const DEFAULT_HERO_CONTEXT: HeroContextValue = {
  state: {
    terminalShader: FEATURE_FLAGS.terminalShader,
    heroSocialLinks: FEATURE_FLAGS.heroSocialLinks,
  },
  actions: {},
  meta: {
    sectionId: SITE_CONFIG.nav.sectionIds.hero,
  },
};

const HeroContext = createContext<HeroContextValue>(DEFAULT_HERO_CONTEXT);

export function useHeroContext(): HeroContextValue {
  return use(HeroContext);
}

export function HeroProvider({
  children,
  state,
  actions,
  meta,
}: {
  children: React.ReactNode;
  state?: Partial<HeroState>;
  actions?: HeroActions;
  meta?: Partial<HeroMeta>;
}) {
  const contextValue = useMemo<HeroContextValue>(
    () =>
      !state && !actions && !meta
        ? DEFAULT_HERO_CONTEXT
        : {
            state: state ? { ...DEFAULT_HERO_CONTEXT.state, ...state } : DEFAULT_HERO_CONTEXT.state,
            actions: actions ?? DEFAULT_HERO_CONTEXT.actions,
            meta: meta ? { ...DEFAULT_HERO_CONTEXT.meta, ...meta } : DEFAULT_HERO_CONTEXT.meta,
          },
    [state, actions, meta]
  );

  return <HeroContext value={contextValue}>{children}</HeroContext>;
}

export function HeroFrame({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const { meta } = useHeroContext();

  return (
    <section
      id={id ?? meta.sectionId}
      aria-label={SITE_CONFIG.brand.fullName}
      className={
        className ||
        'relative w-full h-screen h-[100dvh] min-h-screen min-h-[100dvh] overflow-hidden bg-[#060608] flex items-center justify-center select-none'
      }
    >
      <div
        aria-hidden="false"
        className="pointer-events-none select-none absolute inset-0 z-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="text-6xl sm:text-8xl font-mono font-bold tracking-[0.25em] text-[#070709] leading-none">
          {SITE_CONFIG.brand.shortName}
        </h1>
        <p className="mt-3 max-w-md text-sm sm:text-base font-sans text-[#070709] leading-relaxed">
          {SITE_CONFIG.brand.tagline}
        </p>
      </div>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 sm:h-28 md:h-36 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-transparent"
      />
    </section>
  );
}

export function HeroCanvas() {
  const { state } = useHeroContext();
  if (!state.terminalShader) return null;
  return <TerminalShaderCanvas />;
}

export function HeroSocials() {
  const { state } = useHeroContext();
  if (!state.heroSocialLinks) return null;
  return <HeroSocialLinks />;
}
