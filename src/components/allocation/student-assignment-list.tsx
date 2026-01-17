import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AssignedStudent {
  id: number
  firstName: string
  lastName: string
  class: string
  assignedEventName: string | null
  assignmentType: 'auto' | 'manual' | null
}

interface StudentAssignmentListProps {
  students: AssignedStudent[]
}

export function StudentAssignmentList({ students }: StudentAssignmentListProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Schueler zugewiesen.</p>
        <p className="text-sm mt-2">
          Klicke auf &quot;Zuteilung starten&quot; um die automatische Zuweisung durchzufuehren.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Klasse</TableHead>
          <TableHead>Zugewiesene Veranstaltung</TableHead>
          <TableHead>Typ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} data-student-id={student.id}>
            <TableCell className="font-medium">
              {student.lastName}, {student.firstName}
            </TableCell>
            <TableCell>{student.class}</TableCell>
            <TableCell>{student.assignedEventName || '-'}</TableCell>
            <TableCell>
              <span className={
                student.assignmentType === 'manual'
                  ? 'text-orange-600 font-medium'
                  : 'text-muted-foreground'
              }>
                {student.assignmentType === 'auto' ? 'Automatisch' :
                 student.assignmentType === 'manual' ? 'Manuell' : '-'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
