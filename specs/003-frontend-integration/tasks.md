# Tasks: Frontend & Integration

**Input**: Design documents from `/specs/003-frontend-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only (per spec out-of-scope). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Frontend uses Next.js App Router: `frontend/src/app/`
- Shared utilities: `frontend/src/lib/`
- Components: `frontend/src/components/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify frontend project structure matches plan.md (frontend/src/app/, frontend/src/lib/, frontend/src/components/)
- [X] T002 Verify frontend dependencies installed (Next.js 16.1.1, React 19, Better Auth, TypeScript 5.0+, Tailwind CSS)
- [X] T003 [P] Verify environment configuration in frontend/.env.local (AUTH_SECRET, NEXT_PUBLIC_API_URL, DATABASE_URL)
- [X] T004 [P] Verify backend environment configuration in backend/.env (JWT_SECRET matches AUTH_SECRET, CORS_ORIGINS includes frontend URL)
- [X] T005 Verify database tables exist (users, tasks) with correct schema per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement Better Auth configuration in frontend/src/lib/auth.ts (JWT provider, httpOnly cookies, password requirements)
- [X] T007 [P] Implement API client with JWT handling in frontend/src/lib/api-client.ts (token extraction, Authorization header, 401 handling)
- [X] T008 [P] Create root layout in frontend/src/app/layout.tsx (HTML structure, metadata, global styles)
- [X] T009 [P] Configure Tailwind CSS in frontend/tailwind.config.ts (responsive breakpoints, custom utilities)
- [X] T010 Create Better Auth API route handler in frontend/src/app/api/auth/[...all]/route.ts
- [X] T011 Verify backend JWT validation middleware in backend/src/middleware/auth.py (validates tokens, extracts user_id)
- [X] T012 Verify backend CORS configuration in backend/src/main.py (allows frontend origin)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can create accounts through a registration form with email and password validation, receiving immediate authentication upon successful signup.

**Independent Test**: Navigate to /register, submit valid email and password, verify account creation and automatic sign-in with redirect to /tasks. Success means a new user can immediately start using the application.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create registration page in frontend/src/app/register/page.tsx (form with email and password fields)
- [X] T014 [P] [US1] Implement client-side email validation in registration form (RFC 5322 format)
- [X] T015 [P] [US1] Implement client-side password validation in registration form (min 8 chars, uppercase, lowercase, number)
- [X] T016 [US1] Implement registration form submission handler (calls Better Auth register API)
- [X] T017 [US1] Implement registration success handling (automatic sign-in, redirect to /tasks)
- [X] T018 [US1] Implement registration error handling (email exists, invalid format, password requirements)
- [X] T019 [US1] Add loading state during registration submission
- [X] T020 [US1] Style registration page with Tailwind CSS (responsive design, mobile-friendly)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can register and are automatically signed in.

**Manual Test Scenarios**:
1. Valid registration: Enter valid email and password → Account created, redirected to /tasks
2. Invalid email: Enter invalid email format → See validation error
3. Weak password: Enter password without requirements → See specific feedback
4. Duplicate email: Register with existing email → See error message
5. Mismatched passwords: Enter different passwords in confirm field → See error

---

## Phase 4: User Story 2 - User Authentication (Priority: P2)

**Goal**: Registered users can sign in with their credentials and sign out when finished, with secure JWT token management throughout their session.

**Independent Test**: Register a user (using P1), sign out, then sign in again with the same credentials. Verify successful authentication, JWT token issuance, and access to protected pages. Success means users can reliably access their accounts across sessions.

### Implementation for User Story 2

- [X] T021 [P] [US2] Create login page in frontend/src/app/login/page.tsx (form with email and password fields)
- [X] T022 [P] [US2] Implement login form submission handler (calls Better Auth login API)
- [X] T023 [US2] Implement login success handling (JWT token in httpOnly cookie, redirect to /tasks)
- [X] T024 [US2] Implement login error handling (invalid credentials, generic error message for security)
- [X] T025 [US2] Add loading state during login submission
- [X] T026 [US2] Style login page with Tailwind CSS (responsive design, mobile-friendly)
- [X] T027 [P] [US2] Implement sign-out functionality (clear httpOnly cookie, redirect to /login)
- [X] T028 [P] [US2] Add sign-out button to tasks page navigation
- [X] T029 [US2] Implement protected route middleware (redirect unauthenticated users to /login)
- [X] T030 [US2] Implement 401 error handling in API client (redirect to /login with message)
- [X] T031 [US2] Handle JWT token expiration (24 hours) with redirect to login

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can register, sign in, sign out, and access protected pages.

**Manual Test Scenarios**:
1. Valid login: Enter correct credentials → Signed in, redirected to /tasks
2. Invalid credentials: Enter wrong password → See generic error message
3. Sign out: Click sign out → Session terminated, redirected to /login
4. Protected page access: Try to access /tasks without auth → Redirected to /login
5. Token expiration: Wait 24 hours or manually expire token → Receive 401, redirected to login

---

## Phase 5: User Story 3 - Task Management (Priority: P3)

**Goal**: Authenticated users can create, view, update, delete, and mark tasks as complete, with all operations reflecting only their own data.

**Independent Test**: Sign in as a user (using P2), create multiple tasks, edit them, mark some complete, delete others. Verify all operations succeed and only show the authenticated user's tasks. Success means users can fully manage their personal task list.

### Implementation for User Story 3

- [X] T032 [P] [US3] Create tasks page in frontend/src/app/tasks/page.tsx (main task management interface)
- [X] T033 [P] [US3] Implement task list fetching (GET /tasks with JWT token)
- [X] T034 [P] [US3] Create TaskList component in frontend/src/components/TaskList.tsx (displays all tasks)
- [X] T035 [P] [US3] Create TaskItem component in frontend/src/components/TaskItem.tsx (individual task with actions)
- [X] T036 [P] [US3] Create TaskForm component in frontend/src/components/TaskForm.tsx (create/edit task form)
- [X] T037 [US3] Implement task creation (POST /tasks with title and description)
- [X] T038 [US3] Implement task update (PUT /tasks/{id} with updated fields)
- [X] T039 [US3] Implement task deletion (DELETE /tasks/{id} with confirmation dialog)
- [X] T040 [US3] Implement task completion toggle (PUT /tasks/{id} with is_completed)
- [X] T041 [US3] Implement empty state when user has no tasks (helpful message, call-to-action)
- [X] T042 [US3] Add loading states for all task operations (create, update, delete, toggle)
- [X] T043 [US3] Implement error handling for task operations (network errors, 401, 404, 500)
- [X] T044 [US3] Implement optimistic UI updates (immediate feedback before API response)
- [X] T045 [US3] Add client-side validation for task form (title required, max lengths)
- [X] T046 [US3] Style tasks page and components with Tailwind CSS (responsive, mobile-friendly)
- [X] T047 [US3] Implement task list refresh after create/update/delete operations

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional. Users can register, authenticate, and fully manage their tasks.

**Manual Test Scenarios**:
1. Create task: Fill form with title and description → Task appears in list immediately
2. Edit task: Click edit, modify title/description → Task updates immediately
3. Toggle completion: Click checkbox → Task marked complete/incomplete
4. Delete task: Click delete, confirm → Task removed from list
5. User isolation: Create two users, verify each sees only their own tasks
6. Empty state: Delete all tasks → See helpful empty state message

---

## Phase 6: User Story 4 - Responsive User Interface (Priority: P4)

**Goal**: The application interface adapts to different screen sizes, providing an optimal experience on desktop, tablet, and mobile devices.

**Independent Test**: Access the application on desktop (1920x1080), tablet (768x1024), and mobile (375x667) viewports. Verify all pages render correctly, forms are usable, and navigation works on all screen sizes. Success means users can effectively use the application regardless of device.

### Implementation for User Story 4

- [X] T048 [P] [US4] Implement responsive layout for registration page (mobile: single column, desktop: centered card)
- [X] T049 [P] [US4] Implement responsive layout for login page (mobile: single column, desktop: centered card)
- [X] T050 [P] [US4] Implement responsive layout for tasks page (mobile: single column, tablet: optimized, desktop: multi-column)
- [X] T051 [P] [US4] Implement responsive navigation (mobile: hamburger menu, desktop: full navigation)
- [X] T052 [P] [US4] Ensure touch targets are at least 44x44 pixels (WCAG 2.1 accessibility)
- [X] T053 [P] [US4] Implement responsive form inputs (appropriate sizing for mobile, tablet, desktop)
- [X] T054 [P] [US4] Test responsive design at mobile breakpoint (320px-767px)
- [X] T055 [P] [US4] Test responsive design at tablet breakpoint (768px-1023px)
- [X] T056 [P] [US4] Test responsive design at desktop breakpoint (1024px-1920px)
- [X] T057 [US4] Implement responsive task list (single column on mobile, optimized on tablet/desktop)
- [X] T058 [US4] Ensure no horizontal scrolling on any viewport size
- [X] T059 [US4] Verify all interactive elements work with touch and mouse

**Checkpoint**: All user stories should now be independently functional with responsive design. Application works on all target devices.

**Manual Test Scenarios**:
1. Desktop view: Open at 1920x1080 → Content well-spaced, optimal layout
2. Tablet view: Resize to 768x1024 → Forms appropriately sized, touch-friendly
3. Mobile view: Resize to 375x667 → Single column, touch-friendly buttons
4. Touch targets: Verify all buttons/links are at least 44x44 pixels
5. No horizontal scroll: Test all pages at all viewport sizes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T060 [P] Create landing page in frontend/src/app/page.tsx (home page with links to register/login)
- [X] T061 [P] Add visual feedback for interactive elements (hover, focus, active states)
- [X] T062 [P] Implement consistent error message styling across all pages
- [X] T063 [P] Implement consistent loading state styling across all pages
- [X] T064 [P] Add form validation feedback styling (error messages, success states)
- [X] T065 [P] Implement text truncation for long task titles/descriptions
- [X] T066 [P] Add confirmation dialogs for destructive actions (delete task)
- [X] T067 [P] Implement browser back button handling (maintain authentication state)
- [X] T068 [P] Add semantic HTML for accessibility (proper headings, labels, ARIA attributes)
- [X] T069 [P] Verify all forms have proper labels and error associations
- [X] T070 [P] Test application on Chrome (latest 2 versions)
- [X] T071 [P] Test application on Firefox (latest 2 versions)
- [X] T072 [P] Test application on Safari (latest 2 versions)
- [X] T073 [P] Test application on Edge (latest 2 versions)
- [X] T074 Verify JWT secret synchronization between frontend and backend
- [X] T075 Verify CORS configuration allows frontend origin
- [X] T076 Test all edge cases from spec.md (network failures, token expiration, concurrent sessions, empty states, long text, rapid submissions, browser navigation, invalid tokens)
- [X] T077 Run quickstart.md validation (all setup steps, end-to-end flow, user isolation, responsive design)
- [X] T078 Verify all 32 functional requirements from spec.md are implemented
- [X] T079 Verify all 17 success criteria from spec.md are met
- [X] T080 Document any deviations from spec or known issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (P3): Can start after Foundational - Requires US2 authentication but independently testable
  - User Story 4 (P4): Can start after Foundational - Applies to all pages, can be done in parallel with other stories
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Registration - Entry point, no dependencies
- **User Story 2 (P2)**: Authentication - Builds on US1 (users must exist to sign in)
- **User Story 3 (P3)**: Task Management - Requires US2 (authentication needed for tasks)
- **User Story 4 (P4)**: Responsive UI - Applies to all pages, can be done in parallel

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Tasks without [P] must run sequentially (dependencies on previous tasks)
- Complete all tasks in a user story before testing that story independently

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- All Foundational tasks marked [P] can run in parallel (T007, T008, T009)
- Within User Story 1: T013, T014, T015 can run in parallel
- Within User Story 2: T021, T022, T027, T028 can run in parallel
- Within User Story 3: T032, T033, T034, T035, T036 can run in parallel
- Within User Story 4: All tasks marked [P] can run in parallel (T048-T059)
- All Polish tasks marked [P] can run in parallel (T060-T073)

---

## Parallel Example: User Story 1 (Registration)

```bash
# Launch all parallel tasks for User Story 1 together:
Task T013: "Create registration page in frontend/src/app/register/page.tsx"
Task T014: "Implement client-side email validation in registration form"
Task T015: "Implement client-side password validation in registration form"

# Then sequential tasks:
Task T016: "Implement registration form submission handler"
Task T017: "Implement registration success handling"
Task T018: "Implement registration error handling"
Task T019: "Add loading state during registration submission"
Task T020: "Style registration page with Tailwind CSS"
```

---

## Parallel Example: User Story 3 (Task Management)

```bash
# Launch all parallel tasks for User Story 3 together:
Task T032: "Create tasks page in frontend/src/app/tasks/page.tsx"
Task T033: "Implement task list fetching"
Task T034: "Create TaskList component in frontend/src/components/TaskList.tsx"
Task T035: "Create TaskItem component in frontend/src/components/TaskItem.tsx"
Task T036: "Create TaskForm component in frontend/src/components/TaskForm.tsx"

# Then sequential tasks:
Task T037: "Implement task creation"
Task T038: "Implement task update"
Task T039: "Implement task deletion"
# ... and so on
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T013-T020)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can users register with valid email/password?
   - Are they automatically signed in?
   - Are they redirected to /tasks?
   - Does validation work correctly?
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Authentication) → Test independently → Deploy/Demo
4. Add User Story 3 (Task Management) → Test independently → Deploy/Demo
5. Add User Story 4 (Responsive UI) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T020)
   - Developer B: User Story 2 (T021-T031)
   - Developer C: User Story 3 (T032-T047)
   - Developer D: User Story 4 (T048-T059)
3. Stories complete and integrate independently
4. Team completes Polish together (T060-T080)

---

## Task Summary

**Total Tasks**: 80

**Tasks by Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (User Story 1 - Registration): 8 tasks
- Phase 4 (User Story 2 - Authentication): 11 tasks
- Phase 5 (User Story 3 - Task Management): 16 tasks
- Phase 6 (User Story 4 - Responsive UI): 12 tasks
- Phase 7 (Polish): 21 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- User Story 1: Users can register and are automatically signed in
- User Story 2: Users can sign in, sign out, and access protected pages
- User Story 3: Users can create, view, update, delete, and toggle tasks
- User Story 4: Application works on desktop, tablet, and mobile devices

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 20 tasks

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests (manual testing only per spec out-of-scope)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Verify all 32 functional requirements and 17 success criteria from spec.md
- Test all 8 edge cases from spec.md
- Follow quickstart.md for setup and testing procedures
