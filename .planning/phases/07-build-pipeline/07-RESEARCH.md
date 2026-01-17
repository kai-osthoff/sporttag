# Phase 7: Build Pipeline - Research

**Researched:** 2026-01-17
**Domain:** electron-builder, GitHub Actions, macOS DMG distribution
**Confidence:** HIGH

## Summary

This research covers building and distributing a macOS universal DMG for an Electron app with better-sqlite3 native modules. The standard approach uses electron-builder with universal architecture targeting, GitHub Actions for CI/CD with tag-triggered releases, and DMG customization via backgroundColor and icon positioning.

The existing electron-builder.yml already has the foundation (identity: null for unsigned, asarUnpack for better-sqlite3). Key additions needed: universal arch target, DMG appearance customization (backgroundColor, window size, icon positions), minimumSystemVersion for macOS 12, and a GitHub Actions workflow triggered by version tags.

**Primary recommendation:** Use `arch: universal` in electron-builder config to create a single DMG containing both ARM and Intel binaries. Use `backgroundColor` (not background image) for solid dark gray DMG appearance. GitHub Actions workflow with `macos-latest` (ARM) runner can build universal binaries without needing separate Intel builds.

## Standard Stack

The established tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| electron-builder | 26.4.0 | Build and package Electron apps | De facto standard, handles universal builds |
| @electron/universal | (bundled) | Merge x64 + arm64 into universal | Used internally by electron-builder |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @electron/rebuild | 4.0.2 | Rebuild native modules | Already in project for better-sqlite3 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| electron-builder | Electron Forge | Forge is more opinionated, builder more flexible |
| Universal binary | Separate DMGs | Universal is 2x size but simpler for users |

**Installation:**
Already installed in project - no additional packages needed.

## Architecture Patterns

### electron-builder.yml Configuration

The existing config needs these additions:

```yaml
# electron-builder.yml
appId: "de.sporttag.app"
productName: "Sporttag"

directories:
  output: dist
  buildResources: resources

files:
  - "electron/**/*.js"
  - "!electron/**/*.ts"
  - "!**/*.map"

extraResources:
  - from: ".next/standalone"
    to: "standalone"
    filter:
      - "**/*"
  - from: ".next/static"
    to: "standalone/.next/static"
  - from: "public"
    to: "standalone/public"
  - from: "src/db/migrations"
    to: "standalone/src/db/migrations"

asarUnpack:
  - "**/node_modules/better-sqlite3/**/*"

mac:
  category: "public.app-category.education"
  minimumSystemVersion: "12.0"  # macOS Monterey
  identity: null  # Skip code signing
  target:
    - target: dmg
      arch: universal  # Single DMG for ARM + Intel

dmg:
  backgroundColor: "#2d2d2d"  # Dark gray
  window:
    width: 660
    height: 400
  iconSize: 100
  contents:
    - x: 180
      y: 200
      type: file
    - x: 480
      y: 200
      type: link
      path: /Applications
```

### GitHub Actions Workflow Pattern

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Build DMG
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_IDENTITY_AUTO_DISCOVERY: false
        run: npx electron-builder --mac --universal --publish always
```

### Local Build Script Pattern

```json
{
  "scripts": {
    "build:dmg": "npm run build && npx electron-builder --mac --universal --publish never"
  }
}
```

### Anti-Patterns to Avoid
- **Separate x64 and arm64 DMGs:** Users have to know their architecture - use universal instead
- **background image for solid color:** Use backgroundColor, not a PNG - simpler and more reliable
- **Manual GitHub release creation:** Use `--publish always` with tag trigger

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Universal binary creation | Manually merge binaries | electron-builder `arch: universal` | Handles ASAR merging, native modules |
| DMG creation | hdiutil commands | electron-builder dmg target | Handles icon positioning, appearance |
| Native module rebuilding | Manual node-gyp | electron-builder install-app-deps | Already in postinstall |
| GitHub release upload | API calls | electron-builder `--publish always` | Handles drafts, uploads |

**Key insight:** electron-builder handles the entire chain from Next.js output to published DMG. Adding custom scripts creates maintenance burden.

## Common Pitfalls

### Pitfall 1: Using background image for solid color
**What goes wrong:** Background image doesn't appear, stays white
**Why it happens:** Known electron-builder bugs with background images, especially in recent versions
**How to avoid:** Use `backgroundColor: "#2d2d2d"` instead of background image
**Warning signs:** DMG background is white despite config

### Pitfall 2: Not setting CSC_IDENTITY_AUTO_DISCOVERY=false in CI
**What goes wrong:** Build fails looking for code signing certificate
**Why it happens:** electron-builder auto-discovers certificates by default
**How to avoid:** Set `CSC_IDENTITY_AUTO_DISCOVERY: false` in CI environment
**Warning signs:** "Error: Unable to find certificate" in CI logs

### Pitfall 3: Expecting x64 builds on macos-14/macos-latest
**What goes wrong:** Builds for wrong architecture
**Why it happens:** macos-14+ are ARM-only runners
**How to avoid:** Use `--universal` flag which builds both architectures on single runner
**Warning signs:** Intel users can't run the app

### Pitfall 4: Unsigned apps showing "damaged" error
**What goes wrong:** Users see "App is damaged and can't be opened"
**Why it happens:** macOS quarantine attribute on downloaded apps
**How to avoid:** Document the `xattr -d com.apple.quarantine` fix (Phase 8 concern)
**Warning signs:** First-run failure reports from users

### Pitfall 5: Version mismatch between package.json and git tag
**What goes wrong:** Release has wrong version number
**Why it happens:** Manual process, easy to forget to update package.json
**How to avoid:** CI validates tag matches package.json version
**Warning signs:** DMG filename doesn't match tag

### Pitfall 6: Native modules not rebuilt for both architectures
**What goes wrong:** App crashes on one architecture
**Why it happens:** better-sqlite3 compiled for wrong arch
**How to avoid:** electron-builder handles this with universal builds, but verify asarUnpack includes the native module
**Warning signs:** "Cannot find module" errors on one platform

## Code Examples

Verified patterns from official sources:

### DMG Configuration with Solid Background Color
```yaml
# Source: https://www.electron.build/dmg.html
dmg:
  backgroundColor: "#2d2d2d"
  window:
    width: 660
    height: 400
  iconSize: 100
  iconTextSize: 14
  contents:
    - x: 180
      y: 200
      type: file
    - x: 480
      y: 200
      type: link
      path: /Applications
```

### Universal Build Target
```yaml
# Source: https://www.electron.build/mac.html
mac:
  target:
    - target: dmg
      arch: universal
  minimumSystemVersion: "12.0"
```

### GitHub Actions Tag-Triggered Release
```yaml
# Source: https://www.electron.build/publish.html
on:
  push:
    tags:
      - 'v*.*.*'

env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  CSC_IDENTITY_AUTO_DISCOVERY: false

run: npx electron-builder --mac --universal --publish always
```

### Skipping Code Signing
```yaml
# Source: https://www.electron.build/mac.html
mac:
  identity: null  # Skip code signing entirely
```

### Verifying Tag Matches package.json
```yaml
# In GitHub Actions
- name: Verify version
  run: |
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    PKG_VERSION=$(node -p "require('./package.json').version")
    if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
      echo "Tag version ($TAG_VERSION) doesn't match package.json ($PKG_VERSION)"
      exit 1
    fi
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate x64/arm64 DMGs | Universal binary | 2021 (Apple Silicon) | Single download for all Macs |
| macos-13 for Intel builds | macos-latest with --universal | 2025 | Intel runners deprecated Dec 2025 |
| background PNG for DMG | backgroundColor CSS | Ongoing | Avoids image loading bugs |
| Manual release creation | --publish always with tags | 2020+ | Automated release workflow |

**Deprecated/outdated:**
- `macos-13` runner: Being retired December 2025
- Intel-only builds: Apple ending support, Electron 40 requires macOS 12+
- Code signing for side-loaded apps: Not required, causes friction for personal/internal apps

## GitHub Actions Runner Notes

| Runner Label | Architecture | Status |
|-------------|--------------|--------|
| `macos-latest` | arm64 | Current, free for public repos |
| `macos-14` | arm64 | Standard free tier |
| `macos-15` | arm64 | Latest |
| `macos-13` | x86_64 | **Deprecated Dec 2025** |
| `macos-15-intel` | x86_64 | Available until Aug 2027 |

**Key insight:** Using `macos-latest` (ARM) with `--universal` flag builds both architectures. No need for separate Intel runner or matrix strategy.

## Open Questions

Things that couldn't be fully resolved:

1. **Icon positioning exact coordinates**
   - What we know: x/y are center of icon at 1x scale, don't include label
   - What's unclear: Exact pixel values for 660x400 window
   - Recommendation: Start with x:180/480, y:200, adjust if needed

2. **DMG backgroundColor hex format**
   - What we know: Accepts CSS color values
   - What's unclear: Whether #RGB or #RRGGBB works better
   - Recommendation: Use full #RRGGBB format (#2d2d2d)

## Sources

### Primary (HIGH confidence)
- [electron-builder DMG docs](https://www.electron.build/dmg.html) - backgroundColor, contents, window options
- [electron-builder Mac docs](https://www.electron.build/mac.html) - universal arch, minimumSystemVersion
- [electron-builder Publish docs](https://www.electron.build/publish.html) - GitHub provider, publish modes
- [electron-builder CLI docs](https://www.electron.build/cli.html) - --universal, --publish flags

### Secondary (MEDIUM confidence)
- [GitHub Actions runner-images issues](https://github.com/actions/runner-images/issues/13046) - macos-13 deprecation
- [GitHub Changelog](https://github.blog/changelog/2025-09-19-github-actions-macos-13-runner-image-is-closing-down/) - Runner architecture details
- [DEV.to Multi-OS Electron Build](https://dev.to/supersuman/multi-os-electron-build-release-with-github-actions-f3n) - Workflow patterns

### Tertiary (LOW confidence)
- Community discussions on background image issues - Use backgroundColor as workaround

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - electron-builder is de facto standard, well documented
- Architecture (universal builds): HIGH - Official electron-builder feature, widely used
- DMG customization: MEDIUM - backgroundColor works but exact icon positions need testing
- GitHub Actions workflow: HIGH - Standard patterns, verified with official docs

**Research date:** 2026-01-17
**Valid until:** 2026-03-17 (60 days - stable domain, macos-13 deprecation noted)
