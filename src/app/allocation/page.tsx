import Link from 'next/link'
import { db } from '@/db'
import { students, allocations } from '@/db/schema'
import { sql, desc, isNotNull } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AllocationButton } from '@/components/allocation/allocation-button'
import { StudentAssignmentList } from '@/components/allocation/student-assignment-list'
import type { AllocationStats } from '@/lib/allocation/types'

export default async function AllocationPage() {
  // Query students with their assigned event name using SQL subquery
  const assignedStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      assignedEventName: sql<string>`(SELECT name FROM events WHERE id = ${students.assignedEventId})`,
      assignmentType: students.assignmentType,
    })
    .from(students)
    .where(isNotNull(students.assignedEventId))
    .orderBy(students.lastName, students.firstName)

  // Query latest completed allocation for stats display
  const latestAllocation = await db
    .select()
    .from(allocations)
    .where(sql`${allocations.status} = 'completed'`)
    .orderBy(desc(allocations.completedAt))
    .limit(1)
    .get()

  const stats: AllocationStats | null = latestAllocation?.stats
    ? JSON.parse(latestAllocation.stats)
    : null

  // Calculate percentages for display
  const formatPercent = (value: number, total: number): string => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(0)}%`
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Zuteilung</CardTitle>
            <CardDescription>
              Automatische Zuweisung der Schueler zu Veranstaltungen per Losverfahren
            </CardDescription>
          </div>
          <AllocationButton />
        </CardHeader>
        <CardContent>
          {/* Stats summary if allocation exists */}
          {stats && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Letzte Zuteilung</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Gesamt:</span>{' '}
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">1. Wahl:</span>{' '}
                  <span className="font-medium text-blue-600">
                    {stats.got1stChoice} ({formatPercent(stats.got1stChoice, stats.total)})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">2. Wahl:</span>{' '}
                  <span className="font-medium text-green-600">
                    {stats.got2ndChoice} ({formatPercent(stats.got2ndChoice, stats.total)})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">3. Wahl:</span>{' '}
                  <span className="font-medium text-yellow-600">
                    {stats.got3rdChoice} ({formatPercent(stats.got3rdChoice, stats.total)})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sonderliste:</span>{' '}
                  <span className="font-medium text-red-600">
                    {stats.sonderliste} ({formatPercent(stats.sonderliste, stats.total)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Student assignment list */}
          <StudentAssignmentList students={assignedStudents} />

          {/* Link to Sonderliste */}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/allocation/sonderliste">Sonderliste anzeigen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
