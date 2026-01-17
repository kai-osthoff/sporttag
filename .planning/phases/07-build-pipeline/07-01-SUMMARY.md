---
phase: 07-build-pipeline
plan: 01
subsystem: infra
tags: [electron-builder, dmg, macos, build]

# Dependency graph
requires:
  - phase: 05-electron
    provides: Electron app wrapper with embedded Next.js server
provides:
  - DMG build configuration with visual installer layout
  - Dual architecture support (arm64 + x64 as separate DMGs)
  - build:dmg npm script for local testing
  - macOS 12.0 minimum system version
affects: [07-02-github-actions, 08-install]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - electron-builder dmg configuration with backgroundColor
    - Dual architecture builds for native module compatibility

key-files:
  created: []
  modified:
    - electron-builder.yml
    - package.json
    - next.config.ts

key-decisions:
  - "Separate DMGs per architecture instead of universal (better-sqlite3 limitation)"
  - "macOS 12.0 minimum (Monterey, covers 2017+ Macs)"
  - "Dark gray background (#2d2d2d) for DMG visual appearance"
  - "Disable Next.js image optimization to avoid sharp conflicts"

patterns-established:
  - "Native modules in Next.js standalone prevent universal binary - use separate arch builds"

# Metrics
duration: 14min
completed: 2026-01-17
---

# Phase 7 Plan 1: DMG Build Configuration Summary

**electron-builder configured for dual-architecture DMG builds with dark gray installer background and side-by-side icon layout**

## Performance

- **Duration:** 14 min
- **Started:** 2026-01-17T18:25:00Z
- **Completed:** 2026-01-17T18:39:18Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Configured electron-builder for macOS DMG with visual drag-to-Applications layout
- Builds both arm64 and x64 as separate DMGs (145MB + 160MB)
- Set minimum macOS version to 12.0 (Monterey)
- Added `npm run build:dmg` script for local testing

## Task Commits

Each task was committed atomically:

1. **Task 1+2: Configure electron-builder and build script** - `660ccae` (feat)
3. **Task 3: Verification** - (no commit, verification only)

**Plan metadata:** (pending)

## Files Created/Modified
- `electron-builder.yml` - Added dmg section with backgroundColor, window size, icon positions; set arch to [arm64, x64]; added minimumSystemVersion
- `package.json` - Added build:dmg script
- `next.config.ts` - Added images.unoptimized to prevent sharp conflicts

## Decisions Made
1. **Separate DMGs instead of universal binary** - Next.js standalone output includes better-sqlite3 compiled for only one architecture. Universal binary creation fails because electron-builder can't merge architecture-specific native modules from extraResources. Solution: Build separate DMGs for each architecture.
2. **macOS 12.0 minimum** - Monterey (2021) covers 2017+ Macs, provides good compatibility while dropping legacy support.
3. **Dark gray background (#2d2d2d)** - Solid color is more reliable than background image (known electron-builder issues with images).
4. **Disable Next.js image optimization** - Prevents sharp native modules from being bundled, which caused conflicts in universal builds.

## Deviations from Plan

### Plan Requirement Not Met: Universal Binary

**1. [Rule 3 - Blocking] Universal binary not achievable locally**
- **Found during:** Task 1 (electron-builder configuration)
- **Issue:** Plan specified `arch: universal` for single DMG with both architectures. However, better-sqlite3 in Next.js standalone is compiled for only one architecture (the build machine's arch). electron-builder's universal merge fails with "file not covered by x64ArchFiles rule".
- **Fix:** Changed to `arch: [arm64, x64]` which builds separate DMGs for each architecture
- **Files modified:** electron-builder.yml
- **Verification:** `npm run build:dmg` produces two working DMGs (arm64: 145MB, x64: 160MB)
- **Committed in:** 660ccae

---

**Total deviations:** 1 blocking issue workaround
**Impact on plan:** Universal binary requirement not met for local builds. Both architectures are supported via separate DMGs. GitHub Actions (plan 07-02) can potentially create universal binaries using matrix strategy or post-build lipo merge.

## Issues Encountered
- **better-sqlite3 NODE_MODULE_VERSION mismatch** - electron-builder rebuilds native modules for Electron's Node version, which breaks subsequent Next.js builds. Required `npm rebuild better-sqlite3` before each full build cycle.
- **sharp native modules bundled** - Even with serverExternalPackages, Next.js includes sharp in standalone. Fixed by setting images.unoptimized in next.config.ts.
- **@next/swc causing universal build failures** - Added exclusion pattern in electron-builder files config.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- DMG build configuration complete and tested
- Ready for GitHub Actions workflow (07-02)
- Universal binary creation should be addressed in 07-02 using matrix strategy or separate build jobs

**Blockers/Concerns:**
- Universal binary not possible for local builds - users need to download correct architecture
- Intel Mac users on GitHub Actions will need macos-13 runner (deprecated Dec 2025) or macos-15-intel

---
*Phase: 07-build-pipeline*
*Completed: 2026-01-17*
