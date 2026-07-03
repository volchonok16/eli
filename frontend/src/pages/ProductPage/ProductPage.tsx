import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useProduct } from './hooks/useProduct';
import { useAddToCart } from '@/pages/CartPage/useCart';

const formatPrice = (v: number) => `от ${v.toLocaleString()} ₽`;

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const addToCart = useAddToCart();
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!id) return;
    addToCart.mutate({ productId: id }, {
      onSuccess: () => { setAdded(true); setTimeout(() => setAdded(false), 2000); },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="space-y-8 w-full max-w-6xl px-4">
          <div className="h-8 bg-surface-dark rounded w-1/3 animate-pulse" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-surface-dark animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-surface-dark rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-surface-dark rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-surface-dark rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display text-3xl text-primary mb-4">Товар не найден</h1>
        <Link to="/catalog" className="btn-primary">Вернуться в каталог</Link>
      </div>
    );
  }

  const images = product.images?.length ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const mainImage = images[activeImage]?.url;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Вернуться в каталог
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] bg-surface-dark overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="absolute top-4 left-4 flex gap-2">
                {product.isNew && (
                  <span className="bg-accent text-surface text-[10px] uppercase tracking-widest px-2.5 py-1">Новинка</span>
                )}
                {product.isHit && (
                  <span className="bg-primary text-surface text-[10px] uppercase tracking-widest px-2.5 py-1">Хит</span>
                )}
              </div>
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 transition-colors overflow-hidden ${
                      idx === activeImage ? 'border-accent' : 'border-surface-muted hover:border-primary/30'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {product.sort && (
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted/60 font-medium">{product.sort}</span>
              )}
              {product.category && (
                <span className="text-xs text-text-muted/40 border border-surface-muted px-2 py-0.5">{product.category.name}</span>
              )}
              {product.sku && (
                <span className="text-[10px] text-text-muted/30 uppercase tracking-widest ml-auto">арт. {product.sku}</span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary mb-4 leading-[1.1]">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl sm:text-4xl text-accent font-semibold">{formatPrice(product.price)}</span>
              {product.costPrice && (
                <span className="text-sm text-text-muted/40 line-through">{formatPrice(Number(product.costPrice))}</span>
              )}
            </div>

            <p className="text-text-muted/80 leading-relaxed text-sm sm:text-base mb-8 max-w-lg">
              {product.description || 'Подробное описание сорта, рекомендации по уходу и характеристики.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {product.heightLabel && (
                <div className="card p-4">
                  <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-1">Высота</p>
                  <p className="text-primary font-medium">{product.heightLabel} м</p>
                </div>
              )}
              {product.quantity > 0 && (
                <div className="card p-4">
                  <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-1">В наличии</p>
                  <p className="text-primary font-medium">{product.quantity - product.reserved} шт</p>
                </div>
              )}
              {product.inStock && (
                <div className="card p-4">
                  <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-1">Статус</p>
                  <p className="text-green-700 font-medium text-sm">В наличии</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending || added}
                className={`btn-primary flex-1 text-sm sm:text-base px-8 py-4 transition-all duration-300 ${
                  added ? 'bg-green-700 scale-95' : ''
                }`}
              >
                {added ? 'Добавлено ✓' : addToCart.isPending ? 'Добавление...' : 'Добавить в корзину'}
              </button>
              <Link to="/cart" className="btn-outline flex-1 text-center text-sm sm:text-base py-4">
                В корзину
              </Link>
            </div>

            {product.careGuide && (
              <div className="border-t border-surface-muted pt-8">
                <h2 className="font-serif text-xl text-primary mb-4">Рекомендации по уходу</h2>
                <div className="text-text-muted/70 text-sm leading-relaxed whitespace-pre-line">
                  {product.careGuide}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {product.description && product.description.length > 200 && (
          <div className="mt-16 border-t border-surface-muted pt-12">
            <h2 className="font-serif text-2xl text-primary mb-6">Описание</h2>
            <div className="text-text-muted/80 leading-relaxed max-w-3xl whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
