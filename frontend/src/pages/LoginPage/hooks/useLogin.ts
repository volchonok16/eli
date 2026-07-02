import { useMutation } from '@tanstack/react-query';
import { authApi, type LoginPayload } from '@/api/endpoints/auth';

export const useLogin = () =>
  useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
  });
