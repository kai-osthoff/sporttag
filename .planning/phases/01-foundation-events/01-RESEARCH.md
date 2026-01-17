# Phase 1: Foundation + Events - Research

**Researched:** 2026-01-17
**Domain:** Next.js 16 + SQLite + Drizzle ORM foundation for event management CRUD
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation and implements basic event CRUD operations. This phase sets up the Next.js 16 project with TypeScript, Tailwind CSS v4, SQLite/Drizzle ORM for persistence, and shadcn/ui for components. The event management functionality (EVENT-01 through EVENT-04) is straightforward CRUD but must be built with the correct patterns from the start.

The domain research from 2026-01-16 recommended Next.js 15.5, but Next.js 16 is now stable (released Oct 2025, now at v16.1.3). Key changes include: Turbopack as default bundler, async params/searchParams required, middleware renamed to proxy, and AMP/next lint removed. The upgrade is recommended since v16 is production-ready and includes performance improvements.

**Primary recommendation:** Use Next.js 16.1.x with the recommended defaults (TypeScript, Tailwind CSS v4, ESLint, App Router, Turbopack). Set up SQLite with Drizzle ORM using better-sqlite3 driver. Use shadcn/ui for UI components. Build events CRUD with Server Actions and Zod validation.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.1.x | Full-stack React framework | Stable with Turbopack default, Server Actions for forms, single deployment unit |
| **React** | 19.2.x | UI library | Bundled with Next.js 16, includes useActionState/useOptimistic hooks |
| **TypeScript** | 5.1.0+ | Type safety | Required by Next.js 16, end-to-end type inference with Drizzle |
| **Tailwind CSS** | 4.1.x | Utility-first styling | Zero-config, automatic content detection, 5x faster builds |

### Database

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **SQLite** | 3.x | Database engine | Zero-config, single-file backup, perfect for ~250 users |
| **better-sqlite3** | 12.6.x | SQLite driver | Synchronous API, best Node.js SQLite performance |
| **Drizzle ORM** | 0.45.x | Type-safe ORM | SQL-first, ~7kb, excellent TypeScript inference, no codegen |
| **drizzle-kit** | latest | Migrations CLI | Generate and run schema migrations |

### UI & Forms

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **shadcn/ui** | latest | Component library | Copy-paste components, full customization, built on Radix UI |
| **Zod** | 4.3.x | Schema validation | Type inference, works client and server, shared validation |
| **@tanstack/react-table** | 8.21.x | Data tables | Event listing with sorting, filtering (Phase 1 minimal use) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 16 | Next.js 15.5.x | v15 is stable but lacks Turbopack-by-default performance; v16 is now production-ready |
| SQLite | PostgreSQL | PostgreSQL adds deployment complexity; SQLite sufficient for ~250 users/year |
| Drizzle | Prisma | Prisma requires code generation, heavier, weaker SQLite support |
| shadcn/ui | Material UI | MUI is heavier, less customizable, worse print styles |

**Installation:**
```bash
# Create Next.js project with defaults
npx create-next-app@latest sporttag --yes

# Database dependencies
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3

# Validation
npm install zod

# shadcn/ui (run after project creation)
npx shadcn@latest init
npx shadcn@latest add button card form input label table textarea
```

## Architecture Patterns

### Recommended Project Structure

```
sporttag/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata
│   ├── globals.css             # Tailwind CSS import
│   ├── page.tsx                # Home/dashboard page
│   └── events/
│       ├── page.tsx            # Event list (EVENT-04)
│       ├── new/
│       │   └── page.tsx        # Create event form (EVENT-01)
│       └── [id]/
│           ├── page.tsx        # View single event
│           └── edit/
│               └── page.tsx    # Edit event form (EVENT-02)
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   └── events/
│       ├── event-form.tsx      # Shared form for create/edit
│       ├── event-list.tsx      # Event table component
│       └── event-card.tsx      # Single event display
├── db/
│   ├── index.ts                # Database connection
│   ├── schema.ts               # Drizzle schema definitions
│   └── migrations/             # Generated migration files
├── lib/
│   ├── actions/
│   │   └── events.ts           # Server Actions for event CRUD
│   └── validations/
│       └── events.ts           # Zod schemas for events
├── drizzle.config.ts           # Drizzle Kit configuration
└── sporttag.db                 # SQLite database file (gitignored)
```

### Pattern 1: Server Actions for CRUD

**What:** Use Next.js Server Actions for all data mutations
**When to use:** Any form submission or data modification
**Example:**

```typescript
// lib/actions/events.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eventSchema } from '@/lib/validations/events'
import { eq } from 'drizzle-orm'

export async function createEvent(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    capacity: Number(formData.get('capacity')),
  }

  const validatedFields = eventSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  await db.insert(events).values(validatedFields.data)
  revalidatePath('/events')
  return { success: true }
}
```

Source: [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms)

### Pattern 2: Shared Zod Schemas

**What:** Define validation schema once, use on client and server
**When to use:** Any form with validation requirements
**Example:**

```typescript
// lib/validations/events.ts
import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  description: z.string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional(),
  capacity: z.number()
    .int('Kapazitaet muss eine ganze Zahl sein')
    .min(1, 'Kapazitaet muss mindestens 1 sein')
    .max(500, 'Kapazitaet darf maximal 500 sein'),
})

export type EventInput = z.infer<typeof eventSchema>
```

Source: [Zod Documentation](https://zod.dev/), [Next.js Zod Validation](https://nextjs.org/docs/app/guides/forms)

### Pattern 3: Drizzle Schema with Type Inference

**What:** Define database schema with full TypeScript inference
**When to use:** All database table definitions
**Example:**

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  capacity: integer('capacity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
})

// Type inference
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
```

Source: [Drizzle ORM SQLite](https://orm.drizzle.team/docs/get-started-sqlite)

### Pattern 4: Database Connection Singleton

**What:** Single database connection for entire application
**When to use:** Database initialization
**Example:**

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('sporttag.db')
export const db = drizzle(sqlite, { schema })
```

Source: [Drizzle better-sqlite3](https://orm.drizzle.team/docs/get-started-sqlite)

### Anti-Patterns to Avoid

- **Client-side only validation:** Always validate on server with Zod; client validation is UX only
- **Direct SQL in components:** Use Server Actions, keep data logic in `lib/actions/`
- **Hardcoded strings:** Use constants for error messages, keep German text centralized
- **Missing revalidatePath:** Always revalidate after mutations to update cached data

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState/useReducer | `useActionState` + Server Actions | Built-in pending state, error handling |
| Form validation | Manual if/else checks | Zod schemas | Type inference, reusable, comprehensive |
| Database queries | Raw SQL strings | Drizzle ORM queries | Type safety, SQL injection prevention |
| UI components | Custom buttons/inputs | shadcn/ui | Accessible, tested, consistent styling |
| Table rendering | Manual `<table>` loops | @tanstack/react-table | Sorting, filtering, pagination built-in |
| Timestamps | Manual Date handling | Drizzle `$defaultFn` | Automatic, consistent, no drift |

**Key insight:** Next.js 16 + React 19 provide built-in form handling with `useActionState` and `useOptimistic`. Don't reach for React Hook Form unless forms become complex (Phase 2 with 3-priority selection may warrant it).

## Common Pitfalls

### Pitfall 1: Forgetting Async Params in Next.js 16

**What goes wrong:** Build fails or runtime errors accessing `params` or `searchParams`
**Why it happens:** Next.js 16 requires async access to dynamic route params
**How to avoid:** Always await params in page/layout components
**Warning signs:** TypeScript errors about Promise type, runtime "params is a Promise" errors

```typescript
// WRONG (Next.js 15 pattern)
export default function EventPage({ params }: { params: { id: string } }) {
  const eventId = params.id  // Error in Next.js 16
}

// CORRECT (Next.js 16 pattern)
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Pitfall 2: SQLite Foreign Key Constraints Not Enforced

**What goes wrong:** Deleting events succeeds even when registrations reference them
**Why it happens:** SQLite has foreign keys OFF by default
**How to avoid:** Enable foreign keys on connection
**Warning signs:** Orphaned records, no constraint errors

```typescript
// db/index.ts
const sqlite = new Database('sporttag.db')
sqlite.pragma('foreign_keys = ON')  // MUST enable explicitly
export const db = drizzle(sqlite, { schema })
```

### Pitfall 3: Missing revalidatePath After Mutations

**What goes wrong:** UI doesn't update after create/edit/delete
**Why it happens:** Next.js caches data fetches; must invalidate after mutations
**How to avoid:** Always call `revalidatePath` in Server Actions after mutations
**Warning signs:** Stale data shown, refresh fixes it

```typescript
// lib/actions/events.ts
export async function deleteEvent(id: number) {
  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/events')  // MUST revalidate
  return { success: true }
}
```

### Pitfall 4: Zod Validation Errors Not Displayed

**What goes wrong:** Form submits, fails silently, no user feedback
**Why it happens:** Server Action returns errors but component doesn't display them
**How to avoid:** Use `useActionState` to capture and display validation errors
**Warning signs:** Form clears but no success/error message, no database entry

```typescript
// components/events/event-form.tsx
'use client'

import { useActionState } from 'react'
import { createEvent } from '@/lib/actions/events'

export function EventForm() {
  const [state, formAction, pending] = useActionState(createEvent, { errors: {} })

  return (
    <form action={formAction}>
      <input name="name" />
      {state.errors?.name && (
        <p className="text-red-500">{state.errors.name[0]}</p>
      )}
      {/* ... */}
    </form>
  )
}
```

### Pitfall 5: Delete Without Registration Check

**What goes wrong:** Teacher deletes event that has registrations, orphaned data
**Why it happens:** No business logic check before deletion
**How to avoid:** Check for registrations before allowing delete; show error if exist
**Warning signs:** Success criteria states "delete event that has no registrations"

```typescript
// lib/actions/events.ts
export async function deleteEvent(id: number) {
  // Check for registrations (will exist in Phase 2+)
  const registrationCount = await db
    .select({ count: sql`count(*)` })
    .from(registrations)
    .where(eq(registrations.eventId, id))

  if (registrationCount[0].count > 0) {
    return {
      error: 'Veranstaltung kann nicht geloescht werden - es existieren Anmeldungen'
    }
  }

  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/events')
  return { success: true }
}
```

Note: In Phase 1, there are no registrations yet, but the schema and logic should anticipate Phase 2.

## Code Examples

Verified patterns from official sources:

### Database Setup with Drizzle Kit

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sporttag.db',
  },
} satisfies Config
```

```bash
# Generate migration from schema
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

Source: [Drizzle Kit](https://orm.drizzle.team/docs/drizzle-kit)

### Event List with Capacity Display (EVENT-04)

```typescript
// app/events/page.tsx
import { db } from '@/db'
import { events } from '@/db/schema'
import { EventList } from '@/components/events/event-list'

export default async function EventsPage() {
  const allEvents = await db.select().from(events)

  // In Phase 2+, join with registrations to get current count
  const eventsWithCapacity = allEvents.map(event => ({
    ...event,
    currentRegistrations: 0,  // Placeholder until Phase 2
  }))

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Veranstaltungen</h1>
      <EventList events={eventsWithCapacity} />
    </div>
  )
}
```

### Form with useActionState

```typescript
// components/events/event-form.tsx
'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ActionState = {
  errors?: {
    name?: string[]
    description?: string[]
    capacity?: string[]
  }
  success?: boolean
}

interface EventFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  initialData?: {
    name: string
    description: string | null
    capacity: number
  }
}

export function EventForm({ action, initialData }: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, { errors: {} })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          required
        />
        {state.errors?.name && (
          <p className="text-sm text-red-500 mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description ?? ''}
        />
        {state.errors?.description && (
          <p className="text-sm text-red-500 mt-1">{state.errors.description[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="capacity">Kapazitaet</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={initialData?.capacity}
          required
        />
        {state.errors?.capacity && (
          <p className="text-sm text-red-500 mt-1">{state.errors.capacity[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Speichern...' : 'Speichern'}
      </Button>
    </form>
  )
}
```

Source: [Next.js Forms with useActionState](https://nextjs.org/docs/app/guides/forms)

### shadcn/ui Initialization

```bash
# Initialize shadcn/ui (interactive)
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate (or preference)
# - CSS variables: Yes
# - React Server Components: Yes
# - Import alias: @/components

# Add required components for Phase 1
npx shadcn@latest add button card form input label table textarea
```

Source: [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js 15 sync params | Next.js 16 async params | Oct 2025 | All dynamic routes must await params |
| `middleware.ts` | `proxy.ts` | Next.js 16 | Rename required, nodejs runtime only |
| Tailwind `@tailwind` directives | `@import "tailwindcss"` | Tailwind v4 | Simplified CSS setup |
| tailwind.config.js required | Auto content detection | Tailwind v4 | Zero-config by default |
| `next lint` built-in | ESLint/Biome direct | Next.js 16 | Run linter via npm scripts |
| React Hook Form for all forms | useActionState for simple forms | React 19 | Built-in form handling sufficient for basic CRUD |

**Deprecated/outdated:**
- `next/legacy/image`: Removed in Next.js 16, use `next/image`
- `images.domains`: Use `images.remotePatterns` instead
- `serverRuntimeConfig`/`publicRuntimeConfig`: Use environment variables directly
- AMP support: Completely removed from Next.js 16

## Open Questions

Things that couldn't be fully resolved:

1. **better-sqlite3 native build on deployment**
   - What we know: better-sqlite3 requires native compilation, may need build tools
   - What's unclear: Specific requirements for school IT deployment environment
   - Recommendation: Plan for Docker deployment which handles native dependencies

2. **Event capacity display before registrations exist**
   - What we know: EVENT-04 requires showing "current capacity status"
   - What's unclear: What to show when no registrations exist yet (Phase 1)
   - Recommendation: Show "0/[capacity] belegt" with placeholder until Phase 2

3. **Tailwind CSS v4 browser compatibility**
   - What we know: v4 has compromises for browsers older than 3 years
   - What's unclear: What browsers school computers use
   - Recommendation: Likely fine for school environment; test on actual hardware

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) - Version 16 features, breaking changes
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Migration from v15
- [Next.js Installation Guide](https://nextjs.org/docs/app/getting-started/installation) - Project setup
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - Server Actions, Zod, useActionState
- [Drizzle ORM SQLite](https://orm.drizzle.team/docs/get-started-sqlite) - Database setup
- [Drizzle ORM Schema](https://orm.drizzle.team/docs/sql-schema-declaration) - Schema definition patterns
- [shadcn/ui Next.js](https://ui.shadcn.com/docs/installation/next) - Component library setup
- [Tailwind CSS Next.js](https://tailwindcss.com/docs/guides/nextjs) - Styling setup

### Secondary (MEDIUM confidence)
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) - New features, breaking changes
- [Next.js 16 Dashboard Starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) - Reference architecture
- Domain research from `.planning/research/STACK.md` - Technology decisions (verified versions updated)

### Tertiary (LOW confidence)
- Blog posts on React Hook Form + Zod patterns - May not account for useActionState improvements

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm, official docs current
- Architecture: HIGH - Well-documented Next.js App Router patterns
- Pitfalls: HIGH - Based on official migration guide + domain research
- Code examples: HIGH - From official documentation

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable technologies)

**Note:** Domain research from 2026-01-16/17 recommended Next.js 15.5 to avoid v16 "too new" issues. This phase research updates that recommendation: Next.js 16.1.x is now stable (3 months since release) and recommended. The async params change is the main migration concern but is well-documented.
