import api from "./api";
import type { TriageRequest, TriageResponse } from "@/types/triage";

const triageService = {
  /** POST /api/triage */
  run: async (req: TriageRequest): Promise<TriageResponse | null> => {
    try {
      const { data } = await api.post<TriageResponse>("/api/triage", req);
      return data;
    } catch {
      return null;
    }
  },
};

export default triageService;
