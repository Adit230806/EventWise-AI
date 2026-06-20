import { TrafficMap } from "@/components/TrafficMap";
import { useDashboard } from "@/hooks/useDashboard";
import { useLiveFeed } from "@/hooks/useEvents";
import { useHotspots } from "@/hooks/useHotspots";
import { useMapEvents } from "@/hooks/useMapEvents";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommandStore, priorityHex } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Car,
  Construction,
  Droplets,
  TreeDeciduous,
  Activity,
  Brain,
  Target,
  Sparkles,
  Flame,
  ChevronRight,
  Radio,
  Zap,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

const causeIcon: Record<string, LucideIcon> = {
  "Vehicle Breakdown": Car,
  Accident: AlertTriangle,
  Construction: Construction,
  "Water Logging": Droplets,
  "Tree Fall": TreeDeciduous,
  "Signal Failure": Zap,
  Protest: Radio,
  "VIP Movement": Sparkles,
};

export function CommandCenter() {
  const { showRoutes, showAlerts, showHotspots, toggleRoutes, toggleAlerts, toggleHotspots, setDrawerEvent } =
    useCommandStore();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: statsRefetch } = useDashboard();
  const { data: liveFeedData, isLoading: feedLoading, error: feedError, refetch: feedRefetch } = useLiveFeed();
  const { data: mapEvents } = useMapEvents();
  const { data: hotspotsData, isLoading: hotspotsLoading, error: hotspotsError, refetch: hotspotsRefetch } = useHotspots();

  const liveFeed = Array.isArray(liveFeedData) ? liveFeedData : [];
  const hotspotRows = Array.isArray(hotspotsData) ? hotspotsData : [];
  const mapEventRows = Array.isArray(mapEvents) ? mapEvents : liveFeed;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* MAP */}
      <div className="absolute inset-0">
        <TrafficMap
          events={mapEventRows}
          onSelect={setDrawerEvent}
          showHotspots={showHotspots}
          showRoutes={showRoutes}
        />
      </div>

      {/* TOP KPI BAR */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] flex flex-col gap-3 p-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {statsLoading ? (
            <>
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </>
          ) : statsError ? (
            <div className="flex items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Failed to load stats</span>
              <button
                onClick={() => statsRefetch()}
                aria-label="Retry loading stats"
                className="ml-1 underline underline-offset-2 hover:text-foreground"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <KpiPill label="Total" value={stats?.totalEvents ?? 0} tone="muted" />
              <KpiPill label="Active" value={stats?.activeEvents ?? 0} tone="lime" dot />
              <KpiPill label="High Priority" value={stats?.highPriority ?? 0} tone="orange" />
              <KpiPill label="Closures" value={stats?.roadClosures ?? 0} tone="red" />
              <KpiPill label="Hotspots" value={stats?.hotspotAlerts ?? 0} tone="cyan" />
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ToggleSwitch label="Routes" on={showRoutes} onClick={toggleRoutes} />
            <ToggleSwitch label="Alerts" on={showAlerts} onClick={toggleAlerts} />
            <ToggleSwitch label="Hotspots" on={showHotspots} onClick={toggleHotspots} />
          </div>
        </div>
      </div>

      {/* LEFT — Live Incident Feed */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-auto absolute left-4 top-20 z-[400] flex w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-2xl glass-panel"
        style={{ maxHeight: "calc(100% - 280px)" }}
      >
        <PanelHeader
          icon={Radio}
          title="Live Incident Feed"
          sub={`${liveFeed.length} active · streaming`}
          pulse
        />
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {feedLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-xl mt-1.5" />
              <Skeleton className="h-16 w-full rounded-xl mt-1.5" />
              <Skeleton className="h-16 w-full rounded-xl mt-1.5" />
              <Skeleton className="h-16 w-full rounded-xl mt-1.5" />
            </>
          ) : feedError ? (
            <div className="grid place-items-center p-4 text-center text-sm text-muted-foreground">
              <div>
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
                <p className="mt-2 text-xs font-semibold text-foreground">Failed to load feed</p>
                <button
                  onClick={() => feedRefetch()}
                  aria-label="Retry loading feed"
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : liveFeed.length === 0 && !feedLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No active incidents</div>
          ) : (
            liveFeed.map((e, i) => {
              const Icon = causeIcon[e.cause] ?? AlertTriangle;
              return (
                <motion.button
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setDrawerEvent(e)}
                  className="group mt-1.5 flex w-full items-start gap-3 rounded-xl border border-transparent bg-transparent p-2.5 text-left transition-all hover:border-border hover:bg-surface-elevated/70"
                >
                  <div
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                    style={{
                      borderColor: priorityHex(e.priority) + "40",
                      background: priorityHex(e.priority) + "1a",
                      color: priorityHex(e.priority),
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{e.cause}</span>
                      <PriorityChip p={e.priority} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{e.zone}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <TimeAgo iso={e.createdAt} />
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Dispatch <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.aside>

      {/* RIGHT — AI Intelligence */}
      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-auto absolute right-4 top-20 z-[400] flex w-[320px] max-w-[90vw] flex-col gap-3"
      >
        <div className="rounded-2xl glass-panel">
          <PanelHeader icon={Brain} title="AI Intelligence" sub="EventWise v2.4 · 12ms" />
          <div className="space-y-2 p-3">
            <AIMetric
              icon={Target}
              label="Priority Prediction"
              value="HIGH"
              detail="Critical risk surge in next 18 min"
              tone="orange"
              confidence={0.87}
            />
            <AIMetric
              icon={AlertTriangle}
              label="Closure Risk"
              value="62%"
              detail="Silk Board corridor — preempt"
              tone="red"
              confidence={0.74}
            />
            <AIMetric
              icon={Flame}
              label="Hotspot Risk"
              value="ELEVATED"
              detail="3 clusters trending upward"
              tone="cyan"
              confidence={0.91}
            />
          </div>
        </div>
        <div className="rounded-2xl glass-panel p-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="uppercase tracking-[0.18em]">Recommended Action</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-primary">Pre-empt signal cycle</span> at Hebbal Junction and divert
            northbound freight via <span className="font-mono text-xs">ORR-N → NH-44</span>. Expected congestion drop
            <span className="font-semibold text-foreground"> 34%</span> within 25 min.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Execute Plan
            </button>
            <button className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              Simulate
            </button>
          </div>
        </div>
      </motion.aside>

      {/* BOTTOM — Hotspot Panel */}
      <motion.aside
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="pointer-events-auto absolute inset-x-4 bottom-4 z-[400] rounded-2xl glass-panel md:left-[372px] md:right-[352px]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-[var(--color-neon-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Hotspot Intelligence
            </span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              top 6 of {stats?.hotspotAlerts ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3 w-3 text-primary" /> updated 12s ago
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3 lg:grid-cols-6">
          {hotspotsLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : hotspotsError ? (
            <div className="col-span-full grid place-items-center p-4 text-center text-sm text-muted-foreground">
              <div>
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
                <p className="mt-2 text-xs font-semibold text-foreground">Failed to load hotspots</p>
                <button
                  onClick={() => hotspotsRefetch()}
                  aria-label="Retry loading hotspots"
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : hotspotRows.length === 0 && !hotspotsLoading ? (
            <div className="col-span-full p-4 text-center text-xs text-muted-foreground">No hotspot data available</div>
          ) : (
            hotspotRows.map((h) => (
              <div key={h.id} className="group relative bg-surface/80 px-3.5 py-3 transition-colors hover:bg-surface-elevated">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">#{h.rank}</span>
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                      h.trend === "up" ? "text-[var(--color-neon-orange)]" : "text-[var(--color-neon-lime)]"
                    }`}
                  >
                    {h.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(h.change)}%
                  </span>
                </div>
                <div className="mt-1.5 truncate text-sm font-semibold text-foreground">{h.zone}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${h.risk}%`,
                        background:
                          h.risk > 80
                            ? "var(--color-neon-red)"
                            : h.risk > 60
                              ? "var(--color-neon-orange)"
                              : "var(--color-neon-cyan)",
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-foreground">{h.risk}</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{h.cluster} events · cluster</div>
              </div>
            ))
          )}
        </div>
      </motion.aside>

      <EventDrawer />
    </div>
  );
}

function KpiPill({
  label,
  value,
  tone,
  dot,
}: {
  label: string;
  value: number;
  tone: "lime" | "orange" | "red" | "cyan" | "muted";
  dot?: boolean;
}) {
  const color =
    tone === "lime"
      ? "var(--color-neon-lime)"
      : tone === "orange"
        ? "var(--color-neon-orange)"
        : tone === "red"
          ? "var(--color-neon-red)"
          : tone === "cyan"
            ? "var(--color-neon-cyan)"
            : "var(--color-muted-foreground)";
  return (
    <div className="flex items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-xs">
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: color, opacity: 0.6 }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        </span>
      )}
      <span className="uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

function ToggleSwitch({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={`Toggle ${label}`}
      className="flex items-center gap-2 rounded-full glass-pill px-3 py-1.5 text-xs"
    >
      <span className="uppercase tracking-[0.14em] text-muted-foreground" aria-hidden="true">{label}</span>
      <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`} aria-hidden="true">
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all"
          style={{ left: on ? "14px" : "2px" }}
        />
      </span>
    </button>
  );
}

function PanelHeader({ icon: Icon, title, sub, pulse }: { icon: LucideIcon; title: string; sub: string; pulse?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</span>
      </div>
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {pulse && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        )}
        {sub}
      </span>
    </div>
  );
}

function PriorityChip({ p }: { p: string }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{ background: priorityHex(p) + "22", color: priorityHex(p) }}
    >
      {p}
    </span>
  );
}

function AIMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  confidence,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "orange" | "red" | "cyan";
  confidence: number;
}) {
  const color =
    tone === "orange" ? "var(--color-neon-orange)" : tone === "red" ? "var(--color-neon-red)" : "var(--color-neon-cyan)";
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          {label}
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          conf {(confidence * 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="font-mono text-xl font-semibold" style={{ color }}>{value}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${confidence * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - +new Date(iso)) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hr = Math.floor(mins / 60);
  return `${hr}h ${mins % 60}m ago`;
}

function TimeAgo({ iso }: { iso: string }) {
  const label = useClientOnlyValue(() => timeAgo(iso), [iso]);
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {label ?? ""}
    </span>
  );
}

function EventDrawer() {
  const { drawerEvent, setDrawerEvent } = useCommandStore();
  return (
    <AnimatePresence>
      {drawerEvent && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerEvent(null)}
            className="absolute inset-0 z-[450] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: 460, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 460, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute bottom-0 right-0 top-0 z-[460] w-[420px] max-w-full overflow-y-auto border-l border-border bg-surface/95 backdrop-blur-2xl"
          >
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {drawerEvent.code}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold">{drawerEvent.cause}</h2>
                  <div className="mt-1 text-sm text-muted-foreground">{drawerEvent.zone}</div>
                </div>
                <button
                  onClick={() => setDrawerEvent(null)}
                  aria-label="Close event details"
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <PriorityChip p={drawerEvent.priority} />
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {drawerEvent.status}
                </span>
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {drawerEvent.vehicleType}
                </span>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-xl border border-border bg-surface-elevated/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</div>
                <p className="mt-1 text-sm text-foreground">{drawerEvent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBox label="Closure risk" value={`${Math.round(drawerEvent.closureRisk * 100)}%`} />
                <StatBox label="Hotspot risk" value={`${Math.round(drawerEvent.hotspotRisk * 100)}%`} />
                <StatBox label="Affected radius" value={`${drawerEvent.affectedRadius}m`} />
                <StatBox label="ETA" value={drawerEvent.eta} />
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
                  <Sparkles className="h-3 w-3" /> Recommended Response
                </div>
                <p className="mt-1 text-sm text-foreground">{drawerEvent.recommendedAction}</p>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Reported by · {drawerEvent.reportedBy}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}
