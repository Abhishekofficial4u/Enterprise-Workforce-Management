# Enterprise Workforce Management (EWM) - Developer Documentation

Welcome to the official developer documentation for the **Enterprise Workforce Management (EWM)** system. This documentation is designed to serve as a comprehensive onboarding and reference guide for new engineers, system architects, and administrators joining the team.

This project is a full-stack, enterprise-grade application for managing workforce logistics, HR operations, leave management, real-time attendance tracking, payroll processing, performance reviews, resource management (assets), helpdesk support, and AI-driven business intelligence.

---

## 📚 Documentation Index

To navigate the project documentation, use the links below:

### Core Concepts & System Context
* 🚀 **[Project Overview](PROJECT_OVERVIEW.md)**: Business objectives, main modules, key workflows, tech stack, and user roles.
* 🏗️ **[System Architecture](ARCHITECTURE.md)**: In-depth technical architecture, client-server models, caching tiers, data flow, and visual sequence diagrams.
* 📦 **[Codebase & Directory Guide](CODEBASE_GUIDE.md)**: A complete folder-by-folder layout mapping backend and frontend files and explaining codebase conventions.

### Security, Auth & Data
* 🗄️ **[Database Reference (Schema)](DATABASE.md)**: Complete details on MongoDB/Mongoose models, relationships, field descriptions, indices, and ER diagrams.
* 🔑 **[Authentication Flow](AUTHENTICATION.md)**: Token validation, JWT lifecycles, route protection, and session handling.
* 🛡️ **[Authorization & RBAC](AUTHORIZATION.md)**: Role-Based Access Control, legacy checks, and granular permissions mapping.
* 🌐 **[API Reference Guide](API_REFERENCE.md)**: Exhaustive list of endpoints, request bodies, query params, responses, validation schemas, and error codes.

### Feature & Logic Breakdown
* ⚙️ **[Feature & Modules Documentation](FEATURES.md)**: Business logic, backend controllers, and UI flows for HR, Attendance, Leave, Helpdesk, Assets, Recruitment, Performance, and Reports.

### Frontend Technical Details
* 🧩 **[Component Documentation](COMPONENTS.md)**: Reusable components, modals, visual cards, lists, props, and dependency definitions.
* 🪝 **[Hooks Reference](HOOKS.md)**: Custom React hooks for global logic, authentication, states, and event handling.
* 📞 **[Services Documentation](SERVICES.md)**: Frontend API communication services, Axios configuration, response interceptors, and error translation.
* 🧠 **[State Management](STATE_MANAGEMENT.md)**: Store architecture, caching strategies, and global vs local state guidelines.

### Operations, Deployment & Guidelines
* ⚙️ **[Environment Configurations](ENVIRONMENT_CONFIG.md)**: System environment variables, keys, and setup guidelines for developers.
* 🚢 **[Deployment & Setup Guide](DEPLOYMENT.md)**: Detailed step-by-step setup guides for Local development, Docker orchestration, and Render cloud deployments.
* 📝 **[Contributing & Coding Standards](CONTRIBUTING.md)**: Coding patterns, styling rules, naming conventions, git workflows, and pull request checklist.
* 🛡️ **[Security Architecture](SECURITY.md)**: Advanced security features including XSS mitigation, rate-limiting, sanitization, and secret protection.

### Developer Toolkit & Extras
* 🛠️ **[Troubleshooting & Debugging](TROUBLESHOOTING.md)**: Guide to solving common setup, database, JWT, permission, and containerization errors.
* ❓ **[Developer FAQ](FAQ.md)**: Answers to "How do I do X?" questions, with snippets for adding routes, pages, or roles.
* ⏳ **[System Changelog](CHANGELOG.md)**: Version control history template and standards for updating logs.
* 🗺️ **[Future Roadmap](ROADMAP.md)**: List of scaling strategies, optimizations, identified tech debt, and upcoming feature scopes.

---

## 🎯 Quick Start for New Developers

If this is your first day on the project, please follow this recommended onboarding path:

```
[Onboarding Sequence]
  │
  ├── 1. Read README & PROJECT_OVERVIEW.md (Business Context)
  ├── 2. Review ARCHITECTURE.md (How modules connect)
  ├── 3. Go to DEPLOYMENT.md (Set up your local database and run the app)
  ├── 4. Read CODEBASE_GUIDE.md & DATABASE.md (Understand directories and models)
  └── 5. Start with minor tasks in FAQ.md
```

If you encounter issues during database connection or starting the servers, refer directly to the **[Troubleshooting Guide](TROUBLESHOOTING.md)**.
