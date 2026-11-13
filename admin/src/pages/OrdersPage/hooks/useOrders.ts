import { useCallback, useEffect, useState } from "react";
import { getOrders, updateOrderStatus, cancelOrder } from "@/api/endpoints/orders";
import type { Order, OrderStatus } from "@/api/types";

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["ASSEMBLED", "CANCELLED"],
  ASSEMBLED: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
  FAILED: [],
};

export function actionLabel(status: OrderStatus, deliveryType: "SELF_PICKUP" | "COURIER" | null): string {
  if (status === "DELIVERING") return deliveryType === "SELF_PICKUP" ? "К выдаче" : "В пути";
  if (status === "COMPLETED") return deliveryType === "SELF_PICKUP" ? "Выдан" : "Доставлен";
  if (status === "PROCESSING") return "В работу";
  if (status === "ASSEMBLED") return "Собран";
  if (status === "CANCELLED") return "Отменить";
  return status;
}

export function useOrders() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getOrders()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const changeStatus = useCallback(async (id: string, status: OrderStatus) => {
    setBusyId(id);
    try {
      const updated = await updateOrderStatus(id, status);
      setData((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сменить статус");
    } finally {
      setBusyId(null);
    }
  }, []);

  const cancel = useCallback(async (id: string, reason: string) => {
    setBusyId(id);
    try {
      const updated = await cancelOrder(id, reason);
      setData((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отменить заказ");
      throw e;
    } finally {
      setBusyId(null);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, busyId, refetch: fetch, changeStatus, cancel, STATUS_FLOW };
}
