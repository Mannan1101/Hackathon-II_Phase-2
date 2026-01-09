# Quick Testing Guide - Frontend-Backend Connection

## ✅ Connection Status: WORKING

Your frontend and backend are **fully connected**. The "login failed" errors you saw are authentication errors (wrong password), not connection issues.

---

## Quick Test Steps

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
.venv\Scripts\activate  # Windows
# or: source .venv/bin/activate  # Mac/Linux
python -m uvicorn src.main:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Verify Servers Are Running

**Check Backend:**
```bash
curl http://localhost:8001/health
# Expected: {"status":"healthy"}
```

**Check Frontend:**
Open browser: `http://localhost:3000`

---

## Test the Complete Flow

### Step 1: Register a New User

1. Go to: `http://localhost:3000/register`
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!@#` (use a strong password)
3. Click "Sign Up"
4. **Expected Result**: Redirects to `/tasks` page

### Step 2: Login with Your Account

1. Go to: `http://localhost:3000/login`
2. Enter the **same credentials** you just registered
3. Click "Sign In"
4. **Expected Result**: Redirects to `/tasks` page

### Step 3: Create a Task

1. On the `/tasks` page, fill in:
   - Title: "Test Task"
   - Description: "Testing frontend-backend connection"
2. Click "Create Task"
3. **Expected Result**: Task appears in the list

### Step 4: Verify Backend Received the Task

Open: `http://localhost:8001/docs`

This shows all available API endpoints and you can test them directly.

---

## Understanding the Errors

### ❌ "Login Failed" or "Invalid Password"

**This means:**
- ✅ Frontend connected to backend successfully
- ✅ Request reached the backend
- ❌ Password was incorrect

**Solution:**
- Use the correct password
- Or register a new account

### ❌ "Authentication Required"

**This means:**
- No valid session token
- User needs to log in

**Solution:**
- Go to `/login` and sign in

### ❌ "Network Error" or "Failed to Fetch"

**This means:**
- Backend is not running
- Wrong API URL configured

**Solution:**
- Check backend is running on port 8001
- Verify `NEXT_PUBLIC_API_URL=http://localhost:8001` in `frontend/.env.local`

---

## Verify Configuration

### Backend Configuration (`backend/.env`)
```env
JWT_SECRET=zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=
DATABASE_URL=postgresql://...
```

### Frontend Configuration (`frontend/.env.local`)
```env
AUTH_SECRET=zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=
NEXT_PUBLIC_API_URL=http://localhost:8001
DATABASE_URL=postgresql://...
```

**Important:** `JWT_SECRET` (backend) must match `AUTH_SECRET` (frontend) ✅

---

## API Endpoints Reference

### Backend API (http://localhost:8001)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/` | GET | No | API info |
| `/docs` | GET | No | Swagger documentation |
| `/tasks` | GET | Yes | Get all user tasks |
| `/tasks` | POST | Yes | Create new task |
| `/tasks/{id}` | PUT | Yes | Update task |
| `/tasks/{id}` | DELETE | Yes | Delete task |

### Frontend Routes (http://localhost:3000)

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/login` | Login page |
| `/register` | Registration page |
| `/tasks` | Task management (requires login) |

---

## Testing with cURL

### 1. Register a User (via Frontend)
Use the frontend at `http://localhost:3000/register`

### 2. Get Your Session Token
After logging in:
1. Open browser DevTools (F12)
2. Go to: Application → Cookies → `http://localhost:3000`
3. Find: `better-auth.session_token`
4. Copy the token value

### 3. Test Backend API Directly
```bash
# Replace YOUR_TOKEN with the actual token
curl -X GET http://localhost:8001/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: {"tasks": [], "total": 0}
```

### 4. Create a Task via API
```bash
curl -X POST http://localhost:8001/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"API Test Task","description":"Created via cURL"}'

# Expected: Task object with ID
```

---

## Troubleshooting

### Backend Not Starting?
```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 8001
```

### Frontend Not Starting?
```bash
cd frontend
npm install
npm run dev
```

### Database Connection Issues?
Check that `DATABASE_URL` in both `.env` files is correct and accessible.

### CORS Errors?
Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`

---

## Success Indicators

✅ **Backend Running:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     CORS configured with allowed origins: ['http://localhost:3000']
```

✅ **Frontend Running:**
```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 1276ms
```

✅ **Successful Login:**
```
POST /api/auth/sign-in/email 200 in 1034ms
GET /tasks 200 in 23ms
```

✅ **Successful Task Creation:**
```
POST /tasks 201 in 150ms
```

---

## Summary

Your system is **fully operational**. The frontend and backend are properly connected and communicating. Any "login failed" errors are due to incorrect passwords, not connection issues.

**To test right now:**
1. Open `http://localhost:3000/register`
2. Create a new account
3. You'll be redirected to `/tasks`
4. Create a task
5. See it appear in the list

This proves the complete integration is working! 🎉
