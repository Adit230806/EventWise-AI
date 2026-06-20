import { useMutation } from "@tanstack/react-query";
import triageService from "@/services/triageService";
import type { TriageFormData } from "@/types/triage";

export function useTriage() {
  return useMutation({
    mutationFn: (form: TriageFormData) => triageService.run(form),
  });
}
