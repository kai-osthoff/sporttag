# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Native macOS App fuer faire, automatisierte Zuteilung — installierbar mit einem Terminal-Befehl
**Current focus:** Phase 9: Update Notification

## Current Position

Phase: 9 of 9 (Update Notification)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-01-17 — Completed 09-01-PLAN.md

Progress: [===================.] 95% (19 of 20 plans across v1.0+v2.0)

## Performance Metrics

**v1.0 Velocity (reference):**
- Total plans completed: 12
- Average duration: 2.5min per plan
- Total milestone time: ~30min execution

**v2.0 (in progress):**
- Total plans completed: 7
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
| 07-build | 2 | 29min | 14.5min |
| 08-install | 1 | 2min | 2min |
| 09-updates | 1 | 2min | 2min |

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
- Separate DMGs per architecture instead of universal binary (better-sqlite3 limitation) (07-01)
- macOS 12.0 minimum system version (Monterey, covers 2017+ Macs) (07-01)
- Dark gray background (#2d2d2d) for DMG installer appearance (07-01)
- images.unoptimized in next.config.ts to prevent sharp conflicts (07-01)
- ARM64-only build using free macos-14 runner (Rosetta 2 covers Intel) (07-02)
- explicit contents:write permission for workflow releases (07-02)
- /usr/bin/uname -m for architecture detection (not GNU coreutils) (08-01)
- ae/oe/ue encoding for German README (ASCII-safe) (08-01)
- Informal Du-Form in README for friendly teacher tone (08-01)
- GitHub-only URL restriction for shell.openExternal security (09-01)
- semver.coerce() to handle 'v' prefix from GitHub tags (09-01)
- IPC channel naming: namespace:action pattern (09-01)

### Pending Todos

1. **Add Zuteilung reset button with confirmation** (ui) — 2026-01-17
2. **Fix Shift+Enter focus when dropdown still open** (ui) — 2026-01-17
3. **Add Einstellungen page for Schulname and Veranstaltungsname** (ui) — 2026-01-17
4. **Datenschutz - Complete data destruction option** (feature) — 2026-01-17
5. **Add Buy Me a Coffee button** (ui) — 2026-01-17
6. **Add release-please-action for automated releases** (tooling) — 2026-01-17

### Blockers/Concerns

- None currently (universal binary concern resolved - ARM64 works on Intel via Rosetta 2)

## Session Continuity

Last session: 2026-01-17T20:52Z
Stopped at: Completed 09-01-PLAN.md (Electron IPC & Version Utilities)
Resume file: None (Continue to 09-02-PLAN.md)

## Release Information

**v2.0.0 Released:**
- URL: https://github.com/kai-osthoff/sporttag/releases/tag/v2.0.0
- ARM64 DMG: Sporttag-2.0.0-arm64.dmg (130MB)
- x64 DMG: Sporttag-2.0.0.dmg (134MB)
- Repository: public (kai-osthoff/sporttag)
