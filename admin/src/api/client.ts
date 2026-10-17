const TOKEN_KEY = "eli_admin_token";
export const SESSION_MESSAGE_KEY = "eli_admin_session_message";
export const UNAUTHORIZED_EVENT = "eli-admin-unauthorized";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function expireSession() {
  if (!getToken()) return;
  clearToken();
  sessionStorage.setItem(SESSION_MESSAGE_KEY, "Сессия истекла. Войдите снова.");
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api${path}`, { ...options, headers });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (response.status === 401 && path !== "/auth/login") {
      expireSession();
    }
    throw new Error(data.error ?? `Ошибка ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
