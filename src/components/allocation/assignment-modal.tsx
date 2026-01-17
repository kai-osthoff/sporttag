'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { assignStudent } from '@/lib/actions/allocation'
import { cn } from '@/lib/utils'

export interface StudentForModal {
  id: number
  firstName: string
  lastName: string
  priority1Id: number
  priority2Id: number | null
  priority3Id: number | null
  assignedEventId: number | null
}

export interface EventForModal {
  id: number
  name: string
  capacity: number
  assignedCount: number  // Current number of assigned students
}

interface AssignmentModalProps {
  student: StudentForModal | null
  events: EventForModal[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignmentModal({
  student,
  events,
  open,
  onOpenChange,
}: AssignmentModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    student?.assignedEventId ?? null
  )
  const [isPending, startTransition] = useTransition()

  // Reset selected event when student changes
  if (student && selectedEventId !== student.assignedEventId && !isPending) {
    setSelectedEventId(student.assignedEventId)
  }

  if (!student) return null

  const getPriorityLabel = (eventId: number): string | null => {
    if (eventId === student.priority1Id) return '1. Wahl'
    if (eventId === student.priority2Id) return '2. Wahl'
    if (eventId === student.priority3Id) return '3. Wahl'
    return null
  }

  const getPriorityStyle = (eventId: number): string => {
    if (eventId === student.priority1Id) return 'bg-blue-100 text-blue-800'
    if (eventId === student.priority2Id) return 'bg-green-100 text-green-800'
    if (eventId === student.priority3Id) return 'bg-yellow-100 text-yellow-800'
    return ''
  }

  const isEventFull = (event: EventForModal): boolean => {
    return event.assignedCount >= event.capacity
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await assignStudent(student.id, selectedEventId)
      if (result.success) {
        toast.success('Zuweisung gespeichert')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Fehler beim Zuweisen')
      }
    })
  }

  const selectedIsFull = selectedEventId !== null &&
    events.find(e => e.id === selectedEventId)?.assignedCount !== undefined &&
    events.find(e => e.id === selectedEventId)!.assignedCount >=
    events.find(e => e.id === selectedEventId)!.capacity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{student.lastName}, {student.firstName}</DialogTitle>
          <DialogDescription>Veranstaltung manuell zuweisen</DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {/* Sonderliste option */}
          <button
            type="button"
            onClick={() => setSelectedEventId(null)}
            className={cn(
              'w-full p-3 rounded-md border text-left transition-colors',
              selectedEventId === null
                ? 'bg-accent border-primary'
                : 'hover:bg-muted'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">
                Keine Zuweisung (Sonderliste)
              </span>
            </div>
          </button>

          {/* Events list */}
          {events.map((event) => {
            const priorityLabel = getPriorityLabel(event.id)
            const isFull = isEventFull(event)

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  'w-full p-3 rounded-md border text-left transition-colors',
                  selectedEventId === event.id
                    ? 'bg-accent border-primary'
                    : 'hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.name}</span>
                    {priorityLabel && (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        getPriorityStyle(event.id)
                      )}>
                        {priorityLabel}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'text-sm',
                    isFull ? 'text-orange-600 font-medium' : 'text-muted-foreground'
                  )}>
                    {event.assignedCount}/{event.capacity}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {selectedIsFull && (
          <p className="text-sm text-orange-600 mt-2">
            Achtung: Veranstaltung ist bereits voll
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Speichern...' : 'Zuweisen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
