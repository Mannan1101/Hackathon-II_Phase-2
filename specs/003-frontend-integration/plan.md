# Implementation Plan: Frontend & Integration

**Branch**: `003-frontend-integration` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Next.js 16+ App Router frontend that integrates with the existing FastAPI backend (Spec-1) and Better Auth authentication system (Spec-2). Users can register, sign in, manage tasks (CRUD operations), and sign out through a responsive web interface. All operations enforce JWT-based authentication and user isolation. The frontend communicates with backend APIs using JWT tokens stored in httpOnly cookies, ensuring secure authentication without exposing tokens to JavaScript.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+, Next.js 16.1.1, React 19
**Primary Dependencies**:
- Frontend: Next.js 16+, React 19, Better Auth, TypeScript 5.0+, Tailwind CSS
- Backend: FastAPI (existing), SQLModel (existing), PyJWT 2.10.1 (existing)
- Authentication: Better Auth with JWT provider (HS256)

**Storage**: Neon PostgreSQL (shared with backend - users and tasks tables already exist)
**Testing**: Manual testing only (per spec out-of-scope)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), responsive design (320px-1920px)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- Initial page load: <2 seconds on standard broadband
- Task operations: <3 seconds from action to UI update
- Authentication flow: <10 seconds from login to tasks page

**Constraints**:
- Must integrate with existing Spec-1 backend APIs (no modifications to backend contracts)
- Must use Spec-2 authentication infrastructure (Better Auth + JWT)
- JWT secrets must be synchronized between frontend (AUTH_SECRET) and backend (JWT_SECRET)
- httpOnly cookies only (no localStorage/sessionStorage for tokens)
- Client-side validation before API submission
- User isolation enforced by backend (frontend trusts backend enforcement)

**Scale/Scope**:
- 4 user stories (P1-P4)
- 5 pages/routes: /, /register, /login, /tasks, /api/auth/*
- 32 functional requirements
- Multi-user support with isolated data
- Responsive design for 3 viewport categories (mobile, tablet, desktop)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Spec-Driven Development
- **Status**: PASS
- **Evidence**: Complete spec.md exists with 4 user stories, 32 functional requirements, 17 success criteria
- **Validation**: All implementation will follow approved spec

### ✅ II. Agentic Workflow Compliance
- **Status**: PASS
- **Evidence**: Following spec → plan → tasks workflow; this is the plan phase
- **Validation**: No manual coding; all code generated via Claude Code

### ✅ III. Security-First Design
- **Status**: PASS
- **Evidence**:
  - JWT tokens in httpOnly cookies (XSS protection)
  - Authorization header on all API requests
  - 401 handling with redirect to login
  - User isolation enforced by backend middleware
  - No secrets in code (environment variables only)
- **Validation**: FR-005, FR-006, FR-009, FR-029, FR-030, FR-031, FR-032 address security

### ✅ IV. Deterministic Behavior
- **Status**: PASS
- **Evidence**:
  - Stateless authentication (JWT only)
  - Predictable API responses
  - Consistent error handling
  - No random behavior or race conditions
- **Validation**: All user actions produce consistent, predictable outcomes

### ✅ V. Full-Stack Coherence
- **Status**: PASS
- **Evidence**:
  - Frontend integrates with existing Spec-1 backend APIs
  - Uses Spec-2 authentication infrastructure
  - API contracts defined in Spec-1 (no modifications needed)
  - JWT secret synchronization between frontend and backend
- **Validation**: Dependencies section lists Spec-1 and Spec-2 as external dependencies

**Gate Result**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-api.yaml    # Better Auth API contract
│   └── tasks-api.yaml   # Backend tasks API contract (reference)
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist (already complete)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/                 # Existing from Spec-1 and Spec-2
├── src/
│   ├── models/          # User, Task models (SQLModel)
│   ├── schemas/         # Pydantic schemas for API
│   ├── api/
│   │   └── routes/
│   │       └── tasks.py # Task CRUD endpoints
│   ├── middleware/
│   │   └── auth.py      # JWT validation middleware
│   ├── database.py      # Database connection
│   ├── config.py        # Environment configuration
│   └── main.py          # FastAPI application
├── tests/               # Backend tests (out of scope for Spec-3)
├── .env                 # Backend environment variables
└── requirements.txt     # Python dependencies

frontend/                # This feature (Spec-3)
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── page.tsx     # Home/landing page (/)
│   │   ├── register/
│   │   │   └── page.tsx # Registration page (/register)
│   │   ├── login/
│   │   │   └── page.tsx # Login page (/login)
│   │   ├── tasks/
│   │   │   └── page.tsx # Tasks management page (/tasks)
│   │   ├── layout.tsx   # Root layout
│   │   └── api/
│   │       └── auth/
│   │           └── [...all]/route.ts # Better Auth API routes
│   ├── lib/             # Shared utilities
│   │   ├── auth.ts      # Better Auth configuration
│   │   └── api-client.ts # API client with JWT handling
│   └── components/      # Reusable React components (if needed)
│       ├── TaskList.tsx # Task list display
│       ├── TaskForm.tsx # Task create/edit form
│       └── TaskItem.tsx # Individual task item
├── public/              # Static assets
├── .env.local           # Frontend environment variables
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── next.config.js       # Next.js configuration

.specify/                # SpecKit Plus templates and scripts
history/                 # Prompt History Records and ADRs
```

**Structure Decision**: Web application structure selected because this is a full-stack project with separate frontend (Next.js) and backend (FastAPI) services. The frontend directory contains all Spec-3 implementation. Backend directory is pre-existing from Spec-1 and Spec-2 and will not be modified in this feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by the current design.

## Phase 0: Research & Technology Decisions

### Research Areas

1. **Next.js 16+ App Router Architecture**
   - Decision: Use App Router with file-based routing
   - Rationale: Modern Next.js pattern, better performance, built-in layouts
   - Alternatives: Pages Router (deprecated), custom routing (unnecessary complexity)

2. **Better Auth Integration with Next.js**
   - Decision: Use Better Auth with JWT provider and httpOnly cookies
   - Rationale: Already implemented in Spec-2, secure token storage, XSS protection
   - Alternatives: NextAuth.js (different library), custom auth (reinventing wheel)

3. **State Management Strategy**
   - Decision: React hooks (useState, useEffect) for local state, no global state library
   - Rationale: Simple application, no complex shared state, avoid over-engineering
   - Alternatives: Redux (overkill), Zustand (unnecessary), Context API (not needed)

4. **API Communication Pattern**
   - Decision: Custom API client with JWT token extraction and attachment
   - Rationale: Full control over authentication flow, handles 401 redirects, type-safe
   - Alternatives: Axios (extra dependency), fetch with manual token handling (less DRY)

5. **Form Validation Approach**
   - Decision: Client-side validation with HTML5 + custom JavaScript validation
   - Rationale: Immediate feedback, reduces server load, better UX
   - Alternatives: Server-side only (poor UX), validation library (overkill for simple forms)

6. **Styling Strategy**
   - Decision: Tailwind CSS utility classes
   - Rationale: Rapid development, responsive design utilities, no custom CSS needed
   - Alternatives: CSS Modules (more boilerplate), styled-components (runtime overhead)

7. **Error Handling Pattern**
   - Decision: Try-catch with user-friendly error messages and toast notifications
   - Rationale: Graceful degradation, clear user feedback, consistent error UX
   - Alternatives: Error boundaries only (insufficient for async), silent failures (poor UX)

8. **Loading State Management**
   - Decision: Local loading state per component with visual indicators
   - Rationale: Clear feedback during async operations, prevents user confusion
   - Alternatives: Global loading (less granular), no loading states (poor UX)

### Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend Framework | Next.js | 16.1.1 | App Router, SSR/CSR, file-based routing |
| UI Library | React | 19 | Component-based, hooks, virtual DOM |
| Language | TypeScript | 5.0+ | Type safety, better DX, fewer runtime errors |
| Styling | Tailwind CSS | Latest | Utility-first, responsive, rapid development |
| Authentication | Better Auth | Latest | JWT provider, httpOnly cookies, Spec-2 integration |
| HTTP Client | Fetch API | Native | No extra dependencies, modern browsers support |
| State Management | React Hooks | Native | useState, useEffect - sufficient for app complexity |
| Backend API | FastAPI | Existing | RESTful endpoints from Spec-1 |
| Database | Neon PostgreSQL | Existing | Shared with backend, users and tasks tables |

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Key Entities**:
- **User**: Managed by Better Auth (email, password hash, id)
- **Task**: Managed by backend (id, title, description, is_completed, user_id, timestamps)
- **JWT Token**: Issued by Better Auth (sub, email, iat, exp)
- **Session**: Browser-managed httpOnly cookie containing JWT token

### API Contracts

See [contracts/](./contracts/) directory for complete API specifications.

**Authentication APIs** (Better Auth):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

**Task APIs** (Backend from Spec-1):
- `GET /tasks` - List all tasks for authenticated user
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get single task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Component Architecture

**Pages** (App Router):
1. `app/page.tsx` - Landing page with links to register/login
2. `app/register/page.tsx` - Registration form
3. `app/login/page.tsx` - Login form
4. `app/tasks/page.tsx` - Task management interface
5. `app/layout.tsx` - Root layout with navigation

**Shared Components**:
1. `TaskList.tsx` - Display list of tasks
2. `TaskForm.tsx` - Create/edit task form
3. `TaskItem.tsx` - Individual task with actions (edit, delete, toggle)

**Utilities**:
1. `lib/auth.ts` - Better Auth configuration
2. `lib/api-client.ts` - API client with JWT handling

### Integration Points

1. **Frontend → Better Auth**:
   - Registration: Form submission → Better Auth API → JWT token → httpOnly cookie
   - Login: Form submission → Better Auth API → JWT token → httpOnly cookie
   - Logout: API call → Clear cookie → Redirect to login

2. **Frontend → Backend API**:
   - Extract JWT from httpOnly cookie
   - Attach to Authorization header: `Bearer <token>`
   - Make API request
   - Handle 401 → Redirect to login
   - Handle success → Update UI

3. **Backend → Database**:
   - JWT middleware validates token
   - Extracts user_id from token claims
   - Queries filtered by user_id (user isolation)

### Security Architecture

1. **Token Storage**: httpOnly cookies (XSS protection)
2. **Token Transmission**: Authorization header (standard pattern)
3. **Token Validation**: Backend middleware (every protected endpoint)
4. **User Isolation**: Backend enforces user_id filtering (frontend trusts backend)
5. **Input Validation**: Client-side (UX) + Server-side (security)
6. **CORS**: Backend configured to allow frontend origin
7. **HTTPS**: Required in production for secure cookie transmission

### User Flow Diagrams

**Registration Flow**:
```
User → /register page → Fill form → Submit
  → Better Auth API → Validate → Hash password → Store in DB
  → Generate JWT → Set httpOnly cookie → Redirect to /tasks
```

**Login Flow**:
```
User → /login page → Enter credentials → Submit
  → Better Auth API → Verify password → Generate JWT
  → Set httpOnly cookie → Redirect to /tasks
```

**Task Management Flow**:
```
User → /tasks page → Extract JWT from cookie
  → GET /tasks with Authorization header → Backend validates JWT
  → Filter tasks by user_id → Return tasks → Display in UI

User → Create task → POST /tasks with Authorization header
  → Backend validates JWT → Insert with user_id → Return task
  → Update UI with new task

User → Edit task → PUT /tasks/{id} with Authorization header
  → Backend validates JWT + ownership → Update task → Return updated
  → Update UI

User → Delete task → DELETE /tasks/{id} with Authorization header
  → Backend validates JWT + ownership → Delete task → Return success
  → Remove from UI
```

**Logout Flow**:
```
User → Click logout → POST /api/auth/logout
  → Clear httpOnly cookie → Redirect to /login
```

## Phase 2: Task Generation

**Note**: Task generation is handled by the `/sp.tasks` command, not `/sp.plan`.

The tasks will be organized into these categories:
1. **Setup & Configuration** - Environment setup, dependencies
2. **Authentication Pages** - Register, login, logout functionality
3. **Task Management Pages** - Tasks list, CRUD operations
4. **API Integration** - API client, error handling, loading states
5. **Responsive Design** - Mobile, tablet, desktop layouts
6. **Testing & Validation** - Manual testing of all user stories

## Architectural Decision Records

No ADRs required for this feature. All architectural decisions follow established patterns from Spec-1 and Spec-2:
- Backend architecture defined in Spec-1
- Authentication architecture defined in Spec-2
- Frontend follows standard Next.js App Router patterns

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret mismatch between frontend and backend | High - Authentication fails | Validate secrets match during setup, document synchronization requirement |
| CORS misconfiguration | High - API requests blocked | Configure backend CORS to allow frontend origin, test in development |
| Token expiration during active use | Medium - User interrupted | Handle 401 gracefully with redirect and message, implement token refresh if needed |
| Port conflicts during development | Low - Cannot start servers | Document port configuration, provide alternative ports |
| Browser compatibility issues | Medium - Some users cannot access | Test on all target browsers, use standard web APIs |

## Dependencies

### External Dependencies (from other specs)
- **Spec-1 (Backend Core & Data Layer)**: Task CRUD API endpoints, database schema
- **Spec-2 (Authentication & Security Integration)**: Better Auth, JWT infrastructure, user isolation middleware

### Technical Dependencies
- **Node.js 18+**: Required for Next.js
- **npm/yarn**: Package manager
- **Neon PostgreSQL**: Database (shared with backend)
- **Backend API**: FastAPI service running on configured port

### Environment Configuration
- **Frontend (.env.local)**:
  - `AUTH_SECRET`: JWT signing secret (must match backend JWT_SECRET)
  - `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://localhost:8000)
  - `DATABASE_URL`: Neon PostgreSQL connection string (for Better Auth)

- **Backend (.env)** (already configured in Spec-2):
  - `JWT_SECRET`: JWT signing secret (must match frontend AUTH_SECRET)
  - `DATABASE_URL`: Neon PostgreSQL connection string
  - `CORS_ORIGINS`: Frontend URL (e.g., http://localhost:3000)

## Success Criteria Validation

The implementation will be considered successful when:

1. ✅ All 4 user stories (P1-P4) are independently testable and pass acceptance scenarios
2. ✅ All 32 functional requirements are implemented and verified
3. ✅ All 17 success criteria are met and measurable
4. ✅ Constitution principles are maintained throughout implementation
5. ✅ No security vulnerabilities (XSS, unauthorized access, token exposure)
6. ✅ User isolation is 100% effective (verified by testing with multiple users)
7. ✅ Application is responsive on all target viewports (320px-1920px)
8. ✅ All edge cases are handled gracefully (network failures, token expiration, etc.)

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks from this plan
2. Execute tasks following red-green-refactor workflow
3. Manual testing of all user stories and acceptance scenarios
4. Validation against success criteria and constitution principles
