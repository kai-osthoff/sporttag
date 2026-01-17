'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface StudentWithEvent {
  firstName: string
  lastName: string
  class: string
  eventName: string | null
}

interface PerClassListProps {
  students: StudentWithEvent[]
  classes: string[]
}

export function PerClassList({ students, classes }: PerClassListProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const generatedDate = new Date().toLocaleDateString('de-DE')

  // Group classes by grade for selector
  const groupedClasses = classes.reduce((acc, cls) => {
    const grade = cls.match(/^(\d+)/)?.[1] || 'Andere'
    if (!acc[grade]) acc[grade] = []
    acc[grade].push(cls)
    return acc
  }, {} as Record<string, string[]>)

  // Filter students by selected class
  const filteredStudents = selectedClass
    ? students.filter((s) => s.class === selectedClass)
    : []

  // Sort by Vorname, then Nachname (per CONTEXT.md)
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const firstNameCompare = a.firstName.localeCompare(b.firstName, 'de')
    if (firstNameCompare !== 0) return firstNameCompare
    return a.lastName.localeCompare(b.lastName, 'de')
  })

  const handleExportCSV = () => {
    if (!selectedClass) return
    downloadCSV(
      sortedStudents.map((s) => ({
        Vorname: s.firstName,
        Nachname: s.lastName,
        Veranstaltung: s.eventName ?? 'Nicht zugewiesen',
      })),
      `Klasse_${selectedClass}_Zuteilung.csv`
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between print:pb-2">
          <div>
            <CardTitle className="print:text-xl">
              {selectedClass ? `Klasse ${selectedClass}` : 'Klassenliste'}
            </CardTitle>
            <CardDescription className="print:text-sm print:text-black">
              {selectedClass
                ? `${sortedStudents.length} Schueler | Erstellt: ${generatedDate}`
                : 'Klasse auswaehlen um Liste anzuzeigen'}
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/output">Zurueck</Link>
            </Button>
            {selectedClass && <ListActions onExportCSV={handleExportCSV} />}
          </div>
        </CardHeader>
        <CardContent>
          {/* Class selector - hidden in print */}
          <div className="mb-4 print:hidden">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Klasse waehlen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedClasses)
                  .sort(([a], [b]) => {
                    const numA = parseInt(a) || 999
                    const numB = parseInt(b) || 999
                    return numA - numB
                  })
                  .map(([grade, classList]) => (
                    <SelectGroup key={grade}>
                      <SelectLabel>Klassenstufe {grade}</SelectLabel>
                      {classList.sort().map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student table */}
          {!selectedClass ? (
            <p className="text-muted-foreground py-4 text-center print:hidden">
              Bitte eine Klasse auswaehlen
            </p>
          ) : sortedStudents.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              Keine zugewiesenen Schueler in dieser Klasse
            </p>
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
                    Veranstaltung
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
                      {student.eventName ?? (
                        <span className="text-orange-600">Nicht zugewiesen</span>
                      )}
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
