import { lazy, Suspense, useEffect, useState } from "react";
import type { TrafficEvent } from "@/types";

const MapInner = lazy(() => import("./TrafficMapInner"));

interface Props {
  events: TrafficEvent[];
  onSelect?: (e: TrafficEvent) => void;
  showHotspots?: boolean;
  showRoutes?: boolean;
  center?: [number, number];
  zoom?: number;
  heatmapMode?: boolean;
}

export function TrafficMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#050505]">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Initialising tactical map…
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="h-full w-full bg-[#050505]" />}>
      <MapInner {...props} />
    </Suspense>
  );
}
