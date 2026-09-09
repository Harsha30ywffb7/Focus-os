import React, { useState, useEffect } from 'react';
import './AppWindow.css';
import { useFocus } from '../context/FocusContext';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { NewTaskModal } from './NewTaskModal';
import { HelpModal } from './HelpModal';
import {
  Sun,
  Moon,
  Search,
  Plus,
  HelpCircle,
  PanelLeft,
  Menu
} from 'lucide-react';

export const AppWindow = ({ children }) => {
  const { state, toggleTheme, toggleSidebar } = useFocus();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Keyboard Shortcuts (⌘K, ⌘N, ⌘/)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsNewTaskOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsHelpOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const viewName = { today: 'Today', focus: 'Focus', calendar: 'Calendar', goals: 'Goals', vision: 'Vision', analytics: 'Analytics', settings: 'Settings' }[state.activeView];
  const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

  return (
    <div className="app-shell h-screen w-full flex flex-col bg-[var(--fs-color-surface-base)] transition-colors duration-300 overflow-hidden">

      {/* 100% Full Screen Application Frame */}
      <div className="w-full h-full flex flex-col overflow-hidden glass-panel border-none">

        <header className="workspace-header">
          <div className="workspace-identity">
            <button className="header-icon" onClick={toggleSidebar} aria-label={state.isSidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={state.isSidebarOpen}><PanelLeft size={19} className="desktop-menu-icon" /><Menu size={20} className="mobile-menu-icon" /></button>
            <span className="workspace-brand">FocusOS<span className="workspace-view">/ <span>{viewName}</span></span></span>
          </div>
          <button className="workspace-search" onClick={() => setIsCommandOpen(true)} aria-label="Search tasks, schedules, and goals" aria-haspopup="dialog"><Search size={18} /><span>Search anything…</span><kbd>{shortcut} K</kbd></button>
          <div className="workspace-actions">
            <button className="header-icon mobile-search" onClick={() => setIsCommandOpen(true)} aria-label="Search" aria-haspopup="dialog"><Search size={20} /></button>
            <button className="header-icon header-help" onClick={() => setIsHelpOpen(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts"><HelpCircle size={19} /></button>
            <button className="header-icon" onClick={toggleTheme} aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`} title="Change theme">{state.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
            <button className="header-create" onClick={() => setIsNewTaskOpen(true)} aria-label="Create a task, time block, or goal" aria-haspopup="dialog"><Plus size={18} /><span>Create</span></button>
          </div>
        </header>

        {/* Main Body */}
        <div className="app-body flex-1 flex overflow-hidden relative pb-16 md:pb-0">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[var(--fs-color-surface-base)]">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
