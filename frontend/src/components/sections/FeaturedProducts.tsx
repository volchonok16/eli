import { SectionHeading, ProductCard } from '@/shared/components';
import { useFeaturedProducts } from '@/pages/CatalogPage/useProducts';

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="aspect-[4/5] bg-surface-dark" />
        <div className="p-6 space-y-3">
          <div className="h-3 bg-surface-dark rounded w-1/2" />
          <div className="h-5 bg-surface-dark rounded w-3/4" />
          <div className="h-4 bg-surface-dark rounded w-1/3" />
          <div className="h-6 bg-surface-dark rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useFeaturedProducts();

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Популярные сорта"
          subtitle="Тщательно отобранная коллекция премиальных хвойных деревьев из лучших питомников Европы и России"
        />

        {isLoading && <SkeletonGrid />}

        {products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                sort={product.sort}
                heightLabel={product.heightLabel}
                price={product.price}
                images={product.images}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
