import api from "./api";
import { FALLBACK_MAP_EVENTS } from "./fallbacks";
import type { MapEvent } from "@/types/event";

const mapService = {
  /** GET /api/map-events */
  getMapEvents: async (): Promise<MapEvent[]> => {
    try {
      const { data } = await api.get<MapEvent[]>("/api/map-events");
      return data;
    } catch {
      return FALLBACK_MAP_EVENTS;
    }
  },
};

export default mapService;
