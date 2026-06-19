/**
 * Service-layer fallbacks used when the backend is unreachable.
 * Not imported by pages or components.
 */
import type { AnalyticsResponse } from "@/types/analytics";
import type { DashboardStats } from "@/types/dashboard";
import type { Event } from "@/types/event";
import type { Hotspot } from "@/types/hotspot";

export const FALLBACK_STATS: DashboardStats = {
  totalEvents: 0,
  activeEvents: 0,
  highPriority: 0,
  roadClosures: 0,
  hotspotAlerts: 0,
};

export const FALLBACK_EVENTS: Event[] = [];
export const FALLBACK_MAP_EVENTS: Event[] = [];
export const FALLBACK_HOTSPOTS: Hotspot[] = [];

export const FALLBACK_ANALYTICS: AnalyticsResponse = {
  causeBreakdown: [],
  priorityBreakdown: [],
  hourlyTrend: [],
  weeklyTrend: [],
  zoneIntelligence: [],
};
