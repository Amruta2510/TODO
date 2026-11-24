import {
  CheckCircle2,
  ListFilter,
  Menu,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QuickAddBar } from './components/QuickAddBar';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskItem } from './components/TaskItem';
import type {
  FilterStatus,
  Priority,
  SidebarView,
  SortOption,
  Task,
  TaskDraft,
  TaskStats,
  ThemeMode,
} from './types/todo';
import {
  createTaskId,
  isDueToday,
  isOverdue,
  loadTasks,
  loadTheme,
  saveTasks,
  saveTheme,
} from './utils/storage';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const VIEW_HEADINGS: Record<SidebarView, { title: string; subtitle: string }> = {
  all: {
    title: 'All Tasks',
    subtitle: 'Overview of your entire task backlog and daily progress.',
  },
  today: {
    title: "Today's Tasks",
    subtitle: 'Focused queue of items scheduled for today.',
  },
  pending: {
    title: 'Pending Tasks',
    subtitle: 'Active work items remaining to be completed.',
  },
  completed: {
    title: 'Completed Tasks',
    subtitle: 'Finished tasks archived for reference.',
  },
  high: {
    title: 'High Priority',
    subtitle: 'Critical pending tasks requiring immediate attention.',
  },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeView, setActiveView] = useState<SidebarView>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [recentlyDeleted, setRecentlyDeleted] = useState<Task | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Persist tasks automatically to LocalStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Sync theme class on <html> and persist to LocalStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Clean up undo toast timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  // Compute Dashboard Statistics
  const stats: TaskStats = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let pending = 0;
    let today = 0;
    let overdue = 0;
    let highPriorityPending = 0;
    let mediumPriorityPending = 0;
    let lowPriorityPending = 0;

    for (const task of tasks) {
      if (task.completed) {
        completed += 1;
      } else {
        pending += 1;
        if (task.priority === 'high') highPriorityPending += 1;
        else if (task.priority === 'medium') mediumPriorityPending += 1;
        else lowPriorityPending += 1;
      }
      if (isDueToday(task.dueDate)) {
        today += 1;
      }
      if (isOverdue(task.dueDate, task.completed)) {
        overdue += 1;
      }
    }

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      today,
      overdue,
      completionRate,
      highPriorityPending,
      mediumPriorityPending,
      lowPriorityPending,
    };
  }, [tasks]);

  // Keep sidebar view and status tabs synchronized cleanly
  const handleSelectSidebarView = (view: SidebarView) => {
    setActiveView(view);
    if (view === 'pending') {
      setStatusFilter('active');
    } else if (view === 'completed') {
      setStatusFilter('completed');
    } else {
      setStatusFilter('all');
    }

    if (view === 'high') {
      setPriorityFilter('high');
    } else {
      setPriorityFilter('all');
    }
  };

  const handleStatusFilterChange = (nextStatus: FilterStatus) => {
    setStatusFilter(nextStatus);
    if (activeView === 'pending' && nextStatus !== 'active') {
      setActiveView('all');
    } else if (activeView === 'completed' && nextStatus !== 'completed') {
      setActiveView('all');
    }
  };

  // Filtered and Sorted Task List
  const visibleTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      // Sidebar scope
      if (activeView === 'today' && !isDueToday(task.dueDate)) return false;
      if (activeView === 'high' && (task.priority !== 'high' || task.completed)) return false;

      // Status filter (All / Active / Completed)
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Priority dropdown filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Live search across title and notes
      if (query) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inNotes = task.notes.toLowerCase().includes(query);
        if (!inTitle && !inNotes) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      // Always surface active tasks ahead of completed ones when viewing mixed statuses
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (sortBy === 'dueDate') {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }

      if (sortBy === 'priority') {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return b.createdAt.localeCompare(a.createdAt);
      }

      if (sortBy === 'oldest') {
        return a.createdAt.localeCompare(b.createdAt);
      }

      // newest
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, activeView, statusFilter, priorityFilter, searchQuery, sortBy]);

  const handleSaveTask = (draft: TaskDraft, existingId?: string) => {
    const now = new Date().toISOString();
    if (existingId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === existingId
            ? {
                ...task,
                title: draft.title,
                notes: draft.notes,
                priority: draft.priority,
                dueDate: draft.dueDate,
                updatedAt: now,
              }
            : task
        )
      );
      return;
    }

    const newTask: Task = {
      id: createTaskId(),
      title: draft.title,
      notes: draft.notes,
      completed: false,
      priority: draft.priority,
      dueDate: draft.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: now }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setTasks((prev) => prev.filter((task) => task.id !== id));
    setRecentlyDeleted(target);

    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = window.setTimeout(() => {
      setRecentlyDeleted(null);
      undoTimerRef.current = null;
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!recentlyDeleted) return;
    setTasks((prev) => [recentlyDeleted, ...prev]);
    setRecentlyDeleted(null);
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const handleExportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cadence-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setActiveView('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    activeView !== 'all';

  const currentHeading = VIEW_HEADINGS[activeView];

  const todayFormatted = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectSidebarView}
        stats={stats}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onExportTasks={handleExportTasks}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Workspace</span>
                <span aria-hidden="true">/</span>
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                  {currentHeading.title}
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                {todayFormatted}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-600" />
              )}
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:from-indigo-700 hover:to-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {currentHeading.title}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {currentHeading.subtitle}
              </p>
            </div>
          </div>

          {/* Dashboard KPIs */}
          <StatsGrid stats={stats} />

          {/* Quick Add Task Bar */}
          <QuickAddBar onAddTask={(draft) => handleSaveTask(draft)} />

          {/* Task List Panel */}
          <section
            aria-label="Task list"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Filter, Search & Sort Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
              {/* Segmented Status Tabs: All, Active, Completed */}
              <div
                role="tablist"
                aria-label="Filter tasks by status"
                className="inline-flex w-full items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto"
              >
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' },
                  ] as { id: FilterStatus; label: string }[]
                ).map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleStatusFilterChange(tab.id)}
                      className={`flex-1 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:flex-initial whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search, Priority Filter, and Sort */}
              <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center lg:justify-end">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    aria-label="Search tasks"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <ListFilter
                      className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400"
                      aria-hidden="true"
                    />
                    <select
                      aria-label="Filter by priority"
                      value={priorityFilter}
                      onChange={(e) =>
                        setPriorityFilter(e.target.value as Priority | 'all')
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-8 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <select
                    aria-label="Sort tasks"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                  >
                    <option value="dueDate">Sort: Due Date</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="newest">Sort: Newest</option>
                    <option value="oldest">Sort: Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subheader Status Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/30 dark:text-slate-400 sm:px-5">
              <span className="font-mono tabular-nums">
                Showing {visibleTasks.length} of {tasks.length} task
                {tasks.length === 1 ? '' : 's'}
              </span>

              <div className="flex items-center gap-4">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Reset filters
                  </button>
                )}

                {stats.completed > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="inline-flex items-center gap-1 font-medium text-slate-600 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear completed ({stats.completed})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Task Rows or Empty State */}
            {visibleTasks.length > 0 ? (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {visibleTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={openEditModal}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
                  {tasks.length === 0
                    ? 'No tasks created yet'
                    : 'No tasks match your current filters'}
                </h2>
                <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {tasks.length === 0
                    ? 'Add your first task using the quick bar above or open the task modal to include notes and due dates.'
                    : 'Try adjusting your search query, status tab, or priority filter to view other tasks.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {tasks.length === 0 ? (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Create First Task</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      <span>Show All Tasks</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <TaskFormModal
        isOpen={modalOpen}
        editingTask={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Undo Delete Toast */}
      {recentlyDeleted && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <span className="max-w-[220px] truncate">
            Deleted &ldquo;{recentlyDeleted.title}&rdquo;
          </span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="font-semibold text-indigo-300 transition-colors hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setRecentlyDeleted(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
