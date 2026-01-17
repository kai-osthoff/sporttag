'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { runAllocation } from '@/lib/actions/allocation'

export function AllocationButton() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await runAllocation()
      if (result.success && result.stats) {
        const pct1 = ((result.stats.got1stChoice / result.stats.total) * 100).toFixed(0)
        toast.success(`Zuteilung abgeschlossen: ${pct1}% bekamen 1. Wahl`)
      } else {
        toast.error(result.error || 'Zuteilung fehlgeschlagen')
      }
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Zuteilung laeuft...' : 'Zuteilung starten'}
    </Button>
  )
}
