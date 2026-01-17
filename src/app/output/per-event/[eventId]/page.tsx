import { notFound } from 'next/navigation'
import { db } from '@/db'
import { events, students } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PerEventList } from '@/components/output/per-event-list'

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function PerEventPage({ params }: PageProps) {
  const { eventId } = await params
  const id = parseInt(eventId)

  if (isNaN(id)) {
    notFound()
  }

  // Get event details
  const event = await db
    .select({ name: events.name })
    .from(events)
    .where(eq(events.id, id))
    .then((r) => r[0])

  if (!event) {
    notFound()
  }

  // Get participants sorted by Vorname, then Nachname (per CONTEXT.md)
  const participants = await db
    .select({
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
    })
    .from(students)
    .where(eq(students.assignedEventId, id))
    .orderBy(students.firstName, students.lastName)

  return <PerEventList eventName={event.name} participants={participants} />
}
