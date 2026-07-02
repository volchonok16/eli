import { useQuery } from '@tanstack/react-query';
import { salePointsApi } from '@/api/endpoints/sale-points';

export const useSalePoints = (onlyActive = true) =>
  useQuery({
    queryKey: ['sale-points', { onlyActive }],
    queryFn: () => salePointsApi.getAll(onlyActive),
    staleTime: 10 * 60 * 1000,
  });
