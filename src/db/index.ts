import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('sporttag.db')
sqlite.pragma('foreign_keys = ON')  // Enable foreign key constraints

export const db = drizzle(sqlite, { schema })
