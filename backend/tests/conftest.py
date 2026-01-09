"""
Pytest configuration and fixtures.

Provides test fixtures for database and API client setup.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from src.main import app
from src.database import get_session
from src.models.user import User
from src.models.task import Task


@pytest.fixture(name="session")
def session_fixture():
    """
    Create a test database session.

    Uses in-memory SQLite database for testing.
    Creates all tables before each test and drops them after.
    """
    # Create in-memory SQLite database for testing
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

    # Drop all tables after test
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Create a test API client.

    Overrides the database session dependency with test session.
    """
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """
    Create a test user.

    Returns:
        User: Test user with id=1 and email=test@example.com
    """
    user = User(email="test@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_user_2")
def test_user_2_fixture(session: Session):
    """
    Create a second test user for isolation testing.

    Returns:
        User: Test user with id=2 and email=test2@example.com
    """
    user = User(email="test2@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_task")
def test_task_fixture(session: Session, test_user: User):
    """
    Create a test task.

    Returns:
        Task: Test task owned by test_user
    """
    # Ensure test_user has an id (should be set after commit/refresh)
    assert test_user.id is not None, "test_user must have an id"

    task = Task(
        title="Test Task",
        description="Test Description",
        user_id=test_user.id,
        is_completed=False,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
