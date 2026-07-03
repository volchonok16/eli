import { apiClient } from '@/api/client';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'WHOLESALE' | 'PARTNER' | 'MANAGER' | 'ADMIN';
  wholesaleApproved: boolean;
  companyName: string | null;
  inn: string | null;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: UserResponse;
}

export interface AdminLoginResult {
  token: string;
  role: 'ADMIN';
}

export interface MeResult {
  role: string;
  user?: UserResponse;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  password?: string;
  companyName?: string;
  inn?: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<AuthResult>('/auth/register', data).then((r) => r.data),

  registerWithAvatar: (formData: FormData) =>
    apiClient.post<AuthResult>('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResult | AdminLoginResult>('/auth/login', data).then((r) => r.data),

  getMe: () =>
    apiClient.get<MeResult>('/auth/me').then((r) => r.data),

  updateProfile: (data: ProfileUpdatePayload) =>
    apiClient.put<{ user: UserResponse }>('/auth/me', data).then((r) => r.data.user),

  updateProfileWithAvatar: (formData: FormData) =>
    apiClient.put<{ user: UserResponse }>('/auth/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.user),
};
