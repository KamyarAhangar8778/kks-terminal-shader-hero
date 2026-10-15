/**
 * @file middleware.ts
 * @description Next.js Middleware implementing Markdown for Agents content negotiation.
 * When an AI agent requests a page with `Accept: text/markdown`, it returns a structured
 * markdown version of the page content.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;

  if (accept.includes('text/markdown') && (pathname === '/' || pathname === '')) {
    const markdownContent = `# KKS Systems — استودیو مهندسی و طراحی وب

> توسعه وب‌سایت‌های مدرن، رابط‌های کاربری سفارشی و شیدرهای وب با تمرکز بر عملکرد سریع، کدنویسی استاندارد و تعاملات روان کاربری.

## بخش‌های اصلی وب‌سایت
- **بخش نخست (Hero):** شبیه‌ساز ترمینال و شیدر کاراکتری WebGL2 با استنسیل KKS.
- **نمونه‌کارها (Portfolio):** پروژه‌های منتخب شامل صفحات فرود، ابزارهای وب و پروژه‌های متن‌باز و سخت‌افزاری.
- **ثبت سفارش و تماس (Contact):** ارتباط مستقیم از طریق تلگرام (@kaveh8778)، ایمیل (kavehahangar8778@gmail.com) و فرم ثبت مشخصات پروژه.

## کشف خودکار (Agent Discovery)
- API Catalog: /.well-known/api-catalog
- ARD Capability Manifest: /.well-known/ai-catalog.json
- MCP Server Card: /.well-known/mcp/server-card.json
- Agent Skills Index: /.well-known/agent-skills/index.json
- OAuth Protected Resource: /.well-known/oauth-protected-resource
- Auth.md: /auth.md
`;

    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': '320',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
