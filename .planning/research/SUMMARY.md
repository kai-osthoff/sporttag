# Project Research Summary

**Project:** Sporttag-Anmeldeplattform v2.0 Desktop Distribution
**Domain:** macOS desktop application packaging for Next.js + SQLite web app
**Researched:** 2026-01-17
**Confidence:** HIGH

## Executive Summary

Sporttag v2.0 transforms the existing web application into a native macOS desktop app for non-technical teachers. The research strongly recommends **Electron with embedded Next.js server** over Tauri. While Tauri offers better performance (10MB vs 150MB bundle, 30MB vs 250MB RAM), it requires rewriting 60% of the codebase because it cannot run Server Actions or use better-sqlite3. Electron preserves the existing stack with minimal changes (~10% of code affected).

The recommended approach is: (1) configure Next.js for standalone output, (2) embed the standalone server in an Electron utility process, (3) store the database in `~/Library/Application Support/Sporttag/`, (4) distribute via DMG with a curl-based installer that removes quarantine attributes, and (5) implement update notifications via electron-updater checking GitHub Releases.

The primary risks are Gatekeeper blocking unsigned apps (mitigated by curl installer removing quarantine), database loss during updates (mitigated by storing data outside the app bundle), and ARM/Intel architecture mismatch (mitigated by building Universal Binary). Apple may tighten restrictions on unsigned apps in future macOS versions, so budget for Apple Developer ID ($99/year) if distribution scales beyond a single school.

## Key Findings

### Recommended Stack

Electron wins decisively over Tauri for this project despite Tauri's superior performance metrics. The deciding factor is **better-sqlite3 compatibility**: Electron's Node.js runtime runs the existing database layer directly, while Tauri would require rewriting all database operations in Rust.

**Core technologies:**
- **Electron ^34.0.0:** Desktop wrapper with Node.js runtime that preserves existing better-sqlite3 + Drizzle stack
- **electron-builder ^26.0.0:** Build tooling for DMG generation, native module handling, and GitHub Releases publishing
- **electron-updater ^6.0.0:** Battle-tested auto-update mechanism with GitHub Releases integration
- **Next.js standalone output:** Production-optimized self-contained build that runs embedded in Electron

**Avoid:**
- Tauri (requires Rust database rewrite)
- Homebrew Cask (requires code signing)
- PKG installer (overkill for school distribution)

### Expected Features

**Must have (table stakes):**
- App in /Applications with Dock icon (users expect "real" app behavior)
- Data persistence in ~/Library/Application Support/ (survives app updates)
- Standard macOS window behavior (X hides, Cmd+Q quits)
- Works offline (already works with local SQLite)
- No scary Gatekeeper warnings (requires curl installer workaround)

**Should have (differentiators):**
- In-app update notification banner (check GitHub Releases on launch)
- Visual DMG installation instructions (background image with arrow)
- German-language dialogs throughout
- Window state persistence between sessions

**Defer to post-v2.0:**
- Full auto-updater (start with notification + manual download)
- Windows/Linux support
- Database backup UI in-app
- Apple Developer ID code signing (use curl + xattr workaround for now)

### Architecture Approach

The architecture embeds Next.js as a standalone server running in an Electron utility process, with the renderer loading the app via localhost. This preserves Server Actions, SSR, and all existing database code. The main process handles window management, auto-update checks, and spawns the Next.js server with environment variables for database path.

**Major components:**
1. **Electron Main Process** — app lifecycle, window management, spawns Next.js server
2. **Utility Process (Next.js Server)** — runs standalone build with Drizzle + better-sqlite3
3. **Renderer (Chromium)** — displays Next.js app, communicates via HTTP
4. **SQLite Database** — stored in userData directory, accessed only by utility process
5. **Auto-Updater** — checks GitHub Releases, notifies user, handles download/install

**Key configuration changes:**
- `next.config.ts`: Add `output: 'standalone'` and `serverExternalPackages: ['electron', 'better-sqlite3']`
- `src/db/index.ts`: Use `process.env.DB_PATH || 'sporttag.db'` for configurable database location
- New `electron/` directory: main.ts, preload.ts, updater.ts

### Critical Pitfalls

1. **Gatekeeper blocks unsigned app (D1)** — macOS Sequoia requires System Settings navigation for unsigned apps. Mitigate with curl installer that removes quarantine via `xattr -cr /Applications/Sporttag.app`.

2. **Database lost on update (D2)** — NEVER store database inside app bundle. Use `app.getPath('userData')` from day one. The `.app` directory is completely replaced on update.

3. **Architecture mismatch (D3)** — Build Universal Binary 2 (ARM + Intel) or provide separate downloads with architecture detection in curl script. Intel support matters until macOS 27 (2026).

4. **Next.js Server Actions don't work with static export (D9)** — This is why we chose Electron over Tauri. With Electron + standalone output, Server Actions work normally.

5. **Native module rebuild required** — better-sqlite3 must be rebuilt for Electron's Node version. Add `"postinstall": "electron-builder install-app-deps"` to package.json.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Electron Shell + Static Server
**Rationale:** Must establish that Next.js + Electron works before any other work. Architecture decision has cascading effects.
**Delivers:** Electron app that launches and displays Next.js UI
**Addresses:** Basic desktop packaging, verifies Server Actions work in Electron context
**Avoids:** D9 (SSR incompatibility) by validating standalone build early

### Phase 2: Database Location Migration
**Rationale:** Must fix database path before any user data is created in wrong location
**Delivers:** Database in `~/Library/Application Support/Sporttag/`, backward-compatible env var approach
**Uses:** Electron's `app.getPath('userData')`, environment variable injection
**Avoids:** D2 (database lost on update) permanently

### Phase 3: Build + Distribution Pipeline
**Rationale:** Need reliable build before testing with real users
**Delivers:** DMG installer, electron-builder configuration, GitHub Releases integration
**Implements:** Native module rebuild, Universal Binary, DMG customization
**Avoids:** D3 (architecture mismatch)

### Phase 4: Installation Script
**Rationale:** Gatekeeper bypass is critical for non-technical users
**Delivers:** curl installer that downloads DMG, copies to /Applications, removes quarantine
**Addresses:** Table stakes feature "no scary warnings"
**Avoids:** D1 (Gatekeeper blocks), D4 (curl security concerns)

### Phase 5: Update Notification
**Rationale:** Once stable, add update mechanism for future releases
**Delivers:** In-app banner checking GitHub Releases, link to download new version
**Implements:** electron-updater for notification (not full auto-download yet)
**Avoids:** D6 (update failures) by keeping updates manual initially

### Phase Ordering Rationale

- **Phases 1-2 must be sequential:** Database location depends on Electron working
- **Phase 3 enables testing:** Cannot test with users without working builds
- **Phase 4 unblocks deployment:** Gatekeeper is the #1 blocker for teacher adoption
- **Phase 5 is nice-to-have:** v2.0 can ship without auto-updates; manual DMG replacement works

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Build Pipeline):** Universal Binary build process, native module signing, DMG customization options
- **Phase 5 (Updates):** Differential updates vs full replacement, handling database schema migrations

Phases with standard patterns (skip research-phase):
- **Phase 1 (Electron Shell):** Well-documented, use next-electron-rsc patterns
- **Phase 2 (Database Location):** Standard Electron userData pattern
- **Phase 4 (Installation Script):** Standard curl+xattr pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Electron vs Tauri tradeoffs well-documented; better-sqlite3 compatibility verified |
| Features | HIGH | Apple HIG and macOS conventions are authoritative |
| Architecture | HIGH | Electron utility process pattern verified in multiple sources |
| Pitfalls | HIGH | Gatekeeper behavior documented by Apple; community patterns consistent |

**Overall confidence:** HIGH

### Gaps to Address

- **Apple Developer ID:** Research did not determine if $99/year is worth it for single-school deployment. Decision can be deferred; curl workaround is sufficient for initial release.
- **IT department policies:** Unknown if German schools have MDM policies that would prefer PKG format. Unlikely for small school deployment.
- **Multi-user machines:** Research did not address shared Mac scenarios in computer labs. Database in userData is per-user, which may be desired behavior.
- **Nextron vs manual setup:** STACK-DESKTOP.md mentioned Nextron but assessed it as MEDIUM confidence (less actively maintained). May need to evaluate during Phase 1 implementation.

## Sources

### Primary (HIGH confidence)
- [Electron app.getPath() documentation](https://www.electronjs.org/docs/latest/api/app) — userData location, app lifecycle
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — build configuration
- [electron-builder auto-update](https://www.electron.build/auto-update.html) — GitHub Releases integration
- [Apple Gatekeeper documentation](https://support.apple.com/guide/security/gatekeeper-and-runtime-protection-sec5599b66df/web) — security requirements

### Secondary (MEDIUM confidence)
- [DoltHub Electron vs Tauri (2025)](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/) — framework comparison
- [next-electron-rsc](https://github.com/kirill-konshin/next-electron-rsc) — RSC in Electron patterns
- [better-sqlite3 Electron integration](https://dev.to/arindam1997007/a-step-by-step-guide-to-integrating-better-sqlite3-with-electron-js-app-using-create-react-app-3k16) — native module rebuild

### Tertiary (LOW confidence)
- [Nextron](https://github.com/saltyshiomix/nextron) — Next.js + Electron boilerplate; less actively updated, may need verification

---
*Research completed: 2026-01-17*
*Ready for roadmap: yes*
