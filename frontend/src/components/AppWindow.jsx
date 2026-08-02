import React, { useState, useEffect } from 'react';
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
  Clock,
  PanelLeft,
  Menu
} from 'lucide-react';

export const AppWindow = ({ children }) => {
  const { state, toggleTheme, toggleSidebar } = useFocus();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--fs-color-surface-base)] transition-colors duration-300 overflow-hidden">

      {/* 100% Full Screen Application Frame */}
      <div className="w-full h-full flex flex-col overflow-hidden glass-panel border-none">

        {/* Title Bar */}
        <header className="h-10 flex items-center justify-between px-3 md:px-4 border-b border-[var(--fs-color-surface-glass-border)] bg-[var(--fs-color-surface-secondary)] select-none z-[var(--fs-z-sticky)]">

          {/* Left Controls & Sidebar Toggle Button */}
          <div className="flex items-center space-x-2">
            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1 rounded text-[var(--fs-color-text-secondary)] hover:text-[var(--fs-color-text-primary)] hover:bg-[var(--fs-color-surface-tertiary)] transition-colors"
              title={state.isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="flex md:hidden p-1 rounded text-[var(--fs-color-text-secondary)] hover:text-[var(--fs-color-text-primary)] hover:bg-[var(--fs-color-surface-tertiary)] transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
            </button>

            <span className="text-xs font-bold text-[var(--fs-color-text-primary)] tracking-tight">
              FocusOS
            </span>
          </div>

          {/* Center Search Bar */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center space-x-2 px-3 py-1 rounded-md bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-text-primary)] transition-all text-xs w-48 sm:w-72 justify-between"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="w-3.5 h-3.5" />
              <span className="truncate">Search tasks, goals, vision...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--fs-color-surface-secondary)] text-[10px] font-mono text-[var(--fs-color-text-secondary)]">⌘K</kbd>
          </button>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[var(--fs-color-surface-tertiary)] text-xs font-mono text-[var(--fs-color-text-brand)]">
              <Clock className="w-3.5 h-3.5 mr-1 text-[var(--fs-color-text-brand)]" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="btn-primary py-1 px-2 text-xs max-h-[16px] font-semibold"
              title="New Task (Cmd+N)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>

            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn-icon hidden sm:flex w-8 h-8 min-w-[32px] min-h-[32px]"
              title="Shortcuts (Cmd+/)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="btn-icon w-8 h-8 min-w-[32px] min-h-[32px]"
              title={`Switch Theme`}
            >
              {state.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden relative pb-16 md:pb-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[var(--fs-color-surface-base)]">
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
