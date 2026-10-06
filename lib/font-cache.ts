/**
 * @file lib/font-cache.ts
 * @description Persistent browser CacheStorage + FontFaceSet manager for Kode Mono (English/Latin)
 * and IRANSans (Persian). Also provides the raw Kode Mono WOFF2 ArrayBuffer for isolated
 * Web Worker OffscreenCanvas contexts (which do not inherit main-thread document.fonts).
 */

const FONT_CACHE_NAME = 'kks-fonts-cache-v2';

const PERSIAN_UNICODE_RANGE =
  'U+0020, U+00A0, U+00AB, U+00BB, U+0600-06FF, U+0750-077F, U+08A0-08FF, U+200C-200F, U+FB50-FDFF, U+FE70-FEFF';

const STATIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const GITHUB_PAGES_REPO_PREFIX = '/kks-terminal-shader-hero';

/**
 * Resolves a public font asset path against `NEXT_PUBLIC_BASE_PATH` (or runtime
 * GitHub Pages subpath `/kks-terminal-shader-hero`) so font fetches succeed both at `/` and on GitHub Pages.
 */
export function resolveFontAssetUrl(assetPath: string): string {
  if (STATIC_BASE_PATH && !assetPath.startsWith(STATIC_BASE_PATH)) {
    return `${STATIC_BASE_PATH}${assetPath}`;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith(GITHUB_PAGES_REPO_PREFIX) &&
    !assetPath.startsWith(GITHUB_PAGES_REPO_PREFIX)
  ) {
    return `${GITHUB_PAGES_REPO_PREFIX}${assetPath}`;
  }
  return assetPath;
}

export const FONT_URLS = {
  kodeMono: `${STATIC_BASE_PATH}/fonts/KodeMono-Variable.woff2`,
  iranSansRegular: `${STATIC_BASE_PATH}/fonts/IRANSansWeb-Regular.woff2`,
  iranSansMedium: `${STATIC_BASE_PATH}/fonts/IRANSansWeb-Medium.woff2`,
  iranSansBold: `${STATIC_BASE_PATH}/fonts/IRANSansWeb-Bold.woff2`,
} as const;

const DEFAULT_SANS_STACK = '"IRANSans", "Kode Mono", system-ui, -apple-system, sans-serif';

const DEFAULT_MONO_STACK =
  '"Kode Mono", "JetBrains Mono", Consolas, "Cascadia Mono", "SF Mono", Menlo, Monaco, "DejaVu Sans Mono", ui-monospace, monospace';

let cachedMonoFamily: string | null = null;
let cachedSansFamily: string | null = null;
let fontCachePromise: Promise<void> | null = null;
let kodeMonoBufferPromise: Promise<ArrayBuffer | null> | null = null;
let cachedKodeMonoBuffer: ArrayBuffer | null = null;
let fontsFullyLoaded = false;

/**
 * Fetches a font binary with persistent browser CacheStorage (`caches.open`) backing.
 * Guarantees that once downloaded, the font file is cached persistently on disk/memory.
 *
 * @param {string} url Public path to the .woff2 font asset.
 * @returns {Promise<ArrayBuffer | null>} Font binary buffer or null in SSR/offline failure.
 */
async function fetchAndCacheFontBuffer(url: string): Promise<ArrayBuffer | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return null;
  }

  const resolvedUrl = resolveFontAssetUrl(url);

  try {
    if ('caches' in window) {
      const cache = await window.caches.open(FONT_CACHE_NAME);
      const cachedRes = await cache.match(resolvedUrl);
      if (cachedRes) {
        return await cachedRes.arrayBuffer();
      }

      const networkRes = await fetch(resolvedUrl, { cache: 'force-cache' });
      if (networkRes.ok) {
        await cache.put(resolvedUrl, networkRes.clone());
        return await networkRes.arrayBuffer();
      }
    } else {
      const res = await fetch(resolvedUrl, { cache: 'force-cache' });
      if (res.ok) {
        return await res.arrayBuffer();
      }
    }
  } catch {
    // Fallback gracefully in test or restricted environments
  }

  return null;
}

/**
 * Loads and caches the Kode Mono WOFF2 binary buffer in memory and CacheStorage.
 * Returns a fresh cloned copy (`slice(0)`) safe for zero-copy transfer to Web Workers.
 *
 * @returns {Promise<ArrayBuffer | null>} Cloned ArrayBuffer of KodeMono-Variable.woff2.
 */
export async function loadKodeMonoFontBuffer(): Promise<ArrayBuffer | null> {
  if (cachedKodeMonoBuffer) {
    return cachedKodeMonoBuffer.slice(0);
  }

  if (!kodeMonoBufferPromise) {
    kodeMonoBufferPromise = fetchAndCacheFontBuffer(FONT_URLS.kodeMono).then((buf) => {
      if (buf) {
        cachedKodeMonoBuffer = buf;
      }
      return buf;
    });
  }

  const buffer = await kodeMonoBufferPromise;
  return buffer ? buffer.slice(0) : null;
}

/**
 * Resolves and caches the active monospace font family string (`Kode Mono`).
 * Safe for SSR, Web Workers, and main-thread Canvas 2D contexts.
 *
 * @returns {string} Resolved CSS font-family stack starting with Kode Mono.
 */
export function getCachedMonoFontFamily(): string {
  if (cachedMonoFamily) {
    return cachedMonoFamily;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return DEFAULT_MONO_STACK;
  }

  try {
    const rawVar = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--font-kode-mono')
      .trim();

    if (rawVar) {
      cachedMonoFamily = `"Kode Mono", ${rawVar}, "JetBrains Mono", Consolas, "Cascadia Mono", "SF Mono", Menlo, Monaco, "DejaVu Sans Mono", ui-monospace, monospace`;
      return cachedMonoFamily;
    }
  } catch {
    // Fallback safely
  }

  cachedMonoFamily = DEFAULT_MONO_STACK;
  return cachedMonoFamily;
}

/**
 * Resolves and caches the combined Kode Mono (Latin) + IRANSans (Persian) font stack.
 *
 * @returns {string} Resolved CSS font-family stack.
 */
export function getCachedSansFontFamily(): string {
  if (cachedSansFamily) {
    return cachedSansFamily;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return DEFAULT_SANS_STACK;
  }

  cachedSansFamily = DEFAULT_SANS_STACK;
  return cachedSansFamily;
}

/**
 * Warms and caches Kode Mono (Latin) and IRANSans (Persian) in both persistent CacheStorage
 * and the browser's `document.fonts` FontFaceSet.
 *
 * @returns {Promise<void>} Resolves once all fonts are decoded, registered, and cached.
 */
export function ensureFontsCached(): Promise<void> {
  if (fontsFullyLoaded) {
    return Promise.resolve();
  }

  if (fontCachePromise) {
    return fontCachePromise;
  }

  if (typeof document === 'undefined' || !('fonts' in document)) {
    fontsFullyLoaded = true;
    return Promise.resolve();
  }

  fontCachePromise = (async () => {
    try {
      const [kodeBuf, iranRegBuf, iranMedBuf, iranBoldBuf] = await Promise.all([
        loadKodeMonoFontBuffer(),
        fetchAndCacheFontBuffer(FONT_URLS.iranSansRegular),
        fetchAndCacheFontBuffer(FONT_URLS.iranSansMedium),
        fetchAndCacheFontBuffer(FONT_URLS.iranSansBold),
      ]);

      if (typeof FontFace !== 'undefined') {
        const facesToLoad: Promise<FontFace>[] = [];

        if (iranRegBuf) {
          const regFace = new FontFace('IRANSans', iranRegBuf, {
            style: 'normal',
            weight: '400',
            unicodeRange: PERSIAN_UNICODE_RANGE,
          });
          facesToLoad.push(
            regFace.load().then((loaded) => {
              document.fonts.add(loaded);
              return loaded;
            })
          );
        }

        if (iranMedBuf) {
          const medFace = new FontFace('IRANSans', iranMedBuf, {
            style: 'normal',
            weight: '500',
            unicodeRange: PERSIAN_UNICODE_RANGE,
          });
          facesToLoad.push(
            medFace.load().then((loaded) => {
              document.fonts.add(loaded);
              return loaded;
            })
          );
        }

        if (iranBoldBuf) {
          const boldFace = new FontFace('IRANSans', iranBoldBuf, {
            style: 'normal',
            weight: '700',
            unicodeRange: PERSIAN_UNICODE_RANGE,
          });
          facesToLoad.push(
            boldFace.load().then((loaded) => {
              document.fonts.add(loaded);
              return loaded;
            })
          );
        }

        if (kodeBuf) {
          const kodeFace = new FontFace('Kode Mono', kodeBuf, {
            style: 'normal',
            weight: '400 700',
            unicodeRange: 'U+0021-007E',
          });
          facesToLoad.push(
            kodeFace.load().then((loaded) => {
              document.fonts.add(loaded);
              return loaded;
            })
          );
        }

        await Promise.allSettled(facesToLoad);
      }

      await Promise.allSettled([
        document.fonts.ready,
        document.fonts.load('600 14px "Kode Mono"', 'KKS0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ~^*+'),
        document.fonts.load('700 16px "Kode Mono"', 'KKS0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        document.fonts.load('400 16px "IRANSans"', 'پروژه توسعه وب و رابط کاربری'),
        document.fonts.load('700 16px "IRANSans"', 'پروژه توسعه وب و رابط کاربری'),
      ]);
    } catch {
      // Ignore font load errors in headless/test environments
    } finally {
      cachedMonoFamily = null;
      cachedSansFamily = null;
      getCachedMonoFontFamily();
      getCachedSansFontFamily();
      fontsFullyLoaded = true;
    }
  })();

  return fontCachePromise;
}
