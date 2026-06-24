import { apiRequest } from "@/api/client";
import type { Service } from "@/api/types";

export function getServices() {
  return apiRequest<Service[]>("/services");
}

export function getService(id: string) {
  return apiRequest<Service>(`/services/${id}`);
}

export function createService(data: {
  name: string;
  description?: string;
  price?: number | null;
  isActive: boolean;
}) {
  return apiRequest<Service>("/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateService(
  id: string,
  data: {
    name: string;
    description?: string;
    price?: number | null;
    isActive: boolean;
  }
) {
  return apiRequest<Service>(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteService(id: string) {
  return apiRequest<void>(`/services/${id}`, { method: "DELETE" });
}
