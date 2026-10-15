/* eslint-disable no-console */
/**
 * @file scripts/optimize-pages.mjs
 * @description Post-build optimization script for static export:
 * 1. Inlines critical CSS into <head> and makes stylesheet preload non-blocking.
 * 2. Adds defer attribute to polyfills script tag to eliminate render-blocking scripts.
 * 3. Ensures robots.txt and sitemap.xml are available at root and subpath.
 */

import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('out');

if (!fs.existsSync(outDir)) {
  console.log('[optimize-pages] out/ directory not found. Skipping.');
  process.exit(0);
}

// 1. Identify CSS assets
const cssDir = path.join(outDir, '_next', 'static', 'css');
let cssContent = '';
let cssFileName = '';

if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));
  if (cssFiles.length > 0) {
    cssFileName = cssFiles[0];
    cssContent = fs.readFileSync(path.join(cssDir, cssFileName), 'utf8');
  }
}

// 2. Process HTML files
const htmlFiles = ['index.html', '404.html']
  .map((file) => path.join(outDir, file))
  .filter((filePath) => fs.existsSync(filePath));

for (const htmlPath of htmlFiles) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Defer polyfills script
  html = html.replace(/(<script[^>]*src=["'][^"']*polyfills[^"']*["'][^>]*)>/gi, (match, tag) => {
    return tag.includes('defer') ? match : `${tag} defer="">`;
  });

  // Inline CSS and convert stylesheet link to non-blocking preload
  if (cssContent && cssFileName) {
    const escapedFileName = cssFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cssLinkRegex = new RegExp(
      `<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*${escapedFileName}["'][^>]*\\/?>`,
      'i'
    );

    const nonBlockingCss = [
      `<style id="critical-inlined-css">${cssContent}</style>`,
      `<link rel="preload" href="/kks-terminal-shader-hero/_next/static/css/${cssFileName}" as="style" onload="this.onload=null;this.rel='stylesheet'"/>`,
      `<noscript><link rel="stylesheet" href="/kks-terminal-shader-hero/_next/static/css/${cssFileName}"/></noscript>`,
    ].join('');

    if (cssLinkRegex.test(html)) {
      html = html.replace(cssLinkRegex, nonBlockingCss);
    }
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
}

// 3. Mirror robots.txt and sitemap.xml in subpath folder as well
const subpathDir = path.join(outDir, 'kks-terminal-shader-hero');
fs.mkdirSync(subpathDir, { recursive: true });

for (const fileName of [
  'robots.txt',
  'sitemap.xml',
  'icon.svg',
  'apple-touch-icon.png',
  'og-image.png',
  'manifest.webmanifest',
]) {
  const src = path.join(outDir, fileName);
  const dest = path.join(subpathDir, fileName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

console.log(
  '[optimize-pages] Successfully inlined critical CSS, deferred scripts, and mirrored metadata.'
);
