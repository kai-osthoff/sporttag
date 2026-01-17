# Roadmap: Sporttag-Anmeldeplattform

## Overview

This roadmap covers v2.0 Desktop Distribution: transforming the existing Next.js web application into a native macOS desktop app that non-technical teachers can install with a single terminal command and use like any other Mac application. The journey starts with Electron integration, moves through database migration and build pipeline setup, culminates in user-friendly installation, and adds update notifications for future releases.

## Milestones

- v1.0 MVP - Phases 1-4 (shipped 2026-01-17)
- v2.0 Desktop Distribution - Phases 5-9 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-17</summary>

### Phase 1: Foundation + Events
**Goal**: Project setup and event management
**Plans**: 2 plans (complete)

Plans:
- [x] 01-01: Project scaffolding with Next.js, SQLite, Drizzle
- [x] 01-02: Event CRUD with capacity tracking

### Phase 2: Registration
**Goal**: Student registration with priorities
**Plans**: 2 plans (complete)

Plans:
- [x] 02-01: Student form with 3-priority selection
- [x] 02-02: Student list with duplicate validation

### Phase 3: Allocation
**Goal**: Fair lottery-based allocation algorithm
**Plans**: 4 plans (complete)

Plans:
- [x] 03-01: Allocation algorithm (Mulberry32 PRNG)
- [x] 03-02: Allocation UI with statistics
- [x] 03-03: Manual reassignment modal
- [x] 03-04: Sonderliste for unassigned students

### Phase 4: Output
**Goal**: Print-ready lists for SMV-Brett
**Plans**: 4 plans (complete)

Plans:
- [x] 04-01: Per-event participant lists
- [x] 04-02: Per-class participant lists
- [x] 04-03: A4 print styles
- [x] 04-04: German CSV export with UTF-8 BOM

</details>

### v2.0 Desktop Distribution (In Progress)

**Milestone Goal:** Native macOS Desktop-App mit Ein-Befehl-Installation fuer nicht-technische Lehrer

- [x] **Phase 5: Electron Shell** - Electron wrapper with Next.js standalone server
- [x] **Phase 6: Database Migration** - SQLite in Application Support folder
- [x] **Phase 7: Build Pipeline** - DMG generation and GitHub Releases
- [ ] **Phase 8: Installation + README** - curl installer and user documentation
- [ ] **Phase 9: Update Notification** - In-app banner for new versions

## Phase Details

### Phase 5: Electron Shell
**Goal**: App runs as native macOS application with standard window behavior
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: DESK-01, DESK-02, DESK-03, DESK-04, DESK-05
**Success Criteria** (what must be TRUE):
  1. Double-clicking Sporttag.app opens a window showing the Next.js UI
  2. App appears in Dock while running with proper icon
  3. Cmd+Q quits the app completely, X button hides window to Dock
  4. Window position and size restore correctly after restart
  5. All v1.0 features work without internet connection
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Electron main process with embedded Next.js standalone server
- [x] 05-02-PLAN.md — macOS window behavior and development workflow

### Phase 6: Database Migration
**Goal**: Database persists in user-accessible location that survives app updates
**Depends on**: Phase 5
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Database file exists at ~/Library/Application Support/Sporttag/sporttag.db
  2. Fresh install creates the directory and database automatically
  3. Replacing app bundle with new version preserves all existing data
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — userData directory creation, migration runner, and extraResources config

### Phase 7: Build Pipeline
**Goal**: Automated build produces distributable DMG for ARM and Intel Macs
**Depends on**: Phase 6
**Requirements**: INST-03, INST-04, INST-05, DIST-01, DIST-04
**Success Criteria** (what must be TRUE):
  1. Running build script produces a .dmg file
  2. DMG opens showing app icon and Applications folder with visual arrow
  3. App runs on both Apple Silicon (M1/M2/M3) and Intel Macs
  4. GitHub Releases page contains downloadable DMG
  5. Repository is public (anyone can access releases)
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Universal DMG build configuration and local build script
- [x] 07-02-PLAN.md — GitHub Actions workflow for tag-triggered releases

### Phase 8: Installation + README
**Goal**: Teachers can install the app with one terminal command
**Depends on**: Phase 7
**Requirements**: INST-01, INST-02, DIST-02, DIST-03
**Success Criteria** (what must be TRUE):
  1. Copying curl command from README and pasting into Terminal installs the app
  2. After installation, app opens without Gatekeeper warning
  3. README is in German and understandable for non-technical users
  4. README shows the curl command prominently for easy copying
**Plans**: 1 plan

Plans:
- [ ] 08-01-PLAN.md — Bash installer script and German README documentation

### Phase 9: Update Notification
**Goal**: Users know when a new version is available
**Depends on**: Phase 8
**Requirements**: UPDT-01, UPDT-02, UPDT-03, UPDT-04
**Success Criteria** (what must be TRUE):
  1. When a newer version exists on GitHub Releases, a banner appears in the app
  2. Banner is visible but not blocking (can continue using app)
  3. Banner contains a link/button that opens the download page
  4. User can dismiss the banner (it does not reappear until next launch)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD (GitHub Releases API check + notification banner)

## Progress

**Execution Order:** Phases 5 -> 6 -> 7 -> 8 -> 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-16 |
| 2. Registration | v1.0 | 2/2 | Complete | 2026-01-16 |
| 3. Allocation | v1.0 | 4/4 | Complete | 2026-01-16 |
| 4. Output | v1.0 | 4/4 | Complete | 2026-01-17 |
| 5. Electron Shell | v2.0 | 2/2 | Complete | 2026-01-17 |
| 6. Database Migration | v2.0 | 1/1 | Complete | 2026-01-17 |
| 7. Build Pipeline | v2.0 | 2/2 | Complete | 2026-01-17 |
| 8. Installation + README | v2.0 | 0/1 | Planned | - |
| 9. Update Notification | v2.0 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-17*
*Milestone: v2.0 Desktop Distribution*
