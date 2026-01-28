# Sprint Change Proposal: Global Navigation

**Date:** 2026-01-28
**Trigger:** Missing User Interface Element (Navigation)
**Scope:** Moderate

## 1. Issue Summary
**Problem:** The current application lacks a global navigation mechanism. Users are stuck on the landing page or dashboard without a way to switch between "Project Leader", "Reviewer", and "Admin" contexts.
**Discovery:** Identified during visual inspection and user feedback.
**Impact:** Critical usability blocker. Users cannot perform multi-role tasks or navigate the application hierarchy.

## 2. Impact Analysis
- **Epics:** Epic 1 (Identity & Foundation) requires an addition. Other Epics (2, 3, 4, 5) are functionally dependent on this for access but do not require internal changes.
- **Artifacts:**
    - `epics.md`: Needs a new User Story for the Navigation Component.
    - `ux-design-specification.md`: Already specifies the design ("Collapsed Icon Rail"), so no change needed here.
    - `architecture.md`: Already specifies `layout.tsx`, but implementation needs to ensure it includes the sidebar logic.
- **Code:** Needs implementation of a `Sidebar` or `NavigationRail` component and update to the root `layout.tsx`.

## 3. Recommended Approach
**Strategy:** Direct Adjustment
**Rationale:** This is a missing foundational requirement that was specified in UX but missed in Stories. It can be added as a Story to Epic 1 without disrupting the overall sprint timeline significantly (estimate: 0.5 days).

## 4. Detailed Change Proposals

### Artifact: `epics.md`
**Change:** Add new Story 1.4 to Epic 1.

```markdown
### Story 1.4: Global Navigation & Layout
As a User,
I want a persistent navigation rail/bar,
So that I can switch between contexts (Project, Review, Schedule) without losing my place.

**Acceptance Criteria:**
**Given** a logged-in user
**When** they view any page
**Then** the "Navigation Rail" is visible on the left (Desktop)
**And** it contains links to:
  - Dashboard (Home)
  - Projects (Leader)
  - Reviews (Reviewer)
  - Schedule (Organizer)
  - Settings (Admin)
**And** links are visible/hidden based on RBAC (e.g. Leader doesn't see Admin)
**And** the current active route is visually highlighted

**Given** a mobile/tablet user
**Then** the navigation collapses to a responsive menu (Hamburger)
```

## 5. Implementation Handoff
- **Role:** Development Team
- **Action:** Implement Story 1.4 immediately as it blocks testing of other features.
