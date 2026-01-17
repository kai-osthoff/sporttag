'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eventSchema } from '@/lib/validations/events'
import { eq } from 'drizzle-orm'

export type ActionState = {
  errors?: {
    name?: string[]
    description?: string[]
    capacity?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createEvent(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    capacity: formData.get('capacity'),
  }

  const validatedFields = eventSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.insert(events).values({
      name: validatedFields.data.name,
      description: validatedFields.data.description || null,
      capacity: validatedFields.data.capacity,
    })
  } catch (error) {
    return {
      errors: { _form: ['Fehler beim Speichern der Veranstaltung'] },
    }
  }

  revalidatePath('/events')
  redirect('/events')
}

export async function updateEvent(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    capacity: formData.get('capacity'),
  }

  const validatedFields = eventSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db
      .update(events)
      .set({
        name: validatedFields.data.name,
        description: validatedFields.data.description || null,
        capacity: validatedFields.data.capacity,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
  } catch (error) {
    return {
      errors: { _form: ['Fehler beim Aktualisieren der Veranstaltung'] },
    }
  }

  revalidatePath('/events')
  redirect('/events')
}

export async function deleteEvent(id: number): Promise<ActionState> {
  // Note: In Phase 2+, check for registrations before delete
  // For now, allow delete without registration check

  try {
    await db.delete(events).where(eq(events.id, id))
  } catch (error) {
    return {
      errors: { _form: ['Fehler beim Loeschen der Veranstaltung'] },
    }
  }

  revalidatePath('/events')
  return { success: true }
}
