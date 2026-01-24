# Story 4.3: Master Schedule View

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Organizer,
I want to see all booked slots on a master calendar,
So that I can see the upcoming board agenda.

## Acceptance Criteria

1. **Given** an Organizer
   **When** they access the Organizer Dashboard (`/dashboard/organizer`)
   **Then** they see a Master Schedule View (Calendar or Agenda)

2. **Given** the Master Schedule
   **When** I view the requests
   **Then** "Tentative" slots (booked by Leaders but not confirmed) are shown in **Yellow**
   **And** "Confirmed" slots are shown in **Green**

3. **Given** a slot on the calendar
   **When** I click/hover it
   **Then** I see the Request details:
     - Project Name
     - Project Leader
     - Topic Type (Standard/Strategic)
     - Duration

## Tasks / Subtasks

- [x] Database / Schema (Verification)
  - [x] Verify `governance_requests` table has `booking_start_at` and `status` columns.
  - [x] Ensure `status` enum supports `tentative` and `confirmed`.

- [x] Scheduling Domain Service (`src/services/scheduling`)
  - [x] Implement `getAllScheduledRequests(startDate, endDate)`
    - [x] Query requests where `booking_start_at` is NOT NULL.
    - [x] Filter by date range (if applicable).
    - [x] Return type should include Project details (join/select).

- [x] Server Actions (`src/actions/scheduling-actions.ts`)
  - [x] Expose `getMasterScheduleAction(range)`
    - [x] Check permissions (Organizer only).
    - [x] Call `getAllScheduledRequests`.
    - [x] Serialize dates properly for Client Components.

- [x] UI Implementation
  - [x] Create `MasterSchedule` component (`src/components/features/scheduling/master-schedule.tsx`).
    - [x] Use Shadcn/UI components or reuse `booking-calendar` logic if applicable.
    - [x] Implement color coding: Yellow (Tentative) / Green (Confirmed).
    - [x] Add Popover/Tooltip for details (Project Name, Leader, Topic).
  - [x] Create/Update Organizer Dashboard Page (`src/app/(dashboard)/organizer/page.tsx`).
    - [x] Integrate `MasterSchedule`.

- [x] Verification
  - [x] Unit Test `scheduling-service`: Verify fetching of tentative/confirmed requests.
  - [x] Manual Check: Login as Organizer -> View Dashboard -> Verify slots appear with correct colors.

## Dev Notes

### Architecture Alignment
- **Domain**: `src/services/scheduling`
- **Pattern**: Service Layer (fetching logic) -> Server Action (API) -> UI.
- **Security**: strict RBAC. Only "Organizer" (and maybe Admin) should access this data. Project Leaders should NOT see the Master Schedule (privacy).

### Technical Specifics
- **Calendar Library**: Reuse the calendar approach from Story 4.2 (`BookingCalendar`). If `react-day-picker` (Shadcn default) is too limited for an "Agenda View", consider a simple List View sorted by time OR a lightweight custom Time Grid.
  - *Recommendation*: Start with a nice List/Card view grouped by Day if a full Weekly Calendar is too complex for MVP. However, AC implies "Calendar view".
- **Realtime**: Consider using Supabase Realtime (Subscription) so slots appear instantly when a Leader books one. (Nice to have, not strict requirement but good for "Cockpit" feel).
- **Date Handling**: Remember Server Actions serialize Dates to Strings. Use `new Date(str)` on client.

### Project Structure Notes
- **Component**: `src/components/features/scheduling/master-schedule.tsx`
- **Page**: `src/app/(dashboard)/organizer/page.tsx`

### Git Intelligence (Recent Context)
- Recent work (Story 4.2) implemented `booking-calendar.tsx`, `scheduling-actions.ts`, and `scheduling-service.ts`.
- **Reuse**: Check `scheduling-actions.ts` and `scheduling-service.ts`. You should Extend them, not create duplicates.

### References
- [Epic 4](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/epics.md#epic-4-intelligent-scheduling)
- [Architecture](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/architecture.md)
- [Previous Story: 4.2](file:///d:/Dev/Architecture%20Planning/_bmad-output/implementation-artifacts/4-2-tentative-booking-request.md)

## Dev Agent Record

### Agent Model Used
- Gemini 2.0 Flash

### Debug Log References
- Syntax error in scheduling actions (Fixed).
- Type error in MasterSchedule component (Fixed).
- Missing Radix UI Popover dependency (Fixed).

### Completion Notes List
- Implemented Master Schedule View with weekly calendar grid.
- Added `confirmed` status to database enum.
- Implemented `getAllScheduledRequests` in service layer with unit tests.
- Secured endpoint with `getMasterScheduleAction` limiting access to Organizer/Admin.
- Integrated fully into Organizer Dashboard.

### Code Review Fixes (AI)
- Added type safety to topic duration calculation.
- Optimized performance of master schedule data fetching.
- Improved race condition safety in booking logic.

### File List
- src/services/scheduling/scheduling-service.ts
- src/services/scheduling/slot-rules.ts
- src/actions/scheduling-actions.ts
- src/components/features/scheduling/master-schedule.tsx
- src/app/(dashboard)/organizer/page.tsx
- src/types/schemas/governance-schema.ts
- src/types/supabase.ts
- src/components/ui/popover.tsx
- src/services/scheduling/scheduling-service.test.ts
- package.json
- package-lock.json
