---
phase: 04-output
plan: 03
subsystem: output-lists
tags: [per-class, sonderliste, print, csv, export]

# Dependency graph
requires:
  - 04-01-print-export  # Uses ListActions component and CSV utility

provides:
  - Per-class list page with grouped class selector
  - Enhanced Sonderliste with 7 columns (Name, Klasse, 3 choices, reason)
  - Print-ready output for both lists
  - CSV export for both lists

affects:
  - 04-04-statistics  # May want similar list patterns

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Grouped select dropdowns by grade
    - Reason calculation for unassigned students
    - German alphabetical sorting (Vorname first, then Nachname)

key-files:
  created:
    - src/app/output/per-class/page.tsx
    - src/components/output/per-class-list.tsx
    - src/app/output/sonderliste/page.tsx
    - src/components/output/sonderliste-print.tsx
  modified: []

decisions:
  - decision: Group class selector by Klassenstufe (grade)
    rationale: Easier navigation with many classes, natural organization
    date: 2026-01-17

  - decision: Calculate reason for unassignment server-side
    rationale: Requires event capacity data, cleaner to compute once on server
    date: 2026-01-17

  - decision: Sort by Vorname first, then Nachname
    rationale: Per CONTEXT.md specification for German names
    date: 2026-01-17

# Metrics
duration: 124s
completed: 2026-01-17
---

# Phase 04 Plan 03: Per-Class Lists & Enhanced Sonderliste Summary

**Per-class participant lists with grouped class selector and enhanced Sonderliste showing students' choices with assignment failure reasons**

## Performance

- **Duration:** 124 seconds (2.1 minutes)
- **Started:** 2026-01-17T12:59:21Z
- **Completed:** 2026-01-17T13:01:25Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Per-class list page with grade-grouped class selector showing student assignments
- Enhanced Sonderliste with 7 columns: Vorname, Nachname, Klasse, 1./2./3. Wahl, Grund
- Reason calculation for unassigned students (Alle Wahlen voll, specific events voll, Nicht zugewiesen)
- Both lists print-ready with A4 styling and CSV export functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Create per-class list page and component** - `5f83f08` (feat)
2. **Task 2: Create enhanced Sonderliste output page** - `163d658` (feat)

## Files Created/Modified

**Created:**
- `src/app/output/per-class/page.tsx` - Server component fetching students with assigned events
- `src/components/output/per-class-list.tsx` - Client component with class selector and student table
- `src/app/output/sonderliste/page.tsx` - Server component calculating unassignment reasons
- `src/components/output/sonderliste-print.tsx` - Client component for print-ready Sonderliste

## Decisions Made

**1. Grouped class selector by Klassenstufe**
- Classes grouped by extracted grade number (5a/5b under "Klassenstufe 5")
- SelectGroup with SelectLabel for clean organization
- Improves navigation when many classes exist

**2. Server-side reason calculation**
- Determines why student wasn't assigned (all choices full, specific events full, etc.)
- Requires event capacity data, computed once on server
- Clean separation: server fetches/computes, client displays

**3. German alphabetical sorting**
- Primary sort by Vorname (first name), secondary by Nachname (last name)
- Follows CONTEXT.md specification for German name conventions
- Uses locale-aware comparison with 'de' locale

**4. Separate output Sonderliste from allocation Sonderliste**
- Allocation version has assignment modal for manual intervention
- Output version is read-only with print/export focus
- Different use cases warrant separate pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

**Ready for:** Plan 04-04 (Statistics Dashboard)

**Provides:**
- Per-class list pattern for future list pages
- Reason calculation logic for unassigned students
- Grouped selector pattern for categorized options

**No blockers.**

---

**Duration:** 124 seconds (2.1 minutes)
**Build status:** ✅ Passing
**Test coverage:** N/A (UI pages)
