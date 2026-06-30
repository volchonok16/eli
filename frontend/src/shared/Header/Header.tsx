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

const blendClass = '[mix-blend-mode:difference] hover:[mix-blend-mode:normal]';
const linkBlend = (isActive: boolean) => isActive ? 'text-primary [mix-blend-mode:normal]' : `text-surface/80 ${blendClass} hover:text-primary`;
const utilBlend = `text-surface/70 ${blendClass} hover:text-primary`;

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

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 safe-top ${isScrolled ? 'bg-surface/95 backdrop-blur-md shadow-[0_1px_0_rgba(28,25,23,0.04)]' : 'bg-surface-dark/20'}`}>

        {isScrolled ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 sm:py-3 flex items-center">
            <Link to="/" className="font-display font-bold italic text-primary text-xl sm:text-2xl tracking-wide shrink-0">Eli</Link>
            <nav className="hidden lg:flex items-center gap-6 ml-8">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={`text-xs sm:text-sm tracking-[0.03em] font-medium transition-colors ${pathname === to ? 'text-primary' : 'text-primary/55 hover:text-primary'}`}>{label}</Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-4 ml-auto">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-xs text-primary/50 hover:text-primary transition-colors">Профиль</Link>
                  <button onClick={logout} className="text-xs text-primary/50 hover:text-error transition-colors">Выйти</button>
                </>
              ) : (
                <Link to="/login" className="text-xs text-primary/50 hover:text-primary transition-colors">Войти</Link>
              )}
              <Link to="/cart" className="relative text-xs text-primary/50 hover:text-primary transition-colors px-1 py-0.5">Корзина{cartBadge}</Link>
            </div>
            <div className="lg:hidden flex items-center gap-4 ml-auto">
              <Link to="/cart" className="relative text-sm text-primary/70 px-1 py-2 min-w-[44px] font-medium" aria-label={`Корзина${itemCount > 0 ? `, ${itemCount} товаров` : ''}`}>Корзина{cartBadge}</Link>
              <button className="text-sm text-primary/70 font-medium px-1 py-2 min-w-[44px] min-h-[44px]" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>{isMenuOpen ? 'Закрыть' : 'Меню'}</button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4 sm:py-5">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-between w-full lg:justify-center">
                <Link to="/" className="font-display font-bold italic text-surface text-2xl sm:text-3xl tracking-wide [mix-blend-mode:difference] lg:text-center">Eli</Link>
                <div className="lg:hidden flex items-center gap-3">
                  <Link to="/cart" className="relative text-sm text-surface min-w-[44px] py-2 font-bold [mix-blend-mode:difference] hover:[mix-blend-mode:normal] hover:text-accent-light transition-colors" aria-label={`Корзина${itemCount > 0 ? `, ${itemCount} товаров` : ''}`}>Корзина{cartBadge}</Link>
                  <button className="text-sm text-surface font-bold min-w-[44px] min-h-[44px] py-2 [mix-blend-mode:difference] hover:[mix-blend-mode:normal] hover:text-accent-light transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>{isMenuOpen ? 'Закрыть' : 'Меню'}</button>
                </div>
              </div>

              <nav className="hidden lg:flex items-center gap-6 sm:gap-8">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className={`text-xs sm:text-sm tracking-[0.03em] font-medium transition-colors ${linkBlend(pathname === to)}`}>{label}</Link>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-5 mt-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className={`text-[11px] sm:text-xs transition-colors ${utilBlend}`}>Профиль</Link>
                    <span className="text-surface/20 text-xs">·</span>
                    <button onClick={logout} className={`text-[11px] sm:text-xs transition-colors ${utilBlend} hover:text-error`}>Выйти</button>
                  </>
                ) : (
                  <Link to="/login" className={`text-[11px] sm:text-xs transition-colors ${utilBlend}`}>Войти</Link>
                )}
                <span className="text-surface/20 text-xs">·</span>
                <Link to="/cart" className={`relative text-[11px] sm:text-xs transition-colors ${utilBlend}`}>Корзина{cartBadge}</Link>
              </div>
            </div>
          </div>
        )}

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
                    <Link to="/profile" onClick={closeMenu} className="text-base text-text-muted hover:text-primary transition-colors">Профиль</Link>
                    <button onClick={() => { logout(); closeMenu(); }} className="text-sm text-text-muted/60 hover:text-error transition-colors">Выйти</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={closeMenu} className="text-base text-text-muted hover:text-primary transition-colors">Войти</Link>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
