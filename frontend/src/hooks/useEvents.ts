import { useQuery } from "@tanstack/react-query";
import eventsService from "@/services/eventsService";
import type { EventsFilter } from "@/types/event";

export function useEvents(filters?: EventsFilter) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsService.getAll(filters),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useLiveFeed() {
  return useQuery({
    queryKey: ["events", "live-feed"],
    queryFn: () => eventsService.getLiveFeed(),
    staleTime: 30_000,
    retry: 2,
  });
}
