import type { EventCause, EventPriority } from "./event";

export interface CauseBreakdownItem {
  cause: EventCause;
  count: number;
}

export interface PriorityBreakdownItem {
  priority: EventPriority;
  count: number;
}

export interface HourlyTrendItem {
  hour: string;
  events: number;
  critical: number;
}

export interface WeeklyTrendItem {
  day: string;
  resolved: number;
  active: number;
}

export interface ZoneIntelligenceItem {
  zone: string;
  events: number;
  risk: number;
}

/** Response from GET /api/analytics */
export interface AnalyticsResponse {
  causeBreakdown: CauseBreakdownItem[];
  priorityBreakdown: PriorityBreakdownItem[];
  hourlyTrend: HourlyTrendItem[];
  weeklyTrend: WeeklyTrendItem[];
  zoneIntelligence: ZoneIntelligenceItem[];
}

/** @deprecated Use AnalyticsResponse */
export type EventAnalyticsData = AnalyticsResponse;
