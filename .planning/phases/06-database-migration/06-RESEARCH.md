# Phase 6: Database Migration - Research

**Researched:** 2026-01-17
**Domain:** Electron userData paths + SQLite database directory management + Drizzle ORM runtime configuration
**Confidence:** HIGH

## Summary

Phase 6 migrates the SQLite database from the app bundle location to the macOS standard user data directory (`~/Library/Application Support/Sporttag/`). This ensures data survives app updates and follows platform conventions. The implementation is straightforward because Phase 5 already established the `DB_PATH` environment variable pattern.

Key findings:
1. **Electron provides the path natively** - `app.getPath('userData')` returns `~/Library/Application Support/{appName}/` on macOS
2. **Directory must be created explicitly** - Electron's `app.getPath()` does NOT create the directory; better-sqlite3 will fail if parent directory doesn't exist
3. **Current implementation is 90% complete** - The existing `electron/main.ts` already sets `DB_PATH` to userData in production; only directory creation logic is missing
4. **No migration needed for fresh installs** - Users updating from web-only usage have no existing data to migrate
5. **Drizzle migrations should run on startup** - Add programmatic migration runner to ensure schema is current

**Primary recommendation:** Add `fs.mkdirSync(userData, { recursive: true })` before database path assignment in `electron/main.ts`, and add Drizzle migration runner to `src/db/index.ts`.

## Standard Stack

No new libraries required. Phase 5 stack is sufficient:

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| electron | ^40.0.0 | `app.getPath('userData')` | Built-in path API |
| better-sqlite3 | ^12.6.2 | SQLite driver | Creates database file if parent dir exists |
| drizzle-orm | ^0.45.1 | ORM with migrations | `migrate()` function for schema updates |
| fs (Node.js built-in) | - | Directory creation | `mkdirSync({ recursive: true })` |

### Supporting (Already in Project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-kit | ^0.31.8 | Migration generation | `drizzle-kit generate` for schema changes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fs.mkdirSync | mkdirp package | Unnecessary - Node.js 10+ has recursive option |
| Manual directory check | electron-store | Overkill for just ensuring a directory exists |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Directory Structure

No structural changes. Focus areas:

```
sporttag/
├── electron/
│   └── main.ts           # MODIFY: Add directory creation before DB_PATH
├── src/
│   └── db/
│       ├── index.ts      # MODIFY: Add migration runner
│       ├── schema.ts     # UNCHANGED
│       └── migrations/   # EXISTING: SQL migration files
│           ├── 0000_tan_agent_brand.sql
│           ├── 0001_new_red_wolf.sql
│           └── meta/
```

### Pattern 1: Ensure userData Directory Exists

**What:** Create the user data directory before referencing database path.

**When to use:** Always, before any file operations in userData.

**Why:** `app.getPath('userData')` returns the path but does NOT create it. better-sqlite3 throws `TypeError: Cannot open database because the directory does not exist` if parent directory is missing.

```typescript
// electron/main.ts
// Source: https://www.electronjs.org/docs/latest/api/app + Node.js fs docs
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

function getProductionDbPath(): string {
  const userData = app.getPath('userData');

  // userData directory may not exist on first launch
  // fs.mkdirSync with recursive: true is safe if directory already exists
  if (!fs.existsSync(userData)) {
    fs.mkdirSync(userData, { recursive: true });
  }

  return path.join(userData, 'sporttag.db');
}
```

**Key insight:** `{ recursive: true }` makes `mkdirSync` idempotent - it succeeds whether the directory exists or not. No need for `existsSync` check (kept above for clarity/logging).

### Pattern 2: Run Drizzle Migrations on Startup

**What:** Automatically apply pending schema migrations when database connection initializes.

**When to use:** Production apps where schema may change between releases.

```typescript
// src/db/index.ts
// Source: https://orm.drizzle.team/docs/migrations
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';

const dbPath = process.env.DB_PATH || 'sporttag.db';
const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Run migrations on module load (synchronous in better-sqlite3)
// migrationsFolder path is relative to project root in Next.js
const migrationsPath = process.env.MIGRATIONS_PATH || './src/db/migrations';
migrate(db, { migrationsFolder: migrationsPath });
```

**Note:** Drizzle's better-sqlite3 migrate is synchronous, so it blocks module initialization. This is fine for app startup.

### Pattern 3: Path Resolution for Packaged App

**What:** Migrations folder path differs between development and packaged Electron app.

**When to use:** When bundling migrations with Electron app.

```typescript
// In electron/main.ts, set environment variable for migrations path
const migrationsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'standalone', 'src', 'db', 'migrations')
  : path.join(__dirname, '..', 'src', 'db', 'migrations');

nextServer = spawn('node', [serverPath], {
  env: {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: 'localhost',
    DB_PATH: dbPath,
    MIGRATIONS_PATH: migrationsPath,  // NEW
  },
  // ...
});
```

### Anti-Patterns to Avoid

- **Assuming userData directory exists:** First launch on fresh macOS install will fail without explicit `mkdirSync`.
- **Hardcoding migration paths:** Use environment variable for path since it differs between dev/production/packaged.
- **Skipping migrations in Electron:** Schema changes between app versions will corrupt data without migrations.
- **Using async mkdir in main process:** `app.whenReady()` callback is async, but better to do sync directory creation before spawning server.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User data directory path | Custom path construction | `app.getPath('userData')` | Cross-platform, follows OS conventions |
| Directory creation | Complex exists-check logic | `fs.mkdirSync(dir, { recursive: true })` | Idempotent, handles nested paths |
| Schema migrations | Manual ALTER TABLE scripts | `drizzle-orm/better-sqlite3/migrator` | Tracks applied migrations, transactional |
| Migration file generation | Hand-written SQL | `drizzle-kit generate` | Diff-based, handles complex changes |

**Key insight:** Electron and Node.js provide all necessary primitives. The implementation is ~10 lines of code.

## Common Pitfalls

### Pitfall 1: SQLITE_CANTOPEN / Directory Does Not Exist

**What goes wrong:** App crashes on first launch with `TypeError: Cannot open database because the directory does not exist`.

**Why it happens:** `app.getPath('userData')` returns the path, but Electron does NOT create the directory. better-sqlite3 requires the parent directory to exist (it will create the `.db` file, not the folder).

**How to avoid:** Always call `fs.mkdirSync(userData, { recursive: true })` before constructing the database path.

**Warning signs:** Works fine in development (directory exists), fails only on fresh production install.

### Pitfall 2: Migrations Folder Not Found in Packaged App

**What goes wrong:** App works in dev but crashes in packaged Electron with "ENOENT: migrations folder not found".

**Why it happens:** Next.js standalone build doesn't include `src/db/migrations/` by default. Path resolution changes in packaged app.

**How to avoid:**
1. Add migrations to electron-builder's `extraResources`
2. Pass `MIGRATIONS_PATH` env var pointing to correct location

**Warning signs:** Migration runner logs "no migrations to apply" when you know there are pending ones.

### Pitfall 3: Database Schema Mismatch After Update

**What goes wrong:** App crashes with "no such column" or "table already exists" errors after update.

**Why it happens:** New app version has schema changes but migrations weren't applied to existing database.

**How to avoid:** Run `migrate(db, { migrationsFolder })` on every app startup. Drizzle tracks which migrations have run.

**Warning signs:** Users report app worked before update, now crashes on launch.

### Pitfall 4: Wrong Database Path in Dev vs Production

**What goes wrong:** Development and production use same database file, or dev changes don't appear.

**Why it happens:** Confusion between `DB_PATH` settings; dev uses project root, production uses userData.

**How to avoid:** Current pattern is correct - Phase 5 already separates paths:
- Dev: `path.join(__dirname, '..', 'sporttag.db')` (project root)
- Production: `path.join(app.getPath('userData'), 'sporttag.db')`

**Warning signs:** Data appears/disappears when switching between `npm run dev` and packaged app.

## Code Examples

### Complete Directory Initialization (electron/main.ts modification)

```typescript
// Source: Electron app API + Node.js fs docs
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

async function startNextServer(): Promise<void> {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'standalone', 'server.js')
    : path.join(__dirname, '..', '.next', 'standalone', 'server.js');

  // DATABASE PATH SETUP
  let dbPath: string;
  let migrationsPath: string;

  if (app.isPackaged) {
    // Production: userData directory (survives app updates)
    const userData = app.getPath('userData');

    // CRITICAL: Create directory if it doesn't exist
    if (!fs.existsSync(userData)) {
      fs.mkdirSync(userData, { recursive: true });
      console.log(`Created userData directory: ${userData}`);
    }

    dbPath = path.join(userData, 'sporttag.db');
    migrationsPath = path.join(process.resourcesPath, 'standalone', 'src', 'db', 'migrations');
  } else {
    // Development: project root
    dbPath = path.join(__dirname, '..', 'sporttag.db');
    migrationsPath = path.join(__dirname, '..', 'src', 'db', 'migrations');
  }

  console.log(`Database path: ${dbPath}`);
  console.log(`Migrations path: ${migrationsPath}`);

  nextServer = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: 'localhost',
      DB_PATH: dbPath,
      MIGRATIONS_PATH: migrationsPath,
    },
    cwd: path.dirname(serverPath),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // ... rest of function
}
```

### Migration Runner (src/db/index.ts modification)

```typescript
// Source: https://orm.drizzle.team/docs/migrations
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';

// DB_PATH injected by Electron main process in production
// Falls back to project root for web development
const dbPath = process.env.DB_PATH || 'sporttag.db';

console.log(`Opening database at: ${dbPath}`);

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Run migrations on module load
// Drizzle tracks which migrations have been applied
const migrationsPath = process.env.MIGRATIONS_PATH || './src/db/migrations';

try {
  migrate(db, { migrationsFolder: migrationsPath });
  console.log('Database migrations applied successfully');
} catch (error) {
  console.error('Migration failed:', error);
  // Don't throw - let app attempt to start even if migrations fail
  // Schema mismatch will cause more specific errors
}
```

### electron-builder.yml Addition (for migrations)

```yaml
# Add to existing extraResources
extraResources:
  - from: ".next/standalone"
    to: "standalone"
    filter:
      - "**/*"
  - from: ".next/static"
    to: "standalone/.next/static"
  - from: "public"
    to: "standalone/public"
  # NEW: Include migration files
  - from: "src/db/migrations"
    to: "standalone/src/db/migrations"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store in app bundle | Store in userData | Always | Data survives updates |
| Manual SQL migrations | Drizzle migrate() | 2024+ | Tracked, transactional migrations |
| Check-then-create dir | `mkdirSync({ recursive: true })` | Node.js 10+ | Simpler, race-condition free |

**Deprecated/outdated:**
- `fs.exists()` - deprecated, use `fs.existsSync()` or just use `mkdirSync({ recursive: true })`
- Manual migration tracking - Drizzle's `__drizzle_migrations` table handles this

## Open Questions

Things that couldn't be fully resolved:

1. **Migrations path in standalone build**
   - What we know: Standalone build has different directory structure
   - What's unclear: Exact path where Next.js standalone places src/ files
   - Recommendation: Log actual paths during development, verify in packaged app

2. **First-time user vs upgrade user**
   - What we know: Fresh installs work; existing data stays where it is
   - What's unclear: Are there any Phase 5 testers with data in old location?
   - Recommendation: For v1.0, assume fresh installs only. Add migration helper if needed post-launch.

3. **Migration error handling**
   - What we know: Drizzle throws on migration failure
   - What's unclear: Best UX for failed migration (dialog? log? rollback?)
   - Recommendation: Log error, let schema mismatch cause specific failure. Add dialog in future phase.

## Sources

### Primary (HIGH confidence)

- [Electron app API - getPath](https://www.electronjs.org/docs/latest/api/app) - Official documentation for userData path
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) - Programmatic migration runner
- [Node.js fs.mkdirSync](https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs) - Directory creation with recursive option
- [better-sqlite3 Issue #955](https://github.com/WiseLibs/better-sqlite3/issues/955) - Directory must exist error documentation

### Secondary (MEDIUM confidence)

- [How to store user data in Electron](https://cameronnokes.com/blog/how-to-store-user-data-in-electron/) - Best practices for userData
- [Getting Started with Drizzle ORM](https://betterstack.com/community/guides/scaling-nodejs/drizzle-orm/) - Migration patterns

### Tertiary (LOW confidence)

- None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, using built-in Node.js/Electron APIs
- Architecture patterns: HIGH - Well-documented Electron and Drizzle patterns
- Pitfalls: HIGH - Verified through official docs and GitHub issues

**Research date:** 2026-01-17
**Valid until:** 180 days (Electron userData API is stable, Drizzle migrations mature)
