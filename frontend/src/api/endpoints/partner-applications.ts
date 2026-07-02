import { apiClient } from '@/api/client';

export type PartnerStatus = 'NEW' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

export type PartnerDocumentType = 'PHOTO' | 'CONTRACT' | 'LEGAL_DOCS';

export interface PartnerDocumentResponse {
  id: string;
  key: string;
  type: PartnerDocumentType;
  originalName: string | null;
  url: string;
  createdAt: string;
}

export interface PartnerApplicationResponse {
  id: string;
  organizationName: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  landAddress: string;
  landArea: number | null;
  description: string | null;
  status: PartnerStatus;
  statusLabel: string;
  statusNote: string | null;
  documents: PartnerDocumentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerApplicationPayload {
  organizationName?: string;
  contactName: string;
  phone: string;
  email?: string;
  landAddress: string;
  landArea?: number;
  description?: string;
}

export interface PartnerStatusPayload {
  status: PartnerStatus;
  statusNote?: string;
}

export const partnerApplicationsApi = {
  create: (formData: FormData) =>
    apiClient.post<PartnerApplicationResponse>('/partner-applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getMy: () =>
    apiClient.get<PartnerApplicationResponse[]>('/partner-applications/my').then((r) => r.data),

  getAll: () =>
    apiClient.get<PartnerApplicationResponse[]>('/partner-applications').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<PartnerApplicationResponse>(`/partner-applications/${id}`).then((r) => r.data),

  updateStatus: (id: string, data: PartnerStatusPayload) =>
    apiClient.patch<PartnerApplicationResponse>(`/partner-applications/${id}/status`, data).then((r) => r.data),

  uploadDocument: (id: string, formData: FormData) =>
    apiClient.post<PartnerDocumentResponse>(`/partner-applications/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getDocumentDownloadUrl: (applicationId: string, documentId: string) =>
    `/api/partner-applications/${applicationId}/documents/${documentId}/download`,

  deleteDocument: (applicationId: string, documentId: string) =>
    apiClient.delete(`/partner-applications/${applicationId}/documents/${documentId}`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/partner-applications/${id}`).then((r) => r.data),
};
