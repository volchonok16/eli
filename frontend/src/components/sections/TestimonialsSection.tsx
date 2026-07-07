import { SectionHeading, Testimonials } from '@/shared/components';

export const TestimonialsSection = () => (
  <section className="py-24 bg-surface-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Что говорят клиенты"
        subtitle="Тысячи семей и компаний выбирают нас для создания новогодней атмосферы"
        display
      />

      <Testimonials />
    </div>
  </section>
);
