import { apiClient } from './api';
import { ApiResponse, Task, TaskFilters, TaskInput, TaskStats, TaskStatus, HealthStatus } from '../types/task';

export const taskService = {
  /**
   * Fetch all tasks with optional server-side filters
   */
  async getTasks(filters?: Partial<TaskFilters & { page?: number; limit?: number }>): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    // Guard against non-JSON payloads (e.g. a static host serving index.html
    // for /api/* when no proxy/rewrite exists). Never return non-arrays.
    const data = (response.data as ApiResponse<Task[]> | undefined)?.data;
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from server. Please verify the backend API URL.');
    }
    return data;
  },

  /**
   * Fetch a single task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Create a new task
   */
  async createTask(taskData: TaskInput): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data.data;
  },

  /**
   * Update task fields
   */
  async updateTask(id: string, updateData: Partial<TaskInput>): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, updateData);
    return response.data.data;
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ id: string; title: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string; title: string }>>(`/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Fetch dashboard statistics
   */
  async getStats(): Promise<TaskStats> {
    const response = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats');
    const data = (response.data as ApiResponse<TaskStats> | undefined)?.data;
    if (!data || typeof data.total !== 'number') {
      throw new Error('Unexpected response from server. Please verify the backend API URL.');
    }
    return data;
  },

  /**
   * Check backend health and database connectivity
   */
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<ApiResponse<HealthStatus>>('/health');
    return response.data.data;
  },
};
