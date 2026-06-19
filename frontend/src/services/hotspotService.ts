import api from "./api";
import { FALLBACK_HOTSPOTS } from "./fallbacks";
import type { Hotspot } from "@/types/hotspot";

const hotspotService = {
  /** GET /api/hotspots */
  getAll: async (): Promise<Hotspot[]> => {
    try {
      const { data } = await api.get<Hotspot[]>("/api/hotspots");
      return data;
    } catch {
      return FALLBACK_HOTSPOTS;
    }
  },
};

export default hotspotService;
