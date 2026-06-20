import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Activity, Sparkles, TrendingUp, AlertTriangle, type LucideIcon } from "lucide-react";
import { priorityHex } from "@/lib/store";

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.11 0.006 240)",
    border: "1px solid oklch(0.22 0.01 240 / 0.6)",
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "Space Grotesk",
  },
  labelStyle: {
    color: "oklch(0.65 0.015 240)",
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
};

export function AnalyticsCenter() {
  const { data, isLoading, error, refetch } = useAnalytics();
  const causeBreakdown = Array.isArray(data?.causeBreakdown) ? data.causeBreakdown : [];
  const priorityBreakdown = Array.isArray(data?.priorityBreakdown) ? data.priorityBreakdown : [];
  const hourlyTrend = Array.isArray(data?.hourlyTrend) ? data.hourlyTrend : [];
  const weeklyTrend = Array.isArray(data?.weeklyTrend) ? data.weeklyTrend : [];
  const zoneIntelligence = Array.isArray(data?.zoneIntelligence) ? data.zoneIntelligence : [];

  if (error) {
    return (
      <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-3 font-semibold text-foreground">Failed to load analytics data</p>
          <p className="mt-1 text-xs">API unavailable</p>
          <button
            onClick={() => refetch()}
            aria-label="Retry loading analytics"
            className="mt-4 rounded-lg border border-border px-4 py-2 text-xs hover:bg-surface-elevated"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border bg-surface/40 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          /analytics · last 7 days
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Analytics Center</h1>
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-6">
        {/* Insight cards row */}
        <Insight tone="lime" label="Avg resolution" value="38 min" change="-12%" icon={Activity} />
        <Insight tone="cyan" label="AI accuracy" value="94.2%" change="+1.8%" icon={Sparkles} />
        <Insight tone="orange" label="Closure events" value="63" change="+4" icon={AlertTriangle} />
        <Insight
          tone="red"
          label="Critical surge"
          value="3 zones"
          change="trending"
          icon={TrendingUp}
        />

        {/* Hourly trend */}
        <Card span={8} title="Hourly Event Volume" sub="Live ingestion vs. critical">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : !data ? (
            <div className="grid h-[260px] place-items-center text-xs text-muted-foreground">
              Waiting for analytics data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourlyTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bef264" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#bef264" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d4d" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ff4d4d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.22 0.01 240 / 0.4)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="oklch(0.55 0.015 240)"
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis stroke="oklch(0.55 0.015 240)" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#bef264"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stroke="#ff4d4d"
                  strokeWidth={1.5}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Priority radial */}
        <Card span={4} title="Priority Mix" sub="Active distribution">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : !data ? (
            <div className="grid h-[260px] place-items-center text-xs text-muted-foreground">
              Waiting for analytics data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <RadialBarChart
                  innerRadius="35%"
                  outerRadius="100%"
                  data={priorityBreakdown.map((p) => ({ ...p, fill: priorityHex(p.priority) }))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, Math.max(...priorityBreakdown.map((p) => p.count), 1)]}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "oklch(0.18 0.01 240)" }}
                    dataKey="count"
                    cornerRadius={6}
                  />
                  <Tooltip {...tooltipStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 px-1 pb-2 text-xs">
                {priorityBreakdown.map((p) => (
                  <div key={p.priority} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: priorityHex(p.priority) }}
                    />
                    <span className="capitalize text-muted-foreground">{p.priority}</span>
                    <span className="ml-auto font-mono text-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Cause bar */}
        <Card span={6} title="Event Cause Analysis" sub="Frequency by classification">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : !data ? (
            <div className="grid h-[260px] place-items-center text-xs text-muted-foreground">
              Waiting for analytics data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={causeBreakdown} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="oklch(0.22 0.01 240 / 0.3)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.55 0.015 240)" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="cause"
                  type="category"
                  stroke="oklch(0.55 0.015 240)"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Weekly trend */}
        <Card span={6} title="Weekly Operations" sub="Resolved vs active events">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : !data ? (
            <div className="grid h-[260px] place-items-center text-xs text-muted-foreground">
              Waiting for analytics data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid stroke="oklch(0.22 0.01 240 / 0.3)" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.55 0.015 240)" tick={{ fontSize: 11 }} />
                <YAxis stroke="oklch(0.55 0.015 240)" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="resolved" stackId="a" fill="#bef264" radius={[0, 0, 0, 0]} />
                <Bar dataKey="active" stackId="a" fill="#ff9533" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Zone intelligence */}
        <Card span={12} title="Zone Intelligence" sub="Event load × risk score">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : !data ? (
            <div className="grid h-[260px] place-items-center text-xs text-muted-foreground">
              Waiting for analytics data
            </div>
          ) : (
            <>
              {/* Analytics Insight Strip */}
              {zoneIntelligence.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {causeBreakdown.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
                      {causeBreakdown[0].cause} accounts for {Math.round((causeBreakdown[0].count / causeBreakdown.reduce((s, c) => s + c.count, 0)) * 100)}% of incidents
                    </span>
                  )}
                  {hourlyTrend.length > 0 && (() => {
                    const peakHour = hourlyTrend.reduce((a, b) => (b.events > a.events ? b : a), hourlyTrend[0]);
                    return (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#bef264]" />
                        Peak activity at {peakHour.hour}
                      </span>
                    );
                  })()}
                  {(() => {
                    const monitorCount = zoneIntelligence.filter((z) => z.risk >= 70).length;
                    return monitorCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff9533]" />
                        {monitorCount} zone{monitorCount > 1 ? "s" : ""} require active monitoring
                      </span>
                    ) : null;
                  })()}
                  {zoneIntelligence.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]" />
                      {zoneIntelligence[0].zone} is the highest-risk area
                    </span>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {zoneIntelligence.map((z) => {
                  const riskColor = z.risk > 70 ? "#ff4d4d" : z.risk > 40 ? "#ff9533" : "#bef264";
                  const riskCategory =
                    z.risk >= 90 ? "CRITICAL" : z.risk >= 70 ? "HIGH" : z.risk >= 40 ? "MEDIUM" : "LOW";
                  const badgeBg =
                    z.risk >= 90 ? "#ff4d4d22" : z.risk >= 70 ? "#ff953322" : z.risk >= 40 ? "#ff953311" : "#bef26422";
                  return (
                    <div
                      key={z.zone}
                      className="rounded-xl border border-border bg-surface-elevated/40 p-3"
                    >
                      <div className="truncate text-sm font-semibold text-foreground">{z.zone}</div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{z.events} events</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-semibold" style={{ color: riskColor }}>
                            {z.risk}
                          </span>
                          <span
                            className="rounded px-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                            style={{ background: badgeBg, color: riskColor }}
                          >
                            {riskCategory}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${z.risk}%`, background: riskColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Insight({
  tone,
  label,
  value,
  change,
  icon: Icon,
}: {
  tone: "lime" | "cyan" | "orange" | "red";
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
}) {
  const color =
    tone === "lime"
      ? "#bef264"
      : tone === "cyan"
        ? "#22d3ee"
        : tone === "orange"
          ? "#ff9533"
          : "#ff4d4d";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: color + "1a", color }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-mono text-4xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs" style={{ color }}>
        {change}
      </div>
    </motion.div>
  );
}

function Card({
  span,
  title,
  sub,
  children,
}: {
  span: number;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`col-span-12 lg:col-span-${span} rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur-xl`}
    >
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {sub}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
