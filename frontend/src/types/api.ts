/**
 * TypeScript types for backend API responses.
 *
 * These types match the Pydantic schemas defined in the FastAPI backend.
 */

/**
 * Task entity from the backend
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

/**
 * Task creation payload
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
}

/**
 * Task update payload (all fields optional)
 */
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

/**
 * Task list response with pagination metadata
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

/**
 * Error response structure from backend
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Token validation response
 */
export interface TokenValidationResponse {
  valid: boolean;
  user_id: string;
  message: string;
}
