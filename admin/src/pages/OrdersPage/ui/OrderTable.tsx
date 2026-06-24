import { useState } from "react";
import type { Order, OrderStatus } from "@/api/types";
import { formatLocal, formatRub } from "@/shared/utils/formatDate";
import s from "../../SharedForm.module.scss";

function statusBadge(status: OrderStatus) {
  const map: Record<string, string> = {
    PAID: "badge-success", PENDING: "badge-warning", FAILED: "badge-danger",
    CANCELLED: "badge-danger", PROCESSING: "badge-success", ASSEMBLED: "badge-success",
    DELIVERING: "badge-success", COMPLETED: "badge-success",
  };
  return <span className={`badge ${map[status] ?? "badge-warning"}`}>{status}</span>;
}

interface OrderRowProps {
  order: Order;
  labels: Record<OrderStatus, string>;
  flow: Record<OrderStatus, OrderStatus[]>;
  onChangeStatus: (id: string, status: OrderStatus) => void;
  onCancel: (id: string, reason: string) => void;
}

function OrderRow({ order, labels, flow, onChangeStatus, onCancel }: OrderRowProps) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const nextStatuses = flow[order.status] ?? [];

  return (
    <tr>
      <td>{formatLocal(order.createdAt)}</td>
      <td><code className="order-id">{order.id.slice(0, 8)}…</code></td>
      <td>
        {order.customerName && <div>{order.customerName}</div>}
        {order.customerPhone && <div className="text-muted">{order.customerPhone}</div>}
      </td>
      <td>
        <ul className="order-items-list">
          {order.items.map((item) => (
            <li key={item.id}>{item.productName} × {item.quantity} — {formatRub(item.subtotal)}</li>
          ))}
        </ul>
      </td>
      <td>{order.deliveryType === "COURIER" ? "Доставка" : order.deliveryType === "SELF_PICKUP" ? "Самовывоз" : "—"}</td>
      <td>{formatRub(order.totalAmount)}</td>
      <td>{statusBadge(order.status)}</td>
      <td>
        {!showCancel ? (
          <div className={`actions ${s.statusActions}`}>
            {nextStatuses
              .filter((st) => st !== "CANCELLED")
              .map((st) => (
                <button key={st} className={`btn btn-secondary ${s.statusBtn}`}
                  onClick={() => onChangeStatus(order.id, st)}>
                  {labels[st]}
                </button>
              ))}
            {nextStatuses.includes("CANCELLED") && (
              <button className={`btn btn-danger ${s.statusBtn}`}
                onClick={() => setShowCancel(true)}>
                Отменить
              </button>
            )}
            {order.cancelReason && (
              <div className="text-muted">Причина: {order.cancelReason}</div>
            )}
          </div>
        ) : (
          <div>
            <input placeholder="Причина отмены" value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={s.cancelInput} />
            <div className="actions">
              <button className={`btn btn-danger ${s.statusBtn}`}
                onClick={() => { onCancel(order.id, cancelReason); setShowCancel(false); setCancelReason(""); }}>
                Подтвердить
              </button>
              <button className={`btn btn-secondary ${s.statusBtn}`}
                onClick={() => setShowCancel(false)}>Отмена</button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

interface OrderTableProps {
  orders: Order[];
  labels: Record<OrderStatus, string>;
  flow: Record<OrderStatus, OrderStatus[]>;
  onChangeStatus: (id: string, status: OrderStatus) => void;
  onCancel: (id: string, reason: string) => void;
}

export function OrderTable({ orders, labels, flow, onChangeStatus, onCancel }: OrderTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Заказ</th>
          <th>Клиент</th>
          <th>Товары</th>
          <th>Тип</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} labels={labels} flow={flow}
            onChangeStatus={onChangeStatus} onCancel={onCancel} />
        ))}
      </tbody>
    </table>
  );
}
