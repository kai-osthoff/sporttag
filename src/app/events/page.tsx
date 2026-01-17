import Link from 'next/link'
import { db } from '@/db'
import { events } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventList } from '@/components/events/event-list'

export default async function EventsPage() {
  const allEvents = await db.select().from(events)

  // In Phase 2+, this will join with registrations to get actual count
  // For now, show 0 registrations for all events
  const eventsWithCapacity = allEvents.map((event) => ({
    ...event,
    currentRegistrations: 0,
  }))

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Veranstaltungen</CardTitle>
            <CardDescription>
              Verwalten Sie die Sportveranstaltungen fuer den Sporttag
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/events/new">Neue Veranstaltung</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <EventList events={eventsWithCapacity} />
        </CardContent>
      </Card>
    </div>
  )
}
