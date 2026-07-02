import { apiClient } from '@/api/client';

export interface PromoBannerResponse {
  id: string;
  title: string;
  subtitle: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface BannerPayload {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export const bannersApi = {
  getActive: () =>
    apiClient.get<PromoBannerResponse[]>('/banners/active').then((r) => r.data),

  getAll: () =>
    apiClient.get<PromoBannerResponse[]>('/banners').then((r) => r.data),

  create: (data: BannerPayload) =>
    apiClient.post<PromoBannerResponse>('/banners', data).then((r) => r.data),

  update: (id: string, data: BannerPayload) =>
    apiClient.put<PromoBannerResponse>(`/banners/${id}`, data).then((r) => r.data),

  uploadImage: (id: string, formData: FormData) =>
    apiClient.post<PromoBannerResponse>(`/banners/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  deleteImage: (id: string) =>
    apiClient.delete(`/banners/${id}/image`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/banners/${id}`).then((r) => r.data),
};
