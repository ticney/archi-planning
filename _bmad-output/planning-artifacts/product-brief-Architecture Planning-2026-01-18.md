---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/analysis/brainstorming-session-2026-01-18.md']
date: 2026-01-18
author: Geo
---

# Product Brief: Architecture Planning

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

The **Archiboard Platform** transforms the current manual, Excel-based scheduling into a robust **Quality Governance Platform**. By shifting focus from "booking a slot" to "ensuring readiness," it addresses the critical pain points of unprepared sessions and wasted architect time. The platform introduces mandatory pre-validation, maturity scoring, and automated coaching to ensure high-value architectural decisions.

---

## Core Vision

### Problem Statement
The current "Chaos Excel" process for managing Archiboards is error-prone, unscalable, and lacks governance. There is no mechanism to ensure a subject is mature enough for review, leading to sessions where prerequisites are unmet and senior architects' time is wasted.

### Problem Impact
- **Wasted Time:** High-value stakeholders spend time on immature subjects.
- **Lack of Accountability:** "No-shows" or unprepared presenters clogs the agenda.
- **Inefficient Scheduling:** Rigid slot durations don't match the actual complexity of topics.

### Why Existing Solutions Fall Short
Standard tools (Outlook, Calendly) manage *time* but ignore *quality*. Excel is a manual bottleneck. None enforce the architectural governance process required to ensure "Pre-Flight" readiness.

### Proposed Solution
A dedicated platform centered on **Governance & Quality**:
- **Gatekeeper (Pre-validation):** Asynchronous peer validation required *before* a meeting can occur.
- **Elastic Slots:** Booking duration adapts to topic complexity (e.g., Flash vs. Deep Dive).
- **Automated Coach:** Smart checklists ("Golden Checklist") and nudges to guide preparation.
- **Maturity Score:** Visual indicators of a subject's readiness.

### Key Differentiators
- **Quality-Gated Scheduler:** Unlike standard calendars, you can't book if you aren't ready.
- **Active Governance:** It enforces the culture of "Read before you meet."
- **Smart Nudges:** Proactive alerts based on project deadlines (IT/EXCO dates).

## Target Users

### Primary Users

#### 1. "The Project Leader" (Functional/Solution Architect)
*   **Context:** Responsible for a project's design and delivery. Needs validation to move forward (budget, technical choice, deployment).
*   **Pain Point:** Sees Archiboard as a "black hole" or a hurdle. Often comes unprepared because "they didn't know what was expected" or booked a slot just to meet a deadline, resulting in a rejection.
*   **Goal:** Get a "Go/No-Go" decision quickly and clearly. Wants to know exactly what is needed to pass.

#### 2. "The Reviewer" (Enterprise/Senior Architect)
*   **Context:** Validates alignment with company standards. Overloaded with meetings.
*   **Pain Point:** Wasting 1 hour discovering a subject that could have been handled in 5 minutes via email, or listening to a presentation that misses all mandatory security compliances.
*   **Goal:** High-value interactions. Wants to review materials *before* the meeting to ask targeted questions during the session.

### Secondary Users

#### 1. "The Organizer" (PMO / Board Secretary)
*   **Role:** Manages the schedule, chases people for documents, sends invites.
*   **Benefit:** Automating the "chasing" part and the quorum check saves them hours of manual email coordination.

### User Journey (The "Standard" Flow)

1.  **Preparation (The Nudge):**
    *   *Project Leader* receives a notification: "Your project passes Gate 2 in 2 weeks. Book your Archiboard now."
2.  **Booking (Smart Filter):**
    *   Selects topic complexity (e.g., "Standard Review").
    *   System asks: "Have you updated the DAT sheet?" (Link to Jira).
3.  **Governance Check (The Pre-Flight):**
    *   System blocks confirmation until documents are uploaded and marked "Ready".
4.  **Asynchronous Review (The Gatekeeper):**
    *   *Reviewers* receive the dossier 3 days prior. They vote "Ready to Discuss" or "Info Missing".
    *   *Organizer* sees the Quorum is reached -> Meeting Confirmed.
5.  **The Session:**
    *   Meeting starts directly with Q&A (no full presentation needed).
    *   Decision logged immediately in the platform.

## Success Metrics

### User Success Metrics
*   **"First Time Right" Rate:** Increase in % of subjects that are validated in a single session (vs. requiring a 2nd review due to missing info).
*   **Preparation Time:** 90% of Reviewers report spending <15 minutes analyzing a pre-validated subject.
*   **No-Show Elimination:** 0% of meetings cancelled last minute due to lack of quorum.

### Business Objectives
*   **Governance Efficiency:** Reduce the total time spent by Senior Architects in meetings by 30% (shifting time to high-value review vs. passive listening).
*   **Decision Velocity:** Reduce the lead time between "Request" and "Decision" by forcing the "Pre-Flight" readiness earlier in the cycle.
*   **Scalability:** Ability to handle 2x more project requests without adding more Architect meeting slots.

### Key Performance Indicators (KPIs)
*   **Pre-Flight Rejection Rate:** % of requests pushed back by the system/peers *before* a meeting is even scheduled (Target: >20% initially, showing the filter works).
*   **Maturity Score Avg:** Average score of subjects at the time of the meeting (Target: >8/10).
*   **User Satisfaction (NPS):** measured specifically on "Clarity of the process" for Project Leaders.

## MVP Scope

### Core Features (Must-Have)
1.  **Peer Review Workflow (The Gatekeeper):**
    *   Simple status flow: *Draft -> Ready for Review -> Validated/Rejected -> Scheduled*.
    *   File upload/link mandatory to trigger review.
2.  **Smart Booking Interface:**
    *   Selection of "Topic Type" (Standard, Strategic, Flash) setting the duration automatically.
    *   Visual "Maturity Score" (Manual input 0-10 by Reviewers).
3.  **Notification Engine:**
    *   Reminders to upload documents 7 days before.
    *   Alerts to Reviewers 3 days before.
4.  **Admin Dashboard:**
    *   One-view status of next week's sessions (Green/Red readiness status).

### Out of Scope for MVP
*   **AI Auto-Scheduling:** No automatic calendar tetris. We keep human control on *when* the meeting happens for now.
*   **AI Meeting Minutes:** Automated transcription is for V2.
*   **Jira Integration Depth:** Minimal deep-linking only. No full sync of fields yet.

### MVP Success Criteria
*   **Adoption:** 100% of new Archibards for Q2 are booked via the platform.
*   **Quality Gate:** At least 15% of requests are flagged "Not Ready" and rescheduled without a meeting (Proof of filter effectiveness).

### Future Vision
*   **The "Architectural Data Lake":** The platform becomes the search engine for all past decisions.
*   **Predictive Governance:** "Project X is 80% similar to Project Y, here are the risks detected previously."




