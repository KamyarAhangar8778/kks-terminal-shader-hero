import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/app-config';

export const dynamic = 'force-static';

/**
 * Generates static robots.txt directives for search engine crawlers.
 *
 * @returns {MetadataRoute.Robots} Robots rules configuration.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_CONFIG.brand.siteUrl}/sitemap.xml`,
  };
}
