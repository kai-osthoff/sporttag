import { EventForm } from '@/components/events/event-form'
import { createEvent } from '@/lib/actions/events'

export default function NewEventPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <EventForm action={createEvent} submitLabel="Veranstaltung anlegen" />
    </div>
  )
}
