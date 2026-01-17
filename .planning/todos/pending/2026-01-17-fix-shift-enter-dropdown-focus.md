---
created: 2026-01-17T15:42
title: Fix Shift+Enter focus when dropdown still open
area: ui
files:
  - src/components/registrations/student-form.tsx
---

## Problem

When user is in the last Priorität field (priority 3 dropdown) and presses Shift+Enter to save and create new student:
- The dropdown remains highlighted/open in the new form
- Focus is not correctly set to "Vorname" (first name) field

Expected behavior: After Shift+Enter, the new form should have focus on Vorname field with all dropdowns closed.

## Solution

1. Blur the active dropdown before triggering form save
2. Ensure focus is explicitly set to Vorname field after form reset
3. May need to add small delay or use `requestAnimationFrame` to ensure dropdown closes before focus shift
