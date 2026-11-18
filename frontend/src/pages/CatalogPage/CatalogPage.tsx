import { resolveProductImage } from '@/shared/utils/mediaUrl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategories } from './useCategories';
import { useProducts } from './useProducts';
import styles from './CatalogPage.module.css';

const formatPrice = (v: number) => `от ${v.toLocaleString()} ₽`;

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="aspect-[3/4] bg-surface-dark" />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const { data: categoryTree = [] } = useCategories();
  const { data: products, isLoading, isError } = useProducts({
    category: category || undefined,
    ...(sort !== 'popular' && { sort }),
  });

  const setCategory = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('category', value);
    else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="internal-page min-h-screen bg-surface">
      <section className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <img src="/images/photos/classic-christmas-fir.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="page-title mb-4">Каталог ёлок</h1>
            <p className="page-subtitle">
              Живые новогодние ёлки для дома, офиса и загородного дома
            </p>
          </motion.div>
        </div>
      </section>

      <div className={`${styles.filters} border-b border-surface-muted`}>
        <div className={`${styles.filterInner} mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8`}>
          <div className={`${styles.categories} flex min-w-0 items-center`}>
            <button
              onClick={() => setCategory('')}
              aria-pressed={!category}
              className="min-h-11 shrink-0 rounded-full transition-colors"
            >
              Все
            </button>
            {categoryTree.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.slug)}
                aria-pressed={category === item.slug || category === item.id}
                className="min-h-11 shrink-0 rounded-full transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-11 w-full rounded-full border border-surface-muted bg-white px-4 py-2 text-sm text-text focus:outline-none focus:border-primary sm:w-auto"
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
              <div className={styles.grid}>
                {products.map((product, index) => (
                <Link key={product.id} to={`/product/${product.id}`} className={`${styles.cardLink} block min-w-0 rounded-[23px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className={`card ${styles.card} group h-full`}
                  >
                    <div className={styles.image}>
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {product.images?.[0] ? (
                        <img src={resolveProductImage(product.images[0])} alt={product.name} className="w-full h-full object-contain transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-text-muted">
                          <img src="/images/spruce-blue.svg" alt="" aria-hidden="true" className="h-4/5 w-full object-contain opacity-80" />
                          <span className="mt-2 text-xs">ФОТО ГОТОВИТСЯ</span>
                        </div>
                      )}
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-accent text-surface text-[10px] uppercase tracking-widest px-2 py-0.5">New</span>
                      )}
                      {product.isHit && (
                        <span className="absolute top-3 right-3 bg-primary text-surface text-[10px] uppercase tracking-widest px-2 py-0.5">Хит</span>
                      )}
                    </div>
                    <div className={styles.copy}>
                      {product.sort && (
                        <p className={`${styles.sortLabel} mb-2 uppercase`}>{product.sort}</p>
                      )}
                      <h3 className={`${styles.title} mb-2 font-serif group-hover:text-accent transition-colors`}>
                        {product.name}
                      </h3>
                      {product.heightLabel && (
                        <p className={`${styles.height} mb-3`}>{product.heightLabel} м</p>
                      )}
                      <p className="font-sans text-xl text-accent font-semibold">{formatPrice(product.price)}</p>
                      <p className={`text-sm mt-2 ${product.available ? "text-green-700" : "text-text-muted"}`}>
                        {product.available
                          ? `В наличии: ${Math.max(0, product.quantity - product.reserved)} шт`
                          : "Нет в наличии"}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
