import { SectionHeading, StatsSection } from '@/shared/components';
import { useStats } from '@/pages/HomePage/useStats';

export const StatsBanner = () => {
  const { data: stats } = useStats();

  const items = stats
    ? [
        { value: stats.survivalRate, maxValue: 100, suffix: '%', label: 'Стойкость' },
        { value: stats.yearsExperience, maxValue: stats.yearsExperience + 5, suffix: '+', label: 'Лет на рынке' },
        { value: stats.treesPlanted, maxValue: stats.treesPlanted, suffix: '+', label: 'Ёлок продано' },
        { value: stats.happyCustomers, maxValue: stats.happyCustomers, suffix: '+', label: 'Счастливых семей' },
      ]
    : undefined;

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src="/images/photos/premium-christmas-tree-collection.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(202,138,4,0.08),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Eli в цифрах"
          subtitle="15 лет создаём новогоднее настроение"
          light
          display
        />

        <StatsSection items={items} />
      </div>
    </section>
  );
};
