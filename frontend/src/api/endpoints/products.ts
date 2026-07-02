import { apiClient } from '@/api/client';

export interface ProductResponse {
  id: string;
  name: string;
  latinName: string;
  description?: string;
  height: string;
  price: number;
  category?: string;
  images?: string[];
  image?: string;
  inStock?: boolean;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getAll: (params?: ProductFilters) =>
    apiClient.get<ProductResponse[]>('/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ProductResponse>(`/products/${id}`).then((r) => r.data),
};
