# Environment Configuration Reference

This document explains the environment variables and configurations required to run the EWM system locally or in production.

---

## 1. Backend Configurations (`backend/.env`)

Create a file named `.env` in the `backend/` root directory.

```ini
# Application server port
PORT=5000

# MongoDB Connection String (Atlas cloud connection or local server)
MONGODB_URI=mongodb://localhost:27017/enterprise_workforce

# Secret signature key for JWT token hashes
JWT_SECRET=supersecretjwtkey_please_change_in_production

# JWT Expiration lifespan (e.g. 1d, 7d, 2h)
JWT_EXPIRES_IN=1d

# Google Gemini AI developer API key
GEMINI_API_KEY=AIzaSy...

# Groq Cloud API developer key
GROQ_API_KEY=gsk_...

# Outgoing SMTP Corporate Email credentials
EMAIL_USER=example.company@gmail.com
EMAIL_PASS=your_app_specific_password

# Upstash or Local Redis connection string
REDIS_URL=rediss://default:...@upstash.io:6379
```

### Explanations & Sourcing Keys
* **`MONGODB_URI`**: If running locally, check that the MongoDB Community service is running. If running in production, retrieve this connection string from MongoDB Atlas.
* **`GEMINI_API_KEY`**: Sourced from Google AI Studio. Used for the AI policy assistant.
* **`GROQ_API_KEY`**: Sourced from Groq Cloud Console. Used as a fallback LLM.
* **`EMAIL_PASS`**: If using Gmail, this **must** be a 16-character **App Password** created under your Google Account Security settings, not your account login password.
* **`REDIS_URL`**: Used for caching and session synchronization. Sourced from Upstash console.

---

## 2. Frontend Configurations (`frontend/.env`)

Create a file named `.env` in the `frontend/` root directory.

```ini
# Core Backend API Base URL
VITE_API_URL=http://localhost:5000/api/v1
```

### Note on Vite Environment Variables
Vite requires all frontend environment variables to be prefixed with `VITE_`. Any variable without this prefix will not be injected into the compiled client bundle.
