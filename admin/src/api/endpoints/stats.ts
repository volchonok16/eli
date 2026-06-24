import { apiRequest } from "@/api/client";
import type { DashboardStats } from "@/api/types";

export function getDashboard() {
  return apiRequest<DashboardStats>("/stats/dashboard");
}
