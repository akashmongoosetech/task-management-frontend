import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { Task, TaskInput, TaskPriority, TaskStatus } from '../../types/task';
import { toInputDateValue } from '../../utils/date';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskInput) => Promise<any>;
  initialTask?: Task | null;
  isSubmitting?: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{
    title?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
    general?: string;
  }>({});

  // Reset or populate form when modal opens or initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setDueDate(toInputDateValue(initialTask.dueDate));
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
      setDueDate('');
    }
    setErrors({});
  }, [initialTask, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Mirrors backend createTaskSchema: title 1-150, description <= 2000,
  // status/priority enums required, dueDate valid date required.
  const validate = (): boolean => {
    const newErrors: { title?: string; priority?: string; status?: string; dueDate?: string; general?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    if (description.length > 2000) {
      newErrors.general = 'Description cannot exceed 2000 characters';
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      newErrors.priority = 'Priority must be one of: low, medium, high';
    }

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      newErrors.status = 'Status must be one of: pending, in-progress, completed';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (isNaN(new Date(dueDate).getTime())) {
      newErrors.dueDate = 'Invalid dueDate: must be YYYY-MM-DD or ISO 8601';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
      });
      onClose();
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: { title?: string; priority?: string; status?: string; dueDate?: string; general?: string } = {};
        err.errors.forEach((e: any) => {
          if (e.field === 'title' && !fieldErrors.title) fieldErrors.title = e.message;
          else if (e.field === 'priority' && !fieldErrors.priority) fieldErrors.priority = e.message;
          else if (e.field === 'status' && !fieldErrors.status) fieldErrors.status = e.message;
          else if (e.field === 'dueDate' && !fieldErrors.dueDate) fieldErrors.dueDate = e.message;
          else fieldErrors.general = fieldErrors.general ? `${fieldErrors.general} ${e.message}` : e.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message || 'Submission failed' });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="modal-headline" className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update task details and persist changes to MongoDB'
                : 'Add a new item to your task board'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Design user interface layout"
              maxLength={150}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500 bg-white'
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 inline" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, steps, or acceptance criteria..."
              maxLength={2000}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-colors"
            />
            <div className="text-[11px] text-slate-400 text-right mt-0.5">
              {description.length}/2000
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 mb-1">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as TaskPriority);
                  if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.priority
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" />
                  {errors.priority}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TaskStatus);
                  if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.status
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" />
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-duedate" className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="task-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.dueDate
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 inline" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
