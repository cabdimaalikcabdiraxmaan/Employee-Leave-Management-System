# Employee Leave Management System

A full-stack HR application for submitting, reviewing, approving, and rejecting employee leave requests.

## Stack

- **Backend:** Node.js, Express, Prisma, PostgreSQL, JWT
- **Frontend:** React, Vite, Tailwind CSS, Axios

## Quick start

### 1. PostgreSQL

**If you installed PostgreSQL locally (Windows):**

```powershell
cd backend
npm install
.\setup-db.ps1 -Password "YOUR_POSTGRES_PASSWORD"
npm run dev
```

Use the password you chose when installing PostgreSQL (default user is `postgres`).

**Or with Docker:**

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run setup
npm run dev
```

API runs at `http://localhost:4000`  
Swagger docs at `http://localhost:4000/api/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo accounts (after seed)

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@example.com     | admin123    |
| Manager  | manager@example.com   | manager123  |
| Employee | employee@example.com  | employee123 |

## Features

- **Employees** — register, log in, submit leave requests, view status
- **Managers** — review, approve, or reject team leave requests
- **Admins** — manage departments, employees, and all leave requests

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (employee role) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Current user profile |
| GET/POST/PUT/DELETE | `/api/departments` | Department CRUD |
| GET/POST/PUT/DELETE | `/api/employees` | Employee CRUD |
| GET/POST/PUT/DELETE | `/api/leave-requests` | Leave request CRUD |
| POST | `/api/leave-requests/:id/approve` | Approve request |
| POST | `/api/leave-requests/:id/reject` | Reject request |
