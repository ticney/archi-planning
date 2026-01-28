# Story 1.4: Global Navigation & Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a persistent navigation rail/bar,
so that I can switch between contexts (Project, Review, Schedule) without losing my place.

## Acceptance Criteria

1.  **Given** a logged-in user
    **When** they view any page
    **Then** the "Navigation Rail" is visible on the left (Desktop)
    **And** it contains links to:
      - Dashboard (Home)
      - Projects (Leader)
      - Reviews (Reviewer)
      - Schedule (Organizer)
      - Settings (Admin)
    **And** links are visible/hidden based on RBAC roles (e.g. Leader doesn't see Admin)
    **And** the current active route is visually highlighted

2.  **Given** a mobile/tablet user
    **Then** the navigation collapses to a responsive menu (Hamburger)

## Tasks / Subtasks

- [x] Update Layout Configuration (AC: 1)
  - [x] Verify `src/app/(dashboard)/layout.tsx` structure
  - [x] Ensure layout provides proper context for Sidebar/Navigation
- [x] Implement Navigation Components (AC: 1)
  - [x] Create `src/components/layout/app-sidebar.tsx` (using Shadcn Sidebar)
  - [x] Implement `src/components/layout/nav-main.tsx` for main links
  - [x] Implement `src/components/layout/nav-user.tsx` for user profile/logout
- [x] Implement RBAC Logic (AC: 1)
  - [x] Integrate `useUser` or `useAuth` to get current user role
  - [x] Filter navigation items based on role (Leader, Reviewer, Organizer, Admin)
- [x] Implement Responsive Behavior (AC: 2)
  - [x] Configure Shadcn Sidebar for mobile (SidebarTrigger, collapsible)
  - [x] Verify hamburger menu functionality on mobile breakpoints

## Dev Notes

- **Architecture:**
  - Use **Shadcn UI Sidebar** component (new standard).
  - Use **Lucide React** for icons.
  - Links:
    - Dashboard: `/dashboard`
    - Projects: `/dashboard/projects`
    - Reviews: `/dashboard/reviews`
    - Schedule: `/dashboard/schedule`
    - Settings: `/dashboard/settings` (or `/admin`)
  - **RBAC:** Check user role from Supabase auth / user context. Hiding the link is a UI concern (UX), not security (Security is handled by Middleware/RLS). 

### Project Structure Notes

- **File Placement:**
  - `src/components/layout/` for Sidebar components.
  - `src/app/(dashboard)/layout.tsx` for the root layout wrapper.
- **Naming:**
  - `app-sidebar.tsx`
  - `nav-main.tsx`

### References

- [Epics: Story 1.4](d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/epics.md#story-14-global-navigation--layout)
- [Architecture: Frontend Architecture](d:/Dev/Architecture Planning/_bmad-output/planning-artifacts/architecture.md#frontend-architecture)
- [Project Context: Components](d:/Dev/Architecture Planning/_bmad-output/project-context.md#framework-specific-rules-nextjs--supabase)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Debug Log References

- Encountered failed tests due to missing dependencies (Shadcn Avatar, DropdownMenu). Fixed by installing them.
- Updated `layout.tsx` to handle Auth integration properly.

### Completion Notes List

- Implemented `AppSidebar`, `NavMain`, `NavUser` using Shadcn/UI.
- Created `src/app/(dashboard)/layout.tsx` which fetches User/Role from `AuthService` and passes it to Client Sidebar.
- Implemented RBAC filtering in `AppSidebar`.
- Added unit tests in `src/components/layout/app-sidebar.test.tsx` verifying RBAC logic.

### File List

- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/nav-main.tsx`
- `src/components/layout/nav-user.tsx`
- `src/components/layout/app-sidebar.test.tsx`
- `src/hooks/use-mobile.ts`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/dropdown-menu.tsx`

### Review Fixes
- Implemented missing `isActive` logic in `AppSidebar` using `usePathname`.
- Fixed type safety issues in `app-sidebar.test.tsx`.
- Added missing UI components to File List.

