# Story 2.3: Mandatory Document Upload ("The Guardrail")

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a System,
I want to block progress until mandatory documents are uploaded,
So that Reviewers never waste time on projects that haven't provided the necessary evidence ("No read, no meet").

## Acceptance Criteria

1.  **Block Progress ("The Guardrail")**
    *   **Given** a request requiring a "DAT Sheet" (based on Topic selection from Story 2.2)
    *   **When** the Project Leader attempts to click "Next" without uploading it
    *   **Then** the "Next" button is disabled
    *   **And** a message / visual indicator "Please upload the DAT Sheet to proceed" is displayed

2.  **Document Upload**
    *   **Given** the upload step (Step 3)
    *   **When** the user uploads a valid file (PDF/Docx, max 10MB)
    *   **Then** the file is stored in secure Supabase Storage (`governance-proofs` bucket)
    *   **And** a record is created in the database linking the file to the request
    *   **And** the UI marks the requirement as "Complete" (Green Check)
    *   **And** the "Next" button becomes enabled if all requirements are met

3.  **Persistence & Validation**
    *   **Given** a page refresh
    *   **Then** the uploaded documents persist and the step remains "Complete"
    *   **Given** a user removes a mandatory document
    *   **Then** the step reverts to "Incomplete" and blocks progress

## Tasks / Subtasks

- [ ] **Database & Storage (Supabase)**
    - [ ] **Storage:** Create public/private bucket `governance-proofs`.
        -   Policy: Authenticated users can upload; `Project Leader` can delete their own; `Reviewer` can read.
    - [ ] **Database:** Create `request_attachments` table.
        -   `id` (uuid, PK)
        -   `request_id` (fk to `governance_requests`)
        -   `document_type` (enum/text: 'dat_sheet', 'architecture_diagram', 'security_signoff', etc.)
        -   `storage_path` (text)
        -   `filename` (text)
        -   `uploaded_at` (timestamptz)
    - [ ] **RLS Policies:** Ensure users can only attach to requests they own.

- [ ] **Domain & Logic (Backend)**
    -   [ ] Update `src/services/governance/governance-rules.ts` (created in 2.2) to include helper `getMissingProofs(request: GovernanceRequest, attachments: Attachment[])`.
    -   [ ] Define `Attachment` types and Zod schemas in `src/types/schemas/governance-schema.ts`.

- [ ] **Server Actions**
    -   [ ] Create `uploadAttachmentAction(requestId, formData)` OR secure upload flow (Signed URL vs Client Direct).
        -   *Decision:* Use Supabase Client SDK for direct upload to Storage (better UX/Progress), then call Server Action `recordAttachment(requestId, metadata)` to update DB.
    -   [ ] Create `deleteAttachmentAction(attachmentId)`.
    -   [ ] Create `getAttachmentsAction(requestId)`.

- [ ] **Frontend - Components**
    -   [ ] Create `src/components/features/governance-wizard/step-3-documents.tsx`.
    -   [ ] Build `FileUploader` component (Drag & drop zone).
    -   [ ] Build `RequirementChecklist` component (Visualization of "The Guardrail").
        -   Connect to `TOPIC_RULES` from 2.2 to render dynamic list.
    -   [ ] Implement Blocking Logic: `isStepValid = requiredProofs.every(p => attachments.some(a => a.type === p))`.

- [ ] **Integration & E2E Testing**
    -   [ ] Update `e2e/governance-wizard.spec.ts`.
        -   Mock Storage upload (or use test bucket).
        -   Verify "Next" button is disabled initially.
        -   Perform upload.
        -   Verify "Next" button becomes enabled.

## Dev Notes

### Architecture Patterns
-   **Storage Pattern:** Use `@supabase/ssr` client in the component for the actual file upload to avoid passing binary data through Server Actions (Next.js limit).
-   **Security:** Ensure RLS policies on the `storage.objects` table (Supabase Storage) match the business rules (Owner only).
-   **Validation:** File validation (size, type) should happen on Client (UX) AND Storage Policy (Security).

### Project Context
-   **Previous Story (2.2):** Established `TOPIC_RULES` in `governance-rules.ts`. Reuse this! Do not hardcode requirements in the UI.
-   **Refactoring:** Step 3 page placeholder exists (from 2.2). Implement it fully now.

### UX Guidelines
-   **"The Guided Check":** Don't just show an error. Show the list of requirements with status icons (Empty Circle -> Spinner -> Green Check).
-   **Feedback:** Use Toast for upload success/failure.

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

## File List
- src/services/governance/governance-rules.ts
- src/components/features/governance-wizard/step-3-documents.tsx
- src/components/features/governance-wizard/file-uploader.tsx
- src/components/ui/toaster.tsx
- src/app/governance/wizard/[id]/step-3/page.tsx
- src/actions/governance-actions.ts
- src/types/schemas/governance-schema.ts
- supabase/migrations/20260123100000_add_request_attachments.sql
