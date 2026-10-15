/**
 * @file lib/portfolio-data.ts
 * @description Centralized data source, configuration flags, and tokens for the Portfolio module.
 * Modifying project details, categories, or feature flags here reflects across all portfolio components
 * without needing to edit multiple individual UI files.
 */

import type {
  PortfolioProject,
  PortfolioCategoryId,
  PortfolioCategoryFilter,
} from '@/types/portfolio';
import { FEATURE_FLAGS } from '@/lib/app-config';

/**
 * Feature Flags & Design Tokens for Portfolio
 * Centralized switches to toggle features or behavior app-wide.
 */
export const PORTFOLIO_FLAGS = {
  /** Display live pulsing radar badge exclusively on projects deployed online */
  SHOW_ONLINE_BADGE_FOR_DEPLOYED: FEATURE_FLAGS.portfolioOnlineBadge,
  /** Allow multi-category membership so a project can appear under multiple tabs */
  ENABLE_MULTI_CATEGORY: FEATURE_FLAGS.portfolioMultiCategory,
  /** Open external URLs in a new browser tab with security attributes */
  OPEN_IN_NEW_TAB: FEATURE_FLAGS.openLinksInNewTab,
  /** Default category selected on page load */
  DEFAULT_ACTIVE_CATEGORY: 'ALL' as PortfolioCategoryFilter,
  /**
   * Viewport trigger configuration for text slide-up reveal animations.
   * Ensures texts only animate once when the visitor scrolls to them.
   */
  TEXT_REVEAL_ONCE: FEATURE_FLAGS.textRevealOnce,
  TEXT_REVEAL_AMOUNT: 0.35,
  TEXT_REVEAL_MARGIN: '0px 0px -50px 0px',
} as const;

/**
 * Portfolio Categories Definition
 * Single source of truth for tab keys, display labels, and order.
 */
export const PORTFOLIO_CATEGORIES: ReadonlyArray<{
  readonly id: PortfolioCategoryId;
  readonly label: string;
  readonly description?: string;
}> = [
  { id: 'ALL', label: 'همه پروژه‌ها', description: 'تمام پروژه‌ها و نمونه‌کارها' },
  {
    id: 'WEB_DEPLOYMENT',
    label: 'صفحات فرود',
    description: 'لندینگ‌پیج‌ها و استقرارهای استاتیک وب',
  },
  {
    id: 'WEB_APPLICATION',
    label: 'ابزارهای وب',
    description: 'برنامه‌ها و ابزارهای کاربردی تحت وب',
  },
];

/**
 * Central Showcased Projects Dataset
 */
export const SHOWCASE_PROJECTS: PortfolioProject[] = [
  {
    id: 'ashkghalam-landing',
    title: 'لندینگ پیج اشک قلم',
    category: 'WEB_DEPLOYMENT // LANDING_PAGE',
    categories: ['WEB_DEPLOYMENT'],
    description:
      'صفحه معرفی و سفارش کتاب اشک قلم با استقرار استاتیک سریع، تایپوگرافی استاندارد فارسی و رابط کاربری واکنش‌گرا.',
    url: 'https://landing.ashkghalam.ir',
    domainText: 'landing.ashkghalam.ir',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    status: 'LIVE',
    isDeployed: true,
    version: 'v2.4 // STABLE',
    highlights: [
      'طراحی بهینه‌شده برای موبایل، تبلت و دسکتاپ',
      'تایپوگرافی فارسی خوانا با لود سریع فونت‌ها',
      'استقرار استاتیک و سرعت لود بالا',
    ],
  },
  {
    id: 'markdown-rtl-viewer',
    title: 'استودیو راست‌چین مارک‌داون (RTL Markdown Studio)',
    category: 'WEB_APPLICATION // TOOLING',
    categories: ['WEB_APPLICATION'],
    description:
      'ویرایشگر و پیش‌نمایش متون مارک‌داون دوجهته (فارسی، عربی و انگلیسی) با پاسداری کامل از سینتکس کد، جدول‌ها و حریم خصوصی.',
    url: 'https://kamyarahangar8778.github.io/Markdown-RTL-Viewer/',
    domainText: 'kamyarahangar8778.github.io/Markdown-RTL-Viewer',
    tags: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'GFM'],
    status: 'LIVE',
    isDeployed: true,
    version: 'v2.0 // STABLE',
    highlights: [
      'نمایش بلادرنگ متن مارک‌داون به صورت کاملاً راست‌چین و تفکیک بلوک‌های کد',
      'پشتیبانی از جدول‌ها، چک‌باکس‌ها و سینتکس استاندارد GFM',
      'ذخیره‌سازی لوکال در مرورگر بدون ارسال داده به سرور',
    ],
  },
  {
    id: 'offline-file-converter',
    title: 'پلتفرم آفلاین تبدیل و فشرده‌سازی فایل‌ها (Media Converter)',
    category: 'WEB_APPLICATION // OPEN_SOURCE_TOOL',
    categories: ['WEB_APPLICATION'],
    description:
      'پلتفرم تحت وب کاملاً کلاینت‌ساید و امن جهت تبدیل فرمت‌ها و فشرده‌سازی فایل‌ها در مرورگر با هسته FFmpeg.wasm به شکل آفلاین (PWA).',
    url: 'https://github.com/KamyarAhangar8778/Offline-platform-for-converting-and-compressing-files',
    domainText: 'github.com/KamyarAhangar8778/Offline-platform...',
    tags: ['FFmpeg.wasm', 'WebAssembly', 'Next.js', 'TypeScript', 'PWA', 'Tailwind CSS'],
    status: 'SOURCE',
    isDeployed: false,
    version: 'v1.5 // STABLE',
    highlights: [
      'حفظ ۱۰۰٪ حریم خصوصی با پردازش لوکال FFmpeg.wasm بدون آپلود فایل‌ها به سرور',
      'پشتیبانی کامل از استاندارد PWA جهت اجرای کاملاً آفلاین',
      'معماری Singleton WASM و رندر پیشرفت ۶۰ فریم بر ثانیه بدون افت پرفورمنس',
    ],
  },
];

function computeCategoryCounts(
  projects: PortfolioProject[]
): Record<PortfolioCategoryFilter, number> {
  const counts: Record<PortfolioCategoryFilter, number> = {
    ALL: projects.length,
    WEB_DEPLOYMENT: 0,
    WEB_APPLICATION: 0,
  };

  for (let i = 0; i < projects.length; i++) {
    const cats = projects[i]?.categories;
    if (cats) {
      for (let j = 0; j < cats.length; j++) {
        const cat = cats[j]!;
        if (cat !== 'ALL' && cat in counts) {
          counts[cat] += 1;
        }
      }
    }
  }

  return counts;
}

const STATIC_CATEGORY_COUNTS: Readonly<Record<PortfolioCategoryFilter, number>> =
  computeCategoryCounts(SHOWCASE_PROJECTS);

const STATIC_FILTERED_PROJECTS: Readonly<Record<PortfolioCategoryFilter, PortfolioProject[]>> = {
  ALL: SHOWCASE_PROJECTS,
  WEB_DEPLOYMENT: SHOWCASE_PROJECTS.filter((p) => p.categories?.includes('WEB_DEPLOYMENT')),
  WEB_APPLICATION: SHOWCASE_PROJECTS.filter((p) => p.categories?.includes('WEB_APPLICATION')),
};

/**
 * Computes counts for each category based on project category array membership.
 * Returns pre-computed O(1) snapshot when called with the default SHOWCASE_PROJECTS dataset.
 *
 * @param projects List of portfolio projects
 * @returns Object mapping category IDs to count numbers
 */
export function calculateCategoryCounts(
  projects: PortfolioProject[] = SHOWCASE_PROJECTS
): Record<PortfolioCategoryFilter, number> {
  if (projects === SHOWCASE_PROJECTS) {
    return STATIC_CATEGORY_COUNTS as Record<PortfolioCategoryFilter, number>;
  }
  return computeCategoryCounts(projects);
}

/**
 * Filters projects by category identifier.
 * Returns memoized O(1) array when called with the default SHOWCASE_PROJECTS dataset.
 *
 * @param category Target category filter
 * @param projects Optional source projects list
 * @returns Filtered array of projects
 */
export function filterProjectsByCategory(
  category: PortfolioCategoryFilter,
  projects: PortfolioProject[] = SHOWCASE_PROJECTS
): PortfolioProject[] {
  if (category === 'ALL') {
    return projects;
  }
  if (projects === SHOWCASE_PROJECTS) {
    return STATIC_FILTERED_PROJECTS[category];
  }
  return projects.filter(
    (project) =>
      project.categories &&
      project.categories.indexOf(category as 'WEB_DEPLOYMENT' | 'WEB_APPLICATION') !== -1
  );
}
