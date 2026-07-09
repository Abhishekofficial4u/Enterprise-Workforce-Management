# Future Roadmap & Technical Debt Review

This document lists identified system technical debt, performance optimization tasks, and architectural scaling plans for EWM.

---

## 1. Technical Debt & Code Cleanup

### 1. Unified Environment Configs
* **Debt**: Some older feature API service files (like `employeeService.js`) contain fallback URL strings: `https://enterprise-workforce-management.onrender.com/api/v1`.
* **Fix**: Clean up all services to rely strictly on a centralized Axios instance utilizing the global `import.meta.env.VITE_API_URL` config.

### 2. Monolithic Routing Router
* **Debt**: `App.jsx` contains route declarations for all modules, resulting in a large file size.
* **Fix**: Restructure routing by extracting feature routes into child routers (e.g. `src/features/payroll/payrollRoutes.jsx`).

---

## 2. Performance Optimizations

### 1. Code Splitting & Lazy Loading
* **Debt**: The production frontend build output generates chunks larger than 500kB.
* **Fix**: Integrate React Lazy (`React.lazy()`) and Suspense loading to dynamically import features (like the Recharts-heavy Reports module) only when a user navigates to them.

### 2. Server-Side Pagination
* **Debt**: The employee directory (`GET /api/v1/hr/employees`) and audit logs APIs fetch entire collections.
* **Fix**: Implement query parameters (`page`, `limit`) on the backend to enforce paginated responses, keeping memory footprint low.

---

## 3. Scalability Roadmap

### 1. Cloud File Storage (S3 / GCS)
* **Goal**: Move local document uploads out of `/uploads/` onto **AWS S3** or **Google Cloud Storage (GCS)** buckets to enable stateless container hosting.

### 2. Multi-Factor Authentication (MFA)
* **Goal**: Integrate MFA via SMS (Twilio) or Authenticator apps (TOTP) to secure HR and Finance operations.

### 3. Corporate Messaging Hooks
* **Goal**: Enable webhooks to broadcast critical EWM notifications (like leave approvals or IT ticket updates) directly to corporate **Slack** or **Microsoft Teams** channels.
