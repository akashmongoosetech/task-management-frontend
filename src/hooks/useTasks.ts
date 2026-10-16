import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskFilters, TaskInput, TaskStats, TaskStatus, HealthStatus } from '../types/task';
import { useToast } from '../context/ToastContext';

const initialFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'newest',
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const { success, error: toastError } = useToast();
  const requestSeq = useRef<number>(0);

  // Calculate local stats from actual tasks list as well as fetching backend stats
  const calculateStats = (taskList: Task[]): TaskStats => {
    return {
      total: taskList.length,
      pending: taskList.filter((t) => t.status === 'pending').length,
      inProgress: taskList.filter((t) => t.status === 'in-progress').length,
      completed: taskList.filter((t) => t.status === 'completed').length,
    };
  };

  /**
   * Fetch tasks with active filters
   */
  const loadTasks = useCallback(
    async (customFilters?: Partial<TaskFilters>) => {
      const activeFilters = { ...filters, ...customFilters };
      const currentSeq = ++requestSeq.current;

      try {
        setIsLoading(true);
        setError(null);

        const [fetchedTasks, backendStats] = await Promise.all([
          taskService.getTasks(activeFilters),
          taskService.getStats().catch(() => null),
        ]);

        // Prevent race conditions from out-of-order responses
        if (currentSeq !== requestSeq.current) return;

        setTasks(fetchedTasks);
        if (backendStats && activeFilters.status === 'all' && activeFilters.priority === 'all' && !activeFilters.search) {
          setStats(backendStats);
        } else {
          setStats(calculateStats(fetchedTasks));
        }
      } catch (err: any) {
        if (currentSeq === requestSeq.current) {
          const msg = err.message || 'Failed to fetch tasks from server';
          setError(msg);
        }
      } finally {
        if (currentSeq === requestSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [filters]
  );

  // Check health and initial load
  useEffect(() => {
    taskService
      .checkHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'DEGRADED', database: 'disconnected', uptimeSeconds: 0, timestamp: '', environment: '' }));
  }, []);

  // Fetch when filters change
  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority, filters.sort, filters.search, loadTasks]);

  /**
   * Create task
   */
  const createTask = async (data: TaskInput) => {
    setIsMutating(true);
    try {
      const created = await taskService.createTask(data);
      success(`Task "${created.title}" created successfully`);
      await loadTasks();
      return created;
    } catch (err: any) {
      toastError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Edit task
   */
  const updateTask = async (id: string, data: Partial<TaskInput>) => {
    setIsMutating(true);
    try {
      const updated = await taskService.updateTask(id, data);
      success(`Task "${updated.title}" updated successfully`);
      await loadTasks();
      return updated;
    } catch (err: any) {
      toastError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Toggle or update status
   */
  const updateTaskStatus = async (task: Task, nextStatus?: TaskStatus) => {
    const targetStatus: TaskStatus =
      nextStatus ||
      (task.status === 'completed' ? 'pending' : 'completed');

    setIsMutating(true);
    try {
      const updated = await taskService.updateTaskStatus(task.id, targetStatus);
      success(
        targetStatus === 'completed'
          ? `Marked "${updated.title}" as completed`
          : `Reopened "${updated.title}"`
      );
      await loadTasks();
      return updated;
    } catch (err: any) {
      toastError(err.message || 'Failed to update task status');
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Delete task
   */
  const deleteTask = async (id: string) => {
    setIsMutating(true);
    try {
      const result = await taskService.deleteTask(id);
      success(`Task "${result.title}" was deleted`);
      await loadTasks();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    tasks,
    stats,
    filters,
    isLoading,
    isMutating,
    error,
    health,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    updateFilters,
    resetFilters,
    refresh: () => loadTasks(),
  };
}
