# Quickstart Guide: Backend Core & Data Layer

**Feature**: Backend Core & Data Layer (001-todo-backend-api)
**Date**: 2026-01-09
**Purpose**: Setup instructions and usage examples for the Todo Backend API

## Prerequisites

- Python 3.11 or higher
- PostgreSQL database (Neon Serverless PostgreSQL recommended)
- pip (Python package manager)
- Git

## Environment Setup

### 1. Clone Repository and Navigate to Backend

```bash
git clone <repository-url>
cd <repository-name>
git checkout 001-todo-backend-api
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**requirements.txt**:
```
fastapi==0.104.1
sqlmodel==0.0.14
psycopg2-binary==2.9.9
pydantic==2.5.0
uvicorn[standard]==0.24.0
pytest==7.4.3
httpx==0.25.2
python-dotenv==1.0.0
```

### 4. Configure Database Connection

Create `.env` file in `backend/` directory:

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@host:port/database

# Example for Neon Serverless PostgreSQL:
# DATABASE_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Security Note**: Never commit `.env` file to version control. Add it to `.gitignore`.

### 5. Initialize Database

```bash
# Run database migrations (creates tables)
python -m src.database init

# Or manually run SQL from data-model.md
psql $DATABASE_URL < specs/001-todo-backend-api/data-model.md
```

### 6. Start Development Server

```bash
# From backend/ directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: `http://localhost:8000`

## API Documentation

Once the server is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Usage Examples

### Create a Task

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "user_id": 1
  }'
```

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "user_id": 1,
  "created_at": "2026-01-09T12:00:00Z",
  "updated_at": "2026-01-09T12:00:00Z"
}
```

### Get a Single Task

```bash
curl -X GET "http://localhost:8000/tasks/1?user_id=1"
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "user_id": 1,
  "created_at": "2026-01-09T12:00:00Z",
  "updated_at": "2026-01-09T12:00:00Z"
}
```

### List All Tasks for a User

```bash
# Get all tasks
curl -X GET "http://localhost:8000/tasks?user_id=1"

# Get only incomplete tasks
curl -X GET "http://localhost:8000/tasks?user_id=1&completed=false"

# Get only completed tasks
curl -X GET "http://localhost:8000/tasks?user_id=1&completed=true"
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "is_completed": false,
      "user_id": 1,
      "created_at": "2026-01-09T12:00:00Z",
      "updated_at": "2026-01-09T12:00:00Z"
    }
  ],
  "total": 1
}
```

### Update a Task

```bash
# Update title and description
curl -X PUT "http://localhost:8000/tasks/1?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries and cook dinner",
    "description": "Milk, eggs, bread, chicken"
  }'

# Mark task as complete
curl -X PUT "http://localhost:8000/tasks/1?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "is_completed": true
  }'
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "is_completed": true,
  "user_id": 1,
  "created_at": "2026-01-09T12:00:00Z",
  "updated_at": "2026-01-09T12:30:00Z"
}
```

### Delete a Task

```bash
curl -X DELETE "http://localhost:8000/tasks/1?user_id=1"
```

**Response** (204 No Content): Empty response body

## Testing

### Run All Tests

```bash
# From backend/ directory
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

### Test User Isolation

```bash
# Create task for user 1
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "User 1 task", "user_id": 1}'

# Try to access with user 2 (should return 404)
curl -X GET "http://localhost:8000/tasks/1?user_id=2"
```

Expected: 404 Not Found (user isolation enforced)

## Common Issues and Solutions

### Issue: Database Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify DATABASE_URL in `.env` is correct
2. Check database server is running
3. For Neon, ensure `?sslmode=require` is in connection string
4. Test connection: `psql $DATABASE_URL`

### Issue: Import Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Verify Python version: `python --version` (should be 3.11+)

### Issue: Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution**:
1. Kill process using port 8000: `lsof -ti:8000 | xargs kill -9` (macOS/Linux)
2. Or use different port: `uvicorn src.main:app --port 8001`

### Issue: Migration Errors

**Error**: `relation "tasks" already exists`

**Solution**:
1. Drop existing tables: `DROP TABLE tasks CASCADE; DROP TABLE users CASCADE;`
2. Re-run migrations
3. Or use Alembic for proper migration management

## Development Workflow

### 1. Make Code Changes

Edit files in `backend/src/`:
- `models/` - Database models
- `schemas/` - Request/response schemas
- `api/routes/` - API endpoints
- `database.py` - Database connection
- `main.py` - Application entry point

### 2. Test Changes

```bash
# Run tests
pytest

# Manual testing via curl or Swagger UI
curl -X GET http://localhost:8000/docs
```

### 3. Verify User Isolation

Always test that users cannot access other users' tasks:

```bash
# Create task for user 1
TASK_ID=$(curl -s -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "user_id": 1}' | jq -r '.id')

# Verify user 2 cannot access it (should return 404)
curl -X GET "http://localhost:8000/tasks/$TASK_ID?user_id=2"
```

### 4. Check API Documentation

After changes, verify OpenAPI docs are updated:
- Visit http://localhost:8000/docs
- Verify new endpoints appear
- Test endpoints via Swagger UI

## Integration with Spec-2 (Authentication)

**Current State (Spec-1)**: `user_id` is passed as query parameter

**Future State (Spec-2)**: `user_id` will be extracted from JWT token

**Migration Path**:
1. Add JWT middleware to FastAPI
2. Extract user_id from token in dependency
3. Remove user_id from query parameters
4. Update all endpoint signatures

**Example Future Endpoint**:
```python
# Current (Spec-1)
@app.get("/tasks/{task_id}")
async def get_task(task_id: int, user_id: int):
    # user_id from query parameter
    pass

# Future (Spec-2)
@app.get("/tasks/{task_id}")
async def get_task(task_id: int, current_user: User = Depends(get_current_user)):
    # user_id from JWT token via dependency
    user_id = current_user.id
    pass
```

## Performance Monitoring

### Check Database Query Performance

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE neondb SET log_statement = 'all';
ALTER DATABASE neondb SET log_duration = on;

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitor API Response Times

```bash
# Use curl with timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/tasks?user_id=1

# curl-format.txt:
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

## Next Steps

1. ✅ Backend API is running and tested
2. ⏭️ Proceed to `/sp.tasks` to generate implementation tasks
3. ⏭️ Implement tasks following TDD approach
4. ⏭️ Integrate with Spec-2 (Authentication) when ready
5. ⏭️ Integrate with Spec-3 (Frontend) when ready

## Support

- **API Documentation**: http://localhost:8000/docs
- **Spec Document**: `specs/001-todo-backend-api/spec.md`
- **Data Model**: `specs/001-todo-backend-api/data-model.md`
- **API Contract**: `specs/001-todo-backend-api/contracts/openapi.yaml`
