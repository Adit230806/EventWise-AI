/** Form state on the AI Triage page (camelCase, display labels). */
export interface TriageFormData {
  eventType: string;
  cause: string;
  zone: string;
  vehicle: string;
  lat: string;
  lng: string;
  time: string;
}

/** Payload expected by POST /api/triage (snake_case, ML feature values). */
export interface TriageApiRequest {
  event_type: string;
  event_cause: string;
  veh_type: string;
  latitude: number;
  longitude: number;
}

/** Raw response from POST /api/triage. */
export interface TriageApiResponse {
  priorityLabel: string;
  priorityConfidence: number;
  closureRequired: boolean;
  closureProbability: number;
  recommendedAction: string;
}

export interface TriageSignal {
  k: string;
  v: string;
}

/** UI-facing triage result mapped from the API response. */
export interface TriageResponse {
  priorityScore: number;
  priorityLabel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  closure: number;
  hotspot: number;
  eta: string;
  response: string;
  signals: TriageSignal[];
}
