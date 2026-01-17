---
created: 2026-01-17T14:57
title: Rename Sonderliste to friendlier term
area: ui
files:
  - src/app/allocation/page.tsx
  - src/app/allocation/sonderliste/page.tsx
  - src/app/output/sonderliste/page.tsx
  - src/components/allocation/assignment-modal.tsx
---

## Problem

"Sonderliste" sounds bureaucratic and potentially stigmatizing in a school environment. Students on this list are simply those without a spot in their chosen events - they shouldn't feel singled out negatively.

Suggested alternative: "Zuteilung offen" (assignment pending/open)

This is more neutral and implies the situation is temporary and will be resolved.

## Solution

Search and replace across UI text:
- "Sonderliste" → "Zuteilung offen" or similar
- Consider also updating route names for consistency (breaking change)
- Or keep routes as `/sonderliste` but change display text only (simpler)
