import api from "./api";
import { FALLBACK_ANALYTICS } from "./fallbacks";
import type { AnalyticsResponse } from "@/types/analytics";

const analyticsService = {
  /** GET /api/analytics */
  get: async (): Promise<AnalyticsResponse> => {
    try {
      const { data } = await api.get<AnalyticsResponse>("/api/analytics");
      return data;
    } catch {
      return FALLBACK_ANALYTICS;
    }
  },
};

export default analyticsService;
