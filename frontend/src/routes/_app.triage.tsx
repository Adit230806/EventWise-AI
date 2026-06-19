import { createFileRoute } from "@tanstack/react-router";
import { AITriage } from "@/pages/AITriage";

export const Route = createFileRoute("/_app/triage")({
  head: () => ({
    meta: [
      { title: "AI Triage — EventWise AI" },
      { name: "description", content: "AI copilot that scores priority, closure probability and recommended response." },
    ],
  }),
  component: AITriage,
});