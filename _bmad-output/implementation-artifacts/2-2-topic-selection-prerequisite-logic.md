# Story 2.2: Topic Selection & Prerequisite Logic

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Project Leader,
I want to select the "Topic Type" for my review,
So that I know exactly what documents are required for that specific governance gate.

## Acceptance Criteria

1. **Topic Selection & Dynamic Proofs**
   - **Given** the Wizard at Step 2
   - **When** I select "Standard Review"
   - **Then** the "Required Proofs" list updates to show "DAT Sheet" and "Architecture Diagram"
   - **And** the estimated slot duration is set to 30 minutes

   - **Given** the Wizard at Step 2
   - **When** I select "Strategic Review"
   - **Then** the "Required Proofs" list includes "DAT Sheet", "Security Sign-off", and "FinOps Approval"
   - **And** the estimated slot duration is set to 60 minutes

2. **Persistence**
   - **Given** I have selected a topic
   - **When** I click "Next" (or auto-save)
   - **Then** the `governance_requests` record is updated with:
     - `topic`: 'standard' | 'strategic'
     - `estimated_duration`: 30 | 60

## Tasks / Subtasks

- [x] **Database & Backend**
  - [x] Create migration: Add `topic` and `estimated_duration` columns to `governance_requests` table.
    - `topic`: text or enum (standard, strategic) - nullable initially.
    - `estimated_duration`: integer (minutes) - nullable initially.
  - [x] Update `GovernanceRequest` TypeScript interface and Zod schema.
  - [x] Run migration and generate types.

- [x] **Domain & Logic**
  - [x] Define `GovernanceTopic` constants/enum.
  - [x] Define "Business Rules" map:
    ```typescript
    const TOPIC_RULES = {
      standard: { duration: 30, proofs: ['dat_sheet', 'architecture_diagram'] },
      strategic: { duration: 60, proofs: ['dat_sheet', 'security_signoff', 'finops_approval'] }
    }
    ```
  - [x] Update `createGovernanceRequestSchema` or create `updateGovernanceRequestSchema` to include topic selection validation.

- [x] **Server Actions**
  - [x] Create `updateRequestTopicAction(requestId, topic)` or generic `updateRequest`.
  - [x] Validate input with Zod.
  - [x] Logic: Look up duration based on topic from `TOPIC_RULES` (Server-side source of truth) and save both topic and duration to DB. **Do not trust client duration.**

- [x] **Frontend - Components**
  - [x] Create `src/components/features/governance-wizard/step-2-topic-selection.tsx`.
  - [x] Implement "Topic Card" UI (Selectable cards for Standard/Strategic).
  - [x] Implement "Required Proofs" preview panel (Updates dynamically based on selection).
  - [x] Connect to `useWizardStore` or manage local state + Server Action on submit.

- [x] **Integration & E2E Testing**
  - [x] Update `e2e/governance-wizard.spec.ts` to include Step 2 selection.
    - Create request (Step 1).
    - Select "Standard".
    - Verify "DAT Sheet" is visible.
    - Select "Strategic".
    - Verify "FinOps Approval" is visible.
    - Click Next.
    - Verify DB update (optional) or navigation to Step 3.

## Dev Notes

### Architecture Patterns
- **Business Logic Source of Truth:** The mapping between `Topic -> Duration/Proofs` should ideally live in `src/services/governance/governance-rules.ts` or similar, so it can be shared/imported.
- **Security:** The client sends the `topic`. The *Server Action* calculates the `duration` based on the trusted rule. Never accept `duration` from the client.

### Project Context
- **Previous Story:** `2.1` created the wizard shell. This story injects Step 2 into that shell.
- **UX:** Follow "The Guided Check" model. Topic selection should feel like a major choice, not just a dropdown. Use Cards.

### File Structure
- `src/services/governance/governance-rules.ts` (NEW: Shared constants)
- `src/components/features/governance-wizard/step-2-topic-selection.tsx` (NEW)

## File List
- src/services/governance/governance-rules.ts
- src/components/features/governance-wizard/step-2-topic-selection.tsx
- src/app/governance/wizard/[id]/step-2/page.tsx
- src/app/governance/wizard/[id]/step-3/page.tsx
- src/services/governance/governance-service.ts
- src/actions/governance-actions.ts
- src/types/schemas/governance-schema.ts
- supabase/migrations/20260122100000_add_topic_to_requests.sql
- e2e/governance-wizard.spec.ts

## Senior Developer Review (AI)

**Review Date:** 2026-01-23
**Reviewer:** Antigenic AI

### Findigs
- **Critical Issue Fixed:** The form submission in `step-2-topic-selection.tsx` relied on hidden radio inputs that were not syncing correctly with the custom UI state. Fixed by using a single hidden input field.
- **Refactoring:** The `TOPIC_DETAILS` constant in the frontend component was duplicating business rules (duration, proofs) already defined in `governance-rules.ts`. Refactored to import `TOPIC_RULES` and merge it with UI-specific properties (icons, labels), adhering to DRY principles.
- **E2E Test Unblocked:** The E2E test asserted navigation to `/step-3`, which did not exist. Created a placeholder `step-3/page.tsx` to satisfy the test requirement.

### Outcome
**Approved.** All identified issues have been resolved. The implementation now adheres to the specified architecture patterns and passes verification. The story is marked as **DONE**.
