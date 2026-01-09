# Quickstart Guide: Authentication & Security Integration

**Feature**: 002-user-auth-jwt
**Date**: 2026-01-09
**Purpose**: Setup instructions for JWT-based authentication between Next.js (Better Auth) and FastAPI

---

## Prerequisites

- Completed Spec-1 (Backend Core & Data Layer)
- Node.js 18+ and npm/yarn (for Next.js frontend)
- Python 3.11+ (for FastAPI backend)
- Running PostgreSQL database (Neon Serverless)

---

## Part 1: Backend Setup (FastAPI JWT Verification)

### 1. Install JWT Library

```bash
cd backend
pip install PyJWT==2.8.0
```

Update `requirements.txt`:
```
# Add to existing requirements
PyJWT==2.8.0
```

### 2. Configure JWT Secret

Add to `backend/.env`:
```bash
# Existing
DATABASE_URL=postgresql://...

# New for Spec-2
JWT_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security
```

**Generate Secure Secret**:
```bash
openssl rand -base64 32
```

**CRITICAL**: This secret must match `AUTH_SECRET` in frontend `.env.local`

### 3. Update Configuration

Edit `backend/src/config.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")  # NEW

    def __init__(self):
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")

        # NEW: Validate JWT secret
        if not self.JWT_SECRET:
            raise ValueError("JWT_SECRET environment variable is required")
        if len(self.JWT_SECRET) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")

settings = Settings()
```

### 4. Create JWT Middleware

Create `backend/src/middleware/auth.py`:
```python
"""
JWT authentication middleware for FastAPI.

Provides dependency injection for JWT token verification.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from src.config import settings

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Extract and validate JWT token, return user ID.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        int: User ID extracted from JWT 'sub' claim

    Raises:
        HTTPException 401: Invalid, expired, or missing token
    """
    token = credentials.credentials

    try:
        # Verify signature and decode
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )

        # Extract user ID from 'sub' claim
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "Token missing user identity"
                    }
                }
            )

        # Convert to integer
        user_id = int(user_id_str)
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "TOKEN_EXPIRED",
                    "message": "Token has expired"
                }
            }
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "Invalid token signature"
                }
            }
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "Invalid user ID format"
                }
            }
        )
```

### 5. Update Task Endpoints

Edit `backend/src/api/routes/tasks.py`:

**Before (Spec-1)**:
```python
from fastapi import Query

@router.get("/tasks")
async def list_tasks(
    user_id: int = Query(..., gt=0),  # Query parameter
    session: Session = Depends(get_session)
):
    # ...
```

**After (Spec-2)**:
```python
from src.middleware.auth import get_current_user_id

@router.get("/tasks")
async def list_tasks(
    user_id: int = Depends(get_current_user_id),  # JWT dependency
    session: Session = Depends(get_session)
):
    # ... (rest of logic unchanged)
```

Apply this change to all task endpoints:
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{task_id}`
- `PUT /tasks/{task_id}`
- `DELETE /tasks/{task_id}`

### 6. Test Backend JWT Verification

Start the backend:
```bash
cd backend
uvicorn src.main:app --reload
```

Test with curl (replace `<token>` with valid JWT):
```bash
# Should return 401 (no token)
curl http://localhost:8000/tasks

# Should return 401 (invalid token)
curl -H "Authorization: Bearer invalid_token" http://localhost:8000/tasks

# Should return tasks (with valid token)
curl -H "Authorization: Bearer <valid_jwt_token>" http://localhost:8000/tasks
```

---

## Part 2: Frontend Setup (Next.js + Better Auth)

### 1. Install Better Auth

```bash
cd frontend
npm install better-auth
# or
yarn add better-auth
```

### 2. Configure Environment Variables

Create `frontend/.env.local`:
```bash
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth secret (MUST match backend JWT_SECRET)
AUTH_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security

# Database URL for Better Auth (can be same as backend or separate)
DATABASE_URL=postgresql://...
```

**CRITICAL**: `AUTH_SECRET` must be identical to backend `JWT_SECRET`

### 3. Configure Better Auth

Create `frontend/src/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
  jwt: {
    enabled: true,
    secret: process.env.AUTH_SECRET!,
    expiresIn: "24h",
  },
});
```

### 4. Create API Client

Create `frontend/src/lib/api-client.ts`:
```typescript
import { cookies } from 'next/headers';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Extract JWT from Better Auth cookie
  const cookieStore = cookies();
  const authToken = cookieStore.get('better-auth.session_token')?.value;

  if (!authToken) {
    throw new Error('Not authenticated');
  }

  // Attach Authorization header
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
}
```

### 5. Create Auth Pages

Create `frontend/src/app/login/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/tasks');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### 6. Use API Client in Components

Example task list component:
```typescript
import { apiRequest } from '@/lib/api-client';

export default async function TasksPage() {
  const data = await apiRequest<{ tasks: Task[]; total: number }>('/tasks');

  return (
    <div>
      <h1>My Tasks ({data.total})</h1>
      <ul>
        {data.tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Part 3: Testing the Integration

### 1. Start Both Services

Terminal 1 (Backend):
```bash
cd backend
uvicorn src.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 2. Test Authentication Flow

1. **Register**: Navigate to `/register`, create account
2. **Login**: Navigate to `/login`, sign in with credentials
3. **Access Tasks**: Navigate to `/tasks`, verify tasks load
4. **Create Task**: Create new task, verify it appears
5. **Logout**: Clear cookies, verify `/tasks` redirects to login

### 3. Verify User Isolation

1. Register two users (user1@example.com, user2@example.com)
2. Login as user1, create tasks
3. Logout, login as user2
4. Verify user2 cannot see user1's tasks
5. Verify API returns 404 if user2 tries to access user1's task by ID

### 4. Test Token Expiration

1. Login and get JWT token
2. Wait 24 hours (or modify expiration to 1 minute for testing)
3. Try to access `/tasks`
4. Verify 401 error and redirect to login

---

## Part 4: Troubleshooting

### Issue: 401 Unauthorized on all requests

**Cause**: JWT secret mismatch between frontend and backend

**Solution**: Verify `AUTH_SECRET` (frontend) matches `JWT_SECRET` (backend)

```bash
# Backend
cat backend/.env | grep JWT_SECRET

# Frontend
cat frontend/.env.local | grep AUTH_SECRET
```

### Issue: Token missing user identity

**Cause**: Better Auth not configured to include `sub` claim

**Solution**: Verify Better Auth JWT configuration includes user ID in `sub` claim

### Issue: CORS errors

**Cause**: Frontend and backend on different origins

**Solution**: Add CORS middleware to FastAPI (already in Spec-1):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Cookie not being sent

**Cause**: httpOnly cookie requires same-site configuration

**Solution**: Ensure Better Auth cookie settings allow cross-origin requests in development

---

## Part 5: Production Deployment

### Security Checklist

- [ ] Use HTTPS in production (required for secure cookies)
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Configure CORS to allow only production frontend domain
- [ ] Enable rate limiting on authentication endpoints
- [ ] Set up monitoring for failed authentication attempts
- [ ] Rotate JWT secret periodically (requires user re-authentication)

### Environment Variables

**Backend** (production):
```bash
DATABASE_URL=postgresql://production-db-url
JWT_SECRET=<strong-production-secret>
```

**Frontend** (production):
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
AUTH_SECRET=<same-as-backend-jwt-secret>
DATABASE_URL=postgresql://production-db-url
```

---

## Summary

**Backend Changes**:
- Added PyJWT dependency
- Created JWT middleware (`backend/src/middleware/auth.py`)
- Updated config to load JWT_SECRET
- Modified all task endpoints to use JWT authentication

**Frontend Changes**:
- Installed Better Auth
- Configured JWT provider with shared secret
- Created API client with automatic token attachment
- Created login/register pages

**Testing**:
- Verify unauthorized requests return 401
- Verify JWT signature validation works
- Verify user isolation (users can only access their own tasks)
- Verify token expiration after 24 hours
