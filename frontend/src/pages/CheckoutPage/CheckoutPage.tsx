import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { useCreateOrder } from './hooks/useCheckout';
import { useCart } from '@/pages/CartPage/useCart';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { data: cart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState<'pickup' | 'courier'>('pickup');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const cartItems = cart?.items ?? [];
  const cartTotal = cart?.total ?? 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !email) {
      setError('Заполните все контактные поля');
      return;
    }

    if (cartItems.length === 0) {
      setError('Корзина пуста. Добавьте товары перед оформлением заказа.');
      return;
    }

    createOrder.mutate(
      {
        items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        deliveryType: delivery === 'courier' ? 'COURIER' : 'SELF_PICKUP',
        deliveryAddress: delivery === 'courier' ? address : undefined,
      },
      {
        onSuccess: (data) => {
          if (data.paymentLink) {
            window.location.href = data.paymentLink;
          } else {
            navigate(`/orders/${data.orderId}`);
          }
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Ошибка при создании заказа');
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl text-primary mb-12"
        >
          Оформление заказа
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-8">
              {error && (
                <p className="text-error text-sm bg-error/5 border border-error/20 p-3">{error}</p>
              )}

              <section>
                <h2 className="font-serif text-xl text-primary mb-4">Контактные данные</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    className="input-field"
                    placeholder="Имя"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="input-field"
                    type="tel"
                    placeholder="Телефон"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    className="input-field sm:col-span-2"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </section>

              <section>
                <h2 className="font-serif text-xl text-primary mb-4">Способ получения</h2>
                <div className="space-y-3">
                  <label className="card p-4 flex items-center gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={delivery === 'pickup'}
                      onChange={() => setDelivery('pickup')}
                      className="accent-accent"
                    />
                    <div>
                      <p className="font-medium text-primary">Самовывоз с ёлочного базара</p>
                      <p className="text-sm text-text-muted">Выберите удобную точку на карте</p>
                    </div>
                  </label>
                  <label className="card p-4 flex items-center gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value="courier"
                      checked={delivery === 'courier'}
                      onChange={() => setDelivery('courier')}
                      className="accent-accent"
                    />
                    <div>
                      <p className="font-medium text-primary">Курьерская доставка</p>
                      <p className="text-sm text-text-muted">Стоимость рассчитывается по зонам</p>
                    </div>
                  </label>
                </div>
              </section>

              {delivery === 'courier' && (
                <section>
                  <h2 className="font-serif text-xl text-primary mb-4">Адрес доставки</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      className="input-field sm:col-span-2"
                      placeholder="Адрес"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <h2 className="font-serif text-xl text-primary mb-6">Ваш заказ</h2>
                {cartItems.length > 0 ? (
                  <div className="space-y-3 text-sm mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-text-muted">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                      </div>
                    ))}
                    <div className="border-t border-surface-muted pt-4 mt-4 flex justify-between font-serif text-lg text-primary">
                      <span>Итого</span>
                      <span>{cartTotal.toLocaleString()} ₽</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-muted text-sm mb-4">Корзина пуста</p>
                )}
                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="btn-primary w-full mb-3"
                >
                  {createOrder.isPending ? 'Создание заказа...' : 'Перейти к оплате'}
                </button>
                <Link to="/cart" className="block text-center text-sm text-text-muted hover:text-primary transition-colors">
                  Вернуться в корзину
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
