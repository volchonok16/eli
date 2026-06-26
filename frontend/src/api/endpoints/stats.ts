import { apiClient } from '@/api/client';

interface StatsResponse {
  survivalRate: number;
  yearsExperience: number;
  treesPlanted: number;
  happyCustomers: number;
}

export const statsApi = {
  get: () =>
    apiClient.get<StatsResponse>('/stats').then((r) => r.data),
};
