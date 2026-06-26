import { apiClient } from '@/api/client';

export const newsletterApi = {
  subscribe: (email: string) =>
    apiClient.post('/newsletter/subscribe', { email }).then((r) => r.data),
};
