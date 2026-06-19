import { useQuery } from "@tanstack/react-query";
import mapService from "@/services/mapService";

export function useMapEvents() {
  return useQuery({
    queryKey: ["map-events"],
    queryFn: () => mapService.getMapEvents(),
  });
}
