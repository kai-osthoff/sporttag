---
phase: 03-allocation
plan: 04
subsystem: ui, api
tags: [sonderliste, statistics, modal-integration, server-client-composition]

# Dependency graph
requires:
  - phase: 03-02
    provides: allocation actions, StudentAssignmentList component
  - phase: 03-03
    provides: AssignmentModal component, assignStudent action
provides:
  - Sonderliste page showing unassigned students with reasons
  - AllocationStats component with visual percentage bars
  - Complete allocation dashboard with modal integration
affects: [04-output reports, export functionality]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-client-composition, api-route-for-client-data, modal-state-lifting]

key-files:
  created:
    - src/app/allocation/sonderliste/page.tsx
    - src/app/api/allocation/sonderliste/route.ts
    - src/components/allocation/allocation-stats.tsx
    - src/components/allocation/allocation-dashboard.tsx
  modified:
    - src/app/allocation/page.tsx
    - src/components/allocation/student-assignment-list.tsx

key-decisions:
  - "API route for Sonderliste data (client component needs server data)"
  - "Server/client composition pattern: server page fetches, client wrapper manages state"
  - "Visual percentage bars for stats (simple divs with bg-color, no chart library)"

patterns-established:
  - "API route pattern for client components needing database data"
  - "AllocationDashboard as client wrapper around server-fetched data"
  - "AssignedStudent interface extended with priority IDs for modal reuse"

# Metrics
duration: 5min
completed: 2026-01-17
---

# Phase 03 Plan 04: Allocation Interface Completion Summary

**Sonderliste page for unassigned students with reasons, statistics component with visual bars, and full modal integration into allocation dashboard**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-17T12:08:26Z
- **Completed:** 2026-01-17T12:13:22Z
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- Created Sonderliste page showing unassigned students with why each couldn't be placed
- Added API route to fetch unassigned students with priority event names and capacities
- Built AllocationStats component displaying 1st/2nd/3rd/Sonderliste percentages with visual bars
- Created AllocationDashboard client wrapper for modal state management
- Updated StudentAssignmentList with onClick handler for row clicks
- Refactored allocation page to use server/client composition pattern
- Integrated Sonderliste count badge in header link

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Sonderliste page with assignment reasons** - `df59087` (feat)
2. **Task 2: Create allocation statistics component** - `a9ed4e2` (feat)
3. **Task 3: Integrate modal and tabs into allocation page** - `08c23d3` (feat)

## Files Created/Modified

- `src/app/allocation/sonderliste/page.tsx` - Client page showing unassigned students with full priority reasons
- `src/app/api/allocation/sonderliste/route.ts` - API route for fetching sonderliste data
- `src/components/allocation/allocation-stats.tsx` - Statistics display with percentage bars
- `src/components/allocation/allocation-dashboard.tsx` - Client wrapper managing modal state
- `src/app/allocation/page.tsx` - Refactored to use AllocationDashboard
- `src/components/allocation/student-assignment-list.tsx` - Added onClick handler and priority fields

## Decisions Made

- **API route for client data:** Sonderliste page is client component (needs modal state), so data fetched via API route rather than RSC
- **Server/client composition:** Allocation page stays as server component for data fetching, passes to client wrapper for interactivity
- **Simple visual bars:** Used div with percentage width instead of chart library (teachers need quick understanding, not complex charts)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Requirements Satisfied

All ALLOC requirements from CONTEXT.md are now satisfied:

- **ALLOC-01:** Seeded allocation - complete (Plan 01-02)
- **ALLOC-02:** Fair random lottery - complete (Plan 01)
- **ALLOC-03:** Preserve manual assignments - complete (Plan 01-02)
- **ALLOC-04:** Sonderliste for unassigned - complete (this plan)
- **ALLOC-05:** Re-run allocation - complete (Plan 02)
- **ALLOC-06:** Manual reassignment UI - complete (Plan 03 + this plan)
- **ALLOC-07:** Statistics display - complete (this plan)

## Next Phase Readiness

- Allocation workflow is complete end-to-end
- Students can be registered, allocated, reassigned, and viewed on Sonderliste
- Statistics provide fairness transparency
- Ready for Phase 4 (Output) - export and reporting functionality

---
*Phase: 03-allocation*
*Completed: 2026-01-17*
