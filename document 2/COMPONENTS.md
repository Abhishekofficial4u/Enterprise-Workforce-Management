# Component Documentation

This document describes the key reusable components, modal views, and interactive widgets implemented across the React client.

---

## 1. Shared Global Components

### 🔍 GlobalSearch Component
* **File Path**: [GlobalSearch.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/components/GlobalSearch.jsx)
* **Purpose**: Provides a real-time, global search box in the navigation header to search for employees, projects, and departments.
* **State Hook Properties**:
  * `query` (String): Tracks user inputs.
  * `results` (Object): Holds returned arrays (`employees`, `projects`, `departments`).
  * `isOpen` (Boolean): Controls dropdown visibility.
* **APIs Used**: `GET /api/v1/org/search?q={query}`
* **Usage**: Rendered inside the top navigation bar (`Navbar.jsx` or equivalent main shell header).

---

## 2. HR & Employee Feature Components

### ⚡ OnboardingWizard Component
* **File Path**: [OnboardingWizard.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/employees/components/OnboardingWizard.jsx)
* **Purpose**: Guides new hires through profile verification, document scanning uploads, and corporate policy sign-offs.
* **Props**:
  * `employee` (Object): The logged-in employee profile.
  * `onComplete` (Function): Callback to refresh data upon checklist changes.
* **State**:
  * `saving` (Boolean): Disables buttons during API updates.
* **APIs Used**: `PUT /api/v1/hr/employees/me/onboarding`
* **Usage**: Mounted on the landing home screen (`DashboardHome.jsx`) if `employee.onboarding.isCompleted` is false.

### ➕ AddEmployeeModal Component
* **File Path**: [AddEmployeeModal.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/employees/components/AddEmployeeModal.jsx)
* **Purpose**: Slide-over or modal card allowing HR Managers to input data to create a new employee profile.
* **Props**:
  * `onClose` (Function): Closes the modal.
  * `onSuccess` (Function): Triggers list refresh.
* **State**:
  * `formData` (Object): Holds input fields (name, email, salary, mobile, department).
  * `loading` (Boolean): Controls save button spinner state.
  * `error` (String): Displays form validation errors.

---

## 3. Helpdesk Feature Components

### 🎫 CreateTicketModal Component
* **File Path**: [CreateTicketModal.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/helpdesk/components/CreateTicketModal.jsx)
* **Purpose**: Modal form allowing employees to submit support requests.
* **Props**:
  * `onClose` (Function): Closes the modal.
  * `onCreated` (Function): Refreshes the ticket grid.
* **State**:
  * `title`, `description`, `category`, `priority`.
* **APIs Used**: `POST /api/v1/helpdesk/tickets`

---

## 4. Performance Review Components

### 📈 CreateReviewModal Component
* **File Path**: [CreateReviewModal.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/performance/components/CreateReviewModal.jsx)
* **Purpose**: Dialog allowing managers to write performance goals and review ratings for team members.
* **Props**:
  * `employeeId` (String): Subject employee.
  * `onClose` (Function)
  * `onSuccess` (Function)
