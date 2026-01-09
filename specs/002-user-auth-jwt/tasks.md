# Tasks: Authentication & Security Integration

**Input**: Design documents from `/specs/002-user-auth-jwt/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/auth-api.yaml

**Tests**: Tests are NOT requested in the specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`
- Paths shown below follow the web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Add PyJWT==2.8.0 to backend/requirements.txt
- [ ] T002 [P] Update backend/.env.example with JWT_SECRET template and usage instructions
- [ ] T003 [P] Create frontend/ directory structure (src/lib/, src/app/, src/components/)
- [ ] T004 [P] Initialize frontend package.json with Next.js 16+, Better Auth, and TypeScript dependencies
- [ ] T005 [P] Create frontend/.env.local.example with AUTH_SECRET and NEXT_PUBLIC_API_URL templates

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Update backend/src/config.py to load JWT_SECRET from environment with validation (min 32 characters)
- [ ] T007 Create backend/src/middleware/ directory
- [ ] T008 Create backend/src/middleware/__init__.py (empty file for Python package)
- [ ] T009 Implement JWT verification middleware in backend/src/middleware/auth.py with get_current_user_id dependency
- [ ] T010 [P] Create frontend/src/lib/ directory for shared utilities
- [ ] T011 [P] Create frontend/tsconfig.json with Next.js App Router configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration with Better Auth (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email and password through Better Auth, receiving JWT tokens upon successful registration

**Independent Test**: Submit registration details (email, password) through Better Auth UI, verify new user account is created, and confirm valid JWT token is returned. Success means users can register and immediately receive authentication credentials.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Configure Better Auth in frontend/src/lib/auth.ts with JWT provider and shared secret
- [ ] T013 [P] [US1] Create frontend/src/app/register/ directory
- [ ] T014 [US1] Implement registration page in frontend/src/app/register/page.tsx with email/password form
- [ ] T015 [US1] Add email format validation and password requirements validation to registration form
- [ ] T016 [US1] Implement registration error handling (duplicate email, validation errors) in registration page
- [ ] T017 [US1] Add registration success handling (store token, redirect to tasks page)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register and receive JWT tokens

---

## Phase 4: User Story 2 - User Login & JWT Token Issuance (Priority: P2)

**Goal**: Enable registered users to sign in with credentials through Better Auth and receive JWT tokens verifiable by FastAPI backend using shared secret

**Independent Test**: Register a user (using P1), then sign in with correct credentials through Better Auth and verify valid JWT token is returned. Test that token can be verified by FastAPI backend using shared secret. Success means users can authenticate and their tokens are accepted by backend APIs.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create frontend/src/app/login/ directory
- [ ] T019 [US2] Implement login page in frontend/src/app/login/page.tsx with email/password form
- [ ] T020 [US2] Add login error handling (invalid credentials, network errors) in login page
- [ ] T021 [US2] Add login success handling (store token in httpOnly cookie, redirect to tasks page)
- [ ] T022 [P] [US2] Create frontend/src/lib/api-client.ts with JWT token extraction and Authorization header attachment
- [ ] T023 [US2] Implement 401 error handling in api-client.ts (redirect to login on token expiration)
- [ ] T024 [US2] Add token validation test endpoint in backend for manual testing (temporary, can be removed later)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can register, login, and receive tokens that backend can validate

---

## Phase 5: User Story 3 - Token Validation & Protected API Access (Priority: P3)

**Goal**: FastAPI backend validates JWT tokens issued by Better Auth and enforces user-specific access control on all protected task endpoints

**Independent Test**: Obtain valid token (using P2), then make requests to protected task endpoints with and without token. Success means all task endpoints reject unauthenticated requests with 401 and accept valid tokens, extracting user identity for data isolation.

### Implementation for User Story 3

- [ ] T025 [US3] Update GET /tasks endpoint in backend/src/api/routes/tasks.py to use Depends(get_current_user_id) instead of Query parameter
- [ ] T026 [US3] Update POST /tasks endpoint in backend/src/api/routes/tasks.py to use Depends(get_current_user_id) instead of Query parameter
- [ ] T027 [US3] Update GET /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py to use Depends(get_current_user_id) instead of Query parameter
- [ ] T028 [US3] Update PUT /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py to use Depends(get_current_user_id) instead of Query parameter
- [ ] T029 [US3] Update DELETE /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py to use Depends(get_current_user_id) instead of Query parameter
- [ ] T030 [US3] Add authentication failure logging to backend/src/middleware/auth.py for security monitoring
- [ ] T031 [P] [US3] Create frontend/src/app/tasks/ directory
- [ ] T032 [US3] Implement tasks page in frontend/src/app/tasks/page.tsx using api-client.ts to fetch tasks
- [ ] T033 [US3] Add task creation form in tasks page using api-client.ts
- [ ] T034 [US3] Add task update/delete functionality in tasks page using api-client.ts
- [ ] T035 [US3] Implement authentication error handling in tasks page (redirect to login on 401)

**Checkpoint**: All user stories should now be independently functional - complete authentication flow from registration to protected API access

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 [P] Update backend/README.md with JWT authentication setup instructions
- [ ] T037 [P] Create frontend/README.md with Better Auth setup and development instructions
- [ ] T038 [P] Add CORS configuration validation in backend/src/main.py for frontend origin
- [ ] T039 Verify unauthorized requests return 401 across all protected endpoints (manual testing per quickstart.md)
- [ ] T040 Verify JWT signature validation using shared secret (manual testing per quickstart.md)
- [ ] T041 Verify user isolation - users can only access their own tasks (manual testing per quickstart.md)
- [ ] T042 [P] Add security headers to backend responses (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] T043 Generate strong JWT secret and document in backend/.env.example and frontend/.env.local.example
- [ ] T044 Validate token expiration behavior (24-hour expiration, re-authentication required)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 (requires registration to test login) but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 (needs login tokens) but backend endpoint migration can proceed independently

### Within Each User Story

- Frontend configuration before page implementation
- API client before tasks page (US3 depends on api-client from US2)
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001, T002, T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel (T010, T011)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within US1: T012 and T013 can run in parallel
- Within US2: T018 and T022 can run in parallel
- Within US3: T025-T029 (backend endpoints) can run in parallel with T031 (frontend directory creation)
- Polish phase: T036, T037, T038, T042 can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all backend endpoint migrations together:
Task: "Update GET /tasks endpoint in backend/src/api/routes/tasks.py"
Task: "Update POST /tasks endpoint in backend/src/api/routes/tasks.py"
Task: "Update GET /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py"
Task: "Update PUT /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py"
Task: "Update DELETE /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py"

# While backend endpoints are being updated, create frontend directory:
Task: "Create frontend/src/app/tasks/ directory"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (registration flow)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - registration works!)
3. Add User Story 2 → Test independently → Deploy/Demo (login and token validation works!)
4. Add User Story 3 → Test independently → Deploy/Demo (protected API access works!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T012-T017) - Frontend registration
   - Developer B: User Story 2 (T018-T024) - Frontend login + API client
   - Developer C: User Story 3 (T025-T035) - Backend endpoint migration + tasks page
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included (not requested in specification)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 44
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 6 tasks
- Phase 4 (User Story 2 - P2): 7 tasks
- Phase 5 (User Story 3 - P3): 11 tasks
- Phase 6 (Polish): 9 tasks

**Parallel Opportunities**: 15 tasks can run in parallel (marked with [P])

**MVP Scope**: Phases 1-3 (17 tasks) deliver User Story 1 - User Registration with Better Auth

**Independent Test Criteria**:
- US1: Submit registration → Verify account created → Confirm JWT token returned
- US2: Register user → Login with credentials → Verify JWT token → Test backend validation
- US3: Obtain token → Request protected endpoints with/without token → Verify 401 rejection and user isolation
