#!/bin/bash
set -e

# Konfiguration
REPO="kai-osthoff/sporttag"
APP_NAME="Sporttag"
TEMP_DMG="/tmp/Sporttag.dmg"
MOUNT_POINT="/Volumes/Sporttag"

# Aufraeumen bei Beendigung
cleanup() {
    if [ -d "$MOUNT_POINT" ]; then
        /usr/bin/hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true
    fi
    rm -f "$TEMP_DMG"
}
trap cleanup EXIT

echo ""
echo "=== Sporttag Installer ==="
echo ""

# Architektur erkennen
# WICHTIG: /usr/bin/uname verwenden, nicht nur uname
# GNU coreutils uname auf Apple Silicon gibt falschen Wert zurueck
ARCH=$(/usr/bin/uname -m)

if [ "$ARCH" = "arm64" ]; then
    DMG_SUFFIX="-arm64"
    echo "Apple Silicon (M-Chip) erkannt"
elif [ "$ARCH" = "x86_64" ]; then
    DMG_SUFFIX=""
    echo "Intel-Prozessor erkannt"
else
    echo "Fehler: Unbekannte Architektur: $ARCH" >&2
    exit 1
fi

echo ""

# Neueste Version ermitteln
echo "Pruefe neueste Version..."
VERSION=$(curl -sL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | cut -d'"' -f4 | sed 's/^v//')

if [ -z "$VERSION" ]; then
    echo "Fehler: Konnte Version nicht ermitteln" >&2
    exit 1
fi

echo "Gefunden: Version $VERSION"
echo ""

# Download
DMG_NAME="Sporttag-${VERSION}${DMG_SUFFIX}.dmg"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${DMG_NAME}"

echo "Lade ${APP_NAME} ${VERSION} herunter..."
curl -L -# -o "${TEMP_DMG}" "${DOWNLOAD_URL}"

echo ""

# Installation
echo "Installiere nach /Applications..."
/usr/bin/hdiutil attach "${TEMP_DMG}" -nobrowse -quiet
/usr/bin/rsync -a "${MOUNT_POINT}/${APP_NAME}.app" /Applications/
/usr/bin/hdiutil detach "${MOUNT_POINT}" -quiet

echo ""

# Gatekeeper-Sperre entfernen
echo "Sicherheitssperre wird entfernt..."
/usr/bin/xattr -r -d com.apple.quarantine "/Applications/${APP_NAME}.app" 2>/dev/null || true

echo ""

# Starten
echo "Starte ${APP_NAME}..."
/usr/bin/open "/Applications/${APP_NAME}.app"

echo ""
echo "Installation abgeschlossen!"
echo "${APP_NAME} wurde nach /Applications installiert."
echo ""
