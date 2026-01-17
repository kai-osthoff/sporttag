# Phase 3: Allocation - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

System can fairly assign students to events based on priorities and capacity. Teachers can trigger allocation, manually reassign students, and handle unassigned students via Sonderliste. Statistics showing allocation success (1st/2nd/3rd choice percentages) are in scope.

</domain>

<decisions>
## Implementation Decisions

### Losverfahren behavior
- Priority-weighted rounds: Process all 1st choices first (random within), then 2nd choices, then 3rd
- When a priority choice is full, automatically move to next priority (only Sonderliste if all 3 are full)
- Reproducible with seed: Same seed = same result, useful for explaining decisions or re-running
- Re-runnable, keeps manual edits: Re-run only affects unassigned students, preserves manual overrides

### Manual reassignment
- Click student → modal: Click student name opens modal showing all events with capacity
- Allow reassignment to full events with warning: Show warning but allow override for edge cases
- Modal shows student's original priorities: Mark events as '1. Wahl', '2. Wahl', '3. Wahl' or unmarked
- Track manual assignments: Show indicator that assignment was manually overridden (for auditing)

### Sonderliste handling
- Separate page/tab: Dedicated '/sonderliste' page with clear separation
- Same assignment modal as reassignment: Click student → consistent modal UX
- Show reasons why student couldn't be assigned: Display which priorities were full (e.g., 'Fußball (voll), Basketball (voll)')
- Show available events at top of page: Display events with remaining capacity for quick reference

### Claude's Discretion
- Exact algorithm implementation details
- Seed generation/storage mechanism
- Statistics display format and placement
- Loading states during allocation

</decisions>

<specifics>
## Specific Ideas

- Allocation should feel deterministic and explainable - teachers may need to justify to parents why a student got their 2nd choice
- "Re-runnable, keeps manual edits" is key for when late registrations come in after initial allocation
- Sonderliste is critical for the SMV-Brett posting workflow - needs to be clearly distinguishable from regular assignments

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-allocation*
*Context gathered: 2026-01-17*
