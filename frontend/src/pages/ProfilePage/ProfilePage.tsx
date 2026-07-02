import { useAuth } from '@/shared/contexts';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyOrders } from './hooks/useMyOrders';

export const ProfilePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl text-primary mb-12">
          Личный кабинет
        </motion.h1>

        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <div className="card p-6">
            <h2 className="font-serif text-lg text-primary mb-4">Профиль</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-text-muted">Имя:</span> <span className="text-primary">{user?.name}</span></p>
              <p><span className="text-text-muted">Email:</span> <span className="text-primary">{user?.email}</span></p>
              <p><span className="text-text-muted">Телефон:</span> <span className="text-primary">{user?.phone || 'Не указан'}</span></p>
            </div>
            <button onClick={logout} className="text-text-muted text-sm mt-4 hover:text-error transition-colors">
              Выйти
            </button>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-lg text-primary mb-4">Мои заказы</h2>
            {ordersLoading ? (
              <p className="text-text-muted text-sm">Загрузка...</p>
            ) : orders && orders.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {orders.map((order) => (
                  <li key={order.id} className="border-b border-surface-muted pb-2">
                    <span className="text-text-muted">№{order.id.slice(0, 8)}</span>
                    {' '}
                    <span className="text-primary">{order.statusLabel}</span>
                    {' — '}
                    <span className="text-accent">{order.totalAmount.toLocaleString()} ₽</span>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="text-text-muted text-sm">У вас пока нет заказов.</p>
                <Link to="/catalog" className="inline-block text-accent text-sm mt-4 hover:text-accent-light transition-colors">
                  Перейти в каталог →
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-lg text-primary mb-4">История заказов</h2>
          {ordersLoading ? (
            <div className="text-center py-8">
              <p className="text-text-muted">Загрузка...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-surface-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Заказ №{order.id.slice(0, 8)}</span>
                    <span className="text-primary font-medium">{order.statusLabel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span className="text-accent font-medium">{order.totalAmount.toLocaleString()} ₽</span>
                  </div>
                  {order.items.length > 0 && (
                    <p className="text-text-muted text-xs">
                      {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-16 h-16 text-primary/10 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25M4.5 2.25h15M5.25 3v1.5M18.75 3v1.5M3 12.75h18M5.25 20.25h13.5M8.25 15.75L12 12l3.75 3.75" />
              </svg>
              <p className="text-text-muted">История заказов появится после первой покупки</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
