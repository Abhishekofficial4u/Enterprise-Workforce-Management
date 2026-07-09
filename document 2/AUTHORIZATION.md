# Authorization & Role-Based Access Control (RBAC)

This document details the Role-Based Access Control (RBAC) implementation, roles definition, permission hierarchies, and authorization enforcement mechanisms.

---

## 1. Authorization Architecture

EWM utilizes a dual-layered authorization strategy to protect endpoints and UI layouts:
1. **Legacy Role Names**: String comparisons (e.g., checks if a user's role is `SUPER_ADMIN` or `FINANCE`).
2. **Granular Permissions**: Fine-grained access scopes assigned to specific roles (e.g., `approve_payroll`, `submit_leave`).

When a client makes a request, the `protect` middleware populates all permissions assigned to the user by querying their database roles and flattening them into the request context (`req.user.permissions`).

---

## 2. The Permission Matrix

Below is the permission matrix defining the system capabilities assigned to each role:

| Capability / Action | Permission Key | Admin | HR | Finance | Mgr | TL | Emp |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Impersonate Users | `manage_users` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Roles/Permissions | `manage_roles` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Entire Directory | `view_employees` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Hire/Edit Employees | `manage_employees` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Run Monthly Payroll | `manage_payroll` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Payroll Releases | `approve_payroll` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Team Allocations | `view_team` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve Team Leaves | `approve_leave` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Allocate System Assets | `manage_assets` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Process IT Helpdesk Tickets| `manage_helpdesk` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Payslips | `view_own_payroll` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clock In/Out | `manage_attendance` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Submit Leave Requests | `submit_leave` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Backend Enforcement Middlewares

Authorization checks are declared directly on API routes inside the `backend/src/modules/` routers.

### 1. Legacy Role Enforcement (`authorize`)
Requires the user to match specific string roles:

```javascript
const { protect, authorize } = require('../../middlewares/auth.middleware');
router.post('/admin/credentials-vault', protect, authorize('SUPER_ADMIN'), authController.getCredentialsVault);
```

### 2. Granular Scope Enforcement (`requirePermission`)
Mandates specific permission tokens:

```javascript
const { protect, requirePermission } = require('../../middlewares/auth.middleware');
router.post('/hr/employees', protect, requirePermission('manage_employees'), employeeController.createEmployee);
```

---

## 4. Frontend Rendering Access Controls

On the frontend, elements of the UI (buttons, links, modules) are conditionally rendered depending on the logged-in user's roles and permissions.

### Implementation Pattern
The frontend handles checks by checking the flattened permissions array stored in `localStorage` or inside the React Auth Context.

#### Example: Conditional Button Rendering
In `src/features/employees/Employees.jsx`, the "Add Employee" button is hidden for users without profile editing permissions (like `FINANCE` or `EMPLOYEE` roles):

```jsx
const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
const canAddEmployee = permissions.includes('manage_employees');

return (
    <div>
        {canAddEmployee && (
            <button onClick={openAddModal}>Add Employee</button>
        )}
    </div>
);
```
