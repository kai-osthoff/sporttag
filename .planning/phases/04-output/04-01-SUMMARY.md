---
phase: 04-output
plan: 01
subsystem: output-infrastructure
tags: [print, csv, export, tailwind-v4, a4]

# Dependency graph
requires:
  - 03-04-allocation-interface  # Uses existing UI components (Button)

provides:
  - Print infrastructure (A4, header repetition, nav hiding)
  - CSV export with German locale support (BOM, semicolons)
  - Reusable ListActions component for print/export buttons

affects:
  - 04-02-student-assignments  # Will use print styles and ListActions
  - 04-03-event-lists         # Will use print styles and ListActions
  - 04-04-statistics          # Will use print styles and ListActions

# Tech
tech-stack:
  added:
    - UTF-8 BOM for CSV exports
    - Tailwind v4 @custom-variant print
  patterns:
    - Print media queries with @page rules
    - German CSV format (semicolons, quote escaping)
    - Reusable client components for export actions

# Files
key-files:
  created:
    - src/lib/csv.ts
    - src/components/output/list-actions.tsx
  modified:
    - src/app/globals.css

# Decisions
decisions:
  - decision: Use Tailwind v4 @custom-variant for print styles
    rationale: Native Tailwind v4 feature, cleaner than custom utilities
    date: 2026-01-17

  - decision: Use semicolon separator and UTF-8 BOM for CSV
    rationale: German Excel default format, ensures umlauts render correctly
    date: 2026-01-17

  - decision: A4 portrait with 1.5cm margins
    rationale: Standard German paper size and reasonable print margins
    date: 2026-01-17

# Metrics
duration: 94s
completed: 2026-01-17
---

# Phase 04 Plan 01: Print & Export Infrastructure Summary

**One-liner:** Print-ready A4 CSS with Tailwind v4 variant, German CSV export (BOM, semicolons), and reusable ListActions component

## What Was Built

Created foundational infrastructure for all output list pages:

1. **Print CSS infrastructure** (globals.css)
   - Tailwind v4 `@custom-variant print` for print-specific styles
   - `@page` rule for A4 portrait with 1.5cm margins
   - Table header repetition across printed pages
   - Navigation and `print:hidden` elements hidden during print
   - Color preservation with `print-color-adjust: exact`

2. **CSV export utility** (src/lib/csv.ts)
   - `downloadCSV()` function with UTF-8 BOM for German Excel compatibility
   - Semicolon separator (German Excel default)
   - Proper quote escaping for special characters
   - Automatic file download with .csv extension

3. **ListActions component** (src/components/output/list-actions.tsx)
   - Reusable "Drucken" and "CSV Export" buttons
   - Hidden during print with `print:hidden` class
   - Integrates with `window.print()` and CSV callback

## Task Breakdown

| Task | Name                      | Commit  | Files                                  |
|------|---------------------------|---------|----------------------------------------|
| 1    | Add print styles          | 8cd2a69 | src/app/globals.css                    |
| 2    | Create CSV export utility | 2100cb5 | src/lib/csv.ts                         |
| 3    | Create ListActions component | 81f9261 | src/components/output/list-actions.tsx |

## Verification Results

✅ All verification checks passed:
- `@custom-variant print` present in globals.css
- `@page` rule present in globals.css
- CSV utility exports `downloadCSV` function
- ListActions component exports and uses `print:hidden`
- Build completed successfully with no errors

## Decisions Made

**1. Tailwind v4 print variant approach**
- Used `@custom-variant print (@media print)` instead of custom utilities
- Leverages native Tailwind v4 feature for cleaner API
- Enables `print:hidden` classes throughout codebase

**2. German CSV format**
- Semicolon separator (German Excel expects this)
- UTF-8 BOM (\uFEFF) ensures umlauts display correctly in Excel
- Proper quote escaping for fields containing semicolons, quotes, or newlines

**3. A4 print layout**
- A4 portrait as standard German paper size
- 1.5cm margins provide reasonable print boundaries
- Table header repetition via `display: table-header-group !important`

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Plans 04-02 through 04-04 (all list pages)

**Provides:**
- Print infrastructure ready to use with `print:hidden` classes
- CSV export utility ready for data export
- ListActions component ready for composition into list pages

**No blockers.**

---

**Duration:** 94 seconds (1.6 minutes)
**Build status:** ✅ Passing
**Test coverage:** N/A (infrastructure setup)
