---
phase: 03-allocation
plan: 01
subsystem: database, algorithm
tags: [drizzle, sqlite, prng, fisher-yates, allocation, lottery]

# Dependency graph
requires:
  - phase: 02-registration
    provides: students table with priority columns
provides:
  - Extended students table with assignment tracking (assignedEventId, assignmentType, assignedAt)
  - Allocations table for tracking allocation runs (seed, status, stats)
  - Pure allocation algorithm with seeded randomness
  - Dialog and Tabs UI components
affects: [03-02 allocation actions, 03-03 allocation UI]

# Tech tracking
tech-stack:
  added: [@radix-ui/react-dialog, @radix-ui/react-tabs]
  patterns: [pure-function-algorithm, seeded-prng, fisher-yates-shuffle]

key-files:
  created:
    - src/lib/allocation/types.ts
    - src/lib/allocation/random.ts
    - src/lib/allocation/algorithm.ts
    - src/components/ui/dialog.tsx
    - src/components/ui/tabs.tsx
  modified:
    - src/db/schema.ts

key-decisions:
  - "Mulberry32 PRNG for seeded randomness (no external dependency)"
  - "Fisher-Yates shuffle for unbiased array permutation"
  - "Pure function algorithm for testability and reproducibility"

patterns-established:
  - "Pure allocation function: same input = same output"
  - "Priority-weighted round-robin: 1st choices first, then 2nd, then 3rd"
  - "Manual assignment preservation via preserveManual flag"

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 03 Plan 01: Allocation Domain Model Summary

**Pure allocation algorithm with Mulberry32 PRNG, extended schema for assignment tracking, and Dialog/Tabs components installed**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-17T11:59:00Z
- **Completed:** 2026-01-17T12:03:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Extended students table with assignedEventId, assignmentType, assignedAt columns for tracking allocations
- Created allocations table for recording allocation runs with seed, status, and stats
- Implemented pure allocation algorithm with seeded Mulberry32 PRNG and Fisher-Yates shuffle
- Algorithm processes priorities in correct order (1st, 2nd, 3rd) with fairness via shuffling
- Installed Dialog and Tabs shadcn components for allocation UI

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend database schema for allocation tracking** - `b8de373` (feat)
2. **Task 2: Create pure allocation algorithm with seeded randomness** - `c744ef2` (feat)
3. **Task 3: Install Dialog and Tabs UI components** - `6603308` (feat)

## Files Created/Modified

- `src/db/schema.ts` - Added allocation tracking columns to students, new allocations table
- `src/lib/allocation/types.ts` - TypeScript interfaces for allocation system
- `src/lib/allocation/random.ts` - Mulberry32 PRNG, hashSeed, Fisher-Yates shuffle
- `src/lib/allocation/algorithm.ts` - Pure allocate() function with priority-weighted algorithm
- `src/components/ui/dialog.tsx` - shadcn Dialog for manual reassignment modal
- `src/components/ui/tabs.tsx` - shadcn Tabs for allocation page navigation

## Decisions Made

- **Mulberry32 inline:** Used inline Mulberry32 PRNG instead of seedrandom npm package (8 lines of code, no external dependency)
- **Fisher-Yates shuffle:** Standard O(n) unbiased permutation algorithm with seeded RNG
- **Pure function design:** Algorithm has no side effects, same input always produces same output
- **Map for assignments:** Using Map<studentId, eventId | null> for efficient lookups

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Schema ready for allocation persistence via Drizzle transactions
- Algorithm ready to be called from server actions
- UI components ready for allocation interface construction
- All TypeScript types exported and ready for use

---
*Phase: 03-allocation*
*Completed: 2026-01-17*
