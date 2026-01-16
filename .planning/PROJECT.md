# Sporttag-Anmeldeplattform

## What This Is

Eine Webanwendung zur Verwaltung von Schulsporttag-Anmeldungen. Schüler wählen aus mehreren Veranstaltungen drei Prioritäten, das System verteilt per Losverfahren fair nach verfügbaren Plätzen und generiert Teilnehmerlisten für den Aushang am SMV-Brett.

## Core Value

Faire, automatisierte Zuteilung von Schülern zu Veranstaltungen basierend auf priorisierten Wünschen und begrenzten Kapazitäten — kein manuelles Auswerten von Papierlisten mehr.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Veranstaltungen anlegen mit Name und Kapazität
- [ ] Schüleranmeldungen erfassen (Vorname, Nachname, Klasse, 3 Prioritäten)
- [ ] Losbasierte Zuteilung unter Berücksichtigung der Kapazitäten
- [ ] Teilnehmerliste pro Veranstaltung generieren
- [ ] Teilnehmerliste pro Klasse generieren
- [ ] Sonderliste für Schüler ohne freien Platz in allen 3 Wünschen

### Out of Scope

- Benutzerrollen / Authentifizierung — v1 ist single-user, Lehrer machen alles
- Schüler-Selbstanmeldung — kommt in v2
- Integration mit Schul-IT-Systemen — nicht benötigt für v1
- Bezahlung / Abrechnung — außerhalb des Anwendungsfalls
- Mehrere Sporttage gleichzeitig verwalten — ein Sporttag pro Instanz reicht

## Context

**Aktueller Prozess (Pain Point):**
1. Schüler füllen Papierformulare aus
2. Klassenlehrer sammeln ein
3. SMV-Lehrer erhalten Stapel Papier
4. SMV-Lehrer tippen manuell ab UND lösen das Zuteilungspuzzle von Hand

**Umgebung:**
- Ca. 250 teilnahmeberechtigte Schüler
- Ca. 7 Veranstaltungen zur Auswahl
- Einmal jährlich im Winter
- Listen werden am SMV-Brett ausgehängt (Print-Output wichtig)

**v2-Vision:**
- Schüler melden sich selbst an (kein Papier mehr)
- Rollentrennung: Lehrer verwalten Veranstaltungen, Schüler nur Anmeldung
- Authentifizierung erforderlich

## Constraints

- **Tech Stack**: Noch nicht festgelegt — wird in Research-Phase ermittelt
- **Deployment**: Muss für Schulumgebung zugänglich sein
- **Output**: Listen müssen druckbar/aushängbar sein

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Losverfahren statt "first come first serve" | Fairness — Abgabezeitpunkt soll keinen Vorteil bringen | — Pending |
| Sonderliste statt Zufallszuteilung bei vollem Wunsch | Manuelle Klärung besser als ungewollte Zuteilung | — Pending |
| v1 ohne Rollen/Auth | Schneller Start, Lehrer tippen ohnehin ein | — Pending |

---
*Last updated: 2025-01-16 after initialization*
