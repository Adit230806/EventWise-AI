import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000,
    retry: 2,
  });
}

/** @deprecated Use useDashboard */
export const useDashboardStats = useDashboard;
