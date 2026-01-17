# Roadmap

**Project:** Sporttag-Anmeldeplattform
**Created:** 2026-01-17
**Phases:** 4

## Overview

This roadmap delivers the Sporttag-Anmeldeplattform in 4 phases following the natural user workflow: Events must exist before students can register, registrations must exist before allocation, and allocation must complete before reports. Each phase delivers independently verifiable functionality. The "quick" depth compresses the research-suggested 5 phases into 4 by combining foundation setup with event management.

## Phases

### Phase 1: Foundation + Events

**Goal:** Teachers can manage sports events with names, descriptions, and capacities
**Depends on:** Nothing (first phase)
**Requirements:** EVENT-01, EVENT-02, EVENT-03, EVENT-04

**Success Criteria:**
1. Teacher can create a new event with name, description, and capacity limit
2. Teacher can view all events in a list showing current capacity status
3. Teacher can edit any existing event's details
4. Teacher can delete an event that has no registrations

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Project setup with Next.js 16, SQLite/Drizzle, shadcn/ui
- [x] 01-02-PLAN.md — Event CRUD operations (create, list, edit, delete)

---

### Phase 2: Registration

**Goal:** Teachers can register students with their 3 event priorities
**Depends on:** Phase 1 (events must exist for priority selection)
**Requirements:** REG-01, REG-02, REG-03, REG-04, REG-05, REG-06

**Success Criteria:**
1. Teacher can enter student data (Vorname, Nachname, Klasse) and select 3 different event priorities
2. System prevents submission if priorities are duplicates or fields are empty
3. Teacher sees confirmation message after successful registration
4. Teacher can view list of all registered students with their selected priorities

**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Database schema extension and UI components (students table, Select, Sonner)
- [x] 02-02-PLAN.md — Registration form and student list pages

---

### Phase 3: Allocation

**Goal:** System can fairly assign students to events based on priorities and capacity
**Depends on:** Phase 2 (registrations must exist for allocation)
**Requirements:** ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05, ALLOC-06, ALLOC-07

**Success Criteria:**
1. Teacher can trigger allocation with a single button click
2. System assigns students respecting their priority order (1. Wahl preferred over 2., over 3.)
3. No event exceeds its capacity limit after allocation
4. Students who cannot be placed in any of their 3 choices appear on a separate "Sonderliste"
5. Teacher can manually reassign individual students after automatic allocation
6. System shows statistics: percentage of students who got 1st/2nd/3rd choice

**Plans:** 4 plans

Plans:
- [ ] 03-01-PLAN.md — Schema extension, allocation algorithm, UI components (Dialog, Tabs)
- [ ] 03-02-PLAN.md — Allocation server action and main dashboard page
- [ ] 03-03-PLAN.md — Manual reassignment modal component
- [ ] 03-04-PLAN.md — Sonderliste page and statistics integration

---

### Phase 4: Output

**Goal:** Teachers can generate and print participant lists for posting at the SMV-Brett
**Depends on:** Phase 3 (allocation must complete before meaningful reports)
**Requirements:** OUT-01, OUT-02, OUT-03, OUT-04, OUT-05, OUT-06

**Success Criteria:**
1. Teacher can generate and view participant list per event (sorted alphabetically)
2. Teacher can generate and view participant list per class (showing assigned event)
3. Teacher can generate and view Sonderliste with unassigned students
4. All lists can be exported as CSV files for further processing
5. All lists print cleanly on A4 paper with readable fonts (designed for SMV-Brett posting)
6. Teacher can view statistics dashboard showing allocation overview

**Plans:** (created by /gsd:plan-phase)

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1 - Foundation + Events | Complete | 2026-01-17 |
| 2 - Registration | Complete | 2026-01-17 |
| 3 - Allocation | Planned | -- |
| 4 - Output | Not started | -- |

---

*Roadmap for milestone: v1.0*
