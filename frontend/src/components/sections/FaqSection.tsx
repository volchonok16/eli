import { SectionHeading, FaqAccordion } from '@/shared/components';

export const FaqSection = () => (
  <section className="py-24 bg-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Частые вопросы"
        subtitle="Ответы на самые популярные вопросы наших клиентов"
      />

      <FaqAccordion />
    </div>
  </section>
);
