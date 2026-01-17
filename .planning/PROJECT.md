# Sporttag-Anmeldeplattform

## What This Is

Eine Webanwendung zur Verwaltung von Schulsporttag-Anmeldungen. Lehrer erfassen Schueler mit drei Veranstaltungsprioritaeten, das System verteilt per Losverfahren fair nach verfuegbaren Plaetzen und generiert druckbare Teilnehmerlisten fuer den Aushang am SMV-Brett.

## Core Value

Faire, automatisierte Zuteilung von Schuelern zu Veranstaltungen basierend auf priorisierten Wuenschen und begrenzten Kapazitaeten — kein manuelles Auswerten von Papierlisten mehr.

## Current State

**Version:** v1.0 MVP (shipped 2026-01-17)
**Tech Stack:** Next.js 16, SQLite/Drizzle, shadcn/ui, Tailwind v4
**LOC:** 4,093 lines TypeScript
**Status:** Production-ready for school use

## Requirements

### Validated

- Veranstaltungen anlegen mit Name und Kapazitaet — v1.0
- Schueleranmeldungen erfassen (Vorname, Nachname, Klasse, 3 Prioritaeten) — v1.0
- Losbasierte Zuteilung unter Beruecksichtigung der Kapazitaeten — v1.0
- Teilnehmerliste pro Veranstaltung generieren — v1.0
- Teilnehmerliste pro Klasse generieren — v1.0
- Sonderliste fuer Schueler ohne freien Platz in allen 3 Wuenschen — v1.0
- Druckfreundliche Formatierung (A4, SMV-Brett) — v1.0
- CSV-Export mit deutscher Lokalisierung — v1.0
- Statistik-Dashboard mit Fairness-Uebersicht — v1.0

### Active

(None — v1.0 complete, v2.0 not yet planned)

### Out of Scope

- Benutzerrollen / Authentifizierung — v1 ist single-user, Lehrer machen alles (v2 candidate)
- Schueler-Selbstanmeldung — kommt in v2
- Integration mit Schul-IT-Systemen — nicht benoetigt fuer v1
- Bezahlung / Abrechnung — ausserhalb des Anwendungsfalls
- Mehrere Sporttage gleichzeitig verwalten — ein Sporttag pro Instanz reicht
- Navigation menu — pages accessible via URL, enhancement for future

## Context

**Aktueller Prozess (Pain Point):**
1. Schueler fuellen Papierformulare aus
2. Klassenlehrer sammeln ein
3. SMV-Lehrer erhalten Stapel Papier
4. SMV-Lehrer tippen manuell ab UND loesen das Zuteilungspuzzle von Hand

**Umgebung:**
- Ca. 250 teilnahmeberechtigte Schueler
- Ca. 7 Veranstaltungen zur Auswahl
- Einmal jaehrlich im Winter
- Listen werden am SMV-Brett ausgehaengt (Print-Output wichtig)

**v2-Vision:**
- Schueler melden sich selbst an (kein Papier mehr)
- Rollentrennung: Lehrer verwalten Veranstaltungen, Schueler nur Anmeldung
- Authentifizierung erforderlich

## Constraints

- **Tech Stack**: Next.js 16, SQLite/Drizzle, shadcn/ui (established in v1.0)
- **Deployment**: Local/school network for v1, cloud possible for v2
- **Output**: Print-ready A4 lists for SMV-Brett posting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Losverfahren statt "first come first serve" | Fairness — Abgabezeitpunkt soll keinen Vorteil bringen | Good |
| Sonderliste statt Zufallszuteilung bei vollem Wunsch | Manuelle Klaerung besser als ungewollte Zuteilung | Good |
| v1 ohne Rollen/Auth | Schneller Start, Lehrer tippen ohnehin ein | Good |
| Next.js 16 + SQLite/Drizzle | Modern stack, file-based DB for simplicity | Good |
| Mulberry32 PRNG | Seeded randomness, reproducible allocation | Good |
| Server/client composition | SSR data fetching, client interactivity | Good |
| UTF-8 BOM + semicolons for CSV | German Excel compatibility | Good |
| A4 portrait with 1.5cm margins | SMV-Brett posting format | Good |
| Component reuse (AllocationStats) | Shared between /allocation and /output | Good |

---
*Last updated: 2026-01-17 after v1.0 milestone*
