# Implementation Plan: Authentication & Security Integration

**Branch**: `002-user-auth-jwt` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-user-auth-jwt/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement JWT-based authentication for cross-service identity verification between Next.js frontend (Better Auth) and FastAPI backend. Better Auth handles user registration and login, issuing HS256-signed JWT tokens with a shared secret. FastAPI validates token signatures using dependency injection middleware, extracts user identity from the `sub` claim, and enforces user isolation on all protected task endpoints. Authentication is stateless (no database lookups for token verification), enabling horizontal scaling. All existing Spec-1 task endpoints are modified to use JWT-extracted user identity instead of query parameters.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 18+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI, PyJWT 2.8+, SQLModel, python-dotenv
- Frontend: Next.js 16+ (App Router), Better Auth, TypeScript
**Storage**: Neon Serverless PostgreSQL (existing from Spec-1, no schema changes)
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Linux server for backend, browser for frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- JWT verification: <5ms per request
- Token validation: 100+ concurrent authenticated requests
- No database lookups for authentication (stateless)
**Constraints**:
- Token expiration: 24 hours (configurable)
- Shared secret: 32+ characters (256-bit security for HS256)
- httpOnly cookies for XSS protection
- HTTPS required in production
**Scale/Scope**:
- Multi-user support with user isolation
- Stateless authentication (horizontal scaling)
- 5 protected endpoints (all Spec-1 task endpoints)
- 2 authentication flows (registration, login)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development
✅ **PASS** - Complete specification exists at `specs/002-user-auth-jwt/spec.md` with 3 user stories, 22 functional requirements, and 12 success criteria. All implementation will follow approved spec.

### Principle II: Agentic Workflow Compliance
✅ **PASS** - Following mandatory workflow: spec (complete) → plan (this document) → tasks (next phase) → implementation. No manual coding permitted.

### Principle III: Security-First Design
✅ **PASS** - Security is foundational:
- All API endpoints (except auth) validate JWT tokens via middleware
- All database queries are user-scoped (JWT-extracted user_id)
- Task ownership enforced on every CRUD operation
- Unauthorized requests return 401 consistently
- No secrets hardcoded - JWT_SECRET in environment variables only
- httpOnly cookies prevent XSS attacks
- Token expiration limits exposure window

### Principle IV: Deterministic Behavior
✅ **PASS** - System behavior is consistent:
- JWT validation is deterministic (cryptographic signature verification)
- Same token always produces same user_id extraction
- No random behavior or race conditions
- Stateless authentication ensures consistent behavior across requests

### Principle V: Full-Stack Coherence
✅ **PASS** - Frontend, backend, and database integrate seamlessly:
- API contracts defined in `contracts/auth-api.yaml`
- Frontend API client matches backend JWT expectations
- Database schema supports all operations (no changes needed from Spec-1)
- Error responses consistent across all layers (401 for auth failures)
- Shared secret synchronized between frontend (AUTH_SECRET) and backend (JWT_SECRET)

### Technology Constraints Compliance
✅ **PASS** - Using fixed technology stack:
- Frontend: Next.js 16+ (App Router) ✓
- Backend: Python FastAPI ✓
- ORM: SQLModel ✓
- Database: Neon Serverless PostgreSQL ✓
- Authentication: Better Auth (JWT-based) ✓

### Authentication Standards Compliance
✅ **PASS** - Meets all authentication standards:
- Authentication uses Better Auth with JWT tokens ✓
- All backend routes validate JWT and enforce task ownership ✓
- Stateless backend authentication (JWT only, no sessions) ✓
- All database queries are user-scoped ✓

### Security Standards Compliance
✅ **PASS** - Meets all security standards:
- No hard-coded secrets; environment variables only ✓
- Multi-user support is mandatory ✓
- Data persistence required across sessions ✓

**Overall Status**: ✅ **ALL GATES PASSED** - Ready to proceed with implementation

## Project Structure

### Documentation (this feature)

```text
specs/002-user-auth-jwt/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - JWT token structure
├── quickstart.md        # Phase 1 output - setup instructions
├── contracts/
│   └── auth-api.yaml    # Phase 1 output - API contracts
├── checklists/
│   └── requirements.md  # Specification quality validation
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── middleware/
│   │   └── auth.py           # NEW: JWT verification middleware
│   ├── models/
│   │   ├── user.py           # Existing from Spec-1 (no changes)
│   │   └── task.py           # Existing from Spec-1 (no changes)
│   ├── schemas/
│   │   ├── task.py           # Existing from Spec-1 (no changes)
│   │   └── error.py          # Existing from Spec-1 (no changes)
│   ├── api/
│   │   └── routes/
│   │       └── tasks.py      # MODIFIED: Use JWT auth instead of query params
│   ├── config.py             # MODIFIED: Add JWT_SECRET validation
│   ├── database.py           # Existing from Spec-1 (no changes)
│   └── main.py               # Existing from Spec-1 (no changes)
├── tests/
│   ├── conftest.py           # MODIFIED: Add JWT token fixtures
│   └── test_auth.py          # NEW: JWT authentication tests
├── requirements.txt          # MODIFIED: Add PyJWT==2.8.0
├── .env.example              # MODIFIED: Add JWT_SECRET template
└── README.md                 # Existing from Spec-1

frontend/
├── src/
│   ├── lib/
│   │   ├── auth.ts           # NEW: Better Auth configuration
│   │   └─ api-client.ts     # NEW: API client with JWT attachment
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx      # NEW: Login page
│   │   ├── register/
│   │   │   └── page.tsx      # NEW: Registration page
│   │   └── tasks/
│   │       └── page.tsx      # NEW: Tasks page (uses api-client)
│   └── components/
│       └── auth/             # NEW: Auth-related components
├── .env.local.example        # NEW: Frontend environment variables
├── package.json              # NEW: Dependencies (Next.js, Better Auth)
└── tsconfig.json             # NEW: TypeScript configuration
```

**Structure Decision**: Web application structure (Option 2) selected because:
- Feature requires both frontend (Next.js + Better Auth) and backend (FastAPI + JWT verification)
- Frontend handles user authentication flows (registration, login)
- Backend validates JWT tokens and enforces user isolation
- Clear separation of concerns: authentication (frontend) vs authorization (backend)
- Existing backend structure from Spec-1 is preserved with minimal modifications

**Key Changes from Spec-1**:
- **Backend**: Add JWT middleware, modify task endpoints to use JWT auth, add PyJWT dependency
- **Frontend**: New Next.js application with Better Auth integration and API client
- **No database schema changes**: Authentication is stateless, existing User/Task tables unchanged

## Complexity Tracking

> **No violations detected** - All constitution principles and standards are satisfied.

No complexity tracking required. Implementation follows established patterns:
- FastAPI dependency injection for JWT verification (standard pattern)
- Better Auth for Next.js authentication (recommended library)
- Stateless JWT authentication (industry best practice)
- Environment variables for secrets (security standard)

---

## Implementation Approach

### Phase 0: Research (Completed)
✅ Technical decisions documented in `research.md`:
- JWT token structure (HS256, standard claims)
- Better Auth integration strategy
- FastAPI JWT verification middleware design
- Frontend API client strategy
- Shared secret management
- Migration strategy from Spec-1

### Phase 1: Design & Contracts (Completed)
✅ Data model documented in `data-model.md`:
- JWT token structure (header, payload, signature)
- User entity integration (no changes from Spec-1)
- Token lifecycle and security considerations

✅ API contracts documented in `contracts/auth-api.yaml`:
- Authentication endpoints (Better Auth reference)
- Protected task endpoints with JWT security
- Error response schemas
- JWT token schema

✅ Setup instructions documented in `quickstart.md`:
- Backend JWT verification setup
- Frontend Better Auth configuration
- Testing procedures
- Troubleshooting guide

### Phase 2: Tasks Generation (Next Step)
Run `/sp.tasks` to generate implementation tasks based on this plan.

Expected task breakdown:
1. **Backend JWT Middleware** (3-5 tasks):
   - Create `middleware/auth.py` with JWT verification
   - Update `config.py` to load JWT_SECRET
   - Add PyJWT to requirements.txt
   - Update `.env.example` with JWT_SECRET

2. **Backend Endpoint Migration** (5-7 tasks):
   - Modify GET /tasks to use JWT auth
   - Modify POST /tasks to use JWT auth
   - Modify GET /tasks/{task_id} to use JWT auth
   - Modify PUT /tasks/{task_id} to use JWT auth
   - Modify DELETE /tasks/{task_id} to use JWT auth
   - Update tests to include Authorization header

3. **Frontend Better Auth Setup** (4-6 tasks):
   - Install Better Auth and dependencies
   - Create `lib/auth.ts` configuration
   - Create `lib/api-client.ts` with JWT attachment
   - Configure environment variables

4. **Frontend Auth Pages** (3-5 tasks):
   - Create login page
   - Create registration page
   - Create tasks page with API integration
   - Add authentication error handling

5. **Integration Testing** (2-3 tasks):
   - Test unauthorized requests return 401
   - Test JWT signature validation
   - Test user isolation enforcement

**Total Estimated Tasks**: 17-26 tasks across 5 phases

---

## Architecture Decisions

### Decision 1: HS256 vs RS256 for JWT Signing
**Selected**: HS256 (symmetric key)
**Rationale**: Simpler for single-service authentication where frontend and backend share the same secret. RS256 (asymmetric) adds unnecessary complexity for this use case.

### Decision 2: Stateless vs Stateful Authentication
**Selected**: Stateless (JWT only, no session storage)
**Rationale**: Enables horizontal scaling without shared session state. Aligns with constitution requirement for stateless backend authentication.

### Decision 3: Token Storage Location
**Selected**: httpOnly cookies
**Rationale**: Prevents XSS attacks by making tokens inaccessible to JavaScript. Better Auth default configuration.

### Decision 4: Token Expiration Duration
**Selected**: 24 hours (configurable)
**Rationale**: Balances security (limits exposure window) with user experience (reduces re-authentication frequency).

### Decision 5: Migration Strategy from Spec-1
**Selected**: Breaking change (replace query parameter with JWT dependency)
**Rationale**: Security upgrade justifies breaking change. Clean separation between authentication (middleware) and authorization (business logic).

---

## Security Considerations

1. **Shared Secret Management**:
   - Must be 32+ characters for HS256 security
   - Stored in environment variables only
   - Synchronized between frontend (AUTH_SECRET) and backend (JWT_SECRET)
   - Validated on application startup

2. **Token Validation**:
   - Signature verification using shared secret
   - Expiration check (24-hour limit)
   - User identity extraction from `sub` claim
   - No database lookups (stateless)

3. **User Isolation**:
   - All database queries filtered by JWT-extracted user_id
   - 404 returned if task doesn't exist OR user doesn't own it
   - Prevents enumeration attacks

4. **Error Handling**:
   - Generic 401 responses don't reveal whether user exists
   - Structured error codes for frontend handling
   - Security events logged for monitoring

5. **Production Requirements**:
   - HTTPS required (secure cookie transmission)
   - Strong JWT secret (32+ characters)
   - CORS configured for production domain only
   - Rate limiting on authentication endpoints

---

## Testing Strategy

### Backend Testing
1. **JWT Middleware Tests**:
   - Valid token returns user_id
   - Invalid token returns 401
   - Expired token returns 401
   - Missing token returns 401
   - Malformed token returns 401

2. **Endpoint Authorization Tests**:
   - All task endpoints reject requests without Authorization header
   - All task endpoints accept requests with valid JWT
   - User isolation enforced (user A cannot access user B's tasks)

### Frontend Testing
1. **Authentication Flow Tests**:
   - Registration creates account and issues token
   - Login validates credentials and issues token
   - Token stored in httpOnly cookie

2. **API Client Tests**:
   - API client attaches Authorization header to all requests
   - 401 responses trigger redirect to login
   - Error handling for network failures

### Integration Testing
1. **End-to-End Flow**:
   - Register → Login → Create Task → List Tasks → Logout
   - Verify user isolation across multiple users
   - Verify token expiration after 24 hours

---

## Deployment Checklist

- [ ] Generate strong JWT secret (32+ characters)
- [ ] Configure JWT_SECRET in backend environment
- [ ] Configure AUTH_SECRET in frontend environment (must match backend)
- [ ] Verify HTTPS enabled in production
- [ ] Configure CORS for production domain
- [ ] Set up monitoring for failed authentication attempts
- [ ] Test token expiration behavior
- [ ] Verify user isolation enforcement
- [ ] Test unauthorized access returns 401
- [ ] Verify API client handles 401 responses correctly

---

## Next Steps

1. **Run `/sp.tasks`** to generate detailed implementation tasks
2. **Review tasks** for completeness and dependencies
3. **Execute implementation** following task order
4. **Test authentication flow** end-to-end
5. **Deploy to production** following deployment checklist
