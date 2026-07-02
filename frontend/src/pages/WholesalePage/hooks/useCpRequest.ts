import { useMutation } from '@tanstack/react-query';
import { cpRequestsApi, type CpRequestPayload } from '@/api/endpoints/cp-requests';

export const useCpRequest = () =>
  useMutation({
    mutationFn: (data: CpRequestPayload) => cpRequestsApi.create(data),
  });
