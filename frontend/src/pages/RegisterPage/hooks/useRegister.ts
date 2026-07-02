import { useMutation } from '@tanstack/react-query';
import { authApi, type RegisterPayload } from '@/api/endpoints/auth';

export const useRegister = () =>
  useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
  });
