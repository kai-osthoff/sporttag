# Stack Research: Sporttag-Anmeldeplattform

**Project:** School sports day registration with lottery-based allocation
**Researched:** 2026-01-16
**Overall Confidence:** HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Next.js** | 15.5.x (stable) | Full-stack React framework | Server Actions for forms, API routes for lottery, App Router for modern patterns. Most mature React meta-framework with excellent TypeScript support. v15 stable avoids v16 breaking changes while getting Turbopack benefits. | HIGH |
| **React** | 19.x | UI library | Required by Next.js 15+, stable with improved form handling | HIGH |
| **TypeScript** | 5.9.x | Type safety | End-to-end type safety critical for form validation and lottery algorithm correctness | HIGH |

**Why Next.js over alternatives:**

- **vs Remix:** Next.js has larger ecosystem, better documentation, easier deployment. Remix's form-handling advantages are now matched by Next.js Server Actions.
- **vs SvelteKit:** Next.js TypeScript support is more mature. Svelte ecosystem smaller, harder to find help. For a school project, community support matters.
- **vs pure React + Express:** Next.js provides routing, API routes, deployment as single package. No need to wire separate backend.

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **SQLite** | 3.x (via better-sqlite3) | Data persistence | Zero-config, single-file database. Perfect for ~250 students, ~7 events. No database server needed. Trivial backup (copy file). Can migrate to PostgreSQL later if needed. | HIGH |
| **better-sqlite3** | 12.6.x | SQLite driver | Synchronous API (simpler code), best performance for Node.js SQLite | HIGH |
| **Drizzle ORM** | 0.45.x | Type-safe queries | SQL-first, lightweight (~7kb), excellent TypeScript inference. No code generation step unlike Prisma. Perfect for SQLite. | HIGH |

**Why SQLite over PostgreSQL:**

- **Deployment simplicity:** No separate database process. Single file = easy backup, easy restore.
- **Scale is appropriate:** ~250 students, ~7 events, used once per year. PostgreSQL is overkill.
- **School IT-friendly:** No database admin needed. Copy folder = full backup.
- **Migration path exists:** Drizzle schemas work with PostgreSQL. Can upgrade if v2 needs scale.

**Why Drizzle over Prisma:**

- **Lighter weight:** No Prisma Client generation, faster cold starts
- **SQL-first:** Teachers/developers can understand the queries
- **Better SQLite support:** Prisma's SQLite support has limitations
- **Simpler mental model:** Schema-as-code, no separate schema file

### Form Handling & Validation

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| **React Hook Form** | 7.71.x | Form state management | Most mature, best docs, minimal re-renders. Uncontrolled components = better performance. | HIGH |
| **Zod** | 4.3.x | Schema validation | Type inference, works both client and server. Validates student input (3 priorities, no duplicates). | HIGH |
| **@hookform/resolvers** | latest | RHF-Zod bridge | Connects Zod schemas to React Hook Form | HIGH |

**Why React Hook Form over TanStack Form:**

- **Maturity:** RHF is battle-tested, larger community, more examples
- **Simplicity:** Simpler API for this use case (student priority forms are not complex)
- **Ecosystem:** Better integration with shadcn/ui form components
- **TanStack Form consideration:** Better for complex, interdependent forms. Overkill here.

### UI Components

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| **shadcn/ui** | latest | Component library | Copy-paste components, full customization. Tables, forms, buttons out of box. No runtime dependency. | HIGH |
| **Tailwind CSS** | 4.1.x | Styling | shadcn/ui requires it. Utility-first = fast iteration. Print styles easy to add. | HIGH |
| **@tanstack/react-table** | 8.21.x | Data tables | Event lists, student lists, allocation results. Sorting, filtering built-in. shadcn/ui has table wrapper. | HIGH |
| **react-to-print** | 3.2.x | Print functionality | Simple hook for printing React components with CSS. Handles print media queries. | HIGH |

**Why shadcn/ui:**

- **Ownership:** Components live in your codebase, not node_modules. Full control.
- **Quality:** Built on Radix UI (accessibility) + Tailwind (styling)
- **Print-friendly:** Can customize print styles directly in components
- **Form integration:** Pre-built form components work with React Hook Form + Zod

### Lottery Algorithm

| Approach | Implementation | Why | Confidence |
|----------|----------------|-----|------------|
| **Fisher-Yates shuffle** | Custom implementation | Mathematically fair randomization. O(n) performance. Well-documented algorithm. | HIGH |
| **Weighted priority allocation** | Custom implementation | Respects student preferences (1st > 2nd > 3rd priority) | HIGH |

**Algorithm approach (no external library needed):**

```typescript
// Fisher-Yates for fair randomization
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Allocation respects: 1) Random order (fairness) 2) Priority preference
```

### Authentication (v2 only)

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| **Auth.js (NextAuth.js)** | 5.x | Authentication | De-facto standard for Next.js. Supports credentials, OAuth. Role-based access built-in. | MEDIUM |

**v1 note:** No authentication needed. Teachers access directly.

**v2 implementation:**
- Students authenticate (simple username/password or school SSO)
- Teachers have admin role
- Middleware protects routes by role

### Deployment

| Approach | Technology | Why | Confidence |
|----------|------------|-----|------------|
| **Docker container** | `output: 'standalone'` | Single deployable unit. Works anywhere Docker runs. School IT can deploy. | HIGH |
| **OR: Node.js server** | `next start` | Even simpler. Just needs Node.js installed. | HIGH |

**Why standalone Docker:**

```dockerfile
# Minimal production image (~200MB)
FROM node:22-alpine
WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- **Single file deployment:** No npm install in production
- **Reproducible:** Same image runs in dev/test/prod
- **School IT-friendly:** One command to run: `docker run -p 3000:3000 sporttag`

---

## Why This Stack (The Combination)

### Optimized for School Environment

1. **Zero external services:** No database server, no auth provider (v1), no CDN needed
2. **Single deployment artifact:** Docker image or standalone folder
3. **Trivial backup:** Copy SQLite file + done
4. **Offline capable:** Could run on laptop if network fails

### Optimized for the Problem Domain

1. **Form-heavy workflow:** RHF + Zod + shadcn/ui = excellent form DX
2. **List generation:** TanStack Table + react-to-print = print-ready outputs
3. **Fair lottery:** Fisher-Yates is mathematically proven fair
4. **Type safety:** TypeScript catches validation bugs before runtime

### Optimized for Maintainability

1. **Modern but stable:** Next.js 15.5 (not bleeding-edge 16), React 19 (stable)
2. **Community support:** All choices are popular = easy to find help
3. **Clear upgrade path:** Can add PostgreSQL, add auth, scale if needed

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Chosen |
|----------|-------------|-------------|----------------|
| Framework | Next.js 15.5 | **Remix** | Server Actions now match Remix's form handling. Next.js ecosystem larger. |
| Framework | Next.js 15.5 | **SvelteKit** | Smaller ecosystem, harder to find TypeScript help. |
| Database | SQLite | **PostgreSQL** | Overkill for 250 students/year. Adds deployment complexity. |
| Database | SQLite | **JSON files** | No querying capability. SQLite is simple AND powerful. |
| ORM | Drizzle | **Prisma** | Heavier, requires code generation, SQLite support weaker. |
| Forms | React Hook Form | **TanStack Form** | RHF more mature, simpler for this use case. |
| Forms | React Hook Form | **Formik** | Legacy, RHF is successor with better performance. |
| UI | shadcn/ui | **Material UI** | MUI is heavier, less customizable, worse print styles. |
| UI | shadcn/ui | **Chakra UI** | Less TypeScript-first, runtime overhead. |
| Tables | TanStack Table | **AG Grid** | AG Grid overkill, complex licensing. |
| Auth (v2) | Auth.js | **Clerk** | External service, costs money, data leaves school. |
| Auth (v2) | Auth.js | **Lucia** | Lighter but less ecosystem support. Auth.js is standard. |

---

## Anti-Recommendations

### DO NOT Use

| Technology | Why Avoid |
|------------|-----------|
| **Firebase/Supabase** | External service, data privacy concerns for student data, unnecessary complexity |
| **MongoDB** | Overkill, relational data (students->events) fits SQL better |
| **GraphQL** | Over-engineering for this use case. REST/Server Actions sufficient. |
| **Electron** | Web app is simpler, accessible from any device |
| **PHP/WordPress** | Modern TypeScript stack is more maintainable |
| **Spreadsheet-based** | No lottery algorithm, no fair allocation, manual work |
| **Next.js 16** | Too new (Oct 2025), let it stabilize. 15.5 is production-ready. |
| **Prisma** | Code generation adds complexity, Drizzle is lighter for SQLite |

### Avoid These Patterns

| Pattern | Why Avoid | Instead |
|---------|-----------|---------|
| **Client-side only lottery** | Not auditable, refresh = different result | Server-side with seed logging |
| **Real-time allocation** | Unnecessary complexity | Batch allocation after deadline |
| **Complex role hierarchy** | Only 2 roles needed (teacher/student) | Simple boolean isTeacher |
| **Microservices** | Single-purpose app, one service is fine | Monolith |
| **Serverless functions** | SQLite needs persistent filesystem | Standalone server |

---

## Installation Commands

```bash
# Create Next.js project
npx create-next-app@latest sporttag --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install drizzle-orm better-sqlite3 zod react-hook-form @hookform/resolvers

# UI dependencies (shadcn/ui installation is interactive)
npx shadcn@latest init
npx shadcn@latest add button form input label table card

# Table and print
npm install @tanstack/react-table react-to-print

# Dev dependencies
npm install -D drizzle-kit @types/better-sqlite3

# v2 only: Authentication
npm install next-auth@beta
```

---

## Version Compatibility Matrix

| Package | Version | Requires | Notes |
|---------|---------|----------|-------|
| Next.js | 15.5.x | Node 18.17+ | Use 15.5, not 16 |
| React | 19.x | - | Comes with Next.js 15 |
| TypeScript | 5.9.x | - | Latest stable |
| Tailwind | 4.1.x | - | v4 syntax, shadcn/ui compatible |
| Drizzle | 0.45.x | - | Stable, frequent updates |
| better-sqlite3 | 12.6.x | Node native build | May need python/gcc for install |
| React Hook Form | 7.71.x | React 18+ | Stable |
| Zod | 4.3.x | - | v4 is current major |
| TanStack Table | 8.21.x | React 18+ | Stable |
| Auth.js | 5.x | Next.js 14+ | v2 only |

---

## Sources

### Framework Comparison
- [Next.js vs Remix vs SvelteKit - The Ultimate Guide](https://rockstack.dev/blog/nextjs-vs-remix-vs-sveltekit-the-ultimate-guide-top-10-differences)
- [Remix vs NextJS 2025 comparison](https://merge.rocks/blog/remix-vs-nextjs-2025-comparison)
- [SvelteKit vs Next.js: Which Should You Choose in 2025?](https://prismic.io/blog/sveltekit-vs-nextjs)

### Next.js
- [Next.js 15.5 Release Notes](https://nextjs.org/blog/next-15-5)
- [Next.js Self-Hosting Guide](https://nextjs.org/docs/app/guides/self-hosting)
- [NextJs App Deployment with Docker: Complete Guide for 2025](https://codeparrot.ai/blogs/deploy-nextjs-app-with-docker-complete-guide-for-2025)

### Database
- [SQLite vs PostgreSQL: A Detailed Comparison](https://www.datacamp.com/blog/sqlite-vs-postgresql-detailed-comparison)
- [Drizzle vs Prisma: the Better TypeScript ORM in 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [Drizzle vs Prisma: Choosing the Right TypeScript ORM](https://betterstack.com/community/guides/scaling-nodejs/drizzle-vs-prisma/)

### Forms & Validation
- [TanStack Form vs. React Hook Form](https://blog.logrocket.com/tanstack-form-vs-react-hook-form/)
- [The best React form libraries of 2025](https://blog.croct.com/post/best-react-form-libraries)
- [Composable Form Handling in 2025](https://makersden.io/blog/composable-form-handling-in-2025-react-hook-form-tanstack-form-and-beyond)

### UI Components
- [shadcn/ui Official Documentation](https://ui.shadcn.com/)
- [Shadcn UI Ecosystem 2025: Complete Guide](https://www.devkit.best/blog/mdx/shadcn-ui-ecosystem-complete-guide-2025)

### Lottery Algorithm
- [Fisher-Yates Shuffle](https://bost.ocks.org/mike/shuffle/)
- [Fisher-Yates shuffle - Wikipedia](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle)

### Authentication
- [Auth.js Role Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

### Printing
- [react-to-print on npm](https://www.npmjs.com/package/react-to-print)
- [Using react-to-print to generate a printable document](https://blog.logrocket.com/using-react-to-print-generate-printable-document/)

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Core Framework (Next.js) | HIGH | Verified via npm registry, official docs, multiple sources |
| Database (SQLite + Drizzle) | HIGH | Fits use case perfectly, verified performance claims |
| Forms (RHF + Zod) | HIGH | Industry standard, verified versions |
| UI (shadcn/ui) | HIGH | Active development, React 19 compatible confirmed |
| Lottery Algorithm | HIGH | Fisher-Yates is mathematically proven |
| Authentication (v2) | MEDIUM | Auth.js v5 is beta, but widely used |
| Deployment | HIGH | Docker standalone is officially documented |

---

## Roadmap Implications

### Phase Structure Suggestion

1. **Foundation Phase:** Next.js + SQLite + Drizzle setup, basic schema
2. **Data Entry Phase:** Forms for events, students, priorities (RHF + Zod)
3. **Lottery Phase:** Allocation algorithm, result display
4. **Output Phase:** Print-friendly lists (react-to-print + CSS)
5. **v2 Preparation:** Auth.js integration, role separation

### Technology Risks

- **better-sqlite3 native build:** May need build tools on deployment machine. Mitigation: Use Docker.
- **shadcn/ui Tailwind v4:** New syntax, some components may have edge cases. Mitigation: Pin versions.
- **Auth.js v5 beta:** API may change. Mitigation: Defer auth to v2, let it stabilize.

### No Further Stack Research Needed

This stack is well-documented and widely used. Phase-specific research should focus on:
- Lottery algorithm edge cases (what if all priorities full?)
- Print CSS specifics (page breaks, headers)
- School IT deployment specifics (ports, firewall)
