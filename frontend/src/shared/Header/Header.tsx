import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/shared/contexts';
import { useCartContext } from '@/shared/contexts';
import { UserIcon } from './ui/UserIcon';
import { CartIcon } from './ui/CartIcon';
import styles from './Header.module.css';

const navLinks = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/bases', label: 'Базары' },
  { to: '/wholesale', label: 'Оптом' },
  { to: '/partners', label: 'Партнёрам' },
  { to: '/about', label: 'О нас' },
];

const isNavActive = (pathname: string, to: string) => pathname === to || (to === '/catalog' && pathname.startsWith('/product/'));

const stagger = { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }, exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } };
const itemAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }, exit: { opacity: 0, y: 10, transition: { duration: 0.25 } } };

export const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
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

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    };
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    updateHeaderHeight();

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const cartBadge = itemCount > 0 && <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-accent text-surface text-[9px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>;

  const navItems = navLinks.map(({ to, label }) => (
    <Link key={to} to={to} aria-current={isNavActive(pathname, to) ? 'page' : undefined} className="text-[11px] tracking-[0.03em] font-medium transition-colors lg:text-xs">{label}</Link>
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
      <header ref={headerRef} className={`${styles.header} glass-panel fixed top-0 inset-x-0 z-50 transition-all duration-500 safe-top`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div layout className="flex w-full items-center justify-between gap-6 lg:gap-10">
            <motion.div layout className="shrink-0">
              <Link to="/" className={`block font-display font-bold italic text-primary tracking-wide transition-all duration-500 ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'} ${!isScrolled ? 'lg:text-4xl' : ''}`}>Eli</Link>
            </motion.div>

              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:flex min-w-0 flex-1 items-center justify-end gap-5 lg:gap-8">
                <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6">{navItems}</nav>
                <div className="flex items-center gap-4">{utilAuth}</div>
                <Link to="/cart" className="relative flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary transition-colors"><CartIcon />Корзина{cartBadge}</Link>
            </motion.div>

            <div className="md:hidden ml-auto flex items-center gap-4">
              <Link to="/cart" className="relative flex items-center gap-1 text-sm text-primary/70 px-1 py-2 min-w-[44px] font-medium" aria-label={`Корзина${itemCount > 0 ? `, ${itemCount} товаров` : ''}`}><CartIcon />{cartBadge}</Link>
              <button className="text-sm text-primary/70 font-medium px-1 py-2 min-w-[44px] min-h-[44px]" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>{isMenuOpen ? 'Закрыть' : 'Меню'}</button>
            </div>
          </motion.div>

        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-surface/98 backdrop-blur-md flex items-center justify-center lg:hidden">
            <button className="absolute top-4 right-4 text-sm text-text-muted/40 hover:text-primary transition-colors px-3 py-2 min-w-[44px] min-h-[44px] z-10" onClick={closeMenu} aria-label="Закрыть меню">Закрыть</button>
            <motion.nav variants={stagger} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <motion.div key={to} variants={itemAnim}>
                  <Link to={to} onClick={closeMenu} aria-current={isNavActive(pathname, to) ? 'page' : undefined} className={`block text-2xl font-serif py-3 px-6 transition-colors ${isNavActive(pathname, to) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>{label}</Link>
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
