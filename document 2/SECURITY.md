# Security Architecture & Policies

This document outlines the security architecture, threat mitigation strategies, and data protection policies implemented across the EWM system.

---

## 1. Threat Mitigation Strategies

### Clickjacking & XSS Mitigation (Helmet)
EWM backend deploys **Helmet.js** as a global middleware to automatically set secure HTTP response headers:
* **`Content-Security-Policy`**: Restricts resource loading origins (preventing cross-site scripting).
* **`X-Frame-Options`**: Set to `SAMEORIGIN` to block clickjacking frames.
* **`X-Content-Type-Options`**: Set to `nosniff` to prevent MIME-type sniffing.

---

## 2. API Rate Limiting

To prevent brute-force attacks and Denial of Service (DoS), the API enforces strict request rate limits via the `express-rate-limit` middleware:

### 1. Global API Limits
* **Scope**: All routes under `/api/` (except login).
* **Limit**: Maximum of 1000 requests per 15 minutes per IP.
* **Response**: HTTP 429 Too Many Requests.

### 2. Login Route Limits
* **Scope**: `POST /api/v1/auth/login`.
* **Limit**: Maximum of 10 attempts per 15 minutes per IP.
* **Response**: Account lock-out checks trigger, locking the profile for security if thresholds are breached.

---

## 3. Input Validation & Data Sanitization

### Backend Schema Validations
All incoming payloads are strictly structured using Mongoose Schema definition object rules:
* Fields not matching the schema definitions are ignored by the Mongoose query analyzer.
* Email fields are verified via regex validations and sanitizing helpers (lowercase and trim).
* Numerical inputs (like `salary` and `leaveBalance`) enforce positive number boundaries (`min: 0`) to prevent credit exploitation bugs.

---

## 4. File Upload Security

The HR Onboarding Wizard allows employees to upload scanned compliance documents.

* **Target Directory**: Stored locally under `/uploads/` (or cloud storage adapters).
* **Format Filters**: Controllers check file MIME-types, rejecting executable extensions (like `.exe`, `.bat`, `.js`, `.sh`). Only documents (`.pdf`, `.docx`, `.png`, `.jpg`) are accepted.
* **Payload Size Limits**: The Express body parser caps payload sizes at `10mb` to prevent server disk overflow attacks:
  ```javascript
  app.use(express.json({ limit: '10mb' }));
  ```

---

## 5. Secret Management Policy

1. **Local Rules**: Keys and connection URIs must reside in `.env`.
2. **Git Ignored**: The `.gitignore` file contains rules to prevent committing `.env` or sensitive variables to public repositories.
3. **Vault Auditing**: Accessing credentials vaults on the admin dashboard is restricted strictly to the `SUPER_ADMIN` role and is logged in the audit trail database.
