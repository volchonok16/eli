import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/api/endpoints/categories';

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getTree(),
    staleTime: 10 * 60 * 1000,
  });
