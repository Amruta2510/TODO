import { CalendarClock, CheckCheck, Clock, ListTodo } from 'lucide-react';
import type { TaskStats } from '../types/todo';

interface StatsGridProps {
  stats: TaskStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      detail: `${stats.completionRate}% completion rate`,
      icon: ListTodo,
      iconTone: 'text-indigo-600 dark:text-indigo-400',
      surfaceTone: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'Completed Tasks',
      value: stats.completed,
      detail: stats.total > 0 ? `${stats.completed} of ${stats.total} finished` : 'No tasks logged',
      icon: CheckCheck,
      iconTone: 'text-emerald-600 dark:text-emerald-400',
      surfaceTone: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Pending Tasks',
      value: stats.pending,
      detail:
        stats.highPriorityPending > 0
          ? `${stats.highPriorityPending} high priority`
          : 'On track',
      icon: Clock,
      iconTone: 'text-amber-600 dark:text-amber-400',
      surfaceTone: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: "Today's Tasks",
      value: stats.today,
      detail:
        stats.overdue > 0
          ? `${stats.overdue} overdue task${stats.overdue === 1 ? '' : 's'}`
          : 'Due today',
      icon: CalendarClock,
      iconTone:
        stats.overdue > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-blue-600 dark:text-blue-400',
      surfaceTone:
        stats.overdue > 0
          ? 'bg-red-50 dark:bg-red-500/10'
          : 'bg-blue-50 dark:bg-blue-500/10',
    },
  ];

  return (
    <section aria-label="Task statistics" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.surfaceTone}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconTone}`} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Slim Completion Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Overall Progress
          </span>
          <span className="font-mono font-medium tabular-nums text-slate-600 dark:text-slate-400">
            {stats.completed} / {stats.total} completed ({stats.completionRate}%)
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Task completion progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
}
