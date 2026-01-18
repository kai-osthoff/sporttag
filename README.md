# Sporttag

[![Buy me a Pizza](https://img.shields.io/badge/Buy%20me%20a-Pizza%20🍕-FFDD00?style=flat-square)](https://buymeacoffee.com/kai.osthoff)

Eine macOS-App fuer die faire Zuteilung von Schuelern zu Veranstaltungen am Sporttag.

Die App ermoeglicht dir, Veranstaltungen anzulegen, Schueler mit drei Wunschprioritaeten anzumelden und diese dann per Losverfahren fair auf die Veranstaltungen zu verteilen. Perfekt fuer Schulen, die ihren Sporttag organisieren moechten.

## Installation

Kopiere diesen Befehl und fuehre ihn im Terminal aus:

```bash
curl -fsSL https://raw.githubusercontent.com/kai-osthoff/sporttag/main/scripts/install.sh | bash
```

Die Installation dauert etwa 30 Sekunden. Danach startet Sporttag automatisch.

### Terminal oeffnen

1. Druecke `Cmd + Leertaste` (Spotlight oeffnet sich)
2. Tippe `Terminal`
3. Druecke `Enter`

### Befehl ausfuehren

1. Kopiere den Befehl oben mit `Cmd + C`
2. Fuege ihn im Terminal ein mit `Cmd + V`
3. Druecke `Enter`

### Was passiert bei der Installation?

Das Script:
- Erkennt automatisch deinen Mac-Typ (Apple Silicon oder Intel)
- Laedt die passende Version von Sporttag herunter
- Installiert die App nach /Applications
- Entfernt die macOS-Sicherheitssperre
- Startet Sporttag

Funktioniert auf Apple Silicon (M-Chips) und Intel Macs.

### Warum wird eine Sicherheitssperre entfernt?

macOS blockiert Apps, die nicht von Apple signiert sind. Eine solche Signatur kostet $99 pro Jahr - als kostenloses Open-Source-Projekt verzichten wir darauf.

Das Script entfernt lediglich die Blockade fuer diese eine App. Dein Mac bleibt weiterhin geschuetzt. Du kannst den gesamten Quellcode hier auf GitHub einsehen.

### Manuelle Installation (ohne Terminal)

Falls du die App lieber manuell installieren moechtest:

1. Lade die DMG-Datei herunter: [Sporttag herunterladen](https://github.com/kai-osthoff/sporttag/releases/latest)
   - **Apple Silicon** (M1/M2/M3/M4): `Sporttag-X.X.X-arm64.dmg`
   - **Intel Mac**: `Sporttag-X.X.X.dmg`

2. Oeffne die DMG und ziehe Sporttag in den Applications-Ordner

3. Beim ersten Start erscheint eine Sicherheitswarnung. So umgehst du sie:

   **Option A (empfohlen):**
   ```bash
   xattr -r -d com.apple.quarantine /Applications/Sporttag.app 2>/dev/null
   ```

   **Option B (ohne Terminal):**
   - Rechtsklick auf Sporttag.app in /Applications
   - "Oeffnen" waehlen
   - Im Dialog nochmals "Oeffnen" klicken

4. Danach startet die App normal

## Features

- **Veranstaltungen verwalten** - Lege Sportarten mit Kapazitaetsgrenzen an
- **Schueler anmelden** - Erfasse Name, Klasse und drei Wunschprioritaeten
- **Faires Losverfahren** - Automatische Zuteilung basierend auf Prioritaeten
- **Druckbare Listen** - Generiere Teilnehmerlisten fuers SMV-Brett

## Datensicherheit

- Alle Daten bleiben lokal auf deinem Mac
- Keine Cloud, keine Internetverbindung noetig
- Datenbank-Speicherort: `~/Library/Application Support/Sporttag/`

## Updates

Fuehre den Installationsbefehl einfach erneut aus - die neue Version wird automatisch installiert.

```bash
curl -fsSL https://raw.githubusercontent.com/kai-osthoff/sporttag/main/scripts/install.sh | bash
```

Deine Daten bleiben dabei erhalten.

## Entwicklung

Der Quellcode ist Open Source und auf GitHub verfuegbar:
https://github.com/kai-osthoff/sporttag

Feedback und Beitraege sind herzlich willkommen!

## Lizenz

Dieses Projekt steht unter der [GNU Affero General Public License v3.0](LICENSE).

**Fuer Lehrkraefte und Schulen:** Kostenlos nutzbar, auch Anpassungen (Forks) sind erlaubt.

**Fuer kommerzielle Softwareanbieter:** Wenn du Sporttag in ein kommerzielles Produkt einbinden moechtest, ohne deinen Quellcode unter AGPL zu veroeffentlichen, kontaktiere mich fuer eine kommerzielle Lizenz:

📧 [kai.osthoff@gmail.com](mailto:kai.osthoff@gmail.com)

---

*Entwickelt fuer Schulen in Deutschland*
