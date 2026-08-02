import React from 'react';
import { X, Keyboard } from 'lucide-react';

export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K', description: 'Open Command Palette & Global Search' },
    { key: '⌘ N', description: 'Create New Task, Time Block, or Goal' },
    { key: '⌘ /', description: 'Toggle Keyboard Shortcuts Cheatsheet' },
    { key: 'ESC', description: 'Close any active modal or command window' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-md p-0 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--fs-color-surface-glass-border)]">
          <h2 className="text-base font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
            <span>Keyboard Shortcuts</span>
          </h2>
          <button onClick={onClose} className="btn-icon w-8 h-8">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[var(--fs-color-surface-secondary)] border border-[var(--fs-color-surface-glass-border)]">
              <span className="text-xs text-[var(--fs-color-text-primary)] font-medium">{item.description}</span>
              <kbd className="px-2 py-1 rounded bg-[var(--fs-color-brand-primary)]/15 text-[var(--fs-color-brand-primary)] font-mono text-xs font-bold border border-[var(--fs-color-brand-primary)]/30">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-[var(--fs-color-surface-secondary)] border-t border-[var(--fs-color-surface-glass-border)] text-[11px] text-[var(--fs-color-text-tertiary)] text-center">
          Press <strong>ESC</strong> to close
        </div>
      </div>
    </div>
  );
};
