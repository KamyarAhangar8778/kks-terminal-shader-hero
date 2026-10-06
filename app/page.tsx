'use client';

import { useEffect } from 'react';
import { SkipToContent } from '@/components/common/SkipToContent';
import { HeroSection } from '@/components/hero/HeroSection';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { Footer } from '@/components/layout/Footer';
import { DirectionalTransition } from '@/components/view-transitions/ViewTransition';

export default function HomePage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Disable automatic browser scroll restoration on refresh/reload
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      // If the URL contains a hash upon reload/initial load, remove it
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // Force scroll to top immediately
      window.scrollTo(0, 0);

      // Robust fallback to override browser post-hydration hash jumping
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <DirectionalTransition>
      <SkipToContent />
      <main id="main-root" className="w-full h-full min-h-screen bg-[#000000]">
        <HeroSection />
        <PortfolioSection />
        <ContactSection />
        <Footer />
      </main>
    </DirectionalTransition>
  );
}
