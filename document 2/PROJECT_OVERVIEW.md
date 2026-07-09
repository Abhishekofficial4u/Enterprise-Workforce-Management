# Project Overview: Enterprise Workforce Management (EWM)

## 1. Executive Summary & Purpose

The **Enterprise Workforce Management (EWM)** system is a comprehensive, full-stack ERP and logistics portal designed to streamline all administrative, operational, and organizational aspects of a modern enterprise. 

Before EWM, organizations relied on disconnected systems: Excel spreadsheets for attendance, email threads for leave approvals, paper trails for payroll, separate portals for IT asset allocation, and manual ticketing for employee support. EWM consolidates these functions into a single, unified database and real-time dashboard.

### Core Objectives
* **Consolidate Operations**: Unify HR, Time Tracking, Payroll, IT Service Desk, Asset Logistics, and Performance Reviews.
* **Enable Self-Service**: Empower employees to clock in/out, view payslips, request leaves, track onboarding milestones, and log IT issues directly.
* **Automate Payroll & Approvals**: Eliminate manual calculation errors by feeding attendance data directly into monthly payroll systems.
* **Provide Real-Time Analytics**: Give HR and Finance leaders high-level reports on organizational health, ticket backlogs, and resource allocations.
* **Leverage Conversational AI**: Provide instant assistance on HR policies and system tasks via an integrated AI chatbot.

---

## 2. Business Problems Solved

| Problem Area | Legacy Process | EWM Solution |
| :--- | :--- | :--- |
| **Onboarding Friction** | New hires printing, signing, and emailing documents manually. | **Interactive Onboarding Wizard** tracking profile completeness, document uploads, and policy acknowledgements. |
| **Attendance Verification** | Buddy punching, manual timesheets, or outdated hardware logs. | **Digital Shift-Based Timeclock** with IP-level logging, shift schedules, and automatic overtime calculation. |
| **Leave Management** | Confusing email trails, resulting in scheduling conflicts. | **Leave Request Engine** with automatic balance tracking, manager notifications, and approval workflows. |
| **Payroll Processing** | Monthly manual computations of base salaries, taxes, and leave deductions. | **Automated Payroll Ledger** computing gross-to-net pay and generating secure PDF payslips instantly. |
| **Asset Tracking** | IT hardware stored and given out without clear accountability. | **Asset Management Module** linking serial numbers, assignees, conditions, and return histories. |
| **Helpdesk Bottlenecks** | Employee IT/HR issues lost in inbox spam. | **Internal Ticketing System** with priority routing, status updates, and comments. |

---

## 3. Technology Stack

EWM is built using a modern **MERN (MongoDB, Express, React, Node)** architecture, supplemented by Redis caching and WebSocket communication.

```
+-------------------------------------------------------------------+
|                           React Client                            |
|             (Vite, Recharts, Lucide Icons, Vanilla CSS)           |
+-----------------------------------+-------------------------------+
                                    |
                                    | HTTPS / JSON / WebSockets
                                    v
+-------------------------------------------------------------------+
|                        Node / Express API                         |
+---------+------------------+---------------+------------------+---+
          |                  |               |                  |
          v                  v               v                  v
    +----------+       +-----------+   +-----------+      +-----------+
    | MongoDB  |       | Redis     |   | Socket.io |      | AI APIs   |
    | Database |       | Cache     |   | Engine    |      | (Gemini)  |
    +----------+       +-----------+   +-----------+      +-----------+
```

### Frontend Architecture
* **React 19 & Vite**: High-performance, reactive UI development and fast build times.
* **State Management**: React state hooks coupled with custom global hooks for session authentication.
* **Styling**: Structured Vanilla CSS utilizing global design tokens (CSS variables) for theme consistency and responsive layouts.
* **Data Visualization**: Recharts library for interactive reporting dashboards.
* **Icons & UI Details**: Lucide React for consistent vector symbols.

### Backend Services
* **Node.js & Express.js**: RESTful routing, input validation, and controller architecture.
* **Mongoose (MongoDB)**: Document-oriented database storing relational-style schemas with indexing.
* **Redis (Upstash)**: Memory store caching high-frequency read operations (like announcements and employee listings).
* **Socket.io**: WebSockets enabling instant real-time notifications for leaves, tickets, and system announcements.
* **Gemini & Groq APIs**: Advanced LLM processing for the AI chat assistant.

---

## 4. Main Modules & User Portals

EWM uses a robust Role-Based Access Control (RBAC) model. The system alters its sidebar navigation and features based on the logged-in user's roles.

### 👤 Employee Portal (Self-Service)
Allows general contributors to manage their personal daily tasks:
* **Time & Attendance**: Clock in and out of shifts.
* **Leave Requests**: Request time off and track request statuses.
* **Onboarding Checklist**: Complete onboarding wizard steps.
* **Helpdesk**: Open tickets and reply to comments.
* **Payroll**: View and download historical payslips.

### 💼 HR Manager Portal
Grants full operational access to workforce management tools:
* **Employee Directory**: Hire, view, edit, archive, and manage employee profiles.
* **Onboarding Monitor**: Track new-hire onboarding progress.
* **Training Management**: Assign and track corporate training progress.
* **Leave Approvals**: Review, approve, or reject employee leave requests.

### 💵 Finance Portal
Focuses strictly on the financial health and payroll runs:
* **Payroll Management**: Process monthly salaries, calculate deductions, view financial summaries, and approve pending payroll runs.
* **Reports Dashboard**: High-level financial reporting (Net salary processed, pending payroll costs, employee distributions).

### 🛠️ IT Administrator Portal
Provides tooling for system configurations and physical operations:
* **Asset Allocation**: Register serial numbers, allocate hardware to employees, and monitor return statuses.
* **Helpdesk Dispatcher**: Manage organization-wide IT tickets, assign owners, and close issues.
