import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from './hooks/useProduct';
import { useAddToCart } from '@/pages/CartPage/useCart';
import { useState } from 'react';

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const addToCart = useAddToCart();
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
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 bg-surface-dark rounded w-1/3" />
          <div className="aspect-video bg-surface-dark rounded" />
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

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] bg-surface-dark border border-surface-muted flex items-center justify-center"
          >
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-text-muted/30 font-serif text-lg">{product.name}</span>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs text-text-muted/50 uppercase tracking-widest mb-2">{product.latinName}</p>
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">{product.name}</h1>
            <p className="text-2xl text-accent font-semibold mb-6">
              от {product.price.toLocaleString()} ₽
            </p>
            <p className="text-text-muted leading-relaxed mb-6">
              {product.description || 'Подробное описание сорта, рекомендации по уходу и характеристики.'}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-2 border border-surface-muted text-sm text-text-muted">
                Высота: {product.height}
              </span>
              {product.inStock ? (
                <span className="px-4 py-2 border border-green-100 bg-green-50 text-green-700 text-sm">В наличии</span>
              ) : (
                <span className="px-4 py-2 border border-red-100 bg-red-50 text-red-700 text-sm">Нет в наличии</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending || added}
                className={`btn-primary flex-1 ${added ? 'bg-green-700' : ''}`}
              >
                {added ? 'Добавлено ✓' : addToCart.isPending ? '...' : 'Добавить в корзину'}
              </button>
              <Link to="/catalog" className="btn-outline flex-1 text-center">В каталог</Link>
            </div>

            {addToCart.isError && (
              <p className="text-error text-sm mt-3">Не удалось добавить в корзину</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
