import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TaskFilters, TaskPriority, TaskSortOption, TaskStatus } from '../../types/task';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (newFilters: Partial<TaskFilters>) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalFilteredCount,
}) => {
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.sort !== 'newest';

  const statusOptions: Array<{ id: 'all' | TaskStatus; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
      {/* Top Row: Search Input & Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search tasks by title or description..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter & Sort Selector */}
        <div className="flex items-center gap-2.5">
          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <label htmlFor="priority-filter" className="sr-only">
              Priority
            </label>
            <div className="relative w-full">
              <select
                id="priority-filter"
                value={filters.priority}
                onChange={(e) => onChange({ priority: e.target.value as 'all' | TaskPriority })}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <label htmlFor="sort-order" className="sr-only">
              Sort
            </label>
            <div className="relative w-full">
              <select
                id="sort-order"
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value as TaskSortOption })}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Tabs (Segmented Control) & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
        {/* Status Segmented Buttons */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ status: opt.id })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Filter Count indicator */}
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{totalFilteredCount}</span>{' '}
          {totalFilteredCount === 1 ? 'task' : 'tasks'}
        </div>
      </div>
    </div>
  );
};
