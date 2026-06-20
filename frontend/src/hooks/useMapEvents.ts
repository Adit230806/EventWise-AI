import { useQuery } from "@tanstack/react-query";
import mapService from "@/services/mapService";

export function useMapEvents() {
  return useQuery({
    queryKey: ["map-events"],
    queryFn: () => mapService.getMapEvents(),
    staleTime: 30_000,
    retry: 2,
  });
}
