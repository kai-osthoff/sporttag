# Architecture Research: Sporttag Registration Platform

**Domain:** School event registration with lottery allocation
**Researched:** 2026-01-16
**Confidence:** HIGH (well-established patterns for this scale)

## Executive Summary

For a ~250 student, 7-event registration system with lottery allocation, **a monolithic three-tier architecture is the clear choice**. This is a small-scale CRUD application with one computationally interesting feature (lottery allocation). Microservices would add complexity without benefit at this scale.

The architecture naturally divides into: **Data Layer** (events, students, registrations, allocations), **Business Logic Layer** (CRUD operations + allocation algorithm), and **Presentation Layer** (forms, lists, reports).

---

## Recommended Architecture: Monolithic Three-Tier

```
+----------------------------------------------------------+
|                    PRESENTATION LAYER                     |
|  +------------+  +-------------+  +------------------+   |
|  | Event      |  | Student     |  | Allocation       |   |
|  | Management |  | Registration|  | Results/Reports  |   |
|  +------------+  +-------------+  +------------------+   |
+----------------------------------------------------------+
                            |
                            v
+----------------------------------------------------------+
|                   BUSINESS LOGIC LAYER                    |
|  +------------+  +-------------+  +------------------+   |
|  | Event      |  | Registration|  | Allocation       |   |
|  | Service    |  | Service     |  | Engine           |   |
|  +------------+  +-------------+  +------------------+   |
+----------------------------------------------------------+
                            |
                            v
+----------------------------------------------------------+
|                      DATA LAYER                           |
|  +------------+  +-------------+  +------------------+   |
|  | Events     |  | Students    |  | Registrations    |   |
|  |            |  | Classes     |  | Allocations      |   |
|  +------------+  +-------------+  +------------------+   |
+----------------------------------------------------------+
```

### Why Monolithic for This Project

| Factor | Monolith Advantage |
|--------|-------------------|
| Scale (~250 users) | No distributed system overhead needed |
| Team size (small) | Single codebase easier to manage |
| Complexity | Simple CRUD + one algorithm |
| Deployment | Single unit, simpler DevOps |
| Debugging | Stack traces, local testing |
| Performance | No network latency between components |

**Sources:** [AWS Monolithic vs Microservices](https://aws.amazon.com/compare/the-difference-between-monolithic-and-microservices-architecture/), [Atlassian Architecture Guide](https://www.atlassian.com/microservices/microservices-architecture/microservices-vs-monolith)

---

## Components and Boundaries

### Component 1: Event Management

**Responsibility:** CRUD operations for sports events

| Operation | Description |
|-----------|-------------|
| Create Event | Name, description, capacity, location, time |
| Update Event | Modify details before allocation |
| Delete Event | Remove event (with cascade rules) |
| List Events | Display all available events |

**Data owned:**
- `events` table (id, name, description, capacity, location, date_time)

**Communicates with:**
- Registration Service (provides event list for selection)
- Allocation Engine (provides capacity constraints)

**Boundary rule:** Events should be locked after allocation runs.

---

### Component 2: Student/Class Management

**Responsibility:** Manage student roster and class groupings

| Operation | Description |
|-----------|-------------|
| Import Students | Bulk import from CSV/Excel |
| Manage Classes | Group students by class |
| View Students | List students, filter by class |

**Data owned:**
- `students` table (id, name, class_id)
- `classes` table (id, name, teacher_name)

**Communicates with:**
- Registration Service (provides student list)
- Report Generator (grouping for class lists)

**v1 note:** Manual entry or import. No student self-registration.
**v2 evolution:** Students become users who can self-register.

---

### Component 3: Registration Service

**Responsibility:** Capture student preferences (3 priorities per student)

| Operation | Description |
|-----------|-------------|
| Create Registration | Student selects 3 events in priority order |
| Update Registration | Modify choices before deadline |
| Validate Registration | Ensure 3 unique events selected |
| List Registrations | View all registrations, filter by student/event |

**Data owned:**
- `registrations` table (id, student_id, priority_1_event_id, priority_2_event_id, priority_3_event_id, created_at, updated_at)

**Alternative data model (normalized):**
- `registration_preferences` table (id, student_id, event_id, priority_rank)

**Recommendation:** Use the normalized model. More flexible for queries like "all students who selected Event X as any priority."

**Communicates with:**
- Student Service (gets student info)
- Event Service (gets available events)
- Allocation Engine (provides input data)

**Business rules:**
- Each student can only register once
- All three priorities must be different events
- Registration locked after deadline/allocation

---

### Component 4: Allocation Engine

**Responsibility:** Run lottery algorithm to assign students to events

This is the **core algorithmic component**. It deserves special attention.

#### Algorithm: Priority-Weighted Lottery

```
INPUT:
  - List of events with capacities
  - List of registrations (student, priority1, priority2, priority3)

OUTPUT:
  - Allocations (student -> event)
  - Unallocated students (if any)

ALGORITHM:
  1. Shuffle all registrations randomly (the "lottery")
  2. For each registration in shuffled order:
     a. Try to allocate to priority_1 event
        - If capacity available: ALLOCATE, mark student done
     b. If priority_1 full, try priority_2
        - If capacity available: ALLOCATE, mark student done
     c. If priority_2 full, try priority_3
        - If capacity available: ALLOCATE, mark student done
     d. If all priorities full: Mark as UNALLOCATED
  3. Return allocations and unallocated list
```

#### Alternative: Multiple Rounds (Fairer)

```
ROUND 1: Process only priority_1 choices (random order)
ROUND 2: For unallocated students, process priority_2 choices
ROUND 3: For still unallocated, process priority_3 choices
ROUND 4: Manual assignment for remaining
```

**Recommendation:** Start with simple single-pass algorithm. Easy to understand, debug, explain to teachers. The fairness is in the random shuffle - everyone has equal chance of being processed early.

**Data owned:**
- `allocations` table (id, student_id, event_id, allocation_run_id, priority_matched, created_at)
- `allocation_runs` table (id, run_at, status, total_students, allocated_count, unallocated_count)

**Communicates with:**
- Registration Service (gets all registrations)
- Event Service (gets capacities)
- Report Generator (provides results)

**State machine for allocation runs:**

```
DRAFT -> RUNNING -> COMPLETED
              \-> FAILED (with error message)

COMPLETED can transition to:
  -> PUBLISHED (results visible to users)
  -> ARCHIVED (new run started)
```

**Sources:** [Lottery Scheduling Wikipedia](https://en.wikipedia.org/wiki/Lottery_scheduling), [Fair Random Assignment](https://en.wikipedia.org/wiki/Fair_random_assignment)

---

### Component 5: Report Generator

**Responsibility:** Generate printable outputs

| Report | Description |
|--------|-------------|
| Event List | All students allocated to an event |
| Class List | For each class: which student goes to which event |
| Summary | Statistics (fill rates, priority distribution) |
| Unallocated | Students who need manual assignment |

**Output formats:**
- Screen display (HTML tables)
- Print-friendly (CSS print styles)
- Export (CSV, PDF - v2)

**Communicates with:**
- Allocation Engine (gets results)
- Student Service (gets student details)
- Event Service (gets event details)

---

## Data Flow

### Flow 1: Setup Phase

```
Teacher                 Event Service           Database
   |                         |                      |
   |-- Create Event -------->|                      |
   |                         |-- INSERT event ----->|
   |                         |<---- OK -------------|
   |<---- Event Created -----|                      |
   |                         |                      |
   |-- Import Students ----->|                      |
   |                         |-- INSERT students -->|
   |                         |<---- OK -------------|
   |<---- Students Imported -|                      |
```

### Flow 2: Registration Phase

```
Teacher                Registration Service      Database
   |                         |                      |
   |-- Register Student ---->|                      |
   |   (student, p1, p2, p3) |                      |
   |                         |-- Validate events -->|
   |                         |<---- Events exist ---|
   |                         |-- INSERT reg ------->|
   |                         |<---- OK -------------|
   |<---- Registration OK ---|                      |
```

### Flow 3: Allocation Phase

```
Teacher              Allocation Engine        Database
   |                         |                      |
   |-- Run Allocation ------>|                      |
   |                         |-- Get all regs ----->|
   |                         |<---- Registrations --|
   |                         |-- Get capacities --->|
   |                         |<---- Capacities -----|
   |                         |                      |
   |                         |-- [RUN ALGORITHM] ---|
   |                         |                      |
   |                         |-- INSERT allocations>|
   |                         |<---- OK -------------|
   |<---- Allocation Done ---|                      |
   |                         |                      |
   |-- View Results -------->|                      |
   |<---- Report Generated --|                      |
```

### Flow 4: Output Phase

```
Teacher              Report Generator         Database
   |                         |                      |
   |-- Get Event List ------>|                      |
   |   (event_id)            |-- Query allocations->|
   |                         |<---- Student list ---|
   |                         |-- Query students --->|
   |                         |<---- Names, classes -|
   |<---- Formatted List ----|                      |
   |                         |                      |
   |-- Print ----------------+                      |
```

---

## Database Schema (Recommended)

```sql
-- Core entities
CREATE TABLE classes (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,      -- e.g., "5a", "6b"
    teacher_name VARCHAR(100)
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class_id INTEGER REFERENCES classes(id)
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    location VARCHAR(100),
    event_time TIMESTAMP
);

-- Registration (normalized for flexibility)
CREATE TABLE registrations (
    id INTEGER PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES students(id),  -- One reg per student
    priority_1_event_id INTEGER REFERENCES events(id),
    priority_2_event_id INTEGER REFERENCES events(id),
    priority_3_event_id INTEGER REFERENCES events(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure all three priorities are different
    CHECK (priority_1_event_id != priority_2_event_id),
    CHECK (priority_2_event_id != priority_3_event_id),
    CHECK (priority_1_event_id != priority_3_event_id)
);

-- Allocation tracking
CREATE TABLE allocation_runs (
    id INTEGER PRIMARY KEY,
    run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, RUNNING, COMPLETED, FAILED, PUBLISHED
    total_students INTEGER,
    allocated_count INTEGER,
    unallocated_count INTEGER,
    error_message TEXT
);

CREATE TABLE allocations (
    id INTEGER PRIMARY KEY,
    allocation_run_id INTEGER REFERENCES allocation_runs(id),
    student_id INTEGER REFERENCES students(id),
    event_id INTEGER REFERENCES events(id),
    priority_matched INTEGER,  -- 1, 2, or 3 (which priority was fulfilled)

    UNIQUE(allocation_run_id, student_id)  -- One allocation per student per run
);

-- Indexes for common queries
CREATE INDEX idx_allocations_run ON allocations(allocation_run_id);
CREATE INDEX idx_allocations_event ON allocations(event_id);
CREATE INDEX idx_students_class ON students(class_id);
```

---

## Suggested Build Order

Based on component dependencies, here is the recommended implementation sequence:

### Phase 1: Data Foundation

**Build first:** Data layer + basic UI shell

| Order | Component | Rationale |
|-------|-----------|-----------|
| 1.1 | Database schema | Everything depends on data structure |
| 1.2 | Class CRUD | Simple, needed for students |
| 1.3 | Student CRUD + Import | Core entity, needed for registration |
| 1.4 | Event CRUD | Core entity, needed for registration |

**Deliverable:** Can create classes, students, events. No registration yet.

### Phase 2: Registration Flow

**Build second:** Registration captures the core input

| Order | Component | Rationale |
|-------|-----------|-----------|
| 2.1 | Registration form | UI for 3-priority selection |
| 2.2 | Registration validation | Ensure valid selections |
| 2.3 | Registration list view | See who registered |

**Deliverable:** Teachers can register students with priorities.

### Phase 3: Allocation Engine

**Build third:** The core differentiating feature

| Order | Component | Rationale |
|-------|-----------|-----------|
| 3.1 | Allocation algorithm | Core logic, can test independently |
| 3.2 | Allocation run management | Track runs, re-run capability |
| 3.3 | Allocation results storage | Persist results |

**Deliverable:** Can run lottery, see raw results.

### Phase 4: Reports and Output

**Build fourth:** Makes results usable

| Order | Component | Rationale |
|-------|-----------|-----------|
| 4.1 | Event list report | "Who's in this event?" |
| 4.2 | Class list report | "Where does each student go?" |
| 4.3 | Print styling | Printable output |
| 4.4 | Summary statistics | Fill rates, priority distribution |

**Deliverable:** Full v1 functionality complete.

### Dependency Graph

```
                    [Database Schema]
                           |
            +--------------+--------------+
            |              |              |
        [Classes]     [Students]      [Events]
            |              |              |
            +--------------+--------------+
                           |
                    [Registrations]
                           |
                  [Allocation Engine]
                           |
                      [Reports]
```

---

## v1 vs v2 Architecture Changes

### v1: Single-User (Teachers Only)

```
+-------------------+
|   Teacher's       |
|   Browser         |
+--------+----------+
         |
         v
+-------------------+
|   Application     |  <- No auth layer
|   (Full Access)   |
+--------+----------+
         |
         v
+-------------------+
|   Database        |
+-------------------+
```

**Characteristics:**
- No authentication required
- All features available to all users
- Single deployment, single access point
- Trust model: physical access = authorized

### v2: Multi-User with Roles

```
+-------------------+     +-------------------+
|   Teacher's       |     |   Student's       |
|   Browser         |     |   Browser         |
+--------+----------+     +--------+----------+
         |                         |
         +------------+------------+
                      |
                      v
         +------------------------+
         |   Authentication       |
         |   Layer                |
         +------------------------+
                      |
                      v
         +------------------------+
         |   Authorization        |
         |   (Role-Based Access)  |
         +------------------------+
                      |
         +------------+------------+
         |                         |
+--------v----------+    +---------v---------+
|   Teacher         |    |   Student         |
|   Features        |    |   Features        |
|   (Full CRUD)     |    |   (Own Reg Only)  |
+-------------------+    +-------------------+
         |                         |
         +------------+------------+
                      |
                      v
         +------------------------+
         |   Database             |
         +------------------------+
```

### What Changes Between v1 and v2

| Layer | v1 | v2 |
|-------|----|----|
| **Authentication** | None | Login system (username/password or SSO) |
| **Authorization** | None | Role-based (TEACHER, STUDENT) |
| **User Model** | None | `users` table with roles |
| **Student Link** | Standalone | `students.user_id` foreign key |
| **Registration** | Teacher enters for student | Student self-service + teacher override |
| **Data Visibility** | Everything visible | Scoped to role/user |
| **Session Management** | None | JWT or session cookies |

### v2 Schema Additions

```sql
-- New for v2
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,  -- 'TEACHER' or 'STUDENT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modified: Link students to user accounts
ALTER TABLE students ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Modified: Track who created/modified registrations
ALTER TABLE registrations ADD COLUMN created_by_user_id INTEGER REFERENCES users(id);
```

### v2 Authorization Rules

| Feature | TEACHER | STUDENT |
|---------|---------|---------|
| Create/Edit Events | Yes | No |
| Import Students | Yes | No |
| Register Any Student | Yes | No |
| Register Self | N/A | Yes (own only) |
| Edit Own Registration | N/A | Yes (before deadline) |
| Run Allocation | Yes | No |
| View All Results | Yes | No |
| View Own Result | N/A | Yes |
| View Class List | Yes | No |
| View Event List | Yes | No |

### Architecture Decision: Prepare v1 for v2

**Recommendation:** Build v1 with v2 in mind. This means:

1. **Use middleware pattern** even without auth - empty middleware now, auth later
2. **Design API routes** as if auth existed - `/api/events`, `/api/registrations`
3. **Include `created_by` fields** in tables - null in v1, user_id in v2
4. **Separate concerns** - UI components should not assume access level

**Anti-pattern to avoid:** Building v1 with assumptions baked in that make v2 a rewrite.

---

## Scalability Considerations

For ~250 users, scalability is not a primary concern. However, for future-proofing:

| Concern | At 250 users | At 2,500 users | At 25,000 users |
|---------|--------------|----------------|-----------------|
| **Database** | SQLite fine | PostgreSQL recommended | PostgreSQL + read replicas |
| **Allocation** | < 1 second | < 5 seconds | Consider background job |
| **Concurrent Registrations** | No issue | Add optimistic locking | Queue-based processing |
| **Reports** | On-demand | On-demand | Pre-generate + cache |

**v1 Recommendation:** SQLite is sufficient and simplifies deployment. Design schema to be portable to PostgreSQL.

---

## Technology-Agnostic Recommendations

This architecture research is **framework-agnostic**. The patterns apply whether you use:

| Layer | Options |
|-------|---------|
| Frontend | React, Vue, Svelte, plain HTML/JS |
| Backend | Node.js, Python, Go, .NET |
| Database | SQLite, PostgreSQL, MySQL |

**Key architectural principles that transcend technology:**

1. **Separation of concerns** - Keep UI, business logic, data access separate
2. **Single source of truth** - One database, no duplicate data
3. **Idempotent operations** - Running allocation twice should be safe
4. **Audit trail** - Track when things happened and by whom
5. **Graceful degradation** - Handle edge cases (no registrations, over-capacity)

---

## Sources

### Architecture Patterns
- [Web Application Architecture - DEV Community](https://dev.to/techelopment/web-application-architecture-front-end-middleware-and-back-end-2ld7)
- [AWS Monolithic vs Microservices](https://aws.amazon.com/compare/the-difference-between-monolithic-and-microservices-architecture/)
- [Atlassian Microservices Guide](https://www.atlassian.com/microservices/microservices-architecture/microservices-vs-monolith)

### Allocation Algorithms
- [Lottery Scheduling - Wikipedia](https://en.wikipedia.org/wiki/Lottery_scheduling)
- [Fair Random Assignment - Wikipedia](https://en.wikipedia.org/wiki/Fair_random_assignment)
- [Course Allocation - Wikipedia](https://en.wikipedia.org/wiki/Course_allocation)
- [Lottery Scheduling PDF - CMU](https://www.pdl.cmu.edu/PDL-FTP/Scheduling/lottery.pdf)

### Event Registration Systems
- [Event Management Database Design - Medium](https://medium.com/@arpita_deb/event-management-database-design-part-1-5239620410c1)
- [Database Modeling for Event Ticketing - Ryan Boland](https://ryanboland.com/blog/database-modeling-for-an-event-ticketing-application/)
- [Event Management Data Model - Redgate](https://www.red-gate.com/blog/how-to-plan-and-run-events-an-event-management-data-model)

### State Machines and Workflows
- [Workflow Engine vs State Machine](https://workflowengine.io/blog/workflow-engine-vs-state-machine/)
- [State Machine Workflows - Microsoft](https://learn.microsoft.com/en-us/dotnet/framework/windows-workflow-foundation/state-machine-workflows)
