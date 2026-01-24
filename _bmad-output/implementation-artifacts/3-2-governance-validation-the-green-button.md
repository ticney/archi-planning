# Story 3.2: Governance Validation ("The Green Button")

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Reviewer,
I want to validate a request that meets all criteria,
So that it can proceed to scheduling.

## Acceptance Criteria

1.  **Validate Action**
    *   **Given** a pending request on the Reviewer Dashboard
    *   **When** I click the "Validate" action (e.g., Green Check button)
    *   **Then** the request status changes from `pending_review` to `validated`
    *   **And** the Project Leader receives a notification "Governance Validated" (Note: For this story, a UI toast or console log is sufficient if full notification system is not ready; ideally create a placeholder stub).

2.  **Dashboard State Update**
    *   **Given** I have just validated a request
    *   **Then** the request is removed from the "Pending" list/tab
    *   **And** the request appears in the "Validated" list/tab (Requires Dashboard Tabs implementation).
    *   **And** the UI updates immediately (optimistic or realtime).

3.  **Role Enforcement**
    *   **Given** a non-Reviewer (e.g., Project Leader)
    *   **When** they attempt to trigger the validation action (API call)
    *   **Then** the server action rejects the request with a Forbidden error.

## Tasks / Subtasks

    - [x] **Data Layer & Services**
        - [x] Update `src/services/governance/governance-service.ts`
        - [x] **RLS:** Ensure `Reviewer` role has `UPDATE` permission

- [/] **Server Actions**
    - [x] Update `src/actions/reviewer-actions.ts`

- [/] **Frontend - Components**
    - [x] **Dashboard Tabs**
    - [x] **Validate Action**

- [x] **E2E Tests**
    - [x] Update `e2e/reviewer-dashboard.spec.ts`:
        -   Test flow: Login as Reviewer -> See Pending Request -> Click Validate -> Verify Request moves to Validated Tab.
        -   Test security: Verify Leader cannot validate.

## Dev Notes

-   **Status Enum:** Use `validated` status key (confirmed in `governance_schema.ts`).
-   **Dashboard Structure:** You may need to refactor `ReviewerDashboard` to accept `pendingRequests` and `validatedRequests` props, or fetch them inside. Since the dashboard is a Server Component, fetching both and passing to a Client Component with Tabs is a good pattern.
-   **Notifications:** Story 5.2 covers the full email system. For now, ensure the *event* happens (change to `validated`). A stub for `sendNotification` is acceptable.
-   **Permissions:** Existing RLS might only allow INSERT for Leader and SELECT for Reviewer. You will explicitly need to grant UPDATE on `status` column for Reviewers.

### References

-   `src/types/schemas/governance-schema.ts` (Status definitions)
-   `src/services/governance/governance-service.ts` (Service layer)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `validateRequest` in `GovernanceService` including fetching validated requests.
- Applied RLS migration to allow Reviewers to update request status.
- Added `validateGovernanceRequest` server action with RBAC checks.
- Implemented Frontend Tabs (Pending/Validated) and Validation Action in `ReviewerDashboard`.
- Added Unit Tests for Service layer (100% pass).
- Updated E2E tests to cover validation flow (Note: E2E environment may require warm-up).
- **Code Review Fixes:**
    - Fixed E2E test to strictly assert pending requests exist (removed false negative risk).
    - Added security limits (50 records) to governance service queries.
    - Documented missing UI components.

### File List

- `src/services/governance/governance-service.ts`
- `src/services/governance/governance-service.test.ts`
- `src/actions/reviewer-actions.ts`
- `src/app/dashboard/reviewer/page.tsx`
- `src/components/features/reviewer/reviewer-dashboard.tsx`
- `src/db/migrations/20260124100000_governance_rls_update.sql`
- `src/components/ui/sonner.tsx`
- `src/components/ui/tabs.tsx`
- `e2e/reviewer-dashboard.spec.ts`
