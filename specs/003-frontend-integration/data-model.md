# Data Model: Frontend & Integration

**Feature**: Frontend & Integration (Spec-3)
**Date**: 2026-01-09
**Phase**: Phase 1 - Design

## Overview

This document defines the data entities and their relationships for the Frontend & Integration feature. The data model is shared between frontend (Next.js) and backend (FastAPI), with the database managed by Neon PostgreSQL.

## Entity Definitions

### User Entity

**Managed By**: Better Auth (Spec-2)
**Storage**: Neon PostgreSQL `users` table
**Purpose**: Represents a user account with authentication credentials

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | string(255) | UNIQUE, NOT NULL, INDEX | User email address (used for login) |
| password_hash | string(255) | NOT NULL | Bcrypt hashed password (managed by Better Auth) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Account creation timestamp (UTC) |

**Relationships**:
- One-to-Many with Task (user.id → task.user_id)

**Validation Rules**:
- Email must be RFC 5322 compliant
- Password must be at least 8 characters with uppercase, lowercase, and number
- Email must be unique across all users

**State Transitions**:
- Created → Active (on successful registration)
- No deletion or deactivation in current scope

**Frontend Representation** (TypeScript):
```typescript
interface User {
  id: number;
  email: string;
  created_at: string; // ISO 8601 format
}
```

**Backend Representation** (Python/SQLModel):
```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, nullable=False, unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user")
```

---

### Task Entity

**Managed By**: Backend API (Spec-1)
**Storage**: Neon PostgreSQL `tasks` table
**Purpose**: Represents a todo item with ownership and completion status

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | Unique task identifier |
| title | string(500) | NOT NULL | Task title/summary |
| description | string(5000) | NULLABLE | Detailed task description (optional) |
| is_completed | boolean | NOT NULL, DEFAULT FALSE, INDEX | Completion status |
| user_id | integer | FOREIGN KEY(users.id), NOT NULL, INDEX | Owner of the task |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Task creation timestamp (UTC) |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last modification timestamp (UTC) |

**Relationships**:
- Many-to-One with User (task.user_id → user.id)

**Validation Rules**:
- Title is required (max 500 characters)
- Description is optional (max 5000 characters)
- user_id must reference existing user
- is_completed defaults to false

**State Transitions**:
- Created → Active (on creation)
- Active → Completed (when user marks complete)
- Completed → Active (when user marks incomplete)
- Active/Completed → Deleted (when user deletes)

**Frontend Representation** (TypeScript):
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// For create/update operations
interface TaskCreate {
  title: string;
  description?: string;
}

interface TaskUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
}
```

**Backend Representation** (Python/SQLModel):
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False, nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: Optional["User"] = Relationship(back_populates="tasks")
```

---

### JWT Token Entity

**Managed By**: Better Auth (Spec-2)
**Storage**: httpOnly cookie (browser-managed)
**Purpose**: Represents authentication credentials for API requests

**Fields** (JWT Claims):

| Claim | Type | Description |
|-------|------|-------------|
| sub | string | Subject - user ID |
| email | string | User email address |
| iat | integer | Issued at timestamp (Unix epoch) |
| exp | integer | Expiration timestamp (Unix epoch, iat + 24 hours) |

**Validation Rules**:
- Token must be signed with HS256 algorithm
- Token must not be expired (exp > current time)
- Token signature must be valid (verified with AUTH_SECRET/JWT_SECRET)

**Frontend Representation** (TypeScript):
```typescript
interface JWTPayload {
  sub: string; // user ID
  email: string;
  iat: number; // issued at (Unix timestamp)
  exp: number; // expiration (Unix timestamp)
}
```

**Backend Representation** (Python):
```python
# JWT payload structure (decoded)
{
    "sub": "123",  # user ID as string
    "email": "user@example.com",
    "iat": 1704844800,  # issued at (Unix timestamp)
    "exp": 1704931200   # expiration (Unix timestamp)
}
```

---

### Session Entity

**Managed By**: Browser + Better Auth
**Storage**: httpOnly cookie named `better-auth.session_token`
**Purpose**: Represents an authenticated user session

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| token | string | JWT token (stored in httpOnly cookie) |
| maxAge | integer | Cookie expiration (24 hours in seconds) |
| httpOnly | boolean | Always true (XSS protection) |
| secure | boolean | True in production (HTTPS only) |
| sameSite | string | "lax" or "strict" (CSRF protection) |

**Lifecycle**:
- Created on successful login/registration
- Validated on every API request
- Expired after 24 hours
- Cleared on logout

**Frontend Representation** (TypeScript):
```typescript
// Session is managed by browser cookies
// Frontend extracts token from cookie for API requests
function getAuthToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "better-auth.session_token") {
      return value;
    }
  }
  return null;
}
```

---

## Entity Relationships

### ER Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      Task       │
├─────────────────┤
│ id (PK)         │
│ title           │
│ description     │
│ is_completed    │
│ user_id (FK)    │◄─── Foreign Key to User.id
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│   JWT Token     │
├─────────────────┤
│ sub (user_id)   │◄─── References User.id
│ email           │
│ iat             │
│ exp             │
└─────────────────┘
         │
         │ Stored in
         ▼
┌─────────────────┐
│    Session      │
│  (httpOnly      │
│   cookie)       │
└─────────────────┘
```

### Relationship Rules

1. **User → Task** (One-to-Many):
   - One user can have many tasks
   - Each task belongs to exactly one user
   - Cascade delete: When user is deleted, all their tasks are deleted
   - User isolation: Users can only access their own tasks

2. **User → JWT Token** (One-to-Many):
   - One user can have multiple active tokens (multiple sessions)
   - Each token references exactly one user (via `sub` claim)
   - Token expiration: Tokens expire after 24 hours
   - No cascade: Token expiration doesn't affect user

3. **JWT Token → Session** (One-to-One):
   - Each session contains exactly one JWT token
   - Token is stored in httpOnly cookie
   - Session lifecycle tied to token expiration

## Data Flow

### Registration Flow

```
1. User submits registration form
   ↓
2. Better Auth validates email and password
   ↓
3. Better Auth hashes password (bcrypt)
   ↓
4. Better Auth inserts User record into database
   ↓
5. Better Auth generates JWT token with user.id in `sub` claim
   ↓
6. Better Auth sets httpOnly cookie with JWT token
   ↓
7. Frontend redirects to /tasks
```

### Authentication Flow

```
1. User submits login form
   ↓
2. Better Auth verifies email and password
   ↓
3. Better Auth generates JWT token with user.id in `sub` claim
   ↓
4. Better Auth sets httpOnly cookie with JWT token
   ↓
5. Frontend redirects to /tasks
```

### Task CRUD Flow

```
1. Frontend extracts JWT token from httpOnly cookie
   ↓
2. Frontend attaches token to Authorization header
   ↓
3. Backend validates JWT token signature and expiration
   ↓
4. Backend extracts user_id from token `sub` claim
   ↓
5. Backend filters query by user_id (user isolation)
   ↓
6. Backend performs CRUD operation
   ↓
7. Backend returns response
   ↓
8. Frontend updates UI
```

## Database Schema

### SQL Schema (PostgreSQL)

```sql
-- Users table (managed by Better Auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Tasks table (managed by backend)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
```

### Database Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | idx_users_email | email | Fast user lookup by email (login) |
| tasks | idx_tasks_user_id | user_id | Fast task filtering by owner (user isolation) |
| tasks | idx_tasks_is_completed | is_completed | Fast filtering by completion status |

## Data Validation

### Client-Side Validation (Frontend)

**User Registration**:
- Email: RFC 5322 format validation
- Password: Min 8 chars, uppercase, lowercase, number
- Confirm password: Must match password

**Task Create/Update**:
- Title: Required, max 500 characters
- Description: Optional, max 5000 characters

### Server-Side Validation (Backend)

**User Registration** (Better Auth):
- Email: Unique, RFC 5322 format
- Password: Min 8 chars, complexity requirements
- Hash password with bcrypt

**Task Operations** (Backend API):
- Title: Required, max 500 characters
- Description: Optional, max 5000 characters
- user_id: Must match authenticated user (from JWT)
- Task ownership: Verify user owns task before update/delete

## Security Considerations

### User Isolation

**Enforcement**: Backend middleware validates JWT and filters all queries by user_id
**Verification**: Every task query includes `WHERE user_id = <authenticated_user_id>`
**Protection**: Users cannot access or modify other users' tasks

### Password Security

**Storage**: Bcrypt hashed passwords (managed by Better Auth)
**Transmission**: HTTPS only in production
**Validation**: Server-side only (never trust client)

### Token Security

**Storage**: httpOnly cookies (XSS protection)
**Transmission**: Authorization header with Bearer scheme
**Validation**: Backend validates signature and expiration on every request
**Expiration**: 24 hours (configurable)

## Data Migration

**Note**: No migrations needed for Spec-3. Database schema already exists from Spec-1 and Spec-2.

**Existing Tables**:
- `users` table created by Better Auth (Spec-2)
- `tasks` table created by backend (Spec-1)

**Verification**:
- Confirm tables exist before starting frontend implementation
- Verify indexes are created for performance
- Test user isolation with multiple user accounts

## Conclusion

The data model is well-defined with clear entity relationships and validation rules. All entities are already implemented in Spec-1 and Spec-2. Spec-3 (Frontend & Integration) consumes these entities through API contracts without modifying the database schema.

**Next**: Create API contracts in contracts/ directory
