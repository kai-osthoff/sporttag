import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface AssignedStudent {
  id: number
  firstName: string
  lastName: string
  class: string
  assignedEventName: string | null
  assignmentType: 'auto' | 'manual' | null
  priority1Id: number
  priority2Id: number | null
  priority3Id: number | null
  assignedEventId: number | null
}

interface StudentAssignmentListProps {
  students: AssignedStudent[]
  onStudentClick?: (student: AssignedStudent) => void
}

export function StudentAssignmentList({ students, onStudentClick }: StudentAssignmentListProps) {
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
          <TableRow
            key={student.id}
            data-student-id={student.id}
            className={onStudentClick ? 'cursor-pointer hover:bg-muted/50' : ''}
            onClick={onStudentClick ? () => onStudentClick(student) : undefined}
          >
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
