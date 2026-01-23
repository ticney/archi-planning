# Story 2.4: Request Submission

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Project Leader,
I want to submit my completed request,
So that it can be reviewed and validated by an Architect.

## Acceptance Criteria

1.  **Submission Logic ("The Gate")**
    *   **Given** a fully completed Wizard (all steps green)
    *   **When** I click "Submit Request"
    *   **Then** the System validates server-side that all mandatory proofs are present (Double Check)
    *   **And** the request status changes from "Draft" to "Pending Review"
    *   **And** the `submitted_at` timestamp is recorded

2.  **Dashboard Redirection**
    *   **Given** a successful submission
    *   **Then** I see a "Success" confirmation (Toast)
    *   **And** I am automatically redirected to my Project Dashboard
    *   **And** I see the request in the "Pending" list/status

3.  **Validation Failures**
    *   **Given** a request where a document was deleted in a separate tab
    *   **When** I try to submit
    *   **Then** the System rejects the submission
    *   **And** displays an error "Missing mandatory documents: [List]"

## Tasks / Subtasks

- [ ] **Database & Schema**
    - [ ] **Schema:** Ensure `governance_requests` table has `submitted_at` (timestamptz) column.
        -   *Note:* `status` enum likely already exists or needs update: ('draft', 'pending_review', 'validated', 'rejected').
    - [ ] **RLS:** Ensure `Project Leader` can update status only from `Draft` -> `Pending Review`.

- [ ] **Domain & Logic (Backend)**
    - [ ] Update `src/services/governance/governance-service.ts`:
        -   Implement `submitRequest(requestId: string): Promise<void>`.
        -   **Logic:**
            -   Fetch request + attachments.
            -   Run `getMissingProofs()`. If missing > 0, throw Error.
            -   Update `status` = 'pending_review', `submitted_at` = now().

- [ ] **Server Actions**
    - [ ] Update `src/actions/governance-actions.ts`:
        -   Implement `submitRequestAction(requestId: string)`.
        -   Handle success/error.
        -   On success: `redirect('/dashboard/project/[id]')`.

- [ ] **Frontend - Wizard Flow**
    - [ ] Create `src/components/features/governance-wizard/step-4-review.tsx` (Summary View).
        -   Show read-only summary of Request Details + Uploaded Files.
        -   "Submit Request" button (primary).
    - [ ] Update `src/app/governance/wizard/[id]/step-4/page.tsx` to use the component.
    - [ ] Update `wizard-shell.tsx` (or navigation) to include Step 4.

- [ ] **Integration & E2E Testing**
    - [ ] Update `e2e/governance-wizard.spec.ts`.
        -   Complete all previous steps (fill form, select topic, upload file).
        -   Navigate to Step 4.
        -   Click Submit.
        -   Verify redirection to Dashboard.
        -   Verify status is "Pending".

## Dev Notes

### Architecture Patterns
-   **Server-Side Validation:** Never trust the Frontend "Next" button. The `submitRequest` service method MUST re-run `getMissingProofs` before allowing status change.
-   **Redirects:** Use `redirect()` from `next/navigation` within the Server Action for successful submission.
-   **State Machine:** This is the first critical state transition. Ensure explicitly that only `draft` -> `pending` is allowed here.

### Project Context
-   **Previous Stories:**
    -   `2.2` defined `TOPIC_RULES`.
    -   `2.3` implemented `getMissingProofs` helper.
    -   `governance-service.ts` and `governance-actions.ts` are the home for this logic.

### UX Guidelines
-   **"The Moment of Truth":** The Submit button should be prominent.
-   **Feedback:** If submission fails (e.g. backend validation), show a specific Toast error explaining WHY (e.g., "DAT Sheet missing").

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

## File List
- src/services/governance/governance-service.ts
- src/actions/governance-actions.ts
- src/app/governance/wizard/[id]/step-4/page.tsx
- src/components/features/governance-wizard/step-4-review.tsx
- e2e/governance-wizard.spec.ts
