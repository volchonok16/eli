import { useCallback, useEffect, useState } from "react";
import { getOrders, updateOrderStatus, cancelOrder } from "@/api/endpoints/orders";
import type { Order, OrderStatus } from "@/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  PROCESSING: "В обработке",
  ASSEMBLED: "Собран",
  DELIVERING: "Доставляется",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
  FAILED: "Ошибка",
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["ASSEMBLED", "CANCELLED"],
  ASSEMBLED: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

export function useOrders() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getOrders()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const changeStatus = useCallback(async (id: string, status: OrderStatus) => {
    const updated = await updateOrderStatus(id, status);
    setData((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const cancel = useCallback(async (id: string, reason: string) => {
    const updated = await cancelOrder(id, reason);
    setData((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, changeStatus, cancel, STATUS_LABELS, STATUS_FLOW };
}
