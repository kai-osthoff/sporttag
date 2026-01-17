import { db } from '@/db'
import { students, events } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { PerClassList } from '@/components/output/per-class-list'

export default async function PerClassPage() {
  // Get all students with their assigned event names
  const studentsWithEvents = await db
    .select({
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      eventName: sql<string | null>`(SELECT name FROM events WHERE id = ${students.assignedEventId})`,
    })
    .from(students)
    .orderBy(students.class, students.firstName, students.lastName)

  // Get unique classes
  const uniqueClasses = [...new Set(studentsWithEvents.map((s) => s.class))].sort()

  return <PerClassList students={studentsWithEvents} classes={uniqueClasses} />
}
