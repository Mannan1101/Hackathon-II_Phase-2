# Tasks: Backend Core & Data Layer

**Input**: Design documents from `/specs/001-todo-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT requested in the specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- Paths shown below follow the backend structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per implementation plan (backend/src/, backend/tests/)
- [x] T002 Initialize Python project with requirements.txt (FastAPI, SQLModel, psycopg2-binary, pydantic, uvicorn, pytest, httpx, python-dotenv)
- [x] T003 [P] Create .env.example file in backend/ with DATABASE_URL template
- [x] T004 [P] Create .gitignore file in backend/ (exclude .env, __pycache__, venv/)
- [x] T005 [P] Create README.md in backend/ with setup instructions from quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create database configuration in backend/src/config.py (load DATABASE_URL from environment)
- [x] T007 Create database connection and session management in backend/src/database.py (SQLModel engine, session factory)
- [x] T008 [P] Create User model in backend/src/models/user.py (id, email, created_at fields per data-model.md)
- [x] T009 [P] Create Task model in backend/src/models/task.py (id, title, description, is_completed, user_id, created_at, updated_at fields per data-model.md)
- [x] T010 Create database initialization script in backend/src/database.py (create_tables function using SQLModel.metadata.create_all)
- [x] T011 Create FastAPI application entry point in backend/src/main.py (app instance, CORS middleware, startup/shutdown events)
- [x] T012 [P] Create error response schema in backend/src/schemas/error.py (Error, ErrorDetail classes per openapi.yaml)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Retrieve Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable API consumers to create new tasks and retrieve them to verify persistence

**Independent Test**: Send POST request to create task, then GET request to retrieve it. Success means task data persists and returns with same values.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create TaskCreate request schema in backend/src/schemas/task.py (title, description, user_id fields with validation per data-model.md)
- [x] T014 [P] [US1] Create TaskResponse response schema in backend/src/schemas/task.py (all Task fields with from_attributes config per data-model.md)
- [x] T015 [US1] Implement POST /tasks endpoint in backend/src/api/routes/tasks.py (create task, return 201 with TaskResponse)
- [x] T016 [US1] Add user isolation enforcement to POST /tasks (verify user_id exists, scope task to user)
- [x] T017 [US1] Add validation error handling to POST /tasks (return 400 for missing title, 422 for length violations per openapi.yaml)
- [x] T018 [US1] Implement GET /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (retrieve single task with user_id ownership check)
- [x] T019 [US1] Add user isolation enforcement to GET /tasks/{task_id} (return 404 if task doesn't exist or user doesn't own it)
- [x] T020 [US1] Add error handling to GET /tasks/{task_id} (return 404 for invalid task_id, 400 for invalid user_id per openapi.yaml)
- [x] T021 [US1] Register task routes in backend/src/main.py (include router with /tasks prefix)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update and Delete Tasks (Priority: P2)

**Goal**: Enable API consumers to modify existing tasks and remove tasks that are no longer needed

**Independent Test**: Create task (using P1), update its title/completion status, then delete it. Success means changes persist and deleted tasks are not retrievable.

### Implementation for User Story 2

- [x] T022 [P] [US2] Create TaskUpdate request schema in backend/src/schemas/task.py (optional title, description, is_completed fields with validation per data-model.md)
- [x] T023 [US2] Implement PUT /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (update task fields, return 200 with TaskResponse)
- [x] T024 [US2] Add user isolation enforcement to PUT /tasks/{task_id} (return 404 if task doesn't exist or user doesn't own it)
- [x] T025 [US2] Add validation error handling to PUT /tasks/{task_id} (return 400 for validation errors, 422 for business logic errors per openapi.yaml)
- [x] T026 [US2] Add updated_at timestamp refresh logic to PUT /tasks/{task_id} (automatically update timestamp on any field change)
- [x] T027 [US2] Implement DELETE /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (delete task, return 204 No Content)
- [x] T028 [US2] Add user isolation enforcement to DELETE /tasks/{task_id} (return 404 if task doesn't exist or user doesn't own it)
- [x] T029 [US2] Add error handling to DELETE /tasks/{task_id} (return 404 for invalid task_id, 400 for invalid user_id per openapi.yaml)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - List All User Tasks (Priority: P3)

**Goal**: Enable API consumers to retrieve all tasks for a user with optional filtering by completion status

**Independent Test**: Create multiple tasks with different completion statuses (using P1), then request full list with filters. Success means all tasks returned, properly scoped, with filtering working.

### Implementation for User Story 3

- [x] T030 [P] [US3] Create TaskListResponse schema in backend/src/schemas/task.py (tasks array, total count per openapi.yaml)
- [x] T031 [US3] Implement GET /tasks endpoint in backend/src/api/routes/tasks.py (list all user tasks with user_id filter)
- [x] T032 [US3] Add user isolation enforcement to GET /tasks (filter tasks by user_id, return only user's tasks)
- [x] T033 [US3] Add completion status filtering to GET /tasks (optional completed query parameter per openapi.yaml)
- [x] T034 [US3] Add sorting to GET /tasks (order by created_at DESC for consistent ordering)
- [x] T035 [US3] Add empty list handling to GET /tasks (return empty array with total=0 when user has no tasks)
- [x] T036 [US3] Add error handling to GET /tasks (return 400 for missing/invalid user_id per openapi.yaml)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T037 [P] Add database migration script in backend/src/database.py (SQL from data-model.md for initial schema)
- [x] T038 [P] Add comprehensive error logging to all endpoints (log errors with context before returning responses)
- [x] T039 [P] Add request/response logging middleware in backend/src/main.py (log all API calls with timestamps)
- [x] T040 [P] Create pytest configuration in backend/tests/conftest.py (database fixtures, test client setup)
- [x] T041 [P] Add API documentation customization in backend/src/main.py (OpenAPI title, description, version from contracts/openapi.yaml)
- [x] T042 Verify data persistence across server restart (create tasks, restart server, verify tasks still exist)
- [x] T043 Verify user isolation across all endpoints (test that user A cannot access user B's tasks)
- [x] T044 Verify concurrent request handling (simulate 100 concurrent requests, verify no data corruption)

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2 (independently testable)

### Within Each User Story

- Schemas before endpoints (request/response models needed for endpoint implementation)
- Core endpoint implementation before error handling
- User isolation enforcement integrated with endpoint implementation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel (T008, T009, T012)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Schemas within a story marked [P] can run in parallel (T013, T014 in US1; T022 in US2; T030 in US3)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch schemas for User Story 1 together:
Task: "Create TaskCreate request schema in backend/src/schemas/task.py"
Task: "Create TaskResponse response schema in backend/src/schemas/task.py"

# Then implement endpoints sequentially (depend on schemas):
Task: "Implement POST /tasks endpoint in backend/src/api/routes/tasks.py"
Task: "Implement GET /tasks/{task_id} endpoint in backend/src/api/routes/tasks.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T021)
   - Developer B: User Story 2 (T022-T029)
   - Developer C: User Story 3 (T030-T036)
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
- Phase 2 (Foundational): 7 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 9 tasks
- Phase 4 (User Story 2 - P2): 8 tasks
- Phase 5 (User Story 3 - P3): 7 tasks
- Phase 6 (Polish): 8 tasks

**Parallel Opportunities**: 15 tasks can run in parallel (marked with [P])

**MVP Scope**: Phases 1-3 (21 tasks) deliver User Story 1 - Create and Retrieve Tasks

**Independent Test Criteria**:
- US1: POST task → GET task → verify data matches
- US2: Create task → UPDATE task → DELETE task → verify changes persist and deletion works
- US3: Create multiple tasks → GET list with filters → verify filtering and user isolation
