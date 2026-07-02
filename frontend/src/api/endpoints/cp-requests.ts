import { apiClient } from '@/api/client';

export interface CpRequestResponse {
  id: string;
  companyName: string;
  inn: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  requirements: string | null;
  isProcessed: boolean;
  managerNote: string | null;
  userId: string | null;
  createdAt: string;
}

export interface CpRequestPayload {
  companyName: string;
  inn?: string;
  contactName: string;
  phone: string;
  email?: string;
  requirements?: string;
}

export interface CpRequestUpdatePayload {
  isProcessed?: boolean;
  managerNote?: string;
}

export const cpRequestsApi = {
  create: (data: CpRequestPayload) =>
    apiClient.post<CpRequestResponse>('/cp-requests', data).then((r) => r.data),

  getAll: () =>
    apiClient.get<CpRequestResponse[]>('/cp-requests').then((r) => r.data),

  update: (id: string, data: CpRequestUpdatePayload) =>
    apiClient.patch<CpRequestResponse>(`/cp-requests/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/cp-requests/${id}`).then((r) => r.data),
};
