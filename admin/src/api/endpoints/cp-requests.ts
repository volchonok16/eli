import { apiRequest } from "@/api/client";
import type { CpRequest } from "@/api/types";

export function getCpRequests() {
  return apiRequest<CpRequest[]>("/cp-requests");
}

export function updateCpRequest(
  id: string,
  data: { isProcessed?: boolean; managerNote?: string }
) {
  return apiRequest<CpRequest>(`/cp-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCpRequest(id: string) {
  return apiRequest<void>(`/cp-requests/${id}`, { method: "DELETE" });
}
