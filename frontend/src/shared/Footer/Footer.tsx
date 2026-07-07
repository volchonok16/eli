import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-primary text-text-inverse">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
        <div>
          <h3 className="font-display text-xl font-bold italic mb-3 sm:mb-4">Eli</h3>
          <p className="text-text-inverse/70 text-sm leading-relaxed max-w-xs">
            Живые новогодние ёлки с доставкой по Москве и области. Праздник начинается здесь.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-text-inverse/40">Покупателям</h4>
          <nav className="flex flex-col gap-2 sm:gap-3">
            <Link to="/catalog" className="text-text-inverse/70 text-sm hover:text-accent transition-colors py-1">Каталог</Link>
            <Link to="/wholesale" className="text-text-inverse/70 text-sm hover:text-accent transition-colors py-1">Ёлки оптом</Link>
            <Link to="/bases" className="text-text-inverse/70 text-sm hover:text-accent transition-colors py-1">Ёлочные базары</Link>
          </nav>
        </div>

        <div>
          <h4 className="font-medium text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-text-inverse/40">Компания</h4>
          <nav className="flex flex-col gap-2 sm:gap-3">
            <Link to="/about" className="text-text-inverse/70 text-sm hover:text-accent transition-colors py-1">О нас</Link>
            <Link to="/partners" className="text-text-inverse/70 text-sm hover:text-accent transition-colors py-1">Сотрудничество</Link>
          </nav>
        </div>

        <div>
          <h4 className="font-medium text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-text-inverse/40">Контакты</h4>
          <div className="flex flex-col gap-2 sm:gap-3 text-text-inverse/70 text-sm">
            <a href="tel:+79991234567" className="hover:text-accent transition-colors py-1">+7 (999) 123-45-67</a>
            <a href="mailto:info@eli-shop.ru" className="hover:text-accent transition-colors py-1">info@eli-shop.ru</a>
            <span>г. Москва, ул. Лесная, 15</span>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-light/20 text-center text-text-inverse/30 text-xs sm:text-sm">
        © {new Date().getFullYear()} Eli. Все права защищены.
      </div>
    </div>
  </footer>
);
