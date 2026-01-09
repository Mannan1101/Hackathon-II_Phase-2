# Research: Backend Core & Data Layer

**Feature**: Backend Core & Data Layer (001-todo-backend-api)
**Date**: 2026-01-09
**Purpose**: Document architectural decisions, technology choices, and best practices for FastAPI + SQLModel + Neon PostgreSQL backend

## Research Questions Resolved

### 1. FastAPI + SQLModel Architecture

**Decision**: Use FastAPI with SQLModel ORM for type-safe database operations

**Rationale**:
- SQLModel combines SQLAlchemy ORM with Pydantic validation, providing type safety across database and API layers
- FastAPI's automatic OpenAPI documentation generation ensures API contracts are always up-to-date
- Async support in FastAPI enables high concurrency for 100+ concurrent users
- Pydantic models provide automatic request/response validation

**Alternatives Considered**:
- Django REST Framework: Rejected due to heavier framework overhead and less modern async support
- Flask + SQLAlchemy: Rejected due to lack of automatic API documentation and validation
- Raw SQLAlchemy: Rejected due to lack of integrated validation and more boilerplate code

**Best Practices**:
- Separate SQLModel database models from Pydantic request/response schemas
- Use dependency injection for database sessions
- Implement proper connection pooling for Neon Serverless PostgreSQL
- Use async database operations where possible

### 2. Database Schema Design

**Decision**: Two-table schema with Task and User entities, foreign key relationship

**Task Schema Fields**:
- `id`: Integer, primary key, auto-increment
- `title`: String(500), required, indexed for search
- `description`: Text(5000), optional
- `is_completed`: Boolean, default False, indexed for filtering
- `user_id`: Integer, foreign key to User.id, required, indexed for user-scoped queries
- `created_at`: DateTime, auto-generated on creation
- `updated_at`: DateTime, auto-updated on modification

**User Schema Fields** (minimal for Spec-1):
- `id`: Integer, primary key, auto-increment
- `email`: String(255), unique, indexed (placeholder for Spec-2 integration)
- `created_at`: DateTime, auto-generated

**Rationale**:
- User table is minimal in Spec-1 since authentication is handled in Spec-2
- Foreign key constraint ensures referential integrity
- Indexes on user_id and is_completed optimize common query patterns
- Timestamps enable audit trails and sorting

**Alternatives Considered**:
- Single table with embedded user data: Rejected due to data duplication and update anomalies
- NoSQL document store: Rejected due to constitution requirement for PostgreSQL
- Separate completed_at timestamp: Rejected as unnecessary complexity for boolean status

### 3. User-Task Ownership Enforcement

**Decision**: Enforce ownership via user_id foreign key + query filtering at API layer

**Implementation Strategy**:
- All task queries include `WHERE user_id = :current_user_id` filter
- API endpoints accept user_id parameter (pre-auth design for Spec-1)
- Database foreign key constraint prevents orphaned tasks
- SQLModel relationships enable efficient joins

**Rationale**:
- Database-level foreign key provides data integrity
- Application-level filtering prevents cross-user data access
- Pre-auth design allows testing without authentication layer
- Easy migration to JWT-extracted user_id in Spec-2

**Alternatives Considered**:
- Row-level security in PostgreSQL: Rejected as overkill for application-level isolation
- Separate database per user: Rejected due to operational complexity
- No foreign key constraint: Rejected due to data integrity concerns

### 4. Error Handling Strategy

**Decision**: Structured error responses with consistent HTTP status codes

**HTTP Status Code Usage**:
- `200 OK`: Successful GET, PUT operations
- `201 Created`: Successful POST (task creation)
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors (missing required fields, invalid data types)
- `404 Not Found`: Task ID doesn't exist or user doesn't own task
- `422 Unprocessable Entity`: Business logic errors (e.g., title too long)
- `500 Internal Server Error`: Database connection failures, unexpected errors

**Error Response Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

**Rationale**:
- Consistent error format enables frontend to handle errors uniformly
- HTTP status codes follow REST conventions
- Error codes enable programmatic error handling
- Details field provides debugging information

**Alternatives Considered**:
- Generic error messages: Rejected due to poor developer experience
- HTTP 200 with error flag: Rejected as anti-pattern violating HTTP semantics
- Stack traces in production: Rejected due to security concerns

### 5. Neon Serverless PostgreSQL Integration

**Decision**: Use connection pooling with environment-based configuration

**Connection Strategy**:
- Use `psycopg2-binary` driver for PostgreSQL connectivity
- Implement connection pooling via SQLModel/SQLAlchemy engine
- Store DATABASE_URL in environment variable (.env file)
- Use connection string format: `postgresql://user:password@host:port/database`

**Rationale**:
- Neon Serverless PostgreSQL is fully PostgreSQL-compatible
- Connection pooling reduces overhead for concurrent requests
- Environment variables enable different configs for dev/test/prod
- SQLModel handles connection lifecycle automatically

**Best Practices**:
- Set pool size based on expected concurrency (start with 10-20 connections)
- Implement connection retry logic for transient failures
- Use connection timeouts to prevent hanging requests
- Close sessions properly in FastAPI dependency cleanup

**Alternatives Considered**:
- Direct psycopg2 connections: Rejected due to lack of ORM benefits
- asyncpg driver: Deferred to implementation phase (may use for async operations)
- Connection per request: Rejected due to performance overhead

### 6. REST API Design Patterns

**Decision**: Resource-based URLs with standard HTTP methods

**Endpoint Structure**:
- `POST /tasks` - Create new task
- `GET /tasks/{task_id}` - Retrieve single task
- `GET /tasks` - List all user's tasks (with optional ?completed=true/false filter)
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

**Request/Response Patterns**:
- Accept JSON request bodies
- Return JSON responses with consistent structure
- Include resource ID in creation response
- Use query parameters for filtering

**Rationale**:
- RESTful design is industry standard and well-understood
- Resource-based URLs are intuitive and predictable
- Standard HTTP methods map naturally to CRUD operations
- Query parameters enable flexible filtering without URL complexity

**Alternatives Considered**:
- GraphQL: Rejected as overkill for simple CRUD operations
- RPC-style endpoints (/createTask, /updateTask): Rejected as non-RESTful
- Nested routes (/users/{user_id}/tasks): Deferred since user_id comes from auth token in Spec-2

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Web Framework | FastAPI | 0.104+ | REST API endpoints, automatic OpenAPI docs |
| ORM | SQLModel | 0.0.14+ | Type-safe database models with Pydantic integration |
| Database | Neon Serverless PostgreSQL | PostgreSQL 15+ | Persistent data storage |
| Validation | Pydantic | 2.5+ | Request/response validation (included with FastAPI) |
| Database Driver | psycopg2-binary | 2.9+ | PostgreSQL connectivity |
| Testing | pytest | 7.4+ | Unit and integration tests |
| HTTP Client (testing) | httpx | 0.25+ | API endpoint testing |

## Implementation Priorities

1. **Phase 1 (P1 - MVP)**: Create and Retrieve Tasks
   - Database models (Task, User)
   - POST /tasks endpoint
   - GET /tasks/{task_id} endpoint
   - Basic error handling

2. **Phase 2 (P2 - Complete CRUD)**: Update and Delete Tasks
   - PUT /tasks/{task_id} endpoint
   - DELETE /tasks/{task_id} endpoint
   - User isolation enforcement

3. **Phase 3 (P3 - Usability)**: List and Filter Tasks
   - GET /tasks endpoint with filtering
   - Query optimization for list operations

## Open Questions for Implementation

None - all architectural decisions resolved. Ready to proceed to Phase 1 (Design).
