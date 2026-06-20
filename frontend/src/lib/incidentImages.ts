import accidentImg from "@/assets/incidents/accident.jpg";
import breakdownImg from "@/assets/incidents/vehicle-breakdown.jpg";
import constructionImg from "@/assets/incidents/construction.jpg";
import waterLoggingImg from "@/assets/incidents/water-logging.jpg";
import treeFallImg from "@/assets/incidents/tree-fall.jpg";
import signalFailureImg from "@/assets/incidents/signal-failure.jpg";
import congestionImg from "@/assets/incidents/congestion.jpg";
import potholesImg from "@/assets/incidents/potholes.jpg";
import defaultImg from "@/assets/incidents/default.jpg";

export function getIncidentImage(cause: string): string {
  const c = cause.toLowerCase();
  if (c.includes("accident") || c.includes("crash")) return accidentImg;
  if (c.includes("breakdown") || c.includes("vehicle")) return breakdownImg;
  if (c.includes("construction") || c.includes("work")) return constructionImg;
  if (c.includes("water") || c.includes("flood")) return waterLoggingImg;
  if (c.includes("tree")) return treeFallImg;
  if (c.includes("signal") || c.includes("light")) return signalFailureImg;
  if (c.includes("congestion") || c.includes("jam")) return congestionImg;
  if (c.includes("hole")) return potholesImg;
  return defaultImg;
}
