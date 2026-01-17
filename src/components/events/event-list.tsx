import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteEventButton } from './delete-event-button'
import type { Event } from '@/db/schema'

interface EventListProps {
  events: (Event & { currentRegistrations: number })[]
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Veranstaltungen vorhanden.</p>
        <Button asChild className="mt-4">
          <Link href="/events/new">Erste Veranstaltung anlegen</Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead className="text-right">Belegung</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">
              <Link
                href={`/events/${event.id}`}
                className="hover:underline"
              >
                {event.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {event.description
                ? event.description.length > 50
                  ? `${event.description.slice(0, 50)}...`
                  : event.description
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              {event.currentRegistrations} / {event.capacity}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/edit`}>Bearbeiten</Link>
                </Button>
                <DeleteEventButton
                  eventId={event.id}
                  eventName={event.name}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
