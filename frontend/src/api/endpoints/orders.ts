import { apiClient } from '@/api/client';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'ASSEMBLED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type DeliveryType = 'SELF_PICKUP' | 'COURIER';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItem[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryType?: DeliveryType;
  salePointId?: string;
  deliveryAddress?: string;
  deliveryZoneId?: string;
}

export interface OrderItemResponse {
  id: string;
  quantity: number;
  price: number;
  productName: string;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  totalAmount: number;
  deliveryType: DeliveryType | null;
  deliveryCost: number | null;
  deliveryAddress: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  salePoint: { id: string; shortName: string } | null;
  cancelReason: string | null;
  managerNote: string | null;
  paymentLink: string | null;
  cartReservedUntil: string | null;
  paymentExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

export interface CreateOrderResult {
  orderId: string;
  totalAmount: number;
  deliveryCost: number | null;
  paymentLink: string;
  status: OrderStatus;
  cartReservedUntil: string;
  paymentExpiresAt: string;
}

export interface OrderStatusResult {
  status: OrderStatus;
  paymentExpiresAt?: string;
  cartReservedUntil?: string;
}

export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    apiClient.post<CreateOrderResult>('/orders', data).then((r) => r.data),

  getMyOrders: () =>
    apiClient.get<OrderResponse[]>('/orders/my').then((r) => r.data),

  getHistory: () =>
    apiClient.get<OrderResponse[]>('/orders/history').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<OrderResponse>(`/orders/${id}`).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<OrderStatusResult>(`/orders/${id}/status`).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus, managerNote?: string) =>
    apiClient.patch<OrderResponse>(`/orders/${id}/status`, { status, managerNote }).then((r) => r.data),

  cancel: (id: string, reason: string) =>
    apiClient.post<OrderResponse>(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
};
