import { apiClient } from '@/api/client';

export interface ReviewResponse {
  id: string;
  productId: string | null;
  authorName: string;
  text: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPayload {
  authorName: string;
  text: string;
  rating?: number;
  isPublished?: boolean;
  productId?: string | null;
}

export const reviewsApi = {
  getPublished: () =>
    apiClient.get<ReviewResponse[]>('/reviews/published').then((r) => r.data),

  getAll: () =>
    apiClient.get<ReviewResponse[]>('/reviews').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ReviewResponse>(`/reviews/${id}`).then((r) => r.data),

  create: (data: ReviewPayload) =>
    apiClient.post<ReviewResponse>('/reviews', data).then((r) => r.data),

  update: (id: string, data: ReviewPayload) =>
    apiClient.put<ReviewResponse>(`/reviews/${id}`, data).then((r) => r.data),

  togglePublish: (id: string) =>
    apiClient.patch<ReviewResponse>(`/reviews/${id}/publish`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/reviews/${id}`).then((r) => r.data),
};
