import { apiClient } from '@/api/client';

export type ApplicationStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface ApplicationResponse {
  id: string;
  name: string;
  contact: string;
  message: string | null;
  serviceId: string | null;
  status: ApplicationStatus;
  statusLabel: string;
  service: { id: string; name: string; price: number | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationPayload {
  name: string;
  contact: string;
  message?: string;
  serviceId?: string;
}

export interface ApplicationUpdatePayload {
  status: ApplicationStatus;
}

export const applicationsApi = {
  create: (data: ApplicationPayload) =>
    apiClient.post<ApplicationResponse>('/applications', data).then((r) => r.data),

  getAll: () =>
    apiClient.get<ApplicationResponse[]>('/applications').then((r) => r.data),

  updateStatus: (id: string, data: ApplicationUpdatePayload) =>
    apiClient.patch<ApplicationResponse>(`/applications/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/applications/${id}`).then((r) => r.data),
};
