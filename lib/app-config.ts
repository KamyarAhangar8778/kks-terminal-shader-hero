/**
 * @file lib/app-config.ts
 * @description Central Single Source of Truth for Feature Flags, Brand Tokens,
 * Contact Details, Social Profiles, Navigation Identifiers, and System Telemetry.
 *
 * ⚠️ مرجع اصلی تنظیمات، پرچم‌ها (Flags) و توکن‌ها (Tokens):
 * هر زمان که نیاز به تغییر نام برند، پیوندهای شبکه‌های اجتماعی، ایمیل دریافت سفارش،
 * فعال/غیرفعال‌سازی المان‌ها یا متون تکراری داشتید، فقط همین فایل را ویرایش کنید
 * تا تغییرات بلافاصله در کل وب‌سایت اعمال شود.
 */

/**
 * پرچم‌های قابلیت (Feature Flags)
 * کلیدهای سراسری روشن/خاموش برای بخش‌ها، انیمیشن‌ها و ویژگی‌های بصری سایت.
 */
export const FEATURE_FLAGS = {
  /** فعال بودن شیدر تعاملی شبکه کاراکتری ترمینال در پس‌زمینه هیرو */
  terminalShader: true,

  /** فعال بودن نشانگر لیزری سفارشی (Custom Kinematic Cursor) در موس‌های معمولی */
  customCursor: true,

  /** فعال بودن افکت خطوط پویش و پرش لامپ تصویر (CRT Screen Scanlines & Flicker) */
  crtOverlay: true,

  /** نمایش دکمه‌های شبکه‌های اجتماعی در گوشه بالای صفحه هیرو */
  heroSocialLinks: true,

  /** رندر بوم سه‌بعدی اسکی آرت KKS در انتهای بخش نمونه‌کارها */
  asciiWordmark: true,

  /** فعال بودن انیمیشن ذرات و خط افق سایبری در فوتر */
  footerHorizon: true,

  /** فعال بودن لودر مینیمال اسکی خطی در زمان لود اولیه سایت */
  initialLoader: true,

  /** فعال بودن پس‌زمینه‌های برداری هندسی (Geometric Background Grid) */
  geometricBackgrounds: true,

  /** نمایش دکمه بازگشت به بالای صفحه در فوتر (Back to Top) */
  backToTopButton: true,

  /** نمایش نشانگر پالس‌دار رادار سبز روی پروژه‌های مستقر شده (Live Pulse) */
  portfolioOnlineBadge: true,

  /** باز شدن لینک‌های پروژه‌ها و شبکه‌های اجتماعی در تب جدید مرورگر */
  openLinksInNewTab: true,

  /** امکان عضویت پروژه‌ها در چند دسته‌بندی به‌صورت همزمان */
  portfolioMultiCategory: true,

  /** اجرای یک‌باره انیمیشن‌های اسکرول و آشکارسازی متن‌ها (Fade-up & Slide-up reveal once) */
  textRevealOnce: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * توکن‌ها و مشخصات سراسری سایت (Site Configuration & Brand Tokens)
 */
export const SITE_CONFIG = {
  /** مشخصات برند و هویت سازمانی */
  brand: {
    shortName: 'KKS',
    fullName: 'KKS Systems',
    tagline: 'توسعه وب و رابط‌های کاربری',
    subtitle: 'توسعه وب و طراحی رابط کاربری سفارشی با تمرکز بر عملکرد، تعامل روان و اجرای دقیق.',
    description:
      'توسعه وب‌سایت، رابط‌های کاربری سفارشی و سیستم‌های تحت وب با تمرکز بر عملکرد سریع و پیاده‌سازی تمیز.',
    siteUrl: 'https://kks-terminal.dev',
    authorName: 'Kamyar Ahangar (KKS)',
    copyrightOwner: 'KKS',
    locale: 'fa_IR',
  },

  /** پیوندهای شبکه‌های اجتماعی */
  socialLinks: [
    {
      id: 'social-github',
      name: 'GitHub',
      url: 'https://github.com/KamyarAhangar8778',
      handle: 'KamyarAhangar8778',
      ariaLabel: 'پروفایل گیت‌هاب Kamyar Ahangar',
      title: 'GitHub // KamyarAhangar8778',
      iconType: 'github' as const,
    },
    {
      id: 'social-telegram',
      name: 'Telegram',
      url: 'https://t.me/kaveh8778',
      handle: '@kaveh8778',
      ariaLabel: 'کانال یا پیام در تلگرام @kaveh8778',
      title: 'Telegram // @kaveh8778',
      iconType: 'telegram' as const,
    },
    {
      id: 'social-x',
      name: 'X (Twitter)',
      url: 'https://x.com/kave8778',
      handle: '@kave8778',
      ariaLabel: 'پروفایل توییتر / ایکس @kave8778',
      title: 'X // @kave8778',
      iconType: 'x' as const,
    },
  ],

  /** تنظیمات و پروتکل ارسال سفارش و فرم تماس */
  contact: {
    /** آدرس ایمیل دریافت‌کننده سفارش‌ها و پیام‌ها */
    recipientEmail: 'kavehahangar8778@gmail.com',
    /** پیشوند عنوان ایمیل‌های ارسالی */
    subjectPrefix: '[PROJECT_INQUIRY]',
    /** حداکثر طول مجاز متن یادداشت‌ها */
    maxNotesLength: 1000,
    /** برچسب پورت در هدر بخش تماس */
    portTelemetry: 'PORT: 0x443',
    /** تیتر بخش تماس */
    heading: 'تماس و سفارش پروژه',
    /** متن راهنمای فرم تماس */
    subheading: 'برای سفارش وب‌سایت یا مطرح کردن ایده، فرم زیر را تکمیل کنید.',
  },

  /** شناسه‌ها و پیوندهای ناوبری صفحات */
  nav: {
    sectionIds: {
      hero: 'hero-terminal-section',
      portfolio: 'portfolio-showcase-section',
      contact: 'contact-inquiry-section',
      footer: 'main-app-footer',
    },
    quickLinks: [
      {
        id: 'nav-link-hero',
        label: 'صفحه اصلی (Hero)',
        href: '#hero-terminal-section',
        isExternal: false,
        ariaLabel: 'رفتن به بخش صفحه اصلی',
      },
      {
        id: 'nav-link-portfolio',
        label: 'پروژه‌ها و نمونه‌کارها',
        href: '#portfolio-showcase-section',
        isExternal: false,
        ariaLabel: 'رفتن به بخش پروژه‌ها و نمونه‌کارها',
      },
      {
        id: 'nav-link-ashkghalam',
        label: 'سایت زنده اشک قلم',
        href: 'https://landing.ashkghalam.ir',
        isExternal: true,
        ariaLabel: 'پروژه زنده اشک قلم در تب جدید',
      },
      {
        id: 'nav-link-contact',
        label: 'ثبت سفارش و تماس',
        href: '#contact-inquiry-section',
        isExternal: false,
        ariaLabel: 'رفتن به فرم ثبت سفارش و تماس',
      },
    ],
  },

  /** پیام‌ها و برچسب‌های متنی تله‌متری سایبری */
  telemetry: {
    sysOnline: 'SYS // ONLINE',
    terminalReady: 'TERMINAL // READY',
    inquiryProtocol: 'SYS.TRANSMISSION // INQUIRY_PROTOCOL',
    directoryTitle: 'DIRECTORY // LINKS',
    backToTopLabel: 'BACK_TO_TOP',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
