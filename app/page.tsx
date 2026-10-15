import { SkipToContent } from '@/components/common/SkipToContent';
import { HeroSection } from '@/components/hero/HeroSection';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { Footer } from '@/components/layout/Footer';
import { DirectionalTransition } from '@/components/view-transitions/ViewTransition';

export default function HomePage() {
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
