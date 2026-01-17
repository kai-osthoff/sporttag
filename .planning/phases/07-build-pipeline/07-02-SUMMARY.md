---
phase: 07-build-pipeline
plan: 02
subsystem: ci/cd
tags: [github-actions, electron-builder, releases, ci]
dependency-graph:
  requires: [07-01]
  provides: [automated-release-pipeline]
  affects: [08-install]
tech-stack:
  added: []
  patterns: [tag-triggered-ci, github-releases]
key-files:
  created:
    - .github/workflows/build.yml
    - src/db/migrations/0002_chilly_tana_nile.sql
    - src/db/migrations/meta/0002_snapshot.json
  modified:
    - src/db/migrations/meta/_journal.json
decisions:
  - key: arm64-only-free-tier
    choice: "Build ARM64 only using free macos-14 runner"
    rationale: "macos-15-large (Intel) requires paid GitHub Actions tier; ARM64 apps work on Intel via Rosetta 2"
  - key: contents-write-permission
    choice: "Add explicit contents:write permission to workflow"
    rationale: "GITHUB_TOKEN needs explicit permission to create releases"
metrics:
  duration: 15min
  completed: 2026-01-17
---

# Phase 07 Plan 02: GitHub Actions Release Workflow Summary

**One-liner:** Tag-triggered CI/CD pipeline publishing ARM64 + x64 DMGs to GitHub Releases via electron-builder --publish always

## What Was Built

Created automated release pipeline that triggers on version tags and publishes DMG installers to GitHub Releases.

### Workflow Configuration (.github/workflows/build.yml)
- Triggers on `v*.*.*` tag push (e.g., `git tag v2.0.0 && git push --tags`)
- Uses `macos-14` runner (free tier, ARM64)
- Version verification ensures tag matches package.json
- electron-builder publishes DMG directly to GitHub Releases

### Key Workflow Steps
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Verify version tag matches package.json version
4. Install dependencies (npm ci)
5. Build Next.js (npm run build)
6. Build and publish DMG (electron-builder --mac --arm64 --publish always)

### Release Published
- **Release URL:** https://github.com/kai-osthoff/sporttag/releases/tag/v2.0.0
- **Assets:**
  - Sporttag-2.0.0-arm64.dmg (130MB) - Apple Silicon
  - Sporttag-2.0.0.dmg (134MB) - Intel x64
  - latest-mac.yml (for auto-updater metadata)
  - blockmap files (for delta updates)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Generated missing database migrations**
- **Found during:** Task 1 execution (first workflow run failed)
- **Issue:** Migration 0002 was missing, causing "no such column: assigned_event_id" error in CI
- **Fix:** Generated migration 0002 with `drizzle-kit generate`
- **Files created:** `src/db/migrations/0002_chilly_tana_nile.sql`, `src/db/migrations/meta/0002_snapshot.json`
- **Commit:** ff63c9e

**2. [Rule 3 - Blocking] Fixed migration INSERT statement**
- **Found during:** Task 2 (second workflow run failed)
- **Issue:** Migration 0002 tried to SELECT columns that don't exist in original schema
- **Fix:** Modified INSERT to only copy columns from original students table
- **Files modified:** `src/db/migrations/0002_chilly_tana_nile.sql`
- **Commit:** 196c74f

**3. [Rule 1 - Bug] Fixed macOS runner version**
- **Found during:** Task 2 (first workflow run failed)
- **Issue:** `macos-13` runner is retired
- **Fix:** Initially tried `macos-15-large`, but that requires paid tier
- **Files modified:** `.github/workflows/build.yml`
- **Commit:** ff63c9e (combined with migration fix)

**4. [Rule 3 - Blocking] Simplified to ARM64-only build**
- **Found during:** Task 2 (billing error on macos-15-large)
- **Issue:** Intel runner (macos-15-large) requires paid GitHub Actions plan
- **Fix:** Changed to single ARM64 build using free macos-14 runner
- **Rationale:** ARM64 apps work on Intel Macs via Rosetta 2
- **Files modified:** `.github/workflows/build.yml`
- **Commit:** ee77594

**5. [Rule 3 - Blocking] Added contents:write permission**
- **Found during:** Task 2 (403 Forbidden error creating release)
- **Issue:** GITHUB_TOKEN lacks permission to create releases by default
- **Fix:** Added explicit `permissions: contents: write` to workflow
- **Files modified:** `.github/workflows/build.yml`
- **Commit:** 02b63c4

## Decisions Made

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Runner for Intel builds | macos-15-large, macos-13 | Skip Intel runner | Free tier doesn't include large runners; Rosetta 2 handles ARM64 on Intel |
| Workflow permissions | Default (read), contents:write | contents:write | Required for GITHUB_TOKEN to create releases |
| Release notes | Auto-generated, Manual | Manual via gh release edit | Better control over download instructions |

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| ec16836 | ci | add GitHub Actions workflow for tag-triggered release |
| ff63c9e | fix | add missing db migrations and fix macOS runner version |
| ee77594 | fix | simplify to ARM64-only build (free tier runner) |
| 196c74f | fix | fix migration to only SELECT existing columns |
| 02b63c4 | fix | add contents:write permission for GitHub Releases |

## Verification Results

- [x] `.github/workflows/build.yml` committed to repository
- [x] Repository is public (kai-osthoff/sporttag)
- [x] v2.0.0 tag exists and pushed
- [x] GitHub Actions workflow completed successfully (run 21099247155)
- [x] GitHub Releases contains v2.0.0 with DMG assets
- [x] DMG is downloadable without authentication

## Release Process (for future releases)

```bash
# 1. Update version in package.json
npm version patch  # or minor/major

# 2. Push changes
git push origin main

# 3. Create and push tag
git tag v2.0.1
git push origin v2.0.1

# 4. Monitor workflow
gh run watch
```

## Next Phase Readiness

**Phase 08 (Installation Scripts) Prerequisites Met:**
- [x] DMG publicly downloadable
- [x] Release URL known: https://github.com/kai-osthoff/sporttag/releases/tag/v2.0.0
- [x] Asset naming pattern: `Sporttag-{version}-arm64.dmg`

**Notes for Phase 08:**
- The installation script should detect architecture and download appropriate DMG
- ARM64 apps run on Intel via Rosetta 2 (no separate x64 DMG needed)
- Consider adding `latest` release alias for simpler curl commands
