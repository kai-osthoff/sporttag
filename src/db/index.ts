import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'

// DB_PATH injected by Electron main process in production
// Falls back to project root for web development
const dbPath = process.env.DB_PATH || 'sporttag.db'
console.log(`Opening database at: ${dbPath}`)

const sqlite = new Database(dbPath)
sqlite.pragma('foreign_keys = ON')  // Enable foreign key constraints

export const db = drizzle(sqlite, { schema })

// Run migrations on module load (synchronous in better-sqlite3)
const migrationsPath = process.env.MIGRATIONS_PATH || './src/db/migrations'

try {
  migrate(db, { migrationsFolder: migrationsPath })
  console.log('Database migrations applied successfully')
} catch (error) {
  console.error('Migration failed:', error)
  // Don't throw - let app attempt to start
  // Schema mismatch will cause more specific errors later
}
