---
phase: 05-electron-shell
plan: 02
subsystem: infra
tags: [electron, macos, window-state, dock, development-workflow]

# Dependency graph
requires:
  - phase: 05-01
    provides: Electron main process with embedded Next.js server
provides:
  - Standard macOS window behavior (close-to-hide, Cmd+Q quit, dock re-show)
  - Window state persistence (position, size)
  - Electron development workflow scripts (electron:dev, electron:build)
affects: [07-build-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns: [close-to-hide, window-state-persistence, dev-mode-detection]

key-files:
  created: [electron/main.js, electron/preload.js]
  modified: [electron/main.ts, package.json]

key-decisions:
  - "Port 3456 for electron:dev (matching production port)"
  - "Dev mode detection via app.isPackaged"
  - "electron-builder install-app-deps for native module postinstall"

patterns-established:
  - "macOS lifecycle: before-quit sets isQuitting flag, close handler checks flag"
  - "Dev detection: app.isPackaged determines server spawn behavior"

# Metrics
duration: ~15min (includes checkpoint wait)
completed: 2026-01-17
---

# Phase 5 Plan 02: macOS Window Behavior Summary

**Standard macOS window lifecycle (close-to-hide, Cmd+Q quit, dock re-show) with window state persistence and development scripts**

## Performance

- **Duration:** ~15 min (includes user verification checkpoint)
- **Completed:** 2026-01-17
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 4 (electron/main.ts, package.json, electron/main.js, electron/preload.js)

## Accomplishments

- Implemented standard macOS window behavior:
  - Close (X) button hides window to Dock instead of quitting
  - Cmd+Q quits application completely
  - Dock icon click re-shows hidden window
- Added window state persistence (position, size restored on restart)
- Created development workflow scripts (electron:dev, electron:build)
- Compiled TypeScript to JavaScript for Electron execution

## Task Commits

Each task was committed atomically:

1. **Task 1: Add macOS window behavior and state persistence** - `b55d45d` (feat)
2. **Task 2: Add Electron development and build scripts** - `d4cd285` (feat)
3. **Fix: Port conflict resolution** - `a057636` (fix)
4. **Fix: Native module postinstall** - `a4f585d` (fix)
5. **Build: Compiled Electron JS files** - `eb76927` (build)

## Files Created/Modified

- `electron/main.ts` - Added windowStateKeeper, isQuitting flag, macOS lifecycle handlers
- `electron/main.js` - Compiled JavaScript for Electron execution
- `electron/preload.js` - Compiled preload script
- `package.json` - Added electron:dev, electron:build scripts, postinstall hook

## Decisions Made

- **Port 3456 for dev mode:** Matching production port for consistency, avoiding conflict with Next.js dev server
- **Dev mode detection:** Using `app.isPackaged` to determine whether to spawn server
- **Postinstall approach:** `electron-builder install-app-deps` instead of `@electron/rebuild`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Port conflict with Next.js dev server**
- **Found during:** Task 2 (electron:dev testing)
- **Issue:** electron:dev used port 3000 which conflicted with Next.js, causing connection errors
- **Fix:** Changed electron:dev to use port 3456 (matching production port), updated main.ts to use same port in dev mode
- **Files modified:** electron/main.ts, package.json
- **Commit:** a057636

**2. [Rule 3 - Blocking] Native module rebuild failures**
- **Found during:** Testing after Task 2
- **Issue:** better-sqlite3 not compiled for Electron ABI
- **Fix:** Changed postinstall from @electron/rebuild to electron-builder install-app-deps
- **Files modified:** package.json
- **Commit:** a4f585d

**3. [Rule 3 - Blocking] Missing compiled JS files**
- **Found during:** Testing electron:dev
- **Issue:** Electron could not find main.js and preload.js
- **Fix:** Compiled TypeScript files to JavaScript
- **Files created:** electron/main.js, electron/preload.js
- **Commit:** eb76927

---

**Total deviations:** 3 auto-fixed (all blocking)
**Impact on plan:** All necessary to get Electron running. No scope creep.

## User Verification (Checkpoint)

User verified all behaviors work correctly:
- Window opens with Sporttag UI
- Window state persists between launches
- Close-to-hide works (X hides to Dock)
- Cmd+Q quits completely
- Dock icon re-shows hidden window
- Database operations work (no native module errors)

## Issues Encountered

None after auto-fixes applied. All functionality verified by user.

## User Setup Required

None - development workflow ready to use.

## Next Phase Readiness

- Phase 5 complete - Electron shell fully functional
- Ready for Phase 6 (Database Paths) or Phase 7 (Build Pipeline)
- electron:build script exists but not yet tested (Phase 7)
- App icon still placeholder (Phase 7)

---
*Phase: 05-electron-shell*
*Completed: 2026-01-17*
