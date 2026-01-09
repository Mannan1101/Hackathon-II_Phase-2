"""
Task request/response schemas.

Defines Pydantic models for task API endpoints.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """
    Request schema for creating a new task.

    Fields:
        title: Task title (required, 1-500 characters)
        description: Task description (optional, max 5000 characters)
        user_id: User ID (temporary for Spec-1, will be extracted from JWT in Spec-2)
    """
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    user_id: int = Field(..., gt=0)

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate that title is not empty or whitespace-only."""
        if not v or v.strip() == '':
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

class TaskUpdate(BaseModel):
    """
    Request schema for updating an existing task.

    All fields are optional - only provided fields will be updated.

    Fields:
        title: Updated task title (optional, 1-500 characters)
        description: Updated task description (optional, max 5000 characters)
        is_completed: Updated completion status (optional)
    """
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    is_completed: Optional[bool] = None

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate that title is not empty or whitespace-only if provided."""
        if v is not None and (not v or v.strip() == ''):
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip() if v else None

class TaskResponse(BaseModel):
    """
    Response schema for task data.

    Returns complete task information including timestamps.

    Fields:
        id: Unique task identifier
        title: Task title
        description: Task description (nullable)
        is_completed: Completion status
        user_id: Owner user ID
        created_at: Task creation timestamp (UTC)
        updated_at: Last update timestamp (UTC)
    """
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Enable ORM mode for SQLModel compatibility

class TaskListResponse(BaseModel):
    """
    Response schema for task list.

    Returns array of tasks with total count.

    Fields:
        tasks: Array of TaskResponse objects
        total: Total number of tasks returned
    """
    tasks: list[TaskResponse]
    total: int
