# Troubleshooting & Debugging Guide

This document lists the most common errors developers encounter during setup, development, or deployment of the EWM system, along with step-by-step solutions to fix them.

---

## 1. Database Connection Failures

### Symptom: `MongoDB connection failed: connect ECONNREFUSED ::1:27017`
The backend app server crashes instantly after booting up.

#### Cause
The local Node server is configured to connect to a local MongoDB instance (`mongodb://localhost:27017`), but the MongoDB database service is not currently running on your machine.

#### Fix (Windows)
1. Press the **Windows Key**, type **"Services"**, and press Enter to open the Windows Services app.
2. Scroll down to locate the service named **"MongoDB Server (MongoDB)"**.
3. Right-click the service name and select **Start**.
4. Once the status shows **"Running"**, restart your Node application (`npm run dev`).

---

## 2. Authorization & Permission Issues

### Symptom: `HTTP 403 Forbidden` / `Missing required permissions`
You are logged in, but you get access denied errors when hitting specific API endpoints (like employees directory or payroll).

#### Cause
Your user account does not have the modern permission flags array populated, or the Role collections in MongoDB have not been initialized.

#### Fix
You need to seed the system roles:
1. Open your browser and navigate to: `http://localhost:5000/api/v1/auth/seed-roles`
2. This drops and recreates the Role collections, maps permission arrays to the roles, and binds existing users to their corresponding role ObjectIds.
3. Refresh your session token by logging out and logging back in on the frontend client.

---

## 3. Session & JWT Validation Errors

### Symptom: `Not authorized, invalid or expired token`
The UI behaves as if you are logged out, or API calls fail with HTTP 401.

#### Cause
The stored token in `localStorage` has expired, or the server was restarted with a different `JWT_SECRET` key, making existing signatures invalid.

#### Fix
1. Open your browser Developer Tools (F12).
2. Go to the **Application** tab, select **Local Storage** under your app domain.
3. Locate `userToken`, right-click and click **Delete** (or run `localStorage.clear()` in the browser Console).
4. Reload the page and log back in to generate a fresh token.

---

## 4. Frontend Compilation Errors

### Symptom: `Failed to resolve import "react-organizational-chart"`
The Vite dev server fails to compile and halts with missing dependency warnings.

#### Cause
A new package dependency has been added to `package.json` by another developer, but your local `node_modules` directory does not contain it.

#### Fix
1. Stop your Vite server (`Ctrl + C`).
2. Run `npm install` in the `frontend/` directory to download the new package.
3. Restart the dev server (`npm run dev`).
