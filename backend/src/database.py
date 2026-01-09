"""
Database connection and session management.

Provides SQLModel engine, session factory, and database initialization.
"""
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from typing import Generator
from .config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using them
)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session

def create_tables():
    """
    Create all database tables.

    This function creates all tables defined in SQLModel models.
    Should be called on application startup.
    """
    SQLModel.metadata.create_all(engine)

def run_migrations():
    """
    Run database migrations.

    Executes SQL migrations for initial schema setup including:
    - Users table with email index
    - Tasks table with foreign key to users
    - Indexes for query optimization
    - Trigger for auto-updating updated_at timestamp
    """
    logger.info("Running database migrations...")

    # SQL migration script from data-model.md
    migration_sql = """
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Create tasks table
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, is_completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

    -- Trigger to auto-update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
    CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """

    try:
        # Use raw connection to execute multi-statement SQL
        # engine.begin() automatically commits on success, rolls back on error
        with engine.begin() as connection:
            connection.execute(text(migration_sql))
        logger.info("Database migrations completed successfully!")
    except Exception as e:
        logger.error(f"Database migration failed: {e}")
        raise

def init_db():
    """
    Initialize database by creating all tables.

    This is the main entry point for database initialization.
    Can be called from command line: python -m src.database init
    """
    logger.info("Creating database tables...")
    create_tables()
    logger.info("Database tables created successfully!")

# Allow running as script for database initialization
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "init":
        init_db()
    elif len(sys.argv) > 1 and sys.argv[1] == "migrate":
        run_migrations()
    else:
        print("Usage: python -m src.database [init|migrate]")

