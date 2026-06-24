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
