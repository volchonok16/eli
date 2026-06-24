import { apiRequest } from "@/api/client";
import type { DeliveryZone } from "@/api/types";

export function getDeliveryZones() {
  return apiRequest<DeliveryZone[]>("/delivery-zones");
}

export function getDeliveryZone(id: string) {
  return apiRequest<DeliveryZone>(`/delivery-zones/${id}`);
}

export function createDeliveryZone(data: {
  name: string;
  basePrice: number;
  perKmPrice: number;
  polygon: [number, number][];
  isActive?: boolean;
}) {
  return apiRequest<DeliveryZone>("/delivery-zones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDeliveryZone(
  id: string,
  data: {
    name: string;
    basePrice: number;
    perKmPrice: number;
    polygon: [number, number][];
    isActive?: boolean;
  }
) {
  return apiRequest<DeliveryZone>(`/delivery-zones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDeliveryZone(id: string) {
  return apiRequest<void>(`/delivery-zones/${id}`, { method: "DELETE" });
}
