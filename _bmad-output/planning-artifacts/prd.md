---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
classification:
  projectType: saas_b2b
  domain: Enterprise Governance
  complexity: High
  projectContext: Greenfield
inputDocuments: ['product-brief-Architecture Planning-2026-01-18.md']
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
date: 2026-01-18
author: Geo
---

# Product Requirements Document - Architecture Planning

**Author:** Geo
**Date:** 2026-01-18

## Executive Summary

The **Archiboard Platform** transforms the current manual, Excel-based scheduling into a robust **Quality Governance Platform**. By shifting focus from "booking a slot" to "ensuring readiness," it addresses the critical pain points of unprepared sessions and wasted architect time. The platform introduces mandatory pre-validation, maturity scoring, and automated coaching to ensure high-value architectural decisions.

## Core Vision

### Problem Statement
The current "Chaos Excel" process for managing Archiboards is error-prone, unscalable, and lacks governance. There is no mechanism to ensure a subject is mature enough for review, leading to sessions where prerequisites are unmet and senior architects' time is wasted.

### Proposed Solution
A dedicated platform centered on **Governance & Quality**:
- **Gatekeeper (Pre-validation):** Asynchronous peer validation required *before* a meeting can occur.
- **Elastic Slots:** Booking duration adapts to topic complexity.
- **Automated Coach:** Smart checklists ("Golden Checklist") and nudges.
- **Maturity Score:** Visual indicators of readiness.

## Success Criteria

### User Success
*   **"First Time Right" Rate:** Increase in % of subjects validated in a single session.
*   **Preparation Efficiency:** Reviewers spend <15 minutes analyzing pre-validated subjects.
*   **Reliability:** 0% of meetings cancelled last minute due to lack of quorum.

### Business Success
*   **Governance Efficiency:** Reduce Senior Architect meeting time by 30%.
*   **Decision Velocity:** Reduce lead time from "Request" to "Decision".
*   **Scalability:** Ability to handle 2x project requests without adding meetings.

### Technical Success
*   **Stability:** Zero critical bugs requiring immediate hotfixes.
*   **Data Integrity:** 100% reliability in storing decision logs (the "Source of Truth").

### Measurable Outcomes
*   **Pre-Flight Rejection Rate:** >20% initially (proving the filter works).
*   **Maturity Score Avg:** >8/10 at meeting time.
*   **NPS:** Positive "Process Clarity" score from Project Leaders.

## Product Scope

### MVP - Minimum Viable Product
*   **Gatekeeper Workflow:** Draft -> Ready -> Validated -> Scheduled.
*   **Smart Booking:** Topic types (Standard/Strategic) & Maturity Score.
*   **Notification Engine:** Automated reminders & alerts.
*   **Admin Dashboard:** Readiness status view.

### Growth Features (Post-MVP)
*   **Deep Jira Integration:** Full field sync.
*   **AI Auto-Scheduling:** Automated calendar optimization.
*   **AI Meeting Minutes:** Automated transcription.

### Vision (Future)
*   **"Architectural Data Lake":** Search engine for past decisions.
*   **Predictive Governance:** AI risk detection based on project similarity.

## User Journeys

### 1. The Project Leader (Success Path)
**Alice, Solution Architect**, responsible for the "OmniChannel" project.
*   **Opening:** It's Monday. Alice receives an automated nudge: "OmniChannel passes Gate 2 in 2 weeks. Book your Archiboard."
*   **Rising Action:** She clicks the link. The system asks "Standard or Flash?". She chooses "Standard" (30 min). The system prompts: "Upload DAT Sheet".
*   **The Guardrail:** She tries to skip, but the system blocks the booking. "DAT Sheet is mandatory for Standard Reviews."
*   **Resolution:** She uploads the latest draft. The system confirms a **"Tentative Slot"** for next Friday.
*   **Climax:** Wednesday, she gets a notification: "Governance Review Complete - Status: GO". Her slot is confirmed.
*   **Outcome:** She walks into the meeting on Friday knowing she is compliant. No surprise rejections.

### 2. The Reviewer (The "Gatekeeper")
**Bob, Senior Enterprise Architect**, overwhelmed by meetings.
*   **Opening:** Commuting to work, he gets a "Review Required" alert. 3 projects are tentatively booked for Friday.
*   **Rising Action:** He opens the iPad app. He sees "OmniChannel" has a Maturity Score of 8/10, but "Legacy Migration" is 3/10.
*   **The Filter:** For "Legacy Migration", he notes that the Security Compliance section is empty. He clicks **"Reject - Info Missing"**.
*   **Climax:** The system automatically releases the slot and notifies the Project Leader. Bob has saved 1 hour of frustration.
*   **Outcome:** Bob attends only the relevant meetings. He is prepared and has read the DAT sheet beforehand.

### 3. The Organizer (Efficiency)
**Charlie, PMO**, usually spends Thursdays chasing people.
*   **Opening:** Thursday morning, "The Chasing Day".
*   **Rising Action:** He checks the Admin Dashboard. He sees the schedule for tomorrow. 3 slots are Green (Validated), 1 is Red (Rejected/Cancelled).
*   **Climax:** He doesn't need to send a single email. The system has already managed the cancellations and confirmations.
*   **Resolution:** He clicks "Export Agenda" and sends it to the attendees. Work done in 5 minutes vs 4 hours.

### 4. Admin / Operations (Dynamic Configuration)
**Dave, Tool Administrator**.
*   **Opening:** The EXCO decides that "Cloud Cost Estimation" is now mandatory for all projects.
*   **Action:** Dave goes to Settings > Checklists > Standard Review. He adds a new boolean check: "FinOps Sign-off provided?".
*   **Outcome:** Instantly, all new booking requests now require this field. No code change or deployment needed. **Dynamic Governance.**

### 5. Support (Edge Case)
**Sarah, Platform Support**.
*   **Opening:** Alice claims "I uploaded the file but I can't book!".
*   **Action:** Sarah checks the "Audit Logs" for Alice's user ID.
*   **Resolution:** She sees Alice tried to upload a `.exe` instead of `.pdf`. The error message was displayed but ignored.
*   **Outcome:** Sarah guides Alice. The system worked as designed, blocking invalid files.

### Journey Requirements Summary
*   **Role-Based Access Control (RBAC):** Distinct workflows for Leader (Book), Reviewer (Validate), Organizer (Manage), Admin (Configure).
*   **Dynamic Forms Engine:** Admin capability to edit questions/checklists without code deployment.
*   **Workflow Engine:** State machine handling *Draft -> Tentative -> Validated / Rejected -> Confirmed*.
*   **Notification System:** Timed triggers (Nudge -14d) and Event triggers (Review Required).
*   **Smart Scheduler:** Tentative booking logic that auto-cancels if not validated X days before.
*   **Audit Logging:** Traceability of all actions for support and compliance.

## Domain-Specific Requirements

### Compliance & Regulatory
*   **Classification:** Internal Tool (No external access).
*   **Data Privacy:** Standard corporate policy (GDPR for employee data).
*   **Retention:** No legal mandates. Data retained for Knowledge Management purposes.

### Technical Constraints
*   **Authentication:** Mandatory Corporate SSO (e.g., Active Directory / Okta).
*   **Network:** Intranet / VPN access only.

### Risk Mitigations
*   **Main Risk:** "Shadow IT" (Users going back to Excel/Email).
*   **Mitigation:** Frictionless UX (must be easier than the old process).

## Innovation & Novel Patterns

### Detected Innovation Areas
*   **The "Quality-Gated Scheduler":** Inverting the standard "Book -> Prepare" model to "Validate -> Book". This forces a behavioral shift from "meeting compliance" to "readiness compliance".
*   **Elastic Slots:** Dynamic duration based on complexity rather than calendar defaults.

### Market Context & Competitive Landscape
*   **Status Quo:** Outlook/Calendly allow anyone to book any slot if open. This leads to "meeting inflation".
*   **Differentiation:** We add a "Governance Layer" on top of the calendar. We are not competing with Outlook; we are filtering what gets *into* Outlook.

### Validation Approach
*   **The "Rejection Rate" Metric:** If 0% of requests are rejected, the gate is broken (or useless). Innovation is validated if we see >15% pre-flight rejections (proving the filters work).

### Risk Mitigation
*   **Risk:** "Bureaucracy Fatigue" - Users finding the gate too hard and bypassing it (emailing organizers directly).
*   **Mitigation:** The "Golden Checklist" must be transparent. Users must see *exactly* why they are blocked (e.g., "Missing Security Sign-off") so it feels like a helper, not a blocker.

## SaaS B2B Specific Requirements

### Project-Type Overview
Internal B2B Platform (SaaS model), initially **Single Tenant** deployed for the Architecture Department.

### Technical Architecture Considerations
*   **Tenant Model:** Single Tenant (One database, one deployment).
*   **Authentication Model:** Built-in Secure Auth (Email/Password or Magic Link) managed by the backend (e.g., Supabase Auth). *Note: Corporate SSO deferred to Post-MVP.*
*   **RBAC Matrix:**
    *   **Project Leader:** Create Requests, Edit own Drafts.
    *   **Reviewer:** View All, Comment, Validate/Reject.
    *   **Organizer:** Manage Schedule, Cancel/Confirm Slots.
    *   **Admin:** Edit Checklists, Manage Users.

### Implementation Considerations
*   **Platform:** Web-based (Responsive for iPad Reviewers).
*   **Integrations:** Zero-integration MVP. Input fields for "Jira Link" are text-only.






## Functional Requirements

### 1. Identity & Access Management ("The Bouncer")
*   **FR01:** **Users** can log in using a secure built-in authentication (Email/Password).
*   **FR02:** **Admin** can assign specific roles to users: Project Leader, Reviewer, Organizer, Admin.
*   **FR03:** **System** enforces access control, ensuring users only access features permitted by their role.

### 2. Governance Workflow ("The Gatekeeper")
*   **FR04:** **Project Leader** can create a new "Governance Request" for a specific project.
*   **FR05:** **Project Leader** can select a "Topic Type" (e.g., Standard, Strategic) for their request.
*   **FR06:** **System** applies specific mandatory prerequisites (e.g., DAT Sheet upload) based on the selected Topic Type.
*   **FR07:** **System** blocks submission if mandatory prerequisites are missing ("The Guardrail").
*   **FR08:** **Reviewer** can view a dashboard of pending requests including their "Maturity Score" and attached documents.
*   **FR09:** **Reviewer** can "Validate" a request, advancing it to a "Ready for Board" state.
*   **FR10:** **Reviewer** can "Reject" a request with mandatory comments, returning it to "Draft" state.

### 3. Smart Scheduling ("Elastic Slots")
*   **FR11:** **System** automatically assigns a slot duration (e.g., 30 min, 60 min) based on the selected Topic Type ("Elastic Slots").
*   **FR12:** **Project Leader** can request a specific date/time for a "Tentative Slot" only after passing initial gates.
*   **FR13:** **Organizer** can view the Master Schedule with visual status indicators (Tentative, Confirmed, Rejected).
*   **FR14:** **System** automatically releases a "Tentative Slot" if the request is Rejected by a Reviewer.
*   **FR15:** **Organizer** can "Confirm" a validated slot, finalizing it on the schedule.
*   **FR16:** **Organizer** can "Export" the confirmed agenda for a specific date (e.g., for Outlook distribution).

### 4. Dynamic Configuration (Admin)
*   **FR17:** **Admin** can create and update "Governance Checklists" (questions, boolean checks) for each Topic Type.
*   **FR18:** **Admin** can define availability rules (e.g., standard board meeting times) for the scheduler.
*   **FR19:** **System** applies updated checklists immediately to all new requests ("Dynamic Governance").

### 5. Notifications & Audit
*   **FR20:** **System** sends automated email notifications for key state changes (Review Required, Rejected, Confirmed).
*   **FR21:** **System** sends "Nudge" reminders to Project Leaders for upcoming deadlines.
*   **FR22:** **System** logs all critical actions (Status Change, Document Upload) with User ID and Timestamp for audit purposes.
*   **FR23:** **Support/Admin** can view the Audit Log to troubleshoot user issues.

## Non-Functional Requirements

### Usability & Performance (Critical for Adoption)
*   **NFR01:** **Responsiveness:** All user interactions (e.g., clicking "Book", moving a card) must complete within **<2 seconds** to prevent "bureaucracy fatigue".
*   **NFR02:** **Mobile Support:** The "Reviewer Dashboard" must be fully functional on **iPad (Safari/Chrome)** to support the "commuting reviewer" persona.
*   **NFR03:** **Learnability:** A new Project Leader should be able to complete a booking request in **<5 minutes** without reading a manual.

### Security & Compliance
*   **NFR04:** **Access Control:** The system must strictly enforce RBAC; a "Project Leader" must NEVER be able to see "Admin" configurations.
*   **NFR05:** **Data Privacy:** User passwords must be hashed and salted (if using built-in auth).
*   **NFR06:** **Auditability:** All decision logs ("Validated", "Rejected") must be immutable and stored for a minimum of **3 years** (or per company policy).

### Reliability & Availability
*   **NFR07:** **Availability:** The system must be available **99.9%** during business hours (Mon-Fri, 08:00-19:00).
*   **NFR08:** **Data Integrity:** The "Master Schedule" must never be in an inconsistent state (e.g., double bookings must be technically impossible).

### Scalability (Rightsized for MVP)
*   **NFR09:** **Concurrent Users:** The system must support **50 concurrent users** without performance degradation (sufficient for the department).
*   **NFR10:** **Data Volume:** The database must handle **1,000+ requests/year** without query slowdowns.
