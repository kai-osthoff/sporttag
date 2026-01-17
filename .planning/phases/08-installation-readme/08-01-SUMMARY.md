---
phase: 08-installation-readme
plan: 01
subsystem: infra
tags: [bash, curl, installation, dmg, gatekeeper, xattr]

# Dependency graph
requires:
  - phase: 07-build
    provides: GitHub releases with ARM64/x64 DMG files
provides:
  - Bash installer script with architecture detection
  - German README with one-command installation
  - User-facing documentation for non-technical teachers
affects: [09-updates, user-adoption]

# Tech tracking
tech-stack:
  added: []
  patterns: [curl-pipe-bash installation, xattr Gatekeeper bypass]

key-files:
  created:
    - scripts/install.sh
  modified:
    - README.md

key-decisions:
  - "/usr/bin/uname -m for architecture detection (not GNU coreutils)"
  - "ae/oe/ue encoding for German (ASCII-safe, no UTF-8 issues)"
  - "Informal Du-Form in README for friendly tone"

patterns-established:
  - "Installation via curl | bash pattern for macOS apps"
  - "German user documentation style for school context"

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 08 Plan 01: Installation Script and README Summary

**One-command curl installer with German README for non-technical teachers - architecture auto-detection, Gatekeeper bypass, step-by-step Terminal instructions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17T19:54:55Z
- **Completed:** 2026-01-17T19:56:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created bash installer script with ARM64/Intel architecture detection
- Downloads correct DMG from GitHub releases automatically
- Removes Gatekeeper quarantine using xattr
- Wrote complete German README with prominent curl command
- Step-by-step Terminal instructions for non-technical users
- Gatekeeper explanation with security reassurance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create installer script** - `91f0173` (feat)
2. **Task 2: Create German README** - `bfb0c8f` (docs)

## Files Created/Modified

- `scripts/install.sh` - 83-line bash installer with architecture detection, DMG handling, xattr
- `README.md` - 78-line German documentation with installation guide, features, security info

## Decisions Made

- **Used /usr/bin/uname -m** - GNU coreutils uname on Apple Silicon returns incorrect architecture value
- **ASCII-safe umlauts (ae/oe/ue)** - Avoids UTF-8 encoding issues in different Terminal configurations
- **Informal Du-Form** - More approachable for school teachers, matches friendly app tone
- **Duplicate curl command** - Appears in both Installation and Updates sections for easy copy

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Installation experience complete
- README provides complete user documentation
- Ready for phase 09 (manual updates documentation) or user adoption
- Consider adding app screenshots to README in future iteration

---
*Phase: 08-installation-readme*
*Completed: 2026-01-17*
