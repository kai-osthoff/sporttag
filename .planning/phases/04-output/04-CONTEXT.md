# Phase 4: Output - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate and print participant lists for teachers to post at the SMV-Brett. Three list types: per-event (who attends each event), per-class (where each student goes), and Sonderliste (unassigned students). All lists exportable as CSV and optimized for A4 printing.

</domain>

<decisions>
## Implementation Decisions

### List layout & formatting
- Per-event list columns: Vorname, Nachname, Klasse
- Per-class list columns: Vorname, Nachname, assigned Event
- Full header on lists: Title, participant count, date generated
- Comfortable density: medium font, readable spacing — balance of density and readability

### Sorting & grouping
- Sort names alphabetically by Vorname (first name), then Nachname
- Per-class list: flat alphabetical list with event in column (no grouping by event)
- Sonderliste: show Name + Klasse + their 3 choices + reason unassigned (e.g., "all choices full")

### Print styling
- Portrait orientation (A4 hochkant) — fits SMV-Brett
- Header repeats on every printed page for context
- Page numbers at bottom center: "Seite 1 von 3"
- Avoid orphan rows — keep at least 3-4 names together on page breaks

### Claude's Discretion
- Class dropdown organization (flat vs grouped by grade)
- Exact font sizes and spacing values
- CSV column order and header naming
- Statistics dashboard layout and charts

</decisions>

<specifics>
## Specific Ideas

- Lists are for posting at the SMV-Brett — physical school board where students check their assignments
- Teachers need to quickly print multiple lists and post them
- Print quality matters more than screen UI polish

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-output*
*Context gathered: 2026-01-17*
