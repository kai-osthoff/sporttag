import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Heart, Code, Pizza } from 'lucide-react'

export const metadata = {
  title: 'Unterstuetzen - Sporttag',
  description: 'Unterstuetze die Entwicklung von Sporttag',
}

const BMC_URL = 'https://buymeacoffee.com/kai.osthoff'

export default function UnterstuetzenPage() {
  return (
    <main className="container mx-auto py-8 max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zur Startseite
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Pizza className="h-8 w-8 text-[#FFDD00]" />
            Sporttag unterstuetzen
          </h1>
          <p className="text-muted-foreground">
            Weil auch Entwickler manchmal Hunger haben
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Open Source &amp; Kostenlos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Sporttag ist <strong>komplett kostenlos</strong> und wird es auch bleiben.
              Der gesamte Quellcode ist offen einsehbar auf GitHub — du kannst ihn pruefen,
              anpassen oder sogar verbessern.
            </p>
            <p>
              Keine versteckten Kosten, keine Werbung, keine Datensammlung.
              Deine Schuelerdaten bleiben auf deinem Rechner.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Aber warum Pizza?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Ich entwickle Sporttag in meiner Freizeit — abends, am Wochenende,
              manchmal auch nachts, wenn eine Idee nicht warten kann.
              Zeit, in der mein Hund Frankie mich vorwurfsvoll ansieht, weil der
              Ball schon wieder nicht geworfen wird.
            </p>
            <p>
              Dazu kommen Kosten: Server fuers Hosting der Downloads,
              ein Apple Developer Account waere $99/Jahr (den spare ich mir,
              deshalb das Terminal-Gefummel bei der Installation).
            </p>
            <p>
              Wenn dir Sporttag bei der Organisation deines Sporttags hilft und du
              dich bedanken moechtest — <strong>eine Pizza waere grossartig!</strong> 🍕
            </p>
            <p className="text-muted-foreground italic">
              (Keine Sorge, es muss keine echte Pizza sein. Das Geld reicht auch fuer Kaffee,
              Energy Drinks oder die naechste Server-Rechnung.)
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#FFDD00]/50 bg-[#FFDD00]/5">
          <CardHeader>
            <CardTitle>So funktioniert&apos;s</CardTitle>
            <CardDescription>
              Ueber den Dienst &quot;Buy Me a Coffee&quot;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Buy Me a Coffee</strong> ist ein etablierter Dienst, ueber den
              Kreative und Entwickler weltweit Unterstuetzung erhalten.
              Der Dienst ist sicher und unterstuetzt verschiedene Zahlungsmethoden:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Kreditkarte (Visa, Mastercard, Amex)</li>
              <li>PayPal</li>
              <li>Apple Pay / Google Pay</li>
            </ul>
            <p>
              Du entscheidest selbst, wie viel du geben moechtest —
              schon ein kleiner Betrag zeigt mir, dass die Arbeit geschaetzt wird.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm">
              <p className="font-medium mb-2">📍 Hinweis zum externen Link</p>
              <p className="text-muted-foreground">
                Der Button unten fuehrt dich zur sicheren Webseite von Buy Me a Coffee
                (buymeacoffee.com). Dort kannst du deine Zahlungsinformationen eingeben —
                diese werden <strong>nicht</strong> an Sporttag uebermittelt, sondern
                direkt von Buy Me a Coffee verarbeitet.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90"
            >
              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Pizza className="h-5 w-5 mr-2" />
                Buy me a Pizza
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Oeffnet buymeacoffee.com in einem neuen Tab
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm">
          Danke, dass du Sporttag nutzt! 💛
        </p>
      </div>
    </main>
  )
}
