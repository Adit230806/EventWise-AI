import { useMutation } from "@tanstack/react-query";
import triageService from "@/services/triageService";
import type { TriageRequest } from "@/types";

export function useTriage() {
  return useMutation({
    mutationFn: (req: TriageRequest) => triageService.run(req),
  });
}
