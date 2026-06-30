import { Link } from 'react-router-dom';
import { SectionHeading } from '@/shared/components';

export const FinalCta = () => (
  <section className="py-24 bg-primary text-text-inverse text-center relative overflow-hidden">
    <div className="absolute inset-0 opacity-8">
      <img src="/images/photos/evening-winter-showcase.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
    </div>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(202,138,4,0.1),transparent_70%)]" />

    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Готовы выбрать свою ель?"
        subtitle="Ознакомьтесь с полным каталогом и найдите идеальное дерево для вашего ландшафта"
        light
        display
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Link to="/catalog" className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5">
          Перейти в каталог
        </Link>
        <a href="tel:+79991234567" className="btn-outline text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 border-text-inverse/20 text-text-inverse hover:border-text-inverse/40 hover:bg-text-inverse/5 focus-visible:ring-offset-primary">
          +7 (999) 123-45-67
        </a>
      </div>
    </div>
  </section>
);
