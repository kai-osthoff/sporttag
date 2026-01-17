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

interface Participant {
  firstName: string
  lastName: string
  class: string
}

interface PerEventListProps {
  eventName: string
  participants: Participant[]
}

export function PerEventList({ eventName, participants }: PerEventListProps) {
  const generatedDate = new Date().toLocaleDateString('de-DE')

  const handleExportCSV = () => {
    downloadCSV(
      participants.map((p) => ({
        Vorname: p.firstName,
        Nachname: p.lastName,
        Klasse: p.class,
      })),
      `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_Teilnehmer.csv`
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between print:pb-2">
          <div>
            <CardTitle className="print:text-xl">{eventName}</CardTitle>
            <CardDescription className="print:text-sm print:text-black">
              {participants.length} Teilnehmer | Erstellt: {generatedDate}
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
          {participants.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              Keine Teilnehmer fuer diese Veranstaltung
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
                    Klasse
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={index} className="print:py-1">
                    <TableCell className="print:py-1">
                      {participant.firstName}
                    </TableCell>
                    <TableCell className="print:py-1">
                      {participant.lastName}
                    </TableCell>
                    <TableCell className="print:py-1">
                      {participant.class}
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
