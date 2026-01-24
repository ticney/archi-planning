# Story 4.1: Elastic Slot Duration Logic (Backend Rule)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a System,
I want to automatically calculate the required slot duration based on the Topic Type,
So that we schedule appropriate time for discussion without manual guesswork.

## Acceptance Criteria

1. **Given** a governance request
   **When** the Topic Type is "Standard"
   **Then** the calculated slot duration is 30 minutes

2. **Given** a governance request
   **When** the Topic Type is "Strategic"
   **Then** the calculated slot duration is 60 minutes

3. **Given** a request is created (or topic updated)
   **Then** this duration is stored as a fixed property of the request

## Tasks / Subtasks

- [x] Initialize Scheduling Domain
  - [x] Create `src/services/scheduling/` directory
  - [x] Implement `src/services/scheduling/slot-rules.ts` to house the duration logic (30 vs 60 min)
- [x] Refactor Governance Rules
  - [x] Remove `duration` hardcoding from `TOPIC_RULES` in `src/services/governance/governance-rules.ts` (or keep as deprecated/referenced if needed, but preference is to separate concerns)
  - [x] Ensure `GovernanceService.updateTopic` imports duration logic from `scheduling` domain
- [x] Verification
  - [x] Add unit tests for `slot-rules.ts`
  - [x] Update/Verify `governance-service.test.ts` to ensure duration is still correctly updated using the new source of truth

## Dev Notes

### Architecture Alignment
- **Architecture Reference**: "Elastic Slots: `src/services/scheduling/`" (Architecture.md)
- Currently, logic exists in `governance-rules.ts`. This story requires **refactoring** to move the scheduling/time concern into the new `scheduling` domain, cleaning up the boundaries between "What is required (Governance)" and "How long it takes (Scheduling)".

### Implementation Guide
- **Source of Truth**: The `governance_requests` table has an `estimated_duration` column. This is correct.
- **Trigger Point**: The duration is set/updated when the Topic is selected via `GovernanceService.updateTopic`.
- **Logic Location**: `src/services/scheduling` should own the "Time" domain knowledge.

### Project Structure Notes
- **New Directory**: `src/services/scheduling`
- **Pattern**: Functional definitions preferred for rules (e.g., `calculateDuration(topic: GovernanceTopic): number`).

### References
- [Architecture](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/architecture.md)
- [Epic 4](file:///d:/Dev/Architecture%20Planning/_bmad-output/planning-artifacts/epics.md#epic-4-intelligent-scheduling)

## Dev Agent Record

### Agent Model Used
Gemini 1.5 Pro

### Code Review (Auto-Fixed)
- **Logic Hole Fixed**: Added status check to `updateTopic`. Now only allows updates when status is `draft`.
- **Clean Code**: encapsulated `TOPIC_DURATIONS` and added JSDoc to `calculateSlotDuration`.
- **Status Update**: All findings resolved. Moving to Done.

### Debug Log References
- Tests initially failed as expected (TDD Red).
- `governance-service.test.ts` failed due to missing mock config for `.single()`, fixed by adding `mockResolvedValueOnce`.

### Completion Notes List
- Implemented `calculateSlotDuration` in new `scheduling` domain.
- Refactored `TOPIC_RULES` to remove `duration` property.
- Updated `GovernanceService.updateTopic` to use the new logic.
- Added unit tests for new logic and updated service verification tests.

### File List
- src/services/scheduling/slot-rules.ts
- src/services/scheduling/slot-rules.test.ts
- src/services/governance/governance-rules.ts
- src/services/governance/governance-service.ts
- src/services/governance/governance-service.test.ts
