import { apiRequest } from "@/api/client";
import type { PromoBanner } from "@/api/types";

export function getBanners() {
  return apiRequest<PromoBanner[]>("/banners");
}

export function getBanner(id: string) {
  return apiRequest<PromoBanner>(`/banners/${id}`);
}

export function createBanner(data: {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}) {
  return apiRequest<PromoBanner>("/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBanner(
  id: string,
  data: {
    title: string;
    subtitle?: string | null;
    linkUrl?: string | null;
    isActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
  }
) {
  return apiRequest<PromoBanner>(`/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function uploadBannerImage(id: string, file: File) {
  const fd = new FormData();
  fd.append("image", file);
  return apiRequest<PromoBanner>(`/banners/${id}/image`, {
    method: "POST",
    body: fd,
  });
}

export function deleteBannerImage(id: string) {
  return apiRequest<void>(`/banners/${id}/image`, { method: "DELETE" });
}

export function deleteBanner(id: string) {
  return apiRequest<void>(`/banners/${id}`, { method: "DELETE" });
}
