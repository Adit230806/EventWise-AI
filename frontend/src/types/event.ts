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

/** Full traffic event record from GET /api/events */
export interface Event {
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
  createdAt: string;
  eta: string;
  closureRisk: number;
  hotspotRisk: number;
  affectedRadius: number;
  reportedBy: string;
  recommendedAction: string;
}

/** Map-layer event from GET /api/map-events (same shape as Event for map rendering) */
export type MapEvent = Event;

/** @deprecated Use Event — kept for existing imports */
export type TrafficEvent = Event;

export interface EventsFilter {
  priority?: string | null;
  cause?: string | null;
  query?: string | null;
}
