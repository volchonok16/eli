import type { AxiosError } from 'axios';

function formatBackendError(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.trim()) return raw;

  if (raw && typeof raw === 'object') {
    const flatten = raw as {
      formErrors?: string[];
      fieldErrors?: Record<string, string[] | undefined>;
    };
    const fieldMessages = Object.entries(flatten.fieldErrors ?? {}).flatMap(
      ([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`),
    );
    const messages = [...(flatten.formErrors ?? []), ...fieldMessages].filter(Boolean);
    if (messages.length) return messages.join('; ');
  }

  return null;
}

export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const axiosError = error as AxiosError<{ error?: unknown }>;
    const fromResponse = formatBackendError(axiosError.response?.data?.error);
    if (fromResponse) return fromResponse;
    if (error instanceof Error && error.message) return error.message;
  }
  return 'Произошла неизвестная ошибка';
};
