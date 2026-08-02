import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Search, 
  Sun, 
  Calendar, 
  Target, 
  Compass, 
  BarChart3, 
  Settings, 
  CheckSquare, 
  Moon, 
  Sparkles,
  Download
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose }) => {
  const { state, setActiveView, toggleTheme, loadSampleData, exportDataJSON } = useFocus();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { id: 'act_today', title: 'Go to Today View', category: 'Navigation', icon: Sun, action: () => { setActiveView('today'); onClose(); } },
    { id: 'act_calendar', title: 'Go to Calendar', category: 'Navigation', icon: Calendar, action: () => { setActiveView('calendar'); onClose(); } },
    { id: 'act_goals', title: 'View Short-Term Goals', category: 'Navigation', icon: Target, action: () => { setActiveView('goals'); onClose(); } },
    { id: 'act_vision', title: 'Explore Vision Wall', category: 'Navigation', icon: Compass, action: () => { setActiveView('vision'); onClose(); } },
    { id: 'act_analytics', title: 'Open Analytics & Heatmap', category: 'Navigation', icon: BarChart3, action: () => { setActiveView('analytics'); onClose(); } },
    { id: 'act_settings', title: 'Open Settings', category: 'Navigation', icon: Settings, action: () => { setActiveView('settings'); onClose(); } },
    { id: 'act_theme', title: `Toggle ${state.theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'System', icon: state.theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); onClose(); } },
    { id: 'act_sample', title: 'Load Demo Sample Data', category: 'Data', icon: Sparkles, action: () => { loadSampleData(); onClose(); } },
    { id: 'act_export', title: 'Export JSON Backup', category: 'Data', icon: Download, action: () => { exportDataJSON(); onClose(); } }
  ];

  const dynamicItems = [
    ...state.goals.map(g => ({
      id: 'g_' + g.id,
      title: g.title,
      category: `Goal (${g.column})`,
      icon: Target,
      action: () => { setActiveView('goals'); onClose(); }
    })),
    ...state.microTasks.map(m => ({
      id: 'm_' + m.id,
      title: m.title,
      category: 'Micro Task',
      icon: CheckSquare,
      action: () => { setActiveView('today'); onClose(); }
    }))
  ];

  const allItems = [...actions, ...dynamicItems];
  const filtered = query.trim() === ''
    ? actions
    : allItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-2xl p-0 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--fs-color-surface-glass-border)]">
          <Search className="w-5 h-5 text-[var(--fs-color-brand-primary)] mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search goals, tasks, views..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[var(--fs-color-text-primary)] placeholder-[var(--fs-color-text-tertiary)] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[var(--fs-color-surface-tertiary)] text-xs text-[var(--fs-color-text-secondary)] font-mono">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--fs-color-text-tertiary)]">
              No matching commands or tasks found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--fs-color-surface-secondary)] text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-brand-primary)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[var(--fs-color-text-primary)]">
                      {item.title}
                    </span>
                  </div>
                  <span className="badge badge-category">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-[var(--fs-color-surface-secondary)] border-t border-[var(--fs-color-surface-glass-border)] text-[11px] text-[var(--fs-color-text-tertiary)] flex items-center justify-between">
          <span>Use <strong>⌘K</strong> anytime to toggle</span>
          <span>FocusOS Command Palette</span>
        </div>
      </div>
    </div>
  );
};
