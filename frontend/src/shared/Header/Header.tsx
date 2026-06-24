import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 safe-top">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link to="/" className="font-display text-xl sm:text-2xl font-bold text-primary tracking-wide italic">
          Eli
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link to="/catalog" className="text-sm font-medium text-text-muted transition-colors hover:text-primary">
            Каталог
          </Link>
          <Link to="/about" className="text-sm font-medium text-text-muted transition-colors hover:text-primary">
            О нас
          </Link>
          <Link to="/cart" className="btn-primary text-sm py-2 px-5 sm:px-6">
            Корзина
          </Link>
        </nav>

        <button
          className="md:hidden p-2 -mr-2 text-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
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
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden overflow-hidden border-t border-surface-muted/50"
          >
            <div className="px-4 pb-5 pt-2 flex flex-col gap-1">
              <Link to="/catalog" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={() => setIsMenuOpen(false)}>
                Каталог
              </Link>
              <Link to="/about" className="text-base font-medium text-text py-3 px-3 -mx-3 rounded hover:bg-surface-dark transition-colors" onClick={() => setIsMenuOpen(false)}>
                О нас
              </Link>
              <div className="pt-2">
                <Link to="/cart" className="btn-primary text-sm py-3 text-center w-full" onClick={() => setIsMenuOpen(false)}>
                  Корзина
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
