import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  capacity: integer('capacity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
})

// Type inference for TypeScript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
