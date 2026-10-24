import { apiClient } from './client';
import { handleApiError } from './errorHandler';

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? '');
    if (
      error.response?.status === 401 &&
      sessionStorage.getItem('token') &&
      !requestUrl.includes('/auth/login')
    ) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(handleApiError(error)));
  },
);
