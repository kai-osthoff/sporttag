import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Sporttag-Anmeldeplattform</h1>
      <p className="text-muted-foreground mb-6">
        Verwaltung von Sportveranstaltungen und Schueleranmeldungen
      </p>
      <Button asChild>
        <Link href="/events">Veranstaltungen verwalten</Link>
      </Button>
    </main>
  )
}
