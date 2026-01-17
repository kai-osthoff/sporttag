'use client'

import { useState, useEffect, useRef, useActionState } from 'react'
import { useRouter } from 'next/navigation'
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
import { toast } from 'sonner'
import type { RegistrationState } from '@/lib/actions/registrations'
import type { Event } from '@/db/schema'

interface RegistrationFormProps {
  action: (prevState: RegistrationState, formData: FormData) => Promise<RegistrationState>
  events: Event[]
}

export function RegistrationForm({ action, events }: RegistrationFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const [state, formAction, pending] = useActionState(action, { errors: {} })
  const [saveAndNew, setSaveAndNew] = useState(true)
  const [priority1, setPriority1] = useState<string>('')
  const [priority2, setPriority2] = useState<string>('')
  const [priority3, setPriority3] = useState<string>('')

  // Filter events for each priority dropdown
  const eventsForPriority2 = events.filter(e => String(e.id) !== priority1)
  const eventsForPriority3 = events.filter(e => String(e.id) !== priority1 && String(e.id) !== priority2)

  // Reset form after successful save when using "Save and New"
  useEffect(() => {
    if (state.success && state.savedStudent) {
      toast.success(`${state.savedStudent} registriert`)
      // Reset form
      formRef.current?.reset()
      setPriority1('')
      setPriority2('')
      setPriority3('')
      // Focus first field for next entry
      firstNameRef.current?.focus()
    }
  }, [state.success, state.savedStudent])

  // Handle SHIFT+ENTER for save and new
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey && !pending) {
      e.preventDefault()
      setSaveAndNew(true)
      // Submit form programmatically
      const form = formRef.current
      if (form) {
        const formData = new FormData(form)
        formData.set('saveAndNew', 'true')
        formAction(formData)
      }
    }
  }

  const handleSaveAndNew = () => {
    setSaveAndNew(true)
  }

  const handleSaveAndClose = () => {
    setSaveAndNew(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schueler registrieren</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4" onKeyDown={handleKeyDown}>
          <input type="hidden" name="saveAndNew" value={saveAndNew.toString()} />

          {state.errors?._form && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {state.errors._form[0]}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                placeholder="Max"
                autoFocus
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
            />
            {state.errors?.class && (
              <p className="text-sm text-destructive">{state.errors.class[0]}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Prioritaeten</h3>

            <div className="space-y-2">
              <Label htmlFor="priority1Id">1. Prioritaet *</Label>
              <Select
                name="priority1Id"
                value={priority1}
                onValueChange={(value) => {
                  setPriority1(value)
                  // Clear subsequent selections if they conflict
                  if (value === priority2) setPriority2('')
                  if (value === priority3) setPriority3('')
                }}
              >
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
              <Label htmlFor="priority2Id">2. Prioritaet</Label>
              <Select
                name="priority2Id"
                value={priority2}
                onValueChange={(value) => {
                  setPriority2(value)
                  // Clear third selection if it conflicts
                  if (value === priority3) setPriority3('')
                }}
              >
                <SelectTrigger id="priority2Id" className="w-full">
                  <SelectValue placeholder="2. Wahl auswaehlen (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  {eventsForPriority2.map((event) => (
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
              <Label htmlFor="priority3Id">3. Prioritaet</Label>
              <Select
                name="priority3Id"
                value={priority3}
                onValueChange={setPriority3}
              >
                <SelectTrigger id="priority3Id" className="w-full">
                  <SelectValue placeholder="3. Wahl auswaehlen (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  {eventsForPriority3.map((event) => (
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} onClick={handleSaveAndNew}>
              {pending ? 'Speichern...' : 'Speichern & Neu'}
            </Button>
            <Button type="submit" variant="outline" disabled={pending} onClick={handleSaveAndClose}>
              Speichern & Schliessen
            </Button>
            <Button type="button" variant="ghost" asChild>
              <a href="/registrations">Abbrechen</a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tipp: SHIFT+ENTER zum schnellen Speichern & Neu
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
