import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/endpoints/orders';

export const useMyOrders = () =>
  useQuery({
    queryKey: ['orders', 'my'],
    queryFn: ordersApi.getMyOrders,
    staleTime: 30 * 1000,
  });
