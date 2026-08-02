import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2,
  Palette
} from 'lucide-react';

export const SettingsView = () => {
  const { state, toggleTheme, loadSampleData, exportDataJSON, importDataJSON, resetAllData } = useFocus();
  const [importStatus, setImportStatus] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to restore backup. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-enter">
      
      {/* Header Banner */}
      <div className="card-glass">
        <h1 className="text-2xl font-bold text-[var(--fs-color-text-primary)] tracking-tight flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-[var(--fs-color-brand-primary)]" />
          <span>System Settings & Data Management</span>
        </h1>
        <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
          Customize themes, manage local persistence, export backup JSON files, and trigger sample data.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE & THEMES */}
      <div className="card-glass space-y-4">
        <h2 className="text-base font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
          <Palette className="w-5 h-5 text-[var(--fs-color-brand-primary)]" />
          <span>Appearance & Visual Theme</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Dark Mode Card */}
          <div
            onClick={() => state.theme === 'light' && toggleTheme()}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              state.theme === 'dark'
                ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] shadow-md shadow-indigo-500/20'
                : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] hover:border-[var(--fs-color-brand-primary)]/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-slate-900 text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--fs-color-text-primary)]">macOS Dark Mode</h3>
                <p className="text-xs text-[var(--fs-color-text-secondary)]">Deep charcoal `#0A0A0F` glassmorphism</p>
              </div>
            </div>
            {state.theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-[var(--fs-color-brand-primary)]" />}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => state.theme === 'dark' && toggleTheme()}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              state.theme === 'light'
                ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] shadow-md shadow-indigo-500/20'
                : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] hover:border-[var(--fs-color-brand-primary)]/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-slate-100 text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--fs-color-text-primary)]">macOS Light Mode</h3>
                <p className="text-xs text-[var(--fs-color-text-secondary)]">Crisp white & soft gray elevation</p>
              </div>
            </div>
            {state.theme === 'light' && <CheckCircle2 className="w-5 h-5 text-[var(--fs-color-brand-primary)]" />}
          </div>

        </div>
      </div>

      {/* SECTION 2: DATA PERSISTENCE & BACKUPS */}
      <div className="card-glass space-y-6">
        <h2 className="text-base font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[var(--fs-color-success)]" />
          <span>Local Storage & Backup Pipelines</span>
        </h2>

        {importStatus && (
          <div className="badge badge-category p-3 rounded-xl text-xs font-semibold w-full">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Export JSON */}
          <button
            onClick={exportDataJSON}
            className="p-4 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex flex-col items-center justify-center space-y-2 hover:border-[var(--fs-color-brand-primary)] transition-all text-center group"
          >
            <Download className="w-6 h-6 text-[var(--fs-color-brand-primary)] group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-[var(--fs-color-text-primary)] block">Export Backup (JSON)</span>
              <span className="text-[10px] text-[var(--fs-color-text-secondary)]">Download complete dataset</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex flex-col items-center justify-center space-y-2 hover:border-[var(--fs-color-brand-primary)] transition-all text-center cursor-pointer group">
            <Upload className="w-6 h-6 text-[var(--fs-color-category-relations)] group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-[var(--fs-color-text-primary)] block">Restore from JSON</span>
              <span className="text-[10px] text-[var(--fs-color-text-secondary)]">Upload `.json` backup file</span>
            </div>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Load Sample Demo Data */}
          <button
            onClick={loadSampleData}
            className="p-4 rounded-xl bg-[var(--fs-color-brand-primary)]/15 border border-[var(--fs-color-brand-primary)]/40 flex flex-col items-center justify-center space-y-2 hover:bg-[var(--fs-color-brand-primary)]/25 transition-all text-center group"
          >
            <Sparkles className="w-6 h-6 text-[var(--fs-color-brand-primary)] group-hover:rotate-12 transition-transform" />
            <div>
              <span className="text-xs font-bold text-[var(--fs-color-text-primary)] block">Load Demo Data</span>
              <span className="text-[10px] text-[var(--fs-color-brand-primary)]">Populate goals & pillars</span>
            </div>
          </button>

        </div>

        {/* Clear All Data */}
        <div className="pt-4 border-t border-[var(--fs-color-surface-glass-border)] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[var(--fs-color-danger)] uppercase tracking-wider">Danger Zone</h3>
            <p className="text-xs text-[var(--fs-color-text-secondary)]">Wipe all local goals, tasks, and state clean.</p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all FocusOS data?')) {
                resetAllData();
              }
            }}
            className="px-4 py-2 rounded-xl bg-[var(--fs-color-danger)]/15 hover:bg-[var(--fs-color-danger)]/25 text-[var(--fs-color-danger)] border border-[var(--fs-color-danger)]/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>
        </div>

      </div>

      {/* SECTION 3: SYSTEM INFO */}
      <div className="card-glass flex items-center justify-between text-xs text-[var(--fs-color-text-secondary)]">
        <span>FocusOS Desktop Edition • Build 2026.8</span>
        <span>Crafted with Apple SF Pro Design Principles</span>
      </div>

    </div>
  );
};
