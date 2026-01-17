import Link from 'next/link'
import { db } from '@/db'
import { students } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentList } from '@/components/registrations/student-list'

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams

  // Query students with their priority event names using subqueries
  const allStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      priority1Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority1Id})`,
      priority2Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority2Id})`,
      priority3Name: sql<string>`(SELECT name FROM events WHERE id = ${students.priority3Id})`,
    })
    .from(students)

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Registrierte Schueler</CardTitle>
            <CardDescription>
              Uebersicht aller Schueler mit ihren Prioritaeten
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/registrations/new">Neuer Schueler</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <StudentList students={allStudents} showSuccess={success === 'true'} />
        </CardContent>
      </Card>
    </div>
  )
}
