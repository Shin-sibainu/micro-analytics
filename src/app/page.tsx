import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { CTASection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
