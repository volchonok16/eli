import { apiClient } from '@/api/client';

interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  height: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

export const cartApi = {
  get: () =>
    apiClient.get<CartResponse>('/cart').then((r) => r.data),

  addItem: (productId: string, quantity?: number) =>
    apiClient.post<CartResponse>('/cart/items', { productId, quantity }).then((r) => r.data),

  updateQuantity: (itemId: string, quantity: number) =>
    apiClient.patch<CartResponse>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),

  removeItem: (itemId: string) =>
    apiClient.delete(`/cart/items/${itemId}`).then((r) => r.data),

  checkout: () =>
    apiClient.post<{ orderId: string }>('/cart/checkout').then((r) => r.data),
};
