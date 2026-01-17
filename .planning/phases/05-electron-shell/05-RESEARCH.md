# Phase 5: Electron Shell - Research

**Researched:** 2026-01-17
**Domain:** Electron + Next.js standalone integration for macOS desktop app
**Confidence:** HIGH

## Summary

Phase 5 wraps the existing Next.js web application in Electron to create a native macOS desktop application. The approach uses Next.js `output: 'standalone'` mode, which bundles the server and dependencies into a self-contained folder that Electron spawns as a child process. This preserves all Server Actions, SSR, and the existing better-sqlite3 database layer without code changes.

Key findings:
1. **Standalone server approach is optimal** - Spawn Next.js standalone server in Electron, load UI via localhost. No IPC migration needed.
2. **better-sqlite3 requires native rebuild** - Use `electron-builder install-app-deps` postinstall hook to rebuild for Electron's Node version.
3. **Standard macOS behavior requires explicit implementation** - Cmd+Q quit, close-to-hide, window state persistence must be coded.
4. **next-electron-rsc library** provides protocol interception to avoid open localhost ports (optional but elegant).

**Primary recommendation:** Use Electron with Next.js standalone output. The embedded server approach preserves all existing functionality with minimal code changes (~5%).

## Standard Stack

The established libraries/tools for Electron + Next.js integration:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| electron | ^33.0.0 | Desktop wrapper | Industry standard; Node.js runtime preserves better-sqlite3 |
| electron-builder | ^25.0.0 | Build/package | DMG generation, auto-detection of native modules |
| electron-window-state | ^5.0.0 | Window persistence | Battle-tested, stores in userData, simple API |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @electron/rebuild | ^3.7.0 | Native module rebuild | Only if postinstall hook fails |
| concurrently | ^9.0.0 | Dev workflow | Run Next.js + Electron together in dev |
| wait-on | ^8.0.0 | Dev workflow | Wait for Next.js server before opening Electron |
| next-electron-rsc | ^0.3.0 | Protocol interception | Optional: avoid localhost port exposure |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| electron-window-state | electron-win-state | Uses electron-store, more features but larger |
| localhost server | next-electron-rsc | Cleaner (no ports) but adds complexity |
| electron-builder | electron-forge | More flexible but steeper learning curve |

**Installation:**

```bash
npm install --save-dev electron electron-builder electron-window-state concurrently wait-on @electron/rebuild
```

## Architecture Patterns

### Recommended Project Structure

```
sporttag/
├── src/                      # Next.js app (unchanged)
│   ├── app/
│   ├── components/
│   ├── db/
│   │   └── index.ts          # Modified: DB_PATH env var support
│   └── lib/
├── electron/                  # NEW: Electron main process
│   ├── main.ts               # App lifecycle, window management
│   ├── preload.ts            # Context isolation bridge (minimal)
│   └── window-state.ts       # Window position/size persistence
├── resources/                 # NEW: App resources
│   └── icon.icns             # macOS app icon
├── next.config.ts            # Modified: output: 'standalone'
├── electron-builder.yml      # NEW: Build configuration
└── package.json              # Modified: scripts + main entry
```

### Pattern 1: Embedded Standalone Server

**What:** Electron main process spawns Next.js standalone server, renderer loads UI via localhost.

**When to use:** Apps with Server Actions, SSR, or native Node modules (like better-sqlite3).

**Why:** Preserves all server-side functionality without rewriting to static export or IPC.

```typescript
// electron/main.ts (simplified)
import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let nextServer: ChildProcess | null = null;
const PORT = 3456; // Fixed port for production

async function startNextServer(): Promise<void> {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'standalone', 'server.js')
    : path.join(__dirname, '../.next/standalone/server.js');

  const dbPath = path.join(app.getPath('userData'), 'sporttag.db');

  nextServer = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: 'localhost',
      DB_PATH: dbPath,
    },
    cwd: path.dirname(serverPath),
  });

  // Wait for server ready
  await waitForServer(`http://localhost:${PORT}`);
}

app.on('ready', async () => {
  await startNextServer();
  createWindow();
});

app.on('quit', () => {
  nextServer?.kill();
});
```

**Source:** [DoltHub: Building an Electron App with Next.js](https://www.dolthub.com/blog/2024-09-11-building-an-electron-app-with-nextjs/)

### Pattern 2: macOS Standard Window Behavior

**What:** X button hides window to Dock, Cmd+Q fully quits, window state persists.

**When to use:** All macOS apps should follow platform conventions.

```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow() {
  // Load saved window state
  const windowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Register state manager
  windowState.manage(mainWindow);

  // macOS: Hide instead of close on X button
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

// Track when actually quitting via Cmd+Q or menu
app.on('before-quit', () => {
  isQuitting = true;
});

// macOS: Re-show window when dock icon clicked
app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

// macOS: Don't quit when all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Source:** [Electron app API](https://www.electronjs.org/docs/latest/api/app)

### Pattern 3: Environment-Based Database Path

**What:** Database location controlled by environment variable, defaults to project root for development.

**When to use:** Any file path that differs between web development and desktop production.

```typescript
// src/db/index.ts (modified)
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// DB_PATH injected by Electron main process in production
// Falls back to project root for web development
const dbPath = process.env.DB_PATH || 'sporttag.db';

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
```

**Source:** Prior architecture research (ARCHITECTURE-DESKTOP.md)

### Anti-Patterns to Avoid

- **Hardcoded database paths:** `new Database('./sporttag.db')` fails in packaged app since working directory is different.
- **Port 3000 exposure:** Don't bind to `0.0.0.0:3000` - use `localhost` only.
- **Bundling Electron twice:** Add `serverExternalPackages: ['electron']` to next.config.ts.
- **Synchronous operations in main process:** Keep database access in Next.js server, not main process.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Window state persistence | Custom localStorage logic | electron-window-state | Handles edge cases (multi-monitor, maximize state) |
| Native module rebuild | Manual node-gyp commands | electron-builder postinstall | Automatically matches Electron's Node version |
| Port availability check | Custom socket probe | wait-on or get-port-please | Race conditions, cross-platform |
| Standalone file copying | Manual cp commands | electron-builder extraResources | Handles paths, platform differences |
| macOS app lifecycle | Manual event handling | Follow documented patterns | Platform conventions are subtle |

**Key insight:** Electron has a mature ecosystem. Most "simple" problems have edge cases (multi-monitor setups, process signals, file permissions) that libraries already handle.

## Common Pitfalls

### Pitfall 1: Native Module Version Mismatch

**What goes wrong:** App crashes on startup with `NODE_MODULE_VERSION` error: "better_sqlite3.node was compiled against a different Node.js version."

**Why it happens:** better-sqlite3 compiled for system Node.js version, not Electron's bundled Node.js version.

**How to avoid:** Add postinstall hook to package.json:
```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps"
  }
}
```

**Warning signs:** Build succeeds but app crashes immediately on launch.

### Pitfall 2: Missing Static Assets in Standalone

**What goes wrong:** App launches but shows 404 for static files, images, or CSS.

**Why it happens:** Next.js standalone output doesn't include `public/` and `.next/static/` by default.

**How to avoid:** Configure electron-builder to copy these folders:
```yaml
# electron-builder.yml
extraResources:
  - from: ".next/standalone"
    to: "standalone"
  - from: ".next/static"
    to: "standalone/.next/static"
  - from: "public"
    to: "standalone/public"
```

**Warning signs:** App works in dev but broken in production build.

### Pitfall 3: Close Button Quits Instead of Hiding

**What goes wrong:** On macOS, clicking the red X button fully quits the app instead of hiding to Dock.

**Why it happens:** Default Electron behavior is to quit when last window closes. macOS convention is to keep app running.

**How to avoid:** Implement `close` event handler with `isQuitting` flag (see Pattern 2 above).

**Warning signs:** Users complain app behaves differently than other Mac apps.

### Pitfall 4: Server Port Conflict

**What goes wrong:** App fails to start because port 3000 is already in use by another process.

**Why it happens:** Fixed port number collision with another app or dev server.

**How to avoid:** Either use a non-standard port (e.g., 34567) or use dynamic port selection with `get-port-please`.

**Warning signs:** "EADDRINUSE" error in logs.

### Pitfall 5: Database in Wrong Location

**What goes wrong:** Data lost when app updated, or permission denied on first launch.

**Why it happens:** Database stored in app bundle (gets replaced on update) or in protected directory.

**How to avoid:** Always use `app.getPath('userData')` which maps to `~/Library/Application Support/Sporttag/`.

**Warning signs:** Data disappears after update, or "SQLITE_CANTOPEN" errors.

## Code Examples

### next.config.ts (Modified)

```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Creates self-contained build in .next/standalone
  output: 'standalone',

  // Prevent bundling Electron and native modules
  serverExternalPackages: ['electron', 'better-sqlite3'],
};

export default nextConfig;
```

### electron-builder.yml

```yaml
# Source: https://www.electron.build/configuration
appId: "de.sporttag.app"
productName: "Sporttag"

directories:
  output: dist
  buildResources: resources

# What to include in the package
files:
  - "electron/**/*"
  - "!**/*.ts"          # Exclude TypeScript sources
  - "!**/*.map"         # Exclude source maps

# Copy standalone build to resources
extraResources:
  - from: ".next/standalone"
    to: "standalone"
    filter:
      - "**/*"
  - from: ".next/static"
    to: "standalone/.next/static"
  - from: "public"
    to: "standalone/public"

# Native modules unpacked from ASAR
asarUnpack:
  - "**/node_modules/better-sqlite3/**/*"

mac:
  category: "public.app-category.education"
  target:
    - target: dmg
      arch:
        - arm64
        - x64
  icon: resources/icon.icns
  identity: null  # Unsigned - use xattr workaround

dmg:
  title: "Sporttag"
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
```

### package.json Scripts

```json
{
  "name": "sporttag",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "electron:dev": "concurrently \"next dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "next build && electron-builder --mac",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### Minimal preload.ts

```typescript
// electron/preload.ts
// Minimal preload - no IPC needed since Server Actions handle data
import { contextBridge } from 'electron';

// Expose app version for display in UI
contextBridge.exposeInMainWorld('electronAPI', {
  version: process.env.npm_package_version,
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static export + IPC | Standalone server | 2024 | Server Actions work natively |
| electron-rebuild manual | electron-builder postinstall | 2023 | Automatic native module handling |
| Custom window state | electron-window-state | Stable | Reliable multi-monitor support |
| Nextron boilerplate | Manual setup | 2025 | More control, fewer abstractions |

**Deprecated/outdated:**
- **output: 'export' for Electron:** Only needed if you can't run a server. Loses Server Actions.
- **electron-packager:** Superseded by electron-builder for most use cases.
- **Nextron for SSR apps:** Doesn't fully support Server Actions; better to configure manually.

## Open Questions

Things that couldn't be fully resolved:

1. **Development hot reload with Electron**
   - What we know: `concurrently` runs both processes; Next.js HMR works.
   - What's unclear: Does Electron window auto-refresh on file changes?
   - Recommendation: Test during implementation; may need manual refresh or electron-reload.

2. **Universal binary with native modules**
   - What we know: electron-builder supports arm64/x64 targets.
   - What's unclear: Does better-sqlite3 correctly rebuild for both architectures in universal build?
   - Recommendation: Build separate arm64 and x64 DMGs initially; merge later if needed.

3. **Protocol interception vs localhost**
   - What we know: next-electron-rsc eliminates open port.
   - What's unclear: Complexity vs. benefit for offline school environment.
   - Recommendation: Start with localhost; add protocol interception if port conflicts occur.

## Sources

### Primary (HIGH confidence)

- [Next.js output: 'standalone' docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) - Official documentation for standalone builds
- [Electron app API](https://www.electronjs.org/docs/latest/api/app) - Window lifecycle, userData path, macOS events
- [electron-builder configuration](https://www.electron.build/configuration) - Build options, extraResources, asarUnpack
- [electron-builder macOS targets](https://www.electron.build/mac.html) - DMG, universal binary, signing

### Secondary (MEDIUM confidence)

- [DoltHub: Building an Electron App with Next.js](https://www.dolthub.com/blog/2024-09-11-building-an-electron-app-with-nextjs/) - Real-world implementation walkthrough
- [electron-window-state](https://github.com/mawie81/electron-window-state) - Window state persistence library
- [next-electron-rsc](https://github.com/kirill-konshin/next-electron-rsc) - Protocol interception approach
- [Integrating better-sqlite3 with Electron](https://dev.to/arindam1997007/a-step-by-step-guide-to-integrating-better-sqlite3-with-electron-js-app-using-create-react-app-3k16) - Native module rebuild guide

### Tertiary (LOW confidence)

- [Medium: From Web to Desktop with Electron.js (May 2025)](https://medium.com/@natanael280198/from-web-to-desktop-bringing-your-next-js-app-to-life-with-electron-js-dec8a0415cc1) - General patterns
- GitHub issues on electron-builder + better-sqlite3 - Community problem-solving

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs + established patterns
- Architecture patterns: HIGH - Verified working implementations
- Pitfalls: HIGH - Multiple sources, community confirmation

**Research date:** 2026-01-17
**Valid until:** 90 days (Electron ecosystem stable, Next.js standalone mature)
