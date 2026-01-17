import { z } from 'zod'

// Helper to parse optional priority (empty string or missing = null)
const optionalPriority = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? null : val),
  z.coerce.number().int().min(1).nullable()
)

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
    priority2Id: optionalPriority,
    priority3Id: optionalPriority,
  })
  .refine(
    (data) => {
      // Only check uniqueness among selected (non-null) priorities
      const priorities = [data.priority1Id, data.priority2Id, data.priority3Id].filter(
        (p): p is number => p !== null
      )
      return new Set(priorities).size === priorities.length
    },
    {
      message: 'Alle Prioritaeten muessen unterschiedlich sein',
      path: ['priority3Id'],
    }
  )

export type RegistrationInput = z.infer<typeof registrationSchema>
