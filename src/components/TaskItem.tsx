import { Calendar, Check, Flag, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Priority, Task } from '../types/todo';
import { formatDueDateLabel, isDueToday, isOverdue } from '../utils/storage';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_META: Record<
  Priority,
  { label: string; colorClass: string }
> = {
  high: {
    label: 'High priority',
    colorClass: 'text-red-600 dark:text-red-400',
  },
  medium: {
    label: 'Medium priority',
    colorClass: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    label: 'Low priority',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const overdue = isOverdue(task.dueDate, task.completed);
  const dueToday = isDueToday(task.dueDate);
  const priorityMeta = PRIORITY_META[task.priority];

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start justify-between gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        {/* Accessible Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          aria-pressed={task.completed}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150 ${
              task.completed
                ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
                : 'border-slate-300 bg-white text-transparent group-hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:group-hover:border-indigo-400'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          </span>
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <p
              className={`text-sm font-medium leading-snug break-words transition-colors ${
                task.completed
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </p>
          </div>

          {task.notes && (
            <p
              className={`mt-1 text-xs leading-relaxed break-words ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.notes}
            </p>
          )}

          {/* Clean Unboxed Metadata Line */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className={`inline-flex items-center gap-1 font-medium ${priorityMeta.colorClass}`}>
              <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{priorityMeta.label}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                overdue
                  ? 'font-medium text-red-600 dark:text-red-400'
                  : dueToday && !task.completed
                  ? 'font-medium text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {overdue
                  ? `Overdue (${formatDueDateLabel(task.dueDate)})`
                  : formatDueDateLabel(task.dueDate)}
              </span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span
              className={
                task.completed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600 dark:text-slate-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  );
}
