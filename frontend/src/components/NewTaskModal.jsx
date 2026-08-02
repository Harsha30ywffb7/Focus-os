import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { Plus, X } from 'lucide-react';

export const NewTaskModal = ({ isOpen, onClose }) => {
  const { addGoal, addTimeBlock, addMicroTask, triggerConfetti } = useFocus();
  const [type, setType] = useState('micro');
  
  const [microTitle, setMicroTitle] = useState('');
  const [microCategory, setMicroCategory] = useState('Engineering');
  const [microPriority, setMicroPriority] = useState('medium');

  const [blockTitle, setBlockTitle] = useState('');
  const [blockTime, setBlockTime] = useState('09:00');
  const [blockDuration, setBlockDuration] = useState(60);
  const [blockCategory, setBlockCategory] = useState('Deep Work');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-09-30');
  const [goalCategory, setGoalCategory] = useState('Product');
  const [goalPriority, setGoalPriority] = useState('high');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'micro') {
      if (!microTitle.trim()) return;
      addMicroTask(microTitle, microCategory, microPriority);
      setMicroTitle('');
    } else if (type === 'timeblock') {
      if (!blockTitle.trim()) return;
      addTimeBlock({
        timeSlot: blockTime,
        durationMinutes: parseInt(blockDuration),
        title: blockTitle,
        status: 'upcoming',
        category: blockCategory
      });
      setBlockTitle('');
    } else if (type === 'goal') {
      if (!goalTitle.trim()) return;
      addGoal({
        title: goalTitle,
        targetDate: goalTargetDate,
        category: goalCategory,
        priority: goalPriority
      });
      setGoalTitle('');
    }

    triggerConfetti();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content overflow-hidden flex flex-col p-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--fs-color-surface-glass-border)]">
          <h2 className="text-base font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
            <span>Create New Task or Goal</span>
          </h2>
          <button onClick={onClose} className="btn-icon w-8 h-8">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-[var(--fs-color-surface-secondary)] flex space-x-2 border-b border-[var(--fs-color-surface-glass-border)]">
          <button
            type="button"
            onClick={() => setType('micro')}
            className={`btn-primary py-1.5 px-3 flex-1 text-xs ${type === 'micro' ? '' : 'btn-ghost'}`}
          >
            Micro Task
          </button>
          <button
            type="button"
            onClick={() => setType('timeblock')}
            className={`btn-primary py-1.5 px-3 flex-1 text-xs ${type === 'timeblock' ? '' : 'btn-ghost'}`}
          >
            Time Block Slot
          </button>
          <button
            type="button"
            onClick={() => setType('goal')}
            className={`btn-primary py-1.5 px-3 flex-1 text-xs ${type === 'goal' ? '' : 'btn-ghost'}`}
          >
            Short-Term Goal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'micro' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Refine API response schema docs"
                  value={microTitle}
                  onChange={e => setMicroTitle(e.target.value)}
                  autoFocus
                  className="input-text w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Category</label>
                  <select
                    value={microCategory}
                    onChange={e => setMicroCategory(e.target.value)}
                    className="input-text w-full text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Admin">Admin</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Priority</label>
                  <select
                    value={microPriority}
                    onChange={e => setMicroPriority(e.target.value)}
                    className="input-text w-full text-xs"
                  >
                    <option value="high">High 🔴</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="low">Low 🟢</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === 'timeblock' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Time Block Title</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Code Refactoring"
                  value={blockTitle}
                  onChange={e => setBlockTitle(e.target.value)}
                  autoFocus
                  className="input-text w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={blockTime}
                    onChange={e => setBlockTime(e.target.value)}
                    className="input-text w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Duration</label>
                  <select
                    value={blockDuration}
                    onChange={e => setBlockDuration(e.target.value)}
                    className="input-text w-full text-xs"
                  >
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Category</label>
                  <select
                    value={blockCategory}
                    onChange={e => setBlockCategory(e.target.value)}
                    className="input-text w-full text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master SVG Canvas Benchmarks"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  autoFocus
                  className="input-text w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={e => setGoalTargetDate(e.target.value)}
                    className="input-text w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Category</label>
                  <input
                    type="text"
                    value={goalCategory}
                    onChange={e => setGoalCategory(e.target.value)}
                    className="input-text w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fs-color-text-secondary)] mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={e => setGoalPriority(e.target.value)}
                    className="input-text w-full text-xs"
                  >
                    <option value="high">High 🔴</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="low">Low 🟢</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-[var(--fs-color-surface-glass-border)]">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
