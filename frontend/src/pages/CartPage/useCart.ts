import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/endpoints/cart';

export const useCart = () =>
  useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    staleTime: 30 * 1000,
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
    mutationFn: (params: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(params.itemId, params.quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cartApi.checkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};
