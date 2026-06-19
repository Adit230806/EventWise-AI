import { useQuery } from "@tanstack/react-query";
import eventsService, { type EventsFilter } from "@/services/eventsService";

export function useEvents(filters?: EventsFilter) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsService.getAll(filters),
  });
}

export function useLiveFeed() {
  return useQuery({
    queryKey: ["events", "live-feed"],
    queryFn: () => eventsService.getLiveFeed(),
  });
}
