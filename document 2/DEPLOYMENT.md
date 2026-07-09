# Deployment & Startup Guide

This document describes how to build, run, and deploy the Enterprise Workforce Management system locally, inside Docker containers, or on cloud platforms like Render.

---

## 1. Local Development Setup

### Prerequisites
* **Node.js**: Version 18.x or 20.x
* **MongoDB**: Locally running community server or MongoDB Atlas cloud cluster.
* **Redis**: Local Redis instance or Upstash memory client.

### Step-by-Step Installation

#### 1. Clone the Codebase
```bash
git clone https://github.com/Abhishekofficial4u/Enterprise-Workforce-Management.git
cd Enterprise-Workforce-Management
```

#### 2. Set Up the Backend
```bash
cd backend
npm install
# Copy and configure environment variables
cp .env.example .env
```
Ensure your `.env` contains correct MongoDB, Redis, and API keys.

#### 3. Seed Database Credentials
Initialize the database roles and default testing users:
```bash
node src/app.js
# In a browser or via curl, hit the seed endpoints:
# http://localhost:5000/api/v1/auth/seed-roles
# http://localhost:5000/api/v1/auth/create-test-users
```

#### 4. Set Up the Frontend
```bash
cd ../frontend
npm install
```
Configure your `VITE_API_URL` environment variable to point to `http://localhost:5000/api/v1`.

#### 5. Launch the Servers
* **Backend**: `npm run dev` (starts nodemon on port 5000)
* **Frontend**: `npm run dev` (starts Vite dev server on port 5173)

---

## 2. Containerized Deployment (Docker)

To orchestrate the services in a unified container environment, EWM includes standard Docker recipes.

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Unified Orchestration (`docker-compose.yml`)
Create this in the project root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/enterprise_workforce
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=change_me_to_something_secure
    depends_on:
      - mongo
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

Launch the entire stack with:
```bash
docker-compose up --build
```

---

## 3. Production Deployment (Render.com)

EWM is optimized to deploy directly onto Render.

### Backend Setup (Web Service)
1. **Connect Repository**: Connect your GitHub repository to Render.
2. **Environment**: Select `Node` environment.
3. **Build Command**: `npm install`
4. **Start Command**: `node src/app.js`
5. **Environment Variables**: Add all `.env` keys (MongoDB Atlas link, Redis URL, Gemini Key, JWT Secret).

### Frontend Setup (Static Site)
1. **Connect Repository**: Connect your GitHub repository.
2. **Environment**: Select `Static Site`.
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**: Add `VITE_API_URL` pointing to your deployed Render backend web service.
