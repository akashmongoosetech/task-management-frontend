import React, { useEffect } from 'react';
import { X, Calendar, AlertCircle, Pencil } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { formatDate, isOverdue } from '../../utils/date';

interface TaskViewModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({
  isOpen,
  task,
  onClose,
  onEdit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const priorityConfig: Record<TaskPriority, { label: string; dot: string; text: string; bg: string }> = {
    high: {
      label: 'High',
      dot: 'bg-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50/70 border-rose-200/60',
    },
    medium: {
      label: 'Medium',
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50/70 border-amber-200/60',
    },
    low: {
      label: 'Low',
      dot: 'bg-slate-400',
      text: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200/60',
    },
  };

  const statusConfig: Record<TaskStatus, { label: string; text: string }> = {
    pending: { label: 'Pending', text: 'text-amber-600' },
    'in-progress': { label: 'In Progress', text: 'text-sky-600' },
    completed: { label: 'Completed', text: 'text-emerald-600' },
  };

  const currPriority = priorityConfig[task.priority] || priorityConfig.medium;
  const currStatus = statusConfig[task.status] || statusConfig.pending;
  const taskOverdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-dialog-title"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Task Details
            </p>
            <h2
              id="view-dialog-title"
              className="mt-0.5 text-lg font-semibold text-slate-900 leading-snug break-words"
            >
              {task.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`font-medium ${currStatus.text}`}>{currStatus.label}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${currPriority.bg} ${currPriority.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currPriority.dot}`} />
                {currPriority.label} Priority
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Close details dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-4 overflow-y-auto space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 mb-1">Description</h3>
            {task.description ? (
              <div className="max-h-48 sm:max-h-64 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                  {task.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No description provided.</p>
            )}
          </div>

          {/* Meta */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Due Date
              </dt>
              <dd
                className={`mt-1 flex items-center gap-1.5 font-medium ${
                  taskOverdue ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(task.dueDate)}
                {taskOverdue && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Overdue
                  </span>
                )}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Last Updated
              </dt>
              <dd className="mt-1 font-medium text-slate-700">
                {formatDate(task.updatedAt || task.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};
