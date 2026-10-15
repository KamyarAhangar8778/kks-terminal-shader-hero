import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Generates static sitemap XML index for search engines.
 *
 * @returns {MetadataRoute.Sitemap} Sitemap URL array.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kks-terminal.dev',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
