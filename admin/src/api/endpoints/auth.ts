import { apiRequest } from "@/api/client";

export function login(username: string, password: string) {
  return apiRequest<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
