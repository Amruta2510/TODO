import { AlertCircle, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Priority, TaskDraft } from '../types/todo';
import { getTodayISO } from '../utils/storage';

interface QuickAddBarProps {
  onAddTask: (draft: TaskDraft) => void;
}

export function QuickAddBar({ onAddTask }: QuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a task title before adding.');
      return;
    }
    if (trimmed.length > 140) {
      setError('Task title must be 140 characters or fewer.');
      return;
    }

    onAddTask({
      title: trimmed,
      notes: '',
      priority,
      dueDate,
    });
    setTitle('');
    setError('');
  };

  return (
    <section
      aria-label="Quick add task"
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label htmlFor="quick-add-title" className="sr-only">
              Task title
            </label>
            <input
              id="quick-add-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Add a new task (e.g., Review sprint deliverables)..."
              maxLength={150}
              className={`w-full rounded-lg border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950 ${
                error
                  ? 'border-red-500 focus:ring-red-500/30 dark:border-red-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
            <div>
              <label htmlFor="quick-add-priority" className="sr-only">
                Priority
              </label>
              <select
                id="quick-add-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label htmlFor="quick-add-date" className="sr-only">
                Due date
              </label>
              <input
                id="quick-add-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:from-indigo-700 hover:to-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </form>
    </section>
  );
}
