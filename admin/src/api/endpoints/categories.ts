import { apiRequest } from "@/api/client";
import type { Category } from "@/api/types";

export function getCategories() {
  return apiRequest<Category[]>("/categories");
}

export function getCategory(id: string) {
  return apiRequest<Category>(`/categories/${id}`);
}

export function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
}) {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    parentId?: string | null;
    sortOrder?: number;
  }
) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id: string) {
  return apiRequest<void>(`/categories/${id}`, { method: "DELETE" });
}
