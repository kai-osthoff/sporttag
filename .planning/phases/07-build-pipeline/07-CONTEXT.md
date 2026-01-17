# Phase 7: Build Pipeline - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce a distributable macOS DMG installer from the Electron app for both ARM and Intel Macs. Publish releases to GitHub Releases. The curl installer and README documentation are Phase 8.

</domain>

<decisions>
## Implementation Decisions

### DMG Appearance
- Simple clean style with solid dark gray background
- Window size: 660x400 (medium, breathing room)
- App icon on left, Applications alias on right
- No arrow graphic — icon positioning only (users know the pattern)

### Architecture Targets
- Universal binary — single DMG works on both ARM (M1/M2/M3) and Intel Macs
- Minimum macOS version: 12 Monterey (covers 2017+ Macs)

### Build Triggers
- GitHub Actions triggered by pushing a version tag (v1.0.0)
- Auto-publish on tag — no manual approval required
- Local `npm run build:dmg` command for testing before tagging
- Release assets: DMG only (no zip, no auto-generated release notes)

### Version Management
- SemVer scheme: MAJOR.MINOR.PATCH
- Version source: package.json synced with git tag (CI enforces match)
- First release version: v1.0.0

### Claude's Discretion
- Exact electron-builder configuration details
- GitHub Actions workflow structure
- DMG volume name and icon arrangement specifics

</decisions>

<specifics>
## Specific Ideas

- Teachers shouldn't need to think about ARM vs Intel — just download one file
- Dark gray background feels more premium than plain white
- Tag-based releases are simple: change version, push tag, done

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-build-pipeline*
*Context gathered: 2026-01-17*
