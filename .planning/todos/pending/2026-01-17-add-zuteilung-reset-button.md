---
created: 2026-01-17T15:38
title: Add Zuteilung reset button with confirmation
area: ui
files:
  - src/app/zuteilung/page.tsx
---

## Problem

Currently there is no way to delete/reset the Zuteilung (allocation) and start from scratch. Users need a button to clear the allocation results when they want to re-run the lottery or made a mistake.

The button should have a confirmation warning since this is a destructive action that removes all student assignments.

Screenshot shows the current UI with "Zuteilung offen (0)" and "Zuteilung starten" buttons - needs a reset/delete option.

## Solution

1. Add "Zuteilung löschen" button next to existing buttons
2. Show confirmation dialog (AlertDialog) with warning text
3. Server Action to:
   - Clear all student `assignedEventId` and `assignmentType` fields
   - Delete allocation record from `allocations` table
4. Refresh page after successful reset
