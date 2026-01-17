# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Native macOS App fuer faire, automatisierte Zuteilung — installierbar mit einem Terminal-Befehl
**Current focus:** Phase 7: Build Pipeline

## Current Position

Phase: 6 of 9 (Database Migration) - COMPLETE
Plan: 1 of 1 in current phase
Status: Phase complete
Last activity: 2026-01-17 — Completed 06-01-PLAN.md

Progress: [===============.....] 75% (15 of 20 plans across v1.0+v2.0)

## Performance Metrics

**v1.0 Velocity (reference):**
- Total plans completed: 12
- Average duration: 2.5min per plan
- Total milestone time: ~30min execution

**v2.0 (in progress):**
- Total plans completed: 3
- Estimated plans: 8 (based on phase structure)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 9min | 4.5min |
| 02-registration | 2 | 4min | 2min |
| 03-allocation | 4 | 11min | 2.75min |
| 04-output | 4 | 8.4min | 2.1min |
| 05-electron | 2 | 19min | 9.5min |
| 06-database | 1 | 1.8min | 1.8min |
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
- Dev mode detection via app.isPackaged
- electron-builder install-app-deps for native module postinstall
- userData directory (~/.../Application Support/Sporttag/) for production database (06-01)
- MIGRATIONS_PATH env var for bundled migration files location (06-01)
- Automatic migration on app startup (synchronous with better-sqlite3) (06-01)
- Graceful migration failure handling (log but don't crash) (06-01)

### Pending Todos

1. **Add Zuteilung reset button with confirmation** (ui) — 2026-01-17
2. **Fix Shift+Enter focus when dropdown still open** (ui) — 2026-01-17
3. **Add Einstellungen page for Schulname and Veranstaltungsname** (ui) — 2026-01-17
4. **Datenschutz - Complete data destruction option** (feature) — 2026-01-17
5. **Add Buy Me a Coffee button** (ui) — 2026-01-17

### Blockers/Concerns

(None)

## Session Continuity

Last session: 2026-01-17T17:42Z
Stopped at: Completed 06-01-PLAN.md (Database Persistence)
Resume file: None (Phase 6 complete, proceed to Phase 7: Build Pipeline)
