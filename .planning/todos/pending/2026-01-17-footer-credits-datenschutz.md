---
created: 2026-01-17T17:30
title: Footer with Credits and Datenschutz info
area: ui
files:
  - src/app/layout.tsx
---

## Problem

Footer needs additional information:
1. Credits section (Frankie the dog + other contributors)
2. Datenschutz information explaining that all data is stored locally only

## Solution

Extend footer with:
- Credits: "Mit Hilfe von Frankie 🐕 und [other names]"
- Datenschutz notice: "Alle Daten werden nur lokal auf diesem Computer gespeichert."
- Maybe a link/modal for detailed Datenschutz info
