import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  description: z.string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional()
    .or(z.literal('')),
  capacity: z.coerce.number()
    .int('Kapazitaet muss eine ganze Zahl sein')
    .min(1, 'Kapazitaet muss mindestens 1 sein')
    .max(500, 'Kapazitaet darf maximal 500 sein'),
})

export type EventInput = z.infer<typeof eventSchema>
