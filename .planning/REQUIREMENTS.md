# Requirements: Sporttag-Anmeldeplattform

**Defined:** 2026-01-17
**Core Value:** Faire, automatisierte Zuteilung von Schuelern zu Veranstaltungen — jetzt als native macOS App fuer nicht-technische Lehrer

## v2.0 Requirements

Requirements for Desktop Distribution milestone. Each maps to roadmap phases.

### Desktop Packaging

- [ ] **DESK-01**: App erscheint in /Applications als native macOS Anwendung
- [ ] **DESK-02**: App zeigt eigenes Fenster mit Standard macOS Verhalten (Cmd+Q beendet, X minimiert)
- [ ] **DESK-03**: App erscheint im Dock waehrend sie laeuft
- [ ] **DESK-04**: Fensterposition und -groesse werden zwischen Sessions gespeichert
- [ ] **DESK-05**: App funktioniert vollstaendig offline (keine Internetverbindung noetig fuer Kernfunktionen)

### Data Persistence

- [ ] **DATA-01**: SQLite-Datenbank wird in ~/Library/Application Support/Sporttag/ gespeichert
- [ ] **DATA-02**: Datenbank ueberlebt App-Updates ohne Datenverlust
- [ ] **DATA-03**: Bei erstem Start wird Datenbankverzeichnis automatisch erstellt

### Installation

- [ ] **INST-01**: Ein curl-Befehl im Terminal installiert die App vollstaendig
- [ ] **INST-02**: Installation funktioniert ohne Gatekeeper-Warnungen (xattr Workaround)
- [ ] **INST-03**: DMG-Datei steht auf GitHub Releases zum manuellen Download bereit
- [ ] **INST-04**: DMG zeigt visuelle Anleitung (Drag to Applications)
- [ ] **INST-05**: Installation funktioniert auf ARM (Apple Silicon) und Intel Macs

### Updates

- [ ] **UPDT-01**: App prueft bei Start ob neue Version auf GitHub Releases verfuegbar ist
- [ ] **UPDT-02**: Bei neuer Version erscheint dezenter Hinweis-Banner in der App
- [ ] **UPDT-03**: Banner enthaelt Link zum Download der neuen Version
- [ ] **UPDT-04**: User kann Banner wegklicken (nicht modal/blockierend)

### Distribution

- [ ] **DIST-01**: GitHub Repository ist public
- [ ] **DIST-02**: README enthaelt deutsche Installationsanleitung fuer nicht-technische User
- [ ] **DIST-03**: README zeigt curl-Befehl zum Kopieren
- [ ] **DIST-04**: GitHub Releases enthalten DMG fuer jede Version

## v2.1+ Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Datenschutz (aus Todos)

- **DATS-01**: Footer zeigt Datenschutz-Hinweis (Daten nur lokal gespeichert)
- **DATS-02**: Footer zeigt Credits (Frankie + Contributors)
- **DATS-03**: Einstellungen-Seite mit "Alle Daten loeschen" Funktion
- **DATS-04**: Bestaetigung vor Datenloeschung mit Warnung
- **DATS-05**: Option fuer CSV-Export vor Loeschung

### Platform Support

- **PLAT-01**: Windows Support
- **PLAT-02**: Linux Support
- **PLAT-03**: Apple Developer ID Code Signing

### Advanced Updates

- **UPDT-05**: Automatischer Download im Hintergrund
- **UPDT-06**: Ein-Klick Update ohne manuellen Download

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Windows/Linux in v2.0 | Fokus auf macOS fuer Zielgruppe (Lehrer-Macs) |
| Auto-Updates | Manuell ist transparenter, weniger Fehlerquellen |
| Apple Developer ID | $99/Jahr; curl+xattr Workaround reicht fuer Einzelschule |
| Cloud Deployment | Bleibt lokal auf Lehrer-Mac |
| In-App Backup UI | CLI/Finder genuegt, Datenbank ist eine Datei |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESK-01 | Phase 1 | Pending |
| DESK-02 | Phase 1 | Pending |
| DESK-03 | Phase 1 | Pending |
| DESK-04 | Phase 1 | Pending |
| DESK-05 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| INST-01 | Phase 4 | Pending |
| INST-02 | Phase 4 | Pending |
| INST-03 | Phase 3 | Pending |
| INST-04 | Phase 3 | Pending |
| INST-05 | Phase 3 | Pending |
| UPDT-01 | Phase 5 | Pending |
| UPDT-02 | Phase 5 | Pending |
| UPDT-03 | Phase 5 | Pending |
| UPDT-04 | Phase 5 | Pending |
| DIST-01 | Phase 3 | Pending |
| DIST-02 | Phase 4 | Pending |
| DIST-03 | Phase 4 | Pending |
| DIST-04 | Phase 3 | Pending |

**Coverage:**
- v2.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-17*
*Last updated: 2026-01-17 after initial definition*
