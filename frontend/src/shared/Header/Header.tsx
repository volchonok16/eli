import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/shared/contexts';
import { useCartContext } from '@/shared/contexts';

const navLink = (to: string, label: string, pathname: string) => (
  <Link
    to={to}
    className={`text-sm font-medium transition-colors py-1 ${
      pathname === to ? 'text-primary' : 'text-text-muted hover:text-primary'
    }`}
  >
    {label}
  </Link>
);

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCartContext();
  const { pathname } = useLocation();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="glass sticky top-0 z-50 safe-top">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link to="/" className="font-display text-xl sm:text-2xl font-bold text-primary tracking-wide italic">
          Eli
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLink('/catalog', 'Каталог', pathname)}
          {navLink('/wholesale', 'Оптом', pathname)}
          {navLink('/bases', 'Базары', pathname)}
          {navLink('/partners', 'Партнёрам', pathname)}
          {navLink('/about', 'О нас', pathname)}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
                Профиль
              </Link>
              <button onClick={logout} className="text-sm text-text-muted hover:text-error transition-colors">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
              Войти
            </Link>
          )}

          <Link to="/cart" className="btn-primary text-sm py-2 px-5 relative">
            Корзина
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-surface text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-primary min-w-[44px] min-h-[44px] flex items-center justify-center relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <motion.path
              animate={isMenuOpen ? { d: 'M6 18L18 6M6 6l12 12' } : { d: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' }}
              transition={{ duration: 0.3 }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-surface text-[10px] font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden overflow-hidden border-t border-surface-muted/50"
          >
            <div className="px-4 pb-5 pt-2 flex flex-col gap-1">
              <Link to="/catalog" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Каталог</Link>
              <Link to="/wholesale" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Ёлки оптом</Link>
              <Link to="/bases" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Ёлочные базары</Link>
              <Link to="/partners" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Сотрудничество</Link>
              <Link to="/about" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>О нас</Link>
              <div className="border-t border-surface-muted my-1" />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Профиль</Link>
                  <button onClick={() => { logout(); closeMenu(); }} className="text-base text-text-muted py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors text-left">Выйти</button>
                </>
              ) : (
                <Link to="/login" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={closeMenu}>Войти</Link>
              )}
              <div className="pt-2">
                <Link to="/cart" className="btn-primary text-sm py-3 text-center w-full" onClick={closeMenu}>
                  Корзина {itemCount > 0 && `(${itemCount})`}
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
