import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsCenter } from "@/pages/AnalyticsCenter";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Center — EventWise AI" },
      { name: "description", content: "Cause, zone, priority, hourly and weekly intelligence for traffic operations." },
    ],
  }),
  component: AnalyticsCenter,
});