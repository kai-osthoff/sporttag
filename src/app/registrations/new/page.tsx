import { db } from '@/db'
import { events } from '@/db/schema'
import { RegistrationForm } from '@/components/registrations/registration-form'
import { createRegistration } from '@/lib/actions/registrations'

export default async function NewRegistrationPage() {
  const allEvents = await db.select().from(events)

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <RegistrationForm action={createRegistration} events={allEvents} />
    </div>
  )
}
