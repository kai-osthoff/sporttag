# Sporttag-Anmeldeplattform

## What This Is

Eine Webanwendung zur Verwaltung von Schulsporttag-Anmeldungen. Lehrer erfassen Schueler mit drei Veranstaltungsprioritaeten, das System verteilt per Losverfahren fair nach verfuegbaren Plaetzen und generiert druckbare Teilnehmerlisten fuer den Aushang am SMV-Brett.

## Core Value

Faire, automatisierte Zuteilung von Schuelern zu Veranstaltungen basierend auf priorisierten Wuenschen und begrenzten Kapazitaeten — kein manuelles Auswerten von Papierlisten mehr.

## Current State

**Version:** v1.0 MVP (shipped 2026-01-17)
**Tech Stack:** Next.js 16, SQLite/Drizzle, shadcn/ui, Tailwind v4
**LOC:** 4,093 lines TypeScript
**Status:** Production-ready, preparing for distribution

## Current Milestone: v2.0 Desktop Distribution

**Goal:** Die App als native macOS Desktop-Anwendung verpacken, die Lehrer ohne technische Kenntnisse mit einem Terminal-Befehl installieren und wie eine normale Mac-App nutzen koennen.

**Target features:**
- Native macOS App (.app Bundle) mit eigenem Fenster
- Ein-Befehl-Installation via curl (wie Homebrew)
- Persistente Datenspeicherung in ~/Library/Application Support/Sporttag/
- In-App Update-Hinweis mit manuellem Update-Mechanismus
- GitHub Public Repo mit benutzerfreundlicher README

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

- Native macOS Desktop-App mit Fenster (Electron/Tauri wrapper)
- curl-basiertes Installationsscript fuer nicht-technische Benutzer
- Persistente Datenbank in Application Support Ordner
- Update-Benachrichtigung in der App (GitHub Releases API)
- Manueller Update-Mechanismus (Download, Replace, Restart)
- GitHub README mit Installationsanleitung fuer Lehrer

### Out of Scope

- Benutzerrollen / Authentifizierung — v2.0 fokussiert auf Distribution, Auth kommt spaeter
- Schueler-Selbstanmeldung — kommt nach Distribution (v3 candidate)
- Windows/Linux Support — v2.0 nur macOS, andere Plattformen spaeter
- Automatische Updates im Hintergrund — bewusst manuell fuer Transparenz
- Cloud-Deployment — bleibt lokal auf Lehrer-Mac
- Integration mit Schul-IT-Systemen — nicht benoetigt
- Bezahlung / Abrechnung — ausserhalb des Anwendungsfalls

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

**v2.0-Vision (aktuell):**
- Native macOS App statt npm-Projekt
- Ein-Befehl-Installation fuer nicht-technische Lehrer
- Keine Abhaengigkeit von Terminal im Alltag
- App erscheint in /Applications wie normale Mac-Software

**v3-Vision (spaeter):**
- Schueler melden sich selbst an (kein Papier mehr)
- Rollentrennung: Lehrer verwalten Veranstaltungen, Schueler nur Anmeldung
- Authentifizierung erforderlich

## Constraints

- **Tech Stack**: Next.js 16, SQLite/Drizzle, shadcn/ui + Desktop-Wrapper (Electron/Tauri)
- **Platform**: macOS only for v2.0 (ARM + Intel)
- **Distribution**: GitHub Public Repo mit Releases
- **Installation**: Muss mit einem Terminal-Befehl funktionieren
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
*Last updated: 2026-01-17 after starting v2.0 milestone*
