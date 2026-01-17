'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AllocationButton } from '@/components/allocation/allocation-button'
import { AllocationStats } from '@/components/allocation/allocation-stats'
import { StudentAssignmentList, type AssignedStudent } from '@/components/allocation/student-assignment-list'
import { AssignmentModal, type StudentForModal, type EventForModal } from '@/components/allocation/assignment-modal'
import type { AllocationStats as AllocationStatsType } from '@/lib/allocation/types'

interface AllocationDashboardProps {
  assignedStudents: AssignedStudent[]
  stats: AllocationStatsType | null
  events: EventForModal[]
  sonderlisteCount: number
}

export function AllocationDashboard({
  assignedStudents,
  stats,
  events,
  sonderlisteCount,
}: AllocationDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentForModal | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleStudentClick = (student: AssignedStudent) => {
    setSelectedStudent({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      priority1Id: student.priority1Id,
      priority2Id: student.priority2Id,
      priority3Id: student.priority3Id,
      assignedEventId: student.assignedEventId,
    })
    setModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Zuteilung</CardTitle>
            <CardDescription>
              Automatische Zuweisung der Schueler zu Veranstaltungen per Losverfahren
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/allocation/sonderliste">
                Sonderliste ({sonderlisteCount})
              </Link>
            </Button>
            <AllocationButton />
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats section */}
          <div className="mb-6">
            <AllocationStats stats={stats} />
          </div>

          {/* Student assignment list - clickable rows */}
          <StudentAssignmentList
            students={assignedStudents}
            onStudentClick={handleStudentClick}
          />
        </CardContent>
      </Card>

      {/* Assignment modal */}
      <AssignmentModal
        student={selectedStudent}
        events={events}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
