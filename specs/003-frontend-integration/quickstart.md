# Quickstart Guide: Frontend & Integration

**Feature**: Frontend & Integration (Spec-3)
**Date**: 2026-01-09
**Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for setting up and running the Frontend & Integration feature. Follow these steps to get the full-stack application running locally.

## Prerequisites

Before starting, ensure you have:

- ✅ **Spec-1 (Backend Core & Data Layer)** - Backend API implemented and tested
- ✅ **Spec-2 (Authentication & Security Integration)** - Better Auth configured
- ✅ **Node.js 18+** - Required for Next.js
- ✅ **Python 3.11+** - Required for FastAPI backend
- ✅ **Neon PostgreSQL** - Database with users and tasks tables
- ✅ **Git** - For version control

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (User)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)                   │
│  - Registration/Login pages                                 │
│  - Task management UI                                       │
│  - Better Auth integration                                  │
│  - JWT token in httpOnly cookie                            │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             │ Better Auth API        │ Backend API
             │ /api/auth/*            │ /tasks
             ▼                        ▼
┌────────────────────┐    ┌──────────────────────────────────┐
│   Better Auth      │    │   FastAPI Backend (Port 8000)    │
│   - User storage   │    │   - Task CRUD endpoints          │
│   - JWT generation │    │   - JWT validation middleware    │
│   - Password hash  │    │   - User isolation enforcement   │
└────────┬───────────┘    └──────────┬───────────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
         ┌───────────────────────────┐
         │   Neon PostgreSQL         │
         │   - users table           │
         │   - tasks table           │
         └───────────────────────────┘
```

## Step 1: Environment Configuration

### 1.1 Generate JWT Secret

Generate a strong JWT secret that will be shared between frontend and backend:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example output**: `zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=`

**CRITICAL**: Copy this secret - you'll use it in both frontend and backend configuration.

### 1.2 Configure Backend Environment

Edit `backend/.env`:

```bash
# Database connection (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require

# JWT secret (MUST match frontend AUTH_SECRET)
JWT_SECRET=zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=

# CORS configuration (allow frontend origin)
CORS_ORIGINS=http://localhost:3000

# Server configuration
HOST=0.0.0.0
PORT=8000
```

### 1.3 Configure Frontend Environment

Edit `frontend/.env.local`:

```bash
# Authentication secret (MUST match backend JWT_SECRET)
AUTH_SECRET=zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Database URL (for Better Auth - same as backend)
DATABASE_URL=postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require
```

**CRITICAL VALIDATION**: Ensure `AUTH_SECRET` (frontend) matches `JWT_SECRET` (backend) exactly. Mismatch will cause authentication failures.

## Step 2: Install Dependencies

### 2.1 Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Expected packages**:
- fastapi
- uvicorn
- sqlmodel
- pyjwt==2.10.1
- psycopg2-binary==2.9.10
- python-dotenv

### 2.2 Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected packages** (354 total):
- next@16.1.1
- react@19.0.0
- react-dom@19.0.0
- better-auth
- typescript@5.0+
- tailwindcss
- eslint@9.0+

## Step 3: Database Setup

### 3.1 Verify Database Tables

The database should already have tables from Spec-1 and Spec-2. Verify:

```sql
-- Connect to your Neon database and run:
\dt

-- Expected tables:
-- users (from Spec-2)
-- tasks (from Spec-1)
```

### 3.2 Verify Table Schema

```sql
-- Users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Expected columns:
-- id (integer, NOT NULL)
-- email (character varying, NOT NULL)
-- password_hash (character varying, NOT NULL)
-- created_at (timestamp, NOT NULL)

-- Tasks table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks';

-- Expected columns:
-- id (integer, NOT NULL)
-- title (character varying, NOT NULL)
-- description (text, NULL)
-- is_completed (boolean, NOT NULL)
-- user_id (integer, NOT NULL)
-- created_at (timestamp, NOT NULL)
-- updated_at (timestamp, NOT NULL)
```

## Step 4: Start Backend Server

### 4.1 Start FastAPI Backend

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 4.2 Verify Backend Health

Open browser or use curl:

```bash
curl http://localhost:8000/docs
```

**Expected**: FastAPI Swagger UI with task endpoints

### 4.3 Test Backend Authentication

```bash
# This should return 401 (no token)
curl http://localhost:8000/tasks
```

**Expected response**:
```json
{"detail": "Invalid authentication credentials"}
```

## Step 5: Start Frontend Server

### 5.1 Start Next.js Development Server

```bash
cd frontend
npm run dev
```

**Expected output**:
```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.1.x:3000

✓ Starting...
✓ Ready in 2.5s
```

### 5.2 Verify Frontend Access

Open browser: `http://localhost:3000`

**Expected**: Landing page with links to Register and Login

## Step 6: Test End-to-End Flow

### 6.1 User Registration

1. Navigate to `http://localhost:3000/register`
2. Enter email: `test@example.com`
3. Enter password: `TestPass123` (meets requirements)
4. Click "Register"

**Expected**:
- Redirect to `/tasks` page
- httpOnly cookie set: `better-auth.session_token`
- Empty state message: "No tasks yet. Create your first task!"

### 6.2 Create Task

1. On `/tasks` page, click "Create Task"
2. Enter title: "Test Task"
3. Enter description: "This is a test task"
4. Click "Save"

**Expected**:
- Task appears in list immediately
- Task shows: title, description, checkbox (uncompleted)
- Edit and Delete buttons visible

### 6.3 Update Task

1. Click "Edit" on the task
2. Change title to: "Updated Test Task"
3. Click "Save"

**Expected**:
- Task title updates immediately
- No page refresh

### 6.4 Toggle Completion

1. Click checkbox on the task

**Expected**:
- Task marked as completed (visual indicator)
- Checkbox checked

### 6.5 Delete Task

1. Click "Delete" on the task
2. Confirm deletion

**Expected**:
- Task removed from list immediately
- Empty state message appears

### 6.6 Sign Out

1. Click "Sign Out" button

**Expected**:
- Redirect to `/login` page
- httpOnly cookie cleared
- Cannot access `/tasks` without signing in again

### 6.7 Sign In

1. Navigate to `http://localhost:3000/login`
2. Enter email: `test@example.com`
3. Enter password: `TestPass123`
4. Click "Sign In"

**Expected**:
- Redirect to `/tasks` page
- httpOnly cookie set
- Previous tasks visible (if any)

## Step 7: Test User Isolation

### 7.1 Create Second User

1. Open incognito/private browser window
2. Navigate to `http://localhost:3000/register`
3. Register with different email: `user2@example.com`
4. Create some tasks for this user

### 7.2 Verify Isolation

1. In first browser (user 1), view tasks
2. In second browser (user 2), view tasks

**Expected**:
- User 1 sees only their tasks
- User 2 sees only their tasks
- No overlap between users

### 7.3 Test Unauthorized Access

1. Get task ID from user 1
2. As user 2, try to access: `GET /tasks/{user1_task_id}`

**Expected**:
- 401 Unauthorized response
- Error message: "Not authorized to access this task"

## Step 8: Test Responsive Design

### 8.1 Desktop View (1920x1080)

1. Open browser at full screen
2. Navigate through all pages

**Expected**:
- Content well-spaced
- Optimal use of screen real estate
- Multi-column layouts where appropriate

### 8.2 Tablet View (768x1024)

1. Open browser DevTools
2. Set viewport to iPad (768x1024)
3. Navigate through all pages

**Expected**:
- Forms appropriately sized
- Touch-friendly controls
- Readable text

### 8.3 Mobile View (375x667)

1. Set viewport to iPhone (375x667)
2. Navigate through all pages

**Expected**:
- Single column layout
- Touch-friendly buttons (44x44px minimum)
- No horizontal scrolling

## Troubleshooting

### Issue: Port Already in Use

**Symptom**: `Error: Port 3000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
npm run dev -- -p 3001
```

### Issue: JWT Secret Mismatch

**Symptom**: All API requests return 401, even after successful login

**Solution**:
1. Verify `AUTH_SECRET` in `frontend/.env.local`
2. Verify `JWT_SECRET` in `backend/.env`
3. Ensure they match exactly (case-sensitive)
4. Restart both servers

### Issue: CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
1. Verify `CORS_ORIGINS` in `backend/.env` includes frontend URL
2. Restart backend server
3. Clear browser cache

### Issue: Database Connection Failed

**Symptom**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify `DATABASE_URL` is correct in both `.env` files
2. Check Neon dashboard for connection string
3. Ensure `sslmode=require` is included
4. Test connection with `psql` or database client

### Issue: Better Auth Not Working

**Symptom**: Registration/login fails with 500 error

**Solution**:
1. Verify `DATABASE_URL` in `frontend/.env.local`
2. Ensure Better Auth has created necessary tables
3. Check browser console for detailed errors
4. Verify `AUTH_SECRET` is set and at least 32 characters

## Development Workflow

### Making Changes

1. **Frontend changes**: Next.js hot-reloads automatically
2. **Backend changes**: Uvicorn reloads automatically (with `--reload` flag)
3. **Environment changes**: Restart both servers

### Testing Changes

1. Test in browser manually (no automated tests in scope)
2. Verify all user stories from spec.md
3. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
4. Test responsive design at different viewports

### Debugging

**Frontend**:
- Browser DevTools Console (F12)
- Network tab for API requests
- React DevTools extension

**Backend**:
- Terminal output (uvicorn logs)
- FastAPI Swagger UI: `http://localhost:8000/docs`
- Database queries: Check Neon dashboard

## Production Deployment

### Environment Differences

**Development**:
- HTTP allowed
- CORS allows localhost
- Detailed error messages

**Production**:
- HTTPS required (for secure cookies)
- CORS restricted to production domain
- Generic error messages (no stack traces)

### Production Checklist

- [ ] Generate new JWT secret (different from development)
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Update `CORS_ORIGINS` to production frontend URL
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set `secure: true` for cookies in production
- [ ] Verify database connection string uses production database
- [ ] Test all user flows in production environment

## Next Steps

After completing this quickstart:

1. ✅ Verify all 4 user stories from spec.md work correctly
2. ✅ Test all 32 functional requirements
3. ✅ Validate all 17 success criteria
4. ✅ Test all 8 edge cases
5. ✅ Document any issues or deviations

**Ready for**: `/sp.tasks` command to generate implementation tasks

## Support

For issues or questions:
- Review [spec.md](./spec.md) for requirements
- Review [plan.md](./plan.md) for architecture
- Review [data-model.md](./data-model.md) for entities
- Review [contracts/](./contracts/) for API specifications
- Check constitution: `.specify/memory/constitution.md`
