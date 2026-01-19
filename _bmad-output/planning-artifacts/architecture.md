---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-01-19'
inputDocuments:
  - "d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/prd.md"
  - "d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/ux-design-specification.md"
  - "d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/product-brief-Architecture Planning-2026-01-18.md"
workflowType: 'architecture'
project_name: 'Architecture Planning'
user_name: 'Geo'
date: '2026-01-19T09:08:11+01:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The core is a **Governance State Machine** enforcing a "No read, no meet" policy.
- **Workflows:** Strict transitions (Draft -> Ready -> Validated -> Scheduled).
- **Scheduling:** Logic-driven "Elastic Slots" based on topic complexity.
- **Roles:** granular RBAC (Leader vs Reviewer vs Admin).

**Non-Functional Requirements:**
- **Performance:** <2s interactions.
- **Real-time:** Instant feedback for "Reviewer Dashboard" (handled by Supabase Realtime).
- **Compliance:** Immutable Audit Logs.

**Scale & Complexity:**
- Primary domain: **SaaS B2B / Internal Tool**
- Complexity level: **Medium** (Simplified by Managed Backend)
- Estimated architectural components: **10** (Supabase handles Auth/DB/Realtime/Storage).

### Technical Constraints & Dependencies
- **Backend/Data:** **Supabase** (Postgres, GoTrue Auth, Realtime).
- **Hosting/Ops:** **Vercel** (Frontend hosting, potential Edge Functions).
- **Frontend:** Shadcn/UI + React (optimized for Vercel).
- **Auth Strategy:** Supabase Native Auth (Email/Password) -> Future-proof for SSO.

### Cross-Cutting Concerns Identified
- **Row-Level Security (RLS):** Supabase's native security model matches your RBAC requirement perfectly.
- **Audit Trails:** Can be implemented via Database Triggers in Supabase.
- **Real-time/Reactive:** Reviewer dashboard needs instant status updates.

## Starter Template Evaluation

### Primary Technology Domain
**Full-stack Web Application** (Next.js App Router)

### Starter Options Considered
1. **michaeltroya/supa-next-starter**: Battery-included (Auth, SSR, Tests). Best for velocity.
2. **Official Manual Setup**: Maximum control, slower setup.
3. **T3 Stack + Supabase**: Good but adds tRPC which might be overkill vs Server Actions.

### Selected Starter: michaeltroya/supa-next-starter

**Rationale for Selection:**
Aligned with the "Quality Governance" goal, this starter enforces best practices (Linting, Testing) from day one. It provides the exact stack required (Next.js 16 + Supabase SSR + Shadcn) without the need to wire them together manually.

**Initialization Command:**
```bash
npx create-next-app -e https://github.com/michaeltroya/supa-next-starter archiboard-platform
```

**Architectural Decisions Provided by Starter:**
- **Runtime:** Newest Next.js 16 (React 19 RC) with App Router.
- **Auth:** Supabase SSR (Cookie-based) pre-wired.
- **Styling:** Tailwind CSS + Shadcn/UI configured.
- **Quality:** Vitest (Unit Tests) + ESLint/Prettier (Code Quality).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Data Validation Strategy:** Zod Shared Schemas (Frontend/Backend consistency).
- **Architecture Pattern:** Service Layer Pattern (Actions -> Services -> Data).
- **State Management:** TanStack Query (Server State) + Zustand (Client State).
- **Security Strategy:** RLS First (Database) + Application Checks (UX).

**Important Decisions (Shape Architecture):**
- **API Pattern:** Server Actions (Next.js native) replacing traditional REST API.
- **Realtime Strategy:** Supabase Realtime subscriptions via TanStack Query.

**Deferred Decisions (Post-MVP):**
- **Complex Caching:** Redis/Edge caching deferred (Supabase + Vercel caching sufficient for MVP).
- **Multi-tenancy:** Deferred (Single Tenant MVP).

### Data Architecture

- **Database:** Postgres (Supabase).
- **Validation:** **Zod**. We will define schemas in a shared `types` or `schemas` folder. These schemas will drive both React Hook Form validation and Server Action input parsing.
- **Pattern:** Shared Schema Strategy.

### Authentication & Security

- **Auth Method:** Supabase Auth (SSR Cookie-based).
- **Authorization:** **RLS (Row Level Security)** is the Source of Truth.
- **UX Security:** Application-level checks (e.g., checking roles in `layout.tsx`) are for UX only (hiding UI), not for actual security.
- **Audit:** Implemented via Supabase Database Triggers to an immutable `audit_logs` table.

### API & Communication Patterns

- **Pattern:** **Server Actions**. No separate REST API layer.
- **Structure:** **Service Layer Pattern**.
    - `actions/`: Thin wrappers, handle Auth check + Zod parsing.
    - `services/`: Pure business logic, reusable, testable.
    - `db/`: Direct database queries.

### Frontend Architecture

- **State Management:**
    - **TanStack Query:** For all data fetching, caching, and optimistic updates.
    - **Zustand:** For complex client-only state (e.g., Wizard progress, ephemeral UI state).
    - **Realtime:** Supabase Realtime integrated into TanStack Query `onUpdate` callbacks for the Reviewer Dashboard.
    - **Component Strategy:** Shadcn/UI (Radix + Tailwind).

### Infrastructure & Deployment

- **Hosting:** Vercel (Frontend + Edge Functions).
- **Database:** Supabase Managed.
- **CI/CD:** GitHub Actions (provided by Starter) running Vitest and Linting on PR.

### Decision Impact Analysis

**Implementation Sequence:**
1.  Setup Zod Schemas & Types.
2.  Configure RLS Policies (Base Security).
3.  Implement Service Layer for Auth.
4.  Build UI Components with Shadcn.

**Cross-Component Dependencies:**
- Service Layer depends on Zod Schemas.
- Server Actions depend on Service Layer.
- UI Components depend on TanStack Query Hooks.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
4 areas where AI agents could make different choices (Naming, Structure, Formats, Process).

### Naming Patterns

**Database Naming Conventions:**
- **Standard:** `snake_case` matching Supabase/Postgres defaults.
- **Tables:** Plural `snake_case` (e.g., `projects`, `users`, `audit_logs`).
- **Columns:** `snake_case` (e.g., `created_at`, `is_active`, `project_id`).
- **Foreign Keys:** `[singular_table]_id` (e.g., `user_id`, `project_id`).

**API Naming Conventions (Server Actions):**
- **Actions:** `[verb][Subject]` (e.g., `createProject`, `validateBooking`).
- **Files:** `kebab-case` (e.g., `actions/project-actions.ts`).

**Code Naming Conventions:**
- **Variables/Functions:** `camelCase` (e.g., `getUserData`, `isValid`).
- **Components:** `PascalCase` (e.g., `ProjectCard`, `MaturityGauge`).
- **Files:** `kebab-case` (e.g., `project-card.tsx`).
- **Types/Interfaces:** `PascalCase` (e.g., `Project`, `UserProfile`).

### Structure Patterns

**Project Organization:**
- **Co-location:** Tests (`.test.ts`) and Stories (`.stories.tsx`) reside **next to** the component/logic they test.
- **Shared Utils:** `lib/` for generic helpers, `utils/` for domain helpers.

**File Structure Patterns:**
- **Components:** `components/ui` (Shadcn), `components/features/[feature-name]` (Custom).
- **Actions:** `app/actions/` grouped by domain.

### Format Patterns

**API Response Formats (Server Actions):**
All Server Actions must return a consistent Result Tuple object:
```typescript
type ActionResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string; // User-friendly error message
}>;
```

**Data Exchange Formats:**
- **Zod Schemas:** Suffix with `Schema` (e.g., `bookingRequestSchema`).
- **Dates:** ISO 8601 Strings (`YYYY-MM-DDTHH:mm:ss.sssZ`) for exchange.

### Communication Patterns

**Event System Patterns:**
- **Realtime:** Use Supabase Realtime channel names matching resources (e.g., `projects:[id]`).

**State Management Patterns:**
- **Server Data:** Use `useQuery` / `useMutation`. Do NOT manually manage `useEffect` for data fetching.
- **UI State:** Use `useStore` (Zustand) for complex cross-component UI state.

### Process Patterns

**Error Handling Patterns:**
- **Server:** Never `throw` errors in Actions intended for the client. Catch them and return `{ success: false, error: "..." }`.
- **Client:** Check `result.success`. If false, display `result.error` via `toast.error()`.

**Loading State Patterns:**
- **Data:** Use `isPending` state from TanStack Query.
- **Forms:** Use `form.formState.isSubmitting`.
- **No Manual Loading:** Avoid `const [isLoading, setIsLoading] = useState(false)` unless absolutely necessary.

### Enforcement Guidelines

**All AI Agents MUST:**

- Use the **Result Tuple** pattern for all Server Actions.
- Use **snake_case** for anything touching the Database.
- **Co-locate** tests with code.

**Pattern Enforcement:**
- Any code violating these patterns should be flagged during "Verification" phase reviews.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
archiboard-platform/
├── src/
│   ├── app/                      # Next.js App Router (Routes Only)
│   │   ├── (auth)/login/         # Auth pages
│   │   ├── (dashboard)/          # App Layout
│   │   │   ├── project/[id]/     # Project Workspace
│   │   │   └── reviewer/         # Reviewer Cockpit
│   │   └── actions/              # Server Actions (Entry Points)
│   │       ├── auth-actions.ts
│   │       └── governance-actions.ts
│   ├── components/
│   │   ├── ui/                   # Shadcn Atoms (Button, Badge)
│   │   ├── governance/           # Feature: MaturityGauge, SmartBadge
│   │   └── reviewer/             # Feature: ElasticSlotCard
│   ├── services/                 # BUSINESS LOGIC (The Core)
│   │   ├── governance/           # State Machine Rules
│   │   │   ├── machine.ts
│   │   │   └── user-service.ts
│   │   └── scheduling/           # Elastic Slot Logic
│   ├── lib/
│   │   └── supabase/             # Client instantiation
│   └── types/
│       └── schemas/              # Zod Schemas (Shared)
├── supabase/
│   ├── migrations/               # SQL & RLS Policies
│   └── tests/                    # Database Tests
└── tests/                        # E2E Tests (Playwright)
```

### Architectural Boundaries

**API Boundaries (Server Functions):**
- **Entry Points:** `src/app/actions/*.ts` are the ONLY public entry points for mutations.
- **Data Access:** `src/actions` call `src/services`, which call `src/lib/supabase`. Logic never leaks into Actions.

**Component Boundaries:**
- **Smart Components:** `src/components/[feature]` can access Data Hooks.
- **Dumb Components:** `src/components/ui` MUST be pure and props-driven.

**Data Boundaries:**
- **Source of Truth:** Supabase (Postgres) is the single source of truth.
- **Validation:** All writes MUST pass through Zod schemas in `src/types/schemas`.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- **Governance State Machine:** `src/services/governance/machine.ts`
- **Reviewer Dashboard:** `src/app/(dashboard)/reviewer/page.tsx`
- **Elastic Slots:** `src/services/scheduling/`
- **Audit Logs:** `supabase/migrations/*_triggers.sql`

**Cross-Cutting Concerns:**
- **Auth:** `src/services/auth/` + `middleware.ts`
- **Theme:** `src/app/globals.css` (Tailwind)

### Integration Points

**Internal Communication:**
- **Service-to-Service:** Direct function calls within `src/services` (e.g., Scheduling calls Governance to check permissions).
- **Client-to-Server:** Server Actions (`useMutation`) for writes, TanStack Query (`useQuery`) via Supabase Client for reads.

**Data Flow:**
- **Reads:** Client -> Supabase SDK -> Postgres (RLS) -> Client (Fast Path).
- **Writes:** Client -> Server Action -> Zod Validation -> Service Layer (Logic) -> Postgres -> Client.

### Development Workflow Integration

- **Development:** `pnpm dev` starts Next.js + Local Supabase via Docker.
- **Testing:** `pnpm test` runs Vitest (Unit) on Services and Playwright (E2E) on flows.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- **Next.js 16 + Supabase** is a proven, high-compatibility stack.
- **Service Layer Pattern** effectively bridges the gap between Server Actions (API) and Supabase Logic, resolving potential spaghetti code issues.
- **Zod Schemas** provide the necessary glue for end-to-end type safety (Db -> API -> UI).

**Pattern Consistency:**
- **Naming Conventions** (Snake for DB, Camel for App) are standard and non-conflicting.
- **Result Tuple Pattern** ensures errors are handled gracefully across the stack.

**Structure Alignment:**
- The proposed `src/` structure with distinct `services/` and `actions/` directories directly supports the **Service Layer** decision.
- Feature-based folders in `components/` align with the Epic structure.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- **Governance State Machine:** Fully supported by `src/services/governance`.
- **Reviewer Dashboard:** Real-time requirements met by Supabase Realtime + TanStack Query.
- **Elastic Slots:** Business logic isolated in `src/services/scheduling`.
- **Audit Logs:** Compliance met via Database Triggers (Immutable).

**Functional Requirements Coverage:**
- All 23 FRs map to specific components or services in the proposed structure.

**Non-Functional Requirements Coverage:**
- **Performance:** Next.js App Router + Vercel Edge caching.
- **Security:** RLS (Row Level Security) covers the granular RBAC requirement.
- **Reliability:** Managed Supabase Infrastructure.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical technology choices (Stack, Auth, DB) are locked.
- Versions are verified (Next 16, React 19 RC).

**Structure Completeness:**
- Full directory tree defined.
- Key files (`machine.ts`, `middleware.ts`) identified.

**Pattern Completeness:**
- Coding standards (Naming, Error Handling) are roughly defined to prevent agent conflicts.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:**
- Specific RLS policies need to be written (Implementation detail).
- Exact "Elastic Slot" algorithm logic needs to be coded (Implementation detail).

### Validation Issues Addressed

**Resolved:**
- Clarified conflict between Zod and DB Constraints -> **Validation Strategy: Zod Shared Schemas**.
- Clarified UI vs Logic separation -> **Service Layer Pattern**.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- **Separation of Concerns:** Service Layer prevents "Next.js bloat".
- **Type Safety:** End-to-end type safety with TypeScript + Zod + Supabase.
- **Velocity:** "Battery-included" starter saves days of config.

**Areas for Future Enhancement:**
- **Multi-tenancy:** deferred for MVP, but RLS lays groundwork.
- **Edge Caching:** Can be tuned later on Vercel.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
Initialize project with:
```bash
npx create-next-app -e https://github.com/michaeltroya/supa-next-starter
```

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-19
**Document Location:** d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- **Critical decisions** made (Stack, Auth, DB, Patterns)
- **Implementation patterns** defined (Naming, Error Handling)
- **Architectural components** specified (Service Layer, Server Actions)
- **Requirements** fully supported (Governance, Reviewer, Elastic Slots)

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (Next.js 16, Supabase)
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Archiboard. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
Initialize project with:
```bash
npx create-next-app -e https://github.com/michaeltroya/supa-next-starter
```

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations (Service Layer, Auth)
4. Build features following established patterns (Governance, Reviewer)
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen starter template (`supa-next-starter`) and architectural patterns provides a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.






