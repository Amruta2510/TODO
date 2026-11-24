import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Priority, Task, TaskDraft } from '../types/todo';
import { getTodayISO } from '../utils/storage';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSave: (draft: TaskDraft, taskId?: string) => void;
}

export function TaskFormModal({
  isOpen,
  editingTask,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setNotes(editingTask.notes);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setDueDate(getTodayISO());
    }
    setError('');
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }
    if (trimmedTitle.length > 140) {
      setError('Task title must be 140 characters or fewer.');
      return;
    }

    onSave(
      {
        title: trimmedTitle,
        notes: notes.trim(),
        priority,
        dueDate,
      },
      editingTask?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2
            id="task-modal-title"
            className="font-display text-lg font-semibold text-slate-900 dark:text-white"
          >
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="modal-task-title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Task Title
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-400 dark:text-slate-500">
                {title.trim().length}/140
              </span>
            </div>
            <input
              id="modal-task-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="What needs to be accomplished?"
              maxLength={150}
              className={`mt-1.5 w-full rounded-lg border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950 ${
                error
                  ? 'border-red-500 focus:ring-red-500/30 dark:border-red-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400'
              }`}
            />
            {error && (
              <p
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="modal-task-notes"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="modal-task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context, links, or checklist details..."
              maxLength={400}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority Level
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(['low', 'medium', 'high'] as Priority[]).map((level) => {
                  const selected = priority === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`rounded-md py-2 text-xs font-medium capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                        selected
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="modal-task-date"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Due Date
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="modal-task-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:bg-slate-950"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="h-10 shrink-0 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-sm font-medium text-white transition-all duration-150 hover:from-indigo-700 hover:to-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
