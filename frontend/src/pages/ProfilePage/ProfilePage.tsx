import { useAuth } from '@/shared/contexts';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { isAuthenticated, user } = useAuth();

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
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-lg text-primary mb-4">Мои заказы</h2>
            <p className="text-text-muted text-sm">У вас пока нет заказов.</p>
            <Link to="/catalog" className="inline-block text-accent text-sm mt-4 hover:text-accent-light transition-colors">
              Перейти в каталог →
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-lg text-primary mb-4">История заказов</h2>
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-16 h-16 text-primary/10 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25M4.5 2.25h15M5.25 3v1.5M18.75 3v1.5M3 12.75h18M5.25 20.25h13.5M8.25 15.75L12 12l3.75 3.75" />
            </svg>
            <p className="text-text-muted">История заказов появится после первой покупки</p>
          </div>
        </div>
      </div>
    </div>
  );
};
