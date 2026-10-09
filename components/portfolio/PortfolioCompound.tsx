'use client';

import React, {
  createContext,
  use,
  useState,
  useTransition,
  useMemo,
  useCallback,
  Suspense,
} from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react';
import { GeometricBackground } from '@/components/common/GeometricBackground';
import { AsciiWordmarkCanvas } from '@/components/ascii-wordmark/AsciiWordmarkCanvas';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import { addTransitionType } from '@/components/view-transitions/types';
import { MOTION_EASINGS, containerStaggerVariants } from '@/lib/motion-tokens';
import {
  SHOWCASE_PROJECTS,
  PORTFOLIO_FLAGS,
  calculateCategoryCounts,
  filterProjectsByCategory,
} from '@/lib/portfolio-data';
import { FEATURE_FLAGS, SITE_CONFIG } from '@/lib/app-config';
import type { PortfolioProject, PortfolioCategoryFilter } from '@/types/portfolio';

const GRID_ITEM_TRANSITION = {
  layout: { duration: 0.25, ease: MOTION_EASINGS.smooth },
  opacity: { duration: 0.25, ease: MOTION_EASINGS.smooth },
  scale: { duration: 0.25, ease: MOTION_EASINGS.smooth },
  y: { duration: 0.25, ease: MOTION_EASINGS.smooth },
} as const;

export interface PortfolioState {
  activeCategory: PortfolioCategoryFilter;
  filteredProjects: PortfolioProject[];
  selectedProject: PortfolioProject | null;
  counts: Record<PortfolioCategoryFilter, number>;
}

export interface PortfolioActions {
  selectCategory: (category: PortfolioCategoryFilter) => void;
  inspectProject: (project: PortfolioProject) => void;
  closeModal: () => void;
}

export interface PortfolioMeta {
  sectionId: string;
  gridId: string;
  totalProjects: number;
}

export interface PortfolioContextValue {
  state: PortfolioState;
  actions: PortfolioActions;
  meta: PortfolioMeta;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function usePortfolioContext(): PortfolioContextValue {
  const context = use(PortfolioContext);
  if (!context) {
    throw new Error('Portfolio compound components must be rendered within <Portfolio.Provider>');
  }
  return context;
}

export function useOptionalPortfolioContext(): PortfolioContextValue | null {
  return use(PortfolioContext);
}

export function PortfolioProvider({
  children,
  state,
  actions,
  meta,
}: {
  children: React.ReactNode;
  state: PortfolioState;
  actions: PortfolioActions;
  meta: PortfolioMeta;
}) {
  const contextValue = useMemo(() => ({ state, actions, meta }), [state, actions, meta]);
  return <PortfolioContext value={contextValue}>{children}</PortfolioContext>;
}

/**
 * Stateful provider managing category filtering and modal inspection transitions
 * for the portfolio section.
 */
export function PortfolioStateProvider({
  children,
  initialProjects = SHOWCASE_PROJECTS,
  initialCategory = PORTFOLIO_FLAGS.DEFAULT_ACTIVE_CATEGORY,
}: {
  children: React.ReactNode;
  initialProjects?: PortfolioProject[];
  initialCategory?: PortfolioCategoryFilter;
}) {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategoryFilter>(initialCategory);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [, startModalTransition] = useTransition();

  const counts = useMemo(() => calculateCategoryCounts(initialProjects), [initialProjects]);
  const filteredProjects = useMemo(
    () => filterProjectsByCategory(activeCategory, initialProjects),
    [activeCategory, initialProjects]
  );

  const selectCategory = useCallback((category: PortfolioCategoryFilter) => {
    startModalTransition(() => {
      addTransitionType('filter-category');
      setActiveCategory(category);
    });
  }, []);

  const inspectProject = useCallback((project: PortfolioProject) => {
    startModalTransition(() => {
      addTransitionType('select-project');
      setSelectedProject(project);
    });
  }, []);

  const closeModal = useCallback(() => {
    startModalTransition(() => {
      addTransitionType('close-project');
      setSelectedProject(null);
    });
  }, []);

  const state = useMemo<PortfolioState>(
    () => ({
      activeCategory,
      filteredProjects,
      selectedProject,
      counts,
    }),
    [activeCategory, filteredProjects, selectedProject, counts]
  );

  const actions = useMemo<PortfolioActions>(
    () => ({
      selectCategory,
      inspectProject,
      closeModal,
    }),
    [selectCategory, inspectProject, closeModal]
  );

  const meta = useMemo<PortfolioMeta>(
    () => ({
      sectionId: SITE_CONFIG.nav.sectionIds.portfolio,
      gridId: 'portfolio-projects-grid',
      totalProjects: initialProjects.length,
    }),
    [initialProjects.length]
  );

  return (
    <PortfolioProvider state={state} actions={actions} meta={meta}>
      {children}
    </PortfolioProvider>
  );
}

export function PortfolioFrame({ children }: { children: React.ReactNode }) {
  const { meta } = usePortfolioContext();

  return (
    <section
      id={meta.sectionId}
      className="relative w-full py-20 sm:py-28 md:py-36 bg-[#000000] border-t border-white/[0.08] flex flex-col items-center justify-center overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      {FEATURE_FLAGS.geometricBackgrounds ? <GeometricBackground variant="portfolio" /> : null}

      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.065)_0%,rgba(16,185,129,0.02)_45%,transparent_75%)] pointer-events-none -z-10"
      />

      <div className="relative z-10 adaptive-container max-w-6xl w-full">
        <LazyMotion features={domAnimation}>
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
              margin: '0px 0px -40px 0px',
            }}
            variants={containerStaggerVariants}
            className="flex flex-col gap-8 sm:gap-12"
          >
            {children}
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}

const PORTFOLIO_HEADER_INFO_NODE = (
  <div className="flex flex-col gap-2 text-right" dir="rtl">
    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 font-sans">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>نمونه‌کارها و پروژه‌ها</span>
    </div>

    <h2 className="text-2xl sm:text-3xl font-black text-zinc-50 font-sans tracking-tight">
      پروژه‌ها و سیستم‌های پیاده‌سازی‌شده
    </h2>

    <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
      مجموعه‌ای از صفحات فرود، ابزارهای تخصصی تحت وب و کتابخانه‌های متن‌باز با کارایی بالا.
    </p>
  </div>
);

const EMPTY_PORTFOLIO_NODE = (
  <ViewTransition enter="fade-in" exit="fade-out" default="none">
    <li className="col-span-full py-16 text-center text-zinc-400 font-sans text-sm rounded-2xl border border-white/[0.08] bg-zinc-950/50">
      هیچ پروژه‌ای در این دسته‌بندی یافت نشد.
    </li>
  </ViewTransition>
);

const WORDMARK_FALLBACK_NODE = (
  <ViewTransition exit="slide-down" default="none">
    <div className="w-full h-[325px] sm:h-[320px] md:h-[380px] flex items-center justify-center text-zinc-600 font-sans text-xs">
      در حال بارگذاری...
    </div>
  </ViewTransition>
);

export function PortfolioHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
      {PORTFOLIO_HEADER_INFO_NODE}
      {children}
    </div>
  );
}

export function PortfolioGrid({
  renderItem,
}: {
  renderItem: (project: PortfolioProject) => React.ReactNode;
}) {
  const {
    state: { filteredProjects },
    meta: { gridId },
  } = usePortfolioContext();

  return (
    <ul
      id={gridId}
      className="relative grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 list-none p-0 m-0 w-full min-h-[300px]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {filteredProjects.map((project) => (
          <ViewTransition key={project.id}>
            <m.li
              layout="position"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: -12,
                transition: { duration: 0.2, ease: MOTION_EASINGS.smooth },
              }}
              transition={GRID_ITEM_TRANSITION}
              className="h-full flex flex-col [transform:translateZ(0)]"
            >
              {renderItem(project)}
            </m.li>
          </ViewTransition>
        ))}
      </AnimatePresence>

      {filteredProjects.length === 0 ? EMPTY_PORTFOLIO_NODE : null}
    </ul>
  );
}

export function PortfolioWordmark() {
  if (!FEATURE_FLAGS.asciiWordmark) return null;

  return (
    <ViewTransition>
      <div className="relative w-full mt-8 sm:mt-12 flex items-center justify-center overflow-hidden [content-visibility:auto]">
        <Suspense fallback={WORDMARK_FALLBACK_NODE}>
          <ViewTransition enter="slide-up" default="none">
            <AsciiWordmarkCanvas word={SITE_CONFIG.brand.shortName} />
          </ViewTransition>
        </Suspense>
      </div>
    </ViewTransition>
  );
}
