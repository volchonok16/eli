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
  categoryId?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  heightMin?: number;
  heightMax?: number;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
}

interface PaginatedProducts {
  items: ProductResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function isPaginated(data: ProductResponse[] | PaginatedProducts): data is PaginatedProducts {
  return !Array.isArray(data) && Array.isArray(data.items);
}

export const productsApi = {
  getAll: async (params?: ProductFilters) => {
    const query = {
      ...params,
      categoryId: params?.categoryId ?? params?.category,
      category: undefined,
    };
    const { data } = await apiClient.get<ProductResponse[] | PaginatedProducts>('/products', {
      params: query,
    });
    return isPaginated(data) ? data.items : data;
  },

  getPaginated: (params?: ProductFilters) =>
    apiClient
      .get<PaginatedProducts>('/products', {
        params: {
          ...params,
          categoryId: params?.categoryId ?? params?.category,
          page: params?.page ?? 1,
        },
      })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  getRelated: (id: string) =>
    apiClient.get<ProductResponse[]>(`/products/${id}/related`).then((r) => r.data),
};
