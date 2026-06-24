import { SectionHeading, ProductCard } from '@/shared/components';

const featuredProducts = [
  { name: 'Ель Голубая', latinName: 'Picea pungens', height: '1.5 – 2.5 м', price: 'от 25 000 ₽', image: '/images/spruce-blue.svg' },
  { name: 'Ель Сербская', latinName: 'Picea omorika', height: '1.8 – 2.8 м', price: 'от 28 000 ₽', image: '/images/spruce-serbian.svg' },
  { name: 'Ель Колючая Glauca', latinName: 'Picea pungens Glauca', height: '2.0 – 3.5 м', price: 'от 42 000 ₽', image: '/images/spruce-glauca.svg' },
  { name: 'Ель Канадская', latinName: 'Picea glauca', height: '2.5 – 4.0 м', price: 'от 35 000 ₽', image: '/images/spruce-green.svg' },
];

export const FeaturedProducts = () => (
  <section className="py-24 bg-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Популярные сорта"
        subtitle="Тщательно отобранная коллекция премиальных хвойных деревьев из лучших питомников Европы и России"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {featuredProducts.map((product, index) => (
          <ProductCard key={index} {...product} index={index} />
        ))}
      </div>
    </div>
  </section>
);
