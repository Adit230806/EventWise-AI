import { createFileRoute } from "@tanstack/react-router";
import { HotspotIntelligence } from "@/pages/HotspotIntelligence";

export const Route = createFileRoute("/_app/hotspots")({
  head: () => ({
    meta: [
      { title: "Hotspot Intelligence — EventWise AI" },
      { name: "description", content: "Heatmaps, corridor and junction analysis for risk-prone zones." },
    ],
  }),
  component: HotspotIntelligence,
});