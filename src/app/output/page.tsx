import Link from 'next/link'
import { db } from '@/db'
import { events, students, allocations } from '@/db/schema'
import { desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AllocationStats } from '@/components/allocation/allocation-stats'
import type { AllocationStats as AllocationStatsType } from '@/lib/allocation/types'

export default async function OutputPage() {
  // Fetch events with assigned student counts
  const eventsWithCounts = await db
    .select({
      id: events.id,
      name: events.name,
      capacity: events.capacity,
      assignedCount: sql<number>`COALESCE(COUNT(${students.id}), 0)`.as('assigned_count'),
    })
    .from(events)
    .leftJoin(students, eq(students.assignedEventId, events.id))
    .groupBy(events.id, events.name, events.capacity)
    .orderBy(events.name)

  // Count unassigned students
  const unassignedCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(isNull(students.assignedEventId))
    .then((r) => r[0]?.count ?? 0)

  // Get unique classes that have assigned students
  const classesWithAssignments = await db
    .select({ class: students.class })
    .from(students)
    .where(isNotNull(students.assignedEventId))
    .groupBy(students.class)
    .orderBy(students.class)

  // Check if allocation has been run and get stats
  const latestAllocation = await db
    .select()
    .from(allocations)
    .where(sql`${allocations.status} = 'completed'`)
    .orderBy(desc(allocations.completedAt))
    .limit(1)
    .get()

  const stats: AllocationStatsType | null = latestAllocation?.stats
    ? JSON.parse(latestAllocation.stats)
    : null

  const hasAllocation = !!latestAllocation

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ausgabe</h1>
        <p className="text-muted-foreground">
          Listen fuer das SMV-Brett generieren und drucken
        </p>
      </div>

      {!hasAllocation && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <p className="text-orange-800">
              Noch keine Zuteilung durchgefuehrt.{' '}
              <Link href="/allocation" className="underline">
                Zur Zuteilung
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <AllocationStats stats={stats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Per-Event Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Listen pro Veranstaltung</CardTitle>
            <CardDescription>
              Teilnehmerliste fuer jede Veranstaltung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {eventsWithCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Veranstaltungen vorhanden
              </p>
            ) : (
              eventsWithCounts.map((event) => (
                <Button
                  key={event.id}
                  variant="outline"
                  className="w-full justify-between"
                  asChild
                >
                  <Link href={`/output/per-event/${event.id}`}>
                    <span>{event.name}</span>
                    <span className="text-muted-foreground">
                      {event.assignedCount}/{event.capacity}
                    </span>
                  </Link>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Per-Class Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Listen pro Klasse</CardTitle>
            <CardDescription>
              Uebersicht welcher Schueler wohin geht
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/output/per-class">
                Klassenlisten anzeigen ({classesWithAssignments.length} Klassen)
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Zuteilung offen */}
        <Card>
          <CardHeader>
            <CardTitle>Zuteilung offen</CardTitle>
            <CardDescription>
              Schueler ohne Zuweisung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <Link href="/output/sonderliste">
                <span>Zuteilung offen anzeigen</span>
                {unassignedCount > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-sm">
                    {unassignedCount}
                  </span>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
