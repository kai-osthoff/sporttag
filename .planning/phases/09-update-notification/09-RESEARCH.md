# Phase 9: Update Notification - Research

**Researched:** 2026-01-17
**Domain:** Electron IPC, GitHub API, Semantic Versioning, React UI
**Confidence:** HIGH

## Summary

This phase implements a non-blocking update notification system for the Sporttag Electron app. When the app launches, it checks GitHub Releases API for newer versions and displays a dismissible banner if an update is available.

The implementation requires extending the existing Electron IPC architecture (currently minimal - only `isElectron` flag exposed) to support:
1. Exposing the app version from main process to renderer via IPC
2. Opening external URLs via `shell.openExternal` through IPC (security best practice)

The version check itself can be done client-side in the renderer using standard `fetch()` since the GitHub API is publicly accessible. Semantic version comparison should use the `semver` library (npm's official implementation) rather than hand-rolling string comparisons.

**Primary recommendation:** Extend preload.ts to expose `getVersion()` and `openExternal()` via IPC, implement a client-side React hook for version checking, and create a full-width banner component that sits above MainNav.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| semver | ^7.6.x | Semantic version comparison | npm's official implementation, used by npm itself |
| lucide-react | ^0.562.0 | Icons (X, ExternalLink, AlertCircle) | Already in project |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Electron shell | Built-in | Opening external URLs | `shell.openExternal()` for GitHub releases link |
| Electron app | Built-in | Getting app version | `app.getVersion()` reads from package.json |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| semver | compare-versions | Smaller bundle, but less battle-tested |
| semver | Hand-rolled comparison | DON'T - edge cases with prerelease versions |
| Client-side fetch | Main process fetch | Unnecessary complexity - GitHub API is public |

**Installation:**
```bash
npm install semver
npm install -D @types/semver
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── update-banner.tsx      # Update notification banner (new)
├── hooks/
│   └── use-update-check.ts    # Version check hook (new)
├── lib/
│   └── version.ts             # Version comparison utilities (new)
electron/
├── main.ts                    # Add IPC handlers (modify)
├── preload.ts                 # Expose APIs via contextBridge (modify)
```

### Pattern 1: IPC for Main Process APIs
**What:** Expose main process functions to renderer via contextBridge
**When to use:** Accessing Electron APIs that only work in main process
**Example:**
```typescript
// Source: https://www.electronjs.org/docs/latest/tutorial/ipc

// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
});

// main.ts
import { ipcMain, shell, app } from 'electron';

ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('shell:open-external', (_event, url: string) => {
  // Security: Validate URL before opening
  if (url.startsWith('https://github.com/')) {
    return shell.openExternal(url);
  }
  throw new Error('Invalid URL');
});
```

### Pattern 2: Client-Side Version Check with useEffect
**What:** Fetch GitHub releases on mount, handle errors gracefully
**When to use:** Non-blocking background checks on app launch
**Example:**
```typescript
// Source: https://nextjs.org/docs/pages/building-your-application/data-fetching/client-side

'use client';
import { useEffect, useState } from 'react';

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    async function checkForUpdate() {
      try {
        const currentVersion = await window.electronAPI?.getVersion();
        if (!currentVersion) return;

        const response = await fetch(
          'https://api.github.com/repos/kai-osthoff/sporttag/releases/latest',
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error('API request failed');

        const release = await response.json();
        // Compare versions...
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Konnte nicht nach Updates pruefen');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    checkForUpdate();
    return () => controller.abort();
  }, []);

  return { updateInfo, error };
}
```

### Pattern 3: Dismissible Banner Component
**What:** Full-width banner at top of page with dismiss functionality
**When to use:** Non-blocking notifications that need visibility
**Example:**
```typescript
// Based on existing codebase patterns (cn utility, Button component)
'use client';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpdateBannerProps {
  version: string;
  url: string;
  onDismiss: () => void;
}

export function UpdateBanner({ version, url, onDismiss }: UpdateBannerProps) {
  const handleOpenUrl = async () => {
    await window.electronAPI?.openExternal(url);
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between print:hidden">
      <span>Version {version} ist verfuegbar</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleOpenUrl}>
          <ExternalLink className="h-4 w-4 mr-1" />
          Herunterladen
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Exposing full ipcRenderer:** Security risk - wrap specific calls only
- **Blocking app launch:** Check should be async, app loads immediately
- **Storing dismiss state in localStorage:** Requirements specify session-only dismiss
- **Direct version string comparison:** "1.9.0" > "1.10.0" is true lexicographically

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Semver comparison | String comparison or regex parsing | `semver.gt()` | Handles prerelease, build metadata, edge cases |
| Fetch timeout | Manual setTimeout + state tracking | `AbortSignal.timeout(10000)` | Cleaner API, proper cleanup |
| External URL opening | `window.open()` or direct shell access | IPC + shell.openExternal | Security, proper browser launch |

**Key insight:** Version comparison looks simple ("just split on dots and compare numbers") but semver has many edge cases: prerelease versions (1.0.0-alpha < 1.0.0), build metadata (1.0.0+build), and the npm ecosystem expects proper semver handling.

## Common Pitfalls

### Pitfall 1: Version Tag Format Mismatch
**What goes wrong:** GitHub tag is "v1.2.3" but package.json has "1.2.3"
**Why it happens:** GitHub releases typically use "v" prefix, package.json doesn't
**How to avoid:** Use `semver.coerce()` or strip "v" prefix before comparison
**Warning signs:** All versions appear "newer" or comparison always fails

### Pitfall 2: Security Vulnerability in openExternal
**What goes wrong:** Arbitrary URL execution allows malicious links
**Why it happens:** Not validating URLs before passing to shell.openExternal
**How to avoid:** Whitelist only `https://github.com/kai-osthoff/sporttag` URLs
**Warning signs:** Security audit flags, Electron security warnings

### Pitfall 3: Fetch Without Cleanup
**What goes wrong:** State updates after component unmount
**Why it happens:** useEffect cleanup not aborting in-flight requests
**How to avoid:** Use AbortController and return cleanup function
**Warning signs:** React warnings about state updates on unmounted components

### Pitfall 4: Blocking User Interaction
**What goes wrong:** Banner covers content or prevents clicks
**Why it happens:** Incorrect z-index or positioning
**How to avoid:** Banner should push content down, not overlay; ensure dismiss works
**Warning signs:** User cannot click navigation while banner visible

### Pitfall 5: API Rate Limiting
**What goes wrong:** GitHub API returns 403 after many checks
**Why it happens:** Unauthenticated GitHub API has 60 requests/hour limit
**How to avoid:** Only check once on app launch (as specified), handle 403 gracefully
**Warning signs:** Update check works in dev but fails in production

## Code Examples

Verified patterns from official sources:

### GitHub Releases API Response
```typescript
// Source: https://docs.github.com/en/rest/releases/releases#get-the-latest-release
// GET https://api.github.com/repos/kai-osthoff/sporttag/releases/latest

interface GitHubRelease {
  tag_name: string;    // "v1.2.3" - the version tag
  html_url: string;    // URL to release page
  name: string;        // Release title
  published_at: string; // ISO date
  prerelease: boolean;  // Skip prereleases
  draft: boolean;       // Skip drafts
}

// The /latest endpoint already filters to "most recent non-prerelease, non-draft release"
```

### Semver Comparison
```typescript
// Source: https://github.com/npm/node-semver
import { gt, coerce } from 'semver';

const currentVersion = '1.0.0';
const latestTag = 'v1.2.3';

// coerce handles "v" prefix and partial versions
const latestVersion = coerce(latestTag);
if (latestVersion && gt(latestVersion, currentVersion)) {
  console.log('Update available!');
}
```

### TypeScript Declaration for Window API
```typescript
// src/types/electron.d.ts
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

export {};
```

### Error Banner Variant
```typescript
// Same component, different props for error state
<div className="bg-muted text-muted-foreground px-4 py-2 flex items-center justify-between print:hidden">
  <span>Konnte nicht nach Updates pruefen</span>
  <Button variant="ghost" size="icon-sm" onClick={onDismiss}>
    <X className="h-4 w-4" />
  </Button>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual setTimeout for fetch | AbortSignal.timeout() | 2022 | Cleaner timeout handling |
| nodeIntegration: true | contextBridge + IPC | Electron 12 (2021) | Required for security |
| window.require('electron') | contextBridge.exposeInMainWorld | Electron 12 (2021) | Context isolation default |

**Deprecated/outdated:**
- `nodeIntegration: true` - Major security risk, disabled by default since Electron 12
- Direct `require('electron')` in renderer - Blocked by context isolation

## Open Questions

Things that couldn't be fully resolved:

1. **Exact timeout value**
   - What we know: Network requests need reasonable timeout (5-15s typical)
   - What's unclear: Optimal value for typical school network conditions
   - Recommendation: Start with 10 seconds, adjust if users report issues

2. **Error message display duration**
   - What we know: Error banner should be dismissible
   - What's unclear: Should error banner auto-dismiss after some time?
   - Recommendation: Keep consistent with update banner - manual dismiss only

## Sources

### Primary (HIGH confidence)
- Electron IPC Tutorial: https://www.electronjs.org/docs/latest/tutorial/ipc
- Electron shell API: https://www.electronjs.org/docs/latest/api/shell
- Electron app.getVersion: https://www.electronjs.org/docs/latest/api/app#appgetversion
- GitHub Releases API: https://docs.github.com/en/rest/releases/releases#get-the-latest-release
- npm semver: https://github.com/npm/node-semver
- shadcn/ui Alert: https://ui.shadcn.com/docs/components/alert

### Secondary (MEDIUM confidence)
- Next.js client-side fetching: https://nextjs.org/docs/pages/building-your-application/data-fetching/client-side
- AbortController pattern: https://dmitripavlutin.com/timeout-fetch-request/

### Tertiary (LOW confidence)
- None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - semver is npm's official, Electron APIs well-documented
- Architecture: HIGH - Follows established Electron IPC patterns
- Pitfalls: HIGH - Based on official security documentation

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (stable domain, Electron patterns mature)
