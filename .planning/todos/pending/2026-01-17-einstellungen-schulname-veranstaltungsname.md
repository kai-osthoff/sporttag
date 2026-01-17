---
created: 2026-01-17T20:15
title: Add Einstellungen page for Schulname and Veranstaltungsname
area: ui
files:
  - src/app/settings/page.tsx (new)
  - src/db/schema.ts
---

## Problem

The app currently lacks configurable settings for:
1. **Schulname** — Name of the school using the app (e.g., "Max-Planck-Gymnasium")
2. **Veranstaltungsname** — Name of the event (e.g., "Sporttag", "Bundesjugendspiele", "Schwimmfest")

These values are needed for:
- Print headers on SMV-Brett lists
- CSV exports
- General branding of the output

Currently hard-coded or missing, which limits flexibility for different schools.

## Solution

Add an "Einstellungen" button/page accessible from the main navigation with:
- Input field for Schulname
- Input field for Veranstaltungsname (default: "Sporttag")
- Persist settings in SQLite (new `settings` table with key-value pairs)
- Use in print/export outputs

Consider: Could combine with Datenschutz todo into a single Settings page with tabs.
