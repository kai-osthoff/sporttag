'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionState } from '@/lib/actions/events'

interface EventFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  initialData?: {
    name: string
    description: string | null
    capacity: number
  }
  submitLabel?: string
}

export function EventForm({ action, initialData, submitLabel = 'Speichern' }: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, { errors: {} })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.errors?._form && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {state.errors._form[0]}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              placeholder="z.B. Fussball"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description ?? ''}
              placeholder="Optionale Beschreibung der Veranstaltung"
              rows={3}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Kapazitaet *</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              max={500}
              defaultValue={initialData?.capacity}
              placeholder="Maximale Teilnehmerzahl"
              required
            />
            {state.errors?.capacity && (
              <p className="text-sm text-destructive">{state.errors.capacity[0]}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Speichern...' : submitLabel}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/events">Abbrechen</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
