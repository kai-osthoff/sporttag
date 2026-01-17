# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Native macOS App fuer faire, automatisierte Zuteilung — installierbar mit einem Terminal-Befehl
**Current focus:** Phase 5: Electron Shell

## Current Position

Phase: 5 of 9 (Electron Shell)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-01-17 — Completed 05-01-PLAN.md

Progress: [=============.......] 65% (13 of 20 plans across v1.0+v2.0)

## Performance Metrics

**v1.0 Velocity (reference):**
- Total plans completed: 12
- Average duration: 2.5min per plan
- Total milestone time: ~30min execution

**v2.0 (in progress):**
- Total plans completed: 1
- Estimated plans: 8 (based on phase structure)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 9min | 4.5min |
| 02-registration | 2 | 4min | 2min |
| 03-allocation | 4 | 11min | 2.75min |
| 04-output | 4 | 8.4min | 2.1min |
| 05-electron | 1 | 4min | 4min |
| 06-database | - | - | - |
| 07-build | - | - | - |
| 08-install | - | - | - |
| 09-updates | - | - | - |

## Accumulated Context

### Decisions

See PROJECT.md Key Decisions table for full list.

Recent decisions for v2.0:
- Electron over Tauri (preserves better-sqlite3 + Server Actions)
- curl + xattr over Apple Developer ID (saves $99/year)
- Manual updates over auto-update (simpler, more transparent)
- Port 3456 for embedded server (avoid conflicts with dev servers)
- DB_PATH env var for production/development database path switching

### Pending Todos

1. **Add Zuteilung reset button with confirmation** (ui) — 2026-01-17
2. **Fix Shift+Enter focus when dropdown still open** (ui) — 2026-01-17
3. **Add Einstellungen page for Schulname and Veranstaltungsname** (ui) — 2026-01-17
4. **Datenschutz - Complete data destruction option** (feature) — 2026-01-17

### Blockers/Concerns

(None)

## Session Continuity

Last session: 2026-01-17T15:33Z
Stopped at: Completed 05-01-PLAN.md (Electron Shell Setup)
Resume file: .planning/phases/05-electron-shell/05-02-PLAN.md
