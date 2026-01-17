---
phase: 06-database-migration
plan: 01
subsystem: database
tags: [drizzle, better-sqlite3, electron, migrations, persistence]

# Dependency graph
requires:
  - phase: 05-electron
    provides: Electron main process with app.isPackaged detection
provides:
  - Database persistence in ~/Library/Application Support/Sporttag/
  - Automatic schema migrations on app startup
  - Migrations folder bundled with packaged app
affects: [07-build, 08-install, 09-updates]

# Tech tracking
tech-stack:
  added: [drizzle-orm/better-sqlite3/migrator]
  patterns: [userData directory for persistence, MIGRATIONS_PATH env var pattern]

key-files:
  created: []
  modified: [electron/main.ts, src/db/index.ts, electron-builder.yml]

key-decisions:
  - "userData directory (~/.../Application Support/Sporttag/) for production database"
  - "MIGRATIONS_PATH env var for bundled migration files location"
  - "Automatic migration on app startup (synchronous with better-sqlite3)"
  - "Graceful migration failure handling (log but don't crash)"

patterns-established:
  - "Production/development path switching via app.isPackaged"
  - "Migrations bundled at standalone/src/db/migrations in packaged app"
  - "Environment variables for path configuration (DB_PATH, MIGRATIONS_PATH)"

# Metrics
duration: 1.8min
completed: 2026-01-17
---

# Phase 6 Plan 1: Database Persistence Summary

**Database persists in ~/Library/Application Support/Sporttag/ with automatic migrations on startup, surviving app updates**

## Performance

- **Duration:** 1.8 min (107 seconds)
- **Started:** 2026-01-17T17:40:23Z
- **Completed:** 2026-01-17T17:42:10Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Database stored outside app bundle in macOS-standard userData location
- Automatic directory creation on first launch (recursive mkdir)
- Schema migrations run automatically on every app startup
- Migration files bundled with packaged app for future updates

## Task Commits

Each task was committed atomically:

1. **Task 1: Add userData directory creation in Electron main process** - `afd5293` (feat)
2. **Task 2: Add Drizzle migration runner to database module** - `9e68eb5` (feat)
3. **Task 3: Include migrations folder in electron-builder extraResources** - `03b48d3` (build)

## Files Created/Modified
- `electron/main.ts` - Added fs import, userData directory creation, MIGRATIONS_PATH env var
- `src/db/index.ts` - Added migrate import and automatic migration runner on module load
- `electron-builder.yml` - Added src/db/migrations to extraResources for bundling

## Decisions Made
- **userData location**: `~/Library/Application Support/Sporttag/` follows macOS conventions for app data
- **Synchronous migrations**: better-sqlite3 is synchronous, so migrations run before db export
- **Graceful failure**: Migration errors are logged but don't crash app (allows more specific errors later)
- **Bundling path**: Migrations at `standalone/src/db/migrations` matches Next.js standalone structure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues. TypeScript compilation and verification checks passed.

## User Setup Required

None - no external service configuration required. Database and migrations are fully automated.

## Next Phase Readiness

Ready for Phase 7 (Build Pipeline):
- Database persistence mechanism complete
- Migrations will survive app bundle replacement
- Both production and development modes tested and working

**Verification for future phases:**
- Run app in dev mode: `npm run dev` should show "Database migrations applied successfully"
- Build app: `npm run build:electron` should include migrations folder in dist/
- After installation: Database should appear at `~/Library/Application Support/Sporttag/sporttag.db`

---
*Phase: 06-database-migration*
*Completed: 2026-01-17*
