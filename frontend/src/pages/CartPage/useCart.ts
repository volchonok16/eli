import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/endpoints/cart';

export const useCart = () =>
  useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    staleTime: 30 * 1000,
    retry: false,
  });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { productId: string; quantity?: number }) =>
      cartApi.addItem(params.productId, params.quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useUpdateCartQuantity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { productId: string; quantity: number }) =>
      cartApi.updateQuantity(params.productId, params.quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};
