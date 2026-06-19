# Implementation Plan: Mock Data Removal

## Overview

20 tasks across 3 phases: foundation (types/services/hooks), page rewrites, and cleanup/verification. Tasks in Phase 1 are mostly independent and can be executed in parallel. Phase 2 tasks each depend on Phase 1 completing. Task 18 (delete mock-data.ts) depends on all Phase 2 tasks.

## Tasks

### Phase 1 — Foundation (types, services, hooks)

- [x] 1. Create `src/types/index.ts` with all domain interfaces
  - Move `EventStatus`, `EventPriority`, `EventCause`, `VehicleType` type aliases from `mock-data.ts`
  - Move `TrafficEvent` interface from `mock-data.ts`
  - Add `DashboardStats`, `EventAnalyticsData`, `CauseBreakdownItem`, `PriorityBreakdownItem`, `HourlyTrendItem`, `WeeklyTrendItem`, `ZoneIntelligenceItem`, `HotspotData`, `TriageRequest`, `TriageSignal`, `TriageResponse` interfaces
  - **Requirements**: 2.1, 2.2, 2.3, 2.4, 2.5

- [x] 2. Update imports in `store.ts` and map components
  - In `src/lib/store.ts`: change `import type { TrafficEvent } from "./mock-data"` → `from "@/types"`
  - In `src/components/TrafficMap.tsx`: change `import type { TrafficEvent } from "@/lib/mock-data"` → `from "@/types"`
  - In `src/components/TrafficMapInner.tsx`: change `import type { TrafficEvent } from "@/lib/mock-data"` → `from "@/types"`
  - **Requirements**: 2.6

- [x] 3. Create `src/services/eventsService.ts`
  - Implement `getAll(filters?)`, `getLiveFeed()`, `getById(id)` all returning empty/null stubs
  - Add `// TODO: Fetch from backend` comment on each function
  - **Requirements**: 3.1

- [x] 4. Create `src/services/analyticsService.ts`
  - Implement `get()` returning `null` stub
  - Add `// TODO: Fetch from backend GET /api/analytics` comment
  - **Requirements**: 3.2

- [x] 5. Create `src/services/hotspotService.ts`
  - Implement `getAll()` returning `[]` and `getStats()` returning `null`
  - Add `// TODO:` comments on each function
  - **Requirements**: 3.3

- [x] 6. Create `src/services/triageService.ts`
  - Implement `run(req)` returning `null` stub
  - Add `// TODO: POST to backend /api/triage` comment
  - **Requirements**: 3.4

- [x] 7. Create `src/hooks/useEvents.ts`
  - Export `useEvents(filters?)` with `useQuery` key `["events", filters]`
  - Export `useLiveFeed()` with `useQuery` key `["events", "live-feed"]`
  - **Requirements**: 4.1

- [x] 8. Create `src/hooks/useDashboardStats.ts`
  - Export `useDashboardStats()` with `useQuery` key `["dashboard-stats"]`
  - **Requirements**: 4.2

- [x] 9. Create `src/hooks/useAnalytics.ts`
  - Export `useAnalytics()` with `useQuery` key `["analytics"]`
  - **Requirements**: 4.3

- [x] 10. Create `src/hooks/useHotspots.ts`
  - Export `useHotspots()` with `useQuery` key `["hotspots"]`
  - **Requirements**: 4.4

- [x] 11. Create `src/hooks/useTriage.ts`
  - Export `useTriage()` using `useMutation` calling `triageService.run()`
  - **Requirements**: 4.5

- [x] 12. Ensure `QueryClientProvider` is present in the app root
  - Check `src/router.tsx` for an existing `QueryClientProvider`; if absent, add one wrapping the router
  - **Requirements**: 9.3

### Phase 2 — Page rewrites

- [x] 13. Rewrite `src/pages/CommandCenter.tsx`
  - Replace `import { events, kpis, liveFeed, hotspots } from "@/lib/mock-data"` with hook imports
  - Use `useDashboardStats()` for KPI pills; render Skeleton pills when `isLoading`, error state with Retry when `error`
  - Use `useLiveFeed()` for live feed; render Skeleton rows when loading, "No active incidents" when `[]`, error state with Retry when error
  - Use `useHotspots()` for bottom hotspot bar; render Skeleton cells when loading, "No hotspot data available" when `[]`, error state when error
  - Pass `data ?? []` to `<TrafficMap events={...} />`
  - Preserve all existing layout, classes, animations, and helper components unchanged
  - **Requirements**: 1.1, 1.3, 1.5, 1.6, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 8.1, 8.4

- [x] 14. Rewrite `src/pages/EventExplorer.tsx`
  - Replace `import { events as allEvents } from "@/lib/mock-data"` with `useEvents()` hook
  - Derive `causes` from a static constant (the 8 possible causes) rather than from `allEvents`
  - Render Skeleton cards (6+) when `isLoading`
  - Render "No events available" empty state when `data` is `[]` and no filters active
  - Preserve existing "No events match your filters" state when filters are active but return empty
  - Render error state with Retry when `error`
  - Pass `filters` object to `useEvents()` so filtering happens server-side (for now, client-side filter on returned array still works since array is empty)
  - Preserve all existing layout, filter UI, and animation unchanged
  - **Requirements**: 1.1, 1.2, 5.4, 6.3, 7.2, 8.1

- [x] 15. Rewrite `src/pages/AnalyticsCenter.tsx`
  - Replace `import { causeBreakdown, priorityBreakdown, hourlyTrend, weeklyTrend, zoneIntelligence } from "@/lib/mock-data"` with `useAnalytics()` hook
  - Destructure from `data` (or use `data?.causeBreakdown ?? []` pattern)
  - Render Skeleton blocks for each chart when `isLoading`
  - Render "Waiting for analytics data" placeholder in each chart when `data` is `null`
  - Render error state with Retry when `error`
  - Keep Insight card values as static placeholders (strings like `"—"`) when data is null, OR hide them — do not remove the Insight component shape
  - Preserve all chart configs, colors, and layout unchanged
  - **Requirements**: 1.1, 1.4, 5.5, 6.4, 7.3, 8.1

- [x] 16. Rewrite `src/pages/HotspotIntelligence.tsx`
  - Replace `import { events, hotspots } from "@/lib/mock-data"` with hook imports
  - Use `useHotspots()` for the right-panel hotspot list
  - Use `useEvents()` for map events (pass `data ?? []` to `<TrafficMap>`)
  - Render Skeleton rows in risk zone list when loading
  - Render "No hotspot data available" when `[]`
  - Render error state with Retry when error
  - Keep Corridor and Junction sections — they are static UI (hardcoded names/values with no mock import); add a `// TODO: wire to API` comment above them
  - Preserve layout and map unchanged
  - **Requirements**: 1.1, 1.5, 5.6, 6.5, 7.4, 8.1

- [x] 17. Rewrite `src/pages/AITriage.tsx`
  - Replace the `setTimeout` + `Math.random()` simulation with `useTriage()` mutation
  - The `run()` function calls `triage.mutate(form)` instead of the `setTimeout` block
  - When mutation result is `null` (stub), the result panel stays on the existing "configure an event" empty state
  - When mutation has error, render "Triage request failed. Please try again." with a dismiss button
  - Keep all form fields, select options, layout, and animations unchanged
  - Remove `const [result, setResult] = useState` / `const [loading, setLoading]`; use `triage.data`, `triage.isPending`, `triage.error` instead
  - **Requirements**: 1.7, 6.6, 7.5, 8.1

### Phase 3 — Cleanup and verification

- [~] 18. Delete `src/lib/mock-data.ts`
  - Only after all pages have been successfully updated and compile cleanly
  - Verify no remaining imports reference this file
  - **Requirements**: 1.1

- [~] 19. Verify TypeScript compilation
  - Run `npx tsc --noEmit` (or equivalent) from the frontend directory
  - Fix any remaining type errors from the migration
  - **Requirements**: 9.1

- [~] 20. Verify runtime stability on empty data
  - Confirm `<TrafficMap events={[]} />` does not throw
  - Confirm recharts components with `data={[]}` do not throw
  - Confirm no uncaught "Cannot read property of undefined" errors in the browser console
  - **Requirements**: 9.2

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "12"],
      "description": "Types foundation and QueryClientProvider setup — no dependencies"
    },
    {
      "wave": 2,
      "tasks": ["2", "3", "4", "5", "6"],
      "description": "Update existing imports; create all four service stubs — depend on Task 1"
    },
    {
      "wave": 3,
      "tasks": ["7", "8", "9", "10", "11"],
      "description": "Create all React Query hooks — depend on Tasks 3-6"
    },
    {
      "wave": 4,
      "tasks": ["13", "14", "15", "16", "17"],
      "description": "Rewrite all five pages to use hooks and add loading/empty/error states — depend on Tasks 7-11"
    },
    {
      "wave": 5,
      "tasks": ["18"],
      "description": "Delete mock-data.ts — depends on all Wave 4 tasks completing"
    },
    {
      "wave": 6,
      "tasks": ["19", "20"],
      "description": "Verification — TypeScript compile check and runtime stability check"
    }
  ]
}
```

## Notes

- Tasks 3–11 are all small, isolated file creations with no interdependencies; they can be done in any order within Phase 1.
- Task 2 (import path updates in store.ts and map components) should be done immediately after Task 1 to unblock compilation checks.
- The Corridor and Junction sections in HotspotIntelligence (Task 16) use hardcoded static strings for names and load values — these are UI demonstration elements, not imported mock data. They should be kept with a `// TODO: wire to API` comment rather than removed.
- The AITriage form dropdowns (eventTypes, causes, zones, vehicles) contain hardcoded option arrays. These are form option lists, not event data. They should be kept as-is with a `// TODO: fetch from /api/config` comment.
- All Skeleton components should use `className="animate-pulse"` via the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.
