import { SectionHeading, StatsSection } from '@/shared/components';

export const StatsBanner = () => {
  const items = [
    { value: 3, maxValue: 3, suffix: ' года', label: 'На рынке' },
    { value: 2800, maxValue: 2800, suffix: '', label: 'Ёлок продано' },
    { value: 800, maxValue: 800, suffix: '', label: 'Довольных клиентов' },
  ];

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src="/images/photos/premium-christmas-tree-collection.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(202,138,4,0.08),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Премиум ель в цифрах"
          subtitle="Три года помогаем создавать новогоднее настроение"
          light
          display
        />

        <StatsSection items={items} />
      </div>
    </section>
  );
};
