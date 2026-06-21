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

/** Gemini-generated operational insights from the backend. */
export interface AiInsights {
  incident_summary: string;
  traffic_impact: string;
  recommended_action: string;
}

/** Raw response from POST /api/triage (includes optional Gemini insights). */
export interface TriageApiResponse {
  priorityLabel: string;
  priorityConfidence: number;
  closureRequired: boolean;
  closureProbability: number;
  recommendedAction: string;
  /** Present when Gemini is reachable; null/undefined otherwise. */
  ai_insights?: AiInsights | null;
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
  /** Gemini AI insights — present when Gemini is available. */
  aiInsights?: AiInsights | null;
}
