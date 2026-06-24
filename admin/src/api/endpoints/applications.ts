import { apiRequest } from "@/api/client";
import type { Application } from "@/api/types";

export function getApplications() {
  return apiRequest<Application[]>("/applications");
}

export function updateApplicationStatus(
  id: string,
  status: Application["status"]
) {
  return apiRequest<Application>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteApplication(id: string) {
  return apiRequest<void>(`/applications/${id}`, { method: "DELETE" });
}
