import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const CheckoutPage = () => (
  <div className="min-h-screen bg-surface">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl text-primary mb-12"
      >
        Оформление заказа
      </motion.h1>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <h2 className="font-serif text-xl text-primary mb-4">Контактные данные</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input-field" placeholder="Имя" required />
              <input className="input-field" type="tel" placeholder="Телефон" required />
              <input className="input-field sm:col-span-2" type="email" placeholder="Email" required />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-4">Способ получения</h2>
            <div className="space-y-3">
              <label className="card p-4 flex items-center gap-4 cursor-pointer">
                <input type="radio" name="delivery" value="pickup" defaultChecked className="accent-accent" />
                <div>
                  <p className="font-medium text-primary">Самовывоз с ёлочного базара</p>
                  <p className="text-sm text-text-muted">Выберите удобную точку на карте</p>
                </div>
              </label>
              <label className="card p-4 flex items-center gap-4 cursor-pointer">
                <input type="radio" name="delivery" value="courier" className="accent-accent" />
                <div>
                  <p className="font-medium text-primary">Курьерская доставка</p>
                  <p className="text-sm text-text-muted">Стоимость рассчитывается по зонам</p>
                </div>
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-4">Адрес доставки</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input-field sm:col-span-2" placeholder="Адрес" />
              <input className="input-field" placeholder="Город" />
              <input className="input-field" placeholder="Индекс" />
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-serif text-xl text-primary mb-6">Ваш заказ</h2>
            <div className="space-y-3 text-sm text-text-muted mb-4">
              <div className="flex justify-between"><span>Ель Голубая × 1</span><span>25 000 ₽</span></div>
              <div className="flex justify-between"><span>Доставка</span><span>от 1 500 ₽</span></div>
            </div>
            <div className="border-t border-surface-muted pt-4 mb-6">
              <div className="flex justify-between font-serif text-lg text-primary">
                <span>Итого</span><span>26 500 ₽</span>
              </div>
            </div>
            <button className="btn-primary w-full mb-3">Перейти к оплате</button>
            <Link to="/cart" className="block text-center text-sm text-text-muted hover:text-primary transition-colors">
              Вернуться в корзину
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);
