import type { Priority, Task, ThemeMode } from '../types/todo';

const TASKS_STORAGE_KEY = 'cadence_tasks_v1';
const THEME_STORAGE_KEY = 'cadence_theme';

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateISO(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDueToday(dueDate: string): boolean {
  if (!dueDate) return false;
  return dueDate === getTodayISO();
}

export function isOverdue(dueDate: string, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < getTodayISO();
}

export function formatDueDateLabel(dueDate: string): string {
  if (!dueDate) return 'No due date';
  const today = getTodayISO();
  const tomorrow = getOffsetDateISO(1);
  const yesterday = getOffsetDateISO(-1);

  if (dueDate === today) return 'Today';
  if (dueDate === tomorrow) return 'Tomorrow';
  if (dueDate === yesterday) return 'Yesterday';

  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return dueDate;
  const parsed = new Date(y, m - 1, d);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: y !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createInitialStarterTasks(): Task[] {
  const now = new Date().toISOString();
  const today = getTodayISO();
  const tomorrow = getOffsetDateISO(1);
  const inThreeDays = getOffsetDateISO(3);

  return [
    {
      id: createTaskId(),
      title: 'Finalize quarterly product roadmap priorities',
      notes: 'Review engineering capacity and confirm Q2 milestone dates with leads.',
      completed: false,
      priority: 'high',
      dueDate: today,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createTaskId(),
      title: 'Audit responsive dashboard breakpoints',
      notes: 'Check mobile drawer, tablet grid spacing, and keyboard focus states.',
      completed: false,
      priority: 'medium',
      dueDate: today,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createTaskId(),
      title: 'Prepare release notes for v1.2 deployment',
      notes: 'Summarize resolved issues and verify Vercel production build.',
      completed: false,
      priority: 'medium',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createTaskId(),
      title: 'Organize design system tokens and documentation',
      notes: 'Sync color contrast guidelines and typography scale.',
      completed: true,
      priority: 'low',
      dueDate: today,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createTaskId(),
      title: 'Schedule customer feedback synthesis call',
      notes: 'Collect top 5 recurring workflow requests from recent interviews.',
      completed: false,
      priority: 'low',
      dueDate: inThreeDays,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function isValidPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high';
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw === null) {
      const starter = createInitialStarterTasks();
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(starter));
      return starter;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        id: typeof item.id === 'string' && item.id ? item.id : createTaskId(),
        title: typeof item.title === 'string' ? item.title : 'Untitled task',
        notes: typeof item.notes === 'string' ? item.notes : '',
        completed: Boolean(item.completed),
        priority: isValidPriority(item.priority) ? item.priority : 'medium',
        dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
        createdAt:
          typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        updatedAt:
          typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage access errors
  }
}
