import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/app-config';

export const dynamic = 'force-static';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

Content-Signal: ai-train=no, search=yes, ai-input=no

Sitemap: ${SITE_CONFIG.brand.siteUrl}/sitemap.xml
Sitemap: https://kamyarahangar8778.github.io/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
