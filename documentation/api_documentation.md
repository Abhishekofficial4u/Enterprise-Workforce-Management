# API Documentation

This document outlines all the available backend REST API endpoints for the Enterprise Workforce Management system. 

All API routes are prefixed with: `http://localhost:5000/api/v1`

---

## 1. Auth Module (`/auth`)
Handles user authentication and onboarding.
- `POST /auth/login` - Authenticates a user and returns a JWT token (Public)
- `POST /auth/setup-admin` - Initializes the first Super Admin account (Public)

---

## 2. HR / Employees Module (`/hr`)
Handles employee profiles and records. All routes require authentication.
- `GET /hr/employees` - Retrieves all employees in the organization
- `POST /hr/employees` - Creates a new employee (Requires: `HR_MANAGER`, `SUPER_ADMIN`, `ORG_ADMIN`)
- `GET /hr/employees/me` - Retrieves the profile of the currently logged-in user
- `PUT /hr/employees/me` - Updates the profile of the currently logged-in user
- `PUT /hr/employees/:id` - Updates a specific employee's details (Requires: `HR_MANAGER`, `SUPER_ADMIN`, `ORG_ADMIN`)
- `DELETE /hr/employees/:id` - Archives an employee profile (Requires: `HR_MANAGER`, `SUPER_ADMIN`, `ORG_ADMIN`)

---

## 3. Organization Module (`/org`)
Handles organizational structure like departments.
- `GET /org/departments` - Retrieves all departments
- `POST /org/departments` - Creates a new department (Requires: `SUPER_ADMIN`, `ORG_ADMIN`)
- `DELETE /org/departments/:id` - Archives a department (Requires: `SUPER_ADMIN`, `ORG_ADMIN`)

---

## 4. Projects & Tasks Module (`/projects`)
Handles project tracking and Kanban board tasks.
- `GET /projects` - Retrieves all projects accessible to the user
- `POST /projects` - Creates a new project (Requires: `SUPER_ADMIN`, `ORG_ADMIN`, `HR_MANAGER`, `MANAGER`)
- `GET /projects/:id` - Retrieves details of a specific project
- `PUT /projects/:id` - Updates a project (Requires: `SUPER_ADMIN`, `ORG_ADMIN`, `HR_MANAGER`, `MANAGER`)
- `DELETE /projects/:id` - Deletes a project (Requires: `SUPER_ADMIN`, `ORG_ADMIN`, `HR_MANAGER`)
- `POST /projects/:projectId/tasks` - Creates a new task inside a project (Requires: `SUPER_ADMIN`, `ORG_ADMIN`, `HR_MANAGER`, `MANAGER`)
- `PUT /projects/tasks/:id` - Updates a task (e.g., changing status/column)
- `DELETE /projects/tasks/:id` - Deletes a task (Requires: `SUPER_ADMIN`, `ORG_ADMIN`, `HR_MANAGER`, `MANAGER`)

---

## 5. Recruitment Module (ATS) (`/recruitment`)
Handles job postings and candidate pipelines. (All routes require `HR_MANAGER` or `SUPER_ADMIN`).
- `POST /recruitment/jobs` - Creates a new job posting
- `GET /recruitment/jobs` - Retrieves all job postings
- `PATCH /recruitment/jobs/:id/status` - Updates a job's status (e.g., Open, Closed)
- `POST /recruitment/candidates` - Adds a new candidate to a job
- `GET /recruitment/jobs/:jobId/candidates` - Retrieves all candidates for a specific job
- `PATCH /recruitment/candidates/:id/stage` - Moves a candidate to a different hiring stage

---

## 6. Performance Management Module (`/performance`)
Handles KPIs, grading, and quarterly reviews.
- `GET /performance/my` - Retrieves the logged-in user's performance reviews
- `PATCH /performance/:id/acknowledge` - Allows an employee to acknowledge their review
- `POST /performance` - Submits a new performance review (Requires: `HR_MANAGER`, `SUPER_ADMIN`)
- `GET /performance` - Retrieves all performance reviews across the company (Requires: `HR_MANAGER`, `SUPER_ADMIN`)

---

## 7. Notifications Module (`/notifications`)
Handles in-app alerts and notifications.
- `GET /notifications/my` - Retrieves all notifications for the logged-in user
- `PUT /notifications/:id/read` - Marks a specific notification as read
- `PUT /notifications/read-all` - Marks all notifications as read

---

> [!TIP]
> **Authentication headers:**
> For any route that is not "Public", you must include the JWT token in your HTTP headers like so:
> `Authorization: Bearer <your_jwt_token>`
