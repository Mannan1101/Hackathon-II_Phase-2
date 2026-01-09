# Data Model: Backend Core & Data Layer

**Feature**: Backend Core & Data Layer (001-todo-backend-api)
**Date**: 2026-01-09
**Purpose**: Define database schema, entity relationships, and data validation rules

## Entity Definitions

### Task Entity

**Purpose**: Represents a single todo item with ownership, completion status, and timestamps

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique task identifier |
| title | String(500) | Required, Not Null | Task title/summary |
| description | Text(5000) | Optional, Nullable | Detailed task description |
| is_completed | Boolean | Required, Default: False | Completion status |
| user_id | Integer | Foreign Key (User.id), Required, Not Null | Owner of the task |
| created_at | DateTime | Auto-generated, Not Null | Task creation timestamp (UTC) |
| updated_at | DateTime | Auto-updated, Not Null | Last modification timestamp (UTC) |

**Indexes**:
- Primary index on `id` (automatic)
- Index on `user_id` (for user-scoped queries)
- Composite index on `(user_id, is_completed)` (for filtered list queries)
- Index on `created_at` (for sorting by creation date)

**Validation Rules**:
- `title`: Must not be empty or whitespace-only, max 500 characters
- `description`: Max 5000 characters if provided
- `user_id`: Must reference existing User.id
- `is_completed`: Boolean only (true/false)

**State Transitions**:
- New task: `is_completed = False`
- Mark complete: `is_completed = False → True`
- Mark incomplete: `is_completed = True → False`
- Update triggers: `updated_at` timestamp refreshed on any field change

### User Entity

**Purpose**: Represents a user account (minimal implementation for Spec-1, full implementation in Spec-2)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique user identifier |
| email | String(255) | Unique, Not Null | User email address (placeholder) |
| created_at | DateTime | Auto-generated, Not Null | Account creation timestamp (UTC) |

**Indexes**:
- Primary index on `id` (automatic)
- Unique index on `email`

**Validation Rules**:
- `email`: Must be valid email format, max 255 characters, unique across users

**Note**: This is a minimal User entity for Spec-1. Full user authentication fields (password hash, etc.) will be added in Spec-2.

## Entity Relationships

### Task → User (Many-to-One)

**Relationship**: Each Task belongs to exactly one User. Each User can have many Tasks.

**Implementation**:
- Foreign key: `Task.user_id` references `User.id`
- Cascade behavior: `ON DELETE CASCADE` (if user deleted, all their tasks are deleted)
- Referential integrity enforced at database level

**Query Patterns**:
- Get all tasks for a user: `SELECT * FROM tasks WHERE user_id = :user_id`
- Get user's incomplete tasks: `SELECT * FROM tasks WHERE user_id = :user_id AND is_completed = false`
- Get user's completed tasks: `SELECT * FROM tasks WHERE user_id = :user_id AND is_completed = true`

## SQLModel Implementation

### Task Model (Python)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=500, nullable=False, index=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False, nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: Optional["User"] = Relationship(back_populates="tasks")
```

### User Model (Python)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, nullable=False, unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
```

## Request/Response Schemas

### TaskCreate (Request Schema)

```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    user_id: int = Field(..., gt=0)  # Temporary for Spec-1, will be extracted from JWT in Spec-2

    @validator('title')
    def title_not_empty(cls, v):
        if not v or v.strip() == '':
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()
```

### TaskUpdate (Request Schema)

```python
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    is_completed: Optional[bool] = None

    @validator('title')
    def title_not_empty(cls, v):
        if v is not None and (not v or v.strip() == ''):
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip() if v else None
```

### TaskResponse (Response Schema)

```python
from datetime import datetime

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enables ORM mode for SQLModel compatibility
```

## Database Migrations

### Initial Schema (Alembic Migration)

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, is_completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Integrity Rules

1. **Referential Integrity**: Task.user_id must reference valid User.id
2. **Cascade Delete**: Deleting a user deletes all their tasks
3. **Timestamp Consistency**: created_at never changes, updated_at refreshes on every update
4. **Title Validation**: Title cannot be null, empty, or whitespace-only
5. **Length Constraints**: Title ≤ 500 chars, Description ≤ 5000 chars
6. **User Isolation**: All task queries must filter by user_id

## Query Optimization

### Common Query Patterns

1. **Get user's tasks**: Uses `idx_tasks_user_id`
   ```sql
   SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC;
   ```

2. **Get user's incomplete tasks**: Uses `idx_tasks_user_completed`
   ```sql
   SELECT * FROM tasks WHERE user_id = ? AND is_completed = false ORDER BY created_at DESC;
   ```

3. **Get single task with ownership check**: Uses primary key + user_id index
   ```sql
   SELECT * FROM tasks WHERE id = ? AND user_id = ?;
   ```

### Performance Considerations

- Composite index `(user_id, is_completed)` covers filtered list queries
- Separate `created_at` index enables efficient sorting
- Foreign key index on `user_id` optimizes joins
- Expected query performance: <50ms for list queries, <10ms for single task retrieval

## Edge Cases

1. **Empty title**: Rejected at validation layer (Pydantic)
2. **Whitespace-only title**: Stripped and rejected if empty
3. **Missing user_id**: Rejected at validation layer (required field)
4. **Invalid user_id**: Rejected at database layer (foreign key constraint)
5. **Concurrent updates**: Last write wins (updated_at timestamp determines order)
6. **Deleted user**: All tasks cascade deleted automatically
7. **Very long description**: Truncated at 5000 characters by validation

## Testing Considerations

1. **Model Tests**: Verify field constraints, defaults, relationships
2. **Validation Tests**: Test Pydantic schema validation rules
3. **Database Tests**: Verify foreign key constraints, cascade deletes, indexes
4. **Query Tests**: Verify user isolation, filtering, sorting
5. **Concurrency Tests**: Verify no data corruption under concurrent updates
