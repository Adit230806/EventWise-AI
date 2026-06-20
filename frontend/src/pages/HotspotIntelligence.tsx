import { TrafficMap } from "@/components/TrafficMap";
import { useHotspots } from "@/hooks/useHotspots";
import { useMapEvents } from "@/hooks/useMapEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Flame, GitBranch, Radar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function HotspotIntelligence() {
  const { data: hotspotsData, isLoading: hotspotsLoading, error: hotspotsError, refetch: hotspotsRefetch } = useHotspots();
  const { data: eventsData } = useMapEvents();
  const hotspotRows = Array.isArray(hotspotsData) ? hotspotsData : [];
  const mapEventRows = Array.isArray(eventsData) ? eventsData : [];

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
      <div className="relative">
        <TrafficMap events={mapEventRows} showHotspots showRoutes={false} />
        <div className="pointer-events-none absolute left-4 top-4 z-[400]">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto rounded-2xl glass-panel px-4 py-3"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Radar className="h-3 w-3 text-primary" /> Heatmap layer · cluster detection
            </div>
            <div className="mt-1 text-lg font-semibold">Hotspot Intelligence</div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex gap-2">
          <Legend color="#ff4d4d" label="Critical cluster" />
          <Legend color="#ff9533" label="High risk" />
          <Legend color="#22d3ee" label="Watch" />
        </div>
      </div>

      <div className="overflow-y-auto border-l border-border bg-surface/40 p-5 backdrop-blur-xl">
        <Section icon={Flame} title="Top Risk Zones" sub="ranked by composite score">
          <div className="space-y-2">
            {hotspotsLoading ? (
              <>
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </>
            ) : hotspotsError ? (
              <div className="rounded-xl border border-border p-4 text-center text-xs text-muted-foreground">
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive mb-2" />
                <p className="font-semibold text-foreground">Failed to load hotspot data</p>
                <button onClick={() => hotspotsRefetch()} className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated">Retry</button>
              </div>
            ) : hotspotRows.length === 0 && !hotspotsLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No hotspot data available</div>
            ) : (
              hotspotRows.map((h) => (
                <div key={h.id} className="rounded-xl border border-border bg-surface/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">#{h.rank}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: h.risk > 80 ? "#ff4d4d" : h.risk > 60 ? "#ff9533" : "#22d3ee" }}>
                      {h.risk}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-foreground">{h.zone}</div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${h.risk}%`, background: h.risk > 80 ? "#ff4d4d" : h.risk > 60 ? "#ff9533" : "#22d3ee" }} />
                  </div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground">{h.cluster} active events in cluster</div>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* TODO: wire to API */}
        <Section icon={GitBranch} title="Corridor Analysis" sub="continuous risk segments">
          <div className="space-y-2">
            <Corridor name="ORR North → Hebbal" risk={92} dist="14.2 km" />
            <Corridor name="MG Road → Silk Board" risk={78} dist="18.6 km" />
            <Corridor name="Whitefield → KR Puram" risk={65} dist="9.4 km" />
          </div>
        </Section>

        {/* TODO: wire to API */}
        <Section icon={TrendingUp} title="Junction Pressure" sub="signal cycle utilisation">
          <div className="space-y-2">
            <Junction name="Silk Board" load={94} />
            <Junction name="Hebbal Flyover" load={88} />
            <Junction name="KR Puram" load={71} />
            <Junction name="Tin Factory" load={64} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, sub, children }: any) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function Corridor({ name, risk, dist }: { name: string; risk: number; dist: string }) {
  const color = risk > 80 ? "#ff4d4d" : risk > 60 ? "#ff9533" : "#22d3ee";
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <span className="font-mono text-xs font-semibold" style={{ color }}>{risk}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{dist}</span>·<span>5 incidents</span>
      </div>
    </div>
  );
}

function Junction({ name, load }: { name: string; load: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">{load}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${load}%`, background: load > 85 ? "#ff4d4d" : load > 70 ? "#ff9533" : "#bef264" }} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full glass-pill px-3 py-1.5 text-[11px]">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
