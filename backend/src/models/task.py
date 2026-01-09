"""
Task model for database.

Represents a todo item with ownership, completion status, and timestamps.
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, ClassVar

if TYPE_CHECKING:
    from .user import User

class Task(SQLModel, table=True):
    """
    Task entity representing a single todo item.

    Fields:
        id: Unique task identifier (auto-generated)
        title: Task title/summary (required, max 500 chars)
        description: Detailed task description (optional, max 5000 chars)
        is_completed: Completion status (default: False)
        user_id: Owner of the task (foreign key to users.id)
        created_at: Task creation timestamp (UTC)
        updated_at: Last modification timestamp (UTC)
    """
    __tablename__: ClassVar[str] = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=500, nullable=False, index=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False, nullable=False, index=True)
    user_id: str = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: Optional["User"] = Relationship(back_populates="tasks")
