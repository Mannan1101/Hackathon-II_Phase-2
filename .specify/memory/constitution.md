<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution for Todo Full-Stack Web Application)
- Rationale: Initial constitution creation for Hackathon Phase-2 project
- Modified principles: N/A (new constitution)
- Added sections: Core Principles (5), Key Standards, Technology Constraints, Success Criteria, Governance
- Removed sections: N/A
- Templates requiring updates:
  ✅ spec-template.md - reviewed, aligns with spec-driven principle
  ✅ plan-template.md - reviewed, aligns with architecture requirements
  ✅ tasks-template.md - reviewed, aligns with implementation workflow
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-Driven Development

All implementation must strictly follow approved specifications. No code may be written without a corresponding spec document that has been reviewed and approved. This ensures that all development work is intentional, traceable, and aligned with project requirements.

**Rationale**: Prevents scope creep, ensures traceability, and maintains alignment between requirements and implementation.

### II. Agentic Workflow Compliance

Development must follow the mandatory workflow: spec → plan → tasks → implementation. No manual coding is permitted; all code must be generated via Claude Code following this structured process.

**Rationale**: Ensures consistency, quality, and adherence to the Spec-Driven Development methodology. Eliminates ad-hoc changes that bypass planning and review.

### III. Security-First Design

Authentication, authorization, and user isolation are enforced by default in all components. Security is not optional or added later—it is built into the foundation of every feature.

**Requirements**:
- All API endpoints (except auth endpoints) MUST validate JWT tokens
- All database queries MUST be user-scoped
- Task ownership MUST be enforced on every CRUD operation
- Unauthorized requests MUST return 401 status consistently
- No secrets may be hard-coded; environment variables only

**Rationale**: Multi-user applications require strict security boundaries. Security vulnerabilities in authentication or authorization can compromise all user data.

### IV. Deterministic Behavior

APIs and UI must behave consistently across users and sessions. Given the same input and state, the system must produce the same output. No random behavior, race conditions, or session-dependent logic that creates unpredictable outcomes.

**Rationale**: Predictable systems are testable, debuggable, and maintainable. Users expect consistent behavior.

### V. Full-Stack Coherence

Frontend, backend, and database must integrate seamlessly without mismatches. API contracts defined in specs must be implemented exactly as specified. Frontend must consume APIs exactly as documented. Database schema must support all required operations.

**Requirements**:
- API endpoints must match spec definitions exactly
- Frontend API calls must match backend implementations
- Database schema must support all user stories
- Error responses must be consistent across all layers

**Rationale**: Integration failures are the primary source of bugs in full-stack applications. Coherence prevents wasted debugging time and ensures reliable end-to-end functionality.

## Key Standards

### Development Standards

- **No implementation without an approved spec and plan**: Every feature requires spec.md and plan.md before tasks.md can be generated
- **All API behavior must be explicitly defined in specs**: No implicit or undocumented endpoints
- **REST APIs must follow HTTP semantics and status codes**: Use appropriate methods (GET, POST, PUT, DELETE) and status codes (200, 201, 400, 401, 404, 500)
- **Errors must be explicit, predictable, and documented**: Every error condition must be specified with expected status code and message format
- **Frontend must consume APIs exactly as specified**: No deviations from documented contracts

### Authentication Standards

- **Authentication must use Better Auth with JWT tokens**: No alternative auth mechanisms
- **All backend routes must validate JWT and enforce task ownership**: Every protected endpoint must verify token and check user ownership
- **Stateless backend authentication (JWT only)**: No server-side sessions
- **All database queries must be user-scoped**: Every query must filter by authenticated user ID

### Security Standards

- **No hard-coded secrets; environment variables only**: All sensitive configuration must use .env files
- **Multi-user support is mandatory**: System must support multiple concurrent users with isolated data
- **Data persistence required across sessions**: User data must survive server restarts

## Technology Constraints

The following technology stack is **fixed and non-negotiable**:

- **Frontend**: Next.js 16+ (App Router)
- **Backend**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (JWT-based)

**Rationale**: Technology decisions have been made to optimize for the hackathon evaluation criteria. Changing technologies mid-project would invalidate planning work and risk project failure.

## Success Criteria

The project is considered successful when ALL of the following criteria are met:

1. **Complete Implementation**: All three specs (Backend, Auth, Frontend) are fully implemented and integrated
2. **User Authentication**: Users can sign up, sign in, and receive valid JWT tokens
3. **Task Isolation**: Users can manage only their own tasks; attempts to access other users' tasks return 401
4. **Authorization Enforcement**: Unauthorized requests return 401 consistently across all protected endpoints
5. **Ownership Enforcement**: Task ownership is enforced on every CRUD operation (create, read, update, delete)
6. **End-to-End Functionality**: Application works as a complete full-stack system from signup to task management
7. **Process Traceability**: Specs, plans, and task iterations are documented and reviewable
8. **Hackathon Compliance**: Project passes hackathon evaluation based on process adherence and correctness

## Governance

### Amendment Process

This constitution supersedes all other development practices and guidelines. Amendments require:

1. **Documentation**: Proposed changes must be documented with rationale
2. **Approval**: Changes must be explicitly approved before implementation
3. **Migration Plan**: If changes affect existing code, a migration plan must be provided
4. **Version Update**: Constitution version must be incremented according to semantic versioning

### Compliance Verification

- All pull requests and code reviews must verify compliance with this constitution
- Any complexity or deviation from principles must be explicitly justified
- Use `.specify/memory/constitution.md` (this file) as the authoritative source for all development decisions

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward incompatible governance changes or principle removals/redefinitions
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

---

**Version**: 1.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
