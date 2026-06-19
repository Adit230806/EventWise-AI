import type { HotspotData, DashboardStats } from "@/types";

const hotspotService = {
  // TODO: Fetch from backend GET /api/hotspots
  getAll: async (): Promise<HotspotData[]> => {
    return [];
  },

  // TODO: Fetch from backend GET /api/stats
  getStats: async (): Promise<DashboardStats | null> => {
    return null;
  },
};

export default hotspotService;
