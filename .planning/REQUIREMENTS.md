# Requirements: Sporttag-Anmeldeplattform

**Defined:** 2026-01-16
**Core Value:** Faire, automatisierte Zuteilung von Schuelern zu Veranstaltungen per Losverfahren

## v1 Requirements

Requirements fuer den ersten Release. Jedes Requirement wird einer Phase zugeordnet.

### Veranstaltungsverwaltung

- [x] **EVENT-01**: Lehrer kann Veranstaltung anlegen mit Name, Beschreibung und Kapazitaet
- [x] **EVENT-02**: Lehrer kann bestehende Veranstaltung bearbeiten
- [x] **EVENT-03**: Lehrer kann Veranstaltung loeschen
- [x] **EVENT-04**: System zeigt Liste aller Veranstaltungen mit aktueller Kapazitaet

### Registrierung

- [x] **REG-01**: Lehrer kann Schueler erfassen mit Vorname, Nachname und Klasse
- [x] **REG-02**: Lehrer kann fuer Schueler genau 3 Prioritaeten auswaehlen (1., 2., 3. Wahl)
- [x] **REG-03**: System validiert, dass alle 3 Prioritaeten unterschiedlich sind
- [x] **REG-04**: System validiert, dass alle Pflichtfelder ausgefuellt sind
- [x] **REG-05**: Lehrer erhaelt Bestaetigung nach erfolgreicher Registrierung
- [x] **REG-06**: System zeigt Uebersicht aller registrierten Schueler

### Zuteilung

- [x] **ALLOC-01**: System fuehrt Losverfahren durch (faire Zufallsreihenfolge)
- [x] **ALLOC-02**: Zuteilung respektiert Prioritaeten (1. Wahl wenn moeglich, sonst 2., sonst 3.)
- [x] **ALLOC-03**: Zuteilung respektiert Kapazitaetslimits der Veranstaltungen
- [x] **ALLOC-04**: Schueler ohne freien Platz in allen 3 Wuenschen landen auf Sonderliste
- [x] **ALLOC-05**: Lehrer kann Zuteilung per Button starten
- [x] **ALLOC-06**: Lehrer kann einzelne Schueler manuell einer Veranstaltung zuweisen
- [x] **ALLOC-07**: System zeigt Fairness-Statistik (% bekam 1./2./3. Wahl)

### Ausgabe

- [ ] **OUT-01**: System generiert Teilnehmerliste pro Veranstaltung
- [ ] **OUT-02**: System generiert Teilnehmerliste pro Klasse
- [ ] **OUT-03**: System generiert Sonderliste (unzugeteilte Schueler)
- [ ] **OUT-04**: Alle Listen sind als CSV exportierbar
- [ ] **OUT-05**: Alle Listen sind druckfreundlich formatiert (fuers SMV-Brett)
- [ ] **OUT-06**: System zeigt Statistik-Dashboard mit Uebersicht

## v2 Requirements

Fuer spaeteren Release. Schueler-Selbstanmeldung.

### Authentifizierung

- **AUTH-01**: Schueler kann sich selbst registrieren (ohne Lehrer)
- **AUTH-02**: System unterscheidet Rollen (Lehrer vs. Schueler)
- **AUTH-03**: Nur Lehrer koennen Veranstaltungen verwalten
- **AUTH-04**: Schueler koennen nur eigene Anmeldung abgeben

### Erweiterte Registrierung

- **REG-07**: Schueler kann eigene Anmeldung vor Deadline bearbeiten
- **REG-08**: System unterstuetzt CSV-Import von Schuelerlisten
- **REG-09**: Lehrer kann Anmeldefrist setzen (oeffnen/schliessen)

### Benachrichtigungen

- **NOTF-01**: System sendet E-Mail-Bestaetigung nach Anmeldung
- **NOTF-02**: System sendet E-Mail mit Zuteilungsergebnis

## Out of Scope

Explizit ausgeschlossen. Mit Begruendung dokumentiert.

| Feature | Grund |
|---------|-------|
| Bezahlung / Abrechnung | Nicht Teil des Sporttag-Use-Cases |
| Social Login (Google/Facebook) | Datenschutzbedenken bei Minderjaehrigen |
| Chat / Messaging | Scope Creep -- bestehende Schulkommunikation nutzen |
| Gamification (Badges, Punkte) | Unangemessen fuer Registrierungsaufgabe |
| ML-basierte "smarte" Zuteilung | Unnoetige Komplexitaet, schwer erklaerbar |
| Mehrere Sporttage parallel | Ein Sporttag pro Instanz reicht |
| Wartelisten-Automatik | Komplexitaet -- manuelle Sonderliste reicht fuer v1 |
| Echtzeit-Kapazitaetsanzeige | WebSocket-Komplexitaet -- nicht noetig bei Lehrer-Eingabe |

## Traceability

Welche Phase deckt welches Requirement ab.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EVENT-01 | Phase 1 | Complete |
| EVENT-02 | Phase 1 | Complete |
| EVENT-03 | Phase 1 | Complete |
| EVENT-04 | Phase 1 | Complete |
| REG-01 | Phase 2 | Complete |
| REG-02 | Phase 2 | Complete |
| REG-03 | Phase 2 | Complete |
| REG-04 | Phase 2 | Complete |
| REG-05 | Phase 2 | Complete |
| REG-06 | Phase 2 | Complete |
| ALLOC-01 | Phase 3 | Complete |
| ALLOC-02 | Phase 3 | Complete |
| ALLOC-03 | Phase 3 | Complete |
| ALLOC-04 | Phase 3 | Complete |
| ALLOC-05 | Phase 3 | Complete |
| ALLOC-06 | Phase 3 | Complete |
| ALLOC-07 | Phase 3 | Complete |
| OUT-01 | Phase 4 | Pending |
| OUT-02 | Phase 4 | Pending |
| OUT-03 | Phase 4 | Pending |
| OUT-04 | Phase 4 | Pending |
| OUT-05 | Phase 4 | Pending |
| OUT-06 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-01-16*
*Last updated: 2026-01-17 after roadmap creation*
