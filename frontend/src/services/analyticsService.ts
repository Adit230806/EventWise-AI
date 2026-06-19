import type { EventAnalyticsData } from "@/types";

const emptyAnalytics: EventAnalyticsData = {
  causeBreakdown: [],
  priorityBreakdown: [],
  hourlyTrend: [],
  weeklyTrend: [],
  zoneIntelligence: [],
};

const analyticsService = {
  // TODO: Fetch from backend GET /api/analytics
  get: async (): Promise<EventAnalyticsData | null> => {
    return emptyAnalytics;
  },
};

export default analyticsService;
