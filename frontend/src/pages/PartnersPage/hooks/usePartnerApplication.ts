import { useMutation } from '@tanstack/react-query';
import { partnerApplicationsApi } from '@/api/endpoints/partner-applications';

export const usePartnerApplication = () =>
  useMutation({
    mutationFn: (formData: FormData) => partnerApplicationsApi.create(formData),
  });
