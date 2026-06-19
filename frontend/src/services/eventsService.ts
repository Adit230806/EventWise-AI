import type { TrafficEvent } from "@/types";

export interface EventsFilter {
  priority?: string | null;
  cause?: string | null;
  query?: string | null;
}

const eventsService = {
  // TODO: Fetch from backend GET /api/events
  getAll: async (_filters?: EventsFilter): Promise<TrafficEvent[]> => {
    return [];
  },

  // TODO: Fetch from backend GET /api/events/live-feed
  getLiveFeed: async (): Promise<TrafficEvent[]> => {
    return [];
  },

  // TODO: Fetch from backend GET /api/events/:id
  getById: async (_id: string): Promise<TrafficEvent | null> => {
    return null;
  },
};

export default eventsService;
