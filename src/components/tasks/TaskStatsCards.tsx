import React from 'react';
import { Layers, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TaskStats, TaskStatus } from '../../types/task';

interface TaskStatsCardsProps {
  stats: TaskStats;
  activeStatus: 'all' | TaskStatus;
  onSelectStatus: (status: 'all' | TaskStatus) => void;
}

export const TaskStatsCards: React.FC<TaskStatsCardsProps> = ({
  stats,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'all' as const,
      label: 'Total Tasks',
      count: stats.total,
      icon: Layers,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/70',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20',
    },
    {
      id: 'pending' as const,
      label: 'Pending',
      count: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50/70',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    {
      id: 'in-progress' as const,
      label: 'In Progress',
      count: stats.inProgress,
      icon: AlertCircle,
      color: 'text-sky-600',
      bg: 'bg-sky-50/70',
      borderActive: 'border-sky-500 ring-2 ring-sky-500/20',
    },
    {
      id: 'completed' as const,
      label: 'Completed',
      count: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/70',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`text-left p-4 rounded-xl bg-white border transition-all duration-150 shadow-xs hover:shadow-sm ${
              isActive
                ? `${card.borderActive} bg-slate-50/50`
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {card.count}
              </span>
              <span className="text-[11px] text-slate-400">
                {card.id === 'all'
                  ? 'All records'
                  : `${Math.round((card.count / (stats.total || 1)) * 100)}%`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
