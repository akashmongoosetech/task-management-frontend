export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskSortOption = 'newest' | 'oldest' | 'dueDate' | 'priority';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskFilters {
  search: string;
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  sort: TaskSortOption;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiFieldError[];
}

export interface HealthStatus {
  status: 'UP' | 'DEGRADED';
  database: 'connected' | 'disconnected';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}
