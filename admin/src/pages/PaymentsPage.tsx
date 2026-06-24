import { useEffect, useState } from "react";
import { api, type PaymentOrder } from "../api";

function formatDate(date: string) {
  return new Date(date).toLocaleString("ru-RU");
}

function statusBadge(status: PaymentOrder["status"]) {
  switch (status) {
    case "PAID":
      return <span className="badge badge-success">Оплачен</span>;
    case "PENDING":
      return <span className="badge badge-warning">Ожидает</span>;
    case "FAILED":
      return <span className="badge badge-danger">Ошибка</span>;
    default:
      return <span className="badge badge-danger">Отменён</span>;
  }
}

export function PaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPaymentHistory()
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="page">
      <div className="header">
        <h1>История платежей</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {orders.filter((o) => o.status === "PAID").length}
          </div>
          <div className="stat-label">Оплачено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalPaid.toLocaleString("ru-RU")} ₽
          </div>
          <div className="stat-label">Сумма оплат</div>
        </div>
      </div>

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p>Заказов пока нет.</p>
        )}

        {!loading && orders.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Заказ</th>
                <th>Товары</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <code className="order-id">{order.id.slice(0, 8)}…</code>
                  </td>
                  <td>
                    <ul className="order-items-list">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.productName} × {item.quantity} —{" "}
                          {item.subtotal.toLocaleString("ru-RU")} ₽
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{order.totalAmount.toLocaleString("ru-RU")} ₽</td>
                  <td>{statusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
