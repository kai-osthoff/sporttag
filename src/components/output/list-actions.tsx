'use client'

import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

interface ListActionsProps {
  onExportCSV: () => void
}

export function ListActions({ onExportCSV }: ListActionsProps) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Drucken
      </Button>
      <Button variant="outline" onClick={onExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        CSV Export
      </Button>
    </div>
  )
}
