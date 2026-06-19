import { useQuery } from "@tanstack/react-query";
import hotspotService from "@/services/hotspotService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => hotspotService.getStats(),
  });
}
