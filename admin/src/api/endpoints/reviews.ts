import { apiRequest } from "@/api/client";
import type { Review } from "@/api/types";

export function getReviews() {
  return apiRequest<Review[]>("/reviews");
}

export function getReview(id: string) {
  return apiRequest<Review>(`/reviews/${id}`);
}

export function createReview(data: {
  authorName: string;
  text: string;
  rating: number;
  isPublished: boolean;
  productId?: string | null;
}) {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReview(
  id: string,
  data: {
    authorName: string;
    text: string;
    rating: number;
    isPublished: boolean;
    productId?: string | null;
  }
) {
  return apiRequest<Review>(`/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function toggleReviewPublish(id: string) {
  return apiRequest<Review>(`/reviews/${id}/publish`, { method: "PATCH" });
}

export function deleteReview(id: string) {
  return apiRequest<void>(`/reviews/${id}`, { method: "DELETE" });
}
