import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/app-config';

export const dynamic = 'force-static';

/**
 * Generates static sitemap XML index for search engines.
 *
 * @returns {MetadataRoute.Sitemap} Sitemap URL array.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_CONFIG.brand.siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://kamyarahangar8778.github.io/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
