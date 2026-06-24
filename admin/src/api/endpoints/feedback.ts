import { apiRequest } from "@/api/client";
import type { Feedback } from "@/api/types";

export function getFeedback() {
  return apiRequest<Feedback[]>("/feedback");
}

export function markFeedbackRead(id: string, isRead: boolean) {
  return apiRequest<Feedback>(`/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
}

export function deleteFeedback(id: string) {
  return apiRequest<void>(`/feedback/${id}`, { method: "DELETE" });
}
