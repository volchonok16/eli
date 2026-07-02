import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/endpoints/products';

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
