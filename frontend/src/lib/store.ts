import { create } from "zustand";
import type { TrafficEvent } from "@/types";

interface CommandState {
  selectedEventId: string | null;
  filterPriority: string | null;
  filterCause: string | null;
  showRoutes: boolean;
  showAlerts: boolean;
  showHotspots: boolean;
  setSelectedEvent: (id: string | null) => void;
  setFilterPriority: (p: string | null) => void;
  setFilterCause: (c: string | null) => void;
  toggleRoutes: () => void;
  toggleAlerts: () => void;
  toggleHotspots: () => void;
  drawerEvent: TrafficEvent | null;
  setDrawerEvent: (e: TrafficEvent | null) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  selectedEventId: null,
  filterPriority: null,
  filterCause: null,
  showRoutes: true,
  showAlerts: true,
  showHotspots: true,
  setSelectedEvent: (id) => set({ selectedEventId: id }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterCause: (c) => set({ filterCause: c }),
  toggleRoutes: () => set((s) => ({ showRoutes: !s.showRoutes })),
  toggleAlerts: () => set((s) => ({ showAlerts: !s.showAlerts })),
  toggleHotspots: () => set((s) => ({ showHotspots: !s.showHotspots })),
  drawerEvent: null,
  setDrawerEvent: (e) => set({ drawerEvent: e }),
}));

export const priorityColor = (p: string) => {
  switch (p) {
    case "critical":
      return "var(--color-neon-red)";
    case "high":
      return "var(--color-neon-orange)";
    case "medium":
      return "var(--color-neon-cyan)";
    default:
      return "var(--color-neon-lime)";
  }
};

export const priorityHex = (p: string) => {
  switch (p) {
    case "critical":
      return "#ff4d4d";
    case "high":
      return "#ff9533";
    case "medium":
      return "#22d3ee";
    default:
      return "#bef264";
  }
};
