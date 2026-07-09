# Custom React Hooks Documentation

This document describes the custom React hooks available in the EWM frontend codebase to encapsulate shared logic, security access controls, and state queries.

---

## 1. Security & RBAC Hooks

### 🛡️ `usePermissions` Hook
* **File Path**: [usePermissions.js](file:///e:/Enterprise%20Workforce%20Management/frontend/src/hooks/usePermissions.js)
* **Purpose**: Fetches the authenticated user's permission flags from browser local storage and exposes helpers to check accessibility scopes.
* **Return Values**:
  * `permissions` (Array of Strings): Flattened array of all permission scopes assigned to the active session.
  * `hasPermission(permission)` (Function): Returns boolean if the specific permission exists.
  * `hasAnyPermission(requiredPermissions)` (Function): Returns boolean if at least one of the queried scopes is held.
  * `hasAllPermissions(requiredPermissions)` (Function): Returns boolean if all requested scopes are held.

---

## 2. Usage Examples

### 1. Conditional UI Actions
Use `usePermissions` to show or hide controls like editing tables or deleting files:

```jsx
import { usePermissions } from '../../hooks/usePermissions';

const EmployeeDetailsCard = ({ employee }) => {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('manage_employees');

    return (
        <div>
            <h3>{employee.name}</h3>
            {canEdit && (
                <button onClick={handleEdit}>Edit Profile</button>
            )}
        </div>
    );
};
```

### 2. Guarding Multi-Permission Views
Use `hasAnyPermission` or `hasAllPermissions` to render tabs or layouts matching multiple departments:

```jsx
import { usePermissions } from '../../hooks/usePermissions';

const AdminSettingsLayout = () => {
    const { hasAnyPermission } = usePermissions();
    const isSystemAdmin = hasAnyPermission(['manage_users', 'manage_roles']);

    if (!isSystemAdmin) {
        return <p>Access Denied: Administrative rights required.</p>;
    }

    return (
        <div>
            <h1>Admin Panel</h1>
            {/* Setting views */}
        </div>
    );
};
```
