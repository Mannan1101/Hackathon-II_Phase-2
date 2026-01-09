# Data Model: Authentication & Security Integration

**Feature**: 002-user-auth-jwt
**Date**: 2026-01-09
**Purpose**: JWT token structure and user entity integration

---

## JWT Token (Not Stored in Database)

**Purpose**: Stateless authentication credential issued by Better Auth, verified by FastAPI

### Token Structure

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload (Claims)
```json
{
  "sub": "123",                    // User ID (string)
  "email": "user@example.com",     // User email
  "iat": 1704801600,               // Issued at (Unix timestamp)
  "exp": 1704888000                // Expiration (Unix timestamp)
}
```

#### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Complete Token Example

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQ4MDE2MDAsImV4cCI6MTcwNDg4ODAwMH0.signature_here
```

### Field Specifications

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| sub | string | Yes | User ID from database | Must be numeric string, maps to User.id |
| email | string | Yes | User email address | Valid email format, matches User.email |
| iat | integer | Yes | Token issued timestamp | Unix timestamp, must be in past |
| exp | integer | Yes | Token expiration timestamp | Unix timestamp, must be in future, iat + 24h |

### Token Lifecycle

1. **Issuance**: Better Auth creates token on successful login/registration
2. **Storage**: Stored in httpOnly cookie by Better Auth
3. **Transmission**: Frontend extracts from cookie, attaches to Authorization header
4. **Verification**: FastAPI validates signature using shared secret
5. **Expiration**: Token invalid after 24 hours, user must re-authenticate

**No Database Tables Required**: Authentication is stateless - no tokens stored in database

---

## User Entity Integration

### Existing User Model (from Spec-1)

**No changes needed** - User model already exists from Backend Core & Data Layer:

```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, nullable=False, unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    tasks: List["Task"] = Relationship(back_populates="user")
```

### JWT Integration

- `User.id` → JWT `sub` claim (as string)
- `User.email` → JWT `email` claim
- Better Auth manages password hashing (not in FastAPI database)

### Database Schema

**No new tables required** - Authentication is stateless

**Existing tables** (from Spec-1):
- `users` table: Minimal user reference for task ownership
- `tasks` table: Task data with `user_id` foreign key

### Important Notes

1. **Better Auth User Storage**: Better Auth maintains its own user table in Next.js database for authentication purposes (email, hashed password, etc.)

2. **FastAPI User Table**: FastAPI User table is minimal reference for task ownership only - does not store passwords or authentication data

3. **User Identity Flow**:
   ```
   Better Auth DB (Next.js) → Issues JWT with user ID → FastAPI validates JWT → Extracts user ID → Queries tasks by user_id
   ```

4. **No Password Storage in FastAPI**: Passwords are hashed and stored by Better Auth only - FastAPI never sees or stores passwords

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Registration Flow                        │
└─────────────────────────────────────────────────────────────────┘

User → Better Auth (Next.js)
         ↓
      Validates email/password
         ↓
      Stores in Better Auth DB (email, hashed password)
         ↓
      Creates User record in FastAPI DB (id, email only)
         ↓
      Issues JWT token (sub: user_id, email)
         ↓
      Returns token to frontend


┌─────────────────────────────────────────────────────────────────┐
│                      Authenticated Request Flow                  │
└─────────────────────────────────────────────────────────────────┘

Frontend → Extracts JWT from cookie
            ↓
         Attaches to Authorization: Bearer header
            ↓
         Sends request to FastAPI
            ↓
         FastAPI validates JWT signature (no DB lookup)
            ↓
         Extracts user_id from 'sub' claim
            ↓
         Queries tasks WHERE user_id = extracted_id
            ↓
         Returns user's tasks only
```

---

## Security Considerations

1. **Stateless Authentication**: No session storage in database - JWT signature verification only
2. **User Isolation**: All database queries filtered by JWT-extracted user_id
3. **Password Security**: Passwords never stored in FastAPI database - Better Auth handles hashing
4. **Token Expiration**: 24-hour expiration enforces re-authentication
5. **Shared Secret**: Must be kept secure and synchronized between frontend and backend

---

## Migration from Spec-1

**No database schema changes required** - User and Task tables remain unchanged

**Only code changes**:
- Endpoints change from `user_id: int = Query(...)` to `user_id: int = Depends(get_current_user_id)`
- User identity source changes from query parameter to JWT token
- Database queries remain identical (still filter by user_id)
