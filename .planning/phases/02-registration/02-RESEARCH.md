# Phase 2: Registration - Research

**Researched:** 2026-01-17
**Domain:** Student registration with 3-priority event selection, Drizzle ORM relations, Zod cross-field validation
**Confidence:** HIGH

## Summary

Phase 2 implements student registration functionality where teachers can enter student data (Vorname, Nachname, Klasse) and select 3 different event priorities. This phase builds directly on Phase 1's foundation and requires extending the database schema with a new students table that has foreign key relationships to events.

The key technical challenges are: (1) database schema design with one-to-many relationships using Drizzle ORM, (2) form with 3 select dropdowns that must be mutually exclusive (no duplicate priorities), and (3) Zod validation with `.refine()` for cross-field uniqueness validation. The existing codebase already has all necessary patterns established - this phase extends them rather than introducing new paradigms.

**Primary recommendation:** Add a students table with foreign keys to events for priority1Id, priority2Id, priority3Id. Use shadcn/ui Select component for priority dropdowns. Use Zod `.refine()` for uniqueness validation. Use Sonner toast for success confirmation (REG-05).

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Drizzle ORM** | 0.45.x | Database with relations | Already used, excellent foreign key support |
| **Zod** | 4.3.x | Validation with refinements | Already used, `.refine()` for cross-field validation |
| **useActionState** | React 19 | Form state management | Already used in Phase 1 event forms |

### New Components (Add via shadcn)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **shadcn/ui Select** | latest | Priority dropdowns | Built on Radix, accessible, filterable |
| **Sonner** | latest | Toast notifications | Replaced deprecated shadcn/ui toast, success confirmation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 3 separate FK columns | Junction table (many-to-many) | Overkill for exactly 3 ordered priorities; separate columns clearer |
| Select dropdowns | Radio button groups | Select better UX for 10+ events, searchable |
| Sonner toast | Alert component | Toast is standard for success confirmations, non-blocking |

**Installation:**
```bash
# Add shadcn/ui components
npx shadcn@latest add select sonner
```

## Architecture Patterns

### Database Schema Extension

```
students table:
  - id (PK)
  - firstName (text, not null)
  - lastName (text, not null)
  - class (text, not null)
  - priority1Id (FK to events.id, not null)
  - priority2Id (FK to events.id, not null)
  - priority3Id (FK to events.id, not null)
  - createdAt (timestamp)
  - updatedAt (timestamp)
```

**Why 3 FK columns instead of junction table:**
- Exactly 3 priorities required (not variable)
- Order matters (1st, 2nd, 3rd choice)
- Simpler queries for listing/allocation
- Type safety with Drizzle relations

### Recommended Project Structure (Additions)

```
src/
├── app/
│   ├── layout.tsx              # Add Toaster component
│   └── registrations/
│       ├── page.tsx            # Student list (REG-06)
│       └── new/
│           └── page.tsx        # Registration form (REG-01, REG-02)
├── components/
│   ├── ui/
│   │   ├── select.tsx          # shadcn/ui Select (new)
│   │   └── sonner.tsx          # Sonner Toaster (new)
│   └── registrations/
│       ├── registration-form.tsx  # Form with 3 priority selects
│       └── student-list.tsx       # Table of registered students
├── db/
│   └── schema.ts               # Add students table + relations
└── lib/
    ├── actions/
    │   └── registrations.ts    # Server Actions for registration
    └── validations/
        └── registrations.ts    # Zod schema with uniqueness check
```

### Pattern 1: Drizzle ORM Foreign Key References

**What:** Define students table with foreign keys to events
**When to use:** Any table that references another table
**Example:**

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

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

export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  class: text('class').notNull(),
  priority1Id: integer('priority_1_id')
    .notNull()
    .references(() => events.id),
  priority2Id: integer('priority_2_id')
    .notNull()
    .references(() => events.id),
  priority3Id: integer('priority_3_id')
    .notNull()
    .references(() => events.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
})

// Relations for query builder (optional but useful)
export const studentsRelations = relations(students, ({ one }) => ({
  priority1: one(events, {
    fields: [students.priority1Id],
    references: [events.id],
    relationName: 'priority1',
  }),
  priority2: one(events, {
    fields: [students.priority2Id],
    references: [events.id],
    relationName: 'priority2',
  }),
  priority3: one(events, {
    fields: [students.priority3Id],
    references: [events.id],
    relationName: 'priority3',
  }),
}))

// Type inference
export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert
```

Source: [Drizzle ORM Foreign Keys](https://orm.drizzle.team/docs/indexes-constraints), [Drizzle Relations](https://orm.drizzle.team/docs/relations)

### Pattern 2: Zod Cross-Field Uniqueness Validation

**What:** Validate that all 3 priority selections are different
**When to use:** Any form where multiple fields must have unique values
**Example:**

```typescript
// lib/validations/registrations.ts
import { z } from 'zod'

export const registrationSchema = z.object({
  firstName: z.string()
    .min(1, 'Vorname ist erforderlich')
    .max(100, 'Vorname darf maximal 100 Zeichen lang sein'),
  lastName: z.string()
    .min(1, 'Nachname ist erforderlich')
    .max(100, 'Nachname darf maximal 100 Zeichen lang sein'),
  class: z.string()
    .min(1, 'Klasse ist erforderlich')
    .max(10, 'Klasse darf maximal 10 Zeichen lang sein'),
  priority1Id: z.coerce.number()
    .int('Ungueltige Auswahl')
    .min(1, '1. Prioritaet ist erforderlich'),
  priority2Id: z.coerce.number()
    .int('Ungueltige Auswahl')
    .min(1, '2. Prioritaet ist erforderlich'),
  priority3Id: z.coerce.number()
    .int('Ungueltige Auswahl')
    .min(1, '3. Prioritaet ist erforderlich'),
}).refine(
  (data) => {
    const priorities = [data.priority1Id, data.priority2Id, data.priority3Id]
    return new Set(priorities).size === priorities.length
  },
  {
    message: 'Alle Prioritaeten muessen unterschiedlich sein',
    path: ['priority3Id'], // Show error on last field
  }
)

export type RegistrationInput = z.infer<typeof registrationSchema>
```

Source: [Zod Refinements](https://zod.dev/api#refine)

### Pattern 3: shadcn/ui Select with Form Integration

**What:** Priority dropdown using Select component
**When to use:** Selecting from a list of options
**Example:**

```typescript
// components/registrations/priority-select.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Event } from '@/db/schema'

interface PrioritySelectProps {
  name: string
  label: string
  events: Event[]
  defaultValue?: string
  error?: string[]
  disabledValues?: number[]
}

export function PrioritySelect({
  name,
  label,
  events,
  defaultValue,
  error,
  disabledValues = [],
}: PrioritySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} *</Label>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={name}>
          <SelectValue placeholder="Veranstaltung waehlen..." />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem
              key={event.id}
              value={String(event.id)}
              disabled={disabledValues.includes(event.id)}
            >
              {event.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error[0]}</p>
      )}
    </div>
  )
}
```

Source: [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)

### Pattern 4: Sonner Toast for Success Confirmation

**What:** Show non-blocking success message after registration
**When to use:** Confirming successful operations (REG-05)
**Example:**

```typescript
// app/layout.tsx - Add Toaster
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// lib/actions/registrations.ts - Use toast from client after redirect
// Note: Toast must be triggered client-side, not from Server Action

// components/registrations/registration-form.tsx
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function RegistrationForm({ action, showSuccess }) {
  useEffect(() => {
    if (showSuccess) {
      toast.success('Schueler erfolgreich registriert!')
    }
  }, [showSuccess])

  // ... rest of form
}
```

Source: [Sonner shadcn/ui](https://ui.shadcn.com/docs/components/sonner)

### Pattern 5: Server Action with Redirect and Success Flag

**What:** Registration action that validates and redirects with success indicator
**When to use:** Form submission that needs to show confirmation
**Example:**

```typescript
// lib/actions/registrations.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { students } from '@/db/schema'
import { registrationSchema } from '@/lib/validations/registrations'

export type RegistrationState = {
  errors?: {
    firstName?: string[]
    lastName?: string[]
    class?: string[]
    priority1Id?: string[]
    priority2Id?: string[]
    priority3Id?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createRegistration(
  prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    class: formData.get('class'),
    priority1Id: formData.get('priority1Id'),
    priority2Id: formData.get('priority2Id'),
    priority3Id: formData.get('priority3Id'),
  }

  const validatedFields = registrationSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.insert(students).values({
      firstName: validatedFields.data.firstName,
      lastName: validatedFields.data.lastName,
      class: validatedFields.data.class,
      priority1Id: validatedFields.data.priority1Id,
      priority2Id: validatedFields.data.priority2Id,
      priority3Id: validatedFields.data.priority3Id,
    })
  } catch (error) {
    return {
      errors: { _form: ['Fehler beim Speichern der Registrierung'] },
    }
  }

  revalidatePath('/registrations')
  redirect('/registrations?success=true')
}
```

### Anti-Patterns to Avoid

- **Storing priority as array/JSON:** Use 3 separate FK columns; JSON loses referential integrity
- **Client-only uniqueness check:** Always validate on server; client check is UX enhancement only
- **Toast from Server Action:** Toast must be triggered client-side; pass success flag via redirect
- **Allowing same event for multiple priorities:** Validate uniqueness in both Zod schema and UI

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown selection | Custom dropdown with useState | shadcn/ui Select | Accessibility, keyboard nav, search built-in |
| Unique array validation | Manual loop checking | Zod `.refine()` with Set | Standard pattern, type-safe |
| Success notifications | Custom alert state | Sonner toast | Standard UX, auto-dismiss, stacking |
| Foreign key relations | Manual ID validation | Drizzle `.references()` | Database-level integrity |
| Form state with validation | Manual useState + errors | `useActionState` | Built-in pending, automatic updates |

**Key insight:** Phase 2 extends Phase 1 patterns. The only new additions are shadcn/ui Select and Sonner - both install with single command and follow established patterns.

## Common Pitfalls

### Pitfall 1: Select Component Not Submitting Value

**What goes wrong:** Form submits but priority IDs are null/undefined
**Why it happens:** Radix Select doesn't use native `<select>` element; value must be captured
**How to avoid:** Use the `name` prop on Select component - shadcn/ui handles this correctly
**Warning signs:** FormData.get('priorityXId') returns null

```typescript
// CORRECT - shadcn/ui Select with name prop
<Select name="priority1Id" defaultValue={defaultValue}>
  <SelectTrigger>
    <SelectValue placeholder="Waehlen..." />
  </SelectTrigger>
  <SelectContent>
    {events.map((event) => (
      <SelectItem key={event.id} value={String(event.id)}>
        {event.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Pitfall 2: z.coerce.number() Needed for FormData Values

**What goes wrong:** Zod validation fails with "expected number, received string"
**Why it happens:** FormData.get() always returns string; select values are strings
**How to avoid:** Use `z.coerce.number()` instead of `z.number()`
**Warning signs:** Validation error even with valid number selection

```typescript
// WRONG
priority1Id: z.number().int().min(1)

// CORRECT
priority1Id: z.coerce.number().int().min(1)
```

### Pitfall 3: Refine Error Path Not Showing

**What goes wrong:** Uniqueness error exists but no field shows it
**Why it happens:** `.refine()` without `path` option shows error at root level
**How to avoid:** Specify `path` option in refine to target specific field
**Warning signs:** `errors._form` has uniqueness error but no field-level display

```typescript
// WRONG - error at root
.refine((data) => uniqueCheck(data), {
  message: 'Must be unique'
})

// CORRECT - error on specific field
.refine((data) => uniqueCheck(data), {
  message: 'Alle Prioritaeten muessen unterschiedlich sein',
  path: ['priority3Id'],  // Show on last priority field
})
```

### Pitfall 4: Disabling Already-Selected Options

**What goes wrong:** Teacher selects same event for multiple priorities (caught by validation but bad UX)
**Why it happens:** No UI feedback that selection is already used
**How to avoid:** Pass selected values to each Select, disable those options
**Warning signs:** Multiple validation errors for same event

```typescript
// Track selections in form component
const [selected, setSelected] = useState<number[]>([])

<PrioritySelect
  name="priority2Id"
  events={events}
  disabledValues={[selected[0]]}  // Disable first selection
/>
<PrioritySelect
  name="priority3Id"
  events={events}
  disabledValues={[selected[0], selected[1]]}  // Disable first two
/>
```

**Note:** This requires controlled components or client-side state tracking. For server-side forms with `useActionState`, the simpler approach is validation error feedback - disabling requires additional client interactivity.

### Pitfall 5: Delete Event with Existing Registrations

**What goes wrong:** Deleting an event orphans student registrations
**Why it happens:** SQLite foreign keys enabled but no cascade/restrict defined
**How to avoid:** Update deleteEvent action to check for registrations first
**Warning signs:** Database constraint error or orphaned records

```typescript
// lib/actions/events.ts - Update in Phase 2
export async function deleteEvent(id: number): Promise<ActionState> {
  // Check for registrations referencing this event
  const registrationCount = await db
    .select({ count: sql`count(*)` })
    .from(students)
    .where(
      or(
        eq(students.priority1Id, id),
        eq(students.priority2Id, id),
        eq(students.priority3Id, id)
      )
    )

  if (Number(registrationCount[0].count) > 0) {
    return {
      errors: {
        _form: ['Veranstaltung kann nicht geloescht werden - es existieren Anmeldungen']
      },
    }
  }

  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/events')
  return { success: true }
}
```

## Code Examples

Verified patterns from official sources:

### Student List with Priority Display (REG-06)

```typescript
// app/registrations/page.tsx
import Link from 'next/link'
import { db } from '@/db'
import { students, events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentList } from '@/components/registrations/student-list'

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams

  // Query students with their priority event names
  const allStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      priority1Name: sql`(SELECT name FROM events WHERE id = ${students.priority1Id})`,
      priority2Name: sql`(SELECT name FROM events WHERE id = ${students.priority2Id})`,
      priority3Name: sql`(SELECT name FROM events WHERE id = ${students.priority3Id})`,
    })
    .from(students)

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Registrierte Schueler</CardTitle>
            <CardDescription>
              Uebersicht aller Schueler mit ihren Prioritaeten
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/registrations/new">Neuer Schueler</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <StudentList students={allStudents} showSuccess={success === 'true'} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Registration Form Component

```typescript
// components/registrations/registration-form.tsx
'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RegistrationState } from '@/lib/actions/registrations'
import type { Event } from '@/db/schema'

interface RegistrationFormProps {
  action: (prevState: RegistrationState, formData: FormData) => Promise<RegistrationState>
  events: Event[]
}

export function RegistrationForm({ action, events }: RegistrationFormProps) {
  const [state, formAction, pending] = useActionState(action, { errors: {} })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schueler registrieren</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.errors?._form && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {state.errors._form[0]}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Max"
                required
              />
              {state.errors?.firstName && (
                <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Mustermann"
                required
              />
              {state.errors?.lastName && (
                <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Klasse *</Label>
            <Input
              id="class"
              name="class"
              placeholder="5a"
              required
            />
            {state.errors?.class && (
              <p className="text-sm text-destructive">{state.errors.class[0]}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Prioritaeten</h3>

            <div className="space-y-2">
              <Label htmlFor="priority1Id">1. Prioritaet *</Label>
              <Select name="priority1Id" required>
                <SelectTrigger id="priority1Id">
                  <SelectValue placeholder="1. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority1Id && (
                <p className="text-sm text-destructive">{state.errors.priority1Id[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority2Id">2. Prioritaet *</Label>
              <Select name="priority2Id" required>
                <SelectTrigger id="priority2Id">
                  <SelectValue placeholder="2. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority2Id && (
                <p className="text-sm text-destructive">{state.errors.priority2Id[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority3Id">3. Prioritaet *</Label>
              <Select name="priority3Id" required>
                <SelectTrigger id="priority3Id">
                  <SelectValue placeholder="3. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority3Id && (
                <p className="text-sm text-destructive">{state.errors.priority3Id[0]}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Registrieren...' : 'Schueler registrieren'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/registrations">Abbrechen</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Student List Table Component

```typescript
// components/registrations/student-list.tsx
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StudentWithPriorities {
  id: number
  firstName: string
  lastName: string
  class: string
  priority1Name: string
  priority2Name: string
  priority3Name: string
}

interface StudentListProps {
  students: StudentWithPriorities[]
  showSuccess?: boolean
}

export function StudentList({ students, showSuccess }: StudentListProps) {
  useEffect(() => {
    if (showSuccess) {
      toast.success('Schueler erfolgreich registriert!')
      // Clean URL without refresh
      window.history.replaceState({}, '', '/registrations')
    }
  }, [showSuccess])

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Schueler registriert.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Klasse</TableHead>
          <TableHead>1. Prioritaet</TableHead>
          <TableHead>2. Prioritaet</TableHead>
          <TableHead>3. Prioritaet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">
              {student.lastName}, {student.firstName}
            </TableCell>
            <TableCell>{student.class}</TableCell>
            <TableCell>{student.priority1Name}</TableCell>
            <TableCell>{student.priority2Name}</TableCell>
            <TableCell>{student.priority3Name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn/ui Toast | Sonner | 2024 | Toast deprecated, use Sonner for notifications |
| React Hook Form for all forms | useActionState + native | React 19 | Simpler for basic forms, RHF for complex |
| Manual form validation | Zod with refine | Zod 3.x+ | Cross-field validation built-in |
| Junction tables for ordered relations | Separate FK columns | N/A (design choice) | Simpler for fixed-count ordered relations |

**Deprecated/outdated:**
- `shadcn/ui toast`: Replaced by Sonner, officially deprecated
- `useFormState`: Renamed to `useActionState` in React 19

## Open Questions

Things that couldn't be fully resolved:

1. **Real-time disabling of already-selected options**
   - What we know: Would improve UX by preventing invalid selections
   - What's unclear: Requires controlled Select components with client state
   - Recommendation: Start with validation-only; add real-time disabling as enhancement if needed

2. **Student edit/delete functionality**
   - What we know: Requirements only specify create and list
   - What's unclear: Whether teachers need to modify/delete registrations
   - Recommendation: Implement read-only in Phase 2; add edit/delete if requested

3. **Duplicate student detection**
   - What we know: Same name + class could be duplicate registration
   - What's unclear: Whether to warn or block
   - Recommendation: Allow (could be twins); consider adding unique constraint on name+class if problematic

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM Foreign Keys](https://orm.drizzle.team/docs/indexes-constraints) - Foreign key syntax
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/relations) - One-to-many patterns
- [Zod Refinements](https://zod.dev/api#refine) - Cross-field validation
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select) - Dropdown component
- [Sonner shadcn/ui](https://ui.shadcn.com/docs/components/sonner) - Toast notifications
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - useActionState patterns

### Secondary (MEDIUM confidence)
- [Zod Unique Array Discussion](https://github.com/colinhacks/zod/discussions/2316) - Community patterns for uniqueness

### Tertiary (LOW confidence)
- None - all patterns verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All verified with existing codebase + official docs
- Architecture: HIGH - Direct extension of Phase 1 patterns
- Database schema: HIGH - Drizzle foreign keys documented and tested
- Validation: HIGH - Zod refine is standard pattern
- Pitfalls: HIGH - Based on official docs and Phase 1 learnings

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable technologies)

**Note:** Phase 2 is a straightforward extension of Phase 1. The main new concepts are: (1) Drizzle foreign key references, (2) Zod cross-field validation with refine, (3) shadcn/ui Select and Sonner components. All follow established patterns.
