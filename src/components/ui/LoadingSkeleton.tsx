import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading tasks">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 animate-pulse"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-slate-200" />
                <div className="w-20 h-4 rounded bg-slate-200" />
              </div>
              <div className="w-12 h-4 rounded bg-slate-200" />
            </div>
            <div className="w-3/4 h-5 rounded bg-slate-200 mb-2" />
            <div className="w-full h-3.5 rounded bg-slate-100 mb-1.5" />
            <div className="w-2/3 h-3.5 rounded bg-slate-100" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="w-24 h-4 rounded bg-slate-200" />
            <div className="w-12 h-4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};
