import { useQuery } from "@tanstack/react-query";
import analyticsService from "@/services/analyticsService";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.get(),
  });
}
