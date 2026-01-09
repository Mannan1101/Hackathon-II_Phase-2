"""
User model for database.

Represents a user account with minimal fields for Spec-1.
Full authentication fields will be added in Spec-2.
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING, ClassVar

if TYPE_CHECKING:
    from .task import Task

class User(SQLModel, table=True):
    """
    User entity representing a user account.

    Fields:
        id: Unique user identifier (auto-generated)
        email: User email address (unique)
        created_at: Account creation timestamp (UTC)
    """
    __tablename__: ClassVar[str] = "users"

    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, nullable=False, unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
