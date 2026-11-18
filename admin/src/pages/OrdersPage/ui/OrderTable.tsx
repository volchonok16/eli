import { useState } from "react";
import type { Order, OrderStatus } from "@/api/types";
import { formatLocal, formatRub } from "@/shared/utils/formatDate";
import { actionLabel } from "../hooks/useOrders";
import s from "../../SharedForm.module.scss";

const refundable = new Set<OrderStatus>(["PAID", "PROCESSING", "ASSEMBLED", "DELIVERING", "COMPLETED"]);

function statusBadge(order: Order) {
  const map: Record<string, string> = {
    PAID: "badge-success",
    PENDING: "badge-warning",
    FAILED: "badge-danger",
    CANCELLED: "badge-danger",
    PROCESSING: "badge-hit",
    ASSEMBLED: "badge-hit",
    DELIVERING: "badge-success",
    COMPLETED: "badge-success",
  };
  return <span className={`badge ${map[order.status] ?? "badge-warning"}`}>{order.statusLabel}</span>;
}

function orderNumber(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

interface OrderRowProps {
  order: Order;
  flow: Record<OrderStatus, OrderStatus[]>;
  busy: boolean;
  onChangeStatus: (id: string, status: OrderStatus) => void;
  onCancel: (id: string, reason: string) => Promise<void>;
}

function OrderRow({ order, flow, busy, onChangeStatus, onCancel }: OrderRowProps) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const nextStatuses = (flow[order.status] ?? []).filter((status) => status !== "CANCELLED");
  const canCancel = (flow[order.status] ?? []).includes("CANCELLED");
  const returnsMoney = refundable.has(order.status);

  async function confirmCancel() {
    const reason = cancelReason.trim();
    if (!reason) return;
    try {
      await onCancel(order.id, reason);
      setShowCancel(false);
      setCancelReason("");
    } catch {
      setShowCancel(true);
    }
  }

  return (
    <tr>
      <td>{formatLocal(order.createdAt)}</td>
      <td><code className="order-id">№ {orderNumber(order.id)}</code></td>
      <td>
        {order.customerName && <div>{order.customerName}</div>}
        {order.customerPhone && <div className="text-muted">{order.customerPhone}</div>}
        {order.customerEmail && <div className="text-muted">{order.customerEmail}</div>}
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
      <td>{statusBadge(order)}</td>
      <td>
        {!showCancel ? (
          <div className={`actions ${s.statusActions}`}>
            {nextStatuses.map((status) => (
              <button
                key={status}
                className={`btn btn-primary ${s.statusBtn}`}
                disabled={busy}
                onClick={() => onChangeStatus(order.id, status)}
              >
                {actionLabel(status, order.deliveryType)}
              </button>
            ))}
            {canCancel && (
              <button
                className={`btn btn-secondary ${s.statusBtn}`}
                disabled={busy}
                onClick={() => setShowCancel(true)}
              >
                {returnsMoney ? "Вернуть деньги" : "Отменить"}
              </button>
            )}
            {order.cancelReason && (
              <div className="text-muted">Причина: {order.cancelReason}</div>
            )}
          </div>
        ) : (
          <div className={s.cancelBox}>
            <p className={s.cancelNote}>
              {returnsMoney
                ? "Отменим заказ и вернём всю сумму через Точку. На карту деньги обычно приходят за 3–7 дней, по СБП — быстрее."
                : "Заказ ещё не оплачен, списывать нечего."}
            </p>
            <input
              placeholder="Причина отмены"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={s.cancelInput}
            />
            <div className={`actions ${s.statusActions}`}>
              <button
                className={`btn btn-danger ${s.statusBtn}`}
                disabled={busy || cancelReason.trim().length === 0}
                onClick={confirmCancel}
              >
                {returnsMoney ? "Вернуть" : "Отменить заказ"}
              </button>
              <button
                className={`btn btn-secondary ${s.statusBtn}`}
                disabled={busy}
                onClick={() => setShowCancel(false)}
              >
                Назад
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

interface OrderTableProps {
  orders: Order[];
  flow: Record<OrderStatus, OrderStatus[]>;
  busyId: string | null;
  onChangeStatus: (id: string, status: OrderStatus) => void;
  onCancel: (id: string, reason: string) => Promise<void>;
}

export function OrderTable({ orders, flow, busyId, onChangeStatus, onCancel }: OrderTableProps) {
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
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            flow={flow}
            busy={busyId === order.id}
            onChangeStatus={onChangeStatus}
            onCancel={onCancel}
          />
        ))}
      </tbody>
    </table>
  );
}
