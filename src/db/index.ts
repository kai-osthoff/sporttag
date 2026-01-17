import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// DB_PATH injected by Electron main process in production
// Falls back to project root for web development
const dbPath = process.env.DB_PATH || 'sporttag.db'

const sqlite = new Database(dbPath)
sqlite.pragma('foreign_keys = ON')  // Enable foreign key constraints

export const db = drizzle(sqlite, { schema })
