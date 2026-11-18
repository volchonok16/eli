import { SectionHeading, StatsSection } from '@/shared/components';

export const StatsBanner = () => {
  const items = [
    { value: 3, maxValue: 3, suffix: ' года', label: 'На рынке' },
    { value: 2800, maxValue: 2800, suffix: '', label: 'Ёлок продано' },
    { value: 800, maxValue: 800, suffix: '', label: 'Довольных клиентов' },
  ];

  return (
    <section className="stats-banner relative overflow-hidden py-20 text-text-inverse">
      <img
        src="/images/photos/premium-christmas-tree-collection.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(18,55,45,0.9),rgba(18,55,45,0.72)_55%,rgba(18,55,45,0.52))]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
