# Research: Authentication & Security Integration

**Feature**: 002-user-auth-jwt
**Date**: 2026-01-09
**Purpose**: Technical decisions and architecture research for JWT-based authentication

## Overview

This document captures the technical decisions, alternatives considered, and rationale for implementing JWT-based authentication between Next.js (Better Auth) and FastAPI backend.

---

## Decision 1: JWT Token Structure & Claims

**Selected Approach**: HS256-signed JWT with standard claims + custom user identity

### JWT Payload Structure

```json
{
  "sub": "123",           // Subject: user ID (string representation)
  "email": "user@example.com",
  "iat": 1704801600,      // Issued at (Unix timestamp)
  "exp": 1704888000       // Expiration (Unix timestamp, 24 hours later)
}
```

### Rationale

- **`sub` (subject)**: Standard JWT claim for user identity - maps to User.id from database
- **`email`**: Provides additional context for logging/debugging without database lookup
- **`iat`**: Enables token age verification and audit trails
- **`exp`**: Enforces session expiration (24 hours default, configurable)
- **HS256 algorithm**: Uses symmetric key (shared secret) - simpler than RSA for single-service auth
- **No custom claims**: Keeps token minimal and standard-compliant

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|---------------------|
| RS256 (asymmetric) | Overkill for frontend/backend sharing same secret, adds key management complexity |
| Custom claims (roles, permissions) | Deferred to future specs - current requirement is user identity only |
| Refresh tokens | Out of scope per spec.md - single access token with 24h expiration |

### Security Considerations

- Shared secret must be 256+ bits (32+ characters) for HS256 security
- Token expiration forces re-authentication, limiting exposure window
- Email in token enables security logging without database queries

---

## Decision 2: Better Auth Integration Strategy

**Selected Approach**: Better Auth handles all authentication flows, issues JWT tokens with shared secret

### Integration Points

#### Frontend (Next.js)
- Better Auth configuration with JWT provider
- Shared secret configured in `.env.local` as `AUTH_SECRET`
- Better Auth automatically issues JWT on successful login/registration
- Token stored in httpOnly cookie (Better Auth default) for XSS protection

#### Token Issuance Flow
```
User → Better Auth (Next.js) → Validates credentials → Issues JWT (signed with AUTH_SECRET) → Returns to frontend
```

#### API Request Flow
```
Frontend → Extracts JWT from cookie → Attaches to Authorization: Bearer header → FastAPI validates signature
```

### Rationale

- Better Auth is designed for Next.js and handles authentication complexity (password hashing, session management)
- JWT provider in Better Auth supports custom secret configuration
- httpOnly cookies prevent JavaScript access, mitigating XSS attacks
- Frontend API client extracts token from cookie and attaches to requests

### Configuration Requirements

- Better Auth must be configured with `jwt` provider and custom secret
- Frontend must implement API client that reads cookie and sets Authorization header
- Both services must use identical `AUTH_SECRET` / `JWT_SECRET` value

---

## Decision 3: FastAPI JWT Verification Middleware

**Selected Approach**: FastAPI dependency injection with JWT verification function

### Implementation Strategy

**File**: `backend/src/middleware/auth.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Extract and validate JWT token, return user ID.
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
                detail={"error": {"code": "INVALID_TOKEN", "message": "Token missing user identity"}}
            )

        # Convert to integer
        user_id = int(user_id_str)
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "TOKEN_EXPIRED", "message": "Token has expired"}}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_TOKEN", "message": "Invalid token signature"}}
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_TOKEN", "message": "Invalid user ID format"}}
        )
```

### Usage in Endpoints

```python
@router.get("/tasks")
async def list_tasks(
    user_id: int = Depends(get_current_user_id),  # Replaces Query parameter
    session: Session = Depends(get_session)
):
    # user_id is now extracted from JWT, not query parameter
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return TaskListResponse(tasks=tasks, total=len(tasks))
```

### Rationale

- FastAPI dependency injection provides clean separation of concerns
- HTTPBearer automatically extracts "Authorization: Bearer <token>" header
- Centralized validation logic ensures consistency across all endpoints
- Explicit error codes enable frontend to handle different failure scenarios
- No database lookups - purely cryptographic verification (stateless)

### Performance

- JWT verification is CPU-bound (HMAC-SHA256 computation)
- Expected overhead: <5ms per request on modern hardware
- No network I/O or database queries
- Scales horizontally without shared state

---

## Decision 4: Frontend API Client Strategy

**Selected Approach**: Fetch wrapper with automatic token attachment

### Implementation Strategy

**File**: `frontend/src/lib/api-client.ts`

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

### Usage Example

```typescript
// Create task
const task = await apiRequest<Task>('/tasks', {
  method: 'POST',
  body: JSON.stringify({ title: 'Buy groceries', description: 'Milk, eggs' })
});

// List tasks (no user_id parameter needed)
const tasks = await apiRequest<TaskListResponse>('/tasks');
```

### Rationale

- Centralized token management - all API calls automatically authenticated
- Better Auth cookie name is configurable but follows convention
- Error handling for 401 enables automatic redirect to login
- Type-safe with TypeScript generics
- Environment variable for API URL enables different backends (dev/prod)

---

## Decision 5: Shared Secret Management

**Selected Approach**: Environment variables with validation on startup

### Configuration

**Backend** (`backend/.env`):
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security
```

**Critical Requirement**: `JWT_SECRET` (backend) and `AUTH_SECRET` (frontend) MUST be identical

### Validation Strategy

```python
# backend/src/config.py
class Settings:
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")

    def __init__(self):
        if not self.JWT_SECRET:
            raise ValueError("JWT_SECRET environment variable is required")
        if len(self.JWT_SECRET) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters for HS256 security")
```

### Rationale

- Environment variables prevent secrets in version control
- Startup validation fails fast if misconfigured
- 32-character minimum ensures 256-bit security for HS256
- Separate files (.env vs .env.local) follow framework conventions

### Secret Generation

```bash
# Generate secure random secret
openssl rand -base64 32
# Output: e.g., "Kx8vJ2mP9nQ4rS5tU6vW7xY8zA1bC2dE3fG4hI5jK6l="
```

---

## Decision 6: Migration Strategy from Spec-1 to Spec-2

### Current State (Spec-1)
Endpoints accept `user_id` as query parameter:

```python
@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    user_id: int = Query(..., gt=0),  # Query parameter
    session: Session = Depends(get_session)
):
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    # ...
```

### Target State (Spec-2)
Endpoints extract `user_id` from JWT:

```python
@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),  # JWT dependency
    session: Session = Depends(get_session)
):
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    # ... (rest of logic unchanged)
```

### Migration Steps

1. Add `backend/src/middleware/auth.py` with `get_current_user_id` dependency
2. Update `backend/src/config.py` to load `JWT_SECRET`
3. Add `PyJWT` to `requirements.txt`
4. Update all task endpoints to use `Depends(get_current_user_id)` instead of `Query(...)`
5. Remove `user_id` from query parameters in OpenAPI spec
6. Update tests to include Authorization header

### Backward Compatibility

None - this is a breaking change by design (security upgrade)

### Rationale

- Query parameter approach was "pre-auth-ready" design in Spec-1
- JWT extraction is drop-in replacement - same variable name, same type
- Business logic remains unchanged - only authentication mechanism changes
- Clean separation: authentication (middleware) vs authorization (business logic)

---

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Frontend Auth | Better Auth | Latest | User registration, login, JWT issuance |
| JWT Library (Backend) | PyJWT | 2.8+ | JWT signature verification |
| HTTP Security | HTTPBearer (FastAPI) | Built-in | Authorization header extraction |
| Token Storage | httpOnly Cookie | N/A | XSS-safe token storage |
| Signing Algorithm | HS256 | N/A | Symmetric key JWT signing |

---

## Security Considerations

1. **Token Expiration**: 24-hour expiration limits exposure window if token compromised
2. **httpOnly Cookies**: Prevents JavaScript access to tokens (XSS mitigation)
3. **HTTPS Required**: Production must use HTTPS to prevent token interception
4. **Secret Strength**: 32+ character secret ensures 256-bit security for HS256
5. **No Token Storage in Database**: Stateless design prevents token theft via database breach
6. **Error Messages**: Generic 401 responses don't reveal whether user exists (prevents enumeration)
7. **Logging**: Failed authentication attempts logged with context for security monitoring

---

## Performance Characteristics

- **Token Verification**: <5ms per request (CPU-bound HMAC-SHA256)
- **No Database Lookups**: Stateless verification scales horizontally
- **Memory Overhead**: Minimal - JWT payload ~200 bytes
- **Network Overhead**: ~100 bytes per request (Authorization header)
- **Concurrent Requests**: No shared state - supports 1000+ concurrent authenticated requests

---

## Open Questions Resolved

1. **Q: How does Better Auth issue JWT tokens?**
   - A: Better Auth has built-in JWT provider - configure with `jwt` adapter and `AUTH_SECRET`

2. **Q: How does frontend extract token from httpOnly cookie?**
   - A: Server-side API client (Next.js server components) can access cookies via `next/headers`

3. **Q: What happens when token expires during active session?**
   - A: Frontend receives 401, redirects to login - user must re-authenticate (no refresh token in Spec-2)

4. **Q: How to test JWT authentication locally?**
   - A: Use curl with `-H "Authorization: Bearer <token>"` or generate test tokens with PyJWT
