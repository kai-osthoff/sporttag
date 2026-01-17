# Phase 4: Output - Research

**Researched:** 2026-01-17
**Domain:** Print-optimized reports, CSV export, statistics dashboard
**Confidence:** HIGH

## Summary

This research addresses generating participant lists for the SMV-Brett (school bulletin board). The phase requires three list types (per-event, per-class, Sonderliste), CSV export functionality, and print-optimized A4 layouts with repeating headers and page numbers.

The standard approach uses CSS `@media print` with Tailwind's `print:` variant (configured via `@custom-variant` in Tailwind v4), semantic HTML table structure with `<thead>`/`<tbody>` for header repetition, and client-side Blob-based CSV generation. No additional libraries are needed - the existing stack (Next.js, Tailwind v4, Radix Select) handles all requirements.

**Primary recommendation:** Use native CSS print media queries with proper table semantics for header repetition; use client-side Blob API for CSV export; leverage existing allocation query patterns for data fetching.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 | Print styles via `print:` variant | Built-in print support, CSS-in-JS integration |
| Next.js | 16.1.3 | Server components for data fetching | Existing pattern in codebase |
| Radix Select | 2.2.6 | Class dropdown for per-class list | Already used, supports grouping |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.562.0 | Download/print icons | Button icons |

### No Additional Libraries Needed
| Problem | Library | Why Not Needed |
|---------|---------|----------------|
| PDF generation | react-pdf, jsPDF | Browser print-to-PDF sufficient for SMV-Brett use case |
| Print handling | react-to-print | Native `window.print()` + CSS sufficient |
| CSV export | papaparse, export-to-csv | Blob API handles simple flat data |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── output/
│       ├── page.tsx              # Output dashboard with list links
│       ├── per-event/
│       │   └── [eventId]/
│       │       └── page.tsx      # Per-event participant list
│       ├── per-class/
│       │   └── page.tsx          # Per-class list (with class selector)
│       └── sonderliste/
│           └── page.tsx          # Enhanced Sonderliste with print/export
├── components/
│   └── output/
│       ├── printable-list.tsx    # Shared print container with header/footer
│       ├── list-header.tsx       # Reusable header: title, count, date
│       └── csv-export-button.tsx # Reusable CSV download button
└── lib/
    └── csv.ts                    # CSV generation utility
```

### Pattern 1: Print Container Component
**What:** Wrapper component that handles print styling, header repetition, and page structure
**When to use:** All printable list pages
**Example:**
```typescript
// Source: CSS print best practices from MDN and web research
interface PrintableListProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  count: number
}

export function PrintableList({ title, subtitle, children, count }: PrintableListProps) {
  const generatedDate = new Date().toLocaleDateString('de-DE')

  return (
    <div className="print:p-0">
      {/* Header - repeats on each page via table-header-group */}
      <div className="mb-4 print:mb-2">
        <h1 className="text-2xl font-bold print:text-lg">{title}</h1>
        {subtitle && <p className="text-muted-foreground print:text-sm">{subtitle}</p>}
        <p className="text-sm text-muted-foreground">
          {count} Teilnehmer | Erstellt: {generatedDate}
        </p>
      </div>

      {children}
    </div>
  )
}
```

### Pattern 2: CSV Export via Blob
**What:** Client-side CSV generation and download using Blob API
**When to use:** All CSV export buttons
**Example:**
```typescript
// Source: GeeksforGeeks, MDN Blob documentation
export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  // Get headers from first row
  const headers = Object.keys(data[0])

  // Build CSV content with BOM for Excel UTF-8 support
  const BOM = '\uFEFF'
  const csvRows = [
    headers.join(';'),  // German Excel uses semicolon
    ...data.map(row =>
      headers.map(header => {
        const value = String(row[header] ?? '')
        // Escape quotes and wrap if contains special chars
        if (value.includes('"') || value.includes(';') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(';')
    )
  ]

  const csvContent = BOM + csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
```

### Pattern 3: Server Data Fetching for Lists
**What:** Use existing server component pattern for data queries
**When to use:** All list pages
**Example:**
```typescript
// Source: Existing codebase pattern from allocation/page.tsx
export default async function PerEventPage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId)

  // Query participants for this event
  const participants = await db
    .select({
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
    })
    .from(students)
    .where(eq(students.assignedEventId, eventId))
    .orderBy(students.firstName, students.lastName)  // Vorname first per CONTEXT.md

  const event = await db
    .select({ name: events.name })
    .from(events)
    .where(eq(events.id, eventId))
    .get()

  return <PerEventList event={event} participants={participants} />
}
```

### Anti-Patterns to Avoid
- **Don't use `react-to-print` library:** Adds complexity for simple print needs; native CSS + `window.print()` sufficient
- **Don't generate PDF server-side:** Browser print-to-PDF handles SMV-Brett use case; server PDF adds complexity
- **Don't use `display: none` for print-hidden elements:** Use `print:hidden` Tailwind class instead
- **Don't forget `<thead>` / `<tbody>` structure:** Required for header repetition across pages

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Print header repetition | Custom JS pagination | HTML `<thead>` + CSS `display: table-header-group` | Browser handles pagination automatically |
| Page numbers | JavaScript counter | CSS `@page` with counters | Native print feature, works across browsers |
| CSV escaping | String concatenation | Proper escape function with BOM | Handles quotes, newlines, UTF-8 for German umlauts |
| Select with groups | Custom dropdown | Radix Select with `SelectGroup` | Already in codebase, handles accessibility |
| Page break control | Custom logic | CSS `break-inside: avoid` | Browser handles fragmentation |

**Key insight:** Browser print engines are sophisticated. Let them handle pagination, header repetition, and page breaks via semantic HTML + CSS rather than building JavaScript solutions.

## Common Pitfalls

### Pitfall 1: Missing UTF-8 BOM in CSV
**What goes wrong:** German umlauts (a, o, u) display as garbled characters in Excel
**Why it happens:** Excel defaults to ANSI encoding without BOM marker
**How to avoid:** Prepend `\uFEFF` (UTF-8 BOM) to CSV content
**Warning signs:** Users report "weird characters" in exported files

### Pitfall 2: Table Headers Not Repeating
**What goes wrong:** Headers only appear on first page when printing multi-page lists
**Why it happens:** Missing `<thead>` element or CSS overriding `display: table-header-group`
**How to avoid:** Use proper `<thead>`/`<tbody>` structure; add explicit CSS: `@media print { thead { display: table-header-group !important; } }`
**Warning signs:** Long lists print without context on subsequent pages

### Pitfall 3: Rows Split Across Page Breaks
**What goes wrong:** Single student name split between two pages
**Why it happens:** No `break-inside: avoid` on table rows
**How to avoid:** Add `@media print { tr { break-inside: avoid; page-break-inside: avoid; } }` (include legacy property for compatibility)
**Warning signs:** Partial rows appearing at page boundaries

### Pitfall 4: Print Button Not Working on Mobile
**What goes wrong:** Print button does nothing in mobile WebView
**Why it happens:** WebViews (Facebook, Slack in-app browsers) don't support `window.print()`
**How to avoid:** Accept this limitation - SMV-Brett posting is a desktop task anyway; optionally show message for mobile users
**Warning signs:** User reports "nothing happens" on mobile

### Pitfall 5: CSV Injection Vulnerability
**What goes wrong:** Malicious formulas in student names could execute in Excel
**Why it happens:** CSV values starting with `=`, `+`, `-`, `@` are interpreted as formulas
**How to avoid:** For this internal school app, risk is low, but can prefix with `'` if values start with formula chars
**Warning signs:** Unlikely in this context, but good to know

### Pitfall 6: Tailwind Print Variant Not Working in v4
**What goes wrong:** `print:` classes have no effect
**Why it happens:** Tailwind v4 requires explicit `@custom-variant` declaration
**How to avoid:** Add `@custom-variant print (@media print);` to globals.css
**Warning signs:** Print preview shows no style changes

## Code Examples

Verified patterns from official sources:

### Tailwind v4 Print Variant Setup
```css
/* Source: Tailwind v4 documentation, GitHub discussions */
/* Add to src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant print (@media print);

/* Print-specific global styles */
@media print {
  @page {
    size: A4 portrait;
    margin: 1.5cm;
  }

  thead {
    display: table-header-group !important;
  }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Hide non-essential elements */
  nav, .no-print {
    display: none !important;
  }
}
```

### Print-Optimized Table Component
```typescript
// Source: CSS-Tricks, MDN print documentation
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PrintableTableProps {
  headers: string[]
  rows: string[][]
}

export function PrintableTable({ headers, rows }: PrintableTableProps) {
  return (
    <Table className="print:text-sm">
      <TableHeader>
        <TableRow className="print:bg-gray-100">
          {headers.map((header, i) => (
            <TableHead key={i} className="print:font-bold print:text-black">
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j} className="print:py-1">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Class Dropdown with Grade Grouping
```typescript
// Source: Radix Select documentation, existing codebase pattern
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ClassSelectorProps {
  classes: string[]  // e.g., ['5a', '5b', '6a', '6b', '7a']
  value: string
  onChange: (value: string) => void
}

export function ClassSelector({ classes, value, onChange }: ClassSelectorProps) {
  // Group classes by grade number
  const grouped = classes.reduce((acc, cls) => {
    const grade = cls.match(/^(\d+)/)?.[1] || 'Andere'
    if (!acc[grade]) acc[grade] = []
    acc[grade].push(cls)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Klasse wahlen" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([grade, classList]) => (
            <SelectGroup key={grade}>
              <SelectLabel>Klassenstufe {grade}</SelectLabel>
              {classList.sort().map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  )
}
```

### Sonderliste with Reason Column
```typescript
// Source: CONTEXT.md requirement, existing sonderliste/page.tsx pattern
interface SonderlisteStudent {
  firstName: string
  lastName: string
  class: string
  priority1Name: string
  priority2Name: string
  priority3Name: string
  reason: string  // e.g., "Alle Wahlen voll"
}

// Query to get Sonderliste with reasons (extend existing API route)
const sonderlisteWithReasons = unassignedStudents.map(student => {
  const fullPriorities = [
    student.priority1Name,
    student.priority2Name,
    student.priority3Name,
  ].filter(name => {
    const event = eventCapacityMap.get(name)
    return event && event.assignedCount >= event.capacity
  })

  return {
    ...student,
    reason: fullPriorities.length === 3
      ? 'Alle Wahlen voll'
      : fullPriorities.length > 0
        ? `${fullPriorities.join(', ')} voll`
        : 'Unbekannt'
  }
})
```

### Print and Export Button Row
```typescript
// Source: Common UI pattern
'use client'

import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

interface ListActionsProps {
  onExportCSV: () => void
  csvFilename: string
}

export function ListActions({ onExportCSV }: ListActionsProps) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Drucken
      </Button>
      <Button variant="outline" onClick={onExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        CSV Export
      </Button>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `page-break-*` properties | `break-*` properties | CSS3 Fragmentation | Use both for compatibility |
| Separate print.css file | `@media print` in main CSS | Tailwind adoption | Simpler maintenance |
| Custom PDF generation | Browser print-to-PDF | Chrome improvements | No library needed |
| Server-side CSV | Client-side Blob | Modern browser support | Simpler, no server load |

**Deprecated/outdated:**
- `page-break-before/after/inside`: Still works, but `break-*` is the modern replacement. Use both for maximum compatibility.
- External print stylesheet: Unnecessary with Tailwind's `print:` variant

## Open Questions

Things that couldn't be fully resolved:

1. **Page number footer position**
   - What we know: CSS `@page` with margin boxes can position page numbers, but browser support is limited
   - What's unclear: Whether Chrome supports `@bottom-center` margin box
   - Recommendation: Test in Chrome; if not supported, page numbers may not be possible without a PDF library. Accept limitation for MVP.

2. **Orphan row count**
   - What we know: CSS `widows` and `orphans` work for text, but table-specific equivalents are not standardized
   - What's unclear: Exact browser behavior for `break-inside: avoid` with tables
   - Recommendation: Use `break-inside: avoid` on `<tr>` elements; accept that some edge cases may occur

## Sources

### Primary (HIGH confidence)
- [MDN Printing CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) - @media print, @page rule
- [MDN page-break-inside](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/page-break-inside) - Fragmentation properties
- [GeeksforGeeks CSV Download](https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/) - Blob API pattern
- [Tailwind CSS v4 @custom-variant](https://github.com/tailwindlabs/tailwindcss/discussions/15744) - Print variant configuration

### Secondary (MEDIUM confidence)
- [CSS-Tricks Print Stylesheet](https://www.sitepoint.com/css-printer-friendly-pages/) - Best practices verified with MDN
- [Jacob Paris Tailwind Print](https://www.jacobparis.com/content/css-print-styles) - Tailwind print configuration
- [Terminally Incoherent Table Headers](https://www.terminally-incoherent.com/blog/2009/10/12/repeating-html-table-headers-on-each-printed-page/) - thead repetition pattern

### Tertiary (LOW confidence)
- Browser-specific page number support varies - test in target environment

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, verified against codebase
- Architecture: HIGH - Follows existing codebase patterns
- Print CSS: MEDIUM - Browser support varies, but core techniques well-documented
- CSV export: HIGH - Blob API well-supported, pattern verified
- Page numbers: LOW - Browser support for CSS counters in print is inconsistent

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (stable domain, CSS print support changes slowly)
