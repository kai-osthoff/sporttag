# Requirements: Sporttag-Anmeldeplattform

**Defined:** 2026-01-16
**Core Value:** Faire, automatisierte Zuteilung von Schülern zu Veranstaltungen per Losverfahren

## v1 Requirements

Requirements für den ersten Release. Jedes Requirement wird einer Phase zugeordnet.

### Veranstaltungsverwaltung

- [ ] **EVENT-01**: Lehrer kann Veranstaltung anlegen mit Name, Beschreibung und Kapazität
- [ ] **EVENT-02**: Lehrer kann bestehende Veranstaltung bearbeiten
- [ ] **EVENT-03**: Lehrer kann Veranstaltung löschen
- [ ] **EVENT-04**: System zeigt Liste aller Veranstaltungen mit aktueller Kapazität

### Registrierung

- [ ] **REG-01**: Lehrer kann Schüler erfassen mit Vorname, Nachname und Klasse
- [ ] **REG-02**: Lehrer kann für Schüler genau 3 Prioritäten auswählen (1., 2., 3. Wahl)
- [ ] **REG-03**: System validiert, dass alle 3 Prioritäten unterschiedlich sind
- [ ] **REG-04**: System validiert, dass alle Pflichtfelder ausgefüllt sind
- [ ] **REG-05**: Lehrer erhält Bestätigung nach erfolgreicher Registrierung
- [ ] **REG-06**: System zeigt Übersicht aller registrierten Schüler

### Zuteilung

- [ ] **ALLOC-01**: System führt Losverfahren durch (faire Zufallsreihenfolge)
- [ ] **ALLOC-02**: Zuteilung respektiert Prioritäten (1. Wahl wenn möglich, sonst 2., sonst 3.)
- [ ] **ALLOC-03**: Zuteilung respektiert Kapazitätslimits der Veranstaltungen
- [ ] **ALLOC-04**: Schüler ohne freien Platz in allen 3 Wünschen landen auf Sonderliste
- [ ] **ALLOC-05**: Lehrer kann Zuteilung per Button starten
- [ ] **ALLOC-06**: Lehrer kann einzelne Schüler manuell einer Veranstaltung zuweisen
- [ ] **ALLOC-07**: System zeigt Fairness-Statistik (% bekam 1./2./3. Wahl)

### Ausgabe

- [ ] **OUT-01**: System generiert Teilnehmerliste pro Veranstaltung
- [ ] **OUT-02**: System generiert Teilnehmerliste pro Klasse
- [ ] **OUT-03**: System generiert Sonderliste (unzugeteilte Schüler)
- [ ] **OUT-04**: Alle Listen sind als CSV exportierbar
- [ ] **OUT-05**: Alle Listen sind druckfreundlich formatiert (fürs SMV-Brett)
- [ ] **OUT-06**: System zeigt Statistik-Dashboard mit Übersicht

## v2 Requirements

Für späteren Release. Schüler-Selbstanmeldung.

### Authentifizierung

- **AUTH-01**: Schüler kann sich selbst registrieren (ohne Lehrer)
- **AUTH-02**: System unterscheidet Rollen (Lehrer vs. Schüler)
- **AUTH-03**: Nur Lehrer können Veranstaltungen verwalten
- **AUTH-04**: Schüler können nur eigene Anmeldung abgeben

### Erweiterte Registrierung

- **REG-07**: Schüler kann eigene Anmeldung vor Deadline bearbeiten
- **REG-08**: System unterstützt CSV-Import von Schülerlisten
- **REG-09**: Lehrer kann Anmeldefrist setzen (öffnen/schließen)

### Benachrichtigungen

- **NOTF-01**: System sendet E-Mail-Bestätigung nach Anmeldung
- **NOTF-02**: System sendet E-Mail mit Zuteilungsergebnis

## Out of Scope

Explizit ausgeschlossen. Mit Begründung dokumentiert.

| Feature | Grund |
|---------|-------|
| Bezahlung / Abrechnung | Nicht Teil des Sporttag-Use-Cases |
| Social Login (Google/Facebook) | Datenschutzbedenken bei Minderjährigen |
| Chat / Messaging | Scope Creep — bestehende Schulkommunikation nutzen |
| Gamification (Badges, Punkte) | Unangemessen für Registrierungsaufgabe |
| ML-basierte "smarte" Zuteilung | Unnötige Komplexität, schwer erklärbar |
| Mehrere Sporttage parallel | Ein Sporttag pro Instanz reicht |
| Wartelisten-Automatik | Komplexität — manuelle Sonderliste reicht für v1 |
| Echtzeit-Kapazitätsanzeige | WebSocket-Komplexität — nicht nötig bei Lehrer-Eingabe |

## Traceability

Welche Phase deckt welches Requirement ab. Wird von create-roadmap befüllt.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EVENT-01 | TBD | Pending |
| EVENT-02 | TBD | Pending |
| EVENT-03 | TBD | Pending |
| EVENT-04 | TBD | Pending |
| REG-01 | TBD | Pending |
| REG-02 | TBD | Pending |
| REG-03 | TBD | Pending |
| REG-04 | TBD | Pending |
| REG-05 | TBD | Pending |
| REG-06 | TBD | Pending |
| ALLOC-01 | TBD | Pending |
| ALLOC-02 | TBD | Pending |
| ALLOC-03 | TBD | Pending |
| ALLOC-04 | TBD | Pending |
| ALLOC-05 | TBD | Pending |
| ALLOC-06 | TBD | Pending |
| ALLOC-07 | TBD | Pending |
| OUT-01 | TBD | Pending |
| OUT-02 | TBD | Pending |
| OUT-03 | TBD | Pending |
| OUT-04 | TBD | Pending |
| OUT-05 | TBD | Pending |
| OUT-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 23

---
*Requirements defined: 2026-01-16*
*Last updated: 2026-01-16 after initial definition*
