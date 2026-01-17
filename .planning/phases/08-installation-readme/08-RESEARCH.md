# Phase 8: Installation + README - Research

**Researched:** 2026-01-17
**Domain:** Bash installer scripts, macOS DMG installation, German documentation
**Confidence:** HIGH

## Summary

This phase creates a one-command installation experience for non-technical German teachers. The installer script downloads the correct DMG from GitHub releases, mounts it, copies the app to Applications, removes Gatekeeper quarantine, and launches the app. The README provides step-by-step German instructions with Terminal screenshots.

The research confirms that curl-based installation is a well-established pattern used by Homebrew, Rust, and many other projects. Files downloaded via curl do not receive the quarantine attribute, but the DMG contents will still need `xattr -r -d com.apple.quarantine` after copying to Applications. Architecture detection via `uname -m` is reliable when using the system binary `/usr/bin/uname`.

**Primary recommendation:** Single bash script hosted at raw.githubusercontent.com, using system binaries for reliability, with German progress output and automatic cleanup.

## Standard Stack

No external libraries needed - pure bash with macOS system utilities.

### Core System Utilities
| Utility | Purpose | Why Standard |
|---------|---------|--------------|
| `/usr/bin/curl` | Download DMG from GitHub | Ships with macOS, no quarantine on downloaded files |
| `/usr/bin/hdiutil` | Mount/unmount DMG | macOS standard disk image utility |
| `/usr/bin/rsync` | Copy app to Applications | Preserves permissions, handles existing installation |
| `/usr/bin/xattr` | Remove quarantine flag | macOS extended attribute tool |
| `/usr/bin/uname` | Detect architecture | Must use system binary, not GNU coreutils |
| `/usr/bin/open` | Launch app after install | macOS standard app launcher |

### GitHub Infrastructure
| Component | Pattern | Purpose |
|-----------|---------|---------|
| Raw script hosting | `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` | Direct curl access to install script |
| Release downloads | `github.com/{owner}/{repo}/releases/latest/download/{file}` | Direct download URL, auto-follows redirects |
| API for latest version | `api.github.com/repos/{owner}/{repo}/releases/latest` | Get version info programmatically |

### Actual DMG Names (from v2.0.0 release)
| Architecture | DMG Filename | Download URL |
|--------------|--------------|--------------|
| ARM64 (Apple Silicon) | `Sporttag-{version}-arm64.dmg` | `https://github.com/kai-osthoff/sporttag/releases/latest/download/Sporttag-{version}-arm64.dmg` |
| x64 (Intel) | `Sporttag-{version}.dmg` | `https://github.com/kai-osthoff/sporttag/releases/latest/download/Sporttag-{version}.dmg` |

**Note:** The version number is embedded in the filename. For dynamic downloads, use the GitHub API to determine the latest version first.

## Architecture Patterns

### Recommended Script Structure
```
scripts/
  install.sh        # Main installer script
```

### Pattern 1: Architecture Detection
**What:** Detect ARM64 vs Intel to download correct DMG
**When to use:** At script start, before downloading
**Example:**
```bash
# Source: Homebrew installer pattern + community best practices
# MUST use /usr/bin/uname to avoid GNU coreutils returning wrong value
arch_name="$(/usr/bin/uname -m)"

if [ "${arch_name}" = "arm64" ]; then
    DMG_SUFFIX="-arm64"
elif [ "${arch_name}" = "x86_64" ]; then
    DMG_SUFFIX=""
else
    echo "Fehler: Unbekannte Architektur: ${arch_name}" >&2
    exit 1
fi
```

### Pattern 2: GitHub Latest Release Download
**What:** Download DMG without hardcoding version
**When to use:** For "always install latest" behavior
**Example:**
```bash
# Source: GitHub Releases API pattern
# Get latest version tag
VERSION=$(curl -sL https://api.github.com/repos/kai-osthoff/sporttag/releases/latest | grep '"tag_name"' | cut -d'"' -f4 | sed 's/^v//')

# Construct download URL
DMG_NAME="Sporttag-${VERSION}${DMG_SUFFIX}.dmg"
DOWNLOAD_URL="https://github.com/kai-osthoff/sporttag/releases/download/v${VERSION}/${DMG_NAME}"
```

### Pattern 3: DMG Mount/Copy/Unmount
**What:** Reliable DMG installation sequence
**When to use:** After downloading DMG
**Example:**
```bash
# Source: Jamf community + hdiutil man page
TEMP_DMG="/tmp/Sporttag.dmg"
MOUNT_POINT="/Volumes/Sporttag"

# Download with progress bar
curl -L -# -o "${TEMP_DMG}" "${DOWNLOAD_URL}"

# Mount silently (no Finder window)
/usr/bin/hdiutil attach "${TEMP_DMG}" -nobrowse -quiet

# Copy app (overwrites existing)
/usr/bin/rsync -a "${MOUNT_POINT}/Sporttag.app" /Applications/

# Unmount
/usr/bin/hdiutil detach "${MOUNT_POINT}" -quiet

# Cleanup temp file
rm -f "${TEMP_DMG}"
```

### Pattern 4: Gatekeeper Bypass
**What:** Remove quarantine flag from installed app
**When to use:** After copying to Applications, before first launch
**Example:**
```bash
# Source: Apple Developer Forums + Homebrew patterns
# -r = recursive (required for .app bundles)
# -d = delete specific attribute
# com.apple.quarantine = Gatekeeper's quarantine flag
/usr/bin/xattr -r -d com.apple.quarantine /Applications/Sporttag.app
```

### Pattern 5: Progress Output (German)
**What:** User-friendly German status messages
**When to use:** Throughout script execution
**Example:**
```bash
# Source: Homebrew ohai() pattern adapted for German
echo "Lade Sporttag ${VERSION} herunter..."
echo "Installiere nach /Applications..."
echo "Sicherheitssperre wird entfernt..."
echo "Starte Sporttag..."
echo ""
echo "Installation abgeschlossen!"
```

### Pattern 6: Error Handling with Cleanup
**What:** Guaranteed cleanup on error or success
**When to use:** Script header
**Example:**
```bash
# Source: Bash trap best practices
set -e  # Exit on error

cleanup() {
    # Unmount if still mounted
    [ -d "${MOUNT_POINT}" ] && /usr/bin/hdiutil detach "${MOUNT_POINT}" -quiet 2>/dev/null || true
    # Remove temp DMG
    rm -f "${TEMP_DMG}" 2>/dev/null || true
}

trap cleanup EXIT
```

### Anti-Patterns to Avoid
- **Don't use GNU coreutils uname:** On Apple Silicon with Homebrew, GNU `uname` in PATH returns `x86_64` due to Rosetta. Always use `/usr/bin/uname -m`
- **Don't use `xattr -c`:** This removes ALL extended attributes. Use `xattr -d com.apple.quarantine` to only remove quarantine
- **Don't forget -r flag:** App bundles need recursive `xattr -r -d` to clear quarantine from all contained files
- **Don't use -L for local file operations:** The `-L` flag is for curl to follow redirects, not needed for hdiutil

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON parsing | bash string parsing | `grep + cut` for simple extracts | No jq dependency needed for single field |
| Progress bars | custom echo loops | `curl -#` flag | Built-in, shows real download progress |
| File copying | `cp -r` | `rsync -a` | Better overwrites existing, preserves attrs |
| Temp file management | manual cleanup | `trap EXIT + cleanup()` | Guaranteed cleanup even on error |

**Key insight:** macOS ships with everything needed. Adding dependencies like jq would require additional installation steps.

## Common Pitfalls

### Pitfall 1: Wrong Architecture Detection
**What goes wrong:** Script detects `x86_64` on Apple Silicon Mac
**Why it happens:** User has GNU coreutils installed via Homebrew, and PATH has `/usr/local/opt/coreutils/libexec/gnubin` before system binaries
**How to avoid:** Always use full path `/usr/bin/uname -m`
**Warning signs:** ARM Mac downloads Intel DMG, app crashes or runs slowly under Rosetta

### Pitfall 2: Quarantine Not Fully Removed
**What goes wrong:** App still shows Gatekeeper warning after xattr
**Why it happens:** Only removed quarantine from outer .app, not from nested binaries
**How to avoid:** Use `-r` flag: `xattr -r -d com.apple.quarantine /Applications/Sporttag.app`
**Warning signs:** "App is damaged" error despite running xattr

### Pitfall 3: DMG Still Mounted on Error
**What goes wrong:** Script fails mid-installation, leaves DMG mounted
**Why it happens:** No cleanup trap, `set -e` exits before unmount
**How to avoid:** Use `trap cleanup EXIT` at script start
**Warning signs:** User sees Sporttag volume in Finder, can't run installer again

### Pitfall 4: Download URL 404
**What goes wrong:** curl fails to download DMG
**Why it happens:** Version mismatch between API response and actual filename
**How to avoid:** Verify DMG filename pattern matches electron-builder output (check Phase 7 build)
**Warning signs:** 404 error, download hangs

### Pitfall 5: macOS Sequoia Gatekeeper Changes (2024+)
**What goes wrong:** Right-click > Open workaround no longer works
**Why it happens:** Apple changed Gatekeeper behavior in macOS Sequoia
**How to avoid:** Our xattr approach bypasses this entirely - files from curl don't get quarantine, and we explicitly remove it from app
**Warning signs:** None if using curl + xattr approach

### Pitfall 6: Terminal Not Trusted
**What goes wrong:** xattr fails with permission error
**Why it happens:** On newer macOS, Terminal needs Full Disk Access for some operations
**How to avoid:** xattr on /Applications should work without FDA; test on fresh macOS install
**Warning signs:** "Operation not permitted" error

## Code Examples

### Complete Installer Script Pattern
```bash
#!/bin/bash
# Sporttag Installer - Deutsch
# Usage: curl -fsSL https://raw.githubusercontent.com/kai-osthoff/sporttag/main/scripts/install.sh | bash

set -e

# Configuration
REPO="kai-osthoff/sporttag"
APP_NAME="Sporttag"
TEMP_DMG="/tmp/Sporttag.dmg"
MOUNT_POINT="/Volumes/Sporttag"

# Cleanup function
cleanup() {
    [ -d "${MOUNT_POINT}" ] && /usr/bin/hdiutil detach "${MOUNT_POINT}" -quiet 2>/dev/null || true
    rm -f "${TEMP_DMG}" 2>/dev/null || true
}
trap cleanup EXIT

# Detect architecture (MUST use system binary)
arch_name="$(/usr/bin/uname -m)"
if [ "${arch_name}" = "arm64" ]; then
    DMG_SUFFIX="-arm64"
    echo "Apple Silicon (M-Chip) erkannt"
elif [ "${arch_name}" = "x86_64" ]; then
    DMG_SUFFIX=""
    echo "Intel-Prozessor erkannt"
else
    echo "Fehler: Unbekannte Architektur: ${arch_name}" >&2
    exit 1
fi

# Get latest version
echo "Pruefe neueste Version..."
VERSION=$(curl -sL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | cut -d'"' -f4 | sed 's/^v//')

if [ -z "${VERSION}" ]; then
    echo "Fehler: Konnte Version nicht ermitteln" >&2
    exit 1
fi

# Construct download URL
DMG_NAME="Sporttag-${VERSION}${DMG_SUFFIX}.dmg"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${DMG_NAME}"

# Download
echo ""
echo "Lade ${APP_NAME} ${VERSION} herunter..."
curl -L -# -o "${TEMP_DMG}" "${DOWNLOAD_URL}"

# Mount
echo ""
echo "Installiere nach /Applications..."
/usr/bin/hdiutil attach "${TEMP_DMG}" -nobrowse -quiet

# Copy (overwrites existing)
/usr/bin/rsync -a "${MOUNT_POINT}/${APP_NAME}.app" /Applications/

# Unmount
/usr/bin/hdiutil detach "${MOUNT_POINT}" -quiet

# Remove quarantine
echo "Sicherheitssperre wird entfernt..."
/usr/bin/xattr -r -d com.apple.quarantine "/Applications/${APP_NAME}.app" 2>/dev/null || true

# Launch
echo ""
echo "Starte ${APP_NAME}..."
/usr/bin/open "/Applications/${APP_NAME}.app"

echo ""
echo "Installation abgeschlossen!"
echo "${APP_NAME} wurde nach /Applications installiert."
```

### German README Terminal Section Pattern
```markdown
## Installation

Kopiere diesen Befehl und fuehre ihn im Terminal aus:

```bash
curl -fsSL https://raw.githubusercontent.com/kai-osthoff/sporttag/main/scripts/install.sh | bash
```

### Terminal oeffnen

1. Druecke **Cmd + Leertaste** (Spotlight-Suche)
2. Tippe **Terminal**
3. Druecke **Enter**

### Befehl ausfuehren

1. Kopiere den Befehl oben (markieren, dann Cmd + C)
2. Fuege ihn im Terminal ein (Cmd + V)
3. Druecke **Enter**

Die Installation dauert etwa 30 Sekunden. Danach startet Sporttag automatisch.
```

### curl Command Flags Explanation
```bash
curl -fsSL https://...
# -f = fail silently on server errors (no HTML error pages)
# -s = silent mode (no progress meter when piping)
# -S = show errors even when silent
# -L = follow redirects (GitHub redirects raw URLs)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Right-click > Open bypass | xattr removal required | macOS Sequoia (2024) | Our curl approach unaffected |
| Single universal binary | Separate arch builds | Late 2023 (native modules) | We already use separate DMGs |
| Simple cp -r | rsync -a | N/A (always better) | Cleaner overwrites |

**Current best practice (2025):**
- curl + xattr is the standard workaround for unsigned apps
- No changes expected until Apple blocks xattr (would break many developer tools)
- GitHub raw URLs remain stable for public repos

## Open Questions

Things that couldn't be fully resolved:

1. **Terminal Full Disk Access requirement**
   - What we know: xattr on /Applications should work without special permissions
   - What's unclear: Whether any macOS version requires Terminal to have FDA for xattr
   - Recommendation: Test on fresh macOS 12, 13, 14, 15 installations

2. **Rosetta 2 detection vs native ARM**
   - What we know: `sysctl -n sysctl.proc_translated` detects Rosetta
   - What's unclear: Whether we need to distinguish (our ARM DMG works on ARM natively)
   - Recommendation: Not needed - just detect architecture, Rosetta handles Intel DMG on ARM

3. **Error message localization**
   - What we know: German output decided in context
   - What's unclear: Whether to support English fallback
   - Recommendation: German only (per context decisions), keep messages simple

## Sources

### Primary (HIGH confidence)
- [Homebrew Installer](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh) - Architecture detection, error handling patterns
- [hdiutil Man Page](https://ss64.com/mac/hdiutil.html) - DMG mount/unmount commands
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases) - Latest release endpoint

### Secondary (MEDIUM confidence)
- [Jamf Community DMG Scripts](https://community.jamf.com/t5/jamf-pro/script-for-installing-dmg-pkg-zip-via-curl/m-p/157800) - Installation patterns
- [hdiutil Guide on putnamhill gist](https://gist.github.com/putnamhill/5aeeeeb273eb57f4ce7b39b49a28a376) - Mount point capture
- [Apple Developer Forums on xattr](https://developer.apple.com/forums/thread/706442) - Quarantine removal

### Tertiary (LOW confidence - community patterns)
- [Homebrew Discussion on uname](https://github.com/orgs/Homebrew/discussions/2226) - Architecture detection caveat
- [TechBloat on Sequoia Gatekeeper](https://www.techbloat.com/macos-sequoia-bypassing-gatekeeper-to-install-unsigned-apps.html) - Sequoia changes
- [heise.de Terminal Guide](https://www.heise.de/tipps-tricks/Mac-Terminal-oeffnen-so-geht-s-3998986.html) - German Terminal instructions

## Metadata

**Confidence breakdown:**
- Architecture detection: HIGH - Verified with Homebrew patterns and multiple sources
- DMG handling: HIGH - hdiutil is well-documented system utility
- xattr/Gatekeeper: HIGH - Apple Developer Forums confirms approach
- GitHub URLs: HIGH - API documentation is official
- Error handling: MEDIUM - Bash trap patterns are community best practices
- German README: MEDIUM - Based on general documentation patterns

**Research date:** 2026-01-17
**Valid until:** 2026-04-17 (macOS patterns stable; check if Sequoia changes affect xattr)
