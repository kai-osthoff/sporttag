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

export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  class: text('class').notNull(),
  priority1Id: integer('priority_1_id').notNull().references(() => events.id),
  priority2Id: integer('priority_2_id').notNull().references(() => events.id),
  priority3Id: integer('priority_3_id').notNull().references(() => events.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
})

// Type inference for TypeScript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert
