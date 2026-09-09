import { useEffect, useRef, useState } from 'react';
import { Search, Sun, Calendar, Target, Compass, BarChart3, Settings, CheckSquare, Moon, Download, Timer, Clock, X } from 'lucide-react';
import { useFocus } from '../context/FocusContext';

export function CommandPalette({ isOpen, onClose }) {
  const { state, setActiveView, toggleTheme, exportDataJSON } = useFocus();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dialog = useRef(null);
  const input = useRef(null);
  const results = useRef(null);
  useEffect(() => {
    if (isOpen) { setQuery(''); setActiveIndex(0); dialog.current?.showModal(); input.current?.focus(); }
    else dialog.current?.close();
  }, [isOpen]);
  useEffect(() => { results.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [activeIndex]);
  const go = view => () => setActiveView(view);
  const actions = [
    { id: 'today', title: 'Today', category: 'Navigate', icon: Sun, action: go('today') },
    { id: 'focus', title: 'Focus timer', category: 'Navigate', icon: Timer, action: go('focus') },
    { id: 'calendar', title: 'Calendar', category: 'Navigate', icon: Calendar, action: go('calendar') },
    { id: 'goals', title: 'Goals', category: 'Navigate', icon: Target, action: go('goals') },
    { id: 'vision', title: 'Vision wall', category: 'Navigate', icon: Compass, action: go('vision') },
    { id: 'analytics', title: 'Analytics & activity wall', category: 'Navigate', icon: BarChart3, action: go('analytics') },
    { id: 'settings', title: 'Settings', category: 'Navigate', icon: Settings, action: go('settings') },
    { id: 'theme', title: `Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`, category: 'Appearance', icon: state.theme === 'dark' ? Sun : Moon, action: toggleTheme },
    { id: 'export', title: 'Export backup', category: 'Data', icon: Download, action: exportDataJSON }
  ];
  const items = [...actions,
    ...state.goals.map(g => ({ id: `goal-${g.id}`, title: g.title, category: 'Goal', icon: Target, action: go('goals') })),
    ...state.microTasks.map(t => ({ id: `task-${t.id}`, title: t.title, category: `Task · ${state.selectedDate}`, icon: CheckSquare, action: go('today') })),
    ...state.timeBlocks.map(b => ({ id: `block-${b.id}`, title: b.title, category: `Schedule · ${b.timeSlot} · ${state.selectedDate}`, icon: Clock, action: go('today') }))
  ];
  const term = query.trim().toLowerCase();
  const filtered = term ? items.filter(item => `${item.title} ${item.category}`.toLowerCase().includes(term)) : actions;
  const execute = item => { if (item) { item.action(); onClose(); } };
  const selectedIndex = Math.min(activeIndex, filtered.length - 1);
  return <dialog ref={dialog} className="command-dialog" aria-label="Search workspace" onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }} onKeyDown={e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(0, Math.min(filtered.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))); }
    if (e.key === 'Enter' && e.target === input.current) { e.preventDefault(); execute(filtered[selectedIndex]); }
  }}>
    <div className="command-search"><Search size={20} /><input ref={input} value={query} onChange={e => { setQuery(e.target.value); setActiveIndex(0); }} aria-label="Search tasks, schedules, goals, or pages" placeholder="Search tasks, schedules, goals…" /><button onClick={onClose} aria-label="Close search"><X size={18} /></button></div>
    <div ref={results} className="command-results">{filtered.length === 0 ? <p className="command-empty" role="status">No matches for “{query}”. Try a task name or page.</p> : filtered.map((item, index) => { const Icon = item.icon; return <button key={item.id} className={`command-result ${index === selectedIndex ? 'active' : ''}`} data-active={index === selectedIndex} onClick={() => execute(item)} onFocus={() => setActiveIndex(index)}><Icon size={18} /><div><strong>{item.title}</strong><small>{item.category}</small></div>{index === selectedIndex && <span className="result-enter" aria-hidden="true">↵</span>}</button>; })}</div>
    <div className="command-footer"><span>↑ ↓ to browse · Enter to open · Esc to close</span><span>Tasks & schedules for the selected day</span></div>
  </dialog>;
}
