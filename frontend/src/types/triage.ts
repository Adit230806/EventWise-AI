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

/** Response from POST /api/triage */
export interface TriageResponse {
  priorityScore: number;
  priorityLabel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  closure: number;
  hotspot: number;
  eta: string;
  response: string;
  signals: TriageSignal[];
}
