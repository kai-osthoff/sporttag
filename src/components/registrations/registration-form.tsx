'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RegistrationState } from '@/lib/actions/registrations'
import type { Event } from '@/db/schema'

interface RegistrationFormProps {
  action: (prevState: RegistrationState, formData: FormData) => Promise<RegistrationState>
  events: Event[]
}

export function RegistrationForm({ action, events }: RegistrationFormProps) {
  const [state, formAction, pending] = useActionState(action, { errors: {} })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schueler registrieren</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.errors?._form && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {state.errors._form[0]}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Max"
                required
              />
              {state.errors?.firstName && (
                <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Mustermann"
                required
              />
              {state.errors?.lastName && (
                <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Klasse *</Label>
            <Input
              id="class"
              name="class"
              placeholder="5a"
              required
            />
            {state.errors?.class && (
              <p className="text-sm text-destructive">{state.errors.class[0]}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Prioritaeten</h3>

            <div className="space-y-2">
              <Label htmlFor="priority1Id">1. Prioritaet *</Label>
              <Select name="priority1Id">
                <SelectTrigger id="priority1Id" className="w-full">
                  <SelectValue placeholder="1. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority1Id && (
                <p className="text-sm text-destructive">{state.errors.priority1Id[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority2Id">2. Prioritaet *</Label>
              <Select name="priority2Id">
                <SelectTrigger id="priority2Id" className="w-full">
                  <SelectValue placeholder="2. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority2Id && (
                <p className="text-sm text-destructive">{state.errors.priority2Id[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority3Id">3. Prioritaet *</Label>
              <Select name="priority3Id">
                <SelectTrigger id="priority3Id" className="w-full">
                  <SelectValue placeholder="3. Wahl auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority3Id && (
                <p className="text-sm text-destructive">{state.errors.priority3Id[0]}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Registrieren...' : 'Schueler registrieren'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/registrations">Abbrechen</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
