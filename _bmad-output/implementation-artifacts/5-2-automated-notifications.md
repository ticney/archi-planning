# Story 5.2: Automated Notifications

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a System,
I want to send email notifications for critical status changes,
So that users (Leaders, Reviewers) act quickly without constantly checking the dashboard.

## Acceptance Criteria

1. **Given** a request is "Rejected"
   **When** the Reviewer submits the rejection
   **Then** an email is sent to the Project Leader with the rejection reason
   **And** the email includes a direct link to the request

2. **Given** a request is "Validated"
   **When** the Reviewer confirms validation
   **Then** an email is sent to the Project Leader saying "Ready to Book" with a link to the booking page

3. **Given** a scheduled slot is "Confirmed"
   **When** the Organizer confirms the slot
   **Then** a calendar invite (ICS file) is sent/attached to the Project Leader and Board Members

## Tasks / Subtasks

- [x] **Infrastructure Setup**
  - [x] Install `resend` SDK (`npm install resend`).
  - [x] Install `ics` package for calendar file generation (`npm install ics`).
  - [x] Add `RESEND_API_KEY` to `.env.local` and `src/lib/env.ts` (if strict env validation exists).
  - [x] Create `src/lib/email-client.ts` (Resend client initialization).

- [x] **Notification Service** (`src/services/notification`)
  - [x] Create `src/services/notification/email-templates.ts`:
    - Functions to generate HTML strings for Rejection, Validation, and Confirmation emails.
  - [x] Create `src/services/notification/notification-service.ts`:
    - `sendRejectionEmail(to: string, projectTitle: string, reason: string, link: string)`
    - `sendReadyToBookEmail(to: string, projectTitle: string, link: string)`
    - `sendConfirmationEmail(to: string, projectTitle: string, slotDate: Date, duration: number)` (Generates ICS and attaches it).

- [x] **Integration Points**
  - [x] Update `src/services/governance/governance-service.ts`:
    - In `rejectRequest` (or equivalent status change logic), call `sendRejectionEmail`.
    - In `validateRequest`, call `sendReadyToBookEmail`.
  - [x] Update `src/services/scheduling/scheduling-service.ts` (or `organizer-service.ts` based on implementation):
    - In `confirmSlot`, call `sendConfirmationEmail`.

- [x] **Verification**
  - [x] Write Unit Tests for `NotificationService` (mocking Resend).
  - [x] Verify ICS generation creates valid calendar files (Timezone handling).
  - [x] Manual test: Verify emails land (using Resend logs or temporary email).

## Dev Notes

### Architecture Alignment
- **Service Layer Pattern**: Notifications logic belongs in `src/services/notification/`. It should NOT be inline in Actions or UI.
- **Async/Non-blocking**: Sending emails should ideally not block the user response, but for MVP it's acceptable to await it to ensure delivery success before returning "Success" to UI.
  - *Recommendation*: Use `await` for critical notifications to ensure they don't fail silently.
- **Environment Variables**: Ensure `RESEND_API_KEY` is documented.

### Technical Specifications
- **Library**: `resend` (Standard for Vercel/Next.js).
- **Calendar Files**: `ics` package is robust and simple.
- **Templating**: Keep it simple. Use template literals in `email-templates.ts` for strictly functional emails. No need for heavy React Email setup unless requested later.

### Git Intelligence
- **New Files**: `src/services/notification/*`.
- **Modified Files**: `src/services/governance/governance-service.ts`, `src/services/scheduling/*`.

### References
- [Epic 5](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/epics.md#epic-5-platform-administration--operations)
- [Architecture](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- [NEW] src/lib/env.ts
- [NEW] src/services/notification/email-templates.ts
- [NEW] src/services/notification/notification-service.ts
- [NEW] src/services/notification/notification-service.test.ts
- [NEW] src/lib/email-client.ts
- [MODIFY] src/services/governance/governance-service.ts
- [MODIFY] src/services/governance/governance-service.test.ts
- [MODIFY] src/services/scheduling/scheduling-service.ts
