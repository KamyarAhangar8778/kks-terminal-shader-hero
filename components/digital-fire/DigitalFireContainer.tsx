/**
 * @file components/digital-fire/DigitalFireContainer.tsx
 * @description کانتینر اصلی آتش دیجیتالی در فوتر همراه با کنترل‌های تعاملی پالت و کاراکترها و افکت CRT
 */

'use client';

import React from 'react';
import { DigitalFireCanvas } from './DigitalFireCanvas';
import { FEATURE_FLAGS } from '@/lib/app-config';

/**
 * کانتینر آتش دیجیتالی واقع‌گرایانه با ترکیب کاراکترهای ASCII و Unicode و پالت حرارتی طبیعی (بدون افکت هاور)
 */
export const DigitalFireContainer: React.FC = () => {
  return (
    <div
      id="footer-digital-fire-reveal"
      className="relative w-full bg-[#000000] overflow-hidden select-none pointer-events-none"
      dir="rtl"
    >
      {/* ناحیه رندر آتش با ارتفاع بهینه برای زبانه کشیدن حروف (بدون افکت هاور) */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 overflow-hidden bg-[#000000] pointer-events-none">
        {/* بوم رندر کاراکترهای اسکی و یونیکد آتش با پالت سایبر زمردی هماهنگ با تم سایت */}
        <DigitalFireCanvas paletteId="emerald" charMode="hybrid" />

        {/* خطوط پویش ظریف و ایستا بدون تایمر یا شیدر سنگین */}
        {FEATURE_FLAGS.crtOverlay ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none z-[5]"
          />
        ) : null}

        {/* لایه محوشدگی نرم فقط در لبه بالایی جهت ادغام طبیعی نوک شعله‌ها با پس‌زمینه تاریک فوتر */}
        <div
          className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-[#000000] via-[#000000]/50 to-transparent pointer-events-none z-[6]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
