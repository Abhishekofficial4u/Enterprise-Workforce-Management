# Walkthrough: Org & Notifications (Member 1)

Member 1's backend tasks are now 100% complete! This means the foundational infrastructure for the entire MVP (Phase 1) is ready on the backend.

## What was built?

I created two new domain folders `src/modules/org` and `src/modules/notifications`, and set up the WebSocket server:

### 1. Organization Management
- **Model:** Tracks `departmentName`, unique `departmentCode`, and `manager` (linked to the Employee profile).
- **API Endpoints:**
  - `POST /api/v1/org/departments`: Creates a new department (restricted to Admins).
  - `GET /api/v1/org/departments`: Gets all active departments, automatically calculating the total number of employees assigned to each one.
  - `DELETE /api/v1/org/departments/:id`: Archives a department. It has a built-in safety check to ensure it cannot be archived if there are active employees still assigned to it.

# Project Walkthrough & Progress

This document tracks our implementation progress.

## Newly Implemented: Performance Management & KPIs
The Performance Management module is now live!
- **Employee View**: Employees can view their historical performance scores. Their skills (Quality, Communication, Punctuality, Teamwork, Initiative) are visualized using a dynamic interactive Radar/Spider chart. Employees can "Acknowledge" a submitted review.
- **HR/Manager View**: HR and Managers can view the entire company's performance metrics and create new reviews through an elegant modal.
- **KPI Engine**: The backend automatically aggregates 1-to-5 KPI scores into an overall performance score for easy comparison.

---

## Newly Implemented: Recruitment & ATS Module
The Applicant Tracking System is now live!
- **Jobs Dashboard**: Create and manage job postings across different departments and locations.
- **Candidate Kanban**: A beautiful drag-and-drop pipeline to track candidates through your hiring process (Applied → Screening → Interview → Offered → Hired).
- **Resume Integration**: Track candidate contact info and their resume links directly from their Kanban cards.
- **RBAC**: Strictly limited to HR Managers and Super Admins.

---

### 2. Notifications Service & WebSockets
- **Model:** Tracks `recipientId`, `title`, `message`, `type`, and an `isRead` boolean.
- **WebSocket Server:** Integrated `socket.io` directly into the Express app (`src/app.js` and `src/shared/socket.js`). 
  - The frontend can now emit a `register` event with their User ID upon login. The backend tracks all connected users.
  - The backend can use the shared `sendNotificationToUser(userId, payload)` function to push real-time alerts directly to a specific user's browser!
- **API Endpoints:**
  - `GET /api/v1/notifications/my`: Fetches a user's 50 most recent notifications and calculates the `unreadCount`.
  - `PUT /api/v1/notifications/:id/read`: Marks a single notification as read.
  - `PUT /api/v1/notifications/read-all`: Clears the unread queue.

## Verification
- `socket.io` was installed successfully.
- The `app.js` file was correctly refactored to use `http.createServer()` to support WebSockets alongside REST endpoints.
- All routes are protected by the `protect` and `authorize` JWT middlewares.

> [!TIP]
> **Next Steps: Vertical Slicing!**
> As you requested, we can now pivot to "Vertical Slicing". Since the backend APIs for Member 1 (Auth, Org, Notifications), Member 2 (Employees), and Member 3 (Time/Payroll) are completely built, we can jump into the Frontend React code and start wiring up the screens one by one!
