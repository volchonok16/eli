import { apiRequest } from "@/api/client";
import type { SalePoint } from "@/api/types";

export function getSalePoints() {
  return apiRequest<SalePoint[]>("/sale-points");
}

export function getSalePoint(id: string) {
  return apiRequest<SalePoint>(`/sale-points/${id}`);
}

export function createSalePoint(data: {
  shortName: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  description?: string | null;
  workingHours?: Record<string, unknown> | null;
  isActive?: boolean;
}) {
  return apiRequest<SalePoint>("/sale-points", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSalePoint(
  id: string,
  data: {
    shortName: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
    phone?: string | null;
    description?: string | null;
    workingHours?: Record<string, unknown> | null;
    isActive?: boolean;
  }
) {
  return apiRequest<SalePoint>(`/sale-points/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function uploadSalePointImage(id: string, file: File) {
  const fd = new FormData();
  fd.append("image", file);
  return apiRequest<SalePoint>(`/sale-points/${id}/image`, {
    method: "POST",
    body: fd,
  });
}

export function deleteSalePointImage(id: string) {
  return apiRequest<void>(`/sale-points/${id}/image`, { method: "DELETE" });
}

export function deleteSalePoint(id: string) {
  return apiRequest<void>(`/sale-points/${id}`, { method: "DELETE" });
}
