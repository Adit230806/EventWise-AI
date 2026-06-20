import { useMemo, useState, useEffect, useRef } from "react";
import { useEvents } from "@/hooks/useEvents";
import type { TrafficEvent } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { priorityHex } from "@/lib/store";
import { getIncidentImage } from "@/lib/incidentImages";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, Clock, ChevronDown, Sparkles, Download, X, AlertTriangle } from "lucide-react";

const priorities = ["critical", "high", "medium", "low"];

const CAUSES = [
  "Vehicle Breakdown", "Accident", "Construction", "Water Logging",
  "Tree Fall", "Signal Failure", "Protest", "VIP Movement"
] as const;

export function EventExplorer() {
  const [q, setQ] = useState("");
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [activeCause, setActiveCause] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: allEvents = [], isLoading, error, refetch } = useEvents();

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (activePriority && e.priority !== activePriority) return false;
      if (activeCause && e.cause !== activeCause) return false;
      if (q && !`${e.code} ${e.cause} ${e.zone}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allEvents, q, activePriority, activeCause]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-surface/40 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              /explorer · {filtered.length} of {allEvents.length} events
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Event Explorer</h1>
          </div>
          <button
            aria-label="Export events as CSV"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="mt-3 sm:mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-input/40 px-3 text-sm sm:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code, cause, zone…"
              aria-label="Search events by code, cause, or zone"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() => setActivePriority(activePriority === p ? null : p)}
                aria-label={`Filter by ${p} priority`}
                aria-pressed={activePriority === p}
                className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  borderColor: activePriority === p ? priorityHex(p) : "var(--color-border)",
                  color: activePriority === p ? priorityHex(p) : "var(--color-muted-foreground)",
                  background: activePriority === p ? priorityHex(p) + "15" : "transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <CauseDropdown active={activeCause} onChange={setActiveCause} />
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-3 font-semibold text-foreground">Failed to load events</p>
              <p className="mt-1 text-xs">API unavailable</p>
              <button onClick={() => refetch()} className="mt-4 rounded-lg border border-border px-4 py-2 text-xs hover:bg-surface-elevated">Retry</button>
            </div>
          </div>
        ) : !activePriority && !activeCause && !q && allEvents.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border">
                <Search className="h-5 w-5" />
              </div>
              <p className="mt-3">No events available.</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border">
                <Search className="h-5 w-5" />
              </div>
              <p className="mt-3">No events match your filters.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((e) => (
              <EventCard
                key={e.id}
                e={e}
                expanded={expanded === e.id}
                onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CauseDropdown({ active, onChange }: { active: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Filter by cause: ${active ?? "all"}`}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        Cause: {active ?? "all"} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div role="listbox" aria-label="Filter by cause" className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-popover p-1 shadow-xl">
          <button
            role="option"
            aria-selected={active === null}
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
          >
            All causes
          </button>
          {CAUSES.map((c) => (
            <button
              key={c}
              role="option"
              aria-selected={active === c}
              onClick={() => { onChange(c); setOpen(false); }}
              className="w-full rounded px-2 py-1.5 text-left text-xs text-foreground hover:bg-surface-elevated"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IncidentBanner({ cause }: { cause: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = getIncidentImage(cause);

  return (
    <div className="relative mb-3 h-52 w-full overflow-hidden rounded-lg bg-surface-elevated/40">
      {!loaded && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
      <img
        src={src}
        alt={`Visual context for ${cause}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 ease-out hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function EventCard({ e, expanded, onToggle }: { e: TrafficEvent; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      className="group flex flex-col rounded-xl border border-border bg-surface/60 p-4 text-left backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-surface-elevated/80"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{e.code}</div>
          <div className="mt-0.5 text-base font-semibold text-foreground">{e.cause}</div>
        </div>
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: priorityHex(e.priority) + "22", color: priorityHex(e.priority) }}
        >
          {e.priority}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.zone}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.eta}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Closure" value={`${Math.round(e.closureRisk * 100)}%`} />
        <Mini label="Hotspot" value={`${Math.round(e.hotspotRisk * 100)}%`} />
        <Mini label="Radius" value={`${e.affectedRadius}m`} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden border-t border-border pt-3"
          >
            <IncidentBanner cause={e.cause} />
            <p className="text-xs text-muted-foreground">{e.description}</p>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] p-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <p className="text-xs text-foreground">{e.recommendedAction}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
