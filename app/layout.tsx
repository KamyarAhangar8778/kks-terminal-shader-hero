import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CustomCursor } from '@/components/custom-cursor';
import { InitialAppLoader } from '@/components/ui/initial-app-loader';
import { SITE_CONFIG, FEATURE_FLAGS } from '@/lib/app-config';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${SITE_CONFIG.brand.shortName} // ${SITE_CONFIG.brand.tagline}`,
  description: SITE_CONFIG.brand.description,
  keywords: [
    'طراحی وب‌سایت',
    'توسعه وب',
    'Next.js',
    'Tailwind CSS',
    'Terminal Shader',
    SITE_CONFIG.brand.fullName,
    'Fullstack Developer',
  ],
  authors: [{ name: SITE_CONFIG.brand.fullName }],
  creator: SITE_CONFIG.brand.fullName,
  publisher: SITE_CONFIG.brand.fullName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: `${SITE_CONFIG.brand.shortName} // ${SITE_CONFIG.brand.tagline}`,
    description: SITE_CONFIG.brand.description,
    siteName: SITE_CONFIG.brand.fullName,
    locale: SITE_CONFIG.brand.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${SITE_CONFIG.brand.shortName} // ${SITE_CONFIG.brand.tagline}`,
    description: SITE_CONFIG.brand.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const JSON_LD_WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: `${SITE_CONFIG.brand.shortName} Terminal Shader Hero`,
  url: SITE_CONFIG.brand.siteUrl,
  description: SITE_CONFIG.brand.description,
  inLanguage: 'fa-IR',
  author: {
    '@type': 'Person',
    name: SITE_CONFIG.brand.authorName,
  },
};

const JSON_LD_STRING = JSON.stringify(JSON_LD_WEBSITE).replace(/</g, '\\u003c');

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const PERSIAN_UNICODE_RANGE =
  'U+0020, U+00A0, U+00AB, U+00BB, U+0600-06FF, U+0750-077F, U+08A0-08FF, U+200C-200F, U+FB50-FDFF, U+FE70-FEFF';

const FONT_FACE_CSS = `
@font-face {
  font-family: 'Kode Mono';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('${BASE_PATH}/fonts/KodeMono-Variable.woff2') format('woff2');
  unicode-range: U+0021-007E;
}
@font-face {
  font-family: 'IRANSans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${BASE_PATH}/fonts/IRANSansWeb-Regular.woff2') format('woff2');
  unicode-range: ${PERSIAN_UNICODE_RANGE};
}
@font-face {
  font-family: 'IRANSans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('${BASE_PATH}/fonts/IRANSansWeb-Medium.woff2') format('woff2');
  unicode-range: ${PERSIAN_UNICODE_RANGE};
}
@font-face {
  font-family: 'IRANSans';
  font-style: normal;
  font-weight: 600 900;
  font-display: swap;
  src: url('${BASE_PATH}/fonts/IRANSansWeb-Bold.woff2') format('woff2');
  unicode-range: ${PERSIAN_UNICODE_RANGE};
}
`;

/**
 * Root Application Layout Component
 *
 * Configures global typography variables, metadata, color scheme, and structured data.
 *
 * @param {{ children: React.ReactNode }} props Root component props.
 * @returns {React.ReactElement} Root HTML shell.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON_LD_STRING,
          }}
        />
        <link
          rel="preload"
          href={`${BASE_PATH}/fonts/KodeMono-Variable.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={`${BASE_PATH}/fonts/IRANSansWeb-Regular.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style
          id="kks-font-faces"
          dangerouslySetInnerHTML={{
            __html: FONT_FACE_CSS,
          }}
        />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://landing.ashkghalam.ir" />
        <link rel="dns-prefetch" href="https://kamyarahangar8778.github.io" />
      </head>
      <body
        className="font-sans antialiased bg-[#000000] text-[#fafafa] selection:bg-emerald-500/25 selection:text-emerald-100"
        suppressHydrationWarning
      >
        {FEATURE_FLAGS.initialLoader ? <InitialAppLoader /> : null}
        {FEATURE_FLAGS.customCursor ? <CustomCursor /> : null}
        {children}
      </body>
    </html>
  );
}
