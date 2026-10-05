import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type CategoryResponse } from '@/api/endpoints/categories';

export function flattenCategories(categories: CategoryResponse[]): CategoryResponse[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getTree(),
    staleTime: 10 * 60 * 1000,
  });
