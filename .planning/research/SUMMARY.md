# Project Research Summary

**Project:** Sporttag-Anmeldeplattform
**Domain:** School event registration with lottery-based allocation
**Researched:** 2026-01-17
**Confidence:** HIGH

## Executive Summary

This is a straightforward school administration tool: a registration system for ~250 students selecting from ~7 sports day events, with a lottery allocation when demand exceeds capacity. The recommended approach is a **monolithic three-tier architecture** using **Next.js 15 + SQLite + Drizzle** — a stack optimized for simplicity and school IT deployment. The core complexity lies not in the UI or data model, but in the **lottery algorithm** which must be fair, reproducible, and auditable.

The research strongly recommends building v1 as a **teacher-mediated system** (no student self-registration) to avoid authentication complexity. The stack choices prioritize zero external dependencies: no database server, no auth provider, single Docker container deployment. This makes the system viable for school environments with limited IT support.

The primary risk is **fairness disputes**. Parents will challenge lottery outcomes. Mitigation requires: storing the random seed, logging every allocation decision, and providing a verification mechanism. Secondary risks include race conditions during concurrent registration and the "all choices full" edge case where students cannot be assigned to any of their preferences.

## Key Findings

### Recommended Stack

A modern TypeScript stack optimized for form-heavy workflows and simple deployment:

**Core technologies:**
- **Next.js 15.5:** Full-stack React framework — Server Actions for forms, API routes, single deployment unit
- **SQLite + better-sqlite3:** Zero-config database — single file backup, appropriate for ~250 users/year
- **Drizzle ORM:** Type-safe SQL — lightweight, no code generation, excellent SQLite support
- **React Hook Form + Zod:** Form handling — mature, minimal re-renders, shared client/server validation
- **shadcn/ui + Tailwind:** UI components — copy-paste components, full customization, print-friendly
- **react-to-print:** Print output — handles print media queries for physical posting

**Anti-recommendations:** Avoid Firebase/Supabase (data privacy), MongoDB (overkill), Prisma (heavier than needed), client-side-only lottery (not auditable).

### Expected Features

**Must have (table stakes):**
- Event management: CRUD for ~7 sports events with capacities
- Registration form: Teacher enters student name, class, 3 priorities
- Form validation: No duplicates, all 3 priorities required
- Lottery allocation: Random order, priority-respecting, capacity-enforced
- Unassigned detection: Explicit list for students where all choices are full
- Three output lists: Per event, per class, unassigned students
- Print-friendly output: Large fonts, clear headers, designed for physical posting
- CSV export: All lists exportable for other school systems

**Should have (v1 nice-to-have):**
- Allocation statistics: Show % got 1st/2nd/3rd choice
- Registration deadline control: Open/close registration period
- Edit before deadline: Allow changes to registrations

**Defer (v2+):**
- Student self-registration (requires auth)
- Email notifications
- CSV import of student roster
- Real-time capacity display
- Multi-language support
- Waitlist auto-management

### Architecture Approach

A monolithic three-tier architecture is the clear choice for this scale. The system divides into: **Presentation Layer** (event management, registration forms, allocation reports), **Business Logic Layer** (event service, registration service, allocation engine), and **Data Layer** (events, students, classes, registrations, allocations).

**Major components:**
1. **Event Management** — CRUD for sports events, locks after allocation
2. **Student/Class Management** — Student roster, class groupings, manual entry for v1
3. **Registration Service** — Captures 3 priorities per student, validates no duplicates
4. **Allocation Engine** — Fisher-Yates shuffle + priority-weighted assignment, stores seed + decisions
5. **Report Generator** — Event lists, class lists, unassigned list, print styling

**Data model recommendation:** Normalized registrations table (student_id, priority_1/2/3_event_id) with CHECK constraints for distinct priorities. Separate allocation_runs table to track lottery executions with seed and statistics.

### Critical Pitfalls

1. **Race conditions in registration** — Multiple concurrent submissions can overbook events. Prevention: Use database constraints (UNIQUE on student), pessimistic locking for capacity checks. Address in Phase 1.

2. **Non-reproducible lottery results** — Parents will challenge outcomes. Prevention: Store the random seed explicitly, use deterministic PRNG, log every allocation decision with reason, provide verification function. Address in Phase 2.

3. **Silent failure on "all choices full"** — Algorithm must explicitly handle students who cannot be placed. Prevention: Create explicit "unassigned" status and special list for manual handling; never auto-assign to non-preferred events. Address in Phase 2.

4. **No audit trail for decisions** — "Why didn't my child get their first choice?" Prevention: Log each decision with capacity state at time of decision, store lottery order per student. Address in Phase 2.

5. **Print output unusable** — Screen-optimized PDFs are unreadable when posted. Prevention: Design specifically for posting context (14pt+ fonts, clear section headers), test by actually printing. Address in Phase 3.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data Foundation
**Rationale:** Everything depends on the data model. Get the schema right first with proper constraints.
**Delivers:** Working database with events, students, classes. Basic admin UI for CRUD operations.
**Addresses:** Event management, student data entry (table stakes)
**Avoids:** Priority order ambiguity, duplicate registrations (use DB constraints from day 1)
**Stack:** Next.js setup, SQLite + Drizzle, basic shadcn/ui components

### Phase 2: Registration Flow
**Rationale:** Registration is the core input to the system. Must be solid before lottery.
**Delivers:** Complete registration form with validation, registration list view, deadline control.
**Addresses:** 3-priority selection, form validation, edit before deadline (table stakes)
**Avoids:** Race conditions (pessimistic locking), form validation UX issues (inline validation)
**Stack:** React Hook Form + Zod, form components

### Phase 3: Allocation Engine
**Rationale:** The differentiating feature. Most complex logic. Requires careful design for fairness.
**Delivers:** Lottery algorithm, allocation run management, audit trail, unassigned list generation.
**Addresses:** Random lottery, priority-respecting allocation, unassigned detection (table stakes)
**Avoids:** Non-reproducible results, silent edge case failures, missing audit trail
**Stack:** Custom algorithm (Fisher-Yates), allocation_runs table with seed storage
**Note:** This phase requires explicit handling of the audit trail requirement.

### Phase 4: Reports and Output
**Rationale:** Makes allocation results usable. Critical for actual event day.
**Delivers:** Event lists, class lists, print-friendly output, CSV export.
**Addresses:** Output lists, print output, export (table stakes)
**Avoids:** Unusable print output (design for posting, test physically)
**Stack:** TanStack Table, react-to-print, CSS print media queries

### Phase 5: Polish and Deploy
**Rationale:** Production readiness. Deployment artifact for school IT.
**Delivers:** Docker container, statistics dashboard, documentation.
**Addresses:** Basic statistics, deployment (table stakes)
**Stack:** Docker standalone output, final testing

### Phase Ordering Rationale

- **Data -> Registration -> Allocation -> Output** mirrors the actual user workflow
- Architecture research confirms this dependency chain: Events must exist before registration, registrations must exist before allocation, allocation must complete before reports
- Pitfall research confirms: build concurrency handling into Phase 1/2, not retrofitted later
- Stack research confirms: all components work together (Drizzle -> RHF/Zod -> shadcn -> print)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Allocation Engine):** Most complex logic. Need to finalize algorithm choice (single-pass vs multi-round), audit trail schema, and verification mechanism. Research the exact logging format needed to answer "why this assignment?"
- **Phase 4 (Print Output):** CSS print styling has quirks. Research print media queries, page break handling, and accessibility requirements for posted documents in German schools.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Data Foundation):** Well-documented Next.js + Drizzle + SQLite setup
- **Phase 2 (Registration Flow):** Standard form handling with RHF + Zod, many examples available
- **Phase 5 (Deploy):** Docker standalone is officially documented by Next.js

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via npm, official docs, multiple comparison sources |
| Features | MEDIUM | Based on event registration best practices, some inferred from enterprise systems |
| Architecture | HIGH | Well-established patterns for this scale, multiple authoritative sources |
| Pitfalls | HIGH | Multiple sources cross-referenced, specific to lottery/registration domain |

**Overall confidence:** HIGH

### Gaps to Address

- **Allocation algorithm details:** Single-pass vs multi-round? Research recommends single-pass for simplicity, but multi-round may be fairer. Decide during Phase 3 planning.
- **Waitlist handling:** Research identifies this as important but deferred to v2. Confirm with stakeholders if v1 needs any waitlist capability.
- **GDPR compliance specifics:** Research notes requirements but detailed implementation (data retention, deletion, access requests) needs school policy review.
- **School IT environment:** Specific deployment constraints (ports, firewall, local vs cloud) unknown. Clarify before Phase 5.

## Sources

### Primary (HIGH confidence)
- Next.js 15.5 Release Notes — framework capabilities, deployment options
- SQLite vs PostgreSQL comparisons (DataCamp, Bytebase) — database selection
- Drizzle ORM documentation — ORM features, SQLite support
- Fisher-Yates shuffle (Wikipedia, Bost.ocks.org) — algorithm correctness
- Fair Random Assignment (Wikipedia) — lottery fairness properties

### Secondary (MEDIUM confidence)
- React Hook Form vs TanStack Form comparisons — form library selection
- shadcn/ui ecosystem guides — component library capabilities
- Event registration best practices (Bizzabo, Sched) — feature expectations
- MIT ESP Lottery FAQ — school lottery implementation patterns

### Tertiary (LOW confidence)
- GDPR school compliance guides — general guidance, needs school-specific review
- Print accessibility guides (Harvard, Penn State) — may not apply to German context

---
*Research completed: 2026-01-17*
*Ready for roadmap: yes*
