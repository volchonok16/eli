import { apiRequest } from "@/api/client";
import type { Product, ProductImage } from "@/api/types";

export function getProducts() {
  return apiRequest<Product[]>("/products");
}

export function getProduct(id: string) {
  return apiRequest<Product>(`/products/${id}`);
}

export function createProduct(data: {
  sku?: string | null;
  name: string;
  description?: string;
  careGuide?: string;
  height?: number | null;
  heightLabel?: string | null;
  sort?: string | null;
  price: number;
  costPrice?: number | null;
  quantity: number;
  inStock: boolean;
  isHit: boolean;
  isNew: boolean;
  categoryId?: string | null;
  salePointId?: string | null;
}) {
  return apiRequest<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  id: string,
  data: {
    sku?: string | null;
    name: string;
    description?: string;
    careGuide?: string;
    height?: number | null;
    heightLabel?: string | null;
    sort?: string | null;
    price: number;
    costPrice?: number | null;
    quantity: number;
    inStock: boolean;
    isHit: boolean;
    isNew: boolean;
    categoryId?: string | null;
    salePointId?: string | null;
  }
) {
  return apiRequest<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string) {
  return apiRequest<void>(`/products/${id}`, { method: "DELETE" });
}

export function importProducts(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiRequest<{ imported: number; errors: string[] }>(
    "/products/import",
    { method: "POST", body: fd }
  );
}

export function uploadImages(productId: string, files: FileList) {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("images", f));
  return apiRequest<ProductImage[]>(`/products/${productId}/images`, {
    method: "POST",
    body: fd,
  });
}

export function deleteImage(productId: string, imageId: string) {
  return apiRequest<void>(`/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
}

export function reorderImages(productId: string, imageIds: string[]) {
  return apiRequest<ProductImage[]>(
    `/products/${productId}/images/order`,
    {
      method: "PUT",
      body: JSON.stringify({ imageIds }),
    }
  );
}
