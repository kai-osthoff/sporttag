'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { events, students } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type AssignmentState = {
  success?: boolean
  error?: string
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
