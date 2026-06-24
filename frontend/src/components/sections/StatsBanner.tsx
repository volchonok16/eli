import { SectionHeading, StatsSection } from '@/shared/components';

export const StatsBanner = () => (
  <section className="py-20 bg-primary relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(202,138,4,0.08),transparent_70%)]" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Eli в цифрах"
        subtitle="15 лет создаём красоту, которой доверяют"
        light
        display
      />

      <StatsSection />
    </div>
  </section>
);
