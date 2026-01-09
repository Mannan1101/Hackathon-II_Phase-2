"""
Task API routes.

Implements CRUD operations for tasks with user isolation enforcement.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from ...database import get_session
from ...models.task import Task
from ...models.user import User
from ...schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from ...schemas.error import Error, ErrorDetail
from ...middleware.auth import get_current_user_id

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get(
    "/validate-token",
    response_model=dict,
    responses={
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
    },
)
async def validate_token(
    user_id: str = Depends(get_current_user_id),
):
    """
    Validate JWT token and return user identity.

    Temporary endpoint for manual testing of JWT authentication.
    Can be removed after authentication is fully validated.

    Args:
        user_id: User ID extracted from JWT token

    Returns:
        dict: User ID and validation status
    """
    return {
        "valid": True,
        "user_id": user_id,
        "message": "Token is valid and user identity verified"
    }

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": Error, "description": "Bad request - validation error"},
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
        422: {"model": Error, "description": "Unprocessable entity - business logic error"},
        500: {"model": Error, "description": "Internal server error"},
    },
)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Create a new task.

    Args:
        task_data: Task creation data (title, description)
        user_id: User ID extracted from JWT token
        session: Database session

    Returns:
        TaskResponse: Created task with all fields

    Raises:
        HTTPException 400: If user_id is invalid or missing
        HTTPException 401: If token is invalid or missing
        HTTPException 422: If validation fails (title length, etc.)
    """
    # Verify user exists (user isolation enforcement)
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "INVALID_USER",
                    "message": f"User with id {user_id} does not exist",
                    "details": {"field": "user_id", "value": user_id},
                }
            },
        )

    # Create task with authenticated user's ID
    task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=user_id,
        is_completed=False,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get(
    "",
    response_model=TaskListResponse,
    responses={
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
        500: {"model": Error, "description": "Internal server error"},
    },
)
async def list_tasks(
    user_id: str = Depends(get_current_user_id),
    completed: Optional[bool] = Query(None, description="Filter by completion status (true/false). Omit to get all tasks."),
    session: Session = Depends(get_session),
):
    """
    List all tasks for a user.

    Enforces user isolation - returns only tasks owned by the authenticated user.
    Supports optional filtering by completion status.
    Results are sorted by created_at DESC for consistent ordering.

    Args:
        user_id: User ID extracted from JWT token
        completed: Optional completion status filter (true/false)
        session: Database session

    Returns:
        TaskListResponse: List of tasks with total count

    Raises:
        HTTPException 401: If token is invalid or missing
    """
    # Build query with user isolation enforcement
    statement = select(Task).where(Task.user_id == user_id)

    # Add completion status filter if provided
    if completed is not None:
        statement = statement.where(Task.is_completed == completed)

    # Add sorting by created_at DESC for consistent ordering
    statement = statement.order_by(Task.created_at.desc())

    # Execute query
    tasks = session.exec(statement).all()

    # Return list with total count (handles empty list case)
    return TaskListResponse(tasks=tasks, total=len(tasks))

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    responses={
        400: {"model": Error, "description": "Bad request - invalid parameters"},
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
        404: {"model": Error, "description": "Task not found or user doesn't own it"},
        500: {"model": Error, "description": "Internal server error"},
    },
)
async def get_task(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Get a single task by ID.

    Enforces user isolation - users can only access their own tasks.

    Args:
        task_id: Task ID to retrieve
        user_id: User ID extracted from JWT token
        session: Database session

    Returns:
        TaskResponse: Task data if found and owned by user

    Raises:
        HTTPException 401: If token is invalid or missing
        HTTPException 404: If task not found or user doesn't own it
    """
    # Retrieve task with user isolation enforcement
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Task not found",
                    "details": {},
                }
            },
        )

    return task

@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    responses={
        400: {"model": Error, "description": "Bad request - validation error"},
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
        404: {"model": Error, "description": "Task not found or user doesn't own it"},
        422: {"model": Error, "description": "Unprocessable entity - business logic error"},
        500: {"model": Error, "description": "Internal server error"},
    },
)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Update an existing task.

    Enforces user isolation - users can only update their own tasks.
    Automatically refreshes updated_at timestamp on any field change.

    Args:
        task_id: Task ID to update
        task_data: Task update data (optional title, description, is_completed)
        user_id: User ID extracted from JWT token
        session: Database session

    Returns:
        TaskResponse: Updated task data

    Raises:
        HTTPException 401: If token is invalid or missing
        HTTPException 404: If task not found or user doesn't own it
        HTTPException 422: If business logic validation fails
    """
    # Retrieve task with user isolation enforcement
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Task not found",
                    "details": {},
                }
            },
        )

    # Update task fields (only provided fields)
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.is_completed is not None:
        task.is_completed = task_data.is_completed

    # Refresh updated_at timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {"model": Error, "description": "Bad request - invalid parameters"},
        401: {"model": Error, "description": "Unauthorized - invalid or missing token"},
        404: {"model": Error, "description": "Task not found or user doesn't own it"},
        500: {"model": Error, "description": "Internal server error"},
    },
)
async def delete_task(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Delete a task.

    Enforces user isolation - users can only delete their own tasks.

    Args:
        task_id: Task ID to delete
        user_id: User ID extracted from JWT token
        session: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException 401: If token is invalid or missing
        HTTPException 404: If task not found or user doesn't own it
    """
    # Retrieve task with user isolation enforcement
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Task not found",
                    "details": {},
                }
            },
        )

    # Delete task
    session.delete(task)
    session.commit()

    return None
