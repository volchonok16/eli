import { apiClient } from '@/api/client';

export interface SalePointResponse {
  id: string;
  shortName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  description: string | null;
  workingHours: Record<string, unknown> | null;
  imageKey: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalePointPayload {
  shortName: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  description?: string | null;
  workingHours?: Record<string, unknown> | null;
  isActive?: boolean;
}

export const salePointsApi = {
  getAll: (onlyActive?: boolean) =>
    apiClient.get<SalePointResponse[]>('/sale-points', {
      params: onlyActive ? { isActive: 'true' } : undefined,
    }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<SalePointResponse>(`/sale-points/${id}`).then((r) => r.data),

  create: (data: SalePointPayload) =>
    apiClient.post<SalePointResponse>('/sale-points', data).then((r) => r.data),

  update: (id: string, data: SalePointPayload) =>
    apiClient.put<SalePointResponse>(`/sale-points/${id}`, data).then((r) => r.data),

  uploadImage: (id: string, formData: FormData) =>
    apiClient.post<SalePointResponse>(`/sale-points/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  deleteImage: (id: string) =>
    apiClient.delete(`/sale-points/${id}/image`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/sale-points/${id}`).then((r) => r.data),
};
