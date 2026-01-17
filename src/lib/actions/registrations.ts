'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { students } from '@/db/schema'
import { registrationSchema } from '@/lib/validations/registrations'

export type RegistrationState = {
  errors?: {
    firstName?: string[]
    lastName?: string[]
    class?: string[]
    priority1Id?: string[]
    priority2Id?: string[]
    priority3Id?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createRegistration(
  prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    class: formData.get('class'),
    priority1Id: formData.get('priority1Id'),
    priority2Id: formData.get('priority2Id'),
    priority3Id: formData.get('priority3Id'),
  }

  const validatedFields = registrationSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.insert(students).values({
      firstName: validatedFields.data.firstName,
      lastName: validatedFields.data.lastName,
      class: validatedFields.data.class,
      priority1Id: validatedFields.data.priority1Id,
      priority2Id: validatedFields.data.priority2Id,
      priority3Id: validatedFields.data.priority3Id,
    })
  } catch (error) {
    return {
      errors: { _form: ['Fehler beim Speichern der Registrierung'] },
    }
  }

  revalidatePath('/registrations')
  redirect('/registrations?success=true')
}
