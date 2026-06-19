// Re-export all domain types from one place

export type EventStatus = "active" | "monitoring" | "resolved";
export type EventPriority = "critical" | "high" | "medium" | "low";
export type EventCause =
  | "Vehicle Breakdown"
  | "Accident"
  | "Construction"
  | "Water Logging"
  | "Tree Fall"
  | "Signal Failure"
  | "Protest"
  | "VIP Movement";
export type VehicleType = "Truck" | "Car" | "Bus" | "Two-Wheeler" | "Auto" | "None";

export interface TrafficEvent {
  id: string;
  code: string;
  cause: EventCause;
  status: EventStatus;
  priority: EventPriority;
  zone: string;
  lat: number;
  lng: number;
  description: string;
  vehicleType: VehicleType;
  createdAt: string; // ISO 8601
  eta: string; // human-readable
  closureRisk: number; // 0–1
  hotspotRisk: number; // 0–1
  affectedRadius: number; // metres
  reportedBy: string;
  recommendedAction: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  highPriority: number;
  roadClosures: number;
  hotspotAlerts: number;
}

export interface CauseBreakdownItem {
  cause: EventCause;
  count: number;
}

export interface PriorityBreakdownItem {
  priority: EventPriority;
  count: number;
}

export interface HourlyTrendItem {
  hour: string; // "HH:00"
  events: number;
  critical: number;
}

export interface WeeklyTrendItem {
  day: string; // "Mon" … "Sun"
  resolved: number;
  active: number;
}

export interface ZoneIntelligenceItem {
  zone: string;
  events: number;
  risk: number; // 0–100
}

export interface EventAnalyticsData {
  causeBreakdown: CauseBreakdownItem[];
  priorityBreakdown: PriorityBreakdownItem[];
  hourlyTrend: HourlyTrendItem[];
  weeklyTrend: WeeklyTrendItem[];
  zoneIntelligence: ZoneIntelligenceItem[];
}

export interface HotspotData {
  id: string;
  zone: string;
  rank: number;
  risk: number; // 0–100
  cluster: number;
  trend: "up" | "down";
  change: number; // percentage delta
}

export interface TriageRequest {
  eventType: string;
  cause: string;
  zone: string;
  vehicle: string;
  lat: string;
  lng: string;
  time: string;
}

export interface TriageSignal {
  k: string;
  v: string;
}

export interface TriageResponse {
  priorityScore: number;
  priorityLabel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  closure: number; // 0–100
  hotspot: number; // 0–100
  eta: string;
  response: string;
  signals: TriageSignal[];
}
