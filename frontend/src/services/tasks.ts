/**
 * Tasks Service Layer
 *
 * Provides a clean API for task management operations.
 * Handles all communication with the FastAPI backend.
 */

import { api } from "@/lib/api-client";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TokenValidationResponse,
} from "@/types/api";

/**
 * Tasks API service
 */
export const tasksService = {
  /**
   * Validate JWT token with backend
   *
   * @returns Token validation response
   */
  validateToken: async (): Promise<TokenValidationResponse> => {
    return api.get<TokenValidationResponse>("/tasks/validate-token");
  },

  /**
   * Get all tasks for the authenticated user
   *
   * @param completed - Optional filter by completion status
   * @returns List of tasks with total count
   */
  getTasks: async (completed?: boolean): Promise<TaskListResponse> => {
    const params = completed !== undefined ? `?completed=${completed}` : "";
    return api.get<TaskListResponse>(`/tasks${params}`);
  },

  /**
   * Get a single task by ID
   *
   * @param taskId - Task ID to retrieve
   * @returns Task data
   */
  getTask: async (taskId: number): Promise<Task> => {
    return api.get<Task>(`/tasks/${taskId}`);
  },

  /**
   * Create a new task
   *
   * @param data - Task creation data (title, description)
   * @returns Created task
   */
  createTask: async (data: TaskCreate): Promise<Task> => {
    return api.post<Task>("/tasks", data);
  },

  /**
   * Update an existing task
   *
   * @param taskId - Task ID to update
   * @param data - Task update data (optional fields)
   * @returns Updated task
   */
  updateTask: async (taskId: number, data: TaskUpdate): Promise<Task> => {
    return api.put<Task>(`/tasks/${taskId}`, data);
  },

  /**
   * Toggle task completion status
   *
   * @param taskId - Task ID to toggle
   * @param isCompleted - New completion status
   * @returns Updated task
   */
  toggleTask: async (taskId: number, isCompleted: boolean): Promise<Task> => {
    return api.put<Task>(`/tasks/${taskId}`, { is_completed: isCompleted });
  },

  /**
   * Delete a task
   *
   * @param taskId - Task ID to delete
   */
  deleteTask: async (taskId: number): Promise<void> => {
    return api.delete<void>(`/tasks/${taskId}`);
  },
};

export default tasksService;
