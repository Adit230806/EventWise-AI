/**
 * AppShell — main layout shell.
 *
 * Features:
 *  - Expandable desktop sidebar (260px) with collapse to icon-rail (68px)
 *  - Sidebar state persisted to localStorage
 *  - All 5 nav routes + Settings (→ /analytics) + Help (→ API docs)
 *  - Spring-animated active indicator
 *  - Global search: debounced, keyboard-navigable, empty state, ⌘K shortcut
 *  - Live clock updating every second (no memory leak)
 *  - Full mobile drawer nav
 */
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveClock } from "@/hooks/useLiveClock";
import { useEvents, useLiveFeed } from "@/hooks/useEvents";
import { useHotspots } from "@/hooks/useHotspots";
import { useCommandStore, priorityHex } from "@/lib/store";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import type { Event } from "@/types/event";

// ─── Nav definition ───────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/",          label: "Command Center",  icon: Radio    },
  { to: "/explorer",  label: "Event Explorer",  icon: Search   },
  { to: "/analytics", label: "Analytics",       icon: BarChart3 },
  { to: "/triage",    label: "AI Triage",       icon: Brain    },
  { to: "/hotspots",  label: "Hotspots",        icon: Flame    },
] as const;

const SIDEBAR_COLLAPSED_KEY = "ew_sidebar_collapsed";
const EXPANDED_W  = 264; // px
const COLLAPSED_W =  68; // px

// ─── Search helpers ───────────────────────────────────────────────────────────

function matchesQuery(e: Event, q: string): boolean {
  const lq = q.toLowerCase();
  return (
    e.code.toLowerCase().includes(lq)        ||
    e.cause.toLowerCase().includes(lq)       ||
    e.zone.toLowerCase().includes(lq)        ||
    e.vehicleType.toLowerCase().includes(lq) ||
    e.priority.toLowerCase().includes(lq)    ||
    e.status.toLowerCase().includes(lq)      ||
    e.description.toLowerCase().includes(lq)
  );
}

const CAUSE_ICONS: Record<string, LucideIcon> = {
  "Vehicle Breakdown": Car,
  Accident:            AlertTriangle,
  Construction:        Construction,
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Persist sidebar collapse state
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  const sidebarWidth = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground scanline">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="hidden md:flex shrink-0 flex-col justify-between border-r border-border bg-sidebar/60 backdrop-blur-xl overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {/* Top — logo + nav */}
        <div className="flex flex-col gap-1 py-5">

          {/* Logo row */}
          <div className={`flex items-center px-3 mb-4 ${collapsed ? "justify-center" : "justify-between"}`}>
            <Link
              to="/"
              aria-label="EventWise AI — Home"
              className="flex items-center gap-3 min-w-0"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.88_0.22_130/0.55)]">
                <Activity className="h-5 w-5" strokeWidth={2.5} />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground truncate"
                >
                  EventWise <span className="text-foreground">AI</span>
                </motion.span>
              )}
            </Link>

            {/* Collapse toggle (only visible when expanded) */}
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {/* Expand button (only visible when collapsed) */}
          {collapsed && (
            <div className="flex justify-center mb-2">
              <button
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Nav items */}
          <nav aria-label="Main navigation" className="flex flex-col gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors
                    ${active ? "text-primary" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent ring-1 ring-primary/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={`relative h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="relative truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom — settings + help */}
        <div className="flex flex-col gap-1 px-2 pb-5">
          <div className="mb-2 h-px bg-border/50 mx-2" />

          <a
            href="https://eventwise-ai-1.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="API Documentation"
            className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors`}
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="truncate">
                Help &amp; Docs
              </motion.span>
            )}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block z-50">
                Help &amp; Docs
              </span>
            )}
          </a>

          <Link
            to="/settings"
            aria-label="Settings"
            className="group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors"
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="truncate">
                Settings
              </motion.span>
            )}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block z-50">
                Settings
              </span>
            )}
          </Link>
        </div>
      </motion.aside>

      {/* ── Mobile Nav Overlay ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-[900] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
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
                {NAV_ITEMS.map((item) => {
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
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
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
                  aria-label="Help and API Documentation"
                  className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-[18px] w-[18px]" />
                  Help &amp; Docs
                </a>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
                >
                  <Settings className="h-[18px] w-[18px]" />
                  Settings
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="relative flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const raw = localStorage.getItem("ew_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme === "light") return "light";
      }
    } catch {}
    return "dark";
  });

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      const raw = localStorage.getItem("ew_settings");
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem("ew_settings", JSON.stringify({ ...current, theme: next }));
    } catch {}
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors border border-border"
    >
      {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: liveFeed = [] } = useLiveFeed();
  const { data: hotspots = [] } = useHotspots();

  // Initialise unread count from live data
  useEffect(() => {
    if (unreadCount === null) {
      setUnreadCount(Math.min(liveFeed.length + hotspots.length, 99));
    }
  }, [liveFeed.length, hotspots.length, unreadCount]);

  const displayCount = unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const topFeed = liveFeed.slice(0, 3);
  const topHotspots = hotspots.slice(0, 2);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications — ${displayCount} unread`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/60 text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {displayCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-popover shadow-2xl z-[600]"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {displayCount > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {displayCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setUnreadCount(0)}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            </div>

            {/* Incidents */}
            {topFeed.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                    Incidents
                  </span>
                </div>
                {topFeed.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated/60 transition-colors cursor-pointer border-b border-border last:border-0"
                  >
                    <span
                      className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: priorityHex(event.priority) + "22",
                        color: priorityHex(event.priority),
                      }}
                    >
                      {event.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {event.cause} · {event.zone}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {timeAgo(event.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Hotspot Alerts */}
            {topHotspots.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                    Hotspot Alerts
                  </span>
                </div>
                {topHotspots.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated/60 transition-colors cursor-pointer border-b border-border last:border-0"
                  >
                    <span className="mt-0.5 text-base">🔥</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {h.zone} — Risk {Math.round(h.risk * 100)}%
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Cluster of {h.cluster} events
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* AI Recommendation */}
            <div className="px-4 pt-3 pb-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                AI Recommendation
              </span>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated/60 transition-colors cursor-pointer">
              <span className="mt-0.5 text-base">🧠</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Priority surge detected</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Pre-empt Hebbal Junction signal cycle
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const clock = useLiveClock();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 sm:gap-4 border-b border-border bg-background/70 px-3 sm:px-5 backdrop-blur-xl">
      {/* Left — burger (mobile) + brand + clock */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/60 text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            EventWise <span className="text-foreground">AI</span>
            <span className="hidden sm:inline"> · Live</span>
          </span>
        </div>
        <span
          className="hidden text-xs text-muted-foreground lg:inline font-mono tabular-nums"
          aria-live="off"
          aria-label="Current time"
        >
          {clock ?? ""}
        </span>
        {/* Theme toggle — desktop only */}
        <div className="hidden lg:flex">
          <ThemeToggle />
        </div>
      </div>

      {/* Centre — global search */}
      <div className="hidden sm:flex flex-1 items-center justify-center min-w-0 px-4">
        <GlobalSearch />
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationBell />
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
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const dropRef   = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const navigate       = useNavigate();
  const setDrawerEvent = useCommandStore((s) => s.setDrawerEvent);

  // Debounce the raw query by 200 ms to avoid filtering on every keystroke
  const query = useDebounce(raw, 200);

  // Pull events from the shared React-Query cache — zero extra network requests
  const { data: allEvents = [] } = useEvents();

  // Derive filtered results
  const results = useMemo<Event[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return allEvents.filter((e) => matchesQuery(e, q)).slice(0, MAX_RESULTS);
  }, [query, allEvents]);

  // Show empty-state row when typing but nothing matches
  const showEmpty = query.trim().length >= 2 && results.length === 0;

  // Sync open state
  useEffect(() => {
    setOpen((query.trim().length >= 2) && (results.length > 0 || showEmpty));
    setActiveIndex(0);
  }, [results, query, showEmpty]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const clear = useCallback(() => {
    setRaw("");
    setOpen(false);
  }, []);

  const selectResult = useCallback(
    (event: Event) => {
      clear();
      inputRef.current?.blur();
      setDrawerEvent(event);
      navigate({ to: "/" });
    },
    [clear, navigate, setDrawerEvent],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[activeIndex]) selectResult(results[activeIndex]);
        break;
      case "Escape":
        setOpen(false);
        setRaw("");
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapRef}>
      {/* ── Input ── */}
      <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-input/40 px-3 text-sm text-muted-foreground focus-within:border-primary/40 transition-colors">
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2 && (results.length > 0 || showEmpty)) setOpen(true);
          }}
          aria-label="Search events, zones, vehicles, causes"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="global-search-listbox"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
          placeholder="Search events, zones, vehicles…"
        />
        {raw ? (
          <button onClick={clear} aria-label="Clear search" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" aria-label="Keyboard shortcut Command K">
            ⌘K
          </kbd>
        )}
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="global-search-listbox"
            ref={dropRef}
            role="listbox"
            aria-label="Search results"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-[500] mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {showEmpty ? "No results" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground hidden sm:block">
                ↑↓ navigate · ↵ open · esc close
              </span>
            </div>

            {/* Empty state */}
            {showEmpty && (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No matching results found</p>
                <p className="text-xs text-muted-foreground/60">
                  Try searching by cause, zone, code, or vehicle type
                </p>
              </div>
            )}

            {/* Results list */}
            {results.map((e, i) => {
              const Icon    = CAUSE_ICONS[e.cause] ?? MapPin;
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
                      background:  priorityHex(e.priority) + "1a",
                      color:       priorityHex(e.priority),
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
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{e.zone}</span>
                      <span className="shrink-0 font-mono text-[10px] opacity-60">{e.code}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {e.vehicleType !== "None" ? e.vehicleType : ""}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
