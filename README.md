# Sporttag

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

---

*Entwickelt fuer Schulen in Deutschland*
