import React from 'react';
import { ClipboardList, SearchX, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered, onAction }) => {
  if (isFiltered) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-3.5">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No matching tasks found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          No tasks matched your search query or selected status and priority filters. Try adjusting or clearing your active filters.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center mx-auto text-indigo-600 mb-3.5">
        <ClipboardList className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">Your task board is empty</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        Stay organized and track your workflow by creating your first task. Every item is persisted securely in MongoDB.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create First Task</span>
        </button>
      </div>
    </div>
  );
};
