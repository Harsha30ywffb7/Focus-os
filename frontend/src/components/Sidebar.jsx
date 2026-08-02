import React from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Sun, 
  Calendar, 
  Target, 
  Compass, 
  BarChart3, 
  Settings, 
  TrendingUp,
  PanelLeftClose,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const { state, setActiveView, toggleSidebar } = useFocus();

  const navItems = [
    { id: 'today', label: 'Today', icon: Sun, badge: state.microTasks.filter(m => !m.completed).length },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: state.timeBlocks.length },
    { id: 'goals', label: 'Short-Term Goals', icon: Target, badge: state.goals.filter(g => g.column !== 'complete').length },
    { id: 'vision', label: 'Vision Wall', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => g.column === 'complete').length;
  const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <>
      {/* 1. DESKTOP & TABLET SIDEBAR (260px Width) */}
      {state.isSidebarOpen && (
        <aside className="hidden md:flex w-[260px] flex-shrink-0 flex-col h-full sidebar transition-all duration-300">
          
          {/* Workspace Header + Hide Sidebar Button */}
          <div className="p-4 border-b border-[var(--fs-color-surface-glass-border)] flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[var(--fs-color-text-primary)] leading-none">FocusOS</h1>
              <p className="text-[11px] text-[var(--fs-color-text-secondary)] font-medium mt-1">Pro Architecture</p>
            </div>

            <button
              onClick={toggleSidebar}
              className="btn-icon w-8 h-8 min-w-[32px] min-h-[32px] text-[var(--fs-color-text-secondary)] hover:text-[var(--fs-color-text-primary)]"
              title="Hide Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--fs-color-text-tertiary)] text-left">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = state.activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`nav-item w-full flex items-center justify-between text-left ${
                    isActive ? 'active' : ''
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-left font-medium text-xs sm:text-sm">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--fs-color-brand-primary)]/15 text-[var(--fs-color-brand-primary)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Progress Widget */}
          <div className="p-4 m-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)]" />
                <span className="text-[11px] font-semibold text-[var(--fs-color-text-secondary)]">Goal Progress</span>
              </div>
              <span className="text-xs font-bold text-[var(--fs-color-brand-primary)]">{goalProgress}%</span>
            </div>

            <div className="w-full h-2 bg-[var(--fs-color-surface-tertiary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--fs-color-brand-gradient)] rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--fs-color-text-tertiary)]">
              <span>{completedGoals} completed</span>
              <span>{totalGoals} total</span>
            </div>
          </div>

          {/* macOS Keyboard Helper hint */}
          <div className="flex px-4 py-3 border-t border-[var(--fs-color-surface-glass-border)] items-center justify-between text-[11px] text-[var(--fs-color-text-tertiary)]">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--fs-color-surface-tertiary)] font-mono text-[10px] text-[var(--fs-color-text-primary)]">⌘K</kbd>
              <span>Search</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--fs-color-surface-tertiary)] font-mono text-[10px] text-[var(--fs-color-text-primary)]">⌘N</kbd>
              <span>New</span>
            </span>
          </div>
        </aside>
      )}

      {/* 2. MOBILE HAMBURGER FULL-SCREEN MENU */}
      {state.isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[var(--fs-z-modal)] bg-[var(--fs-color-surface-base)] flex flex-col h-full w-full p-4 overflow-y-auto">
          {/* Full Screen Header */}
          <div className="pb-4 border-b border-[var(--fs-color-surface-glass-border)] flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-[var(--fs-color-text-primary)]">FocusOS</h1>
              <p className="text-xs text-[var(--fs-color-text-secondary)] font-medium">Workspace Menu</p>
            </div>

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-[var(--fs-color-surface-secondary)] text-[var(--fs-color-text-primary)] border border-[var(--fs-color-surface-glass-border)]"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4 space-y-2">
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--fs-color-text-tertiary)] mb-2">
              Navigation Views
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = state.activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    toggleSidebar();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isActive 
                      ? 'bg-[var(--fs-color-brand-primary)] text-white font-bold border-transparent shadow-lg shadow-indigo-500/25' 
                      : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)] hover:bg-[var(--fs-color-surface-secondary)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[var(--fs-color-brand-primary)]/15 text-[var(--fs-color-brand-primary)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Goal Progress Widget */}
          <div className="p-4 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
                <span className="text-xs font-bold text-[var(--fs-color-text-primary)]">Quarterly Goal Progress</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--fs-color-brand-primary)]">{goalProgress}%</span>
            </div>

            <div className="w-full h-2.5 bg-[var(--fs-color-surface-tertiary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--fs-color-brand-gradient)] rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--fs-color-text-tertiary)] pt-1">
              <span>{completedGoals} goals completed</span>
              <span>{totalGoals} total goals</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOBILE BOTTOM NAVIGATION TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--fs-color-surface-secondary)] border-t border-[var(--fs-color-surface-glass-border)] z-[var(--fs-z-sticky)] flex items-center justify-around px-2 backdrop-blur-xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = state.activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive ? 'text-[var(--fs-color-brand-primary)] font-bold' : 'text-[var(--fs-color-text-secondary)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
