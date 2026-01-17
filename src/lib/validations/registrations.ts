import { z } from 'zod'

export const registrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Vorname ist erforderlich')
      .max(100, 'Vorname darf maximal 100 Zeichen lang sein'),
    lastName: z
      .string()
      .min(1, 'Nachname ist erforderlich')
      .max(100, 'Nachname darf maximal 100 Zeichen lang sein'),
    class: z
      .string()
      .min(1, 'Klasse ist erforderlich')
      .max(10, 'Klasse darf maximal 10 Zeichen lang sein'),
    priority1Id: z.coerce
      .number()
      .int()
      .min(1, '1. Prioritaet ist erforderlich'),
    priority2Id: z.coerce
      .number()
      .int()
      .min(1, '2. Prioritaet ist erforderlich'),
    priority3Id: z.coerce
      .number()
      .int()
      .min(1, '3. Prioritaet ist erforderlich'),
  })
  .refine(
    (data) => {
      const priorities = [data.priority1Id, data.priority2Id, data.priority3Id]
      return new Set(priorities).size === priorities.length
    },
    {
      message: 'Alle Prioritaeten muessen unterschiedlich sein',
      path: ['priority3Id'],
    }
  )

export type RegistrationInput = z.infer<typeof registrationSchema>
