import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const cartItems = [
  { id: 1, name: 'Ель Голубая (Picea pungens)', height: '2.0 м', price: 25000, quantity: 1, image: '/images/spruce-blue.svg' },
  { id: 2, name: 'Ель Сербская (Picea omorika)', height: '2.5 м', price: 30000, quantity: 2, image: '/images/spruce-serbian.svg' },
];

const formatPrice = (v: number) => `${v.toLocaleString()} ₽`;

export const CartPage = () => {
  const isEmpty = cartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-20 h-20 text-primary/10 mb-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25M4.5 2.25h15M5.25 3v1.5M18.75 3v1.5M3 12.75h18M5.25 20.25h13.5M8.25 15.75L12 12l3.75 3.75" />
        </svg>
        <h1 className="font-serif text-3xl text-primary mb-4">Корзина пуста</h1>
        <p className="text-text-muted mb-8">Вы ещё не добавили ни одной ели в корзину</p>
        <Link to="/catalog" className="btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl text-primary mb-12"
        >
          Корзина
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="card p-6 flex gap-4 sm:gap-6">
                <div className="w-24 h-24 bg-surface-dark flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-primary">{item.name}</h3>
                  <p className="text-text-muted text-sm mb-2">Высота: {item.height}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="w-8 h-8 border border-surface-muted flex items-center justify-center hover:bg-surface-dark transition-colors" aria-label="Уменьшить количество">-</button>
                    <span className="text-primary tabular-nums">{item.quantity}</span>
                    <button className="w-8 h-8 border border-surface-muted flex items-center justify-center hover:bg-surface-dark transition-colors" aria-label="Увеличить количество">+</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-xl text-primary font-semibold">{formatPrice(item.price)}</p>
                  <button className="text-sm text-text-muted mt-2 hover:text-error transition-colors">Удалить</button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-serif text-xl text-primary mb-6">Итого</h3>
              <div className="space-y-3 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-text-muted">
                    <span className="truncate mr-4">{item.name.split('(')[0]}</span>
                    <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-muted my-4" />
              <div className="flex justify-between font-serif text-lg text-primary mb-6">
                <span>Сумма</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button className="btn-primary w-full text-center">Оформить заказ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
