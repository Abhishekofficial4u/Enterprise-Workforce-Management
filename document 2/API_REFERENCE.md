# API Reference Manual

The EWM API is a JSON-based RESTful service. The default entry point prefix is `/api/v1/`.

---

## 1. Global Response Schemes

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error details descriptive string."
}
```

---

## 2. Authentication Module

### Login Employee / Admin
* **Endpoint**: `POST /api/v1/auth/login`
* **Auth Required**: No (Rate-limited to 10 attempts per 15 minutes per IP).
* **Payload**:
  ```json
  {
    "email": "employee@ewm.com",
    "password": "password123"
  }
  ```
* **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "603d274...",
      "email": "employee@ewm.com",
      "role": "EMPLOYEE",
      "roles": ["603d278..."],
      "employeeId": "EWM-1002"
    }
  }
  ```
* **Error Response (HTTP 401)**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

---

## 3. Human Resources (HR) Module

### Fetch Employee Directory
* **Endpoint**: `GET /api/v1/hr/employees`
* **Auth Required**: Yes (JWT Bearer Token).
* **Permissions Required**: `view_employees` or role matching `HR_MANAGER` / `SUPER_ADMIN` / `FINANCE`.
* **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "603d274...",
        "employeeId": "EWM-1002",
        "name": "Christopher Wilson",
        "email": "chris.wilson@ewm.com",
        "department": "IT",
        "designation": "IT Specialist",
        "status": "Active"
      }
    ]
  }
  ```

### Hire New Employee
* **Endpoint**: `POST /api/v1/hr/employees`
* **Auth Required**: Yes.
* **Permissions Required**: `manage_employees`.
* **Payload**:
  ```json
  {
    "name": "David Martin",
    "email": "david.martin@ewm.com",
    "mobile": "1234567890",
    "department": "IT",
    "designation": "IT Specialist",
    "joiningDate": "2026-07-01T00:00:00.000Z",
    "salary": 65000
  }
  ```
* **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "data": {
      "employeeId": "EWM-1005",
      "name": "David Martin",
      "email": "david.martin@ewm.com",
      "status": "Active",
      "_id": "603d27a..."
    }
  }
  ```

---

## 4. Time, Leaves, & Attendance Module

### Submit Leave Request
* **Endpoint**: `POST /api/v1/time-payroll/leave`
* **Auth Required**: Yes.
* **Payload**:
  ```json
  {
    "leaveType": "Casual Leave",
    "startDate": "2026-07-15",
    "endDate": "2026-07-17",
    "reason": "Family gathering"
  }
  ```
* **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d28b...",
      "employeeId": "603d274...",
      "leaveType": "Casual Leave",
      "startDate": "2026-07-15T00:00:00.000Z",
      "endDate": "2026-07-17T00:00:00.000Z",
      "status": "Pending"
    }
  }
  ```

### Clock In for Shift
* **Endpoint**: `POST /api/v1/time-payroll/attendance/clock-in`
* **Auth Required**: Yes.
* **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "employeeId": "603d274...",
      "date": "2026-07-10T00:00:00.000Z",
      "clockIn": "2026-07-10T09:00:00.000Z",
      "status": "Present"
    }
  }
  ```

---

## 5. Reports & Analytics Module

### Fetch Organizational Metrics
* **Endpoint**: `GET /api/v1/reports/summary`
* **Auth Required**: Yes.
* **Permissions Required**: `view_reports` (or `FINANCE`/`HR_MANAGER`/`SUPER_ADMIN` roles).
* **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalEmployees": 42,
        "totalAssets": 115,
        "totalTickets": 24,
        "openTickets": 3,
        "totalPayrollProcessed": 12,
        "pendingPayroll": 0,
        "totalNetPayProcessed": 245000
      }
    }
  }
  ```
