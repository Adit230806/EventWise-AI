import { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Zap, Target, AlertTriangle, Flame, ArrowRight, Loader2 } from "lucide-react";
import { useTriage } from "@/hooks/useTriage";
import type { TriageResponse } from "@/types";
import { toast } from "sonner";

// TODO: fetch from /api/config
const eventTypes = ["Incident", "Planned Event", "Weather Event", "Infrastructure"];
const causes = ["Vehicle Breakdown", "Accident", "Construction", "Water Logging", "Tree Fall", "Signal Failure"];
const zones = ["Sector 7 / MG Road", "Whitefield Corridor", "Hebbal Junction", "Silk Board", "Electronic City"];
const vehicles = ["Truck", "Car", "Bus", "Two-Wheeler", "Auto", "None"];

export function AITriage() {
  const [form, setForm] = useState({
    eventType: "Incident",
    cause: "Accident",
    zone: "Silk Board",
    vehicle: "Truck",
    lat: "12.9165",
    lng: "77.6224",
    time: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      time: new Date().toISOString().slice(0, 16),
    }));
  }, []);

  const triage = useTriage();

  function run() {
    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      toast.error("Invalid latitude. Must be a number between -90 and 90.");
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      toast.error("Invalid longitude. Must be a number between -180 and 180.");
      return;
    }
    if (!form.time) {
      toast.error("Please provide a valid time.");
      return;
    }

    triage.mutate(form);
  }

  const result: TriageResponse | null | undefined = triage.data;

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* LEFT - form */}
      <div className="flex flex-col overflow-y-auto border-r border-border bg-surface/30 p-6 backdrop-blur-xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          /triage · ai copilot
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">AI Event Triage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score an inbound event before dispatch. EventWise weights cause, zone, time-of-day and vehicle profile.
        </p>

        <div className="mt-6 space-y-3">
          <Select label="Event Type" value={form.eventType} options={eventTypes} onChange={(v) => setForm({ ...form, eventType: v })} />
          <Select label="Event Cause" value={form.cause} options={causes} onChange={(v) => setForm({ ...form, cause: v })} />
          <Select label="Zone" value={form.zone} options={zones} onChange={(v) => setForm({ ...form, zone: v })} />
          <Select label="Vehicle Type" value={form.vehicle} options={vehicles} onChange={(v) => setForm({ ...form, vehicle: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" value={form.lat} onChange={(v) => setForm({ ...form, lat: v })} />
            <Field label="Longitude" value={form.lng} onChange={(v) => setForm({ ...form, lng: v })} />
          </div>
          <Field label="Time" value={form.time} type="datetime-local" onChange={(v) => setForm({ ...form, time: v })} />
        </div>

        <button
          onClick={run}
          disabled={triage.isPending}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-4px_oklch(0.88_0.22_130/0.6)] transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          {triage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {triage.isPending ? "Synthesising response…" : "Run AI Triage"}
        </button>
      </div>

      {/* RIGHT - results */}
      <div className="overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {triage.error && !triage.isPending && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
                <p className="mt-3 font-semibold text-foreground">Triage request failed. Please try again.</p>
                <button onClick={() => triage.reset()} className="mt-4 rounded-lg border border-border px-4 py-2 text-xs hover:bg-surface-elevated">Dismiss</button>
              </div>
            </motion.div>
          )}
          {triage.isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-full place-items-center text-center"
            >
              <div>
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Cross-referencing 142,318 historical incidents…
                </p>
              </div>
            </motion.div>
          )}
          {!triage.error && !triage.isPending && !result && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-full place-items-center text-center text-sm text-muted-foreground"
            >
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <p className="mt-4 max-w-xs">
                  Configure an event on the left and run triage. The copilot returns priority, closure probability, hotspot risk and a recommended response plan.
                </p>
              </div>
            </motion.div>
          )}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
                  <Sparkles className="h-3 w-3" /> AI verdict
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-mono text-5xl font-semibold tracking-tight text-foreground">{result.priorityScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                  <span
                    className="ml-auto rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: result.priorityLabel === "CRITICAL" ? "#ff4d4d22" : result.priorityLabel === "HIGH" ? "#ff953322" : "#22d3ee22",
                      color: result.priorityLabel === "CRITICAL" ? "#ff4d4d" : result.priorityLabel === "HIGH" ? "#ff9533" : "#22d3ee",
                    }}
                  >
                    {result.priorityLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Priority score with {result.priorityScore}% model confidence.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Metric icon={AlertTriangle} label="Closure prob." value={`${result.closure}%`} color="#ff9533" />
                <Metric icon={Flame} label="Hotspot risk" value={`${result.hotspot}%`} color="#22d3ee" />
                <Metric icon={Target} label="Est. clear" value={result.eta} color="#bef264" />
              </div>

              <div className="rounded-2xl border border-border bg-surface/60 p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" /> Recommended Response
                </div>
                <p className="mt-2 text-base leading-relaxed text-foreground">{result.response}</p>
                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                    Deploy <ArrowRight className="h-3 w-3" />
                  </button>
                  <button className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                    Open simulation
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface/60 p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Contributing signals
                </div>
                <div className="mt-3 divide-y divide-border">
                  {result.signals.map((s) => (
                    <div key={s.k} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-muted-foreground">{s.k}</span>
                      <span className="font-mono text-xs text-foreground">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const id = useId();
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 font-mono text-xl font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}
