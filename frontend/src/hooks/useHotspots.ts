import { useQuery } from "@tanstack/react-query";
import hotspotService from "@/services/hotspotService";

export function useHotspots() {
  return useQuery({
    queryKey: ["hotspots"],
    queryFn: () => hotspotService.getAll(),
    staleTime: 30_000,
    retry: 2,
  });
}
