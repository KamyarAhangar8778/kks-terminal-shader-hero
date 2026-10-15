/**
 * @file components/layout/FooterHorizonCanvas.tsx
 * @description آداپتور نگهدارنده سازگاری به بوم آتش دیجیتالی با رزولوشن بالا
 */

'use client';

import React from 'react';
import { DigitalFireCanvas } from '@/components/digital-fire/DigitalFireCanvas';

/**
 * FooterHorizonCanvas
 * جهت حفظ سازگاری عقب‌رو (Backward Compatibility) با ماژول‌های دیگر،
 * اکنون بوم آتش دیجیتالی با رزولوشن بالا را رندر می‌کند.
 */
export const FooterHorizonCanvas: React.FC = () => {
  return <DigitalFireCanvas paletteId="emerald" charMode="hybrid" />;
};
