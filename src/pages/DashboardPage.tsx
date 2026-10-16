import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskStatsCards } from '../components/tasks/TaskStatsCards';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { TaskDeleteModal } from '../components/tasks/TaskDeleteModal';
import { TaskViewModal } from '../components/tasks/TaskViewModal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Task, TaskInput } from '../types/task';

interface DashboardPageProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const {
    tasks,
    stats,
    filters,
    isLoading,
    isMutating,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    updateFilters,
    resetFilters,
    refresh,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.sort !== 'newest';

  // Handle Create or Update submission
  const handleFormSubmit = async (data: TaskInput) => {
    setIsFormSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        setEditingTask(null);
      } else {
        await createTask(data);
        setIsCreateModalOpen(false);
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Task Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            anage your tasks, track progress, and stay organized with ease.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading || isMutating}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh tasks from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <TaskStatsCards
        stats={stats}
        activeStatus={filters.status}
        onSelectStatus={(status) => updateFilters({ status })}
      />

      {/* Search, Filter, & Sort Controls */}
      <TaskFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        totalFilteredCount={(tasks ?? []).length}
      />

      {/* Main Task List / States */}
      <div>
        {error && (tasks ?? []).length === 0 ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (tasks ?? []).length === 0 ? (
          <EmptyState
            isFiltered={hasActiveFilters}
            onAction={hasActiveFilters ? resetFilters : () => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(tasks ?? []).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setEditingTask(t)}
                onDelete={(t) => setDeletingTask(t)}
                onView={(t) => setViewingTask(t)}
                onToggleStatus={(t) => updateTaskStatus(t)}
                isMutating={isMutating}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen || Boolean(editingTask)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        isSubmitting={isFormSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <TaskDeleteModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Task Details View Modal */}
      <TaskViewModal
        isOpen={Boolean(viewingTask)}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onEdit={(t) => {
          setViewingTask(null);
          setEditingTask(t);
        }}
      />
    </div>
  );
};
