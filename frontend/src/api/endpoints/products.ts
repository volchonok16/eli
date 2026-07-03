import { apiClient } from '@/api/client';

export interface ProductImage {
  id: string;
  productId: string;
  key: string;
  url: string;
  sortOrder: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductResponse {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  careGuide: string | null;
  height: number | null;
  heightLabel: string | null;
  sort: string | null;
  price: number;
  costPrice: number | null;
  quantity: number;
  reserved: number;
  inStock: boolean;
  isHit: boolean;
  isNew: boolean;
  available: boolean;
  categoryId: string | null;
  category: ProductCategory | null;
  salePointId: string | null;
  salePoint: { id: string; shortName: string } | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
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
