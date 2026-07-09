# Developer FAQ (Frequently Asked Questions)

This FAQ answers common operational and programming questions for developers working on the EWM project.

---

## 1. How do I add a new page on the frontend?

To add a new view page (e.g. `PerformanceDashboard.jsx`):
1. **Create the component file**: Create it inside the feature folder, for example: `src/features/performance/PerformanceDashboard.jsx`.
2. **Add to Router**: Open `src/App.jsx` and import the component:
   ```jsx
   import PerformanceDashboard from './features/performance/PerformanceDashboard';
   ```
3. **Declare Route**: Define the path inside the route configuration block:
   ```jsx
   <Route path="/performance/dashboard" element={<AuthGuard><PerformanceDashboard /></AuthGuard>} />
   ```

---

## 2. How do I add a link to the sidebar menu?

EWM does not use a single navigation list. Instead, each user role has a custom layout file under `src/layouts/` that defines its specific sidebar links:

* **Super Admin**: [AdminLayout.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/layouts/AdminLayout.jsx)
* **Standard Employee**: [EmployeeLayout.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/layouts/EmployeeLayout.jsx)
* **HR Manager**: [HRLayout.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/layouts/HRLayout.jsx)
* **Finance Admin**: [FinanceLayout.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/layouts/FinanceLayout.jsx)
* **Project Manager**: [ManagerLayout.jsx](file:///e:/Enterprise%20Workforce%20Management/frontend/src/layouts/ManagerLayout.jsx)

Open the layout file corresponding to the role you want to edit, search for the `<aside className="sidebar">` block, and add a standard `<NavLink>` element pointing to your new route path.

---

## 3. How do I create or edit system roles?

Roles and permissions are seeded from the backend. 
1. Open the file [auth.controller.js](file:///e:/Enterprise%20Workforce%20Management/backend/src/modules/auth/auth.controller.js).
2. Find the `seedRolesRoute` controller function (around line 300).
3. Update the `rolesData` list by adding a new role object:
   ```javascript
   {
       name: 'AUDITOR',
       description: 'System Compliance Auditor',
       permissions: ['view_all_data', 'view_reports']
   }
   ```
4. Save the file.
5. In your browser, hit: `http://localhost:5000/api/v1/auth/seed-roles` to execute the database migration and update the role schemas.

---

## 4. How do I register a new API endpoint on the backend?

1. **Create Controller Function**: Add your code inside the relevant controller file (e.g. `backend/src/modules/hr/employee.controller.js`).
2. **Expose in Routes**: Add the path mapping in the routing file (e.g. `backend/src/modules/hr/hr.routes.js`), wrapping it in auth protection middlewares:
   ```javascript
   router.get('/custom-report', protect, requirePermission('view_reports'), employeeController.getCustomReport);
   ```
3. The route prefix `/api/v1/hr` is already mounted in `app.js`, making your endpoint accessible at `/api/v1/hr/custom-report`.
