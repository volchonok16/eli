import { apiRequest } from "@/api/client";
import type {
  PartnerApplication,
  PartnerDocument,
  PartnerStatus,
} from "@/api/types";

export function getPartnerApplications() {
  return apiRequest<PartnerApplication[]>("/partner-applications");
}

export function getPartnerApplication(id: string) {
  return apiRequest<PartnerApplication>(`/partner-applications/${id}`);
}

export function updatePartnerStatus(
  id: string,
  status: PartnerStatus,
  statusNote?: string
) {
  return apiRequest<PartnerApplication>(
    `/partner-applications/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, statusNote }),
    }
  );
}

export function uploadPartnerDocument(
  appId: string,
  file: File,
  type: string
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  return apiRequest<PartnerDocument>(
    `/partner-applications/${appId}/documents`,
    { method: "POST", body: fd }
  );
}

export function deletePartnerDocument(appId: string, docId: string) {
  return apiRequest<void>(
    `/partner-applications/${appId}/documents/${docId}`,
    { method: "DELETE" }
  );
}

export function deletePartnerApplication(id: string) {
  return apiRequest<void>(`/partner-applications/${id}`, {
    method: "DELETE",
  });
}
