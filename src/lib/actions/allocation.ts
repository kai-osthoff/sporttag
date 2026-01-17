'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { events, students, allocations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { allocate } from '@/lib/allocation/algorithm'
import type { AllocationStats, StudentWithPriorities, EventWithCapacity } from '@/lib/allocation/types'

export type AssignmentState = {
  success?: boolean
  error?: string
}

export type AllocationState = {
  success?: boolean
  error?: string
  stats?: AllocationStats
}

/**
 * Generate a reproducible seed for allocation
 * Format: YYYY-MM-DD-NNN where NNN is a random 3-digit number
 */
function generateSeed(): string {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const randomNum = Math.floor(Math.random() * 900) + 100 // 100-999
  return `${dateStr}-${randomNum}`
}

export async function runAllocation(): Promise<AllocationState> {
  const seed = generateSeed()

  // Create allocation record with status 'running'
  let allocationId: number
  try {
    const result = await db.insert(allocations).values({
      seed,
      status: 'running',
    }).returning({ id: allocations.id })
    allocationId = result[0].id
  } catch (error) {
    return {
      success: false,
      error: 'Fehler beim Erstellen des Zuteilungslaufs',
    }
  }

  try {
    // Fetch all students and events from database
    const dbStudents = await db.select().from(students)
    const dbEvents = await db.select().from(events)

    // Map database students to StudentWithPriorities type
    const studentInput: StudentWithPriorities[] = dbStudents.map((s) => ({
      id: s.id,
      priority1Id: s.priority1Id,
      priority2Id: s.priority2Id,
      priority3Id: s.priority3Id,
      assignedEventId: s.assignedEventId,
      assignmentType: s.assignmentType,
    }))

    // Map database events to EventWithCapacity type
    const eventInput: EventWithCapacity[] = dbEvents.map((e) => ({
      id: e.id,
      capacity: e.capacity,
    }))

    // Call allocate() with preserveManual: true
    const result = allocate({
      students: studentInput,
      events: eventInput,
      seed,
      preserveManual: true,
    })

    // Persist all assignments (better-sqlite3 is sync, so no transaction wrapper needed)
    for (const [studentId, eventId] of result.assignments) {
      await db.update(students)
        .set({
          assignedEventId: eventId,
          assignmentType: 'auto',
          assignedAt: new Date(),
        })
        .where(eq(students.id, studentId))
    }

    // Update allocation record with completed status
    await db.update(allocations)
      .set({
        status: 'completed',
        stats: JSON.stringify(result.stats),
        completedAt: new Date(),
      })
      .where(eq(allocations.id, allocationId))

    revalidatePath('/allocation')
    return {
      success: true,
      stats: result.stats,
    }
  } catch (error) {
    // Update allocation status to failed on error
    await db.update(allocations)
      .set({
        status: 'failed',
        completedAt: new Date(),
      })
      .where(eq(allocations.id, allocationId))

    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return {
      success: false,
      error: `Zuteilung fehlgeschlagen: ${message}`,
    }
  }
}

export async function assignStudent(
  studentId: number,
  eventId: number | null  // null = move to Sonderliste
): Promise<AssignmentState> {
  try {
    // If eventId provided, verify event exists and note capacity (allow override per CONTEXT.md)
    if (eventId !== null) {
      const event = await db.select().from(events).where(eq(events.id, eventId)).get()
      if (!event) {
        return { success: false, error: 'Veranstaltung nicht gefunden' }
      }
      // Note: We allow assignment even if capacity is full (per CONTEXT.md decision)
    }

    await db.update(students)
      .set({
        assignedEventId: eventId,
        assignmentType: eventId !== null ? 'manual' : null,
        assignedAt: eventId !== null ? new Date() : null,
      })
      .where(eq(students.id, studentId))

    revalidatePath('/allocation')
    revalidatePath('/allocation/sonderliste')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Fehler beim Zuweisen' }
  }
}
