'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AssignmentModal, type StudentForModal, type EventForModal } from '@/components/allocation/assignment-modal'

interface UnassignedStudent {
  id: number
  firstName: string
  lastName: string
  class: string
  priority1Id: number
  priority1Name: string
  priority2Id: number
  priority2Name: string
  priority3Id: number
  priority3Name: string
}

interface EventCapacity {
  id: number
  name: string
  capacity: number
  assignedCount: number
}

async function fetchSonderlisteData() {
  // Fetch unassigned students and events with capacity via API route
  const res = await fetch('/api/allocation/sonderliste')
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json() as Promise<{
    unassignedStudents: UnassignedStudent[]
    eventsWithCapacity: EventCapacity[]
  }>
}

export default function SonderlistePage() {
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([])
  const [eventsWithCapacity, setEventsWithCapacity] = useState<EventCapacity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentForModal | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = async () => {
    try {
      const data = await fetchSonderlisteData()
      setUnassignedStudents(data.unassignedStudents)
      setEventsWithCapacity(data.eventsWithCapacity)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reload data when modal closes (assignment may have changed)
  const handleModalChange = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      loadData()
    }
  }

  const handleStudentClick = (student: UnassignedStudent) => {
    setSelectedStudent({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      priority1Id: student.priority1Id,
      priority2Id: student.priority2Id,
      priority3Id: student.priority3Id,
      assignedEventId: null,
    })
    setModalOpen(true)
  }

  // Build map of event capacities for quick lookup
  const eventCapacityMap = new Map(eventsWithCapacity.map((e) => [e.id, e]))

  // Get reasons (full priorities) for each student
  const getFullPriorities = (student: UnassignedStudent): string[] => {
    const reasons: string[] = []
    const priorities = [
      { id: student.priority1Id, name: student.priority1Name },
      { id: student.priority2Id, name: student.priority2Name },
      { id: student.priority3Id, name: student.priority3Name },
    ]

    for (const priority of priorities) {
      const event = eventCapacityMap.get(priority.id)
      if (event && event.assignedCount >= event.capacity) {
        reasons.push(priority.name)
      }
    }
    return reasons
  }

  // Events with remaining capacity
  const availableEvents = eventsWithCapacity.filter(
    (e) => e.capacity - e.assignedCount > 0
  )

  // Events for modal
  const eventsForModal: EventForModal[] = eventsWithCapacity.map((e) => ({
    id: e.id,
    name: e.name,
    capacity: e.capacity,
    assignedCount: e.assignedCount,
  }))

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Zuteilung offen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Lade...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Zuteilung offen</CardTitle>
            <CardDescription>
              Schueler ohne Zuweisung: {unassignedStudents.length}
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/allocation">Zurueck zur Zuteilung</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available capacity section */}
          {availableEvents.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Verfuegbare Plaetze</h3>
              <div className="flex flex-wrap gap-3">
                {availableEvents.map((event) => (
                  <span
                    key={event.id}
                    className="text-sm bg-background px-3 py-1 rounded-md border"
                  >
                    {event.name}: {event.capacity - event.assignedCount} Plaetze frei
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unassigned students table */}
          {unassignedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Keine Schueler mit offener Zuteilung.</p>
              <p className="text-sm mt-2">
                Alle Schueler wurden erfolgreich zugewiesen.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Klasse</TableHead>
                  <TableHead>Nicht verfuegbar (voll)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedStudents.map((student) => {
                  const fullPriorities = getFullPriorities(student)
                  return (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleStudentClick(student)}
                    >
                      <TableCell className="font-medium">
                        {student.lastName}, {student.firstName}
                      </TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        {fullPriorities.length > 0 ? (
                          <span className="text-orange-600">
                            {fullPriorities.join(', ')} (voll)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment modal */}
      <AssignmentModal
        student={selectedStudent}
        events={eventsForModal}
        open={modalOpen}
        onOpenChange={handleModalChange}
      />
    </div>
  )
}
