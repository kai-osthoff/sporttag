---
phase: 04-output
plan: 02
subsystem: output-lists
tags: [per-event, participant-lists, print, csv, export]

# Dependency graph
requires:
  - 04-01-print-export  # Uses ListActions component and CSV utility

provides:
  - Per-event participant list pages
  - Dynamic route for event-specific lists
  - Print-ready participant tables
  - CSV export for participant data

affects:
  - 04-04-statistics  # May reference per-event patterns

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dynamic route params with Promise<> async params
    - Server component data fetching for participant lists
    - German alphabetical sorting (Vorname first, then Nachname)
    - Print-optimized table layouts

key-files:
  created:
    - src/app/output/per-event/[eventId]/page.tsx
    - src/components/output/per-event-list.tsx
  modified: []

decisions:
  - decision: Sort participants by Vorname, then Nachname
    rationale: Per CONTEXT.md specification for German name conventions
    date: 2026-01-17

  - decision: Server-side data fetching for participant lists
    rationale: Clean separation, participants fetched once and passed to client component
    date: 2026-01-17

  - decision: Three-column table (Vorname, Nachname, Klasse)
    rationale: Essential information for SMV-Brett posting, per CONTEXT.md spec
    date: 2026-01-17

# Metrics
duration: 222s
completed: 2026-01-17
---

# Phase 04 Plan 02: Per-Event Participant Lists Summary

**Per-event participant list pages with dynamic routes, showing students by Vorname/Nachname/Klasse, print-ready for SMV-Brett posting**

## Performance

- **Duration:** 222 seconds (3.7 minutes)
- **Started:** 2026-01-17T12:59:21Z
- **Completed:** 2026-01-17T13:03:03Z
- **Tasks:** 2 (Note: Task 1 already existed from prior execution)
- **Files modified:** 2

## Accomplishments

- Dynamic per-event participant list route at /output/per-event/[eventId]
- Participant table sorted by Vorname (first name), then Nachname (last name)
- Print-ready layout with A4 styling, hidden buttons, and participant count header
- CSV export with German headers (Vorname, Nachname, Klasse)

## Task Breakdown

Note: Task 1 (output dashboard page) was already created by a prior execution (commit 5f83f08 from plan 04-03). This plan execution focused on Task 2.

| Task | Name                              | Commit  | Files                                          |
|------|-----------------------------------|---------|------------------------------------------------|
| 1    | Create output dashboard page      | 5f83f08 | src/app/output/page.tsx (existing)             |
| 2    | Create per-event list page        | ee573bd | src/app/output/per-event/[eventId]/page.tsx, src/components/output/per-event-list.tsx |

## Task Commits

1. **Task 2: Create per-event list page and component** - `ee573bd` (feat)

## Files Created/Modified

**Created:**
- `src/app/output/per-event/[eventId]/page.tsx` - Server component fetching event and participants
- `src/components/output/per-event-list.tsx` - Client component displaying participant table with print/export

**Existing (from prior execution):**
- `src/app/output/page.tsx` - Output dashboard with links to all list types (created in commit 5f83f08)

## Decisions Made

**1. German alphabetical sorting**
- Primary sort by Vorname (first name), secondary by Nachname (last name)
- Follows CONTEXT.md specification for German name conventions
- Implemented with Drizzle orderBy on server side

**2. Server/client composition pattern**
- Server component fetches event details and participants
- Client component handles display, print, and export
- Clean separation of concerns

**3. Three-column participant table**
- Columns: Vorname, Nachname, Klasse
- Essential information for SMV-Brett posting
- Per CONTEXT.md specification

## Deviations from Plan

None - plan executed as written for Task 2.

Note: Task 1 (output dashboard) was already created in a prior execution but was not tracked in plan 04-02's execution. The dashboard exists and is functional with links to per-event, per-class, and Sonderliste pages.

## Issues Encountered

None

## Next Phase Readiness

**Ready for:** Remaining Phase 4 plans

**Provides:**
- Per-event list pattern for event-specific participant views
- Dynamic route implementation with async params
- Print-ready table layout for SMV-Brett posting
- CSV export for participant data

**Note:** Plan 04-03 (per-class lists and Sonderliste) was already executed prior to this plan but without a committed SUMMARY. The 04-03-SUMMARY.md file exists uncommitted in the working directory.

**No blockers.**

---

**Duration:** 222 seconds (3.7 minutes)
**Build status:** ✅ Passing
**Test coverage:** N/A (UI pages)
