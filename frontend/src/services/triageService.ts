import type { TriageRequest, TriageResponse } from "@/types";

const triageService = {
  // TODO: POST to backend /api/triage
  run: async (_req: TriageRequest): Promise<TriageResponse | null> => {
    return null;
  },
};

export default triageService;
