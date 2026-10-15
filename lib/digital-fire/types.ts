/**
 * @file lib/digital-fire/types.ts
 * @description تعاریف تایپ‌ها و اینترفیس‌های شبیه‌ساز آتش دیجیتالی بر پایه ASCII / Unicode و سیستم باینری
 */

export type FirePaletteId = 'solar' | 'emerald' | 'amber';
export type FireCharMode = 'hybrid' | 'unicode-shades' | 'binary';

/**
 * ساختار هر رنگ در پالت بر اساس گرادیان حرارتی
 */
export interface HeatColorStop {
  /** آستانه حرارت نسبی بین ۰ تا ۱ */
  threshold: number;
  /** کد رنگ هگز یا rgba */
  color: string;
}

/**
 * مشخصات پالت رنگی برای سطوح مختلف گرما
 */
export interface FirePalette {
  id: FirePaletteId;
  name: string;
  nameFa: string;
  colors: string[]; // آرایه رنگ‌ها متناظر با ایندکس شدت حرارت
  glowColor: string;
}

/**
 * ساختار ذره اخگر (Ember) شناور که به بالا حرکت می‌کند
 */
export interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  life: number;
  maxLife: number;
  color: string;
}

/**
 * تنظیمات ابعاد و پیکربندی موتور آتش
 */
export interface FireConfig {
  /** عرض گرید بر حسب تعداد کاراکتر */
  cols: number;
  /** ارتفاع گرید بر حسب تعداد ردیف */
  rows: number;
  /** عرض هر سلول به پیکسل در کانواس */
  cellWidth: number;
  /** ارتفاع هر سلول به پیکسل در کانواس */
  cellHeight: number;
  /** اندازه فونت به پیکسل */
  fontSize: number;
  /** حداکثر درجه حرارت در هر سلول (معمولاً ۳۶ یا ۱۰۰) */
  maxHeat: number;
  /** ضریب باد افقی */
  wind: number;
}
