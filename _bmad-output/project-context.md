---
project_name: 'Architecture Planning'
user_name: 'Geo'
date: '2026-01-19'
sections_completed: ['technology_stack', 'implementation_rules', 'anti_patterns']
existing_patterns_found: 4
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Core:** Next.js 16 (App Router), React 19 RC, TypeScript 5.x
- **Backend:** Supabase (Auth, Postgres, Realtime, Edge Functions)
- **UI:** Shadcn/UI, Tailwind CSS 4.x, Lucide React
- **State:** TanStack Query (Server State), Zod (Validation), Zustand (Client State)
- **Testing:** Vitest (Unit), Playwright (E2E)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict Mode:** MUST be enabled. No `any`.
- **Async/Await:** Prefer `async/await` over raw Promises.
- **Null Safety:** Strict null checks enabled. Handle `undefined` explicitly.

### Framework-Specific Rules (Next.js & Supabase)

- **Server Actions:**
  - MUST return `ActionResult<T>`: `{ success: boolean, data?: T, error?: string }`.
  - MUST handle parsing validation errors from Zod.
  - NEVER throw errors to the client; catch and return `success: false`.
- **Components:**
  - Use `src/components/ui` for Shadcn (dumb components).
  - Use `src/components/features/[name]` for business logic components.
- **Supabase:**
  - Use `createClient` from `@supabase/ssr`.
  - NEVER expose Service Role Key on client side.
  - **Tooling:** MUST use Supabase MCP server tools for all Supabase-related implementation tasks (migrations, edge functions, etc).

### Database & Naming Pattern Rules

- **DB Entities:** `snake_case` (e.g., `audit_logs`, `user_id`).
- **App Entities:** `camelCase` (e.g., `auditLogs`, `userId`).
- **Files:** `kebab-case` with descriptive suffixes (e.g., `auth-service.ts`, `project-card.tsx`).
- **Zod Schemas:** Suffix with `Schema` (e.g., `userProfileSchema`).

### Testing Rules

- **Co-location:** Tests (`.test.ts`) live next to the file being tested.
- **Unit Tests:** Focus on `services/` logic.
- **E2E Tests:** Focus on `app/` flows and critical paths.

### Critical Anti-Patterns (DO NOT DO THIS)

- ❌ **Anti-Pattern:** Fetching data in Client Components with `useEffect`.
  - **Fix:** Use Server Components or `useQuery` (TanStack Query).
- ❌ **Anti-Pattern:** Direct DB calls in Server Actions.
  - **Fix:** Call `services/` layer to keep Actions thin.
- ❌ **Anti-Pattern:** Hardcoded strings for Roles/Status.
  - **Fix:** Use Enums or Constants (e.g., `UserRole.REVIEWER`).
- ❌ **Anti-Pattern:** Ignoring Zod validation.
  - **Fix:** Validate ALL inputs at Action boundaries before processing.

