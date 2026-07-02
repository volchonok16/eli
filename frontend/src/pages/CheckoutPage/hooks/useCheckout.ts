import { useMutation } from '@tanstack/react-query';
import { ordersApi, type CreateOrderPayload } from '@/api/endpoints/orders';

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
  });
