/** Hotspot cluster from GET /api/hotspots */
export interface Hotspot {
  id: string;
  zone: string;
  rank: number;
  risk: number;
  cluster: number;
  trend: "up" | "down";
  change: number;
}

/** @deprecated Use Hotspot */
export type HotspotData = Hotspot;
