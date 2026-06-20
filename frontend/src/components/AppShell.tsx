import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Brain,
  Flame,
  Radio,
  Search,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
  AlertTriangle,
  Car,
  Construction,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveClock } from "@/hooks/useLiveClock";
import { useEvents } from "@/hooks/useEvents";
import { useCommandStore, priorityHex } from "@/lib/store";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Event } from "@/types/event";

const nav = [
  { to: "/", label: "Command Center", icon: Radio },
  { to: "/explorer", label: "Event Explorer", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/triage", label: "AI Triage", icon: Brain },
  { to: "/hotspots", label: "Hotspots", icon: Flame },
];

// ─── Search helpers ───────────────────────────────────────────────────────────

function matchesQuery(e: Event, q: string): boolean {
  const lq = q.toLowerCase();
  return (
    e.code.toLowerCase().includes(lq) ||
    e.cause.toLowerCase().includes(lq) ||
    e.zone.toLowerCase().includes(lq) ||
    e.vehicleType.toLowerCase().includes(lq) ||
    e.priority.toLowerCase().includes(lq) ||
    e.status.toLowerCase().includes(lq) ||
    e.description.toLowerCase().includes(lq)
  );
}

const causeIconMap: Record<string, LucideIcon> = {
  "Vehicle Breakdown": Car,
  Accident: AlertTriangle,
  Construction: Construction,
};

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground scanline">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[68px] shrink-0 flex-col items-center justify-between border-r border-border bg-sidebar/60 py-5 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6">
          <Link
            to="/"
            aria-label="EventWise AI — Home"
            className="group relative grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_oklch(0.88_0.22_130/0.6)]"
          >
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <nav aria-label="Main navigation" className="flex flex-col items-center gap-1.5">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className="group relative grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent ring-1 ring-primary/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`relative h-[18px] w-[18px] ${active ? "text-primary" : ""}`}
                  />
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block z-50">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          {/* Help — links to docs route (graceful fallback) */}
          <a
            href="https://eventwise-ai-1.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="API Documentation"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </a>
          {/* Settings — links to /analytics as the ops config page */}
          <Link
            to="/analytics"
            aria-label="Settings / Analytics"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </aside>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-[900] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-[910] flex w-64 flex-col border-r border-border bg-sidebar/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Activity className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    EventWise <span className="text-foreground">AI</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {nav.map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-sidebar-accent text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                <a
                  href="https://eventwise-ai-1.onrender.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="API Documentation"
                  className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-[18px] w-[18px]" />
                </a>
                <Link
                  to="/analytics"
                  aria-label="Settings / Analytics"
                  className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="relative flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const clock = useLiveClock();

  return (
    <header className="flex h-14 items-center justify-between gap-2 sm:gap-4 border-b border-border bg-background/70 px-3 sm:px-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/60 text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            EventWise <span className="text-foreground">AI</span>
            <span className="hidden sm:inline"> · Live</span>
          </span>
        </div>
        {/* Live clock — updates every second */}
        <span
          className="hidden text-xs text-muted-foreground lg:inline font-mono tabular-nums"
          aria-live="off"
          aria-label="Current time"
        >
          {clock ?? ""}
        </span>
      </div>

      {/* Search bar */}
      <div className="hidden sm:flex flex-1 items-center justify-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Notifications — 9 unread"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/60 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
          >
            9
          </span>
        </button>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-2.5 py-1">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
            AK
          </div>
          <div className="hidden flex-col text-xs leading-tight md:flex">
            <span className="font-medium text-foreground">Arjun Kapoor</span>
            <span className="text-[10px] text-muted-foreground">Ops Commander</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── GlobalSearch ─────────────────────────────────────────────────────────────

const MAX_RESULTS = 8;

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setDrawerEvent = useCommandStore((s) => s.setDrawerEvent);

  // Fetch all events once — same data the rest of the app uses
  const { data: allEvents = [] } = useEvents();

  // Filter events by query
  const results = useMemo<Event[]>(() => {
    const q = query.trim();
    if (!q || q.length < 2) return [];
    return allEvents.filter((e) => matchesQuery(e, q)).slice(0, MAX_RESULTS);
  }, [query, allEvents]);

  // Open dropdown when there are results
  useEffect(() => {
    setOpen(results.length > 0 && query.trim().length >= 2);
    setActiveIndex(0);
  }, [results, query]);

  // ⌘K / Ctrl+K global shortcut to focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const selectResult = useCallback(
    (event: Event) => {
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
      // Open the event drawer on Command Center, or navigate to explorer
      setDrawerEvent(event);
      navigate({ to: "/" });
    },
    [navigate, setDrawerEvent],
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectResult(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      {/* Input */}
      <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-input/40 px-3 text-sm text-muted-foreground focus-within:border-primary/40 transition-colors">
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          aria-label="Search events, zones, vehicles, causes"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="global-search-results"
          role="combobox"
          autoComplete="off"
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Search events, zones, vehicles…"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd
            className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            aria-label="Keyboard shortcut Command K"
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="global-search-results"
            role="listbox"
            aria-label="Search results"
            ref={listRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-[500] mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            <div className="px-3 py-2 border-b border-border">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            </div>
            {results.map((e, i) => {
              const Icon = causeIconMap[e.cause] ?? MapPin;
              const isActive = i === activeIndex;
              return (
                <button
                  key={e.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectResult(e)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
                  }`}
                >
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
                    style={{
                      borderColor: priorityHex(e.priority) + "40",
                      background: priorityHex(e.priority) + "1a",
                      color: priorityHex(e.priority),
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{e.cause}</span>
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: priorityHex(e.priority) + "22", color: priorityHex(e.priority) }}
                      >
                        {e.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="truncate">{e.zone}</span>
                      <span className="shrink-0 font-mono text-[10px]">{e.code}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Hint */}
            <div className="px-3 py-2 border-t border-border flex items-center gap-3">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                ↑↓ navigate · ↵ open · esc dismiss
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
