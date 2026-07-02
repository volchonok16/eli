import { apiClient } from '@/api/client';

export interface DeliveryZoneResponse {
  id: string;
  name: string;
  basePrice: number;
  perKmPrice: number;
  polygon: [number, number][];
  isActive: boolean;
  createdAt: string;
}

export interface ZoneCheckResult {
  zoneId: string;
  zoneName: string;
  deliveryCost: number;
  isDeliverable: boolean;
}

export interface ZoneCheckResultNotFound {
  isDeliverable: false;
}

export interface DeliveryZonePayload {
  name: string;
  basePrice: number;
  perKmPrice: number;
  polygon: [number, number][];
  isActive?: boolean;
}

export const deliveryZonesApi = {
  check: (lat: number, lng: number) =>
    apiClient.get<ZoneCheckResult | ZoneCheckResultNotFound>('/delivery-zones/check', {
      params: { lat, lng },
    }).then((r) => r.data),

  getAll: () =>
    apiClient.get<DeliveryZoneResponse[]>('/delivery-zones').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<DeliveryZoneResponse>(`/delivery-zones/${id}`).then((r) => r.data),

  create: (data: DeliveryZonePayload) =>
    apiClient.post<DeliveryZoneResponse>('/delivery-zones', data).then((r) => r.data),

  update: (id: string, data: DeliveryZonePayload) =>
    apiClient.put<DeliveryZoneResponse>(`/delivery-zones/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/delivery-zones/${id}`).then((r) => r.data),
};
