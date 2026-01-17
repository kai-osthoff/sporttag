import { NextResponse } from 'next/server'
import { db } from '@/db'
import { students, events } from '@/db/schema'
import { isNull, sql } from 'drizzle-orm'

export async function GET() {
  // Query unassigned students with their priority event details
  const unassignedStudents = await db
    .select({
      id: students.id,
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
    .orderBy(students.lastName, students.firstName)

  // Query events with current assignment counts
  const eventsWithCapacity = await db
    .select({
      id: events.id,
      name: events.name,
      capacity: events.capacity,
      assignedCount: sql<number>`(SELECT COUNT(*) FROM students WHERE assigned_event_id = ${events.id})`,
    })
    .from(events)
    .orderBy(events.name)

  return NextResponse.json({
    unassignedStudents,
    eventsWithCapacity,
  })
}
