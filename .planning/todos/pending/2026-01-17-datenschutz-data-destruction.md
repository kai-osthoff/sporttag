---
created: 2026-01-17T17:30
title: Datenschutz - Complete data destruction option
area: feature
files:
  - src/app/settings/page.tsx (new)
  - src/lib/actions/data.ts (new)
---

## Problem

For student data protection (Datenschutz), users need ability to:
1. Start fresh - destroy all data to begin new school year
2. Clean up when done - remove all student data after Sporttag is over

This is HIGH PRIORITY for schools handling student personal data. German data protection (DSGVO) requires ability to delete data when no longer needed.

## Solution

Add a Settings/Datenschutz page with:
- "Alle Daten loeschen" button with confirmation dialog
- Clear warning about irreversibility
- Option to export data before deletion (CSV backup)
- Deletes: all students, all allocations, keeps events (configurable)

Consider: separate options for "Schueler loeschen" vs "Alles loeschen"
