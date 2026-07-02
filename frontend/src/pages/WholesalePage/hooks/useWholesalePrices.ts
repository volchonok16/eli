import { useQuery } from '@tanstack/react-query';
import { wholesaleApi } from '@/api/endpoints/wholesale';

export const useWholesalePrices = () =>
  useQuery({
    queryKey: ['wholesale', 'prices', 'public'],
    queryFn: wholesaleApi.getPublicPrices,
    staleTime: 10 * 60 * 1000,
  });
