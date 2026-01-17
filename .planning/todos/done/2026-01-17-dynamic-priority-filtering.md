---
created: 2026-01-17T14:38
title: Dynamic priority filtering in registration form
area: ui
files:
  - src/app/registrations/new/page.tsx
---

## Problem

Currently, the priority selects allow the same event to be selected multiple times. The validation catches this after selection ("Alle Prioritaeten muessen unterschiedlich sein"), but the UX is suboptimal for rapid data entry.

Teachers transcribing paper forms should not be able to select an already-chosen event in subsequent priority dropdowns. For example:
- If "Tauchen" is selected as 1. Prioritaet, it should be disabled/hidden in 2. and 3. Prioritaet dropdowns
- If "Fussball" is then selected as 2. Prioritaet, it should be disabled in 3. Prioritaet

This would speed up data migration from paper forms and prevent errors before they happen.

## Solution

Modify the registration form to filter dropdown options dynamically:
- Track selected values in state
- Filter or disable already-selected events from subsequent priority selects
- Consider using react-hook-form's watch() to track selections reactively
