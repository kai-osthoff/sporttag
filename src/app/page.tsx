import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, Shuffle, FileText } from 'lucide-react'

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Sporttag-Anmeldeplattform</h1>
      <p className="text-muted-foreground mb-8">
        Verwaltung von Sportveranstaltungen und Schueleranmeldungen
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/events">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CalendarDays className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Veranstaltungen</CardTitle>
              <CardDescription>
                Sportarten anlegen und verwalten
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/registrations">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Anmeldungen</CardTitle>
              <CardDescription>
                Schueler mit 3 Prioritaeten erfassen
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/allocation">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <Shuffle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Zuteilung</CardTitle>
              <CardDescription>
                Losverfahren starten und verwalten
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/output">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Listen</CardTitle>
              <CardDescription>
                Teilnehmerlisten drucken und exportieren
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        Workflow: Veranstaltungen anlegen → Schueler anmelden → Zuteilung durchfuehren → Listen ausdrucken
      </p>
    </main>
  )
}
