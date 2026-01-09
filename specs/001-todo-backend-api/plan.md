# Implementation Plan: Backend Core & Data Layer

**Branch**: `001-todo-backend-api` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-backend-api/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a persistent task management backend with RESTful API design and user-scoped data handling. The backend provides CRUD operations for tasks, enforces user isolation, and persists data in Neon Serverless PostgreSQL using SQLModel ORM. This is the foundational data layer that will integrate with authentication (Spec-2) and frontend (Spec-3).

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI (web framework), SQLModel (ORM), psycopg2-binary (PostgreSQL driver), pydantic (validation)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted PostgreSQL)
**Testing**: pytest (unit/integration tests), httpx (API testing client)
**Target Platform**: Linux server (containerized deployment)
**Project Type**: Web application backend (API-only, no frontend in this spec)
**Performance Goals**: <2 seconds for task creation/retrieval, support 100 concurrent requests
**Constraints**: Stateless API design, user-scoped queries only, no server-side sessions
**Scale/Scope**: Multi-user support, ~1000 tasks per user expected, 100+ concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development
✅ **PASS** - Implementation follows approved spec.md with all requirements documented

### Principle II: Agentic Workflow Compliance
✅ **PASS** - Following spec → plan → tasks → implementation workflow

### Principle III: Security-First Design
⚠️ **DEFERRED** - JWT validation and authentication enforcement deferred to Spec-2 integration
- User isolation enforced via user_id parameter (pre-auth-ready design)
- All queries will be user-scoped by design
- No hard-coded secrets (DATABASE_URL in .env)

**Justification**: Spec-1 focuses on data layer and API contracts. Authentication integration happens in Spec-2. Current design is "pre-auth-ready" - all endpoints accept user_id parameter to demonstrate isolation, which will be replaced with JWT-extracted user_id in Spec-2.

### Principle IV: Deterministic Behavior
✅ **PASS** - REST API with consistent HTTP semantics, no random behavior

### Principle V: Full-Stack Coherence
✅ **PASS** - API contracts will be documented in OpenAPI format for frontend integration

### Key Standards Compliance

**Development Standards**:
- ✅ Approved spec.md exists
- ✅ All API behavior defined in spec
- ✅ REST APIs with proper HTTP methods and status codes
- ✅ Error responses documented

**Authentication Standards**:
- ⚠️ JWT validation deferred to Spec-2 (by design)
- ✅ User-scoped queries enforced via user_id parameter
- ✅ Stateless backend (no sessions)

**Security Standards**:
- ✅ No hard-coded secrets (environment variables)
- ✅ Multi-user support with data isolation
- ✅ Data persistence across restarts

**Gate Decision**: ✅ **PROCEED** - Security deferral is intentional and documented. Backend is designed to integrate with auth layer.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend-api/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLModel database models (Task, User reference)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── api/             # FastAPI route handlers
│   │   └── routes/      # Task CRUD endpoints
│   ├── database.py      # Database connection and session management
│   ├── config.py        # Environment configuration
│   └── main.py          # FastAPI application entry point
├── tests/
│   ├── test_api.py      # API endpoint tests
│   ├── test_models.py   # Database model tests
│   └── conftest.py      # Pytest fixtures
├── .env.example         # Environment variable template
├── requirements.txt     # Python dependencies
└── README.md            # Setup and run instructions
```

**Structure Decision**: Web application backend structure selected. Backend runs independently with no frontend dependency in this spec. The `backend/` directory contains all API and data layer code. Frontend will be added in separate directory (Spec-3).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Security-First Design (partial) | Authentication deferred to Spec-2 | Implementing auth in Spec-1 would violate separation of concerns and make testing harder. Pre-auth-ready design with user_id parameter enables independent testing. |

**Justification**: The constitution requires security-first design, but Spec-1 explicitly scopes out authentication (documented in spec.md "Out of Scope"). This is intentional architectural layering: Spec-1 = data layer, Spec-2 = auth layer, Spec-3 = UI layer. The backend is designed to be "pre-auth-ready" - all endpoints accept user_id to demonstrate isolation, which will be replaced with JWT-extracted user_id when Spec-2 integrates.
