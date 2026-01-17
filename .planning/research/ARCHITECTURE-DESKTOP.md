# Architecture Research: Desktop Wrapper for Next.js App

**Domain:** Next.js application desktop distribution (v2.0 milestone)
**Researched:** 2026-01-17
**Confidence:** HIGH (verified via official documentation and community patterns)

## Executive Summary

Two viable architectures exist for wrapping the Sporttag Next.js application in a desktop container:

1. **Electron with embedded Next.js server** (RECOMMENDED) - Maintains Server Actions, SSR, and current Drizzle/better-sqlite3 stack
2. **Tauri with static export** - Requires rewriting data layer to Rust-based SQLite

Given Sporttag's heavy reliance on Server Actions (`'use server'`), SSR, and better-sqlite3, **Electron is the recommended path** as it requires minimal code changes (~10% vs ~60% for Tauri).

---

## Framework Comparison Summary

| Factor | Electron | Tauri | Impact on Sporttag |
|--------|----------|-------|-------------------|
| Server Actions | Supported (embedded server) | NOT supported (static only) | Would require rewriting all `'use server'` code |
| SSR | Supported | NOT supported | Would require `output: 'export'` |
| better-sqlite3 | Works (native rebuild) | Cannot use (Node native) | Would require Rust SQLite implementation |
| Data layer | Keep Drizzle | Rewrite to Tauri SQL plugin | Significant rewrite |
| Bundle size | ~150MB | ~10MB | Electron larger, but acceptable for school use |
| Memory usage | ~250MB idle | ~30MB idle | Electron heavier |
| Code changes | ~10% | ~60% | Electron much simpler |

**Source:** [DoltHub Electron vs Tauri comparison (2025)](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/) - "Next.js doesn't translate very cleanly to a desktop application context... Tauri makes the integration process simpler by relying on Next's static-site generation capabilities."

**Source:** [Tauri Next.js docs](https://v2.tauri.app/start/frontend/nextjs/) - "Use static exports by setting `output: 'export'`. Tauri doesn't support server-based solutions."

---

## Recommended Architecture: Electron + Embedded Next.js

### Runtime Architecture Diagram

```
+------------------------------------------------------------------+
|                        Electron Application                       |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------+       +-------------------------------+   |
|  |   Main Process    |       |      Renderer Process         |   |
|  |   (Node.js)       |       |      (Chromium WebView)       |   |
|  +-------------------+       +-------------------------------+   |
|  |                   |       |                               |   |
|  | - Window mgmt     | HTTP  |  Next.js App                  |   |
|  | - App lifecycle   |<----->|  (React components)           |   |
|  | - Auto-updater    |       |                               |   |
|  | - System tray     |       |  - Server Actions work        |   |
|  |                   |       |  - SSR works                  |   |
|  +--------+----------+       +-------------------------------+   |
|           |                                                      |
|           | spawns                                               |
|           v                                                      |
|  +-------------------+                                           |
|  | Utility Process   |                                           |
|  | (Next.js Server)  |                                           |
|  +-------------------+                                           |
|  |                   |                                           |
|  | - Standalone      |                                           |
|  |   Next.js build   |                                           |
|  | - Drizzle ORM     |                                           |
|  | - better-sqlite3  |                                           |
|  |                   |                                           |
|  +--------+----------+                                           |
|           |                                                      |
|           | reads/writes                                         |
|           v                                                      |
|  +-------------------+                                           |
|  |  SQLite Database  |                                           |
|  |  (userData dir)   |                                           |
|  +-------------------+                                           |
|  | ~/Library/Application Support/Sporttag/sporttag.db (macOS)   |
|  | %APPDATA%/Sporttag/sporttag.db (Windows)                     |
|  +-------------------+                                           |
|                                                                  |
+------------------------------------------------------------------+
```

### How Next.js Runs Inside Electron

**Approach: Embedded Standalone Server**

Next.js provides a standalone output mode (`output: 'standalone'` in next.config.ts) that bundles the application as a self-contained server. This is the recommended approach for Electron integration.

**Why standalone, not dev server:**
- Dev server: HMR, slower startup, development-only
- Standalone: Production-optimized, no external dependencies, single entry point

**Implementation pattern (from next-electron-rsc):**

1. Electron main process spawns Next.js as a utility process
2. Protocol interceptor routes requests to embedded server
3. No exposed network ports in production (security benefit)
4. Server Actions and API routes work normally

```typescript
// electron/main.ts (simplified concept)
import { app, BrowserWindow, utilityProcess } from 'electron';
import path from 'path';

let nextServer: Electron.UtilityProcess;

app.on('ready', async () => {
  // Set database path to userData before spawning
  const dbPath = path.join(app.getPath('userData'), 'sporttag.db');

  // Spawn Next.js standalone server in utility process
  nextServer = utilityProcess.fork(
    path.join(__dirname, '../.next/standalone/server.js'),
    [],
    {
      env: {
        ...process.env,
        PORT: '0',  // Random available port
        DB_PATH: dbPath
      }
    }
  );

  // Wait for server ready, get assigned port
  const port = await waitForServerReady(nextServer);

  // Create window pointing to local server
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  win.loadURL(`http://localhost:${port}`);
});
```

**Source:** [next-electron-rsc](https://github.com/kirill-konshin/next-electron-rsc) - "The library enables a unified execution context where both Electron and Next.js are running in the same context"

---

## Database File Location Strategy

### Current State
- Database: `sporttag.db` in project root (via `new Database('sporttag.db')`)
- Path hardcoded in `src/db/index.ts`

### Required Change for Desktop

**Problem:** Desktop apps need data in OS-appropriate locations:
- macOS: `~/Library/Application Support/Sporttag/`
- Windows: `%APPDATA%\Sporttag\`
- Linux: `~/.config/Sporttag/`

**Solution: Environment variable injection**

```typescript
// src/db/index.ts (modified)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Default to CWD for development, use DB_PATH env var for desktop
const dbPath = process.env.DB_PATH || 'sporttag.db';

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
```

**Backward compatible:** Development mode continues using local file. Desktop mode receives `DB_PATH` from Electron main process.

**Source:** [Electron app.getPath('userData')](https://www.electronjs.org/docs/latest/api/app) - "The directory for storing your app's configuration files, which by default is the appData directory appended with your app's name"

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Electron Main** | App lifecycle, window management, auto-update, native menus | Utility Process, Renderer |
| **Utility Process** | Runs Next.js standalone server | Main (IPC), SQLite |
| **Renderer** | Displays Next.js app in Chromium | Utility Process (HTTP) |
| **Next.js Server Actions** | Business logic, database operations | SQLite via Drizzle |
| **SQLite Database** | Data persistence | Accessed via better-sqlite3 |
| **Auto-Updater** | Checks/downloads updates from GitHub | GitHub Releases API |

### IPC Boundaries

```
Main Process <--IPC--> Renderer Process
     |
     | fork()
     v
Utility Process (Next.js)
     |
     | better-sqlite3 (native binding)
     v
SQLite File (userData directory)
```

**Key insight:** Server Actions eliminate need for custom IPC. All data flows through Next.js HTTP layer. No Electron-specific data access code needed.

---

## Build Pipeline

### Development Flow

```
npm run dev (web only)          npm run electron:dev (desktop)
      |                                |
      v                                v
Next.js Dev Server              Electron + Next.js Dev
(localhost:3000)                (hot reload supported)
      |                                |
      v                                v
Browser                         Electron window
```

### Production Build Flow

```
Step 1: Next.js Standalone Build
+--------------------------------------------------+
|  next build                                      |
|    |                                             |
|    +--> next.config.ts: output: 'standalone'    |
|    |                                             |
|    v                                             |
|  .next/standalone/                               |
|    +-- server.js         (entry point)          |
|    +-- node_modules/     (production deps)      |
|    +-- .next/            (compiled app)         |
+--------------------------------------------------+
           |
           v
Step 2: Native Module Rebuild
+--------------------------------------------------+
|  electron-rebuild -f -w better-sqlite3           |
|    |                                             |
|    +--> Recompiles native addon for Electron's  |
|         Node.js version                          |
|    |                                             |
|    v                                             |
|  node_modules/better-sqlite3/                    |
|  (now compatible with Electron)                  |
+--------------------------------------------------+
           |
           v
Step 3: Electron Package
+--------------------------------------------------+
|  electron-builder                                |
|    |                                             |
|    +--> electron-builder.yml configuration      |
|    |                                             |
|    v                                             |
|  dist/                                           |
|    +-- Sporttag-1.0.0.dmg       (macOS)         |
|    +-- Sporttag Setup 1.0.0.exe (Windows)       |
|    +-- Sporttag-1.0.0.AppImage  (Linux)         |
+--------------------------------------------------+
```

### Native Module Rebuild (Critical Step)

better-sqlite3 is a native Node.js addon that must be rebuilt for Electron's specific Node version:

```bash
# Option 1: Manual rebuild
npx electron-rebuild -f -w better-sqlite3

# Option 2: Automatic via electron-builder (recommended)
# Add to package.json:
"scripts": {
  "postinstall": "electron-builder install-app-deps"
}
```

**Source:** [better-sqlite3 Electron integration](https://dev.to/arindam1997007/a-step-by-step-guide-to-integrating-better-sqlite3-with-electron-js-app-using-create-react-app-3k16) - "electron-rebuild rebuilds native Node.js modules against the version of Node.js that your Electron project is using"

---

## File Structure Changes

### Current Structure

```
sporttag/
+-- src/
|   +-- app/          (Next.js App Router)
|   +-- components/
|   +-- db/           (Drizzle + better-sqlite3)
|   +-- lib/
+-- public/
+-- next.config.ts
+-- package.json
```

### Proposed Structure (Electron added)

```
sporttag/
+-- src/                      (unchanged)
|   +-- app/
|   +-- components/
|   +-- db/
|   |   +-- index.ts          (modified: env var for DB path)
|   +-- lib/
+-- electron/                  (NEW)
|   +-- main.ts               (Electron main process)
|   +-- preload.ts            (Context isolation bridge)
|   +-- updater.ts            (Auto-update logic)
+-- public/
+-- resources/                 (NEW)
|   +-- icon.icns             (macOS icon)
|   +-- icon.ico              (Windows icon)
|   +-- icon.png              (Linux icon)
+-- next.config.ts            (modified: output: 'standalone')
+-- electron-builder.yml      (NEW)
+-- package.json              (modified: Electron deps + scripts)
```

---

## Configuration Changes

### next.config.ts (Modified)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Electron embedding - creates self-contained build
  output: 'standalone',

  // Prevent bundling native modules and Electron itself
  serverExternalPackages: ['electron', 'better-sqlite3'],
};

export default nextConfig;
```

### electron-builder.yml (New)

```yaml
appId: "de.sporttag.app"
productName: "Sporttag"

directories:
  output: dist
  buildResources: resources

files:
  - ".next/standalone/**/*"
  - "electron/**/*"
  - "!**/*.map"
  - "!**/node_modules/electron/**/*"  # Don't bundle Electron twice

mac:
  category: "public.app-category.education"
  target:
    - dmg
    - zip
  hardenedRuntime: true
  icon: resources/icon.icns

win:
  target:
    - nsis
  icon: resources/icon.ico

linux:
  target:
    - AppImage
    - deb
  category: Education
  icon: resources/icon.png

publish:
  provider: github
  releaseType: release
```

### Package.json Scripts (To Add)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "electron:dev": "concurrently \"next dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "next build && electron-builder",
    "electron:rebuild": "electron-rebuild -f -w better-sqlite3",
    "postinstall": "electron-builder install-app-deps"
  },
  "main": "electron/main.js",
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "@electron/rebuild": "^3.7.0",
    "concurrently": "^9.0.0",
    "wait-on": "^8.0.0"
  },
  "dependencies": {
    "electron-updater": "^6.3.0"
  }
}
```

---

## Auto-Update Configuration

### electron-updater Setup

```typescript
// electron/updater.ts
import { autoUpdater } from 'electron-updater';
import { app, dialog } from 'electron';
import log from 'electron-log';

autoUpdater.logger = log;

export function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify();
}

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update verfuegbar',
    message: `Version ${info.version} ist verfuegbar und wird heruntergeladen.`,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Jetzt neu starten', 'Spaeter'],
    title: 'Update bereit',
    message: 'Ein Update wurde heruntergeladen. Moechten Sie die Anwendung neu starten?',
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

### GitHub Releases Integration

Updates are published to GitHub Releases. electron-updater checks for new releases automatically.

**Required in electron-builder.yml:**
```yaml
publish:
  provider: github
  releaseType: release
```

**Environment variable for CI:**
```bash
GH_TOKEN=your_github_token npm run electron:build -- --publish always
```

**Source:** [electron-builder auto-update docs](https://www.electron.build/auto-update.html) - "All required metadata files and artifacts are produced and published automatically... GitHub Releases supported out of the box"

---

## Build Order Dependencies

### Phase 1: Database Abstraction (Prerequisite)
- Modify `src/db/index.ts` for environment-based path
- Verify web development still works
- **Dependencies:** None
- **Enables:** All subsequent phases

### Phase 2: Electron Shell
- Create `electron/` directory structure
- Implement main process with window management
- Configure electron-builder
- Set up native module rebuild
- **Dependencies:** Phase 1
- **Enables:** Phase 3, 4

### Phase 3: Standalone Build Integration
- Modify `next.config.ts` for standalone output
- Verify standalone build works
- Test Next.js running inside Electron
- **Dependencies:** Phase 2
- **Enables:** Phase 4

### Phase 4: Auto-Update
- Configure electron-updater
- Set up GitHub releases workflow
- Test update flow
- **Dependencies:** Phases 2, 3
- **Enables:** Distribution

### Phase 5: Platform-Specific Polish
- macOS code signing (for updates to work)
- Windows installer customization
- Linux package formats
- **Dependencies:** All previous
- **Enables:** Public release

---

## Patterns to Follow

### Pattern 1: Environment-Based Configuration

**What:** Use environment variables for paths that differ between web and desktop.

**When:** Any path that needs to be different in desktop context.

**Example:**
```typescript
// Works in both web (default) and desktop (injected)
const dbPath = process.env.DB_PATH || 'sporttag.db';
const logPath = process.env.LOG_PATH || './logs';
```

### Pattern 2: Graceful Electron Detection

**What:** Check if running in Electron without hard dependency.

**When:** Features that should only work in desktop (e.g., native dialogs).

**Example:**
```typescript
const isElectron = typeof window !== 'undefined'
  && window.process?.type === 'renderer';

// Use for conditional features
if (isElectron) {
  // Show native dialog
} else {
  // Show web dialog
}
```

### Pattern 3: Utility Process for Heavy Work

**What:** Run Next.js server in Electron utility process, not main.

**When:** Any CPU-intensive or blocking operations.

**Why:** Keeps main process responsive for window management and system events.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Exposing Server Ports Externally

**What:** Running Next.js on `0.0.0.0:3000` accessible to network.

**Why bad:** Security vulnerability, other apps/users could access data.

**Instead:** Bind to `localhost` only with random port.

### Anti-Pattern 2: Bundling Electron Twice

**What:** Including Electron in both standalone build and electron-builder output.

**Why bad:** Bloated bundle size (~150MB extra).

**Prevention:**
```typescript
// next.config.ts
serverExternalPackages: ['electron']
```
```yaml
# electron-builder.yml
files:
  - "!**/node_modules/electron/**/*"
```

### Anti-Pattern 3: Hardcoded Database Paths

**What:** `new Database('./sporttag.db')` or `new Database('sporttag.db')`.

**Why bad:** Desktop apps run from `/Applications` (macOS), `C:\Program Files` (Windows), not project directory.

**Instead:** Always use `app.getPath('userData')` or environment variables.

### Anti-Pattern 4: Synchronous Database Access in Main Process

**What:** Running SQLite queries directly in Electron main process.

**Why bad:** Blocks UI rendering and system event handling.

**Instead:** Keep all database access in utility process (Next.js server).

---

## Alternative: Tauri Architecture (Not Recommended for Sporttag)

### If Tauri Were Chosen (Major Rewrite Required)

```
+------------------------------------------------------------------+
|                        Tauri Application                          |
+------------------------------------------------------------------+
|  +-------------------+       +-------------------------------+   |
|  |   Rust Backend    |       |      WebView (System)         |   |
|  |   (Main Process)  |       |      (WKWebView/WebView2)     |   |
|  +-------------------+       +-------------------------------+   |
|  |                   |       |                               |   |
|  | - Window mgmt     | IPC   |  Next.js Static Export        |   |
|  | - SQLite (rusqlite|<----->|  (NO Server Actions)          |   |
|  | - Auto-updater    |       |  (NO SSR)                     |   |
|  |                   |       |  (Client-side only)           |   |
|  +--------+----------+       +-------------------------------+   |
|           |                                                      |
|           | rusqlite                                             |
|           v                                                      |
|  +-------------------+                                           |
|  |  SQLite Database  |                                           |
|  +-------------------+                                           |
+------------------------------------------------------------------+
```

### Required Code Changes for Tauri

1. **Remove all Server Actions** (~15 files with `'use server'`)
2. **Convert to static export** (`output: 'export'`)
3. **Replace Drizzle/better-sqlite3** with Tauri SQL plugin
4. **Rewrite data access** using Tauri IPC commands

**Estimated effort:** 60% of codebase needs modification.

**Source:** [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/) - "Install JavaScript bindings and use Tauri commands for database access"

---

## Scalability Considerations

| Concern | Development | Desktop (single user) | Notes |
|---------|-------------|----------------------|-------|
| DB location | Project root | userData directory | Required change |
| Port binding | 3000 fixed | Dynamic/localhost | Prevents conflicts |
| Updates | npm install | Auto-updater | Different mechanism |
| Build size | N/A | ~150MB | Acceptable for education |
| Memory | N/A | ~250MB | Acceptable for modern machines |

---

## Sources

### High Confidence (Official Documentation)
- [Electron app.getPath()](https://www.electronjs.org/docs/latest/api/app) - userData location
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) - Build configuration
- [Tauri Next.js integration](https://v2.tauri.app/start/frontend/nextjs/) - Static export requirement
- [electron-builder auto-update](https://www.electron.build/auto-update.html) - Update configuration
- [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/) - Database integration

### Medium Confidence (Verified Community Patterns)
- [next-electron-rsc](https://github.com/kirill-konshin/next-electron-rsc) - RSC in Electron pattern
- [Nextron](https://github.com/saltyshiomix/nextron) - Next.js + Electron boilerplate
- [DoltHub Electron blog](https://www.dolthub.com/blog/2024-09-11-building-an-electron-app-with-nextjs/) - Real-world implementation
- [better-sqlite3 Electron guide](https://dev.to/arindam1997007/a-step-by-step-guide-to-integrating-better-sqlite3-with-electron-js-app-using-create-react-app-3k16) - Native module rebuild

### Comparison Sources
- [DoltHub Electron vs Tauri (2025)](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/) - Framework comparison
- [RaftLabs Tauri vs Electron](https://www.raftlabs.com/blog/tauri-vs-electron-pros-cons/) - Performance comparison
