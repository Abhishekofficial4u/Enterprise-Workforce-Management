# Frontend API Services Documentation

This document describes the API connection services, header injection mechanics, and Axios configurations implemented in the frontend client.

---

## 1. Network Layer & Header Injection

To prevent repeating code, EWM frontend services communicate with the backend using **Axios**. Authorization is injected dynamically via a request header helper function:

```javascript
const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};
```

---

## 2. Main API Service Definitions

Each React feature module houses its endpoint definitions under an `api/` directory.

### 👤 Employee API Service (`employeeService.js`)
* **File Path**: [employeeService.js](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/employees/api/employeeService.js)
* **Methods**:
  * `getEmployees()`: `GET /api/v1/hr/employees` - Retreive directories.
  * `createEmployee(data)`: `POST /api/v1/hr/employees` - Register a profile.
  * `updateEmployee(id, data)`: `PUT /api/v1/hr/employees/:id` - Change details.
  * `getMyProfile()`: `GET /api/v1/hr/employees/me` - Fetch own details.
  * `archiveEmployee(id)`: `DELETE /api/v1/hr/employees/:id` - Set status to `Archived`.

### 🕒 Leave API Service (`leaveService.js`)
* **File Path**: [leaveService.js](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/payroll/api/leaveService.js)
* **Methods**:
  * `getMyLeaves()`: `GET /api/v1/time-payroll/leave/me`
  * `getAllLeaves()`: `GET /api/v1/time-payroll/leave`
  * `applyLeave(data)`: `POST /api/v1/time-payroll/leave`
  * `updateLeaveStatus(id, status)`: `PUT /api/v1/time-payroll/leave/:id/approve`

### 💵 Payroll API Service (`payrollService.js`)
* **File Path**: [payrollService.js](file:///e:/Enterprise%20Workforce%20Management/frontend/src/features/payroll/api/payrollService.js)
* **Methods**:
  * `getAllPayrolls()`: `GET /api/v1/time-payroll/payroll`
  * `generatePayroll(id, data)`: `POST /api/v1/time-payroll/payroll/process`
  * `updatePayrollStatus(id, status)`: `PUT /api/v1/time-payroll/payroll/:id/pay`

---

## 3. Best Practices & Error Handling

When writing service calls:
1. **Never catch errors in the service file**: Return the promise result directly. Let the calling React UI component handle `.catch()` to display a warning alert modal to the employee.
2. **Dynamic URL Binding**: Do not hardcode host domains. Fall back to environment configuration parameters:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://enterprise-workforce-management.onrender.com/api/v1';
   ```
