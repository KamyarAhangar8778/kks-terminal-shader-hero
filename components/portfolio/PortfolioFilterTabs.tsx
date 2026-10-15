'use client';

import React, { useOptimistic, useTransition } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import type { PortfolioCategoryFilter } from '@/types/portfolio';
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_FLAGS,
  SHOWCASE_PROJECTS,
  calculateCategoryCounts,
} from '@/lib/portfolio-data';
import { useOptionalPortfolioContext } from './PortfolioCompound';

export type { PortfolioCategoryFilter };

const NOOP = () => {};

const FILTER_LABEL_NODE = (
  <div className="flex items-center gap-1.5 px-2.5 py-1 text-zinc-300 text-xs font-sans shrink-0 border-l border-white/[0.08] ml-1">
    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
    <span className="font-medium whitespace-nowrap text-[11px] sm:text-xs">فیلتر:</span>
  </div>
);

interface PortfolioFilterTabsProps {
  activeCategory?: PortfolioCategoryFilter;
  onSelectCategory?: (category: PortfolioCategoryFilter) => void;
  counts?: Record<PortfolioCategoryFilter, number>;
}

export const PortfolioFilterTabs: React.FC<PortfolioFilterTabsProps> = ({
  activeCategory: propCategory,
  onSelectCategory: propSelectCategory,
  counts: propCounts,
}) => {
  const portfolioContext = useOptionalPortfolioContext();
  const activeCategory =
    propCategory ??
    portfolioContext?.state.activeCategory ??
    PORTFOLIO_FLAGS.DEFAULT_ACTIVE_CATEGORY;
  const counts =
    propCounts ?? portfolioContext?.state.counts ?? calculateCategoryCounts(SHOWCASE_PROJECTS);
  const onSelectCategory = propSelectCategory ?? portfolioContext?.actions.selectCategory ?? NOOP;
  const [optimisticCategory, setOptimisticCategory] = useOptimistic(activeCategory);
  const [, startTabTransition] = useTransition();

  const handleSelect = (category: PortfolioCategoryFilter) => {
    if (category === optimisticCategory) return;
    startTabTransition(() => {
      setOptimisticCategory(category);
      onSelectCategory(category);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % PORTFOLIO_CATEGORIES.length;
      const targetTab = PORTFOLIO_CATEGORIES[nextIndex];
      if (targetTab) handleSelect(targetTab.id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const prevIndex =
        (currentIndex - 1 + PORTFOLIO_CATEGORIES.length) % PORTFOLIO_CATEGORIES.length;
      const targetTab = PORTFOLIO_CATEGORIES[prevIndex];
      if (targetTab) handleSelect(targetTab.id);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        role="tablist"
        aria-label="دسته‌بندی پروژه‌ها"
        className="relative flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] border-t-white/25 backdrop-blur-xl max-w-full select-none shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-x-auto scrollbar-none overscroll-x-contain flex-nowrap sm:flex-wrap"
        dir="rtl"
      >
        {FILTER_LABEL_NODE}

        {PORTFOLIO_CATEGORIES.map((tab, idx) => {
          const isOptimisticActive = optimisticCategory === tab.id;
          const isCommittedActive = activeCategory === tab.id;
          const count = counts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isOptimisticActive}
              aria-controls="portfolio-projects-grid"
              onClick={() => handleSelect(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 min-h-[36px] sm:min-h-[38px] font-sans cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors duration-200 select-none shrink-0 whitespace-nowrap ${
                isOptimisticActive
                  ? 'text-emerald-300 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {isCommittedActive ? (
                <ViewTransition
                  name="portfolio-active-tab-pill"
                  share="tab-underline"
                  default="none"
                >
                  <m.span
                    layoutId="active-portfolio-category-pill"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-lg bg-emerald-950/80 border border-emerald-500/60 border-t-emerald-400/80 -z-10 shadow-[0_2px_12px_rgba(16,185,129,0.25)] pointer-events-none"
                    aria-hidden="true"
                  />
                </ViewTransition>
              ) : null}

              <span className="relative z-10">{tab.label}</span>

              <m.span
                key={`${tab.id}-${count}`}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`relative z-10 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-sm transition-colors duration-200 ${
                  isOptimisticActive
                    ? 'bg-emerald-900/90 text-emerald-200 font-bold border border-emerald-500/40'
                    : 'bg-white/[0.06] text-zinc-400'
                }`}
              >
                {count}
              </m.span>
            </button>
          );
        })}
      </div>
    </LazyMotion>
  );
};
