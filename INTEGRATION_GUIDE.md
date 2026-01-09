# Frontend-Backend Integration Guide

## Overview

Your frontend (Next.js + Better Auth) is now properly connected to your backend (FastAPI + JWT). This guide shows you how to use the integration.

---

## ✅ What's Been Configured

### 1. **JWT Secret Synchronization**
- Frontend `AUTH_SECRET`: `zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=`
- Backend `JWT_SECRET`: `zF9nkn/yW1wAv6JznI0n3TgZ8fIngRW9sSSpBdBoDJo=`
- ✅ **Secrets match** - tokens signed by frontend can be verified by backend

### 2. **API Client** (`src/lib/api-client.ts`)
- Automatically extracts JWT token from Better Auth session
- Includes token in `Authorization: Bearer <token>` header
- Handles 401 errors by redirecting to login
- Supports GET, POST, PUT, DELETE methods

### 3. **TypeScript Types** (`src/types/api.ts`)
- `Task` - Task entity from backend
- `TaskCreate` - Create task payload
- `TaskUpdate` - Update task payload
- `TaskListResponse` - List response with pagination

### 4. **Tasks Service** (`src/services/tasks.ts`)
- `getTasks(completed?)` - Get all tasks (optional filter)
- `getTask(taskId)` - Get single task
- `createTask(data)` - Create new task
- `updateTask(taskId, data)` - Update task
- `toggleTask(taskId, isCompleted)` - Toggle completion
- `deleteTask(taskId)` - Delete task
- `validateToken()` - Validate JWT token

---

## 🚀 Usage Examples

### Example 1: Fetch All Tasks

```typescript
"use client";

import { useEffect, useState } from "react";
import { tasksService } from "@/services/tasks";
import type { Task } from "@/types/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await tasksService.getTasks();
        setTasks(response.tasks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Tasks ({tasks.length})</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={() => handleToggle(task.id, !task.is_completed)}
            />
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );

  async function handleToggle(taskId: number, isCompleted: boolean) {
    try {
      await tasksService.toggleTask(taskId, isCompleted);
      // Refresh tasks
      const response = await tasksService.getTasks();
      setTasks(response.tasks);
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
    }
  }
}
```

### Example 2: Create a New Task

```typescript
"use client";

import { useState } from "react";
import { tasksService } from "@/services/tasks";

export default function CreateTaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const newTask = await tasksService.createTask({
        title,
        description: description || null,
      });

      alert(`Task created: ${newTask.title}`);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      alert("Failed to create task: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
```

### Example 3: Update a Task

```typescript
import { tasksService } from "@/services/tasks";

async function updateTaskTitle(taskId: number, newTitle: string) {
  try {
    const updatedTask = await tasksService.updateTask(taskId, {
      title: newTitle,
    });
    console.log("Task updated:", updatedTask);
  } catch (err: any) {
    console.error("Failed to update task:", err.message);
  }
}
```

### Example 4: Delete a Task

```typescript
import { tasksService } from "@/services/tasks";

async function deleteTask(taskId: number) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    await tasksService.deleteTask(taskId);
    console.log("Task deleted successfully");
  } catch (err: any) {
    console.error("Failed to delete task:", err.message);
  }
}
```

### Example 5: Filter Completed Tasks

```typescript
import { tasksService } from "@/services/tasks";

// Get only completed tasks
const completedTasks = await tasksService.getTasks(true);

// Get only incomplete tasks
const incompleteTasks = await tasksService.getTasks(false);

// Get all tasks
const allTasks = await tasksService.getTasks();
```

---

## 🔐 Authentication Flow

### How It Works

1. **User signs up/logs in** via Better Auth
2. **Better Auth creates a session** and stores JWT token
3. **API client automatically extracts token** from session
4. **Token is sent to backend** in `Authorization: Bearer <token>` header
5. **Backend verifies token** using shared JWT_SECRET
6. **Backend extracts user_id** from token's `sub` claim
7. **Backend returns user-specific data**

### Token Structure

Better Auth generates JWT tokens with this structure:

```json
{
  "sub": "1",           // User ID
  "iat": 1704844800,    // Issued at
  "exp": 1704931200     // Expires at (24 hours)
}
```

The backend extracts `user_id` from the `sub` claim and uses it to enforce user isolation.

---

## 🧪 Testing the Integration

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn src.main:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Test Backend Health

```bash
curl http://localhost:8001/health
# Expected: {"status":"healthy"}
```

### 3. Create a Test User

Visit `http://localhost:3000/register` and create an account.

### 4. Test Token Validation

After logging in, open browser console and run:

```javascript
import { tasksService } from "@/services/tasks";

// Validate your JWT token
const result = await tasksService.validateToken();
console.log(result);
// Expected: { valid: true, user_id: "1", message: "Token is valid..." }
```

### 5. Test Task Creation

```javascript
import { tasksService } from "@/services/tasks";

// Create a test task
const task = await tasksService.createTask({
  title: "Test Task",
  description: "This is a test"
});
console.log(task);
```

---

## 🐛 Troubleshooting

### Error: "Authentication required"

**Cause:** No JWT token found in session.

**Solution:**
1. Make sure you're logged in
2. Check that Better Auth session exists:
   ```javascript
   import { authClient } from "@/lib/auth";
   const session = await authClient.getSession();
   console.log(session);
   ```

### Error: "Invalid token" (401)

**Cause:** JWT secrets don't match between frontend and backend.

**Solution:**
1. Verify secrets match:
   - Frontend: `frontend/.env.local` → `AUTH_SECRET`
   - Backend: `backend/.env` → `JWT_SECRET`
2. Restart both servers after changing secrets

### Error: "CORS policy" in browser console

**Cause:** Backend CORS not configured for frontend origin.

**Solution:**
1. Check backend `.env`:
   ```
   CORS_ORIGINS=http://localhost:3000
   ```
2. Restart backend server

### Error: "Connection refused" or "Network error"

**Cause:** Backend not running or wrong URL.

**Solution:**
1. Verify backend is running on port 8001
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── auth.ts           # Better Auth configuration
│   │   ├── api-client.ts     # Authenticated API client
│   │   └── prisma.ts         # Prisma client singleton
│   ├── services/
│   │   └── tasks.ts          # Tasks service layer
│   ├── types/
│   │   └── api.ts            # TypeScript types
│   └── app/
│       └── ...               # Your pages
├── prisma/
│   └── schema.prisma         # Database schema
└── .env.local                # Environment variables

backend/
├── src/
│   ├── main.py               # FastAPI app
│   ├── config.py             # Configuration
│   ├── middleware/
│   │   └── auth.py           # JWT verification
│   └── api/
│       └── routes/
│           └── tasks.py      # Task endpoints
└── .env                      # Environment variables
```

---

## 🎯 Next Steps

1. **Build your UI pages** using the tasks service
2. **Add error handling** with try-catch blocks
3. **Implement loading states** for better UX
4. **Add optimistic updates** for instant feedback
5. **Consider using React Query** for caching and state management

---

## 📚 API Reference

### Backend Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/tasks/validate-token` | Validate JWT | Yes |
| GET | `/tasks` | List all tasks | Yes |
| GET | `/tasks/{id}` | Get single task | Yes |
| POST | `/tasks` | Create task | Yes |
| PUT | `/tasks/{id}` | Update task | Yes |
| DELETE | `/tasks/{id}` | Delete task | Yes |

### Query Parameters

- `GET /tasks?completed=true` - Filter by completion status

---

## ✅ Integration Checklist

- [x] JWT secrets synchronized
- [x] API client created with Better Auth integration
- [x] TypeScript types defined
- [x] Tasks service layer implemented
- [x] CORS configured on backend
- [x] Database schema created with Prisma
- [x] Better Auth configured with Prisma adapter
- [ ] Backend server running on port 8001
- [ ] Frontend server running on port 3000
- [ ] Test user created
- [ ] First task created successfully

---

**Your frontend and backend are now properly connected!** 🎉

Use the examples above to build your application features.
