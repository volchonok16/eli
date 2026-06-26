import { useMutation } from '@tanstack/react-query';
import { newsletterApi } from '@/api/endpoints/newsletter';

export const useNewsletterSubscribe = () =>
  useMutation({
    mutationFn: newsletterApi.subscribe,
  });
