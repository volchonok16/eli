import { apiClient } from '@/api/client';

export interface FeedbackResponse {
  id: string;
  name: string;
  contact: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeedbackPayload {
  name: string;
  contact: string;
  message: string;
}

export const feedbackApi = {
  send: (data: FeedbackPayload) =>
    apiClient.post<FeedbackResponse>('/feedback', data).then((r) => r.data),

  getAll: () =>
    apiClient.get<FeedbackResponse[]>('/feedback').then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch<FeedbackResponse>(`/feedback/${id}`, { isRead: true }).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/feedback/${id}`).then((r) => r.data),
};
