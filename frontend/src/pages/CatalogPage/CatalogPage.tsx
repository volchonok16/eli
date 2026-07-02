import { motion } from 'framer-motion';
import { useState } from 'react';
import { use3DTilt } from '@/shared/hooks/use3DTilt';
import { useProducts } from './useProducts';

const formatPrice = (v: number) => `от ${v.toLocaleString()} ₽`;

interface CatalogCardProps {
  product: { id: string; name: string; height: string; price: number; image?: string };
  index: number;
}

const CatalogCard = ({ product, index }: CatalogCardProps) => {
  const { values, handleMouseMove, handleMouseLeave } = use3DTilt(5);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${values.rotateX}deg) rotateY(${values.rotateY}deg) scale(${values.scale})`,
        boxShadow: values.isHovered
          ? `${values.shadowX}px ${values.shadowY}px 30px rgba(28, 25, 23, 0.1)`
          : 'none',
      }}
      className="card group cursor-pointer transition-shadow duration-300 origin-center"
    >
      <div className="aspect-[4/3] bg-surface-dark flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="text-text-muted/20 font-serif text-lg">Eli</div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-lg text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-3">Высота: {product.height}</p>
        <p className="font-sans text-xl text-accent font-semibold">{formatPrice(product.price)}</p>
      </div>
    </motion.article>
  );
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="aspect-[4/3] bg-surface-dark" />
        <div className="p-6 space-y-3">
          <div className="h-5 bg-surface-dark rounded w-3/4" />
          <div className="h-4 bg-surface-dark rounded w-1/2" />
          <div className="h-6 bg-surface-dark rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export const CatalogPage = () => {
  const [sort, setSort] = useState<string>('popular');
  const [category, setCategory] = useState<string>('');
  const { data: products, isLoading, isError } = useProducts({
    category: category || undefined,
    ...(sort !== 'popular' && { sort }),
  });

  return (
    <div className="min-h-screen bg-surface">
      <section className="py-16 bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <img src="/images/photos/classic-christmas-fir.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">Каталог елей</h1>
            <p className="text-text-muted text-lg max-w-xl">
              Коллекция премиальных хвойных деревьев для вашего ландшафта
            </p>
          </motion.div>
        </div>
      </section>

      <div className="border-b border-surface-muted bg-surface sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {[
              { value: '', label: 'Все' },
              { value: 'spruce', label: 'Ели' },
              { value: 'fir', label: 'Пихты' },
              { value: 'pine', label: 'Сосны' },
            ].map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`text-xs sm:text-sm px-3 py-1.5 transition-colors ${
                  category === c.value
                    ? 'bg-primary text-surface'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs sm:text-sm border border-surface-muted bg-surface text-text-muted px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="popular">По популярности</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
              <option value="new">Новинки</option>
            </select>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && <SkeletonGrid />}

          {isError && (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg mb-4">Не удалось загрузить каталог</p>
              <p className="text-text-muted/60 text-sm">Попробуйте обновить страницу</p>
            </div>
          )}

          {products && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">Товары не найдены</p>
            </div>
          )}

          {products && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {products.map((product, index) => (
                <CatalogCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
