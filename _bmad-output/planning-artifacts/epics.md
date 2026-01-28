---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# Architecture Planning - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Architecture Planning, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR01: Users can log in using a secure built-in authentication (Email/Password).
FR02: Admin can assign specific roles to users: Project Leader, Reviewer, Organizer, Admin.
FR03: System enforces access control, ensuring users only access features permitted by their role.
FR04: Project Leader can create a new "Governance Request" for a specific project.
FR05: Project Leader can select a "Topic Type" (e.g., Standard, Strategic) for their request.
FR06: System applies specific mandatory prerequisites (e.g., DAT Sheet upload) based on the selected Topic Type.
FR07: System blocks submission if mandatory prerequisites are missing ("The Guardrail").
FR08: Reviewer can view a dashboard of pending requests including their "Maturity Score" and attached documents.
FR09: Reviewer can "Validate" a request, advancing it to a "Ready for Board" state.
FR10: Reviewer can "Reject" a request with mandatory comments, returning it to "Draft" state.
FR11: System automatically assigns a slot duration (e.g., 30 min, 60 min) based on the selected Topic Type ("Elastic Slots").
FR12: Project Leader can request a specific date/time for a "Tentative Slot" only after passing initial gates.
FR13: Organizer can view the Master Schedule with visual status indicators (Tentative, Confirmed, Rejected).
FR14: System automatically releases a "Tentative Slot" if the request is Rejected by a Reviewer.
FR15: Organizer can "Confirm" a validated slot, finalizing it on the schedule.
FR16: Organizer can "Export" the confirmed agenda for a specific date (e.g., for Outlook distribution).
FR17: Admin can create and update "Governance Checklists" (questions, boolean checks) for each Topic Type.
FR18: Admin can define availability rules (e.g., standard board meeting times) for the scheduler.
FR19: System applies updated checklists immediately to all new requests ("Dynamic Governance").
FR20: System sends automated email notifications for key state changes (Review Required, Rejected, Confirmed).
FR21: System sends "Nudge" reminders to Project Leaders for upcoming deadlines.
FR22: System logs all critical actions (Status Change, Document Upload) with User ID and Timestamp for audit purposes.
FR23: Support/Admin can view the Audit Log to troubleshoot user issues.

### NonFunctional Requirements

NFR01: Responsiveness: All user interactions (e.g., clicking "Book", moving a card) must complete within <2 seconds to prevent "bureaucracy fatigue".
NFR02: Mobile Support: The "Reviewer Dashboard" must be fully functional on iPad (Safari/Chrome) to support the "commuting reviewer" persona.
NFR03: Learnability: A new Project Leader should be able to complete a booking request in <5 minutes without reading a manual.
NFR04: Access Control: The system must strictly enforce RBAC; a "Project Leader" must NEVER be able to see "Admin" configurations.
NFR05: Data Privacy: User passwords must be hashed and salted (if using built-in auth).
NFR06: Auditability: All decision logs ("Validated", "Rejected") must be immutable and stored for a minimum of 3 years (or per company policy).
NFR07: Availability: The system must be available 99.9% during business hours (Mon-Fri, 08:00-19:00).
NFR08: Data Integrity: The "Master Schedule" must never be in an inconsistent state (e.g., double bookings must be technically impossible).
NFR09: Concurrent Users: The system must support 50 concurrent users without performance degradation (sufficient for the department).
NFR10: Data Volume: The database must handle 1,000+ requests/year without query slowdowns.

### Additional Requirements

**Architecture:**
- Initialize project with `npx create-next-app -e https://github.com/michaeltroya/supa-next-starter`.
- Use **Service Layer Pattern** (`src/services/` for logic, `src/actions/` for API).
- **Database:** Postgres (Supabase) with RLS as the Source of Truth.
- **State Management:** TanStack Query (Server State) + Zustand (Client State).
- **Validation:** Zod Shared Schemas (Frontend/Backend consistency).
- **Styling:** Tailwind CSS + Shadcn/UI for "Cockpit" density.
- **Testing:** Vitest (Unit) + Playwright (E2E).
- **Security:** RLS First + Zod Validation.
- **Naming:** snake_case for Database, camelCase for Code, PascalCase for Components.

**UX Design:**
- **Design Direction:** "The Hybrid" (Master-Detail Split View).
- **Density:** prioritize "Cockpit" density for Desktop Power Users.
- **Key Components:**
    - `<MaturityGauge />` (Visual readiness indicator).
    - `<WizardShell />` (Guided flow).
    - `<SmartBadge />` (Zero-click review actions).
- **Interactions:** "Zero-Click" Review (Hover -> Validate) is critical.
- **Responsive:** Desktop-First, but fully functional on Tablet/Mobile.
- **Accessibility:** WCAG 2.1 AA compliance (Keyboard nav, Contrast).
- **Colors:** MH Blue (#065679) Primary, Validated Green (#5E803F), Blocked Coral (#D36F5B).

### FR Coverage Map

*   **FR01:** Epic 1 - Identity & Foundation
*   **FR02:** Epic 1 - Identity & Foundation
*   **FR03:** Epic 1 - Identity & Foundation
*   **FR04:** Epic 2 - Governance Request Submission
*   **FR05:** Epic 2 - Governance Request Submission
*   **FR06:** Epic 2 - Governance Request Submission
*   **FR07:** Epic 2 - Governance Request Submission
*   **FR08:** Epic 3 - Governance Review
*   **FR09:** Epic 3 - Governance Review
*   **FR10:** Epic 3 - Governance Review
*   **FR11:** Epic 4 - Intelligent Scheduling
*   **FR12:** Epic 4 - Intelligent Scheduling
*   **FR13:** Epic 4 - Intelligent Scheduling
*   **FR14:** Epic 4 - Intelligent Scheduling
*   **FR15:** Epic 4 - Intelligent Scheduling
*   **FR16:** Epic 4 - Intelligent Scheduling
*   **FR17:** Epic 5 - Platform Administration & Operations
*   **FR18:** Epic 5 - Platform Administration & Operations
*   **FR19:** Epic 5 - Platform Administration & Operations
*   **FR20:** Epic 5 - Platform Administration & Operations
*   **FR21:** Epic 5 - Platform Administration & Operations
*   **FR22:** Epic 5 - Platform Administration & Operations
*   **FR23:** Epic 5 - Platform Administration & Operations

## Epic List

### Epic 1: Identity & Foundation
**Goal:** Establish the secure foundation where users can log in and access the correct interface (Leader vs. Reviewer vs. Organizer) based on their role.
**FRs covered:** FR01, FR02, FR03

### Epic 2: Governance Request Submission (The Leader)
**Goal:** Enable Project Leaders to self-serve create governance requests, select topics, and upload mandatory proofs (The "Wizard" flow), ensuring "No read, no meet".
**FRs covered:** FR04, FR05, FR06, FR07

### Epic 3: Governance Review (The Reviewer)
**Goal:** Provide specific tools for Reviewers to efficiently assess project maturity, view proofs, and validate/reject requests (The "Zero-Click" Dashboard).
**FRs covered:** FR08, FR09, FR10

### Epic 4: Intelligent Scheduling (The Organizer)
**Goal:** Automate the meeting logistics with "Elastic Slots" and "Tentative" booking logic, giving Organizers a clear, validated Master Schedule.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16

### Epic 5: Platform Administration & Operations
**Goal:** Enable Admins to dynamically update checklists without code changes, and ensure users are kept in the loop via notifications and audit trails.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23
### Epic 1: Identity & Foundation

**Goal:** Establish the secure foundation where users can log in and access the correct interface (Leader vs. Reviewer vs. Organizer) based on their role.

### Story 1.1: User Authentication (Login)

As a User,
I want to log in securely with my email and password,
So that I can access the platform and my specific dashboard.

**Acceptance Criteria:**

**Given** a registered user with valid credentials
**When** they enter their email and password on the login page
**Then** they are authenticated and redirected to their role-specific dashboard
**And** their session is persisted secured (cookie/token)

**Given** a user with invalid credentials
**When** they attempt to login
**Then** an error message "Invalid email or password" is displayed
**And** they remain on the login page

**Given** an authenticated user
**When** they click "Logout"
**Then** their session is terminated and they are redirected to the public login page

### Story 1.2: Role-Based Access Control (RBAC) Foundation

As a System,
I want to enforce strict role-based access to routes and data,
So that users can only see and perform actions permitted for their specific role.

**Acceptance Criteria:**

**Given** a logged-in "Project Leader"
**When** they access the application root
**Then** they are automatically redirected to `/dashboard/project`
**And** they cannot access `/dashboard/reviewer` or `/dashboard/admin`

**Given** a logged-in "Reviewer"
**When** they access the application root
**Then** they are automatically redirected to `/dashboard/reviewer`
**And** they cannot access `/dashboard/admin`

**Given** a logged-in "Organizer"
**When** they access the application root
**Then** they are automatically redirected to `/dashboard/organizer`

**Given** any role
**When** they attempt to access a protected route for another role
**Then** they receive a 403 Forbidden error or are redirected to their home dashboard

### Story 1.3: Admin User Role Management

As an Admin,
I want to view and manage user roles,
So that I can ensure the right people have the right access permissions.

**Acceptance Criteria:**

**Given** an Admin user
**When** they view the User Management list
**Then** they can see all users and their currently assigned role

**Given** an Admin user
**When** they change a user's role (e.g., from Leader to Reviewer)
**Then** the change is saved immediately to the system of record
**And** the user's permissions are updated upon their next action or login

**Given** a non-Admin user
**When** they attempt to access the User Management features
**Then** access is strictly denied

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
**And** links are visible/hidden based on RBAC roles (e.g. Leader doesn't see Admin)
**And** the current active route is visually highlighted

**Given** a mobile/tablet user
**Then** the navigation collapses to a responsive menu (Hamburger)

### Epic 2: Governance Request Submission (The Leader)

**Goal:** Enable Project Leaders to self-serve create governance requests, select topics, and upload mandatory proofs (The "Wizard" flow), ensuring "No read, no meet".

### Story 2.1: Governance Request Wizard - Initialization

As a Project Leader,
I want to start a new governance request for my project,
So that I can begin the process of validating my project's maturity.

**Acceptance Criteria:**

**Given** a Project Leader on the Dashboard
**When** they click "New Request"
**Then** the "Governance Wizard" opens (Step 1)
**And** they can enter basic project details (Name, Code, Description)
**And** upon clicking "Next", a draft request is created in the database

### Story 2.2: Topic Selection & Prerequisite Logic

As a Project Leader,
I want to select the "Topic Type" for my review,
So that I know exactly what documents are required for that specific governance gate.

**Acceptance Criteria:**

**Given** the Wizard at Step 2
**When** I select "Standard Review"
**Then** the "Required Proofs" list updates to show "DAT Sheet" and "Architecture Diagram"
**And** the estimated slot duration is set to 30 minutes

**Given** the Wizard at Step 2
**When** I select "Strategic Review"
**Then** the "Required Proofs" list includes "DAT Sheet", "Security Sign-off", and "FinOps Approval"
**And** the estimated slot duration is set to 60 minutes

### Story 2.3: Mandatory Document Upload ("The Guardrail")

As a System,
I want to block progress until mandatory documents are uploaded,
So that Reviewers never waste time on projects that haven't provided the necessary evidence ("No read, no meet").

**Acceptance Criteria:**

**Given** a request requiring a "DAT Sheet"
**When** the Project Leader attempts to click "Next" without uploading it
**Then** the "Next" button is disabled
**And** a message "Please upload the DAT Sheet to proceed" is displayed

**Given** the upload step
**When** the user uploads a valid file (PDF/Docx)
**Then** the file is stored in secure storage
**And** the requirement is marked as "Complete" (Green Check)
**And** the "Next" button is enabled

### Story 2.4: Request Submission

As a Project Leader,
I want to submit my completed request,
So that it can be reviewed and validated by an Architect.

**Acceptance Criteria:**

**Given** a fully completed Wizard (all steps green)
**When** I click "Submit Request"
**Then** the request status changes from "Draft" to "Pending Review"
**And** I see a "Success" confirmation
**And** I am redirected to my Project Dashboard where I see the request in "Pending" status

### Epic 3: Governance Review (The Reviewer)

**Goal:** Provide specific tools for Reviewers to efficiently assess project maturity, view proofs, and validate/reject requests (The "Zero-Click" Dashboard).

### Story 3.1: Reviewer Dashboard ("The Cockpit")

As a Reviewer,
I want to see a high-density dashboard of pending requests,
So that I can quickly assess which projects are ready for review.

**Acceptance Criteria:**

**Given** a logged-in Reviewer
**When** they access the Reviewer Dashboard
**Then** they see a list of proper "Pending" requests
**And** each row displays Project Name, Topic Type, and calculated "Maturity Score"
**And** the list is sorted by Urgency (Date) descending by default

### Story 3.2: Governance Validation ("The Green Button")

As a Reviewer,
I want to validate a request that meets all criteria,
So that it can proceed to scheduling.

**Acceptance Criteria:**

**Given** a pending request on the dashboard
**When** I click the "Validate" action
**Then** the request status changes to "Ready for Board" / "Validated"
**And** the request moves from the "Pending" tab to the "Validated" tab
**And** the Project Leader receives a notification "Governance Validated"

### Story 3.3: Governance Rejection ("The Guardrail")

As a Reviewer,
I want to reject a request that is missing info or immature,
So that the Project Leader knows exactly what to fix.

**Acceptance Criteria:**

**Given** a pending request
**When** I click the "Reject" action
**Then** a modal appears asking for "Rejection Reason" (Mandatory)
**When** I confirm the rejection
**Then** the request status changes back to "Draft"
**And** the Project Leader receives a notification "Governance Rejected: [Reason]"
### Epic 4: Intelligent Scheduling (The Organizer)

**Goal:** Automate the meeting logistics with "Elastic Slots" and "Tentative" booking logic, giving Organizers a clear, validated Master Schedule.

### Story 4.1: Elastic Slot Duration Logic (Backend Rule)

As a System,
I want to automatically calculate the required slot duration based on the Topic Type,
So that we schedule appropriate time for discussion without manual guesswork.

**Acceptance Criteria:**

**Given** a governance request
**When** the Topic Type is "Standard"
**Then** the calculated slot duration is 30 minutes

**Given** a governance request
**When** the Topic Type is "Strategic"
**Then** the calculated slot duration is 60 minutes

**Given** a request is created
**Then** this duration is stored as a fixed property of the request

### Story 4.2: Tentative Booking Request

As a Project Leader,
I want to select a preferred date and time for my validated request,
So that I can enter the scheduling queue.

**Acceptance Criteria:**

**Given** a request that has been "Validated" (Status = Ready for Board)
**When** I view the request
**Then** I see a "Book Slot" action
**When** I click "Book Slot"
**Then** I see a calendar with available slots (based on rules)
**When** I select a slot
**Then** the request status changes to "Tentative"
**And** the slot is reserved on the calendar as "Tentative"

### Story 4.3: Master Schedule View

As an Organizer,
I want to see all booked slots on a master calendar,
So that I can see the upcoming board agenda.

**Acceptance Criteria:**

**Given** an Organizer
**When** they view the Master Schedule
**Then** they see a calendar view of all requests
**And** "Tentative" slots are shown in Yellow
**And** "Confirmed" slots are shown in Green
**And** clicking a slot shows the Request details (Project Name, Leader, Topic)

### Story 4.4: Schedule Confirmation & Export

As an Organizer,
I want to confirm tentative slots and export the agenda,
So that the meeting invites can be sent out.

**Acceptance Criteria:**

**Given** a "Tentative" slot on the schedule
**When** I click "Confirm"
**Then** the status changes to "Confirmed"
**And** an email notification is sent to the Project Leader

**Given** a set of confirmed slots for a specific date
**When** I click "Export Agenda"
**Then** a summary (CSV or Text) is generated listing the schedule for that day (Time, Project, Topic)

### Epic 5: Platform Administration & Operations

**Goal:** Enable Admins to dynamically update checklists without code changes, and ensure users are kept in the loop via notifications and audit trails.

### Story 5.1: Dynamic Checklist Management ("The Brain")

As an Admin,
I want to manage the questions and requirements for each Topic Type,
So that I can adjust governance rules without asking developers to change code.

**Acceptance Criteria:**

**Given** the Admin Checklists View
**When** I select "Standard Review"
**Then** I can see the list of required proofs (e.g., "DAT Sheet")
**When** I add a new requirement "Architecture Diagram"
**Then** it is saved to the database
**And** any NEW governance request created after this will require this new proof
**And** existing requests remain unchanged (Versioned Governance)

### Story 5.2: Automated Notifications

As a System,
I want to send email notifications for critical status changes,
So that users (Leaders, Reviewers) act quickly without constantly checking the dashboard.

**Acceptance Criteria:**

**Given** a request is "Rejected"
**Then** an email is sent to the Project Leader with the rejection reason
**And** the email includes a direct link to the request

**Given** a request is "validated"
**Then** an email is sent to the Project Leader saying "Ready to Book"

**Given** a scheduled slot is "Confirmed"
**Then** a calendar invite (ICS) is sent to the Project Leader and the Board Members

### Story 5.3: Audit Logging

As a Compliance Officer / Admin,
I want the system to log every status change and document upload,
So that we have a traceable history of decision making.

**Acceptance Criteria:**

**Given** any state change (Draft -> Pending -> Validated -> Rejected)
**Then** a log entry is created in the `audit_logs` table
**And** it records: Who (User ID), What (Old Status -> New Status), When (Timestamp)

**Given** an Admin viewing the "Audit Log" page
**Then** they can see a chronological list of these events

### Story 5.4: Scheduler Availability Rules

As an Admin,
I want to define when the Architecture Board meets,
So that the system only offers valid slots to Project Leaders.

**Acceptance Criteria:**

**Given** the "Availability Settings" page
**When** I set "Thursdays 14:00 - 16:00" as the Board Slot
**Then** the Booking Calendar will ONLY show slots within this window
**And** all other times are greyed out/unavailable
