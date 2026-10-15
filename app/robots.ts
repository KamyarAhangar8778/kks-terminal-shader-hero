import type { MetadataRoute } from 'next';

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
    sitemap: 'https://kks-terminal.dev/sitemap.xml',
  };
}
