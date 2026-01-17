import { notFound } from 'next/navigation'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { EventForm } from '@/components/events/event-form'
import { updateEvent } from '@/lib/actions/events'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eventId = parseInt(id, 10)

  if (isNaN(eventId)) {
    notFound()
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) {
    notFound()
  }

  // Bind the event ID to the updateEvent action
  const updateEventWithId = updateEvent.bind(null, eventId)

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <EventForm
        action={updateEventWithId}
        initialData={{
          name: event.name,
          description: event.description,
          capacity: event.capacity,
        }}
        submitLabel="Aenderungen speichern"
      />
    </div>
  )
}
