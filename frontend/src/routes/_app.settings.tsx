import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/pages/Settings";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — EventWise AI" },
      { name: "description", content: "Configure theme, notifications, and dashboard preferences." },
    ],
  }),
  component: Settings,
});
