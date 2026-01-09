---
id: 002
title: Authentication Architecture Planning
stage: plan
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-user-auth-jwt
branch: 002-user-auth-jwt
user: Abdul Mannan
command: /sp.plan
labels: ["authentication", "architecture", "jwt", "better-auth", "fastapi", "nextjs", "planning"]
links:
  spec: specs/002-user-auth-jwt/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-user-auth-jwt/plan.md
  - specs/002-user-auth-jwt/research.md
  - specs/002-user-auth-jwt/data-model.md
  - specs/002-user-auth-jwt/quickstart.md
  - specs/002-user-auth-jwt/contracts/auth-api.yaml
  - CLAUDE.md
tests:
  - Constitution Check validation (all gates passed)
  - Technical context validation (all requirements specified)
---

## Prompt

```text
/sp.plan

Create:
Auth flow architecture (Next.js Better Auth → JWT → FastAPI)

JWT verification middleware for FastAPI

Frontend API client strategy for token attachment

Decisions needing documentation:
JWT payload fields required by backend

Token expiration duration and validation rules

Strategy for matching JWT user identity with route user_id

Testing & validation:
Verify unauthorized requests return 401

Confirm JWT signature validation using shared secret

Ensure authenticated users only access their own tasks
```

## Response snapshot

Successfully completed comprehensive architecture planning for Authentication & Security Integration (Spec-2). Designed JWT-based cross-service authentication between Next.js (Better Auth) and FastAPI backend with stateless token verification.

**Planning Artifacts Created:**

1. **research.md** - Technical Decisions & Architecture
   - Decision 1: JWT Token Structure (HS256, standard claims: sub, email, iat, exp)
   - Decision 2: Better Auth Integration (JWT provider with shared secret)
   - Decision 3: FastAPI JWT Verification Middleware (dependency injection pattern)
   - Decision 4: Frontend API Client Strategy (automatic token attachment)
   - Decision 5: Shared Secret Management (environment variables with validation)
   - Decision 6: Migration Strategy from Spec-1 (breaking change justified by security upgrade)

2. **data-model.md** - JWT Token Structure & User Integration
   - JWT token structure (header, payload, signature)
   - Token lifecycle (issuance, storage, transmission, verification, expiration)
   - User entity integration (no database changes from Spec-1)
   - Data flow diagrams for registration and authenticated requests

3. **contracts/auth-api.yaml** - OpenAPI 3.0 Specification
   - Authentication endpoints (Better Auth reference)
   - Protected task endpoints with BearerAuth security scheme
   - JWT token schema with standard claims
   - Error response schemas (MISSING_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED)
   - All 5 task endpoints documented with JWT authentication

4. **quickstart.md** - Setup & Testing Instructions
   - Part 1: Backend Setup (PyJWT installation, JWT_SECRET configuration, middleware creation)
   - Part 2: Frontend Setup (Better Auth installation, API client creation, auth pages)
   - Part 3: Testing Integration (authentication flow, user isolation, token expiration)
   - Part 4: Troubleshooting (common issues and solutions)
   - Part 5: Production Deployment (security checklist, environment variables)

5. **plan.md** - Complete Implementation Plan
   - Technical Context (Python 3.11+, TypeScript/Node.js 18+, PyJWT, Better Auth)
   - Constitution Check (all 5 principles passed, all standards met)
   - Project Structure (backend middleware, frontend auth pages, no database changes)
   - Implementation Approach (17-26 estimated tasks across 5 phases)
   - Architecture Decisions (5 key decisions documented with rationale)
   - Security Considerations (shared secret, token validation, user isolation, error handling)
   - Testing Strategy (backend, frontend, integration tests)
   - Deployment Checklist (10 production readiness items)

**Key Architecture Decisions:**

1. **JWT Token Structure**: HS256-signed JWT with standard claims (sub, email, iat, exp)
   - Rationale: Symmetric key simpler for single-service auth, standard claims ensure compatibility

2. **Stateless Authentication**: No session storage, JWT signature verification only
   - Rationale: Enables horizontal scaling, aligns with constitution requirement

3. **Token Storage**: httpOnly cookies (Better Auth default)
   - Rationale: Prevents XSS attacks by making tokens inaccessible to JavaScript

4. **Token Expiration**: 24 hours (configurable)
   - Rationale: Balances security (limits exposure) with UX (reduces re-auth frequency)

5. **Migration Strategy**: Breaking change from query parameter to JWT dependency
   - Rationale: Security upgrade justifies breaking change, clean separation of concerns

**Technical Approach:**

**Backend (FastAPI)**:
- Create `middleware/auth.py` with `get_current_user_id` dependency
- Validate JWT signature using PyJWT and shared secret (JWT_SECRET)
- Extract user ID from `sub` claim
- Modify all 5 task endpoints to use `Depends(get_current_user_id)` instead of `Query(...)`
- Return 401 for missing, invalid, or expired tokens
- No database lookups (stateless verification)

**Frontend (Next.js + Better Auth)**:
- Configure Better Auth with JWT provider and shared secret (AUTH_SECRET)
- Create API client that extracts JWT from httpOnly cookie
- Attach token to all API requests in Authorization: Bearer header
- Handle 401 responses by redirecting to login
- Create login/register pages with Better Auth integration

**Cross-Service Integration**:
- Shared secret synchronized between frontend (AUTH_SECRET) and backend (JWT_SECRET)
- JWT tokens include standard claims: sub (user ID), email, iat, exp
- Token expiration: 24 hours from issuance
- Stateless verification: no database lookups for authentication

**Constitution Compliance:**

✅ **Spec-Driven Development**: Complete specification exists with 3 user stories, 22 functional requirements
✅ **Agentic Workflow**: Following spec → plan → tasks → implementation workflow
✅ **Security-First Design**: JWT validation on all endpoints, user isolation enforced, no hardcoded secrets
✅ **Deterministic Behavior**: JWT validation is deterministic (cryptographic verification)
✅ **Full-Stack Coherence**: API contracts defined, frontend/backend integration seamless

**Performance Characteristics:**
- JWT verification: <5ms per request (CPU-bound HMAC-SHA256)
- No database lookups: stateless verification scales horizontally
- Memory overhead: ~200 bytes per token
- Network overhead: ~100 bytes per request (Authorization header)
- Concurrent requests: 100+ authenticated requests without shared state

**Security Considerations:**
- Shared secret: 32+ characters for HS256 security
- Token expiration: 24-hour limit reduces exposure window
- httpOnly cookies: Prevents XSS attacks
- User isolation: All queries filtered by JWT-extracted user_id
- Generic 401 responses: Prevents user enumeration
- HTTPS required: Secure cookie transmission in production

**Next Steps:**
1. Run `/sp.tasks` to generate detailed implementation tasks (estimated 17-26 tasks)
2. Review tasks for completeness and dependencies
3. Execute implementation following task order
4. Test authentication flow end-to-end
5. Deploy following production checklist

## Outcome

- ✅ Impact: Complete architecture plan ready for task generation and implementation
- 🧪 Tests: Constitution Check passed (all 5 principles, all standards met)
- 📁 Files: Created 5 planning artifacts (research.md, data-model.md, quickstart.md, auth-api.yaml, plan.md)
- 🔁 Next prompts: Run `/sp.tasks` to generate implementation tasks, then `/sp.implement` to execute
- 🧠 Reflection: Architecture successfully designed for JWT-based cross-service authentication. Better Auth handles frontend authentication flows (registration, login) and issues JWT tokens with shared secret. FastAPI validates token signatures using dependency injection middleware and extracts user identity from `sub` claim. All 5 task endpoints from Spec-1 are modified to use JWT authentication instead of query parameters. Authentication is stateless (no database lookups), enabling horizontal scaling. Security is foundational: httpOnly cookies prevent XSS, token expiration limits exposure, user isolation enforced on all queries. All constitution principles satisfied. Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all artifacts generated
- Graders run and results (PASS/FAIL): Constitution Check - PASSED (all 5 principles, all standards)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Generate tasks with `/sp.tasks` and validate task breakdown matches estimated 17-26 tasks across 5 phases
