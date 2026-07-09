# Changelog

All notable changes to the EWM project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-07-09

### Added
* Installed `react-organizational-chart` package dependency to frontend.
* Interactive **top-down flowchart tree rendering** on the Organization Hierarchy page (`OrgChart.jsx`).
* Automated fallback logic to wrap multiple unconnected top-level root nodes under a unified "Company" root node, preventing rendering fragmentation.

### Changed
* Removed outdated custom CSS lines (`OrgChart.css`) to prevent visual bugs on smaller screens.

---

## [1.0.1] - 2026-07-09

### Added
* New dashboard statistics cards on Reports & Analytics page tailored specifically for `FINANCE` roles (total net pay processed, pending payroll counts).

### Changed
* Modified `getEmployees` in `employee.controller.js` to allow `FINANCE` roles to view the full employee directory to ensure proper payroll runs.
* Restructured `Reports.jsx` to hide unrelated helpdesk and asset charts when logged in as a finance user.

### Fixed
* Resolved a strict Node.js `SyntaxError` (`Identifier 'userRole' has already been declared`) in `employee.controller.js` that crashed Render app builds.
* Deactivated edit/archive action buttons on `Employees.jsx` for finance roles.

---

## [1.0.0] - 2026-06-25

### Added
* Initial release of EWM full-stack portal.
* Completed modular features: HR Directory, Onboarding Wizard, Shift clocking, Leave approvals, Payroll processing, IT Asset assignments, support Ticketing, and AI Assistance.
* Real-time WebSocket notifications and Redis caching.
