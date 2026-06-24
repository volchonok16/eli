import type { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return axiosError.message;
  }
  return 'Произошла неизвестная ошибка';
};
