import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { StickyShowcase } from "@/components/sections/CatalogSlider";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { FinalCta } from "@/components/sections/FinalCta";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { StatsBanner } from "@/components/sections/StatsBanner";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export const HomePage = () => (
  <>
    <div className="flex justify-center bg-white px-4 py-2 lg:hidden">
      <a
        href="tel:+79991234567"
        className="text-xs font-medium tracking-wide text-primary/80 hover:text-primary transition-colors"
        aria-label="Позвонить по номеру +7 (999) 123-45-67"
      >
        +7 (999) 123-45-67
      </a>
    </div>
    <HeroSection />
    <FeaturedProducts />
    <StickyShowcase />
    <BenefitsSection />
    <StatsBanner />
    <HowItWorks />
    <TestimonialsSection />
    <FaqSection />
    <NewsletterSection />
    <FinalCta />
  </>
);
