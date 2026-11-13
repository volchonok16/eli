import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { ordersApi, type OrderResponse } from '@/api/endpoints/orders';
import { cartApi } from '@/api/endpoints/cart';

const paidStatuses = new Set(['PAID', 'PROCESSING', 'ASSEMBLED', 'DELIVERING', 'COMPLETED']);

function isPaid(status: string | undefined): boolean {
  return Boolean(status && paidStatuses.has(status));
}

function orderNumber(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

async function loadPaidOrder(id: string): Promise<OrderResponse> {
  try {
    await ordersApi.confirmPayment(id);
  } catch {
    // Статус в банке может появиться на следующем запросе.
  }
  return ordersApi.getById(id);
}

export const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order') ?? '';
  const queryClient = useQueryClient();
  const cartCleared = useRef(false);

  const order = useQuery({
    queryKey: ['payment-order', orderId],
    queryFn: () => loadPaidOrder(orderId),
    enabled: Boolean(orderId),
    retry: 4,
    retryDelay: 2000,
    refetchInterval: (query) => (isPaid(query.state.data?.status) ? false : 3000),
  });

  useEffect(() => {
    if (!isPaid(order.data?.status) || cartCleared.current) return;
    cartCleared.current = true;
    cartApi.clear()
      .then(() => queryClient.invalidateQueries({ queryKey: ['cart'] }))
      .catch(() => undefined);
  }, [order.data?.status, queryClient]);

  const paid = isPaid(order.data?.status);
  const number = orderId ? orderNumber(orderId) : '';

  return (
    <div className="min-h-[70vh] bg-surface">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Оплата</p>
        <h1 className="font-display text-4xl sm:text-6xl text-primary leading-[0.95] mb-6">
          {paid ? 'Спасибо, заказ оплачен' : 'Спасибо за заказ'}
        </h1>
        <p className="text-text-muted text-base sm:text-lg max-w-xl mb-10">
          {paid
            ? 'Мы получили оплату и отправили письмо с номером заказа. Кассовый чек придёт отдельно от Точки.'
            : 'Платёж ещё подтверждается. Номер заказа уже можно сохранить.'}
        </p>

        {number && (
          <div className="border border-surface-muted bg-surface-dark p-6 sm:p-8 mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Номер заказа</p>
            <p className="font-display text-4xl sm:text-5xl text-primary">№ {number}</p>
            {order.data && (
              <p className="mt-4 text-primary text-lg">{formatMoney(order.data.totalAmount)}</p>
            )}
            {order.data?.salePoint && (
              <p className="mt-2 text-sm text-text-muted">Самовывоз · {order.data.salePoint.shortName}</p>
            )}
            {order.data?.deliveryAddress && (
              <p className="mt-2 text-sm text-text-muted">Доставка · {order.data.deliveryAddress}</p>
            )}
          </div>
        )}

        {order.data && order.data.items.length > 0 && (
          <ul className="divide-y divide-surface-muted border-y border-surface-muted mb-10">
            {order.data.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                <span className="text-primary">{item.productName} × {item.quantity}</span>
                <span className="text-text-muted whitespace-nowrap">{formatMoney(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}

        {!orderId && (
          <p className="text-text-muted mb-10">Номер заказа не передан. Если оплата прошла, письмо с номером уже в почте.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/catalog" className="btn-primary">В каталог</Link>
          <Link to="/" className="btn-outline">На главную</Link>
        </div>
      </section>
    </div>
  );
};
