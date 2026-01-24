# Story 3.3: Governance Rejection ("The Guardrail")

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Reviewer,
I want to reject a request that is missing info or immature,
So that the Project Leader knows exactly what to fix.

## Acceptance Criteria

1.  **Rejection Action & Modal**
    *   **Given** a pending request on the Reviewer Dashboard
    *   **When** I click the "Reject" action (e.g., Red X button)
    *   **Then** a modal/dialog appears asking for "Rejection Reason" (Mandatory, Min 10 chars)
    *   **And** if I cancel, nothing happens.

2.  **Processed Rejection**
    *   **Given** I have entered a valid rejection reason
    *   **When** I confirm the rejection
    *   **Then** the request status changes to `draft` (returning control to Leader)
    *   **And** the `rejection_reason` is saved to the database
    *   **And** the request is removed from the "Pending" list
    *   **And** the Project Leader receives a notification "Governance Rejected: [Reason]"
        *   *(Dev Note: Stub notification if full system not ready, but ensure event is fired)*

3.  **Role Enforcement**
    *   **Given** a non-Reviewer
    *   **When** they attempt to reject a request
    *   **Then** the action is denied (403).

## Tasks / Subtasks

- [ ] **Database & Schema**
    - [ ] Create migration: Add `rejection_reason` (text, nullable) to `governance_requests` table
    - [ ] Update `src/types/schemas/governance-schema.ts`:
        - [ ] Add `rejectGovernanceRequestSchema` (requires id + reason)
        - [ ] Update `GovernanceRequest` type definition if needed
    - [ ] **RLS:** Ensure `Reviewer` role has `UPDATE` permission on `rejection_reason` column.

- [ ] **Data Layer & Services**
    - [ ] Update `src/services/governance/governance-service.ts`:
        - [ ] Add `rejectRequest(id, reason, userId)` method
        - [ ] Ensure it verifies current status is `pending_review` before rejecting

- [ ] **Server Actions**
    - [ ] Create/Update `src/actions/reviewer-actions.ts`:
        - [ ] Add `rejectGovernanceRequest` action
        - [ ] Ensure Zod validation and RBAC checks

- [ ] **Frontend - Components**
    - [ ] Create `RejectionModal` component (using Shadcn Dialog + Textarea)
    - [ ] Update `ReviewerDashboard` (or `ReviewerRequestRow`):
        - [ ] Integrate "Reject" button with the Modal
        - [ ] Handle optimistic UI update (remove from Pending list)

- [ ] **Testing**
    - [ ] **Unit:** Test `rejectRequest` logic (status transition, reason persistence)
    - [ ] **E2E:** Update `e2e/reviewer-dashboard.spec.ts`:
        - [ ] Flow: Reviewer clicks reject -> Enters reason -> Confirms -> Request moves to Draft/Disappears.
        - [ ] Verify persistence: Check DB or Leader view (if accessible in test) for rejection reason.

## Dev Notes

-   **State Transition:** Rejection moves status back to `draft`. This allows the Leader to edit and resubmit (Story 2.4 / 2.1).
-   **Migration:** `rejection_reason` should be nullable because `draft` or `validated` requests won't have it (or it might be cleared upon resubmission - *Decision: Keep history? For now just overwrite or keep last reason. Audit log (Story 5.3) will keep history.*)
-   **UI Pattern:** The "Zero-Click" dashboard (Story 3.1/3.2) was for fast validation. Rejection requires *input*, so it breaks the zero-click flow, which is intentional (The Guardrail).
-   **Notifications:** As with 3.2, ensure the system is *ready* to send notifications (e.g. `notification-service.ts` stub), even if email integration isn't live.

### Technical Constraints (Architecture)

-   **Action Pattern:** `src/actions` must NOT call DB directly. Call `governance-service.ts`.
-   **Validation:** Use `z.string().min(10)` for rejection reason to prevent "Fix it" type vague feedback.

### Project Structure Notes

-   `src/components/features/reviewer/rejection-modal.tsx` (New component recommended)

### References

-   `src/types/schemas/governance-schema.ts`
-   `src/services/governance/governance-service.ts`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
