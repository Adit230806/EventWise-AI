import api from "./api";
import { FALLBACK_EVENTS } from "./fallbacks";
import type { Event, EventsFilter } from "@/types/event";

const eventsService = {
  /** GET /api/events */
  getAll: async (filters?: EventsFilter): Promise<Event[]> => {
    try {
      const { data } = await api.get<Event[]>("/api/events", {
        params: {
          priority: filters?.priority ?? undefined,
          cause: filters?.cause ?? undefined,
          q: filters?.query ?? undefined,
        },
      });
      return data;
    } catch {
      return FALLBACK_EVENTS;
    }
  },

  /** GET /api/events?feed=live */
  getLiveFeed: async (): Promise<Event[]> => {
    try {
      const { data } = await api.get<Event[]>("/api/events", { params: { feed: "live" } });
      return data;
    } catch {
      return FALLBACK_EVENTS;
    }
  },

  /** GET /api/events/:id */
  getById: async (id: string): Promise<Event | null> => {
    try {
      const { data } = await api.get<Event>(`/api/events/${id}`);
      return data;
    } catch {
      return null;
    }
  },
};

export default eventsService;
export type { EventsFilter };
