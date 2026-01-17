# Technology Stack: macOS Desktop Distribution (v2.0)

**Project:** Sporttag Desktop App
**Researched:** 2026-01-17
**Milestone:** v2.0 - Desktop Distribution
**Focus:** Packaging Next.js + SQLite app for macOS with one-command install and auto-updates

---

## Executive Recommendation

**Use Electron with electron-builder, NOT Tauri.**

Despite Tauri's smaller bundle size (~2.5MB vs ~85MB) and modern Rust architecture, **Electron is the pragmatic choice** for this project because:

| Factor | Electron | Tauri | Winner |
|--------|----------|-------|--------|
| SQLite compatibility | better-sqlite3 works directly | Requires Rust rewrite (sqlx/rusqlite) | Electron |
| Learning curve | Pure JavaScript/TypeScript | Requires Rust for backend | Electron |
| Existing codebase | Minimal changes | Major refactoring | Electron |
| Update mechanism | electron-updater (battle-tested) | Requires signing key setup | Electron |
| Bundle size | ~85MB | ~2.5MB | Tauri |
| Memory usage | ~250MB | ~30MB | Tauri |

**Bottom line:** Tauri wins on performance metrics, but Electron wins on developer effort. Your existing `better-sqlite3` + Drizzle ORM stack runs directly in Electron. With Tauri, you'd rewrite all database code.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Electron** | ^34.0.0 | Desktop wrapper | Industry standard; Node.js runtime preserves better-sqlite3 |
| **electron-builder** | ^26.0.0 | Build/package | DMG generation, auto-updater, GitHub publish |
| **electron-updater** | ^6.0.0 | Auto-updates | GitHub Releases integration, macOS DMG support |

### Next.js Integration

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Nextron** | ^9.5.0 | Next.js + Electron | Handles dev/prod switching, static export |
| **next** (existing) | 16.1.3 | Frontend | Requires `output: 'export'` for Electron |

### Native Module Support

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **better-sqlite3** (existing) | ^12.6.2 | SQLite | Already in use, works in Electron main process |
| **electron-rebuild** | ^3.6.0 | Native rebuild | Rebuilds better-sqlite3 for Electron's Node version |

### Distribution

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **GitHub Releases** | - | Hosting | Free, integrates with electron-updater |
| **Custom curl script** | - | Installation | Bypasses Gatekeeper via xattr removal |

---

## Critical Architecture Change: Static Export

Your current app uses Next.js Server Actions and API routes. **For Electron, you must convert to static export.**

### What Changes

```javascript
// next.config.mjs - REQUIRED changes
const nextConfig = {
  output: 'export',           // REQUIRED: Generates static HTML
  images: {
    unoptimized: true,        // REQUIRED: Image optimization incompatible with SSG
  },
  trailingSlash: true,        // Recommended for file:// protocol
};
```

### Impact

| Feature | Web App (Current) | Desktop App (v2.0) |
|---------|-------------------|---------------------|
| Server Actions | Works | NOT supported |
| API Routes | Works | NOT supported |
| SSR | Works | NOT supported |
| Static pages | Works | Works |
| Data fetching | Server-side | Via Electron IPC |

### Migration Path

```
CURRENT (Web):
Browser → Server Action → better-sqlite3 → SQLite

DESKTOP:
Renderer (React) → IPC → Main Process → better-sqlite3 → SQLite
```

All database operations move from Next.js server actions to Electron IPC handlers.

---

## Project Structure

```
sporttag/
├── main/                    # Electron main process (NEW)
│   ├── index.ts             # Main entry point
│   ├── ipc/                 # IPC handlers
│   │   ├── students.ts      # Student CRUD
│   │   ├── events.ts        # Event CRUD
│   │   └── allocation.ts    # Lottery operations
│   ├── database.ts          # better-sqlite3 + Drizzle
│   └── updater.ts           # Auto-update logic
├── renderer/                # Next.js app (MOVED from src/)
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   └── out/                 # Static export output
├── resources/               # App resources
│   └── icon.icns            # macOS app icon
├── electron-builder.config.js
├── nextron.config.js
└── package.json
```

---

## electron-builder Configuration

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'de.schule.sporttag',
  productName: 'Sporttag',

  mac: {
    target: ['dmg'],
    category: 'public.app-category.education',
    identity: null,  // Unsigned - see code signing section
    icon: 'resources/icon.icns',
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    window: { width: 540, height: 380 }
  },

  directories: {
    output: 'dist',
    buildResources: 'resources'
  },

  files: [
    'main/**/*',
    'renderer/out/**/*',
    '!**/*.map'
  ],

  asarUnpack: [
    '**/node_modules/better-sqlite3/**/*'  // Native modules outside ASAR
  ],

  extraResources: [
    { from: 'resources/', to: '.' }
  ],

  publish: {
    provider: 'github',
    owner: 'YOUR_GITHUB_USERNAME',
    repo: 'sporttag'
  }
};
```

### Key Configuration Notes

- **`asarUnpack`**: better-sqlite3 is a native module and cannot be inside the ASAR archive
- **`identity: null`**: Skips code signing (see code signing section)
- **`publish.provider: 'github'`**: electron-updater will check GitHub Releases

---

## Auto-Update Implementation

```typescript
// main/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow } from 'electron';

// Configure updater
autoUpdater.autoDownload = false;  // Let user decide
autoUpdater.autoInstallOnAppQuit = true;

export function initUpdater(mainWindow: BrowserWindow) {
  // Check on startup (after 3 seconds)
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000);

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update verfugbar',
      message: `Version ${info.version} ist verfugbar. Jetzt herunterladen?`,
      buttons: ['Ja', 'Spater'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update bereit',
      message: 'Update wurde heruntergeladen. Die App wird jetzt neu gestartet.',
      buttons: ['Jetzt neustarten'],
    }).then(() => {
      autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    // Silent fail - don't bother user with update errors
  });
}
```

### GitHub Release Structure

When you publish a release, electron-builder creates:

```
v1.0.0/
├── Sporttag-1.0.0.dmg           # macOS installer
├── Sporttag-1.0.0-mac.zip       # macOS zip (for auto-update)
├── latest-mac.yml               # Update manifest
└── ...
```

The `latest-mac.yml` contains version info that electron-updater checks.

---

## Code Signing Strategy

### The Problem

macOS Gatekeeper blocks unsigned apps downloaded from the internet:

| macOS Version | Unsigned App Behavior |
|---------------|----------------------|
| Pre-Sequoia | Control-click → "Open Anyway" |
| Sequoia (2024+) | System Settings → Privacy & Security → "Open Anyway" |

Apple Developer ID costs **$99/year**.

### Recommended Approach: curl Installer Script

Since your target is non-technical teachers at a single school, use a **curl-based installer** that:

1. Downloads DMG from GitHub Releases
2. Mounts DMG, copies .app to /Applications
3. **Removes quarantine attribute** (`xattr -dr com.apple.quarantine`)
4. Cleans up

**Why this works:** `curl` downloads do NOT set the quarantine attribute. The script removes any existing quarantine.

### Installer Script

```bash
#!/bin/bash
# install-sporttag.sh
# Usage: curl -fsSL https://raw.githubusercontent.com/USERNAME/sporttag/main/install.sh | bash

set -e

APP_NAME="Sporttag"
GITHUB_REPO="YOUR_USERNAME/sporttag"
INSTALL_DIR="/Applications"
DATA_DIR="$HOME/Library/Application Support/Sporttag"

echo "=== Sporttag Installer ==="
echo ""

# Check for existing installation
if [ -d "$INSTALL_DIR/$APP_NAME.app" ]; then
    echo "Vorhandene Installation gefunden. Wird aktualisiert..."
fi

# Get latest release URL from GitHub API
echo "Suche neueste Version..."
LATEST_URL=$(curl -sL "https://api.github.com/repos/$GITHUB_REPO/releases/latest" \
    | grep "browser_download_url.*\.dmg" \
    | head -1 \
    | cut -d '"' -f 4)

if [ -z "$LATEST_URL" ]; then
    echo "Fehler: Konnte keine Version finden."
    exit 1
fi

VERSION=$(echo "$LATEST_URL" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "Version $VERSION wird installiert..."

# Download to temp
TEMP_DMG=$(mktemp).dmg
echo "Herunterladen..."
curl -L --progress-bar "$LATEST_URL" -o "$TEMP_DMG"

# Mount DMG
echo "DMG einbinden..."
MOUNT_POINT=$(hdiutil attach "$TEMP_DMG" -nobrowse -quiet | grep "/Volumes" | awk '{print $NF}')

if [ -z "$MOUNT_POINT" ]; then
    echo "Fehler: DMG konnte nicht eingebunden werden."
    rm -f "$TEMP_DMG"
    exit 1
fi

# Remove existing installation
if [ -d "$INSTALL_DIR/$APP_NAME.app" ]; then
    rm -rf "$INSTALL_DIR/$APP_NAME.app"
fi

# Copy app
echo "Kopiere nach $INSTALL_DIR..."
cp -R "$MOUNT_POINT/$APP_NAME.app" "$INSTALL_DIR/"

# CRITICAL: Remove quarantine attribute (bypasses Gatekeeper)
xattr -dr com.apple.quarantine "$INSTALL_DIR/$APP_NAME.app" 2>/dev/null || true

# Unmount and cleanup
hdiutil detach "$MOUNT_POINT" -quiet
rm -f "$TEMP_DMG"

# Create data directory
mkdir -p "$DATA_DIR"

echo ""
echo "=== Installation abgeschlossen! ==="
echo ""
echo "Sporttag kann jetzt gestartet werden:"
echo "  - Im Finder: Programme > Sporttag"
echo "  - Im Terminal: open -a Sporttag"
echo ""
echo "Daten werden gespeichert in:"
echo "  $DATA_DIR"
echo ""
```

### User Installation Command

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/sporttag/main/install.sh | bash
```

Teachers can copy-paste this single command into Terminal.

### Security Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **curl + xattr (recommended)** | Free, simple, works today | Apple may restrict in future macOS |
| Ad-hoc signing (`identity: -`) | Works on Apple Silicon locally | Still triggers Gatekeeper on download |
| Developer ID ($99/yr) | Full Gatekeeper bypass | Annual cost, certificate complexity |

**Recommendation:** Start with curl installer. If Apple tightens restrictions or distribution expands, upgrade to Developer ID.

---

## Data Location

```
~/Library/Application Support/Sporttag/
├── sporttag.db              # SQLite database
├── backups/                 # Auto-backups before updates
└── logs/                    # App logs (optional)
```

### Database Path Migration

Current code (web app):
```typescript
const sqlite = new Database('sporttag.db')  // Relative path
```

Desktop version:
```typescript
import { app } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';

const getDbPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'sporttag.db');
};

const sqlite = new Database(getDbPath());
```

### Backup Before Updates

```typescript
// main/updater.ts - Add to update-available handler
import fs from 'fs';

autoUpdater.on('update-available', async () => {
  // Backup database before update
  const dbPath = getDbPath();
  const backupDir = path.join(app.getPath('userData'), 'backups');
  const backupPath = path.join(backupDir, `sporttag-${Date.now()}.db`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.copyFileSync(dbPath, backupPath);

  // Keep only last 5 backups
  const backups = fs.readdirSync(backupDir).sort().reverse();
  backups.slice(5).forEach(f => fs.unlinkSync(path.join(backupDir, f)));
});
```

---

## Installation Commands

### Initial Setup

```bash
# Install Electron dependencies
npm install --save-dev electron electron-builder electron-rebuild

# Install electron-updater
npm install electron-updater

# Install Nextron (optional - or configure manually)
npm install --save-dev nextron
```

### Rebuild Native Modules

```bash
# CRITICAL: Rebuild better-sqlite3 for Electron's Node version
npx electron-rebuild -f -w better-sqlite3
```

Run this after:
- Initial setup
- Updating Electron version
- Updating better-sqlite3

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "electron:dev": "nextron",
    "electron:build": "nextron build",
    "electron:build:mac": "nextron build --mac",
    "electron:rebuild": "electron-rebuild -f -w better-sqlite3",
    "electron:publish": "nextron build --mac --publish always",
    "postinstall": "electron-rebuild -f -w better-sqlite3"
  }
}
```

---

## What NOT to Use

| Technology | Reason to Avoid |
|------------|-----------------|
| **Tauri** | Requires Rust; incompatible with better-sqlite3; database rewrite needed |
| **Homebrew Cask** | Requires signed apps; 5% of unsigned casks deprecated in 2025 |
| **PKG Installer** | More complex than DMG; overkill for school distribution |
| **NW.js** | Less active development; smaller ecosystem |
| **Squirrel.Windows** | Windows-only; use NSIS if Windows needed later |
| **Self-hosted update server** | Unnecessary when GitHub Releases is free |
| **Notarization without signing** | Not possible; notarization requires Developer ID |

---

## Alternatives Considered

### Tauri 2.0

**Pros:**
- ~2.5MB installer (vs Electron's ~85MB)
- ~30MB RAM usage (vs Electron's ~250MB)
- Rust security model
- Mobile support (iOS/Android)

**Cons:**
- **No Node.js runtime** - cannot use better-sqlite3 directly
- Requires rewriting database layer in Rust (sqlx or rusqlite)
- Requires learning Rust for any backend customization
- Next.js integration requires same `output: 'export'` anyway

**Verdict:** Would be ideal for a greenfield project, but migration cost is too high for existing codebase.

### Homebrew Cask

**Pros:**
- Familiar to developers
- Automatic updates via `brew upgrade`

**Cons:**
- **Requires code signing** - unsigned casks are being deprecated
- Target users (teachers) unlikely to have Homebrew installed
- Adds dependency on Homebrew ecosystem

**Verdict:** Not suitable for non-technical users without code signing.

### PKG Installer

**Pros:**
- Native macOS installer experience
- Can run scripts during install

**Cons:**
- More complex to create than DMG
- Overkill for single-app installation
- Still requires code signing for Gatekeeper

**Verdict:** DMG with drag-to-Applications is simpler and sufficient.

---

## Confidence Assessment

| Decision | Confidence | Reason |
|----------|------------|--------|
| Electron over Tauri | **HIGH** | better-sqlite3 compatibility verified; Tauri docs confirm Rust-only backend |
| electron-builder | **HIGH** | Industry standard; official Electron documentation |
| electron-updater | **HIGH** | Built into electron-builder; GitHub Releases verified |
| curl installer | **MEDIUM** | Works today; Apple may restrict xattr manipulation in future |
| Nextron | **MEDIUM** | Less frequently updated; may need manual configuration |
| Static export requirement | **HIGH** | Official Tauri/Electron docs confirm SSG-only for desktop |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Apple blocks xattr workaround | Low | High | Monitor macOS updates; budget for Developer ID |
| Electron security vulnerability | Medium | Medium | Keep Electron updated; no sensitive data |
| better-sqlite3 rebuild fails | Low | Medium | Pin versions; document rebuild steps |
| Next.js static export limitations | Low | Low | Well-documented; app is simple enough |

---

## Sources

### Framework Comparison
- [Electron vs Tauri Comparison (DoltHub)](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/)
- [Tauri vs Electron: 2025 Comparison](https://codeology.co.nz/articles/tauri-vs-electron-2025-desktop-development.html)
- [Tauri vs Electron Performance](https://www.gethopp.app/blog/tauri-vs-electron)

### Tauri + Next.js
- [Tauri v2 Next.js Documentation](https://v2.tauri.app/start/frontend/nextjs/)
- [Tauri v2 with Next.js Monorepo Guide](https://melvinoostendorp.nl/blog/tauri-v2-nextjs-monorepo-guide)
- [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/)

### Electron + Auto-Update
- [electron-builder Auto Update Documentation](https://www.electron.build/auto-update.html)
- [Electron Publishing and Updating](https://www.electronjs.org/docs/latest/tutorial/tutorial-publishing-updating)
- [update-electron-app GitHub](https://github.com/electron/update-electron-app)

### Tauri Updater
- [Tauri v2 Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Tauri Auto-Updater with GitHub](https://thatgurjot.com/til/tauri-auto-updater/)

### macOS Code Signing
- [macOS Sequoia Gatekeeper Changes](https://www.idownloadblog.com/2024/08/07/apple-macos-sequoia-gatekeeper-change-install-unsigned-apps-mac/)
- [Electron macOS Code Signing](https://www.electron.build/code-signing-mac.html)
- [macOS App Distribution Guide](https://gist.github.com/rsms/929c9c2fec231f0cf843a1a746a416f5)

### Homebrew Cask
- [Homebrew Cask Unsigned App Discussion](https://github.com/orgs/Homebrew/discussions/6482)
- [Homebrew Adding Software](https://docs.brew.sh/Adding-Software-to-Homebrew)

### Nextron
- [Nextron GitHub Repository](https://github.com/saltyshiomix/nextron)
- [Building Desktop Apps with Next.js and Electron](https://blog.logrocket.com/building-app-next-js-electron/)

### SQLite in Electron
- [Integrating better-sqlite3 with Electron](https://dev.to/arindam1997007/a-step-by-step-guide-to-integrating-better-sqlite3-with-electron-js-app-using-create-react-app-3k16)
- [SQLite with Electron Forge](https://blog.loarsaw.de/using-sqlite-with-electron-electron-forge)

---

## Roadmap Implications

### Suggested Phase Structure for v2.0

1. **Phase 1: Electron Setup**
   - Add Electron/Nextron to project
   - Configure `output: 'export'`
   - Test static export builds

2. **Phase 2: IPC Migration**
   - Move database operations to main process
   - Create IPC handlers for all CRUD operations
   - Update renderer to use IPC instead of server actions

3. **Phase 3: Data Location**
   - Implement `~/Library/Application Support/` storage
   - Add database backup before updates
   - Handle first-run vs. existing data

4. **Phase 4: Build & Distribution**
   - Configure electron-builder for DMG
   - Set up GitHub Releases publishing
   - Create curl installer script

5. **Phase 5: Auto-Update**
   - Implement electron-updater
   - Test update flow with draft releases
   - Add German language update dialogs

### Research Flags for Later Phases

- **Phase 2 (IPC Migration)**: May need deeper research on optimal IPC patterns
- **Phase 4 (Distribution)**: Test curl installer on clean macOS; may need adjustments
- **Phase 5 (Auto-Update)**: Test with actual GitHub Releases; draft releases first
