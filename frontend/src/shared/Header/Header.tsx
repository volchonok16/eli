import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/shared/contexts';
import { useCartContext } from '@/shared/contexts';

const navLinks = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/wholesale', label: 'Оптом' },
  { to: '/bases', label: 'Базары' },
  { to: '/partners', label: 'Партнёрам' },
  { to: '/about', label: 'О нас' },
];

const stagger = { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }, exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } };
const itemAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }, exit: { opacity: 0, y: 10, transition: { duration: 0.25 } } };

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCartContext();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const cartBadge = itemCount > 0 && <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-accent text-surface text-[9px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>;

  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );

  const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );

  const navItems = navLinks.map(({ to, label }) => (
    <Link key={to} to={to} className={`text-xs sm:text-sm tracking-[0.03em] font-medium transition-colors ${pathname === to ? 'text-primary' : 'text-primary/55 hover:text-primary'}`}>{label}</Link>
  ));

  const utilAuth = isAuthenticated ? (
    <>
      <Link to="/profile" className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary transition-colors"><UserIcon />Профиль</Link>
      <button onClick={logout} className="text-xs text-primary/50 hover:text-error transition-colors">Выйти</button>
    </>
  ) : (
    <Link to="/login" className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary transition-colors"><UserIcon />Войти</Link>
  );

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 safe-top ${isScrolled ? 'bg-surface/95 backdrop-blur-md shadow-[0_1px_0_rgba(28,25,23,0.04)]' : 'bg-surface/60 backdrop-blur-md'}`}>
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500 ${isScrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-4'}`}>
          <motion.div layout className={`flex items-center ${isScrolled ? '' : 'lg:justify-center'}`}>
            <motion.div layout>
              <Link to="/" className={`block font-display font-bold italic text-primary tracking-wide transition-all duration-500 ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>Eli</Link>
            </motion.div>

            {isScrolled && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:flex items-center gap-6 ml-8">
                <nav className="flex items-center gap-6">{navItems}</nav>
                <div className="flex items-center gap-4">{utilAuth}</div>
                <Link to="/cart" className="relative flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary transition-colors"><CartIcon />Корзина{cartBadge}</Link>
              </motion.div>
            )}

            <div className="lg:hidden flex items-center gap-4 ml-auto">
              <Link to="/cart" className="relative flex items-center gap-1 text-sm text-primary/70 px-1 py-2 min-w-[44px] font-medium" aria-label={`Корзина${itemCount > 0 ? `, ${itemCount} товаров` : ''}`}><CartIcon />{cartBadge}</Link>
              <button className="text-sm text-primary/70 font-medium px-1 py-2 min-w-[44px] min-h-[44px]" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>{isMenuOpen ? 'Закрыть' : 'Меню'}</button>
            </div>
          </motion.div>

          {!isScrolled && (
            <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="hidden lg:block overflow-hidden mt-2">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <nav className="flex items-center gap-6 sm:gap-8">
                  {navLinks.map(({ to, label }) => (
                    <Link key={to} to={to} className={`text-xs sm:text-sm tracking-[0.03em] font-medium transition-colors ${pathname === to ? 'text-primary' : 'text-primary/60 hover:text-primary'}`}>{label}</Link>
                  ))}
                </nav>
                <div className="flex items-center gap-5">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-primary/50 hover:text-primary transition-colors"><UserIcon />Профиль</Link>
                      <span className="text-primary/15 text-xs">·</span>
                      <button onClick={logout} className="text-[11px] sm:text-xs text-primary/50 hover:text-error transition-colors">Выйти</button>
                    </>
                  ) : (
                    <Link to="/login" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-primary/50 hover:text-primary transition-colors"><UserIcon />Войти</Link>
                  )}
                  <span className="text-primary/15 text-xs">·</span>
                  <Link to="/cart" className="relative flex items-center gap-1.5 text-[11px] sm:text-xs text-primary/50 hover:text-primary transition-colors"><CartIcon />Корзина{cartBadge}</Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-surface/98 backdrop-blur-md flex items-center justify-center lg:hidden">
            <button className="absolute top-4 right-4 text-sm text-text-muted/40 hover:text-primary transition-colors px-3 py-2 min-w-[44px] min-h-[44px] z-10" onClick={closeMenu} aria-label="Закрыть меню">Закрыть</button>
            <motion.nav variants={stagger} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <motion.div key={to} variants={itemAnim}>
                  <Link to={to} onClick={closeMenu} className={`block text-2xl font-serif py-3 px-6 transition-colors ${pathname === to ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>{label}</Link>
                </motion.div>
              ))}
              <motion.div variants={itemAnim} className="mt-10">
                {isAuthenticated ? (
                  <div className="flex flex-col items-center gap-3">
                    <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 text-base text-text-muted hover:text-primary transition-colors"><UserIcon />Профиль</Link>
                    <button onClick={() => { logout(); closeMenu(); }} className="text-sm text-text-muted/60 hover:text-error transition-colors">Выйти</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={closeMenu} className="flex items-center gap-2 text-base text-text-muted hover:text-primary transition-colors"><UserIcon />Войти</Link>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
