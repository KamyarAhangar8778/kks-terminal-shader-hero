/**
 * @file lib/digital-fire/fire-palettes.ts
 * @description پالت‌های رنگی و مجموعه کاراکترهای اسکی و یونیکد شبیه به نمونه دوم textart.sh/topic/fire
 */

import { FireCharMode, FirePalette, FirePaletteId } from './types';

/**
 * حداکثر سطح شدت حرارت در ماتریس شبیه‌ساز
 */
export const FIRE_HEAT_LEVELS = 36;

/**
 * مجموعه‌های کاراکتر متناسب با حرارت
 * هر کاراکتر بر اساس نسبت دمای سلول انتخاب می‌شود.
 */
export const FIRE_CHAR_SETS: Record<FireCharMode, { chars: string[]; nameFa: string }> = {
  /**
   * حالت ترکیبی واقع‌گرایانه: ترکیب کاراکترهای ASCII جهتی/آشفته در زبانه‌ها با شیدها و بلوک‌های یونیکد در هسته آتش
   */
  hybrid: {
    chars: [
      ' ',
      '.',
      '·',
      "'",
      ':',
      '~',
      '^',
      '/',
      '\\',
      '|',
      '*',
      '+',
      'x',
      's',
      '0',
      '1',
      '%',
      '&',
      '#',
      '@',
      '░',
      '▒',
      '▓',
      '█',
    ],
    nameFa: 'ترکیبی واقع‌گرایانه (ASCII + Unicode)',
  },
  /**
   * شیدهای یونیکد برگرفته از نمونه دوم textart.sh/topic/fire:
   * ' ' (خالی) -> '░' (سایه روشن) -> '▒' (سایه متوسط) -> '▓' (سایه تیره) -> '█' (بلوک کامل و متراکم)
   */
  'unicode-shades': {
    chars: [' ', '░', '▒', '▓', '█'],
    nameFa: 'یونیکد شید (TextArt #2)',
  },
  /**
   * حالت دیجیتال باینری: کد‌های ۰ و ۱ در جریان شعله
   */
  binary: {
    chars: [' ', '·', '0', '1', '0', '1', '█'],
    nameFa: 'ماتریکس باینری (0/1)',
  },
};

const TIER_WISPS = ['.', '·', "'", '`', ',', ':'] as const;
const TIER_TIPS_LEFT = ['\\', '(', '<', '^', ':', '~'] as const;
const TIER_TIPS_RIGHT = ['/', ')', '>', '^', ':', '~'] as const;
const TIER_TIPS_CENTER = ['^', '|', '!', ':', ';', '~', "'", '·'] as const;
const TIER_MID_LEFT = ['\\', '(', '{', '*', '+', 'x', 's', '0'] as const;
const TIER_MID_RIGHT = ['/', ')', '}', '*', '+', 'x', 's', '1'] as const;
const TIER_MID_CORE = ['*', '+', 'x', 's', 'S', 'v', 'w', '0', '1', '░'] as const;
const TIER_INNER_BODY = ['░', '▒', '#', '%', '&', '$', '@', '▓', '▒', '░'] as const;
const TIER_CORE_PLASMA = ['▒', '▓', '█', '▀', '▄', '▓', '█', '█'] as const;

/**
 * انتخاب کاراکتر ترکیبی ASCII و Unicode بر اساس دما، گرادیان افقی شعله و تلاطم زمانی
 *
 * @param {number} heat - دمای سلول فعلی (۱ تا ۳۶)
 * @param {number} gradX - اختلاف دمای سلول راست و چپ برای تشخیص خمیدگی زبانه آتش
 * @param {number} hash - هش مکانی-زمانی سلول برای تنوع بافت کاراکترها
 * @returns {string} کاراکتر مناسب برای رندر در سلول
 */
export function selectRealisticFireGlyph(heat: number, gradX: number, hash: number): string {
  const h = hash < 0 ? -hash : hash;
  if (heat <= 4) {
    return TIER_WISPS[h % TIER_WISPS.length] ?? '.';
  }
  if (heat <= 11) {
    if (gradX > 3) return TIER_TIPS_LEFT[h % TIER_TIPS_LEFT.length] ?? '\\';
    if (gradX < -3) return TIER_TIPS_RIGHT[h % TIER_TIPS_RIGHT.length] ?? '/';
    return TIER_TIPS_CENTER[h % TIER_TIPS_CENTER.length] ?? '^';
  }
  if (heat <= 19) {
    if (gradX > 4) return TIER_MID_LEFT[h % TIER_MID_LEFT.length] ?? '\\';
    if (gradX < -4) return TIER_MID_RIGHT[h % TIER_MID_RIGHT.length] ?? '/';
    return TIER_MID_CORE[h % TIER_MID_CORE.length] ?? '*';
  }
  if (heat <= 28) {
    return TIER_INNER_BODY[h % TIER_INNER_BODY.length] ?? '▒';
  }
  if (heat >= 34) {
    return '█';
  }
  return TIER_CORE_PLASMA[h % TIER_CORE_PLASMA.length] ?? '▓';
}

/**
 * تولید یک پالت رنگی پیوسته با درون‌یابی رنگ‌ها برای ۳۶ سطح حرارتی
 *
 * @param {Array<{ pos: number; r: number; g: number; b: number }>} stops - نقاط توقف رنگ در محور دما
 * @returns {string[]} آرایه‌ای از رنگ‌های rgb به اندازه FIRE_HEAT_LEVELS
 */
function generateGradientColors(
  stops: Array<{ pos: number; r: number; g: number; b: number }>
): string[] {
  const result: string[] = [];

  const firstStop = stops[0] ?? { pos: 0, r: 0, g: 0, b: 0 };
  const lastStop = stops[stops.length - 1] ?? { pos: 1, r: 255, g: 255, b: 255 };

  for (let i = 0; i < FIRE_HEAT_LEVELS; i++) {
    const t = i / (FIRE_HEAT_LEVELS - 1);

    // پیدا کردن دو نقطه همجوار
    let lower = firstStop;
    let upper = lastStop;

    for (let s = 0; s < stops.length - 1; s++) {
      const current = stops[s];
      const next = stops[s + 1];
      if (current && next && t >= current.pos && t <= next.pos) {
        lower = current;
        upper = next;
        break;
      }
    }

    const range = upper.pos - lower.pos || 1;
    const factor = (t - lower.pos) / range;

    const r = Math.round(lower.r + (upper.r - lower.r) * factor);
    const g = Math.round(lower.g + (upper.g - lower.g) * factor);
    const b = Math.round(lower.b + (upper.b - lower.b) * factor);

    result.push(`rgb(${r},${g},${b})`);
  }

  return result;
}

/**
 * پالت‌های حرارتی آتش دیجیتالی
 */
export const FIRE_PALETTES: Record<FirePaletteId, FirePalette> = {
  /**
   * پالت آتشین خورشیدی: سیاه -> زرشکی تیره -> قرمز شعله -> نارنجی ملتهب -> طلایی درخشان -> سفید هسته
   */
  solar: {
    id: 'solar',
    name: 'Solar Fire',
    nameFa: 'شعله خورشیدی (طبیعی)',
    glowColor: 'rgba(234, 88, 12, 0.22)',
    colors: generateGradientColors([
      { pos: 0.0, r: 0, g: 0, b: 0 },
      { pos: 0.08, r: 42, g: 8, b: 5 },
      { pos: 0.22, r: 135, g: 18, b: 8 },
      { pos: 0.42, r: 215, g: 42, b: 12 },
      { pos: 0.64, r: 249, g: 112, b: 18 },
      { pos: 0.82, r: 254, g: 198, b: 48 },
      { pos: 0.94, r: 255, g: 242, b: 165 },
      { pos: 1.0, r: 255, g: 255, b: 242 },
    ]),
  },

  /**
   * پالت سایبر زمردی: هماهنگ با تم ترمینال KKS و رنگ سبز زمردی
   */
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    nameFa: 'سایبر زمردی (KKS)',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    colors: generateGradientColors([
      { pos: 0.0, r: 0, g: 0, b: 0 },
      { pos: 0.08, r: 9, g: 24, b: 26 },
      { pos: 0.22, r: 6, g: 68, b: 52 },
      { pos: 0.42, r: 8, g: 132, b: 92 },
      { pos: 0.64, r: 16, g: 185, b: 129 },
      { pos: 0.82, r: 110, g: 231, b: 183 },
      { pos: 0.94, r: 196, g: 252, b: 236 },
      { pos: 1.0, r: 248, g: 255, b: 252 },
    ]),
  },

  /**
   * پالت کهربایی نوستالژیک مانیتورهای لامپ تصویر قدیمی
   */
  amber: {
    id: 'amber',
    name: 'Amber CRT',
    nameFa: 'کهربایی لامپ تصویر (CRT)',
    glowColor: 'rgba(245, 158, 11, 0.22)',
    colors: generateGradientColors([
      { pos: 0.0, r: 0, g: 0, b: 0 },
      { pos: 0.15, r: 60, g: 25, b: 5 },
      { pos: 0.4, r: 180, g: 85, b: 10 },
      { pos: 0.7, r: 245, g: 158, b: 11 },
      { pos: 0.9, r: 252, g: 211, b: 77 },
      { pos: 1.0, r: 255, g: 251, b: 235 },
    ]),
  },
};
