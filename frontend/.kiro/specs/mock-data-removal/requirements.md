# Requirements Document

## Introduction

Remove all mock/hardcoded data from the EventWise AI frontend and replace it with an API-ready data layer — types, service stubs, and React Query hooks — while keeping every piece of UI, layout, and styling exactly the same.

---

## Requirements

### 1. Remove All Mock Data

#### 1.1 Delete mock-data.ts

The file `src/lib/mock-data.ts` MUST be deleted from the project. No page or component may import from it after this feature is complete.

**Acceptance Criteria:**
- `src/lib/mock-data.ts` does not exist in the repository after implementation
- No file in `src/` contains an import from `@/lib/mock-data` or `./mock-data`
- The application compiles without TypeScript errors

#### 1.2 Remove hardcoded event arrays

All hardcoded arrays of traffic events (the 124-item `events` array) MUST be removed.

**Acceptance Criteria:**
- No file contains `Array.from({ length: 124` or the `mulberry32` pseudo-random function
- No file exports or defines a local array typed as `TrafficEvent[]` with inline data

#### 1.3 Remove hardcoded KPI values

The hardcoded `kpis` object (`totalEvents`, `activeEvents`, `highPriority`, `roadClosures`, `hotspotAlerts`) MUST be removed.

**Acceptance Criteria:**
- No file contains a literal object with all five KPI fields populated with hardcoded numbers
- The CommandCenter KPI pills source their values from a hook or display empty/loading state

#### 1.4 Remove hardcoded analytics data

The hardcoded `causeBreakdown`, `priorityBreakdown`, `hourlyTrend`, `weeklyTrend`, and `zoneIntelligence` arrays MUST be removed.

**Acceptance Criteria:**
- No file directly imports these names from any local data file
- AnalyticsCenter sources chart data from a hook or renders empty/loading state

#### 1.5 Remove hardcoded hotspot data

The hardcoded `hotspots` array MUST be removed.

**Acceptance Criteria:**
- No file directly imports `hotspots` from a local data file
- HotspotIntelligence and CommandCenter source hotspot data from a hook or render empty/loading state

#### 1.6 Remove hardcoded live feed

The hardcoded `liveFeed` array (filtered slice of `events`) MUST be removed.

**Acceptance Criteria:**
- No file directly imports `liveFeed` from a local data file
- CommandCenter live feed panel sources data from a hook or renders empty state

#### 1.7 Remove AITriage random simulation

The `setTimeout` + `Math.random()` block that simulates a backend response in `AITriage.tsx` MUST be replaced with a service call.

**Acceptance Criteria:**
- `AITriage.tsx` contains no `Math.random()` calls
- The triage action calls `triageService.run()` (which returns `null` until backend is connected)
- When result is `null`, the results panel renders an appropriate empty state

---

### 2. TypeScript Type Definitions

#### 2.1 Create `src/types/index.ts`

A single types file MUST be created at `src/types/index.ts` exporting all domain interfaces.

**Acceptance Criteria:**
- `src/types/index.ts` exists and exports `TrafficEvent`, `DashboardStats`, `EventAnalyticsData`, `HotspotData`, `TriageResponse`, and `TriageRequest`
- All existing type information from `mock-data.ts` (event status, priority, cause, vehicle type enums) is preserved in this file
- `TrafficEvent` interface matches the shape previously defined in `mock-data.ts`

#### 2.2 DashboardStats interface

`DashboardStats` MUST capture the five KPI values previously hardcoded in `kpis`.

**Acceptance Criteria:**
- Interface has fields: `totalEvents`, `activeEvents`, `highPriority`, `roadClosures`, `hotspotAlerts` all typed as `number`

#### 2.3 EventAnalyticsData interface

`EventAnalyticsData` MUST capture all five analytics series.

**Acceptance Criteria:**
- Interface has fields: `causeBreakdown`, `priorityBreakdown`, `hourlyTrend`, `weeklyTrend`, `zoneIntelligence` typed with their respective item interfaces

#### 2.4 HotspotData interface

`HotspotData` MUST match the shape of the hotspot objects previously generated in `mock-data.ts`.

**Acceptance Criteria:**
- Interface has fields: `id`, `zone`, `rank`, `risk`, `cluster`, `trend`, `change`
- `trend` is typed as `"up" | "down"`

#### 2.5 TriageResponse interface

`TriageResponse` MUST match the shape of the result object previously built in `AITriage.tsx`.

**Acceptance Criteria:**
- Interface has fields: `priorityScore`, `priorityLabel`, `closure`, `hotspot`, `eta`, `response`, `signals`
- `priorityLabel` is typed as `"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"`
- `signals` is typed as `TriageSignal[]` where `TriageSignal` has `k: string` and `v: string`

#### 2.6 Update imports in store and components

Files that previously imported `TrafficEvent` from `@/lib/mock-data` MUST be updated to import from `@/types`.

**Acceptance Criteria:**
- `src/lib/store.ts` imports `TrafficEvent` from `@/types`
- `src/components/TrafficMap.tsx` imports `TrafficEvent` from `@/types`
- `src/components/TrafficMapInner.tsx` imports `TrafficEvent` from `@/types`

---

### 3. Service Layer

#### 3.1 Create `src/services/eventsService.ts`

**Acceptance Criteria:**
- File exists at `src/services/eventsService.ts`
- Exports a default object with `getAll(filters?)`, `getLiveFeed()`, and `getById(id)` async functions
- Each function returns the correct empty value (`[]` for lists, `null` for single items) with a `// TODO: Fetch from backend` comment
- Functions accept and are typed against interfaces from `@/types`

#### 3.2 Create `src/services/analyticsService.ts`

**Acceptance Criteria:**
- File exists at `src/services/analyticsService.ts`
- Exports a default object with a `get()` async function returning `Promise<EventAnalyticsData | null>`
- Returns `null` with a `// TODO: Fetch from backend` comment

#### 3.3 Create `src/services/hotspotService.ts`

**Acceptance Criteria:**
- File exists at `src/services/hotspotService.ts`
- Exports a default object with `getAll()` returning `Promise<HotspotData[]>` and `getStats()` returning `Promise<DashboardStats | null>`
- Both return empty/null values with `// TODO: Fetch from backend` comments

#### 3.4 Create `src/services/triageService.ts`

**Acceptance Criteria:**
- File exists at `src/services/triageService.ts`
- Exports a default object with `run(req: TriageRequest)` returning `Promise<TriageResponse | null>`
- Returns `null` with a `// TODO: POST to backend` comment

---

### 4. Custom React Query Hooks

#### 4.1 Create `src/hooks/useEvents.ts`

**Acceptance Criteria:**
- File exists at `src/hooks/useEvents.ts`
- Exports `useEvents(filters?)` using `useQuery` from `@tanstack/react-query`
- Exports `useLiveFeed()` using `useQuery`
- Query keys are `["events", filters]` and `["events", "live-feed"]` respectively

#### 4.2 Create `src/hooks/useDashboardStats.ts`

**Acceptance Criteria:**
- File exists at `src/hooks/useDashboardStats.ts`
- Exports `useDashboardStats()` using `useQuery` with key `["dashboard-stats"]`

#### 4.3 Create `src/hooks/useAnalytics.ts`

**Acceptance Criteria:**
- File exists at `src/hooks/useAnalytics.ts`
- Exports `useAnalytics()` using `useQuery` with key `["analytics"]`

#### 4.4 Create `src/hooks/useHotspots.ts`

**Acceptance Criteria:**
- File exists at `src/hooks/useHotspots.ts`
- Exports `useHotspots()` using `useQuery` with key `["hotspots"]`

#### 4.5 Create `src/hooks/useTriage.ts`

**Acceptance Criteria:**
- File exists at `src/hooks/useTriage.ts`
- Exports `useTriage()` using `useMutation` from `@tanstack/react-query`
- Mutation function accepts a `TriageRequest` and calls `triageService.run()`

---

### 5. Loading States

#### 5.1 CommandCenter KPI bar loading state

**Acceptance Criteria:**
- When `useDashboardStats` is loading, KPI pills render Skeleton placeholders matching their approximate dimensions
- Skeleton uses the existing `src/components/ui/skeleton.tsx` component

#### 5.2 CommandCenter live feed loading state

**Acceptance Criteria:**
- When `useLiveFeed` is loading, the live feed panel renders 3–5 Skeleton rows in place of event cards

#### 5.3 CommandCenter hotspot bar loading state

**Acceptance Criteria:**
- When `useHotspots` is loading, the bottom hotspot bar renders Skeleton placeholders for the 6 zone cells

#### 5.4 EventExplorer loading state

**Acceptance Criteria:**
- When `useEvents` is loading, the card grid renders Skeleton cards (at least 6) matching the EventCard dimensions

#### 5.5 AnalyticsCenter loading state

**Acceptance Criteria:**
- When `useAnalytics` is loading, each chart area renders a Skeleton block matching the chart height

#### 5.6 HotspotIntelligence loading state

**Acceptance Criteria:**
- When `useHotspots` is loading, the risk zone list renders Skeleton rows
- The map renders normally (empty — no loading state needed for the map itself)

---

### 6. Empty States

#### 6.1 CommandCenter live feed empty state

**Acceptance Criteria:**
- When live feed data is `[]` and not loading, the panel shows: "No active incidents"
- The visual container (panel header, border, animations) remains unchanged

#### 6.2 CommandCenter hotspot bar empty state

**Acceptance Criteria:**
- When hotspots data is `[]` and not loading, the bottom bar shows: "No hotspot data available"

#### 6.3 EventExplorer empty state

**Acceptance Criteria:**
- When events data is `[]` and not loading (and no filters are active), the card grid shows: "No events available"
- The existing "No events match your filters" message is preserved for when filters are active but return no results

#### 6.4 AnalyticsCenter empty state

**Acceptance Criteria:**
- When analytics data is `null` and not loading, each chart area shows: "Waiting for analytics data"

#### 6.5 HotspotIntelligence empty state

**Acceptance Criteria:**
- When hotspots data is `[]` and not loading, the risk zone list shows: "No hotspot data available"

#### 6.6 AITriage empty result state

**Acceptance Criteria:**
- When triage result is `null` (API not yet connected), the results panel shows its existing "configure an event and run triage" empty placeholder
- No random mock score is shown

---

### 7. Error States

#### 7.1 CommandCenter error state

**Acceptance Criteria:**
- When any data hook errors (stats, live feed, or hotspots), an error indicator is shown in the relevant panel
- Each error state includes a Retry button that calls the hook's `refetch()` function

#### 7.2 EventExplorer error state

**Acceptance Criteria:**
- When `useEvents` errors, the card grid area shows an error message: "Failed to load events"
- A Retry button is visible and calls `refetch()`

#### 7.3 AnalyticsCenter error state

**Acceptance Criteria:**
- When `useAnalytics` errors, a full-panel error state replaces chart content with: "Failed to load analytics data" and a Retry button

#### 7.4 HotspotIntelligence error state

**Acceptance Criteria:**
- When `useHotspots` errors, the risk zone list shows: "Failed to load hotspot data" and a Retry button

#### 7.5 AITriage error state

**Acceptance Criteria:**
- When `useTriage` mutation errors, the result panel shows: "Triage request failed. Please try again." with a button to dismiss

---

### 8. Preserve UI, Layout, and Behavior

#### 8.1 No visual changes

**Acceptance Criteria:**
- All CSS classes, Tailwind utilities, framer-motion animations, and inline styles remain identical to before
- The sidebar, top bar, routing, and page layouts are unchanged
- Chart types, axis configurations, and color tokens are unchanged

#### 8.2 No routing changes

**Acceptance Criteria:**
- All five routes (`/`, `/explorer`, `/analytics`, `/triage`, `/hotspots`) remain and render their respective page components

#### 8.3 Zustand store unchanged

**Acceptance Criteria:**
- `src/lib/store.ts` retains all existing state (`selectedEventId`, `filterPriority`, `filterCause`, `showRoutes`, `showAlerts`, `showHotspots`, `drawerEvent`) and actions
- Only the `TrafficEvent` import path changes

#### 8.4 EventDrawer behavior preserved

**Acceptance Criteria:**
- Clicking a map marker or live feed item still opens the EventDrawer with the full event detail
- The drawer renders correctly for `TrafficEvent` objects returned by hooks (or stays hidden when data is empty)

---

### 9. Application Stability

#### 9.1 No TypeScript compilation errors

**Acceptance Criteria:**
- `tsc --noEmit` (or `vite build`) completes with zero type errors after all changes

#### 9.2 No runtime crashes on empty data

**Acceptance Criteria:**
- Passing `events={[]}` to `TrafficMap` renders without errors (empty map)
- Passing `data={[]}` to recharts components renders without errors (empty charts)
- Components that previously accessed `events[0]` or similar index access are guarded with null checks or conditional rendering

#### 9.3 React Query provider present

**Acceptance Criteria:**
- The application root (`src/router.tsx` or a root component) wraps the app in a `QueryClientProvider` so all hooks function correctly

## Glossary

- **mock-data.ts**: The file `src/lib/mock-data.ts` that currently contains all hardcoded/fake data
- **stub**: A function that returns an empty/null value as a placeholder for a real API call
- **API-ready state**: Code structured so that replacing a stub with a real `fetch` call is the only change needed
- **React Query**: The `@tanstack/react-query` library used for async data fetching, caching, and state management
- **Skeleton loader**: A placeholder UI element (from `src/components/ui/skeleton.tsx`) that shows the shape of content while data is loading
- **empty state**: UI shown when data has loaded successfully but the result is an empty list or null
- **error state**: UI shown when a data fetch fails, including a Retry button to re-trigger the request
- **QueryClientProvider**: The React context provider required by React Query, must wrap the app root
