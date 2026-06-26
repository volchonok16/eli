import { useQuery } from '@tanstack/react-query';
import { productsApi, type ProductFilters } from '@/api/endpoints/products';

export const useProducts = (filters?: ProductFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getAll({ limit: 4 }),
    staleTime: 10 * 60 * 1000,
  });
