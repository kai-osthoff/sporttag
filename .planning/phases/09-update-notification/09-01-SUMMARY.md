---
phase: 09-update-notification
plan: 01
subsystem: infra
tags: [electron, ipc, semver, typescript]

# Dependency graph
requires:
  - phase: 05-electron
    provides: Electron app structure with main.ts and preload.ts
provides:
  - IPC handlers for app version and external URL opening
  - TypeScript declarations for window.electronAPI
  - Semantic version comparison utility
affects: [09-02-update-banner]

# Tech tracking
tech-stack:
  added: [semver, @types/semver]
  patterns: [ipcMain.handle/ipcRenderer.invoke pattern]

key-files:
  created:
    - src/types/electron.d.ts
    - src/lib/version.ts
  modified:
    - electron/main.ts
    - electron/preload.ts
    - package.json

key-decisions:
  - "GitHub-only URL restriction for shell.openExternal security"
  - "semver.coerce() to handle 'v' prefix from GitHub tags"

patterns-established:
  - "IPC channel naming: namespace:action (e.g., app:get-version, shell:open-external)"
  - "TypeScript global augmentation for window.electronAPI"

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 9 Plan 01: Electron IPC & Version Utilities Summary

**Electron IPC handlers for app version and external URLs, plus semver-based version comparison utility for update checking**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17T20:50:02Z
- **Completed:** 2026-01-17T20:52:10Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- IPC handlers registered in main.ts for version retrieval and external URL opening
- preload.ts exposes both functions via contextBridge to renderer process
- TypeScript declarations enable type-safe access to window.electronAPI
- semver installed for proper semantic version comparison (handles 1.9.0 < 1.10.0 correctly)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add IPC handlers in main process** - `dda4022` (feat)
2. **Task 2: Extend preload and add TypeScript declarations** - `36bc232` (feat)
3. **Task 3: Install semver and create version utility** - `d298fc9` (feat)

## Files Created/Modified
- `electron/main.ts` - Added ipcMain.handle for app:get-version and shell:open-external
- `electron/preload.ts` - Added ipcRenderer.invoke calls exposed via contextBridge
- `src/types/electron.d.ts` - TypeScript declarations for window.electronAPI interface
- `src/lib/version.ts` - isNewerVersion() function using semver for comparison
- `package.json` - Added semver dependency

## Decisions Made
- **GitHub-only URL restriction:** shell.openExternal only allows URLs starting with `https://github.com/kai-osthoff/sporttag` for security
- **semver.coerce() for tag handling:** Handles "v" prefix that GitHub tags typically have (e.g., "v2.1.0")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- IPC foundation complete for update notification UI
- Plan 02 can now implement update check banner using:
  - `window.electronAPI.getVersion()` to get current app version
  - `window.electronAPI.openExternal(url)` to open GitHub releases
  - `isNewerVersion()` to compare versions semantically

---
*Phase: 09-update-notification*
*Completed: 2026-01-17*
