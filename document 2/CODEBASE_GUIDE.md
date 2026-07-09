# Codebase & Directory Guide

This document provides a directory map and coding guide for the **Enterprise Workforce Management (EWM)** codebase. It outlines the purpose of each directory and file, explaining how files interrelate and defining codebase standards.

---

## 1. Project Directory Layout

```
e:\Enterprise Workforce Management\
├── backend/                  # Node.js + Express API Backend
│   ├── src/                  # Backend Source Code
│   │   ├── app.js            # Express application bootstrap
│   │   ├── middlewares/      # Request interceptors (auth, caching, audit)
│   │   ├── modules/          # Business logic modules (auth, payroll, hr, etc.)
│   │   ├── scripts/          # Cron jobs, data seeders, and migration scripts
│   │   ├── shared/           # DB connectors, socket modules, Redis instances
│   │   └── utils/            # Shared utility functions (PDF generation, email)
│   ├── uploads/              # Local storage for documents & avatar uploads
│   ├── package.json          # Node dependencies and npm scripts
│   └── .env                  # Local backend environment configurations
│
├── frontend/                 # React Single Page Application (Vite)
│   ├── src/                  # React Source Code
│   │   ├── main.jsx          # Root rendering entry point
│   │   ├── App.jsx           # Global routes, app shell, and route guards
│   │   ├── layouts/          # General containers (MainLayout, AuthLayout)
│   │   ├── features/         # Modular feature-specific folders
│   │   │   ├── auth/         # Login components, user profile context
│   │   │   ├── employees/    # Directory, Org Chart, onboarding wizard
│   │   │   ├── payroll/      # Payroll runs, Leave balances, payslip PDF
│   │   │   ├── helpdesk/     # IT support tickets, comments
│   │   │   ├── assets/       # Hardware registry and assignments
│   │   │   └── ...           # (Other business domain feature directories)
│   │   ├── components/       # Shared UI components (Modals, custom tables)
│   │   ├── hooks/            # Global custom React hooks
│   │   └── store/            # Global application state contexts
│   ├── package.json          # Frontend packages and Vite commands
│   └── vite.config.js        # Vite compilation rules and proxy settings
│
└── documentation/            # General project design files
```

---

## 2. Backend Architecture Details

### `backend/src/app.js`
The central registry. It initializes the MongoDB connection, connects to the Redis client, starts background cron schedules, mounts rate-limit and helmet security layers, exposes the `/uploads` directory as static assets, and mounts all feature route managers under the `/api/v1/` prefix.

### `backend/src/middlewares/`
* **`auth.middleware.js`**: 
  * `protect`: Verifies JWT tokens from headers, decodes the user ID, fetches the user from the database, flattens permission flags, and mounts the resolved user object to `req.user`.
  * `authorize`: Limits access based on user role name.
  * `requirePermission`: Enforces specific granular permissions required for the route.
* **`cache.middleware.js`**: Checks if the target data already resides in the Redis cache. If yes, it returns it instantly; if not, it intercepts the response payload, writes it to Redis with an expiry, and returns it.
* **`audit.middleware.js`**: Automatically tracks and logs system mutations (POST/PUT/DELETE requests) to record who did what and when.

### `backend/src/modules/`
Each business feature lives in its own subdirectory inside `/modules/` to promote modularity. A typical feature structure contains:
* **`*.model.js`**: Defines the Mongoose database schema and indexes.
* **`*.routes.js`**: Declares Express API routes, attaching auth and permission middlewares.
* **`*.controller.js`**: Processes business rules, validates inputs, and queries the database.

---

## 3. Frontend Architecture Details

### `frontend/src/App.jsx`
Acts as the central routing router. It imports features and sets up `<BrowserRouter>`. Routes are protected using `<AuthGuard>` (to ensure the user has a valid session) or role checks:

```jsx
<Route path="/payroll" element={
    <AuthGuard requiredRole="FINANCE">
        <Payroll />
    </AuthGuard>
} />
```

### `frontend/src/features/`
Features are self-contained. For example, `src/features/employees/` contains its own API calls, modal wrappers, CSS, and layout pages. This prevents code sprawl. 

* **What belongs in a feature directory**: Pages, components, api requests, and styles unique to that specific feature.
* **What should never be in a feature directory**: Shared components (like general buttons or base layout containers) and global settings.

---

## 4. Codebase Guidelines & Coding Conventions

### File Naming
* **React Components**: Use PascalCase (e.g., `OnboardingWizard.jsx`, `CreateTicketModal.jsx`).
* **CSS & Utility Files**: Use kebab-case or camelCase (e.g., `OrgChart.css`, `api.js`).
* **Backend Modules**: Use camelCase with sub-extensions (e.g., `employee.model.js`, `auth.middleware.js`, `org.controller.js`).

### Rules for Folder Placement
1. **Never** import features directly into other features' inner components. If a component is shared across two features, extract it into the global `frontend/src/components/` folder.
2. **Never** hardcode local IP addresses or secrets in frontend or backend code. Always fetch configurations from `process.env` (backend) or `import.meta.env` (frontend).
3. **Never** run queries directly from Express routes. Routes must only delegate to controllers to keep the routing layer clean and testable.
