import api from "./api";
import type {
  TriageApiRequest,
  TriageApiResponse,
  TriageFormData,
  TriageResponse,
} from "@/types/triage";

const EVENT_TYPE_TO_API: Record<string, string> = {
  Incident: "unplanned",
  "Planned Event": "planned",
  "Weather Event": "unplanned",
  Infrastructure: "planned",
};

const CAUSE_TO_API: Record<string, string> = {
  "Vehicle Breakdown": "vehicle_breakdown",
  Accident: "accident",
  Construction: "construction",
  "Water Logging": "water_logging",
  "Tree Fall": "tree_fall",
  "Signal Failure": "signal_failure",
  Protest: "procession",
  "VIP Movement": "vip_movement",
};

const VEHICLE_TO_API: Record<string, string> = {
  Truck: "truck",
  Car: "private_car",
  Bus: "bmtc_bus",
  "Two-Wheeler": "two_wheeler",
  Auto: "auto",
  None: "others",
};

function toSnakeCase(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function mapTriageFormToApiRequest(form: TriageFormData): TriageApiRequest {
  return {
    event_type: EVENT_TYPE_TO_API[form.eventType] ?? toSnakeCase(form.eventType),
    event_cause: CAUSE_TO_API[form.cause] ?? toSnakeCase(form.cause),
    veh_type: VEHICLE_TO_API[form.vehicle] ?? toSnakeCase(form.vehicle),
    latitude: Number(form.lat),
    longitude: Number(form.lng),
  };
}

function mapPriorityLabel(label: string): TriageResponse["priorityLabel"] {
  const normalized = label.toUpperCase();
  if (
    normalized === "CRITICAL" ||
    normalized === "HIGH" ||
    normalized === "MEDIUM" ||
    normalized === "LOW"
  ) {
    return normalized;
  }
  return "LOW";
}

export function mapTriageApiToUiResponse(
  api: TriageApiResponse,
  form: TriageFormData,
): TriageResponse {
  return {
    priorityScore: Math.round(api.priorityConfidence),
    priorityLabel: mapPriorityLabel(api.priorityLabel),
    closure: Math.round(api.closureProbability),
    hotspot: api.closureRequired ? Math.min(99, Math.round(api.closureProbability + 15)) : 25,
    eta: api.closureRequired ? "45 min" : "1h 20m",
    response: api.recommendedAction,
    signals: [
      { k: "Event type", v: form.eventType },
      { k: "Cause", v: form.cause },
      { k: "Zone", v: form.zone },
      { k: "Vehicle", v: form.vehicle },
      { k: "Priority confidence", v: `${api.priorityConfidence}%` },
      { k: "Closure required", v: api.closureRequired ? "Yes" : "No" },
    ],
  };
}

const triageService = {
  /** POST /api/triage */
  run: async (form: TriageFormData): Promise<TriageResponse> => {
    const payload = mapTriageFormToApiRequest(form);
    const { data } = await api.post<TriageApiResponse>("/api/triage", payload);
    return mapTriageApiToUiResponse(data, form);
  },
};

export default triageService;
