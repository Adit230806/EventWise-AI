import { createFileRoute } from "@tanstack/react-router";
import { CommandCenter } from "@/pages/CommandCenter";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Command Center — EventWise AI" },
      { name: "description", content: "Live traffic operations map with AI-prioritised incidents, hotspots and recommended actions." },
    ],
  }),
  component: CommandCenter,
});