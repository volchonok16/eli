import { apiClient } from '@/api/client';

interface BackendCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    heightLabel: string | null;
    images: { url: string; key?: string }[];
  };
}

interface BackendCartResponse {
  id: string;
  items: BackendCartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  height: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

function mapCart(data: BackendCartResponse): CartResponse {
  return {
    items: data.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      height: item.product.heightLabel ?? '—',
      price: item.price,
      quantity: item.quantity,
      image: item.product.images[0]
        ? item.product.images[0].key
          ? `/api/files/${item.product.images[0].key}`
          : item.product.images[0].url
        : '',
    })),
    total: data.totalAmount,
  };
}

export const cartApi = {
  get: () =>
    apiClient.get<BackendCartResponse>('/cart').then((r) => mapCart(r.data)),

  addItem: (productId: string, quantity?: number) =>
    apiClient
      .post<BackendCartResponse>('/cart/items', { productId, quantity })
      .then((r) => mapCart(r.data)),

  updateQuantity: (productId: string, quantity: number) =>
    apiClient
      .put<BackendCartResponse>(`/cart/items/${productId}`, { quantity })
      .then((r) => mapCart(r.data)),

  removeItem: (productId: string) =>
    apiClient
      .delete<BackendCartResponse>(`/cart/items/${productId}`)
      .then((r) => mapCart(r.data)),

  clear: () =>
    apiClient.delete<BackendCartResponse>('/cart').then((r) => mapCart(r.data)),
};
