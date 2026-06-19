import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Activity, BarChart3, Brain, Flame, Radio, Search, Settings, HelpCircle, Bell } from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { to: "/", label: "Command Center", icon: Radio },
  { to: "/explorer", label: "Event Explorer", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/triage", label: "AI Triage", icon: Brain },
  { to: "/hotspots", label: "Hotspots", icon: Flame },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground scanline">
      {/* Sidebar */}
      <aside className="flex w-[68px] shrink-0 flex-col items-center justify-between border-r border-border bg-sidebar/60 py-5 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="group relative grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_oklch(0.88_0.22_130/0.6)]">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <nav className="flex flex-col items-center gap-1.5">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent ring-1 ring-primary/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={`relative h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block z-50">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background/70 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            EventWise <span className="text-foreground">AI</span> · Live
          </span>
        </div>
        <span className="hidden text-xs text-muted-foreground md:inline">
          {new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-input/40 px-3 text-sm text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <input
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search events, zones, vehicles…"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/60 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">9</span>
        </button>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-2.5 py-1">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-xs font-semibold text-primary">AK</div>
          <div className="hidden flex-col text-xs leading-tight md:flex">
            <span className="font-medium text-foreground">Arjun Kapoor</span>
            <span className="text-[10px] text-muted-foreground">Ops Commander</span>
          </div>
        </div>
      </div>
    </header>
  );
}