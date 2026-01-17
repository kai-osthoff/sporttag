import { db } from '@/db'
import { students, events } from '@/db/schema'
import { isNull, sql } from 'drizzle-orm'
import { SonderlistePrint } from '@/components/output/sonderliste-print'

export default async function OutputSonderlistePage() {
  // Get unassigned students with their priority names
  const unassignedStudents = await db
    .select({
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      priority1Id: students.priority1Id,
      priority1Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority1Id})`,
      priority2Id: students.priority2Id,
      priority2Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority2Id})`,
      priority3Id: students.priority3Id,
      priority3Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority3Id})`,
    })
    .from(students)
    .where(isNull(students.assignedEventId))

  // Get event capacities to determine reasons
  const eventsWithCounts = await db
    .select({
      id: events.id,
      name: events.name,
      capacity: events.capacity,
      assignedCount: sql<number>`(SELECT COUNT(*) FROM students WHERE assigned_event_id = ${events.id})`,
    })
    .from(events)

  // Build capacity map
  const capacityMap = new Map(
    eventsWithCounts.map((e) => [e.id, { capacity: e.capacity, count: e.assignedCount }])
  )

  // Add reason to each student
  const studentsWithReasons = unassignedStudents.map((student) => {
    const priorities = [
      { id: student.priority1Id, name: student.priority1Name },
      { id: student.priority2Id, name: student.priority2Name },
      { id: student.priority3Id, name: student.priority3Name },
    ].filter((p): p is { id: number; name: string } => p.id !== null)

    const fullPriorities = priorities.filter((p) => {
      const event = capacityMap.get(p.id)
      return event && event.count >= event.capacity
    })

    let reason: string
    if (fullPriorities.length === priorities.length && priorities.length > 0) {
      reason = 'Alle Wahlen voll'
    } else if (fullPriorities.length > 0) {
      reason = `${fullPriorities.map((p) => p.name).join(', ')} voll`
    } else {
      reason = 'Nicht zugewiesen'
    }

    return {
      firstName: student.firstName,
      lastName: student.lastName,
      class: student.class,
      priority1Name: student.priority1Name,
      priority2Name: student.priority2Name,
      priority3Name: student.priority3Name,
      reason,
    }
  })

  return <SonderlistePrint students={studentsWithReasons} />
}
