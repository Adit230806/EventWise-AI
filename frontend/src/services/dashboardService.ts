import api from "./api";
import { FALLBACK_STATS } from "./fallbacks";
import type { DashboardStats } from "@/types/dashboard";

const dashboardService = {
  /** GET /api/stats */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const { data } = await api.get<DashboardStats>("/api/stats");
      return data;
    } catch {
      return FALLBACK_STATS;
    }
  },
};

export default dashboardService;
