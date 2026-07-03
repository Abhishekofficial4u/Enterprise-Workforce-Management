# Implementation Plan: Organization & Notifications Backend (Member 1)

This plan details the implementation of **Member 1's** remaining Phase 1 responsibilities: **M-02 (Organization Management)** and **M-13 (Notifications Service)**. 

Once this is complete, we will have all the necessary backend services for Member 1, Member 2, and Member 3 finished, allowing us to pivot strictly to **Vertical Slicing** (wiring up the frontend and testing feature-by-feature).

## User Review Required
> [!IMPORTANT]
> - **Socket.IO Server Modification:** To support real-time notifications (M-13), I will need to modify `src/app.js` to use `http.createServer(app)` and attach a `socket.io` instance. This is a standard setup, but please confirm you are okay with this server architecture change.
> - **Dependencies:** I will run `npm install socket.io` in the backend directory.

## Open Questions
> [!WARNING]
> - **Email Notifications:** The PRD mentions Email and In-App notifications. For Phase 1 MVP, should I just mock the email sending (e.g., `console.log("Email sent")`), or do you want me to set up a real service like Nodemailer/SendGrid? (I recommend mocking for now to keep momentum).

## Proposed Changes

---

### 1. Organization Management (M-02)

#### [NEW] [backend/src/modules/org/department.model.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/org/department.model.js)
- **Fields:** `departmentName` (String), `departmentCode` (String, Unique), `manager` (ref: Employee), `status` (Enum: Active, Archived).
- **Business Rule:** Cannot delete a department if employees are assigned (enforced in controller).

#### [NEW] [backend/src/modules/org/org.controller.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/org/org.controller.js)
- `createDepartment`, `getDepartments`, `updateDepartment`, `archiveDepartment`.

#### [NEW] [backend/src/modules/org/org.routes.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/org/org.routes.js)
- Secured by `authorize('SUPER_ADMIN', 'ORG_ADMIN')`.

---

### 2. Notifications Service (M-13)

#### [NEW] [backend/src/modules/notifications/notification.model.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/notifications/notification.model.js)
- **Fields:** `recipientId` (ref: User), `title` (String), `message` (String), `type` (Enum: System, Leave, Attendance, General), `isRead` (Boolean, default: false).

#### [NEW] [backend/src/modules/notifications/notification.controller.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/notifications/notification.controller.js)
- `getMyNotifications`: Fetches unread/recent notifications for the logged-in user.
- `markAsRead`: Marks a specific notification (or all) as read.

#### [NEW] [backend/src/modules/notifications/notification.routes.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/notifications/notification.routes.js)
- Secured by `protect` middleware.

---

### 3. Real-Time Infrastructure (Socket.IO)

#### [MODIFY] [backend/package.json](file:///e:/Enterprise%20Workforce%20Management/backend/package.json)
- Add `socket.io` dependency.

#### [MODIFY] [backend/src/app.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/app.js)
- Refactor the Express app to run via Node's `http` module.
- Initialize `socket.io` server.
- Mount `/api/v1/org` and `/api/v1/notifications` routes.

#### [NEW] [backend/src/shared/socket.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/shared/socket.js)
- A helper file to manage Socket connections, map connected `userIds` to their `socket.id`, and export a helper function like `sendNotificationToUser(userId, payload)`.

## Verification Plan

### Automated Tests
- *(No automated tests configured)*

### Manual Verification
1. I will run `npm install` in the backend.
2. I will start the backend server to ensure the HTTP and WebSocket servers bind successfully without crashing.
3. We will have a robust notification API ready for the frontend wiring phase.
