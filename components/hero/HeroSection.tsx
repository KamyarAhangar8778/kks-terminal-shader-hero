'use client';

import React from 'react';
import { HeroProvider, HeroFrame, HeroCanvas, HeroSocials } from './HeroCompound';

/**
 * Fullscreen dark terminal hero section running the WebGL2 ASCII Swirl "Wavefront" shader UI
 * (including native slant ASCII KKS formation, interactive vortex trail, click shockwaves, and WebGL2 CRT pass)
 * alongside top-left social links.
 */
export const HeroSection: React.FC = () => (
  <HeroProvider>
    <HeroFrame>
      <HeroCanvas />
      <HeroSocials />
    </HeroFrame>
  </HeroProvider>
);
