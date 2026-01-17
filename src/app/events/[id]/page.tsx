import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
          {event.description && (
            <CardDescription>{event.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Kapazitaet</dt>
              <dd className="text-lg font-medium">0 / {event.capacity}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Erstellt am</dt>
              <dd className="text-lg font-medium">
                {event.createdAt?.toLocaleDateString('de-DE')}
              </dd>
            </div>
          </dl>

          <div className="flex gap-2 mt-6">
            <Button asChild>
              <Link href={`/events/${event.id}/edit`}>Bearbeiten</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/events">Zurueck zur Liste</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
