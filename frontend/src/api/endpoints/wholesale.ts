import { apiClient } from '@/api/client';

export interface WholesalePriceResponse {
  id: string;
  productId: string;
  productName: string;
  minQuantity: number;
  price: number;
}

export interface WholesalePricePayload {
  productId: string;
  minQuantity: number;
  price: number;
}

export interface WholesalePriceUpdatePayload {
  minQuantity: number;
  price: number;
}

export const wholesaleApi = {
  getPublicPrices: () =>
    apiClient.get<WholesalePriceResponse[]>('/wholesale/prices/public').then((r) => r.data),

  getAllPrices: () =>
    apiClient.get<WholesalePriceResponse[]>('/wholesale/prices').then((r) => r.data),

  getMyPrices: () =>
    apiClient.get<WholesalePriceResponse[]>('/wholesale/prices/my').then((r) => r.data),

  createPrice: (data: WholesalePricePayload) =>
    apiClient.post<WholesalePriceResponse>('/wholesale/prices', data).then((r) => r.data),

  updatePrice: (id: string, data: WholesalePriceUpdatePayload) =>
    apiClient.put<WholesalePriceResponse>(`/wholesale/prices/${id}`, data).then((r) => r.data),

  deletePrice: (id: string) =>
    apiClient.delete(`/wholesale/prices/${id}`).then((r) => r.data),
};
