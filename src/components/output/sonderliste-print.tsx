'use client'

import Link from 'next/link'
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
import { ListActions } from '@/components/output/list-actions'
import { downloadCSV } from '@/lib/csv'

interface UnassignedStudent {
  firstName: string
  lastName: string
  class: string
  priority1Name: string
  priority2Name: string
  priority3Name: string
  reason: string
}

interface SonderlistePrintProps {
  students: UnassignedStudent[]
}

export function SonderlistePrint({ students }: SonderlistePrintProps) {
  const generatedDate = new Date().toLocaleDateString('de-DE')

  // Sort by Vorname, then Nachname (per CONTEXT.md)
  const sortedStudents = [...students].sort((a, b) => {
    const firstNameCompare = a.firstName.localeCompare(b.firstName, 'de')
    if (firstNameCompare !== 0) return firstNameCompare
    return a.lastName.localeCompare(b.lastName, 'de')
  })

  const handleExportCSV = () => {
    downloadCSV(
      sortedStudents.map((s) => ({
        Vorname: s.firstName,
        Nachname: s.lastName,
        Klasse: s.class,
        '1. Wahl': s.priority1Name,
        '2. Wahl': s.priority2Name,
        '3. Wahl': s.priority3Name,
        Grund: s.reason,
      })),
      'Zuteilung-offen.csv'
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between print:pb-2">
          <div>
            <CardTitle className="print:text-xl">Zuteilung offen</CardTitle>
            <CardDescription className="print:text-sm print:text-black">
              {sortedStudents.length} Schueler ohne Zuweisung | Erstellt:{' '}
              {generatedDate}
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/output">Zurueck</Link>
            </Button>
            <ListActions onExportCSV={handleExportCSV} />
          </div>
        </CardHeader>
        <CardContent>
          {sortedStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Keine Schueler mit offener Zuteilung.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Alle Schueler wurden erfolgreich zugewiesen.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="print:bg-gray-100">
                  <TableHead className="print:font-bold print:text-black">
                    Vorname
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    Nachname
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    Klasse
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    1. Wahl
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    2. Wahl
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    3. Wahl
                  </TableHead>
                  <TableHead className="print:font-bold print:text-black">
                    Grund
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student, index) => (
                  <TableRow key={index} className="print:py-1">
                    <TableCell className="print:py-1">
                      {student.firstName}
                    </TableCell>
                    <TableCell className="print:py-1">
                      {student.lastName}
                    </TableCell>
                    <TableCell className="print:py-1">
                      {student.class}
                    </TableCell>
                    <TableCell className="print:py-1 print:text-sm">
                      {student.priority1Name}
                    </TableCell>
                    <TableCell className="print:py-1 print:text-sm">
                      {student.priority2Name}
                    </TableCell>
                    <TableCell className="print:py-1 print:text-sm">
                      {student.priority3Name}
                    </TableCell>
                    <TableCell className="print:py-1 text-orange-600 print:text-orange-800">
                      {student.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
