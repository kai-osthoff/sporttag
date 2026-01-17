import { db } from '@/db'
import { students, allocations, events } from '@/db/schema'
import { sql, desc, isNotNull, isNull } from 'drizzle-orm'
import { AllocationDashboard } from '@/components/allocation/allocation-dashboard'
import type { AllocationStats } from '@/lib/allocation/types'

export default async function AllocationPage() {
  // Query students with their assigned event name and priority data for modal
  const assignedStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      assignedEventName: sql<string>`(SELECT name FROM events WHERE id = ${students.assignedEventId})`,
      assignmentType: students.assignmentType,
      priority1Id: students.priority1Id,
      priority2Id: students.priority2Id,
      priority3Id: students.priority3Id,
      assignedEventId: students.assignedEventId,
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

  // Query events with capacity for the modal
  const eventsForModal = await db
    .select({
      id: events.id,
      name: events.name,
      capacity: events.capacity,
      assignedCount: sql<number>`(SELECT COUNT(*) FROM students WHERE assigned_event_id = ${events.id})`,
    })
    .from(events)
    .orderBy(events.name)

  // Count unassigned students for Sonderliste link
  const sonderlisteResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(isNull(students.assignedEventId))
    .get()
  const sonderlisteCount = sonderlisteResult?.count ?? 0

  return (
    <AllocationDashboard
      assignedStudents={assignedStudents}
      stats={stats}
      events={eventsForModal}
      sonderlisteCount={sonderlisteCount}
    />
  )
}
