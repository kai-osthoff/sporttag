'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StudentWithPriorities {
  id: number
  firstName: string
  lastName: string
  class: string
  priority1Name: string | null
  priority2Name: string | null
  priority3Name: string | null
}

interface StudentListProps {
  students: StudentWithPriorities[]
  showSuccess?: boolean
}

export function StudentList({ students, showSuccess }: StudentListProps) {
  useEffect(() => {
    if (showSuccess) {
      toast.success('Schueler erfolgreich registriert!')
      // Clean URL without refresh
      window.history.replaceState({}, '', '/registrations')
    }
  }, [showSuccess])

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Schueler registriert.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Klasse</TableHead>
          <TableHead>1. Prioritaet</TableHead>
          <TableHead>2. Prioritaet</TableHead>
          <TableHead>3. Prioritaet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">
              {student.lastName}, {student.firstName}
            </TableCell>
            <TableCell>{student.class}</TableCell>
            <TableCell>{student.priority1Name}</TableCell>
            <TableCell>{student.priority2Name}</TableCell>
            <TableCell>{student.priority3Name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
