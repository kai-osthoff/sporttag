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
  // Allocation tracking columns
  assignedEventId: integer('assigned_event_id').references(() => events.id),
  assignmentType: text('assignment_type').$type<'auto' | 'manual'>(),
  assignedAt: integer('assigned_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
})

export const allocations = sqliteTable('allocations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seed: text('seed').notNull(),
  status: text('status').notNull().$type<'running' | 'completed' | 'failed'>(),
  stats: text('stats'), // JSON blob for AllocationStats
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

// Type inference for TypeScript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert

export type Allocation = typeof allocations.$inferSelect
export type NewAllocation = typeof allocations.$inferInsert
