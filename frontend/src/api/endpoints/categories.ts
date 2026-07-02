import { apiClient } from '@/api/client';

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  children: CategoryResponse[];
}

export interface CategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
}

export const categoriesApi = {
  getTree: () =>
    apiClient.get<CategoryResponse[]>('/categories').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<CategoryResponse>(`/categories/${id}`).then((r) => r.data),

  create: (data: CategoryPayload) =>
    apiClient.post<CategoryResponse>('/categories', data).then((r) => r.data),

  update: (id: string, data: CategoryPayload) =>
    apiClient.put<CategoryResponse>(`/categories/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
