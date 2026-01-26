# Story 4.4: Schedule Confirmation & Export

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Organizer,
I want to confirm tentative slots and export the agenda,
So that the meeting invites can be sent out.

## Acceptance Criteria

1. **Given** a "Tentative" slot on the schedule
   **When** I click "Confirm"
   **Then** the status changes to "Confirmed"
   **And** an email notification is sent to the Project Leader (Stubbed until Epic 5)

2. **Given** a set of confirmed slots for a specific date
   **When** I click "Export Agenda"
   **Then** a summary (CSV or Text) is generated listing the schedule for that day (Time, Project, Leader, Topic)

## Tasks / Subtasks

- [ ] Domain Services (`src/services/scheduling`)
  - [x] Update `SchedulingService` with `confirmSlot(requestId: string)`
    - [x] Update status to 'confirmed' in DB.
    - [x] Call `NotificationService.sendConfirmationEmail` (Stub).
    - [x] Call `AuditService.logAction` (Stub).
  - [x] Implement `AgendaExportService` (`src/services/scheduling/agenda-exporter.ts`)
    - [x] `generateDailyAgenda(date: Date): Promise<string>`
    - [x] Fetch confirmed slots for date.
    - [x] Format as simple CSV/Text: "Time, Project, Leader, Topic".

- [x] Infrastructure Stubs (Preparation for Epic 5)
  - [x] Create `src/services/notifications/notification-service.ts`
    - [x] Stub `sendConfirmation(email: string, details: object)` -> Console Log "TODO: Epic 5".
  - [x] Create `src/services/audit/audit-service.ts`
    - [x] Stub `log(action: string, payload: object)` -> Console Log "TODO: Epic 5".

- [x] Server Actions (`src/actions/scheduling-actions.ts`)
  - [x] `confirmSlotAction(requestId)`
    - [x] Verify Organizer role.
    - [x] Call `SchedulingService.confirmSlot`.
    - [x] Revalidate path.
  - [x] `exportAgendaAction(dateString)`
    - [x] Verify Organizer role.
    - [x] Call `AgendaExportService.generateDailyAgenda`.
    - [x] Return string content.

- [ ] UI Implementation (`src/components/features/scheduling`)
  - [x] Update `MasterSchedule` (or Slot Card)
    - [x] Add "Confirm" button for Tentative slots.
    - [x] Connect to `confirmSlotAction`.
    - [x] Add Optimistic UI (turn green immediately).
  - [x] Create `AgendaExport` component
    - [x] Button "Export Agenda".
    - [x] Date picker (or use current view date).
    - [x] Handle download/copy-to-clipboard of returned text.
  - [x] Update `OrganizerDashboard`
    - [x] Add `AgendaExport` toolbar.

- [x] Verification
  - [x] Unit Test `AgendaExportService`: Verify CSV format output.
  - [x] Integration Test: Confirm slot -> Verify DB status 'confirmed'.
  - [x] Manual: Click Confirm -> Check console for "Email Sent" stub -> refreshing page shows Green slot.

## Dev Notes

### Architecture Alignment
- **Service Layer**: Keep 'Export' logic in `services/scheduling/agenda-exporter.ts` to keep `SchedulingService` clean.
- **Stubs**: We MUST create the structure for Notifications/Audit now (`services/notifications`, `services/audit`) even if the implementation is just `console.log`. This prevents "logic leaking" into components later.
- **CSV Handling**: For simple CSV, string concatenation is fine. No need for `papaparse` or heavy libs unless complexity grows.

### Technical Specifics
- **Export UX**: Browser can modify `window.location` to a `blob:` url or simple `navigator.clipboard.writeText` for the text content.
  - *Recommendation*: Return string from Server Action, then Client Component triggers file download (`blob`).
- **Confirmation Logic**: Ensure `booking_start_at` is set before allowing confirmation.

### Project Structure Notes
- **New Directory**: `src/services/notifications` (New)
- **New Directory**: `src/services/audit` (New)
- **New File**: `src/services/scheduling/agenda-exporter.ts`

### Git Intelligence
- **Previous Work**: `scheduling-actions.ts` already has auth checks. Reuse `getServiceRole` or similar helpers.
- **Pattern**: Follow `result-tuple` pattern for the new actions.

### References
- [Epic 4](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/epics.md#epic-4-intelligent-scheduling)
- [Architecture](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `confirmSlot` in `SchedulingService` with dependency stubs for Notification/Audit.
- Created `AgendaExportService` for CSV generation.
- Implemented Server Actions with Authorization checks.
- Created `AgendaExport` UI component and updated `MasterSchedule` with confirmation workflow.
- Added `confirmed` status to DB enum via migration.
- Fully tested services and actions.
- [Code Review Fix] Corrected Audit Log attribution in confirmSlot.
- [Code Review Fix] Improved CSV export robustness.
- [Code Review Fix] Added missing docs.

### File List
- src/services/scheduling/scheduling-service.ts
- src/services/auth/auth-service.test.ts
- src/services/notifications/notification-service.ts
- src/services/audit/audit-service.ts
- src/services/scheduling/agenda-exporter.ts
- src/actions/scheduling-actions.ts
- src/components/features/scheduling/master-schedule.tsx
- src/components/features/scheduling/agenda-export.tsx
- src/app/dashboard/organizer/page.tsx
- supabase/migrations/20260126100000_add_confirmed_status.sql
- src/services/scheduling/scheduling-service.test.ts
- src/services/scheduling/agenda-exporter.test.ts
- src/actions/scheduling-actions.test.ts
