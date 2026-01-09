# Todo Backend API

RESTful API for task management with user-scoped data handling.

## Prerequisites

- Python 3.11 or higher
- PostgreSQL database (Neon Serverless PostgreSQL recommended)
- pip (Python package manager)
- Git

## Quick Start

### 1. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Example for Neon Serverless PostgreSQL:
# DATABASE_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Authentication Secret
# IMPORTANT: Generate a strong secret using: openssl rand -base64 32
# This secret MUST match AUTH_SECRET in frontend/.env.local
# Minimum 32 characters required for HS256 security
JWT_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security
```

**Security Notes**:
- Never commit `.env` file to version control
- Generate a strong JWT secret for production (minimum 32 characters)
- The JWT_SECRET must match the AUTH_SECRET in your frontend configuration

### 4. Initialize Database

```bash
# Run database initialization
python -m src.database init
```

### 5. Start Development Server

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

## Authentication

This API uses JWT (JSON Web Token) authentication. All task endpoints require a valid JWT token in the Authorization header.

### JWT Token Requirements

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Shared Secret**: Must match frontend AUTH_SECRET
- **Token Claims**: Must include `sub` (user ID), `email`, `iat` (issued at), `exp` (expiration)
- **Token Expiration**: 24 hours from issuance
- **Header Format**: `Authorization: Bearer <token>`

### Generating a Strong JWT Secret

```bash
# Generate a secure 32+ character secret
openssl rand -base64 32
```

Copy the generated secret to both:
- Backend: `backend/.env` as `JWT_SECRET`
- Frontend: `frontend/.env.local` as `AUTH_SECRET`

### Authentication Flow

1. User registers/logs in through frontend (Better Auth)
2. Frontend receives JWT token with user identity
3. Frontend attaches token to API requests in Authorization header
4. Backend validates token signature and extracts user ID
5. Backend enforces user isolation on all task operations

### Testing Authentication

```bash
# Test token validation endpoint
curl -X GET http://localhost:8000/tasks/validate-token \
  -H "Authorization: Bearer <your-jwt-token>"

# Expected response:
# {"valid": true, "user_id": "123", "message": "Token is valid and user identity verified"}
```

## API Endpoints

### Authentication

- `GET /tasks/validate-token` - Validate JWT token and return user identity (temporary testing endpoint)

### Tasks (All require JWT authentication)

- `POST /tasks` - Create a new task (user ID extracted from JWT)
- `GET /tasks/{task_id}` - Get a single task (user isolation enforced)
- `GET /tasks` - List all tasks for authenticated user
- `PUT /tasks/{task_id}` - Update a task (user isolation enforced)
- `DELETE /tasks/{task_id}` - Delete a task (user isolation enforced)

**Note**: All task endpoints enforce user isolation - users can only access their own tasks.

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_api.py
```

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel database models
│   ├── schemas/         # Pydantic request/response schemas
│   ├── api/             # FastAPI route handlers
│   │   └── routes/      # Task CRUD endpoints
│   ├── middleware/      # Authentication middleware
│   │   ├── __init__.py
│   │   └── auth.py      # JWT verification and user identity extraction
│   ├── database.py      # Database connection and session management
│   ├── config.py        # Environment configuration (DATABASE_URL, JWT_SECRET)
│   └── main.py          # FastAPI application entry point
├── tests/
│   ├── test_api.py      # API endpoint tests
│   ├── test_models.py   # Database model tests
│   └── conftest.py      # Pytest fixtures
├── .env.example         # Environment variable template
├── requirements.txt     # Python dependencies (includes PyJWT)
└── README.md            # This file
```

## Security Considerations

### JWT Token Security

- **Secret Length**: Minimum 32 characters for HS256 security
- **Secret Storage**: Store in environment variables, never in code
- **Token Expiration**: 24-hour limit reduces exposure window
- **User Isolation**: All queries filtered by JWT-extracted user_id
- **Generic 401 Responses**: Prevents user enumeration
- **HTTPS Required**: Secure token transmission in production

### Authentication Failure Logging

All authentication failures are logged for security monitoring:
- Missing or invalid tokens
- Expired tokens
- Tokens with missing claims

Check application logs for authentication-related security events.

## Development

For detailed setup instructions and usage examples, see:

**Backend Core (Spec-1)**:
- **Specification**: `specs/001-todo-backend-api/spec.md`
- **Implementation Plan**: `specs/001-todo-backend-api/plan.md`
- **Quickstart Guide**: `specs/001-todo-backend-api/quickstart.md`
- **API Contract**: `specs/001-todo-backend-api/contracts/openapi.yaml`

**Authentication & Security (Spec-2)**:
- **Specification**: `specs/002-user-auth-jwt/spec.md`
- **Architecture Plan**: `specs/002-user-auth-jwt/plan.md`
- **Quickstart Guide**: `specs/002-user-auth-jwt/quickstart.md`
- **API Contract**: `specs/002-user-auth-jwt/contracts/auth-api.yaml`
