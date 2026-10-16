import React from 'react';
import { Calendar, Check, Clock, Edit2, Eye, Trash2, AlertCircle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { formatDate, isOverdue } from '../../utils/date';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  isMutating?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  isMutating = false,
}) => {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in-progress';
  const taskOverdue = isOverdue(task.dueDate, task.status);

  // Priority indicator styles
  const priorityConfig: Record<
    TaskPriority,
    { label: string; dot: string; text: string; bg: string }
  > = {
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

  // Status configuration
  const statusConfig: Record<TaskStatus, { label: string; text: string }> = {
    pending: { label: 'Pending', text: 'text-amber-600' },
    'in-progress': { label: 'In Progress', text: 'text-sky-600' },
    completed: { label: 'Completed', text: 'text-emerald-600' },
  };

  const currPriority = priorityConfig[task.priority] || priorityConfig.medium;
  const currStatus = statusConfig[task.status] || statusConfig.pending;

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 p-4 sm:p-5 shadow-xs hover:shadow-sm flex flex-col justify-between ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/40 opacity-90'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Top bar: Checkbox toggle, Priority and Status indicators */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            {/* Quick Status Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              disabled={isMutating}
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : isInProgress
                  ? 'border-2 border-sky-500 bg-sky-50/60 text-sky-600 hover:bg-sky-100'
                  : 'border-2 border-slate-300 hover:border-slate-400 bg-white'
              }`}
              title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              aria-label={`Mark task ${task.title} as ${isCompleted ? 'pending' : 'completed'}`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
            </button>

            {/* Unboxed Status & Priority Metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`font-medium ${currStatus.text}`}>{currStatus.label}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${currPriority.bg} ${currPriority.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currPriority.dot}`} />
                {currPriority.label}
              </span>
            </div>
          </div>

          {/* Action buttons (View, Edit & Delete) */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onView(task)}
              disabled={isMutating}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="View task details"
              aria-label={`View details of task ${task.title}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              disabled={isMutating}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Edit task"
              aria-label={`Edit task ${task.title}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              disabled={isMutating}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              title="Delete task"
              aria-label={`Delete task ${task.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base font-semibold leading-snug tracking-tight transition-colors ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p
            className={`mt-1.5 text-xs leading-relaxed line-clamp-3 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Footer metadata: Due Date & Overdue warning */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-medium ${
              taskOverdue ? 'text-rose-600 font-semibold flex items-center gap-1' : 'text-slate-600'
            }`}
          >
            {taskOverdue && <AlertCircle className="w-3.5 h-3.5 inline text-rose-600" />}
            {formatDate(task.dueDate)}
            {taskOverdue && <span className="text-[10px] uppercase font-bold text-rose-600">(Overdue)</span>}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 font-normal">
          {new Date(task.updatedAt || task.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
};
