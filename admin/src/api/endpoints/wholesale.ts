import { apiRequest } from "@/api/client";
import type { WholesalePrice } from "@/api/types";

export function getWholesalePrices() {
  return apiRequest<WholesalePrice[]>("/wholesale/prices");
}

export function createWholesalePrice(data: {
  productId: string;
  minQuantity: number;
  price: number;
}) {
  return apiRequest<WholesalePrice>("/wholesale/prices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWholesalePrice(
  id: string,
  data: { minQuantity: number; price: number }
) {
  return apiRequest<WholesalePrice>(`/wholesale/prices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteWholesalePrice(id: string) {
  return apiRequest<void>(`/wholesale/prices/${id}`, { method: "DELETE" });
}
