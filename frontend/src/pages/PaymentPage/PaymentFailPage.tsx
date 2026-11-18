import { Link, useSearchParams } from 'react-router-dom';

function orderNumber(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export const PaymentFailPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order') ?? '';
  const number = orderId ? orderNumber(orderId) : '';

  return (
    <div className="min-h-[70vh] bg-surface">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Оплата</p>
        <h1 className="font-display text-4xl sm:text-6xl text-primary leading-[0.95] mb-6">
          Оплата не прошла
        </h1>
        <p className="text-text-muted text-base sm:text-lg max-w-xl mb-10">
          Деньги не списаны. Заказ сохранён, его можно оплатить ещё раз.
        </p>
        {number && (
          <div className="border border-surface-muted bg-surface-dark p-6 sm:p-8 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Номер заказа</p>
            <p className="font-display text-4xl sm:text-5xl text-primary">№ {number}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/checkout" className="btn-primary">Вернуться к оплате</Link>
          <Link to="/catalog" className="btn-outline">В каталог</Link>
        </div>
      </section>
    </div>
  );
};
