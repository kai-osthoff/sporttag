'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteEvent } from '@/lib/actions/events'

interface DeleteEventButtonProps {
  eventId: number
  eventName: string
}

export function DeleteEventButton({ eventId, eventName }: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEvent(eventId)
      if (result.errors?._form) {
        setError(result.errors._form[0])
      }
    })
  }

  return (
    <>
      {error && (
        <span className="text-sm text-destructive mr-2">{error}</span>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? 'Loeschen...' : 'Loeschen'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Veranstaltung loeschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Soll die Veranstaltung &quot;{eventName}&quot; wirklich geloescht werden?
              Diese Aktion kann nicht rueckgaengig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Loeschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
