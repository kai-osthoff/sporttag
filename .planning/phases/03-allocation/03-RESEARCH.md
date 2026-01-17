# Phase 3: Allocation - Research

**Researched:** 2026-01-17
**Domain:** Fair lottery allocation algorithm with priority-weighted assignment
**Confidence:** HIGH

## Summary

This phase implements a lottery-based allocation system that assigns students to events based on their ranked priorities (1st, 2nd, 3rd choice) while respecting event capacity limits. The allocation algorithm must be:
1. **Fair** - All students have equal chance within each priority round
2. **Reproducible** - Same seed produces same results (for auditing)
3. **Priority-respecting** - 1st choices processed before 2nd, before 3rd
4. **Re-runnable** - Preserves manual overrides when re-executed

The standard approach is a **priority-weighted round-robin algorithm** using the Fisher-Yates shuffle with a seeded PRNG (Mulberry32). This is a well-established pattern for school assignment lotteries.

**Primary recommendation:** Implement a pure-function allocation algorithm with Mulberry32 for seeded randomness, store seed and results in new database tables, use Drizzle transactions for atomic updates.

## Standard Stack

The allocation phase builds on existing stack with minimal additions.

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.1 | Database ORM | Already used, supports transactions |
| better-sqlite3 | 12.6.2 | SQLite driver | Already used, transaction support |
| shadcn/ui | latest | UI components | Already used for forms/tables |

### New Components Needed
| Component | Installation | Purpose | When to Use |
|-----------|--------------|---------|-------------|
| Dialog | `pnpm dlx shadcn@latest add dialog` | Manual reassignment modal | Click student to reassign |
| Tabs | `pnpm dlx shadcn@latest add tabs` | Allocation page navigation | Switch between assigned/sonderliste views |

### No External Dependencies Needed
| Problem | Don't Add | Use Instead | Why |
|---------|-----------|-------------|-----|
| Seeded random | seedrandom npm | Mulberry32 inline | 8 lines of code, no dependency |
| Shuffle | lodash.shuffle | Fisher-Yates with seed | Need reproducibility |

**Installation:**
```bash
pnpm dlx shadcn@latest add dialog tabs
```

## Architecture Patterns

### Database Schema Extension
```
students table (extend existing):
+ assignedEventId: integer (FK to events, nullable)
+ assignmentType: text ('auto' | 'manual' | null)
+ assignedAt: timestamp (nullable)

allocations table (new):
- id: integer PK
- seed: text (e.g., "2026-sporttag-001")
- status: text ('running' | 'completed' | 'failed')
- stats: text (JSON blob for statistics)
- createdAt: timestamp
- completedAt: timestamp (nullable)
```

### Recommended Project Structure
```
src/
├── lib/
│   ├── allocation/
│   │   ├── algorithm.ts      # Pure allocation function
│   │   ├── random.ts         # Mulberry32 + seeded shuffle
│   │   └── types.ts          # Allocation types
│   └── actions/
│       └── allocation.ts     # Server actions for allocation
├── app/
│   └── allocation/
│       ├── page.tsx          # Main allocation dashboard
│       └── sonderliste/
│           └── page.tsx      # Unassigned students page
└── components/
    └── allocation/
        ├── allocation-button.tsx    # Trigger button with loading
        ├── assignment-modal.tsx     # Manual reassignment dialog
        ├── assignment-stats.tsx     # Statistics display
        └── student-assignment-list.tsx
```

### Pattern 1: Pure Allocation Algorithm
**What:** Allocation logic as a pure function, no side effects
**When to use:** Core algorithm implementation
**Example:**
```typescript
// Source: Standard functional programming pattern
interface AllocationInput {
  students: StudentWithPriorities[]
  events: EventWithCapacity[]
  seed: string
  preserveManual: boolean
}

interface AllocationResult {
  assignments: Map<number, number | null>  // studentId -> eventId
  sonderliste: number[]  // studentIds with no placement
  stats: AllocationStats
}

function allocate(input: AllocationInput): AllocationResult {
  // Pure function - same input always produces same output
}
```

### Pattern 2: Priority-Weighted Round-Robin
**What:** Process all 1st choices first (shuffled), then 2nd, then 3rd
**When to use:** The core allocation algorithm
**Example:**
```typescript
// Source: Standard school lottery algorithm
function allocate(input: AllocationInput): AllocationResult {
  const rng = mulberry32(hashSeed(input.seed))
  const shuffle = createShuffler(rng)

  // Build capacity tracker
  const remaining = new Map<number, number>()
  input.events.forEach(e => remaining.set(e.id, e.capacity))

  // Deduct already-assigned (manual overrides)
  const assignments = new Map<number, number | null>()
  const toProcess: number[] = []

  input.students.forEach(s => {
    if (input.preserveManual && s.assignmentType === 'manual') {
      assignments.set(s.id, s.assignedEventId)
      if (s.assignedEventId) {
        remaining.set(s.assignedEventId, remaining.get(s.assignedEventId)! - 1)
      }
    } else {
      toProcess.push(s.id)
    }
  })

  // Round 1: First choices
  const round1 = shuffle([...toProcess])
  for (const studentId of round1) {
    const student = input.students.find(s => s.id === studentId)!
    if (tryAssign(student.priority1Id, studentId, remaining, assignments)) {
      toProcess.splice(toProcess.indexOf(studentId), 1)
    }
  }

  // Round 2: Second choices (remaining students)
  const round2 = shuffle([...toProcess])
  // ... similar pattern

  // Round 3: Third choices (remaining students)
  // ... similar pattern

  // Sonderliste: anyone still in toProcess
  return { assignments, sonderliste: toProcess, stats }
}
```

### Pattern 3: Drizzle Transaction for Atomic Updates
**What:** Wrap all assignment updates in a transaction
**When to use:** Persisting allocation results
**Example:**
```typescript
// Source: Drizzle ORM official docs
async function persistAllocation(result: AllocationResult, allocationId: number) {
  await db.transaction(async (tx) => {
    // Update all student assignments
    for (const [studentId, eventId] of result.assignments) {
      await tx
        .update(students)
        .set({
          assignedEventId: eventId,
          assignmentType: 'auto',
          assignedAt: new Date(),
        })
        .where(eq(students.id, studentId))
    }

    // Update allocation record
    await tx
      .update(allocations)
      .set({
        status: 'completed',
        stats: JSON.stringify(result.stats),
        completedAt: new Date(),
      })
      .where(eq(allocations.id, allocationId))
  }, { behavior: 'immediate' })
}
```

### Pattern 4: Controlled Dialog for Reassignment
**What:** Click student row to open modal with event selection
**When to use:** Manual reassignment UI
**Example:**
```typescript
// Source: shadcn/ui Dialog docs
'use client'
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'

function AssignmentModal({
  student,
  events,
  open,
  onOpenChange,
  onAssign
}: AssignmentModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student.lastName}, {student.firstName}</DialogTitle>
          <DialogDescription>
            Veranstaltung manuell zuweisen
          </DialogDescription>
        </DialogHeader>
        {/* Event list with capacity indicators */}
        <DialogFooter>
          <Button
            onClick={() => startTransition(() => onAssign(selectedEventId))}
            disabled={isPending}
          >
            {isPending ? 'Speichern...' : 'Zuweisen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Anti-Patterns to Avoid
- **Random without seed:** Using `Math.random()` directly makes results non-reproducible
- **Modifying during iteration:** Don't modify student list while iterating
- **No transaction:** Updates without transaction can leave partial state
- **Client-side allocation:** Algorithm must run server-side for consistency

## Don't Hand-Roll

Problems with existing solutions that must be used.

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded PRNG | Custom math | Mulberry32 algorithm | Well-tested, 32-bit full period |
| Shuffle | Array sort trick | Fisher-Yates | O(n) vs O(n log n), unbiased |
| Transactions | Manual try/catch | Drizzle `db.transaction()` | Automatic rollback on error |
| Modals | Custom portal logic | shadcn Dialog | Accessible, focus trap, animations |
| Statistics | Manual percentage calc | Simple division with toFixed | Don't overcomplicate |

**Key insight:** The allocation algorithm is where complexity lives. Everything else (UI, persistence) should use standard patterns.

## Common Pitfalls

### Pitfall 1: Non-deterministic Seeds
**What goes wrong:** Using `Date.now()` or `Math.random()` for seed generation
**Why it happens:** Seems convenient for "random" behavior
**How to avoid:** Generate human-readable seeds like `2026-sporttag-001` that can be recorded and reused
**Warning signs:** Different results on re-run without changing data

### Pitfall 2: Capacity Race Conditions
**What goes wrong:** Two students assigned to last slot simultaneously
**Why it happens:** Checking capacity and updating separately
**How to avoid:** Use transaction with `behavior: 'immediate'` for write lock, or process sequentially in memory first
**Warning signs:** Events with more assignments than capacity

### Pitfall 3: Lost Manual Overrides
**What goes wrong:** Re-running allocation overwrites teacher's manual assignments
**Why it happens:** Not checking `assignmentType` before reassigning
**How to avoid:** Skip students with `assignmentType === 'manual'` when `preserveManual` is true
**Warning signs:** Teachers complaining their changes disappeared

### Pitfall 4: useTransition Stuck in Next.js 15
**What goes wrong:** `isPending` stays true after revalidatePath
**Why it happens:** Known Next.js 15 regression with revalidatePath inside startTransition
**How to avoid:** Use useActionState for forms, or manage loading state manually
**Warning signs:** Infinite loading spinner after allocation completes

### Pitfall 5: Dialog Portal Form Submission
**What goes wrong:** Form inside dialog doesn't submit correctly
**Why it happens:** React portal renders dialog content outside form DOM tree
**How to avoid:** Use server action directly with onClick, not form submission inside dialog
**Warning signs:** Form values not captured, submit does nothing

## Code Examples

Verified patterns for this phase.

### Mulberry32 Seeded PRNG
```typescript
// Source: github.com/cprosche/mulberry32
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Convert string seed to number
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}
```

### Fisher-Yates Shuffle with Seeded Random
```typescript
// Source: Standard algorithm
function createShuffler(rng: () => number) {
  return function shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
```

### Server Action with Loading State
```typescript
// Source: Next.js docs
'use server'

import { revalidatePath } from 'next/cache'

export async function runAllocation(seed: string) {
  // Create allocation record
  const [allocation] = await db
    .insert(allocations)
    .values({ seed, status: 'running' })
    .returning()

  try {
    // Fetch current state
    const allStudents = await db.select().from(students)
    const allEvents = await db.select().from(events)

    // Run pure algorithm
    const result = allocate({
      students: allStudents,
      events: allEvents,
      seed,
      preserveManual: true,
    })

    // Persist results
    await persistAllocation(result, allocation.id)

    revalidatePath('/allocation')
    return { success: true, stats: result.stats }
  } catch (error) {
    await db
      .update(allocations)
      .set({ status: 'failed' })
      .where(eq(allocations.id, allocation.id))

    return { success: false, error: 'Allocation failed' }
  }
}
```

### Statistics Calculation
```typescript
// Source: Standard pattern
interface AllocationStats {
  total: number
  got1stChoice: number
  got2ndChoice: number
  got3rdChoice: number
  sonderliste: number
}

function calculateStats(
  assignments: Map<number, number | null>,
  students: StudentWithPriorities[]
): AllocationStats {
  const stats: AllocationStats = {
    total: students.length,
    got1stChoice: 0,
    got2ndChoice: 0,
    got3rdChoice: 0,
    sonderliste: 0,
  }

  for (const student of students) {
    const assignedEventId = assignments.get(student.id)
    if (assignedEventId === null) {
      stats.sonderliste++
    } else if (assignedEventId === student.priority1Id) {
      stats.got1stChoice++
    } else if (assignedEventId === student.priority2Id) {
      stats.got2ndChoice++
    } else if (assignedEventId === student.priority3Id) {
      stats.got3rdChoice++
    }
  }

  return stats
}

// Display as percentages
function formatStats(stats: AllocationStats) {
  const pct = (n: number) => ((n / stats.total) * 100).toFixed(1)
  return {
    first: `${pct(stats.got1stChoice)}%`,
    second: `${pct(stats.got2ndChoice)}%`,
    third: `${pct(stats.got3rdChoice)}%`,
    unassigned: `${pct(stats.sonderliste)}%`,
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useTransition for actions | useActionState hook | React 19 | Better form integration |
| Manual loading state | useActionState pending | React 19 | Simpler code |
| seedrandom library | Inline Mulberry32 | N/A | Zero dependencies |

**Deprecated/outdated:**
- `useFormState`: Renamed to `useActionState` in React 19
- LibSQL batch API: Not applicable for better-sqlite3

## Open Questions

Things that couldn't be fully resolved.

1. **Seed generation UI**
   - What we know: Seeds should be human-readable and recordable
   - What's unclear: Should UI auto-generate or let teacher input?
   - Recommendation: Auto-generate with format `YYYY-MM-DD-NNN` but allow custom input

2. **Allocation history**
   - What we know: Need to track allocations for audit
   - What's unclear: How much history to retain, how to display
   - Recommendation: Keep last 10 allocations, show in collapsed section

3. **Partial re-allocation**
   - What we know: CONTEXT.md says "re-run only affects unassigned"
   - What's unclear: How to handle students whose priority event became full since last run
   - Recommendation: Skip already-assigned students entirely, don't demote them

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions) - SQLite transaction syntax, behavior options
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog) - Modal component patterns
- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/tabs) - Tab navigation component
- [Mulberry32 GitHub](https://github.com/cprosche/mulberry32) - Seeded PRNG implementation

### Secondary (MEDIUM confidence)
- [Fair Random Assignment Wikipedia](https://en.wikipedia.org/wiki/Fair_random_assignment) - Theoretical background on lottery allocation
- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - useTransition patterns

### Tertiary (LOW confidence)
- GitHub discussions on Next.js 15 useTransition issues - Known regression with revalidatePath

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project stack, verified with official docs
- Architecture: HIGH - Pure function pattern is well-established, Drizzle transactions documented
- Algorithm: HIGH - Fisher-Yates and Mulberry32 are well-tested standards
- Pitfalls: MEDIUM - Next.js 15 issues from GitHub discussions, not official docs

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable domain, standard patterns)
