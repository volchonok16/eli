import { apiClient } from '@/api/client';

export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePayload {
  name: string;
  description?: string;
  price?: number | null;
  isActive?: boolean;
}

export const servicesApi = {
  getAll: () =>
    apiClient.get<ServiceResponse[]>('/services').then((r) => r.data),

  getActive: () =>
    apiClient.get<ServiceResponse[]>('/services/active').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ServiceResponse>(`/services/${id}`).then((r) => r.data),

  create: (data: ServicePayload) =>
    apiClient.post<ServiceResponse>('/services', data).then((r) => r.data),

  update: (id: string, data: ServicePayload) =>
    apiClient.put<ServiceResponse>(`/services/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/services/${id}`).then((r) => r.data),
};
