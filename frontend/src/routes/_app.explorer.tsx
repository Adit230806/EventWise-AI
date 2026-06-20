import { createFileRoute } from "@tanstack/react-router";
import { EventExplorer } from "@/pages/EventExplorer";

export const Route = createFileRoute("/_app/explorer")({
  head: () => ({
    meta: [
      { title: "Event Explorer — EventWise AI" },
      {
        name: "description",
        content: "Search, filter and inspect every traffic event across the city.",
      },
    ],
  }),
  component: EventExplorer,
});
