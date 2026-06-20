import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "dark" | "light" | "system";

interface EwSettings {
  theme: Theme;
  notificationsEnabled: boolean;
  incidentAlerts: boolean;
  hotspotAlerts: boolean;
  aiRecommendations: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const STORAGE_KEY = "ew_settings";

const DEFAULTS: EwSettings = {
  theme: "dark",
  notificationsEnabled: true,
  incidentAlerts: true,
  hotspotAlerts: true,
  aiRecommendations: true,
  autoRefresh: true,
  refreshInterval: 30,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadSettings(): EwSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(s: EwSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-background shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── StatRow (label / value pair, like StatBox pattern) ──────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-xl">
      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────

export function Settings() {
  const [settings, setSettings] = useState<EwSettings>(loadSettings);

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const update = useCallback(<K extends keyof EwSettings>(key: K, value: EwSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const THEME_OPTIONS: { value: Theme; label: string }[] = [
    { value: "dark", label: "Dark Mode" },
    { value: "light", label: "Light Mode" },
    { value: "system", label: "System" },
  ];

  const lastLogin = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border bg-surface/40 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          /settings · preferences
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mx-auto max-w-2xl space-y-4">

          {/* 1. Theme Preferences */}
          <Section title="Theme Preferences">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme preference">
              {THEME_OPTIONS.map(({ value, label }) => {
                const active = settings.theme === value;
                return (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("theme", value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30 border-primary/30"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* 2. Notification Preferences */}
          <Section title="Notification Preferences">
            <div className="space-y-4">
              {/* Master toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="toggle-notifications"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Enable Notifications
                </label>
                <Toggle
                  id="toggle-notifications"
                  checked={settings.notificationsEnabled}
                  onChange={(v) => update("notificationsEnabled", v)}
                />
              </div>

              {/* Sub-toggles */}
              <div
                className={`space-y-3 pl-4 border-l border-border ${
                  !settings.notificationsEnabled ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {(
                  [
                    { key: "incidentAlerts", label: "Incident Alerts" },
                    { key: "hotspotAlerts", label: "Hotspot Alerts" },
                    { key: "aiRecommendations", label: "AI Recommendations" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label
                      htmlFor={`toggle-${key}`}
                      className="cursor-pointer text-sm text-foreground"
                    >
                      {label}
                    </label>
                    <Toggle
                      id={`toggle-${key}`}
                      checked={settings[key]}
                      onChange={(v) => update(key, v)}
                      disabled={!settings.notificationsEnabled}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 3. Dashboard Preferences */}
          <Section title="Dashboard Preferences">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="toggle-autorefresh"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Auto Refresh
                </label>
                <Toggle
                  id="toggle-autorefresh"
                  checked={settings.autoRefresh}
                  onChange={(v) => update("autoRefresh", v)}
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  !settings.autoRefresh ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <label
                  htmlFor="select-refresh-interval"
                  className="text-sm text-foreground"
                >
                  Refresh Interval
                </label>
                <select
                  id="select-refresh-interval"
                  value={settings.refreshInterval}
                  disabled={!settings.autoRefresh}
                  onChange={(e) => update("refreshInterval", Number(e.target.value))}
                  className="rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={120}>120s</option>
                </select>
              </div>
            </div>
          </Section>

          {/* 4. Account Section */}
          <Section title="Account">
            <InfoRow label="Name" value="Arjun Kapoor" />
            <InfoRow label="Role" value="Ops Commander" />
            <InfoRow label="Last Login" value={lastLogin} />
          </Section>

          {/* 5. App Information */}
          <Section title="App Information">
            <InfoRow label="Version" value="2.4.0" />
            <InfoRow label="Build" value="2025-01-20" />
            <InfoRow label="Backend" value="https://eventwise-ai-1.onrender.com" />
          </Section>
        </div>
      </div>
    </div>
  );
}
