import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/endpoints/stats';

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
    staleTime: 30 * 60 * 1000,
  });
