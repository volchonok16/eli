import { apiRequest } from "@/api/client";
import type { Order, OrderStatus } from "@/api/types";

export function getOrders() {
  return apiRequest<Order[]>("/orders/history");
}

export function getOrder(id: string) {
  return apiRequest<Order>(`/orders/${id}`);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  managerNote?: string
) {
  return apiRequest<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, managerNote }),
  });
}

export function cancelOrder(id: string, reason: string) {
  return apiRequest<Order>(`/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
