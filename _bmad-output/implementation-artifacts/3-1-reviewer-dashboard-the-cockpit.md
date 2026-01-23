# Story 3.1: Reviewer Dashboard ("The Cockpit")

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Reviewer,
I want to see a high-density dashboard of pending requests,
So that I can quickly assess which projects are ready for review.

## Acceptance Criteria

1.  **Dashboard Access & Layout**
    *   **Given** a logged-in Reviewer
    *   **When** they access `/dashboard/reviewer`
    *   **Then** they see a "Reviewer Cockpit" dashboard
    *   **And** the layout is optimized for high-density (Table/Grid view)
    *   **And** they see a summary of "Pending Reviews" count

2.  **Pending Requests List**
    *   **Given** there are pending governance requests
    *   **Then** the dashboard displays a list of requests with status `pending_review`
    *   **And** each row displays:
        *   **Project Name**
        *   **Topic Type** (Standard/Strategic)
        *   **Maturity Score** (Visual Gauge)
        *   **Submission Date** (Relative time, e.g., "2 hours ago")
    *   **And** the list is sorted by Submission Date (Oldest/Urgent first) by default

3.  **Maturity Score Visualization**
    *   **Given** a request in the list
    *   **Then** the "Maturity Score" column shows a visual indicator (Gauge/Bar)
    *   **And** it reflects the completeness of the request (e.g., based on filled fields/uploads - logic to be refined in implementation)

4.  **Real-time Updates**
    *   **Given** I am on the dashboard
    *   **When** a Project Leader submits a new request
    *   **Then** the list updates automatically without refreshing (Supabase Realtime)

5.  **Role Enforcement**
    *   **Given** a non-Reviewer (e.g., Project Leader)
    *   **When** they attempt to access `/dashboard/reviewer`
    *   **Then** they are redirected or see a 403 Forbidden page (re-verify RBAC logic from Story 1.2)

## Tasks / Subtasks

- [ ] **Database & RLS**
    - [ ] **RLS:** Ensure `Reviewer` role has `SELECT` permission on `governance_requests` (all rows).
    - [ ] **RLS:** Ensure `Reviewer` role has `SELECT` permission on `projects` (for joining details).

- [ ] **Domain & Logic (Backend)**
    - [ ] Update `src/services/governance/governance-service.ts`:
        -   Implement `getPendingRequests()`: Fetch requests with status `pending_review`, joined with Project details.
        -   Implement `calculateMaturityScore(request)`: Initial logic (can be simple count of proofs initially, or hardcoded mock for MVP if complex rules aren't defined yet).

- [ ] **Server Actions**
    - [ ] Create `src/actions/reviewer-actions.ts`:
        -   Implement `fetchReviewerDashboardData()` (if not using direct Server Component data fetching).
        -   *Note:* standard pattern suggests Server Components fetch data directly from Services. Use Actions for mutations.

- [ ] **Frontend - Components**
    - [ ] Create `src/components/features/reviewer/reviewer-dashboard.tsx`.
        -   Use `TanStack Table` or `Shadcn Table` for high density.
    - [ ] Create `src/components/features/governance/maturity-gauge.tsx`.
        -   Visual component (e.g., small progress bar or ring).
    - [ ] Create `src/app/(dashboard)/reviewer/page.tsx`.
        -   Ensure it uses `GovernanceService.getPendingRequests()`.
    -   Implement Realtime subscription (Supabase) to refresh list on new inserts/updates to `governance_requests`.

## Dev Notes

### Architecture Patterns
-   **Fetching:** Use **Server Components** for the initial page load data (`await GovernanceService.getPendingRequests()`).
-   **Realtime:** client-side `useSupabaseClient` to listen to `postgres_changes` on `governance_requests`. Invalidate/Refetch via React Query or router.refresh().
-   **RBAC:** The Layout or Middleware should already handle basic protection, but double-check `getUserRole` validation in the Page component or Service.

### UX Design Specs (from `ux-design-specification.md`)
-   **Density:** "Cockpit" density. Small padding, compact text.
-   **Visuals:**
    -   **Maturity Gauge:** 3 segments (Red/Yellow/Green). Current MVP can be simple 0-100% bar.
    -   **Zero-Click:** Hover states will be important (Story 3.2), lay the groundwork here.

### Project Context
-   **Authentication:** `middleware.ts` handles generic route protection.
-   **Database:** `governance_requests` table exists (Story 2.1).
-   **Status Enum:** Ensure `pending_review` is the correct status key used in Story 2.4.

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

## File List
- src/app/(dashboard)/reviewer/page.tsx
- src/services/governance/governance-service.ts
- src/components/features/reviewer/reviewer-dashboard.tsx
- src/components/features/governance/maturity-gauge.tsx
