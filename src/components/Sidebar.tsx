import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Download,
  Flag,
  Layers,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import type { SidebarView, TaskStats, ThemeMode } from '../types/todo';

interface SidebarProps {
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  stats: TaskStats;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onExportTasks: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: SidebarView;
  label: string;
  count: number;
  icon: typeof Layers;
}

export function Sidebar({
  activeView,
  onSelectView,
  stats,
  theme,
  onToggleTheme,
  onExportTasks,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'all', label: 'All Tasks', count: stats.total, icon: Layers },
    { id: 'today', label: "Today's Tasks", count: stats.today, icon: Calendar },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: CircleDot },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: CheckCircle2 },
    { id: 'high', label: 'High Priority', count: stats.highPriorityPending, icon: Flag },
  ];

  const handleNavClick = (view: SidebarView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
                aria-hidden="true"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Cadence
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Workspace
          </p>
          <nav aria-label="Task views" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive
                        ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pending Queue Priority Breakdown */}
        <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
          <p className="px-2.5 pb-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending by Priority
          </p>
          <div className="space-y-2.5 px-2.5 text-sm">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Flag className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
                <span>High Priority</span>
              </span>
              <span className="font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
                {stats.highPriorityPending}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Flag
                  className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <span>Medium Priority</span>
              </span>
              <span className="font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
                {stats.mediumPriorityPending}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Flag
                  className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span>Low Priority</span>
              </span>
              <span className="font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
                {stats.lowPriorityPending}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Utilities */}
      <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onExportTasks}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <span className="flex items-center gap-2.5 whitespace-nowrap">
            <Download className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>Export Tasks JSON</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="flex items-center gap-2.5 whitespace-nowrap">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r border-slate-200 shadow-xl dark:border-slate-800">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
