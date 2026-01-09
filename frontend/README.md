# Todo Frontend

Next.js application with Better Auth for JWT-based authentication and task management.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running (see `backend/README.md`)
- Git

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
# Authentication Secret
# IMPORTANT: Generate a strong secret using: openssl rand -base64 32
# This secret MUST match JWT_SECRET in backend/.env
# Minimum 32 characters required for HS256 security
AUTH_SECRET=your-super-secret-key-min-32-characters-long-for-hs256-security

# Backend API URL
# Development: http://localhost:8000
# Production: Your deployed backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Security Notes**:
- Never commit `.env.local` file to version control
- Generate a strong secret for production (minimum 32 characters)
- The AUTH_SECRET must match the JWT_SECRET in your backend configuration

### 3. Generate Strong Secret

```bash
# Generate a secure 32+ character secret
openssl rand -base64 32
```

Copy the generated secret to both:
- Frontend: `frontend/.env.local` as `AUTH_SECRET`
- Backend: `backend/.env` as `JWT_SECRET`

### 4. Start Development Server

```bash
# From frontend/ directory
npm run dev
```

Application will start at: `http://localhost:3000`

## Authentication Flow

### User Registration

1. Navigate to `/register`
2. Enter email and password (must meet requirements)
3. Submit form
4. Better Auth creates user account and issues JWT token
5. Token stored in httpOnly cookie (XSS protection)
6. Redirect to `/tasks` page

### User Login

1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. Better Auth validates credentials and issues JWT token
5. Token stored in httpOnly cookie
6. Redirect to `/tasks` page

### Authenticated Requests

All API requests to the backend automatically include the JWT token:
1. API client extracts token from httpOnly cookie
2. Token attached to Authorization header: `Bearer <token>`
3. Backend validates token and extracts user ID
4. User isolation enforced on all operations

### Token Expiration

- Tokens expire after 24 hours
- Expired tokens trigger 401 response
- User automatically redirected to login page
- Re-authentication required

## Pages

### `/register` - User Registration

- Email and password form
- Client-side validation:
  - Valid email format
  - Password minimum 8 characters
  - Password must contain uppercase, lowercase, and numbers
  - Password confirmation match
- Error handling for duplicate emails
- Success redirects to `/tasks`

### `/login` - User Login

- Email and password form
- Error handling for invalid credentials
- Network error handling
- Success redirects to `/tasks`

### `/tasks` - Task Management

- List all tasks for authenticated user
- Create new tasks with title and description
- Toggle task completion status
- Edit task title and description
- Delete tasks with confirmation
- Real-time updates after each operation
- Automatic redirect to login if unauthenticated (401)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── register/     # Registration page
│   │   │   └── page.tsx
│   │   ├── login/        # Login page
│   │   │   └── page.tsx
│   │   └── tasks/        # Tasks management page
│   │       └── page.tsx
│   ├── lib/              # Shared utilities
│   │   ├── auth.ts       # Better Auth configuration
│   │   └── api-client.ts # API client with JWT token handling
│   └── components/       # Reusable React components
├── .env.local.example    # Environment variable template
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## API Client

The API client (`src/lib/api-client.ts`) handles all backend communication:

### Features

- **Automatic Token Attachment**: Extracts JWT from httpOnly cookie and adds to Authorization header
- **401 Error Handling**: Redirects to login on authentication failure
- **Type Safety**: TypeScript generics for request/response types
- **Convenience Methods**: `api.get()`, `api.post()`, `api.put()`, `api.delete()`

### Usage Example

```typescript
import { api } from "@/lib/api-client";

// GET request
const response = await api.get<{ tasks: Task[] }>("/tasks");

// POST request
const newTask = await api.post<Task>("/tasks", {
  title: "New task",
  description: "Task description"
});

// PUT request
const updated = await api.put<Task>(`/tasks/${taskId}`, {
  is_completed: true
});

// DELETE request
await api.delete(`/tasks/${taskId}`);
```

## Better Auth Configuration

Better Auth is configured in `src/lib/auth.ts`:

- **JWT Provider**: Issues JWT tokens with shared secret
- **Token Expiration**: 24 hours
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Cookie Storage**: httpOnly cookies for XSS protection
- **Email/Password**: Enabled with password requirements

## Security Considerations

### Token Security

- **httpOnly Cookies**: Tokens stored in httpOnly cookies (not accessible to JavaScript)
- **XSS Protection**: httpOnly flag prevents XSS attacks from stealing tokens
- **Shared Secret**: 32+ character secret synchronized with backend
- **Token Expiration**: 24-hour limit reduces exposure window
- **HTTPS Required**: Secure cookie transmission in production

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### User Isolation

- All API requests include user identity from JWT token
- Backend enforces user isolation on all operations
- Users can only access their own tasks

## Development

For detailed architecture and implementation details, see:

**Authentication & Security (Spec-2)**:
- **Specification**: `specs/002-user-auth-jwt/spec.md`
- **Architecture Plan**: `specs/002-user-auth-jwt/plan.md`
- **Quickstart Guide**: `specs/002-user-auth-jwt/quickstart.md`
- **API Contract**: `specs/002-user-auth-jwt/contracts/auth-api.yaml`

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## Troubleshooting

### "Authentication required" error

- Check that backend is running at `NEXT_PUBLIC_API_URL`
- Verify JWT_SECRET matches AUTH_SECRET
- Check browser cookies for `better-auth.session_token`
- Try logging out and logging back in

### "Invalid token" error

- Verify JWT_SECRET and AUTH_SECRET match exactly
- Check token hasn't expired (24-hour limit)
- Ensure backend JWT verification middleware is configured correctly

### CORS errors

- Verify backend CORS configuration allows frontend origin
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running and accessible

### Token not being sent

- Check that token exists in cookies (browser DevTools → Application → Cookies)
- Verify API client is extracting token correctly
- Check Authorization header in Network tab

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
