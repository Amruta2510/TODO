export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'active' | 'completed';

export type SidebarView = 'all' | 'today' | 'pending' | 'completed' | 'high';

export type SortOption = 'dueDate' | 'priority' | 'newest' | 'oldest';

export type ThemeMode = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD or ''
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TaskDraft {
  title: string;
  notes: string;
  priority: Priority;
  dueDate: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  today: number;
  overdue: number;
  completionRate: number;
  highPriorityPending: number;
  mediumPriorityPending: number;
  lowPriorityPending: number;
}
